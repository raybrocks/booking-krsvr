import { NextResponse } from 'next/server';

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
                    'Idempotency-Key': `capture-manual-${tx.bookingId}`
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
            } else {
                errors.push({ id: tx.bookingId, error: await captureResponse.text() });
            }
        }

        return NextResponse.json({ success: true, captured, errors });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
