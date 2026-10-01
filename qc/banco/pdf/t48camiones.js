// QC de la hoja de camiones del relevo (Camiones.gs, r34, 1-oct-2026). Se corre en una página que tenga cargado
// Camiones.gs del repositorio Garmel (p. ej. pdf/index.html), con:  eval(await (await fetch('t48camiones.js')).text())
// Todo contra un Smartsheet y un Drive de mentira, con informes inventados.
(function () {
  var R = [], ok = function (n, c, d) { R.push((c ? '✅ ' : '❌ ') + n + ' — ' + d); };
  window.Logger = { log: function () {} };
  window.URB_HOJAS = [[], ['', 'Urbanismo Partidas']]; window.URB_ANIO = '2026';
  window._numero = function (v) { if (v === '' || v === null || v === undefined) return null; var n = parseFloat(String(v).replace(',', '.')); return isNaN(n) ? null : n; };
  window._nombreDeSector = function (s) { return ({ EZ: 'Ezequiel Zamora' })[s] || s; };
  var W = { rows: [], n: 1, borradas: 0, puestas: 0 };
  var cols = CAM_COLUMNAS.map(function (c, i) { return { id: 10 + i, title: c[0] }; });
  var arch = function (n, d) { return { getName: function () { return n; }, getBlob: function () { return { getDataAsString: function () { return JSON.stringify(d); } }; } }; };
  var iter = function (l) { var k = 0; return { hasNext: function () { return k < l.length; }, next: function () { return l[k++]; } }; };
  var informe = function (cam, fecha) { return { torre: 'M-2', fecha: fecha || '2026-10-02', empresa: 'CONTRATISTA DE PRUEBA', inspectores: ['Inspector Uno'],
    general: [{ id: 'urb_preliminares', items: [{ nombre: 'Desmalezamiento', cant: '5' }, { nombre: 'Bote de material', cant: '50', camiones: cam }] }] }; };
  var archivos = [arch('URB-EZ-M2-261002-GB.json', informe([{ placa: 'aa-11', m3: '10', viajes: '2' }, { placa: 'BB22', m3: '7,5', viajes: '' }])),
                  arch('PRUEBA-URB-EZ-M2-261002-GB.json', informe([{ placa: 'ZZ', m3: '1', viajes: '1' }])), arch('URB-EZ-M2-261001-GB.json', informe([]))];
  var datos = { getFiles: function () { return iter(archivos); } };
  var manzana = { getFoldersByName: function (n) { return iter(n === 'datos' ? [datos] : []); }, getUrl: function () { return 'https://carpeta/M-2'; } };
  var zona = { getFoldersByName: function (n) { return iter(n === 'Urbanismo' ? [{ getFolders: function () { return iter([manzana]); } }] : []); } };
  window.CARPETA_SECTOR = { EZ: 'idEZ' };
  window.DriveApp = { getFolderById: function () { return { getParents: function () { return iter([zona]); } }; } };
  window.PropertiesService = { getScriptProperties: function () { return { getProperty: function (k) { return ({ SS_TOKEN: 't', SS_URB_CAMIONES: '99' })[k] || null; }, setProperty: function () {} }; } };
  window._get = function () { return { columns: cols, rows: W.rows.map(function (r) { return { id: r.id, cells: cols.map(function (c) { return { columnId: c.id, value: r.v[c.title] }; }) }; }) }; };
  window._fila = function (t, h, v) { return v; };
  window._postEnTandas = function (t, h, fs) { fs.forEach(function (f) { W.rows.push({ id: W.n++, v: f }); W.puestas++; }); };
  window._delete = function (t, ruta) { var ids = /ids=([\d,]+)/.exec(ruta)[1].split(',').map(Number); W.rows = W.rows.filter(function (r) { return ids.indexOf(r.id) < 0; }); W.borradas += ids.length; };

  var f1 = _filasDeCamiones('URB-EZ-M2-261002-GB', 'EZ', informe([{ placa: 'a58ci8d', m3: '16', viajes: '1' }, { placa: 'x1', m3: '6', viajes: '' }]), 'u');
  ok('1 · Una fila por camión: placa en mayúsculas, m³ del día = m³ × viajes, y sin viajes vale 0',
     f1.length === 2 && f1[0]['Placa'] === 'A58CI8D' && f1[0]['m³ del día'] === 16 && f1[1]['Viajes'] === 0 && f1[1]['m³ del día'] === 0 && f1[0]['Manzana / Lote'] === 'M-2', JSON.stringify(f1.map(function (f) { return [f['Placa'], f['m³ del día']]; })));
  mirarCamiones();
  ok('2 · mirarCamiones no escribe', W.rows.length === 0, W.rows.length + ' filas');
  cargarCamiones();
  ok('3 · Primera carga: los 2 camiones del informe; nada del PRUEBA- ni del informe sin camiones; la clave del camión va sin guion',
     W.rows.length === 2 && W.rows[0].v['Placa'] === 'AA-11' && W.rows[0].v['Clave del camión'] === 'AA11' && W.rows[0].v['m³ del día'] === 20 && W.rows[1].v['m³ por viaje'] === 7.5, JSON.stringify(W.rows.map(function (r) { return r.v['Placa']; })));
  var p3 = W.puestas; cargarCamiones();
  ok('4 · Segunda carga sin cambios: ni escribe ni borra', W.puestas === p3 && W.borradas === 0, 'puestas ' + W.puestas + ' · borradas ' + W.borradas);
  archivos.push(arch('URB-EZ-M2-261002-GB-r2.json', informe([{ placa: 'AA-11', m3: '10', viajes: '3' }])));
  cargarCamiones();
  ok('5 · Un informe corregido (-r2): sus filas se reemplazan por las de la última revisión', W.rows.length === 1 && W.rows[0].v['Viajes'] === 3 && W.borradas === 2, W.rows.length + ' fila · borradas ' + W.borradas);
  var p5 = W.puestas; cargarCamiones();
  ok('6 · Y vuelve a quedar quieta', W.puestas === p5, 'puestas ' + W.puestas);
  archivos.push(arch('URB-EZ-M2-261003-GB.json', informe([{ placa: 'aa 11', m3: '10', viajes: '1' }], '2026-10-03')));
  cargarCamiones();
  ok('7 · El mismo camión otro día, escrito distinto: fila nueva con la misma clave de camión, para poder agruparlo',
     W.rows.length === 2 && W.rows[0].v['Clave del camión'] === 'AA11' && W.rows[1].v['Clave del camión'] === 'AA11', W.rows.map(function (r) { return r.v['Clave del camión']; }).join(','));
  return R.join('\n');
})();
