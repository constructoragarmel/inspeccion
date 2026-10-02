// TANDA 61 · V116 (2-oct-2026): «Minutas de campo» y la memoria de un informe de varias torres, en el motor de servicios.
// Se corre en servicios.html, sha.html y urbanismo.html. No envía nada.
// 1 la tarjeta, antes de la observación general · 2 la hoja se guarda a 1600 px (una foto de obra, a 1280) · 3 viaja en los datos
// 4 en el sobre va como «minutas-1», con su descripción · 5 el tope es de 6 hojas · 6 la vista previa trae el anexo
// 7 «Nuevo» lo vacía · 8 guardado y reabierto, vuelven las hojas · 9 cabe en la pantalla
// 10 y 11 un informe de varias torres queda como «visita anterior» también de las otras, sin pisar uno propio más nuevo
const pagina = /sha\.html/.test(location.pathname) ? 'sha' : /urbanismo\.html/.test(location.pathname) ? 'urbanismo' : 'servicios';
const nuevo = async () => { Q.aceptar = true; nuevoInforme(); await esperar(150); if ($('#aviso-historial .no')) $('#aviso-historial .no').click(); };
const escribir = (e, v) => { e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); };
const opciones = s => [...s.options].map(o => o.value).filter(v => v && v !== 'ZONA');
const cabecera = async (k) => {
  const s = $('#sector'); if (s && !s.value) { Q.elegir(s, opciones(s)[0]); await esperar(100); }
  const c = $('#convenio'); if (c && !c.value) { Q.elegir(c, opciones(c)[0]); await esperar(100); }
  const t = $('#torre'); Q.elegir(t, opciones(t)[k || 0]); await esperar(200); if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
  Q.elegir($('#inspectores select'), INSPECTORES_DB[0]);
  if (pagina === 'sha') { const e = $('#estatus'); Q.elegir(e, opciones(e)[0]); }
  await esperar(100);
};
const contestar = () => {
  const it = $('.srv .item'), sid = it.closest('.srv').id.replace('srv-', '');
  if (it.closest('.cuerpo').hidden) plegar(sid);
  if (pagina === 'urbanismo') escribir(it.querySelector('.cant'), '10'); else marcarSN(it.querySelector('.sino').children[0], 'SI');
};
await esperar(500);
const ancho = window.innerWidth;

await nuevo();
const card = $('#tarjeta-minutas'), grid = $('#fotos-minutas'), og = $('#obs_general').closest('.tarjeta');
const cam = card.querySelector('.btn-camara input');
ok('1 · La tarjeta «Minutas de campo» va antes de la observación general, con su botón de cámara y lo que dice para qué es',
   !!card && !!(card.compareDocumentPosition(og) & Node.DOCUMENT_POSITION_FOLLOWING) && /Minutas de campo \(máx\. 6\)/.test(card.querySelector('label').textContent) &&
   /Fotografiar minuta/.test(card.querySelector('.btn-camara').textContent) && cam.getAttribute('capture') === 'environment' && /anexo del PDF/.test(card.querySelector('.act-pista').textContent),
   card.querySelector('.act-pista').textContent.slice(0, 70) + '…');

const vacio0 = informeVacio(datosDelFormulario());
Q.ponerFotos(cam, [await Q.foto(3000, 2000, 5)]);
await hasta(() => grid.children.length === 1 && grid.querySelector('img') && grid.querySelector('img').naturalWidth > 0, 30000);
const w2 = grid.querySelector('img').naturalWidth;
ok('2 · La hoja se guarda a 1600 px de lado (una foto de obra, a ' + MAX_FOTO_PX + '): es un documento y hay que poder leerlo', w2 === 1600 && MAX_FOTO_PX < 1600, w2 + ' px');
escribir(grid.querySelector('textarea'), 'Minuta con la contratista');
const d3 = datosDelFormulario();
ok('3 · Viaja en los datos, y con solo una minuta el informe ya no está vacío', vacio0 === true && (d3.fotosMinutas || []).length === 1 && d3.fotosMinutas[0].pie === 'Minuta con la contratista' && (d3.fotosDB.minutas || []).length === 1 && informeVacio(d3) === false,
   'hojas: ' + (d3.fotosMinutas || []).length + ' · vacío antes ' + vacio0 + ', después ' + informeVacio(d3));
const s4 = sobreDe(d3, '', d3.fotosDB), f4 = s4.fotos.filter(f => /^minutas-/.test(f.nombre));
ok('4 · En el sobre la hoja va como «minutas-1» entre las fotos, y en los datos queda solo su descripción', f4.length === 1 && f4[0].nombre === 'minutas-1' && /^data:image\/jpeg/.test(f4[0].dato) &&
   JSON.stringify(s4.datos.fotosMinutas) === '[{"pie":"Minuta con la contratista"}]', f4.map(f => f.nombre).join() + ' · ' + JSON.stringify(s4.datos.fotosMinutas));

for (let k = 1; k < 6; k++) { Q.ponerFotos(cam, [await Q.foto(320, 240, 10 + k)]); await hasta(() => grid.children.length === k + 1, 30000); }
Q.dialogos.length = 0;
Q.ponerFotos(cam, [await Q.foto(320, 240, 99)]); await esperar(700);
ok('5 · El tope es de 6 hojas por informe (aunque las fotos de sección sean ' + MAX_FOTOS_SECCION + '): la séptima no entra y lo avisa', grid.children.length === 6 && Q.dialogos.some(m => /Máximo 6 hojas de minuta/.test(m)), grid.children.length + ' hojas · ' + (Q.dialogos[0] || 'sin aviso').slice(0, 50));

Q.dialogos.length = 0;
await vistaPrevia();
await hasta(() => $('#vista-previa iframe') && $('#vista-previa iframe').contentDocument.body && $('#vista-previa iframe').contentDocument.body.innerText.length > 80, 20000); await esperar(500);
const doc = $('#vista-previa') ? $('#vista-previa iframe').contentDocument : null;
ok('6 · La vista previa trae el anexo «Minutas de campo (6)», con las seis hojas a 500 px y la descripción de la primera',
   !!doc && /ANEXO · MINUTAS DE CAMPO \(6\)/.test(doc.body.innerText) && doc.querySelectorAll('img[width="500"]').length === 6 && /Minuta 1 de 6 — Minuta con la contratista/.test(doc.body.innerText),
   doc ? doc.querySelectorAll('img[width="500"]').length + ' hojas en el anexo' : 'no abrió: ' + (Q.dialogos[0] || ''));
_vpCerrar();

const r9 = [...card.querySelectorAll('.btn-camara, .fotos .foto, input[type=file]')].map(e => e.getBoundingClientRect());
ok('9 · A ' + ancho + ' px la tarjeta cabe, el botón de cámara mide al menos 44 px y nada ensancha la página', r9.every(r => r.left >= 0 && r.right <= ancho + 1) && card.querySelector('.btn-camara').getBoundingClientRect().height >= 44 && document.documentElement.scrollWidth <= ancho + 1,
   'botón ' + Math.round(card.querySelector('.btn-camara').getBoundingClientRect().height) + ' px · scrollWidth ' + document.documentElement.scrollWidth + ' / ' + ancho);

await cabecera(0); contestar();
guardar(false); const id8 = idActual; await esperar(900);
await nuevo();
ok('7 · «Nuevo» deja el bloque de minutas vacío', $('#fotos-minutas').children.length === 0 && (datosDelFormulario().fotosMinutas || []).length === 0, $('#fotos-minutas').children.length + ' hojas');
cargarInforme(id8);
await hasta(() => $('#fotos-minutas').children.length === 6 && [...$('#fotos-minutas').querySelectorAll('img')].filter(i => /^data:image/.test(i.src)).length === 6, 20000);
const g8 = $('#fotos-minutas');
ok('8 · Guardado y reabierto, vuelven las seis hojas con su descripción (se corre en navegador: lee IndexedDB)', g8.children.length === 6 && [...g8.querySelectorAll('img')].filter(i => /^data:image/.test(i.src)).length === 6 && g8.querySelector('textarea').value === 'Minuta con la contratista',
   g8.children.length + ' hojas · con imagen ' + [...g8.querySelectorAll('img')].filter(i => /^data:image/.test(i.src)).length);
Q.aceptar = true; borrarInforme(id8); await nuevo();

// ── Varias torres ──
const lugares = opciones($('#torre')).length ? null : null;
await cabecera(0);
const t1 = $('#torre').value;
ponerModoDonde('varias'); await esperar(150);
const sel = $('#otra-lugar'), otra = opciones(sel).find(v => v !== t1);
Q.elegir(sel, otra); await esperar(200);
contestar();
const nro10 = numeroInforme();
guardar(false); const id10 = idActual; await esperar(300);
const e10 = estadosDeTorres();
ok('10 · Un informe de varias torres queda como «visita anterior» de la principal y también de la otra', !!otra && /\+1-/.test(nro10) && (e10[t1] || {}).nro === nro10 && (e10[otra] || {}).nro === nro10,
   nro10 + ' · ' + t1 + ': ' + ((e10[t1] || {}).nro || '—') + ' · ' + otra + ': ' + ((e10[otra] || {}).nro || '—'));
// Un informe propio de la otra torre, con fecha posterior, no debe quedar tapado por el compartido al volver a guardarlo.
const todos = estadosDeTorres(); todos[otra] = Object.assign({}, todos[otra], { id: 'propio', nro: 'PROPIO-DE-' + otra, fecha: '2099-01-01', guardado: '2099-01-01T00:00:00.000Z' });
localStorage.setItem(CLAVE_TORRES, JSON.stringify(todos));
escribir($('#obs_general'), 'Otra vuelta.'); guardar(false); await esperar(300);
ok('11 · Si esa otra torre ya tiene un informe propio más nuevo, el compartido no lo pisa', (estadosDeTorres()[otra] || {}).nro === 'PROPIO-DE-' + otra && (estadosDeTorres()[t1] || {}).nro === nro10, (estadosDeTorres()[otra] || {}).nro);
const lim = estadosDeTorres(); delete lim[otra]; delete lim[t1]; localStorage.setItem(CLAVE_TORRES, JSON.stringify(lim));
Q.aceptar = true; borrarInforme(id10); await nuevo();
