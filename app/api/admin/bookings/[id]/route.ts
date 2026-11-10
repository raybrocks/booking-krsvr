import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendBookingCancellationEmail, sendBookingConfirmationEmail } from '@/lib/email';
import { sendBookingChangePushNotification } from '@/lib/push';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const data = await req.json();
    
    // Check for confirmation email flag
    const sendConfirmation = !!data.sendConfirmation;
    const customEmailText = typeof data.customEmailText === 'string' ? data.customEmailText.trim() : '';
    if ('sendConfirmation' in data) delete data.sendConfirmation;
    if ('customEmailText' in data) delete data.customEmailText;

    // Remove complex or read-only fields
    if (data.id) delete data.id;
    if (data.experience) delete data.experience;
    if (data.experienceName) delete data.experienceName;
    if (data.createdAt) delete data.createdAt;
    if (data.updatedAt) delete data.updatedAt;

    // Type casting
    if (data.players !== undefined) data.players = parseInt(data.players, 10) || 1;
    if (data.totalPrice !== undefined) data.totalPrice = parseFloat(data.totalPrice) || 0;
    if (data.duration !== undefined) data.duration = parseInt(data.duration, 10) || 90;
    if (data.amountPaid !== undefined) delete data.amountPaid;
    if (data.playerNames && Array.isArray(data.playerNames)) {
      data.playerNames = data.playerNames.map((n: any) => String(n || '').trim());
    }

    const existingBooking = await prisma.booking.findUnique({
      where: { id: id },
      include: { experience: true }
    });

    const updatedBooking = await prisma.booking.update({
      where: { id: id },
      data,
      include: { experience: true }
    });

    // Cascade status and details to shadow bookings 
    const shadowUpdate: any = {};
    if (data.status) shadowUpdate.status = data.status;
    if (data.experienceId) shadowUpdate.experienceId = data.experienceId;
    if (data.date) shadowUpdate.date = data.date;
    
    if (Object.keys(shadowUpdate).length > 0) {
      await prisma.booking.updateMany({
        where: { parentBookingId: id },
        data: shadowUpdate
      });
    }

    if (data.status === 'cancelled') {
      await sendBookingCancellationEmail(updatedBooking.email, updatedBooking);
    } else if (sendConfirmation && updatedBooking.email && !updatedBooking.email.includes('system@sperret')) {
      await sendBookingConfirmationEmail(
        updatedBooking.email,
        updatedBooking,
        customEmailText,
        { isUpdate: true }
      );
    }

    // Dispatch push notification on admin booking update/cancellation
    const isCancelled = Boolean(data.status === 'cancelled' && existingBooking?.status !== 'cancelled');
    const timeChanged = Boolean(
      (existingBooking && data.date && data.date !== existingBooking.date) ||
      (existingBooking && data.time && data.time !== existingBooking.time)
    );
    const experienceChanged = Boolean(
      existingBooking && data.experienceId && data.experienceId !== existingBooking.experienceId
    );
    const playersChanged = Boolean(
      existingBooking && data.players !== undefined && data.players !== existingBooking.players
    );
    const oldNamesJson = JSON.stringify((existingBooking?.playerNames || []).map((n: any) => String(n || '').trim()));
    const newNamesJson = JSON.stringify((updatedBooking?.playerNames || []).map((n: any) => String(n || '').trim()));
    const namesUpdated = Boolean(oldNamesJson !== newNamesJson);

    if (isCancelled || timeChanged || experienceChanged || playersChanged || namesUpdated) {
      try {
        await sendBookingChangePushNotification({
          booking: updatedBooking,
          changes: {
            cancelled: isCancelled,
            timeChanged,
            experienceChanged,
            playersChanged,
            namesUpdated,
            oldDate: existingBooking?.date,
            oldTime: existingBooking?.time,
            oldPlayers: existingBooking?.players,
            oldExperienceName: existingBooking?.experience?.name,
          },
          source: 'admin',
        });
      } catch (pushErr) {
        console.error("Failed to send admin push notification on booking edit:", pushErr);
      }
    }
    
    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("Failed to update booking:", error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const existingBooking = await prisma.booking.findUnique({
      where: { id: id },
      include: { experience: true }
    });

    // Delete child bookings first
    await prisma.booking.deleteMany({
      where: { parentBookingId: id }
    });

    await prisma.booking.delete({
      where: { id: id },
    });

    if (existingBooking) {
      try {
        await sendBookingChangePushNotification({
          booking: { ...existingBooking, status: 'cancelled' },
          changes: { cancelled: true },
          source: 'admin',
        });
      } catch (pushErr) {
        console.error("Failed to send admin push notification on booking delete:", pushErr);
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
  }
}
