const staticChat= "dev-chat-pwa-MarcoGomez"
const assets = [
  "./",
  "./index.html",
  "./style.css",
  "./index.js",
  "./icono.png"
]
self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(staticChat).then(cache => {
      cache.addAll(assets)
    })
  )
});

//una vez que se instala el SW, se activa y busca los recursos para hacer que funcione sin conexión
self.addEventListener('activate', activeEvent => {
  activeEvent.waitUntil(
    caches.keys().then(function(names) {
      for (let name of names)
          caches.delete(name);
    })
    .then(
      caches.open(staticChat).then(cache => {
        cache.addAll(assets)
      })
    )
  )
});

self.addEventListener("fetch", fetchEvent => {
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then(res => {
      return res || fetch(fetchEvent.request)
    })
  )
});


self.addEventListener("message", e => {
  if (e.message === "active") {
    self.skipWaiting();
  }
});