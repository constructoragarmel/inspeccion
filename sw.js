// Copia local del formulario, para que abra sin señal.
//
// Al subir una versión nueva hay que subir el número de VERSION: eso es lo que
// hace que los teléfonos se traigan la copia nueva la próxima vez que tengan
// internet. Si no se sube, siguen abriendo la vieja.
const VERSION = 'garmel-inspeccion-v31';
const ARCHIVOS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSION)
      .then(c => c.addAll(ARCHIVOS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Primero la copia local — así abre instantáneo y sin señal. En paralelo, si
// hay internet, se trae la versión nueva y la deja lista para la próxima vez.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(guardada => {
      const red = fetch(e.request).then(r => {
        if (r && r.status === 200 && r.type === 'basic') {
          const copia = r.clone();
          caches.open(VERSION).then(c => c.put(e.request, copia));
        }
        return r;
      }).catch(() => guardada);
      return guardada || red;
    })
  );
});
