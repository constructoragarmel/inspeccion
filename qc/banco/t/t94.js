// TANDA 94 · Servicios, SHA y urbanismo, 15-oct-2026 (v170, cambio 186): las fotos HEIC se convierten en el teléfono.
// Antes la HEIC se quedaba fuera sin decir nada (`reducir` no tenía `onerror`). Se corre en servicios.html, sha.html y
// urbanismo.html (?prueba=1), en un navegador A LA VISTA. `prueba.heic` es sintética (3000×4000).
// 1 dos HEIC elegidas de golpe (una con su tipo, otra disfrazada de «.jpg») entran las dos como JPEG ≤1280 px, de una en una
//   con el cartel · 2 un archivo que no es imagen avisa y no entra · 3 el sobre al relevo lleva JPEG chicos
const pagina = /sha\.html/.test(location.pathname) ? 'sha' : /urbanismo\.html/.test(location.pathname) ? 'urbanismo' : 'servicios';
localStorage.setItem('garmel_clave_envio', 'qc');
await Q.relevo({ borrar: true, tipos: ['inspeccion', 'servicios', 'sha', 'urbanismo'], caido: false, fallar: [], lento: 0, colgar: 0, perder: false });
Q.aceptar = true; nuevoInforme(); await esperar(150); if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
const heic = await (await fetch('/t/prueba.heic?' + Date.now())).blob();
const basura = await (await fetch('/t/basura.jpg?' + Date.now())).blob();
const sec = $('.srv'), sid = sec.id.replace('srv-', '');
if (sec.querySelector('.cuerpo') && sec.querySelector('.cuerpo').hidden) plegar(sid);
const inp = sec.querySelector('input[type=file]'), grid = () => $$('#fotos-' + sid + ' .foto img');
const ancho = src => new Promise(r => { const i = new Image(); i.onload = () => r(Math.max(i.naturalWidth, i.naturalHeight)); i.onerror = () => r(-1); i.src = src; });
// 1
const v = { cartel: false, cola: false }; const vig = setInterval(() => { const c = document.getElementById('cartel-envio'); if (c && /Convirtiendo/.test(c.textContent)) { v.cartel = true; if (/en cola/.test(c.textContent)) v.cola = true; } }, 50);
Q.ponerFotos(inp, [new File([heic], 'IMG_0001.heic', { type: 'image/heic' }), new File([heic], '20261007_093012.jpg', { type: 'image/jpeg' })]);
const ok1 = await hasta(() => grid().length === 2 && grid().every(i => /^data:image\/jpeg/.test(i.src)), 90000, 100); clearInterval(vig);
const lados = ok1 ? await Promise.all(grid().map(i => ancho(i.src))) : [];
ok('1 · ' + pagina + ': dos HEIC de golpe (una disfrazada de «.jpg») entran como JPEG de 1280 px, de una en una con el cartel',
   ok1 && lados.every(l => l === 1280) && v.cartel && v.cola && !document.getElementById('cartel-envio'),
   'fotos=' + grid().length + ' lados=' + lados.join(',') + ' cartel=' + v.cartel + ' cola=' + v.cola);
// 2
Q.dialogos = [];
Q.ponerFotos(inp, [new File([basura], 'foto.jpg', { type: 'image/jpeg' })]);
await hasta(() => Q.dialogos.some(d => /no se pudo leer/.test(d)), 10000, 100); await esperar(300);
ok('2 · ' + pagina + ': un archivo que no es imagen avisa «no se pudo leer» y no entra (antes desaparecía sin aviso)',
   Q.dialogos.some(d => /no se pudo leer/.test(d)) && grid().length === 2, 'fotos=' + grid().length);
// 3
guardar(false); await _escrituraFotos.catch(() => {});
const d = listaGuardada()[0], grupos = await FotosDB.leer(d.id).catch(() => ({}));
const s = sobreDe(d, 'qc', grupos), fs = (s.fotos || []).filter(f => f.nombre.indexOf(sid) === 0);
ok('3 · ' + pagina + ': el sobre al relevo lleva esas dos fotos como JPEG de menos de 400 KB',
   fs.length === 2 && fs.every(f => /^data:image\/jpeg/.test(f.dato) && f.dato.length * 0.75 < 400 * 1024),
   fs.map(f => f.nombre + ':' + Math.round(f.dato.length * 0.75 / 1024) + 'KB').join(' '));
