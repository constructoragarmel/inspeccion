// TANDA 19 · Urbanismo, 24-sep: Obras Preliminares como sección 1, camiones en
// «Bote de material», y las secciones que Gabriel agregó a mano se retiran.
// Arranca desde un teléfono como el de Gabriel: con «9. OBRAS PRELIMINARES» y
// «10. DEMALEZAMIENTO» recordadas, más una sección propia que debe quedarse.
if (!sessionStorage.getItem('t19')){
  localStorage.clear();
  localStorage.setItem('garmel_urb_secciones', JSON.stringify([
    { id: 'urb_x_obraspreliminares', nombre: '9. OBRAS PRELIMINARES', items: [] },
    { id: 'urb_x_demalezamiento', nombre: '10. DEMALEZAMIENTO', items: [] },
    { id: 'urb_x_gas', nombre: '11. GAS', items: [] }]));
  localStorage.setItem('garmel_urb_items', JSON.stringify({ urb_x_obraspreliminares: ['Desmalezamiento'], urb_x_gas: ['Tubería'] }));
  sessionStorage.setItem('t19', '1');
  location.reload();
  throw 'recargando: vuelva a correr t19';
}
sessionStorage.removeItem('t19');
Q.aceptar = true;
const items = sid => $$('#items-' + sid + ' .item');

// 1. contenido y retiro
ok('Obras Preliminares es la 1 y el resto corre un número', GENERAL.slice(0, 9).map(g => g.nombre).join('|') ===
   '1. OBRAS PRELIMINARES|2. DRENAJE|3. ESTRUCTURA|4. ACUEDUCTOS|5. ELECTRICIDAD|6. AGUAS SERVIDAS|7. VIALIDAD|8. CAMINERÍA|9. PAISAJISMO', GENERAL.map(g => g.nombre).join('|'));
ok('Sus tres partidas con unidad', items('urb_preliminares').map(i => i.querySelector('.nombre').textContent + ' ' + i.querySelector('.ud').textContent).join('|') ===
   'Desmalezamiento m²|Movimiento de tierra m³|Bote de material m³');
ok('Las secciones de Gabriel ya no están, ni en pantalla ni recordadas', !GENERAL.some(g => /^urb_x_(obras|dema)/.test(g.id)) &&
   !/obraspre|demalez/.test(localStorage.getItem('garmel_urb_secciones') + localStorage.getItem('garmel_urb_items')), localStorage.getItem('garmel_urb_secciones'));
ok('Una sección propia se queda y se renumera: «10. GAS»', GENERAL[9] && GENERAL[9].id === 'urb_x_gas' && GENERAL[9].nombre === '10. GAS', GENERAL[9] && GENERAL[9].nombre);
$('#ns-nombre').value = 'Obras preliminares'; agregarSeccion();
ok('Agregar a mano «Obras preliminares» se rechaza y remite a la 1', GENERAL.length === 10 && /sección 1/.test(Q.dialogos.join()), Q.dialogos.join(' / '));
ok('Solo «Bote de material» lleva camiones', $$('.camiones').length === 1 && items('urb_preliminares')[2].querySelector('.camiones'));

// 2. camiones
Q.elegir($('#convenio'), 'Convenio Bielorusos'); Q.elegir($('#torre'), 'M-2'); Q.elegir($('#inspectores select'), INSPECTORES_DB[1]);
plegar('urb_preliminares', true);
const bote = items('urb_preliminares')[2], cant = bote.querySelector('.cant'), btn = bote.querySelector('.camiones .btn-add');
Q.escribir(cant, '120');
ok('Sin camiones no se ve el acumulado anterior y el ejecutado se escribe', getComputedStyle(bote.querySelector('.cam-base')).display === 'none' && !cant.readOnly);
btn.click(); btn.click();
const f = bote.querySelectorAll('.camion');
Q.escribir(f[0].querySelector('.placa'), 'a12bc3d'); Q.escribir(f[0].querySelector('.m3'), '7'); Q.escribir(f[0].querySelector('.viajes'), '3');
Q.escribir(f[1].querySelector('.placa'), 'X99'); Q.escribir(f[1].querySelector('.m3'), '6,5');
ok('Ejecutado = anterior 120 + 7×3 + 6,5×1 = 147.5, y no se escribe a mano', cant.value === '147.5' && cant.readOnly, cant.value);
ok('Acumulado anterior tomado del ejecutado', bote.querySelector('.base').value === '120');
ok('Total de hoy', bote.querySelector('.cam-total').textContent === '2 camión(es) · 4 viaje(s) · 27.5 m³ hoy', bote.querySelector('.cam-total').textContent);
Q.escribir(f[1].querySelector('.viajes'), '2x');
ok('Viajes solo acepta dígitos', f[1].querySelector('.viajes').value === '2' && cant.value === '154', cant.value);
Q.escribir(bote.querySelector('.base'), '100');
ok('Corregir el acumulado anterior recalcula', cant.value === '134', cant.value);
ok('Cabe en 375 px', document.documentElement.scrollWidth <= innerWidth, document.documentElement.scrollWidth);
const d = datosDelFormulario();
const it = d.general[0].items.find(i => i.nombre === 'Bote de material');
ok('Viajan placa en mayúsculas, m³ con punto, viajes y el anterior', JSON.stringify(it.camiones) ===
   '[{"placa":"A12BC3D","m3":"7","viajes":"3"},{"placa":"X99","m3":"6.5","viajes":"2"}]' && it.base === '100' && it.cant === '134', JSON.stringify(it));
ok('Las otras partidas no llevan camiones', d.general.every(g => g.items.every(i => i === it || !('camiones' in i))));
guardar(false); const id = idActual;
nuevoInforme();
ok('Nuevo informe: sin camiones', $$('.camion').length === 0 && !items('urb_preliminares')[2].querySelector('.cant').readOnly);
cargarInforme(id);
const b2 = items('urb_preliminares')[2];
ok('Reabierto: camiones, anterior y ejecutado', b2.querySelectorAll('.camion').length === 2 && b2.querySelector('.cant').value === '134' && b2.querySelector('.base').value === '100' && b2.querySelector('.cant').readOnly);
b2.querySelectorAll('.quitar-cam')[1].click();
ok('Quitar uno resta lo suyo', b2.querySelector('.cant').value === '121' && b2.querySelectorAll('.cam-n')[0].textContent === 'Camión 1', b2.querySelector('.cant').value);
b2.querySelectorAll('.quitar-cam')[0].click();
ok('Sin camiones vuelve al anterior y se escribe otra vez', b2.querySelector('.cant').value === '100' && !b2.querySelector('.cant').readOnly);

// 3. informe viejo de Gabriel con datos en las secciones retiradas
nuevoInforme();
const lista = listaGuardada();
lista.push({ id: 'urb_viejo', tipo: 'urbanismo', nro: 'URB-EZ-M3-260923-GB', torre: 'M-3', convenio: 'Convenio Bielorusos', fecha: '2026-09-23', inspectores: [INSPECTORES_DB[1]], general: [
  { id: 'urb_drenaje', nombre: '1. DRENAJE', items: [{ nombre: 'Topografía', sn: 'B', cant: '10', ud: 'm' }], obs: '', fotos: [] },
  { id: 'urb_x_obraspreliminares', nombre: '9. OBRAS PRELIMINARES', items: [{ nombre: 'Desmalezamiento', agregado: true, cant: '500', sn: 'B', obs: 'lote norte' }, { nombre: 'Limpieza de sitio', agregado: true, cant: '3', sn: 'R' }], obs: 'nota prelim', fotos: [] },
  { id: 'urb_x_demalezamiento', nombre: '10. DEMALEZAMIENTO', items: [], obs: '', fotos: [] }], noInspeccionados: [], apartamentos: [] });
localStorage.setItem('garmel_urb_list', JSON.stringify(lista));
cargarInforme('urb_viejo');
const pre = items('urb_preliminares');
ok('Lo de «9. OBRAS PRELIMINARES» cae en la 1: Desmalezamiento en la fija', pre[0].querySelector('.cant').value === '500' && pre[0].querySelector('textarea').value === 'lote norte');
ok('Una partida propia pasa como agregada', pre.some(i => i.dataset.fijo === '0' && i.querySelector('.nombre-libre').value === 'Limpieza de sitio' && i.querySelector('.cant').value === '3'));
ok('La nota de la sección también pasa', $('#srv-urb_preliminares .obs-srv').value === 'nota prelim');
ok('Y la sección retirada no vuelve', GENERAL.length === 10 && !/obraspre/.test(localStorage.getItem('garmel_urb_secciones')));

// 4. visita siguiente: pasa el acumulado, no los camiones
nuevoInforme();
Q.elegir($('#convenio'), 'Convenio Bielorusos'); $('#torre').value = 'M-5';
const orig = estadosDeTorres;
estadosDeTorres = () => ({ 'M-5': { nro: 'URB-EZ-M5-260923-GB', general: [
  { id: 'urb_preliminares', nombre: '1. OBRAS PRELIMINARES', items: [{ nombre: 'Bote de material', cant: '147.5', ud: 'm³', sn: 'B', base: '120', camiones: [{ placa: 'A1', m3: '7', viajes: '3' }] }], obs: '' },
  { id: 'urb_x_demalezamiento', nombre: '10. DEMALEZAMIENTO', items: [{ nombre: 'Desmalezamiento', agregado: true, cant: '800', sn: 'B' }], obs: '', fotos: [] }] } });
try { traerHistorial(); } finally { estadosDeTorres = orig; }
const b3 = items('urb_preliminares')[2];
ok('Heredado: el acumulado 147.5, sin camiones', b3.querySelector('.cant').value === '147.5' && b3.querySelectorAll('.camion').length === 0 && b3.classList.contains('heredado'));
ok('Heredado de la sección retirada cae en la 1', items('urb_preliminares')[0].querySelector('.cant').value === '800' && GENERAL.length === 10);
b3.querySelector('.camiones .btn-add').click();
Q.escribir(b3.querySelector('.camion .m3'), '8'); Q.escribir(b3.querySelector('.camion .placa'), 'B2');
ok('Un camión sobre el heredado: 147.5 + 8, y deja de ser heredado', b3.querySelector('.cant').value === '155.5' && b3.querySelector('.base').value === '147.5' && !b3.classList.contains('heredado'), b3.querySelector('.cant').value);
nuevoInforme();
