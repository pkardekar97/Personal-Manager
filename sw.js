// Retired: the whole site is now one app with a single service worker at the site root.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('health-v-')).map(k => caches.delete(k))))
    .then(() => self.registration.unregister())));
