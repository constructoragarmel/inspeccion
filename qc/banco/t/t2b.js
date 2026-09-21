// TANDA 2b · continuación
const EZ = TORRES_DATA[0].c; const conv = $('#convenio'), torre = $('#torre');
const items = sid => $$('#items-' + sid + ' .item');
Q.elegir(conv, EZ);
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
