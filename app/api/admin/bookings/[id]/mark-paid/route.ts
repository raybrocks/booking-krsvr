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

    const totalPrice = booking.totalPrice || 0;

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        amountPaid: totalPrice,
        status: 'confirmed',
        paymentType: booking.paymentType || 'terminal',
      },
      include: { experience: true }
    });

    // Create receipt record for transaction history
    try {
      await prisma.receipt.create({
        data: {
          bookingId: id,
          amount: totalPrice,
          currency: 'NOK',
          status: 'CAPTURED',
          paymentRef: `terminal-${id}-${Date.now()}`,
          type: 'terminal',
        }
      });
    } catch (receiptError) {
      console.error('Failed to create receipt for terminal mark-paid:', receiptError);
    }

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
