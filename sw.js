const CACHE_NAME = 'oquv-vositalari-v22';

// Sayt fayllari (oflayn ochilishi uchun oldindan saqlanadi).
const LOCAL_ASSETS = [
  '/', '/index.html', '/manifest.json',
  '/slayd-yaratuvchi.html', '/sinf-musobaqasi.html', '/imtihon.html', '/jang-xaritasi.html', '/muzey.html', '/muzey-app.js', '/muzey-registon.js', '/muzey-oqsaroy.js', '/muzey-pult.html', '/muzey-pult-host.js', '/pultlink.js', '/lib/qrcode.js', '/temur-janglari.js', '/theme.css', '/theme.js', '/fayl-uzatish.html',
  '/dars-jadvali.html', '/aqlli-takrorlash.html', '/yurishlar-xaritasi.html', '/amir-temur-kengayishi.html',
  '/fayl-core.js', '/fayl-ui.js', '/fayl-telegram.js', '/fayl-stash.js', '/fayl-stash-api.js', '/fayl-storage.js',
  '/aqlli-c1a.js', '/aqlli-c1b.js', '/aqlli-core2.js', '/aqlli-import.js', '/aqlli-prompt.js',
  '/icons/icon-192.png', '/icons/icon-512.png', '/icons/icon.svg',
  '/temur-map-bg.jpg',
  '/data/events.json', '/data/empires.json', '/data/battles.json',
  '/data/campaigns/timur.json', '/data/campaigns/timur-storyboard.json',
  '/assets/atlas-map.jpg', '/assets/temur-portrait.jpg'
];

// Tashqi kutubxonalar (versiyasi qotirilgan, shuning uchun doim keshdan olinadi).
const CDN_ASSETS = [
  'https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
  'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js',
  'https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.13.0/firebase-database-compat.js'
];

// Shriftlar va kutubxonalar: birinchi onlayn ochilishda keshga tushadi.
const CACHE_FIRST_HOSTS = [
  'cdn.jsdelivr.net', 'cdnjs.cloudflare.com', 'unpkg.com',
  'fonts.googleapis.com', 'fonts.gstatic.com'
];
function isCacheFirst(url) {
  if (CACHE_FIRST_HOSTS.includes(url.hostname)) return true;
  return url.hostname === 'www.gstatic.com' && url.pathname.startsWith('/firebasejs/');
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all([
        ...LOCAL_ASSETS.map((u) => cache.add(u).catch(() => {})),
        ...CDN_ASSETS.map((u) =>
          fetch(u, { mode: 'cors' }).then((r) => { if (r && r.ok) return cache.put(u, r); }).catch(() => {})
        )
      ])
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function fetchWithTimeout(req, ms) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  return fetch(req, { cache: 'no-cache', signal: ctrl.signal }).finally(() => clearTimeout(t));
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Kutubxona va shriftlar: avval keshdan, bo'lmasa tarmoqdan (va keshga saqlaydi).
  if (url.origin !== self.location.origin) {
    if (!isCacheFirst(url)) return; // Firebase ma'lumotlar bazasi va boshqalar tegilmaydi
    event.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res && (res.ok || res.type === 'opaque')) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy));
        }
        return res;
      }))
    );
    return;
  }

  // Sayt fayllari: darhol keshdan beradi, orqada yangisini yuklab qo'yadi (tez ochilish uchun).
  const refresh = () => fetchWithTimeout(req, 8000).then((res) => {
    const cacheable = res && res.status === 200 && res.type === 'basic' &&
      (!url.search || req.destination === 'script' || req.destination === 'style' || req.destination === 'image');
    if (cacheable) { const copy = res.clone(); caches.open(CACHE_NAME).then((c) => c.put(req, copy)); }
    return res;
  });
  event.respondWith(
    caches.match(req, { ignoreSearch: !!(url.search && req.mode === 'navigate') }).then((hit) => {
      if (hit && !(req.mode === 'navigate' && /[?&]exam=/.test(url.search))) { event.waitUntil(refresh().catch(() => {})); return hit; }
      return refresh().catch(() => {
        if (req.mode === 'navigate') return caches.match('/index.html');
        return Response.error();
      });
    })
  );
});
