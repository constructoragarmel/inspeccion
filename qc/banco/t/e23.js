// ESTRÉS 23 · rutas raras en obra (2-nov-2026, 30 rondas, P1 a P10): la cabecera a medias, cambios que quedaron sin guardar de
// otro día, cambiar de torre a mitad de camino, bajar un %, Sí/No con «Lo mismo», deshacer cien veces, abrirla desde «Torre
// completa», cerrar sin guardar y volver, y el camino de Liz en la T-08 real (piso 10 sin informes). Se corre en
// inspeccion.html?prueba=1 a 375×812.
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem('garmel_reports_list', '[]');
localStorage.removeItem('garmel_cortes'); Object.keys(_cortes).forEach(k => delete _cortes[k]);
const limpiar = () => Object.keys(localStorage).filter(k => /^garmel_planilla_/.test(k)).forEach(k => localStorage.removeItem(k));
limpiar(); Q.aceptar = true;
await Q.relevo({ caido: false, fallar: [], lento: 0, colgar: 0, perder: false, cortar: 0, borrar: true });
await Q.relevo({ sembrarAvance: { sector: 'EZ', torre: 'T-14', prueba: true, informes: { P02AA1: { nro: 'PRUEBA-EZ-T14-P02AA1-261020-XX', fecha: '2026-10-20', piso: 'Piso 02', apto: 'A1', pcts: { '3.01': 75, '11.01': 100 } } } } });
await Q.relevo({ sembrarAvance: { sector: 'EZ', torre: 'T-15', prueba: true, informes: {} } });
{ const real = await (await fetch('/reales/EZ-T-08.json?' + Date.now())).json(); const inf = {};
  Object.keys(real.informes || {}).filter(k => k !== 'TORRE').forEach(k => { inf[k] = real.informes[k]; });
  await Q.relevo({ sembrarAvance: { sector: 'EZ', torre: 'T-08', prueba: true, informes: inf } }); }
const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const HOY = iso(new Date()), AYER = iso(new Date(Date.now() - 864e5));
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const E = () => _plEstado(), N = (k, c) => E().est.N[k] && E().est.N[k][c];
const celda = (k, c) => $('#planilla .pl-c[data-k="' + k + '"][data-c="' + c + '"]');
const tap = el => { if (!el) throw new Error('no está'); el.click(); };
const dig = d => String(d).split('').forEach(x => tap($('#pl-sheet [data-d="' + x + '"]')));
const teclear = (k, c, v, todos) => { tap(celda(k, c)); dig(v); if (todos) tap($('#pl-kt')); tap($('#pl-ksi')); };
const cabecera = async (torre, fecha, sinEstatus) => {
  nuevoFormulario(); await esperar(300); setAmbito('apartamento'); await esperar(200);
  sel('fecha', fecha || HOY); sel('convenio', 'Convenio Bielorrusos'); sel('torre', torre); await esperar(400);
  { const ins = document.querySelector('.inspector-select'); Q.elegir(ins, [...ins.options].map(o => o.value).filter(Boolean)[0]); await esperar(300); }
  if (!sinEstatus && !document.querySelector('#estatus .ck-lbl.on')) [...document.querySelectorAll('#estatus .ck-lbl')].find(l => /progreso/.test(l.textContent)).click();
};
const abrir = async () => { abrirPlanilla(); await hasta(() => E().P && /archivo|teléfono|guardado/.test(E().P.origenPrev || '') && !!$('#pl-cuerpo .pl-g, #pl-cuerpo .pl-piso'), 15000); await esperar(300); };
const abierta = () => !!E().P && !!document.getElementById('planilla') && !document.getElementById('planilla').hidden && getComputedStyle(document.getElementById('planilla')).display !== 'none';

// ── P1 · Sin estatus en la cabecera: no abre a medias y dice qué falta ──
await cabecera('T-15', HOY, true); Q.dialogos.length = 0; abrirPlanilla(); await esperar(400);
ok('P1 · Sin estatus no abre la planilla y el aviso dice «el estatus de la obra»', !abierta() && /estatus de la obra/.test(Q.dialogos.join(' ')), Q.dialogos.join(' | ').slice(0, 160));
// ── P2 · Cambios de ayer sin guardar: al abrir hoy pregunta; «Descartarlos» los quita, «Seguir» los deja ──
await cabecera('T-15', AYER); await abrir(); _plIr({ vista: 'tel', piso: 4, hitoSel: 'cap_sanitarias' }); await esperar(100);
teclear('P04AA1', '3.01', 50, true); cerrarPlanilla(); await esperar(300);
await cabecera('T-15', HOY); await abrir();
const pregunta = $('#pl-sheet') && $('#pl-sheet').getBoundingClientRect().height > 0 ? $('#pl-sheet').textContent : '';
ok('P2 · Al abrir hoy con 4 casillas de ayer sin guardar, pregunta antes de mezclarlas', /cambios sin guardar de otra visita/.test(pregunta) && /4 casilla/.test(pregunta), pregunta.replace(/\s+/g, ' ').slice(0, 200));
tap($('#pl-odes')); await esperar(150);
ok('P2b · «Descartarlos» deja la planilla sin cambios', !Object.keys(E().est.N).length);
_plIr({ vista: 'tel', piso: 5, hitoSel: 'cap_sanitarias' }); await esperar(80); teclear('P05AB2', '3.01', 25, false); cerrarPlanilla(); await esperar(300);
await cabecera('T-15', HOY); await abrir();
ok('P2c · Lo de hoy sin guardar se recupera sin preguntar (es de la misma visita)', N('P05AB2', '3.01') === 25 && !($('#pl-sheet') && /otra visita/.test($('#pl-sheet').textContent) && $('#pl-sheet').getBoundingClientRect().height > 0));
_plDeshacer(); cerrarPlanilla(); await esperar(200); limpiar();
// ── P3 · Cambiar de torre a mitad de camino (por «← Formulario») no pierde ni mezcla nada ──
await cabecera('T-15'); await abrir(); _plIr({ vista: 'tel', piso: 6, hitoSel: 'cap_sanitarias' }); await esperar(80); teclear('P06AA2', '3.02', 75, false);
tap($('#planilla .pl-top button')); await esperar(500);
sel('torre', 'T-14'); await esperar(400); await abrir();
const enT14 = Object.keys(E().est.N).length; cerrarPlanilla(); await esperar(300);
sel('torre', 'T-15'); await esperar(400); await abrir();
ok('P3 · Lo de la T-15 no aparece en la T-14 y al volver sigue ahí', enT14 === 0 && N('P06AA2', '3.02') === 75, 'T-14 ' + enT14 + ' · T-15 ' + JSON.stringify(E().est.N));
_plDeshacer(); cerrarPlanilla(); await esperar(200); limpiar();
// ── P4 · Bajar un % (75 → 50): queda marcado, «Revisar» lo dice y pide confirmar que es una corrección ──
await cabecera('T-14'); await abrir(); _plIr({ vista: 'tel', piso: 2, hitoSel: 'cap_sanitarias' }); await esperar(100);
teclear('P02AA1', '3.01', 50, false);
const marcada = celda('P02AA1', '3.01').className;
tap($('#pl-rev')); await esperar(150);
const g4 = $('#pl-rgua'), rb = $('#pl-rb');
const antes4 = !!g4 && g4.disabled; if (rb) rb.click(); await esperar(60);
ok('P4 · La baja se marca, «Revisar» pide confirmar la corrección y solo con la marca deja guardar', /baj/.test(marcada) && !!rb && antes4 && !$('#pl-rgua').disabled, marcada + ' · ' + antes4);
tap($('#pl-rseg')); _plDeshacer(); await esperar(80);
// ── P5 · Sí/No con «Lo mismo en todo el piso»: el que ya estaba en Sí (cerrado) no se toca ──
_plIr({ vista: 'tel', piso: 2, hitoSel: 'hito_pruebas' }); await esperar(100);
tap(celda('P02AB2', '11.01')); await esperar(80);
if (!$('#pl-sheet .pl-sino')) throw new Error('hoja sin Sí/No: ' + $('#pl-sheet').innerHTML.slice(0, 300));
if ($('#pl-kt')) tap($('#pl-kt')); await esperar(30); tap($('#pl-sheet .pl-sino [data-v="0"]')); await esperar(100);
ok('P5 · «No» con «Lo mismo» en el piso 2: tres en No y el A1 (ya en Sí, cerrado) sigue en Sí', N('P02AB2', '11.01') === 0 && N('P02AA2', '11.01') === 0 && N('P02AB1', '11.01') === 0 && N('P02AA1', '11.01') === undefined, JSON.stringify(E().est.N));
_plDeshacer(); await esperar(60);
// ── P6 · Cien cambios y deshacer cien veces: vuelve a cero ──
_plIr({ vista: 'tel', piso: 3, hitoSel: 'cap_sanitarias' }); await esperar(80);
for (let i = 0; i < 25; i++) for (const a of ['A1', 'A2', 'B1', 'B2']) teclear('P03A' + a, '3.01', i % 2 ? 50 : 25, false);
const pilaAntes = E().pila.length; for (let i = 0; i < 120; i++) _plDeshacer(); await esperar(100);
ok('P6 · 100 cambios y deshacer: no queda nada, el contador en cero y «Deshacer» apagado', pilaAntes === 100 && !Object.keys(E().est.N).length && $('#pl-undo').disabled && $('#pl-rev').disabled, pilaAntes + ' · ' + JSON.stringify(E().est.N).slice(0, 80));
cerrarPlanilla(); await esperar(200); limpiar();
// ── P7 · Abrirla desde «Torre completa»: los informes salen de apartamento y el formulario vuelve a «Torre completa» ──
await cabecera('T-15'); setAmbito('torre'); await esperar(300); await abrir();
_plIr({ vista: 'tel', piso: 7, hitoSel: 'cap_sanitarias' }); await esperar(80); teclear('P07AB1', '3.01', 100, false);
tap($('#pl-rev')); await esperar(120); if ($('#pl-rr')) tap($('#pl-rr')); tap($('#pl-rgua')); await esperar(700); cerrarPlanilla(); await esperar(300);
const b7 = getSavedReports().find(b => /T15-P07AB1-/.test(b.nro || ''));
ok('P7 · Desde «Torre completa»: el informe es de apartamento (…-P07AB1-…, sin ESTR) y el formulario sigue en torre', !!b7 && b7.ambito === 'apartamento' && !/ESTR/.test(b7.nro) && ambito === 'torre', (b7 && b7.nro) + ' · ' + ambito);
localStorage.setItem('garmel_reports_list', '[]'); limpiar();
// ── P8 · Cerrar sin guardar (atrás) y volver: se recupera y lo dice ──
await cabecera('T-15'); await abrir(); _plIr({ vista: 'tel', piso: 9, hitoSel: 'cap_electricas' }); await esperar(80);
teclear('P09AA1', '3.07', 75, true); history.back(); await esperar(700);
const cerrada = !abierta(); await abrir();
ok('P8 · El atrás cierra sin perder: al volver están las 4 casillas y avisa que se recuperó', cerrada && Object.keys(E().est.N).length === 4 && /recuperó/.test(($('#pl-aviso') || {}).textContent || ''), cerrada + ' · ' + (($('#pl-aviso') || {}).textContent || '').slice(0, 100));
_plDeshacer(); cerrarPlanilla(); await esperar(200); limpiar();
// ── P9 · El camino de Liz en la T-08 real: piso 10 (sin informes), los cuatro con «Lo mismo», guardar, enviar ──
await cabecera('T-08'); await abrir(); _plIr({ vista: 'tel', piso: 10, hitoSel: 'cap_sanitarias' }); await esperar(100);
teclear('P10AA1', '3.01', 100, true); teclear('P10AA1', '3.02', 50, true);
tap($('#pl-rev')); await esperar(120); if ($('#pl-rr')) tap($('#pl-rr')); tap($('#pl-rgua')); await esperar(800); cerrarPlanilla(); await esperar(200);
Q.dialogos.length = 0; await enviarPendientes(); await hasta(() => !_tandaEnCurso, 60000); await esperar(500);
const env9 = (await Q.envios()).filter(e => /EZ-T08-P10A/.test(e.numero || '')).map(e => e.numero);
ok('P9 · T-08 piso 10: salen los 4 (A1, A2, B1, B2) una vez cada uno', env9.length === 4 && new Set(env9).size === 4, env9.join(', '));
// ── P10 · Reabrir la T-08: el piso 10 ya está en gris, sin pendientes, y el 11 sigue disponible ──
await cabecera('T-08'); await abrir(); _plIr({ vista: 'tel', piso: 10, hitoSel: 'cap_sanitarias' }); await esperar(100);
const gris = ['A1', 'A2', 'B1', 'B2'].every(a => E().P.prev['P10A' + a] && E().P.prev['P10A' + a].pcts['3.01'] === 100);
ok('P10 · Al reabrir: el piso 10 en gris (100), nada pendiente, y el 11 trae sus 4', gris && !Object.keys(E().est.N).length && E().P.aptos.filter(x => x.p === 11).length === 4);
cerrarPlanilla(); nuevoFormulario(); localStorage.setItem('garmel_reports_list', '[]'); limpiar();
