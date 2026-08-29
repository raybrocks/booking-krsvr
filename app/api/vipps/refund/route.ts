import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendRefundReceiptEmail } from '@/lib/email';

export async function POST(req: Request) {
    try {
        const { bookingId, amount } = await req.json();
        
        if (!bookingId || amount === undefined || amount === null) {
            return NextResponse.json({ error: 'Missing bookingId or amount' }, { status: 400 });
        }

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId }
        });

        if (!booking) {
            return NextResponse.json({ error: 'Booking ikke funnet' }, { status: 404 });
        }

        // Normalize amount: if sent as > 10000 and booking amountPaid is small, it might be in øre.
        // If amount <= 10000, treat as NOK.
        let refundAmountNok: number;
        let refundAmountOre: number;

        if (amount > 10000 && booking.amountPaid && amount > (booking.amountPaid * 10)) {
            refundAmountOre = Math.round(amount);
            refundAmountNok = refundAmountOre / 100;
        } else {
            refundAmountNok = Number(amount);
            refundAmountOre = Math.round(refundAmountNok * 100);
        }

        if (refundAmountNok <= 0) {
            return NextResponse.json({ error: 'Ugyldig refusjonsbeløp' }, { status: 400 });
        }

        const isTest = process.env.VIPPS_ENV !== 'production';
        const baseUrl = isTest ? 'https://apitest.vipps.no' : 'https://api.vipps.no';
        const clientId = process.env.VIPPS_CLIENT_ID;
        const clientSecret = process.env.VIPPS_CLIENT_SECRET;
        const subscriptionKey = process.env.VIPPS_SUBSCRIPTION_KEY;
        const merchantSerialNumber = process.env.VIPPS_MERCHANT_SERIAL_NUMBER;

        if (!clientId || !clientSecret || !subscriptionKey || !merchantSerialNumber) {
            return NextResponse.json({ error: 'Vipps credentials mangler i miljøvariablene' }, { status: 500 });
        }

        // 1. Fetch Vipps Access Token
        const tokenResponse = await fetch(`${baseUrl}/accessToken/get`, {
            method: 'POST',
            headers: {
                'client_id': clientId,
                'client_secret': clientSecret,
                'Ocp-Apim-Subscription-Key': subscriptionKey,
            },
        });

        if (!tokenResponse.ok) {
            const tokenErr = await tokenResponse.text();
            console.error('Vipps Token Error on Refund:', tokenErr);
            return NextResponse.json({ error: 'Kunne ikke autentisere med Vipps', details: tokenErr }, { status: 500 });
        }

        const tokenData = await tokenResponse.json();
        const vippsRef = booking.paymentRef || booking.id;
        const idempotencyKey = `ref-${booking.id.slice(0, 16)}-${Date.now()}`.slice(0, 50);

        // 2. Execute Refund on Vipps ePayment API
        const refundResponse = await fetch(`${baseUrl}/epayment/v1/payments/${vippsRef}/refund`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenData.access_token}`,
                'Ocp-Apim-Subscription-Key': subscriptionKey,
                'Merchant-Serial-Number': merchantSerialNumber,
                'Idempotency-Key': idempotencyKey
            },
            body: JSON.stringify({
                modificationAmount: {
                    currency: 'NOK',
                    value: refundAmountOre
                }
            })
        });

        if (!refundResponse.ok) {
            const errText = await refundResponse.text();
            console.error('Vipps Refund Error:', errText);
            return NextResponse.json({ error: `Vipps feilet: ${errText}` }, { status: refundResponse.status });
        }

        // 3. Create Refund Receipt (Kreditnota) in DB
        let createdReceipt: any = null;
        try {
            createdReceipt = await prisma.receipt.create({
                data: {
                    bookingId: booking.id,
                    amount: -refundAmountNok,
                    status: 'REFUNDED',
                    paymentRef: vippsRef,
                    type: 'refund'
                }
            });

            const newAmountPaid = Math.max(0, (booking.amountPaid || 0) - refundAmountNok);
            await prisma.booking.update({
                where: { id: booking.id },
                data: { 
                    amountPaid: newAmountPaid,
                    status: newAmountPaid === 0 ? 'cancelled' : booking.status 
                }
            });
        } catch (dbErr) {
            console.error('Failed to update DB on refund:', dbErr);
        }

        // 4. Send Refund Receipt Email via Resend to customer
        if (booking.email && createdReceipt) {
            try {
                await sendRefundReceiptEmail(booking.email, {
                    booking,
                    refundAmount: refundAmountNok,
                    receiptId: createdReceipt.id
                });
            } catch (emailErr) {
                console.error('Failed to send refund receipt email:', emailErr);
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: `Refusjon på ${refundAmountNok} NOK er fullført via Vipps, og kvittering er sendt til ${booking.email || 'kunden'}.`,
            receipt: createdReceipt
        });
    } catch (e: any) {
        console.error('Refund route exception:', e);
        return NextResponse.json({ error: e.message || 'Ukjent feil ved refusjon' }, { status: 500 });
    }
}
