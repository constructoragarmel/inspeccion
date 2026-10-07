// TANDA 74 · V144 (7-oct-2026): el modo oficina en servicios, SHA y urbanismo (motor compartido), contra el relevo falso r50.
// Se corre en navegador (fotos de IndexedDB). Página: servicios.html, sha.html o urbanismo.html, a 1280 px o con ?oficina=1.
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem(CLAVE_LISTA, '[]');
Q.aceptar = true;
const T = TIPO_INFORME, ES_URB = T === 'urbanismo';
const sel = (id, v) => { const e = document.getElementById(id); if (!e) return; e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const LUGAR = ES_URB ? [...document.getElementById('torre').options].map(o => o.value).filter(Boolean)[0] : 'T-01';
const contestar = () => { const item = document.querySelector('[id^="items-"] .item'); const si = item && [...item.querySelectorAll('button')].find(b => /^S[ií]$/i.test(b.textContent.trim())); if (si) si.click(); else { const c = item && item.querySelector('.cant'); if (c) { c.value = '7'; c.dispatchEvent(new Event('input', { bubbles: true })); } } };
const cabecera = () => { sel('convenio', 'Convenio Bielorrusos'); sel('torre', LUGAR); sel('fecha', '2026-10-07'); const ins = document.querySelector('#inspectores select'); if (ins) Q.elegir(ins, [...ins.options].map(o => o.value).filter(v => v && v !== 'OTRO')[0]); const est = document.getElementById('estatus'); if (est && est.tagName === 'SELECT') est.value = [...est.options].map(o => o.value).filter(Boolean)[0]; /* en SHA es el estatus del cierre (Aprobado…) */ };
// ── 1 · el panel ──
const panel = document.getElementById('oficina');
ok('1 · El panel de oficina existe y se ve (pantalla ancha o ?oficina=1)', !!panel && panel.style.display !== 'none' && /Modo oficina/.test(panel.innerText) && /Buscar los informes/.test(panel.innerText), panel ? panel.style.display : 'sin panel');
// ── 2 · un informe de campo: se arma, lleva una foto y se envía al relevo falso ──
nuevoInforme(); await esperar(300); cabecera(); await esperar(600);
if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
contestar(); await esperar(200);
const grid = document.querySelector('[id^="fotos-"]'); const inpFoto = grid && grid.parentElement.querySelector('input[type=file]');
if (inpFoto) { Q.ponerFotos(inpFoto, [await Q.foto(600, 400, 74)]); await hasta(() => grid.querySelectorAll('.foto img').length === 1, 8000); }
const ta = document.querySelector('.obs-srv'); if (ta) { ta.value = 'nota sucia de campo'; ta.dispatchEvent(new Event('input', { bubbles: true })); }
guardar(false); await _escrituraFotos; const d0 = listaGuardada()[0]; const NRO = d0.nro;
Q.dialogos.length = 0; await enviarSolo(d0.id); await esperar(800);
const e2 = (await Q.envios()).filter(e => e.numero === NRO);
ok('2 · El informe de campo se envió al relevo falso con su tipo y su foto', e2.length === 1 && e2[0].tipo === T && (e2[0].fotos || []).length >= 1 && listaGuardada()[0].enviado, JSON.stringify({ n: e2.length, tipo: e2[0] && e2[0].tipo, fotos: e2[0] && e2[0].fotos, nro: NRO, dialogos: Q.dialogos.slice(0, 2) }));
// ── 3 · la computadora de la oficina no tiene nada guardado: busca y encuentra ──
localStorage.setItem(CLAVE_LISTA, '[]'); nuevoInforme(); await esperar(300); sel('convenio', 'Convenio Bielorrusos'); sel('torre', LUGAR); await esperar(300);
await oficinaBuscar(); await esperar(300);
const tabla = document.querySelector('#ofi-lista table');
ok('3 · La lista trae el informe de campo como Preliminar, con su número y quién lo hizo', !!tabla && tabla.innerText.indexOf(NRO) >= 0 && /Preliminar/.test(tabla.innerText) && !/Definitiva/.test(tabla.innerText), (tabla || {}).innerText);
// ── 4 · abrirlo: mismas respuestas, la observación y la foto; marcado como abierto desde el archivo ──
await oficinaAbrir(NRO); await esperar(800);
await hasta(() => document.querySelectorAll('[id^="fotos-"] .foto img').length >= 1, 8000, 100);
const item4 = document.querySelector('[id^="items-"] .item');
const contestado4 = item4 && (valorSN(item4) || (item4.querySelector('.cant') || {}).value === '7');
const foto4 = document.querySelector('[id^="fotos-"] .foto img');
ok('4 · Abrirlo carga el mismo número, la respuesta, la observación y la foto, y queda marcado como abierto desde el archivo',
   numeroInforme() === NRO && !!contestado4 && (document.querySelector('.obs-srv') || {}).value === 'nota sucia de campo' && !!foto4 && /^data:image/.test(foto4.src) && _oficinaDe && _oficinaDe.numero === NRO,
   numeroInforme() + ' · contestado ' + !!contestado4 + ' · foto ' + !!(foto4 && /^data:/.test(foto4.src)) + ' · ' + JSON.stringify(_oficinaDe));
const g4 = listaGuardada().find(b => b.nro === NRO);
ok('5 · En la lista local está como enviado, con la marca de oficina y sin «editado después»', !!g4 && !!g4.enviado && !!g4.oficina && !g4.editadoTras, JSON.stringify(g4 && { enviado: g4.enviado, oficina: !!g4.oficina, ed: g4.editadoTras }));
ok('6 · El panel dice de dónde viene y ofrece cerrar la definitiva', /Abierto desde el archivo/.test($('#ofi-estado').innerText) && /Cerrar versión definitiva/.test($('#ofi-estado').innerText), $('#ofi-estado').innerText);
// ── 7 · cerrar la definitiva: pide el nombre, lo deja en los datos y reenvía ──
const obs7 = document.querySelector('.obs-srv'); if (obs7) { obs7.value = 'Observación limpia, redactada en oficina.'; obs7.dispatchEvent(new Event('input', { bubbles: true })); }
const antes7 = (await Q.envios()).filter(e => e.numero === NRO).length;
const cerrado = cerrarDefinitiva('Ing. Coordinadora de ejemplo'); await esperar(1500);
const env7 = (await Q.envios()).filter(e => e.numero === NRO);
const ult = env7[env7.length - 1];
ok('7 · Cerrar la definitiva deja {por, fecha, desde} en los datos y reenvía el mismo número con la observación limpia', cerrado === true && env7.length === antes7 + 1 && ult.datos.definitiva && ult.datos.definitiva.por === 'Ing. Coordinadora de ejemplo' && /^\d{4}-\d{2}-\d{2}$/.test(ult.datos.definitiva.fecha) && ult.datos.definitiva.desde === NRO && (ult.datos.general || []).some(g => g.obs === 'Observación limpia, redactada en oficina.'),
   JSON.stringify({ envios: env7.length - antes7, definitiva: ult && ult.datos.definitiva }));
ok('8 · El panel dice Definitiva con el nombre y la fecha', /Definitiva · Ing\. Coordinadora de ejemplo/.test($('#ofi-estado').innerText), $('#ofi-estado').innerText);
await oficinaBuscar(); await esperar(300);
const tabla9 = document.querySelector('#ofi-lista table');
ok('9 · La lista vuelve a mostrar el mismo número como Definitiva, revisión 2, una sola vez', !!tabla9 && /Definitiva · Ing\. Coordinadora de ejemplo/.test(tabla9.innerText) && /rev\. 2/.test(tabla9.innerText) && (tabla9.innerText.match(new RegExp(NRO.replace(/[-]/g, '\\-'), 'g')) || []).length === 1, (tabla9 || {}).innerText);
nuevoInforme(); await esperar(200);
ok('10 · Un informe nuevo no es definitivo ni viene del archivo', _definitiva === null && _oficinaDe === null && !datosDelFormulario().definitiva && $('#ofi-estado').style.display === 'none', '');
localStorage.setItem(CLAVE_LISTA, '[]');
