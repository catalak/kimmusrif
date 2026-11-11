const CACHE_NAME = 'kimmusrif-v12';
const urlsToCache = ['./', './index.html', './css/style.css', './js/app.js', './js/core.js', './js/views.js', './js/storage.js'];

// Kurulum: Yeni SW anında beklemeyi bırakır
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Aktivasyon: Eski cache'leri acımasızca siler ve kontrolü hemen ele alır
self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eski önbellek silindi:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// İstek Yönetimi: Önce Ağ (Network First), sonra Cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Ağdan geçerli, taze bir yanıt aldıysak bunu hemen önbelleğe de yazalım
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response; // Taze dosyayı ekrana bas
      })
      .catch(() => {
        // İnternet yoksa veya ağ hatası olursa cihazdaki kopyayı (cache) ver
        return caches.match(event.request);
      })
  );
});