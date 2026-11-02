// ESTRÉS 20 · usarla de verdad en obra (2-nov-2026, rondas R13 a R20 de las 20): el atrás de Android con la hoja abierta y la
// caja de la tabla bajada, deshacer entre capítulos, una nota con de todo, una torre de 10 apartamentos (T-04) deslizando a los
// lados, pegar de Excel con capítulos cerrados, la hoja impresa con planta baja y capítulos, y dos torres en la misma mañana.
// Se corre en inspeccion.html?prueba=1 (375×812 y 320×568 a la vista; 500 sin ventana).
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem('garmel_reports_list', '[]');
const limpiar = () => Object.keys(localStorage).filter(k => /^garmel_planilla_/.test(k)).forEach(k => localStorage.removeItem(k));
limpiar();
await Q.relevo({ caido: false, fallar: [], lento: 0, colgar: 0, perder: false, cortar: 0, borrar: true });
await Q.relevo({ sembrarAvance: { sector: 'EZ', torre: 'T-10', prueba: true, informes: {} } });
{ const real = await (await fetch('/reales/SR-T-04.json?' + Date.now())).json(); const inf = {};   // el historial real: A a J por piso
  Object.keys(real.informes || {}).filter(k => k !== 'TORRE').forEach(k => { inf[k] = real.informes[k]; });
  await Q.relevo({ sembrarAvance: { sector: 'SR', torre: 'T-04', prueba: true, informes: inf } }); }
const HOY = new Date().toISOString().slice(0, 10), W = innerWidth, H = innerHeight, tam = W + '×' + H;
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const E = () => _plEstado(), N = (k, c) => E().est.N[k] && E().est.N[k][c];
const celda = (k, c) => $('#planilla .pl-c[data-k="' + k + '"][data-c="' + c + '"]');
const tap = el => { if (!el) throw new Error('no está'); el.click(); };
const dig = d => String(d).split('').forEach(x => tap($('#pl-sheet [data-d="' + x + '"]')));
const teclear = (k, c, v, todos) => { tap(celda(k, c)); dig(v); if (todos) tap($('#pl-kt')); tap($('#pl-ksi')); };
const cabecera = async (conv, torre) => {
  nuevoFormulario(); await esperar(300); setAmbito('apartamento'); await esperar(200);
  sel('fecha', HOY); sel('convenio', conv); sel('torre', torre); await esperar(400);
  { const ins = document.querySelector('.inspector-select'); Q.elegir(ins, [...ins.options].map(o => o.value).filter(Boolean)[0]); await esperar(300); }
  if (!document.querySelector('#estatus .ck-lbl.on')) [...document.querySelectorAll('#estatus .ck-lbl')].find(l => /progreso/.test(l.textContent)).click();
};
const abrir = async () => { abrirPlanilla(); await hasta(() => E().P && /archivo|teléfono|guardado/.test(E().P.origenPrev || '') && !!$('#pl-cuerpo .pl-g'), 15000); await esperar(250); };
const abierta = () => !!document.getElementById('planilla') && getComputedStyle(document.getElementById('planilla')).display !== 'none' && !!E().P;

// ── R13 · Atrás de Android: con la hoja del teclado abierta y la tabla bajada cierra solo la hoja; otra vez, la planilla ──
await cabecera('Convenio Bielorrusos', 'T-10'); await abrir();
_plIr({ vista: 'tel', piso: 6, hitoSel: 'cap_electricas' }); await esperar(100);
$('#planilla .pl-gw').scrollTop = 9999; await esperar(80);
tap([...document.querySelectorAll('#planilla .pl-c[data-k="P06AB2"]')].pop()); await esperar(100);
const hojaAbierta = !!$('#pl-sheet') && getComputedStyle($('#pl-sheet')).display !== 'none' && $('#pl-sheet').getBoundingClientRect().height > 0;
history.back(); await esperar(500);
const trasUno = abierta() && !($('#pl-sheet') && $('#pl-sheet').getBoundingClientRect().height > 0);
history.back(); await esperar(600);
ok('R13 · Atrás con la hoja abierta: el primero cierra la hoja, el segundo la planilla y deja el formulario con su cabecera', hojaAbierta && trasUno && !abierta() && document.getElementById('torre').value === 'T-10', [hojaAbierta, trasUno, abierta()].join(' / '));
// ── R14 · Deshacer entre capítulos ──
await abrir(); _plIr({ vista: 'tel', piso: 2, hitoSel: 'cap_sanitarias' }); await esperar(80);
teclear('P02AA1', '3.01', 50, false); tap($('#planilla .pl-chips [data-h="cap_electricas"]')); await esperar(60); teclear('P02AA1', '3.07', 75, true);
const antes14 = [N('P02AA1', '3.01'), N('P02AB2', '3.07')].join(',');
_plDeshacer(); await esperar(60); const tras1 = [N('P02AA1', '3.01'), N('P02AB2', '3.07')].join(',');
_plDeshacer(); await esperar(60);
const cnt = [...document.querySelectorAll('#planilla .pl-chips .pl-cnt')].length;
ok('R14 · Deshacer en Eléctricas quita el «Lo mismo» de los cuatro; el segundo quita el 50 de Sanitarias; no quedan contadores', antes14 === '50,75' && tras1 === '50,' && !Object.keys(E().est.N).length && !cnt, antes14 + ' → ' + tras1 + ' → ' + JSON.stringify(E().est.N));
// ── R15 · Una nota con de todo ──
const rara = 'Fisura en «dintel» & <b>urgente</b> 💥 "ver foto" ' + 'x'.repeat(260);
tap($('#planilla [data-com="P02AB1"]')); await esperar(80); $('#pl-ct').value = rara; tap($('#pl-csi')); await esperar(80);
tap($('#planilla .pl-chips [data-h="cap_sanitarias"]')); await esperar(60); teclear('P02AB1', '3.01', 25, false);
ok('R15 · La nota se guarda tal cual, la etiqueta no se vuelve HTML y el botón muestra «nota»', E().est.C.P02AB1 === rara && ![...document.querySelectorAll('#planilla b')].some(x => /urgente/.test(x.textContent)) && /nota/.test($('#planilla [data-com="P02AB1"]').textContent), (E().est.C.P02AB1 || '').length + '/' + rara.length);
tap($('#pl-rev')); await esperar(100); if ($('#pl-rr')) tap($('#pl-rr')); tap($('#pl-rgua')); await esperar(800);
const b15 = getSavedReports().find(b => /T10-P02AB1-/.test(b.nro || ''));
ok('R15b · El informe del apartamento lleva la nota completa', !!b15 && JSON.stringify(b15).indexOf('💥') > 0 && JSON.stringify(b15).indexOf('xxxxxxxxxx') > 0, b15 ? Object.keys(b15).filter(k => /obs/.test(k)).join(',') : 'sin informe');
cerrarPlanilla(); await esperar(200);
// ── R16 · T-04 con 10 apartamentos por piso: deslizar a la derecha sin perder la subpartida ni los apartamentos ──
await cabecera('Convenio Rusos', 'T-04'); await abrir();
_plIr({ vista: 'tel', piso: 7, hitoSel: 'cap_electricas' }); await esperar(150);
const gw = $('#planilla .pl-gw'); gw.scrollLeft = 9999; gw.scrollTop = 120; await esperar(120);
const caja = gw.getBoundingClientRect(), fila = $('#planilla .pl-g tbody tr:not(.pl-sep) th').getBoundingClientRect(), esq = $('#planilla .pl-g thead th').getBoundingClientRect();
const j7 = [...document.querySelectorAll('#planilla .pl-g thead th')].find(t => /J7/.test(t.textContent)).getBoundingClientRect();
ok('R16 ' + tam + ' · Deslizado a la derecha y abajo: la subpartida sigue pegada a la izquierda, la fila de apartamentos arriba, y se ve J7',
   Math.abs(fila.left - caja.left) <= 2 && Math.abs(esq.top - caja.top) <= 2 && j7.right <= caja.right + 1 && j7.left >= fila.right - 2 && gw.scrollLeft > 0,
   'desliz ' + gw.scrollLeft + '/' + (gw.scrollWidth - gw.clientWidth) + ' · fila ' + Math.round(fila.left) + '–' + Math.round(fila.right) + ' caja ' + Math.round(caja.left) + '–' + Math.round(caja.right) + ' · esquina ' + Math.round(esq.top) + '/' + Math.round(caja.top) + ' · J7 ' + Math.round(j7.left) + '–' + Math.round(j7.right));
{ const c = $('#planilla .pl-g thead th').getBoundingClientRect(), arriba = document.elementFromPoint(c.left + 20, c.top + c.height / 2);
  const sep = [...document.querySelectorAll('#planilla .pl-sep span')].map(x => x.getBoundingClientRect()).filter(r => r.bottom > caja.top && r.top < caja.bottom);
  ok('R16d ' + tam + ' · Deslizado: la esquina «Piso» queda encima y los rótulos Instalación / Accesorios siguen a la vista', !!arriba && !!arriba.closest('thead') && sep.every(r => r.left >= caja.left - 1 && r.right <= caja.right + 1) && sep.length >= 1,
     (arriba && (arriba.closest('th') || arriba).textContent.trim().slice(0, 20)) + ' · rótulos ' + sep.map(r => Math.round(r.left)).join(',')); }
const cj = [...document.querySelectorAll('#planilla .pl-c[data-k="P07AJ7"]')][0]; tap(cj); await esperar(80); tap($('#pl-sheet [data-r="75"]')); tap($('#pl-ksi')); await esperar(80);
ok('R16b · Cargar J7 deslizado funciona y la casilla sigue a la vista', Object.values(E().est.N.P07AJ7 || {})[0] === 75, JSON.stringify(E().est.N));
ok('R16c ' + tam + ' · La página no se sale de lado', document.documentElement.scrollWidth <= W + 1);
_plDeshacer();
// ── R17 · Oficina: pegar 3 columnas desde la última de «Sanitarias» con «Eléctricas» cerrada ──
_plIr({ vista: 'tabla' }); await esperar(150);
const ult = [...document.querySelectorAll('#planilla input.pl-pc[data-k="P03AA3"]')].pop();
const dt = new DataTransfer(); dt.setData('text/plain', '10\t20\t30\r\n'); ult.focus(); ult.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true })); await esperar(100);
const tocadas = Object.keys(E().est.N.P03AA3 || {});
ok('R17 · Lo que no cabe en las columnas abiertas no cae en un capítulo cerrado: entra 1 y avisa de 2', tocadas.length === 1 && tocadas[0] === ult.dataset.c && /2 quedaban fuera/.test(_plUltimoAviso()), tocadas.join(',') + ' · ' + _plUltimoAviso());
_plDeshacer();
cerrarPlanilla(); await esperar(200);
// ── R19 · Dos torres en la misma mañana: lo de una no se mezcla con la otra ──
await cabecera('Convenio Bielorrusos', 'T-10'); await abrir();
_plIr({ vista: 'tel', piso: 9, hitoSel: 'cap_sanitarias' }); await esperar(80); teclear('P09AA1', '3.01', 100, false);
cerrarPlanilla(); await esperar(200);
await cabecera('Convenio Rusos', 'T-04'); await abrir();
const enT04 = Object.keys(E().est.N).length;
cerrarPlanilla(); await esperar(200);
await cabecera('Convenio Bielorrusos', 'T-10'); await abrir();
ok('R19 · Lo que quedó a medias en la T-10 no aparece en la T-04, y al volver a la T-10 sigue ahí', enT04 === 0 && N('P09AA1', '3.01') === 100, 'T-04: ' + enT04 + ' · T-10: ' + JSON.stringify(E().est.N));
// ── R18 · La hoja impresa: planta baja primero y los capítulos con su nombre ──
_plIr({ vista: 'imp', tamano: 'comoda' }); await esperar(200);
const h1 = $('#planilla .pl-hoja'), filas1 = [...h1.querySelectorAll('tbody tr th')].map(t => t.textContent.trim());
const grupos = [...h1.querySelectorAll('thead th.hg')].map(t => t.textContent);
ok('R18 · (T-10) La primera hoja empieza por la planta baja y rotula «Instalaciones sanitarias» y «Instalaciones eléctricas, voz y data»', /^PB|planta baja/i.test(filas1[0]) && grupos.some(g => /Instalaciones sanitarias/.test(g)) && $$('#planilla .pl-hoja thead th.hg').some(g => /eléctricas, voz y data/.test(g.textContent)), filas1.slice(0, 2).join(' | ') + ' · ' + grupos.join(' | '));
// ── R20 · Torre 10 por piso a este ancho: lo que se toca mide 44 y nada se sale ──
cerrarPlanilla(); await esperar(150); await cabecera('Convenio Rusos', 'T-04'); await abrir();
_plIr({ vista: 'tel', piso: 7, hitoSel: 'cap_sanitarias' }); await esperar(150);
const chicos = [...document.querySelectorAll('#planilla .pl-c, #planilla .pl-chips button, #planilla .pl-apto, #pl-ant, #pl-sig, #pl-rev')].filter(e => { const r = e.getBoundingClientRect(); return r.width && r.height < 44; }).map(e => (e.dataset.k || e.id || e.className) + ':' + Math.round(e.getBoundingClientRect().height));
ok('R20 ' + tam + ' · Con 10 apartamentos: casillas, pestañas y botones de 44 o más, y nada se sale de lado', !chicos.length && document.documentElement.scrollWidth <= W + 1, chicos.slice(0, 5).join(','));
cerrarPlanilla(); nuevoFormulario(); localStorage.setItem('garmel_reports_list', '[]'); limpiar();
