import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  getVippsAccessToken,
  ensureVippsCaptured,
  confirmPaidVippsBookingAtomically,
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

        // 1. Fully refunded on Vipps
        if (summary.normalizedStatus === 'REFUNDED') {
          const existingRefundReceipt = await prisma.receipt.findFirst({
            where: { bookingId: booking.id, status: 'REFUNDED' },
          });

          if (!existingRefundReceipt) {
            await prisma.receipt.create({
              data: {
                bookingId: booking.id,
                amount: -(summary.refundedOre / 100),
                status: 'REFUNDED',
                paymentRef: reference,
                type: 'refund',
              },
            });
          }

          await prisma.booking.update({
            where: { id: booking.id },
            data: {
              status: 'cancelled',
              amountPaid: 0,
            },
          });
          continue;
        }

        // 2. Genuinely PAID & CAPTURED on Vipps (`aggregate.capturedAmount.value > 0`)
        if (summary.normalizedStatus === 'CAPTURED' && summary.capturedOre > 0) {
          await confirmPaidVippsBookingAtomically({
            bookingId: booking.id,
            vippsRef: reference,
            capturedOre: summary.capturedOre,
          });
          continue;
        }

        // Ignore expired/aborted/created webhooks from superseded old payment attempts
        if (isSupersededRef) {
          continue;
        }

        // 3. Payment attempt failed, expired, or was aborted by customer WITHOUT paying (`capturedOre === 0`)
        if (
          summary.normalizedStatus === 'EXPIRED' ||
          summary.normalizedStatus === 'ABORTED' ||
          summary.normalizedStatus === 'CANCELLED'
        ) {
          const existingFailedReceipt = await prisma.receipt.findFirst({
            where: {
              bookingId: booking.id,
              paymentRef: reference,
              status: summary.normalizedStatus,
            },
          });

          if (!existingFailedReceipt) {
            await prisma.receipt.create({
              data: {
                bookingId: booking.id,
                amount: 0,
                status: summary.normalizedStatus,
                paymentRef: reference,
                type: 'payment',
              },
            });
          }

          // IMPORTANT: Only cancel if booking is still `pending` (unconfirmed).
          // Never overwrite an already `confirmed` booking, and NEVER send a cancellation
          // or confirmation email for an uncompleted Vipps checkout!
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

        // 4. `AUTHORIZED` (if auto-capture somehow didn't complete yet) or `CREATED`
        if (summary.normalizedStatus === 'AUTHORIZED' || summary.normalizedStatus === 'CREATED') {
          // Never insert a lower-priority receipt if CAPTURED already exists
          const alreadyCaptured = await prisma.receipt.findFirst({
            where: { bookingId: booking.id, status: 'CAPTURED' },
          });

          if (!alreadyCaptured) {
            const existingStateReceipt = await prisma.receipt.findFirst({
              where: {
                bookingId: booking.id,
                paymentRef: reference,
                status: summary.normalizedStatus,
              },
            });

            if (!existingStateReceipt) {
              await prisma.receipt.create({
                data: {
                  bookingId: booking.id,
                  amount: summary.amountOre / 100,
                  status: summary.normalizedStatus,
                  paymentRef: event.pspReference || reference,
                  type: 'payment',
                },
              });
            }
          }
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
