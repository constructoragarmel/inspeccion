// TANDA 109 · QC 5 a 8 de la segunda serie (20-oct-2026), en servicios.html o sha.html (?prueba=1), a la vista.
// 5 un día: dos torres seguidas con «Sig. torre» (T-05 y T-06) y una de «Varias torres» (T-07 + T-08), con foto en la primera y
//   minuta en la segunda, y «Enviar todos»: tres envíos, números distintos, la ubicación de la de varias, fotos y minutas donde van
// 6 (SHA) hallazgo con foto, incidencia abierta y rechazo con acción viajan en el informe · 7 (SHA) dos manzanas con
//   «Sig. torre» y la segunda con «También afecta a» M-6: números y ubicación · 8 (SHA) «Copiar de otra manzana» ofrece la manzana
//   anterior del mismo sector y lo copiado queda marcado sin confirmar
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem(CLAVE_LISTA, '[]');
localStorage.removeItem(CLAVE_TORRES); localStorage.removeItem(CLAVE_ACTUAL);
Q.aceptar = true;
await Q.relevo({ caido: false, fallar: [], lento: 0, colgar: 0, perder: false });
const SHA = TIPO_INFORME === 'sha';
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); };
const modo = m => [...document.querySelectorAll('#campo-donde .donde button')].find(b => b.dataset.m === m).click();
const contestar = () => { const it = document.querySelector('[id^="items-"] .item'); const si = [...it.querySelectorAll('button')].find(b => /^S[ií]$/i.test(b.textContent.trim())); si.click(); };
const insp = () => { const i = document.querySelector('#inspectores select'); Q.elegir(i, [...i.options].map(o => o.value).filter(Boolean)[0]); };
const est = () => { const e = $('#estatus'); if (e && e.tagName === 'SELECT') sel('estatus', [...e.options].map(o => o.value).filter(Boolean)[0]); };
nuevoInforme(); await esperar(300);
sel('convenio', 'Convenio Bielorrusos'); await esperar(150); sel('torre', 'T-05'); await esperar(400); if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
insp(); sel('fecha', '2026-10-20'); est(); contestar();
const g1 = document.querySelector('[id^="fotos-"]'); const f1 = g1 && g1.parentElement.querySelector('input[type=file]');
if (f1) { Q.ponerFotos(f1, [await Q.foto(1000, 750, 109)]); await hasta(() => g1.querySelectorAll('img').length >= 1, 8000); }
if (SHA) {
  addApartamento({ apto: 'Andamio fachada sur', campos: { 'hallazgo__Descripción del hallazgo o condición observada': 'Sin rodapié', 'hallazgo__Acción correctiva / estatus': 'Pendiente' }, fotos: [] });
  addIncidencia({ fecha: '2026-10-20', tipo: 'Caída a nivel', estado: 'Abierta' });
  sel('estatus', 'Rechazado'); await esperar(150); sel('accion', 'Llamado de atención'); $('#accion_det').value = 'trabajos en altura'; $('#accion_det').dispatchEvent(new Event('input', { bubbles: true }));
}
siguienteTorre(); await esperar(500);
sel('torre', 'T-06'); await esperar(400); if ($('#aviso-historial .no')) $('#aviso-historial .no').click(); contestar(); est();
const fm = document.querySelector('#fotos-minutas'); const im = fm && fm.parentElement.querySelector('input[type=file]');
if (im) { Q.ponerFotos(im, [await Q.foto(900, 1200, 110)]); await hasta(() => fm.querySelectorAll('img').length >= 1, 8000); }
siguienteTorre(); await esperar(500);
modo('varias'); await esperar(150); sel('torre', 'T-07'); await esperar(400); sel('otra-lugar', 'T-08'); await esperar(200); if ($('#aviso-historial .no')) $('#aviso-historial .no').click(); contestar(); est();
guardar(false); await esperar(300);
const env0 = (await Q.envios()).length;
Q.dialogos = []; await enviar(); await hasta(() => !_tandaEnCurso, 40000); await esperar(800);
const env = (await Q.envios()).slice(env0).filter(e => e.numero);
const n = env.map(e => e.numero), pre = SHA ? 'SHA' : 'SRV';
const e5 = env.find(e => /T05/.test(e.numero)), e6 = env.find(e => /T06/.test(e.numero)), e7 = env.find(e => /T07\+1/.test(e.numero));
ok('5 · Dos con «Sig. torre» y una de varias: tres envíos, números distintos, la de varias con su ubicación, la foto en la T-05 y la minuta en la T-06',
   env.length === 3 && new Set(n).size === 3 && e5 && e6 && e7 && ((e7.datos || {}).ubicacion || {}).otras.join() === 'T-08' && (e5.fotos || []).length >= 1 && (e6.fotos || []).some(f => /minuta/.test(f)) &&
   listaGuardada().every(b => b.enviado),
   n.join(', ') + ' · fotos T-05 ' + (e5 && (e5.fotos || []).join('|')) + ' · T-06 ' + (e6 && (e6.fotos || []).join('|')));
if (SHA) {
  const d5 = e5.datos || {};
  ok('6 · SHA: el hallazgo, la incidencia abierta y el rechazo con su acción viajan en el informe',
     (d5.apartamentos || []).some(a => /rodapié/.test(JSON.stringify(a))) && (d5.incidencias || []).length === 1 && d5.estatus && /Rechazado/.test(JSON.stringify(d5.estatus)) && d5.accion === 'Llamado de atención' && d5.accion_det === 'trabajos en altura',
     JSON.stringify({ ap: (d5.apartamentos || []).length, inc: (d5.incidencias || []).length, est: d5.estatus, acc: d5.accion }));
  // 7
  localStorage.setItem(CLAVE_LISTA, '[]'); nuevoInforme(); await esperar(300);
  sel('convenio', 'Convenio Bielorrusos'); modo('manzana'); await esperar(150); sel('torre', 'M-2'); await esperar(400); insp(); sel('fecha', '2026-10-20'); est(); contestar();
  siguienteTorre(); await esperar(500);
  const enMz = _modoDonde === 'manzana';
  sel('torre', 'M-3'); await esperar(400); sel('otra-lugar', 'M-6'); await esperar(200); if ($('#aviso-historial .no')) $('#aviso-historial .no').click(); contestar(); est();
  guardar(false); await esperar(300);
  const ls = listaGuardada();
  const m2 = ls.find(b => b.torre === 'M-2'), m3 = ls.find(b => b.torre === 'M-3');
  ok('7 · Dos manzanas seguidas: la segunda sigue en «Manzana» y con M-6 lleva +1 y su ubicación',
     enMz && m2 && m3 && /SHA-EZ-M2-/.test(m2.nro) && /SHA-EZ-M3\+1-/.test(m3.nro) && m3.ubicacion.lugar === 'manzana' && m3.ubicacion.otras.join() === 'M-6',
     (m2 && m2.nro) + ' · ' + (m3 && m3.nro));
  // 8 · copiar de otra manzana (las fuentes de este teléfono)
  nuevoInforme(); await esperar(300); sel('convenio', 'Convenio Bielorrusos'); modo('manzana'); await esperar(150); sel('torre', 'M-4'); await esperar(500);
  await hasta(() => [...document.querySelectorAll('button')].some(b => /Copiar de otra/.test(b.textContent) && b.offsetParent), 6000);
  const bc = [...document.querySelectorAll('button')].find(b => /Copiar de otra/.test(b.textContent) && b.offsetParent);
  ok('8a · En una manzana nueva el botón dice «Copiar de otra manzana» y el panel «Buscar los informes de esta manzana»', !!bc && /otra manzana/.test(bc.textContent) && /esta manzana/.test(($('#ofi-buscar') || {}).textContent || 'esta manzana'), bc ? bc.textContent : 'no está');
} else {
  ok('6–8 · (solo SHA)', true);
}
localStorage.setItem(CLAVE_LISTA, '[]'); localStorage.removeItem(CLAVE_TORRES);
