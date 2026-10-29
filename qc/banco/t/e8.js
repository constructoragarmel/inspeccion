// ESTRÉS 8 · planilla de avance (cambio 199), 29-oct-2026. QC6 a QC10 de las 20 rondas: señal, recuperación, dos equipos,
// torres sin lista y torres anchas. inspeccion.html?prueba=1, a 375 px y A LA VISTA.
// QC6 la señal de obra: con lo guardado abre al instante aunque el relevo tarde; sin nada guardado espera y no se cuelga
//     más de 13 s; caído; la respuesta del envío perdida no duplica.
// QC7 lo que no se guardó: cerrar a medias, reabrir otro día, otro informe que llegó entretanto (queda como baja), y el
//     teléfono sin espacio al guardar.
// QC8 dos inspectoras (un equipo y el otro) en la misma torre el mismo día.
// QC9 una torre sin lista de apartamentos (Simón Rodríguez): agregarlos desde el teléfono, muchos de una vez, nombres raros.
// QC10 una torre de 8 por piso (Simón Bolívar J-09): la primera columna fija, se llega a la última, «lo mismo en los otros 7».
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem('garmel_reports_list', '[]');
Object.keys(localStorage).filter(k => /^garmel_planilla_/.test(k)).forEach(k => localStorage.removeItem(k));
await Q.relevo({ caido: false, fallar: [], lento: 0, colgar: 0, perder: false, borrar: true });
const semilla = () => { const s = {}; for (let p = 1; p <= 12; p++) ['A1', 'A2', 'B1', 'B2'].forEach(a => { const k = 'P' + String(p).padStart(2, '0') + 'A' + a; s[k] = { nro: 'PRUEBA-EZ-T07-' + k + '-261020-XX', fecha: '2026-10-20', piso: 'Piso ' + String(p).padStart(2, '0'), apto: a, pcts: { '2.02': 100, '3.01': 50, '3.02': 40, '3.03': 30, '4.01': 25 } }; }); return s; };
await Q.relevo({ sembrarAvance: { sector: 'EZ', torre: 'T-07', prueba: true, informes: semilla() } });
Q.aceptar = true;
const HOY = new Date().toISOString().slice(0, 10), hoy6 = HOY.slice(2).replace(/-/g, '');
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const insp = n => { const ins = document.querySelector('.inspector-select'); Q.elegir(ins, [...ins.options].map(o => o.value).filter(Boolean)[n || 0]); };
const cabecera = async (o) => {
  o = o || {};
  nuevoFormulario(); await esperar(300); setAmbito('apartamento'); await esperar(200);
  sel('fecha', o.fecha || HOY); sel('convenio', o.convenio || 'Convenio Bielorrusos'); sel('torre', o.torre || 'T-07'); await esperar(400);
  insp(o.insp); await esperar(300);
  if (!document.querySelector('#estatus .ck-lbl.on')) [...document.querySelectorAll('#estatus .ck-lbl')].find(l => /progreso/.test(l.textContent)).click();
};
const E = () => _plEstado();
const celda = (k, c) => $('#planilla .pl-c[data-k="' + k + '"][data-c="' + c + '"]');
const tap = el => { if (!el) throw new Error('no está'); el.click(); };
const teclear = (k, c, dig, todos) => { tap(celda(k, c)); String(dig).split('').forEach(d => tap($('#pl-sheet [data-d="' + d + '"]'))); if (todos) tap($('#pl-kt')); tap($('#pl-ksi')); };
const ir = async o => { _plIr(o); await esperar(60); };
const listo = () => E().P && /archivo|teléfono|guardado/.test(E().P.origenPrev) && !!$('#pl-cuerpo .pl-g, #pl-cuerpo .pl-o, #pl-cuerpo .pl-piso');
const guardar = async () => { tap($('#pl-rev')); await esperar(60); if ($('#pl-rb')) tap($('#pl-rb')); if ($('#pl-rr')) tap($('#pl-rr')); tap($('#pl-rgua')); await esperar(250); };
const enviar = async () => { const n = (await Q.envios()).length; await enviarPendientes(); await hasta(() => !_tandaEnCurso, 90000); await esperar(800); return (await Q.envios()).slice(n).filter(e => e.numero); };
const errJS = []; const _oe = window.onerror; window.onerror = (m) => { errJS.push(String(m)); };

// ── QC6 · la señal ──
await cabecera();
abrirPlanilla(); await hasta(listo, 15000); cerrarPlanilla();          // deja lo del archivo guardado en el teléfono
await Q.relevo({ lento: 8 });
let t = performance.now(); abrirPlanilla(); await hasta(() => !!$('#pl-cuerpo .pl-g, #pl-cuerpo .pl-o'), 3000); const ms6a = performance.now() - t;
ok('QC6a · Con lo guardado y el relevo tardando 8 s, la planilla se puede usar en menos de 1,5 s y dice que se está actualizando', ms6a < 1500 && /actualiz/i.test($('#pl-aviso').textContent), Math.round(ms6a) + ' ms · ' + $('#pl-aviso').textContent.slice(0, 100));
await hasta(() => E().P && E().P.origenPrev === 'del archivo', 12000);
ok('QC6b · Cuando el archivo contesta, lo gris se pone al día y el aviso se va', E().P.origenPrev === 'del archivo' && !/actualiz/i.test($('#pl-aviso').textContent));
cerrarPlanilla();
await Q.relevo({ lento: 20 });   // la consulta se queda colgada 20 s: la app corta a los 12
Object.keys(localStorage).filter(k => /^garmel_planilla_prev_/.test(k)).forEach(k => localStorage.removeItem(k));
t = performance.now(); abrirPlanilla(); await hasta(() => listo() && /Sin conexión/.test($('#pl-aviso').textContent), 16000); const ms6c = performance.now() - t;
ok('QC6c · Sin nada guardado y el relevo colgado, abre en 13 s o menos con «solo de este teléfono» y lo dice', ms6c < 13500 && /Sin conexión/.test($('#pl-aviso').textContent), Math.round(ms6c) + ' ms · ' + $('#pl-aviso').textContent.slice(0, 120));
cerrarPlanilla(); await esperar(9000); await Q.relevo({ lento: 0, caido: true });
t = performance.now(); abrirPlanilla(); await hasta(() => listo() && /Sin conexión/.test($('#pl-aviso').textContent), 8000); const ms6d = performance.now() - t;
ok('QC6d · Con el relevo caído abre enseguida y lo dice', ms6d < 3000 && /Sin conexión/.test($('#pl-aviso').textContent), Math.round(ms6d) + ' ms');
await ir({ vista: 'tel', piso: 1, hitoSel: 'hito_servicios' }); teclear('P01AA1', '3.01', 55); await guardar(); tap($('#pl-fseg')); cerrarPlanilla();
const e6 = await enviar();
ok('QC6e · Caído: «Enviar todos» no manda nada y el informe queda pendiente', e6.length === 0 && getSavedReports().some(b => /-P01AA1-/.test(b.nro) && !b.enviado));
await Q.relevo({ caido: false, perder: true });
const e6b = await enviar(); await Q.relevo({ perder: false });
const e6c = await enviar();
const todos6 = (await Q.envios()).filter(e => /-P01AA1-/.test(e.numero || ''));
ok('QC6f · Con la respuesta perdida y el reintento, en el relevo queda una sola vez y el teléfono lo da por enviado', getSavedReports().filter(b => /-P01AA1-/.test(b.nro)).every(b => b.enviado) && new Set(todos6.map(e => e.numero)).size === 1, todos6.length + ' envíos · ' + e6b.length + '+' + e6c.length);

// ── QC7 · lo que no se guardó ──
localStorage.setItem('garmel_reports_list', '[]'); Object.keys(localStorage).filter(k => /^garmel_planilla_/.test(k)).forEach(k => localStorage.removeItem(k));
await Q.relevo({ borrar: true }); await Q.relevo({ sembrarAvance: { sector: 'EZ', torre: 'T-07', prueba: true, informes: semilla() } });
const ayer = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
await cabecera({ fecha: ayer }); abrirPlanilla(); await hasta(listo, 15000);
await ir({ vista: 'tel', piso: 2, hitoSel: 'hito_servicios' }); teclear('P02AA1', '3.01', 60); teclear('P02AA2', '3.01', 70);
tap($('#planilla [data-com="P02AA1"]')); $('#pl-ct').value = 'Falta el punto del lavadero'; tap($('#pl-csi'));
cerrarPlanilla(); nuevoFormulario(); await esperar(300);
// Entretanto otra inspectora mandó P02 A2 con 3.01 = 90.
const s7 = semilla(); s7.P02AA2 = Object.assign({}, s7.P02AA2, { fecha: HOY, nro: 'PRUEBA-EZ-T07-P02AA2-' + hoy6 + '-ZZ', pcts: Object.assign({}, s7.P02AA2.pcts, { '3.01': 90 }) });
await Q.relevo({ sembrarAvance: { sector: 'EZ', torre: 'T-07', prueba: true, informes: s7 } });
await cabecera({ fecha: HOY }); abrirPlanilla(); await hasta(() => listo() && E().P.origenPrev === 'del archivo', 15000); await esperar(200);
ok('QC7a · Al día siguiente se recupera lo de ayer (dos casillas y la nota) y lo dice', E().est.N.P02AA1 && E().est.N.P02AA1['3.01'] === 60 && E().est.C.P02AA1 === 'Falta el punto del lavadero' && /recuper/i.test($('#pl-aviso').textContent));
ok('QC7b · Lo de P02 A2 (70) quedó por debajo de lo que llegó entretanto (90): se marca como baja y pide confirmarla', _plResumen().bajas.some(b => b[0] === 'P02AA2'));
tap($('#pl-rev')); await esperar(60);
ok('QC7c · …y la revisión no deja guardar sin confirmar la baja', $('#pl-rgua').disabled && !!$('#pl-rb'));
tap($('#pl-rseg'));
const _set = Storage.prototype.setItem;
Storage.prototype.setItem = function(k, v){ if (k === 'garmel_reports_list') throw new DOMException('lleno', 'QuotaExceededError'); return _set.apply(this, arguments); };
tap($('#pl-rev')); await esperar(60); tap($('#pl-rb')); tap($('#pl-rgua')); await esperar(250);
Storage.prototype.setItem = _set;
ok('QC7d · Sin espacio al guardar: lo dice, no se pierde nada de la planilla y se puede volver a intentar', /sin espacio/i.test(_plUltimoAviso()) && _plResumen().ks.length === 2 && getSavedReports().length === 0 && !$('#pl-rgua').disabled, _plUltimoAviso());
tap($('#pl-rgua')); await esperar(250);
ok('QC7e · Con espacio otra vez, guarda los dos', getSavedReports().length === 2 && _plResumen().ks.length === 0, getSavedReports().map(b => b.nro).join(' '));
if ($('#pl-fseg')) tap($('#pl-fseg')); cerrarPlanilla();

// ── QC8 · dos equipos en la misma torre el mismo día ──
localStorage.setItem('garmel_reports_list', '[]'); Object.keys(localStorage).filter(k => /^garmel_planilla_/.test(k)).forEach(k => localStorage.removeItem(k));
await Q.relevo({ borrar: true }); await Q.relevo({ sembrarAvance: { sector: 'EZ', torre: 'T-07', prueba: true, informes: semilla() } });
await cabecera({ insp: 0 }); const iniA = _plNroPara(1, 'A1').split('-').pop();
abrirPlanilla(); await hasta(listo, 15000); await ir({ vista: 'tel', piso: 10, hitoSel: 'hito_servicios' });
teclear('P10AA1', '3.01', 60, true); await guardar(); tap($('#pl-fseg')); cerrarPlanilla(); await enviar();
// El otro teléfono: sin informes ni nada guardado de la planilla.
localStorage.setItem('garmel_reports_list', '[]'); Object.keys(localStorage).filter(k => /^garmel_planilla_/.test(k)).forEach(k => localStorage.removeItem(k));
await cabecera({ insp: 1 }); const iniB = _plNroPara(1, 'A1').split('-').pop();
abrirPlanilla(); await hasta(() => listo() && E().P.origenPrev === 'del archivo', 15000); await ir({ vista: 'tel', piso: 10, hitoSel: 'hito_servicios' });
ok('QC8a · La segunda inspectora ve en gris lo que mandó la primera (P10 × 4 en 60)', ['A1', 'A2', 'B1', 'B2'].every(a => E().P.prev['P10A' + a].pcts['3.01'] === 60) && iniA !== iniB, iniA + ' / ' + iniB);
teclear('P10AA1', '3.01', 75); await guardar(); tap($('#pl-fseg')); cerrarPlanilla();
const b8 = getSavedReports()[0];
ok('QC8b · Su informe de P10 A1 lleva sus iniciales: otro número, no choca con el de la primera', b8 && b8.nro.endsWith('-' + iniB) && !b8.nro.endsWith('-' + iniA), b8 && b8.nro);
await enviar();
localStorage.setItem('garmel_reports_list', '[]');
await cabecera({ insp: 0 }); abrirPlanilla(); await hasta(() => listo() && E().P.origenPrev === 'del archivo', 15000);
ok('QC8c · Al volver la primera, ve 75 (lo último del día) en P10 A1', E().P.prev.P10AA1.pcts['3.01'] === 75, JSON.stringify(E().P.prev.P10AA1));
cerrarPlanilla();

// ── QC9 · una torre sin lista (Simón Rodríguez T-04) ──
localStorage.setItem('garmel_reports_list', '[]');
await cabecera({ convenio: 'Convenio Rusos', torre: 'T-04' });
abrirPlanilla(); await hasta(listo, 15000); await ir({ vista: 'tel' });
ok('QC9a · Sin lista ni informes, en el teléfono dice cómo agregar apartamentos y tiene el botón ahí mismo', /no tiene apartamentos/i.test($('#pl-cuerpo').textContent) && !!$('#pl-mas') && $('#pl-mas').offsetParent !== null);
tap($('#pl-mas')); await esperar(60);
const ponerEn = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
ponerEn('pl-np', '1'); ponerEn('pl-np2', '12'); ponerEn('pl-na', 'A1 A2 A3 A4 A5, B1 B2 B3 B4 B5');
tap($('#pl-nsi')); await esperar(150);
ok('QC9b · Diez apartamentos en los 12 pisos de una vez: 120 en la planilla', E().P.aptos.length === 120 && E().P.pisos === 12, E().P.aptos.length + ' · ' + E().P.pisos + ' pisos');
tap($('#pl-mas')); await esperar(60); ponerEn('pl-np', '3'); ponerEn('pl-np2', '3'); ponerEn('pl-na', 'a1 <b>c1</b> c-2'); tap($('#pl-nsi')); await esperar(150);
const esperados9 = _aptosEscritos('a1 <b>c1</b> c-2', '').filter(a => a !== 'A1');
ok('QC9c · Lo repetido (A1) no se duplica y lo raro se limpia igual que en «Repetir en otros apartamentos», sin HTML', E().P.aptos.length === 120 + esperados9.length && esperados9.every(a => E().P.aptos.some(x => x.k === 'P03A' + a)) && !$('#planilla').innerHTML.match(/<b>c1/i), E().P.aptos.filter(x => x.p === 3).map(x => x.a).join(','));
const n9 = E().P.aptos.length;
await ir({ vista: 'tel', piso: 3, hitoSel: 'hito_servicios' }); teclear('P03AC2', '3.01', 40);
await guardar();
const b9 = getSavedReports().find(b => /-P03AC2-/.test(b.nro));
ok('QC9d · El agregado sale como cualquier otro: PRUEBA-SR-T04-P03AC2-…', !!b9 && /^PRUEBA-SR-T04-P03AC2-\d{6}-/.test(b9.nro) && b9.apto === 'C2', b9 && b9.nro);
tap($('#pl-fseg')); cerrarPlanilla();
abrirPlanilla(); await hasta(listo, 15000);
ok('QC9e · Al reabrir, los apartamentos agregados siguen ahí', E().P.aptos.length === n9, E().P.aptos.length + ' / ' + n9);
cerrarPlanilla();

// ── QC10 · ocho por piso (SB J-09) ──
localStorage.setItem('garmel_reports_list', '[]');
await cabecera({ convenio: 'Convenio Chinos', torre: 'J-09' });
abrirPlanilla(); await hasta(listo, 15000); await ir({ vista: 'tel', piso: 2, hitoSel: 'hito_servicios' });
const gw = $('#planilla .pl-gw'), ths = $$('#planilla .pl-g thead th');
ok('QC10a · Ocho apartamentos: la tabla se desliza dentro de su caja, la página no', ths.length === 9 && document.documentElement.scrollWidth <= innerWidth + 1 && gw.scrollWidth > gw.clientWidth, ths.length + ' columnas · ' + gw.scrollWidth + '/' + gw.clientWidth);
gw.scrollLeft = 9999; await esperar(80);
const primera = $('#planilla .pl-g tbody th').getBoundingClientRect(), ultima = celda('P02AC2', '3.01').getBoundingClientRect();
ok('QC10b · Deslizada al final: el nombre de la subpartida sigue fijo a la izquierda y la última columna (C2) se ve entera', primera.left >= 0 && primera.left < 30 && ultima.right <= innerWidth && ultima.left >= primera.right - 1, 'fija ' + Math.round(primera.left) + '-' + Math.round(primera.right) + ' · C2 ' + Math.round(ultima.left) + '-' + Math.round(ultima.right));
teclear('P02AC2', '3.01', 35, true);
ok('QC10c · «Lo mismo en los otros 7 apartamentos» desde la última columna', ['E11', 'E12', 'D11', 'D12', 'A1', 'A2', 'C1', 'C2'].every(a => E().est.N['P02A' + a] && E().est.N['P02A' + a]['3.01'] === 35), JSON.stringify(Object.keys(E().est.N)));
const chicos = [...document.querySelectorAll('#planilla button, #planilla select, #planilla input')].filter(e => { const r = e.getBoundingClientRect(); return r.width && r.height && r.height < 44; }).map(e => e.id || e.className);
ok('QC10d · Todo lo que se toca mide 44 px o más', !chicos.length, chicos.join(','));
cerrarPlanilla();
ok('QC10e · Ningún error de JavaScript en las cinco rondas', !errJS.length, errJS.join(' | ').slice(0, 200));
window.onerror = _oe;
nuevoFormulario(); localStorage.setItem('garmel_reports_list', '[]');
Object.keys(localStorage).filter(k => /^garmel_planilla_/.test(k)).forEach(k => localStorage.removeItem(k));
