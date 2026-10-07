// TANDA 75 · V144 (7-oct-2026): copiar las respuestas de otra torre (o manzana) en servicios, SHA y urbanismo, contra el relevo falso r50.
// Página: servicios.html, sha.html o urbanismo.html, a 375 px.
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem(CLAVE_LISTA, '[]'); localStorage.removeItem(CLAVE_TORRES);
Q.aceptar = true; await Q.relevo({ caido: false, fallar: [], lento: 0, borrar: true });   // el relevo falso no debe traer un informe más nuevo de la fuente
const T = TIPO_INFORME, ES_URB = T === 'urbanismo';
const sel = (id, v) => { const e = document.getElementById(id); if (!e) return; e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const lugares = ES_URB ? [...document.getElementById('torre').options].map(o => o.value).filter(Boolean) : ['T-01', 'T-02', 'T-07'];
const [A, B, C] = lugares;   // A y B de la misma contratista (T-01 y T-02, Río Limón); C de otra (T-07, Alnavic). En urbanismo, tres manzanas del sector.
const contestar = n => { [...document.querySelectorAll('[id^="items-"] .item')].slice(0, n).forEach(item => { const si = [...item.querySelectorAll('button')].find(b => /^S[ií]$/i.test(b.textContent.trim())); if (si) si.click(); else { const c = item.querySelector('.cant'); if (c) { c.value = '7'; c.dispatchEvent(new Event('input', { bubbles: true })); } } }); };
const cabecera = (lugar, fecha) => { sel('convenio', 'Convenio Bielorrusos'); sel('torre', lugar); sel('fecha', fecha); const ins = document.querySelector('#inspectores select'); if (ins) Q.elegir(ins, [...ins.options].map(o => o.value).filter(v => v && v !== 'OTRO')[0]); const est = document.getElementById('estatus'); if (est && est.tagName === 'SELECT') est.value = [...est.options].map(o => o.value).filter(Boolean)[0]; /* en SHA es el estatus del cierre (Aprobado…) */ };
let envios = 0; const _fetch = window.fetch; window.fetch = function(u, o){ try { const b = JSON.parse((o && o.body) || '{}'); if (b.numero && b.datos) envios++; } catch (e) {} return _fetch.apply(this, arguments); };
// Fuente: la torre A con tres respuestas, guardada en este teléfono.
nuevoInforme(); await esperar(300); cabecera(A, '2026-10-06'); await esperar(700); if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
contestar(3); await esperar(200); guardar(false); await esperar(300);
const nroA = listaGuardada()[0].nro;
// Destino: la torre B, en blanco.
nuevoInforme(); await esperar(300); cabecera(B, '2026-10-07'); await esperar(1200);
const btn = document.getElementById('btn-copiar-de');
ok('1 · Con la torre elegida y nada contestado aparece «Copiar de otra torre/manzana…»', !!btn && btn.offsetHeight >= 40 && /Copiar de otra/.test(btn.textContent), btn ? btn.textContent : 'sin botón');
btn.click(); await esperar(1500);
const items = [...document.querySelectorAll('#copiar-de .f')];
ok('2 · El panel lista el informe de ' + A + ' guardado en este teléfono, con sus respuestas', items.length >= 1 && items.some(x => x.textContent.indexOf(A) >= 0 && /3 respuesta/.test(x.textContent) && /este teléfono/.test(x.textContent)), items.map(x => x.textContent.trim().slice(0, 70)).join(' | '));
items.find(x => x.textContent.indexOf(A) >= 0).querySelector('button').click(); await esperar(800);
const copiadas = document.querySelectorAll('.item.copiada, .fila-apto.copiada').length, tag = document.querySelector('.item.copiada .etq-her');
ok('3 · Copiar llena las tres respuestas y las marca «≈ copiado de ' + A + ' · tocar para confirmar»', copiadas === 3 && tag && tag.textContent.indexOf('copiado de ' + A) >= 0 && /tocar para confirmar/.test(tag.textContent), copiadas + ' · ' + (tag ? tag.textContent : ''));
const d4 = datosDelFormulario();
ok('4 · El dato dice de dónde se copió y cada respuesta copiada lleva el número de origen', d4.copiadoDe && d4.copiadoDe.nro === nroA && d4.copiadoDe.torre === A && _copiadasSinConfirmar(d4) === 3, JSON.stringify(d4.copiadoDe) + ' · sin confirmar ' + _copiadasSinConfirmar(d4));
Q.dialogos.length = 0; const antes5 = envios; await enviar(); await esperar(500);
ok('5 · No se puede enviar con respuestas copiadas sin confirmar: avisa y no manda nada', Q.dialogos.some(m => /no se han confirmado/.test(m)) && envios === antes5, Q.dialogos.join(' | ').slice(0, 140) + ' · envíos ' + (envios - antes5));
guardar(false); await esperar(200); const idB = idActual;
nuevoInforme(); await esperar(300); cargarInforme(idB); await esperar(700);
ok('6 · Guardar y reabrir conserva las tres marcas y el origen', document.querySelectorAll('.item.copiada').length === 3 && _copiaDe && _copiaDe.nro === nroA && !document.getElementById('btn-copiar-de'), document.querySelectorAll('.item.copiada').length + ' · ' + JSON.stringify(_copiaDe));
document.querySelector('.item.copiada .etq-her').click(); await esperar(200);
ok('7 · Tocar la etiqueta confirma esa respuesta: deja de estar marcada y sigue contestada', document.querySelectorAll('.item.copiada').length === 2 && _copiadasSinConfirmar(datosDelFormulario()) === 2, document.querySelectorAll('.item.copiada').length + ' sin confirmar');
[...document.querySelectorAll('.item.copiada .etq-her')].forEach(t => t.click()); await esperar(200);
Q.dialogos.length = 0; const antes8 = envios; await enviar(); await esperar(2500);
const envB = (await Q.envios()).filter(e => e.numero === listaGuardada().find(x => x.id === idB).nro);
ok('8 · Con todas confirmadas sí se envía (y el dato viaja con copiadoDe)', envios >= antes8 + 1 && !Q.dialogos.some(m => /no se han confirmado/.test(m)) && envB.length === 1 && envB[0].datos.copiadoDe.nro === nroA, 'envíos ' + (envios - antes8) + ' · de B ' + envB.length + ' · ' + Q.dialogos.join(' | ').slice(0, 120));
// Otra contratista: C solo aparece al pedir «las demás del sector» (en urbanismo todas son del sector: aparece directo o al pedirlas).
nuevoInforme(); await esperar(300); cabecera(C, '2026-10-06'); await esperar(700); if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
contestar(1); await esperar(200); guardar(false); await esperar(300);
nuevoInforme(); await esperar(300); cabecera(B, '2026-10-07'); await esperar(1200);
if ($('#aviso-historial .no')) { $('#aviso-historial .no').click(); await esperar(800); }
document.getElementById('btn-copiar-de').click(); await esperar(1500);
const antes9 = [...document.querySelectorAll('#copiar-de .f')].some(x => x.textContent.indexOf(C) >= 0);
const bs = document.querySelector('#copiar-de .sector'); const txt9 = bs ? bs.textContent : ''; if (bs) { bs.click(); await esperar(2500); }
const despues9 = [...document.querySelectorAll('#copiar-de .f')].some(x => x.textContent.indexOf(C) >= 0);
ok('9 · ' + C + ' (' + (ES_URB ? 'otra manzana' : 'otra contratista') + ') ' + (ES_URB ? 'aparece entre las del sector' : 'no sale de entrada; con «Buscar también en las demás torres del sector» aparece'), ES_URB ? (antes9 || despues9) : (!antes9 && !!bs && /demás torres del sector \(\d+\)/.test(txt9) && despues9), txt9 + ' · antes ' + antes9 + ' · después ' + despues9);
document.querySelector('#copiar-de .cerrar').click(); await esperar(200);
contestar(1); await esperar(900);
ok('10 · Con algo contestado el botón no se ofrece', !document.getElementById('btn-copiar-de'), '');
window.fetch = _fetch; nuevoInforme(); await esperar(200); localStorage.setItem(CLAVE_LISTA, '[]'); localStorage.removeItem(CLAVE_TORRES);
