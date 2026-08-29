import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      return NextResponse.json({ error: 'Finner ikke booking' }, { status: 404 });
    }

    if (!booking.duration || booking.duration <= 90) {
        return NextResponse.json({ error: 'Ingen utvidet tid er registrert på denne bookingen' }, { status: 400 });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch (e) {
      body = {};
    }

    let timeToRemove = body?.timeToRemove;

    // Find the shadow booking (if any)
    const shadowBooking = await prisma.booking.findFirst({
      where: {
        parentBookingId: booking.id,
        ...(timeToRemove ? { time: timeToRemove } : {})
      },
      orderBy: { time: 'desc' }
    });

    if (shadowBooking) {
      // Delete shadow booking
      await prisma.booking.delete({
        where: { id: shadowBooking.id }
      });
    }

    // Update main booking duration
    const newDuration = Math.max(90, (booking.duration || 90) - 90);
    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: { duration: newDuration }
    });

    return NextResponse.json({ success: true, newDuration });
  } catch (error: any) {
    console.error("Failed to reduce booking", error);
    return NextResponse.json({ error: 'En feil oppstod ved fjerning av ekstra tid' }, { status: 500 });
  }
}
