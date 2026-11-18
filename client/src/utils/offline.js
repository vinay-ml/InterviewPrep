import { useEffect, useState } from 'react';
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const API_CACHE_NAME = 'interviewprep-api-v1';
export const API_FRESH_TTL_MS = 24 * 60 * 60 * 1000;

export const OFFLINE_WRITE_MESSAGE =
  "You're offline. Adding, editing, and deleting need an internet connection.";
export const OFFLINE_READ_MESSAGE =
  'This topic is not saved on this device yet. Open it once while you are online.';
export const NETWORK_MESSAGE =
  'The server could not be reached. Check your connection and try again.';
export const GENERIC_MESSAGE = 'Something went wrong. Please try again.';

const CACHE_FALLBACK_EVENT = 'interviewprep-cache-fallback';
const servedFromCache = new Map();

const isBrowser = () => typeof window !== 'undefined' && typeof navigator !== 'undefined';

export function readStoredJwt() {
  if (typeof localStorage === 'undefined') return null;

  const stored = localStorage.getItem('token');
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored);
    if (parsed && typeof parsed === 'object') {
      if (parsed.expiry && Date.now() > parsed.expiry) return null;
      if (parsed.token) return parsed.token;
    }
  } catch (error) {
    return stored;
  }

  return stored;
}

export function useOnline() {
  const [online, setOnline] = useState(() => (isBrowser() ? navigator.onLine : true));

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  return online;
}

export function subscribeCacheFallback(listener) {
  const handler = (event) => listener(event.detail || {});
  window.addEventListener(CACHE_FALLBACK_EVENT, handler);
  return () => window.removeEventListener(CACHE_FALLBACK_EVENT, handler);
}

function notifyCacheFallback(detail) {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent(CACHE_FALLBACK_EVENT, { detail }));
}

export function getRequestErrorMessage(error, fallback = GENERIC_MESSAGE) {
  if (!error) return fallback;
  if (typeof error === 'string' && error.trim()) return error;
  if (typeof error.data === 'string' && error.data.trim()) return error.data;
  if (typeof error.data?.message === 'string' && error.data.message.trim())
    return error.data.message;
  if (
    typeof error.message === 'string' &&
    error.message.trim() &&
    !/failed to fetch|aborted/i.test(error.message)
  ) {
    return error.message;
  }
  if (isBrowser() && navigator.onLine === false) return OFFLINE_WRITE_MESSAGE;
  return fallback;
}

function requestMethod(args) {
  if (!args || typeof args === 'string') return 'GET';
  return String(args.method || 'GET').toUpperCase();
}

function resolveRequestUrl(baseUrl, args) {
  const raw = typeof args === 'string' ? args : args?.url || '';
  if (/^https?:\/\//i.test(raw)) return raw;
  const base = String(baseUrl || '').replace(/\/$/, '');
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  return `${base}${path}`;
}

function requestPath(url) {
  try {
    return new URL(url, isBrowser() ? window.location.origin : 'http://localhost').pathname;
  } catch (error) {
    return url;
  }
}

function rememberCacheHit(input, response) {
  if (!response?.headers || response.headers.get('X-Served-From-Cache') !== '1') return;
  const url = typeof input === 'string' ? input : input?.url;
  if (!url) return;
  const cachedAt = Number(response.headers.get('X-Cached-At') || 0);
  servedFromCache.set(url, {
    stale: !cachedAt || Date.now() - cachedAt > API_FRESH_TTL_MS,
  });
}

function takeCacheMarker(url) {
  if (servedFromCache.has(url)) {
    const marker = servedFromCache.get(url);
    servedFromCache.delete(url);
    return marker;
  }

  const path = requestPath(url);
  for (const [key, marker] of servedFromCache.entries()) {
    if (requestPath(key) === path) {
      servedFromCache.delete(key);
      return marker;
    }
  }

  return null;
}

export function createCacheAwareFetch() {
  return async (input, init) => {
    const response = await fetch(input, init);
    rememberCacheHit(input, response);
    return response;
  };
}

async function writeGetCache(url, body) {
  if (!isBrowser() || !('caches' in window)) return;

  try {
    const cache = await caches.open(API_CACHE_NAME);
    await cache.put(
      url,
      new Response(JSON.stringify(body), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Cached-At': String(Date.now()),
        },
      })
    );
  } catch (error) {
    console.warn('Unable to save an offline copy', error);
  }
}

async function readGetCache(url) {
  if (!isBrowser() || !('caches' in window)) return null;

  try {
    const cache = await caches.open(API_CACHE_NAME);
    const cached = await cache.match(url);
    if (!cached) return null;

    const cachedAt = Number(cached.headers.get('X-Cached-At') || 0);
    const data = await cached.json();
    return {
      data,
      stale: !cachedAt || Date.now() - cachedAt > API_FRESH_TTL_MS,
    };
  } catch (error) {
    try {
      const cache = await caches.open(API_CACHE_NAME);
      await cache.delete(url);
    } catch (deleteError) {
      console.warn('Unable to remove a broken offline copy', deleteError);
    }
    console.warn('Unable to read an offline copy', error);
    return null;
  }
}

function shouldUseSavedCopy(error) {
  const status = error?.status;
  if (status === 'FETCH_ERROR' || status === 'TIMEOUT_ERROR' || status === 'PARSING_ERROR')
    return true;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return true;
  if (typeof status === 'number' && status >= 500) return true;
  return false;
}

function normalizeError(error, { isGet }) {
  const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
  const data = error?.data;
  const serverMessage = typeof data === 'string' ? data : data?.message;

  if (serverMessage) {
    return {
      ...error,
      data: typeof data === 'string' ? { message: serverMessage } : data,
    };
  }

  if (error?.status === 'FETCH_ERROR' || error?.status === 'TIMEOUT_ERROR' || offline) {
    let message = NETWORK_MESSAGE;
    let code = 'NETWORK';

    if (!isGet && offline) {
      message = OFFLINE_WRITE_MESSAGE;
      code = 'OFFLINE';
    } else if (isGet && offline) {
      message = OFFLINE_READ_MESSAGE;
      code = 'OFFLINE_NO_CACHE';
    }

    return {
      status: 503,
      data: { message, code },
    };
  }

  return {
    ...error,
    data: { message: GENERIC_MESSAGE },
  };
}

export function createOfflineAwareBaseQuery({ cacheGet = false, ...fetchOptions }) {
  const rawBaseQuery = fetchBaseQuery({
    ...fetchOptions,
    fetchFn: fetchOptions.fetchFn || createCacheAwareFetch(),
  });

  return async (args, api, extraOptions) => {
    const method = requestMethod(args);
    const isGet = method === 'GET';
    const offline = typeof navigator !== 'undefined' && navigator.onLine === false;

    if (!isGet && offline) {
      return {
        error: {
          status: 503,
          data: { message: OFFLINE_WRITE_MESSAGE, code: 'OFFLINE' },
        },
      };
    }

    let result;
    try {
      result = await rawBaseQuery(args, api, extraOptions);
    } catch (error) {
      result = {
        error: {
          status: 'FETCH_ERROR',
          error: error?.message || NETWORK_MESSAGE,
        },
      };
    }

    if (api.signal?.aborted) return result;

    const url = resolveRequestUrl(fetchOptions.baseUrl, args);
    const cacheMarker = takeCacheMarker(url);

    if (cacheGet && isGet && result?.data) {
      if (cacheMarker) {
        notifyCacheFallback({ stale: cacheMarker.stale });
      } else {
        await writeGetCache(url, result.data);
        notifyCacheFallback({ clear: true });
      }
      return result;
    }

    if (cacheGet && isGet && result?.error && shouldUseSavedCopy(result.error)) {
      const cached = await readGetCache(url);
      if (cached?.data) {
        notifyCacheFallback({ stale: cached.stale });
        return { data: cached.data };
      }
    }

    if (result?.error) {
      return { error: normalizeError(result.error, { isGet }) };
    }

    return result;
  };
}
