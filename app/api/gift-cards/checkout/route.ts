import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getVippsConfig, getVippsAccessToken } from '@/lib/vipps';
import { calculateTotalPriceForPersons } from '@/lib/pricing';
import { generateGiftCardCode } from '@/lib/giftcard';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      targetPersons,
      buyerName,
      buyerEmail,
      buyerPhone,
      recipientName,
      senderName,
      greetingMessage,
      locale = 'no',
    } = body;

    const persons = Math.max(1, Math.min(20, parseInt(targetPersons, 10) || 2));
    if (!buyerName || !buyerName.trim()) {
      return NextResponse.json({ error: 'Kjøpers navn er påkrevd' }, { status: 400 });
    }
    if (!buyerEmail || !buyerEmail.includes('@')) {
      return NextResponse.json({ error: 'Ugyldig e-postadresse' }, { status: 400 });
    }

    const totalPrice = calculateTotalPriceForPersons(persons);
    if (totalPrice <= 0) {
      return NextResponse.json({ error: 'Ugyldig beløp' }, { status: 400 });
    }

    // 12 måneder hard gyldighetstid fra i dag
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const code = generateGiftCardCode();

    const giftCard = await prisma.giftCard.create({
      data: {
        code,
        targetPersons: persons,
        initialAmount: totalPrice,
        balance: totalPrice,
        currency: 'NOK',
        status: 'pending_payment',
        expiresAt,
        buyerName: buyerName.trim(),
        buyerEmail: buyerEmail.trim().toLowerCase(),
        buyerPhone: buyerPhone ? buyerPhone.trim() : null,
        recipientName: recipientName ? recipientName.trim() : null,
        senderName: senderName ? senderName.trim() : null,
        greetingMessage: greetingMessage ? greetingMessage.trim() : null,
        locale: locale === 'en' ? 'en' : 'no',
      },
    });

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

    const vippsReference = `GC-${giftCard.id}`.slice(0, 50);

    await prisma.giftCard.update({
      where: { id: giftCard.id },
      data: { paymentRef: vippsReference },
    });

    // Formater telefonnummer for Vipps
    let customerObj: { phoneNumber: string } | undefined = undefined;
    if (buyerPhone) {
      const cleanPhone = String(buyerPhone).replace(/\D/g, '');
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

    const amountInOre = Math.round(totalPrice * 100);
    const returnUrl = `${appBaseUrl}/gavekort/kvittering?ref=${giftCard.id}${locale === 'en' ? '&lang=en' : ''}`;

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
        'Vipps-System-Plugin-Name': 'KrsVRArena-GiftCard',
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
        returnUrl,
        paymentDescription: `KRS VR Arena - Gavekort ${persons} pers`,
      }),
    });

    if (!epaymentResponse.ok) {
      const errorText = await epaymentResponse.text();
      console.error('Vipps create gift card payment error:', errorText);
      return NextResponse.json(
        { error: 'Failed to create payment session', details: errorText },
        { status: 500 }
      );
    }

    const paymentData = await epaymentResponse.json();

    return NextResponse.json({
      checkoutUrl: paymentData.redirectUrl,
      token: paymentData.reference,
      giftCardId: giftCard.id,
      code: giftCard.code,
    });
  } catch (error: any) {
    console.error('Gift card checkout error:', error);
    return NextResponse.json({ error: error?.message || 'Intern serverfeil' }, { status: 500 });
  }
}
