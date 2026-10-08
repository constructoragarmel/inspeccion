// QC del r52 (8-oct-2026, ADR-0048): el PDF de obra no hace ninguna cuenta mientras los presupuestos se actualizan. Se corre con headless-relevo.py y "Particion.gs,Copiar.gs,Oficina.gs,Codigo.gs".
(function () {
  var R = [], ok = function (n, c, d) { R.push((c ? '✅ ' : '❌ ') + n + ' — ' + d); };
  window.Logger = { log: function () {} };
  var fila = function (pr, ej, ev) { return { pr: pr, ej: ej, ev: ev || '' }; };
  var base = function (torre, ambito, partidas, noInsp, hitoPct) {
    window._torreCompuesta = function (p) { return (torre.indexOf('J') === 0 ? 'SB-' : 'EZ-') + String(p.torre).replace('-', ''); };
    return { numero: 'PRUEBA-X-' + torre + '-261008-XX', tipo: 'obra', sector: torre.indexOf('J') === 0 ? 'SB' : 'EZ', torre: torre, fotos: [],
             datos: { lista: 'v2', ambito: ambito, fecha: '2026-10-08', piso: ambito === 'torre' ? '' : 'Piso 01', apto: ambito === 'torre' ? '' : 'A', inspectores: ['Inspector Uno'], residentes: ['Ing. Residente Uno'],
                      estatus: ['En ejecución'], convenio: 'Convenio Bielorrusos', obs_general: '', noInspeccionados: noInsp || [], fotobs: {}, partidas: partidas, hitoPct: hitoPct || {} } };
  };
  var p1 = base('T-01', 'torre', { hito_estructura: [fila('10', '10'), fila('10', '10'), fila('10', '10')], hito_acabados: [fila('100', '50'), fila('100', '0')], hito_servicios: [fila('4', '4')] });
  var h1 = '', e1 = ''; try { h1 = _pdfHtml(p1); } catch (x) { e1 = x.message + ' ' + (x.stack || '').split('\n')[1]; }
  ok('R1 · Torre con presupuesto: el PDF no trae «Avance físico», «Avance del contrato», «Promedio simple» ni el rótulo «AVANCE DE LA TORRE»',
     !e1 && !/Avance físico|Avance del contrato|Promedio simple|AVANCE DE LA TORRE|Avance: \d/.test(h1), e1 || '');
  ok('R2 · En su lugar va la nota «REGISTRO DE LO OBSERVADO» que dice qué no incluye y que no es el financiero',
     /REGISTRO DE LO OBSERVADO/.test(h1) && /no incluye promedios por hito ni avance ponderado por presupuesto/.test(h1) && /No es el avance financiero/.test(h1), '');
  ok('R3 · Sin columna «Peso» y sin número a la derecha del nombre del hito', !/>Peso</.test(h1) && !/ %<\/td>\s*<\/tr>\s*<\/table>/.test(h1.split('Tabla')[0]) && !/HITO 1: ESTRUCTURA<\/td>\s*<td[^>]*>\s*\d+ %/.test(h1), '');
  ok('R4 · Cada fila conserva su propio porcentaje (100 de 100 → «50 %» en la fila de acabados)', /<td align="right">50 %<\/td>/.test(h1) && /<td align="right">100 %<\/td>/.test(h1), '');
  var p2 = base('T-01', 'torre', { hito_acabados: [fila('100', '50')] }, [], { hito_acabados: '40' });
  var h2 = _pdfHtml(p2);
  ok('R5 · El % escrito a mano por el inspector (modo por hitos) sí sale: «Avance declarado: 40 %»', /Avance declarado: 40 %/.test(h2), '');
  ok('R6 · La leyenda ya no habla de promedio y NO INSPECCIONADO dice «no es un cero»', !/no entra en el promedio/.test(h1) && /NO INSPECCIONADO: el hito no se verificó en esta visita — no es un cero/.test(h1), '');
  ok('R7 · La versión del relevo es r52 o posterior', typeof RELEVO_VERSION === 'string' && /^r5[2-9]-/.test(RELEVO_VERSION), String(typeof RELEVO_VERSION === 'string' ? RELEVO_VERSION : 'sin versión'));
  var antes = PDF_SIN_CUENTAS; PDF_SIN_CUENTAS = false; var h3 = ''; try { h3 = _pdfHtml(p1); } catch (x) { h3 = ''; } PDF_SIN_CUENTAS = antes;
  ok('R8 · Con PDF_SIN_CUENTAS en false vuelven los dos totales del r51 (físico 75 %), sin tocar nada más', /Avance físico de la torre<\/div><div[^>]*>75 %/.test(h3) && /Avance del contrato \(/.test(h3), '');
  var p4 = base('J-07', 'torre', { hito_estructura: [fila('10', '5')] });
  var h4 = _pdfHtml(p4);
  ok('R9 · Torre sin presupuesto: la misma nota, sin «llega con el presupuesto»', /REGISTRO DE LO OBSERVADO/.test(h4) && !/llega con el presupuesto/.test(h4), '');
  return R.join('\n');
})();
