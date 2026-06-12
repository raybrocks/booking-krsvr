import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendBookingCancellationEmail } from '@/lib/email';

export async function POST(req: Request) {
    try {
        const { bookingId, amount } = await req.json();
        
        if (!bookingId || !amount) {
            return NextResponse.json({ error: 'Missing bookingId or amount' }, { status: 400 });
        }

        const isTest = process.env.VIPPS_ENV !== 'production';
        const baseUrl = isTest ? 'https://apitest.vipps.no' : 'https://api.vipps.no';
        const clientId = process.env.VIPPS_CLIENT_ID;
        const clientSecret = process.env.VIPPS_CLIENT_SECRET;
        const subscriptionKey = process.env.VIPPS_SUBSCRIPTION_KEY;
        const merchantSerialNumber = process.env.VIPPS_MERCHANT_SERIAL_NUMBER;

        if (!clientId || !clientSecret || !subscriptionKey || !merchantSerialNumber) {
            return NextResponse.json({ error: 'Missing Vipps credentials' }, { status: 500 });
        }

        const tokenResponse = await fetch(`${baseUrl}/accessToken/get`, {
            method: 'POST',
            headers: {
                'client_id': clientId,
                'client_secret': clientSecret,
                'Ocp-Apim-Subscription-Key': subscriptionKey,
            },
        });
        const tokenData = await tokenResponse.json();

        // Refund captured payment
        const refundResponse = await fetch(`${baseUrl}/epayment/v1/payments/${bookingId}/refund`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenData.access_token}`,
                'Ocp-Apim-Subscription-Key': subscriptionKey,
                'Merchant-Serial-Number': merchantSerialNumber,
                'Idempotency-Key': `refund-${bookingId}-${Date.now()}`
            },
            body: JSON.stringify({
                modificationAmount: {
                    currency: 'NOK',
                    value: amount // already expecting value in ore
                }
            })
        });

        if (!refundResponse.ok) {
            const errText = await refundResponse.text();
            return NextResponse.json({ error: errText }, { status: refundResponse.status });
        }

        try {
            await prisma.booking.update({
                where: { id: bookingId },
                data: { status: 'cancelled' }
            });
            
            await prisma.receipt.create({
                data: {
                    bookingId,
                    amount: -(amount / 100),
                    status: 'REFUNDED',
                    paymentRef: bookingId,
                    type: 'refund'
                }
            });
            
            const bookingForEmail = await prisma.booking.findUnique({ where: { id: bookingId } });
            if (bookingForEmail) {
               await sendBookingCancellationEmail(bookingForEmail.email, {
                 ...bookingForEmail,
                 amountPaid: amount / 100
               });
            }
        } catch (dbErr) {
            console.error('Failed to update DB on refund:', dbErr);
        }

        return NextResponse.json({ success: true, message: 'Refunded successfully.' });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
