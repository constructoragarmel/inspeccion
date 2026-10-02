// TANDA 54 · V113 (2-oct-2026): «Desmontaje de obstáculos» en SHA. Correr en sha.html a 375×812 y a 1280.
// 1 la cuarta pestaña y sus cinco filas · 2 solo números, el % no pasa de 100 y dice lo que queda · 3 lo que viaja en los datos
// 4 guardar y reabrir · 5 el envío con su foto · 6 la visita siguiente trae el acumulado (sin la observación) · 7 cambiar de torre lo suelta
// 8 un informe solo con obstáculos no está vacío · 9 las cuatro pestañas y el bloque caben en la pantalla
localStorage.setItem('garmel_clave_envio', 'qc');
await Q.relevo({ borrar: true, tipos: ['inspeccion', 'servicios', 'sha', 'urbanismo'], caido: false, fallar: [], lento: 0 });
localStorage.setItem('garmel_sha_list', '[]'); localStorage.removeItem('garmel_sha_torres');
const conv = $('#convenio'), torre = $('#torre');
const insp = () => Q.elegir($('#inspectores select'), INSPECTORES_DB[0]);
const nuevo = async () => { Q.aceptar = true; nuevoInforme(); await esperar(80); if ($('#aviso-historial .no')) $('#aviso-historial .no').click(); };
const cierre = () => { const e = $('#estatus'); Q.elegir(e, [...e.options].map(o => o.value).filter(Boolean)[0]); };
const fila = id => $('#panel-d .fila-obst[data-id="' + id + '"]');
const pon = (id, c, v) => { const e = fila(id).querySelector(c); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
const t1 = TORRES_DATA.find(x => entradasDe(x.t).length === 1 && SECTOR_POR_CONVENIO[x.c] === 'EZ');
const t2 = TORRES_DATA.find(x => x.t !== t1.t && entradasDe(x.t).length === 1 && SECTOR_POR_CONVENIO[x.c] === 'EZ');

// ── 1 ──
await nuevo(); insp(); Q.elegir(torre, t1.t); await esperar(80); if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
verPanel('d'); await esperar(50);
const filas = $$('#panel-d .fila-obst'), nombres = filas.map(f => f.querySelector('.nombre').textContent);
ok('1 · La cuarta pestaña es «Obstáculos» y trae las cinco filas en su orden; la chatarra pide un % y las demás, retirado y queda',
   $('#tab-d').textContent === 'Obstáculos' && $('#panel-d').classList.contains('on') && !$('#panel-a').classList.contains('on') &&
   nombres.join('|') === 'Torres grúa|Chatarra|Camiones y maquinaria averiados|Ascensores de carga|Andamios' &&
   !!fila('chatarra').querySelector('.obst-pct') && !fila('chatarra').querySelector('.obst-ret') &&
   ['gruas', 'vehiculos', 'ascensores_carga', 'andamios'].every(i => fila(i).querySelector('.obst-ret') && fila(i).querySelector('.obst-queda')), nombres.join(' · '));

// ── 2 ──
pon('gruas', '.obst-ret', '1a'); pon('gruas', '.obst-queda', '02'); pon('chatarra', '.obst-pct', '140');
const tope = fila('chatarra').querySelector('.obst-pct').value;
pon('chatarra', '.obst-pct', '40');
ok('2 · Solo entran números; el % de la chatarra no pasa de 100 y al lado dice lo que queda',
   fila('gruas').querySelector('.obst-ret').value === '1' && fila('gruas').querySelector('.obst-queda').value === '2' && tope === '100' &&
   fila('chatarra').querySelector('.obst-resto').textContent === 'Queda 60 %', 'grúas ' + fila('gruas').querySelector('.obst-ret').value + ' y ' + fila('gruas').querySelector('.obst-queda').value + ' · tope ' + tope + ' · ' + fila('chatarra').querySelector('.obst-resto').textContent);

// ── 3 ──
pon('gruas', '.obst-obs', 'La grúa del lado norte sigue anclada.'); pon('andamios', '.obst-ret', '0'); pon('andamios', '.obst-queda', '6');
const d3 = datosDelFormulario(), o3 = d3.obstaculos;
ok('3 · En los datos viajan las cinco filas con su nombre, lo retirado, lo que queda, el % y la observación',
   o3.length === 5 && o3[0].id === 'gruas' && o3[0].nombre === 'Torres grúa' && o3[0].retirado === '1' && o3[0].queda === '2' && /lado norte/.test(o3[0].obs) &&
   o3[1].mide === 'pct' && o3[1].pct === '40' && o3[4].retirado === '0' && o3[4].queda === '6' && o3[2].retirado === '' && Array.isArray(d3.fotosObstaculos), JSON.stringify(o3[0]) + ' ' + JSON.stringify(o3[1]));

// ── 8 (antes de contestar nada más): un informe solo con obstáculos ──
cierre();
const f8 = faltan(datosDelFormulario());
guardar(false); const id8 = idActual;
ok('8 · Un informe que solo trae obstáculos (y el cierre) no está vacío: se guarda y no le falta nada',
   f8.length === 0 && !!id8 && listaGuardada().some(x => x.id === id8 && x.obstaculos[0].retirado === '1'), 'falta: ' + (f8.join(', ') || 'nada') + ' · guardado ' + !!id8);

// ── 4 ──
await nuevo();
const limpio4 = !hayObstaculos(leerObstaculos());
cargarInforme(id8); await esperar(200); verPanel('d');
ok('4 · Un informe nuevo abre el bloque en blanco; al reabrir el guardado vuelven sus cantidades, el «Queda 60 %» y la observación',
   limpio4 && fila('gruas').querySelector('.obst-ret').value === '1' && fila('gruas').querySelector('.obst-queda').value === '2' &&
   fila('chatarra').querySelector('.obst-pct').value === '40' && fila('chatarra').querySelector('.obst-resto').textContent === 'Queda 60 %' &&
   /lado norte/.test(fila('gruas').querySelector('.obst-obs').value) && fila('andamios').querySelector('.obst-ret').value === '0', 'limpio ' + limpio4 + ' · grúas ' + fila('gruas').querySelector('.obst-ret').value);

// ── 5 ──
const cam = $('#panel-d .btn-camara input'), grid = $('#fotos-obst');
Q.ponerFotos(cam, [await Q.foto(800, 600, 7)]);
await hasta(() => grid.children.length === 1, 30000);
guardar(false);
await enviar(); await esperar(800);
const env = (await Q.envios()).filter(e => e.tipo === 'sha').slice(-1)[0] || {}, dE = env.datos || {};
ok('5 · El envío lleva los obstáculos y su foto, con nombre «obst-1»',
   (dE.obstaculos || []).length === 5 && dE.obstaculos[0].retirado === '1' && dE.obstaculos[1].pct === '40' && (dE.fotosObstaculos || []).length === 1 &&
   (env.fotos || []).some(n => /^obst-1/.test(String(n))), (env.numero || 'sin envío') + ' · fotos ' + (env.fotos || []).join(','));

// ── 6 ──
await nuevo(); insp(); Q.elegir(torre, t1.t); await hasta(() => $('#aviso-historial .si'), 8000, 100);
if ($('#aviso-historial .si')) $('#aviso-historial .si').click(); await esperar(300); verPanel('d');
const nota6 = ($('#obst-de') || {}).textContent || '';
ok('6 · En la visita siguiente a la misma torre, al traer lo anterior vienen las cantidades acumuladas, sin la observación, y dice de qué informe salen',
   fila('gruas').querySelector('.obst-ret').value === '1' && fila('gruas').querySelector('.obst-queda').value === '2' && fila('chatarra').querySelector('.obst-pct').value === '40' &&
   fila('gruas').querySelector('.obst-obs').value === '' && /Cantidades traídas de .*SHA-/.test(nota6) && !$('#obst-de').hidden && $('#fotos-obst').children.length === 0, nota6 + ' · fotos ' + $('#fotos-obst').children.length);

// ── 7 ──
const her7 = $('#panel-d').dataset.heredado;
Q.aceptar = true; Q.elegir(torre, t2.t); await esperar(200); if ($('#aviso-historial .no')) $('#aviso-historial .no').click(); await esperar(100);
const blanco7 = !hayObstaculos(leerObstaculos()) && $('#obst-de').hidden;
// y si el inspector ya lo tocó, es de hoy: no se suelta
Q.elegir(torre, t1.t); await hasta(() => $('#aviso-historial .si'), 8000, 100); if ($('#aviso-historial .si')) $('#aviso-historial .si').click(); await esperar(300);
pon('gruas', '.obst-ret', '2'); pon('gruas', '.obst-queda', '1');
ok('7 · Al cambiar de torre, lo traído de la otra se suelta y el bloque vuelve a estar en blanco; lo que el inspector ya tocó deja de contar como traído',
   !!her7 && blanco7 && !$('#panel-d').dataset.heredado && datosDelFormulario().obstaculos[0].retirado === '2', 'traído de ' + her7 + ' · en blanco ' + blanco7 + ' · tras tocar, heredado: ' + ($('#panel-d').dataset.heredado || 'no'));

// ── 9 ──
verPanel('d'); await esperar(100);
const ancho = window.innerWidth, tabs = $$('.pestanas button').map(b => b.getBoundingClientRect());
const cosas = $$('#panel-d .fila-obst, #panel-d .obst-campos input, #panel-d .obst-intro').map(e => e.getBoundingClientRect());
ok('9 · A ' + ancho + ' px las cuatro pestañas y el bloque caben: nada se sale ni ensancha la página, y las casillas miden al menos 44 px',
   tabs.length === 4 && tabs.every(r => r.left >= 0 && r.right <= ancho + 1 && r.height >= 44) && cosas.every(r => r.left >= 0 && r.right <= ancho + 1) &&
   $$('#panel-d .obst-campos input').every(i => i.getBoundingClientRect().height >= 44) && document.documentElement.scrollWidth <= ancho + 1,
   'pestañas ' + tabs.map(r => Math.round(r.width) + '×' + Math.round(r.height)).join(' ') + ' · scrollWidth ' + document.documentElement.scrollWidth + ' / ' + ancho);
