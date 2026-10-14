// TANDA 85 · Urbanismo, 14-oct-2026 (v163): camiones en las tres partidas de «Obras preliminares» y «Maquinaria que operó hoy».
// 1 dónde están · 2 solo Bote calcula · 3-4 en Desmalezamiento el camión es registro y no toca el ejecutado · 5 Bote sigue igual
// 6 lo que viaja · 7 el borrador conserva maquinaria y camiones · 8 al heredar la visita anterior no pasa la maquinaria ni los camiones
// 9 el envío lleva maquinaria y camiones · 10 cabe en 375 px. Corre sobre urbanismo.html?prueba=1.
localStorage.clear();
// el relevo falso guarda estado entre tandas (lento, caído, fallar): se deja como nuevo, o el envío espera para siempre
await Q.relevo({ borrar: true, tipos: ['inspeccion', 'servicios', 'sha', 'urbanismo'], caido: false, fallar: [], lento: 0 });
Q.aceptar = true;
const items = () => $$('#items-urb_preliminares .item');
const nom = it => (it.querySelector('.nombre') || {}).textContent || '';
const desm = () => items().find(i => /desmalez/i.test(nom(i))), mov = () => items().find(i => /movimiento/i.test(nom(i))), bote = () => items().find(i => /bote/i.test(nom(i)));
const cambiar = (el, v) => { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); };
const btn = it => it.querySelector('.camiones .btn-add:not(.cam-ant)');
Q.elegir($('#convenio'), 'Convenio Bielorusos'); Q.elegir($('#torre'), 'M-3'); Q.elegir($('#inspectores select'), INSPECTORES_DB[1]);
plegar('urb_preliminares', true);
ok('1 · Desmalezamiento, Movimiento de tierra y Bote de material tienen lista de camiones y cuadro de maquinaria, y ninguna otra partida los tiene',
   [desm(), mov(), bote()].every(i => i && i.querySelector('.camiones') && i.querySelector('.maquinaria')) && $$('.item .camiones').length === 3 && $$('.item .maquinaria').length === 3,
   $$('.item .camiones').length + ' listas · ' + $$('.item .maquinaria').length + ' cuadros');
ok('2 · Solo Bote calcula el ejecutado con los camiones; en las otras dos la lista es registro y lo dice',
   !bote().querySelector('.camiones').classList.contains('registro') && desm().querySelector('.camiones').classList.contains('registro') && mov().querySelector('.camiones').classList.contains('registro') &&
   /registro/.test(desm().querySelector('.cam-nota').textContent) && !bote().querySelector('.cam-nota'));
cambiar(desm().querySelector('.cant'), '1200');
btn(desm()).click(); let f = desm().querySelector('.camion'); cambiar(f.querySelector('.placa'), 'A58CI8D'); cambiar(f.querySelector('.m3'), '16'); cambiar(f.querySelector('.viajes'), '3');
ok('3 · En Desmalezamiento el camión no toca el ejecutado: sigue en 1200 y editable; el total cuenta 1 camión, 3 viajes y 48 m³ como registro',
   desm().querySelector('.cant').value === '1200' && !desm().querySelector('.cant').readOnly && /1 camión\(es\) · 3 viaje\(s\) · 48 m³ hoy \(registro\)/.test(desm().querySelector('.cam-total').textContent),
   desm().querySelector('.cant').value + ' · ' + desm().querySelector('.cam-total').textContent);
ok('4 · En Desmalezamiento no aparece «Acumulado anterior»', getComputedStyle(desm().querySelector('.cam-base')).display === 'none');
btn(bote()).click(); f = bote().querySelector('.camion'); cambiar(f.querySelector('.placa'), '2053'); cambiar(f.querySelector('.m3'), '25'); cambiar(f.querySelector('.viajes'), '2');
ok('5 · En Bote el camión sigue calculando: ejecutado 50 y casilla bloqueada', bote().querySelector('.cant').value === '50' && bote().querySelector('.cant').readOnly, bote().querySelector('.cant').value);
cambiar(mov().querySelector('.maquinaria'), 'Retroexcavadora CAT 320'); cambiar(mov().querySelector('.cant'), '300');
cambiar(desm().querySelector('.maquinaria'), 'Patrol');
const d6 = datosDelFormulario(), g6 = d6.general.find(x => x.id === 'urb_preliminares');
const iM = g6.items.find(i => /movimiento/i.test(i.nombre)), iD = g6.items.find(i => /desmalez/i.test(i.nombre)), iB = g6.items.find(i => /bote/i.test(i.nombre));
ok('6 · Lo que viaja: maquinaria en Movimiento y Desmalezamiento; en Desmalezamiento el ejecutado escrito a mano y el camión con sus viajes; Bote sin maquinaria',
   iM.maquinaria === 'Retroexcavadora CAT 320' && iD.maquinaria === 'Patrol' && iD.cant === '1200' && JSON.stringify(iD.camiones) === '[{"placa":"A58CI8D","m3":"16","viajes":"3"}]' && !('maquinaria' in iB) && iB.cant === '50',
   JSON.stringify({ mov: iM.maquinaria, desm: [iD.cant, iD.camiones, iD.maquinaria], bote: iB.cant }));
guardar(false); const id = idActual;
nuevoInforme(); cargarInforme(id); plegar('urb_preliminares', true);
ok('7 · Reabierto desde Informes, Desmalezamiento conserva 1200, su camión y «Patrol»; Movimiento conserva la retroexcavadora; Bote sigue en 50',
   desm().querySelector('.cant').value === '1200' && desm().querySelectorAll('.camion').length === 1 && desm().querySelector('.maquinaria').value === 'Patrol' &&
   mov().querySelector('.maquinaria').value === 'Retroexcavadora CAT 320' && bote().querySelector('.cant').value === '50',
   [desm().querySelector('.cant').value, desm().querySelector('.maquinaria').value, mov().querySelector('.maquinaria').value, bote().querySelector('.cant').value].join(' · '));
nuevoInforme();
Q.elegir($('#convenio'), 'Convenio Bielorusos'); Q.elegir($('#torre'), 'M-3'); Q.elegir($('#inspectores select'), INSPECTORES_DB[1]); await esperar(150);
traerHistorial(); plegar('urb_preliminares', true);
ok('8 · Al traer la visita anterior pasa el acumulado (1200 y 300) pero no la maquinaria ni los camiones: son del día',
   desm().querySelector('.cant').value === '1200' && mov().querySelector('.cant').value === '300' && desm().querySelector('.maquinaria').value === '' && mov().querySelector('.maquinaria').value === '' && desm().querySelectorAll('.camion').length === 0,
   [desm().querySelector('.cant').value, mov().querySelector('.cant').value, '«' + desm().querySelector('.maquinaria').value + '»', desm().querySelectorAll('.camion').length + ' camiones'].join(' · '));
nuevoInforme();   // guarda el heredado; se descarta para que viaje solo el informe de la prueba
try { localStorage.setItem(CLAVE_LISTA, JSON.stringify(listaGuardada().filter(x => x.id === id))); } catch (e) {}
cargarInforme(id);
localStorage.setItem('garmel_clave_envio', 'qc'); const antes = (await Q.envios()).length;
// El envío lee las fotos de IndexedDB, y en el Chrome sin ventana con tiempo virtual IndexedDB no resuelve (14-oct-2026):
// ahí el paso se salta y se dice; en un navegador de verdad se prueba de punta a punta.
const idbOk = await Promise.race([new Promise(r => { try { const q = indexedDB.open('garmel-sonda'); q.onsuccess = () => { q.result.close(); r(true); }; q.onerror = () => r(false); } catch (e) { r(false); } }), Q.esperar(3000).then(() => false)]);
if (!idbOk) ok('9 · (sin ventana: IndexedDB no resuelve y el envío no se prueba aquí; se prueba en un navegador de verdad)', true);
else {
  await enviar(); await esperar(300);
  const env = await Q.envios(), ult = env.slice(antes).find(e => JSON.stringify(e.datos || {}).indexOf('maquinaria') >= 0) || {}, gg = ((ult.datos || {}).general || []).find(x => x.id === 'urb_preliminares') || { items: [] };
  const eM = gg.items.find(i => /movimiento/i.test(i.nombre)) || {}, eD = gg.items.find(i => /desmalez/i.test(i.nombre)) || {};
  ok('9 · El envío al relevo lleva la maquinaria de las dos partidas y el camión de Desmalezamiento con sus viajes',
     env.length === antes + 1 && eM.maquinaria === 'Retroexcavadora CAT 320' && eD.maquinaria === 'Patrol' && (eD.camiones || []).length === 1 && eD.camiones[0].viajes === '3',
     JSON.stringify({ n: env.length - antes, mov: eM.maquinaria, desm: [eD.maquinaria, eD.camiones] }));
}
plegar('urb_preliminares', true);
const ancho = Math.max(innerWidth, document.documentElement.clientWidth) || 375;   // en una pestaña oculta el ancho es 0
ok('10 · Con las tres listas y los cuadros a la vista nada se sale a ' + ancho + ' px, y ningún control queda por debajo de 44 px',
   document.documentElement.scrollWidth <= ancho + 1 && Q.chicos().length === 0, document.documentElement.scrollWidth + ' / ' + ancho + ' · chicos ' + Q.chicos().join(' '));
