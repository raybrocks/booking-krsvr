import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redeemGiftCard } from '@/lib/giftcard';

/**
 * Atomically redeems a gift card directly against an existing booking from Admin
 * (Today / Upcoming / Archive / Edit modal) and updates booking payment totals.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await req.json();
    const cleanCode = String(body.code || '').trim().toUpperCase();
    const requestedAmount =
      body.amount !== undefined && body.amount !== null && body.amount !== ''
        ? Number(body.amount)
        : null;
    const customNote = typeof body.note === 'string' ? body.note.trim() : '';

    if (!cleanCode) {
      return NextResponse.json({ error: 'Gavekortkode mangler' }, { status: 400 });
    }

    if (requestedAmount !== null && (!Number.isFinite(requestedAmount) || requestedAmount <= 0)) {
      return NextResponse.json({ error: 'Ugyldig beløp for trekk' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Booking" WHERE id = ${id} FOR UPDATE`;

      const booking = await tx.booking.findUnique({
        where: { id },
        include: { experience: true },
      });

      if (!booking) {
        throw new Error('NOT_FOUND:Booking ble ikke funnet');
      }
      if (booking.status === 'cancelled') {
        throw new Error('BAD_REQUEST:Kan ikke trekke gavekort på en kansellert booking');
      }
      if (booking.bookingType === 'system' || booking.email?.includes('system@sperret')) {
        throw new Error('BAD_REQUEST:Kan ikke trekke gavekort på et sperret tidspunkt');
      }

      const totalPrice = Math.max(0, Number(booking.totalPrice || 0));
      const existingGiftCardAmt = Math.max(0, Number(booking.giftCardAmount || 0));
      const alreadySettled = Math.max(Number(booking.amountPaid || 0), existingGiftCardAmt);
      const remainingDue = Math.max(0, Number((totalPrice - alreadySettled).toFixed(2)));

      if (remainingDue <= 0) {
        throw new Error('BAD_REQUEST:Bookingen har ikke noe gjenstående beløp å dekke');
      }

      const card = await tx.giftCard.findUnique({
        where: { code: cleanCode },
      });

      if (!card) {
        throw new Error('NOT_FOUND:Fant ikke gavekort med denne koden');
      }
      if (card.status !== 'active') {
        throw new Error(`BAD_REQUEST:Gavekortet er ikke aktivt (status: ${card.status})`);
      }
      if (new Date(card.expiresAt) < new Date()) {
        throw new Error('BAD_REQUEST:Gavekortet er utløpt');
      }
      if (card.balance <= 0) {
        throw new Error('BAD_REQUEST:Gavekortet har 0 kr i saldo');
      }

      const deductAmount =
        requestedAmount !== null
          ? Number(requestedAmount.toFixed(2))
          : Number(Math.min(remainingDue, card.balance).toFixed(2));

      if (deductAmount > card.balance) {
        throw new Error(`BAD_REQUEST:Ikke nok saldo på gavekortet. Tilgjengelig saldo er ${card.balance} kr.`);
      }
      if (deductAmount > remainingDue) {
        throw new Error(`BAD_REQUEST:Kan ikke trekke mer enn gjenstående beløp (${remainingDue} kr).`);
      }

      const customerLabel = `${booking.firstName || ''} ${booking.lastName || ''}`.trim();
      const redemptionResult = await redeemGiftCard({
        giftCardId: card.id,
        amount: deductAmount,
        bookingId: id,
        channel: 'admin_manual',
        note:
          customNote ||
          `Trukket direkte på booking (${booking.date} kl ${booking.time}${customerLabel ? ` · ${customerLabel}` : ''})`,
        tx,
      });

      const nextGiftCardAmount = Number((existingGiftCardAmt + deductAmount).toFixed(2));
      const nextAmountPaid = Number((Math.max(Number(booking.amountPaid || 0), existingGiftCardAmt) + deductAmount).toFixed(2));
      const existingCodes = (booking.giftCardCode || '')
        .split(',')
        .map((c) => c.trim().toUpperCase())
        .filter(Boolean);
      const nextGiftCardCode = existingCodes.includes(cleanCode)
        ? existingCodes.join(', ')
        : [...existingCodes, cleanCode].join(', ');

      const updatedBooking = await tx.booking.update({
        where: { id },
        data: {
          giftCardCode: nextGiftCardCode,
          giftCardAmount: nextGiftCardAmount,
          amountPaid: nextAmountPaid,
          status: booking.status === 'pending' ? 'confirmed' : booking.status,
        },
        include: { experience: true },
      });

      const remainingAfter = Math.max(
        0,
        Number((totalPrice - Math.max(nextAmountPaid, nextGiftCardAmount)).toFixed(2))
      );

      return {
        booking: updatedBooking,
        card: redemptionResult.card,
        redemption: redemptionResult.redemption,
        deductedAmount: deductAmount,
        remainingAfter,
      };
    });

    // VIKTIG REGNSKAPSREGEL:
    // Innløsning av gavekort bokføres i GiftCardRedemption, aldri i Receipt-tabellen
    // (Receipt er kun for faktiske Vipps ePayment-transaksjoner i nettbutikken).

    return NextResponse.json({
      success: true,
      ...result,
      message:
        result.remainingAfter > 0
          ? `${result.deductedAmount} kr trukket fra ${cleanCode}. Gjenstår ${result.remainingAfter} kr i arenaen.`
          : `${result.deductedAmount} kr trukket fra ${cleanCode}. Bookingen er nå fullt oppgjort!`,
    });
  } catch (error: any) {
    const rawMsg = String(error?.message || 'Kunne ikke trekke gavekort');
    if (rawMsg.startsWith('NOT_FOUND:')) {
      return NextResponse.json({ error: rawMsg.replace('NOT_FOUND:', '') }, { status: 404 });
    }
    if (rawMsg.startsWith('BAD_REQUEST:')) {
      return NextResponse.json({ error: rawMsg.replace('BAD_REQUEST:', '') }, { status: 400 });
    }
    console.error('Redeem gift card on booking error:', error);
    return NextResponse.json({ error: rawMsg }, { status: 500 });
  }
}
