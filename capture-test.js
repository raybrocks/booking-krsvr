import { db } from './lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

async function capturePending() {
    const q = query(collection(db, 'transactions'), where('status', '==', 'epayment.payment.reserved'));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
        // Let's also check with 'AUTHORIZED'
        const q2 = query(collection(db, 'transactions'), where('status', '==', 'AUTHORIZED'));
        const snap2 = await getDocs(q2);
        if (snap2.empty) {
            console.log("No pending transactions found.");
            return;
        }
        processSnap(snap2);
        return;
    }
    processSnap(snapshot);
}

async function processSnap(snapshot) {
    const isTest = process.env.VIPPS_ENV !== 'production';
    const baseUrl = isTest ? 'https://apitest.vipps.no' : 'https://api.vipps.no';
    const clientId = process.env.VIPPS_CLIENT_ID;
    const clientSecret = process.env.VIPPS_CLIENT_SECRET;
    const subscriptionKey = process.env.VIPPS_SUBSCRIPTION_KEY;
    const merchantSerialNumber = process.env.VIPPS_MERCHANT_SERIAL_NUMBER;

    if (!clientId || !clientSecret || !subscriptionKey || !merchantSerialNumber) {
        console.error("Missing Vipps env vars.");
        return;
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

    for (const doc of snapshot.docs) {
        const tx = doc.data();
        console.log(`Attempting to capture ${tx.bookingId} for amount ${tx.amount}...`);
        
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
            console.log(`Successfully captured ${tx.bookingId}`);
        } else {
            console.error(`Failed to capture ${tx.bookingId}`, await captureResponse.text());
        }
    }
}
capturePending().catch(console.error);
