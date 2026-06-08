import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const limit = searchParams.get('limit');

    const receipts = await prisma.receipt.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit, 10) : undefined
    });

    return NextResponse.json(receipts);
  } catch (error) {
    console.error("Failed to fetch receipts", error);
    return NextResponse.json({ error: 'Failed to fetch receipts' }, { status: 500 });
  }
}
