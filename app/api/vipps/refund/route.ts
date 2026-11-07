import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendRefundReceiptEmail } from '@/lib/email';
import {
    getVippsConfig,
    getVippsAccessToken,
    fetchVippsPayment,
    recordVippsRefundAtomically,
} from '@/lib/vipps';

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

        if (booking.paymentType === 'terminal' || booking.paymentType === 'manual') {
            return NextResponse.json(
                { error: 'Betalinger gjort i fysisk kasse/terminal skal ikke refunderes via nettbutikkens Vipps-regnskap.' },
                { status: 400 }
            );
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

        const { baseUrl, subscriptionKey, merchantSerialNumber } = getVippsConfig();
        const accessToken = await getVippsAccessToken();

        const vippsRef = booking.paymentRef || booking.id;
        const idempotencyKey = `ref-${booking.id.slice(0, 16)}-${Date.now()}`.slice(0, 50);

        // 1. Execute Refund on Vipps ePayment API
        const refundResponse = await fetch(`${baseUrl}/epayment/v1/payments/${encodeURIComponent(vippsRef)}/refund`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
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

        // 2. Fetch authoritative post-refund state from Vipps & atomically create Credit Note (Receipt)
        let createdReceipt: any = null;
        try {
            const postSummary = await fetchVippsPayment(vippsRef, accessToken);
            const result = await recordVippsRefundAtomically({
                bookingId: booking.id,
                vippsRef,
                capturedOre: postSummary.capturedOre,
                refundedOre: postSummary.refundedOre > 0 ? postSummary.refundedOre : refundAmountOre,
            });
            createdReceipt = result.createdReceipt;
        } catch (dbErr) {
            console.error('Failed to update DB on refund:', dbErr);
        }

        // 3. Send Refund Receipt Email via Resend to customer
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
