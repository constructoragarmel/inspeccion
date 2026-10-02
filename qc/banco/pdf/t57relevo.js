// QC del r38 (2-oct-2026, v114): «Actividades en ejecución» en el PDF de obra, en el de urbanismo y en el consolidado;
// «Solución» y «Responsable del correctivo» en el PDF de SHA y en lo que va a Smartsheet.
// Se corre en pdf/index.html del banco con Sha.gs, Urbanismo.gs y Consolidado.gs cargados:  eval(await (await fetch('t57relevo.js')).text())
(function () {
  var R = [], ok = function (n, c, d) { R.push((c ? '✅ ' : '❌ ') + n + ' — ' + d); };
  window.Logger = { log: function () {} };
  window._torreCompuesta = function (p) { return 'EZ-' + String(p.torre).replace('-', ''); };
  var ACT = 'Acarreo de bloques al piso 4; cuadrilla de friso en los pisos 2 y 3.';
  var obra = function (apto, act, obs) {
    return { numero: 'PRUEBA-EZ-T56-P03-' + apto + '-261005-XX', tipo: 'obra', sector: 'EZ', torre: 'T-56', fotos: [],
             datos: { lista: 'v2', ambito: 'apartamento', fecha: '2026-10-05', piso: 'Piso 03', apto: apto, partidas: {}, inspectores: ['Inspector Uno'],
                      residentes: ['Ing. Residente Uno'], estatus: ['En ejecución'], actividades: act, obs_general: obs || '' } };
  };

  // ── 1. El PDF de obra ──
  var h1 = _pdfHtml(obra('A', ACT, 'Se pidió corregir el plomo de la pared del pasillo.'));
  var iA = h1.indexOf('Actividades en ejecuci'), iO = h1.indexOf('Observación general');
  ok('R1 · El PDF de obra trae «Actividades en ejecución» con lo escrito, antes de la observación general', iA > 0 && iO > iA && h1.indexOf('Acarreo de bloques') > iA, 'actividades en ' + iA + ' · observación en ' + iO);
  var h1b = _pdfHtml(obra('A', '', 'Solo observación.')), viejo = obra('A', '', 'Informe de antes.'); delete viejo.datos.actividades;
  ok('R2 · Sin actividades escritas (o en un informe de antes del campo) esa fila no sale', !/Actividades en ejecuci/.test(h1b) && !/Actividades en ejecuci/.test(_pdfHtml(viejo)) && /Solo observaci/.test(h1b), 'sin fila');
  ok('R3 · Un informe con solo actividades, sin observación, igual las imprime', /Acarreo de bloques/.test(_pdfHtml(obra('A', ACT, ''))), 'sale');

  // ── 2. El consolidado: una sola vez ──
  var tres = [obra('A', ACT), obra('B', ACT), obra('C', '  acarreo de bloques al piso 4;  cuadrilla de friso en los pisos 2 y 3. ')];
  var c1 = _conActividades(tres), veces = (c1.match(/Acarreo de bloques/gi) || []).length;
  ok('R4 · En el consolidado del día, el mismo texto repetido en tres apartamentos sale una sola vez', /ACTIVIDADES EN EJECUCI/.test(c1) && veces === 1, veces + ' vez');
  var c2 = _conActividades([obra('A', ACT), obra('B', ACT + ' Llegó el camión de cabillas.'), obra('C', 'Vaciado de la losa del piso 5.')]);
  ok('R5 · Si un informe trae el texto de otro con algo agregado queda el más largo, y un texto distinto sale aparte',
     (c2.match(/Acarreo de bloques/g) || []).length === 1 && /camión de cabillas/.test(c2) && /Vaciado de la losa/.test(c2) && (c2.match(/<tr>/g) || []).length === 3, (c2.match(/<tr>/g) || []).length - 1 + ' textos');
  ok('R6 · Sin actividades en ningún informe, el consolidado no lleva ese cuadro; y el detalle de cada apartamento no las repite',
     _conActividades([obra('A', ''), obra('B', '')]) === '' && !/Actividades en ejecuci/.test(_pdfObservacionGeneral(obra('A', ACT, 'Obs.').datos, true)) && /Obs\./.test(_pdfObservacionGeneral(obra('A', ACT, 'Obs.').datos, true)), 'limpio');

  // ── 3. Urbanismo ──
  var urb = { numero: 'PRUEBA-URB-EZ-M1-261005-XX', tipo: 'urbanismo', sector: 'EZ', torre: 'M-1', fotos: [],
              datos: { tipo: 'urbanismo', torre: 'M-1', fecha: '2026-10-05', empresa: 'CONTRATISTA DE PRUEBA', inspectores: ['Inspector Uno'], general: [], camiones: [],
                       actividades: 'Limpieza y desmalezamiento en la zona posterior.', obs_general: 'Se cubicaron los camiones.' } };
  var hu = '', eu = ''; try { hu = _pdfHtmlUrbanismo(urb); } catch (x) { eu = x.message; }
  ok('R7 · El PDF de urbanismo trae «Actividades en ejecución» antes de la observación general', !eu && hu.indexOf('Actividades en ejecuci') > 0 && hu.indexOf('desmalezamiento en la zona posterior') > hu.indexOf('Actividades en ejecuci') && hu.indexOf('Se cubicaron') > hu.indexOf('desmalezamiento en la zona'), eu || 'sale');

  // ── 4. SHA: solución y responsable ──
  var K = { d: 'hallazgo__Descripción del hallazgo o condición observada', e: 'hallazgo__Acción correctiva / estatus', s: 'hallazgo__Solución', r: 'hallazgo__Responsable del correctivo' };
  var H = function (desc, est, sol, resp) { var c = {}; c[K.d] = desc; c[K.e] = est; if (sol !== undefined) c[K.s] = sol; if (resp !== undefined) c[K.r] = resp; return { apto: 'Andamio norte', piso: '', campos: c, fotos: [] }; };
  var sha = { numero: 'PRUEBA-SHA-EZ-T56-261005-XX', tipo: 'sha', sector: 'EZ', torre: 'T-56', carpetaUrl: 'https://carpeta', fotos: [],
              datos: { tipo: 'sha', torre: 'T-56', fecha: '2026-10-05', empresa: 'CONTRATISTA DE PRUEBA', inspectores: ['Inspector Uno'], residentes: ['Ing. Residente Uno'], estatus: ['Aprobado con observaciones'],
                       general: [], incidencias: [], apartamentos: [H('Andamio sin rodapié.', 'Pendiente', 'Se pidió completar el andamio.', 'Ing. residente'), H('Hueco sin proteger.', 'Corregido')] } };
  var hs = _pdfHtmlSha(sha);
  ok('R8 · El PDF de SHA imprime la solución y el responsable del hallazgo que los trae, y no deja filas vacías en el que no',
     (hs.match(/>Solución</g) || []).length === 1 && (hs.match(/>Responsable del correctivo</g) || []).length === 1 && /Se pidió completar el andamio/.test(hs) && /Ing\. residente/.test(hs),
     'solución ×' + (hs.match(/>Solución</g) || []).length + ' · responsable ×' + (hs.match(/>Responsable del correctivo</g) || []).length);
  var a = _hallazgoDe(sha.datos.apartamentos[0]), b = _hallazgoDe(sha.datos.apartamentos[1]);
  var desordenado = {}; desordenado[K.s] = 'Sol.'; desordenado[K.r] = 'Resp.'; desordenado[K.e] = 'En proceso'; desordenado[K.d] = 'Descripción al final.';
  var c = _hallazgoDe({ campos: desordenado }), viejoH = _hallazgoDe({ campos: { 'hallazgo__Qué se vio': 'Texto de un informe viejo.', 'hallazgo__Acción correctiva / estatus': 'Pendiente' } });
  ok('R9 · El relevo separa bien los cuatro campos aunque lleguen en otro orden, y un hallazgo de antes sigue leyéndose',
     a.texto === 'Andamio sin rodapié.' && a.estatus === 'Pendiente' && a.solucion === 'Se pidió completar el andamio.' && a.responsable === 'Ing. residente' &&
     b.solucion === '' && b.responsable === '' && c.texto === 'Descripción al final.' && c.solucion === 'Sol.' && c.responsable === 'Resp.' && viejoH.texto === 'Texto de un informe viejo.' && viejoH.estatus === 'Pendiente',
     JSON.stringify([a.solucion, a.responsable, c.texto, viejoH.texto]));

  // ── 5. Lo que va a Smartsheet ──
  var puestas = {};
  window.PropertiesService = { getScriptProperties: function () { return { getProperty: function (k) { return ({ SS_TOKEN: 't', SS_SHA_INFORMES: '1', SS_SHA_RECAUDOS: '2', SS_SHA_HALLAZGOS: '3', SS_SHA_INCIDENCIAS: '4' })[k] || null; } }; } };
  window._reemplazarPorNumero = function () { return { borradas: 0, revision: 0 }; };
  window._fila = function (t, hoja, v) { return v; };
  window._post = function (t, ruta, filas) { puestas[ruta] = filas; return {}; };
  window._postEnTandas = function (t, hoja, filas) { puestas[hoja] = filas; };
  window._ubicacion = window._ubicacion || function () { return ''; };
  window._hoy = function () { return '2026-10-05'; };
  var r5 = empujarShaASmartsheet(sha), f = (puestas['3'] || [])[0] || {}, g = (puestas['3'] || [])[1] || {};
  ok('R10 · A la hoja de hallazgos van «Solución» y «Responsable del correctivo» de cada uno; la clave del hallazgo sigue saliendo de la descripción',
     r5.ok === true && r5.hallazgos === 2 && f['Solución'] === 'Se pidió completar el andamio.' && f['Responsable del correctivo'] === 'Ing. residente' && f['Hallazgo'] === 'Andamio sin rodapié.' &&
     g['Solución'] === '' && g['Estatus'] === 'Corregido' && /andamiosinrodapie/.test(String(f['Clave de hallazgo'])), JSON.stringify([f['Solución'], f['Responsable del correctivo'], f['Clave de hallazgo']]));
  var plantilla = SHA_HOJAS[2][3].map(function (x) { return x[0]; }), iE = plantilla.indexOf('Estatus');
  ok('R11 · La plantilla de la hoja de hallazgos trae las dos columnas nuevas después de «Estatus», y la de obra y la de urbanismo traen «Actividades en ejecución»',
     plantilla[iE + 1] === 'Solución' && plantilla[iE + 2] === 'Responsable del correctivo' &&
     _plantillaInformes().some(function (x) { return x[0] === 'Actividades en ejecución'; }) && URB_HOJAS[0][3].some(function (x) { return x[0] === 'Actividades en ejecución'; }), plantilla.slice(iE, iE + 3).join(' · '));
  return R.join('\n');
})();
