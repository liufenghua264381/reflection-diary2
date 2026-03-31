const CACHE_NAME = 'reflection-diary-v1';
const urlsToCache = [
  '/',
  '/reflection_diary.html',
  '/manifest.json'
];

// 安装 Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache).catch(() => {
          // 如果缓存失败，继续
          return Promise.resolve();
        });
      })
  );
  self.skipWaiting();
});

// 激活 Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 拦截请求
self.addEventListener('fetch', event => {
  // 只处理 GET 请求
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果缓存中有，返回缓存
        if (response) {
          return response;
        }

        return fetch(event.request).then(response => {
          // 检查是否是有效的响应
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // 克隆响应
          const responseToCache = response.clone();

          // 缓存新的响应
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // 离线时返回缓存的页面
        return caches.match('/reflection_diary.html');
      })
  );
});

// 后台同步（可选）
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // 这里可以添加数据同步逻辑
  return Promise.resolve();
}
