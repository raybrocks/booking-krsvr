import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const limit = searchParams.get('limit');

    const [receipts, bookings] = await Promise.all([
      prisma.receipt.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit ? parseInt(limit, 10) : undefined
      }),
      prisma.booking.findMany({
        include: { experience: true }
      })
    ]);

    const bookingMap = new Map<string, any>();
    bookings.forEach(b => {
      bookingMap.set(b.id, b);
      if (b.paymentRef) {
        bookingMap.set(b.paymentRef, b);
      }
    });

    const enrichedReceipts = receipts.map(r => {
      const b = bookingMap.get(r.bookingId) || (r.paymentRef ? bookingMap.get(r.paymentRef) : null);
      return {
        id: r.id,
        receiptId: r.id,
        bookingId: r.bookingId,
        paymentRef: r.paymentRef,
        amount: r.amount,
        currency: r.currency || 'NOK',
        status: r.status,
        type: r.type || (r.amount < 0 ? 'refund' : 'payment'),
        createdAt: r.createdAt,
        booking: b || null,
        firstName: b?.firstName || 'Kunde',
        lastName: b?.lastName || '',
        email: b?.email || '',
        phone: b?.phone || '',
        experienceId: b?.experienceId || '',
        experienceName: b?.experience?.name || 'VR Opplevelse',
        totalPrice: b?.totalPrice || Math.abs(r.amount),
        amountPaid: b?.amountPaid || 0,
        paymentType: b?.paymentType || 'vipps',
        date: b?.date || '',
        time: b?.time || ''
      };
    });

    return NextResponse.json(enrichedReceipts);
  } catch (error) {
    console.error("Failed to fetch receipts", error);
    return NextResponse.json({ error: 'Failed to fetch receipts' }, { status: 500 });
  }
}
