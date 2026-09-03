// Copia local del formulario, para que abra sin señal.
//
// Al subir una versión nueva hay que subir el número de VERSION: eso es lo que
// hace que los teléfonos se traigan la copia nueva la próxima vez que tengan
// internet. Si no se sube, siguen abriendo la vieja.
const VERSION = 'garmel-inspeccion-v50';
const ARCHIVOS = [
  // './' NO va en la lista: toda navegación se guarda bajo './index.html'
  // —ver claveDeCache— y tenerla suelta dejaba DOS copias de 210 KB del mismo
  // archivo en el teléfono.
  './index.html',        // el menú
  './inspeccion.html',   // el formulario de torre y apartamento
  './servicios.html',    // el de servicios públicos
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

// Al activarse una versión nueva se le AVISA a la página, que decide qué hacer:
// si nadie ha tocado el formulario se recarga sola, y si hay algo escrito
// espera con un aviso. Sin esto había que abrir el enlace dos veces —la primera
// servía la copia vieja y traía la nueva por detrás—, y quien abría una sola vez
// se quedaba con la versión anterior sin enterarse.
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => {
      const viejas = ks.filter(k => k !== VERSION);
      // Si no había ninguna copia anterior, esta es la primera instalación:
      // la página ya es la de esta versión y no hay nada que avisar.
      const esActualizacion = viejas.length > 0;
      return Promise.all(viejas.map(k => caches.delete(k)))
        .then(() => self.clients.claim())
        .then(() => esActualizacion ? self.clients.matchAll({ type: 'window' }) : [])
        .then(cs => cs.forEach(c => c.postMessage({ garmel: 'version-nueva', version: VERSION })));
    })
  );
});

// El formulario es UN archivo, se pida como se pida. `?prueba=1` no lo cambia,
// y guardarlo aparte dejaba dos copias de 210 KB en el teléfono; con cada
// dirección distinta, una más. Se guarda siempre bajo la misma clave.
function claveDeCache(request) {
  const u = new URL(request.url);
  // Solo la RAÍZ se colapsa a index.html. Antes se colapsaba CUALQUIER
  // navegación, que estaba bien con una sola página y deja de estarlo con tres:
  // abrir servicios.html habría devuelto el menú desde la caché, sin red y sin
  // ningún aviso. Cada página tiene ahora su propia entrada.
  if (u.pathname === '/' || u.pathname.endsWith('/')) {
    return new Request(new URL('./index.html', self.registration.scope).href);
  }
  return request;
}

// Primero la copia local — así abre instantáneo y sin señal. En paralelo, si
// hay internet, se trae la versión nueva y la deja lista para la próxima vez.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const clave = claveDeCache(e.request);
  e.respondWith(
    caches.match(clave).then(guardada => {
      const red = fetch(e.request).then(r => {
        if (r && r.status === 200 && r.type === 'basic') {
          const copia = r.clone();
          caches.open(VERSION).then(c => c.put(clave, copia));
        }
        return r;
      }).catch(() => guardada);
      return guardada || red;
    })
  );
});
