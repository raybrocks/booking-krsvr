import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
    try {
        const { bookingId } = await req.json();
        if (!bookingId) {
            return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 });
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

        // Release/Cancel a reserved payment (Void)
        const cancelResponse = await fetch(`${baseUrl}/epayment/v1/payments/${bookingId}/cancel`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenData.access_token}`,
                'Ocp-Apim-Subscription-Key': subscriptionKey,
                'Merchant-Serial-Number': merchantSerialNumber,
                'Idempotency-Key': `cancel-${bookingId}-${Date.now()}`
            }
        });

        if (!cancelResponse.ok) {
            const errText = await cancelResponse.text();
            return NextResponse.json({ error: errText }, { status: cancelResponse.status });
        }

        try {
            await adminDb.collection('bookings').doc(bookingId).update({
                vippsStatus: 'CANCELLED',
                status: 'cancelled',
                vippsUpdatedAt: new Date().toISOString()
            });
        } catch (dbErr) {
            console.error('Failed to update DB on cancel:', dbErr);
        }

        return NextResponse.json({ success: true, message: 'Reservation cancelled successfully.' });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
