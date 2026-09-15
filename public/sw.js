// FLOW PWA — service worker mínimo e seguro.
// Sem cache de dados privados: tudo é servido direto da rede (network-first).

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Ignora requisições não-GET e de outras origens (Supabase, fontes, etc.)
  if (event.request.method !== 'GET') return
  if (url.origin !== self.location.origin) return

  // Sempre busca na rede (dados sempre atuais). Nunca armazena em cache.
  event.respondWith(fetch(event.request))
})
