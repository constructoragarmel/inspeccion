// QC del resumen de los lunes (ResumenLunes.gs, r39, 2-oct-2026): los puntos críticos de cada área, del tablero de pendientes,
// y en SHA lo corregido contra lo pendiente. Se corre en pdf/index.html del banco con ResumenLunes.gs cargado:
//   eval(await (await fetch('t58lunes.js')).text())
// Todo con filas inventadas; no toca Smartsheet ni Drive.
(function () {
  var R = [], ok = function (n, c, d) { R.push((c ? '✅ ' : '❌ ') + n + ' — ' + d); };
  var HOY = '2026-10-05';
  ok('1 · El resumen lleva la fecha del lunes al que corresponde: hoy si es lunes; si no, el siguiente',
     _lunProximoLunes('2026-10-05') === '2026-10-05' && _lunProximoLunes('2026-10-02') === '2026-10-05' && _lunProximoLunes('2026-10-06') === '2026-10-12' && _lunProximoLunes('2026-10-04') === '2026-10-05',
     [_lunProximoLunes('2026-10-02'), _lunProximoLunes('2026-10-06')].join(' · '));
  ok('2 · El estatus se reconoce por su texto, con o sin el color delante', [_lunEstado('🔴 No ejecutado'), _lunEstado('🟡 En ejecución'), _lunEstado('🔵 En espera'), _lunEstado('🟢 Ejecutado'), _lunEstado('Ejecutado'), _lunEstado('')].join() === 'rojo,amarillo,azul,verde,verde,',
     [_lunEstado('🔴 No ejecutado'), _lunEstado('🟢 Ejecutado')].join(' · '));

  var T = function (pend, est, o) { var v = { 'Pendiente': pend, 'Estatus': est, _mod: '2026-09-20' }; for (var k in (o || {})) v[k] = o[k]; return v; };
  var filas = [
    T('Punto viejo sin fecha', '🔴 No ejecutado', { 'Fecha de asignación': '2026-09-01', 'Torre(s)': 'EZ-T01, EZ-T02', 'Contratista': 'CONTRATISTA UNO' }),
    T('Punto vencido', '🟡 En ejecución', { 'Fecha de asignación': '2026-09-20', 'Fecha compromiso': '2026-10-01', 'Acción requerida': 'Terminar la tanquilla.' }),
    T('Punto de prioridad alta', '🔵 En espera', { 'Prioridad': '🔺 Alta', 'En espera de': 'HIDROVEN', 'Prestador / Ente': 'HIDROVEN', 'Fecha compromiso': '2026-10-20' }),
    T('Punto de prioridad baja', '🔴 No ejecutado', { 'Prioridad': '▽ Baja', 'Fecha de asignación': '2026-08-01' }),
    T('Cerrado esta semana', '🟢 Ejecutado', { 'Fecha de cierre': '2026-10-02' }),
    T('Cerrado hace un mes', '🟢 Ejecutado', { 'Fecha de cierre': '2026-09-01' }),
    T('Cerrado sin fecha, fila tocada ayer', '🟢 Ejecutado', { _mod: '2026-10-04' }),
    T('', '🔴 No ejecutado'), T('Fila sin estatus', '')
  ];
  var d = _lunDatos(filas, HOY);
  ok('3 · De un tablero salen los abiertos y, aparte, lo cerrado en los últimos siete días; las filas vacías o sin estatus no cuentan',
     d.abiertos.length === 4 && d.cerrados.length === 2 && d.cuenta.rojo === 2 && d.cuenta.amarillo === 1 && d.cuenta.azul === 1 && d.cuenta.vencidos === 1 &&
     d.cerrados.map(function (x) { return x.texto; }).join('|') === 'Cerrado sin fecha, fila tocada ayer|Cerrado esta semana',
     d.abiertos.length + ' abiertos · ' + d.cerrados.length + ' cerrados · ' + JSON.stringify(d.cuenta));
  ok('4 · El orden: lo vencido primero; después por prioridad; después lo no ejecutado antes que lo demás y lo más viejo arriba',
     d.abiertos.map(function (x) { return x.texto; }).join('|') === 'Punto vencido|Punto de prioridad alta|Punto de prioridad baja|Punto viejo sin fecha', d.abiertos.map(function (x) { return x.texto; }).join(' → '));

  var area = { clave: 'servicios', nombre: 'Servicios', hoja: 'SEG_Pendientes_Servicios' };
  var h = _lunHtml(area, d, null, '2026-10-05', '05/10/2026 a las 06:10');
  ok('5 · El documento: título del área y del lunes, la cuenta arriba, el vencido marcado, la acción bajo el punto, «en espera de» y lo cerrado; sin emoji',
     /PUNTOS CRÍTICOS — SERVICIOS/.test(h) && /Resumen del lunes 05\/10\/2026/.test(h) && /<b>4<\/b> abiertos/.test(h) && /<b>1<\/b> con el compromiso vencido/.test(h) &&
     /01\/10\/2026<br>vencido/.test(h) && /<b>Acción:<\/b> Terminar la tanquilla/.test(h) && /en espera de HIDROVEN/.test(h) && /Cerrado esta semana/.test(h) && !/Cerrado hace un mes/.test(h) &&
     !/[\u{1F534}\u{1F7E1}\u{1F535}\u{1F7E2}]/u.test(h) && /LO QUE SIGUE ABIERTO/.test(h), h.length + ' caracteres');
  var vacio = _lunHtml(area, _lunDatos([], HOY), null, '2026-10-05', 'x');
  ok('6 · Un tablero sin nada abierto lo dice, en vez de dejar una tabla vacía', /No hay puntos abiertos en el tablero/.test(vacio) && /No se cerró ningún punto/.test(vacio) && /<b>0<\/b> abiertos/.test(vacio), 'dicho');

  // ── SHA: del formulario ──
  var H = function (clave, num, fecha, est, o) { var v = { 'Clave de hallazgo': clave, 'N° de informe': num, 'Fecha de inspección': fecha, 'Estatus': est, 'Empresa ejecutora': 'CONTRATISTA UNO', 'Torre': 'EZ-T56' }; for (var k in (o || {})) v[k] = o[k]; return v; };
  var hall = [
    H('a', 'SHA-EZ-T56-260921-XX', '2026-09-21', 'Pendiente', { 'Hallazgo': 'Andamio sin rodapié.', 'Dónde': 'Fachada norte' }),
    H('a', 'SHA-EZ-T56-260928-XX', '2026-09-28', 'En proceso', { 'Hallazgo': 'Andamio sin rodapié.', 'Solución': 'Se pidió completar el andamio.', 'Responsable del correctivo': 'Ing. residente' }),
    H('b', 'SHA-EZ-T56-260921-XX', '2026-09-21', 'Pendiente', { 'Hallazgo': 'Hueco sin proteger.' }),
    H('b', 'SHA-EZ-T56-261001-XX', '2026-10-01', 'Corregido', { 'Hallazgo': 'Hueco sin proteger.', 'Solución': 'Se colocó tapa.' }),
    H('c', 'SHA-EZ-T55-260901-XX', '2026-09-01', 'Corregido', { 'Hallazgo': 'Corregido hace un mes.', 'Empresa ejecutora': 'CONTRATISTA DOS', 'Torre': 'EZ-T55' }),
    H('d', 'SHA-EZ-T55-260925-XX', '2026-09-25', '', { 'Hallazgo': 'Sin estatus.', 'Empresa ejecutora': 'CONTRATISTA DOS', 'Torre': 'EZ-T55', 'Ubicación': 'T-55 · T-54' }),
    H('z', 'PRUEBA-SHA-EZ-T01-261002-XX', '2026-10-02', 'Pendiente', { 'Hallazgo': 'De prueba.' })
  ];
  var s = _lunHallazgos(hall, HOY), a = s.pendientes.filter(function (x) { return /Andamio/.test(x.texto); })[0] || {};
  ok('7 · Cada hallazgo sale una sola vez con su último estatus; el que se corrigió esta semana va a «corregidos», el de hace un mes solo cuenta en el total, y los PRUEBA- no entran',
     s.pendientes.length === 2 && s.corregidos.length === 1 && s.corregidosEnTotal === 2 && s.corregidos[0].texto === 'Hueco sin proteger.' && s.corregidos[0].solucion === 'Se colocó tapa.',
     s.pendientes.length + ' pendientes · ' + s.corregidos.length + ' corregidos en la semana · ' + s.corregidosEnTotal + ' en total');
  ok('8 · El pendiente conserva desde cuándo está abierto (la primera visita), trae la solución y el responsable de la última, y el «dónde» aunque la última no lo repita',
     a.desde === '2026-09-21' && a.ultima === '2026-09-28' && a.dias === 14 && a.estatus === 'En proceso' && a.solucion === 'Se pidió completar el andamio.' && a.responsable === 'Ing. residente' && a.donde === 'Fachada norte',
     JSON.stringify([a.desde, a.dias, a.estatus, a.responsable, a.donde]));

  var Rc = function (num, fecha, torre, rec, resp) { return { 'N° de informe': num, 'Fecha de inspección': fecha, 'Empresa ejecutora': 'CONTRATISTA UNO', 'Torre': torre, 'Recaudo': rec, 'Respuesta': resp }; };
  var rec = _lunRecaudos([
    Rc('SHA-EZ-T56-260921-XX', '2026-09-21', 'EZ-T56', 'Programa de dotación de EPP', 'NO'), Rc('SHA-EZ-T56-260921-XX', '2026-09-21', 'EZ-T56', 'Matriz de riesgos', 'NO'),
    Rc('SHA-EZ-T56-260928-XX', '2026-09-28', 'EZ-T56', 'Programa de dotación de EPP', 'NO'), Rc('SHA-EZ-T56-260928-XX', '2026-09-28', 'EZ-T56', 'Matriz de riesgos', 'SI'),
    Rc('SHA-EZ-T57-260928-XX', '2026-09-28', 'EZ-T57', 'Programa de dotación de EPP', 'NO'), Rc('PRUEBA-SHA-EZ-T01-261002-XX', '2026-10-02', 'EZ-T01', 'Matriz de riesgos', 'NO')]);
  ok('9 · Los recaudos no presentados son los que quedaron en NO en la última visita a cada torre: el que ya se presentó deja de salir, y las torres de una misma contratista se juntan',
     rec.length === 1 && rec[0].recaudo === 'Programa de dotación de EPP' && rec[0].lugares.join() === 'EZ-T56,EZ-T57' && rec[0].ultima === '2026-09-28', JSON.stringify(rec));

  var I = function (clave, num, fecha, estado) { return { 'Clave de incidencia': clave, 'N° de informe': num, 'Fecha de inspección': fecha, 'Estado': estado, 'Empresa ejecutora': 'CONTRATISTA UNO', 'Torre': 'EZ-T56', 'Fecha del accidente': '2026-09-20', 'Tipo': 'Caída de objeto', 'Acciones': 'Colocar malla.' }; };
  var inc = _lunIncidencias([I('i1', 'SHA-EZ-T56-260921-XX', '2026-09-21', 'Abierta'), I('i1', 'SHA-EZ-T56-260928-XX', '2026-09-28', 'En seguimiento'), I('i2', 'SHA-EZ-T56-260921-XX', '2026-09-21', 'Abierta'), I('i2', 'SHA-EZ-T56-260928-XX', '2026-09-28', 'Cerrada')]);
  ok('10 · Las incidencias sin cerrar salen una vez, con su último estado; la que se cerró no sale', inc.length === 1 && inc[0].estado === 'En seguimiento' && inc[0].tipo === 'Caída de objeto', JSON.stringify(inc.map(function (x) { return x.estado; })));

  var sha = { pendientes: s.pendientes, corregidos: s.corregidos, corregidosEnTotal: s.corregidosEnTotal, recaudos: rec, incidencias: inc };
  var hs = _lunHtml({ clave: 'sha', nombre: 'SHA', hoja: 'SEG_Pendientes_Seguridad_Industrial' }, _lunDatos(filas.slice(0, 2), HOY), sha, '2026-10-05', '05/10/2026 a las 06:10');
  ok('11 · El de SHA trae el cuadro de corregido contra pendiente por contratista, los hallazgos sin corregir con su solución y su responsable, los corregidos, los recaudos y las incidencias; y los puntos del tablero aparte',
     /LO CORREGIDO CONTRA LO PENDIENTE, POR CONTRATISTA/.test(hs) && /HALLAZGOS SIN CORREGIR/.test(hs) && /Se pidió completar el andamio/.test(hs) && /Ing\. residente/.test(hs) && /14 d/.test(hs) &&
     /Se colocó tapa/.test(hs) && /Programa de dotación de EPP/.test(hs) && /EZ-T56, EZ-T57/.test(hs) && /En seguimiento/.test(hs) && /OTROS PUNTOS DE SEGURIDAD EN EL TABLERO/.test(hs) &&
     /T-55 · T-54/.test(hs) && /Sin estatus/.test(hs) && !/De prueba/.test(hs), hs.length + ' caracteres');
  var cuadro = /CONTRATISTA UNO<\/td><td[^>]*>(\d+)<\/td><td[^>]*>(\d+)<\/td><td[^>]*>(\d+)<\/td><td[^>]*>([^<]*)</.exec(hs) || [];
  ok('12 · El cuadro por contratista cuenta bien: CONTRATISTA UNO, 0 pendientes, 1 en proceso, 1 corregido en la semana, y su pendiente más viejo es del 21/09',
     cuadro[1] === '0' && cuadro[2] === '1' && cuadro[3] === '1' && cuadro[4] === '21/09/2026', cuadro.slice(1).join(' · '));
  return R.join('\n');
})();
