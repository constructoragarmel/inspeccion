// QC del r49 (7-oct-2026): mediciones copiadas de otro apartamento o de otra torre. Se corre con headless-relevo.py y "Particion.gs,Copiar.gs,Oficina.gs".
(function () {
  var R = [], ok = function (n, c, d) { R.push((c ? '✅ ' : '❌ ') + n + ' — ' + d); };
  window.Logger = { log: function () {} };
  window._torreCompuesta = function (p) { return 'EZ-' + String(p.torre).replace('-', ''); };
  var fila = function (pr, ej, extra) { var f = { pr: pr, ej: ej, ev: '' }; if (extra) Object.keys(extra).forEach(function (k) { f[k] = extra[k]; }); return f; };
  var base = function (copiadoDe, partidas) {
    return { numero: 'PRUEBA-EZ-T01-P03AA2-261007-XX', tipo: 'obra', sector: 'EZ', torre: 'T-01', fotos: [],
             datos: { lista: 'v2', ambito: 'apartamento', fecha: '2026-10-07', piso: 'Piso 03', apto: 'A2', inspectores: ['Inspector Uno'], residentes: ['Ing. Residente Uno'],
                      estatus: ['En ejecución'], convenio: 'Convenio Bielorrusos', obs_general: '', noInspeccionados: [], fotobs: {}, copiadoDe: copiadoDe, partidas: partidas } };
  };
  var origen = { nro: 'EZ-T01-P02AA1-261006-XX', torre: 'T-01', piso: 'Piso 02', apto: 'A1', fecha: '2026-10-06' };
  // 1. Copiadas y confirmadas
  var p1 = base(origen, { hito_acabados: [fila('100', '50', { copiadoDe: origen.nro }), fila('100', '25', { copiadoDe: origen.nro })], hito_servicios: [fila('18', '8')] });
  var h1 = '', e1 = ''; try { h1 = _pdfHtml(p1); } catch (x) { e1 = x.message + ' ' + (x.stack || '').split('\n')[1]; }
  ok('R1 · El PDF dice «Mediciones a partir de» con el número de origen, dónde, la fecha y «2 filas confirmadas en sitio»', !e1 && /Mediciones a partir de/.test(h1) && /EZ-T01-P02AA1-261006-XX \(T-01 · Piso 02 apto A1, 2026-10-06\) · 2 filas confirmadas en sitio/.test(h1), e1 || (h1.match(/Mediciones a partir de<\/td><td[^>]*>([^<]*)/) || [])[1] || h1.slice(h1.indexOf('Mediciones a partir de'), h1.indexOf('Mediciones a partir de') + 160));
  // 2. Una sin confirmar (heredado: true) se dice
  var p2 = base(origen, { hito_acabados: [fila('100', '50', { copiadoDe: origen.nro, heredado: true }), fila('100', '25', { copiadoDe: origen.nro })] });
  var h2 = _pdfHtml(p2);
  ok('R2 · Si quedó una fila copiada sin confirmar, el PDF lo dice: «1 fila(s) sin confirmar en sitio»', /1 fila\(s\) sin confirmar en sitio/.test(h2), (h2.match(/· \d+ fila[^<]*/) || [''])[0]);
  // 3. Sin copiadoDe no sale la fila
  var h3 = _pdfHtml(base(null, { hito_acabados: [fila('100', '50')] }));
  ok('R3 · Sin copia la fila no sale', !/Mediciones a partir de/.test(h3), '');
  // 4. Origen de torre
  var h4 = _pdfHtml(base({ nro: 'EZ-T02-P--A---261006-XX', torre: 'T-02', piso: '', apto: '', fecha: '2026-10-06' }, { hito_acabados: [fila('100', '50', { copiadoDe: 'x' })] }));
  ok('R4 · Un origen de torre se describe como «T-02 · torre»', /\(T-02 · torre, 2026-10-06\)/.test(h4), (h4.match(/Mediciones a partir de<\/td><td[^>]*>([^<]*)/) || [])[1] || '');
  // 5. Copiar.gs cargado: las dos consultas y el texto
  ok('R5 · Copiar.gs está cargado: _copiarFuentes, _copiarAbrir, _copiadoDeTexto y _copiarFilasMedidas existen', typeof _copiarFuentes === 'function' && typeof _copiarAbrir === 'function' && typeof _copiadoDeTexto === 'function' && _copiarFilasMedidas({ a: [fila('1', ''), fila('', ''), { pr: '', ej: '', sn: 'SI' }], b_extra: [fila('1', '1')] }) === 2, String(_copiarFilasMedidas({ a: [fila('1', ''), fila('', ''), { pr: '', ej: '', sn: 'SI' }] })));
  // 6. La versión del relevo
  ok('R6 · RELEVO_VERSION es r49 o posterior', /^r(49|5[0-9])-/.test(typeof RELEVO_VERSION !== 'undefined' ? RELEVO_VERSION : ''), typeof RELEVO_VERSION !== 'undefined' ? RELEVO_VERSION : 'sin RELEVO_VERSION');
  return R.join('\n');
})();
