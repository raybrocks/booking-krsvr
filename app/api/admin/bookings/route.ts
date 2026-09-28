import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const [bookings, receipts] = await Promise.all([
      prisma.booking.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          experience: {
            select: { name: true }
          }
        }
      }),
      prisma.receipt.findMany({
        orderBy: { createdAt: 'desc' }
      })
    ]);

    // Create lookup map for latest receipt per bookingId / paymentRef
    const receiptMap = new Map<string, typeof receipts[0]>();
    receipts.forEach((r) => {
      if (r.bookingId && !receiptMap.has(r.bookingId)) {
        receiptMap.set(r.bookingId, r);
      }
      if (r.paymentRef && !receiptMap.has(r.paymentRef)) {
        receiptMap.set(r.paymentRef, r);
      }
    });

    // Formatting for frontend compatibility
    const formattedBookings = bookings.map(b => {
      const receipt = receiptMap.get(b.id) || (b.paymentRef ? receiptMap.get(b.paymentRef) : null);
      
      let vippsStatus: string | null = null;
      let vippsAmount: number = 0;

      if (receipt) {
        vippsStatus = receipt.status;
        vippsAmount = Math.round(receipt.amount * 100);
      } else if (['reservation', 'full', 'vipps'].includes(b.paymentType)) {
        if (b.amountPaid > 0 || b.status === 'confirmed') {
          vippsStatus = 'CAPTURED';
          vippsAmount = Math.round((b.amountPaid || 0) * 100);
        } else if (b.status === 'pending') {
          vippsStatus = 'VENTER_PAA_BETALING';
          vippsAmount = 0;
        }
      } else if (['manual', 'system'].includes(b.paymentType) || b.amountPaid === 0) {
        vippsStatus = 'MANUELL';
        vippsAmount = 0;
      }

      return {
        ...b,
        experienceName: b.experience?.name || b.experienceId,
        vippsStatus,
        vippsAmount,
      };
    });

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
        experienceId_date_time: {
          experienceId: data.experienceId,
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
               experienceId_date_time: {
                 experienceId: data.experienceId,
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
        playerNames: data.playerNames || [],
        email: data.email || 'ingen@epost.no',
        phone: data.phone || '',
        acceptedTerms: true,
        acceptedNewsletter: data.subscribeNewsletter || false,
        paymentType: data.paymentType || 'manual',
        totalPrice: data.totalPrice || 0,
        amountPaid: data.amountPaid || 0,
        status: data.status || 'confirmed',
        discountCode: null,
        bookingType: data.bookingType || 'private',
        companyName: data.companyName,
        internalNotes: data.internalNotes,
        duration: data.duration || 90,
        manageToken: crypto.randomBytes(32).toString('hex'),
      }
    });

    // 3. Create shadow bookings if they are blocking additional timeslots
    if (data.shadowTimes && data.shadowTimes.length > 0) {
        for (const shadowTime of data.shadowTimes) {
           // delete if there's a cancelled one blocking
           const shadowExisting = await prisma.booking.findUnique({
              where: {
                experienceId_date_time: {
                  experienceId: data.experienceId,
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

    // 4. Send Confirmation Email if requested
    if (data.sendConfirmation && booking.email && booking.email !== 'ingen@epost.no') {
       const { sendBookingConfirmationEmail } = await import('@/lib/email');
       const customText = data.customEmailText || "";
       await sendBookingConfirmationEmail(booking.email, booking, customText);
    }

    // 5. Alltid synkroniser kunde til Resend (Audience + Segment 415f5f22-314b-4144-96da-88b71d84e379)
    if (booking.email && booking.email !== 'ingen@epost.no') {
       const { addContactToNewsletter } = await import('@/lib/email');
       await addContactToNewsletter(booking.email, booking.firstName, booking.lastName).catch((err) =>
         console.error("Failed to sync contact to Resend in admin booking creation:", err)
       );
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

