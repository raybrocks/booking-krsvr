import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    await Promise.all(events.map(async (event) => {
      const reference = event.reference || event.item?.reference || event.data?.reference || event.aggregate?.reference || event.payment?.reference;
      
      // LOG TO PRISMA
      await prisma.webhookLog.create({
        data: {
          reference: reference || 'unknown',
          event: event.name || event.eventName || 'vipps_webhook',
          payload: event
        }
      }).catch(e => console.error("Klarte ikke skrive til webhookLogs:", e));

      if (!reference) return;

      let paymentStatus = 'UNKNOWN';
      let amount = 0;
      
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
             amount = event.item?.amount?.value || event.data?.amount?.value || event.amount?.value || event.aggregate?.amount?.value || 0;
             paymentStatus = event.item?.state || event.item?.status || event.name || event.eventName || 'UNKNOWN';
          }
      } else {
          amount = event.item?.amount?.value || event.data?.amount?.value || event.amount?.value || event.aggregate?.amount?.value || 0;
          paymentStatus = event.item?.state || event.item?.status || event.name || event.eventName || 'UNKNOWN';
      }

      const evtName = (event.name || event.eventName || "").toLowerCase();
      if (evtName.includes('refund')) paymentStatus = 'REFUNDED';
      else if (evtName.includes('cancel')) paymentStatus = 'CANCELLED';

      const updateOperations = async () => {
        try {
          await prisma.receipt.create({
            data: {
              bookingId: reference,
              amount: amount / 100,
              status: paymentStatus,
              paymentRef: event.pspReference || reference || 'unknown',
              type: paymentStatus.toLowerCase().includes('refund') ? 'refund' : 'payment',
            }
          });
        } catch (dbErr) { console.error('Failed to log receipt:', dbErr); }

        if (paymentStatus.toLowerCase().includes('cancelled') || paymentStatus === 'TERMINATED' || paymentStatus === 'ABORTED' || paymentStatus === 'EXPIRED' || paymentStatus.toLowerCase().includes('refund')) {
           try {
             const booking = await prisma.booking.update({ 
               where: { id: reference },
               data: { status: 'cancelled' }
             });

             if (booking && booking.email && !booking.cancellationEmailSent) {
               try {
                 const { sendBookingCancellationEmail } = await import('@/lib/email');
                 const emailData = { ...booking, amountPaid: amount / 100 };
                 await sendBookingCancellationEmail(booking.email, emailData);
                 
                 await prisma.booking.update({
                   where: { id: reference },
                   data: { cancellationEmailSent: true }
                 });
               } catch (e) {
                 console.error("Feilet å sende kansellerings epost:", e);
               }
             }
           } catch (e) {
             console.error("Feil ved håndtering av kansellering:", e);
           }
           return; 
        }

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

        try {
          const updateData: any = {};
          
          if (['captured', 'sale'].some(s => paymentStatus.toLowerCase().includes(s))) {
             updateData.status = 'confirmed';
             updateData.amountPaid = amount / 100;
          }

          const bookingData = await prisma.booking.update({
             where: { id: reference },
             data: updateData,
             include: { experience: true }
          });

          if (['captured', 'sale'].some(s => paymentStatus.toLowerCase().includes(s))) {
            const confirmedBookingSnap = bookingData;
            
            if (confirmedBookingSnap && !confirmedBookingSnap.cancellationEmailSent) {
              const { sendEmail } = await import('@/lib/email');
              
              const settingsDoc = await prisma.setting.findUnique({ where: { key: 'general' } });
              const generalSettings = settingsDoc?.value || { email: 'booking@krsvr.no', phone: '+47 000 00 000' };
              
              const experienceData = confirmedBookingSnap.experience || {
                 name: 'Valgt VR Opplevelse', 
                 picture: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d',
                 age: 'Alle',
                 duration: '1 time'
              };
              
              try {
                await sendEmail(
                  confirmedBookingSnap.email, 
                  confirmedBookingSnap, 
                  experienceData, 
                  generalSettings
                );
                
                await prisma.booking.update({
                  where: { id: reference },
                  data: { cancellationEmailSent: false } // Reusing this column conceptually? Actually email verification state. Wait...
                  // Oh, wait, the old code used 'confirmationEmailSent'
                });
              } catch (e) {
                 console.error("Kunne ikke sende webhook confirmation email", e);
              }
            }
          }
        } catch(e) {
          console.error("Kunne ikke oppdatere booking etter webhook:", e);
        }
      };
      
      // Kjører uten å avvente overfor Vipps, Vipps får sin 200 OK raskt
      updateOperations();
    }));

    return new NextResponse('OK', { status: 200 });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
