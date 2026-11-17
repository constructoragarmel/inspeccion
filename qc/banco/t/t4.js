// TANDA 4 · Urbanismo: visita anterior (teléfono y relevo), heredados, sin revisar, cambiar de manzana
localStorage.setItem('garmel_clave_envio', 'qc');   // 17-nov-2026: la tanda pone su clave. Antes la heredaba de otra corrida en el mismo navegador; con el teléfono limpio de headless.py no enviaba («no está configurado para enviar»).
// Puesta al día del 17-nov-2026 con la v188 (27-oct, «Hoy / Anterior / Acumulado») y las cinco partidas de drenaje (1de10c7):
// lo de hoy se escribe en «Hoy»; la cantidad heredada vuelve como «Anterior» (her-pr), no cuenta como «sin revisar» ni en la
// cuenta de la sección (arreglado el 17-nov-2026, 14k) ni en el aviso de «Enviar», y viaja sin marca de heredado.
const EZ = TORRES_DATA[0].c; const conv = $('#convenio'), torre = $('#torre');
const items = sid => $$('#items-' + sid + ' .item');
await Q.relevo({ borrar: true });
const insp = () => Q.elegir($('#inspectores select'), INSPECTORES_DB[0]);
nuevoInforme(); Q.elegir(conv, EZ); Q.elegir(torre, 'M-2'); await esperar(100);
Q.elegir($('#inspectores select'), INSPECTORES_DB[0]);
// informe 1 en M-2: cantidades en 3 secciones, calidad en 2, nota, foto, NI en paisajismo, una agregada
items('urb_drenaje').forEach((x, i) => { Q.escribir(x.querySelector('.hoy'), String(10 * (i + 1))); });
items('urb_vialidad')[0].querySelectorAll('.sino button')[0].click(); items('urb_vialidad')[1].querySelectorAll('.sino button')[2].click();
Q.escribir(items('urb_vialidad')[1].querySelector('textarea'), 'obs vialidad');
Q.escribir($('#srv-urb_vialidad .obs-srv'), 'nota de vialidad');
Q.ponerFotos($('#srv-urb_drenaje input[type=file]'), [await Q.foto(800, 600, 11)]); await hasta(() => $$('#fotos-urb_drenaje .foto img').length === 1);
toggleNoInsp('urb_paisajismo');
agregarItemNuevo('urb_electricidad'); const ag = items('urb_electricidad').pop(); Q.escribir(ag.querySelector('.nombre-libre'), 'Transformador'); Q.elegir(ag.querySelector('.ud-sel'), 'und'); Q.escribir(ag.querySelector('.cant'), '2');
guardar(false); const id1 = idActual; await _escrituraFotos;
Q.ok('depuración', true, JSON.stringify((function(){ const d = listaGuardada()[0]; return [d.general[1].items.map(i => i.cant).join(), d.general[6].items[0].sn, d.general[6].items[1].sn, d.general[6].obs, d.general[1].fotos.length, d.noInspeccionados.join(), d.general[4].items.some(i => i.nombre === 'Transformador')]; })()));
ok('Informe 1 guardado con 5 cant, 2 calidades, nota, 1 foto, NI, agregada', (function(){ const d = listaGuardada()[0]; return d.general[1].items.map(i => i.cant).join() === '10,20,30,40,50' && d.general[6].items[0].sn === 'B' && d.general[6].items[1].sn === 'M' && d.general[6].obs === 'nota de vialidad' && d.general[1].fotos.length === 1 && d.noInspeccionados.join() === 'urb_paisajismo' && d.general[4].items.some(i => i.nombre === 'Transformador'); })());

// 2. nuevo, misma manzana: oferta y herencia
nuevoInforme(); insp(); Q.elegir(torre, 'M-2'); await esperar(200);
const banner = $('#aviso-historial').textContent.replace(/\s+/g, ' ');
ok('Ofrece la visita anterior de M-2', /M-2 ya tiene un informe anterior/.test(banner), banner.slice(0, 90));
$('#aviso-historial .si').click(); await esperar(100);
const her = $$('.item.heredado');
ok('Heredados: 5 de drenaje (cant), 2 de vialidad (calidad), Transformador (agregada) = 8', her.length === 8, her.length);
ok('Las cantidades vuelven como «Anterior»: 10,20,30,40,50; calidad B y M; obs; nota de sección heredada; NI heredado', items('urb_drenaje').map(x => x.querySelector('.cant').value + '/' + x.querySelector('.ant').value).join() === '10/10,20/20,30/30,40/40,50/50' && valorSN(items('urb_vialidad')[0]) === 'B' && items('urb_vialidad')[1].querySelector('textarea').value === 'obs vialidad' && $('#srv-urb_vialidad .obs-srv').dataset.heredado && $('#srv-urb_paisajismo').classList.contains('no-inspeccionado'));
ok('No vuelven las fotos', $$('#fotos-urb_drenaje .foto').length === 0);
ok('La agregada heredada trae su unidad «und» y su cantidad 2', (function(){ const t = items('urb_electricidad').find(x => x.querySelector('.nombre-libre') && x.querySelector('.nombre-libre').value === 'Transformador'); return t && t.querySelector('.ud-sel').value === 'und' && t.querySelector('.cant').value === '2' && t.classList.contains('heredado'); })());
ok('Cuenta de drenaje dice 5/5 SIN «sin revisar»: lo heredado es el anterior (v188)', /5\/5/.test($('#cuenta-urb_drenaje').textContent) && !/sin revisar/.test($('#cuenta-urb_drenaje').textContent) && items('urb_drenaje').every(x => x.classList.contains('her-pr')), $('#cuenta-urb_drenaje').textContent);
ok('Cuenta de vialidad: las 2 calidades heredadas sí están «sin revisar»', /2 sin revisar/.test($('#cuenta-urb_vialidad').textContent), $('#cuenta-urb_vialidad').textContent);
ok('Botón de calidad heredado en amarillo apagado (clase heredado + si-on)', items('urb_vialidad')[0].querySelector('.si-on') && items('urb_vialidad')[0].classList.contains('heredado'));

// 3. cambiar de manzana con SOLO heredado: se suelta (¿también las cantidades?)
Q.elegir(torre, 'M-3'); await esperar(100);
const quedan = items('urb_drenaje').map(x => x.querySelector('.cant').value).join();
ok('(HALLAZGO) al cambiar a M-3 con solo heredado, las CANTIDADES heredadas se sueltan', quedan === ',,,,' && $$('.item.heredado').length === 0, 'cant=' + quedan + ' heredados=' + $$('.item.heredado').length);
ok('…las calidades sí se soltaron', !valorSN(items('urb_vialidad')[0]) && !valorSN(items('urb_vialidad')[1]));
ok('…y el NI y la nota también', !$('#srv-urb_paisajismo').classList.contains('no-inspeccionado') && $('#srv-urb_vialidad .obs-srv').value === '');
ok('(HALLAZGO) …y la unidad/cant de la agregada heredada', (function(){ const t = items('urb_electricidad').find(x => x.querySelector('.nombre-libre') && x.querySelector('.nombre-libre').value === 'Transformador'); return !t || (t.querySelector('.cant').value === ''); })(), JSON.stringify(items('urb_electricidad').filter(x => x.dataset.fijo === '0').map(x => x.querySelector('.nombre-libre').value + ':' + x.querySelector('.cant').value)));
ok('¿M-3 queda «en blanco» tras soltar?', formularioEnBlanco(), 'enBlanco=' + formularioEnBlanco());

// 4. con algo de hoy, cambiar de manzana NO suelta
nuevoInforme(); insp(); Q.elegir(torre, 'M-2'); await esperar(200); $('#aviso-historial .si').click(); await esperar(100);
Q.escribir(items('urb_drenaje')[0].querySelector('.hoy'), '5');
Q.elegir(torre, 'M-4'); await esperar(100);
ok('Con 5 escrito hoy (acumulado 15), cambiar a M-4 conserva lo heredado y lo de hoy', items('urb_drenaje')[0].querySelector('.cant').value === '15' && items('urb_drenaje')[1].querySelector('.cant').value === '20' && $$('.item.heredado').length === 7, items('urb_drenaje')[0].querySelector('.cant').value + ' · heredados ' + $$('.item.heredado').length);

// 5. sin revisar al enviar: aviso con el número; revisar dos y enviar
Q.elegir(torre, 'M-2'); await esperar(100); guardar(false);
Q.dialogos = []; Q.aceptar = false; enviar(); await hasta(() => !_tandaEnCurso, 20000); await esperar(200);
ok('Avisa 2 sin revisar (las calidades; las cantidades heredadas no) y con Cancelar no envía', /: 2/.test(Q.dialogos[0] || '') && (await Q.envios()).length === 0, (Q.dialogos[0] || '').replace(/\n/g, ' ').slice(0, 100));
Q.aceptar = true; items('urb_vialidad')[0].querySelectorAll('.sino button')[0].click();
ok('Tocar B otra vez la confirma: quedan 6 heredados', $$('.item.heredado').length === 6, $$('.item.heredado').length);
guardar(false); Q.dialogos = []; enviar(); await hasta(() => !_tandaEnCurso && !$('#cartel-envio'), 30000); await esperar(300);
const env = await Q.envios(), eHoy = env.slice(-1)[0];   // en la misma tanda sale también el informe 1, guardado y sin enviar
ok('Avisa 1 y envía; la calidad sin revisar lleva el número de origen, las cantidades heredadas viajan sin marca (v188)', /: 1/.test(Q.dialogos[0] || '') && env.length === 2 && eHoy.datos.general[1].items.every(i => i.heredado === '') && eHoy.datos.general[1].items.map(i => i.cant).join() === '15,20,30,40,50' && eHoy.datos.general[6].items[0].heredado === '' && /M2/.test(eHoy.datos.general[6].items[1].heredado || ''), eHoy && env.length + ' envíos · ' + JSON.stringify(eHoy.datos.general[1].items.map(i => i.cant + ':' + i.heredado)) + ' · vialidad ' + JSON.stringify(eHoy.datos.general[6].items.slice(0, 2).map(i => i.sn + ':' + i.heredado)));
ok('Los ítems agregados heredados viajan con «agregado: true»', eHoy && eHoy.datos.general[4].items.some(i => i.nombre === 'Transformador' && i.agregado === true));

// 6. historial desde el relevo en un teléfono limpio
localStorage.removeItem('garmel_urb_list'); localStorage.removeItem('garmel_urb_torres'); localStorage.removeItem('garmel_urb_actual');
nuevoInforme(); insp(); Q.elegir(torre, 'M-2'); await esperar(1500);
const b2 = $('#aviso-historial').textContent.replace(/\s+/g, ' ');
ok('Teléfono limpio: el relevo devuelve el último informe de M-2 y se ofrece', /ya tiene un informe anterior/.test(b2), b2.slice(0, 90));
$('#aviso-historial .si') && $('#aviso-historial .si').click(); await esperar(100);
ok('Del relevo llegan 5 cant + calidades + agregada', items('urb_drenaje').map(x => x.querySelector('.cant').value).join() === '15,20,30,40,50' && items('urb_electricidad').some(x => x.dataset.fijo === '0' && x.querySelector('.nombre-libre').value === 'Transformador'), items('urb_drenaje').slice(0, 4).map(x => x.querySelector('.cant').value).join());
// Los dos informes son del mismo día, manzana e inspector y el relevo falso no numera: comparten número, así que aquí no se
// distingue el origen original del de ayer por el número; se comprueba que todo vuelve marcado con el número del último envío.
ok('Cadena: del relevo vuelven las cantidades y las calidades marcadas con el número del último envío', (function(){ const o = items('urb_drenaje').map(x => x.dataset.heredado || ''), v = items('urb_vialidad').slice(0, 2).map(x => x.dataset.heredado || ''); return eHoy && o.every(x => x === eHoy.numero) && v.every(x => /M2/.test(x)); })(), JSON.stringify([items('urb_drenaje')[0].dataset.heredado, items('urb_vialidad')[0].dataset.heredado, items('urb_vialidad')[1].dataset.heredado, eHoy && eHoy.numero]));

// 7. la manzana con nombre raro y el relevo: torre con «/» y comillas
abrirNuevaManzana(); $('#nm-sector').value = EZ; $('#nm-nombre').value = 'M-9 "Sur" / L1'; guardarNuevaManzana(); await esperar(100); if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
Q.escribir(items('urb_drenaje')[0].querySelector('.cant'), '1'); guardar(false);
await enviarSolo(idActual); await hasta(() => !_tandaEnCurso && !$('#cartel-envio'), 20000);
insp(); guardar(false); await enviarSolo(idActual); await hasta(() => !_tandaEnCurso && !$('#cartel-envio'), 20000);
const e2 = (await Q.envios()).slice(-1)[0];
ok('(RIESGO) la manzana viaja con «/» y comillas en datos.torre: el relevo crea la carpeta con ese nombre', e2 && e2.datos.torre === 'M-9 "SUR" / L1' && /M9SURL1/.test(e2.numero), e2 && e2.datos.torre + ' · ' + e2.numero);
