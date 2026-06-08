import * as fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const bookings = await prisma.booking.findMany({
    where: { 
      email: 'raymond@brocks.no'
    },
    orderBy: { createdAt: 'desc' },
    take: 2,
  });

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

  if (!tokenResponse.ok) {
     console.log('Failed token', await tokenResponse.text());
     return;
  }

  const tokenInfo = await tokenResponse.json() as any;
  const globalAccessToken = tokenInfo.access_token;

  for (const booking of bookings) {
    console.log(`Booking ID: ${booking.id}, Status: ${booking.status}, Paid: ${booking.amountPaid}`);
    
    // Attempt Capture
    const amountVal = Math.round((booking.amountPaid || 0) * 100);
    const idempKey = `debug-capture-${booking.id}-${Date.now()}`;
    console.log(`Attempting capture for ${amountVal} øre, idempotency: ${idempKey}`);
    
    const captureRes = await fetch(`${baseUrl}/epayment/v1/payments/${booking.id}/capture`, {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${globalAccessToken}`,
         'Ocp-Apim-Subscription-Key': subscriptionKey,
         'Merchant-Serial-Number': merchantSerialNumber,
         'Idempotency-Key': idempKey
       },
       body: JSON.stringify({ modificationAmount: { currency: 'NOK', value: amountVal } })
    });

    if (captureRes.ok) {
       console.log('Capture OK!');
    } else {
       console.log('Capture Error:', captureRes.status, await captureRes.text());
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
