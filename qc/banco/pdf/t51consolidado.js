// QC del consolidado por torre y día (Consolidado.gs, r36, 1-oct-2026). Se corre en pdf/index.html del banco (Smartsheet.gs,
// PDF.gs, ListaV2.gs, Pesos.gs y Avance.gs del repositorio Garmel) con Consolidado.gs cargado, con:
//   eval(await (await fetch('t51consolidado.js')).text())
// Todo contra un Drive y un registro de mentira, con informes inventados.
(function () {
  var R = [], ok = function (n, c, d) { R.push((c ? '✅ ' : '❌ ') + n + ' — ' + d); };
  var AHORA = new Date('2026-10-01T22:00:00Z').getTime(), H = 3600 * 1000;
  window.Logger = { log: function () {} };
  window._torreCompuesta = function (p) { return 'EZ-' + String(p.torre).replace('-', ''); };
  window._hoy = function () { return '2026-10-01'; };
  var iter = function (l) { var k = 0; return { hasNext: function () { return k < l.length; }, next: function () { return l[k++]; } }; };
  var nid = 1;
  var archivo = function (nombre, contenido, creado) {
    var a = { id: 'f' + (nid++), nombre: nombre, contenido: contenido, desc: '', papelera: false,
      getName: function () { return a.nombre; }, getId: function () { return a.id; }, getUrl: function () { return 'https://drive/' + a.id; },
      getDateCreated: function () { return new Date(creado || AHORA - 2 * H); },
      getBlob: function () { return { getDataAsString: function () { return a.contenido; }, getBytes: function () { return [1, 2, 3]; } }; },
      getDescription: function () { return a.desc; }, setDescription: function (t) { a.desc = t; }, setTrashed: function (v) { a.papelera = v; } };
    return a;
  };
  var carpeta = function (nombre) {
    var c = { nombre: nombre, archivos: [], hijas: {},
      getFoldersByName: function (n) { return iter(c.hijas[n] ? [c.hijas[n]] : []); },
      getFilesByName: function (n) { return iter(c.archivos.filter(function (f) { return f.nombre === n && !f.papelera; })); },
      getFiles: function () { return iter(c.archivos.slice()); },
      createFile: function (blob) { var f = archivo(blob.nombre, blob.html); c.archivos.push(f); return f; } };
    return c;
  };
  var torres = {};
  var torreDe = function (sector, torre) {
    var k = sector + '|' + torre;
    if (!torres[k]) { var c = carpeta('Informe'); c.hijas.datos = carpeta('datos'); c.hijas.fotos = carpeta('fotos'); torres[k] = c; }
    return torres[k];
  };
  window.carpetaDeTorre = torreDe;
  window.subcarpeta = function (padre, n) { if (!padre.hijas[n]) padre.hijas[n] = carpeta(n); return padre.hijas[n]; };
  var registro = [['Recibido', 'N° de informe', 'Sector', 'Torre']];
  window.hojaDeRegistro = function () { return { getDataRange: function () { return { getValues: function () { return registro; } }; } }; };
  var propiedades = {};
  window.PropertiesService = { getScriptProperties: function () { return { getProperty: function (k) { return propiedades[k] || null; }, setProperty: function (k, v) { propiedades[k] = v; } }; } };
  window.Utilities = { formatDate: function () { return '01/10/2026 a las 18:00'; }, base64Encode: function () { return 'AAAA'; },
    newBlob: function (html) { var b = { html: html, nombre: '', getAs: function () { return b; }, setName: function (n) { b.nombre = n; return b; }, getBytes: function () { return new Array(2048); } }; return b; } };
  window.MimeType = { HTML: 'text/html', PDF: 'application/pdf' };
  window.ScriptApp = { getOAuthToken: function () { return 't'; } };
  var parches = [];
  window.UrlFetchApp = { fetch: function (url, o) { parches.push(url); var id = /files\/([^?]+)/.exec(url)[1];
    Object.keys(torres).forEach(function (k) { (torres[k].hijas['Consolidados por día'] || { archivos: [] }).archivos.forEach(function (f) { if (f.id === id) f.contenido = '(reemplazado)'; }); });
    return { getResponseCode: function () { return 200; }, getContentText: function () { return ''; } }; } };

  var E = function (v) { return { pr: '100', ej: String(v), ev: 'B', ud: 'estado', sn: '', pct: '' }; };
  var informe = function (piso, apto, inspector, v, ambito) {
    var d = { lista: 'v2', ambito: ambito || 'apartamento', fecha: '2026-10-01', torre: 'T-56', piso: ambito === 'torre' ? '' : piso, apto: ambito === 'torre' ? '' : apto,
              convenio: 'Convenio Bielorrusos', empresa: 'CONTRATISTA DE PRUEBA', residentes: ['Ing. Residente Uno'], inspectores: [inspector], estatus: ['Iniciada'], partidas: {} };
    var h = HITOS_V2.filter(function (x) { return x.id === 'hito_acabados'; })[0];
    d.partidas.hito_acabados = h.codigos.map(function () { return E(v); });
    return d;
  };
  var llega = function (sector, torre, numero, d, hace, opc) {
    opc = opc || {};
    var base = numero.replace(/-r\d+$/, '');
    registro.push([new Date(AHORA - (hace || 2) * H), base, sector, torre]);
    torreDe(sector, torre).hijas.datos.archivos.push(archivo(numero + '.json', JSON.stringify(d), opc.creado));
    for (var i = 1; i <= (opc.fotos || 0); i++) torreDe(sector, torre).hijas.fotos.archivos.push(archivo(base + '-hito_acabados-' + i + (opc.sufijo || '') + '.jpg', 'x'));
  };
  var consolidados = function (sector, torre) { var c = torreDe(sector, torre).hijas['Consolidados por día']; return c ? c.archivos.filter(function (f) { return !f.papelera; }) : []; };

  // ── 1. Qué entra en un grupo ──
  llega('EZ', 'T-56', 'EZ-T56-P03AA-261001-IU', informe('Piso 03', 'A', 'Inspector Uno', 100), 5, { fotos: 2 });
  llega('EZ', 'T-56', 'EZ-T56-P03AB-261001-ID', informe('Piso 03', 'B', 'Inspector Dos', 50), 4, { fotos: 1 });
  registro.push([new Date(AHORA - 3 * H), 'PRUEBA-EZ-T56-P03AC-261001-IU', 'EZ', 'T-56'], [new Date(AHORA - 3 * H), 'EZ-T56-ESTR-261001-CJ', 'EZ', 'T-56'],
                [new Date(AHORA - 3 * H), 'SHA-EZ-T56-261001-VM', 'EZ', 'T-56'], [new Date(AHORA - 3 * H), 'URB-EZ-M5-261001-GB', 'EZ', 'M-5'],
                [new Date(AHORA - 90 * H), 'EZ-T07-P01AA-260927-IU', 'EZ', 'T-07'], [new Date(AHORA - 89 * H), 'EZ-T07-P01AB-260927-IU', 'EZ', 'T-07']);
  var g1 = _conGruposRecientes(registro, AHORA, 48);
  ok('1 · Del registro sale un grupo por torre y día de obra: sin PRUEBA-, sin «Estructura», sin SHA ni urbanismo, y sin lo que llegó hace más de 48 h',
     g1.length === 1 && g1[0].numero === 'EZ-T56-DIA-261001' && g1[0].numeros.length === 2 && g1[0].torre === 'T-56', JSON.stringify(g1.map(function (x) { return [x.numero, x.numeros.length]; })));

  // ── 2. Mirar no escribe ──
  var m2 = mirarConsolidados();
  ok('2 · mirarConsolidados dice lo que falta y no escribe nada', /1 por armar/.test(m2) && consolidados('EZ', 'T-56').length === 0 && !propiedades.CONSOLIDADOS_VISTOS, m2);

  // ── 3. El primero ──
  var m3 = generarConsolidados(), c3 = consolidados('EZ', 'T-56');
  ok('3 · Con dos informes del mismo día se crea «EZ-T56-DIA-261001.pdf» en «Consolidados por día», con su huella en la descripción',
     c3.length === 1 && c3[0].nombre === 'EZ-T56-DIA-261001.pdf' && /consolidado v\d+ · EZ-T56-P03AA-261001-IU · EZ-T56-P03AB-261001-ID/.test(c3[0].desc) && /1 armado/.test(m3), (c3[0] || {}).nombre + ' · ' + (c3[0] || {}).desc);

  // ── 4. El documento ──
  var h4 = c3[0].contenido;
  var saltos = (h4.match(/page-break-before:always/g) || []).length, firmas = (h4.match(/<b>Ingeniero inspector<\/b>/g) || []).length;
  ok('4 · El documento: título de consolidado, una fila y una sección por apartamento (cada una en página nueva), una firma por inspector y las 3 fotos',
     /CONSOLIDADO DEL D/.test(h4) && /EZ-T56-DIA-261001/.test(h4) && saltos === 2 && firmas === 2 && /Inspector Uno/.test(h4) && /Inspector Dos/.test(h4) &&
     (h4.match(/<img src="data:image\/jpeg/g) || []).length === 3 && /1 · PISO 03 · APTO\. A/.test(h4) && /2 · PISO 03 · APTO\. B/.test(h4) && /No reemplaza el informe de cada apartamento/.test(h4),
     'saltos ' + saltos + ' · firmas ' + firmas + ' · fotos ' + (h4.match(/<img src="data:image\/jpeg/g) || []).length + ' · ' + h4.length + ' caracteres');

  // ── 5. Queda quieto ──
  var antes5 = c3[0].id, m5 = generarConsolidados();
  propiedades.CONSOLIDADOS_VISTOS = '{}';
  var m5b = generarConsolidados();
  ok('5 · Sin nada nuevo no hace nada; y aunque se pierda la memoria, la huella del archivo dice que está al día', /0 armado/.test(m5) && /0 armado/.test(m5b) && /1 al d/.test(m5b) &&
     consolidados('EZ', 'T-56').length === 1 && parches.length === 0, m5b);

  // ── 6. Llega otro apartamento ──
  llega('EZ', 'T-56', 'EZ-T56-P02AA-261001-IU', informe('Piso 02', 'A', 'Inspector Uno', 75), 1);
  var m6 = generarConsolidados(), c6 = consolidados('EZ', 'T-56');
  ok('6 · Llega un tercer apartamento: el mismo archivo se reemplaza en sitio (mismo enlace), ahora con tres informes y el piso 02 primero',
     c6.length === 1 && c6[0].id === antes5 && parches.length === 1 && /P02AA.*P03AA.*P03AB/.test(c6[0].desc) && /1 armado/.test(m6), c6[0].desc + ' · reemplazos ' + parches.length);

  // ── 7. Una corrección ──
  llega('EZ', 'T-56', 'EZ-T56-P03AB-261001-ID-r2', informe('Piso 03', 'B', 'Inspector Dos', 25), 0.5, { fotos: 1, sufijo: '-r2' });
  generarConsolidados();
  var fotos7 = _conFotosPorInforme(torreDe('EZ', 'T-56'), ['EZ-T56-P03AB-261001-ID'])['EZ-T56-P03AB-261001-ID'];
  ok('7 · Un informe corregido (-r2) rehace el consolidado con la última revisión, y su foto reenviada no sale dos veces',
     /EZ-T56-P03AB-261001-ID-r2/.test(consolidados('EZ', 'T-56')[0].desc) && parches.length === 2 && fotos7.length === 1, consolidados('EZ', 'T-56')[0].desc + ' · fotos del B: ' + fotos7.length);

  // ── 8. El informe de torre completa va primero; «Estructura» no entra ──
  llega('EZ', 'T-56', 'EZ-T56-261001-IU', informe('', '', 'Inspector Uno', 50, 'torre'), 0.4);
  llega('EZ', 'T-56', 'EZ-T56-ESTR-261001-CJ', informe('', '', 'Carlos J.', 50, 'torre'), 0.3);
  var l8 = _conInformesDelDia(torreDe('EZ', 'T-56').hijas.datos, '261001').map(function (x) { return x.numero + (x.rev > 1 ? '-r' + x.rev : ''); });
  ok('8 · El informe de torre completa del día entra y va primero; el de «Estructura» no entra',
     l8.join() === 'EZ-T56-261001-IU,EZ-T56-P02AA-261001-IU,EZ-T56-P03AA-261001-IU,EZ-T56-P03AB-261001-ID-r2', l8.join(' · '));

  // ── 9. Un solo informe ──
  llega('EZ', 'T-57', 'EZ-T57-P01AA-261001-IU', informe('Piso 01', 'A', 'Inspector Uno', 100), 2);
  var m9 = generarConsolidados();
  ok('9 · Una torre con un solo informe en el día no tiene consolidado: sería una copia', consolidados('EZ', 'T-57').length === 0 && /1 con menos de 2/.test(m9), m9);

  // ── 10. Uno recién llegado ──
  llega('EZ', 'T-57', 'EZ-T57-P01AB-261001-IU', informe('Piso 01', 'B', 'Inspector Uno', 100), 0.01, { creado: AHORA - 30 * 1000 });
  var m10 = _consolidados(true, { ahora: AHORA });
  var visto10 = JSON.parse(propiedades.CONSOLIDADOS_VISTOS)['EZ|T-57|261001'];
  var m10b = _consolidados(true, { ahora: AHORA + 10 * 60 * 1000 });
  ok('10 · Un informe que llegó hace 30 segundos (puede estar archivando fotos) se deja para la próxima vuelta, y en la siguiente sí se arma',
     /para la próxima vuelta/.test(m10) && !visto10 && consolidados('EZ', 'T-57').length === 1, 'primera: ' + m10.replace(/^Consolidados: /, '') + ' · después hay ' + consolidados('EZ', 'T-57').length);

  // ── 11. Muchas fotos ──
  llega('EZ', 'T-58', 'EZ-T58-P01AA-261001-IU', informe('Piso 01', 'A', 'Inspector Uno', 100), 2, { fotos: 40 });
  llega('EZ', 'T-58', 'EZ-T58-P01AB-261001-IU', informe('Piso 01', 'B', 'Inspector Uno', 100), 2, { fotos: 30 });
  generarConsolidados();
  var h11 = (consolidados('EZ', 'T-58')[0] || {}).contenido || '';
  ok('11 · Con más de 60 fotos el consolidado va sin fotografías y lo dice, remitiendo al PDF de cada apartamento',
     /va sin fotograf/.test(h11) && /son 70/.test(h11) && !/<img src="data:image\/jpeg/.test(h11), 'fotos en el documento: ' + (h11.match(/<img src="data:image\/jpeg/g) || []).length);

  // ── 12. El resumen con presupuesto ──
  var h12 = consolidados('EZ', 'T-56')[0] ? _conHtml({ numero: 'EZ-T56-DIA-261001', sector: 'EZ', torre: 'T-56', aammdd: '261001' },
     [{ numero: 'EZ-T56-P03AA-261001-IU', rev: 1, sector: 'EZ', torre: 'T-56', datos: informe('Piso 03', 'A', 'Inspector Uno', 100), fotos: [] },
      { numero: 'EZ-T56-P03AB-261001-ID', rev: 2, sector: 'EZ', torre: 'T-56', datos: informe('Piso 03', 'B', 'Inspector Dos', 50), fotos: [] }], { cuando: '01/10/2026 a las 18:00', conFotos: true, totalFotos: 0 }) : '';
  var fila = function (t) { var m = new RegExp('<td>' + t + '</td><td>[^<]*</td><td align="right">([^<]*)</td>').exec(h12); return m ? m[1] : '?'; };
  ok('12 · En el resumen cada apartamento lleva su avance según el presupuesto (100 % y 50 %) y el número de su informe con la revisión',
     fila('Piso 03 · Apto. A') === '100 %' && fila('Piso 03 · Apto. B') === '50 %' && /EZ-T56-P03AB-261001-ID-r2/.test(h12) && /2 \(2 de apartamento\)/.test(h12),
     'A ' + fila('Piso 03 · Apto. A') + ' · B ' + fila('Piso 03 · Apto. B'));
  // ── 13. Nombres escritos distinto ──
  var dA = informe('Piso 01', 'A', 'Inspector Uno', 100), dB = informe('Piso 01', 'B', 'Inspector Uno', 100);
  dA.residentes = ['Ing. José Pérez']; dB.residentes = ['Ing Jose Perez', 'ING. JOSÉ  PÉREZ', 'Ing. Otro Residente'];
  var u13 = _conUnion([{ datos: dA }, { datos: dB }], 'residentes');
  var h13 = _conHtml({ numero: 'EZ-T56-DIA-261001', sector: 'EZ', torre: 'T-56', aammdd: '261001' },
     [{ numero: 'A', rev: 1, sector: 'EZ', torre: 'T-56', datos: dA, fotos: [] }, { numero: 'B', rev: 1, sector: 'EZ', torre: 'T-56', datos: dB, fotos: [] }], { cuando: '01/10/2026 a las 18:00' });
  ok('13 · El mismo residente escrito con y sin punto o acento firma una sola vez; y la barra de cada apartamento no depende de un fondo (el conversor de Google no los pinta)',
     u13.length === 2 && u13[0] === 'Ing. José Pérez' && (h13.match(/<b>Ingeniero residente<\/b>/g) || []).length === 2 && !/bgcolor="#1a237e"/.test(h13) && /border-bottom:3px solid #1a237e/.test(h13), u13.join(' | '));
  return R.join('\n');
})();
