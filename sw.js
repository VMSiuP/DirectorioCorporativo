const CACHE_NAME = 'directorio-v3';
const ASSETS = [
  './',
  './index.html',
  './logo-app_192.png',
  './logo-app_512.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/fuse.js/6.6.2/fuse.min.js'
];

// 1. Instalación: guardar la carcasa de la app
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting(); // Activar inmediatamente sin esperar pestañas cerradas
});

// 2. Activación: limpiar cachés antiguas
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim(); // Tomar control de todas las pestañas abiertas
});

// 3. Interceptación de peticiones: red primero, caché como respaldo
self.addEventListener('fetch', (e) => {
  e.respondWith(
    (async () => {
      try {
        const response = await fetch(e.request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(e.request, response.clone());
        return response;
      } catch (error) {
        const cachedResponse = await caches.match(e.request);
        if (cachedResponse) return cachedResponse;
        throw error;
      }
    })()
  );
});
