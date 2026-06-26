/* Service worker — cache-first so the Training Journal installs and works offline.
   Bump CACHE when assets change to force a refresh. Asset list is generated from the
   real files in this folder. */
const CACHE = 'training-journal-v1';
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/theme.css",
  "./js/app.js",
  "./js/vendor/react.production.min.js",
  "./js/vendor/react-dom.production.min.js",
  "./fonts/cormorant-garamond-400-2.woff2",
  "./fonts/cormorant-garamond-400i-0.woff2",
  "./fonts/cormorant-garamond-500-3.woff2",
  "./fonts/cormorant-garamond-600-4.woff2",
  "./fonts/cormorant-garamond-600i-1.woff2",
  "./fonts/cormorant-garamond-700-5.woff2",
  "./fonts/inter-400-6.woff2",
  "./fonts/inter-500-7.woff2",
  "./fonts/inter-600-8.woff2",
  "./fonts/inter-700-9.woff2",
  "./fonts/jetbrains-mono-400-10.woff2",
  "./fonts/jetbrains-mono-500-11.woff2",
  "./fonts/noto-serif-jp-700-12.woff2",
  "./fonts/noto-serif-jp-700-13.woff2",
  "./fonts/noto-serif-jp-700-14.woff2",
  "./fonts/noto-serif-jp-700-15.woff2",
  "./fonts/noto-serif-jp-700-16.woff2",
  "./fonts/noto-serif-jp-700-17.woff2",
  "./fonts/noto-serif-jp-700-18.woff2",
  "./fonts/noto-serif-jp-700-19.woff2",
  "./fonts/noto-serif-jp-700-20.woff2",
  "./fonts/noto-serif-jp-700-21.woff2",
  "./fonts/noto-serif-jp-700-22.woff2",
  "./assets/crest-black-silver.png",
  "./assets/crest-red.gif",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
