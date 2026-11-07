// Routine unified cyber service worker
const CACHE = 'routine-v-200';
const FILES = [
  "./",
  "./index.html",
  "./app.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/icon-budget-192.png",
  "./icons/icon-budget-512.png",
  "./icons/icon-health-192.png",
  "./icons/icon-health-512.png",
  "./budget/",
  "./budget/index.html",
  "./health/",
  "./health/index.html"
];

const fresh = r => r.mode === 'navigate' || r.url.endsWith('.webmanifest');

self.addEventListener('install', e => e.waitUntil(
  caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting())
));

self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('routine-v-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
));

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  if (fresh(r)) {
    e.respondWith(
      Promise.race([fetch(r.url, { cache: 'no-cache' }), new Promise((_, no) => setTimeout(no, 3000))])
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(r, copy));
          return res;
        })
        .catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || caches.match('./index.html')))
    );
    return;
  }
  e.respondWith(
    caches.match(r, { ignoreSearch: true }).then(m => m || fetch(r).then(res => {
      if (res && res.status === 200 && (r.url.includes('fonts.googleapis') || r.url.includes('fonts.gstatic') || r.url.includes('cdn') || r.url.includes('cdnjs'))) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(r, copy));
      }
      return res;
    }))
  );
});