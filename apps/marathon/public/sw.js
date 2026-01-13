// Marathon Alert Service Worker
// Handles push notifications for marathon registration alerts

self.addEventListener("install", (event) => {
  console.log("Service Worker installed");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activated");
  event.waitUntil(clients.claim());
});

self.addEventListener("push", (event) => {
  console.log("Push notification received:", event);

  let data = {
    title: "Marathon Alert",
    body: "대회 신청이 곧 시작됩니다!",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    url: "/",
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      console.error("Failed to parse push data:", e);
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || "/icons/icon-192x192.png",
    badge: data.badge || "/icons/badge-72x72.png",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/",
      marathonId: data.marathonId,
      dateOfArrival: Date.now(),
    },
    actions: [
      {
        action: "open",
        title: "신청 페이지 열기",
      },
      {
        action: "dismiss",
        title: "닫기",
      },
    ],
    requireInteraction: true, // Keep notification visible until user interacts
    tag: data.marathonId || "marathon-alert", // Prevent duplicate notifications
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  console.log("Notification click received:", event);

  event.notification.close();

  if (event.action === "dismiss") {
    return;
  }

  // Open or focus the app window
  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there's already a window open
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

self.addEventListener("notificationclose", (event) => {
  console.log("Notification closed:", event);
});

// Handle fetch events for offline support (optional)
self.addEventListener("fetch", (event) => {
  // Pass through for now - can add caching later
});
