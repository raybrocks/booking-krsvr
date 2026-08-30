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
    const booking = await prisma.booking.findUnique({ 
      where: { id },
      include: { experience: true }
    });

    if (!booking || booking.manageToken !== token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const data = await req.json();
    const updateData: any = {};

    // 1. Handling Player Names & Players count updates
    if (data.playerNames !== undefined || data.players !== undefined) {
      if (Array.isArray(data.playerNames)) {
        updateData.playerNames = data.playerNames.map((n: any) => typeof n === 'string' ? n.trim() : '').filter(Boolean);
      }

      if (data.players !== undefined && typeof data.players === 'number' && data.players > 0) {
        const newPlayers = data.players;
        updateData.players = newPlayers;

        // Recalculate total price proportionally if price per player is calculable
        if (booking.players > 0 && booking.totalPrice > 0) {
          const pricePerPlayer = booking.totalPrice / booking.players;
          updateData.totalPrice = Math.round(pricePerPlayer * newPlayers);
        }
      }
    }

    // 2. Handling Rescheduling (Date, Time, Experience)
    if (data.date || data.time || data.experienceId) {
      const targetDate = data.date || booking.date;
      const targetTime = data.time || booking.time;
      const targetExperienceId = data.experienceId || booking.experienceId;

      // If actually moving date/time/experience, enforce 48 hours rule
      if (targetDate !== booking.date || targetTime !== booking.time || targetExperienceId !== booking.experienceId) {
        const bookingDate = new Date(`${booking.date}T${booking.time}`);
        const hoursDifference = differenceInHours(bookingDate, new Date());
        
        if (hoursDifference < 48) {
          return NextResponse.json({ error: 'Det er for sent å endre tidspunkt/opplevelse automatisk (under 48 timer). Ta kontakt med oss.' }, { status: 400 });
        }

        // Check if new slot is available
        const existing = await prisma.booking.findUnique({
          where: {
            experienceId_date_time: {
              experienceId: targetExperienceId,
              date: targetDate,
              time: targetTime
            }
          }
        });

        if (existing && existing.id !== id && existing.status !== 'cancelled' && existing.status !== 'terminated') {
          return NextResponse.json({ error: 'Tidspunktet er allerede booket.' }, { status: 409 });
        }

        updateData.date = targetDate;
        updateData.time = targetTime;
        updateData.experienceId = targetExperienceId;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Ingen endringer spesifisert' }, { status: 400 });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: { experience: true }
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
