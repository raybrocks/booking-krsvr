import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const isTest = process.env.VIPPS_ENV !== 'production';
    const baseUrl = isTest ? 'https://apitest.vipps.no' : 'https://api.vipps.no';
    
    const clientId = process.env.VIPPS_CLIENT_ID;
    const clientSecret = process.env.VIPPS_CLIENT_SECRET;
    const subscriptionKey = process.env.VIPPS_SUBSCRIPTION_KEY;
    const appBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://krsvr.no';
    
    if (!clientId || !clientSecret || !subscriptionKey) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 500 });
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
      return NextResponse.json({ error: 'Token failed', details: await tokenResponse.text() }, { status: 500 });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (req.url.includes('getEvents=true')) {
        const eventsResponse = await fetch(`${baseUrl}/webhooks/v1/events`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Ocp-Apim-Subscription-Key': subscriptionKey,
            }
        });
        return NextResponse.json(await eventsResponse.json());
    }

    // 2. Register Webhook
    const webhookResponse = await fetch(`${baseUrl}/webhooks/v1/webhooks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Ocp-Apim-Subscription-Key': subscriptionKey,
      },
      body: JSON.stringify({
        url: `${appBaseUrl}/api/vipps/callback`,
        events: [
          "epayments.payment.created.v1",
          "epayments.payment.aborted.v1",
          "epayments.payment.expired.v1",
          "epayments.payment.cancelled.v1",
          "epayments.payment.authorized.v1",
          "epayments.payment.captured.v1",
          "epayments.payment.refunded.v1"
        ]
      }),
    });

    if (!webhookResponse.ok) {
        // If it already exists, maybe we need to fetch it
        if (webhookResponse.status === 400 || webhookResponse.status === 409) {
           return NextResponse.json({ error: 'Webhook might already exist or invalid', details: await webhookResponse.text() }, { status: webhookResponse.status });
        }
      return NextResponse.json({ error: 'Webhook registration failed', details: await webhookResponse.text() }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: await webhookResponse.json() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
