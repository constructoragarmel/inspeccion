// TANDA 8 · Urbanismo: volumen — 30 manzanas, 30 informes con fotos, tanda de 30, cuota llena, 20 secciones + 100 partidas recordadas
const EZ = TORRES_DATA[0].c; const conv = $('#convenio'), torre = $('#torre');
const items = sid => $$('#items-' + sid + ' .item');
const ms = t => Math.round(t) + ' ms'; const kb = b => Math.round(b / 1024) + ' KB';
Object.keys(localStorage).filter(k => /garmel_urb_/.test(k)).forEach(k => localStorage.removeItem(k));
await Q.relevo({ borrar: true, tipos: ['inspeccion', 'servicios', 'sha', 'urbanismo'], caido: false, fallar: [] });
const esperarEnvio = async () => { await esperar(300); return hasta(() => !_tandaEnCurso && !$('#cartel-envio'), 120000); };
const insp = () => Q.elegir($('#inspectores select'), INSPECTORES_DB[1]);

// 1. 30 manzanas agregadas en SR y SB
let t = Date.now();
for (let i = 1; i <= 30; i++){ abrirNuevaManzana(); $('#nm-sector').value = i % 2 ? 'Convenio Rusos' : 'Convenio Chinos'; $('#nm-nombre').value = 'M-' + (100 + i); guardarNuevaManzana(); }
ok('30 manzanas agregadas y recordadas', manzanasRecordadas().length === 30 && TORRES_DATA.length === 39, ms(Date.now() - t));
Q.elegir(conv, 'Convenio Rusos');
ok('SR lista 15; SB lista 15; sin sector 39', [...torre.options].length === 16 && (Q.elegir(conv, 'Convenio Chinos'), [...torre.options].length === 16) && (Q.elegir(conv, ''), [...torre.options].length === 40));

// 2. 30 informes con 39 cantidades + calidad + 2 fotos cada uno
const f2 = [await Q.foto(1600, 1200, 51), await Q.foto(1600, 1200, 52)];
t = Date.now(); let tMax = 0;
for (let i = 1; i <= 30; i++){
  const t0 = Date.now();
  nuevoInforme(); insp(); Q.elegir(conv, i % 2 ? 'Convenio Rusos' : 'Convenio Chinos'); Q.elegir(torre, 'M-' + (100 + i)); await esperar(20); if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
  $$('.item').forEach((it, k) => { Q.escribir(it.querySelector('.cant'), String(k + i)); it.querySelectorAll('.sino button')[k % 4].click(); });
  Q.ponerFotos($('#srv-urb_vialidad input[type=file]'), f2); await hasta(() => $$('#fotos-urb_vialidad .foto img').length === 2, 10000);
  guardar(false); await _escrituraFotos; tMax = Math.max(tMax, Date.now() - t0);
}
const tTotal = Date.now() - t;
ok('30 informes guardados con 39 partidas y 2 fotos', listaGuardada().length === 30 && listaGuardada().every(x => x.general.reduce((s, g) => s + g.items.length, 0) === 39 && x.general[5].fotos.length === 2), ms(tTotal) + ' total · peor informe ' + ms(tMax));
const tam = (localStorage.getItem('garmel_urb_list') || '').length + (localStorage.getItem('garmel_urb_torres') || '').length;
ok('localStorage con 30 informes: ' + kb(tam) + ' (lejos de 4,8 MB)', tam < 1500000, kb(tam));
ok('estadosDeTorres tiene las 30 manzanas', Object.keys(estadosDeTorres()).length === 30);
t = Date.now(); abrirInformes(); const tI = Date.now() - t;
ok('Informes abre con 30 fichas en menos de 500 ms', $$('#modal-informes .ficha').length === 30 && tI < 500, ms(tI)); cerrarInformes();
t = Date.now(); nuevoInforme(); const tN = Date.now() - t;
ok('«Nuevo» con todo esto en menos de 300 ms', tN < 300, ms(tN));

// 3. tanda de 30 con 3 fallos y relevo lento (0,3 s por informe)
const pend = listaGuardada().filter(x => !x.enviado);
await Q.relevo({ fallar: [pend[4].nro, pend[15].nro, pend[29].nro], lento: 0.3 });
Q.dialogos = []; t = Date.now(); enviar(); await esperarEnvio(); const tE = Date.now() - t;
ok('27 enviados, 3 sin enviar, con sus tres números en el aviso', /27 informe\(s\) enviado/.test(Q.dialogos.slice(-1)[0] || '') && /3 sin enviar/.test(Q.dialogos.slice(-1)[0] || '') && (Q.dialogos.slice(-1)[0].match(/PRUEBA-URB/g) || []).length === 3, ms(tE) + ' · ' + (Q.dialogos.slice(-1)[0] || '').replace(/\n/g, ' ').slice(0, 100));
ok('Los 27 enviados llevaron sus 2 fotos con nombre urb_vialidad-N', (await Q.envios()).filter(e => e.fotos.length === 2 && e.fotos.join() === 'urb_vialidad-1,urb_vialidad-2').length >= 27);
await Q.relevo({ fallar: [], lento: 0 });
const idbRestantes = []; for (const x of listaGuardada()) { const g = await FotosDB.leer(x.id); if (Object.keys(g).length) idbRestantes.push(x.torre); }
ok('IndexedDB solo conserva las fotos de los 3 no enviados', idbRestantes.length === 3, idbRestantes.join());

// 4. cuota llena: localStorage y IndexedDB
nuevoInforme(); insp(); Q.elegir(conv, EZ); Q.elegir(torre, 'M-2'); await esperar(50); if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
window.__real = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { if (k === 'garmel_urb_list') throw new DOMException('QuotaExceededError', 'QuotaExceededError'); return window.__real.call(this, k, v); };
Q.dialogos = []; Q.escribir(items('urb_drenaje')[0].querySelector('.cant'), '77'); const gq = guardar(false);
ok('Cuota llena: avisa NO SE PUDO GUARDAR y el 77 sigue en pantalla', gq === false && Q.dialogos.some(d => /NO SE PUDO GUARDAR/.test(d)) && items('urb_drenaje')[0].querySelector('.cant').value === '77');
Q.dialogos = []; siguienteTorre();
ok('Sig. manzana con cuota llena NO limpia la pantalla', torre.value === 'M-2' && items('urb_drenaje')[0].querySelector('.cant').value === '77');
Storage.prototype.setItem = window.__real;
const guardarReal = FotosDB.guardar; FotosDB.guardar = () => Promise.reject(new DOMException('QuotaExceededError', 'QuotaExceededError'));
Q.dialogos = []; Q.ponerFotos($('#srv-urb_drenaje input[type=file]'), [f2[0]]); await hasta(() => $$('#fotos-urb_drenaje .foto img').length === 1, 5000); guardar(false); await _escrituraFotos.catch(() => {}); await esperar(100);
ok('IndexedDB llena: el texto se guarda y avisa que LAS FOTOGRAFÍAS NO', Q.dialogos.some(d => /FOTOGRAFÍAS NO/.test(d)) && listaGuardada().some(x => x.torre === 'M-2' && x.general[0].items[0].cant === '77') && _fotosSucias, Q.dialogos.slice(-1)[0]);
FotosDB.guardar = guardarReal; guardar(false); await _escrituraFotos;
ok('Al volver el espacio, la foto entra en el siguiente guardado', Object.keys(await FotosDB.leer(idActual)).length > 0 && !_fotosSucias);

// 5. 20 secciones agregadas + 100 partidas recordadas: tiempos
for (let i = 1; i <= 20; i++){ $('#ns-nombre').value = 'Sección extra ' + i; agregarSeccion(); }
const mem = memoriaItems(); GENERAL.forEach(g => { mem[g.id] = (mem[g.id] || []).concat(Array.from({ length: 4 }, (_, k) => 'Partida recordada ' + k + ' de ' + g.id)); }); guardarMemoriaItems(mem);
t = Date.now(); nuevoInforme(); const tP = Date.now() - t;
ok('28 secciones y ' + $$('.item').length + ' partidas: «Nuevo» pinta en ' + ms(tP), GENERAL.length === 28 && $$('.item').length >= 39 + 112 && tP < 1500, ms(tP));
ok('Sin scroll horizontal con 28 secciones', document.documentElement.scrollWidth <= innerWidth);
t = Date.now(); insp(); Q.elegir(torre, 'M-101'); await esperar(50); $('#aviso-historial .si') && $('#aviso-historial .si').click(); const tH = Date.now() - t;
ok('Traer historial de M-101 con 151 partidas en pantalla: ' + ms(tH), tH < 1500 && $$('.item.heredado').length === 39, $$('.item.heredado').length);
ok('Ningún error de página', !Q.R.some(r => /pageerror|unhandled/.test(r.n)));
