// QC del r51 (8-oct-2026): el recuadro del PDF trae dos totales con nombre, avance físico y avance del contrato. Se corre con headless-relevo.py y "Particion.gs,Copiar.gs,Oficina.gs".
(function () {
  var R = [], ok = function (n, c, d) { R.push((c ? '✅ ' : '❌ ') + n + ' — ' + d); };
  window.Logger = { log: function () {} };
  var fila = function (pr, ej, ev) { return { pr: pr, ej: ej, ev: ev || '' }; };
  var base = function (torre, ambito, partidas, noInsp) {
    window._torreCompuesta = function (p) { return (torre.indexOf('J') === 0 ? 'SB-' : 'EZ-') + String(p.torre).replace('-', ''); };
    return { numero: 'PRUEBA-X-' + torre + '-261008-XX', tipo: 'obra', sector: torre.indexOf('J') === 0 ? 'SB' : 'EZ', torre: torre, fotos: [],
             datos: { lista: 'v2', ambito: ambito, fecha: '2026-10-08', piso: ambito === 'torre' ? '' : 'Piso 01', apto: ambito === 'torre' ? '' : 'A', inspectores: ['Inspector Uno'], residentes: ['Ing. Residente Uno'],
                      estatus: ['En ejecución'], convenio: 'Convenio Bielorrusos', obs_general: '', noInspeccionados: noInsp || [], fotobs: {}, partidas: partidas } };
  };
  // Torre con presupuesto (EZ-T01): estructura 100 (3 filas), acabados 50 y 0, servicios 100 → físico = floor((100 + 25 + 100) / 3) = 75
  var p1 = base('T-01', 'torre', { hito_estructura: [fila('10', '10'), fila('10', '10'), fila('10', '10')], hito_acabados: [fila('100', '50'), fila('100', '0')], hito_servicios: [fila('4', '4')] });
  var h1 = '', e1 = ''; try { h1 = _pdfHtml(p1); } catch (x) { e1 = x.message + ' ' + (x.stack || '').split('\n')[1]; }
  var fis1 = (h1.match(/Avance físico de la torre<\/div><div[^>]*>(\d+|—) %?/) || [])[1];
  ok('R1 · El recuadro dice «Avance físico de la torre» con el promedio simple de los hitos (75 %)', !e1 && fis1 === '75', e1 || ('físico ' + fis1));
  ok('R2 · Y «Avance del contrato» con el ponderado y su cobertura', /Avance del contrato \(/.test(h1) && /Según el presupuesto, sobre lo medido/.test(h1) && /del peso de la torre/.test(h1), (h1.match(/Avance del contrato[^<]*<\/div><div[^>]*>([^<]*)/) || [])[1] || '');
  ok('R3 · La línea explica qué mide cada uno y que ninguno es el financiero', /dice cuánto está construido/.test(h1) && /Ninguno de los dos es el avance financiero/.test(h1), '');
  // Un hito no inspeccionado no entra al físico: sin acabados, físico = 100
  var p2 = base('T-01', 'torre', p1.datos.partidas, ['hito_acabados']);
  var h2 = _pdfHtml(p2); var fis2 = (h2.match(/Avance físico de la torre<\/div><div[^>]*>(\d+|—) %?/) || [])[1];
  ok('R4 · Un hito no inspeccionado no entra al físico (100 %)', fis2 === '100', 'físico ' + fis2);
  // Apartamento: la etiqueta cambia
  var p3 = base('T-01', 'apartamento', { hito_acabados: [fila('100', '50')] });
  var h3 = _pdfHtml(p3);
  ok('R5 · En un apartamento dice «Avance físico del apartamento» y «AVANCE DEL APARTAMENTO»', /Avance físico del apartamento/.test(h3) && /AVANCE DEL APARTAMENTO/.test(h3), '');
  // Sin presupuesto (SB-J07): el físico sale, el del contrato en — con la nota
  var p4 = base('J-07', 'torre', { hito_estructura: [fila('10', '5')] });
  var h4 = _pdfHtml(p4);
  ok('R6 · Sin presupuesto: el físico sale (50 %) y el del contrato dice «—» con «llega con el presupuesto»', /Avance físico de la torre<\/div><div[^>]*>50 %/.test(h4) && /no tiene presupuesto cargado: este número llega con el presupuesto/.test(h4), (h4.match(/Avance físico de la torre<\/div><div[^>]*>([^<]*)/) || [])[1] || '');
  return R.join('\n');
})();
