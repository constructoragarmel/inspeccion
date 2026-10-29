// TANDA 139 · cambio 199 (29-oct-2026, ADR-0056): la planilla de avance por torre. En inspeccion.html?prueba=1, a 375 px
// y A LA VISTA. El relevo falso (v190) contesta `planilla` con lo sembrado y actualiza el avance con cada envío.
// 1 sin cabecera no abre y dice qué falta · 2 abre con lo del archivo en gris, los pisos de la torre y el botón junto al
// ámbito · 3 nada se sale a 375 px y lo que se toca mide 44 · 4 teclado: 105 no pasa, «lo mismo» no baja a nadie, ↶ ·
// 5 lo cerrado al 100 % pide 🔓 · 6 guardar: un informe normal por apartamento, con lo de antes y lo nuevo, en el formato
// del formulario (pct, estado, Sí/No, fuera de ámbito), su número y la nota · 7 «Enviar todos» los manda y al volver a
// abrir lo gris ya es lo nuevo · 8 abrir uno en el formulario muestra el % de una fila de conteo y no lo pierde ·
// 9 oficina: lo raro se rechaza, Enter baja, pegar de Excel, la hoja vieja se marca y pide quién la pasa ·
// 10 sin señal usa lo guardado; un informe sin enviar del mismo apartamento no se pisa; lo sin guardar se recupera ·
// 11 imprimir: ninguna hoja se corta, la guía tiene las 50.
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem('garmel_reports_list', '[]');
Object.keys(localStorage).filter(k => /^garmel_planilla_/.test(k)).forEach(k => localStorage.removeItem(k));
await Q.relevo({ caido: false, fallar: [], lento: 0, colgar: 0, perder: false, borrar: true });
const sem = {}; for (let p = 1; p <= 12; p++) ['A1', 'A2', 'B1', 'B2'].forEach(a => { sem['P' + String(p).padStart(2, '0') + 'A' + a] = { nro: 'PRUEBA-EZ-T07-P' + String(p).padStart(2, '0') + 'A' + a + '-261020-XX', fecha: '2026-10-20', piso: 'Piso ' + String(p).padStart(2, '0'), apto: a, pcts: { '2.02': 100, '3.01': 50, '3.02': p <= 2 ? 100 : 40, '3.03': a === 'A1' && p === 3 ? 80 : 30, '4.01': 25, '11.01': p === 1 ? 100 : 0 } }; });
await Q.relevo({ sembrarAvance: { sector: 'EZ', torre: 'T-07', prueba: true, informes: sem } });
Q.aceptar = true;
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const cabecera = async () => {
  nuevoFormulario(); await esperar(300); setAmbito('apartamento'); await esperar(200);
  sel('fecha', new Date().toISOString().slice(0, 10)); sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-07'); await esperar(400);
  const ins = document.querySelector('.inspector-select'); Q.elegir(ins, [...ins.options].map(o => o.value).filter(Boolean)[0]); await esperar(300);
  if (!document.querySelector('#estatus .ck-lbl.on')) [...document.querySelectorAll('#estatus .ck-lbl')].find(l => /progreso/.test(l.textContent)).click();
};
const E = () => _plEstado();
const celda = (k, c) => $('#planilla .pl-c[data-k="' + k + '"][data-c="' + c + '"]');
const tap = el => { if (!el) throw new Error('no está'); el.click(); };
const teclear = (k, c, dig, todos) => { tap(celda(k, c)); String(dig).split('').forEach(d => tap($('#pl-sheet [data-d="' + d + '"]'))); if (todos) tap($('#pl-kt')); tap($('#pl-ksi')); };
const fila = (d, cod) => { for (const pid of Object.keys(d.partidas)) { const i = (CODIGOS_SUB[pid] || []).indexOf(cod); if (i >= 0 && Array.isArray(d.partidas[pid])) return d.partidas[pid][i]; } };
const hoy6 = new Date().toISOString().slice(2, 10).replace(/-/g, '');

// ── 1 ──
nuevoFormulario(); await esperar(300); setAmbito('apartamento');
Q.dialogos = []; await abrirPlanilla(); await esperar(100);
ok('1 · Sin torre, inspector ni estatus no abre y dice qué falta', /la torre/.test(Q.dialogos.join(' ')) && /el inspector/.test(Q.dialogos.join(' ')) && /el estatus/.test(Q.dialogos.join(' ')) && (!$('#planilla') || $('#planilla').hidden), Q.dialogos.join(' | ').slice(0, 160));
// ── 2 ──
await cabecera();
const bp = $('#btn-planilla');
ok('2a · El botón «📋 Planilla de la torre» está junto al ámbito', !!bp && bp.previousElementSibling && bp.previousElementSibling.id === 'btnAmbEstr');
tap(bp); await hasta(() => E().P && E().P.origenPrev === 'del archivo', 8000); await esperar(200);
_plIr({ vista: 'tel', piso: 3, hitoSel: 'hito_servicios' }); await esperar(100);
ok('2b · Abre con lo del archivo en gris: 12 pisos × 4, y 3.01 de P03 A1 dice 50', E().P.pisos === 12 && E().P.aptos.length === 48 && celda('P03AA1', '3.01') && celda('P03AA1', '3.01').textContent.trim() === '50', E().P.pisos + ' pisos · ' + E().P.aptos.length + ' · ' + (celda('P03AA1', '3.01') || {}).textContent);
ok('2c · Sin dato se ve «·» en blanco, no un cero', celda('P03AA1', '3.07').textContent.trim() === '·' && /vacia/.test(celda('P03AA1', '3.07').className));
// ── 3 ──
const chicos = [...document.querySelectorAll('#planilla button, #planilla select, #planilla input')].filter(e => { const r = e.getBoundingClientRect(); return r.width && r.height && r.height < 44; }).map(e => e.id || e.className);
const gw3 = $('#planilla .pl-gw'), ult3 = $$('#planilla .pl-g thead th').pop().getBoundingClientRect();
ok('3 · A ' + innerWidth + ' px nada se sale, los 4 apartamentos se ven sin deslizar y lo que se toca mide 44 px o más', document.documentElement.scrollWidth <= innerWidth + 1 && $('#planilla').scrollWidth <= innerWidth + 1 && gw3.scrollWidth <= gw3.clientWidth + 1 && ult3.right <= innerWidth && !chicos.length, (chicos.join(',') || 'ok') + ' · tabla ' + gw3.scrollWidth + '/' + gw3.clientWidth);
// ── 4 ──
tap(celda('P03AA2', '3.01')); ['1', '0', '5'].forEach(d => tap($('#pl-sheet [data-d="' + d + '"]')));
const d4 = $('#pl-kd').textContent; tap($('#pl-kno'));
ok('4a · «1 0 5» no pasa de 100', d4.startsWith('10'), d4);
teclear('P03AA2', '3.03', 60, true);
ok('4b · «Lo mismo» con 60 no baja a A1 (tenía 80) y lo dice; los demás quedan en 60', E().est.N.P03AA2['3.03'] === 60 && E().est.N.P03AB1['3.03'] === 60 && !(E().est.N.P03AA1 && E().est.N.P03AA1['3.03']) && /No se bajó A1/.test(_plUltimoAviso()), _plUltimoAviso());
_plDeshacer(); ok('4c · Un ↶ deshace toda la fila', !E().est.N.P03AA2);
teclear('P03AA2', '3.01', 75); teclear('P03AB1', '3.02', 20);
ok('4d · Una baja (40 → 20) se marca y la barra la cuenta', /baja/.test(celda('P03AB1', '3.02').className) && /1 baja/.test($('#pl-btxt').textContent), $('#pl-btxt').textContent);
// ── 5 ──
_plIr({ hitoSel: 'hito_cerramientos' }); await esperar(50);
tap(celda('P03AA1', '2.02'));
ok('5 · Lo que estaba al 100 % pide «🔓 Corregir» antes de abrir el teclado', !!$('#pl-c100-si') && !$('#pl-kd'));
tap($('#pl-c100-no'));
_plIr({ hitoSel: 'hito_pruebas', piso: 3 }); await esperar(50); tap(celda('P03AA2', '11.01')); tap($('#pl-sheet .pl-sino [data-v="100"]'));
_plIr({ hitoSel: 'hito_acabados' }); await esperar(50); teclear('P03AA2', '4.01', 50);
tap($('#planilla [data-com="P03AA2"]')); $('#pl-ct').value = 'Se mandó a rectificar <b>el</b> punto de la cocina'; tap($('#pl-csi'));
// ── 6 ──
tap($('#pl-rev')); await esperar(50);
ok('6a · La revisión pide confirmar la baja antes de guardar', $('#pl-rgua').disabled && !!$('#pl-rb'));
tap($('#pl-rb')); tap($('#pl-rgua')); await esperar(200);
const L6 = getSavedReports(), a2 = L6.find(b => /-P03AA2-/.test(b.nro)), b1 = L6.find(b => /-P03AB1-/.test(b.nro));
ok('6b · Dos informes en «Informes», con su número del día', !!a2 && !!b1 && L6.length === 2 && a2.nro === 'PRUEBA-EZ-T07-P03AA2-' + hoy6 + '-' + a2.nro.split('-').pop() && a2.piso === 'Piso 03' && a2.apto === 'A2' && a2.ambito === 'apartamento', L6.map(b => b.nro).join(' '));
ok('6c · Lo nuevo y lo de antes: 3.01 nuevo en pct, 3.02 de antes, 2.02 al 100, 4.01 estado sobre 100, 11.01 Sí',
   fila(a2, '3.01').pct === '75' && fila(a2, '3.02').pct === '40' && fila(a2, '2.02').pct === '100' && fila(a2, '4.01').pr === '100' && fila(a2, '4.01').ej === '50' && fila(a2, '11.01').sn === 'Sí' && fila(a2, '11.01').ej === '100',
   JSON.stringify([fila(a2, '3.01'), fila(a2, '4.01'), fila(a2, '11.01')]).slice(0, 200));
ok('6d · Las de torre van «fuera de ámbito» y lo sin dato vacío; la nota en observaciones, sin tocar el HTML; el estatus de la cabecera', (a2.estatus || []).join() === 'En progreso' && a2.partidas.hito_cerramientos[0].fueraDeAmbito === true && fila(a2, '3.07').pct === '' && a2.obs_general === 'Se mandó a rectificar <b>el</b> punto de la cocina' && a2.planilla && a2.planilla.origen === 'obra');
ok('6e · Lo guardado ya no cuenta como cambio y lo gris es lo nuevo', _plResumen().n === 0 && E().P.prev.P03AA2.pcts['3.01'] === 75);
tap($('#pl-fseg'));
// ── 7 ──
cerrarPlanilla(); await esperar(100);
const env0 = (await Q.envios()).length;
await enviarPendientes(); await hasta(() => !_tandaEnCurso, 60000); await esperar(800);
const env = (await Q.envios()).slice(env0).filter(e => e.numero);
ok('7a · «Enviar todos» manda los dos', env.length === 2 && env.every(e => /-P03A(A2|B1)-/.test(e.numero)), env.map(e => e.numero).join(' '));
localStorage.setItem('garmel_reports_list', '[]');
await abrirPlanilla(); await hasta(() => E().P && E().P.origenPrev === 'del archivo', 8000);
ok('7b · Al volver a abrir, lo gris viene del archivo ya con lo nuevo (3.01 = 75 en P03 A2)', E().P.prev.P03AA2.pcts['3.01'] === 75 && E().P.prev.P03AB1.pcts['3.02'] === 20, JSON.stringify(E().P.prev.P03AA2.pcts));
cerrarPlanilla();
// ── 8 ──
localStorage.setItem('garmel_reports_list', JSON.stringify([Object.assign({}, a2, { id: 'draft_t139', nro: a2.nro.replace('-P03AA2-', '-P03AA4-'), apto: 'A4' })]));
loadDraftData(0); await esperar(1500);
const rid = 'hito_servicios_' + CODIGOS_SUB.hito_servicios.indexOf('3.01'), pm = document.getElementById('pm_' + rid);
ok('8a · Abrir en el formulario un informe de planilla: la fila de conteo 3.01 muestra su 75 %', !!pm && pm.value === '75', pm ? pm.value : 'sin campo');
const g8 = getFormData();
ok('8b · …y al guardarlo no se pierde', fila(g8, '3.01').pct === '75');
nuevoFormulario(); localStorage.setItem('garmel_reports_list', '[]');
// ── 9 ──
await cabecera(); await abrirPlanilla(); await hasta(() => E().P && E().P.origenPrev === 'del archivo', 8000);
_plIr({ vista: 'tabla' }); await esperar(100);
const inp = (k, c) => $('#planilla input.pl-pc[data-k="' + k + '"][data-c="' + c + '"]');
const escribirEn = (k, c, v) => { const i = inp(k, c); i.focus(); i.value = v; i.dispatchEvent(new Event('change')); return i; };
escribirEn('P05AA1', '3.01', '75%'); escribirEn('P05AA1', '3.02', ' 60 '); escribirEn('P05AA2', '3.01', '8O');
ok('9a · «75%» y « 60 » se leen; «8O» se rechaza y avisa', E().est.N.P05AA1['3.01'] === 75 && E().est.N.P05AA1['3.02'] === 60 && !E().est.N.P05AA2 && /no es un % válido/.test(_plUltimoAviso()));
const i9 = inp('P05AB1', '3.03'); i9.focus(); i9.value = '90'; i9.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
ok('9b · Enter baja al apartamento siguiente', document.activeElement.dataset.k === 'P05AB2', document.activeElement.dataset.k);
const dt = new DataTransfer(); dt.setData('text/plain', '100\t90\r\n95\tXX\r\n'); const i9b = inp('P06AA1', '3.01'); i9b.focus(); i9b.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
ok('9c · Pegar 2×2 de Excel llena 3 y avisa del «XX»', E().est.N.P06AA1['3.01'] === 100 && E().est.N.P06AA2['3.01'] === 95 && /Se pegaron 3 .*1 no eran/.test(_plUltimoAviso()), _plUltimoAviso());
const imp = $('#pl-impresa'); imp.value = '2026-10-19'; imp.dispatchEvent(new Event('change')); await esperar(50);
ok('9d · La hoja impresa antes del último informe marca los apartamentos con ⚠️', !!$('#planilla .pl-post') && $$('#planilla .pl-o tbody th').filter(t => /⚠️/.test(t.textContent)).length === 48);
tap($('#pl-rev'));
ok('9e · Con hoja impresa y sin «La pasa» no se guarda', $('#pl-rgua').disabled && /quién pasa la hoja/.test($('.pl-faltan').textContent));
tap($('#pl-rseg'));
// ── 10 ──
cerrarPlanilla(); await Q.relevo({ caido: true }); await abrirPlanilla(); await esperar(1500);
ok('10a · Sin señal abre con lo guardado y lo dice; recupera lo sin guardar', /Sin conexión/.test($('#pl-aviso').textContent) && /Se recuperó/.test($('#pl-aviso').textContent) && E().P.prev.P03AA2 && E().est.N.P05AA1['3.01'] === 75, $('#pl-aviso').textContent.slice(0, 120));
await Q.relevo({ caido: false });
const nroC = _plNroPara(5, 'A1');
localStorage.setItem('garmel_reports_list', JSON.stringify([{ id: 'x', nro: nroC, lista: VERSION_LISTA, torre: 'T-07', ambito: 'apartamento', fecha: '2026-10-01', partidas: {} }]));
$('#pl-pasa') || _plIr({ vista: 'tabla' }); const ps = $('#pl-pasa'); ps.value = 'Oficina'; ps.dispatchEvent(new Event('change'));
tap($('#pl-rev')); if ($('#pl-rb')) tap($('#pl-rb'));
ok('10b · Un informe sin enviar del mismo apartamento y día no se pisa: lo dice', /Ya hay un informe de este apartamento/.test($('#pl-sheet').textContent));
tap($('#pl-rgua')); await esperar(100);
ok('10c · …se guardan los demás y P05 A1 queda fuera', getSavedReports().filter(b => b.id !== 'x').every(b => b.nro !== nroC) && getSavedReports().some(b => b.planilla && b.planilla.pasa === 'Oficina'), getSavedReports().map(b => b.nro).join(' '));
if ($('#pl-fseg')) tap($('#pl-fseg'));
// ── 11 ──
_plIr({ vista: 'imp' }); await esperar(100);
const corta = () => $$('#planilla .pl-hoja').filter(h => h.scrollHeight > h.clientHeight + 1 || [...h.querySelectorAll('tbody th')].some(t => t.scrollWidth > t.clientWidth + 1)).length;
const r11 = [];
for (const t of ['comoda', 'compacta', 'toda']) { _plIr({ tamano: t }); await esperar(80); r11.push(t + ':' + $$('#planilla .pl-hoja').length + (corta() ? '✗' : '')); }
ok('11a · Ninguna hoja se corta (cómoda, compacta, toda la torre)', !r11.some(x => /✗/.test(x)), r11.join(' '));
ok('11b · El botón de imprimir está a la vista', !!$('#pl-imprimir') && $('#pl-imprimir').offsetParent !== null);
_plIr({ vista: 'guia' }); await esperar(50);
ok('11c · La guía tiene las 50 subpartidas y su botón', $$('#planilla .pl-guia dt').length === 50 && !!$('#pl-impguia'));
cerrarPlanilla(); nuevoFormulario(); localStorage.setItem('garmel_reports_list', '[]');
Object.keys(localStorage).filter(k => /^garmel_planilla_/.test(k)).forEach(k => localStorage.removeItem(k));
