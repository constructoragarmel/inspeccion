// ESTRÉS 9 · planilla de avance (cambio 199), 29-oct-2026. QC11 a QC15 de las 20 rondas: el teclado, la oficina, la hoja
// impresa, las bajas y el informe abierto en el formulario. inspeccion.html?prueba=1, a 375 px y A LA VISTA.
// QC11 el teclado a fondo: dígitos, rápidos, borrar, «igual que antes», Sí / No, lo cerrado, «lo mismo» con cerrados y sin
//      dato, 105 cambios y 100 deshacer, notas raras, Escape, contadores de los hitos y de los pisos.
// QC12 la oficina a fondo: todos los hitos abiertos (2.400 casillas) rápido, pegar de Excel con lo raro (fracciones,
//      miles, texto, vacíos), lo escrito sin salir de la casilla cuenta al guardar, Enter en los bordes, pisos.
// QC13 la hoja impresa: «La pasa» se pide aunque se guarde desde la vista de obra; el origen del informe dice oficina u
//      obra según de dónde vino; fechas imposibles.
// QC14 bajas, descartar y deshacer.
// QC15 el informe de la planilla abierto en el formulario: conteo, estado a mano (37), Sí / No, la nota; se corrige y se
//      envía sin perder nada.
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem('garmel_reports_list', '[]');
Object.keys(localStorage).filter(k => /^garmel_planilla_/.test(k)).forEach(k => localStorage.removeItem(k));
await Q.relevo({ caido: false, fallar: [], lento: 0, colgar: 0, perder: false, borrar: true });
const semilla = () => { const s = {}; for (let p = 1; p <= 12; p++) ['A1', 'A2', 'B1', 'B2'].forEach(a => { const k = 'P' + String(p).padStart(2, '0') + 'A' + a; s[k] = { nro: 'PRUEBA-EZ-T07-' + k + '-261020-XX', fecha: '2026-10-' + (p <= 6 ? '20' : '25'), piso: 'Piso ' + String(p).padStart(2, '0'), apto: a, pcts: { '2.02': 100, '3.01': 50, '3.02': 40, '3.03': 30, '4.01': 25, '11.01': p === 1 ? 100 : 0 } }; }); return s; };
await Q.relevo({ sembrarAvance: { sector: 'EZ', torre: 'T-07', prueba: true, informes: semilla() } });
Q.aceptar = true;
const HOY = new Date().toISOString().slice(0, 10), AYER = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const cabecera = async () => {
  nuevoFormulario(); await esperar(300); setAmbito('apartamento'); await esperar(200);
  sel('fecha', HOY); sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-07'); await esperar(400);
  const ins = document.querySelector('.inspector-select'); Q.elegir(ins, [...ins.options].map(o => o.value).filter(Boolean)[0]); await esperar(300);
  if (!document.querySelector('#estatus .ck-lbl.on')) [...document.querySelectorAll('#estatus .ck-lbl')].find(l => /progreso/.test(l.textContent)).click();
};
const E = () => _plEstado();
const celda = (k, c) => $('#planilla .pl-c[data-k="' + k + '"][data-c="' + c + '"]');
const tap = el => { if (!el) throw new Error('no está'); el.click(); };
const dig = d => String(d).split('').forEach(x => tap($('#pl-sheet [data-d="' + x + '"]')));
const disp = () => $('#pl-kd').textContent.replace('%', '').trim();
const teclear = (k, c, v, todos) => { tap(celda(k, c)); dig(v); if (todos) tap($('#pl-kt')); tap($('#pl-ksi')); };
const ir = async o => { _plIr(o); await esperar(60); };
const listo = () => E().P && /archivo|teléfono|guardado/.test(E().P.origenPrev) && !!$('#pl-cuerpo .pl-g, #pl-cuerpo .pl-o, #pl-cuerpo .pl-piso');
const abrir = async () => { abrirPlanilla(); await hasta(() => listo() && E().P.origenPrev === 'del archivo', 15000); await esperar(150); };
const fila = (d, cod) => { for (const pid of Object.keys(d.partidas)) { const i = (CODIGOS_SUB[pid] || []).indexOf(cod); if (i >= 0 && Array.isArray(d.partidas[pid])) return d.partidas[pid][i]; } };
const N = (k, c) => E().est.N[k] && E().est.N[k][c];
const errJS = []; const _oe = window.onerror; window.onerror = (m) => { errJS.push(String(m)); };

// ── QC11 · el teclado ──
await cabecera(); await abrir(); await ir({ vista: 'tel', piso: 3, hitoSel: 'hito_servicios' });
tap(celda('P03AA1', '3.01'));
tap($('#pl-sheet [data-r="75"]')); dig(5); const a1 = disp();
dig(0); const a2 = disp();
tap($('#pl-sheet [data-x="borrar"]')); tap($('#pl-sheet [data-x="borrar"]')); tap($('#pl-sheet [data-x="borrar"]')); const a3 = disp();
dig('100'); dig(1); const a4 = disp();
ok('QC11a · Rápido 75 y luego 5 empieza de nuevo (5); 5 y 0 = 50; borrar hasta vacío muestra lo de antes; 100 y otro dígito no pasa de 100', a1 === '5' && a2 === '50' && a3 === '50' && a4 === '100', [a1, a2, a3, a4].join(' | '));
tap($('#pl-ksi'));
tap(celda('P03AA1', '3.01')); tap($('#pl-sheet [data-x="igual"]')); tap($('#pl-ksi'));
ok('QC11b · «Igual que antes» quita el cambio', !N('P03AA1', '3.01'));
teclear('P03AA1', '3.01', 50);
ok('QC11c · Poner el mismo número de antes no cuenta como cambio', !N('P03AA1', '3.01') && _plResumen().n === 0, JSON.stringify(E().est.N));
await ir({ hitoSel: 'hito_pruebas', piso: 1 }); tap(celda('P01AA1', '11.01'));
ok('QC11d · Sí / No que ya estaba en Sí: pide 🔓 antes de cambiarlo', !!$('#pl-c100-si'));
tap($('#pl-c100-si')); tap($('#pl-sheet .pl-sino [data-v="0"]'));
ok('QC11e · Corregido a «No hecha»: queda como baja', N('P01AA1', '11.01') === 0 && _plResumen().bajas.length === 1);
_plDeshacer();
await ir({ piso: 2 }); tap(celda('P02AA1', '11.01')); tap($('#pl-sheet .pl-sino [data-v="100"]'));
ok('QC11f · Sí / No sin 🔓 cuando estaba en No; la casilla dice «Sí»', N('P02AA1', '11.01') === 100 && /Sí/.test(celda('P02AA1', '11.01').textContent));
await ir({ hitoSel: 'hito_cerramientos', piso: 4 });
tap(celda('P04AA1', '2.02')); tap($('#pl-c100-si')); dig(80); tap($('#pl-kt')); tap($('#pl-ksi'));
ok('QC11g · «Lo mismo» con 80 desde uno cerrado: los otros (en 100) no bajan y lo dice', N('P04AA1', '2.02') === 80 && !N('P04AA2', '2.02') && /No se bajó/.test(_plUltimoAviso()), _plUltimoAviso());
_plDeshacer();
await ir({ hitoSel: 'hito_servicios', piso: 4 });
teclear('P04AA1', '3.07', 20, true);
ok('QC11h · «Lo mismo» en una subpartida sin dato: los cuatro quedan en 20', ['A1', 'A2', 'B1', 'B2'].every(a => N('P04A' + a, '3.07') === 20));
const chip = $('#planilla .pl-chips [data-h="hito_servicios"] .pl-cnt'), opt = [...$('#pl-psel').options].find(o => o.value === '4');
ok('QC11i · El hito muestra 4 cambios y el piso 4 lleva el punto en el desplegable', chip && chip.textContent === '4' && /•/.test(opt.textContent), (chip && chip.textContent) + ' · ' + opt.textContent);
await ir({ piso: 5 });
for (let i = 0; i < 105; i++) teclear('P05AA1', '3.01', String(51 + (i % 49)));
const pl = E().pila.length; for (let i = 0; i < 100; i++) _plDeshacer();
ok('QC11j · 105 cambios: el deshacer guarda los últimos 100 y después de 100 «↶» el botón queda apagado sin errores', pl === 100 && E().pila.length === 0 && $('#pl-undo').disabled && !errJS.length, 'pila ' + pl);
await ir({ piso: 4 });
tap($('#planilla [data-com="P04AB1"]')); const raro = '<img src=x onerror=alert(1)> «comillas» "dobles" \'simples\' 🧱 ñ\n' + 'x'.repeat(3000);
$('#pl-ct').value = raro; tap($('#pl-csi'));
tap($('#planilla [data-com="P04AB1"]')); $('#pl-ct').value = 'otra cosa'; tap($('#pl-cno'));
ok('QC11k · Una nota con HTML, emoji y 3.000 letras queda tal cual (sin ejecutar nada); «Cancelar» no la cambia', E().est.C.P04AB1 === raro.trim() && !$('#planilla img'));
tap($('#planilla [data-ay="3.01"]')); const ay = $('#pl-sheet').textContent;
document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await esperar(50);
ok('QC11l · La ayuda de la subpartida dice qué cuenta, y Escape la cierra', /agua fría/.test(ay) && $('#pl-fondo').hidden);
tap(celda('P04AB2', '3.01')); document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await esperar(50);
ok('QC11m · Tocar «‹» en el primer piso y «›» en el último no hace nada (están apagados)', (await (async () => { await ir({ piso: 1 }); const a = $('#pl-ant').disabled; await ir({ piso: 12 }); return a && $('#pl-sig').disabled; })()));
cerrarPlanilla(); Object.keys(localStorage).filter(k => /^garmel_planilla_EZ/.test(k)).forEach(k => localStorage.removeItem(k));

// ── QC12 · la oficina ──
await cabecera(); await abrir(); await ir({ vista: 'tabla' });
E().LISTA.forEach(h => _plIr({ abrir: h.id }));
let t = performance.now(); await ir({ vista: 'tabla' }); const ms12 = performance.now() - t;
const nIn = $$('#planilla input.pl-pc').length;
ok('QC12a · Todos los hitos abiertos: ' + nIn + ' casillas pintadas en menos de 1,5 s', nIn === 48 * 50 && ms12 < 1500, Math.round(ms12) + ' ms');
const inp = (k, c) => $('#planilla input.pl-pc[data-k="' + k + '"][data-c="' + c + '"]');
const pegar = (k, c, txt) => { const dt = new DataTransfer(); dt.setData('text/plain', txt); const i = inp(k, c); i.focus(); i.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true })); };
t = performance.now();
pegar('P02AA1', '3.01', '75%\t0,5\t1.000\t\t 80 \r\nhola\t60\t60,4\t100\t-5\r\n');   // columnas 3.01 3.02 3.03 3.04 3.07 (3.05 y 3.06 son de torre)
const ms12b = performance.now() - t;
ok('QC12b · Pegar de Excel: «75%», «80», «60», «60,4», «100» entran; «0,5» (fracción), «1.000», «hola» y «-5» no; las vacías no tocan nada', N('P02AA1', '3.01') === 75 && N('P02AA1', '3.07') === 80 && N('P02AA2', '3.02') === 60 && N('P02AA2', '3.03') === 60 && N('P02AA2', '3.04') === 100 && !N('P02AA2', '3.07') && !N('P02AA1', '3.02') && !N('P02AA1', '3.03') && !N('P02AA2', '3.01') && /4 no eran/.test(_plUltimoAviso()), _plUltimoAviso() + ' · ' + JSON.stringify(E().est.N));
ok('QC12c · …en menos de 1,5 s con todo abierto', ms12b < 1500, Math.round(ms12b) + ' ms');
pegar('P12AB2', '3.01', '10\n20\n30\n');
ok('QC12d · Pegar desde la última fila: entra lo que cabe y avisa de lo que quedó fuera', N('P12AB2', '3.01') === 10 && /2 quedaban fuera/.test(_plUltimoAviso()), _plUltimoAviso());
const i12 = inp('P12AB2', '3.02'); i12.focus(); i12.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
const f1 = document.activeElement === i12;
const i12b = inp('P01AA1', '3.02'); i12b.focus(); i12b.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true, bubbles: true }));
ok('QC12e · Enter en la última fila y Mayúsculas+Enter en la primera no saltan a ningún lado ni fallan', f1 && document.activeElement === i12b && !errJS.length);
const i12c = inp('P03AB1', '3.08'); i12c.focus(); i12c.value = '45';      // escrito y sin salir de la casilla
tap($('#pl-rev')); await esperar(60);
ok('QC12f · Lo escrito sin salir de la casilla cuenta al tocar «Revisar y guardar»', N('P03AB1', '3.08') === 45 && /P03AB1|Piso 03 · B1/.test($('#pl-sheet').textContent));
tap($('#pl-rseg'));
const np = $('#pl-npisos'); np.value = '1'; np.dispatchEvent(new Event('change')); await esperar(60);
const quedo = E().P.pisos; const np2 = $('#pl-npisos'); np2.value = '15'; np2.dispatchEvent(new Event('change')); await esperar(100);
ok('QC12g · «Pisos de la torre»: no deja quitar pisos con datos; subir a 15 agrega los pisos 13 a 15 con sus 4 apartamentos', quedo === 12 && E().P.pisos === 15 && E().P.aptos.length === 60, quedo + ' → ' + E().P.pisos + ' · ' + E().P.aptos.length);

// ── QC13 · la hoja impresa ──
const imp = $('#pl-impresa'); imp.value = AYER; imp.dispatchEvent(new Event('change')); await esperar(80);
const nPost = $$('#planilla .pl-o tbody th').filter(x => /⚠️/.test(x.textContent)).length;
ok('QC13a · Hoja impresa ayer: ⚠️ en los apartamentos con un informe posterior, y solo en esos', nPost === 0 || nPost === $$('#planilla .pl-o tbody th').filter(x => { const k = x.parentNode.querySelector('input.pl-pc').dataset.k; const p = E().P.prev[k]; return p && p.fecha > AYER; }).length, nPost);
await ir({ vista: 'tel' }); tap($('#pl-rev')); await esperar(60);
ok('QC13b · Desde la vista de obra tampoco se guarda sin «La pasa», y dice dónde ponerla', $('#pl-rgua').disabled && /quién pasa la hoja.*Oficina/.test($('.pl-faltan').textContent), $('.pl-faltan') && $('.pl-faltan').textContent);
tap($('#pl-rseg')); await ir({ vista: 'tabla' });
const ps = $('#pl-pasa'); ps.value = 'Asistente de oficina'; ps.dispatchEvent(new Event('change'));
const fut = $('#pl-impresa'); fut.value = '2030-01-01'; fut.dispatchEvent(new Event('change')); await esperar(60);
tap($('#pl-rev')); await esperar(60);
ok('QC13c · Una hoja impresa en el futuro (y posterior a la visita) no deja guardar', $('#pl-rgua').disabled && /no sea futura/.test($('.pl-faltan').textContent) && /no sea anterior/.test($('.pl-faltan').textContent));
tap($('#pl-rseg')); const ok13 = $('#pl-impresa'); ok13.value = AYER; ok13.dispatchEvent(new Event('change')); await esperar(60);
await ir({ vista: 'tel' });                                    // guarda desde la vista de obra lo que se pasó en la oficina
tap($('#pl-rev')); await esperar(60); if ($('#pl-rb')) tap($('#pl-rb')); tap($('#pl-rgua')); await esperar(250);
const L13 = getSavedReports();
ok('QC13d · Lo pasado en la oficina sale con origen «oficina», quién lo pasó y la fecha de la hoja, aunque se guarde desde la otra pestaña', L13.length > 0 && L13.every(b => b.planilla.origen === 'oficina' && b.planilla.pasa === 'Asistente de oficina' && b.planilla.impresa === AYER), L13.map(b => b.planilla.origen + '/' + b.planilla.pasa).join(' '));
tap($('#pl-fseg')); cerrarPlanilla(); localStorage.setItem('garmel_reports_list', '[]');
Object.keys(localStorage).filter(k => /^garmel_planilla_EZ/.test(k)).forEach(k => localStorage.removeItem(k));
await cabecera(); await abrir(); await ir({ vista: 'tel', piso: 6, hitoSel: 'hito_servicios' }); teclear('P06AA1', '3.01', 70);
tap($('#pl-rev')); await esperar(60); tap($('#pl-rgua')); await esperar(250);
ok('QC13e · Lo tocado solo en el teléfono sale con origen «obra» y sin «la pasa»', getSavedReports()[0].planilla.origen === 'obra' && getSavedReports()[0].planilla.pasa === '');
tap($('#pl-fseg'));

// ── QC14 · bajas, descartar y deshacer ──
ok('QC14a · Después de guardar, «↶» queda apagado: lo guardado no se deshace desde la planilla', $('#pl-undo').disabled);
teclear('P06AA2', '3.01', 30); teclear('P06AB1', '3.01', 90);
tap($('#pl-rev')); await esperar(60); tap($('#pl-rdes')); await esperar(30);
ok('QC14b · «Descartar» pregunta antes y dice cuánto se pierde', /Se pierden 2 casilla/.test($('#pl-sheet').textContent));
tap($('#pl-dno')); await esperar(30);
ok('QC14c · «No, volver» regresa a la revisión con todo', !!$('#pl-rgua') && _plResumen().n === 2);
tap($('#pl-rdes')); tap($('#pl-dsi')); await esperar(60);
ok('QC14d · «Sí, descartar» lo borra todo y no deja nada para deshacer', _plResumen().n === 0 && $('#pl-undo').disabled && $('#pl-rev').disabled);
teclear('P06AB2', '3.01', 10); cerrarPlanilla(); await esperar(100);
const toast = (document.getElementById('toast') || document.querySelector('.toast') || { textContent: '' }).textContent;
await abrir();
ok('QC14e · Cerrar con algo sin guardar avisa en el formulario, y al reabrir sigue ahí', N('P06AB2', '3.01') === 10, toast.slice(0, 120));
cerrarPlanilla();

// ── QC15 · el informe abierto en el formulario ──
localStorage.setItem('garmel_reports_list', '[]'); Object.keys(localStorage).filter(k => /^garmel_planilla_EZ/.test(k)).forEach(k => localStorage.removeItem(k));
await cabecera(); await abrir(); await ir({ vista: 'tel', piso: 7, hitoSel: 'hito_servicios' });
teclear('P07AA1', '3.01', 75);
await ir({ hitoSel: 'hito_acabados' }); teclear('P07AA1', '4.01', 37);
await ir({ hitoSel: 'hito_pruebas' }); tap(celda('P07AA1', '11.01')); tap($('#pl-sheet .pl-sino [data-v="100"]'));
tap($('#planilla [data-com="P07AA1"]')); $('#pl-ct').value = 'Falta el tapón de registro'; tap($('#pl-csi'));
tap($('#pl-rev')); await esperar(60); tap($('#pl-rgua')); await esperar(250); tap($('#pl-fseg')); cerrarPlanilla(); await esperar(100);
loadDraftData(0); await esperar(1800);
const rid = cod => { for (const h of PARTIDAS) { const i = (CODIGOS_SUB[h.id] || []).indexOf(cod); if (i >= 0) return h.id + '_' + i; } };
const pm301 = document.getElementById('pm_' + rid('3.01')), pm401 = document.getElementById('pm_' + rid('4.01')), ej401 = document.getElementById('ej_' + rid('4.01')), sn = document.getElementById('sn_' + rid('11.01'));
ok('QC15a · En el formulario: 3.01 muestra 75 %, el estado 4.01 su 37 escrito, 11.01 «Sí» y la nota en observaciones',
   pm301 && pm301.value === '75' && ej401 && ej401.value === '37' && (!pm401 || pm401.value === '' || pm401.value === '37') && sn && sn.value === 'Sí' && document.getElementById('obs_general').value === 'Falta el tapón de registro',
   [pm301 && pm301.value, ej401 && ej401.value, pm401 && pm401.value, sn && sn.value, document.getElementById('obs_general').value].join(' | '));
const piso15 = document.getElementById('piso').value, apto15 = document.getElementById('apto').value, nro15 = document.getElementById('nro-display').textContent;
ok('QC15b · La cabecera dice Piso 07 · A1 y el número es el del informe', piso15 === 'Piso 07' && apto15 === 'A1' && /-P07AA1-/.test(nro15), piso15 + ' ' + apto15 + ' ' + nro15);
{ const e = document.getElementById('obs_general'); e.value = 'Falta el tapón de registro. Revisado en sitio.'; e.dispatchEvent(new Event('input', { bubbles: true })); }
saveDraft(true); await esperar(300);
const g15 = getSavedReports()[0];
ok('QC15c · Corregido y guardado en el formulario: no se pierde ningún % de la planilla (3.01, 4.01, 11.01, 3.02 de antes)', g15.obs_general.endsWith('Revisado en sitio.') && fila(g15, '3.01').pct === '75' && fila(g15, '4.01').ej === '37' && fila(g15, '11.01').sn === 'Sí' && fila(g15, '3.02').pct === '40' && getSavedReports().length === 1,
   JSON.stringify([fila(g15, '3.01'), fila(g15, '4.01'), fila(g15, '3.02')]).slice(0, 220));
const env15 = (await Q.envios()).length;
await enviarPendientes(); await hasta(() => !_tandaEnCurso, 60000); await esperar(800);
const e15 = (await Q.envios()).slice(env15).find(e => /-P07AA1-/.test(e.numero || ''));
ok('QC15d · Enviado desde el formulario: llega con la nota corregida, sus % y la marca de planilla', !!e15 && /Revisado en sitio/.test(e15.datos.obs_general) && fila(e15.datos, '3.01').pct === '75' && e15.datos.planilla && e15.datos.planilla.origen === 'obra', e15 ? e15.numero : Q.dialogos.slice(-2).join(' | ').slice(0, 200));
loadDraftData(0); await esperar(1200); const conMarca = !!getFormData().planilla; nuevoFormulario(); await esperar(300);
ok('QC15f · La marca de planilla va con ese informe y no con uno nuevo empezado después', conMarca && !getFormData().planilla);
ok('QC15e · Ningún error de JavaScript en las cinco rondas', !errJS.length, errJS.join(' | ').slice(0, 200));
window.onerror = _oe;
nuevoFormulario(); localStorage.setItem('garmel_reports_list', '[]');
Object.keys(localStorage).filter(k => /^garmel_planilla_/.test(k)).forEach(k => localStorage.removeItem(k));
