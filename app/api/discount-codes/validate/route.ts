import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'Rabattkode mangler' }, { status: 400 });
    }

    const discountCode = await prisma.discountCode.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!discountCode) {
      return NextResponse.json({ error: 'Ugyldig rabattkode' }, { status: 404 });
    }

    if (!discountCode.active) {
      return NextResponse.json({ error: 'Rabattkoden er ikke lenger aktiv' }, { status: 400 });
    }

    if (discountCode.expiresAt && new Date(discountCode.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Rabattkoden har utløpt' }, { status: 400 });
    }

    if (discountCode.usageLimit && discountCode.usageCount >= discountCode.usageLimit) {
      return NextResponse.json({ error: 'Rabattkoden er brukt opp' }, { status: 400 });
    }

    // Return the safe data to the client
    return NextResponse.json({
      code: discountCode.code,
      discount: discountCode.discount,
      type: discountCode.type, // "percentage" or "fixed"
    });

  } catch (error) {
    console.error("Failed to validate discount code", error);
    return NextResponse.json({ error: 'Kunne ikke validere rabattkode' }, { status: 500 });
  }
}
