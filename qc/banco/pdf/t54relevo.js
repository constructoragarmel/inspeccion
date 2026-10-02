// QC del desmontaje de obstáculos en el relevo (r37, 2-oct-2026): la sección del PDF de SHA y las filas de Smartsheet.
// Se corre en pdf/index.html del banco con Sha.gs cargado:  eval(await (await fetch('t54relevo.js')).text())
(function () {
  var R = [], ok = function (n, c, d) { R.push((c ? '✅ ' : '❌ ') + n + ' — ' + d); };
  window.Logger = { log: function () {} };
  window._torreCompuesta = function (p) { return 'EZ-' + String(p.torre).replace('-', ''); };
  var O = function (id, nombre, mide, ret, queda, pct, obs) { return { id: id, nombre: nombre, mide: mide, retirado: ret, queda: queda, pct: pct, obs: obs || '' }; };
  var base = function (obst) {
    return { numero: 'PRUEBA-SHA-EZ-T56-261002-XX', tipo: 'sha', sector: 'EZ', torre: 'T-56', carpetaUrl: 'https://carpeta', fotos: [],
             datos: { tipo: 'sha', torre: 'T-56', fecha: '2026-10-02', empresa: 'CONTRATISTA DE PRUEBA', inspectores: ['Inspector Uno'], residentes: ['Ing. Residente Uno'], estatus: ['Aprobado'],
                      general: [], apartamentos: [], incidencias: [], obstaculos: obst } };
  };
  var cinco = [O('gruas', 'Torres grúa', 'cant', '1', '2', '', 'La del lado norte sigue anclada.'), O('chatarra', 'Chatarra', 'pct', '', '', '40'),
               O('vehiculos', 'Camiones y maquinaria averiados', 'cant', '', '', ''), O('ascensores_carga', 'Ascensores de carga', 'cant', '0', '1', ''),
               O('andamios', 'Andamios', 'cant', '', '', '')];

  // ── 1. El PDF ──
  var p1 = base(cinco); p1.fotos = [{ nombre: 'obst-1', dato: 'data:image/jpeg;base64,AAAA' }]; p1.datos.fotosObstaculos = [{ pie: 'Grúa norte' }];
  var h1 = _pdfHtmlSha(p1);
  var fila = function (n) { var m = new RegExp('<td>' + n + '</td><td align="center">([^<]*)</td><td align="center">([^<]*)</td>').exec(h1); return m ? m[1] + '/' + m[2] : '?'; };
  ok('R1 · El PDF de SHA trae «Desmontaje de obstáculos» con las filas que tienen dato: grúas 1 y 2, chatarra 40 % y 60 %, ascensores de carga 0 y 1; y su foto',
     /DESMONTAJE DE OBST/.test(h1) && fila('Torres grúa') === '1/2' && fila('Chatarra') === '40 %/60 %' && fila('Ascensores de carga') === '0/1' &&
     !/Andamios/.test(h1) && !/Camiones y maquinaria/.test(h1) && /lado norte/.test(h1) && /Grúa norte/.test(h1) && /acumulado a la fecha/.test(h1),
     fila('Torres grúa') + ' · ' + fila('Chatarra') + ' · ' + fila('Ascensores de carga'));

  // ── 2. Sin obstáculos, la sección no sale ──
  var h2 = _pdfHtmlSha(base([O('gruas', 'Torres grúa', 'cant', '', '', '')])), p2b = base(); delete p2b.datos.obstaculos;
  ok('R2 · Un informe sin nada escrito en obstáculos, o de antes de que existieran, sale sin esa sección', !/DESMONTAJE DE OBST/.test(h2) && !/DESMONTAJE DE OBST/.test(_pdfHtmlSha(p2b)), 'sin sección');

  // ── 3. Las filas de Smartsheet ──
  var com = { 'N° de informe': p1.numero, 'Sector': 'Ezequiel Zamora', 'Torre': 'EZ-T56', 'Fecha de inspección': '2026-10-02', 'Empresa ejecutora': 'CONTRATISTA DE PRUEBA' };
  var v3 = _valoresDeObstaculos(p1, com), g = v3[0], c = v3[1], a = v3[2];
  ok('R3 · A Smartsheet va una fila por obstáculo con dato: las cantidades como número, el % de las que se cuentan sale de las dos cantidades (1 de 3 = 33) y el de la chatarra es el escrito',
     v3.length === 3 && g['Clave'] === p1.numero + '|obst|gruas' && g['Retirado a la fecha'] === 1 && g['Queda por retirar'] === 2 && g['% retirado'] === 33 &&
     c['Obstáculo'] === 'Chatarra' && c['% retirado'] === 40 && c['Retirado a la fecha'] === '' && a['Retirado a la fecha'] === 0 && a['% retirado'] === 0 &&
     g['N° de fotos'] === 1 && g['Inspector(es)'] === 'Inspector Uno', JSON.stringify([g['Retirado a la fecha'], g['Queda por retirar'], g['% retirado'], c['% retirado'], a['% retirado']]));

  // ── 4. El empuje: sin hoja no hace nada; con hoja, reemplaza las del informe ──
  var puestas = [], borradoDe = [];
  window._reemplazarPorNumero = function (t, hoja, numero) { borradoDe.push(hoja + ':' + numero); return { borradas: 0, revision: 0 }; };
  window._fila = function (t, hoja, v) { return v; };
  window._postEnTandas = function (t, hoja, filas) { filas.forEach(function (f) { puestas.push(hoja + ':' + f['Obstáculo']); }); };
  var sin = _empujarObstaculosSha('t', { getProperty: function () { return null; } }, p1, com);
  var con = _empujarObstaculosSha('t', { getProperty: function (k) { return k === 'SS_SHA_OBSTACULOS' ? '77' : null; } }, p1, com);
  ok('R4 · Si la hoja de obstáculos todavía no existe, el empuje no hace nada y no tumba el de SHA; cuando existe, reemplaza las filas de ese informe',
     sin === null && con === 3 && borradoDe.join() === '77:' + p1.numero && puestas.join() === '77:Torres grúa,77:Chatarra,77:Ascensores de carga', 'sin hoja: ' + sin + ' · con hoja: ' + con + ' · ' + puestas.join(' | '));
  return R.join('\n');
})();
