const CACHE_NAME = 'marksheet-v2'; // Changed version to bust old cache
const STATIC_ASSETS = [
  './',
  'index.html',
  'about.html',
  'privacy.html',
  'terms.html',
  'manifest.json',
  'offline.html',
  'pwa-icons/icon-144x144.png',
  'pwa-icons/icon-192x192.png',
  'pwa-icons/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use individual add() so one 404 doesn't break everything
      return Promise.allSettled(
        STATIC_ASSETS.map(url => cache.add(url))
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests from our own origin
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') return caches.match('offline.html');
      });
    })
  );
});
