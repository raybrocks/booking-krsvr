import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { differenceInHours } from 'date-fns';
import { sendBookingCancellationEmail, sendAdminBookingUpdateNotification, sendAdminBookingCancellationNotification } from '@/lib/email';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = req.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 401 });
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { experience: true }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.manageToken !== token) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Failed to fetch booking for manage:", error);
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = req.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 401 });
  }

  try {
    const booking = await prisma.booking.findUnique({ where: { id } });

    if (!booking || booking.manageToken !== token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Enforce 48 hours rule
    const bookingDate = new Date(`${booking.date}T${booking.time}`);
    const hoursDifference = differenceInHours(bookingDate, new Date());
    
    if (hoursDifference < 48) {
      return NextResponse.json({ error: 'Det er for sent å endre bookingen automatisk (under 48 timer). Ta kontakt med oss.' }, { status: 400 });
    }

    const { date, time, experienceId } = await req.json();

    if (!date || !time || !experienceId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if new slot is available
    const existing = await prisma.booking.findUnique({
      where: {
        experienceId_date_time: {
          experienceId,
          date,
          time
        }
      }
    });

    if (existing && existing.id !== id && existing.status !== 'cancelled' && existing.status !== 'terminated') {
      return NextResponse.json({ error: 'Tidspunktet er allerede booket.' }, { status: 409 });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        date,
        time,
        experienceId
      }
    });
    
    await sendAdminBookingUpdateNotification(updated);

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update booking:", error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = req.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 401 });
  }

  try {
    const booking = await prisma.booking.findUnique({ where: { id } });

    if (!booking || booking.manageToken !== token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const bookingDate = new Date(`${booking.date}T${booking.time}`);
    const hoursDifference = differenceInHours(bookingDate, new Date());
    
    if (hoursDifference < 48) {
      return NextResponse.json({ error: 'Det er for sent å kansellere bookingen automatisk (under 48 timer). Ta kontakt med oss.' }, { status: 400 });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: 'cancelled' }
    });

    // Send cancellation email
    await sendBookingCancellationEmail(booking.email, booking);
    await sendAdminBookingCancellationNotification(booking);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to cancel booking:", error);
    return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 });
  }
}
