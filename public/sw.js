// Service Worker for SaafAI Feedback Kiosk & Dashboard PWA
const CACHE_NAME = 'saafai-feedback-v2';

// Import Firebase Messaging background handlers if present
try {
  importScripts('/firebase-messaging-sw.js');
} catch (err) {
  console.warn('[SW] Could not import firebase-messaging-sw.js:', err);
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Never intercept API calls, hot module reloads, or cross-origin requests
  if (url.origin !== self.location.origin) return;
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/webpack-hmr') ||
    url.pathname.includes('/_next/data/')
  ) {
    return;
  }

  // Network-first with safe Response fallback (prevents 'Failed to convert value to Response' error)
  event.respondWith(
    fetch(event.request).catch(async () => {
      // 1. Check if cached response exists
      const cached = await caches.match(event.request);
      if (cached) {
        return cached;
      }

      // 2. For page navigation requests, return a valid HTML offline response
      if (event.request.mode === 'navigate') {
        return new Response(
          '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Offline - SaafAI</title></head><body style="font-family:sans-serif;padding:40px;text-align:center;"><h2>Network connection lost</h2><p>Please check your connection and refresh.</p></body></html>',
          {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          }
        );
      }

      // 3. For any other asset, return a valid 503 Response (never undefined)
      return new Response('Network error occurred', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'text/plain' },
      });
    })
  );
});
