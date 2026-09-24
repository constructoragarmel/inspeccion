// TANDA 3 · Urbanismo: Planificación
const EZ = TORRES_DATA[0].c; const conv = $('#convenio'), torre = $('#torre');
const items = sid => $$('#items-' + sid + ' .item');
const btnP = $$('.acciones button, .fila-mas button, button').find(b => /Proyectadas/.test(b.textContent));
ok('Existe el botón «📊 Proyectadas»', !!btnP, btnP && btnP.className);
ok('Arranque sin ?rol: no está en modo plan, sin aviso, proyectado oculto', !document.body.classList.contains('plan') && !$('.plan-aviso') && getComputedStyle($('.item .proy')).display === 'none');
btnP.click();
ok('Al tocarlo: modo plan, aviso arriba, proyectado visible (flex)', document.body.classList.contains('plan') && $('.plan-aviso') && /Modo Planificación/.test($('.plan-aviso').textContent) && getComputedStyle($('.item .proy')).display === 'flex', $('.plan-aviso') && $('.plan-aviso').textContent.slice(0, 60));
ok('El aviso va al principio del envoltorio, antes de la cabecera', $('.envoltorio').firstElementChild.classList.contains('plan-aviso'));
ok('Nada por debajo de 44 px en modo plan', Q.chicos().length === 0, Q.chicos().slice(0, 5).join(' '));

// avance
nuevoInforme(); Q.elegir(conv, EZ); Q.elegir(torre, 'M-6'); await esperar(100); if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
Q.elegir($('#inspectores select'), INSPECTORES_DB[0]);
const it = items('urb_vialidad')[3]; const cant = it.querySelector('.cant'), pr = it.querySelector('.pr'), av = it.querySelector('.avance');
const caso = (c, p) => { Q.escribir(cant, c); Q.escribir(pr, p); return av.textContent; };
ok('25 de 100 → 25%', caso('25', '100') === '25%', av.textContent);
ok('0 de 100 → 0%', caso('0', '100') === '0%', av.textContent);
ok('150 de 100 → 150% (no se recorta)', caso('150', '100') === '150%', av.textContent);
ok('1 de 3 → 33%', caso('1', '3') === '33%', av.textContent);
ok('2 de 3 → 67% (redondea)', caso('2', '3') === '67%', av.textContent);
ok('Proyectado 0 → sin porcentaje', caso('10', '0') === '', JSON.stringify(av.textContent));
ok('Sin ejecutado → sin porcentaje', caso('', '100') === '', JSON.stringify(av.textContent));
ok('Sin proyectado → sin porcentaje', caso('10', '') === '', JSON.stringify(av.textContent));
ok('Negativo -5 de 100 → sin porcentaje (c>=0)', caso('-5', '100') === '', JSON.stringify(av.textContent));
ok('12.5 de 50 → 25%', caso('12.5', '50') === '25%', av.textContent);
ok('Cuenta de la sección sube con el ejecutado', /1\/8/.test($('#cuenta-urb_vialidad').textContent), $('#cuenta-urb_vialidad').textContent);

// solo proyectadas (el trabajo de Planificación)
nuevoInforme(); Q.elegir(torre, 'M-1 L1'); await esperar(100); if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
Q.elegir($('#inspectores select'), INSPECTORES_DB[1]);
const drena = items('urb_drenaje'); drena.forEach((x, i) => Q.escribir(x.querySelector('.pr'), String((i + 1) * 100)));
let d = datosDelFormulario();
ok('Los 4 proyectados están en los datos', d.general[1].items.map(i => i.pr).join() === '100,200,300,400', d.general[1].items.map(i => i.pr).join());
const antes = listaGuardada().length; const g = guardar(true);
ok('(HALLAZGO) un informe con SOLO proyectadas se considera «en blanco» y NO se guarda', g === true && listaGuardada().length === antes + 1, 'guardar→' + g + ' · ' + (Q.dialogos.slice(-1)[0] || '') + ' · lista ' + antes + '→' + listaGuardada().length);
ok('(HALLAZGO) …ni cuenta como contestado para la sección', /1\/4|4\/4/.test($('#cuenta-urb_drenaje').textContent), JSON.stringify($('#cuenta-urb_drenaje').textContent));
Q.dialogos = []; siguienteTorre();
ok('(HALLAZGO) «Sig. manzana» con solo proyectadas: ¿quedó guardado M-1 L1?', listaGuardada().some(x => x.torre === 'M-1 L1'), listaGuardada().map(x => x.torre).join());
// con una cantidad además, sí
Q.elegir(torre, 'M-1 L1'); await esperar(100); if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
items('urb_drenaje').forEach((x, i) => Q.escribir(x.querySelector('.pr'), String((i + 1) * 100)));
Q.escribir(items('urb_drenaje')[0].querySelector('.cant'), '50'); guardar(false);
d = listaGuardada().find(x => x.torre === 'M-1 L1');
ok('Con un ejecutado además, se guarda con los 4 proyectados', d && d.general[1].items.map(i => i.pr).join() === '100,200,300,400' && d.general[1].items[0].cant === '50', d && d.general[1].items.map(i => i.pr + '/' + i.cant).join());

// salir del modo plan: el proyectado sigue viajando aunque no se vea
btnP.click();
ok('Apagar: sin clase plan, sin aviso, proyectado oculto, los valores siguen', !document.body.classList.contains('plan') && !$('.plan-aviso') && getComputedStyle(items('urb_drenaje')[0].querySelector('.proy')).display === 'none' && items('urb_drenaje')[3].querySelector('.pr').value === '400');
guardar(false); d = listaGuardada().find(x => x.torre === 'M-1 L1');
ok('Guardado en modo inspector: los proyectados no se pierden', d.general[1].items.map(i => i.pr).join() === '100,200,300,400');

// historial: el inspector del día siguiente hereda cant y recibe pr sin verlo
nuevoInforme(); Q.elegir(torre, 'M-1 L1'); await esperar(200); $('#aviso-historial .si').click(); await esperar(100);
const d0 = items('urb_drenaje')[0], d3 = items('urb_drenaje')[3];
ok('Heredado: drenaje[0] con 50 en amarillo; drenaje[3] recibe pr 400 pero NO se marca heredado (solo proyectado)', d0.classList.contains('heredado') && d0.querySelector('.cant').value === '50' && d3.querySelector('.pr').value === '400' && !d3.classList.contains('heredado'), d3.querySelector('.pr').value + ' · ' + d3.className);
Q.escribir(d0.querySelector('.cant'), '80');
ok('El inspector escribe 80 encima: deja de ser heredado y el pr 100 sigue', !d0.classList.contains('heredado') && d0.querySelector('.pr').value === '100');
guardar(false);
d = listaGuardada().slice(-1)[0];
ok('El informe de hoy lleva cant 80 / pr 100 en drenaje[0] y pr 400 en [3]', d.general[1].items[0].cant === '80' && d.general[1].items[0].pr === '100' && d.general[1].items[3].pr === '400', JSON.stringify(d.general[1].items.map(i => i.cant + '/' + i.pr)));

// envío: el sobre lleva cant, pr, ud
await Q.relevo({ borrar: true });
Q.dialogos = []; await enviarSolo(d.id); await hasta(() => !_tandaEnCurso && !$('#cartel-envio'), 20000);
const env = await Q.envios();
ok('Enviado: tipo urbanismo, ambito torre, datos con cant/pr/ud por partida', env.length === 1 && env[0].tipo === 'urbanismo' && env[0].datos.general[1].items[0].cant === '80' && env[0].datos.general[1].items[0].pr === '100' && env[0].datos.general[1].items[0].ud === 'm', JSON.stringify(env[0] && env[0].datos.general[1].items[0]));
ok('El número del sobre es el de la manzana: PRUEBA-URB-EZ-M1L1-', /^PRUEBA-URB-EZ-M1L1-/.test(env[0] && env[0].numero), env[0] && env[0].numero);

// ?rol=planificacion se prueba en la tanda 9 (arranque). Sig. manzana conserva el modo:
btnP.click(); nuevoInforme(); Q.elegir(torre, 'M-2'); await esperar(100); if ($('#aviso-historial .no')) $('#aviso-historial .no').click(); Q.escribir(items('urb_drenaje')[0].querySelector('.cant'), '1'); siguienteTorre();
ok('Sig. manzana conserva el modo plan', document.body.classList.contains('plan') && $('.plan-aviso'));
btnP.click();
