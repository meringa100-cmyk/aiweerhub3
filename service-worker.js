const CACHE_NAME = 'ai-weerhub-v46';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Live weer- en model-API's altijd rechtstreeks ophalen.
  if (url.hostname.includes('open-meteo.com') ||
      url.hostname.includes('rainviewer.com') ||
      url.hostname.includes('unpkg.com')) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }

  // Eigen app-shell: cache-first.
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
