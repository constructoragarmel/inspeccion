// TANDA 86 · Urbanismo, 14-oct-2026 (v163): diez rondas alrededor de camiones en tres partidas y «Maquinaria que operó hoy».
// 1 memoria de placas entre partidas · 2 visita anterior con camiones en Desmalezamiento · 3 un ítem con solo maquinaria o solo camiones
// es contenido · 4 un borrador de antes de la v163 abre igual · 5 cambiar la maquinaria de un informe enviado lo marca para reenviar
// 6 quitar todos los camiones en registro · 7 en registro los viajes no pisan la cantidad escrita · 8 maqueta cargada a 375 px
// 9 la vista previa (plantilla del PDF del relevo) imprime los camiones de Desmalezamiento · 10 la memoria de la manzana para la visita siguiente.
// Corre sobre urbanismo.html?prueba=1.
localStorage.clear();
await Q.relevo({ borrar: true, tipos: ['inspeccion', 'servicios', 'sha', 'urbanismo'], caido: false, fallar: [], lento: 0 });
Q.aceptar = true;
const items = () => $$('#items-urb_preliminares .item');
const nom = it => (it.querySelector('.nombre') || {}).textContent || '';
const desm = () => items().find(i => /desmalez/i.test(nom(i))), mov = () => items().find(i => /movimiento/i.test(nom(i))), bote = () => items().find(i => /bote/i.test(nom(i)));
const cambiar = (el, v) => { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); };
const btn = it => it.querySelector('.camiones .btn-add:not(.cam-ant)');
const ant = it => it.querySelector('.camiones .cam-ant');
const fila = (it, k) => it.querySelectorAll('.camion')[k];

// 1. la memoria de placas es una sola para las tres partidas
Q.elegir($('#convenio'), 'Convenio Bielorusos'); Q.elegir($('#torre'), 'M-3'); Q.elegir($('#inspectores select'), INSPECTORES_DB[1]);
plegar('urb_preliminares', true);
btn(desm()).click(); cambiar(fila(desm(), 0).querySelector('.placa'), 'AB123CD'); cambiar(fila(desm(), 0).querySelector('.m3'), '14');
btn(bote()).click(); cambiar(fila(bote(), 0).querySelector('.placa'), 'ab-123-cd');
ok('1 · Una placa anotada en Desmalezamiento (14 m³) se reconoce al escribirla en Bote: llena sus m³ y la lista de sugerencias la ofrece',
   fila(bote(), 0).querySelector('.m3').value === '14' && (camionesConocidos().AB123CD || {}).m3 === '14' && (listaDePlacas(), $$('#placas-conocidas option').some(o => clavePlaca(o.value) === 'AB123CD')),   // la memoria guarda la última grafía (AB-123-CD) y la clave normalizada
   fila(bote(), 0).querySelector('.m3').value + ' · ' + JSON.stringify(camionesConocidos().AB123CD));

// 2. la visita anterior de una manzana con camiones y maquinaria en Desmalezamiento
localStorage.setItem('garmel_urb_torres', JSON.stringify({ 'M-2': { id: 'urb_ayer', nro: 'URB-EZ-M2-261013-GB', torre: 'M-2', convenio: 'Convenio Bielorusos',
  fecha: '2026-10-13', guardado: 1, inspectores: [], general: [{ id: 'urb_preliminares', items: [
    { nombre: 'Desmalezamiento', cant: '900', ud: 'm²', maquinaria: 'Patrol', camiones: [{ placa: 'A58CI8D', m3: '16' }, { placa: '2053', m3: '25' }] },
    { nombre: 'Bote de material', cant: '109', ud: 'm³', base: '43', camiones: [{ placa: 'A58CI8D', m3: '16' }] }], obs: '', fotos: [] }],
  noInspeccionados: [], apartamentos: [] } }));
nuevoInforme();
Q.elegir($('#convenio'), 'Convenio Bielorusos'); Q.elegir($('#torre'), 'M-2'); Q.elegir($('#inspectores select'), INSPECTORES_DB[1]); await esperar(150);
traerHistorial(); plegar('urb_preliminares', true);
const ofrece2 = getComputedStyle(ant(desm())).display !== 'none' && /Traer los 2 camiones/.test(ant(desm()).textContent);
ant(desm()).click();
ok('2 · Al traer la visita anterior, Desmalezamiento hereda 900 (sin maquinaria), ofrece «Traer los 2 camiones»; al traerlos quedan sin viajes y el 900 sigue a mano',
   ofrece2 && desm().querySelector('.cant').value === '900' && desm().querySelector('.maquinaria').value === '' && desm().querySelectorAll('.camion').length === 2 &&
   fila(desm(), 1).querySelector('.viajes').value === '' && !desm().querySelector('.cant').readOnly && /2 camión\(es\) · 0 viaje\(s\) · 0 m³ hoy \(registro\)/.test(desm().querySelector('.cam-total').textContent),
   [desm().querySelector('.cant').value, '«' + desm().querySelector('.maquinaria').value + '»', desm().querySelectorAll('.camion').length + ' camiones', desm().querySelector('.cam-total').textContent].join(' · '));

// 3. un ítem con solo maquinaria, o solo camiones, es contenido: el informe se guarda y no cuenta como vacío
nuevoInforme(); Q.aceptar = false;   // «¿guardar lo que hay?» no aplica: se quiere partir de cero
Q.elegir($('#convenio'), 'Convenio Bielorusos'); Q.elegir($('#torre'), 'M-3'); Q.elegir($('#inspectores select'), INSPECTORES_DB[1]); await esperar(150);
if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
plegar('urb_preliminares', true);
cambiar(mov().querySelector('.maquinaria'), 'Retroexcavadora');
const d3 = datosDelFormulario(); const vacio3 = informeVacio(d3);
const antes3 = listaGuardada().length; guardar(false); const id3 = idActual;
const guardado3 = listaGuardada().find(x => x.id === id3);
ok('3 · Con solo «Retroexcavadora» en Movimiento de tierra el informe no está vacío, se guarda y la maquinaria queda en el borrador',
   !vacio3 && listaGuardada().length === antes3 + 1 && guardado3 && guardado3.general.find(g => g.id === 'urb_preliminares').items.find(i => /movimiento/i.test(i.nombre)).maquinaria === 'Retroexcavadora',
   'vacío ' + vacio3 + ' · guardados ' + listaGuardada().length);

// 4. un borrador de antes de la v163 (sin maquinaria, camiones solo en Bote) abre igual y Bote sigue calculando
const viejo = { id: 'urb_viejo', tipo: 'urbanismo', nro: 'URB-EZ-M4-261010-GB', torre: 'M-4', convenio: 'Convenio Bielorusos', empresa: '', residente: '', fecha: '2026-10-10', estatus: 'En progreso',
  inspectores: [INSPECTORES_DB[1]], obs_general: 'de la v162', actividades: '', guardado: '10/10/2026', general: [{ id: 'urb_preliminares', obs: '', fotos: [], items: [
    { nombre: 'Desmalezamiento', cant: '500', ud: 'm²' }, { nombre: 'Movimiento de tierra', cant: '', ud: 'm³' },
    { nombre: 'Bote de material', cant: '157', ud: 'm³', base: '109', camiones: [{ placa: 'A58CI8D', m3: '16', viajes: '3' }] }] }], noInspeccionados: [], apartamentos: [] };
localStorage.setItem('garmel_urb_list', JSON.stringify([viejo].concat(listaGuardada())));
nuevoInforme(); cargarInforme('urb_viejo'); plegar('urb_preliminares', true);
ok('4 · El borrador viejo abre: Desmalezamiento 500 sin camiones y con maquinaria en blanco; Bote 157 bloqueado con su camión; ningún error en consola',
   desm().querySelector('.cant').value === '500' && desm().querySelectorAll('.camion').length === 0 && desm().querySelector('.maquinaria').value === '' &&
   bote().querySelector('.cant').value === '157' && bote().querySelector('.cant').readOnly && bote().querySelectorAll('.camion').length === 1 && !Q.R.some(r => /pageerror/.test(r.n)),
   [desm().querySelector('.cant').value, bote().querySelector('.cant').value, bote().querySelectorAll('.camion').length + ' camión'].join(' · '));

// 5. cambiar la maquinaria de un informe ya enviado lo deja marcado para reenviar
cargarInforme(id3); guardar(false); marcarEnviado(id3, listaGuardada().find(x => x.id === id3).nro);
nuevoInforme(); cargarInforme(id3); plegar('urb_preliminares', true);
cambiar(mov().querySelector('.maquinaria'), 'Retroexcavadora y patrol'); guardar(false);
const g5 = listaGuardada().find(x => x.id === id3);
ok('5 · Enviado y luego cambiada la maquinaria: queda «editado después» y pide reenvío', !!g5.enviado && !!g5.editadoTras, JSON.stringify({ enviado: g5.enviado, editadoTras: g5.editadoTras }));

// 6 y 7. registro: quitar todos los camiones, y los viajes no pisan la cantidad escrita
nuevoInforme(); Q.elegir($('#convenio'), 'Convenio Bielorusos'); Q.elegir($('#torre'), 'M-5'); Q.elegir($('#inspectores select'), INSPECTORES_DB[1]); await esperar(150);
if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
plegar('urb_preliminares', true);
cambiar(desm().querySelector('.cant'), '1200');
btn(desm()).click(); cambiar(fila(desm(), 0).querySelector('.placa'), 'ZZ11A'); cambiar(fila(desm(), 0).querySelector('.m3'), '10'); cambiar(fila(desm(), 0).querySelector('.viajes'), '4');
cambiar(desm().querySelector('.cant'), '1350'); cambiar(fila(desm(), 0).querySelector('.viajes'), '5');
ok('7 · En Desmalezamiento, escribir 1350 después de anotar el camión y luego cambiar los viajes deja 1350: los viajes no pisan la cantidad',
   desm().querySelector('.cant').value === '1350' && /5 viaje/.test(desm().querySelector('.cam-total').textContent), desm().querySelector('.cant').value + ' · ' + desm().querySelector('.cam-total').textContent);
Q.aceptar = true; fila(desm(), 0).querySelector('.quitar-cam').click();
ok('6 · Al quitar el único camión de Desmalezamiento la cantidad sigue en 1350 y editable, y el total se vacía',
   desm().querySelectorAll('.camion').length === 0 && desm().querySelector('.cant').value === '1350' && !desm().querySelector('.cant').readOnly && desm().querySelector('.cam-total').textContent === '',
   desm().querySelector('.cant').value);

// 8. maqueta cargada: dos camiones y maquinaria en las tres partidas
[desm(), mov(), bote()].forEach((it, k) => { btn(it).click(); btn(it).click(); cambiar(fila(it, 0).querySelector('.placa'), 'AB123CD'); cambiar(fila(it, 1).querySelector('.placa'), 'ZZ99X'); cambiar(fila(it, 1).querySelector('.m3'), '8'); cambiar(it.querySelector('.maquinaria'), 'Retroexcavadora CAT 320 y vibrocompactador'); });
const ancho = Math.max(innerWidth, document.documentElement.clientWidth) || 375;
ok('8 · Con dos camiones y maquinaria en las tres partidas nada se sale a ' + ancho + ' px, ningún control baja de 44 px, y «Acumulado anterior» solo se ve en Bote',
   document.documentElement.scrollWidth <= ancho + 1 && Q.chicos().length === 0 && getComputedStyle(bote().querySelector('.cam-base')).display !== 'none' && getComputedStyle(desm().querySelector('.cam-base')).display === 'none' && getComputedStyle(mov().querySelector('.cam-base')).display === 'none',
   document.documentElement.scrollWidth + ' / ' + ancho + ' · chicos ' + Q.chicos().join(' '));

// 9. la vista previa usa la plantilla del PDF del relevo: los camiones de Desmalezamiento salen bajo su partida
cambiar(desm().querySelector('.cant'), '1350');
let html9 = '';
try { await _vpCargar(); html9 = VistaPrevia.html(sobreDe(datosDelFormulario(), '', {})); } catch (e) { html9 = 'ERROR ' + e; }
const iDesm = html9.indexOf('Desmalezamiento'), iCam = html9.indexOf('Camiones:', iDesm), iMov = html9.indexOf('Movimiento de tierra', iDesm);
ok('9 · La vista previa imprime «Camiones: …» bajo Desmalezamiento (antes de Movimiento de tierra), con AB123CD y ZZ99X; la maquinaria todavía no sale (relevo r61 pendiente)',
   iDesm >= 0 && iCam > iDesm && (iMov < 0 || iCam < iMov) && /AB123CD/.test(html9.slice(iDesm, iMov > 0 ? iMov : undefined)) && /ZZ99X/.test(html9.slice(iDesm, iMov > 0 ? iMov : undefined)),
   html9.slice(0, 7) === 'ERROR ' ? html9.slice(0, 200) : 'Desmalezamiento@' + iDesm + ' Camiones@' + iCam + ' Movimiento@' + iMov);

// 10. la memoria de la manzana para la visita siguiente
guardar(false);
const est = estadosDeTorres()['M-5'], itD = est.general.find(g => g.id === 'urb_preliminares').items.find(i => /desmalez/i.test(i.nombre));
ok('10 · Guardado, la manzana M-5 recuerda para la visita siguiente los dos camiones de Desmalezamiento (placa y m³, sin viajes) y su cantidad, y no arrastra la maquinaria',
   itD.cant === '1350' && itD.camiones.length === 2 && itD.camiones[0].placa === 'AB123CD' && itD.camiones[1].m3 === '8' && !('viajes' in itD.camiones[0]) && !itD.maquinaria,
   JSON.stringify({ cant: itD.cant, camiones: itD.camiones, maquinaria: itD.maquinaria }));
