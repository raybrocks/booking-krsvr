import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const discountCodes = await prisma.discountCode.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(discountCodes);
  } catch (error) {
    console.error("Failed to fetch discount codes", error);
    return NextResponse.json({ error: 'Failed to fetch discount codes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Default values mapping
    const newCode = await prisma.discountCode.create({
      data: {
        code: data.code.toUpperCase(),
        discount: parseFloat(data.discount),
        type: data.type || 'percentage',
        active: data.active !== undefined ? data.active : true,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        usageLimit: data.usageLimit ? parseInt(data.usageLimit) : null,
      }
    });
    return NextResponse.json(newCode);
  } catch (error: any) {
    console.error("Failed to create discount code", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Discount code already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create discount code' }, { status: 500 });
  }
}
