/* Simple service worker: cache-first for static assets, network-first for HTML */
const VERSION = 'v1';
const STATIC_CACHE = `static-${VERSION}`;
const APP_SHELL = [
  '/',
  '/index.html',
  '/vite.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== STATIC_CACHE ? caches.delete(k) : Promise.resolve())))
    )
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const isHTML = request.headers.get('accept')?.includes('text/html');

  if (isHTML) {
    // Network-first for HTML to get fresh content; fallback to cache
    event.respondWith(
      fetch(request)
        .then((resp) => {
          const copy = resp.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
          return resp;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((resp) => {
        const copy = resp.clone();
        caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
        return resp;
      });
    })
  );
});

