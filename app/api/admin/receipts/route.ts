import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const limit = searchParams.get('limit');

    // STRICT ACCOUNTING FILTER:
    // Only return genuine completed Vipps webshop vouchers (`CAPTURED` sales and `REFUNDED` credit notes).
    // Terminal/POS payments are booked in the physical POS register under Kassasystemloven and
    // intermediate webhook states (`CREATED`, `AUTHORIZED`, `EXPIRED`, `ABORTED`, `CANCELLED`)
    // belong exclusively in `WebhookLog`.
    const [receipts, bookings, giftCards] = await Promise.all([
      prisma.receipt.findMany({
        where: {
          status: { in: ['CAPTURED', 'REFUNDED'] },
          type: { in: ['payment', 'refund'] },
          NOT: { paymentRef: { startsWith: 'terminal-' } },
          amount: { not: 0 },
        },
        orderBy: { createdAt: 'desc' },
        take: limit ? parseInt(limit, 10) : undefined
      }),
      prisma.booking.findMany({
        include: { experience: true }
      }),
      prisma.giftCard.findMany()
    ]);

    const bookingMap = new Map<string, any>();
    bookings.forEach(b => {
      bookingMap.set(b.id, b);
      if (b.paymentRef) {
        bookingMap.set(b.paymentRef, b);
      }
    });

    const giftCardMap = new Map<string, any>();
    giftCards.forEach(gc => {
      giftCardMap.set(gc.id, gc);
      if (gc.paymentRef) {
        giftCardMap.set(gc.paymentRef, gc);
      }
    });

    const enrichedReceipts = receipts.map(r => {
      const b = r.bookingId ? (bookingMap.get(r.bookingId) || (r.paymentRef ? bookingMap.get(r.paymentRef) : null)) : null;
      const gc = r.giftCardId ? (giftCardMap.get(r.giftCardId) || (r.paymentRef ? giftCardMap.get(r.paymentRef) : null)) : null;

      const isGiftCard = Boolean(r.orderType === 'gift_card' || r.giftCardId || gc);

      return {
        id: r.id,
        receiptId: r.id,
        bookingId: r.bookingId,
        giftCardId: r.giftCardId,
        orderType: r.orderType || (isGiftCard ? 'gift_card' : 'booking'),
        paymentRef: r.paymentRef,
        amount: r.amount,
        currency: r.currency || 'NOK',
        status: r.status,
        type: r.type || (r.amount < 0 ? 'refund' : 'payment'),
        createdAt: r.createdAt,
        booking: b || null,
        giftCard: gc || null,
        firstName: isGiftCard ? (gc?.buyerName || 'Gavekortkunde') : (b?.firstName || 'Kunde'),
        lastName: isGiftCard ? '' : (b?.lastName || ''),
        companyName: b?.companyName || '',
        email: isGiftCard ? (gc?.buyerEmail || '') : (b?.email || ''),
        phone: isGiftCard ? (gc?.buyerPhone || '') : (b?.phone || ''),
        experienceId: isGiftCard ? 'gift_card' : (b?.experienceId || ''),
        experienceName: isGiftCard ? `Gavekort ${gc?.targetPersons ? `(${gc.targetPersons} pers)` : ''} · Kode: ${gc?.code || ''}` : (b?.experience?.name || 'VR Opplevelse'),
        totalPrice: isGiftCard ? (gc?.initialAmount || Math.abs(r.amount)) : (b?.totalPrice || Math.abs(r.amount)),
        amountPaid: isGiftCard ? Math.abs(r.amount) : (b?.amountPaid || 0),
        paymentType: 'vipps',
        date: isGiftCard ? (gc?.createdAt ? new Date(gc.createdAt).toISOString().split('T')[0] : '') : (b?.date || ''),
        time: isGiftCard ? 'Nettbutikk' : (b?.time || '')
      };
    });

    return NextResponse.json(enrichedReceipts);
  } catch (error) {
    console.error("Failed to fetch receipts", error);
    return NextResponse.json({ error: 'Failed to fetch receipts' }, { status: 500 });
  }
}
