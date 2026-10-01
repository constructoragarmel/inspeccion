// QC de la minuta automática (relevo r31, 1-oct-2026). Se corre en minutas.html, que carga Logos.gs, PDF.gs, Contactos.gs,
// Reuniones.gs y Minutas.gs del repositorio Garmel y tres reuniones inventadas, con:
//   eval(await (await fetch('t44minutas.js')).text())
// 1 a 7: el documento. 8 a 10: el flujo (crear, no repetir, reemplazar, no pisar) contra un Smartsheet y un Drive falsos.
(function () {
  var R = [];
  var ok = function (n, c, d) { R.push((c ? '✅ ' : '❌ ') + n + ' — ' + d); };
  var copia = function (o) { return JSON.parse(JSON.stringify(o)); };
  var reu = function (filas, id) { return _reunionesParaMinuta(filas).filter(function (x) { return x.id === id; })[0]; };
  var F = copia(window.__filas);

  // ── 1. Qué reuniones llevan minuta ──
  var extra = copia(F);
  extra.push({ _id: 9001, 'ID de reunión': 'REU-2026-09-21-SB', 'Fecha': '2026-09-21', 'Tipo': REU_TIPOS[0], 'Sector': 'Simón Bolívar' });
  extra.push({ _id: 9002, _parentId: 9001, 'ID de reunión': 'REU-2026-09-21-SB', 'Fecha': '2026-09-21', 'Contratista / Ente': 'CONTRATISTA UNO, C.A.' });
  extra.push({ _id: 9003, 'ID de reunión': 'REU-2026-10-12-EZ', 'Fecha': '2026-10-12', 'Tipo': REU_TIPOS[0], 'Sector': 'Ezequiel Zamora' });   // sin empresas
  var ids = _reunionesParaMinuta(extra).map(function (x) { return x.id; });
  ok('1 · Llevan minuta las reuniones desde el 28-sep que tienen empresas; la del 21-sep y una sin empresas, no',
     ids.join(',') === 'REU-2026-09-28-SB,REU-2026-09-29-SRV,REU-2026-10-05-SR', ids.join(', '));

  // ── 2. Los puntos de una celda ──
  var p2a = _minPartes('Urbanismo (RACAR / PROCODIMA): desmontaje / Telecomunicaciones (CANTV / CORPOELEC): inspecciones');
  var p2b = _minPartes('uno\ndos / tres\r\n  cuatro  ');
  var p2c = _minPartes('abre (y no cierra / segundo punto / tercero');
  var p2d = _minPartes('Torres J7/J8 y 12/13');
  ok('2 · « / » separa puntos, salvo dentro de un paréntesis; el salto de línea también separa; «J7/J8» no se parte',
     p2a.length === 2 && /RACAR \/ PROCODIMA/.test(p2a[0]) && p2b.join('|') === 'uno|dos|tres|cuatro' && p2c.length === 3 && p2d.length === 1 && _minPartes(undefined).length === 0,
     p2a.length + ' · ' + p2b.join('|') + ' · sin cerrar: ' + p2c.length + ' · ' + p2d.length);

  // ── 3. La minuta de un lunes ──
  var sb = reu(F, 'REU-2026-09-28-SB'), hSb = _minutaHtml(sb, 'HORA');
  var cabs = ['Participante (ámbito)', 'Procura de materiales', 'Solicitudes', 'Recomendaciones de Gerencia Técnica', 'Comentarios generales'];
  var faltan = sb.empresas.filter(function (e) { return hSb.split('<b>' + _pdfEsc(e['Contratista / Ente']) + '</b>').length !== 2; });
  var cem = 0, blo = 0; sb.empresas.forEach(function (e) { cem += Number(e['Cemento pendiente (gandolas)'] || 0); blo += Number(e['Bloques pendientes (und.)'] || 0); });
  ok('3 · Lunes (Simón Bolívar): las 5 columnas, una fila por empresa, la torre como se dice (D-08) y el total de cemento y bloques sumado',
     cabs.every(function (c) { return hSb.indexOf('>' + c + '</th>') > 0; }) && faltan.length === 0 && />D-08</.test(hSb) && !/SB-D08/.test(hSb) &&
     cem === 8 && hSb.indexOf('8 gandolas de cemento · 12.000 bloques') > 0 && /Sector Simón Bolívar/.test(hSb) && /28 de septiembre de 2026/.test(hSb),
     sb.empresas.length + ' empresas · faltan: ' + faltan.length + ' · total ' + _minNumero(cem) + ' gandolas, ' + _minNumero(blo) + ' bloques');

  // ── 4. La de un martes ──
  var srv = reu(F, 'REU-2026-09-29-SRV'), hSrv = _minutaHtml(srv, '');
  var conNum = srv.empresas.some(function (e) { return e['Cemento pendiente (gandolas)'] !== undefined || e['Bloques pendientes (und.)'] !== undefined; });
  ok('4 · Martes (servicios): sin la columna de procura, con su título, y sin línea de cemento si nadie dio cifras',
     hSrv.indexOf('Procura de materiales') < 0 && /Reunión de servicios públicos y urbanismo/.test(hSrv) && />Participante<\/th>/.test(hSrv) &&
     (/Pendiente declarado/.test(hSrv) === conNum) && _nombreDeMinuta(srv) === 'Minuta 2026-09-29 Servicios y urbanismo (desde Smartsheet).pdf',
     'procura: ' + (hSrv.indexOf('Procura de materiales') >= 0) + ' · cifras: ' + conNum + ' · ' + _nombreDeMinuta(srv));

  // ── 5. Compromisos con fecha ──
  var t5 = reu(F, 'REU-2026-10-05-SR'), c5 = _minCompromisos(t5), h5 = _minutaHtml(t5, '');
  ok('5 · Compromisos: salen por fecha, con la fecha al inicio o al final del punto, las torres que nombra y su responsable; el que no trae fecha va al final',
     c5.length === 4 && c5.map(function (c) { return c.fecha; }).join(',') === '2026-10-15,2026-10-21,2026-10-23,' &&
     c5[0].torres === 'T-07, T-12' && c5[1].texto === 'Entrega de la T-07' && c5[2].texto === 'Entrega de la T-12' && c5[2].responsable === 'CONTRATISTA CUATRO, C.A.' &&
     />Compromiso<\/th>/.test(h5) && /Sin compromisos con fecha/.test(hSb),
     c5.map(function (c) { return (c.fecha || 'sin fecha') + ' «' + c.texto + '» [' + c.torres + ']'; }).join(' · '));

  // ── 6. Por confirmar ──
  ok('6 · Por confirmar: lo de la reunión sin nombre, lo de cada empresa con el suyo; si no hay nada, «Nada por confirmar»',
     /Frase cortada en el minuto 12/.test(h5) && /<b>CONTRATISTA CUATRO, C\.A\.:<\/b> «Ceballos»/.test(h5) && /Nada por confirmar\./.test(hSb) && !/Nada por confirmar/.test(h5),
     'con dudas: ' + /Ceballos/.test(h5) + ' · sin dudas: ' + /Nada por confirmar/.test(hSb));

  // ── 7. Texto raro y huella ──
  var raro = copia(F), eR = raro.filter(function (v) { return v['ID de reunión'] === 'REU-2026-09-28-SB' && v['Contratista / Ente']; })[0];
  eR['Solicitudes'] = '<script>alert(1)</script> & "comillas" / segunda';
  eR['Por Garmel'] = 'no aplica';
  var pR = raro.filter(function (v) { return v['ID de reunión'] === 'REU-2026-09-28-SB' && !v['Contratista / Ente']; })[0];
  pR['Por Garmel'] = [{ objectType: 'CONTACT', name: 'Persona De Prueba', email: 'no-debe-salir@ejemplo.test' }];
  var hR = _minutaHtml(reu(raro, 'REU-2026-09-28-SB'), '');
  var h1 = _huellaDeMinuta(sb), h2 = _huellaDeMinuta(reu(copia(F), 'REU-2026-09-28-SB')), h3 = _huellaDeMinuta(reu(raro, 'REU-2026-09-28-SB'));
  ok('7 · Un texto con etiquetas y comillas sale escrito, no ejecutado; «Por Garmel» muestra el nombre y no el correo; la huella no depende de la hora y cambia si cambia una celda',
     hR.indexOf('<script>alert') < 0 && hR.indexOf('&lt;script&gt;alert(1)&lt;/script&gt; &amp; &quot;comillas&quot;') > 0 && /Por Garmel: Persona De Prueba/.test(hR) &&
     hR.indexOf('ejemplo.test') < 0 && h1 === h2 && h1 !== h3 && _minutaHtml(sb, 'A') !== _minutaHtml(sb, 'B'),
     'escapado: ' + (hR.indexOf('<script>alert') < 0) + ' · huellas ' + h1 + ' = ' + h2 + ' ≠ ' + h3);

  // ── El Smartsheet y el Drive falsos ──
  var mundo = function (filas, conColumnas) {
    var W = { filas: copia(filas), puts: [], posts: [], parches: [], creados: [], papelera: [], props: { SS_TOKEN: 'x' }, parcheCodigo: 200, n: 0 };
    W.cols = ['Reunión / Empresa', 'ID de reunión', 'Fecha', 'Tipo', 'Sector', 'Contratista / Ente', 'Torre(s)', 'Asistentes', 'Por Garmel', 'Avance declarado', 'Procura',
              'Cemento pendiente (gandolas)', 'Bloques pendientes (und.)', 'Solicitudes', 'Recomendaciones / exigencias', 'Pasa a pendientes', 'Minuta', 'Observaciones', 'Clave de origen']
      .concat(conColumnas ? [MIN_COMPROMISOS, MIN_CONFIRMAR] : []).map(function (t, i) { return { id: 100 + i, title: t, index: i }; });
    var carpeta = function (nombre) {
      var c = { nombre: nombre, hijas: {}, archivos: [],
        getFoldersByName: function (n) { var h = c.hijas[n]; return { hasNext: function () { return !!h; }, next: function () { var x = h; h = null; return x; } }; },
        getFilesByName: function (n) { var l = c.archivos.filter(function (a) { return a.nombre === n && !a.papelera; }), i = 0; return { hasNext: function () { return i < l.length; }, next: function () { return l[i++]; } }; },
        getParents: function () { var p = c.padre; return { hasNext: function () { return !!p; }, next: function () { var x = p; p = null; return x; } }; },
        createFile: function (blob) { var a = { id: 'F' + (++W.n), nombre: blob.nombre, html: blob.html, carpeta: nombre, papelera: false,
            getId: function () { return a.id; }, getUrl: function () { return 'https://drive.test/' + a.id; }, isTrashed: function () { return a.papelera; },
            setTrashed: function (v) { a.papelera = v; W.papelera.push(a.id); } };
          c.archivos.push(a); W.creados.push(a); W.porId[a.id] = a; return a; } };
      return c;
    };
    W.porId = {};
    var reuniones = carpeta('Reuniones'), cargas = carpeta('Cargas a Smartsheet'), minutas = carpeta('02 Minutas');
    cargas.padre = reuniones; reuniones.hijas['02 Minutas'] = minutas;
    minutas.hijas['01 Contratistas'] = carpeta('01 Contratistas'); minutas.hijas['02 Servicios'] = carpeta('02 Servicios');
    window._carpetaCargas = function () { return cargas; };
    window.DriveApp = { getFileById: function (id) { if (!W.porId[id]) throw new Error('no existe'); return W.porId[id]; }, getFoldersByName: function () { return { hasNext: function () { return false; } }; } };
    window.ScriptApp = { getOAuthToken: function () { return 't'; } };
    window.UrlFetchApp = { fetch: function (url, o) { W.parches.push({ url: url, metodo: o.method });
      if (W.parcheCodigo === 200) { var a = W.porId[/files\/([^?]+)/.exec(url)[1]]; a.html = o.payload.html; }
      return { getResponseCode: function () { return W.parcheCodigo; }, getContentText: function () { return 'x'; } }; } };
    window.PropertiesService = { getScriptProperties: function () { return { getProperty: function (k) { return W.props[k] === undefined ? null : W.props[k]; }, setProperty: function (k, v) { W.props[k] = v; } }; } };
    window.Utilities.newBlob = function (html) { var b = { html: html, nombre: '', getAs: function () { return b; }, setName: function (n) { b.nombre = n; return b; }, getBytes: function () { return b; } }; return b; };
    window._hojaReuniones = function () { return { id: 1 }; };
    window._estadoDeReuniones = function () { var pt = {}; W.cols.forEach(function (c) { pt[c.title] = c.id; }); return { hoja: { id: 1 }, porTitulo: pt, tipo: {}, padres: {}, claves: {}, filas: W.filas }; };
    window._get = function (t, ruta) { return /columns/.test(ruta) ? { data: W.cols } : {}; };
    window._post = function (t, ruta, cuerpo) { W.posts.push({ ruta: ruta, cuerpo: cuerpo }); if (/columns/.test(ruta)) cuerpo.forEach(function (c) { W.cols.push({ id: 900 + W.cols.length, title: c.title, index: c.index }); }); return { result: [] }; };
    window._put = function (t, ruta, cuerpo) { W.puts.push({ ruta: ruta, cuerpo: cuerpo });
      cuerpo.forEach(function (f) { var fila = W.filas.filter(function (v) { return v._id === f.id; })[0]; (f.cells || []).forEach(function (c) { var col = W.cols.filter(function (x) { return x.id === c.columnId; })[0]; fila[col.title] = c.value; }); }); };
    return W;
  };

  // ── 8. La primera vuelta ──
  var W = mundo(F, false);
  generarMinutas();
  var nombres = W.creados.map(function (a) { return a.carpeta + '/' + a.nombre; });
  var colsNuevas = W.posts.filter(function (p) { return /columns/.test(p.ruta); }).map(function (p) { return p.cuerpo[0].title + '@' + p.cuerpo[0].index; });
  var enlaces = W.puts.filter(function (p) { return p.cuerpo[0].cells[0].hyperlink; });
  ok('8 · Primera vuelta: agrega las dos columnas después de «Recomendaciones», crea un PDF por reunión en su carpeta (lunes en 01, martes en 02) y deja el enlace en «Minuta»',
     colsNuevas.join(',') === 'Compromisos con fecha@15,Por confirmar@16' && W.creados.length === 3 &&
     nombres.indexOf('01 Contratistas/Minuta 2026-09-28 Simón Bolívar (desde Smartsheet).pdf') >= 0 && nombres.indexOf('02 Servicios/Minuta 2026-09-29 Servicios y urbanismo (desde Smartsheet).pdf') >= 0 &&
     enlaces.length === 3 && /^https:\/\/drive\.test\/F/.test(enlaces[0].cuerpo[0].cells[0].hyperlink.url) && W.props.MINUTAS_VERSION === MIN_VERSION &&
     Object.keys(JSON.parse(W.props.MINUTAS_AL_DIA)).length === 3 && /Generada desde Smartsheet[^<]* el 01\/10\/2026/.test(W.creados[0].html),
     'columnas: ' + colsNuevas.join(', ') + ' · ' + W.creados.length + ' PDF · ' + enlaces.length + ' enlaces');

  // ── 9. No repite; una corrección reemplaza el mismo archivo ──
  var antes = { c: W.creados.length, p: W.puts.length, x: W.parches.length };
  generarMinutas();
  var quieta = W.creados.length === antes.c && W.puts.length === antes.p && W.parches.length === antes.x;
  var fila = W.filas.filter(function (v) { return v['ID de reunión'] === 'REU-2026-09-29-SRV' && v['Contratista / Ente']; })[0];
  fila['Solicitudes'] = 'Corregido en Smartsheet: 3 gandolas, no 2';
  generarMinutas();
  var idEz = JSON.parse(W.props.MINUTAS_AL_DIA)['REU-2026-09-29-SRV'].archivo;
  ok('9 · Segunda vuelta sin cambios: no escribe nada. Se corrige una celda: solo esa minuta se rehace, en el mismo archivo (mismo enlace), y nada va a la papelera',
     quieta && W.creados.length === antes.c && W.parches.length === antes.x + 1 && W.parches[W.parches.length - 1].metodo === 'patch' &&
     W.parches[W.parches.length - 1].url.indexOf('/files/' + idEz + '?uploadType=media&supportsAllDrives=true') > 0 &&
     /Corregido en Smartsheet/.test(W.porId[idEz].html) && W.puts.length === antes.p && W.papelera.length === 0,
     'quieta: ' + quieta + ' · PDF nuevos: ' + (W.creados.length - antes.c) + ' · reemplazos: ' + (W.parches.length - antes.x) + ' · enlaces nuevos: ' + (W.puts.length - antes.p));

  // ── 10. No pisa lo puesto a mano; si Drive no deja reemplazar; mirar no escribe ──
  var padreSr = W.filas.filter(function (v) { return v['ID de reunión'] === 'REU-2026-10-05-SR' && !v['Contratista / Ente']; })[0];
  padreSr['Minuta'] = 'MINUTA CONTRATISTAS LUNES 2026-10-05.pdf'; padreSr['Observaciones'] += ' / Punto agregado a mano';
  var a10 = { c: W.creados.length, p: W.puts.length };
  generarMinutas();
  var noPiso = padreSr['Minuta'] === 'MINUTA CONTRATISTAS LUNES 2026-10-05.pdf' && W.puts.length === a10.p && W.creados.length === a10.c;
  W.parcheCodigo = 403;
  var filaSb = W.filas.filter(function (v) { return v['ID de reunión'] === 'REU-2026-09-28-SB' && v['Contratista / Ente']; })[0];
  filaSb['Procura'] = 'Otra corrección';
  var viejoSb = JSON.parse(W.props.MINUTAS_AL_DIA)['REU-2026-09-28-SB'].archivo;
  generarMinutas();
  var nuevoSb = JSON.parse(W.props.MINUTAS_AL_DIA)['REU-2026-09-28-SB'].archivo;
  var padreSb = W.filas.filter(function (v) { return v['ID de reunión'] === 'REU-2026-09-28-SB' && !v['Contratista / Ente']; })[0];
  var W2 = mundo(F, true); mirarMinutas();
  ok('10 · Un enlace puesto a mano en «Minuta» no se pisa; si Drive no deja reemplazar, el anterior va a la papelera y el enlace apunta al nuevo; mirarMinutas no escribe',
     noPiso && nuevoSb !== viejoSb && W.papelera.join(',') === viejoSb && W.creados.length === a10.c + 1 && W.puts.length === a10.p + 1 &&
     W.puts[W.puts.length - 1].cuerpo[0].cells[0].hyperlink.url === 'https://drive.test/' + nuevoSb && padreSb['Minuta'] === 'Minuta 2026-09-28 Simón Bolívar (desde Smartsheet).pdf' &&
     W2.creados.length === 0 && W2.puts.length === 0 && W2.posts.length === 0 && !W2.props.MINUTAS_AL_DIA,
     'no pisó: ' + noPiso + ' · papelera: ' + W.papelera.join(',') + ' (era ' + viejoSb + ') · nuevo ' + nuevoSb + ' · mirar: ' + W2.creados.length + ' PDF, ' + W2.puts.length + ' escrituras');

  return R.join('\n');
})();
