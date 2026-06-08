import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const reference = body.reference;
    
    if (!reference) {
      return NextResponse.json({ error: 'Missing reference' }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: reference }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

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
          
          let updatedStatus = booking.status;
          const successStates = ['AUTHORIZED', 'RESERVED', 'epayment.payment.reserved', 'CAPTURED', 'epayment.payment.captured', 'SALE'];

          if (!successStates.includes(pStatus)) {
             await prisma.booking.update({
               where: { id: reference },
               data: { status: 'cancelled' }
             });
             return NextResponse.json({ error: `Payment was not successful. Status: ${pStatus}` }, { status: 400 });
          }

          if (pStatus !== 'CAPTURED' && !pStatus.includes('captured')) {
              // 3. Automatically Capture the Payment
              const captureResponse = await fetch(`${baseUrl}/epayment/v1/payments/${reference}/capture`, {
                 method: 'POST',
                 headers: {
                   'Content-Type': 'application/json',
                   'Authorization': `Bearer ${tokenData.access_token}`,
                   'Ocp-Apim-Subscription-Key': subscriptionKey,
                   'Merchant-Serial-Number': merchantSerialNumber,
                   'Idempotency-Key': `capture-verify-${reference}-${Date.now()}`
                 },
                 body: JSON.stringify({
                   modificationAmount: {
                     currency: 'NOK',
                     value: paymentInfo.amount?.value || Math.round((booking.amountPaid || 0) * 100) 
                   }
                 })
              });
              
              if (!captureResponse.ok) {
                 const errText = await captureResponse.text();
                 console.error("Auto-capture in verify failed:", errText);
              }
          }
          
          updatedStatus = 'confirmed';
          
          await prisma.booking.update({
            where: { id: reference },
            data: { status: updatedStatus }
          });
          
        } else {
             const errorText = await paymentResponse.text();
             return NextResponse.json({ error: 'Could not verify payment with Vipps' }, { status: 400 });
        }
      }
    }

    // Re-fetch to get newest status
    const verifiedData = await prisma.booking.findUnique({ 
        where: { id: reference },
        include: { experience: true }
    });

    if (!verifiedData) return NextResponse.json({ error: 'Booking missing after verification' }, { status: 404 });

    // Auto-update to confirmed if it was pending and we bypassed vipps (e.g., pay at venue)
    if (verifiedData.status === 'pending' && verifiedData.paymentType !== 'vipps') {
      await prisma.booking.update({
        where: { id: reference },
        data: { status: 'confirmed' }
      });
      verifiedData.status = 'confirmed';
    }

    return NextResponse.json({ success: true, booking: verifiedData });
  } catch (error) {
    console.error('Verify booking error:', error);
    return NextResponse.json({ error: 'Failed to verify booking' }, { status: 500 });
  }
}
