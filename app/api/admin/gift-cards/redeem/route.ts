import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redeemGiftCard } from '@/lib/giftcard';

export async function POST(req: NextRequest) {
  try {
    const { code, amount, note } = await req.json();

    const cleanCode = (code || '').trim().toUpperCase();
    const numAmount = parseFloat(amount);

    if (!cleanCode) {
      return NextResponse.json({ error: 'Gavekortkode mangler' }, { status: 400 });
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: 'Ugyldig beløp' }, { status: 400 });
    }

    const card = await prisma.giftCard.findUnique({
      where: { code: cleanCode },
    });

    if (!card) {
      return NextResponse.json({ error: 'Gavekort ikke funnet' }, { status: 404 });
    }

    if (card.status !== 'active') {
      return NextResponse.json({ error: `Gavekortet er ikke aktivt (status: ${card.status})` }, { status: 400 });
    }

    if (new Date(card.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Gavekortet har utløpt' }, { status: 400 });
    }

    if (card.balance < numAmount) {
      return NextResponse.json(
        { error: `Ikke nok saldo på gavekortet. Saldo er kun ${card.balance} kr.` },
        { status: 400 }
      );
    }

    const result = await redeemGiftCard({
      giftCardId: card.id,
      amount: numAmount,
      channel: 'admin_manual',
      note: note ? note.trim() : 'Innløst over disk av spillvert',
    });

    return NextResponse.json({
      success: true,
      card: result.card,
      redemption: result.redemption,
      message: `${numAmount} kr trukket fra gavekort ${card.code}. Ny saldo: ${result.card.balance} kr.`,
    });
  } catch (error: any) {
    console.error('Admin manual redeem error:', error);
    return NextResponse.json({ error: error?.message || 'Kunne ikke innløse gavekort' }, { status: 500 });
  }
}
