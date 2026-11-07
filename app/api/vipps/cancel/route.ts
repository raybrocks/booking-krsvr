import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getVippsConfig, getVippsAccessToken, fetchVippsPayment } from '@/lib/vipps';

export async function POST(req: Request) {
  try {
    const { bookingId } = await req.json();
    if (!bookingId) {
      return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking ikke funnet' }, { status: 404 });
    }

    const { baseUrl, subscriptionKey, merchantSerialNumber } = getVippsConfig();
    const accessToken = await getVippsAccessToken();
    const vippsRef = booking.paymentRef || booking.id;

    // Check current Vipps state first — cannot cancel an already captured payment (must use refund)
    const summary = await fetchVippsPayment(vippsRef, accessToken);
    if (summary.capturedOre > 0 && summary.netCapturedOre > 0) {
      return NextResponse.json(
        { error: 'Betalingen er allerede trukket (captured) på Vipps. Bruk «Refunder (Vipps)» i stedet.' },
        { status: 400 }
      );
    }

    if (summary.normalizedStatus === 'AUTHORIZED') {
      const cancelResponse = await fetch(
        `${baseUrl}/epayment/v1/payments/${encodeURIComponent(vippsRef)}/cancel`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
            'Ocp-Apim-Subscription-Key': subscriptionKey,
            'Merchant-Serial-Number': merchantSerialNumber,
            'Idempotency-Key': `cancel-${vippsRef}-${Date.now()}`.slice(0, 50),
          },
        }
      );

      if (!cancelResponse.ok) {
        const errText = await cancelResponse.text();
        return NextResponse.json({ error: errText }, { status: cancelResponse.status });
      }
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'cancelled', amountPaid: 0 },
    });

    // Log cancellation event to WebhookLog (never to Receipt, as no money was captured/refunded)
    await prisma.webhookLog
      .create({
        data: {
          reference: vippsRef,
          event: 'ADMIN_CANCEL_RESERVATION',
          payload: { bookingId, vippsRef, cancelledAt: new Date().toISOString() },
        },
      })
      .catch(() => {});

    return NextResponse.json({ success: true, message: 'Reservasjon frigitt og kansellert.' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
