import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendGiftCardCustomerEmail } from '@/lib/email';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const card = await prisma.giftCard.findUnique({
      where: { id },
      include: {
        redemptions: {
          orderBy: { createdAt: 'desc' },
          include: { booking: true },
        },
      },
    });

    if (!card) {
      return NextResponse.json({ error: 'Gavekort ikke funnet' }, { status: 404 });
    }

    return NextResponse.json(card);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { action } = await req.json();

    const card = await prisma.giftCard.findUnique({ where: { id } });
    if (!card) {
      return NextResponse.json({ error: 'Gavekort ikke funnet' }, { status: 404 });
    }

    if (action === 'resend-email') {
      if (!card.buyerEmail || !card.buyerEmail.includes('@')) {
        return NextResponse.json({ error: 'Gavekortet mangler gyldig e-postadresse' }, { status: 400 });
      }

      await sendGiftCardCustomerEmail(card.buyerEmail, card);
      return NextResponse.json({ success: true, message: `Gavekort sendt på nytt til ${card.buyerEmail}` });
    }

    return NextResponse.json({ error: 'Ukjent handling' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const data: Record<string, any> = {};

    if (typeof body.status === 'string') {
      data.status = body.status;
    }

    if (body.paymentType === 'goodwill' || body.paymentType === 'manual') {
      const existing = await prisma.giftCard.findUnique({ where: { id } });
      if (!existing) {
        return NextResponse.json({ error: 'Gavekort ikke funnet' }, { status: 404 });
      }
      if (existing.paymentType === 'vipps') {
        return NextResponse.json(
          { error: 'Kan ikke endre betalingstype på et Vipps-solgt gavekort' },
          { status: 400 }
        );
      }
      data.paymentType = body.paymentType;
    }

    const updated = await prisma.giftCard.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
