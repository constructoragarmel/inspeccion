// ESTRÉS 40 · guardar y seguir en la planilla (20-nov-2026, Miguel en la SB T-311): «Guardar», «Seguir en la planilla» y volver a
// tocar el mismo apartamento chocaba con el informe que la planilla acababa de dejar sin enviar. R1–R5 ahora se actualiza ese mismo
// informe, sin duplicar · R6 si el informe tiene algo del formulario (una observación de foto), el bloqueo se queda. Lo de dos
// pestañas (la otra se pone al día sola por el evento `storage`) se probó a mano con dos pestañas: no cabe en una tanda.
// En inspeccion.html?prueba=1 a 375×812.
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem('garmel_reports_list', '[]');
localStorage.removeItem('garmel_cortes'); localStorage.removeItem('garmel_enviados_lugar');
const limpiar = () => Object.keys(localStorage).filter(k => /^garmel_planilla_/.test(k)).forEach(k => localStorage.removeItem(k));
limpiar();
await Q.relevo({ caido: false, fallar: [], lento: 0, colgar: 0, perder: false, cortar: 0, borrar: true });
const HOY = new Date().toISOString().slice(0, 10);
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const E = () => _plEstado(), N = (k, c) => E().est.N[k] && E().est.N[k][c];
const celda = (k, c) => $('#planilla .pl-c[data-k="' + k + '"][data-c="' + c + '"]');
const tap = el => { if (!el) throw new Error('no está'); el.click(); };
const dig = d => String(d).split('').forEach(x => tap($('#pl-sheet [data-d="' + x + '"]')));
const teclear = (k, c, v) => { _plIr({ vista: 'tel', piso: +k.slice(1, 3), hitoSel: 'cap_sanitarias' }); tap(celda(k, c)); dig(v); tap($('#pl-ksi')); };
const inspectores = () => [...document.querySelector('.inspector-select').options].map(o => o.value).filter(Boolean);
const cabecera = async (conv, torre, insp) => {
  Q.aceptar = true; nuevoFormulario(); await esperar(300); setAmbito('apartamento'); await esperar(200);
  sel('fecha', HOY); sel('convenio', conv); sel('torre', torre); await esperar(400);
  Q.elegir(document.querySelector('.inspector-select'), insp || inspectores()[0]); await esperar(300);
  if (!document.querySelector('#estatus .ck-lbl.on')) [...document.querySelectorAll('#estatus .ck-lbl')].find(l => /progreso/.test(l.textContent)).click();
};
const abrir = async () => { abrirPlanilla(); await hasta(() => E().P && /archivo|teléfono|guardado/.test(E().P.origenPrev || '') && !!$('#pl-cuerpo .pl-g'), 15000); await esperar(200); };
const guardarPl = async () => { tap($('#pl-rev')); await esperar(150); const t = $('#pl-sheet').textContent; if ($('#pl-rr')) tap($('#pl-rr')); if ($('#pl-rb')) tap($('#pl-rb')); if (!$('#pl-rgua').disabled) tap($('#pl-rgua')); await esperar(800); return t; };
const EZ = 'Convenio Bielorrusos';
const revTexto = async () => { tap($('#pl-rev')); await esperar(200); const t = $('#pl-sheet').textContent; const g = $('#pl-rgua').disabled; tap($('#pl-rseg')); await esperar(150); return { t, gDis: g }; };
const fila301 = nro => { const b = getSavedReports().find(x => x.nro === nro && !x.enviado); if (!b) return 'no está'; for (const pid in b.partidas) { const i = (CODIGOS_SUB[pid] || []).indexOf('3.01'); if (i >= 0) return b.partidas[pid][i].pct; } return '?'; };
await Q.relevo({ sembrarAvance: { sector: 'EZ', torre: 'T-08', prueba: true, informes: {} } });
await cabecera(EZ, 'T-08'); await abrir();
teclear('P01AA1', '3.01', 10); teclear('P01AA2', '3.01', 20);
await guardarPl(); if ($('#pl-fseg')) tap($('#pl-fseg')); await esperar(200);
const n0 = getSavedReports().length;
const nA1 = getSavedReports().find(b => /-P01AA1-/.test(b.nro)).nro, nA2 = getSavedReports().find(b => /-P01AA2-/.test(b.nro)).nro;
// R1 · guardar y seguir sobre el mismo apartamento: se actualiza el mismo informe
teclear('P01AA1', '3.01', 30);
const a = await revTexto();
ok('R1 · la revisión dice que se actualiza y deja guardar', /se actualiza ese mismo informe/.test(a.t) && !/no se guarda/.test(a.t) && !a.gDis && /10 → 30/.test(a.t), a.t.slice(0, 300) + ' gDis=' + a.gDis);
await guardarPl();
const fin = $('#pl-sheet').textContent;
ok('R2 · no se duplica: mismo número de informes', getSavedReports().length === n0, n0 + ' → ' + getSavedReports().length);
ok('R3 · el A1 quedó en 30 y el A2 sigue en 20', fila301(nA1) === '30' && fila301(nA2) === '20', fila301(nA1) + ' / ' + fila301(nA2));
ok('R4 · el cierre dice que se actualizó', /se actualizó/.test(fin), fin.slice(0, 200));
if ($('#pl-fseg')) tap($('#pl-fseg')); await esperar(200);
ok('R5 · la barra queda limpia', !_plResumen().ks.length, JSON.stringify(E().est.N));
// R6 · si el informe de la planilla se tocó en el formulario (una foto con observación), el bloqueo se queda
{ const l = getSavedReports(); const b = l.find(x => x.nro === nA2); b.fotobs = Object.assign({}, b.fotobs, { x: 'grieta en el baño' }); localStorage.setItem('garmel_reports_list', JSON.stringify(l)); }
teclear('P01AA2', '3.01', 40);
const c = await revTexto();
ok('R6 · con algo del formulario sigue bloqueando', /no se guarda/.test(c.t) && c.gDis, c.t.slice(0, 250) + ' gDis=' + c.gDis);
// R7 · enviado el de la planilla, la siguiente vez es corrección como antes
await esperar(100);
