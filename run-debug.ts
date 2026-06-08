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

  for (const booking of bookings) {
    console.log(`Booking ID: ${booking.id}`);
    console.log(`Status: ${booking.status}, Paid: ${booking.amountPaid}, Ref: ${booking.paymentRef}`);

    // Try fetching from Vipps
    const tokenResponse = await fetch(`${process.env.VIPPS_URL}/accessToken/get`, {
      method: 'POST',
      headers: {
        'client_id': process.env.VIPPS_CLIENT_ID || '',
        'client_secret': process.env.VIPPS_CLIENT_SECRET || '',
        'Ocp-Apim-Subscription-Key': process.env.VIPPS_SUBSCRIPTION_KEY || ''
      }
    });

    if (tokenResponse.ok) {
        const tokenInfo = await tokenResponse.json();
        const globalAccessToken = tokenInfo.access_token;
        const paymentRes = await fetch(`${process.env.VIPPS_URL}/epayment/v1/payments/${booking.id}`, {
            headers: {
                'Authorization': `Bearer ${globalAccessToken}`,
                'Ocp-Apim-Subscription-Key': process.env.VIPPS_SUBSCRIPTION_KEY || '',
                'Merchant-Serial-Number': process.env.VIPPS_MERCHANT_SERIAL_NUMBER || ''
            }
        });
        if (paymentRes.ok) {
            const data = await paymentRes.json();
            console.log('Vipps Data:', JSON.stringify(data, null, 2));
        } else {
            console.log('Vipps API Error:', await paymentRes.text());
        }
    } else {
        console.log('Token error:', await tokenResponse.text(), process.env.VIPPS_URL);
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
