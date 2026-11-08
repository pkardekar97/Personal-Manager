// Routine unified service worker v301 (fully offline: libraries and fonts are bundled)
const CACHE = 'routine-v-301';
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
  "./health/index.html",
  "./budget/vendor/chart.umd.js",
  "./budget/vendor/fontawesome/css/all.min.css",
  "./budget/vendor/fontawesome/webfonts/fa-brands-400.woff2",
  "./budget/vendor/fontawesome/webfonts/fa-regular-400.woff2",
  "./budget/vendor/fontawesome/webfonts/fa-solid-900.woff2",
  "./budget/vendor/fontawesome/webfonts/fa-v4compatibility.woff2",
  "./budget/vendor/fonts/plus-jakarta-sans-latin-400-normal.woff2",
  "./budget/vendor/fonts/plus-jakarta-sans-latin-500-normal.woff2",
  "./budget/vendor/fonts/plus-jakarta-sans-latin-600-normal.woff2",
  "./budget/vendor/fonts/plus-jakarta-sans-latin-700-normal.woff2",
  "./budget/vendor/fonts/plus-jakarta-sans-latin-800-normal.woff2",
  "./budget/vendor/tailwind.css",
  "./fonts/inter-latin-300-normal.woff2",
  "./fonts/inter-latin-400-normal.woff2",
  "./fonts/inter-latin-500-normal.woff2",
  "./fonts/inter-latin-600-normal.woff2",
  "./fonts/montserrat-latin-400-normal.woff2",
  "./fonts/montserrat-latin-500-normal.woff2",
  "./fonts/montserrat-latin-600-normal.woff2",
  "./fonts/montserrat-latin-700-normal.woff2"
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