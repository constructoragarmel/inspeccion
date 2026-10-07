// QC del r46 (6-oct-2026, PA-121): observaciones por hito juntas en el PDF y en el consolidado; avance por piso; sin fila de convenio.
// Se corre con headless-relevo.py y "Particion.gs,Consolidado.gs".
(function () {
  var R = [], ok = function (n, c, d) { R.push((c ? '✅ ' : '❌ ') + n + ' — ' + d); };
  window.Logger = { log: function () {} };
  window._torreCompuesta = function (p) { return 'EZ-' + String(p.torre).replace('-', ''); };
  var fila = function (pr, ej, ev) { return { pr: pr, ej: ej, ev: ev || '' }; };
  var obra = function (apto, piso, fotobs, noInsp, obsG) {
    return { numero: 'PRUEBA-EZ-T01-' + piso.replace('Piso ', 'P') + 'A' + apto + '-261006-XX', tipo: 'obra', sector: 'EZ', torre: 'T-01', fotos: [],
             datos: { lista: 'v2', ambito: 'apartamento', fecha: '2026-10-06', piso: piso, apto: apto, inspectores: ['Inspector Uno'], residentes: ['Ing. Residente Uno'],
                      estatus: ['En ejecución'], convenio: 'Convenio Bielorrusos', obs_general: obsG || '', noInspeccionados: noInsp || [], fotobs: fotobs || {},
                      partidas: { hito_acabados: [fila('100', '50', 'B'), fila('100', '25', 'R')], hito_servicios: [fila('18', '8', 'R')], hito_puertas: [fila('', '')] } } };
  };
  // ── 1. El PDF del apartamento ──
  var p1 = obra('1', 'Piso 01', { hito_acabados: 'Friso del baño desnivelado', hito_servicios: 'Puntos de agua sin tapón', hito_puertas: 'ESTO NO SALE' }, ['hito_puertas'], 'Observación general de prueba.');
  var h1 = '', e1 = ''; try { h1 = _pdfHtml(p1); } catch (x) { e1 = x.message + ' ' + (x.stack || '').split('\n')[1]; }
  var iT = h1.indexOf('OBSERVACIONES POR HITO'), iG = h1.indexOf('Observación general'), iA = h1.indexOf('HITO 4: ACABADOS');   // el primero es el bloque del hito; la tabla repite el nombre después
  ok('R1 · El PDF trae «Observaciones por hito» con las dos notas, después de los hitos y antes de la general', !e1 && iT > 0 && iT > iA && iG > iT && h1.indexOf('Friso del baño desnivelado', iT) > 0 && h1.indexOf('Puntos de agua sin tapón', iT) > 0, e1 || ('tabla en ' + iT + ' · general en ' + iG));
  ok('R2 · El hito marcado «No inspeccionado» no entra a la tabla', !/ESTO NO SALE/.test(h1.slice(iT)), '');
  ok('R3 · Sin observaciones de hito la tabla no sale, y la general sí', !/OBSERVACIONES POR HITO/.test(_pdfHtml(obra('2', 'Piso 01', {}, [], 'Solo general.'))) && /Solo general\./.test(_pdfHtml(obra('2', 'Piso 01', {}, [], 'Solo general.'))), '');
  ok('R4 · La identificación del PDF ya no lleva la fila «Convenio» (sí el sector)', !/>Convenio</.test(h1) && />Sector</.test(h1), '');
  // ── 2. El avance por piso ──
  var pesos = PESOS_POR_TORRE.torres['EZ-T01'].pesos, pa = _pesosDeApartamento(pesos);
  var informes = { P01AA1: { piso: 'Piso 01', fecha: '2026-10-05', pcts: { '4.01': 50, '2.02': 60 } }, P01AA2: { piso: 'Piso 01', fecha: '2026-10-06', pcts: { '4.01': 100 } },
                   P02AB1: { piso: 'Piso 02', fecha: '2026-10-05', pcts: {} }, TORRE: { piso: '', fecha: '2026-10-01', pcts: { '10.01': 30 } } };
  var pp = _avancePorPiso(informes, pesos, '2026-10-06');
  var w1 = pesos['4.01'], w2 = pesos['2.02'], sumaApto = Object.keys(pa).reduce(function (a, k) { return a + pa[k]; }, 0);
  var esperado = Math.floor((w1 * 75 + w2 * 60) / (w1 + w2)), cob = Math.floor((w1 + w2) / sumaApto * 100);
  ok('R5 · Dos pisos, sin «TORRE»; el piso 1 pondera lo último de sus dos apartamentos y el 2 queda «sin medir»',
     pp.length === 2 && pp[0].piso === 'Piso 01' && pp[0].apartamentos === 2 && pp[0].avance === esperado && pp[0].pesoMedido === cob && pp[0].ultimo === '2026-10-06' &&
     pp[1].piso === 'Piso 02' && pp[1].avance === null && pp[1].pesoMedido === null && pp[1].apartamentos === 1, JSON.stringify(pp) + ' esperado ' + esperado + '/' + cob);
  ok('R6 · Los pesos de apartamento excluyen los de torre (fachada 10.01, montantes) e incluyen los «Ambos» (frisos 4.01)', !pa['10.01'] && !pa['1.01'] && pa['4.01'] > 0 && pa['2.02'] > 0 && pa['5.09'] !== undefined === (pesos['5.09'] > 0), Object.keys(pa).length + ' códigos');
  var c1 = _conPorPiso({ avTorre: { porPiso: pp } });
  ok('R7 · El consolidado trae la tabla «Avance por piso» con «sin medir» en el piso 2, y sin pisos no trae nada', /AVANCE POR PISO/.test(c1) && /sin medir/.test(c1) && /Piso 01/.test(c1) && _conPorPiso({}) === '' && _conPorPiso({ avTorre: {} }) === '', '');
  // ── 3. El detalle de cada apartamento dentro del consolidado ──
  var s1 = '', e3 = ''; try { s1 = _conSeccion(p1, 1, null); } catch (x) { e3 = x.message; }
  ok('R8 · La sección del apartamento en el consolidado también junta las observaciones por hito', !e3 && /OBSERVACIONES POR HITO/.test(s1) && /Friso del baño/.test(s1) && !/ESTO NO SALE/.test(s1.slice(s1.indexOf('OBSERVACIONES POR HITO'))), e3);
  ok('R9 · La lista v2 tiene 91 subpartidas vivas, con 5.09 y 10.09, y Pesos.gs trae 10.09 en la T-01', HITOS_V2.reduce(function (a, h) { return a + h.items.length; }, 0) === 91 && HITOS_V2.some(function (h) { return h.codigos.indexOf('5.09') >= 0; }) && pesos['10.09'] > 0 && pesos['10.03'] > 0, '10.09=' + pesos['10.09']);
  // ── 4. r47: la versión del informe ──
  var pDef = obra('3', 'Piso 01', {}, [], 'Cerrado en oficina.'); pDef.datos.definitiva = { por: 'Ing. Coordinadora de ejemplo', fecha: '2026-10-07', desde: pDef.numero };
  var hDef = _pdfHtml(pDef), hPre = _pdfHtml(obra('4', 'Piso 01', {}, [], 'De campo.'));
  ok('R10 · El PDF dice la versión: «Definitiva · cerrada en oficina por …» o «Preliminar (campo)»', />Versi\u00f3n</.test(hDef) && /Definitiva \u00b7 cerrada en oficina por Ing\. Coordinadora de ejemplo el 2026-10-07/.test(hDef) && /Preliminar \(campo\)/.test(hPre) && !/Definitiva/.test(hPre), '');
  var sDef = _conSeccion(pDef, 1, null);
  ok('R11 · En el consolidado, la sección del apartamento dice la versión junto al número', /Definitiva \u00b7 cerrada en oficina/.test(sDef) && /Preliminar \(campo\)/.test(_conSeccion(obra('4', 'Piso 01', {}, [], ''), 1, null)), '');
  ok('R12 · Oficina.gs está cargado: _versionDelInforme y las dos consultas existen', typeof _oficinaLista === 'function' && typeof _oficinaAbrir === 'function' && _versionDelInforme({}) === 'Preliminar (campo)', '');
  return R.join('\n');
})();
