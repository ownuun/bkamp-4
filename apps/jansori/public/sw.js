// Jansori Service Worker for Push Notifications

self.addEventListener('push', function(event) {
  console.log('[SW] Push event received:', event);

  if (!event.data) {
    console.log('[SW] No data in push event');
    return;
  }

  const data = event.data.json();
  console.log('[SW] Push data:', data);
  const options = {
    body: data.body || '목표를 향해 나아가세요!',
    icon: '/logo.png',
    badge: '/logo.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/dashboard',
    },
    actions: [
      { action: 'open', title: '확인하기' },
      { action: 'close', title: '닫기' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || '잔소리', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'close') return;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      const url = event.notification.data?.url || '/dashboard';
      
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
