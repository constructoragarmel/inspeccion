// ESTRÉS 7 · planilla de avance (cambio 199), 29-oct-2026. QC1 a QC5 de las 20 rondas, como inspectora en obra.
// inspeccion.html?prueba=1, a 375 px y A LA VISTA. EZ T-07 sembrada con 12 pisos × 4.
// QC1 el primer uso de verdad: cabecera, planilla con «lo mismo», guardar, «Enviar ahora»: llegan todos, no queda nada
//     suelto en «Informes», ningún aviso de error, y al reabrir lo gris ya es lo nuevo.
// QC2 abrir la planilla desde torre (con fotos generales, minuta, actividades y nota), desde estructura y desde un
//     apartamento a medio llenar y copiado: los informes salen limpios y con el número bien armado.
// QC3 un apartamento que ya tiene informe hoy: sin enviar no se pisa; ENVIADO hoy por la misma inspectora avisa que entra
//     como corrección y pide confirmarlo; de otra inspectora no choca.
// QC4 dos toques en todo: el botón, «Listo», «Guardar», «Enviar ahora».
// QC5 el «atrás» del teléfono cierra la hoja de abajo y después la planilla, sin salir de la app y sin perder nada.
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem('garmel_reports_list', '[]');
Object.keys(localStorage).filter(k => /^garmel_planilla_/.test(k)).forEach(k => localStorage.removeItem(k));
await Q.relevo({ caido: false, fallar: [], lento: 0, colgar: 0, perder: false, borrar: true });
const semilla = () => { const s = {}; for (let p = 1; p <= 12; p++) ['A1', 'A2', 'B1', 'B2'].forEach(a => { const k = 'P' + String(p).padStart(2, '0') + 'A' + a; s[k] = { nro: 'PRUEBA-EZ-T07-' + k + '-261020-XX', fecha: '2026-10-20', piso: 'Piso ' + String(p).padStart(2, '0'), apto: a, pcts: { '2.02': 100, '3.01': 50, '3.02': p <= 2 ? 100 : 40, '3.03': 30, '4.01': 25, '11.01': 0 } }; }); return s; };
await Q.relevo({ sembrarAvance: { sector: 'EZ', torre: 'T-07', prueba: true, informes: semilla() } });
Q.aceptar = true;
const HOY = new Date().toISOString().slice(0, 10), hoy6 = HOY.slice(2).replace(/-/g, '');
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const insp = n => { const ins = document.querySelector('.inspector-select'); Q.elegir(ins, [...ins.options].map(o => o.value).filter(Boolean)[n || 0]); };
const cabecera = async (amb, n) => {
  nuevoFormulario(); await esperar(300); setAmbito(amb || 'apartamento'); await esperar(200);
  sel('fecha', HOY); sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-07'); await esperar(400);
  insp(n); await esperar(300);
  if (!document.querySelector('#estatus .ck-lbl.on')) [...document.querySelectorAll('#estatus .ck-lbl')].find(l => /progreso/.test(l.textContent)).click();
};
const E = () => _plEstado();
const celda = (k, c) => $('#planilla .pl-c[data-k="' + k + '"][data-c="' + c + '"]');
const tap = el => { if (!el) throw new Error('no está'); el.click(); };
const teclear = (k, c, dig, todos) => { tap(celda(k, c)); String(dig).split('').forEach(d => tap($('#pl-sheet [data-d="' + d + '"]'))); if (todos) tap($('#pl-kt')); tap($('#pl-ksi')); };
const ir = async o => { _plIr(o); await esperar(60); };
const abrir = async () => { tap($('#btn-planilla')); await hasta(() => E().P && /archivo|teléfono|guardado/.test(E().P.origenPrev) && $('#pl-cuerpo .pl-g, #pl-cuerpo .pl-o, #pl-cuerpo .pl-lead:not(:empty)'), 15000); await esperar(150); };
const guardar = async () => { tap($('#pl-rev')); await esperar(60); if ($('#pl-rb')) tap($('#pl-rb')); if ($('#pl-rr')) tap($('#pl-rr')); tap($('#pl-rgua')); await esperar(250); };
const fila = (d, cod) => { for (const pid of Object.keys(d.partidas)) { const i = (CODIGOS_SUB[pid] || []).indexOf(cod); if (i >= 0 && Array.isArray(d.partidas[pid])) return d.partidas[pid][i]; } };
const errores = () => Q.dialogos.filter(m => /error|falta|no se pudo|no se envi|❌/i.test(m));
const iniciales = () => { const p = String(getInspectoresValues()[0] || '').replace(/^(ING|ARQ|TSU)\.?\s*/i, '').trim().split(/\s+/); return _limpiar(((p[0] || '')[0] || '') + ((p[1] || '')[0] || '')); };
const errJS = []; const _oe = window.onerror; window.onerror = (m) => { errJS.push(String(m)); };

// ── QC1 · el primer uso de verdad ──
Q.dialogos = [];
const t0 = performance.now();
await cabecera('apartamento');
await abrir();
await ir({ vista: 'tel', piso: 1, hitoSel: 'hito_servicios' });
teclear('P01AA1', '3.01', 60, true);
await ir({ piso: 2 }); teclear('P02AA1', '3.03', 45, true);
const r1 = _plResumen();
await guardar();
const ini1 = iniciales();
const nros1 = getSavedReports().map(b => b.nro).sort();
ok('QC1a · «Lo mismo» en dos pisos: 8 apartamentos, 8 informes con el número de hoy y las iniciales de la inspectora', r1.ks.length === 8 && nros1.length === 8 && nros1.every(n => new RegExp('^PRUEBA-EZ-T07-P0[12]A(A1|A2|B1|B2)-' + hoy6 + '-' + ini1 + '$').test(n)), r1.ks.length + ' · ' + nros1.join(' '));
const env0 = (await Q.envios()).length;
tap($('#pl-fenv')); await esperar(300); await hasta(() => !_tandaEnCurso, 90000); await esperar(800);
const env1 = (await Q.envios()).slice(env0).filter(e => e.numero);
const L1 = getSavedReports();
ok('QC1b · «Enviar ahora» cierra la planilla y llegan los 8, uno por número', !$('#planilla') || $('#planilla').hidden, 'planilla abierta');
ok('QC1c · Llegan 8 envíos, cada número una vez', env1.length === 8 && new Set(env1.map(e => e.numero)).size === 8, env1.map(e => e.numero).join(' '));
ok('QC1d · En «Informes» quedan los 8 marcados enviados y nada suelto (ni la cabecera sola)', L1.length === 8 && L1.every(b => b.enviado), L1.map(b => b.nro + (b.enviado ? '✓' : '✗')).join(' '));
ok('QC1e · Ningún aviso de error ni de «falta» en todo el recorrido', !errores().length, errores().join(' | ').slice(0, 200));
await cabecera('apartamento'); await abrir(); await ir({ vista: 'tel', piso: 2, hitoSel: 'hito_servicios' });
ok('QC1f · Al volver a abrir, lo gris ya es lo nuevo (P02 B2 3.03 = 45, P01 A1 3.01 = 60) y no hay cambios pendientes', E().P.prev.P02AB2.pcts['3.03'] === 45 && E().P.prev.P01AA1.pcts['3.01'] === 60 && _plResumen().n === 0, JSON.stringify(E().P.prev.P02AB2.pcts));
ok('QC1g · Todo el recorrido (8 apartamentos, guardar y enviar) en menos de 40 s de máquina', performance.now() - t0 < 40000, Math.round(performance.now() - t0) + ' ms');
cerrarPlanilla(); await esperar(100);

// ── QC2 · abrir desde torre, estructura y un apartamento a medias ──
localStorage.setItem('garmel_reports_list', '[]');
await cabecera('torre');
Q.ponerFotos(document.querySelector('#fslot_aptosgen_0 input[type=file]'), [await Q.foto(800, 600, 701)]); await esperar(1500);
Q.ponerFotos(document.querySelector('#fslot_minutas_0 input[type=file]'), [await Q.foto(800, 600, 702)]); await esperar(1500);
Q.escribir(document.getElementById('obs_aptosgen'), 'Fotos de la torre: P05 cerámica');
Q.escribir(document.getElementById('obs_general'), 'Nota general de la torre');
{ const a = document.getElementById('actividades'); if (a) Q.escribir(a, 'Vaciado de losa'); }
await abrir(); await ir({ vista: 'tel', piso: 4, hitoSel: 'hito_servicios' }); teclear('P04AA1', '3.01', 70); await guardar(); tap($('#pl-fseg')); cerrarPlanilla(); await esperar(200);
const b2a = getSavedReports().find(b => /-P04AA1-/.test(b.nro));
ok('QC2a · Desde torre: el informe del apartamento no se lleva las fotos generales, la minuta, las actividades ni la nota de la torre',
   !!b2a && !String(b2a.obsAptosGen || '').trim() && !(b2a.fotos && Object.keys(b2a.fotos).some(k => (b2a.fotos[k] || []).some(Boolean))) && !String(b2a.actividades || '').trim() && b2a.obs_general === '' && b2a.ambito === 'apartamento',
   b2a ? JSON.stringify({ g: b2a.obsAptosGen, a: b2a.actividades, o: b2a.obs_general, f: b2a.fotos && Object.keys(b2a.fotos) }).slice(0, 200) : 'no está');
ok('QC2b · …y el número es el de un apartamento: PRUEBA-EZ-T07-P04AA1-' + hoy6 + '-iniciales', !!b2a && b2a.nro === 'PRUEBA-EZ-T07-P04AA1-' + hoy6 + '-' + iniciales(), b2a && b2a.nro);
await cabecera('estructura');
await abrir(); await ir({ vista: 'tel', piso: 4, hitoSel: 'hito_servicios' }); teclear('P04AA2', '3.01', 70); await guardar(); tap($('#pl-fseg')); cerrarPlanilla(); await esperar(200);
const b2b = getSavedReports().find(b => /-P04AA2-/.test(b.nro));
ok('QC2c · Desde estructura: el número no lleva «ESTR» (PRUEBA-EZ-T07-P04AA2-' + hoy6 + '-…)', !!b2b && b2b.nro === 'PRUEBA-EZ-T07-P04AA2-' + hoy6 + '-' + iniciales() && b2b.vista === '', b2b && b2b.nro);
await cabecera('apartamento');
sel('piso', 'Piso 05'); { const a = document.getElementById('apto'); a.value = 'A1'; a.dispatchEvent(new Event('input', { bubbles: true })); a.dispatchEvent(new Event('change', { bubbles: true })); } await esperar(600);
{ const x = document.getElementById('aviso-anterior'); if (x) x.innerHTML = ''; }
try { _copiaDe = { nro: 'PRUEBA-EZ-T07-P05AA2-261020-XX', torre: 'T-07', piso: 'Piso 05', apto: 'A2', fecha: '2026-10-20' }; } catch (e) {}
await abrir(); await ir({ vista: 'tel', piso: 4, hitoSel: 'hito_servicios' }); teclear('P04AB1', '3.01', 70); await guardar(); tap($('#pl-fseg')); cerrarPlanilla(); await esperar(200);
try { _copiaDe = null; } catch (e) {}
const b2c = getSavedReports().find(b => /-P04AB1-/.test(b.nro));
ok('QC2d · Desde un apartamento a medias (P05 A1, copiado de otro): sale P04 B1 sin «copiado de» ni filas heredadas', !!b2c && b2c.piso === 'Piso 04' && b2c.apto === 'B1' && !b2c.copiadoDe && !JSON.stringify(b2c.partidas).match(/copiadoDe|heredado|cerrado100/), b2c ? b2c.nro + ' ' + JSON.stringify(b2c.copiadoDe || '') : 'no está');
// Un informe viejo abierto desde «Informes» y la fecha cambiada a hoy: el número sale con la fecha de la cabecera.
const viejo = Object.assign(JSON.parse(JSON.stringify(b2c)), { id: 'draft_viejo', nro: 'PRUEBA-EZ-T07-P09AA1-261020-' + iniciales(), piso: 'Piso 09', apto: 'A1', fecha: '2026-10-20', enviado: true });
localStorage.setItem('garmel_reports_list', JSON.stringify([viejo]));
loadDraftData(0); await esperar(1500); sel('fecha', HOY); await esperar(300);
await abrir(); await ir({ vista: 'tel', piso: 6, hitoSel: 'hito_servicios' }); teclear('P06AA1', '3.01', 70); await guardar(); tap($('#pl-fseg')); cerrarPlanilla(); await esperar(200);
const b2d = getSavedReports().find(b => /-P06AA1-/.test(b.nro));
ok('QC2e · Desde un informe viejo reabierto con la fecha cambiada a hoy: el número lleva la fecha de hoy', !!b2d && b2d.nro === 'PRUEBA-EZ-T07-P06AA1-' + hoy6 + '-' + iniciales() && b2d.fecha === HOY && !b2d.enviado, b2d ? b2d.nro + ' ' + b2d.fecha : getSavedReports().map(b => b.nro).join(' '));

// ── QC3 · un apartamento que ya tiene informe hoy ──
localStorage.setItem('garmel_reports_list', '[]'); nuevoFormulario(); await esperar(200);
await cabecera('apartamento');
const nro3 = _plNroPara(7, 'A1'), nro3b = _plNroPara(7, 'A2');
const manana = { id: 'draft_manana', nro: nro3, lista: VERSION_LISTA, torre: 'T-07', ambito: 'apartamento', piso: 'Piso 07', apto: 'A1', fecha: HOY, partidas: {}, enviado: true, obs_general: 'Con fotos, de la mañana' };
const otra = { id: 'draft_otra', nro: nro3b.replace(/-[A-Z0-9]+$/, '-ZZ'), lista: VERSION_LISTA, torre: 'T-07', ambito: 'apartamento', piso: 'Piso 07', apto: 'A2', fecha: HOY, partidas: {}, enviado: true };
localStorage.setItem('garmel_reports_list', JSON.stringify([manana, otra]));
await abrir(); await ir({ vista: 'tel', piso: 7, hitoSel: 'hito_servicios' });
teclear('P07AA1', '3.01', 80); teclear('P07AA2', '3.01', 80);
tap($('#pl-rev')); await esperar(60);
const txt3 = $('#pl-sheet').textContent;
ok('QC3a · P07 A1 ya se envió hoy con el mismo número: lo dice y explica que entra como corrección sin las fotos del de la mañana', /ya se envi/i.test(txt3) && /correcci/i.test(txt3) && /fotos/.test(txt3), txt3.slice(0, 300));
ok('QC3b · …y no se guarda sin confirmarlo', $('#pl-rgua').disabled && !!$('#pl-rr'));
ok('QC3c · El de otra inspectora (P07 A2, otras iniciales) no choca: no sale ese aviso para A2', !/ZZ/.test(txt3) && ($$('#pl-sheet .pl-ra').find(d => /A2/.test(d.querySelector('h4').textContent)) || {}).textContent.indexOf('Ya se envi') < 0);
tap($('#pl-rr')); tap($('#pl-rgua')); await esperar(200);
const L3 = getSavedReports();
ok('QC3d · Confirmado, se guardan los dos (A1 como corrección con el mismo número, A2 con el suyo)', L3.filter(b => b.nro === nro3).length === 2 && L3.some(b => b.nro === nro3b && !b.enviado), L3.map(b => b.nro + (b.enviado ? '✓' : '')).join(' '));
tap($('#pl-fseg')); cerrarPlanilla();

// ── QC4 · dos toques en todo ──
localStorage.setItem('garmel_reports_list', '[]'); Object.keys(localStorage).filter(k => /^garmel_planilla_EZ/.test(k)).forEach(k => localStorage.removeItem(k));
await cabecera('apartamento');
$('#btn-planilla').click(); $('#btn-planilla').click(); await hasta(() => E().P && E().P.origenPrev === 'del archivo', 15000); await esperar(300);
ok('QC4a · Dos toques al botón: una sola planilla y un solo juego de pestañas', $$('#planilla').length === 1 && $$('#planilla .pl-tabs').length === 1 && !$('#planilla').hidden);
await ir({ vista: 'tel', piso: 8, hitoSel: 'hito_servicios' });
const p0 = E().pila.length;
tap(celda('P08AA1', '3.01')); tap($('#pl-sheet [data-d="9"]')); tap($('#pl-sheet [data-d="0"]')); const ksi = $('#pl-ksi'); ksi.click(); ksi.click();
ok('QC4b · Dos toques a «Listo»: un solo cambio y un solo paso para deshacer', E().est.N.P08AA1['3.01'] === 90 && E().pila.length === p0 + 1, 'pila ' + p0 + ' → ' + E().pila.length);
teclear('P08AA2', '3.01', 90);
tap($('#pl-rev')); await esperar(60); const g4 = $('#pl-rgua'); g4.click(); g4.click(); await esperar(250);
ok('QC4c · Dos toques a «Guardar»: dos informes, no cuatro', getSavedReports().length === 2, getSavedReports().map(b => b.nro).join(' '));
const env4 = (await Q.envios()).length;
const fe = $('#pl-fenv'); fe.click(); fe.click(); await esperar(300); await hasta(() => !_tandaEnCurso, 60000); await esperar(800);
const e4 = (await Q.envios()).slice(env4).filter(e => e.numero);
ok('QC4d · Dos toques a «Enviar ahora»: cada informe llega una vez', e4.length === 2 && new Set(e4.map(e => e.numero)).size === 2, e4.map(e => e.numero).join(' '));

// ── QC5 · el «atrás» del teléfono ──
localStorage.setItem('garmel_reports_list', '[]');
await cabecera('apartamento'); const url5 = location.href, estado5 = JSON.stringify(history.state), largo5 = history.length;
await abrir(); await ir({ vista: 'tel', piso: 9, hitoSel: 'hito_servicios' });
teclear('P09AA1', '3.01', 65);
tap(celda('P09AA2', '3.01')); await esperar(50);
history.back(); await esperar(400);
ok('QC5a · Con el teclado abierto, «atrás» cierra el teclado y deja la planilla', location.href === url5 && !!$('#planilla') && !$('#planilla').hidden && $('#pl-fondo').hidden, location.href);
history.back(); await esperar(400);
ok('QC5b · Otro «atrás» cierra la planilla y vuelve al formulario, sin salir de la página', location.href === url5 && (!$('#planilla') || $('#planilla').hidden) && !!document.getElementById('btn-planilla'), location.href);
await abrir();
ok('QC5c · Lo anotado sigue ahí al volver a abrirla', E().est.N.P09AA1 && E().est.N.P09AA1['3.01'] === 65);
tap($('#pl-volver')); await esperar(400);
ok('QC5d · Cerrada con «← Formulario», el historial vuelve a donde estaba antes de abrirla (el «atrás» siguiente no queda atrapado en la planilla)', JSON.stringify(history.state) === estado5 && location.href === url5, JSON.stringify(history.state) + ' / ' + estado5 + ' · ' + history.length + ' / ' + largo5);
ok('QC5e · Ningún error de JavaScript en las cinco rondas', !errJS.length, errJS.join(' | ').slice(0, 200));
window.onerror = _oe;
nuevoFormulario(); localStorage.setItem('garmel_reports_list', '[]');
Object.keys(localStorage).filter(k => /^garmel_planilla_/.test(k)).forEach(k => localStorage.removeItem(k));
