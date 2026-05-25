import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const isTest = process.env.VIPPS_ENV !== 'production';
    const baseUrl = isTest ? 'https://apitest.vipps.no' : 'https://api.vipps.no';
    
    const clientId = process.env.VIPPS_CLIENT_ID || '';
    const clientSecret = process.env.VIPPS_CLIENT_SECRET || '';
    const subscriptionKey = process.env.VIPPS_SUBSCRIPTION_KEY || '';
    
    if (!clientId || !clientSecret || !subscriptionKey) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 500 });
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
    const accessToken = tokenData.access_token;

    const webhookResponse = await fetch(`${baseUrl}/webhooks/v1/webhooks`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Ocp-Apim-Subscription-Key': subscriptionKey,
      }
    });

    return NextResponse.json(await webhookResponse.json());
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
