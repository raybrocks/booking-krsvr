import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        experience: {
          select: { name: true }
        }
      }
    });

    // Formatting for frontend compatibility
    const formattedBookings = bookings.map(b => ({
      ...b,
      experienceName: b.experience?.name || b.experienceId
    }));

    return NextResponse.json(formattedBookings);
  } catch (error) {
    console.error("Failed to fetch admin bookings", error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Check if main timeslot is booked
    const existing = await prisma.booking.findUnique({
      where: {
        date_time: {
          date: data.date,
          time: data.time
        }
      }
    });

    if (existing && existing.status !== 'cancelled') {
        return NextResponse.json({ error: 'Valgt tidspunkt er allerede booket.' }, { status: 400 });
    }

    // Check if additional timeslots are booked (for longer durations)
    if (data.shadowTimes && data.shadowTimes.length > 0) {
       for (const shadowTime of data.shadowTimes) {
          const shadowExisting = await prisma.booking.findUnique({
             where: {
               date_time: {
                 date: data.date,
                 time: shadowTime
               }
             }
          });
          if (shadowExisting && shadowExisting.status !== 'cancelled') {
             return NextResponse.json({ error: `Tidspunkt ${shadowTime} er dessverre allerede booket. Kan ikke utvide så lenge.` }, { status: 400 });
          }
       }
    }

    // 1. Delete existing if cancelled, to allow overwrite
    if (existing && existing.status === 'cancelled') {
       await prisma.booking.delete({ where: { id: existing.id }});
    }

    // 2. Create the main booking
    const booking = await prisma.booking.create({
      data: {
        experienceId: data.experienceId,
        date: data.date,
        time: data.time,
        players: data.players || 1,
        firstName: data.firstName || 'Manuell',
        lastName: data.lastName || 'Booking',
        email: data.email || 'ingen@epost.no',
        phone: data.phone || '',
        acceptedTerms: true,
        acceptedNewsletter: false,
        paymentType: data.paymentType || 'manual',
        totalPrice: data.totalPrice || 0,
        amountPaid: data.amountPaid || 0,
        status: data.status || 'confirmed',
        discountCode: null,
        bookingType: data.bookingType || 'private',
        companyName: data.companyName,
        internalNotes: data.internalNotes,
        duration: data.duration || 90,
      }
    });

    // 3. Create shadow bookings if they are blocking additional timeslots
    if (data.shadowTimes && data.shadowTimes.length > 0) {
        for (const shadowTime of data.shadowTimes) {
           // delete if there's a cancelled one blocking
           const shadowExisting = await prisma.booking.findUnique({
              where: {
                date_time: {
                  date: data.date,
                  time: shadowTime
                }
              }
           });
           if (shadowExisting && shadowExisting.status === 'cancelled') {
              await prisma.booking.delete({ where: { id: shadowExisting.id }});
           }

           await prisma.booking.create({
              data: {
                experienceId: data.experienceId,
                date: data.date,
                time: shadowTime,
                players: 0,
                firstName: 'Sperret',
                lastName: `(Tilbehør til booking ${data.time})`,
                email: 'system@sperret',
                phone: '',
                acceptedTerms: true,
                paymentType: 'system',
                totalPrice: 0,
                status: 'confirmed',
                bookingType: 'system',
                duration: 90,
                parentBookingId: booking.id,
                internalNotes: `Auto-generert tids-blokk for Hovedbooking ${booking.id}`
              }
           });
        }
    }

    return NextResponse.json({ success: true, booking });
  } catch (error: any) {
    console.error("Admin booking creation failed:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'En av tidene er allerede booket.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create booking', details: error.message }, { status: 500 });
  }
}

