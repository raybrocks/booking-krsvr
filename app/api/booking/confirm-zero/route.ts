import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, sendAdminNewBookingNotification, addContactToNewsletter } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { bookingId } = await req.json();

    if (!bookingId) {
      return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { experience: true }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // SECURITY GUARD: confirm-zero is ONLY allowed for Pay-at-Venue (`terminal`) or
    // genuine 0 NOK bookings (e.g. 100% discount code). Vipps bookings MUST go through Vipps!
    const isZeroUpfrontAllowed =
      booking.paymentType === 'terminal' || (booking.totalPrice || 0) === 0;

    if (!isZeroUpfrontAllowed) {
      return NextResponse.json(
        { error: 'Denne bestillingen krever gjennomført Vipps-betaling før bekreftelse.' },
        { status: 400 }
      );
    }

    // Atomic state transition so concurrent calls / refreshes never send duplicate emails
    const transition = await prisma.booking.updateMany({
      where: {
        id: bookingId,
        status: { not: 'confirmed' },
      },
      data: {
        status: 'confirmed',
        amountPaid: 0,
      },
    });

    const updatedBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { experience: true },
    });

    if (!updatedBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (transition.count === 1) {
      // Auto-sync customer contact to Resend (Audience + Segment)
      if (updatedBooking.email) {
        addContactToNewsletter(
          updatedBooking.email,
          updatedBooking.firstName,
          updatedBooking.lastName
        ).catch((err) => console.error('Resend sync error on confirm-zero:', err));
      }

      // Increment discount usage once
      if (updatedBooking.discountCode) {
        try {
          await prisma.discountCode.update({
            where: { code: updatedBooking.discountCode },
            data: { usageCount: { increment: 1 } },
          });
        } catch (e) {
          console.error('Failed to increment discount code:', e);
        }
      }

      // Send confirmation email once
      try {
        const settingsDoc = await prisma.setting.findUnique({ where: { key: 'general' } });
        const generalSettings = settingsDoc?.value || {
          email: 'post@krsvr.no',
          phone: '+47 408 28 302',
        };

        const experienceData = updatedBooking.experience || {
          name: 'Valgt VR Opplevelse',
          picture: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d',
          age: 'Alle',
          duration: '90 min',
        };

        await sendEmail(
          updatedBooking.email,
          updatedBooking,
          experienceData,
          generalSettings as any
        );

        await sendAdminNewBookingNotification(updatedBooking);

        // Send instant Web Push notification to Admin's iPhone / devices
        try {
          const { sendAdminPushNotification } = await import('@/lib/push');
          const expName = updatedBooking.experience?.name || 'VR Opplevelse';
          const dateStr = updatedBooking.date;
          const timeStr = updatedBooking.time;
          const playersStr = `${updatedBooking.players} ${updatedBooking.players === 1 ? 'spiller' : 'spillere'}`;
          const amountStr = updatedBooking.paymentType === 'terminal' ? 'Betales i kasse' : '0 kr';
          const custName = `${updatedBooking.firstName} ${updatedBooking.lastName}`.trim();

          await sendAdminPushNotification({
            title: `Ny booking: ${custName} (${amountStr})`,
            body: `${expName} • ${dateStr} kl. ${timeStr} • ${playersStr}`,
            url: `/admin`,
            tag: `booking-${updatedBooking.id}`,
            bookingId: updatedBooking.id,
          });
        } catch (pushErr) {
          console.error('Failed to send admin push notification on confirm-zero:', pushErr);
        }
      } catch (e) {
        console.error('Failed to send zero confirmation email:', e);
      }
    }

    return NextResponse.json({ success: true, booking: updatedBooking });
  } catch (error) {
    console.error('Zero confirm error:', error);
    return NextResponse.json({ error: 'Failed to confirm zero amount' }, { status: 500 });
  }
}
