import { prisma } from '@/lib/prisma';
import { computeReceiptVat, getStoreSettings } from '@/lib/store-settings';

export type NormalizedVippsStatus =
  | 'CREATED'
  | 'AUTHORIZED'
  | 'CAPTURED'
  | 'REFUNDED'
  | 'ABORTED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'UNKNOWN';

export interface VippsPaymentSummary {
  reference: string;
  pspReference?: string;
  rawState: string;
  normalizedStatus: NormalizedVippsStatus;
  amountOre: number;
  authorizedOre: number;
  capturedOre: number;
  refundedOre: number;
  cancelledOre: number;
  netCapturedOre: number;
  remainingCapturableOre: number;
}

export function getVippsConfig() {
  const isTest = process.env.VIPPS_ENV !== 'production';
  const baseUrl = isTest ? 'https://apitest.vipps.no' : 'https://api.vipps.no';
  const clientId = process.env.VIPPS_CLIENT_ID;
  const clientSecret = process.env.VIPPS_CLIENT_SECRET;
  const subscriptionKey = process.env.VIPPS_SUBSCRIPTION_KEY;
  const merchantSerialNumber = process.env.VIPPS_MERCHANT_SERIAL_NUMBER;

  if (!clientId || !clientSecret || !subscriptionKey || !merchantSerialNumber) {
    throw new Error('Missing Vipps credentials in environment variables');
  }

  return {
    isTest,
    baseUrl,
    clientId,
    clientSecret,
    subscriptionKey,
    merchantSerialNumber,
  };
}

export async function getVippsAccessToken(): Promise<string> {
  const { baseUrl, clientId, clientSecret, subscriptionKey } = getVippsConfig();

  const tokenResponse = await fetch(`${baseUrl}/accessToken/get`, {
    method: 'POST',
    headers: {
      client_id: clientId,
      client_secret: clientSecret,
      'Ocp-Apim-Subscription-Key': subscriptionKey,
    },
    cache: 'no-store',
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    throw new Error(`Vipps token error (${tokenResponse.status}): ${errorText}`);
  }

  const tokenData = await tokenResponse.json();
  if (!tokenData?.access_token) {
    throw new Error('Vipps token response missing access_token');
  }

  return tokenData.access_token;
}

/**
 * Fetches payment details from Vipps ePayment v1 API and normalizes status.
 * IMPORTANT: In Vipps ePayment v1, `state` NEVER becomes "CAPTURED" — it stays
 * "AUTHORIZED" even after 100% capture, while `aggregate.capturedAmount.value`
 * reflects the actual captured amount in øre.
 */
export async function fetchVippsPayment(
  reference: string,
  existingToken?: string
): Promise<VippsPaymentSummary> {
  const { baseUrl, subscriptionKey, merchantSerialNumber } = getVippsConfig();
  const accessToken = existingToken || (await getVippsAccessToken());

  const res = await fetch(`${baseUrl}/epayment/v1/payments/${encodeURIComponent(reference)}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Ocp-Apim-Subscription-Key': subscriptionKey,
      'Merchant-Serial-Number': merchantSerialNumber,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Vipps GET payment failed for ${reference} (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const rawState = String(data.state || data.status || 'UNKNOWN').toUpperCase();
  const amountOre = Number(data.amount?.value ?? 0);
  const authorizedOre = Number(data.aggregate?.authorizedAmount?.value ?? 0);
  const capturedOre = Number(data.aggregate?.capturedAmount?.value ?? 0);
  const refundedOre = Number(data.aggregate?.refundedAmount?.value ?? 0);
  const cancelledOre = Number(data.aggregate?.cancelledAmount?.value ?? 0);

  const netCapturedOre = Math.max(0, capturedOre - refundedOre);
  const remainingCapturableOre = Math.max(0, authorizedOre - capturedOre - cancelledOre);

  let normalizedStatus: NormalizedVippsStatus = 'UNKNOWN';

  if (capturedOre > 0 && refundedOre >= capturedOre) {
    normalizedStatus = 'REFUNDED';
  } else if (capturedOre > 0) {
    normalizedStatus = 'CAPTURED';
  } else if (rawState === 'AUTHORIZED' && remainingCapturableOre > 0) {
    normalizedStatus = 'AUTHORIZED';
  } else if (rawState === 'EXPIRED') {
    normalizedStatus = 'EXPIRED';
  } else if (rawState === 'ABORTED') {
    normalizedStatus = 'ABORTED';
  } else if (
    rawState === 'TERMINATED' ||
    rawState === 'CANCELLED' ||
    (authorizedOre > 0 && cancelledOre >= authorizedOre)
  ) {
    normalizedStatus = 'CANCELLED';
  } else if (rawState === 'CREATED') {
    normalizedStatus = 'CREATED';
  }

  return {
    reference,
    pspReference: data.pspReference,
    rawState,
    normalizedStatus,
    amountOre,
    authorizedOre,
    capturedOre,
    refundedOre,
    cancelledOre,
    netCapturedOre,
    remainingCapturableOre,
  };
}

/**
 * Checks Vipps payment status and automatically captures if currently AUTHORIZED with
 * remaining capturable balance. Uses a deterministic Idempotency-Key (`autocap-<reference>`)
 * so concurrent webhook + return-URL calls never collide, and always re-verifies
 * `capturedOre` directly against Vipps API afterwards.
 */
export async function ensureVippsCaptured(
  reference: string,
  existingToken?: string
): Promise<VippsPaymentSummary> {
  const { baseUrl, subscriptionKey, merchantSerialNumber } = getVippsConfig();
  const accessToken = existingToken || (await getVippsAccessToken());

  const initialSummary = await fetchVippsPayment(reference, accessToken);

  // Already captured (or refunded) — no capture call needed
  if (initialSummary.capturedOre > 0) {
    return initialSummary;
  }

  // Only attempt capture when customer has genuinely AUTHORIZED in Vipps
  if (initialSummary.normalizedStatus === 'AUTHORIZED' && initialSummary.remainingCapturableOre > 0) {
    const idempotencyKey = `autocap-${reference}`.slice(0, 50);

    try {
      const captureRes = await fetch(
        `${baseUrl}/epayment/v1/payments/${encodeURIComponent(reference)}/capture`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
            'Ocp-Apim-Subscription-Key': subscriptionKey,
            'Merchant-Serial-Number': merchantSerialNumber,
            'Idempotency-Key': idempotencyKey,
          },
          body: JSON.stringify({
            modificationAmount: {
              currency: 'NOK',
              value: initialSummary.remainingCapturableOre,
            },
          }),
          cache: 'no-store',
        }
      );

      if (!captureRes.ok) {
        const errText = await captureRes.text();
        console.warn(`Vipps auto-capture warning for ${reference} (${captureRes.status}): ${errText}`);
      }
    } catch (err) {
      console.error(`Vipps auto-capture network error for ${reference}:`, err);
    }

    // Always re-fetch authoritative state from Vipps after capture attempt
    return await fetchVippsPayment(reference, accessToken);
  }

  return initialSummary;
}

/**
 * Atomically transitions a booking to `confirmed` ONLY when `capturedOre > 0` has been
 * verified against Vipps, and creates AT MOST ONE `CAPTURED` accounting voucher in `Receipt`.
 *
 * Uses a PostgreSQL row-level `FOR UPDATE` lock on `Booking` inside an interactive transaction so
 * concurrent calls (e.g. Vipps webhook + `/api/booking/verify` arriving simultaneously) serialize:
 * - Never confirms an unpaid booking.
 * - Never creates duplicate `CAPTURED` receipts for the same booking.
 * - Never reverts an already `confirmed` booking back to `pending`.
 * - Sends customer confirmation + admin notification emails AT MOST ONCE.
 */
export async function confirmPaidVippsBookingAtomically(params: {
  bookingId: string;
  vippsRef: string;
  capturedOre: number;
  netCapturedOre?: number;
}) {
  const { bookingId, vippsRef, capturedOre, netCapturedOre } = params;

  if (capturedOre <= 0) {
    throw new Error(`Refusing to confirm booking ${bookingId}: capturedOre is ${capturedOre}`);
  }

  const capturedNok = Number((capturedOre / 100).toFixed(2));
  const effectivePaidNok =
    netCapturedOre !== undefined ? Number((netCapturedOre / 100).toFixed(2)) : capturedNok;

  const { newlyConfirmed } = await prisma.$transaction(async (tx) => {
    // Serialize concurrent webhook + return-page verification for this booking
    await tx.$queryRaw`SELECT id FROM "Booking" WHERE id = ${bookingId} FOR UPDATE`;

    const currentBooking = await tx.booking.findUnique({
      where: { id: bookingId },
    });

    if (!currentBooking) {
      throw new Error(`Booking ${bookingId} not found`);
    }

    // 1. Ensure strictly ONE CAPTURED webshop receipt exists for this booking
    const existingCapturedReceipt = await tx.receipt.findFirst({
      where: {
        bookingId,
        status: 'CAPTURED',
        type: 'payment',
      },
    });

    if (!existingCapturedReceipt) {
      const storeSettings = await getStoreSettings(tx);
      const effectiveVatRate = storeSettings.isVatRegistered ? storeSettings.defaultVatRate : 0;
      const vatSplit = computeReceiptVat(capturedNok, effectiveVatRate);

      await tx.receipt.create({
        data: {
          bookingId,
          amount: capturedNok,
          vatRate: vatSplit.vatRate,
          vatAmount: vatSplit.vatAmount,
          netAmount: vatSplit.netAmount,
          currency: 'NOK',
          status: 'CAPTURED',
          paymentRef: vippsRef,
          type: 'payment',
        },
      });
    }

    // 2. Hvis bookingen er delvis betalt med gavekort, trekk gavekortsaldoen atomisk i samme transaksjon
    let totalPaidNok = effectivePaidNok;
    if (currentBooking.giftCardCode && (currentBooking.giftCardAmount || 0) > 0) {
      const giftCard = await tx.giftCard.findUnique({
        where: { code: currentBooking.giftCardCode.toUpperCase().trim() },
      });
      if (giftCard && giftCard.status === 'active' && giftCard.balance >= (currentBooking.giftCardAmount || 0)) {
        const existingRedemption = await tx.giftCardRedemption.findFirst({
          where: { bookingId, giftCardId: giftCard.id },
        });
        if (!existingRedemption) {
          const deductAmount = currentBooking.giftCardAmount || 0;
          const newBalance = Number((giftCard.balance - deductAmount).toFixed(2));
          await tx.giftCardRedemption.create({
            data: {
              giftCardId: giftCard.id,
              bookingId,
              amount: deductAmount,
              balanceBefore: giftCard.balance,
              balanceAfter: newBalance,
              channel: 'web_booking',
              note: `Restbeløp betalt via Vipps (${effectivePaidNok} kr)`,
            },
          });
          await tx.giftCard.update({
            where: { id: giftCard.id },
            data: {
              balance: newBalance,
              status: newBalance <= 0 ? 'exhausted' : 'active',
            },
          });
          totalPaidNok = Number((effectivePaidNok + deductAmount).toFixed(2));
        }
      }
    }

    // 3. Transition booking state if not yet confirmed
    const wasConfirmed = currentBooking.status === 'confirmed';

    if (!wasConfirmed) {
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: 'confirmed',
          amountPaid: totalPaidNok,
          paymentRef: vippsRef,
        },
      });
    } else if (
      (currentBooking.amountPaid || 0) < totalPaidNok ||
      !currentBooking.paymentRef
    ) {
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          amountPaid: totalPaidNok,
          paymentRef: vippsRef,
        },
      });
    }

    return { newlyConfirmed: !wasConfirmed };
  });

  const confirmedBooking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { experience: true },
  });

  if (!confirmedBooking) {
    throw new Error(`Booking ${bookingId} not found after confirmation`);
  }

  // 3. Side effects (discount counter, Resend contact sync, confirmation & admin emails)
  // execute ONLY for the single atomic winner (`newlyConfirmed === true`).
  if (newlyConfirmed) {
    if (confirmedBooking.discountCode) {
      try {
        await prisma.discountCode.update({
          where: { code: confirmedBooking.discountCode },
          data: { usageCount: { increment: 1 } },
        });
      } catch (e) {
        console.error('Failed to increment discount code usage:', e);
      }
    }

    const { sendEmail, sendAdminNewBookingNotification, addContactToNewsletter } = await import(
      '@/lib/email'
    );

    if (confirmedBooking.email) {
      addContactToNewsletter(
        confirmedBooking.email,
        confirmedBooking.firstName,
        confirmedBooking.lastName
      ).catch((e) => console.error('Failed to sync contact to Resend:', e));
    }

    try {
      const settingsDoc = await prisma.setting.findUnique({ where: { key: 'general' } });
      const generalSettings = settingsDoc?.value || {
        email: 'post@krsvr.no',
        phone: '+47 408 28 302',
      };

      const experienceData = confirmedBooking.experience || {
        name: 'Valgt VR Opplevelse',
        picture: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d',
        age: 'Alle',
        duration: '90 min',
      };

      await sendEmail(
        confirmedBooking.email,
        confirmedBooking,
        experienceData,
        generalSettings
      );

      await sendAdminNewBookingNotification(confirmedBooking).catch((err) =>
        console.error('Failed to send admin new booking notification:', err)
      );

      // Send instant Web Push notification to Admin's iPhone / devices
      try {
        const { sendAdminPushNotification } = await import('@/lib/push');
        const expName = confirmedBooking.experience?.name || 'VR Opplevelse';
        const dateStr = confirmedBooking.date;
        const timeStr = confirmedBooking.time;
        const playersStr = `${confirmedBooking.players} ${confirmedBooking.players === 1 ? 'spiller' : 'spillere'}`;
        const amountStr = `${confirmedBooking.totalPrice || capturedNok} kr`;
        const custName = `${confirmedBooking.firstName} ${confirmedBooking.lastName}`.trim();

        await sendAdminPushNotification({
          title: `Ny booking: ${custName} (${amountStr})`,
          body: `${expName} • ${dateStr} kl. ${timeStr} • ${playersStr}`,
          url: `/admin`,
          tag: `booking-${confirmedBooking.id}`,
          bookingId: confirmedBooking.id,
        });
      } catch (pushErr) {
        console.error('Failed to send admin push notification on Vipps capture:', pushErr);
      }
    } catch (emailErr) {
      console.error('Failed to send confirmation email after Vipps capture:', emailErr);
    }
  }

  return { booking: confirmedBooking, newlyConfirmed };
}

/**
 * Atomically records a genuine Vipps refund (credit note) in `Receipt` without risking
 * duplicate credit notes when `/api/vipps/refund` and `/api/vipps/callback` both fire.
 * Compares authoritative cumulative `refundedOre` from Vipps against already-recorded
 * `REFUNDED` vouchers for this booking, and only creates a credit note for the unrecorded delta.
 */
export async function recordVippsRefundAtomically(params: {
  bookingId: string;
  vippsRef: string;
  capturedOre: number;
  refundedOre: number;
}) {
  const { bookingId, vippsRef, capturedOre, refundedOre } = params;

  if (refundedOre <= 0) {
    return { createdReceipt: null };
  }

  const totalRefundedNok = Number((refundedOre / 100).toFixed(2));
  const netPaidNok = Math.max(0, Number(((capturedOre - refundedOre) / 100).toFixed(2)));

  return await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "Booking" WHERE id = ${bookingId} FOR UPDATE`;

    const currentBooking = await tx.booking.findUnique({
      where: { id: bookingId },
    });

    if (!currentBooking) {
      return { createdReceipt: null };
    }

    // If a payment was captured and then immediately refunded before a CAPTURED receipt was stored,
    // ensure the original CAPTURED sale voucher is also recorded so the ledger nets out accurately.
    let originalCapturedReceipt = await tx.receipt.findFirst({
      where: { bookingId, status: 'CAPTURED', type: 'payment' },
    });

    if (capturedOre > 0 && !originalCapturedReceipt) {
      const capturedAmountNok = Number((capturedOre / 100).toFixed(2));
      const storeSettings = await getStoreSettings(tx);
      const effectiveVatRate = storeSettings.isVatRegistered ? storeSettings.defaultVatRate : 0;
      const capturedVatSplit = computeReceiptVat(capturedAmountNok, effectiveVatRate);

      originalCapturedReceipt = await tx.receipt.create({
        data: {
          bookingId,
          amount: capturedAmountNok,
          vatRate: capturedVatSplit.vatRate,
          vatAmount: capturedVatSplit.vatAmount,
          netAmount: capturedVatSplit.netAmount,
          currency: 'NOK',
          status: 'CAPTURED',
          paymentRef: vippsRef,
          type: 'payment',
        },
      });
    }

    const existingRefunds = await tx.receipt.findMany({
      where: {
        bookingId,
        status: 'REFUNDED',
        type: 'refund',
      },
    });

    const alreadyRecordedRefundNok = existingRefunds.reduce(
      (sum, r) => sum + Math.abs(r.amount || 0),
      0
    );

    const deltaRefundNok = Number((totalRefundedNok - alreadyRecordedRefundNok).toFixed(2));

    let createdReceipt = null;
    if (deltaRefundNok >= 0.01) {
      // Credit notes mirror the VAT rate of the original sale receipt so pre-VAT sales remain 0% VAT
      let refundVatRate = originalCapturedReceipt?.vatRate;
      if (refundVatRate === undefined) {
        const fallbackSettings = await getStoreSettings(tx);
        refundVatRate = fallbackSettings.isVatRegistered ? fallbackSettings.defaultVatRate : 0;
      }
      const refundVatSplit = computeReceiptVat(-deltaRefundNok, refundVatRate);

      createdReceipt = await tx.receipt.create({
        data: {
          bookingId,
          amount: -deltaRefundNok,
          vatRate: refundVatSplit.vatRate,
          vatAmount: refundVatSplit.vatAmount,
          netAmount: refundVatSplit.netAmount,
          currency: 'NOK',
          status: 'REFUNDED',
          paymentRef: vippsRef,
          type: 'refund',
        },
      });
    }

    await tx.booking.update({
      where: { id: bookingId },
      data: {
        amountPaid: netPaidNok,
        status: netPaidNok === 0 ? 'cancelled' : currentBooking.status,
      },
    });

    return { createdReceipt };
  });
}
