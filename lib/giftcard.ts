import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendAdminPushNotification } from '@/lib/push';
import { computeReceiptVat, getStoreSettings } from '@/lib/store-settings';

/**
 * Generates an 8-character human-friendly uppercase code: KRS-XXXX-YYYY
 * Excludes easily confusable characters (0, O, 1, I).
 */
export function generateGiftCardCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  const buf = crypto.randomBytes(8);
  let part1 = '';
  let part2 = '';
  for (let i = 0; i < 4; i++) {
    part1 += chars[buf[i] % chars.length];
  }
  for (let i = 4; i < 8; i++) {
    part2 += chars[buf[i] % chars.length];
  }
  return `KRS-${part1}-${part2}`;
}

export interface ValidateGiftCardResult {
  isValid: boolean;
  error?: string;
  giftCard?: {
    id: string;
    code: string;
    targetPersons: number;
    initialAmount: number;
    balance: number;
    status: string;
    expiresAt: string;
    buyerName: string;
    recipientName?: string | null;
  };
}

/**
 * Validates a gift card code for redemption.
 */
export async function validateGiftCardCode(rawCode: string): Promise<ValidateGiftCardResult> {
  const code = (rawCode || '').trim().toUpperCase();
  if (!code) {
    return { isValid: false, error: 'Gavekortkode mangler' };
  }

  const giftCard = await prisma.giftCard.findUnique({
    where: { code },
  });

  if (!giftCard) {
    return { isValid: false, error: 'Ugyldig gavekortkode' };
  }

  if (giftCard.status === 'pending_payment' || !giftCard.isPaid) {
    return { isValid: false, error: 'Dette gavekortet er ikke aktivert eller betalt' };
  }

  if (giftCard.status === 'cancelled') {
    return { isValid: false, error: 'Dette gavekortet er kansellert' };
  }

  if (giftCard.status === 'exhausted' || giftCard.balance <= 0) {
    return { isValid: false, error: 'Dette gavekortet er allerede oppbrukt (saldo: 0 kr)' };
  }

  const now = new Date();
  if (giftCard.expiresAt < now || giftCard.status === 'expired') {
    return { isValid: false, error: 'Dette gavekortet har utløpt' };
  }

  return {
    isValid: true,
    giftCard: {
      id: giftCard.id,
      code: giftCard.code,
      targetPersons: giftCard.targetPersons,
      initialAmount: giftCard.initialAmount,
      balance: giftCard.balance,
      status: giftCard.status,
      expiresAt: giftCard.expiresAt.toISOString(),
      buyerName: giftCard.buyerName,
      recipientName: giftCard.recipientName,
    },
  };
}

/**
 * Atomically confirms a paid Vipps gift card, updates status, creates a Receipt,
 * and triggers customer email, admin email, and push notification.
 */
export async function confirmPaidGiftCardAtomically(params: {
  giftCardId: string;
  vippsRef: string;
  capturedOre: number;
}) {
  const { giftCardId, vippsRef, capturedOre } = params;

  if (capturedOre <= 0) {
    throw new Error(`Refusing to confirm gift card ${giftCardId}: capturedOre is ${capturedOre}`);
  }

  const capturedNok = Number((capturedOre / 100).toFixed(2));

  const { newlyConfirmed } = await prisma.$transaction(async (tx) => {
    // Radlås for å forhindre duplikattrekk eller race conditions mellom webhook og returside
    await tx.$queryRaw`SELECT id FROM "GiftCard" WHERE id = ${giftCardId} FOR UPDATE`;

    const currentCard = await tx.giftCard.findUnique({
      where: { id: giftCardId },
    });

    if (!currentCard) {
      throw new Error(`GiftCard ${giftCardId} not found`);
    }

    // 1. Sørg for at det opprettes nøyaktig ÉN salgskvittering i Receipt-tabellen
    const existingReceipt = await tx.receipt.findFirst({
      where: {
        giftCardId,
        status: 'CAPTURED',
        type: 'payment',
      },
    });

    if (!existingReceipt) {
      const storeSettings = await getStoreSettings(tx);
      const effectiveVatRate = storeSettings.isVatRegistered ? storeSettings.defaultVatRate : 0;
      const vatSplit = computeReceiptVat(capturedNok, effectiveVatRate);

      await tx.receipt.create({
        data: {
          giftCardId,
          orderType: 'gift_card',
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

    const wasActive = currentCard.status === 'active' && currentCard.isPaid;

    if (!wasActive) {
      await tx.giftCard.update({
        where: { id: giftCardId },
        data: {
          status: 'active',
          isPaid: true,
          paidAt: new Date(),
          balance: currentCard.initialAmount,
          paymentRef: vippsRef,
        },
      });
    }

    return { newlyConfirmed: !wasActive };
  });

  const confirmedCard = await prisma.giftCard.findUnique({
    where: { id: giftCardId },
  });

  if (!confirmedCard) {
    throw new Error(`GiftCard ${giftCardId} not found after confirmation`);
  }

  // Utsendelser utføres utelukkende for første bekreftede vinner
  if (newlyConfirmed) {
    try {
      const { sendGiftCardCustomerEmail, sendAdminNewGiftCardEmail } = await import('@/lib/email');
      
      // 1. Send e-post med gavekort til kjøper
      await sendGiftCardCustomerEmail(confirmedCard.buyerEmail, confirmedCard);

      // 2. Send internt varsel til post@krsvr.no
      await sendAdminNewGiftCardEmail(confirmedCard);
    } catch (mailErr) {
      console.error('Failed to send gift card confirmation emails:', mailErr);
    }

    // 3. Send admin push-varsel til mobil/PC
    try {
      await sendAdminPushNotification({
        title: `Nytt gavekort solgt: ${confirmedCard.buyerName}`,
        body: `${confirmedCard.targetPersons} pers (${confirmedCard.initialAmount} kr) · Kode: ${confirmedCard.code}`,
        url: `/admin?tab=giftcards&search=${encodeURIComponent(confirmedCard.code)}`,
        tag: `giftcard-new-${confirmedCard.id}`,
      });
    } catch (pushErr) {
      console.error('Failed to send gift card push notification:', pushErr);
    }
  }

  return confirmedCard;
}

/**
 * Atomically deducts a gift card amount for a booking or over the counter.
 */
export async function redeemGiftCard(params: {
  giftCardId: string;
  amount: number;
  bookingId?: string | null;
  channel?: 'web_booking' | 'admin_manual';
  note?: string;
  tx?: any;
}) {
  const { giftCardId, amount, bookingId, channel = 'web_booking', note, tx } = params;
  if (amount <= 0) {
    throw new Error('Deduction amount must be greater than 0');
  }

  const runner = tx || prisma;

  return runner.$transaction(async (t: any) => {
    await t.$queryRaw`SELECT id FROM "GiftCard" WHERE id = ${giftCardId} FOR UPDATE`;

    const card = await t.giftCard.findUnique({ where: { id: giftCardId } });
    if (!card) throw new Error('Gavekort ikke funnet');
    if (card.status !== 'active') throw new Error(`Gavekort er ${card.status}`);
    if (card.balance < amount) {
      throw new Error(`Ikke tilstrekkelig saldo. Saldo: ${card.balance} kr, ønsket trekk: ${amount} kr`);
    }

    const newBalance = Number((card.balance - amount).toFixed(2));
    const newStatus = newBalance <= 0 ? 'exhausted' : 'active';

    const redemption = await t.giftCardRedemption.create({
      data: {
        giftCardId,
        bookingId: bookingId || null,
        amount,
        balanceBefore: card.balance,
        balanceAfter: newBalance,
        channel,
        note: note || (bookingId ? `Booking ${bookingId}` : 'Manuell innløsning over disk'),
      },
    });

    const updatedCard = await t.giftCard.update({
      where: { id: giftCardId },
      data: {
        balance: newBalance,
        status: newStatus,
      },
    });

    return { redemption, card: updatedCard };
  });
}

/**
 * Restores gift card balance if a booking is cancelled.
 */
export async function restoreGiftCardBalanceForBooking(bookingId: string, tx?: any) {
  const runner = tx || prisma;

  const redemptions = await runner.giftCardRedemption.findMany({
    where: { bookingId },
  });

  if (!redemptions || redemptions.length === 0) return;

  for (const red of redemptions) {
    const card = await runner.giftCard.findUnique({ where: { id: red.giftCardId } });
    if (!card) continue;

    const restoredBalance = Number((card.balance + red.amount).toFixed(2));
    const now = new Date();
    const newStatus = card.expiresAt > now ? 'active' : 'expired';

    await runner.giftCard.update({
      where: { id: card.id },
      data: {
        balance: restoredBalance,
        status: newStatus,
      },
    });

    // Delete or mark redemption as reversed
    await runner.giftCardRedemption.delete({
      where: { id: red.id },
    });
  }
}
