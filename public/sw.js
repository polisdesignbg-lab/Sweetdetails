/* Admin / site service worker — push notifications for new orders */
self.addEventListener("install", event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", event => {
  let data = {
    title: "Нова поръчка",
    body: "Имаш нова поръчка в Sweet Details.",
    url: "/admin",
  };
  try {
    if (event.data) {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    }
  } catch {
    try {
      const text = event.data?.text();
      if (text) data.body = text;
    } catch {
      /* ignore */
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title || "Нова поръчка", {
      body: data.body || "",
      icon: "/apple-touch-icon.png",
      badge: "/favicon-48.png",
      data: { url: data.url || "/admin" },
      vibrate: [120, 60, 120],
      requireInteraction: true,
    }),
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/admin";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if ("focus" in client && client.url.includes("/admin")) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    }),
  );
});
