const EZ = TORRES_DATA[0].c; const conv = $('#convenio'), torre = $('#torre'); const items = sid => $$('#items-' + sid + ' .item');
Object.keys(localStorage).filter(k => /garmel_urb_/.test(k)).forEach(k => localStorage.removeItem(k));
const insp = () => Q.elegir($('#inspectores select'), INSPECTORES_DB[0]);
nuevoInforme(); insp(); Q.elegir(conv, EZ); Q.elegir(torre, 'M-2'); await esperar(50);
Q.escribir(items('urb_drenaje')[0].querySelector('.pr'), '100'); Q.escribir(items('urb_drenaje')[1].querySelector('.pr'), '200'); Q.escribir(items('urb_drenaje')[1].querySelector('.cant'), '20'); guardar(false);
nuevoInforme(); insp(); Q.elegir(torre, 'M-2'); await esperar(100); $('#aviso-historial .si').click(); await esperar(50);
const d = datosDelFormulario().general[1].items;
// v188 (27-oct-2026, commit 24d7b21): lo heredado es el «anterior», no «sin revisar»: la cantidad heredada tampoco lleva marca.
ok('Lo heredado viaja SIN marca: el proyectado (100) y la cantidad (20, que es el anterior desde la v188)', d[0].pr === '100' && d[0].heredado === '' && d[1].pr === '200' && d[1].cant === '20' && d[1].heredado === '', JSON.stringify(d.slice(0, 2).map(i => [i.pr, i.cant, i.heredado])));
ok('En pantalla el pr-only sigue como heredado+her-pr (se suelta al cambiar de manzana)', items('urb_drenaje')[0].classList.contains('her-pr'));
Q.elegir(torre, 'M-3'); await esperar(50);
ok('Cambiar a M-3 lo suelta todo', formularioEnBlanco() && items('urb_drenaje')[0].querySelector('.pr').value === '');
