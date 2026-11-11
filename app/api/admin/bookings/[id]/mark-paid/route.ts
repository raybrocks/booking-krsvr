import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { experience: true }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.paymentType === 'system') {
      return NextResponse.json({ error: 'System block cannot be marked paid' }, { status: 400 });
    }

    const totalPrice = booking.totalPrice || 0;
    const nextPaymentType =
      !booking.paymentType || booking.paymentType === 'manual'
        ? 'terminal'
        : booking.paymentType;

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        amountPaid: totalPrice,
        status: 'confirmed',
        paymentType: nextPaymentType,
      },
      include: { experience: true }
    });

    // VIKTIG REGNSKAPSREGEL:
    // Betalinger i fysisk kasse/kortterminal ved oppmøte bokføres direkte i kassasystemet
    // etter kassasystemloven. Vi skal ALDRI opprette en rad i `Receipt`-tabellen her,
    // da `Receipt` utelukkende er nettbutikkens bilagsjournal for faktiske Vipps-transaksjoner
    // (ellers oppstår dobbeltføring av omsetning i regnskapet).

    return NextResponse.json({
      success: true,
      booking: updated,
      message: `Booking markert som fullt betalt i arenaen (${totalPrice} NOK).`
    });
  } catch (error: any) {
    console.error('Error marking booking as paid:', error);
    return NextResponse.json({ error: 'Failed to mark booking as paid' }, { status: 500 });
  }
}
