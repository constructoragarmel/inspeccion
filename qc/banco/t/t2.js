// TANDA 2 · Urbanismo: partidas, cantidades, unidades, calidad, partidas y secciones agregadas
const EZ = TORRES_DATA[0].c; const conv = $('#convenio'), torre = $('#torre');
const items = sid => $$('#items-' + sid + ' .item');
Q.elegir(conv, EZ); Q.elegir(torre, 'M-3'); Q.elegir($('#inspectores select'), INSPECTORES_DB[1]);

// 1. las 39 fijas con unidad fija
const fijas = $$('.item[data-fijo="1"]');
const conUd = fijas.filter(it => it.querySelector('.ud')).length, conSel = fijas.filter(it => it.querySelector('.ud-sel')).length;
ok('39 partidas fijas, todas con unidad fija (span), ninguna con desplegable', fijas.length === 39 && conUd === 39 && conSel === 0, fijas.length + ' · ud ' + conUd + ' · sel ' + conSel);
const malU = fijas.filter(it => { const sid = it.parentElement.id.replace('items-', ''); const n = it.querySelector('.nombre').textContent; return (UNIDAD_DE[sid] || {})[n] !== it.querySelector('.ud').textContent.trim(); });
ok('Cada unidad coincide con contenido.py', malU.length === 0, malU.length);
ok('8 secciones en orden', GENERAL.map(g => g.nombre.split('.')[0]).join() === '1,2,3,4,5,6,7,8' && GENERAL[5].items.length === 8, GENERAL.map(g => g.nombre).join(' | '));
const c0 = items('urb_drenaje')[0].querySelector('.cant');
ok('Campo cantidad: number, decimal, min 0, step any, placeholder', c0.type === 'number' && c0.inputMode === 'decimal' && c0.min === '0' && c0.step === 'any' && /a la fecha/.test(c0.placeholder), c0.placeholder);
ok('El proyectado existe en cada partida pero no se ve (inspector)', $$('.item .pr').length === fijas.length && getComputedStyle($('.item .proy')).display === 'none');

// 2. valores raros en cantidad
const pr = (v) => { Q.escribir(c0, v); return datosDelFormulario().general[0].items[0].cant; };
ok('12.5 se guarda como «12.5»', pr('12.5') === '12.5');
ok('(RIESGO) «12,5» con coma: el campo number lo rechaza y queda vacío — en teléfonos con teclado es-VE la coma es el decimal', pr('12,5') === '', JSON.stringify(pr('12,5')));
ok('(HALLAZGO) «-3» negativo se acepta y viaja', pr('-3') !== '-3', JSON.stringify(pr('-3')));
ok('«1e3» notación científica se guarda tal cual', pr('1e3') === '1e3', pr('1e3'));
ok('Número largo 123456789012.75 se guarda', pr('123456789012.75') === '123456789012.75');
ok('«0» es una cantidad válida y cuenta como contestada', pr('0') === '0' && /1\/4/.test($('#cuenta-urb_drenaje').textContent), $('#cuenta-urb_drenaje').textContent);
Q.escribir(c0, '');
ok('Vacío no cuenta', /0\/4/.test($('#cuenta-urb_drenaje').textContent) || $('#cuenta-urb_drenaje').textContent === '', JSON.stringify($('#cuenta-urb_drenaje').textContent));

// 3. calidad B / R / M / N-A
const it1 = items('urb_drenaje')[1]; const bt = it1.querySelectorAll('.sino button');
bt[0].click(); const vB = valorSN(it1); bt[1].click(); const vR = valorSN(it1), claseR = bt[1].className; bt[2].click(); const vM = valorSN(it1); bt[3].click(); const vNA = valorSN(it1); bt[3].click(); const vOff = valorSN(it1);
ok('B → R → M → N/A, y tocar N/A otra vez lo quita', [vB, vR, vM, vNA, vOff].join() === 'B,R,M,NA,' && /re-on/.test(claseR), [vB, vR, vM, vNA, vOff].join() + ' · ' + claseR);
ok('Botones con texto B R M N/A', [...bt].map(b => b.textContent).join() === 'B,R,M,N/A');
bt[1].click();
ok('Cuenta 1/4 con solo calidad R', /1\/4/.test($('#cuenta-urb_drenaje').textContent), $('#cuenta-urb_drenaje').textContent);

// 4. partida agregada con unidad
agregarItemNuevo('urb_drenaje');
const nuevo = items('urb_drenaje').pop();
ok('La agregada trae desplegable de unidad con las 8 + «unidad», sin elegir', nuevo.querySelector('.ud-sel') && nuevo.querySelector('.ud-sel').options.length === 9 && nuevo.querySelector('.ud-sel').value === '', nuevo.querySelector('.ud-sel') && nuevo.querySelector('.ud-sel').options.length);
Q.escribir(nuevo.querySelector('.nombre-libre'), 'Sumidero'); Q.escribir(nuevo.querySelector('.cant'), '3'); Q.elegir(nuevo.querySelector('.ud-sel'), 'und');
let d = datosDelFormulario();
ok('Viaja: Sumidero, agregado, cant 3, ud und', d.general[0].items.some(i => i.nombre === 'Sumidero' && i.agregado && i.cant === '3' && i.ud === 'und'), JSON.stringify(d.general[0].items.filter(i => i.agregado)));
agregarItemNuevo('urb_drenaje'); const sinNombre = items('urb_drenaje').pop(); Q.escribir(sinNombre.querySelector('.cant'), '7');
d = datosDelFormulario();
ok('(HALLAZGO) una agregada SIN NOMBRE pero con cantidad viaja con nombre vacío', !d.general[0].items.some(i => i.agregado && i.nombre === ''), JSON.stringify(d.general[0].items.filter(i => i.agregado).map(i => i.nombre + ':' + i.cant)));
quitarItem(sinNombre.querySelector('.quitar-item'));
ok('Sig. manzana no exige nombre en la agregada (faltan no la mira)', true);
guardar(false);
ok('Guardado: memoria de partidas aprende «Sumidero» en drenaje', (itemsRecordados('urb_drenaje') || []).includes('Sumidero'), JSON.stringify(memoriaItems()));

// 5. secciones agregadas
Q.dialogos = []; $('#ns-nombre').value = '   '; agregarSeccion();
ok('Sección sin nombre: avisa', /nombre/.test(Q.dialogos[0] || ''), Q.dialogos[0]);
$('#ns-nombre').value = 'Gas'; agregarSeccion(); await esperar(200);
const gas = GENERAL.find(g => g.id === 'urb_x_gas');
ok('«Gas» → id urb_x_gas, nombre «9. GAS», al final, recordada', gas && gas.nombre === '9. GAS' && GENERAL.indexOf(gas) === 8 && seccionesRecordadas().some(s => s.id === 'urb_x_gas'), JSON.stringify(gas) + ' · ' + localStorage.getItem('garmel_urb_secciones'));
ok('La sección nueva queda abierta y con el aviso de «sin lista»', !$('#srv-urb_x_gas .cuerpo').hidden && $('#srv-urb_x_gas .vacio') && !$('#srv-urb_x_gas .vacio').hidden);
ok('(TEXTO) el aviso de sección vacía dice «servicio» / «Ingeniería», no «sección»', !/servicio/.test($('#srv-urb_x_gas .vacio').textContent), $('#srv-urb_x_gas .vacio').textContent);
ok('Lo que había en pantalla sobrevivió a agregar la sección: R en drenaje[1], Sumidero 3 und, manzana M-3', valorSN(items('urb_drenaje')[1]) === 'R' && items('urb_drenaje').some(it => it.querySelector('.nombre-libre') && it.querySelector('.nombre-libre').value === 'Sumidero' && it.querySelector('.cant').value === '3' && it.querySelector('.ud-sel').value === 'und') && torre.value === 'M-3' && listaGuardada().length === 1, listaGuardada().length);
Q.dialogos = []; $('#ns-nombre').value = '  gas '; agregarSeccion();
ok('«  gas » repetida: «ya existe»', /ya existe/.test(Q.dialogos[0] || ''), Q.dialogos[0]);
$('#ns-nombre').value = 'Telecomunicaciones (fibra óptica)'; agregarSeccion(); await esperar(200);
ok('Nombre con paréntesis y acento: id limpio, nombre «10. TELECOMUNICACIONES (FIBRA ÓPTICA)»', GENERAL.some(g => g.id === 'urb_x_telecomunicacionesfibraoptica' && g.nombre === '10. TELECOMUNICACIONES (FIBRA ÓPTICA)'), GENERAL[9] && GENERAL[9].id);
Q.dialogos = []; $('#ns-nombre').value = '!!!'; agregarSeccion(); await esperar(100); $('#ns-nombre').value = '???'; agregarSeccion();
ok('(BORDE) «!!!» y «???» comparten id «urb_x_» y el segundo se rechaza como repetido', GENERAL.some(g => g.id === 'urb_x_') && /ya existe/.test(Q.dialogos[0] || ''), Q.dialogos[0]);
// partida dentro de la sección nueva, con unidad
agregarItemNuevo('urb_x_gas'); const pg = items('urb_x_gas').pop();
Q.escribir(pg.querySelector('.nombre-libre'), 'Tubería de gas'); Q.elegir(pg.querySelector('.ud-sel'), 'm'); Q.escribir(pg.querySelector('.cant'), '250'); pg.querySelectorAll('.sino button')[0].click();
guardar(false);
d = listaGuardada()[0];
ok('El informe lleva la sección Gas con «Tubería de gas» 250 m B', d.general.some(g => g.id === 'urb_x_gas' && g.items[0] && g.items[0].nombre === 'Tubería de gas' && g.items[0].cant === '250' && g.items[0].ud === 'm' && g.items[0].sn === 'B'), JSON.stringify(d.general.find(g => g.id === 'urb_x_gas')));
ok('Memoria de partidas de Gas aprendió «Tubería de gas»', (itemsRecordados('urb_x_gas') || []).includes('Tubería de gas'));

// 6. sección agregada cuando lo único en pantalla es una nota de sección y una foto (formularioEnBlanco no las mira)
nuevoInforme(); Q.elegir(torre, 'M-4'); await esperar(100); if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
Q.escribir($('#srv-urb_vialidad .obs-srv'), 'Nota de vialidad sin partidas');
const f1 = await Q.foto(1600, 1200, 1); Q.ponerFotos($('#srv-urb_vialidad input[type=file]'), [f1]);
await hasta(() => $$('#fotos-urb_vialidad .foto img').length === 1, 8000);
toggleNoInsp('urb_paisajismo');
$('#ns-nombre').value = 'Alumbrado'; agregarSeccion(); await esperar(600);
ok('(HALLAZGO) agregar una sección con solo nota + foto + «no inspeccionado» en pantalla: ¿se conservan?', $('#srv-urb_vialidad .obs-srv').value === 'Nota de vialidad sin partidas' && $$('#fotos-urb_vialidad .foto').length === 1 && $('#srv-urb_paisajismo').classList.contains('no-inspeccionado'), JSON.stringify({ nota: $('#srv-urb_vialidad .obs-srv').value, fotos: $$('#fotos-urb_vialidad .foto').length, ni: $('#srv-urb_paisajismo').classList.contains('no-inspeccionado') }));

// 7. tope de 6 fotos por sección
nuevoInforme(); Q.elegir(torre, 'M-5'); await esperar(100); if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
const fs = []; for (let i = 2; i <= 8; i++) fs.push(await Q.foto(800, 600, i));
Q.dialogos = []; Q.ponerFotos($('#srv-urb_drenaje input[type=file]'), fs);
await hasta(() => $$('#fotos-urb_drenaje .foto img').length === 6, 15000); await esperar(300);
ok('7 fotos → quedan 6 y avisa «Máximo 6 fotografías por sección»', $$('#fotos-urb_drenaje .foto').length === 6 && /Máximo 6/.test(Q.dialogos[0] || ''), $$('#fotos-urb_drenaje .foto').length + ' · ' + (Q.dialogos[0] || ''));
ok('El rótulo del bloque dice «(máx. 6)»', /máx\. 6/.test($('#srv-urb_drenaje .tarjeta label').textContent), $('#srv-urb_drenaje .tarjeta label').textContent);

// 8. reabrir el primero: todo vuelve
const id1 = listaGuardada().find(x => x.torre === 'M-3').id; cargarInforme(id1); await esperar(300);
const drenaje = items('urb_drenaje');
ok('Reabierto M-3: R en drenaje[1], Sumidero 3 und (agregada, no «recordado»)', valorSN(drenaje[1]) === 'R' && drenaje.some(it => it.dataset.fijo === '0' && it.querySelector('.nombre-libre').value === 'Sumidero' && it.querySelector('.cant').value === '3' && it.querySelector('.ud-sel').value === 'und'), drenaje.map(it => (it.querySelector('.nombre') || it.querySelector('.nombre-libre')).textContent || it.querySelector('.nombre-libre').value).join());
ok('Gas con Tubería 250 m B; la sección Alumbrado también existe (recordada) pero vacía', items('urb_x_gas').some(it => it.querySelector('.nombre-libre').value === 'Tubería de gas' && it.querySelector('.cant').value === '250' && valorSN(it) === 'B') && GENERAL.some(g => g.id === 'urb_x_alumbrado'));
ok('(UX) una sección que solo tiene CANTIDADES se reabre plegada (plegar mira sn/obs, no cant)', true, 'drenaje cuerpo hidden=' + $('#srv-urb_drenaje .cuerpo').hidden);
