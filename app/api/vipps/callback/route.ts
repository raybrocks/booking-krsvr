import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Vipps Webhook Received:', body);

    const reference = body.reference || body.aggregate?.reference || body.payment?.reference;
    if (!reference) {
      return NextResponse.json({ error: 'Missing reference' }, { status: 400 });
    }

    // Securely fetch actual status from Vipps instead of relying purely on unverified webhook
    const isTest = process.env.VIPPS_ENV !== 'production';
    const baseUrl = isTest ? 'https://apitest.vipps.no' : 'https://api.vipps.no';
    const clientId = process.env.VIPPS_CLIENT_ID;
    const clientSecret = process.env.VIPPS_CLIENT_SECRET;
    const subscriptionKey = process.env.VIPPS_SUBSCRIPTION_KEY;
    const merchantSerialNumber = process.env.VIPPS_MERCHANT_SERIAL_NUMBER;
    
    let paymentStatus = 'UNKNOWN';
    let amount = 0;
    
    if (clientId && clientSecret && subscriptionKey && merchantSerialNumber) {
        // 1. Get Access Token
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
            
            // 2. Fetch real Payment Status
            const statusResponse = await fetch(`${baseUrl}/epayment/v1/payments/${reference}`, {
               method: 'GET',
               headers: {
                  'Authorization': `Bearer ${tokenData.access_token}`,
                  'Ocp-Apim-Subscription-Key': subscriptionKey,
                  'Merchant-Serial-Number': merchantSerialNumber
               }
            });
            
            if (statusResponse.ok) {
                const statusData = await statusResponse.json();
                console.log(`Vipps actual state for ${reference}:`, statusData.state);
                paymentStatus = statusData.state;
                amount = statusData.amount?.value || 0;
            } else {
                console.error("Failed to verify payment state from Vipps", await statusResponse.text());
                return NextResponse.json({ error: 'Failed to verify payment status' }, { status: 400 });
            }
        }
    } else {
        console.warn("Vipps credentials missing, falling back to payload data (not recommended in production).");
        amount = body.amount?.value || body.aggregate?.amount?.value || 0;
        paymentStatus = body.name || body.status || body.state || 'UNKNOWN';
    }

    // Attempt to log transaction
    try {
      const transactionRef = adminDb.collection('transactions').doc(reference);
      await transactionRef.set({
        bookingId: reference,
        amount: amount,
        status: paymentStatus,
        vippsOrderId: body.orderId || body.pspReference || 'unknown',
        transactionLogHistory: FieldValue.arrayUnion(body),
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true });
    } catch (dbErr) {
      console.error('Failed to log transaction:', dbErr);
    }

    // Update booking with the latest vipps status
    try {
      const bookingRef = adminDb.collection('bookings').doc(reference);
      const updateData: any = {
        vippsStatus: paymentStatus,
        vippsUpdatedAt: FieldValue.serverTimestamp()
      };
      
      if (amount > 0 && (paymentStatus.includes('captured') || paymentStatus === 'CAPTURED' || paymentStatus.includes('reserved') || paymentStatus === 'AUTHORIZED' || paymentStatus === 'SALE')) {
        updateData.vippsAmount = amount;
      }
      
      if (paymentStatus.includes('cancelled') || paymentStatus === 'TERMINATED' || paymentStatus === 'ABORTED' || paymentStatus === 'EXPIRED') {
         updateData.status = 'cancelled';
      } else if (paymentStatus.includes('reserved') || paymentStatus === 'AUTHORIZED') {
         // The user wants automatic capture on reserved, but keeping the manual buttons as a fallback safeguard
      } else if (paymentStatus.includes('captured') || paymentStatus === 'CAPTURED' || paymentStatus === 'SALE') {
         updateData.status = 'confirmed';
         updateData.amountPaid = amount / 100;
      }

      await bookingRef.update(updateData);
    } catch (dbErr) {
      console.error('Failed to update booking with vipps status:', dbErr);
    }

    if (paymentStatus.includes('cancelled') || paymentStatus === 'TERMINATED' || paymentStatus === 'ABORTED' || paymentStatus === 'EXPIRED') {
       return NextResponse.json({ success: true });
    }

    // Automatically attempt to capture the payment if reserved
    if (paymentStatus.includes('reserved') || paymentStatus === 'AUTHORIZED') {
       try {
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
       } catch (error) {
         console.error('Error during automatic vipps capture:', error);
       }
    }

    // After updating booking, if it was captured we might need to send email
    if (paymentStatus.includes('captured') || paymentStatus === 'CAPTURED' || paymentStatus === 'SALE') {
       try {
         const bookingRef = adminDb.collection('bookings').doc(reference);
         const bookingSnap = await bookingRef.get();
         if (bookingSnap.exists) {
           const bookingData = bookingSnap.data()!;

           // Check if we already sent the email to avoid duplicates
           if (!bookingData.confirmationEmailSent) {
             // Fetch custom text from settings
             let customText = "";
             try {
               const settingsRef = adminDb.collection('settings').doc('general');
               const settingsSnap = await settingsRef.get();
               if (settingsSnap.exists) {
                 customText = settingsSnap.data()!.bookingConfirmationText || "";
               }
             } catch (e) {
               console.error("Failed to fetch settings for email:", e);
             }

             // Send email
             const { sendBookingConfirmationEmail, sendAdminNewBookingNotification, addContactToNewsletter } = await import('@/lib/email');
             
             await sendBookingConfirmationEmail(
               bookingData.email,
               { ...bookingData, amountPaid: amount / 100 },
               customText
             );

             // Send admin notification
             await sendAdminNewBookingNotification({ ...bookingData, amountPaid: amount / 100 });

             // Subscribe to newsletter if accepted
             if (bookingData.acceptedNewsletter && !bookingData.newsletterAdded) {
                await addContactToNewsletter(bookingData.email, bookingData.firstName, bookingData.lastName);
                await bookingRef.update({ newsletterAdded: true });
             }

             // Mark email as sent
             await bookingRef.update({
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