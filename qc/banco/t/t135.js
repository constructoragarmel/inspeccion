// TANDA 135 · v188 (27-oct-2026): urbanismo con lo del día y el acumulado automático. Pedido de Diego Orta con Gabriel Barrios.
// En urbanismo.html?prueba=1. 1 cada partida lleva «Hoy», «Anterior» y «Acumulado» (este no se escribe) · 2 «Bote de material»
// sigue con sus camiones y sin «Hoy» · 3 hoy 5 sin anterior → acumulado 5 · 4 la visita siguiente hereda el acumulado como
// anterior, con hoy vacío, y no queda «sin revisar» · 5 hoy 20 sobre 100 → 120 · 6 el dato lleva cant 120, hoy 20 y anterior 100 ·
// 7 un borrador viejo (solo cant) abre con su cantidad como anterior · 8 se envía con hoy y anterior · 9 el % de avance usa el
// acumulado · 10 cabe a 375 px.
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem('garmel_urb_list', '[]');
await Q.relevo({ caido: false, fallar: [], lento: 0, borrar: true });
Q.aceptar = true;
const items = sid => $$('#items-' + sid + ' .item');
const fijo = (sid, n) => items(sid).find(i => (i.querySelector('.nombre') || {}).textContent === n);
const v = (it, c) => it.querySelector(c).value;
nuevoInforme(); await esperar(300);
const exc = fijo('urb_drenaje', 'Excavación');
ok('1 · La partida lleva «Hoy», «Anterior» y «Acumulado», y el acumulado no se escribe', !!exc.querySelector('.hoy') && !!exc.querySelector('.ant') && exc.querySelector('.cant').readOnly && /Acumulado/.test(exc.innerText), exc.innerText.replace(/\s+/g, ' ').slice(0, 90));
const bote = fijo('urb_preliminares', 'Bote de material');
ok('2 · «Bote de material» sigue con camiones y sin «Hoy»', !bote.querySelector('.hoy') && !!bote.querySelector('.camiones') && !bote.querySelector('.cant').readOnly);
Q.escribir(exc.querySelector('.hoy'), '5');
ok('3 · Hoy 5 sin anterior → acumulado 5', v(exc, '.cant') === '5', v(exc, '.cant'));
// 4 · la visita siguiente
nuevoInforme(); Q.elegir($('#convenio'), 'Convenio Bielorusos'); $('#torre').value = 'M-5';
const orig = estadosDeTorres;
estadosDeTorres = () => ({ 'M-5': { nro: 'URB-EZ-M5-261026-GB', general: [
  { id: 'urb_drenaje', nombre: '2. DRENAJE', items: [{ nombre: 'Excavación', cant: '100', hoy: '30', anterior: '70', ud: 'm³' }], obs: '' }] } });
try { traerHistorial(); } finally { estadosDeTorres = orig; }
const e4 = fijo('urb_drenaje', 'Excavación');
ok('4 · Hereda el acumulado como anterior, hoy vacío, y no queda «sin revisar»', v(e4, '.ant') === '100' && v(e4, '.hoy') === '' && v(e4, '.cant') === '100' && e4.classList.contains('her-pr'), [v(e4, '.ant'), v(e4, '.hoy'), v(e4, '.cant'), e4.className].join(' · '));
Q.escribir(e4.querySelector('.hoy'), '20');
ok('5 · Hoy 20 sobre 100 → 120', v(e4, '.cant') === '120', v(e4, '.cant'));
const d6 = datosDelFormulario(), it6 = ((d6.general || []).find(g => g.id === 'urb_drenaje') || { items: [] }).items.find(i => i.nombre === 'Excavación') || {};
ok('6 · El dato lleva cant 120, hoy 20 y anterior 100', it6.cant === '120' && it6.hoy === '20' && it6.anterior === '100' && !it6.heredado, JSON.stringify(it6));
Q.escribir(e4.querySelector('.pr'), '240');
ok('9 · El % de avance usa el acumulado (120 de 240 = 50%)', /50%/.test(e4.querySelector('.avance').textContent), e4.querySelector('.avance').textContent);
// 7 · borrador viejo
nuevoInforme();
const lista = listaGuardada();
lista.push({ id: 'urb_viejo135', tipo: 'urbanismo', nro: 'URB-EZ-M3-261020-GB', torre: 'M-3', convenio: 'Convenio Bielorusos', fecha: '2026-10-20', inspectores: [INSPECTORES_DB[1]], general: [
  { id: 'urb_acueductos', nombre: '4. ACUEDUCTOS', items: [{ nombre: 'Topografía', cant: '50', sn: 'B', ud: 'm' }], obs: '', fotos: [] }], noInspeccionados: [], apartamentos: [] });
localStorage.setItem('garmel_urb_list', JSON.stringify(lista));
cargarInforme('urb_viejo135');
const t7 = fijo('urb_acueductos', 'Topografía');
ok('7 · Un borrador viejo abre con su cantidad como anterior', v(t7, '.ant') === '50' && v(t7, '.hoy') === '' && v(t7, '.cant') === '50', [v(t7, '.ant'), v(t7, '.hoy'), v(t7, '.cant')].join(' · '));
// 8 · envío
localStorage.setItem('garmel_urb_list', '[]'); nuevoInforme(); await esperar(200);
Q.elegir($('#convenio'), 'Convenio Bielorusos'); const tor = $('#torre'); tor.value = [...tor.options].map(o => o.value).filter(Boolean)[0]; tor.dispatchEvent(new Event('change', { bubbles: true }));
$('#fecha').value = (() => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); })();
await esperar(400); if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
const ins = document.querySelector('#inspectores select'); Q.elegir(ins, [...ins.options].map(o => o.value).filter(x => x && x !== 'OTRO')[0]);
const e8 = fijo('urb_drenaje', 'Excavación'); Q.escribir(e8.querySelector('.ant'), '40'); Q.escribir(e8.querySelector('.hoy'), '12');
guardar(false); await esperar(300); const d8 = listaGuardada()[0];
await enviarSolo(d8.id); await esperar(800);
const env = (await Q.envios()).filter(e => e.numero === d8.nro).slice(-1)[0] || {};
const i8 = (((env.datos || {}).general || []).find(g => g.id === 'urb_drenaje') || { items: [] }).items.find(i => i.nombre === 'Excavación') || {};
ok('8 · Se envía con hoy, anterior y el acumulado', i8.cant === '52' && i8.hoy === '12' && i8.anterior === '40', JSON.stringify(i8));
ok('10 · Cabe a 375 px', document.documentElement.scrollWidth <= innerWidth + 1, document.documentElement.scrollWidth + ' > ' + innerWidth);
nuevoInforme(); localStorage.setItem('garmel_urb_list', '[]');
