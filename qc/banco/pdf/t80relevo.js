// r80 (2-nov-2026): los rótulos nuevos de la 3.02 («Puntos de desagüe») y la 4.01 («Friso interno») llegan al PDF, a
// Smartsheet y al compilado, sin regenerar Pesos.gs (sus nombres son de antes y el compilado ya no los usa).
// Uso: python3 qc/banco/pdf/headless-relevo.py <banco> t80relevo "Particion.gs,Copiar.gs,Oficina.gs,Codigo.gs,Planilla.gs,Compilado.gs,Consolidado.gs"
(function () {
  var R = [], ok = function (n, c, d) { R.push((c ? '✅ ' : '❌ ') + n + (d ? ' — ' + d : '')); };
  var nom = function (cod) { var h = HITOS_V2.filter(function (x) { return x.codigos.indexOf(cod) >= 0; })[0]; return h ? h.items[h.codigos.indexOf(cod)] : null; };
  ok('V1 · La lista v2 del relevo: 3.02 «Puntos de desagüe», 4.01 «Friso interno» y 5.04 «Marcos metálicos de puertas»; el resto de los códigos igual', nom('3.02') === 'Puntos de desagüe' && nom('4.01') === 'Friso interno' && nom('5.04') === 'Marcos met\u00e1licos de puertas' && nom('3.01') === 'Aguas blancas (puntos de agua fría y caliente)' && nom('4.02') === 'Encamisados', nom('3.02') + ' · ' + nom('4.01'));
  // Un informe de apartamento como lo manda la planilla: 3.02 al 50 y 4.01 al 30.
  var pl = function (cod, v) { return { codigo: cod, pct: v }; };
  var d = { lista: 'v2', formType: 'obra', ambito: 'apartamento', vista: 'apartamento', fecha: '2026-11-02', nro: 'PRUEBA-SR-T43-P03AA07-261102-PR', convenio: 'Convenio Rusos',
            torre: 'T-43', piso: 'Piso 03', apto: 'A07', inspectores: ['Prueba (CIV-NC)'], estatus: ['En progreso'], partidas: {},
            planilla: { origen: 'obra', guardada: '2026-11-02T13:00:00Z' } };
  HITOS_V2.forEach(function (h) { d.partidas[h.id] = h.items.map(function (_, i) { var c = h.codigos[i]; return { pr: '', ej: '', ev: '', sn: '', pct: c === '3.02' ? '50' : c === '4.01' ? '30' : '' }; }); d.partidas[h.id + '_extra'] = []; });
  var hA = '', err = ''; try { hA = _pdfHtml({ numero: 'PRUEBA-SR-T43-P03AA07-261102-PR', tipo: 'obra', sector: 'SR', torre: 'T-43', datos: d, fotos: [] }); } catch (e) { err = e.message; }
  ok('V2 · El PDF sale con «Puntos de desagüe» y «Friso interno» y sin los nombres de antes', !err && hA.indexOf('Puntos de desag') > 0 && hA.indexOf('Friso interno') > 0 && hA.indexOf('(descargas)') < 0 && hA.indexOf('<td>Frisos</td>') < 0, err || (hA.match(/<td>(Puntos de desag[^<]*|Friso[^<]*)<\/td>/g) || []).join(' '));
  // El compilado: pesos de SR-T43 (Pesos.gs con los nombres viejos) y el avance con la 3.02 y la 4.01.
  var bak = { c: window.carpetaDeTorre, l: window._leerAvanceTorre };
  window.carpetaDeTorre = function (s, t) { return { s: s, t: t }; };
  window._leerAvanceTorre = function () { return { archivo: null, datos: { torre: 'SR-T43', informes: { P03AA07: { nro: 'X', fecha: '2026-11-02', pcts: { '3.02': 50, '4.01': 30 } } } } }; };
  window.Utilities = window.Utilities || {}; window.Utilities.formatDate = function () { return '2026-11-02'; };
  window._torreCompuesta = function (p) { return p.sector + '-' + String(p.torre).replace('-', ''); };
  var viejo = (PESOS_POR_TORRE.lista || []).filter(function (x) { return x.codigo === '4.01'; })[0];
  var r = null, errC = ''; try { r = _compAvanceApp('SR', 'T-43'); } catch (e) { errC = e.message; }
  var p302 = r && (r.partidas || []).filter(function (x) { return x.codigo === '3.02'; })[0], p401 = r && (r.partidas || []).filter(function (x) { return x.codigo === '4.01'; })[0];
  ok('V3 · El compilado nombra las partidas con la lista v2 aunque Pesos.gs diga «' + (viejo && viejo.nombre) + '»', !errC && !r.error && p401 && p401.nombre === 'Friso interno' && (!p302 || p302.nombre === 'Puntos de desagüe'),
     errC || (r && r.error) || JSON.stringify([p302, p401]).slice(0, 220));
  ok('V4 · …y conserva el hito, el ámbito y el peso de Pesos.gs', p401 && p401.hito === 4 && !!p401.ambito && p401.peso > 0 && p401.promedio === 30, JSON.stringify(p401));
  window.carpetaDeTorre = bak.c; window._leerAvanceTorre = bak.l;
  ok('V5 · La versión del relevo es r80 o posterior', /^r(8[0-9])-/.test(RELEVO_VERSION), RELEVO_VERSION);
  return R.join('\n');
})();
