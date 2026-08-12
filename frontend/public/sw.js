// LifeOS Service Worker for App & Local Notifications

self.addEventListener('install', (event) => {
  console.log('[LifeOS ServiceWorker] Installed successfully.');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[LifeOS ServiceWorker] Activated successfully.');
  event.waitUntil(self.clients.claim());
});

// Handle notification click events
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
