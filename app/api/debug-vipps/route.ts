import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  const baseUrl = 'https://api.vipps.no';
  const clientId = process.env.VIPPS_CLIENT_ID || '';
  const clientSecret = process.env.VIPPS_CLIENT_SECRET || '';
  const subscriptionKey = process.env.VIPPS_SUBSCRIPTION_KEY || '';
  const merchantSerialNumber = process.env.VIPPS_MERCHANT_SERIAL_NUMBER || '';

  const tokenResponse = await fetch(`${baseUrl}/accessToken/get`, {
    method: 'POST',
    headers: {
      'client_id': clientId,
      'client_secret': clientSecret,
      'Ocp-Apim-Subscription-Key': subscriptionKey
    }
  });

  const tokenInfo = await tokenResponse.json() as any;
  const globalAccessToken = tokenInfo.access_token;

  let refs = id ? [id] : [];
  if (!id) {
     const bookings = await prisma.booking.findMany({
        where: { email: 'raymond@brocks.no' },
        orderBy: { createdAt: 'desc' },
        take: 1
     });
     refs = bookings.map(b => b.id);
  }

  const results = [];

  for (const ref of refs) {
     const captureRes = await fetch(`${baseUrl}/epayment/v1/payments/${ref}/capture`, {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${globalAccessToken}`,
         'Ocp-Apim-Subscription-Key': subscriptionKey,
         'Merchant-Serial-Number': merchantSerialNumber,
         'Idempotency-Key': `debug-capture-${ref}-${Date.now()}`
       },
       body: JSON.stringify({ modificationAmount: { currency: 'NOK', value: 200 } })
     });
     
     if (captureRes.ok) {
        results.push({ ref, success: true });
     } else {
        const err = await captureRes.text();
        results.push({ ref, success: false, error: err });
     }
  }

  return NextResponse.json(results);
}
