// ESTRÉS 1 · v188 (27-oct-2026): QC1 a QC6 de lo construido, en OBRA (inspeccion.html?prueba=1, 375 px). Sin datos reales.
// QC1 «Ver PDF» con el relevo lento, caído y tocado dos veces seguidas · QC2 el filtro del buscador con 120 informes, acentos,
// mayúsculas y un nombre con HTML · QC3 títulos: un inspector fuera del padrón, «OTRO» escrito a mano y uno que ya trae título ·
// QC4 capítulos: cambiar de ámbito 20 veces, hito 3 «no inspeccionado» y filas fuera de presupuesto · QC5 cerrado al 100 %: el
// anterior viene del ARCHIVO (no del teléfono), cambiar de apartamento rápido 10 veces y «Completar lo vacío» encima · QC6 el
// proceso entero: apartamento con todo, guardar, recargar el borrador, enviar, buscar y ver el PDF.
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const put = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
const rid = cod => { for (const h of PARTIDAS) { const i = (CODIGOS_SUB[h.id] || []).indexOf(cod); if (i >= 0) return h.id + '_' + i; } };
const mide = (r, pr, ej) => { document.getElementById('pr_' + r).value = pr; document.getElementById('ej_' + r).value = ej; recalcRow(document.getElementById('pr_' + r)); document.getElementById('ej_' + r).dispatchEvent(new Event('input', { bubbles: true })); };
const insp = () => { const s = document.querySelector('.inspector-select'); s.value = [...s.options].map(o => o.value).filter(Boolean)[0]; s.dispatchEvent(new Event('change', { bubbles: true })); if (!document.querySelector('#estatus .ck-lbl.on')) document.querySelector('#estatus .ck-lbl').click(); };
const lugar = async (torre, piso, apto, fecha) => { nuevoFormulario(); await esperar(250); setAmbito('apartamento'); await esperar(200); sel('fecha', fecha || '2026-10-27'); sel('convenio', 'Convenio Bielorrusos'); sel('torre', torre); sel('piso', piso); put('apto', apto); };
const limpiarAviso = () => { const a = document.getElementById('aviso-anterior'); if (a) a.innerHTML = ''; };
const enviar = async () => { insp(); const be = document.getElementById('btn-enviar-relevo'); if (be) be.disabled = false; document.getElementById('claveEnvio').value = 'qc'; if (typeof refrescarEstadoClave === 'function') refrescarEstadoClave(); await enviarAlRelevo(); await esperar(1500); };
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem('garmel_reports_list', '[]');
await Q.relevo({ caido: false, fallar: [], lento: 0, colgar: 0, perder: false, borrar: true });
Q.aceptar = true;

// ── QC1 · Ver PDF bajo estrés ──
await lugar('T-07', 'Piso 03', 'B2', '2026-10-26'); await esperar(900); limpiarAviso(); mide(rid('3.01'), '5', '5'); insp(); await esperar(200); saveDraft(true);
const N1 = document.getElementById('nro-display').textContent.trim(); await enviar();
localStorage.setItem('garmel_reports_list', '[]'); nuevoFormulario(); await esperar(250); sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-07'); await esperar(200);
_ES_OFICINA = true; _oficinaMostrar(); await oficinaBuscar(); await esperar(300);
const W = { n: 0, destinos: [], cerradas: 0 }; const _open = window.open;
window.open = function(){ W.n++; return { document: { write(){} }, location: { set href(u){ W.destinos.push(u); } }, close(){ W.cerradas++; } }; };
const pedidosPdf = []; const _f = window.fetch; window.fetch = function(u, o){ try { const b = JSON.parse((o && o.body) || '{}'); if (b.accion === 'oficina-pdf') pedidosPdf.push(b.nro); } catch (e) {} return _f.apply(this, arguments); };
await Q.relevo({ lento: 2 });
const p1 = oficinaVerPdf(N1), p2 = oficinaVerPdf(N1); await Promise.all([p1, p2]);
await Q.relevo({ lento: 0 });
const avisos1 = $$('#ofi-lista .ofi-pdf');
ok('QC1a · Dos toques seguidos con el relevo lento: un solo pedido, un solo aviso y las dos pestañas llegan al PDF', pedidosPdf.length === 1 && avisos1.length === 1 && W.destinos.length === 2 && W.destinos.every(u => /^blob:/.test(u)), 'avisos ' + avisos1.length + ' · destinos ' + W.destinos.length + ' · pedidos ' + pedidosPdf.length + ' · ' + (avisos1[0] || {}).textContent);
await Q.relevo({ caido: true }); W.cerradas = 0;
await oficinaVerPdf('PRUEBA-EZ-T07-P09AA1-261026-XX');
await Q.relevo({ caido: false });
const a1b = $('#ofi-lista .ofi-pdf[data-n="PRUEBA-EZ-T07-P09AA1-261026-XX"]');
ok('QC1b · Relevo caído: lo dice en el panel y cierra la pestaña', !!a1b && /No se pudo traer el PDF/.test(a1b.textContent) && W.cerradas === 1, a1b ? a1b.textContent : '—');
window.open = _open; window.fetch = _f;

// ── QC2 · El filtro con 120 informes ──
const insps = ['Génesis Cordobés (CIV-307.057)', 'Cleidy Chacón (CIV-240.930)', 'Ana <img src=x onerror="window.__xss=1">'];
const lista2 = []; for (let i = 0; i < 120; i++) lista2.push({ numero: 'EZ-T07-P' + String(1 + i % 12).padStart(2, '0') + 'A' + ['A1', 'A2', 'B1', 'B2'][i % 4] + '-2610' + String(10 + i % 18) + '-GC', revision: 1 + (i % 3), fecha: '2026-10-' + String(10 + i % 18), piso: 'Piso ' + String(1 + i % 12).padStart(2, '0'), apto: ['A1', 'A2', 'B1', 'B2'][i % 4], ambito: 'apartamento', inspectores: [insps[i % 3]], estatus: [], definitiva: null });
const t0 = performance.now(); _oficinaPintar(lista2, 'T-07'); const tPint = performance.now() - t0;
const f2 = $('#ofi-filtro'), vis2 = () => $$('#ofi-lista table tr').slice(1).filter(tr => tr.style.display !== 'none').length;
const esc2 = v => { f2.value = v; f2.dispatchEvent(new Event('input', { bubbles: true })); return vis2(); };
const t1 = performance.now(); const nGen = esc2('GENESIS'), nP03B2 = esc2('piso 04 b2'), nNada = esc2('"><script>'), nTodo = esc2(''); const tFil = performance.now() - t1;
ok('QC2a · 120 filas: «GENESIS» encuentra las de Génesis sin acento ni mayúsculas, «piso 04 b2» las del B2 del piso 04', nGen === 40 && nP03B2 > 0 && nP03B2 < 120 && nNada === 0 && nTodo === 120, [nGen, nP03B2, nNada, nTodo].join(' · '));
ok('QC2b · Un nombre con HTML no se ejecuta y todo va rápido (pintar < 400 ms, filtrar 4 veces < 400 ms)', !window.__xss && tPint < 400 && tFil < 400, Math.round(tPint) + ' ms · ' + Math.round(tFil) + ' ms');

// ── QC3 · Títulos ──
ok('QC3a · Fuera del padrón queda igual; con título no se duplica; vacío no rompe', _conTitulo195('Fulano de Tal (CIV-1)') === 'Fulano de Tal (CIV-1)' && _conTitulo195('Ing. Hernán Escobar (CIV-151.021)') === 'Ing. Hernán Escobar (CIV-151.021)' && _conTitulo195('') === '' && _conTitulo195('Hernán Escobar (CIV-151.021)') === 'Ing. Hernán Escobar (CIV-151.021)');
nuevoFormulario(); await esperar(200);
const s3 = document.querySelector('.inspector-select'); s3.value = 'OTRO'; s3.dispatchEvent(new Event('change', { bubbles: true })); await esperar(100);
const m3 = s3.closest('.multi-input-row').querySelector('.inspector-manual'); m3.value = 'Juan Nuevo'; m3.dispatchEvent(new Event('input', { bubbles: true }));
ok('QC3b · «OTRO» escrito a mano viaja tal cual y las opciones siguen con título', getInspectoresValues().indexOf('Juan Nuevo') >= 0 && [...s3.options].filter(o => o.value && o.value !== 'OTRO').every(o => /^(Ing\.|Arq\.|TSU) /.test(o.textContent)), JSON.stringify(getInspectoresValues()));

// ── QC4 · Capítulos ──
await lugar('T-01', 'Piso 02', 'A1'); await esperar(800); limpiarAviso();
const filas0 = $$('#main-content tr').length;
for (let i = 0; i < 20; i++) setAmbito(i % 2 ? 'apartamento' : 'torre');
setAmbito('apartamento'); await esperar(200);
ok('QC4a · 20 cambios de ámbito: tres capítulos, ni uno de más, y las mismas filas', $$('.capitulo').length === 3 && $$('#main-content tr').length === filas0 && $$('#capt_cap_sanitarias tr').length === 4, $$('.capitulo').length + ' · ' + $$('#main-content tr').length + '/' + filas0);
mide(rid('3.02'), '4', '2');
toggleNoInspeccionado('hito_servicios'); await esperar(100);
const caja4 = $('#capt_cap_sanitarias').closest('table').parentElement;
const d4 = getFormData();
ok('QC4b · Hito 3 «no inspeccionado»: sus filas en los capítulos se atenúan y lo dicen; el dato lo marca', caja4.classList.contains('cap-noinsp') && /no cuentan en esta visita/.test(caja4.innerText) && (d4.noInspeccionados || []).indexOf('hito_servicios') >= 0, caja4.className);
toggleNoInspeccionado('hito_servicios'); await esperar(100);
ok('QC4c · Al quitarlo vuelve a la normalidad y el dato de la fila sigue', !caja4.classList.contains('cap-noinsp') && !caja4.querySelector('.cap-noinsp-aviso') && document.getElementById('ej_' + rid('3.02')).value === '2');

// ── QC5 · Cerrado al 100 % desde el archivo ──
await lugar('T-12', 'Piso 05', 'A2'); await esperar(900); limpiarAviso(); mide(rid('3.01'), '6', '6'); mide(rid('3.04'), '8', '8'); mide(rid('3.07'), '3', '1');
insp(); await esperar(200); saveDraft(true); const N5 = document.getElementById('nro-display').textContent.trim(); await enviar();
localStorage.setItem('garmel_reports_list', '[]');   // el teléfono no lo tiene: tiene que venir del archivo
await lugar('T-12', 'Piso 05', 'A2'); await hasta(() => document.querySelector('#aviso-anterior .si'), 8000, 100); await esperar(300);
const cerr = () => $$('tr.cerrado100').length;
ok('QC5a · El anterior viene del archivo y cierra las dos completas (3.01 y 3.04), no la 3.07', cerr() === 2 && /del archivo/.test($('#aviso-anterior').innerText), cerr() + ' · ' + $('#aviso-anterior').innerText.slice(0, 80));
for (let i = 0; i < 10; i++) put('apto', i % 2 ? 'A2' : 'B1');
put('apto', 'B1'); await esperar(1500);
ok('QC5b · 10 cambios rápidos de apartamento: lo cerrado del A2 no queda en el B1', cerr() === 0 && document.getElementById('ej_' + rid('3.01')).value === '', cerr() + ' · ' + document.getElementById('ej_' + rid('3.01')).value);
put('apto', 'A2'); await hasta(() => cerr() === 2, 8000, 100);
const ej5 = document.getElementById('ej_' + rid('3.01')).value;
if (typeof _copiarProgramar === 'function') { _copiarProgramar(); await esperar(900); }
const bc = document.getElementById('btn-copiar-de');
ok('QC5c · Lo cerrado no cuenta como medido: la oferta de copiar sigue en pie y no toca lo cerrado', !!document.querySelector('#aviso-anterior .si') && document.getElementById('ej_' + rid('3.01')).value === ej5 && document.getElementById('ej_' + rid('3.01')).disabled, (bc ? bc.textContent : 'sin botón de copiar') + ' · ' + ej5);

// ── QC6 · El proceso entero ──
$('#aviso-anterior .si').click(); await esperar(400);
mide(rid('3.16'), '2', '2'); insp(); saveDraft(true); await esperar(200);
const id6 = getSavedReports()[0].id;
nuevoFormulario(); await esperar(200); loadDraftData(getSavedReports().findIndex(b => b.id === id6)); await esperar(1200);
ok('QC6a · El borrador reabre con lo de hoy en su capítulo (gas 2/2) y lo traído (3.07 1 de 3)', document.getElementById('ej_' + rid('3.16')).value === '2' && document.getElementById('ej_' + rid('3.07')).value === '1' && !!document.getElementById('ej_' + rid('3.16')).closest('#p_cap_gas'));
const n6 = (await Q.envios()).length; await enviar();
const e6 = (await Q.envios()).slice(-1)[0] || {};
ok('QC6b · Se envía una vez, con lo cerrado marcado y lo de gas en el hito 3', (await Q.envios()).length === n6 + 1 && ((e6.datos || {}).partidas || {}).hito_servicios[CODIGOS_SUB.hito_servicios.indexOf('3.16')].ej === '2', 'envíos +' + ((await Q.envios()).length - n6));
nuevoFormulario(); await esperar(200); sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-12'); await esperar(200);
await oficinaBuscar(); await esperar(300); $('#ofi-filtro').value = 'a2'; $('#ofi-filtro').dispatchEvent(new Event('input', { bubbles: true }));
ok('QC6c · Buscar «a2» en la T-12 deja solo los informes del A2, con «Ver PDF»', $$('#ofi-lista table tr').slice(1).filter(tr => tr.style.display !== 'none').every(tr => /A2/.test(tr.innerText) && tr.querySelector('.ofi-ver')) && $$('#ofi-lista table tr').slice(1).some(tr => tr.style.display !== 'none'));
ok('QC6d · Nada se sale a 375 px y ningún control baja de 44 px', document.documentElement.scrollWidth <= innerWidth + 1 && Q.chicos().length === 0, Q.chicos().slice(0, 5).join(' '));
_ES_OFICINA = false; _oficinaMostrar(); nuevoFormulario(); localStorage.setItem('garmel_reports_list', '[]');
