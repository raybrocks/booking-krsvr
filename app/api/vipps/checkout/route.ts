import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bookingId, amount, description } = body;

    if (!bookingId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const isTest = process.env.VIPPS_ENV !== 'production';
    const baseUrl = isTest ? 'https://apitest.vipps.no' : 'https://api.vipps.no';
    
    const clientId = process.env.VIPPS_CLIENT_ID;
    const clientSecret = process.env.VIPPS_CLIENT_SECRET;
    const subscriptionKey = process.env.VIPPS_SUBSCRIPTION_KEY;
    const merchantSerialNumber = process.env.VIPPS_MERCHANT_SERIAL_NUMBER;
    let appBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!appBaseUrl) {
      const protocol = req.headers.get('x-forwarded-proto') || 'https';
      const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost';
      appBaseUrl = `${protocol}://${host}`;
    }
    
    // Vipps requires HTTPS. Force it. 
    // Note: If running locally without ngrok/https, Vipps callbacks won't reach localhost anyway.
    if (appBaseUrl.startsWith('http://')) {
      appBaseUrl = appBaseUrl.replace('http://', 'https://');
    }
    
    // Vipps requires valid DNS. If host is localhost, dummy it out for dev.
    if (appBaseUrl.includes('localhost')) {
        appBaseUrl = 'https://krs-vr-arena.no';
    }

    if (!clientId || !clientSecret || !subscriptionKey || !merchantSerialNumber) {
      console.error('Missing Vipps credentials in environment variables');
      return NextResponse.json({ error: 'Payment gateway configuration error' }, { status: 500 });
    }

    // 1. Get Access Token
    const tokenResponse = await fetch(`${baseUrl}/accessToken/get`, {
      method: 'POST',
      headers: {
        'client_id': clientId,
        'client_secret': clientSecret,
        'Ocp-Apim-Subscription-Key': subscriptionKey,
      },
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Vipps Token Error:', errorText);

      let errorMessage = 'Failed to authenticate with payment gateway';
      if (errorText.includes('AADSTS700016')) {
        errorMessage = 'Invalid Vipps credentials for the current environment. If you are using Production keys, make sure to set VIPPS_ENV=production in your environment variables. Currently pointing to: ' + baseUrl;
      }

      return NextResponse.json({ error: errorMessage, details: errorText }, { status: 500 });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 2. Create Checkout Session
    // Vipps expects amount in øre (1 NOK = 100 øre)
    const amountInOre = Math.round(amount * 100);

    const checkoutResponse = await fetch(`${baseUrl}/checkout/v3/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'client_id': clientId,
        'client_secret': clientSecret,
        'Ocp-Apim-Subscription-Key': subscriptionKey,
        'Merchant-Serial-Number': merchantSerialNumber,
        'Authorization': `Bearer ${accessToken}`,
        'Vipps-System-Name': 'KrsVRArena',
        'Vipps-System-Version': '1.0.0',
        'Vipps-System-Plugin-Name': 'KrsVRArena-Checkout',
        'Vipps-System-Plugin-Version': '1.0.0'
      },
      body: JSON.stringify({
        merchantInfo: {
          callbackUrl: `${appBaseUrl}/api/vipps/callback`,
          returnUrl: `${appBaseUrl}/checkout/return?reference=${bookingId}`,
          callbackAuthorizationToken: process.env.VIPPS_CALLBACK_TOKEN || 'DefaultSecureToken123',
        },
        transaction: {
          amount: {
            currency: 'NOK',
            value: amountInOre,
          },
          reference: bookingId,
          paymentDescription: 'VR Experience Booking - ' + bookingId,
        },
      }),
    });

    if (!checkoutResponse.ok) {
      const errorText = await checkoutResponse.text();
      console.error('Vipps Checkout Error:', errorText);
      
      let parsedError = 'Failed to create payment session';
      try {
        const jsonError = JSON.parse(errorText);
        if (jsonError.errors) {
            parsedError = JSON.stringify(jsonError.errors);
        } else if (jsonError.title) {
            parsedError = jsonError.title;
        } else if (jsonError.message) {
            parsedError = jsonError.message;
        }
      } catch (e) {}

      return NextResponse.json({ error: parsedError, details: errorText }, { status: 500 });
    }

    const checkoutData = await checkoutResponse.json();

    return NextResponse.json({ 
      checkoutUrl: checkoutData.checkoutFrontendUrl,
      token: checkoutData.token 
    });

  } catch (error) {
    console.error('Vipps API Route Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}