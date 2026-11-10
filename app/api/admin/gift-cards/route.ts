import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateGiftCardCode } from '@/lib/giftcard';
import { calculateTotalPriceForPersons } from '@/lib/pricing';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get('search')?.trim().toLowerCase();
    const status = searchParams.get('status')?.trim().toLowerCase();

    const where: any = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { buyerName: { contains: search, mode: 'insensitive' } },
        { buyerEmail: { contains: search, mode: 'insensitive' } },
        { recipientName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const giftCards = await prisma.giftCard.findMany({
      where,
      include: {
        redemptions: {
          orderBy: { createdAt: 'desc' },
          include: { booking: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(giftCards);
  } catch (error: any) {
    console.error('Admin fetch gift cards error:', error);
    return NextResponse.json({ error: 'Kunne ikke hente gavekort' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      targetPersons = 2,
      customAmount,
      buyerName,
      buyerEmail,
      buyerPhone,
      recipientName,
      senderName,
      greetingMessage,
      paymentType = 'manual',
      note,
    } = body;

    if (!buyerName || !buyerName.trim()) {
      return NextResponse.json({ error: 'Navn på mottaker/kjøper er påkrevd' }, { status: 400 });
    }

    const persons = parseInt(targetPersons, 10) || 2;
    const amount = customAmount ? parseFloat(customAmount) : calculateTotalPriceForPersons(persons);

    if (amount <= 0) {
      return NextResponse.json({ error: 'Beløp må være større enn 0' }, { status: 400 });
    }

    const code = generateGiftCardCode();
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const giftCard = await prisma.giftCard.create({
      data: {
        code,
        targetPersons: persons,
        initialAmount: amount,
        balance: amount,
        currency: 'NOK',
        status: 'active',
        isPaid: true,
        paidAt: new Date(),
        expiresAt,
        buyerName: buyerName.trim(),
        buyerEmail: buyerEmail ? buyerEmail.trim().toLowerCase() : 'post@krsvr.no',
        buyerPhone: buyerPhone ? buyerPhone.trim() : null,
        recipientName: recipientName ? recipientName.trim() : null,
        senderName: senderName ? senderName.trim() : null,
        greetingMessage: greetingMessage ? greetingMessage.trim() : (note ? `Manuelt opprettet: ${note}` : null),
        paymentType,
      },
      include: {
        redemptions: true,
      },
    });

    // Send e-post hvis en ekte e-post ble oppgitt
    if (buyerEmail && buyerEmail.includes('@') && buyerEmail !== 'post@krsvr.no') {
      try {
        const { sendGiftCardCustomerEmail } = await import('@/lib/email');
        await sendGiftCardCustomerEmail(buyerEmail.trim().toLowerCase(), giftCard);
      } catch (mailErr) {
        console.error('Failed to send email for manual gift card:', mailErr);
      }
    }

    return NextResponse.json(giftCard);
  } catch (error: any) {
    console.error('Admin create gift card error:', error);
    return NextResponse.json({ error: error?.message || 'Kunne ikke opprette gavekort' }, { status: 500 });
  }
}
