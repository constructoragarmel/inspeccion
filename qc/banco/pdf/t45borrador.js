// QC del borrador del informe semanal (relevo r32, 1-oct-2026). Se corre en borrador.html, que carga los .gs del relevo, con:
//   eval(await (await fetch('t45borrador.js')).text())
// Todo contra un informe inventado de cuatro láminas: portada, materiales de dos sectores y una lámina cualquiera.
(function () {
  var R = [];
  var ok = function (n, c, d) { R.push((c ? '✅ ' : '❌ ') + n + ' — ' + d); };
  var NS = ' xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
  var bienFormado = function (xml) { return new DOMParser().parseFromString(xml, 'application/xml').getElementsByTagName('parsererror').length === 0; };
  var MAESTRO = ['Constructora Vialpa, S.A.', 'RACAR Ingenieros, C.A.', 'ING & ARQ 1111, C.A.', 'TSURU 5158, C.A.'];
  var rPr = '<a:rPr b="0" lang="en-US" sz="1100"><a:latin typeface="Montserrat"/></a:rPr>';
  var p = function (t) { return '<a:p><a:pPr algn="l"><a:buNone/></a:pPr><a:r>' + rPr + '<a:t>' + t + '</a:t></a:r><a:endParaRPr sz="1400"/></a:p>'; };
  var tc = function (t, attr) { return '<a:tc' + (attr || '') + '><a:txBody><a:bodyPr/><a:lstStyle/>' + (attr === ' vMerge="1"' ? '<a:p/>' : p(t)) + '</a:txBody><a:tcPr/></a:tc>'; };
  var tr = function (celdas) { return '<a:tr h="500000">' + celdas.join('') + '</a:tr>'; };
  var sp = function (id, t) { return '<p:sp><p:nvSpPr><p:cNvPr id="' + id + '" name="Forma ' + id + '"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr/><p:txBody><a:bodyPr/><a:lstStyle/>' + t.split('|').map(p).join('') + '</p:txBody></p:sp>'; };
  var lamina = function (formas, tabla) {
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sld' + NS + '><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/>' + formas +
           (tabla ? '<p:graphicFrame><p:nvGraphicFramePr><p:cNvPr id="90" name="Tabla"/><p:cNvGraphicFramePr/><p:nvPr/></p:nvGraphicFramePr><p:xfrm/><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/table"><a:tbl><a:tblPr/><a:tblGrid/>' + tabla + '</a:tbl></a:graphicData></a:graphic></p:graphicFrame>' : '') +
           '</p:spTree></p:cSld></p:sld>';
  };
  var CAB = tr(['SECTOR', 'TORRE', 'FECHA ENTREGA', 'EMPRESA', 'REQUERIMIENTO'].map(function (t) { return tc(t); }));
  var portada = lamina(sp(2, 'INFORME GENERAL') + sp(3, 'Presentado al Ministerio. Fecha de corte: 25 de septiembre de 2026|Gerencia Técnica') + sp(4, 'Septiembre 2026') + sp(5, 'Visita del 24 de septiembre de 2026'));
  var matSB = lamina(sp(2, '6. Requerimiento de materiales') + sp(3, 'Sector Simón Bolívar · Cuadro actualizado al 19 de septiembre de 2026') + sp(7, 'NO HUBO REQUERIMIENTO DE MATERIAL POR PARTE DE LAS CONTRATISTAS'),
    CAB + tr([tc('SIMÓN BOLÍVAR'), tc('D-08'), tc('18/11/2026'), tc('CONSTRUCTORA VIALPA, C.A.'), tc('No reportó necesidad')]) +
          tr([tc('SIMÓN BOLÍVAR'), tc('J-07'), tc('16/10/2026'), tc('ING &amp; ARQ 1111, C.A.'), tc('Bloques viejos')]) +
          tr([tc('SIMÓN BOLÍVAR'), tc('J-09'), tc('30/01/2027'), tc('RACAR INGENIEROS, C.A.', ' rowSpan="2"'), tc('No reportó necesidad', ' rowSpan="2"')]) +
          tr([tc('SIMÓN BOLÍVAR'), tc('J-11'), tc('12/12/2026'), tc('', ' vMerge="1"'), tc('', ' vMerge="1"')]) +
          tr([tc('SIMÓN BOLÍVAR'), tc('J-99'), tc('01/01/2027'), tc('EMPRESA QUE NO FUE, C.A.'), tc('No reportó necesidad')]));
  var matSR = lamina(sp(2, '6. Requerimiento de materiales') + sp(3, 'Sector Simón Rodríguez · Cuadro actualizado al 19 de septiembre de 2026'),
    CAB + tr([tc('SIMÓN RODRÍGUEZ'), tc('T-07'), tc('21/10/2026'), tc('TSURU 5158, C.A.'), tc('No reportó necesidad')]));
  var otra = lamina(sp(2, '2. Avance físico · Sector Simón Bolívar') + sp(3, 'Al 25 de septiembre de 2026 la torre va en 80%'));
  var L = REU_TIPOS[0], M = REU_TIPOS[1];
  var filas = [
    { _id: 1, 'ID de reunión': 'REU-2026-09-21-SB', 'Fecha': '2026-09-21', 'Tipo': L, 'Sector': 'Simón Bolívar' },
    { _id: 2, _parentId: 1, 'Contratista / Ente': 'CONSTRUCTORA VIALPA, C.A.', 'Cemento pendiente (gandolas)': 99 },
    { _id: 3, 'ID de reunión': 'REU-2026-09-28-SB', 'Fecha': '2026-09-28', 'Tipo': L, 'Sector': 'Simón Bolívar' },
    { _id: 4, _parentId: 3, 'Contratista / Ente': 'CONSTRUCTORA VIALPA, C.A.', 'Cemento pendiente (gandolas)': 7 },
    { _id: 5, _parentId: 3, 'Contratista / Ente': 'RACAR INGENIEROS, C.A.', 'Cemento pendiente (gandolas)': 1, 'Bloques pendientes (und.)': 12000 },
    { _id: 6, _parentId: 3, 'Contratista / Ente': 'Racar Ingenieros', 'Bloques pendientes (und.)': 500 },
    { _id: 7, _parentId: 3, 'Contratista / Ente': 'ING&ARQ 1111, C.A.' },
    { _id: 8, 'ID de reunión': 'REU-2026-09-29-SRV', 'Fecha': '2026-09-29', 'Tipo': M, 'Sector': 'Todos' },
    { _id: 9, _parentId: 8, 'Contratista / Ente': 'TSURU 5158, C.A.', 'Cemento pendiente (gandolas)': 50 }];
  var datos = _infDatosDeMateriales(filas, '2026-10-02', MAESTRO);

  // ── 1. El corte ──
  var c1 = ['2026-09-28', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-12-31'].map(_infCorte);
  ok('1 · El corte es el viernes de la semana; sábado y domingo cuentan para el viernes siguiente, también al cambiar de año',
     c1.join(',') === '2026-10-02,2026-10-02,2026-10-02,2026-10-09,2026-10-09,2027-01-01', c1.join(' · '));

  // ── 2. Los datos ──
  var sb = datos['Simón Bolívar'] || { empresas: {} };
  ok('2 · Toma la reunión de contratistas de esta semana (no la del lunes anterior ni la de servicios) y suma las filas repetidas de una empresa',
     sb.fecha === '2026-09-28' && sb.empresas['Constructora Vialpa, S.A.'].cemento === 7 && sb.empresas['RACAR Ingenieros, C.A.'].bloques === 12500 &&
     sb.empresas['ING & ARQ 1111, C.A.'].cemento === 0 && !datos['Simón Rodríguez'] && !datos['Ezequiel Zamora'],
     'SB ' + sb.fecha + ' · Vialpa ' + JSON.stringify(sb.empresas['Constructora Vialpa, S.A.']) + ' · RACAR ' + JSON.stringify(sb.empresas['RACAR Ingenieros, C.A.']) + ' · SR: ' + !!datos['Simón Rodríguez']);

  // ── 3. El orden de las láminas ──
  var pres = '<p:presentation><p:sldIdLst><p:sldId id="256" r:id="rId7"/><p:sldId r:id="rId3" id="257"/><p:sldId id="258" r:id="rId9"/><p:sldId id="259" r:id="rId4"/></p:sldIdLst></p:presentation>';
  var rels = '<Relationships><Relationship Id="rId3" Type="x/slide" Target="slides/slide12.xml"/><Relationship Target="slides/slide1.xml" Type="x/slide" Id="rId7"/><Relationship Id="rId9" Type="x/slide" Target="/ppt/slides/slide3.xml"/><Relationship Id="rId4" Type="x/slide" Target="slides/slide4.xml"/><Relationship Id="rId1" Type="x/theme" Target="theme/theme1.xml"/></Relationships>';
  var orden = _infOrden(pres, rels);
  ok('3 · Las láminas se recorren en el orden en que se ven, no por el número del archivo',
     orden.join(',') === 'ppt/slides/slide1.xml,ppt/slides/slide12.xml,ppt/slides/slide3.xml,ppt/slides/slide4.xml', orden.join(' · '));

  // ── 4. La portada ──
  var po = _infPortada(portada, '2026-09-25', '2026-10-02');
  ok('4 · Portada: cambia la fecha de corte y el mes, y deja quieta otra fecha que no es el corte',
     po.cambios === 2 && /Fecha de corte: 2 de octubre de 2026/.test(po.xml) && />Octubre 2026</.test(po.xml) && /Visita del 24 de septiembre de 2026/.test(po.xml) &&
     !/25 de septiembre/.test(po.xml) && /Gerencia Técnica/.test(po.xml) && bienFormado(po.xml), po.cambios + ' cambios · ' + _infTexto(po.xml).split('\n').slice(1, 4).join(' / '));

  // ── 5 a 7. La lámina de materiales ──
  var m = _infMateriales(matSB, datos, MAESTRO), t5 = _infTabla(m.xml);
  var req = t5.slice(1).map(function (f) { return f.celdas[4].texto; });
  ok('5 · Materiales: cada empresa recibe lo suyo aunque su nombre esté escrito distinto (S.A. / C.A., «ING & ARQ» / «ING&ARQ»); las demás columnas no cambian',
     req[0] === 'Cemento: 7 gandolas' && req[1] === 'No reportó necesidad' && t5[1].celdas[3].texto === 'CONSTRUCTORA VIALPA, C.A.' && t5[1].celdas[2].texto === '18/11/2026' &&
     t5[2].celdas[3].texto === 'ING & ARQ 1111, C.A.', req.slice(0, 2).join(' · '));
  var celdaRacar = t5[3].celdas[4];
  ok('6 · Dos datos van en dos renglones con el formato de la celda; la celda combinada de abajo no se toca; el XML sigue bien formado',
     celdaRacar.texto === 'Cemento: 1 gandola\nBloques: 12.500 und.' && (celdaRacar.xml.match(/<a:latin typeface="Montserrat"\/>/g) || []).length === 2 &&
     / rowSpan="2"/.test(celdaRacar.xml) && t5[4].celdas[4].fusionada && t5[4].celdas[4].xml.indexOf('<a:p/>') > 0 && bienFormado(m.xml) && t5.length === 6 && t5[5].celdas.length === 5,
     JSON.stringify(celdaRacar.texto) + ' · bien formado: ' + bienFormado(m.xml));
  var mSin = _infMateriales(matSB, { 'Simón Bolívar': { fecha: '2026-09-28', id: 'x', empresas: { 'Constructora Vialpa, S.A.': { cemento: 0, bloques: 0 } } } }, MAESTRO);
  ok('7 · La fecha del cuadro pasa a la de la reunión; el cartel «NO HUBO REQUERIMIENTO» se quita si hubo y se queda si no hubo',
     /Sector Simón Bolívar · Cuadro actualizado al 28 de septiembre de 2026/.test(_infTexto(m.xml)) && !/NO HUBO REQUERIMIENTO/.test(m.xml) && m.sobraAviso &&
     /NO HUBO REQUERIMIENTO/.test(mSin.xml) && !mSin.sobraAviso && mSin.conRequerimiento.length === 0,
     'con pedidos: cartel ' + /NO HUBO/.test(m.xml) + ' · sin pedidos: cartel ' + /NO HUBO/.test(mSin.xml));

  // ── 8 y 9. Lo que no se sabe ──
  var mSR = _infMateriales(matSR, datos, MAESTRO);
  ok('8 · Un sector sin reunión cargada esta semana no se toca, y una lámina que no es de materiales se ignora',
     mSR && mSR.tocada === false && mSR.xml === matSR && mSR.sector === 'Simón Rodríguez' && _infMateriales(otra, datos, MAESTRO) === null && _infMateriales(portada, datos, MAESTRO) === null,
     'SR tocada: ' + (mSR && mSR.tocada) + ' · otra: ' + _infMateriales(otra, datos, MAESTRO));
  ok('9 · Una empresa de la lámina que no tiene fila en la reunión no hereda el «No reportó necesidad» viejo: dice que no hay registro y sale en la lista de revisar',
     req[4] === 'Sin registro en la reunión del 28-09-2026' && m.sinRegistro.join() === 'EMPRESA QUE NO FUE, C.A.' && m.conRequerimiento.length === 2,
     req[4] + ' · revisar: ' + m.sinRegistro.join());

  // ── 10. De punta a punta ──
  var parte = function (n, t) { return { getName: function () { return n; }, getDataAsString: function () { return t; } }; };
  var partes = [parte('ppt/presentation.xml', pres), parte('ppt/_rels/presentation.xml.rels', rels), parte('ppt/slides/slide1.xml', portada),
                parte('ppt/slides/slide12.xml', matSB), parte('ppt/slides/slide3.xml', matSR), parte('ppt/slides/slide4.xml', otra), parte('ppt/media/foto.jpg', 'binario')];
  var res = _infArmar(partes, datos, MAESTRO, { fecha: '2026-09-25', archivo: { getName: function () { return '2026-09-25 Informe General v2.pptx'; } } }, '2026-10-02', '01/10/2026 a las 20:00');
  var nuevas = res.partes.filter(function (b) { return b.__nuevo; }).map(function (b) { return b.getName(); });
  var x1 = res.partes[2].getDataAsString(), x12 = res.partes[3].getDataAsString();
  var ids = (x1.match(/<p:cNvPr id="\d+"/g) || []).map(function (s) { return s.replace(/\D/g, ''); });
  ok('10 · De punta a punta: solo cambian la portada y la lámina con datos; cada una lleva su nota amarilla (con número propio y dentro de la lámina); el relato dice la base, lo actualizado, lo que hay que revisar y lo que falta',
     nuevas.join(',') === 'ppt/slides/slide1.xml,ppt/slides/slide12.xml' && res.partes.length === 7 && res.partes[4].getDataAsString() === matSR &&
     (x1.match(/name="Nota del borrador"/g) || []).length === 1 && (x12.match(/name="Nota del borrador"/g) || []).length === 1 && ids.length === new Set(ids).size &&
     x1.indexOf('Nota del borrador') < x1.indexOf('</p:spTree>') && bienFormado(x1) && bienFormado(x12) &&
     res.lineas[1] === 'Base: 2026-09-25 Informe General v2.pptx' && res.lineas.some(function (l) { return /Lámina 2 · materiales de Simón Bolívar \(reunión del 28-09-2026\)/.test(l); }) &&
     res.lineas.some(function (l) { return /Lámina 3: materiales de Simón Rodríguez SIN actualizar/.test(l); }) && res.lineas.some(function (l) { return /EMPRESA QUE NO FUE/.test(l); }) &&
     res.lineas.some(function (l) { return /^LO DEMÁS VIENE IGUAL/.test(l); }),
     'cambiaron: ' + nuevas.join(', ') + ' · ' + res.lineas.length + ' renglones en la nota');

  return R.join('\n');
})();
