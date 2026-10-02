// QC del r42 (2-oct-2026): un informe de varias torres deja un acceso directo y una marca en las demás, y su «visita
// anterior» lo encuentra; y las minutas de campo salen como anexo del PDF.
// Se corre en pdf/index.html del banco con Codigo.gs, Sha.gs, Urbanismo.gs, Consolidado.gs y VariasTorres.gs cargados.
// Todo contra un Drive y unas propiedades de mentira.
(function () {
  var R = [], ok = function (n, c, d) { R.push((c ? '✅ ' : '❌ ') + n + ' — ' + d); };
  window.Logger = { log: function () {} };
  var iter = function (l) { var k = 0; return { hasNext: function () { return k < l.length; }, next: function () { return l[k++]; } }; };
  var nid = 1;
  var archivo = function (nombre, contenido) {
    return { id: 'f' + (nid++), nombre: nombre, getName: function () { return nombre; }, getId: function () { return this.id; },
             getBlob: function () { return { getDataAsString: function () { return contenido || ''; } }; } };
  };
  var carpeta = function (ruta) {
    var c = { ruta: ruta, archivos: [], hijas: {}, accesos: [],
      getFilesByName: function (n) { return iter(c.archivos.filter(function (f) { return f.nombre === n; })); },
      getFiles: function () { return iter(c.archivos.slice()); },
      createShortcut: function (id) { var orig = TODOS[id]; var a = archivo(orig.nombre); a.accesoA = id; c.archivos.push(a); c.accesos.push(id); return a; } };
    return c;
  };
  var ARBOL = {}, TODOS = {};
  var carp = function (ruta) { return ARBOL[ruta] || (ARBOL[ruta] = carpeta(ruta)); };
  var poner = function (c, nombre, contenido) { var a = archivo(nombre, contenido); c.archivos.push(a); TODOS[a.id] = a; return a; };
  window.CARPETA_SECTOR = { EZ: 'x' };
  window.carpetaDeTorre = function (sector, torre, tipo) { return carp(sector + '/' + (tipo === 'urbanismo' ? String(torre).toUpperCase() : normalizaTorre(torre)) + '/' + (tipo || 'obra')); };
  window.subcarpeta = function (c, n) { return carp(c.ruta + '/' + n); };
  var P = {};
  window.PropertiesService = { getScriptProperties: function () { return { getProperty: function (k) { return P[k] === undefined ? null : P[k]; }, setProperty: function (k, v) { P[k] = v; } }; } };

  var sobre = function (numero, torre, otras, tipo) {
    return { numero: numero, tipo: tipo || 'sha', sector: 'EZ', torre: torre,
             datos: { tipo: tipo || 'sha', torre: torre, nro: numero, fecha: '2026-09-30', general: [], apartamentos: [{ apto: 'Fachada', campos: { 'hallazgo__Descripción del hallazgo o condición observada': 'Sin lentes.' } }],
                      ubicacion: otras ? { modo: 'varias', otras: otras, texto: [torre].concat(otras).join(' · ') } : undefined } };
  };
  var archivar = function (p, rev) {
    var c = carpetaDeTorre(p.sector, p.torre, p.tipo), suf = rev ? '-r' + rev : '';
    poner(subcarpeta(c, 'datos'), p.numero + suf + '.json', JSON.stringify(p.datos));
    poner(c, p.numero + suf + '.pdf', 'pdf');
    return _compartirConOtras(p, c, p.numero + suf + '.pdf', p.numero + suf + '.json');
  };

  // ── 1 a 3: accesos directos y marcas ──
  ok('1 · Un informe de una sola torre, o de prueba, no deja nada en ninguna otra', archivar(sobre('SHA-EZ-T15-260929-BR', 'T-15')) === null && archivar(sobre('PRUEBA-SHA-EZ-T15+2-260930-BR', 'T-15', ['T-14', 'T-13'])) === null && Object.keys(P).length === 0, 'propiedades: ' + Object.keys(P).length);
  var p3 = sobre('SHA-EZ-T15+2-260930-BR', 'T-15', ['T-14', 'T-13']), r3 = archivar(p3);
  var c14 = carp('EZ/T-14/sha'), c13 = carp('EZ/T-13/sha'), c15 = carp('EZ/T-15/sha');
  ok('2 · Uno de tres torres deja en las otras dos un ACCESO DIRECTO al PDF (no una copia) y nada más en la principal',
     r3.otras === 2 && r3.accesos === 2 && c14.accesos.length === 1 && c13.accesos.length === 1 && TODOS[c14.accesos[0]].nombre === 'SHA-EZ-T15+2-260930-BR.pdf' && c15.accesos.length === 0 && c14.archivos.length === 1,
     JSON.stringify(r3));
  ok('3 · Y la marca de cada una dice dónde está archivado', JSON.parse(P['COMPARTIDO|sha|EZ|T-14']).torre === 'T-15' && JSON.parse(P['COMPARTIDO|sha|EZ|T-13']).archivo === 'SHA-EZ-T15+2-260930-BR.json' && !P['COMPARTIDO|sha|EZ|T-15'], P['COMPARTIDO|sha|EZ|T-14']);
  var r4 = _compartirConOtras(p3, c15, 'SHA-EZ-T15+2-260930-BR.pdf', 'SHA-EZ-T15+2-260930-BR.json');
  ok('4 · Repetirlo no duplica el acceso directo ni reescribe la marca', r4.accesos === 0 && r4.marcas === 0 && c14.accesos.length === 1, JSON.stringify(r4));

  // ── 5 a 8: la visita anterior ──
  var h5 = _historialDeTorre({ tipo: 'sha', sector: 'EZ', torre: 'T-14' });
  ok('5 · La «visita anterior» de la T-14, que no tiene informes propios, trae el informe compartido, entregado como de la T-14',
     h5.ok && h5.informe && h5.informe.nro === 'SHA-EZ-T15+2-260930-BR' && h5.informe.torre === 'T-14' && h5.compartidoDe === 'T-15' && h5.informe.apartamentos.length === 1, h5.archivo + ' · de ' + h5.compartidoDe);
  poner(carp('EZ/T-14/sha/datos'), 'SHA-EZ-T14-260925-BR.json', JSON.stringify({ nro: 'SHA-EZ-T14-260925-BR', torre: 'T-14' }));
  var h6 = _historialDeTorre({ tipo: 'sha', sector: 'EZ', torre: 'T-14' });
  ok('6 · Con un informe propio MÁS VIEJO, sigue ganando el compartido', h6.informe.nro === 'SHA-EZ-T15+2-260930-BR', h6.archivo);
  poner(carp('EZ/T-14/sha/datos'), 'SHA-EZ-T14-261001-BR.json', JSON.stringify({ nro: 'SHA-EZ-T14-261001-BR', torre: 'T-14' }));
  var h7 = _historialDeTorre({ tipo: 'sha', sector: 'EZ', torre: 'T-14' });
  ok('7 · Con un informe propio MÁS NUEVO, manda el propio', h7.informe.nro === 'SHA-EZ-T14-261001-BR' && !h7.compartidoDe, h7.archivo);
  var h8 = _historialDeTorre({ tipo: 'sha', sector: 'EZ', torre: 'T-15' }), h8b = _historialDeTorre({ tipo: 'servicios', sector: 'EZ', torre: 'T-14' });
  ok('8 · La principal sigue viendo su informe como siempre, y el de SHA no aparece en el historial de servicios', h8.informe.nro === 'SHA-EZ-T15+2-260930-BR' && !h8.compartidoDe && h8b.informe === null, h8.archivo + ' · servicios: ' + h8b.informe);

  // ── 9: una revisión y un informe más viejo ──
  archivar(p3, 2);
  archivar(sobre('SHA-EZ-T16+1-260920-BR', 'T-16', ['T-13']));
  ok('9 · Un reenvío (-r2) actualiza la marca y suma su acceso; un informe compartido más viejo, de otra torre, no la pisa',
     JSON.parse(P['COMPARTIDO|sha|EZ|T-13']).archivo === 'SHA-EZ-T15+2-260930-BR-r2.json' && c13.accesos.length === 3 && _ordenDeArchivo('SHA-EZ-T15+2-260930-BR-r2.json') === '260930-002',
     P['COMPARTIDO|sha|EZ|T-13'] + ' · accesos en T-13: ' + c13.accesos.length);
  var pu = sobre('URB-EZ-M1+1-261001-GB', 'M-1', ['M-4 L2'], 'urbanismo'); archivar(pu);
  ok('10 · En urbanismo vale igual, por manzana', !!P['COMPARTIDO|urbanismo|EZ|M-4 L2'] && carp('EZ/M-4 L2/urbanismo').accesos.length === 1 && _historialDeTorre({ tipo: 'urbanismo', sector: 'EZ', torre: 'M-4 L2' }).informe.torre === 'M-4 L2', P['COMPARTIDO|urbanismo|EZ|M-4 L2']);

  // ── 11 a 14: las minutas en el PDF ──
  var foto = function (n) { return { nombre: n, dato: 'data:image/jpeg;base64,AAAA' }; };
  var conMin = function (tipo, extra) { var d = { tipo: tipo, torre: 'T-56', fecha: '2026-10-05', empresa: 'CONTRATISTA DE PRUEBA', inspectores: ['Inspector Uno'], residentes: ['Ing. Residente'], estatus: ['Aprobado'], general: [], apartamentos: [], incidencias: [], camiones: [], obs_general: 'x', fotosMinutas: [{ pie: 'Minuta con la contratista' }, { pie: '' }] };
    for (var k in (extra || {})) d[k] = extra[k];
    return { numero: 'PRUEBA-' + tipo, tipo: tipo, sector: 'EZ', torre: 'T-56', datos: d, fotos: [foto('minutas-2'), foto('minutas-1')] }; };
  var hs = _pdfHtmlSha(conMin('sha')), hv = _pdfHtmlServicios(conMin('servicios')), hu = _pdfHtmlUrbanismo(conMin('urbanismo'));
  var obra = { numero: 'PRUEBA-EZ-T56-P03-A-261005-XX', tipo: undefined, sector: 'EZ', torre: 'T-56', fotos: [foto('minutas-1')], datos: { lista: 'v2', ambito: 'apartamento', fecha: '2026-10-05', piso: 'Piso 03', apto: 'A', partidas: {}, inspectores: ['Inspector Uno'], residentes: [], estatus: [] } };
  var ho = _pdfHtml(obra);
  var bien = function (h, n) { return h.indexOf('ANEXO · MINUTAS DE CAMPO (' + n + ')') > 0 && (h.match(/width="500"/g) || []).length === n && h.indexOf('ANEXO') > h.lastIndexOf('Documento generado'); };
  ok('11 · Los cuatro PDF (obra, servicios, SHA y urbanismo) llevan el anexo «Minutas de campo» después de las firmas, con cada hoja a 500 px de ancho', bien(hs, 2) && bien(hv, 2) && bien(hu, 2) && bien(ho, 1), [hs, hv, hu, ho].map(function (h) { return (h.match(/width="500"/g) || []).length; }).join(' · '));
  ok('12 · Las hojas salen en su orden, con su descripción, y el anexo abre página', /Minuta 1 de 2 — Minuta con la contratista/.test(hs) && /Minuta 2 de 2</.test(hs) && /page-break-before:always[^>]*>\s*<tr>\s*<td[^>]*>ANEXO/.test(hs.replace(/\n/g, '')), 'ordenadas');
  var sin = conMin('sha'); sin.fotos = []; var viejo = conMin('sha'); viejo.fotos = [foto('general-1')]; delete viejo.datos.fotosMinutas;
  ok('13 · Sin minutas no hay anexo, y un informe de antes sale igual', !/ANEXO/.test(_pdfHtmlSha(sin)) && !/ANEXO/.test(_pdfHtmlSha(viejo)), 'sin anexo');
  ok('14 · Las plantillas de las hojas de informes traen «N° de minutas»', _plantillaInformes().some(function (x) { return x[0] === 'N° de minutas'; }) && SHA_HOJAS[0][3].some(function (x) { return x[0] === 'N° de minutas'; }) && URB_HOJAS[0][3].some(function (x) { return x[0] === 'N° de minutas'; }) &&
     _fotosConPrefijo(conMin('sha'), 'minutas-') === 2, 'obra, SHA y urbanismo');
  return R.join('\n');
})();
