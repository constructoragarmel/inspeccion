// ¿DÓNDE ES? · tanda 2a — URBANISMO (30-sep-2026, PA-112). Correr en urbanismo.html a 375×812.
localStorage.setItem('garmel_clave_envio', 'qc');
await Q.relevo({ borrar: true, tipos: ['inspeccion', 'servicios', 'sha', 'urbanismo'], caido: false, fallar: [], lento: 0 });
localStorage.setItem('garmel_urb_list', '[]');
const conv = $('#convenio'), torre = $('#torre');
const insp = () => Q.elegir($('#inspectores select'), INSPECTORES_DB[0]);
const nuevo = async () => { Q.aceptar = true; nuevoInforme(); await esperar(80); if ($('#aviso-historial .no')) $('#aviso-historial .no').click(); };
const boton = m => $('#campo-donde button[data-m="' + m + '"]');
const medir = () => Q.escribir($('#items-' + GENERAL[1].id + ' .item .cant'), '5');

// ── 6. Varias manzanas: los rótulos hablan de manzanas; número URB-EZ-M2+1 ──
await nuevo(); insp(); Q.elegir(conv, 'Convenio Bielorrusos'); Q.elegir(torre, 'M-2'); await esperar(60); if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
boton('varias').click(); Q.elegir($('#otra-lugar'), 'M-3'); medir();
const d6 = datosDelFormulario();
ok('6 · Urbanismo: «Varias manzanas», agregar «otra manzana o lote», número URB-EZ-M2+1, ubicación «M-2 · M-3»',
   boton('varias').textContent === 'Varias manzanas' && /otra manzana/.test($('#otra-lugar').options[0].textContent) &&
   /URB-EZ-M2\+1-/.test(numeroInforme()) && d6.ubicacion && d6.ubicacion.texto === 'M-2 · M-3',
   boton('varias').textContent + ' · ' + numeroInforme() + ' · ' + (d6.ubicacion || {}).texto);

// ── 7. Toda la zona: el sector sigue siendo «Sector», la opción ZONA sobrevive a elegirlo y la empresa es la del sector ──
await nuevo(); insp(); boton('zona').click(); await esperar(50);
Q.elegir(conv, 'Convenio Bielorrusos'); await esperar(60); medir();
const d7 = datosDelFormulario();
ok('7 · Urbanismo, toda la zona: rótulo «Sector», manzana ZONA tras elegir sector, empresa del sector, URB-EZ-ZONA',
   document.querySelector('label[for="convenio"]').textContent === 'Sector' && torre.value === 'ZONA' && d7.torre === 'ZONA' &&
   $('#empresa').value === (EMPRESA_POR_SECTOR['Convenio Bielorrusos'] || '') && /URB-EZ-ZONA-/.test(numeroInforme()) && !faltan(d7).length,
   document.querySelector('label[for="convenio"]').textContent + ' · ' + torre.value + ' · ' + $('#empresa').value + ' · ' + numeroInforme() + ' · faltan ' + faltan(d7).join(','));

// ── 8. Se envía, se reabre en zona y «Siguiente manzana» vuelve a una sola ──
guardar(false); const id8 = idActual;
await enviar(); await esperar(600);
const todos8 = (await Q.envios()).filter(e => e.tipo === 'urbanismo');
const env8 = todos8.filter(e => e.datos.torre === 'ZONA'), m2 = todos8.find(e => /M2\+1/.test(e.numero));
await nuevo(); cargarInforme(id8); await esperar(120);
const reab = boton('zona').classList.contains('on') && torre.value === 'ZONA' && conv.value === 'Convenio Bielorrusos';
siguienteTorre(); await esperar(80);
ok('8 · Urbanismo: sale con ZONA (y el M-2+1 pendiente, con su ubicación), se reabre en «Toda la zona», y «Siguiente» vuelve a «Una manzana o lote»',
   env8.length === 1 && m2 && m2.datos.ubicacion.texto === 'M-2 · M-3' && reab && boton('una').classList.contains('on') && !torre.closest('.campo').hidden,
   'envíos ' + env8.length + ' · reabierto ' + reab + ' · ' + (env8[0] || {}).numero);
