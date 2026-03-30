const CACHE_NAME = 'portakey-v2'

// Only precache data files (not the app shell — hashed assets are handled by HTTP cache)
const PRECACHE_URLS = [
  '/data/contents.json',
  '/data/columns.json',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET and cross-origin
  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  // Skip JMA weather API — always network
  if (url.hostname === 'www.jma.go.jp') return

  // Skip hashed assets (/assets/*) — they have content hashes,
  // so the browser's own HTTP cache handles them correctly.
  // Never let SW cache these to avoid serving HTML from SPA fallback.
  if (url.pathname.startsWith('/assets/')) return

  // Navigation requests: network-first, offline fallback to cached shell
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/'))
    )
    return
  }

  // Data files & static assets: cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached

      return fetch(request).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const toCache = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, toCache))
        }
        return response
      }).catch(() => cached)
    })
  )
})
