// ESTRÉS 19 · un día de obra entero (2-nov-2026, rondas R7 a R12 de las 20): una torre de Ezequiel Zamora de la PB al 15 cargada
// desde el teléfono con «Lo mismo en…» piso por piso, los informes de planta baja, reabrir, corregir uno en el formulario,
// mandar los 64 de una vez, y la T-58 real de Christian otra vez el mismo día. Se corre en inspeccion.html?prueba=1 a 375×812.
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem('garmel_reports_list', '[]');
localStorage.removeItem('garmel_cortes'); Object.keys(_cortes).forEach(k => delete _cortes[k]);
const limpiar = () => Object.keys(localStorage).filter(k => /^garmel_planilla_/.test(k)).forEach(k => localStorage.removeItem(k));
limpiar();
await Q.relevo({ caido: false, fallar: [], lento: 0, colgar: 0, perder: false, cortar: 0, borrar: true });
await Q.relevo({ sembrarAvance: { sector: 'EZ', torre: 'T-09', prueba: true, informes: {} } });
const HOY = new Date().toISOString().slice(0, 10);
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const E = () => _plEstado(), N = (k, c) => E().est.N[k] && E().est.N[k][c];
const celda = (k, c) => $('#planilla .pl-c[data-k="' + k + '"][data-c="' + c + '"]');
const tap = el => { if (!el) throw new Error('no está'); el.click(); };
const dig = d => String(d).split('').forEach(x => tap($('#pl-sheet [data-d="' + x + '"]')));
const teclear = (k, c, v, todos) => { tap(celda(k, c)); dig(v); if (todos) tap($('#pl-kt')); tap($('#pl-ksi')); };
const cabecera = async (torre) => {
  nuevoFormulario(); await esperar(300); setAmbito('apartamento'); await esperar(200);
  sel('fecha', HOY); sel('convenio', 'Convenio Bielorrusos'); sel('torre', torre); await esperar(400);
  { const ins = document.querySelector('.inspector-select'); Q.elegir(ins, [...ins.options].map(o => o.value).filter(Boolean)[0]); await esperar(300); }
  if (!document.querySelector('#estatus .ck-lbl.on')) [...document.querySelectorAll('#estatus .ck-lbl')].find(l => /progreso/.test(l.textContent)).click();
};
const abrir = async () => { abrirPlanilla(); await hasta(() => E().P && /archivo|teléfono|guardado/.test(E().P.origenPrev || '') && !!$('#pl-cuerpo .pl-g'), 15000); await esperar(200); };

// ── R7 · La torre entera desde el teléfono: en cada nivel (PB a 15), 3.01, 3.02 y 3.07 con «Lo mismo en todo el piso» ──
await cabecera('T-09'); await abrir();
const t7 = performance.now();
for (let p = 0; p <= 15; p++) {
  _plIr({ vista: 'tel', piso: p, hitoSel: 'cap_sanitarias' }); await esperar(30);
  const k = 'P' + String(p).padStart(2, '0') + 'AA1';
  teclear(k, '3.01', 100, true); teclear(k, '3.02', 75, true);
  tap($('#planilla .pl-chips [data-h="cap_electricas"]')); await esperar(20);
  teclear(k, '3.07', 50, true);
}
const ms7 = Math.round(performance.now() - t7);
const llenos = Object.keys(E().est.N).length;
ok('R7 · 16 niveles × 4 apartamentos × 3 subpartidas con «Lo mismo…»: 64 apartamentos cambiados, en menos de 6 s de máquina', llenos === 64 && ms7 < 6000 && N('P00AB2', '3.07') === 50 && N('P15AA1', '3.01') === 100, llenos + ' · ' + ms7 + ' ms');
tap($('#pl-rev')); await esperar(120);
const rev = $('#pl-sheet').textContent;
ok('R7b · «Revisar y guardar» dice que salen 64 informes', /64 informes/.test(rev), rev.replace(/\s+/g, ' ').slice(0, 160));
if ($('#pl-rr')) tap($('#pl-rr')); tap($('#pl-rgua')); await esperar(1500);
const inf = getSavedReports().filter(b => /EZ-T09-/.test(b.nro || ''));
ok('R7c · Salen 64 informes con números distintos, de P00 a P15', inf.length === 64 && new Set(inf.map(b => b.nro)).size === 64 && inf.some(b => /-P00AA1-/.test(b.nro)) && inf.some(b => /-P15AB2-/.test(b.nro)), inf.length + ' informes');
cerrarPlanilla(); await esperar(200);
// ── R8 · Un informe de planta baja abierto en el formulario ──
const iPB = getSavedReports().findIndex(b => /EZ-T09-P00AB1-/.test(b.nro || ''));
loadDraftData(iPB); await esperar(1200);
const pisoPB = document.getElementById('piso').value, nroPB = document.getElementById('nro-display').textContent;
ok('R8 · El de planta baja se abre con piso «Planta Baja», apto B1 y su número P00AB1', /planta baja/i.test(pisoPB) && /P00AB1/.test(nroPB) && /B1/.test(document.getElementById('apto').value), pisoPB + ' · ' + nroPB);
// ── R9 · Corregir uno en el formulario: P07 A2, la 3.01 de 100 a 50; la planilla lo ve ──
const i9 = getSavedReports().findIndex(b => /EZ-T09-P07AA2-/.test(b.nro || ''));
loadDraftData(i9); await esperar(1200);
const pm = document.getElementById('pm_hito_servicios_' + CODIGOS_SUB.hito_servicios.indexOf('3.01'));
pm.value = '50'; pm.dispatchEvent(new Event('input', { bubbles: true })); pm.dispatchEvent(new Event('change', { bubbles: true })); saveDraft(true); await esperar(400);
await cabecera('T-09'); await abrir();
ok('R9 · Al reabrir la planilla, P07 A2 muestra 50 (lo corregido en el formulario) y no hay cambios pendientes', E().P.prev.P07AA2 && E().P.prev.P07AA2.pcts['3.01'] === 50 && !Object.keys(E().est.N).length, JSON.stringify(E().P.prev.P07AA2 && E().P.prev.P07AA2.pcts) + ' · ' + E().P.origenPrev);
cerrarPlanilla(); await esperar(200);
// ── R10 · Mandar los 64 de una vez (con 0,2 s por informe en el relevo) ──
await Q.relevo({ colgar: 0.2 });
const t10 = Date.now(); Q.dialogos.length = 0; await enviarPendientes(); await hasta(() => !_tandaEnCurso, 300000); await esperar(500);
await Q.relevo({ colgar: 0 });
const env = (await Q.envios()).filter(e => /EZ-T09-/.test(e.numero || '')).map(e => e.numero);
ok('R10 · Los 64 llegan una vez cada uno y nada queda pendiente', env.length === 64 && new Set(env).size === 64 && !getSavedReports().some(b => !b.enviado), env.length + ' en ' + Math.round((Date.now() - t10) / 1000) + ' s · ' + Q.dialogos.slice(-1)[0]);
ok('R10b · El aviso final dice «Enviados: 64» y «Con problemas: 0»', /Enviados: 64/.test(Q.dialogos.join(' ')) && /Con problemas: 0/.test(Q.dialogos.join(' ')));
// ── R11 · El mismo día, otra pasada por la torre: lo enviado se ve gris y volver a cambiar uno avisa que ya salió hoy ──
await cabecera('T-09'); await abrir();
_plIr({ vista: 'tel', piso: 3, hitoSel: 'cap_sanitarias' }); await esperar(80);
ok('R11 · Lo enviado hoy se ve como lo último (gris), sin cambios pendientes', E().P.prev.P03AA1 && E().P.prev.P03AA1.pcts['3.01'] === 100 && !Object.keys(E().est.N).length, E().P.origenPrev);
teclear('P03AA1', '3.02', 100, false); tap($('#pl-rev')); await esperar(120);
ok('R11b · Al revisar, avisa que ese apartamento ya salió hoy y pide marcar que es una corrección', !!$('#pl-rr') && /ya (se )?envi|salió hoy|ya salió/i.test($('#pl-sheet').textContent), $('#pl-sheet').textContent.replace(/\s+/g, ' ').slice(0, 200));
tap($('#pl-rseg')); _plDeshacer(); cerrarPlanilla(); await esperar(200);
// ── R12 · La T-58 real (lo que cargó Christian hoy, del archivo de Drive): se abre completa y sin pendientes ──
const real = await (await fetch('/reales/EZ-T-58.json?' + Date.now())).json();
const inf58 = {}; Object.keys(real.informes || {}).filter(k => k !== 'TORRE').forEach(k => { inf58[k] = real.informes[k]; });
await Q.relevo({ sembrarAvance: { sector: 'EZ', torre: 'T-58', prueba: true, informes: inf58 } });
await cabecera('T-58'); await abrir();
const hoy6 = HOY.slice(2).replace(/-/g, ''), deHoy = Object.keys(inf58).filter(k => String(inf58[k].nro || '').indexOf('-' + hoy6 + '-') > 0).length;
ok('R12 · La T-58 real abre con sus ' + Object.keys(inf58).length + ' apartamentos en gris (' + deHoy + ' de hoy) y nada pendiente', Object.keys(E().P.prev).length >= Object.keys(inf58).length && !Object.keys(E().est.N).length && E().P.pisos === 15, Object.keys(E().P.prev).length + ' · pisos ' + E().P.pisoMin + '–' + E().P.pisos);
cerrarPlanilla(); nuevoFormulario(); localStorage.setItem('garmel_reports_list', '[]'); limpiar();
