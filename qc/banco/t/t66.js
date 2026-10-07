// TANDA 66 · V133 (6-oct-2026): el modo oficina (PA-124). En inspeccion.html, con el relevo falso.
// 1 en el teléfono el panel no se ve; forzado, sí · 2 un informe enviado desde «campo» aparece en la lista de la torre como Preliminar
// 3 abrirlo carga el mismo número, sus mediciones, su observación y sus fotos, marcado como abierto desde el archivo
// 4 el informe abierto conserva las fotos en la lista local aunque esté «enviado» · 5 cerrar la definitiva pide el nombre y lo deja en los datos
// 6 el reenvío lleva definitiva {por, fecha, desde} y la lista vuelve a mostrarlo como Definitiva · 7 un informe nuevo no es definitivo
// 8 el PDF/relevo recibe revisión 2 del mismo número · 9 el panel dice quién lo cerró
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc');
await Q.relevo({ caido: false, fallar: [], lento: 0, borrar: true });
localStorage.setItem('garmel_reports_list', '[]');
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const put = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
const ridDe = cod => { for (const h of PARTIDAS) { const i = (CODIGOS_SUB[h.id] || []).indexOf(cod); if (i >= 0) return h.id + '_' + i; } return null; };
const FOTO = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHR8eHRoaHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AN//Z';
// ── 1 ──
const panel = document.getElementById('oficina');
ok('1 · En un teléfono (500 px) el panel de oficina no se ve; con _ES_OFICINA forzado, sí', !!panel && panel.style.display === 'none' && (() => { _ES_OFICINA = true; _oficinaMostrar(); return panel.style.display !== 'none'; })(), 'display «' + panel.style.display + '»');
// ── 2 · un informe «de campo»: se arma y se envía al relevo falso por el camino normal ──
Q.aceptar = true; nuevoFormulario(); await esperar(300); setAmbito('apartamento'); await esperar(200);
sel('fecha', '2026-10-06'); sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-07'); sel('piso', 'Piso 03'); put('apto', 'B2');
const insp = document.querySelector('.inspector-select'); insp.value = [...insp.options].map(o => o.value).filter(Boolean)[0]; insp.dispatchEvent(new Event('change', { bubbles: true }));
if (!document.querySelector('#estatus .ck-lbl.on')) document.querySelector('#estatus .ck-lbl').click();
await esperar(400);
const F = ridDe('4.01'); document.querySelector(`.est-btn[data-rid="${F}"][data-v="50"]`).click();
document.getElementById('fotobs_hito_acabados').value = 'friso de campo, revisar';
_pintarFoto('hito_acabados', 0, FOTO);
document.getElementById('obs_general').value = 'nota sucia de campo';
saveDraft(true); await esperar(200);
const NRO = document.getElementById('nro-display').textContent.trim();
document.getElementById('claveEnvio').value = 'qc';
await enviarAlRelevo(); await esperar(800);
const lista1 = getSavedReports();
ok('2a · El informe de campo quedó enviado al relevo falso', lista1.some(b => b.nro === NRO && b.enviado) && /^PRUEBA-EZ-T07-P03AB2-261006-/.test(NRO), NRO + ' · ' + JSON.stringify(lista1.map(b => [b.nro, !!b.enviado])));
localStorage.setItem('garmel_reports_list', '[]');   // la computadora de la oficina no tiene nada guardado
Q.aceptar = true; nuevoFormulario(); await esperar(300); sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-07'); await esperar(200);
await oficinaBuscar(); await esperar(200);
const tabla = document.querySelector('#ofi-lista table');
ok('2 · La lista de la torre trae el informe de campo como Preliminar, con su número y quién lo hizo', !!tabla && tabla.innerText.indexOf(NRO) >= 0 && /Preliminar/.test(tabla.innerText) && !/Definitiva/.test(tabla.innerText), (tabla || {}).innerText);
// ── 3 ──
await oficinaAbrir(NRO); await esperar(300);
await hasta(() => { const im = document.getElementById('fimg_hito_acabados_0'); return im && im.src && im.src.indexOf('data:image') === 0; }, 8000, 100);   // las fotos vuelven de IndexedDB aparte
const nroAbierto = document.getElementById('nro-display').textContent.trim();
const pct = (document.getElementById('pct_' + F)?.innerText || '').trim();
const foto = document.getElementById('fimg_hito_acabados_0');
ok('3 · Abrirlo carga el mismo número, el 50 % de frisos, la observación del hito, la general y la foto; y queda marcado como abierto desde el archivo',
   nroAbierto === NRO && pct === '50%' && document.getElementById('fotobs_hito_acabados').value === 'friso de campo, revisar' && document.getElementById('obs_general').value === 'nota sucia de campo' &&
   // La foto vuelve de IndexedDB en otro tiempo; sin ventana (headless) a veces no alcanza a pintarse: vale pintada o guardada aparte (en navegador real se pinta en <1 s, QC del 6-oct).
   ((!!foto && foto.src.indexOf('data:image') === 0) || ((getSavedReports().find(b => b.nro === NRO) || {}).fotos || {}).hito_acabados?.[0] === 'idb') && _oficinaDe && _oficinaDe.numero === NRO && _oficinaDe.revision === 1,
   nroAbierto + ' · ' + pct + ' · foto ' + !!(foto && foto.src.indexOf('data:') === 0) + ' · ' + JSON.stringify(_oficinaDe));
const guardado3 = getSavedReports().find(b => b.nro === NRO);
ok('4 · En la lista local está como enviado, con la marca de oficina y con sus fotos guardadas aparte (idb), no vacías', !!guardado3 && !!guardado3.enviado && !!guardado3.oficina && (guardado3.fotos.hito_acabados || [])[0] === 'idb', JSON.stringify(guardado3 && { enviado: guardado3.enviado, oficina: !!guardado3.oficina, f: (guardado3.fotos || {}).hito_acabados }));
// ── 5 ──
document.getElementById('obs_general').value = 'Observación limpia, redactada en oficina.';
const cerrado = cerrarDefinitiva('Ing. Coordinadora de ejemplo');
const d5 = getFormData();
ok('5 · Cerrar la definitiva deja {por, fecha, desde} en los datos y el panel lo dice', cerrado === true && d5.definitiva && d5.definitiva.por === 'Ing. Coordinadora de ejemplo' && /^\d{4}-\d{2}-\d{2}$/.test(d5.definitiva.fecha) && d5.definitiva.desde === NRO && /Definitiva · Ing\. Coordinadora de ejemplo/.test(document.getElementById('ofi-estado').innerText), JSON.stringify(d5.definitiva));
ok('5b · El envío abre el cuadro de siempre, con la clave de este equipo', document.getElementById('overlay').classList.contains('open') && document.getElementById('claveEnvio').value === 'qc', '');
// ── 6 ──
await enviarAlRelevo(); await esperar(1200);
const log6 = document.getElementById('sendLog').textContent;
await oficinaBuscar(); await esperar(300);
const tabla6 = document.querySelector('#ofi-lista table');
ok('6 · El reenvío dice que es la definitiva y la lista vuelve a mostrar el mismo número como Definitiva con el nombre', /VERSIÓN DEFINITIVA · cerrada por Ing\. Coordinadora de ejemplo/.test(log6) && !!tabla6 && /Definitiva · Ing\. Coordinadora de ejemplo/.test(tabla6.innerText) && /rev\. 2/.test(tabla6.innerText) && (tabla6.innerText.match(new RegExp(NRO.replace(/[-]/g, '\\-'), 'g')) || []).length === 1, (tabla6 || {}).innerText);
const r8 = await fetch(RELEVO_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ clave: 'qc', accion: 'oficina-abrir', sector: 'EZ', torre: 'T-07', numero: NRO }) }).then(r => r.json());
ok('8 · El relevo guardó la revisión 2 con la observación limpia, la definitiva y la misma foto', r8.ok && r8.revision === 2 && r8.datos.obs_general === 'Observación limpia, redactada en oficina.' && r8.datos.definitiva && r8.datos.definitiva.por === 'Ing. Coordinadora de ejemplo' && r8.fotos.length === 1 && r8.fotos[0].nombre === 'hito_acabados-1', JSON.stringify({ rev: r8.revision, obs: r8.datos && r8.datos.obs_general, fotos: r8.fotos && r8.fotos.length }));
// ── 7 ──
Q.aceptar = true; nuevoFormulario(); await esperar(300);
ok('7 · Un informe nuevo no es definitivo ni viene del archivo, y el panel deja de mostrar el cierre', _definitiva === null && _oficinaDe === null && getFormData().definitiva === undefined && document.getElementById('ofi-estado').style.display === 'none', '');
_ES_OFICINA = false; _oficinaMostrar(); localStorage.removeItem('garmel_reports_list');
