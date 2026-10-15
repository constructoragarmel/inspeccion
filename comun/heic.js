// ── 186. Las fotos HEIC se convierten en el teléfono (15-oct-2026) ──────────────────────────────────────────────
// Algunas cámaras guardan en HEIC/HEIF (Samsung con «Ahorro de espacio», iPhone con «Alta eficiencia»). Chrome en
// Android no sabe dibujarlas, así que la reducción fallaba: el formulario de obra mandaba entonces la foto ORIGINAL —de
// 1,5 a 10 MB cada una, hasta 8160×6120—, el envío tardaba minutos y se cortaba, el inspector reenviaba, y en el PDF salía
// el ícono de imagen rota porque el PDF no dibuja HEIC (Génesis Márquez, T-04 y T-14, del 5 al 13-oct: 38 fotos). Los otros
// tres formularios la dejaban fuera sin decir nada. Pedirle a cada inspector que cambie la cámara a JPEG frena el trabajo.
// Ahora: si la foto es HEIC, se convierte a JPEG aquí mismo con heic2any (libheif en WebAssembly; `heic2any.min.js`,
// 1,3 MB, que el service worker guarda para que funcione sin señal), y sigue la reducción de siempre a 1280 px. Mientras
// convierte, un cartel con los segundos tapa la pantalla (una foto de 12 MP tarda unos segundos; una de 50 MP, más). Si
// aun así no se puede leer, se avisa y la foto no entra: nunca viaja un original entero.
const HEIC_MARCAS = ['heic', 'heix', 'hevc', 'hevx', 'heim', 'heis', 'hevm', 'hevs', 'mif1', 'msf1'];
let _heicLib = null, _heicCola = Promise.resolve(), _heicEnCola = 0;

// ¿Es HEIC? Por el tipo o el nombre, y si no lo dicen, por los primeros bytes: algunos teléfonos la entregan como «.jpg».
async function _esHeic(file){
  if (/^image\/hei[cf]/i.test(file.type || '') || /\.hei[cf]$/i.test(file.name || '')) return true;
  try {
    const b = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    const s = String.fromCharCode.apply(null, b);
    return s.substr(4, 4) === 'ftyp' && HEIC_MARCAS.indexOf(s.substr(8, 4).toLowerCase()) >= 0;
  } catch (e) { return false; }
}

function _heicCargar(){
  if (window.heic2any) return Promise.resolve();
  if (!_heicLib) _heicLib = new Promise((bien, mal) => {
    const s = document.createElement('script');
    s.src = 'heic2any.min.js';
    s.onload = () => window.heic2any ? bien() : mal(new Error('el conversor de fotos no cargó'));
    s.onerror = () => { _heicLib = null; s.remove(); mal(new Error('no se pudo cargar el conversor de fotos')); };
    document.head.appendChild(s);
  });
  return _heicLib;
}

// Devuelve el mismo archivo si no es HEIC, o un JPEG convertido si lo es. Las conversiones van de una en una (cada una
// ocupa mucha memoria) y `cartel(texto)` las muestra; `cartel('')` lo quita al terminar la última. Rechaza si no se puede.
function aJpegSiHeic(file, cartel){
  return _esHeic(file).then(es => {
    if (!es) return file;
    _heicEnCola++;
    const turno = _heicCola.then(async () => {
      const t0 = Date.now();
      const pinta = () => { if (cartel) cartel('🔄 Convirtiendo la foto al formato del informe…' +
        (_heicEnCola > 1 ? '\n(' + _heicEnCola + ' en cola)' : '') + '\n\n' + Math.round((Date.now() - t0) / 1000) + ' s · no cierre esta pantalla'); };
      pinta();
      const latido = setInterval(pinta, 1000);
      try {
        await _heicCargar();
        const r = await window.heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 });
        return Array.isArray(r) ? r[0] : r;
      } finally {
        clearInterval(latido);
        _heicEnCola--;
        if (cartel && !_heicEnCola) cartel('');
      }
    });
    _heicCola = turno.catch(() => {});
    return turno;
  });
}

function avisoFotoIlegible(e){
  if (e) console.warn('Foto ilegible:', e);
  alert('⚠️ Esta foto no se pudo leer, así que no se agregó.\n\n' +
        'Tómela de nuevo con el botón 📷 de la app, o elija otra foto.' +
        (e && /conversor/.test(String(e.message || e)) ? '\n\n(El conversor de fotos necesita abrir la app una vez con señal.)' : ''));
}
