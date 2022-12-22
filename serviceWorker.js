const staticChat= "dev-chat-pwa-MarcoGomez"
const assets = [
  "./",
  "./index.html",
  "./index.js",
  "./icono.png"
]
self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(staticChat).then(cache => {
      cache.addAll(assets)
    })
  )
})

self.addEventListener("fetch", fetchEvent => {
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then(res => {
      return res || fetch(fetchEvent.request)
    })
  )
})
