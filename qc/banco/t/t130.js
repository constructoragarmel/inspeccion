// TANDA 130 · cambio 194 (27-oct-2026): «📄 Ver PDF» en el buscador de informes, sin traerlo al formulario. Pedido de Diego Orta:
// abrir un informe archivado para mirarlo lo dejaba como borrador. Corre en los cuatro formularios (?prueba=1&oficina=1), con el
// relevo falso r74. 1 cada fila del buscador lleva «📄 Ver PDF» y «Abrir para corregir», y el pie explica la diferencia ·
// 2 «Ver PDF» pide al relevo 'oficina-pdf' con el número, la torre y (fuera de obra) el tipo · 3 abre la pestaña dentro del toque
// y la lleva al PDF · 4 deja en el panel el enlace para abrirlo y descargarlo · 5 no toca «Informes» ni lo que hay en pantalla ·
// 6 el PDF que llega es el archivado (empieza por %PDF) · 7 la segunda vez no vuelve a pedirlo · 8 un número que el relevo no
// tiene: dice por qué y cierra la pestaña · 9 «Abrir para corregir» sigue trayéndolo como antes · 10 nada se sale a 375 px.
const OBRA = typeof enviarPendientes === 'function';
const CL = OBRA ? 'garmel_reports_list' : CLAVE_LISTA;
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem(CL, '[]');
if (!OBRA) { localStorage.removeItem(CLAVE_TORRES); localStorage.removeItem(CLAVE_ACTUAL); }
Q.aceptar = true;
await Q.relevo({ caido: false, fallar: [], lento: 0, colgar: 0, perder: false, borrar: true });
const sel = (id, v) => { const e = document.getElementById(id); if (!e) return; e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const put = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
const lista = () => JSON.parse(localStorage.getItem(CL) || '[]');
let NRO = '', LUGAR = 'T-07';
// ── Un informe enviado desde «campo» ──
if (OBRA) {
  nuevoFormulario(); await esperar(300); setAmbito('apartamento'); await esperar(200);
  sel('fecha', '2026-10-26'); sel('convenio', 'Convenio Bielorrusos'); sel('torre', LUGAR); sel('piso', 'Piso 03'); put('apto', 'B2');
  const insp = document.querySelector('.inspector-select'); insp.value = [...insp.options].map(o => o.value).filter(Boolean)[0]; insp.dispatchEvent(new Event('change', { bubbles: true }));
  if (!document.querySelector('#estatus .ck-lbl.on')) document.querySelector('#estatus .ck-lbl').click();
  await esperar(400); { const a = document.getElementById('aviso-anterior'); if (a) a.innerHTML = ''; }
  const cod = '4.01'; let F = null; for (const h of PARTIDAS) { const i = (CODIGOS_SUB[h.id] || []).indexOf(cod); if (i >= 0) F = h.id + '_' + i; }
  document.querySelector(`.est-btn[data-rid="${F}"][data-v="50"]`).click();
  saveDraft(true); await esperar(200);
  NRO = document.getElementById('nro-display').textContent.trim();
  document.getElementById('claveEnvio').value = 'qc';
  await enviarAlRelevo(); await esperar(800);
  _ES_OFICINA = true; _oficinaMostrar();
} else {
  const T = TIPO_INFORME; LUGAR = T === 'urbanismo' ? [...document.getElementById('torre').options].map(o => o.value).filter(Boolean)[0] : 'T-01';
  nuevoInforme(); await esperar(300); sel('convenio', 'Convenio Bielorrusos'); sel('torre', LUGAR); sel('fecha', '2026-10-26'); await esperar(600);
  if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
  const ins = document.querySelector('#inspectores select'); if (ins) Q.elegir(ins, [...ins.options].map(o => o.value).filter(v => v && v !== 'OTRO')[0]);
  const est = document.getElementById('estatus'); if (est && est.tagName === 'SELECT') est.value = [...est.options].map(o => o.value).filter(Boolean)[0];
  const item = document.querySelector('[id^="items-"] .item'); const si = item && [...item.querySelectorAll('button')].find(b => /^S[ií]$/i.test(b.textContent.trim()));
  if (si) si.click(); else { const c = item && item.querySelector('.cant'); if (c) { c.value = '7'; c.dispatchEvent(new Event('input', { bubbles: true })); } }
  guardar(false); await esperar(300); const d0 = listaGuardada()[0]; NRO = d0.nro;
  await enviarSolo(d0.id); await esperar(800);
  _ES_OFICINA = true; _oficinaMostrar();
}
ok('0 · Hay un informe enviado de campo para buscar', !!NRO && (await Q.envios()).some(e => e.numero === NRO), NRO);
// ── La computadora de la oficina: nada guardado, algo en pantalla ──
localStorage.setItem(CL, '[]');
if (OBRA) { nuevoFormulario(); await esperar(300); sel('convenio', 'Convenio Bielorrusos'); sel('torre', LUGAR); await esperar(300); }
else { nuevoInforme(); await esperar(300); sel('convenio', 'Convenio Bielorrusos'); sel('torre', LUGAR); await esperar(300); if ($('#aviso-historial .no')) $('#aviso-historial .no').click(); }
await oficinaBuscar(); await esperar(300);
const fila = [...document.querySelectorAll('#ofi-lista tr')].find(tr => tr.innerText.indexOf(NRO) >= 0);
const ver = fila && fila.querySelector('button.ofi-ver'), abrir = fila && [...fila.querySelectorAll('button')].find(b => /Abrir para corregir/.test(b.textContent));
ok('1 · La fila lleva «📄 Ver PDF» y «Abrir para corregir», y el pie dice que Ver PDF no crea borrador', !!ver && /Ver PDF/.test(ver.textContent) && !!abrir && /no crea ning.n borrador/.test($('#ofi-lista').innerText), fila ? fila.innerText : 'sin fila');
// La pestaña de mentira y lo que se le pide al relevo
const W = { abiertas: 0, destino: '', cerrada: false };
const _open = window.open; window.open = function(){ W.abiertas++; return { document: { write(){} }, location: { set href(u){ W.destino = u; } }, close(){ W.cerrada = true; } }; };
const pedidos = []; const _fetch = window.fetch; window.fetch = function(u, o){ try { const b = JSON.parse((o && o.body) || '{}'); if (b.accion === 'oficina-pdf') pedidos.push(b); } catch (e) {} return _fetch.apply(this, arguments); };
const antesLista = localStorage.getItem(CL), antesPantalla = OBRA ? JSON.stringify(getFormData().torre) : (document.getElementById('torre') || {}).value;
ver.click(); await hasta(() => !!$('#ofi-lista .ofi-pdf a'), 8000, 100);
const p2 = pedidos[0] || {};
ok('2 · Pide «oficina-pdf» con el número y la torre' + (OBRA ? '' : ' y el tipo'), pedidos.length === 1 && p2.numero === NRO && p2.torre === LUGAR && (OBRA || p2.tipo === TIPO_INFORME), JSON.stringify(p2).slice(0, 160));
ok('3 · Abre una pestaña y la lleva al PDF', W.abiertas === 1 && /^blob:/.test(W.destino), W.abiertas + ' · ' + W.destino);
const a4 = [...document.querySelectorAll('#ofi-lista .ofi-pdf a')];
ok('4 · Deja en el panel «abrir el PDF» y «descargarlo»', a4.length === 2 && a4[0].href === W.destino && /\.pdf$/.test(a4[1].getAttribute('download') || ''), a4.map(a => a.textContent + ' ' + (a.getAttribute('download') || '')).join(' | '));
ok('5 · No toca «Informes» ni lo que hay en pantalla', localStorage.getItem(CL) === antesLista && lista().length === 0 && (OBRA ? JSON.stringify(getFormData().torre) : (document.getElementById('torre') || {}).value) === antesPantalla, 'lista ' + lista().length);
const txt = await (await fetch(W.destino)).text();
ok('6 · Lo que llega es un PDF (el archivado)', /^%PDF/.test(txt) && txt.indexOf(NRO) >= 0, txt.slice(0, 40));
ver.click(); await esperar(400);
ok('7 · La segunda vez no lo vuelve a pedir', pedidos.length === 1 && W.abiertas === 2, 'pedidos ' + pedidos.length);
// Un número que el relevo no tiene
W.cerrada = false; const v8 = document.createElement('button'); v8.dataset.n = 'NO-EXISTE-261026-XX';
await oficinaVerPdf('NO-EXISTE-261026-XX'); await esperar(200);
const p8 = document.querySelector('#ofi-lista .ofi-pdf[data-n="NO-EXISTE-261026-XX"]');
ok('8 · Un número sin PDF: lo dice y cierra la pestaña', !!p8 && /No se pudo traer el PDF/.test(p8.textContent) && /No encuentro el PDF/.test(p8.textContent) && W.cerrada, p8 ? p8.textContent : '');
window.open = _open; window.fetch = _fetch;
// «Abrir para corregir» sigue como antes
abrir.click(); await esperar(1500);
ok('9 · «Abrir para corregir» lo trae a «Informes» como antes', lista().some(b => b && (b.nro === NRO)) && _oficinaDe && _oficinaDe.numero === NRO, JSON.stringify(_oficinaDe));
ok('10 · Nada se sale de la pantalla', document.documentElement.scrollWidth <= innerWidth + 1, document.documentElement.scrollWidth + ' > ' + innerWidth);
localStorage.setItem(CL, '[]'); _ES_OFICINA = false; _oficinaMostrar();
