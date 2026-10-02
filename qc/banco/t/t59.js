// TANDA 59 · V115 (2-oct-2026): la vista previa del informe, con la misma plantilla del PDF oficial.
// Se corre en urbanismo.html, servicios.html y sha.html. No envía nada.
// 1 el botón, primero detrás del «⋯» · 2 en blanco avisa y no abre · 3 con contenido abre la hoja con el título, el número y lo escrito
// 4 la foto tomada sale en la hoja · 5 no se envió nada · 6 si falta algo de la cabecera, lo dice arriba · 7 la hoja cabe a lo ancho, entera
// 8 «Cerrar» la quita y el formulario queda como estaba · 9 «Ver» en un informe guardado sin enviar, con sus fotos · 10 un enviado no lo ofrece
const pagina = /sha\.html/.test(location.pathname) ? 'sha' : /urbanismo\.html/.test(location.pathname) ? 'urbanismo' : 'servicios';
const TITULO = { urbanismo: /INFORME DE INSPECCI[ÓO]N DE URBANISMO/, servicios: /SERVICIOS/, sha: /SHA|SEGURIDAD/ }[pagina];
const nuevo = async () => { Q.aceptar = true; nuevoInforme(); await esperar(150); if ($('#aviso-historial .no')) $('#aviso-historial .no').click(); };
const escribir = (e, v) => { e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); };
const vp = () => $('#vista-previa'), marco = () => $('#vista-previa iframe');
const hoja = async () => { await hasta(() => marco() && marco().contentDocument && marco().contentDocument.body && marco().contentDocument.body.innerText.length > 80, 40000); await esperar(600); return marco() ? marco().contentDocument : document.implementation.createHTMLDocument('sin hoja'); };
let llamadas = 0; const fetchBase = window.fetch;
// Un envío es un POST sin «accion»; elegir la torre consulta el historial (accion: 'historial'), que no es enviar.
window.fetch = function (u, o) { if (o && o.method === 'POST' && !/"accion"/.test(String(o.body || ''))) llamadas++; return fetchBase.apply(this, arguments); };
await esperar(500);
const ancho = window.innerWidth;

await nuevo();
const primero = $('#fila-mas button');
ok('1 · «👁 Vista previa» es el primer botón detrás del «⋯»', !!primero && /Vista previa/.test(primero.textContent) && /vistaPrevia\(\)/.test(primero.getAttribute('onclick')), primero ? primero.textContent.trim() : 'sin botón');

Q.dialogos.length = 0;
await vistaPrevia(); await esperar(200);
ok('2 · Con el informe en blanco avisa que no hay nada que mostrar, y no abre nada', !vp() && Q.dialogos.some(m => /Todavía no hay nada que mostrar/.test(m)), Q.dialogos[0] || 'sin aviso');

// Contenido, sin cabecera todavía
const TEXTO = 'Texto de prueba de la vista previa, con acentos: ñandú, camión.';
const contenido = () => {
escribir($('#obs_general'), TEXTO);
if (pagina === 'urbanismo') { const it = $('.srv .item'); const sid = it.closest('.srv').id.replace('srv-', ''); if (it.closest('.cuerpo').hidden) plegar(sid); escribir(it.querySelector('.cant'), '12,5'); escribir($('#actividades'), 'Limpieza y replanteo.'); }
if (pagina === 'servicios') { const it = $('.srv .item'); const sid = it.closest('.srv').id.replace('srv-', ''); if (it.closest('.cuerpo').hidden) plegar(sid); marcarSN(it.querySelector('.sino').children[0], 'SI'); }
if (pagina === 'sha' && !$('#filas-apto .fila-apto')) { verPanel('b'); addApartamento({ apto: 'Andamio norte', piso: '', campos: { 'hallazgo__Descripción del hallazgo o condición observada': 'Andamio sin rodapié.', 'hallazgo__Acción correctiva / estatus': 'Pendiente', 'hallazgo__Solución': 'Completar el andamio.', 'hallazgo__Responsable del correctivo': 'Ing. residente' }, fotos: [] }); verPanel('a'); }
};
contenido();
const cam = $('.btn-camara:not(.cam-partida) input[type=file]'), grid = (cam.closest('.tarjeta') || cam.parentElement.parentElement).querySelector('.fotos');
if (typeof plegar === 'function' && grid.closest('[id^="srv-"]') && grid.closest('.cuerpo').hidden) plegar(grid.closest('[id^="srv-"]').id.replace('srv-', ''));
Q.ponerFotos(cam, [await Q.foto(800, 600, 7)]);
await hasta(() => grid.children.length === 1, 30000);

Q.dialogos.length = 0;
await vistaPrevia();
const d6 = await hoja(), aviso6 = (vp().querySelector('.vp-aviso') || {}).textContent || '';
ok('6 · Si a la cabecera le falta algo, la vista previa abre igual y lo dice arriba', /le falta .*(torre|manzana)/i.test(aviso6) && /inspector/.test(aviso6), aviso6);
_vpCerrar();

// Cabecera completa
const s = $('#sector'); if (s && !s.value) { Q.elegir(s, [...s.options].map(o => o.value).filter(Boolean)[0]); await esperar(100); }
const t = $('#torre'); Q.elegir(t, [...t.options].map(o => o.value).filter(Boolean)[0]); await esperar(150); if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
const c = $('#convenio'); if (c && !c.value) { Q.elegir(c, [...c.options].map(o => o.value).filter(Boolean)[0]); await esperar(100); }
Q.elegir($('#inspectores select'), INSPECTORES_DB[0]); await esperar(100);
if (pagina === 'sha') { const e = $('#estatus'); Q.elegir(e, [...e.options].map(o => o.value).filter(Boolean)[0]); }   // en SHA el cierre es obligatorio
contenido(); await esperar(100);
if (!grid.children.length) { Q.ponerFotos(cam, [await Q.foto(800, 600, 7)]); await hasta(() => grid.children.length === 1, 30000); }
const nro = numeroInforme();

await vistaPrevia();
const doc = await hoja(), texto = doc.body.innerText;
ok('3 · Con contenido abre la hoja con el título del informe, su número y lo escrito, y dice arriba que todavía no se ha enviado',
   !!vp() && TITULO.test(texto) && texto.indexOf(nro) >= 0 && texto.indexOf(TEXTO) >= 0 && /Todavía NO se ha enviado/.test(vp().querySelector('.vp-cab').textContent) && !vp().querySelector('.vp-aviso') &&
   (pagina !== 'urbanismo' || (/12[.,]5/.test(texto) && /Limpieza y replanteo/.test(texto))) && (pagina !== 'sha' || (/Andamio sin rodapié/.test(texto) && /Completar el andamio/.test(texto) && /Ing\. residente/.test(texto))),
   nro + ' · ' + texto.length + ' caracteres' + (vp().querySelector('.vp-aviso') ? ' · aviso: ' + vp().querySelector('.vp-aviso').textContent : '') + ' · título ' + TITULO.test(texto) + ' · texto ' + (texto.indexOf(TEXTO) >= 0));
const fotos = [...doc.querySelectorAll('img')].filter(i => /^data:image\/jpe?g/.test(i.src));
ok('4 · La foto tomada sale en la hoja', fotos.length === 1 && fotos[0].naturalWidth > 0, fotos.length + ' foto(s) · ' + (fotos[0] ? fotos[0].naturalWidth + ' px' : ''));
ok('5 · No se envió nada: la vista previa se arma en el teléfono', llamadas === 0, llamadas + ' envíos');

const h = vp().querySelector('.vp-hoja').getBoundingClientRect(), cu = vp().querySelector('.vp-cuerpo'), m = marco().getBoundingClientRect();
const escala = m.width / 794, altoDoc = marco().clientHeight, fin = Math.max(...[...doc.body.children].map(e => e.getBoundingClientRect().bottom));
ok('7 · A ' + ancho + ' px la hoja cabe entera a lo ancho (achicada, no reacomodada), sin barra horizontal, y se ve hasta el final',
   h.left >= 0 && h.right <= ancho + 1 && cu.scrollWidth <= cu.clientWidth + 1 && Math.abs(m.width - Math.min(794, cu.clientWidth - 16)) < 3 && doc.documentElement.clientWidth === 794 && doc.compatMode === 'BackCompat' &&
   Math.abs(h.height - altoDoc * escala) < 3 && fin <= altoDoc && fin > altoDoc - 80 && h.height > 150, 'hoja ' + Math.round(h.width) + '×' + Math.round(h.height) + ' · escala ' + escala.toFixed(2) + ' · documento ' + altoDoc + ' px, lo último termina en ' + Math.round(fin));
const cerrar = [...vp().querySelectorAll('.vp-cab button')].pop().getBoundingClientRect();
ok('8a · «Cerrar» mide al menos 44 px y está a la vista', cerrar.height >= 44 && cerrar.right <= ancho + 1 && cerrar.top >= 0, Math.round(cerrar.width) + '×' + Math.round(cerrar.height));
// Ampliar
const bz = vp().querySelector('.vp-zoom');
if (ancho < 760) {
  bz.click(); await esperar(150);
  const m2 = marco().getBoundingClientRect();
  ok('7b · «Ampliar» pone la hoja a tamaño real (se recorre con el dedo) y «Ajustar» la devuelve', Math.abs(m2.width - 794) < 2 && cu.scrollWidth > cu.clientWidth && /Ajustar/.test(bz.textContent) && bz.getBoundingClientRect().height >= 44, Math.round(m2.width) + ' px · ' + bz.textContent);
  bz.click(); await esperar(150);
  ok('7c · De vuelta, cabe otra vez a lo ancho', Math.abs(marco().getBoundingClientRect().width - Math.min(794, cu.clientWidth - 16)) < 3 && /Ampliar/.test(bz.textContent), Math.round(marco().getBoundingClientRect().width) + ' px');
} else ok('7b · Con pantalla ancha la hoja ya va a tamaño real y no hace falta «Ampliar»', bz.hidden, 'botón oculto: ' + bz.hidden);
[...vp().querySelectorAll('.vp-cab button')].filter(b => !b.hidden).pop().click(); await esperar(100);
ok('8 · «Cerrar» la quita y el formulario queda como estaba', !vp() && $('#obs_general').value === TEXTO && grid.children.length === 1 && numeroInforme() === nro, 'observación y foto en su sitio');

// Un informe guardado
guardar(false); const id9 = idActual; await esperar(800);
await nuevo();
abrirInformes(); await esperar(100);
const ver = [...document.querySelectorAll('#modal-informes .ficha button')].find(b => /Ver/.test(b.textContent));
ok('9a · En «Informes», el que está sin enviar tiene «👁 Ver», y sus cuatro botones caben', !!ver && [...ver.parentElement.children].every(b => { const r = b.getBoundingClientRect(); return r.right <= ancho + 1 && r.height >= 44; }), ver ? [...ver.parentElement.children].map(b => b.textContent.trim()).join(' | ') : 'sin botón');
if (ver) ver.click();
const doc9 = await hoja(), t9 = doc9.body.innerText;
ok('9 · «Ver» abre la hoja de ese informe guardado, con su foto, aunque en pantalla haya otro', t9.indexOf(nro) >= 0 && t9.indexOf(TEXTO) >= 0 && [...doc9.querySelectorAll('img')].filter(i => /^data:image\/jpe?g/.test(i.src)).length === 1 && $('#modal-informes').hidden && $('#obs_general').value === '',
   nro + ' · fotos ' + [...doc9.querySelectorAll('img')].filter(i => /^data:image\/jpe?g/.test(i.src)).length);
_vpCerrar();

const l = listaGuardada(); const x = l.find(y => y.id === id9); x.enviado = '02/10 12:00';
localStorage.setItem(CLAVE_LISTA, JSON.stringify(l));
abrirInformes(); await esperar(100);
const ficha = [...document.querySelectorAll('#modal-informes .ficha')].find(f => f.textContent.indexOf(nro) >= 0);
ok('10 · Un informe ya enviado no ofrece «Ver»: sus fotos ya no están en el teléfono', !!ficha && /Enviado/.test(ficha.textContent) && ![...ficha.querySelectorAll('button')].some(b => /Ver/.test(b.textContent)), ficha ? [...ficha.querySelectorAll('button')].map(b => b.textContent.trim()).join(' | ') : 'sin ficha');
cerrarInformes();
ok('11 · La plantilla es la del relevo: trae su huella y sirve para los tres formularios', !!window.VistaPrevia && /^[0-9a-f]{10}$/.test(VistaPrevia.huella) && VistaPrevia.tipos.join() === 'servicios,sha,urbanismo', window.VistaPrevia ? VistaPrevia.huella : 'sin cargar');
window.fetch = fetchBase;
borrarInforme && (Q.aceptar = true, borrarInforme(id9));
await nuevo();
