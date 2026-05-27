import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const rawText = await req.text();

    let body;
    try {
       body = JSON.parse(rawText);
    } catch(e) {
       console.error("Webhook payload not JSON", rawText);
       return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
    }
    
    console.log('Vipps Webhook Mottatt:', body);

    const events = Array.isArray(body) ? body : [body];
    const isTest = process.env.VIPPS_ENV !== 'production';
    const baseUrl = isTest ? 'https://apitest.vipps.no' : 'https://api.vipps.no';
    const clientId = process.env.VIPPS_CLIENT_ID;
    const clientSecret = process.env.VIPPS_CLIENT_SECRET;
    const subscriptionKey = process.env.VIPPS_SUBSCRIPTION_KEY;
    const merchantSerialNumber = process.env.VIPPS_MERCHANT_SERIAL_NUMBER;
    
    let globalAccessToken = null;

    // Hent Access Token ÉN GANG (i stedet for inni løkken) for å unngå Vercel timeout
    if (clientId && clientSecret && subscriptionKey) {
      try {
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
          globalAccessToken = tokenData.access_token;
        }
      } catch (e) {
        console.error("Klarte ikke å hente global token for webhook", e);
      }
    }

    // Process events parallelt for å sikre lynrask respons før Vipps / Vercel kutter forbindelsen
    await Promise.all(events.map(async (event) => {
      const reference = event.reference || event.item?.reference || event.data?.reference || event.aggregate?.reference || event.payment?.reference;
      
      // LOGG ALLE EVENTS, IKKE BARE FEIL! Slik kan vi se i backend at webhooks faktisk ankommer.
      await adminDb.collection('webhookLogs').add({
        status: reference ? 'processed' : 'missing_reference',
        reference: reference || 'unknown',
        body: event,
        receivedAt: FieldValue.serverTimestamp()
      }).catch(e => console.error("Klarte ikke skrive til webhookLogs:", e));

      if (!reference) return; // Skip hvis ingen referanse

      let paymentStatus = 'UNKNOWN';
      let amount = 0;
      
      // Hent fersk status fra Vipps
      if (globalAccessToken && merchantSerialNumber && subscriptionKey) {
          const statusResponse = await fetch(`${baseUrl}/epayment/v1/payments/${reference}`, {
             method: 'GET',
             headers: {
                'Authorization': `Bearer ${globalAccessToken}`,
                'Ocp-Apim-Subscription-Key': subscriptionKey as string,
                'Merchant-Serial-Number': merchantSerialNumber as string
             }
          });
          
          if (statusResponse.ok) {
              const statusData = await statusResponse.json();
              paymentStatus = statusData.state || statusData.status || 'UNKNOWN';
              amount = statusData.amount?.value || 0;
          } else {
             console.warn("Kunne ikke hente fersk status for webhook", await statusResponse.text());
             // Fallback til payload-data
             amount = event.item?.amount?.value || event.data?.amount?.value || event.amount?.value || event.aggregate?.amount?.value || 0;
             paymentStatus = event.item?.state || event.item?.status || event.name || event.eventName || 'UNKNOWN';
          }
      } else {
          // Fallback hvis vipps keys mangler
          amount = event.item?.amount?.value || event.data?.amount?.value || event.amount?.value || event.aggregate?.amount?.value || 0;
          paymentStatus = event.item?.state || event.item?.status || event.name || event.eventName || 'UNKNOWN';
      }

      // Overstyr hvis eventnavnet indikerer noe drastisk (refund/cancel)
      const evtName = (event.name || event.eventName || "").toLowerCase();
      if (evtName.includes('refund')) paymentStatus = 'REFUNDED';
      else if (evtName.includes('cancel')) paymentStatus = 'CANCELLED';

      // Utfør evt. capture og database-oppdateringer asynkront
      const updateOperations = async () => {
        // Skriv til transactions
        try {
          const transactionRef = adminDb.collection('transactions').doc(reference);
          await transactionRef.set({
            bookingId: reference,
            amount: amount,
            status: paymentStatus,
            vippsOrderId: event.pspReference || reference || 'unknown',
            transactionLogHistory: FieldValue.arrayUnion(event),
            updatedAt: FieldValue.serverTimestamp()
          }, { merge: true });
        } catch (dbErr) { console.error('Failed to log transaction:', dbErr); }

        if (paymentStatus.toLowerCase().includes('cancelled') || paymentStatus === 'TERMINATED' || paymentStatus === 'ABORTED' || paymentStatus === 'EXPIRED' || paymentStatus.toLowerCase().includes('refund')) {
           try {
             // 1. Lagre kvittering for regnskapet (refundering)
             const receiptRef = adminDb.collection('receipts').doc(`refund-${reference}-${Date.now()}`);
             await receiptRef.set({
               bookingId: reference,
               amount: -Math.abs(amount), // Negative amount for refund
               status: paymentStatus,
               type: paymentStatus.toLowerCase().includes('refund') ? 'refund' : 'cancellation',
               createdAt: FieldValue.serverTimestamp()
             });

             // 2. Oppdater booking status
             await adminDb.collection('bookings').doc(reference).update({ 
                vippsStatus: paymentStatus,
                status: 'cancelled',
                vippsUpdatedAt: FieldValue.serverTimestamp()
             });

             // 3. Send out cancellation email in background
             Promise.resolve().then(async () => {
               try {
                 const bookingSnap = await adminDb.collection('bookings').doc(reference).get();
                 const bookingData = bookingSnap.data();
                 if (bookingData && bookingData.email && !bookingData.cancellationEmailSent) {
                   const { sendBookingCancellationEmail } = await import('@/lib/email');
                   const emailData = { ...bookingData, amountPaid: amount / 100 };
                   await sendBookingCancellationEmail(bookingData.email, emailData);
                   
                   await adminDb.collection('bookings').doc(reference).update({ cancellationEmailSent: true });
                 }
               } catch (e) {
                 console.error("Feilet å sende kansellerings epost:", e);
               }
             });

           } catch (e) {
             console.error("Feil ved håndtering av kansellering:", e);
           }
           return; 
        }

        // Forsøk auto-capture
        if ((paymentStatus.toLowerCase().includes('reserved') || paymentStatus === 'AUTHORIZED') && globalAccessToken) {
           try {
             const captureResponse = await fetch(`${baseUrl}/epayment/v1/payments/${reference}/capture`, {
               method: 'POST',
               headers: {
                 'Content-Type': 'application/json',
                 'Authorization': `Bearer ${globalAccessToken}`,
                 'Ocp-Apim-Subscription-Key': subscriptionKey || '',
                 'Merchant-Serial-Number': merchantSerialNumber || '',
                 'Idempotency-Key': `capture-webhook-${reference}-${Date.now()}`
               },
               body: JSON.stringify({ modificationAmount: { currency: 'NOK', value: amount }})
             });
             
             if (captureResponse.ok) {
                 console.log(`Payment for ${reference} automatically captured by webhook!`);
                 paymentStatus = 'CAPTURED'; 
             }
           } catch (error) {
             console.error('Error during auto capture in webhook:', error);
           }
        }

        // Oppdater Booking-dokumentet
        try {
          const bookingRef = adminDb.collection('bookings').doc(reference);
          const updateData: any = {
            vippsStatus: paymentStatus,
            vippsUpdatedAt: FieldValue.serverTimestamp()
          };
          
          if (amount > 0 && ['captured', 'authorized', 'reserved', 'sale'].some(s => paymentStatus.toLowerCase().includes(s))) {
            updateData.vippsAmount = amount;
          }
          
          if (['captured', 'sale'].some(s => paymentStatus.toLowerCase().includes(s))) {
             updateData.status = 'confirmed';
             updateData.amountPaid = amount / 100;
          }

          await bookingRef.update(updateData);

          // E-post utsendelse KUN om den ble captured og e-post ikke er sendt
          if (updateData.status === 'confirmed') {
             const bookingSnap = await bookingRef.get();
             const bookingData = bookingSnap.data();
             if (bookingData && !bookingData.confirmationEmailSent) {
               // Utføres i bakgrunnen for å ikke bremse webhook
               Promise.resolve().then(async () => {
                 try {
                   let customText = "";
                   const settingsSnap = await adminDb.collection('settings').doc('general').get();
                   if (settingsSnap.exists) customText = settingsSnap.data()!.bookingConfirmationText || "";
                   
                   const { sendBookingConfirmationEmail, sendAdminNewBookingNotification, addContactToNewsletter } = await import('@/lib/email');
                   const emailData = { ...bookingData, amountPaid: amount / 100 };
                   
                   await sendBookingConfirmationEmail(bookingData.email, emailData, customText);
                   await sendAdminNewBookingNotification(emailData);
                   
                   if (bookingData.acceptedNewsletter && !bookingData.newsletterAdded) {
                      await addContactToNewsletter(bookingData.email, bookingData.firstName, bookingData.lastName);
                      await bookingRef.update({ newsletterAdded: true });
                   }
                   
                   await bookingRef.update({ confirmationEmailSent: true });
                 } catch (emailErr) {
                   console.error("Feilet e-postutsending i webhook:", emailErr);
                 }
               });
             }
          }
        } catch (dbErr) {
          console.error('Failed to update booking:', dbErr);
        }
      };

      // Vi kjører updateOperations, men vi bruker await for å sikre at prosessen rekker å gjøre databasetall. 
      // Siden API-kallene nå er optimalisert, bør dette gå raskt. Epost-utsendingen skjer asynkront.
      await updateOperations();
    }));

    // Returner lynraskt!
    return NextResponse.json({ success: true, handled: events.length });
  } catch (error) {
    console.error('Vipps Callback General Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}