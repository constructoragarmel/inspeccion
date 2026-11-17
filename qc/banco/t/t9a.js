// TANDA 9a · autoguardado, visibilidad, preparar estados para recargas
// 17-nov-2026, al día con lo que se cambió a propósito después:
// · la tanda pone su clave de envío (sin ella el relevo no contesta el historial de M-6; antes la heredaba de otra corrida);
// · desde la v188 (27-oct) Gas y Telecomunicaciones son secciones fijas: lo de «urb_x_telecom» y «urb_x_gas» pasa a ellas, no se
//   crea una sección aparte ni se recuerda (ABSORBIDAS). Al abrir ese informe la carga de fotos reventaba (unhandledrejection,
//   «innerHTML» de null) y no pintaba Minutas ni apartamentos: arreglado en construir-servicios.py el 17-nov;
// · desde la v167 (14-oct) el residente lo propone la lista de Planificación (Ezequiel Zamora → Ing. Paola Saa), y lo de la
//   visita anterior solo llena el residente si está vacío.
localStorage.setItem('garmel_clave_envio', 'qc');
const EZ = TORRES_DATA[0].c; const conv = $('#convenio'), torre = $('#torre');
const items = sid => $$('#items-' + sid + ' .item');
Object.keys(localStorage).filter(k => /garmel_urb_/.test(k)).forEach(k => localStorage.removeItem(k));
await Q.relevo({ borrar: true, tipos: ['inspeccion', 'servicios', 'sha', 'urbanismo'], caido: false, fallar: [], lento: 0 });
nuevoInforme(); Q.elegir($('#inspectores select'), INSPECTORES_DB[0]); Q.elegir(conv, EZ); Q.elegir(torre, 'M-3'); await esperar(50);
Q.escribir(items('urb_drenaje')[0].querySelector('.cant'), '5');
ok('Recién escrito: sucio y sin guardar', sucio && listaGuardada().length === 0);
await esperar(2400);
ok('A los 2 s se guardó solo', !sucio && listaGuardada().length === 1 && listaGuardada()[0].general[1].items[0].cant === '5');
Q.escribir(items('urb_drenaje')[1].querySelector('.cant'), '6');
Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new Event('visibilitychange'));
ok('Al irse a otra app se guarda en el acto', !sucio && listaGuardada()[0].general[1].items[1].cant === '6');
Object.defineProperty(document, 'hidden', { value: false, configurable: true });
// un informe «viejo» (v83, sin cant/pr/ud) y otro con una sección desconocida, metidos a mano
const l = listaGuardada();
l.push({ id: 'urb_viejo', tipo: 'urbanismo', nro: 'PRUEBA-URB-EZ-M4-260920-GB', torre: 'M-4', convenio: EZ, empresa: 'ADDISON', residente: '', fecha: '2026-09-20', estatus: '', inspectores: [INSPECTORES_DB[0]], obs_general: 'viejo', noInspeccionados: [], general: [{ id: 'urb_drenaje', nombre: '1. DRENAJE', items: [{ nombre: 'Topografía', agregado: false, sn: 'B', obs: 'sin cantidad', heredado: '' }], obs: '', fotos: [] }], apartamentos: [], guardado: '2026-09-20T10:00:00.000Z' });
l.push({ id: 'urb_otro', tipo: 'urbanismo', nro: 'PRUEBA-URB-EZ-M5-260920-MR', torre: 'M-5', convenio: EZ, empresa: 'ADDISON', residente: '', fecha: '2026-09-20', estatus: '', inspectores: [INSPECTORES_DB[1]], obs_general: '', noInspeccionados: [], general: [{ id: 'urb_x_telecom', nombre: '9. TELECOM', items: [{ nombre: 'Fibra', agregado: true, sn: 'R', obs: '', cant: '300', pr: '', ud: 'm', heredado: '' }], obs: 'nota telecom', fotos: [] }], apartamentos: [], guardado: '2026-09-20T11:00:00.000Z' });
localStorage.setItem('garmel_urb_list', JSON.stringify(l));
cargarInforme('urb_viejo'); await esperar(100);
ok('Informe v83 (sin cant/pr/ud) abre: B y obs en Topografía, cantidad vacía, sin error', valorSN(items('urb_drenaje')[0]) === 'B' && items('urb_drenaje')[0].querySelector('.cant').value === '' && $('#obs_general').value === 'viejo');
cargarInforme('urb_otro'); await esperar(100);
ok('Informe con «urb_x_telecom» agregada a mano: no se crea aparte, Fibra 300 m R y su nota pasan a la fija «10. TELECOMUNICACIONES»', !GENERAL.some(g => g.id === 'urb_x_telecom') && items('urb_telecomunicaciones').some(it => (it.querySelector('.nombre-libre') || {}).value === 'Fibra' && it.querySelector('.cant').value === '300' && (it.querySelector('.ud-sel') || {}).value === 'm' && valorSN(it) === 'R') && /nota telecom/.test($('#srv-urb_telecomunicaciones .obs-srv').value));
ok('…y no queda recordada como sección aparte', !seccionesRecordadas().some(s => s.id === 'urb_x_telecom'));
// relevo con un informe de otro teléfono que trae otra sección más
await fetch(RELEVO_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ clave: 'qc', numero: 'PRUEBA-URB-EZ-M6-260920-AB', tipo: 'urbanismo', ambito: 'torre', fotos: [], datos: { id: 'x', tipo: 'urbanismo', nro: 'PRUEBA-URB-EZ-M6-260920-AB', torre: 'M-6', convenio: EZ, empresa: 'ADDISON', residente: 'ING. DEL OTRO TELÉFONO', fecha: '2026-09-20', estatus: '', inspectores: [INSPECTORES_DB[2]], obs_general: '', noInspeccionados: ['urb_camineria'], general: [{ id: 'urb_x_gas', nombre: '10. GAS', items: [{ nombre: 'Tubería', agregado: true, sn: 'B', obs: '', cant: '12', pr: '40', ud: 'm', heredado: '' }], obs: '', fotos: [] }, { id: 'urb_drenaje', nombre: '1. DRENAJE', items: [{ nombre: 'Excavación', agregado: false, sn: '', obs: '', cant: '99', pr: '', ud: 'm³', heredado: '' }], obs: '', fotos: [] }], apartamentos: [], guardado: '2026-09-20T12:00:00.000Z' } }) });
nuevoInforme(); Q.elegir($('#inspectores select'), INSPECTORES_DB[0]); Q.elegir(torre, 'M-6'); await esperar(1200);
ok('M-6 del relevo (otro teléfono): se ofrece', /ya tiene un informe anterior/.test($('#aviso-historial').textContent), $('#aviso-historial').textContent.replace(/\s+/g, ' ').slice(0, 80));
$('#aviso-historial .si') && $('#aviso-historial .si').click(); await esperar(100);
ok('Llega con Tubería 12 m (pr 40) heredada en la fija GAS, Excavación 99 heredada, NI caminería, y el residente de Planificación', !GENERAL.some(g => g.id === 'urb_x_gas') && items('urb_gas').some(it => it.querySelector('.cant').value === '12' && it.querySelector('.pr').value === '40' && it.classList.contains('heredado')) && items('urb_drenaje')[1].querySelector('.cant').value === '99' && $('#srv-urb_camineria').classList.contains('no-inspeccionado') && $('#residente').value === residenteDe($('#empresa').value), $('#residente').value);
// dejar M-3 en pantalla con cambios y datos corruptos para la recarga
cargarInforme(listaGuardada()[0].id); await esperar(50); Q.escribir(items('urb_drenaje')[2].querySelector('.cant'), '7'); guardar(false);
localStorage.setItem('garmel_urb_manzanas', 'esto no es json'); localStorage.setItem('garmel_urb_secciones', '{"a":'); localStorage.setItem('garmel_urb_items', '[1,2,3]'); localStorage.setItem('garmel_urb_tipos_inc', 'x');
localStorage.setItem('__qc9', JSON.stringify(Q.R));
