self.addEventListener("push", function (event) {
  const data = event.data.json();
  console.log("Push Received", data);

  const title = data.title || "Notification";
  const options = {
    body: data.body,
    icon: "/icon.png", // optional
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Allow notification to reach page context
self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});
