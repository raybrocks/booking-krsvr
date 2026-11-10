import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getVippsAccessToken, ensureVippsCaptured } from '@/lib/vipps';
import { confirmPaidGiftCardAtomically } from '@/lib/giftcard';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const ref = searchParams.get('ref');

    if (!ref) {
      return NextResponse.json({ error: 'Mangler referanse' }, { status: 400 });
    }

    const giftCard = await prisma.giftCard.findFirst({
      where: {
        OR: [{ id: ref }, { paymentRef: ref }, { paymentRef: `GC-${ref}` }],
      },
    });

    if (!giftCard) {
      return NextResponse.json({ error: 'Gavekort ikke funnet' }, { status: 404 });
    }

    // Hvis allerede aktivert og betalt
    if (giftCard.status === 'active' && giftCard.isPaid) {
      return NextResponse.json({
        success: true,
        alreadyConfirmed: true,
        giftCard,
      });
    }

    const vippsRef = giftCard.paymentRef || `GC-${giftCard.id}`;
    const accessToken = await getVippsAccessToken();
    const summary = await ensureVippsCaptured(vippsRef, accessToken);

    if (summary.capturedOre > 0) {
      const confirmedCard = await confirmPaidGiftCardAtomically({
        giftCardId: giftCard.id,
        vippsRef,
        capturedOre: summary.capturedOre,
      });

      return NextResponse.json({
        success: true,
        giftCard: confirmedCard,
      });
    }

    return NextResponse.json(
      {
        success: false,
        status: summary.normalizedStatus,
        error: `Betalingen kunne ikke bekreftes. Vipps-status er: ${summary.normalizedStatus}`,
        giftCard,
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Gift card verify error:', error);
    return NextResponse.json({ error: error?.message || 'Intern serverfeil' }, { status: 500 });
  }
}
