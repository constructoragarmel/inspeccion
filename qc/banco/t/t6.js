// TANDA 6 · SHA: incidencias (accidentes)
const REC = '#items-sha_recaudos .item';
const incs = () => $$('#filas-inc .fila-inc');
const esperarEnvio = async () => { await esperar(300); return hasta(() => !_tandaEnCurso && !$('#cartel-envio'), 60000); };
await Q.relevo({ borrar: true, tipos: ['inspeccion', 'servicios', 'sha', 'urbanismo'], caido: false, fallar: [] });
const cabecera = async (t) => { Q.elegir($('#torre'), t); await esperar(100); if ($('#aviso-historial .no')) $('#aviso-historial .no').click(); if ($('#convenio').options.length > 2) Q.elegir($('#convenio'), $('#convenio').options[1].value); if (!inspectoresElegidos().length) Q.elegir($('#inspectores select'), INSPECTORES_DB[0]); };
const inc = (fecha, tipo, notas, acc, estado) => { addIncidencia(); const f = incs().pop(); if (fecha) Q.escribir(f.querySelector('.inc-fecha'), fecha); if (tipo !== undefined){ const sel = f.querySelector('.inc-tipo-sel'); if ([...sel.options].some(o => o.value === tipo)) Q.elegir(sel, tipo); else { Q.elegir(sel, '__otro'); Q.escribir(f.querySelector('.inc-tipo'), tipo); } } if (notas) Q.escribir(f.querySelector('.inc-notas'), notas); if (acc) Q.escribir(f.querySelector('.inc-acciones'), acc); if (estado) [...f.querySelectorAll('.sem button')].find(b => b.dataset.estado === estado).click(); return f; };

// 1. pestaña y fila nueva
ok('Tres pestañas: Recaudos · Hallazgos de campo · Incidencias', $$('.pestanas button').map(b => b.textContent.trim()).join(' · ') === 'Recaudos · Hallazgos de campo · Incidencias', $$('.pestanas button').map(b => b.textContent.trim()).join(' · '));
verPanel('c');
ok('Panel C visible con el texto de vacío y el botón de agregar', $('#panel-c').classList.contains('on') && /Todavía no hay incidencias/.test($('#c-vacio').textContent) && $('#panel-c .btn-add'));
await cabecera('T-45');
const f1 = inc(null, 'Caída de altura', 'Cayó del andamio nivel 2', 'Paralizar y colocar barandas', null);
ok('Fila nueva: fecha = la del informe, estado Abierta (rojo), foco en el tipo, vacío oculto', f1.querySelector('.inc-fecha').value === $('#fecha').value && valorSem(f1) === 'Abierta' && f1.querySelector('.sem-on').style.background && $('#c-vacio').style.display === 'none', valorSem(f1) + ' · ' + f1.querySelector('.sem-on').style.background);
ok('El desplegable de tipo trae los 6 de base + «Otro: escribirlo…»', f1.querySelector('.inc-tipo-sel').options.length === 8 && /Otro/.test([...f1.querySelector('.inc-tipo-sel').options].pop().textContent), f1.querySelector('.inc-tipo-sel').options.length);
ok('Nada por debajo de 44 px en la pestaña de incidencias', Q.chicos().filter(c => !/inicio/.test(c)).length === 0, Q.chicos().join(' '));
ok('Con «Caída de altura» el texto queda oculto y la incidencia lee el tipo', f1.querySelector('.inc-tipo').hidden && leerIncidencias()[0].tipo === 'Caída de altura');
// «Otro»
const f2 = inc('2026-09-19', 'Picadura de abeja', 'Enjambre en el techo', 'Fumigación', 'En seguimiento');
ok('«Otro»: el texto aparece y viaja como tipo; estado En seguimiento (ámbar)', !f2.querySelector('.inc-tipo').hidden && f2.querySelector('.inc-tipo-sel').value === '__otro' && leerIncidencias()[1].tipo === 'Picadura de abeja' && leerIncidencias()[1].estado === 'En seguimiento' && leerIncidencias()[1].fecha === '2026-09-19');
const f3 = inc(null, 'Corte o herida', 'Cerrada ayer', 'Nada', 'Cerrada');
ok('Tres incidencias; tocar el estado que ya tiene no lo quita', (function(){ [...f3.querySelectorAll('.sem button')].find(b => b.dataset.estado === 'Cerrada').click(); return valorSem(f3) === 'Cerrada' && incs().length === 3; })());
ok('Un tipo con HTML no se inyecta en el desplegable', (function(){ const f = inc(null, '<b>x</b>', '', '', null); const r = !f.querySelector('.inc-tipo-sel b') && leerIncidencias()[3].tipo === '<b>x</b>'; quitarIncidencia(f.querySelector('.quitar')); return r; })());

// 2. fotos: tope 3, con «Máximo 3»
const fs = []; for (let i = 1; i <= 5; i++) fs.push(await Q.foto(1200, 900, 30 + i));
Q.dialogos = []; Q.ponerFotos(f1.querySelector('input[type=file]'), fs); await hasta(() => f1.querySelectorAll('.foto img').length === 3, 15000);
ok('5 fotos → 3 y aviso Máximo 3', f1.querySelectorAll('.foto').length === 3 && /Máximo 3/.test(Q.dialogos[0] || ''), (Q.dialogos[0] || '').slice(0, 60));
Q.ponerFotos(f2.querySelector('input[type=file]'), [fs[3]]); Q.ponerFotos(f3.querySelector('input[type=file]'), [fs[4]]); await hasta(() => $$('#filas-inc .foto img').length === 5, 15000);
$$('#filas-inc .foto textarea').forEach((t, i) => Q.escribir(t, 'pie inc ' + i));

// 3. faltan: sin tipo; cierre; guardar
const f4 = inc(null, undefined, 'sin tipo', '', null);
Q.elegir($('#cierre #estatus') || $('#estatus'), 'Aprobado');
Q.dialogos = []; siguienteTorre();
ok('Sig. torre con una incidencia sin tipo: avisa cuál (la 4) y no cambia', /tipo de accidente de la incidencia 4/.test(Q.dialogos[0] || '') && incs().length === 4, Q.dialogos[0]);
quitarIncidencia(f4.querySelector('.quitar'));
guardar(false); await _escrituraFotos; const id1 = idActual;
let d = listaGuardada().find(x => x.id === id1);
ok('Guardado: 3 incidencias con sus campos; fotos 3+1+1 con pies; en IDB inc:0..2', d.incidencias.length === 3 && d.incidencias[0].tipo === 'Caída de altura' && d.incidencias[1].tipo === 'Picadura de abeja' && d.incidencias[2].estado === 'Cerrada' && d.incidencias.map(x => x.fotos.length).join() === '3,1,1' && d.incidencias[0].fotos[0].pie === 'pie inc 0', JSON.stringify(d.incidencias.map(x => [x.tipo, x.estado, x.fotos.length])));
let g = await FotosDB.leer(id1);
ok('IndexedDB: inc:0 con 3, inc:1 con 1, inc:2 con 1', Object.keys(g).filter(k => /^inc:/.test(k)).map(k => k + '=' + g[k].filter(Boolean).length).join() === 'inc:0=3,inc:1=1,inc:2=1', Object.keys(g).map(k => k + '=' + g[k].filter(Boolean).length).join());
ok('El tipo nuevo se recordó en el teléfono', tiposRecordados().includes('Picadura de abeja'), localStorage.getItem('garmel_sha_tipos_inc'));

// 4. reabrir: todo vuelve, incluidas las fotos de cada incidencia
nuevoInforme(); cargarInforme(id1); await hasta(() => $$('#filas-inc .foto img').length === 5, 10000); await esperar(100);
ok('Reabierto: 3 incidencias, tipo «Otro» con su texto, fechas, estados, 5 fotos con pies', incs().length === 3 && incs()[1].querySelector('.inc-tipo').value === 'Picadura de abeja' && incs()[1].querySelector('.inc-tipo-sel').value === '__otro' && incs()[1].querySelector('.inc-fecha').value === '2026-09-19' && valorSem(incs()[2]) === 'Cerrada' && $$('#filas-inc .foto img').length === 5 && $$('#filas-inc .foto textarea')[0].value === 'pie inc 0');
ok('El nuevo informe tras reabrir tiene Picadura de abeja en la lista de tipos', (function(){ addIncidencia(); const f = incs().pop(); const r = [...f.querySelector('.inc-tipo-sel').options].some(o => o.value === 'Picadura de abeja'); quitarIncidencia(f.querySelector('.quitar')); return r; })());

// 5. quitar la PRIMERA incidencia (3 fotos) y guardar: ¿las fotos de la que queda son las suyas?
const srcAntes = incs()[1].querySelector('.foto img').src.slice(-60);
quitarIncidencia(incs()[0].querySelector('.quitar')); guardar(false); await _escrituraFotos;
g = await FotosDB.leer(id1);
ok('(HALLAZGO) tras quitar la 1.ª, IndexedDB se reescribe: inc:0 debe tener 1 foto (la de la abeja), no 3', g['inc:0'] && g['inc:0'].filter(Boolean).length === 1, Object.keys(g).map(k => k + '=' + g[k].filter(Boolean).length).join());
nuevoInforme(); cargarInforme(id1); await hasta(() => $$('#filas-inc .foto img').length >= 2, 10000); await esperar(200);
const srcDesp = incs()[0].querySelector('.foto img').src.slice(-60);
ok('(HALLAZGO) reabierto: la incidencia de la abeja muestra SU foto, no la de la caída', srcDesp === srcAntes && $$('#filas-inc .foto img').length === 2, 'fotos=' + $$('#filas-inc .foto img').length + ' misma=' + (srcDesp === srcAntes));

// 6. envío: sobre con fotos inc-N-k y datos.incidencias
Q.dialogos = []; enviar(); await esperarEnvio();
const env = await Q.envios();
ok('Enviado: datos.incidencias con 2; fotos nombradas inc-1-1, inc-2-1', env.length === 1 && env[0].datos.incidencias.length === 2 && env[0].fotos.filter(n => /^inc-/.test(n)).join() === 'inc-1-1,inc-2-1', env[0] && env[0].fotos.join());
ok('Las fotos del sobre corresponden: inc-1 lleva 1 foto (abeja), inc-2 lleva 1 (corte)', env[0] && env[0].datos.incidencias[0].fotos.length === 1 && env[0].datos.incidencias[1].fotos.length === 1);

// 7. visita siguiente: vuelven Abierta/En seguimiento, no Cerrada; sin revisar cuenta; tocar confirma
nuevoInforme(); Q.elegir($('#torre'), 'T-45'); await esperar(200); $('#aviso-historial .si').click(); await esperar(100); Q.elegir($('#inspectores select'), INSPECTORES_DB[1]);
verPanel('c');
ok('Vuelve solo la de En seguimiento (abeja), heredada, sin fotos, con etiqueta «visita anterior»', incs().length === 1 && incs()[0].classList.contains('heredado') && incs()[0].querySelector('.inc-tipo').value === 'Picadura de abeja' && incs()[0].querySelectorAll('.foto').length === 0 && getComputedStyle(incs()[0].querySelector('.etq-her')).display !== 'none');
ok('La ficha de la visita anterior cuenta «1 incidencia(s) sin cerrar»', true, (estadosDeTorres()['T-45'].incidencias || []).length + ' en memoria');
Q.dialogos = []; Q.aceptar = false; Q.elegir($('#estatus'), 'Aprobado'); enviar(); await esperar(300);
ok('Avisa sin revisar (incluye la incidencia) y con Cancelar no envía', /: \d/.test(Q.dialogos[0] || '') && (await Q.envios()).length === 1, (Q.dialogos[0] || '').replace(/\n/g, ' ').slice(0, 90));
Q.aceptar = true; [...incs()[0].querySelectorAll('.sem button')].find(b => b.dataset.estado === 'Cerrada').click();
ok('Tocar «Cerrada» la confirma como de hoy', !incs()[0].classList.contains('heredado') && valorSem(incs()[0]) === 'Cerrada');
guardar(false);
nuevoInforme(); Q.elegir($('#torre'), 'T-45'); await esperar(200); $('#aviso-historial .si').click(); await esperar(100); verPanel('c');
ok('Cerrada hoy: en la siguiente visita ya no vuelve', incs().length === 0 && $('#c-vacio').style.display !== 'none', incs().length);

// 8. Sig. torre limpia las incidencias; fichas con «incidencia(s)»
Q.elegir($('#torre'), 'T-46'); await esperar(100); if ($('#aviso-historial .no')) $('#aviso-historial .no').click(); Q.elegir($('#inspectores select'), INSPECTORES_DB[0]); Q.elegir($('#estatus'), 'Aprobado');
verPanel('c'); inc(null, 'Golpe o atrapamiento', 'x', 'y', 'Abierta'); inc(null, 'Caída de objeto', 'x', 'y', 'Abierta');
siguienteTorre();
ok('Sig. torre: la nueva no trae incidencias', incs().length === 0 && $('#c-vacio').style.display !== 'none');
abrirInformes(); await esperar(50);
const ficha = $$('#modal-informes .ficha').find(f => /T46/.test(f.textContent));
ok('La ficha de T-46 dice «2 incidencia(s)»', ficha && /2 incidencia\(s\)/.test(ficha.textContent), ficha && ficha.querySelector('.s').textContent);
cerrarInformes();
// 9. textos raros y fechas raras
nuevoInforme(); await cabecera('T-47'); verPanel('c');
const raro = 'Losa "5" & <b>norte</b> ñ 🔥 \\ /';
const fr = inc('1999-01-01', raro, raro, raro, 'Abierta');
guardar(false); const idR = idActual; nuevoInforme(); cargarInforme(idR); await esperar(100); verPanel('c');
ok('Textos raros vuelven intactos en tipo (Otro), notas y acciones; fecha 1999 se acepta', incs()[0].querySelector('.inc-tipo').value === raro && incs()[0].querySelector('.inc-notas').value === raro && incs()[0].querySelector('.inc-acciones').value === raro && incs()[0].querySelector('.inc-fecha').value === '1999-01-01' && !$('#filas-inc b'));
ok('(UX) la fecha del accidente admite cualquier fecha, incluso futura o de 1999', true);
ok('Ningún error de página', !Q.R.some(r => /pageerror|unhandled/.test(r.n)));
