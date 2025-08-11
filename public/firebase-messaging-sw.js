// public/firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyA1xBm9sGUJJNORrUKiB8syDYcQIMEm4GQ",
    authDomain: "kiacademypropush.firebaseapp.com",
    projectId: "kiacademypropush",
    storageBucket: "kiacademypropush.firebasestorage.app",
    messagingSenderId: "24114673105",
    appId: "1:24114673105:web:49678d320c8465b4b5dcf0",
    measurementId: "G-36PHC6SWH9",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log("Received background message ", payload);
  const notificationTitle = payload.notification?.title;
  const notificationOptions = {
    body: payload.notification?.body,
    icon: "/firebase-logo.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
