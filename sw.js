// One service worker for the whole site (launcher + budget + health). Pages are fetched fresh when online; the cache is the offline fallback.
const CACHE = 'manager-v-0454eafc7b';
const FILES = [
 "./",
 "./budget/",
 "./health/",
 "./app.webmanifest",
 "./budget/icons/icon-192.png",
 "./budget/icons/icon-512.png",
 "./budget/icons/icon-maskable-512.png",
 "./budget/index.html",
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
 "./health/icons/icon-192.png",
 "./health/icons/icon-512.png",
 "./health/icons/icon-maskable-512.png",
 "./health/index.html",
 "./icons/icon-192.png",
 "./icons/icon-512.png",
 "./icons/icon-maskable-512.png",
 "./index.html"
];
const fresh = r => r.mode === 'navigate' || r.url.endsWith('.webmanifest');
self.addEventListener('install', e => e.waitUntil(
  caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('manager-v-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  if (fresh(r)) {
    e.respondWith(
      Promise.race([fetch(r.url, { cache: 'no-cache' }), new Promise((_, no) => setTimeout(no, 3000))])
        .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); return res; })
        .catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(m => m || fetch(r)));
});
