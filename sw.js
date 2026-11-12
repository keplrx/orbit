const CACHE = 'orbit-v2';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET') return;
  const own = url.origin === self.location.origin;
  const lib = url.hostname === 'cdnjs.cloudflare.com';
  if (!own && !lib) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(req, { ignoreSearch: own });
    const fresh = fetch(req).then(res => { if (res.ok || res.type === 'opaque') c.put(req, res.clone()); return res; });
    if (hit) { fresh.catch(() => {}); return hit; }
    return fresh;
  }));
});
