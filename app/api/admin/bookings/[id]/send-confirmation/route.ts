import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendBookingConfirmationEmail } from '@/lib/email';

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

    let customText = "";
    let isUpdate = false;
    try {
      const body = await req.json();
      if (body?.customText) customText = body.customText;
      if (body?.isUpdate !== undefined) isUpdate = !!body.isUpdate;
    } catch {
      // Body is optional
    }

    const result = await sendBookingConfirmationEmail(
      booking.email,
      booking,
      customText,
      { isUpdate }
    );

    if (!result) {
      return NextResponse.json({ error: 'Kunne ikke sende e-post. Kontroller at Resend er konfigurert.' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Bestillingsbekreftelse sendt til ${booking.email}` 
    });
  } catch (error) {
    console.error("Error resending confirmation email:", error);
    return NextResponse.json({ error: 'Kunne ikke sende bekreftelse på e-post' }, { status: 500 });
  }
}
