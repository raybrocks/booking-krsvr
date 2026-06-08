import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Check availability before creating (Prisma's @@unique constraint will also catch it, 
    // but doing explicit check is sometimes nicer for error messages)
    const existing = await prisma.booking.findUnique({
      where: {
        date_time: {
          date: data.date,
          time: data.time
        }
      }
    });

    if (existing) {
      // Allow if it was terminated/cancelled before? 
      // If we use Prisma constraint, a cancelled booking still holds the date_time constraint.
      // So we must either update the status or use a soft delete/date mangle.
      if (existing.status.toLowerCase() === 'cancelled' || existing.status.toLowerCase() === 'terminated') {
        const resetBooking = await prisma.booking.update({
          where: { id: existing.id },
          data: {
             experienceId: data.experienceId,
             players: data.players,
             firstName: data.firstName,
             lastName: data.lastName,
             email: data.email,
             phone: data.phone,
             acceptedTerms: data.acceptedTerms,
             acceptedNewsletter: data.acceptedNewsletter || false,
             paymentType: data.paymentType,
             totalPrice: data.totalPrice,
             amountPaid: data.amountPaid,
             status: 'pending',
             paymentRef: null,
             cancellationEmailSent: false
          }
        });
        return NextResponse.json({ id: resetBooking.id }, { status: 201 });
      }

      // If pending for more than 15 mins, we can overwrite it.
      if (existing.status.toLowerCase() === 'pending') {
        const now = new Date().getTime();
        const createdMs = new Date(existing.createdAt).getTime();
        if (now - createdMs > 15 * 60 * 1000) {
          const resetBooking = await prisma.booking.update({
            where: { id: existing.id },
            data: {
               experienceId: data.experienceId,
               players: data.players,
               firstName: data.firstName,
               lastName: data.lastName,
               email: data.email,
               phone: data.phone,
               acceptedTerms: data.acceptedTerms,
               acceptedNewsletter: data.acceptedNewsletter || false,
               paymentType: data.paymentType,
               totalPrice: data.totalPrice,
               amountPaid: data.amountPaid,
               status: 'pending',
               paymentRef: null,
               cancellationEmailSent: false
            }
          });
          return NextResponse.json({ id: resetBooking.id }, { status: 201 });
        }
      }

      return NextResponse.json({ error: 'Time slot is already booked.' }, { status: 409 });
    }

    const booking = await prisma.booking.create({
      data: {
        experienceId: data.experienceId,
        date: data.date,
        time: data.time,
        players: data.players,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        acceptedTerms: data.acceptedTerms,
        acceptedNewsletter: data.acceptedNewsletter || false,
        paymentType: data.paymentType,
        totalPrice: data.totalPrice,
        amountPaid: data.amountPaid,
        status: data.status || 'pending',
      }
    });

    return NextResponse.json({ id: booking.id }, { status: 201 });
  } catch (error: any) {
    console.error("Booking creation failed:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Time slot is already booked (constraint error).' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    const bookings = await prisma.booking.findMany({
      where: { date },
      select: {
        id: true,
        time: true,
        status: true,
        createdAt: true,
      }
    });

    return NextResponse.json(bookings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}
