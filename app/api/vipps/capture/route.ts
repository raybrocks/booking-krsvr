import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { transactions } = body; // Array of { bookingId, amount }
        
        if (!transactions || transactions.length === 0) {
            return NextResponse.json({ success: true, message: 'No transactions provided.', captured: [] });
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

        const captured = [];
        const errors = [];

        for (const tx of transactions) {
            const captureResponse = await fetch(`${baseUrl}/epayment/v1/payments/${tx.bookingId}/capture`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokenData.access_token}`,
                    'Ocp-Apim-Subscription-Key': subscriptionKey,
                    'Merchant-Serial-Number': merchantSerialNumber,
                    'Idempotency-Key': (`cap-m-${tx.bookingId}-${Date.now()}`).substring(0, 50)
                },
                body: JSON.stringify({
                    modificationAmount: {
                        currency: 'NOK',
                        value: tx.amount
                    }
                })
            });

            if (captureResponse.ok) {
                captured.push(tx.bookingId);
                try {
                    await prisma.booking.update({
                        where: { id: tx.bookingId },
                        data: {
                            status: 'confirmed',
                            amountPaid: tx.amount / 100
                        }
                    });
                    
                    await prisma.receipt.create({
                        data: {
                            bookingId: tx.bookingId,
                            amount: tx.amount / 100,
                            status: 'CAPTURED',
                            paymentRef: tx.bookingId,
                            type: 'payment'
                        }
                    });
                } catch (dbErr) {
                    console.error('Failed to update DB on capture:', dbErr);
                }
            } else {
                errors.push({ id: tx.bookingId, error: await captureResponse.text() });
            }
        }

        return NextResponse.json({ success: true, captured, errors });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
