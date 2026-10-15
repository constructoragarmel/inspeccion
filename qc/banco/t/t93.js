// TANDA 93 · Obra, 15-oct-2026 (v170, cambio 186): las fotos HEIC se convierten en el teléfono y nunca viaja una original.
// Génesis Márquez mandó 38 fotos HEIC (T-04 y T-14, del 5 al 13-oct): Chrome no las dibujaba, `loadFoto` mandaba la original
// de 1,5 a 10 MB y el PDF las dejaba rotas. Corre sobre inspeccion.html?prueba=1 en un navegador A LA VISTA (heic2any usa
// WebAssembly y canvas). `prueba.heic` es sintética (3000×4000, hecha con sips), no una foto de obra.
// 1 HEIC con su tipo: entra como JPEG ≤1280 px, con el cartel de conversión mientras tanto y sin él al final
// 2 HEIC disfrazada de «.jpg» (como la entregan algunos teléfonos): igual · 3 un archivo que no es imagen: avisa y NO entra
// 4 una JPEG normal entra sin cartel · 5 lo que viaja al relevo es JPEG chico, nunca la HEIC
localStorage.clear(); await Q.relevo({ borrar: true, tipos: ['inspeccion', 'servicios', 'sha', 'urbanismo'], caido: false, fallar: [], lento: 0, colgar: 0, perder: false });
Q.aceptar = true;
elegirRol('inspector'); await esperar(200);
setAmbito('torre'); await esperar(400);
const heic = await (await fetch('/t/prueba.heic?' + Date.now())).blob();
const basura = await (await fetch('/t/basura.jpg?' + Date.now())).blob();
const slot = k => $('#fslot_hito_estructura_' + k + ' input[type=file]');
const img = k => $('#fimg_hito_estructura_' + k);
const vigilar = () => { const v = { cartel: false }; v.t = setInterval(() => { const c = document.getElementById('cartel-envio'); if (c && /Convirtiendo/.test(c.textContent)) v.cartel = true; }, 50); return v; };
const ancho = src => new Promise(r => { const i = new Image(); i.onload = () => r(Math.max(i.naturalWidth, i.naturalHeight)); i.onerror = () => r(-1); i.src = src; });

// 1
let v = vigilar(); const t1 = Date.now();
Q.ponerFotos(slot(0), [new File([heic], 'IMG_0001.heic', { type: 'image/heic' })]);
const ok1 = await hasta(() => /^data:image\/jpeg/.test(img(0).src || ''), 60000, 100); clearInterval(v.t);
const a1 = ok1 ? await ancho(img(0).src) : 0;
ok('1 · HEIC con su tipo: entra como JPEG de 1280 px de lado mayor, con el cartel de conversión y sin él al final',
   ok1 && a1 === 1280 && v.cartel && !document.getElementById('cartel-envio'),
   'jpeg=' + ok1 + ' lado=' + a1 + ' cartel=' + v.cartel + ' · ' + (Date.now() - t1) + ' ms · ' + Math.round((img(0).src || '').length * 0.75 / 1024) + ' KB');
// 2
v = vigilar();
Q.ponerFotos(slot(1), [new File([heic], '20261007_093012.jpg', { type: 'image/jpeg' })]);
const ok2 = await hasta(() => /^data:image\/jpeg/.test(img(1).src || ''), 60000, 100); clearInterval(v.t);
ok('2 · HEIC disfrazada de «.jpg»: se reconoce por sus bytes y entra como JPEG de 1280 px',
   ok2 && (await ancho(img(1).src)) === 1280 && v.cartel, 'jpeg=' + ok2 + ' cartel=' + v.cartel);
// 3
Q.dialogos = [];
Q.ponerFotos(slot(2), [new File([basura], 'foto.jpg', { type: 'image/jpeg' })]);
await hasta(() => Q.dialogos.some(d => /no se pudo leer/.test(d)), 10000, 100); await esperar(300);
ok('3 · Un archivo que no es imagen: avisa «no se pudo leer» y NO entra (antes entraba tal cual)',
   Q.dialogos.some(d => /no se pudo leer/.test(d)) && !(img(2).getAttribute('src') || '') && img(2).style.display !== 'block',
   (Q.dialogos.slice(-1)[0] || '').slice(0, 60) + ' · src=' + (img(2).getAttribute('src') || '').slice(0, 20));
// 4
v = vigilar();
Q.ponerFotos(slot(3), [await Q.foto(1600, 1200, 9)]);
const ok4 = await hasta(() => /^data:image\/jpeg/.test(img(3).src || ''), 15000, 50); clearInterval(v.t);
ok('4 · Una JPEG normal entra sin cartel de conversión', ok4 && !v.cartel && (await ancho(img(3).src)) === 1280, 'cartel=' + v.cartel);
// 5
const sobre = _fotosParaEnviar().filter(f => /^hito_estructura-/.test(f.nombre));
ok('5 · Lo que viaja al relevo son 3 JPEG de menos de 400 KB; ninguna HEIC',
   sobre.length === 3 && sobre.every(f => /^data:image\/jpeg/.test(f.dato) && f.dato.length * 0.75 < 400 * 1024),
   sobre.map(f => f.nombre + ':' + Math.round(f.dato.length * 0.75 / 1024) + 'KB').join(' '));
nuevoFormulario(); await esperar(300);
