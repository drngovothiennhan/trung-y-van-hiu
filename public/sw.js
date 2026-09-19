const CACHE_NAME = 'trung-y-van-hiu-auth-v2';
const SAFE_ASSETS = ['./manifest.webmanifest', './icon.svg'];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(SAFE_ASSETS))
      .catch(() => {})
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' }).catch(() =>
        new Response(
          '<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Trung Y Văn HIU</title><body style="font-family:system-ui;padding:32px;max-width:560px;margin:auto"><h2>Cần kết nối Internet</h2><p>Ứng dụng cần kết nối để xác minh phiên đăng nhập trước khi mở nội dung học.</p></body></html>',
          { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } }
        )
      )
    );
    return;
  }

  if (url.pathname.endsWith('/manifest.webmanifest') || url.pathname.endsWith('/icon.svg')) {
    event.respondWith(
      caches.match(event.request).then(cached => cached || fetch(event.request))
    );
    return;
  }

  // Protected app code/data: always fetch from network, never persist it in the service-worker cache.
  event.respondWith(fetch(event.request, { cache: 'no-store' }));
});
