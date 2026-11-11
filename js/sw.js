const CACHE_NAME = 'kimmusrif-v2';
const urlsToCache = ['./', './index.html', './css/style.css', './js/app.js', './js/core.js', './js/views.js', './js/storage.js'];

self.addEventListener('install', event => {
  self.skipWaiting(); // Yeni versiyonu hemen devreye al
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener('activate', event => {
  // Eski önbellek kalıntılarını otomatik temizle
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
});

self.addEventListener('fetch', event => {
  // Önce internetten en güncelini almayı dene, internet yoksa önbellekten (telefondan) yükle
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});