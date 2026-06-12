import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      return NextResponse.json({ error: 'Finner ikke booking' }, { status: 404 });
    }

    // Finn out what the next timeslot should be
    // Usually + 90 mins? But wait, what if the timeslots in openingHours are not exactly 90 min separated?
    // It is simpler to just accept an explicit `nextTime` string in the request body.
    const body = await req.json();
    const { nextTime } = body;

    if (!nextTime) {
       return NextResponse.json({ error: 'Mangler neste tidspunkt for utvidelse' }, { status: 400 });
    }

    // Check if `nextTime` is already booked
    const existing = await prisma.booking.findUnique({
      where: {
        experienceId_date_time: {
          experienceId: booking.experienceId,
          date: booking.date,
          time: nextTime
        }
      }
    });

    if (existing && existing.status !== 'cancelled') {
        return NextResponse.json({ error: `Tidspunktet ${nextTime} er dessverre allerede booket. Kan ikke utvide.` }, { status: 400 });
    }

    if (existing && existing.status === 'cancelled') {
        await prisma.booking.delete({ where: { id: existing.id }});
    }

    // Create shadow booking
    await prisma.booking.create({
      data: {
        experienceId: booking.experienceId,
        date: booking.date,
        time: nextTime,
        players: 0,
        firstName: 'Utvidet Reservasjon',
        lastName: `(Tilbehør til ${booking.time})`,
        email: 'system@sperret',
        phone: '',
        acceptedTerms: true,
        paymentType: 'system',
        totalPrice: 0,
        status: booking.status, // Match parent
        bookingType: 'system',
        duration: 90,
        parentBookingId: booking.id,
        internalNotes: `Auto-generert tids-blokk for Hovedbooking ${booking.id}`
      }
    });

    // Update main booking duration
    const newDuration = (booking.duration || 90) + 90;
    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: { duration: newDuration }
    });

    return NextResponse.json({ success: true, newDuration });
  } catch (error: any) {
    console.error("Failed to extend booking", error);
    return NextResponse.json({ error: 'En feil oppstod ved utvidelse' }, { status: 500 });
  }
}
