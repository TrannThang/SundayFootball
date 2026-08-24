/* ==========================================================================
   SUNDAY FOOTBALL - PUSH NOTIFICATION SERVICE WORKER
   Must live at the site root (not js/) - service worker scope is limited to
   its own directory and everything below it, and this one needs to cover
   the whole app. Handles push while the app is closed/backgrounded; the page
   itself (js/push-notify.js) handles the foreground case via onMessage().

   The Firebase config below is duplicated from js/firebase-config.js on
   purpose: it's the public web config (safe to expose, same as documented
   there), and a service worker can't read variables off the main page - it
   only understands importScripts() and its own top-level code.
   ========================================================================== */

importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBewu0kYNNGo1_lk577VJxCNuaRfqHsTMQ",
  authDomain: "sunday-football-d953b.firebaseapp.com",
  databaseURL: "https://sunday-football-d953b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sunday-football-d953b",
  storageBucket: "sunday-football-d953b.firebasestorage.app",
  messagingSenderId: "1013424316533",
  appId: "1:1013424316533:web:4e0ce7a5a66e186c1c583c"
});

const messaging = firebase.messaging();

// The server sends a data-only payload (see api/send-push.js) on purpose -
// a "notification" payload makes the browser auto-display a system
// notification AND still fire this handler, which used to also call
// showNotification() itself, showing the same push twice on one device.
// Data-only means nothing is shown until this handler explicitly does it.
messaging.onBackgroundMessage((payload) => {
  const title = (payload.data && payload.data.title) || 'Sunday Football';
  const options = {
    body: (payload.data && payload.data.body) || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
  };
  self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});
