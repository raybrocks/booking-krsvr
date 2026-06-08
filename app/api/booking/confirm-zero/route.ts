import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { bookingId } = await req.json();

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { experience: true }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.amountPaid > 0) {
      return NextResponse.json({ error: 'Amount is not zero' }, { status: 400 });
    }

    // Mark as confirmed
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'confirmed' },
      include: { experience: true }
    });

    // Increment discount usage
    if (booking.discountCode) {
       try {
          await prisma.discountCode.update({
             where: { code: booking.discountCode },
             data: { usageCount: { increment: 1 } }
          });
       } catch (e) {
          console.error("Failed to increment discount code:", e);
       }
    }

    // Send confirmation email
    try {
      const settingsDoc = await prisma.setting.findUnique({ where: { key: 'general' } });
      const generalSettings = settingsDoc?.value || { email: 'booking@krsvr.no', phone: '+47 000 00 000' };
      
      const experienceData = updatedBooking.experience || {
         name: 'Valgt VR Opplevelse', 
         picture: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d',
         age: 'Alle',
         duration: '1 time'
      };
      
      await sendEmail(
        updatedBooking.email, 
        updatedBooking, 
        experienceData, 
        generalSettings as any
      );
    } catch (e) {
       console.error("Failed to send zero confirmation email:", e);
    }

    return NextResponse.json({ success: true, booking: updatedBooking });
  } catch (error) {
    console.error('Zero confirm error:', error);
    return NextResponse.json({ error: 'Failed to confirm zero amount' }, { status: 500 });
  }
}
