import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendReviewRequestEmail } from '@/lib/email';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { experience: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Finner ikke booking' }, { status: 404 });
    }

    if (!booking.email || booking.email.includes('system@sperret')) {
      return NextResponse.json({ error: 'Bookingen har ingen gyldig e-postadresse' }, { status: 400 });
    }

    let platform: 'tripadvisor' | 'google' | 'both' = 'both';
    let language: 'no' | 'en' = 'no';

    try {
      const body = await req.json();
      if (body?.platform && ['tripadvisor', 'google', 'both'].includes(body.platform)) {
        platform = body.platform;
      }
      if (body?.language && ['no', 'en'].includes(body.language)) {
        language = body.language;
      }
    } catch {
      // Body is optional, defaults to 'both' and 'no'
    }

    const result = await sendReviewRequestEmail(
      booking.email,
      {
        firstName: booking.firstName,
        lastName: booking.lastName,
        date: booking.date,
      },
      {
        platform,
        language,
      }
    );

    if (!result) {
      return NextResponse.json({ error: 'Kunne ikke sende e-post. Kontroller at Resend er konfigurert.' }, { status: 500 });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        reviewEmailSentAt: new Date(),
        reviewEmailType: platform,
      },
      include: { experience: true },
    });

    const platformLabel = platform === 'tripadvisor' ? 'TripAdvisor' : platform === 'google' ? 'Google Reviews' : 'TripAdvisor og Google';

    return NextResponse.json({
      success: true,
      message: `Forespørsel om omtale sendt til ${booking.email}. Kvittering og kopi er sendt til post@krsvr.no.`,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Error sending review request email:", error);
    return NextResponse.json({ error: 'Kunne ikke sende forespørsel om omtale' }, { status: 500 });
  }
}
