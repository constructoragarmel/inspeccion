// QC del r41 (2-oct-2026): un hallazgo de SHA de un informe de varias torres queda en TODAS ellas en el tablero.
// Se corre en pdf/index.html del banco con Codigo.gs y Sha.gs cargados:  eval(await (await fetch('t60torres.js')).text())
(function () {
  var R = [], ok = function (n, c, d) { R.push((c ? '✅ ' : '❌ ') + n + ' — ' + d); };
  var T = function (torre, ubic) { return _torresDeSha({ torre: torre, ubicacion: ubic }).join(','); };
  ok('1 · Un informe de una sola torre deja su torre', T('EZ-T15', '') === 'EZ-T15', T('EZ-T15', ''));
  ok('2 · Uno de varias torres las deja todas, con la del informe primero y sin repetir', T('EZ-T15', 'T-15 · T-14 · T-13') === 'EZ-T15,EZ-T14,EZ-T13' && T('EZ-T04', 'T-04 · T-01') === 'EZ-T04,EZ-T01', T('EZ-T15', 'T-15 · T-14 · T-13'));
  ok('3 · Las torres de Simón Bolívar (J-09, D-08) también', T('SB-J09', 'J-09 · J-10 · D-08') === 'SB-J09,SB-J10,SB-D08', T('SB-J09', 'J-09 · J-10 · D-08'));
  ok('4 · «Toda la zona» o una manzana no son torres del padrón: no entra nada inventado', T('EZ-ZONA', 'Toda la zona Ezequiel Zamora') === '' && T('EZ-T07', 'T-07 · M-1 L2 · T-99') === 'EZ-T07', '«' + T('EZ-ZONA', 'Toda la zona Ezequiel Zamora') + '» · ' + T('EZ-T07', 'T-07 · M-1 L2 · T-99'));
  return R.join('\n');
})();
