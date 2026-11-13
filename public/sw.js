// Trung Y Văn HIU service worker.
// - Chưa đăng nhập: không lưu mã hay nội dung học; mất mạng thì hiện trang báo cần kết nối.
// - Sau khi máy chủ đã xác minh phiên: trang gửi TYV_OFFLINE_SHELL {enabled:true} kèm danh sách tệp của ứng dụng;
//   service worker lưu các tệp đó để học tiếp khi mất mạng. Đăng xuất hoặc phiên bị từ chối thì xoá toàn bộ.
// - Luôn ưu tiên mạng; bản lưu chỉ dùng khi không tải được.
const CACHE_NAME = 'trung-y-van-hiu-auth-v2';
const SHELL_CACHE = 'trung-y-van-hiu-shell-v1';
const SHELL_MARK = new URL('./__offline-shell-enabled', self.registration.scope).href;
const SAFE_ASSETS = ['./manifest.webmanifest', './icon.svg'];
const OFFLINE_PAGE = '<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Trung Y Văn HIU</title><body style="font-family:system-ui;padding:32px;max-width:560px;margin:auto"><h2>Cần kết nối Internet</h2><p>Lần đầu trên thiết bị này, ứng dụng cần kết nối để xác minh phiên đăng nhập. Sau khi đã đăng nhập một lần, bạn có thể học tiếp khi mất mạng.</p></body></html>';

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
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME && key !== SHELL_CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

async function shellEnabled() {
  try {
    const cache = await caches.open(SHELL_CACHE);
    return Boolean(await cache.match(SHELL_MARK));
  } catch { return false; }
}

async function putInShell(request, response) {
  if (!response || !response.ok || response.type === 'opaque') return;
  try {
    const cache = await caches.open(SHELL_CACHE);
    await cache.put(request, response);
  } catch {}
}

async function fromShell(request, { navigation = false } = {}) {
  try {
    const cache = await caches.open(SHELL_CACHE);
    // ignoreVary: máy chủ có thể trả "Vary: Origin"; bản lưu được tải không kèm Origin nên phải bỏ qua khi tra.
    const exact = await cache.match(request, { ignoreVary: true });
    if (exact) return exact;
    const loose = await cache.match(request, { ignoreSearch: true, ignoreVary: true });
    if (loose) return loose;
    if (navigation) return (await cache.match(self.registration.scope, { ignoreSearch: true, ignoreVary: true })) || null;
  } catch {}
  return null;
}

self.addEventListener('message', event => {
  const data = event.data || {};
  if (data.type !== 'TYV_OFFLINE_SHELL') return;
  event.waitUntil((async () => {
    if (!data.enabled) { await caches.delete(SHELL_CACHE); return; }
    const cache = await caches.open(SHELL_CACHE);
    await cache.put(SHELL_MARK, new Response('1', { headers: { 'Cache-Control': 'no-store' } }));
    const scope = self.registration.scope;
    const urls = [scope, ...(Array.isArray(data.urls) ? data.urls : [])]
      .map(value => { try { return new URL(String(value), scope); } catch { return null; } })
      .filter(url => url && url.origin === self.location.origin && url.href.startsWith(scope))
      .slice(0, 60);
    await Promise.all(urls.map(async url => {
      try {
        const response = await fetch(url.href, { cache: 'no-store' });
        if (response.ok) await cache.put(url.href, response);
      } catch {}
    }));
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(event.request, { cache: 'no-store' });
        if (await shellEnabled()) await putInShell(event.request, response.clone());
        return response;
      } catch {
        const cached = (await shellEnabled()) ? await fromShell(event.request, { navigation: true }) : null;
        return cached || new Response(OFFLINE_PAGE, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
      }
    })());
    return;
  }

  if (url.pathname.endsWith('/manifest.webmanifest') || url.pathname.endsWith('/icon.svg')) {
    event.respondWith(
      caches.match(event.request).then(cached => cached || fetch(event.request))
    );
    return;
  }

  // Mã và dữ liệu của ứng dụng: luôn lấy từ mạng; chỉ lưu lại khi phiên đã được xác minh, và chỉ dùng bản lưu khi mất mạng.
  event.respondWith((async () => {
    try {
      const response = await fetch(event.request, { cache: 'no-store' });
      if (await shellEnabled()) await putInShell(event.request, response.clone());
      return response;
    } catch (error) {
      const cached = (await shellEnabled()) ? await fromShell(event.request) : null;
      if (cached) return cached;
      throw error;
    }
  })());
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const open = list.find(client => 'focus' in client);
      if (open) return open.focus();
      return self.clients.openWindow(self.registration.scope);
    })
  );
});
