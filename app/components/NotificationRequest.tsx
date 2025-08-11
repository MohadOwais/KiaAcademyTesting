"use client";

import { useEffect } from "react";

const NotificationRequest = () => {
  useEffect(() => {
    const publicVapidKey = "BAo3OQ6zy1HO0D3YS-de30NaXOl6QaeRfi0X_hJp2N-Gvkti5xDyiOiBcJSOgx88ZykXssCo8L7sqnrq-_HkyHs";

    const registerServiceWorkerAndSubscribe = async () => {
      if ("serviceWorker" in navigator) {
        try {
          // Register service worker
          const registration = await navigator.serviceWorker.register("/sw.js");
          console.log("Service Worker registered:", registration);

          // Ask for notification permission
          const permission = await Notification.requestPermission();
          if (permission !== "granted") {
            console.warn("Notification permission not granted.");
            return;
          }

          // Subscribe to push
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
          });

          console.log("Subscription:", subscription);

          // Send subscription to server
          await fetch("http://localhost:4000/subscribe", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(subscription),
          });

          console.log("Subscription sent to server.");
        } catch (error) {
          console.error("Error during SW setup or subscription:", error);
        }
      }
    };

    // Utility to convert VAPID key
    const urlBase64ToUint8Array = (base64String: string) => {
      const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
      const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
      const rawData = window.atob(base64);
      return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
    };

    registerServiceWorkerAndSubscribe();
  }, []);

  return null;
};

export default NotificationRequest;
