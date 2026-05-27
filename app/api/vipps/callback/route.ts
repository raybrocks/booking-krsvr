import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// Hjelpefunksjon for å validere HMAC signatur fra Vipps
function verifyVippsSignature(req: Request, rawText: string, pathAndQuery: string) {
  const secret = process.env.VIPPS_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("VIPPS_WEBHOOK_SECRET mangler i miljøvariablene. Skipper HMAC validering.");
    return true; // Tillat midlertidig hvis secret ikke er satt, men varsle!
  }

  try {
    const authHeader = req.headers.get('authorization') || '';
    const dateHeader = req.headers.get('x-ms-date') || '';
    const hostHeader = req.headers.get('host') || '';
    const contentSha = req.headers.get('x-ms-content-sha256') || '';

    // Sjekk content hash
    const expectedContentHash = crypto.createHash('sha256').update(rawText).digest('base64');
    if (expectedContentHash !== contentSha) {
      console.error("Webhook content hash matcher ikke!");
      return false;
    }

    // Bygg string to sign
    const method = req.method;
    const stringToSign = `${method}\n${pathAndQuery}\n${dateHeader};${hostHeader};${contentSha}`;
    const generatedSignature = crypto.createHmac('sha256', secret).update(stringToSign).digest('base64');

    // Hent ut signatur fra headeren (Eks: HMAC-SHA256 SignedHeaders=...&Signature=xyz)
    const match = authHeader.match(/Signature=([^&]+)/);
    if (!match) return false;
    
    const providedSignature = match[1];
    return generatedSignature === providedSignature;
  } catch (error) {
    console.error("Feil under validering av HMAC:", error);
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const rawText = await req.text();
    
    // Sikkerhetssjekk
    // Path er vanligvis "/api/vipps/callback" i Next.js, evt kan vi hente den fra URL
    const url = new URL(req.url);
    const pathAndQuery = url.pathname + url.search;
    
    if (!verifyVippsSignature(req, rawText, pathAndQuery)) {
      console.error("Ugyldig Vipps Webhook Signatur");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
                'Ocp-Apim-Subscription-Key': subscriptionKey,
                'Merchant-Serial-Number': merchantSerialNumber
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
             await adminDb.collection('bookings').doc(reference).update({ 
                vippsStatus: paymentStatus,
                status: 'cancelled',
                vippsUpdatedAt: FieldValue.serverTimestamp()
             });
           } catch (e) {}
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
                 'Ocp-Apim-Subscription-Key': subscriptionKey,
                 'Merchant-Serial-Number': merchantSerialNumber,
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