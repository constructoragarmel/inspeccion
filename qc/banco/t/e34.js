// ESTRÉS 34 · la planilla con lo que pasó en obra (11-nov-2026, QC de 20 rondas antes de la v206). P1 lo de Manuel Madrid (T-08,
// A1 de los pisos 1 y 2): un informe del mismo apartamento y fecha empezado en el formulario y sin enviar choca; lo demás se guarda
// y lo que chocó NO se pierde · P2 borrado ese borrador, se guarda · P3 dos inspectores en la misma torre, cada uno un ala (Diego,
// 11-nov: Gabriel y Carlos): cada uno saca solo lo suyo, con su número · P4 «B02» y «B2» (T-14 de Miguel): una sola fila con su gris ·
// P5 la SR T-43 real abre rápido y con el gris en todas sus filas. En inspeccion.html?prueba=1 a 375×812.
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

// ── P1 · Lo de Manuel: un borrador del formulario del mismo apartamento y día choca; lo demás sale y lo chocado se queda ──
await Q.relevo({ sembrarAvance: { sector: 'EZ', torre: 'T-08', prueba: true, informes: {} } });
await cabecera(EZ, 'T-08');
sel('piso', 'Piso 01'); await esperar(150); sel('apto', 'A1'); await esperar(300);
{ const c = document.getElementById('aviso-anterior'); if (c) c.innerHTML = ''; }
{ const i = document.querySelector('#main-content input[id^="pr_"]'), j = document.getElementById('ej_' + i.id.slice(3)); i.value = '10'; recalcRow(i); j.value = '2'; j.dispatchEvent(new Event('input', { bubbles: true })); }
saveDraft(true); await esperar(300);
const borr = getSavedReports().find(b => /-P01AA1-/.test(b.nro || ''));
await cabecera(EZ, 'T-08'); await abrir();
teclear('P01AA1', '3.01', 80); teclear('P01AA2', '3.01', 60);
const rev1 = await guardarPl();
const sal1 = getSavedReports().filter(b => b.planilla && /EZ-T08-/.test(b.nro));
ok('P1 · Lo de Manuel: el A1 choca con el borrador del formulario y lo dice; el A2 se guarda; el 80 del A1 sigue en la planilla',
   !!borr && /Ya hay un informe de este apartamento/.test(rev1) && sal1.length === 1 && /-P01AA2-/.test(sal1[0].nro) && N('P01AA1', '3.01') === 80,
   'borrador ' + !!borr + ' · guardados ' + sal1.map(b => b.nro).join(',') + ' · A1 pendiente ' + N('P01AA1', '3.01'));
cerrarPlanilla(); await esperar(200);

// ── P2 · Sin ese borrador, al volver a la planilla el 80 sigue ahí y se guarda ──
localStorage.setItem('garmel_reports_list', JSON.stringify(getSavedReports().filter(b => b.id !== (borr && borr.id))));
await cabecera(EZ, 'T-08'); await abrir();
const sigue = N('P01AA1', '3.01');
await guardarPl();
const sal2 = getSavedReports().filter(b => b.planilla && /-P01AA1-/.test(b.nro));
ok('P2 · Borrado el borrador: el 80 del A1 sigue en la planilla al volver y ahora sale', sigue === 80 && sal2.length === 1, 'pendiente al abrir ' + sigue + ' · salió ' + sal2.length);
cerrarPlanilla(); await esperar(200);

// ── P3 · Dos inspectores, cada uno un ala de la misma torre el mismo día ──
await Q.relevo({ sembrarAvance: { sector: 'EZ', torre: 'T-10', prueba: true, informes: {} } });
const [i1, i2] = inspectores();
await cabecera(EZ, 'T-10', i1); await abrir(); teclear('P03AA1', '3.01', 50); teclear('P03AA2', '3.01', 50); await guardarPl(); cerrarPlanilla(); await esperar(200);
await cabecera(EZ, 'T-10', i2); await abrir(); teclear('P03AB1', '3.01', 70); teclear('P03AB2', '3.01', 70); await guardarPl(); cerrarPlanilla(); await esperar(200);
const t10 = getSavedReports().filter(b => /EZ-T10-P/.test(b.nro || ''));
const ini = b => b.nro.split('-').pop();
const alaA = t10.filter(b => /P03AA/.test(b.nro)), alaB = t10.filter(b => /P03AB/.test(b.nro));
ok('P3 · Dos inspectores, un ala cada uno: 4 informes, solo de lo tocado, y las iniciales de cada uno en su ala',
   t10.length === 4 && alaA.length === 2 && alaB.length === 2 && ini(alaA[0]) !== ini(alaB[0]) && new Set(alaA.map(ini)).size === 1,
   t10.map(b => b.nro.replace(/^PRUEBA-/, '')).join(', '));

// ── P4 · «B02» y «B2» en el archivo de una torre de EZ: una fila en el piso 2, con su gris ──
await Q.relevo({ sembrarAvance: { sector: 'EZ', torre: 'T-11', prueba: true, informes: {
  P02AB2: { nro: 'PRUEBA-EZ-T11-P02AB02-261103-GM', fecha: '2026-11-03', piso: 'Piso 02', apto: 'B02', pcts: { '3.01': 55 } },
  P03AB2: { nro: 'PRUEBA-EZ-T11-P03AB2-261030-GM', fecha: '2026-10-30', piso: 'Piso 03', apto: 'B2', pcts: { '3.01': 40 } },
  P04AB2: { nro: 'PRUEBA-EZ-T11-P04AB2-261030-GM', fecha: '2026-10-30', piso: 'Piso 04', apto: 'B2', pcts: { '3.01': 40 } } } } });
limpiar(); await cabecera(EZ, 'T-11'); await abrir();
const p2 = E().P.aptos.filter(x => x.p === 2 && /^B0?2$/.test(x.a));
ok('P4 · «B02» del archivo y «B2» de la torre son una sola fila en el piso 2, con el 55 en gris', p2.length === 1 && E().P.prev[p2[0].k] && E().P.prev[p2[0].k].pcts['3.01'] === 55,
   p2.map(x => x.k + '=' + JSON.stringify(E().P.prev[x.k] && E().P.prev[x.k].pcts)).join(' · '));
cerrarPlanilla(); await esperar(200);

// ── P5 · La SR T-43 real (letra + piso, 78 apartamentos con historial): abre en menos de 3 s y con el gris en cada fila ──
const real = await (await fetch('/reales/SR-T-43.json?' + Date.now())).json();
const inf43 = {}; Object.keys(real.informes || {}).filter(k => k !== 'TORRE').forEach(k => { inf43[k] = real.informes[k]; });
await Q.relevo({ sembrarAvance: { sector: 'SR', torre: 'T-43', prueba: true, informes: inf43 } });
limpiar(); await cabecera('Convenio Rusos', 'T-43');
const t5 = performance.now(); abrirPlanilla(); await hasta(() => E().P && E().P.origenPrev === 'del archivo' && !!$('#pl-cuerpo .pl-g'), 15000); const ms5 = Math.round(performance.now() - t5);
const sc = k => String(k).replace(/([A-Z])0+(?=\d)/g, '$1');
const sinGris = Object.keys(inf43).filter(k => { const x = E().P.aptos.find(y => sc(y.k) === sc(k)); return !x || !E().P.prev[x.k]; });
ok('P5 · SR T-43 real: abre en ' + ms5 + ' ms y los ' + Object.keys(inf43).length + ' apartamentos con historial tienen su gris en su fila', ms5 < 3000 && !sinGris.length, sinGris.length + ' sin gris: ' + sinGris.slice(0, 6).join(','));
cerrarPlanilla(); await esperar(200);

ok('P6 · Cabe a 375: nada se sale de la pantalla', document.documentElement.scrollWidth <= innerWidth + 1, document.documentElement.scrollWidth + ' / ' + innerWidth);
Q.aceptar = true; localStorage.setItem('garmel_reports_list', '[]'); limpiar(); nuevoFormulario();
