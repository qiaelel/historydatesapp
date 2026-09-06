const CACHE_NAME = 'history-dates-v1';

// При установке sw можно предварительно закэшировать главную страницу
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                '/',
                '/index.html' // укажите точный путь к главной странице, если он отличается
            ]);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// Перехват запросов и динамическое кэширование
self.addEventListener('fetch', (event) => {
    // Кэшируем только стандартные GET-запросы (например, к вашему домену)
    if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Если ответ успешный, клонируем его и сохраняем в кэш
                if (response.status === 200) {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return response;
            })
            .catch(() => {
                // Если интернета нет, пытаемся достать страницу из кэша
                return caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    // Если в кэше ничего нет, можно вернуть дефолтную заглушку
                });
            })
    );
});