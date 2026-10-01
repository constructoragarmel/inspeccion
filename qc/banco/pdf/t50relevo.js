// TANDA 50, lado del relevo (r35, 1-oct-2026): el cero escrito. Se corre en pdf/index.html del banco (Smartsheet.gs, PDF.gs,
// ListaV2.gs, Pesos.gs y Avance.gs del repositorio Garmel), con:  eval(await (await fetch('t50relevo.js')).text())
(function () {
  var R = [];
  var ok = function (n, c, d) { R.push((c ? '✅ ' : '❌ ') + n + ' — ' + d); };
  var F = function (ej, pr, ev, pct) { return { pr: pr, ej: ej, ev: ev || '', ud: 'pza', sn: '', pct: pct || '' }; };
  var a = [_pdfPctFila(F('0', '')), _pdfPctFila(F('0', '0')), _pdfPctFila(F('0,0', ''))];
  ok('R1 · PDF y avance: «0» sin total, «0 de 0» y «0,0» dan 0 %', a.join() === '0,0,0', a.join(' · '));
  var b = [_pdfPctFila(F('', '')), _pdfPctFila(F('3', '')), _pdfPctFila({}), _pdfPctFila(F(undefined, undefined))];
  ok('R2 · Vacío no es cero, y una cantidad sin total sigue sin porcentaje', b.every(function (x) { return x === null; }), JSON.stringify(b));
  var c = [_pdfPctFila(F('0', '', 'N/A')), _pct(F('0', '', 'N/A'))];
  ok('R3 · N/A sigue fuera aunque traiga un cero', c[0] === null && c[1] === '', JSON.stringify(c));
  var d = [_pdfPctFila(F('2', '4')), _pdfPctFila(F('0', '5')), _pdfPctFila(F('0', '', '', '40')), _pdfPctFila({ pr: '100', ej: '75', ev: '', ud: 'estado' })];
  ok('R4 · Lo de antes no cambia: 2 de 4 = 50, 0 de 5 = 0, el % escrito manda (40), estado 75', d.join() === '50,0,40,75', d.join(' · '));
  var e = [_pct(F('0', '')), _pct(F('0', '0')), _pct(F('', '')), _pct(F('3', '')), _pct(F('2', '4'))];
  ok('R5 · Smartsheet («Avance subpartida %») sigue la misma regla: 0, 0, vacío, vacío, 50', e[0] === 0 && e[1] === 0 && e[2] === '' && e[3] === '' && e[4] === 50, JSON.stringify(e));
  // Un informe entero: el hito con una fila en cero sin total y otra completa
  var inf = { numero: 'PRUEBA-EZ-T56-P03-A-261001-XX', tipo: 'obra', sector: 'EZ', torre: 'T-56', fotos: [],
              datos: { lista: 'v2', ambito: 'apartamento', fecha: '2026-10-01', piso: 'Piso 03', apto: 'A', partidas: {} } };
  var h = HITOS_V2.filter(function (x) { return x.id === 'hito_puertas'; })[0];
  inf.datos.partidas.hito_puertas = h.codigos.map(function (_, i) { return i === 0 ? F('0', '') : i === 1 ? F('4', '4') : F('', ''); });
  var html = '', err = '';
  try { html = _pdfHtml(inf, _avancePonderado(inf)); } catch (x) { err = x.message; }
  ok('R6 · El PDF de un informe con «0» sin total se arma y la fila sale con 0 %', !err && /0\s*%/.test(html) && /100\s*%/.test(html), err || 'arma ' + html.length + ' caracteres');
  return R.join('\n');
})()
