import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  getVippsAccessToken,
  ensureVippsCaptured,
  confirmPaidVippsBookingAtomically,
} from '@/lib/vipps';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { transactions } = body; // Array of { bookingId, amount }

    if (!transactions || transactions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No transactions provided.',
        captured: [],
      });
    }

    const accessToken = await getVippsAccessToken();
    const captured: string[] = [];
    const errors: Array<{ id: string; error: string }> = [];

    for (const tx of transactions) {
      try {
        const booking = await prisma.booking.findUnique({
          where: { id: tx.bookingId },
        });

        if (!booking) {
          errors.push({ id: tx.bookingId, error: 'Booking ikke funnet' });
          continue;
        }

        const vippsRef = booking.paymentRef || booking.id;
        const summary = await ensureVippsCaptured(vippsRef, accessToken);

        if (summary.capturedOre > 0) {
          await confirmPaidVippsBookingAtomically({
            bookingId: booking.id,
            vippsRef,
            capturedOre: summary.capturedOre,
          });
          captured.push(booking.id);
        } else {
          errors.push({
            id: booking.id,
            error: `Kunne ikke trekke betaling – Vipps-status er ${summary.normalizedStatus}`,
          });
        }
      } catch (txErr: any) {
        errors.push({ id: tx.bookingId, error: txErr?.message || 'Ukjent feil' });
      }
    }

    if (captured.length === 0 && errors.length > 0) {
      return NextResponse.json(
        { success: false, error: errors[0].error, errors },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Betaling bekreftet og trukket på Vipps (${captured.length} stk).`,
      captured,
      errors,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
