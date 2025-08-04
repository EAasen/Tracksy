/**
 * Tracksy Service Worker
 * 
 * This service worker handles caching assets and providing offline capabilities.
 */

const CACHE_NAME = 'tracksy-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/static/js/main.bundle.js', // Adjust based on your actual build output
  '/static/css/main.bundle.css' // Adjust based on your actual build output
];

// Install event - cache key assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache opened');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting()) // Force activation
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => {
          return name !== CACHE_NAME;
        }).map((name) => {
          return caches.delete(name);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network-first strategy for API calls, cache-first for assets
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // For API calls, use network first, fall back to cache
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone the response before using it
          const responseToCache = response.clone();
          
          // Cache the successful response
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        })
        .catch(() => {
          // If network fails, try to get from cache
          return caches.match(event.request);
        })
    );
  } 
  // For static assets, use cache first, fall back to network
  else {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Return from cache if available
          if (response) {
            return response;
          }
          
          // Otherwise fetch from network
          return fetch(event.request).then(
            (response) => {
              // Return the network response
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              
              // Clone and cache the response for future
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
              
              return response;
            }
          );
        })
    );
  }
});
