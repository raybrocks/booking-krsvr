import { NextResponse } from 'next/server';
import { sendAdminPushNotification } from '@/lib/push';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const result = await sendAdminPushNotification({
      title: 'KRS VR Arena – Testvarsel',
      body: 'Push-varsler fungerer nå på denne enheten! Du vil motta varsel her ved nye bookinger og henvendelser.',
      url: '/admin',
      tag: `test-push-${Date.now()}`,
    });

    if (result.sent === 0 && result.failed === 0) {
      return NextResponse.json(
        { error: 'Ingen aktive enheter er registrert for push-varsler ennå. Trykk «Aktiver varsler» først.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Testvarsel sendt til ${result.sent} enhet(er).`,
      result,
    });
  } catch (error: any) {
    console.error('Error sending test push notification:', error);
    return NextResponse.json(
      { error: error?.message || 'Kunne ikke sende testvarsel' },
      { status: 500 }
    );
  }
}
