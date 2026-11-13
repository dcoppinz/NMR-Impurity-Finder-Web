/* NMR Impurity Finder offline app shell; no analytics or network APIs. */
const VERSION = 'nmr-pwa-v0.6-f68fdec9';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './favicon.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('nmr-pwa-') && k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const req=event.request;
  if (req.method !== 'GET') return;
  const url=new URL(req.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(new URL(self.registration.scope).pathname)) return;
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).then(res => {
      if(res.ok) { const copy=res.clone(); caches.open(VERSION).then(cache=>cache.put(req,copy)); }
      return res;
    }).catch(() => caches.match(req).then(cached => cached || caches.match('./index.html'))));
  } else {
    event.respondWith(caches.match(req).then(cached => cached || fetch(req).then(res => {
      if(res.ok) {const copy=res.clone(); caches.open(VERSION).then(cache=>cache.put(req,copy));}
      return res;
    })));
  }
});
