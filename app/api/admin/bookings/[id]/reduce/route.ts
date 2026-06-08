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

    const { timeToRemove } = await req.json();

    if (!timeToRemove) {
       return NextResponse.json({ error: 'Mangler klokkeslett som skal fjernes' }, { status: 400 });
    }

    // Find the shadow booking
    const shadowBooking = await prisma.booking.findFirst({
        where: {
            parentBookingId: booking.id,
            time: timeToRemove
        }
    });

    if (!shadowBooking) {
        return NextResponse.json({ error: `Fant ingen ekstra tidsslot for klokken ${timeToRemove} som tilhører denne bookingen.` }, { status: 404 });
    }

    // Delete shadow booking
    await prisma.booking.delete({
        where: { id: shadowBooking.id }
    });

    // Update main booking duration
    const newDuration = booking.duration - 90;
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
