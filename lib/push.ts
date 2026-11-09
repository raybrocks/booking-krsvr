import * as webpush from 'web-push';
import { prisma } from '@/lib/prisma';

export const DEFAULT_VAPID_PUBLIC_KEY =
  'BMWY6n7hf1jDA5cUXtok5GwSYA5ckVUi3rsbXh9tX6cmogH35IgoO-PGj0d6hHrVnz0ajWU0bEtFZaHjiIRpAPk';
export const DEFAULT_VAPID_PRIVATE_KEY =
  'V4VU3QhPDn9SbeITNEkXXEPcOExZ_7wIgphvtD3BHLM';
export const DEFAULT_VAPID_SUBJECT = 'mailto:post@krsvr.no';

export function getVapidConfig() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || DEFAULT_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY || DEFAULT_VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || DEFAULT_VAPID_SUBJECT;

  if (!publicKey || !privateKey) {
    return null;
  }

  return { publicKey, privateKey, subject };
}

export interface AdminPushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  bookingId?: string;
}

/**
 * Sends a Web Push notification to all active Admin devices (iOS PWA, Mac, PC).
 * Automatically cleans up expired/uninstalled subscriptions (404/410).
 */
export async function sendAdminPushNotification(payload: AdminPushPayload): Promise<{
  sent: number;
  failed: number;
  cleaned: number;
}> {
  const config = getVapidConfig();
  if (!config) {
    console.warn('Web Push VAPID keys not configured in environment variables. Push notification skipped.');
    return { sent: 0, failed: 0, cleaned: 0 };
  }

  webpush.setVapidDetails(config.subject, config.publicKey, config.privateKey);

  const subscriptions = await prisma.adminPushSubscription.findMany();
  if (subscriptions.length === 0) {
    return { sent: 0, failed: 0, cleaned: 0 };
  }

  let sent = 0;
  let failed = 0;
  const deadIds: string[] = [];

  const jsonPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url || '/admin',
    tag: payload.tag || `booking-${Date.now()}`,
    bookingId: payload.bookingId,
    timestamp: Date.now(),
  });

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          jsonPayload,
          {
            TTL: 60 * 60 * 24, // 24 hours
            urgency: 'high',
          }
        );
        sent++;
      } catch (err: any) {
        failed++;
        // 404 or 410 indicates the subscription is expired or uninstalled
        if (err.statusCode === 404 || err.statusCode === 410) {
          deadIds.push(sub.id);
        } else {
          console.error(`Web Push sending failed for subscription ${sub.id}:`, err?.message || err);
        }
      }
    })
  );

  if (deadIds.length > 0) {
    await prisma.adminPushSubscription.deleteMany({
      where: { id: { in: deadIds } },
    }).catch((e) => console.error('Failed to clean dead push subscriptions:', e));
  }

  return { sent, failed, cleaned: deadIds.length };
}
