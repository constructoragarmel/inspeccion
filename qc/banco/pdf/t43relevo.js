// QC 9 y 10 de la v100 (1-oct-2026), del lado del relevo. Se corren en una página que cargue Smartsheet.gs, PDF.gs,
// ListaV2.gs, Pesos.gs y Avance.gs del repositorio Garmel (como pdf/index.html, con los mismos sustitutos), con:
//   eval(await (await fetch('t43relevo.js')).text())
(function () {
  var R = [];
  var ok = function (n, c, d) { R.push((c ? '✅ ' : '❌ ') + n + ' — ' + d); };
  var torreDe = { 'T-56': 'EZ-T56', 'D-08': 'SB-D08', 'J-07': 'SB-J07', 'T-12': 'SR-T12', 'T-13': 'SR-T13', 'T-38': 'SR-T38', 'T-39': 'SR-T39' };
  var sectorDe = { 'T-56': 'EZ', 'D-08': 'SB', 'J-07': 'SB', 'T-12': 'SR', 'T-13': 'SR', 'T-38': 'SR', 'T-39': 'SR' };
  _torreCompuesta = function (p) { return torreDe[p.torre]; };
  _fila = function (token, hoja, o) { return o; };
  var E = function (v) { return { pr: '100', ej: String(v), ev: '', ud: 'estado', sn: '', pct: '' }; };
  var C = function (e, p) { return { pr: p, ej: e, ev: '', ud: 'pza', sn: '', pct: '' }; };

  // ── 9. Un informe de antes (hito 12 con 5 filas) en el PDF y en las filas de Smartsheet ──
  var viejo = { numero: 'PRUEBA-EZ-T56-260929-XX', tipo: 'obra', sector: 'EZ', torre: 'T-56', fotos: [],
                datos: { lista: 'v2', ambito: 'torre', fecha: '2026-09-29',
                         partidas: { hito_contra_incendio: [E(50), C('2', '4'), C('6', '6'), E(75), C('0', '1')] } } };
  var av = _avancePonderado(viejo);
  var html = _pdfHtml(viejo, av);
  var filas = [], error = '';
  try { filas = _filasDeSubpartidas(null, null, viejo, viejo.datos, true, av); } catch (e) { error = e.message; }
  var f12 = filas.filter(function (f) { return /^12\./.test(f['Código']); });
  ok('9 · Un informe de antes con el hito 12 de 5 filas: el PDF nombra gabinetes y extintores (no montante ni siamesa) y Smartsheet recibe 12.02 a 50 % y 12.03 a 100 %',
     !error && /Gabinetes de manguera/.test(html) && /Extintores/.test(html) && !/Montante contra incendio|Siamesa/.test(html) &&
     f12.length === 2 && f12[0]['Código'] === '12.02' && String(f12[0]['Avance subpartida %']) === '50' && String(f12[1]['Avance subpartida %']) === '100',
     (error || 'filas 12: ' + f12.map(function (f) { return f['Código'] + '=' + f['Avance subpartida %']; }).join(', ')));

  // ── 10. Pesos coherentes con la lista y torres de la Inmobiliaria sin presupuesto ──
  var codigos = {}; HITOS_V2.forEach(function (h) { h.codigos.forEach(function (c) { codigos[c] = true; }); });
  var malas = [];
  Object.keys(PESOS_POR_TORRE.torres).forEach(function (t) {
    var p = PESOS_POR_TORRE.torres[t].pesos, s = 0;
    Object.keys(p).forEach(function (c) { s += p[c]; if (!codigos[c]) malas.push(t + ':' + c); });
    if (Math.abs(s - 1) > 0.002) malas.push(t + ' suma ' + s.toFixed(4));
  });
  var inmo = ['D-08', 'J-07', 'T-12', 'T-13', 'T-38', 'T-39'].filter(function (t) {
    return !_aplicaDeTorre({ torre: t, sector: sectorDe[t] }).sinPresupuesto; });
  var t56 = _aplicaDeTorre({ torre: 'T-56', sector: 'EZ' }).codigos || [];
  ok('10 · Pesos: 34 torres, cada una suma 1 y solo usa códigos de la lista (ninguno retirado); las 6 de la Inmobiliaria salen sin presupuesto',
     Object.keys(PESOS_POR_TORRE.torres).length === 34 && malas.length === 0 && inmo.length === 0 &&
     t56.indexOf('9.05') >= 0 && t56.indexOf('12.01') < 0,
     Object.keys(PESOS_POR_TORRE.torres).length + ' torres · problemas: ' + (malas.join(', ') || 'ninguno') +
     ' · Inmobiliaria con presupuesto: ' + (inmo.join(',') || 'ninguna') + ' · T-56 trae 9.05: ' + (t56.indexOf('9.05') >= 0));
  return R;
})();
