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

export interface BookingChangePushOptions {
  booking: any;
  changes?: {
    timeChanged?: boolean;
    experienceChanged?: boolean;
    playersChanged?: boolean;
    namesUpdated?: boolean;
    cancelled?: boolean;
    oldDate?: string;
    oldTime?: string;
    oldPlayers?: number;
    oldExperienceName?: string;
  };
  source?: 'customer' | 'admin';
}

/**
 * Sends a specialized push notification when a booking is modified, rescheduled,
 * cancelled, or when customer updates player names.
 */
export async function sendBookingChangePushNotification(options: BookingChangePushOptions) {
  const { booking, changes, source = 'customer' } = options;
  if (!booking) return null;

  const fullName = `${booking.firstName || ''} ${booking.lastName || ''}`.trim() || 'Kunde';
  const sourceLabel = source === 'customer' ? 'av kunde' : 'i admin';
  const validNames = (Array.isArray(booking.playerNames) ? booking.playerNames : [])
    .map((n: any) => String(n || '').trim())
    .filter(Boolean);

  let title = `Booking endret (${sourceLabel}): ${fullName}`;
  let body = `${booking.date} kl. ${booking.time} · ${booking.players} pers`;
  let tag = `booking-update-${booking.id}`;
  let url = `/admin?search=${encodeURIComponent(booking.firstName || fullName)}`;

  if (changes?.cancelled) {
    title = `Booking kansellert: ${fullName}`;
    body = `${booking.experience?.name || 'VR Opplevelse'} · ${booking.date} kl. ${booking.time} (${booking.players} pers · kansellert ${sourceLabel})`;
    tag = `booking-cancel-${booking.id}`;
    url = `/admin?tab=archive&search=${encodeURIComponent(booking.firstName || fullName)}`;
  } else if (changes?.namesUpdated && !changes.timeChanged && !changes.playersChanged && !changes.experienceChanged) {
    title = `Navneliste oppdatert: ${fullName}`;
    const namePreview = validNames.length > 0
      ? `: ${validNames.slice(0, 4).join(', ')}${validNames.length > 4 ? ` (+${validNames.length - 4})` : ''}`
      : '';
    body = `${validNames.length} av ${booking.players} deltakere registrert${namePreview} · ${booking.date} kl. ${booking.time}`;
    tag = `booking-names-${booking.id}`;
  } else if (changes?.playersChanged && !changes.timeChanged && !changes.experienceChanged) {
    title = `Deltakerantall endret: ${fullName}`;
    const oldP = changes.oldPlayers !== undefined ? `${changes.oldPlayers} ➔ ` : '';
    body = `${oldP}${booking.players} pers${changes.namesUpdated ? ` (${validNames.length} navn registrert)` : ''} · ${booking.date} kl. ${booking.time}`;
    tag = `booking-players-${booking.id}`;
  } else if (changes?.timeChanged && !changes.experienceChanged) {
    title = `Tidspunkt flyttet: ${fullName}`;
    const oldInfo = changes.oldDate ? ` (før: ${changes.oldDate} kl. ${changes.oldTime})` : '';
    body = `Ny tid: ${booking.date} kl. ${booking.time}${oldInfo} · ${booking.experience?.name || ''}`;
    tag = `booking-time-${booking.id}`;
  } else if (changes?.experienceChanged) {
    title = `Opplevelse endret: ${fullName}`;
    body = `${booking.experience?.name || booking.experienceId} · ${booking.date} kl. ${booking.time} (${booking.players} pers)`;
    tag = `booking-exp-${booking.id}`;
  } else if (changes?.namesUpdated) {
    title = `Booking og navneliste oppdatert: ${fullName}`;
    body = `${booking.players} pers (${validNames.length} navn registrert) · ${booking.date} kl. ${booking.time}`;
  }

  return sendAdminPushNotification({
    title,
    body,
    url,
    tag,
    bookingId: booking.id,
  });
}
