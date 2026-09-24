// TANDA 20 · Estrés de lo del 24-sep (v89): Obras Preliminares, camiones y
// secciones retiradas. Diez QC; el 6 sigue en t20b (tras recargar) y el 10 es
// del PDF (qc/banco/pdf, `t20pdf.js`). Arranca en un teléfono limpio con clave.
Object.keys(localStorage).filter(k => /garmel_urb_/.test(k)).forEach(k => localStorage.removeItem(k));
localStorage.setItem('garmel_clave_envio', 'clave-falsa');
nuevoInforme();
const EZ = 'Convenio Bielorusos';
const items = sid => $$('#items-' + sid + ' .item');
const bote = () => items('urb_preliminares')[2];
const cant = () => bote().querySelector('.cant');
const nuevoCamion = (placa, m3, viajes) => {
  bote().querySelector('.camiones .btn-add').click();
  const f = [...bote().querySelectorAll('.camion')].pop();
  if (placa != null) Q.escribir(f.querySelector('.placa'), placa);
  if (m3 != null) Q.escribir(f.querySelector('.m3'), m3);
  if (viajes != null) Q.escribir(f.querySelector('.viajes'), viajes);
  return f;
};
const cabecera = (m) => { Q.elegir($('#convenio'), EZ); Q.elegir($('#torre'), m); if ($('#aviso-historial .no')) $('#aviso-historial .no').click(); Q.elegir($('#inspectores select'), INSPECTORES_DB[1]); };
const itemBote = d => d.general.find(g => g.id === 'urb_preliminares').items.find(i => i.nombre === 'Bote de material');

// ── QC1 · 30 camiones en una partida ──────────────────────────────────────
cabecera('M-2'); plegar('urb_preliminares', true);
Q.escribir(cant(), '1000');
let t0 = performance.now();
for (let i = 1; i <= 30; i++) nuevoCamion('P' + i, String(i / 10), String(i % 4 + 1));
const ms30 = Math.round(performance.now() - t0);
let esperado = 0; for (let i = 1; i <= 30; i++) esperado += (i / 10) * (i % 4 + 1);
esperado = Math.round((1000 + esperado) * 100) / 100;
ok('QC1 · 30 camiones: ejecutado = 1000 + Σ m³×viajes, redondeado a 2 decimales', cant().value === String(esperado), cant().value + ' vs ' + esperado);
ok('QC1 · numerados Camión 1…30 sin saltos', $$('.cam-n').map(x => x.textContent).join() === Array.from({ length: 30 }, (_, i) => 'Camión ' + (i + 1)).join());
ok('QC1 · agregarlos tarda < 1,5 s (' + ms30 + ' ms)', ms30 < 1500, ms30);
ok('QC1 · sigue cabiendo en el ancho', document.documentElement.scrollWidth <= innerWidth + 1, document.documentElement.scrollWidth + ' / ' + innerWidth);
guardar(false); let id1 = idActual;
nuevoInforme(); cargarInforme(id1);
ok('QC1 · guardado y reabierto: 30 camiones y el mismo ejecutado', bote().querySelectorAll('.camion').length === 30 && cant().value === String(esperado), bote().querySelectorAll('.camion').length + ' · ' + cant().value);
const bytes = JSON.stringify(listaGuardada().find(x => x.id === id1)).length;
ok('QC1 · el informe con 30 camiones pesa poco (' + bytes + ' B)', bytes < 20000, bytes);

// ── QC2 · valores raros en placa, m³ y viajes ─────────────────────────────
nuevoInforme(); cabecera('M-3'); plegar('urb_preliminares', true);
const f1 = nuevoCamion('<img src=x onerror="window.__xss=1">', '7,5,3', '0');
ok('QC2 · m³ «7,5,3» → 7.53 (una sola coma decimal)', f1.querySelector('.m3').value === '7.53', f1.querySelector('.m3').value);
ok('QC2 · 0 viajes no suma', cant().value === '', JSON.stringify(cant().value));
Q.escribir(f1.querySelector('.viajes'), '-3e2'); ok('QC2 · viajes «-3e2» → «32» (solo dígitos)', f1.querySelector('.viajes').value === '32', f1.querySelector('.viajes').value);
Q.escribir(f1.querySelector('.viajes'), '');
ok('QC2 · viajes vacío cuenta 0, no NaN', cant().value === '' && !/NaN/.test(bote().querySelector('.cam-total').textContent), bote().querySelector('.cam-total').textContent);
const f2 = nuevoCamion('ÑANDÚ 🚚 "12" \'x\'', 'abc', '1');
ok('QC2 · m³ «abc» se vacía', f2.querySelector('.m3').value === '');
const f3 = nuevoCamion('A', '0.1', '1'); const f4 = nuevoCamion('B', '0.2', '1');
ok('QC2 · 0.1 + 0.2 = 0.3 (sin 0.30000000000000004)', cant().value === '0.3', cant().value);
const f5 = nuevoCamion('GRANDE', '999999999', '999');
ok('QC2 · 999999999 × 999 no se rompe', cant().value === String(Math.round((0.3 + 999999999 * 999) * 100) / 100), cant().value);
ok('QC2 · el <img onerror> de la placa no se ejecutó', !window.__xss && !bote().querySelector('img'));
let d = datosDelFormulario(); let ib = itemBote(d);
ok('QC2 · la placa viaja en mayúsculas, con emoji y comillas intactas', ib.camiones.some(c => c.placa === 'ÑANDÚ 🚚 "12" \'X\''), JSON.stringify(ib.camiones.map(c => c.placa)));
guardar(false); const id2 = idActual; nuevoInforme(); cargarInforme(id2);
ok('QC2 · reabierto: comillas y <img> en la placa siguen como texto', [...bote().querySelectorAll('.placa')].map(x => x.value).join('|') === ib.camiones.map(c => c.placa).join('|') && !window.__xss, [...bote().querySelectorAll('.placa')].map(x => x.value).join('|'));

// ── QC3 · el acumulado anterior y quitar camiones ─────────────────────────
nuevoInforme(); cabecera('M-4'); plegar('urb_preliminares', true);
nuevoCamion('X', '5', '2');
ok('QC3 · sin ejecutado previo: anterior vacío y ejecutado = lo de hoy (10)', bote().querySelector('.base').value === '' && cant().value === '10', cant().value);
Q.escribir(bote().querySelector('.base'), '3,25'); ok('QC3 · anterior «3,25» → 13.25', cant().value === '13.25', cant().value);
Q.escribir(bote().querySelector('.base'), 'xyz'); ok('QC3 · anterior basura se vacía y queda lo de hoy', bote().querySelector('.base').value === '' && cant().value === '10', cant().value);
Q.escribir(bote().querySelector('.base'), '50');
Q.aceptar = false; bote().querySelector('.quitar-cam').click(); Q.aceptar = true;
ok('QC3 · Cancelar al quitar un camión con datos: no se quita', bote().querySelectorAll('.camion').length === 1 && cant().value === '60');
const vacio = nuevoCamion(null, null, null); Q.dialogos = [];
vacio.querySelector('.quitar-cam').click();
ok('QC3 · un camión vacío se quita sin preguntar', Q.dialogos.length === 0 && bote().querySelectorAll('.camion').length === 1);
bote().querySelector('.quitar-cam').click();
ok('QC3 · sin camiones: vuelve al anterior (50) y se puede escribir', cant().value === '50' && !cant().readOnly);
Q.escribir(cant(), '70'); nuevoCamion('Y', '1', '1');
ok('QC3 · al volver a agregar, el anterior es lo que había (70) → 71', bote().querySelector('.base').value === '70' && cant().value === '71', cant().value);
d = datosDelFormulario(); ib = itemBote(d);
nuevoCamion(null, null, '5');
ok('QC3 · un camión solo con viajes no viaja en los datos', itemBote(datosDelFormulario()).camiones.length === 1);

// ── QC4 · heredado, cambiar de manzana y «Sig. manzana» ───────────────────
nuevoInforme(); cabecera('M-5'); plegar('urb_preliminares', true);
nuevoCamion('H1', '4', '1'); Q.escribir(bote().querySelector('.base'), '96');
Q.elegir($('#torre'), 'M-6'); if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
ok('QC4 · cambiar de manzana con camiones de hoy: se conservan', bote().querySelectorAll('.camion').length === 1 && cant().value === '100', cant().value);
Q.dialogos = []; siguienteTorre();
ok('QC4 · «Sig. manzana» no arrastra camiones a la siguiente', $$('.camion').length === 0 && cant().value === '' && !cant().readOnly, Q.dialogos.join(' / '));
const orig = estadosDeTorres;
estadosDeTorres = () => ({ 'M-6': { nro: 'URB-EZ-M6-260923-GB', general: [{ id: 'urb_preliminares', nombre: '1. OBRAS PRELIMINARES', items: [{ nombre: 'Bote de material', cant: '100', ud: 'm³', sn: 'B', base: '96', camiones: [{ placa: 'H1', m3: '4', viajes: '1' }] }], obs: '' }] } });
Q.elegir($('#torre'), 'M-6'); try { traerHistorial(); } finally { estadosDeTorres = orig; }
ok('QC4 · heredado: 100 en amarillo, sin camiones', cant().value === '100' && bote().classList.contains('heredado') && !bote().querySelector('.camion'));
Q.elegir($('#torre'), 'M-4');
ok('QC4 · cambiar de manzana con solo lo heredado lo suelta todo', cant().value === '' && !bote().classList.contains('heredado') && !cant().readOnly, cant().value);

// ── QC5 · envío al relevo falso ───────────────────────────────────────────
nuevoInforme(); cabecera('M-1 L1'); plegar('urb_preliminares', true);
Q.escribir(items('urb_preliminares')[0].querySelector('.cant'), '250');
nuevoCamion('ENV1', '8', '2'); nuevoCamion('', '', '3');
guardar(false);
await Q.relevo({ borrar: true, tipos: ['inspeccion', 'servicios', 'sha', 'urbanismo'] });
Q.dialogos = []; await enviarSolo(idActual); await hasta(() => !_tandaEnCurso && !$('#cartel-envio'), 20000); await esperar(300);
const env = (await Q.envios()).slice(-1)[0];
const eb = env && itemBote(env.datos);
ok('QC5 · el relevo recibe los camiones y el acumulado', eb && eb.cant === '16' && JSON.stringify(eb.camiones) === '[{"placa":"ENV1","m3":"8","viajes":"2"}]' && eb.base === '', env ? JSON.stringify(eb) : Q.dialogos.join(' / '));
ok('QC5 · Obras Preliminares va primera en el sobre', env && env.datos.general[0].id === 'urb_preliminares' && env.datos.general[0].nombre === '1. OBRAS PRELIMINARES');
ok('QC5 · las otras partidas no llevan claves de camiones', env && env.datos.general.every(g => g.items.every(i => i === eb || (!('camiones' in i) && !('base' in i)))));

// ── QC7 · secciones retiradas: variantes y datos rotos ────────────────────
const ret = ['urb_x_obraspreliminares', 'urb_x_obraspreliminar', 'urb_x_demalezamiento', 'urb_x_desmalezamiento', 'urb_x_desmalezado', 'urb_x_preliminares', 'URB_X_OBRASPRELIMINARES'];
ok('QC7 · todas las variantes de Gabriel se reconocen', ret.every(id => RETIRADA.test(id)), ret.filter(id => !RETIRADA.test(id)).join());
const legit = ['urb_x_gas', 'urb_x_telecomunicaciones', 'urb_x_movimientodetierra', 'urb_x_controldemalezas', 'urb_x_obraspreliminaresdevialidad', 'urb_x_malezas', 'urb_x_obraspreliminaresfase2'];
ok('QC7 · el patrón no se lleva secciones legítimas (malezas, preliminares de vialidad…)', !legit.some(id => RETIRADA.test(id)), legit.filter(id => RETIRADA.test(id)).join(', ') || 'ninguna');
const n0 = GENERAL.length;
const lista = listaGuardada();
lista.push({ id: 'urb_ret_fotos', tipo: 'urbanismo', nro: 'URB-EZ-M3-260923-GB', torre: 'M-3', convenio: EZ, fecha: '2026-09-23', inspectores: [INSPECTORES_DB[1]], noInspeccionados: ['urb_x_demalezamiento'], apartamentos: [], general: [
  { id: 'urb_x_obraspreliminares', nombre: '9. OBRAS PRELIMINARES', items: [{ nombre: 'Bote de material', agregado: true, cant: '12', sn: 'R' }], obs: '', fotos: [{ pie: 'con foto', enDrive: true }] },
  { id: 'urb_x_demalezamiento', nombre: '10. DEMALEZAMIENTO', items: [{ nombre: 'Desmalezamiento', agregado: true, cant: '9' }], obs: '', fotos: [] }] });
localStorage.setItem('garmel_urb_list', JSON.stringify(lista));
nuevoInforme(); cargarInforme('urb_ret_fotos');
ok('QC7 · retirada CON fotos se muestra (no se pierden) pero no se recuerda', GENERAL.some(g => g.id === 'urb_x_obraspreliminares') && !/obraspre/.test(localStorage.getItem('garmel_urb_secciones') || ''), GENERAL.map(g => g.id).slice(9).join());
ok('QC7 · retirada sin fotos, marcada NO INSPECCIONADO: su dato cae en la 1 y no rompe', items('urb_preliminares')[0].querySelector('.cant').value === '9', items('urb_preliminares')[0].querySelector('.cant').value);
ok('QC7 · «Bote de material» agregado en la retirada con fotos se queda allí, no en la fija', cant().value === '');
localStorage.setItem('garmel_urb_secciones', '{"no":"es lista"}');
let err = null; try { cargarSeccionesRecordadas(); } catch (e) { err = e.message; }
ok('QC7 · memoria de secciones que no es lista: no rompe el arranque', !err, err || 'no rompe');
localStorage.setItem('garmel_urb_manzanas', '{"t":1}'); err = null; try { manzanasRecordadas().forEach(() => {}); } catch (e) { err = e.message; }
ok('QC7 · memoria de manzanas que no es lista: tampoco', !err, err || 'no rompe'); localStorage.removeItem('garmel_urb_manzanas');
localStorage.removeItem('garmel_urb_secciones');

// ── QC8 · numeración con muchas secciones ─────────────────────────────────
nuevoInforme();
while (GENERAL.length > 9) GENERAL.pop();
for (let i = 1; i <= 15; i++){ $('#ns-nombre').value = 'Sección ' + i; agregarSeccion(); }
ok('QC8 · 15 agregadas: numeradas 10…24 en orden', GENERAL.slice(9).map(g => g.nombre).join('|') === Array.from({ length: 15 }, (_, i) => (i + 10) + '. SECCIÓN ' + (i + 1)).join('|'), GENERAL.slice(9, 12).map(g => g.nombre).join('|'));
const rec = JSON.parse(localStorage.getItem('garmel_urb_secciones'));
ok('QC8 · recordadas las 15, ninguna retirada', rec.length === 15 && !rec.some(s => RETIRADA.test(s.id)));
Q.dialogos = []; $('#ns-nombre').value = 'Desmalezamiento'; agregarSeccion();
ok('QC8 · «Desmalezamiento» como sección nueva se rechaza', GENERAL.length === 24 && /sección 1/.test(Q.dialogos.join()), Q.dialogos.join());
while (GENERAL.length > 9) GENERAL.pop(); localStorage.removeItem('garmel_urb_secciones'); pintarGeneral();

// ── QC9 · Planificación con camiones ──────────────────────────────────────
nuevoInforme(); cabecera('M-5'); plegar('urb_preliminares', true);
alternarPlanificacion(true);
Q.escribir(bote().querySelector('.pr'), '200');
nuevoCamion('PL', '10', '5');
ok('QC9 · % de avance con camiones: 50 de 200 = 25%', bote().querySelector('.avance').textContent === '25%', bote().querySelector('.avance').textContent);
Q.escribir(bote().querySelector('.base'), '150');
ok('QC9 · subir el anterior mueve el avance: 200 de 200 = 100%', bote().querySelector('.avance').textContent === '100%', bote().querySelector('.avance').textContent);
bote().querySelector('.quitar-cam').click();
ok('QC9 · quitar el camión: 150 de 200 = 75%', bote().querySelector('.avance').textContent === '75%', bote().querySelector('.avance').textContent);
alternarPlanificacion(false);

// ── QC6 · recarga en medio del trabajo (sigue en t20b) ────────────────────
nuevoInforme(); cabecera('M-6'); plegar('urb_preliminares', true);
Q.escribir(cant(), '40'); nuevoCamion('REC', '3', '4');
await esperar(2600);
ok('QC6 · autoguardado a los 2 s con camiones', !sucio && itemBote(listaGuardada().find(x => x.id === idActual)).camiones.length === 1);
localStorage.setItem('__qc20', JSON.stringify(Q.R));
