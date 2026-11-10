import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Check availability before creating (Prisma's @@unique constraint will also catch it)
    const existing = await prisma.booking.findUnique({
      where: {
        experienceId_date_time: {
          experienceId: data.experienceId,
          date: data.date,
          time: data.time
        }
      }
    });

    if (existing) {
      // Allow re-booking if previous slot holder was cancelled or terminated
      if (existing.status.toLowerCase() === 'cancelled' || existing.status.toLowerCase() === 'terminated') {
        const hasFinancialHistory = await prisma.receipt.findFirst({
          where: {
            bookingId: existing.id,
            status: { in: ['CAPTURED', 'REFUNDED'] },
          },
        });

        if (hasFinancialHistory || (existing.amountPaid || 0) > 0) {
          // Preserve financial/audit history on the cancelled booking while freeing the unique slot
          await prisma.booking.update({
            where: { id: existing.id },
            data: {
              time: `${existing.time} (kansellert-${existing.id.slice(-4)})`,
            },
          });
        } else {
          // Purely unpaid abandoned booking — safe to reset cleanly with amountPaid = 0
          const resetBooking = await prisma.booking.update({
            where: { id: existing.id },
            data: {
              experienceId: data.experienceId,
              players: data.players,
              playerNames: data.playerNames || [],
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              phone: data.phone,
              acceptedTerms: data.acceptedTerms,
              acceptedNewsletter: data.acceptedNewsletter || false,
              paymentType: data.paymentType,
              totalPrice: data.totalPrice,
              amountPaid: 0,
              status: 'pending',
              paymentRef: null,
              cancellationEmailSent: false,
              discountCode: data.discountCode || null,
              giftCardCode: data.giftCardCode || null,
              giftCardAmount: data.giftCardAmount ? Number(data.giftCardAmount) : 0,
              internalNotes: data.internalNotes || null,
              locale: data.locale || 'no',
              manageToken: crypto.randomBytes(32).toString('hex'),
            }
          });
          return NextResponse.json({ id: resetBooking.id }, { status: 201 });
        }
      } else if (existing.status.toLowerCase() === 'pending') {
        // If pending for more than 15 mins, or if it is the same customer retrying, allow overwriting/updating
        // (unless Vipps actually captured money on it in the meantime).
        const now = Date.now();
        const createdMs = new Date(existing.createdAt).getTime();
        const isSameCustomer = Boolean(
          (data.email && existing.email && data.email.toLowerCase().trim() === existing.email.toLowerCase().trim()) ||
          (data.phone && existing.phone && data.phone.replace(/\D/g, '') === existing.phone.replace(/\D/g, ''))
        );

        const capturedReceipt = await prisma.receipt.findFirst({
          where: { bookingId: existing.id, status: 'CAPTURED' },
        });

        if (!capturedReceipt && (isSameCustomer || now - createdMs > 15 * 60 * 1000)) {
          const resetBooking = await prisma.booking.update({
            where: { id: existing.id },
            data: {
              experienceId: data.experienceId,
              players: data.players,
              playerNames: data.playerNames || [],
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              phone: data.phone,
              acceptedTerms: data.acceptedTerms,
              acceptedNewsletter: data.acceptedNewsletter || false,
              paymentType: data.paymentType,
              totalPrice: data.totalPrice,
              amountPaid: 0,
              status: 'pending',
              paymentRef: null,
              cancellationEmailSent: false,
              discountCode: data.discountCode || null,
              giftCardCode: data.giftCardCode || null,
              giftCardAmount: data.giftCardAmount ? Number(data.giftCardAmount) : 0,
              internalNotes: data.internalNotes || null,
              locale: data.locale || 'no',
              manageToken: crypto.randomBytes(32).toString('hex'),
            }
          });
          return NextResponse.json({ id: resetBooking.id }, { status: 201 });
        }

        return NextResponse.json({ error: 'Time slot is already booked.' }, { status: 409 });
      } else {
        return NextResponse.json({ error: 'Time slot is already booked.' }, { status: 409 });
      }
    }

    // Public booking creation ALWAYS starts as `pending` with `amountPaid: 0`.
    // `amountPaid` is ONLY updated after verified Vipps capture (or terminal payment in arena).
    const booking = await prisma.booking.create({
      data: {
        experienceId: data.experienceId,
        date: data.date,
        time: data.time,
        players: data.players,
        playerNames: data.playerNames || [],
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        acceptedTerms: data.acceptedTerms,
        acceptedNewsletter: data.acceptedNewsletter || false,
        paymentType: data.paymentType,
        totalPrice: data.totalPrice,
        amountPaid: 0,
        status: 'pending',
        discountCode: data.discountCode || null,
        giftCardCode: data.giftCardCode || null,
        giftCardAmount: data.giftCardAmount ? Number(data.giftCardAmount) : 0,
        internalNotes: data.internalNotes || null,
        locale: data.locale || 'no',
        manageToken: crypto.randomBytes(32).toString('hex'),
      }
    });

    // Auto-sync kontakt til Resend (Audience + Segment)
    if (booking.email && booking.email !== 'ingen@epost.no') {
      const { addContactToNewsletter } = await import('@/lib/email');
      addContactToNewsletter(booking.email, booking.firstName, booking.lastName).catch((err) =>
        console.error("Auto-sync contact to Resend failed in booking creation:", err)
      );
    }

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
        duration: true,
        status: true,
        createdAt: true,
        experienceId: true,
      }
    });

    return NextResponse.json(bookings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}
