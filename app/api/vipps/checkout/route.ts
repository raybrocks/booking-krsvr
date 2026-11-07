import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { getVippsConfig, getVippsAccessToken } from '@/lib/vipps';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bookingId, amount, description, phone, locale } = body;

    if (!bookingId || !amount || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.status === 'confirmed' && (booking.amountPaid || 0) > 0) {
      return NextResponse.json({ error: 'Booking is already paid and confirmed' }, { status: 409 });
    }

    let config;
    try {
      config = getVippsConfig();
    } catch {
      console.error('Missing Vipps credentials in environment variables');
      return NextResponse.json({ error: 'Payment gateway configuration error' }, { status: 500 });
    }

    const { baseUrl, clientId, clientSecret, subscriptionKey, merchantSerialNumber } = config;

    const protocol = req.headers.get('x-forwarded-proto') || 'https';
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');

    let appBaseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || (host ? `${protocol}://${host}` : 'https://www.krsvr.no');

    // Standardiser til https://www.krsvr.no for å unngå 307-redirects
    appBaseUrl = appBaseUrl.replace(/\/$/, '');
    if (appBaseUrl === 'https://krsvr.no' || appBaseUrl === 'http://krsvr.no') {
      appBaseUrl = 'https://www.krsvr.no';
    }
    if (appBaseUrl.startsWith('http://')) {
      appBaseUrl = appBaseUrl.replace('http://', 'https://');
    }
    if (appBaseUrl.includes('localhost')) {
      appBaseUrl = 'https://www.krsvr.no';
    }

    let accessToken: string;
    try {
      accessToken = await getVippsAccessToken();
    } catch (err: any) {
      console.error('Vipps Token Error:', err?.message || err);
      return NextResponse.json(
        { error: 'Failed to authenticate with payment gateway' },
        { status: 500 }
      );
    }

    // Generate a unique Vipps reference per payment attempt so retries on an expired/aborted
    // booking slot never collide with a previous Vipps reference.
    const [priorReceiptsCount, priorWebhooksCount] = await Promise.all([
      prisma.receipt.count({ where: { OR: [{ bookingId }, { paymentRef: bookingId }] } }),
      prisma.webhookLog.count({ where: { reference: bookingId } }),
    ]);

    const hasPriorVippsAttempt =
      Boolean(booking.paymentRef) || priorReceiptsCount > 0 || priorWebhooksCount > 0;

    const vippsReference = hasPriorVippsAttempt
      ? `${bookingId}-${crypto.randomBytes(2).toString('hex')}`.slice(0, 50)
      : bookingId;

    // Persist the active Vipps reference and keep amountPaid = 0 until capture is verified
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentRef: vippsReference,
        amountPaid: 0,
      },
    });

    // Formater telefonnummer for Vipps (MSISDN: 47xxxxxxxx)
    let customerObj: { phoneNumber: string } | undefined = undefined;
    if (phone) {
      const cleanPhone = String(phone).replace(/\D/g, '');
      let msisdn = '';
      if (cleanPhone.length === 8) {
        msisdn = `47${cleanPhone}`;
      } else if (cleanPhone.startsWith('47') && cleanPhone.length === 10) {
        msisdn = cleanPhone;
      } else if (cleanPhone.length > 8) {
        msisdn = cleanPhone;
      }
      if (msisdn && /^\d{8,15}$/.test(msisdn)) {
        customerObj = { phoneNumber: msisdn };
      }
    }

    // Vipps expects amount in øre (1 NOK = 100 øre)
    const amountInOre = Math.round(Number(amount) * 100);
    const langSuffix = locale === 'en' || booking.locale === 'en' ? '&lang=en' : '';

    const epaymentResponse = await fetch(`${baseUrl}/epayment/v1/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        client_id: clientId,
        client_secret: clientSecret,
        'Ocp-Apim-Subscription-Key': subscriptionKey,
        'Merchant-Serial-Number': merchantSerialNumber,
        Authorization: `Bearer ${accessToken}`,
        'Idempotency-Key': vippsReference,
        'Vipps-System-Name': 'KrsVRArena',
        'Vipps-System-Version': '1.0.0',
        'Vipps-System-Plugin-Name': 'KrsVRArena-Checkout',
        'Vipps-System-Plugin-Version': '1.0.0',
      },
      body: JSON.stringify({
        amount: {
          currency: 'NOK',
          value: amountInOre,
        },
        paymentMethod: {
          type: 'WALLET',
        },
        ...(customerObj ? { customer: customerObj } : {}),
        reference: vippsReference,
        userFlow: 'WEB_REDIRECT',
        returnUrl: `${appBaseUrl}/checkout/return?reference=${bookingId}${langSuffix}`,
        paymentDescription: description || `VR Booking - ${bookingId}`,
      }),
    });

    if (!epaymentResponse.ok) {
      const errorText = await epaymentResponse.text();
      console.error('Vipps create payment error:', errorText);
      return NextResponse.json(
        { error: 'Failed to create payment session', details: errorText },
        { status: 500 }
      );
    }

    const paymentData = await epaymentResponse.json();

    return NextResponse.json({
      checkoutUrl: paymentData.redirectUrl,
      token: paymentData.reference,
    });
  } catch (error) {
    console.error('Vipps API Route Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
