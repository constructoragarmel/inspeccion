// TANDA 46 · Urbanismo, 1-oct-2026 (v104): memoria de camiones en «Bote de material».
// 1 la memoria sale del último informe de cada manzana · 2 una placa conocida llena sus m³ · 3 no pisa lo escrito
// 4 una placa nueva se recuerda en el teléfono · 5 placa repetida en la lista · 6 al traer lo anterior, botón y no filas
// 7 el botón trae los camiones sin viajes · 8 viajes de hoy y quitar uno · 9 el borrador conserva la lista de ayer
// 10 lo que viaja en el informe y cómo queda para la visita siguiente · 11 cabe en 375 px
// Corre sobre urbanismo.html?prueba=1.
if (!sessionStorage.getItem('t46')){
  localStorage.clear();
  localStorage.setItem('garmel_urb_torres', JSON.stringify({ 'M-2': { id: 'urb_ayer', nro: 'URB-EZ-M2-260930-GB', torre: 'M-2', convenio: 'Convenio Bielorusos',
    fecha: '2026-09-30', guardado: 1, inspectores: [], general: [{ id: 'urb_preliminares', items: [
      { nombre: 'Bote de material', cant: '109', ud: 'm³', base: '43', camiones: [{ placa: 'A58CI8D', m3: '16', viajes: '1' }, { placa: '2053', m3: '25', viajes: '2' }] }], obs: '', fotos: [] }],
    noInspeccionados: [], apartamentos: [] } }));
  sessionStorage.setItem('t46', '1');
  location.reload();
  throw 'recargando: vuelva a correr t46';
}
sessionStorage.removeItem('t46');
Q.aceptar = true;
const bote = () => $$('#items-urb_preliminares .item')[2];
const cambiar = (el, v) => { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); };
const fila = k => bote().querySelectorAll('.camion')[k];
const ayuda = k => fila(k).querySelector('.cam-ayuda').textContent;

// 1. la memoria
const m1 = camionesConocidos();
listaDePlacas();
ok('1 · La memoria sale del último informe de cada manzana: A58CI8D carga 16 m³ y 2053 carga 25; la lista de sugerencias las ofrece',
   m1.A58CI8D && m1.A58CI8D.m3 === '16' && m1['2053'].m3 === '25' && $$('#placas-conocidas option').map(o => o.value).join() === '2053,A58CI8D', JSON.stringify(m1));

// 2 a 5. en una manzana SIN visita anterior
Q.elegir($('#convenio'), 'Convenio Bielorusos'); Q.elegir($('#torre'), 'M-3'); Q.elegir($('#inspectores select'), INSPECTORES_DB[1]);
plegar('urb_preliminares', true);
const btn = () => bote().querySelector('.camiones .btn-add:not(.cam-ant)');
btn().click();
cambiar(fila(0).querySelector('.placa'), ' a58-ci8d ');
ok('2 · Al escribir una placa conocida (aunque sea en minúsculas y con guion) se llenan sus m³ y se avisa; la placa queda en mayúsculas',
   fila(0).querySelector('.m3').value === '16' && /última vez/.test(ayuda(0)) && fila(0).querySelector('.placa').value === 'A58-CI8D' && bote().querySelector('.cant').value === '16',
   fila(0).querySelector('.m3').value + ' m³ · «' + ayuda(0) + '» · ejecutado ' + bote().querySelector('.cant').value);
btn().click();
cambiar(fila(1).querySelector('.m3'), '20'); cambiar(fila(1).querySelector('.placa'), '2053');
ok('3 · Si los m³ ya estaban escritos no se pisan, y lo escrito pasa a ser lo que se recuerda de ese camión en este teléfono',
   fila(1).querySelector('.m3').value === '20' && ayuda(1) === '' && camionesConocidos()['2053'].m3 === '20', fila(1).querySelector('.m3').value + ' · memoria ' + camionesConocidos()['2053'].m3);
btn().click();
cambiar(fila(2).querySelector('.placa'), 'zz99x');
const sinDato = fila(2).querySelector('.m3').value === '' && ayuda(2) === '';
cambiar(fila(2).querySelector('.m3'), '8,5');
btn().click();
cambiar(fila(3).querySelector('.placa'), 'ZZ99X');
ok('4 · Una placa nueva no trae nada; al ponerle sus m³ se recuerda, pero repetida en la misma lista no se llena',
   sinDato && camionesConocidos().ZZ99X.m3 === '8.5' && fila(3).querySelector('.m3').value === '', 'memoria ' + JSON.stringify(camionesConocidos().ZZ99X));
ok('5 · Una placa que ya está en la lista de hoy avisa que está repetida', /ya está en esta lista/.test(ayuda(3)), ayuda(3));
ok('5b · En una manzana sin visita anterior no aparece el botón de traer camiones', getComputedStyle(bote().querySelector('.cam-ant')).display === 'none');

// 6 a 8. en la manzana que sí tiene visita anterior
nuevoInforme();
Q.elegir($('#convenio'), 'Convenio Bielorusos'); Q.elegir($('#torre'), 'M-2'); Q.elegir($('#inspectores select'), INSPECTORES_DB[1]);
await esperar(100);
const ofrecio = /ya tiene un informe anterior/.test($('#aviso-historial').textContent);
traerHistorial(); plegar('urb_preliminares', true);
const ant = () => bote().querySelector('.cam-ant');
ok('6 · Al traer lo anterior llega el acumulado (109) y NO los camiones; aparece el botón «Traer los 2 camiones de la visita anterior (sin viajes)»',
   ofrecio && bote().querySelector('.cant').value === '109' && bote().querySelectorAll('.camion').length === 0 &&
   getComputedStyle(ant()).display !== 'none' && /Traer los 2 camiones de la visita anterior \(sin viajes\)/.test(ant().textContent), ant().textContent);
ant().click();
const v7 = [0, 1].map(k => [fila(k).querySelector('.placa').value, fila(k).querySelector('.m3').value, fila(k).querySelector('.viajes').value].join('/')).join(' · ');
ok('7 · El botón pone los dos camiones con su placa y sus m³ y los viajes en blanco; el ejecutado sigue en 109 y el botón se esconde',
   v7 === 'A58CI8D/16/ · 2053/25/' && bote().querySelector('.cant').value === '109' && bote().querySelector('.base').value === '109' &&
   /2 camión\(es\) · 0 viaje\(s\) · 0 m³ hoy/.test(bote().querySelector('.cam-total').textContent) && getComputedStyle(ant()).display === 'none',
   v7 + ' · ' + bote().querySelector('.cam-total').textContent);
Q.escribir(fila(0).querySelector('.viajes'), '3');
const con3 = bote().querySelector('.cant').value;
fila(1).querySelector('.quitar-cam').click();
ok('8 · Con 3 viajes del primero el ejecutado pasa a 157; al quitar el segundo, el botón vuelve a ofrecerlo («el camión»)',
   con3 === '157' && bote().querySelectorAll('.camion').length === 1 && getComputedStyle(ant()).display !== 'none' && /Traer el camión de la visita anterior/.test(ant().textContent),
   con3 + ' · ' + ant().textContent);

// 9. el borrador
guardar(false); const id = idActual;
const guardado = datosDelFormulario().general[0].items.find(i => i.nombre === 'Bote de material');
nuevoInforme(); cargarInforme(id); plegar('urb_preliminares', true);
ok('9 · El borrador conserva el camión de hoy y la lista de ayer: reabierto, sigue en 157 y el botón sigue ofreciendo el que falta',
   JSON.stringify(guardado.camiones) === '[{"placa":"A58CI8D","m3":"16","viajes":"3"}]' && (guardado.camionesAntes || []).length === 2 &&
   bote().querySelector('.cant').value === '157' && bote().querySelectorAll('.camion').length === 1 && /Traer el camión/.test(ant().textContent) && getComputedStyle(ant()).display !== 'none',
   JSON.stringify(guardado.camiones) + ' · antes ' + (guardado.camionesAntes || []).length);

// 10. la visita siguiente parte de lo de hoy
ant().click(); Q.escribir(fila(1).querySelector('.viajes'), '1');
guardar(false);
const est = estadosDeTorres()['M-2'], itHoy = est.general[0].items.find(i => i.nombre === 'Bote de material');
nuevoInforme();
Q.elegir($('#convenio'), 'Convenio Bielorusos'); Q.elegir($('#torre'), 'M-2'); await esperar(100);
traerHistorial(); plegar('urb_preliminares', true);
ok('10 · Para la visita siguiente la manzana queda con el acumulado de hoy (182) y sus dos camiones; al traerla, el botón ofrece esos dos',
   est.id === id && itHoy.cant === '182' && itHoy.camiones.length === 2 && bote().querySelector('.cant').value === '182' && /Traer los 2 camiones/.test(ant().textContent),
   'estado ' + itHoy.cant + ' · ' + ant().textContent);

// 11. maqueta
ant().click();
ok('11 · Con el botón y los avisos a la vista, nada se sale a ' + innerWidth + ' px', document.documentElement.scrollWidth <= innerWidth, document.documentElement.scrollWidth + ' / ' + innerWidth);
