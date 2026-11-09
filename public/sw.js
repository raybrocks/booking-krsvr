// Service Worker for KRS VR Arena Web Push Notifications (iOS PWA & Desktop)

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'KRS VR Arena Admin', body: event.data.text() };
    }
  }

  const title = data.title || 'Ny booking – KRS VR Arena';
  const options = {
    body: data.body || 'En ny booking er registrert i systemet.',
    icon: data.icon || '/krsvrarena_logo_sort.png',
    badge: data.badge || '/krsvrarena_logo_sort.png',
    data: {
      url: data.url || '/admin',
      bookingId: data.bookingId,
      timestamp: Date.now(),
    },
    tag: data.tag || `booking-${Date.now()}`,
    renotify: true,
    vibrate: [200, 100, 200],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/admin';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If admin is already open in a tab or standalone window, navigate and focus it
      for (const client of clientList) {
        if (client.url.includes('/admin') && 'focus' in client) {
          if ('navigate' in client && targetUrl !== client.url) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      // Otherwise open a new window/app
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
