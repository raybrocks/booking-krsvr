import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const reference = body.reference;
    
    if (!reference) {
      return NextResponse.json({ error: 'Missing reference' }, { status: 400 });
    }

    const bookingRef = adminDb.collection('bookings').doc(reference);
    const bookingSnap = await bookingRef.get();

    if (!bookingSnap.exists) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const bookingData = bookingSnap.data()!;

    // -- Fetch Vipps Payment Status --
    const isTest = process.env.VIPPS_ENV !== 'production';
    const baseUrl = isTest ? 'https://apitest.vipps.no' : 'https://api.vipps.no';
    const clientId = process.env.VIPPS_CLIENT_ID;
    const clientSecret = process.env.VIPPS_CLIENT_SECRET;
    const subscriptionKey = process.env.VIPPS_SUBSCRIPTION_KEY;
    const merchantSerialNumber = process.env.VIPPS_MERCHANT_SERIAL_NUMBER;

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
        
        // 2. Get Payment Details
        const paymentResponse = await fetch(`${baseUrl}/epayment/v1/payments/${reference}`, {
           method: 'GET',
           headers: {
             'Authorization': `Bearer ${tokenData.access_token}`,
             'Ocp-Apim-Subscription-Key': subscriptionKey,
             'Merchant-Serial-Number': merchantSerialNumber
           }
        });
        
        if (paymentResponse.ok) {
          const paymentInfo = await paymentResponse.json();
          const pStatus = paymentInfo.state || paymentInfo.status || 'UNKNOWN';
          
          await bookingRef.update({ 
              vippsStatus: pStatus,
              vippsVerifyRaw: JSON.stringify(paymentInfo)
          });
          
          const successStates = ['AUTHORIZED', 'RESERVED', 'epayment.payment.reserved', 'CAPTURED', 'epayment.payment.captured', 'SALE'];

          if (!successStates.includes(pStatus)) {
             await bookingRef.update({ status: 'cancelled' });
             return NextResponse.json({ error: `Payment was not successful. Status: ${pStatus}` }, { status: 400 });
          }

          if (pStatus !== 'CAPTURED') {
              // 3. Automatically Capture the Payment
              const captureResponse = await fetch(`${baseUrl}/epayment/v1/payments/${reference}/capture`, {
                 method: 'POST',
                 headers: {
                   'Content-Type': 'application/json',
                   'Authorization': `Bearer ${tokenData.access_token}`,
                   'Ocp-Apim-Subscription-Key': subscriptionKey,
                   'Merchant-Serial-Number': merchantSerialNumber,
                   'Idempotency-Key': `capture-verify-${reference}`
                 },
                 body: JSON.stringify({
                   modificationAmount: {
                     currency: 'NOK',
                     value: paymentInfo.amount?.value || Math.round((bookingData.amountPaid || 0) * 100) 
                   }
                 })
              });
              
              if (!captureResponse.ok) {
                 const errText = await captureResponse.text();
                 console.error("Auto-capture in verify failed:", errText);
                 await bookingRef.update({ vippsCaptureError: errText });
              } else {
                 await bookingRef.update({ vippsStatus: 'CAPTURED' });
              }
          }
        } else {
             const errorText = await paymentResponse.text();
             await bookingRef.update({ vippsStatus: 'FETCH_FAILED', vippsVerifyRaw: errorText });
             return NextResponse.json({ error: 'Could not verify payment with Vipps' }, { status: 400 });
        }
      } else {
         const errorText = await tokenResponse.text();
         await bookingRef.update({ vippsStatus: 'AUTH_FAILED', vippsVerifyRaw: errorText });
         return NextResponse.json({ error: 'Failed to authenticate with Vipps' }, { status: 500 });
      }
    } else {
        await bookingRef.update({ vippsStatus: 'MISSING_ENV_VARS' });
    }

    // If it's already confirmed, we might just need to ensure the email is sent
    if (bookingData.status !== 'confirmed') {
      await bookingRef.update({
        status: 'confirmed'
      });
    }

    // Check if we need to send the email
    if (!bookingData.confirmationEmailSent) {
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

      const { sendBookingConfirmationEmail, sendAdminNewBookingNotification, addContactToNewsletter } = await import('@/lib/email');
      
      // Ensure we pass the current data including any potentially missing fields
      const emailData = { 
        ...bookingData, 
        amountPaid: bookingData.amountPaid || 0 
      };

      await sendBookingConfirmationEmail(
        bookingData.email,
        emailData,
        customText
      );

      await sendAdminNewBookingNotification(emailData);

      if (bookingData.acceptedNewsletter && !bookingData.newsletterAdded) {
         await addContactToNewsletter(bookingData.email, bookingData.firstName, bookingData.lastName);
         await bookingRef.update({ newsletterAdded: true });
      }

      // Mark email as sent
      await bookingRef.update({
        confirmationEmailSent: true
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error verifying booking:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
