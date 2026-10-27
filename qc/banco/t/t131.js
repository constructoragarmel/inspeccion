// TANDA 131 · v188 (27-oct-2026): las partidas de urbanismo que pidió Gabriel Barrios por Diego Orta. Corre en urbanismo.html?prueba=1
// y se corre dos veces (la primera deja el teléfono con «Gas» y «Telecomunicaciones» agregadas a mano, y recarga).
// 1 «Demolición de pavimento» en Obras Preliminares, en m³ · 2 «Colchón de arena» en m³ en drenaje, acueductos, aguas servidas,
// telecomunicaciones y gas · 3 «10. TELECOMUNICACIONES» y «11. GAS» fijas, con sus cinco partidas y unidades · 4 las agregadas a
// mano en el teléfono se olvidan y no se duplican · 5 un informe viejo con «urb_x_gas» y «urb_x_telecomunicaciones» abre lo suyo en
// las fijas · 6 heredado de la visita anterior, también · 7 agregar «Gas» a mano se rechaza y remite a la fija · 8 se envía con las
// secciones fijas · 9 nada se sale a 375 px.
if (!sessionStorage.getItem('t131')){
  localStorage.clear();
  localStorage.setItem('garmel_urb_secciones', JSON.stringify([
    { id: 'urb_x_gas', nombre: '10. GAS', items: [] }, { id: 'urb_x_telecomunicaciones', nombre: '11. TELECOMUNICACIONES', items: [] }]));
  localStorage.setItem('garmel_urb_items', JSON.stringify({ urb_x_gas: ['Tubería'], urb_x_telecomunicaciones: ['Canalización'] }));
  sessionStorage.setItem('t131', '1');
  location.reload();
  throw 'recargando: vuelva a correr t131';
}
sessionStorage.removeItem('t131');
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc');
await Q.relevo({ caido: false, fallar: [], lento: 0, borrar: true });
Q.aceptar = true;
const items = sid => $$('#items-' + sid + ' .item');
const parts = sid => items(sid).map(i => (i.querySelector('.nombre') || {}).textContent + ' ' + (i.querySelector('.ud') || {}).textContent).join('|');
ok('1 · «Demolición de pavimento» en Obras Preliminares, en m³', /Demolición de pavimento m³/.test(parts('urb_preliminares')), parts('urb_preliminares'));
const conColchon = ['urb_drenaje', 'urb_acueductos', 'urb_aguas_servidas', 'urb_telecomunicaciones', 'urb_gas'];
ok('2 · «Colchón de arena» en m³ en los cinco tendidos', conColchon.every(s => /Colchón de arena m³/.test(parts(s))) && !/Colchón/.test(parts('urb_electricidad') + parts('urb_vialidad')), conColchon.map(s => s + ':' + /Colchón/.test(parts(s))).join(' '));
ok('3 · «10. TELECOMUNICACIONES» y «11. GAS» fijas, con sus partidas', GENERAL[9].id === 'urb_telecomunicaciones' && GENERAL[9].nombre === '10. TELECOMUNICACIONES' && GENERAL[10].id === 'urb_gas' && GENERAL[10].nombre === '11. GAS' &&
   parts('urb_telecomunicaciones') === 'Topografía m|Excavación m³|Canalización m|Tanquillas und|Colchón de arena m³' && parts('urb_gas') === 'Topografía m|Excavación m³|Canalización m|Casetas und|Colchón de arena m³',
   GENERAL.map(g => g.nombre).join('|') + ' · ' + parts('urb_gas'));
ok('4 · Las agregadas a mano se olvidan y no se duplican', GENERAL.length === 11 && !GENERAL.some(g => /^urb_x_/.test(g.id)) && !/urb_x_(gas|telecom)/.test(localStorage.getItem('garmel_urb_secciones') + localStorage.getItem('garmel_urb_items')),
   GENERAL.length + ' · ' + localStorage.getItem('garmel_urb_secciones'));
// 5 · informe viejo
nuevoInforme();
const lista = listaGuardada();
lista.push({ id: 'urb_viejo131', tipo: 'urbanismo', nro: 'URB-EZ-M3-261020-GB', torre: 'M-3', convenio: 'Convenio Bielorusos', fecha: '2026-10-20', inspectores: [INSPECTORES_DB[1]], general: [
  { id: 'urb_x_gas', nombre: '10. GAS', items: [{ nombre: 'Excavación', agregado: true, cant: '12', sn: 'B', obs: 'zanja gas' }, { nombre: 'Tubería', agregado: true, cant: '30', sn: 'B' }], obs: 'nota gas', fotos: [] },
  { id: 'urb_x_telecomunicaciones', nombre: '11. TELECOMUNICACIONES', items: [{ nombre: 'Canalización', agregado: true, cant: '40', sn: 'R' }], obs: '', fotos: [] }], noInspeccionados: [], apartamentos: [] });
localStorage.setItem('garmel_urb_list', JSON.stringify(lista));
cargarInforme('urb_viejo131');
const g5 = items('urb_gas'), t5 = items('urb_telecomunicaciones');
const fijo = (arr, n) => arr.find(i => (i.querySelector('.nombre') || {}).textContent === n);
ok('5 · Lo de «urb_x_gas» y «urb_x_telecomunicaciones» abre en las fijas', fijo(g5, 'Excavación').querySelector('.cant').value === '12' && fijo(g5, 'Excavación').querySelector('textarea').value === 'zanja gas' &&
   g5.some(i => i.dataset.fijo === '0' && i.querySelector('.nombre-libre').value === 'Tubería' && i.querySelector('.cant').value === '30') && $('#srv-urb_gas .obs-srv').value === 'nota gas' &&
   fijo(t5, 'Canalización').querySelector('.cant').value === '40' && GENERAL.length === 11, 'gas ' + g5.length + ' telecom ' + t5.length + ' · ' + GENERAL.length);
// 6 · heredado
nuevoInforme();
Q.elegir($('#convenio'), 'Convenio Bielorusos'); $('#torre').value = 'M-5';
const orig = estadosDeTorres;
estadosDeTorres = () => ({ 'M-5': { nro: 'URB-EZ-M5-261020-GB', general: [
  { id: 'urb_x_telecomunicaciones', nombre: '11. TELECOMUNICACIONES', items: [{ nombre: 'Tanquillas', agregado: true, cant: '4', sn: 'B' }], obs: '', fotos: [] }] } });
try { traerHistorial(); } finally { estadosDeTorres = orig; }
ok('6 · Heredado de la visita anterior: cae en la fija', fijo(items('urb_telecomunicaciones'), 'Tanquillas').querySelector('.cant').value === '4' && GENERAL.length === 11, GENERAL.length);
// 7 · agregar «Gas» a mano
nuevoInforme(); Q.dialogos.length = 0;
$('#ns-nombre').value = 'Gas'; agregarSeccion();
ok('7 · Agregar «Gas» a mano se rechaza y remite a la fija', GENERAL.length === 11 && /GAS ya es una secci.n fija/.test(Q.dialogos.join()), Q.dialogos.join(' / '));
// 8 · envío (sin el informe viejo de la 5 en la lista)
localStorage.setItem('garmel_urb_list', '[]'); nuevoInforme(); await esperar(200);
Q.elegir($('#convenio'), 'Convenio Bielorusos'); const tor = $('#torre'); tor.value = [...tor.options].map(o => o.value).filter(Boolean)[0]; tor.dispatchEvent(new Event('change', { bubbles: true }));
$('#fecha').value = (() => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); })();
await esperar(400); if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
const ins = document.querySelector('#inspectores select'); Q.elegir(ins, [...ins.options].map(o => o.value).filter(v => v && v !== 'OTRO')[0]);
const c8 = fijo(items('urb_gas'), 'Colchón de arena').querySelector('.cant'); Q.escribir(c8, '6');
guardar(false); await esperar(300); const d8 = listaGuardada()[0];
await enviarSolo(d8.id); await esperar(800);
const e8 = (await Q.envios()).filter(e => e.numero === d8.nro).slice(-1)[0] || {};
const gas8 = ((e8.datos || {}).general || []).find(g => g.id === 'urb_gas') || {};
ok('8 · Se envía con «urb_gas» y su colchón de arena', (gas8.items || []).some(i => i.nombre === 'Colchón de arena' && String(i.cant) === '6'), JSON.stringify(gas8).slice(0, 160));
ok('9 · Nada se sale a 375 px', document.documentElement.scrollWidth <= innerWidth + 1, document.documentElement.scrollWidth + ' > ' + innerWidth);
localStorage.setItem('garmel_urb_list', '[]');
