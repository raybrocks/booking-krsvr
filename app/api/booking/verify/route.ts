import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureVippsCaptured, confirmPaidVippsBookingAtomically } from '@/lib/vipps';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const reference = body.reference;

    if (!reference) {
      return NextResponse.json({ error: 'Missing reference' }, { status: 400 });
    }

    const booking = await prisma.booking.findFirst({
      where: {
        OR: [{ id: reference }, { paymentRef: reference }],
      },
      include: { experience: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const requiresVippsPayment =
      ['vipps', 'full', 'reservation'].includes(booking.paymentType) &&
      (booking.totalPrice || 0) > 0;

    // 1. Non-Vipps bookings (Pay on arrival in arena / 0 NOK free bookings)
    if (!requiresVippsPayment) {
      if (booking.status === 'confirmed') {
        return NextResponse.json({ success: true, booking });
      }

      if (booking.paymentType === 'terminal' || (booking.totalPrice || 0) === 0) {
        const transition = await prisma.booking.updateMany({
          where: { id: booking.id, status: { not: 'confirmed' } },
          data: { status: 'confirmed', amountPaid: 0 },
        });

        const updatedBooking = await prisma.booking.findUnique({
          where: { id: booking.id },
          include: { experience: true },
        });

        if (transition.count === 1 && updatedBooking) {
          try {
            const { sendEmail, sendAdminNewBookingNotification, addContactToNewsletter } =
              await import('@/lib/email');
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

            if (updatedBooking.email) {
              addContactToNewsletter(
                updatedBooking.email,
                updatedBooking.firstName,
                updatedBooking.lastName
              ).catch(() => {});
            }

            await sendEmail(
              updatedBooking.email,
              updatedBooking,
              experienceData,
              generalSettings as any
            );
            await sendAdminNewBookingNotification(updatedBooking).catch(console.error);
          } catch (e) {
            console.error('Failed to send terminal confirmation email in verify:', e);
          }
        }

        return NextResponse.json({ success: true, booking: updatedBooking });
      }

      return NextResponse.json({ error: 'Invalid booking payment state' }, { status: 400 });
    }

    // 2. Vipps bookings: Already confirmed with verified payment?
    if (booking.status === 'confirmed' && (booking.amountPaid || 0) > 0) {
      return NextResponse.json({ success: true, booking });
    }

    // 3. Query Vipps API directly (and auto-capture if AUTHORIZED)
    const vippsRef = booking.paymentRef || booking.id;

    let summary;
    try {
      summary = await ensureVippsCaptured(vippsRef);

      // Mobile redirect can occasionally land on /checkout/return a split-second before Vipps
      // finishes transitioning CREATED -> AUTHORIZED. Wait briefly once if still CREATED.
      if (summary.normalizedStatus === 'CREATED' && summary.capturedOre === 0) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        summary = await ensureVippsCaptured(vippsRef);
      }
    } catch (vippsErr: any) {
      console.error('Vipps verification API error:', vippsErr?.message || vippsErr);

      // Check if concurrent webhook already confirmed the booking in the meantime
      const rechecked = await prisma.booking.findUnique({
        where: { id: booking.id },
        include: { experience: true },
      });
      if (rechecked?.status === 'confirmed' && (rechecked.amountPaid || 0) > 0) {
        return NextResponse.json({ success: true, booking: rechecked });
      }

      return NextResponse.json(
        { error: 'Kunne ikke verifisere betalingen mot Vipps. Ingen bekreftelse er sendt.' },
        { status: 502 }
      );
    }

    // 4. Verified PAID & CAPTURED on Vipps!
    if (summary.normalizedStatus === 'CAPTURED' && summary.capturedOre > 0) {
      const { booking: confirmedBooking } = await confirmPaidVippsBookingAtomically({
        bookingId: booking.id,
        vippsRef,
        capturedOre: summary.capturedOre,
      });

      return NextResponse.json({ success: true, booking: confirmedBooking });
    }

    // 5. NOT PAID (`capturedOre === 0`): Re-check DB once in case another paymentRef succeeded,
    // NEVER overwrite `confirmed` back to `pending`, and NEVER return 200 OK if unpaid!
    const latestBooking = await prisma.booking.findUnique({
      where: { id: booking.id },
      include: { experience: true },
    });

    if (latestBooking?.status === 'confirmed' && (latestBooking.amountPaid || 0) > 0) {
      return NextResponse.json({ success: true, booking: latestBooking });
    }

    if (
      summary.normalizedStatus === 'ABORTED' ||
      summary.normalizedStatus === 'EXPIRED' ||
      summary.normalizedStatus === 'CANCELLED'
    ) {
      await prisma.booking.updateMany({
        where: { id: booking.id, status: 'pending' },
        data: { status: 'cancelled', amountPaid: 0 },
      });
    }

    return NextResponse.json(
      {
        error: 'Vipps-betalingen ble avbrutt eller ikke fullført.',
        paymentStatus: summary.normalizedStatus,
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Verify booking error:', error);
    return NextResponse.json({ error: 'Failed to verify booking' }, { status: 500 });
  }
}
