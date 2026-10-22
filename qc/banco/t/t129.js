// TANDA 129 · v186 (22-oct-2026): «Completar lo vacío con otra torre/manzana» en servicios, SHA y urbanismo (lo mismo que obra,
// t128). Página: servicios.html, sha.html o urbanismo.html, a 375 px. 1 un informe reabierto (ya enviado) con una respuesta ofrece
// «Completar lo vacío…» · 2 el panel lo dice · 3 la respuesta propia queda igual y sin marca; las vacías se llenan marcadas ·
// 4 no se envía sin confirmar · 5 con la mitad contestada no se ofrece · 6 nada se sale a 375 px.
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem(CLAVE_LISTA, '[]'); localStorage.removeItem(CLAVE_TORRES);
Q.aceptar = true; await Q.relevo({ caido: false, fallar: [], lento: 0, borrar: true });
const T = TIPO_INFORME, ES_URB = T === 'urbanismo';
const sel = (id, v) => { const e = document.getElementById(id); if (!e) return; e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const lugares = ES_URB ? [...document.getElementById('torre').options].map(o => o.value).filter(Boolean) : ['T-01', 'T-02', 'T-07'];
const [A, B] = lugares;
const its = () => [...document.querySelectorAll('[id^="items-"] .item')];
const responder = (item, si) => { const bt = [...item.querySelectorAll('button')].find(b => (si ? /^S[ií]$/i : /^No$/i).test(b.textContent.trim())); if (bt) { bt.click(); return; } const c = item.querySelector('.cant'); if (c) { c.value = si ? '7' : '3'; c.dispatchEvent(new Event('input', { bubbles: true })); } };
const cabecera = (lugar, fecha) => { sel('convenio', 'Convenio Bielorrusos'); sel('torre', lugar); sel('fecha', fecha); const ins = document.querySelector('#inspectores select'); if (ins) Q.elegir(ins, [...ins.options].map(o => o.value).filter(v => v && v !== 'OTRO')[0]); const est = document.getElementById('estatus'); if (est && est.tagName === 'SELECT') est.value = [...est.options].map(o => o.value).filter(Boolean)[0]; };
const huella = item => (typeof valorSN === 'function' ? valorSN(item) : '') + '|' + ((item.querySelector('.cant') || {}).value || '');
let envios = 0; const _fetch = window.fetch; window.fetch = function(u, o){ try { const b = JSON.parse((o && o.body) || '{}'); if (b.numero && b.datos) envios++; } catch (e) {} return _fetch.apply(this, arguments); };
// Fuente: A con los tres primeros ítems en «Sí» (o 7).
nuevoInforme(); await esperar(300); cabecera(A, '2026-10-20'); await esperar(700); if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
its().slice(0, 3).forEach(x => responder(x, true)); await esperar(200); guardar(false); await esperar(300);
// Destino: B con el primer ítem en «No» (o 3), guardado y dado por enviado.
nuevoInforme(); await esperar(300); cabecera(B, '2026-10-21'); await esperar(1000); if ($('#aviso-historial .no')) { $('#aviso-historial .no').click(); await esperar(300); }
responder(its()[0], false); await esperar(200); const propia = huella(its()[0]); guardar(false); await esperar(300);
const idB = idActual; { const l = listaGuardada(); const i = l.findIndex(x => x.id === idB); l[i].enviado = 'ok'; localStorage.setItem(CLAVE_LISTA, JSON.stringify(l)); }
nuevoInforme(); await esperar(300); cargarInforme(idB); await esperar(1500); if ($('#aviso-historial .no')) { $('#aviso-historial .no').click(); await esperar(900); }
const b1 = document.getElementById('btn-copiar-de');
ok('1 · Reabierto (ya enviado, una respuesta) ofrece «Completar lo vacío con ' + (ES_URB ? 'otra manzana' : 'otra torre') + '…»', !!b1 && /Completar lo vac/.test(b1.textContent) && b1.offsetHeight >= 44, b1 ? b1.textContent + ' alto ' + b1.offsetHeight : 'sin botón');
b1.click(); await esperar(1500);
const panel = document.querySelector('#copiar-de .copiar-panel'), items = [...document.querySelectorAll('#copiar-de .f')];
ok('2 · El panel dice que solo llena lo que no tiene respuesta y lista ' + A, !!panel && /Completar lo vac/.test(panel.querySelector('.t').textContent) && /no tiene respuesta/.test(panel.textContent) && items.some(x => x.textContent.indexOf(A) >= 0), panel ? panel.querySelector('.t').textContent + ' · ' + items.map(x => x.textContent.trim().slice(0, 50)).join(' | ') : 'sin panel');
items.find(x => x.textContent.indexOf(A) >= 0).querySelector('button').click(); await esperar(900);
const i0 = its()[0];
ok('3 · El ítem propio queda igual y sin marca; los otros dos se llenan marcados', huella(i0) === propia && !i0.classList.contains('copiada') && document.querySelectorAll('.item.copiada').length === 2 && its().slice(1, 3).every(x => x.classList.contains('copiada')),
   propia + ' → ' + huella(i0) + ' · copiada0 ' + i0.classList.contains('copiada') + ' · copiadas ' + document.querySelectorAll('.item.copiada').length);
Q.dialogos.length = 0; const a4 = envios; await enviar(); await esperar(500);
ok('4 · No se envía con respuestas copiadas sin confirmar', Q.dialogos.some(m => /no se han confirmado/.test(m)) && envios === a4, Q.dialogos.join(' | ').slice(0, 120));
nuevoInforme(); await esperar(300); cabecera(B, '2026-10-22'); await esperar(1000); if ($('#aviso-historial .no')) { $('#aviso-historial .no').click(); await esperar(300); }
its().slice(0, Math.ceil(its().length / 2)).forEach(x => responder(x, true)); await esperar(900);
ok('5 · Con la mitad contestada no se ofrece', !document.getElementById('btn-copiar-de'));
ok('6 · Nada se sale de la pantalla y ningún control baja de 44 px', document.documentElement.scrollWidth <= innerWidth + 1 && Q.chicos().length === 0, Q.chicos().join(' '));
window.fetch = _fetch; nuevoInforme(); await esperar(200); localStorage.setItem(CLAVE_LISTA, '[]'); localStorage.removeItem(CLAVE_TORRES);
