import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { endpoint, keys, userAgent } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { error: 'Mangler påkrevde push-abonnementsfelter (endpoint, keys.p256dh, keys.auth)' },
        { status: 400 }
      );
    }

    const subscription = await prisma.adminPushSubscription.upsert({
      where: { endpoint },
      update: {
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent: userAgent || req.headers.get('user-agent') || null,
      },
      create: {
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent: userAgent || req.headers.get('user-agent') || null,
      },
    });

    return NextResponse.json({ success: true, id: subscription.id });
  } catch (error: any) {
    console.error('Error saving push subscription:', error);
    return NextResponse.json(
      { error: 'Kunne ikke lagre push-abonnement' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json({ error: 'Mangler endpoint' }, { status: 400 });
    }

    await prisma.adminPushSubscription.deleteMany({
      where: { endpoint },
    });

    return NextResponse.json({ success: true, message: 'Push-abonnement slettet' });
  } catch (error: any) {
    console.error('Error deleting push subscription:', error);
    return NextResponse.json(
      { error: 'Kunne ikke slette push-abonnement' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const count = await prisma.adminPushSubscription.count();
    return NextResponse.json({
      activeSubscriptions: count,
      vapidPublicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Kunne ikke hente push-status' }, { status: 500 });
  }
}
