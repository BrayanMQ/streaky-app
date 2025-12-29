// Service Worker for PWA - Streaky App
// Cache version - increment to force update
const CACHE_VERSION = 'v1';
const STATIC_CACHE = `streaky-static-${CACHE_VERSION}`;
const API_CACHE = `streaky-api-${CACHE_VERSION}`;

// Static assets to cache on installation
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Service Worker installation
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Force immediate activation
  self.skipWaiting();
});

// Service Worker activation
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old caches
          if (cacheName !== STATIC_CACHE && cacheName !== API_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all pages immediately
  return self.clients.claim();
});

// Listen for messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Intercept requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Ignore browser extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Strategy: Cache First for static assets
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Strategy: Network First for API data (Supabase)
  if (isApiRequest(url)) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  // Strategy: Network First for HTML pages
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirst(request, STATIC_CACHE));
    return;
  }

  // For other requests, try network first
  event.respondWith(fetch(request));
});

// Check if it's a static asset
function isStaticAsset(url) {
  return (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/manifest.json' ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.woff2')
  );
}

// Check if it's a Supabase API request
function isApiRequest(url) {
  return (
    url.hostname.includes('supabase.co') &&
    (url.pathname.startsWith('/rest/') || url.pathname.startsWith('/auth/'))
  );
}

// Strategy: Cache First
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[SW] Fetch failed:', error);
    // If there's an error and we have something cached, return it even if old
    if (cached) {
      return cached;
    }
    throw error;
  }
}

// Strategy: Network First
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request);
    if (response.ok) {
      // Cache successful response
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[SW] Network request failed, trying cache:', error);
    // If network fails, try to return from cache
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    // If no cache, return error
    throw error;
  }
}

