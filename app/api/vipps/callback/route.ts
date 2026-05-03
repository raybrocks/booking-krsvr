import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const expectedToken = process.env.VIPPS_CALLBACK_TOKEN || 'DefaultSecureToken123';

    // Verify the callback token
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('Vipps Webhook Received:', body);

    const reference = body.reference; // This matches the bookingId we sent
    const amount = body.amount?.value || 0;
    const paymentStatus = body.name || body.status || 'UNKNOWN';

    if (!reference) {
      return NextResponse.json({ error: 'Missing reference' }, { status: 400 });
    }

    // Attempt to log transaction
    try {
      const transactionRef = doc(db, 'transactions', reference);
      await setDoc(transactionRef, {
        bookingId: reference,
        amount: amount,
        status: paymentStatus,
        vippsOrderId: body.orderId || body.pspReference || 'unknown',
        transactionLogHistory: [body],
        createdAt: serverTimestamp()
      }, { merge: true });
    } catch (dbErr) {
      console.error('Failed to log transaction:', dbErr);
    }

    if (paymentStatus === 'TERMINATED' || paymentStatus === 'CANCELLED' || paymentStatus === 'ABORTED' || paymentStatus === 'EXPIRED') {
       try {
         const bookingRef = doc(db, 'bookings', reference);
         await updateDoc(bookingRef, { status: 'cancelled' });
       } catch (error) {
         console.error('Error updating booking status cancelled from webhook:', error);
       }
       return NextResponse.json({ success: true });
    }

    // Here you would typically update your database (Firebase)
    // to mark the booking as paid based on body.reference and body.status
    if (paymentStatus === 'AUTHORIZED' || paymentStatus === 'epayment.payment.reserved' || paymentStatus === 'CAPTURED' || paymentStatus === 'epayment.payment.captured' || paymentStatus === 'SALE') {
       try {
         // Automatically attempt to capture the payment if reserved
         if (paymentStatus === 'epayment.payment.reserved' || paymentStatus === 'AUTHORIZED') {
            const isTest = process.env.VIPPS_ENV !== 'production';
            const baseUrl = isTest ? 'https://apitest.vipps.no' : 'https://api.vipps.no';
            const clientId = process.env.VIPPS_CLIENT_ID;
            const clientSecret = process.env.VIPPS_CLIENT_SECRET;
            const subscriptionKey = process.env.VIPPS_SUBSCRIPTION_KEY;
            const merchantSerialNumber = process.env.VIPPS_MERCHANT_SERIAL_NUMBER;

            if (clientId && clientSecret && subscriptionKey && merchantSerialNumber) {
              const tokenResponse = await fetch(`${baseUrl}/accessToken/get`, {
                method: 'POST',
                headers: {
                  'client_id': clientId,
                  'client_secret': clientSecret,
                  'Ocp-Apim-Subscription-Key': subscriptionKey,
                },
              });
              if (tokenResponse.ok) {
                const tokenData = await tokenResponse.json();
                
                const captureResponse = await fetch(`${baseUrl}/epayment/v1/payments/${reference}/capture`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokenData.access_token}`,
                    'Ocp-Apim-Subscription-Key': subscriptionKey,
                    'Merchant-Serial-Number': merchantSerialNumber,
                    'Idempotency-Key': `capture-${reference}`
                  },
                  body: JSON.stringify({
                    modificationAmount: {
                      currency: 'NOK',
                      value: amount
                    }
                  })
                });
                
                if (!captureResponse.ok) {
                    const captureErr = await captureResponse.text();
                    console.error("Failed to automatically capture payment:", captureErr);
                } else {
                    console.log(`Payment for ${reference} automatically captured!`);
                }
              }
            }
         }

         const bookingRef = doc(db, 'bookings', reference);
         await updateDoc(bookingRef, {
           status: 'confirmed',
           amountPaid: amount / 100 // assuming amount is in ore
         });

         // Fetch booking details
         const bookingSnap = await getDoc(bookingRef);
         if (bookingSnap.exists()) {
           const bookingData = bookingSnap.data();

           // Check if we already sent the email to avoid duplicates
           if (!bookingData.confirmationEmailSent) {
             // Fetch custom text from settings
             let customText = "";
             try {
               const settingsRef = doc(db, 'settings', 'general');
               const settingsSnap = await getDoc(settingsRef);
               if (settingsSnap.exists()) {
                 customText = settingsSnap.data().bookingConfirmationText || "";
               }
             } catch (e) {
               console.error("Failed to fetch settings for email:", e);
             }

             // Send email
             const { sendBookingConfirmationEmail, addContactToNewsletter } = await import('@/lib/email');
             
             await sendBookingConfirmationEmail(
               bookingData.email,
               { ...bookingData, amountPaid: amount / 100 },
               customText
             );

             // Subscribe to newsletter if accepted
             if (bookingData.acceptedNewsletter && !bookingData.newsletterAdded) {
                await addContactToNewsletter(bookingData.email, bookingData.firstName, bookingData.lastName);
                await updateDoc(bookingRef, { newsletterAdded: true });
             }

             // Mark email as sent
             await updateDoc(bookingRef, {
               confirmationEmailSent: true
             });
           }
         }

       } catch (error) {
         console.error('Error updating booking status from webhook:', error);
       }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Vipps Callback Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}