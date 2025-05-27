// Firebase Push Setup
importScripts("https://www.gstatic.com/firebasejs/11.8.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.8.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBvDHcYfeQdIwmXd3qnF97K-PQKH4NICf0",
  authDomain: "sportwoche-sv-langen.firebaseapp.com",
  projectId: "sportwoche-sv-langen",
  storageBucket: "sportwoche-sv-langen.appspot.com",
  messagingSenderId: "529824987070",
  appId: "1:529824987070:web:d8933f03fdd1a74598abef"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('📩 Push (Hintergrund):', payload);
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/icons/icon-192.png'
  });
});

// Optional: PWA-Caching hinzufügen (nur wenn du vorher `sw.js` hattest!)
self.addEventListener('install', (e) => {
  console.log('🧰 SW installiert');
  // Caching hier falls benötigt
});

self.addEventListener('activate', (e) => {
  console.log('🚀 SW aktiviert');
});

self.addEventListener('fetch', (e) => {
  // Optional: Netzwerk-First oder Cache-Strategien
});
