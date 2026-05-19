// Bali trip — minimal service worker
// Stale-while-revalidate cache so the app works even with patchy Bali wifi
const CACHE = 'bali-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Don't cache Firebase realtime DB or third-party APIs — they need to be live
  if (url.host.includes('firebaseio.com') || url.host.includes('firebasedatabase.app') || url.host.includes('googleapis.com') || url.host.includes('open-meteo.com') || url.host.includes('jsdelivr.net')) return;
  event.respondWith(
    caches.open(CACHE).then((cache) =>
      fetch(req)
        .then((res) => {
          // Only cache successful, basic/same-origin responses
          if (res && res.status === 200 && (res.type === 'basic' || res.type === 'cors')) {
            cache.put(req, res.clone());
          }
          return res;
        })
        .catch(() => cache.match(req))
    )
  );
});
