import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  getVippsAccessToken,
  ensureVippsCaptured,
  confirmPaidVippsBookingAtomically,
  recordVippsRefundAtomically,
} from '@/lib/vipps';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const rawText = await req.text();

    let body;
    try {
      body = JSON.parse(rawText);
    } catch {
      console.error('Webhook payload not JSON', rawText);
      return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
    }

    const events = Array.isArray(body) ? body : [body];

    let globalAccessToken: string | undefined;
    try {
      globalAccessToken = await getVippsAccessToken();
    } catch (e) {
      console.error('Klarte ikke å hente Vipps access token i webhook:', e);
    }

    for (const event of events) {
      const reference: string | undefined =
        event.reference ||
        event.item?.reference ||
        event.data?.reference ||
        event.aggregate?.reference ||
        event.payment?.reference;

      const eventName = String(event.name || event.eventName || 'vipps_webhook').toUpperCase();

      // Raw technical webhook events belong ONLY in WebhookLog — never in Receipt!
      await prisma.webhookLog
        .create({
          data: {
            reference: reference || 'unknown',
            event: eventName,
            payload: event,
          },
        })
        .catch((e) => console.error('Klarte ikke skrive til webhookLogs:', e));

      if (!reference) continue;

      const booking = await prisma.booking.findFirst({
        where: {
          OR: [{ paymentRef: reference }, { id: reference }],
        },
      });

      if (!booking) {
        console.warn(`Vipps webhook mottatt for ukjent referanse: ${reference}`);
        continue;
      }

      // If this webhook belongs to an older, superseded payment attempt while the booking
      // already has a different active paymentRef, ignore non-captured events from the old ref.
      const isSupersededRef = Boolean(booking.paymentRef && booking.paymentRef !== reference);

      if (!globalAccessToken) {
        console.error(`Mangler Vipps access token – kan ikke verifisere webhook for ${reference}`);
        continue;
      }

      try {
        const summary = await ensureVippsCaptured(reference, globalAccessToken);

        // 1. Genuinely PAID & CAPTURED on Vipps (`aggregate.capturedAmount.value > 0`)
        if (summary.capturedOre > 0 && summary.netCapturedOre > 0) {
          await confirmPaidVippsBookingAtomically({
            bookingId: booking.id,
            vippsRef: reference,
            capturedOre: summary.capturedOre,
            netCapturedOre: summary.netCapturedOre,
          });

          // If a partial refund also occurred on Vipps, ensure its credit note delta is recorded
          if (summary.refundedOre > 0) {
            await recordVippsRefundAtomically({
              bookingId: booking.id,
              vippsRef: reference,
              capturedOre: summary.capturedOre,
              refundedOre: summary.refundedOre,
            });
          }
          continue;
        }

        // 2. Fully refunded on Vipps (`capturedOre > 0` and `refundedOre >= capturedOre`)
        if (summary.normalizedStatus === 'REFUNDED' && summary.refundedOre > 0) {
          await recordVippsRefundAtomically({
            bookingId: booking.id,
            vippsRef: reference,
            capturedOre: summary.capturedOre,
            refundedOre: summary.refundedOre,
          });
          continue;
        }

        // Ignore expired/aborted/created webhooks from superseded old payment attempts
        if (isSupersededRef) {
          continue;
        }

        // 3. Payment attempt failed, expired, or was aborted by customer WITHOUT paying (`capturedOre === 0`).
        // IMPORTANT ACCOUNTING RULE: Never write EXPIRED / ABORTED / CANCELLED / CREATED / AUTHORIZED
        // to `Receipt` — `Receipt` strictly holds completed Vipps sales (`CAPTURED`) and credit notes (`REFUNDED`).
        if (
          summary.normalizedStatus === 'EXPIRED' ||
          summary.normalizedStatus === 'ABORTED' ||
          summary.normalizedStatus === 'CANCELLED'
        ) {
          // Only cancel if booking is still `pending` (unconfirmed).
          await prisma.booking.updateMany({
            where: {
              id: booking.id,
              status: 'pending',
            },
            data: {
              status: 'cancelled',
              amountPaid: 0,
            },
          });
          continue;
        }
      } catch (verifyErr) {
        console.error(`Feil ved verifisering av Vipps-betaling i webhook for ${reference}:`, verifyErr);
      }
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
