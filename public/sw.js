const CACHE_NAME = 'portakey-v1'

const PRECACHE_URLS = [
  '/',
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

  // Skip non-GET and cross-origin requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  // Skip JMA API — always network-first (weather data)
  if (url.hostname === 'www.jma.go.jp') return

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached

      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response
          }
          const toCache = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, toCache))
          return response
        })
        .catch(() => cached)
    })
  )
})
