/* Offline cache for InterviewPrep.
 * API copies stay on the device after a topic is opened.
 * A copy older than API_FRESH_TTL_MS is still shown when the network fails,
 * and the response is marked stale so the page can say so.
 */
const SHELL_CACHE = 'interviewprep-shell-v1';
const API_CACHE = 'interviewprep-api-v1';
const IMAGE_CACHE = 'interviewprep-images-v1';
const API_FRESH_TTL_MS = 24 * 60 * 60 * 1000;
const API_TIMEOUT_MS = 20000;
const KEEP_CACHES = new Set([SHELL_CACHE, API_CACHE, IMAGE_CACHE]);

const OFFLINE_WRITE_MESSAGE =
  "You're offline. Adding, editing, and deleting need an internet connection.";
const OFFLINE_READ_MESSAGE =
  'This topic is not saved on this device yet. Open it once while you are online.';

const SHELL_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      await Promise.all(
        SHELL_FILES.map(async (url) => {
          try {
            const response = await fetch(url, { cache: 'reload' });
            if (response && response.ok) await cache.put(url, response);
          } catch (error) {
            // A missing icon should not block the rest of the app shell.
          }
        })
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => !KEEP_CACHES.has(key)).map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) return;

  let url;
  try {
    url = new URL(request.url);
  } catch (error) {
    return;
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  if (
    url.pathname.startsWith('/socket.io') ||
    url.pathname.includes('hot-update') ||
    url.pathname.includes('sockjs-node')
  ) {
    return;
  }

  if (request.method !== 'GET') {
    if (url.pathname.startsWith('/api/')) {
      event.respondWith(networkOrWriteError(request));
    }
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (isReadableApi(url)) {
    event.respondWith(networkFirstApi(request));
    return;
  }

  if (isImageRequest(url)) {
    event.respondWith(networkFirstImage(request));
    return;
  }

  if (isShellAsset(url)) {
    event.respondWith(networkFirstAsset(request, SHELL_CACHE));
  }
});

function isReadableApi(url) {
  return url.pathname.startsWith('/api/questions') || url.pathname.startsWith('/api/navigation');
}

function isImageRequest(url) {
  if (url.hostname === 'res.cloudinary.com') return true;
  return url.origin === self.location.origin && url.pathname.startsWith('/assets/');
}

function isShellAsset(url) {
  if (url.origin !== self.location.origin) return false;
  if (url.pathname === '/service-worker.js') return false;
  return (
    url.pathname.startsWith('/static/') ||
    url.pathname === '/manifest.json' ||
    url.pathname === '/favicon.ico' ||
    url.pathname === '/logo192.png' ||
    url.pathname === '/logo512.png' ||
    url.pathname === '/robots.txt'
  );
}

function cacheKey(request) {
  return new Request(request.url, { method: 'GET' });
}

function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Expose-Headers': 'X-Served-From-Cache, X-Cached-At',
    },
  });
}

async function stampApiResponse(response) {
  const headers = new Headers(response.headers);
  headers.set('X-Cached-At', String(Date.now()));
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Expose-Headers', 'X-Served-From-Cache, X-Cached-At');
  const body = await response.clone().blob();
  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function serveApiCache(cache, request) {
  const cached = await cache.match(cacheKey(request));
  if (!cached) return null;

  try {
    const headers = new Headers(cached.headers);
    const cachedAt = Number(headers.get('X-Cached-At') || 0);
    headers.set('X-Served-From-Cache', '1');
    headers.set('X-Cache-Stale', !cachedAt || Date.now() - cachedAt > API_FRESH_TTL_MS ? '1' : '0');
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Expose-Headers', 'X-Served-From-Cache, X-Cached-At, X-Cache-Stale');
    const body = await cached.blob();
    return new Response(body, {
      status: cached.status || 200,
      statusText: cached.statusText,
      headers,
    });
  } catch (error) {
    await cache.delete(cacheKey(request));
    return null;
  }
}

function fetchWithTimeout(request, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  // Build a fresh request. Reusing the page request with a second abort signal
  // makes the browser cancel the call before the API can answer.
  return fetch(request.url, {
    method: request.method,
    headers: request.headers,
    mode: request.mode === 'navigate' ? 'same-origin' : request.mode,
    credentials: request.credentials,
    cache: 'no-store',
    redirect: 'follow',
    signal: controller.signal,
  }).finally(() => clearTimeout(timer));
}

async function networkOrWriteError(request) {
  try {
    return await fetch(request);
  } catch (error) {
    return jsonResponse(503, { message: OFFLINE_WRITE_MESSAGE, code: 'OFFLINE' });
  }
}

async function networkFirstApi(request) {
  const cache = await caches.open(API_CACHE);

  try {
    const response = await fetchWithTimeout(request, API_TIMEOUT_MS);
    if (response && response.ok) {
      const stamped = await stampApiResponse(response);
      try {
        await cache.put(cacheKey(request), stamped.clone());
      } catch (error) {
        // Storage can be full. The live response is still usable.
      }
      return stamped;
    }
    if (response) return response;
  } catch (error) {
    const cached = await serveApiCache(cache, request);
    if (cached) return cached;
    return offlineReadResponse();
  }

  const cached = await serveApiCache(cache, request);
  if (cached) return cached;
  return offlineReadResponse();
}

function offlineReadResponse() {
  const offline = self.navigator && self.navigator.onLine === false;
  return jsonResponse(503, {
    message: offline
      ? OFFLINE_READ_MESSAGE
      : 'The server could not be reached. Check your connection and try again.',
    code: offline ? 'OFFLINE_NO_CACHE' : 'NETWORK',
  });
}

async function networkFirstNavigation(request) {
  const cache = await caches.open(SHELL_CACHE);

  try {
    const response = await fetch(request);
    if (response && response.ok) {
      try {
        await cache.put('/index.html', response.clone());
        await cache.put(request, response.clone());
      } catch (error) {
        // Ignore shell cache write failures.
      }
      return response;
    }
  } catch (error) {
    // Fall through to the saved shell.
  }

  return (
    (await cache.match(request)) ||
    (await cache.match('/index.html')) ||
    (await cache.match('/')) ||
    new Response('You are offline, and this page is not saved on this device yet.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  );
}

async function networkFirstImage(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const key = cacheKey(request);

  try {
    const response = await fetch(request);
    if (response && (response.ok || response.type === 'opaque')) {
      try {
        await cache.put(key, response.clone());
      } catch (error) {
        // Ignore image cache write failures.
      }
      return response;
    }
    if (response) return response;
  } catch (error) {
    const cached = await cache.match(key);
    if (cached) return cached;
    return new Response('', { status: 504 });
  }

  const cached = await cache.match(key);
  if (cached) return cached;
  return new Response('', { status: 504 });
}

async function networkFirstAsset(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request);
    if (response && (response.ok || response.type === 'opaque')) {
      try {
        await cache.put(request, response.clone());
      } catch (error) {
        // Ignore shell cache write failures.
      }
      return response;
    }
    if (response) return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response('', { status: 504 });
  }

  const cached = await cache.match(request);
  if (cached) return cached;
  return new Response('', { status: 504 });
}
