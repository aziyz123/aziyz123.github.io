const CACHE_NAME = 'oquv-vositalari-v2';

// Only files that actually exist in the repository.
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/slayd-yaratuvchi.html',
  '/sinf-musobaqasi.html',
  '/imtihon.html',
  '/fayl-uzatish.html',
  '/dars-jadvali.html',
  '/aqlli-takrorlash.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      // Add each file separately so one missing file cannot block the rest.
      .then((cache) => Promise.all(CORE_ASSETS.map((url) => cache.add(url).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network-first: always try to fetch the latest version, fall back to cache when offline.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // leave Firebase, CDNs, fonts alone

  event.respondWith(
    fetch(req, { cache: 'no-cache' })
      .then((res) => {
        // Keep a copy for offline use (skip URLs with ?query such as ?exam=1234 to avoid cache bloat).
        if (res && res.status === 200 && res.type === 'basic' && !url.search) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(req, { ignoreSearch: true }).then((hit) => {
          if (hit) return hit;
          if (req.mode === 'navigate') return caches.match('/');
          return undefined;
        })
      )
  );
});
