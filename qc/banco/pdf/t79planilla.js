// QC16 (lado del relevo) de las 20 rondas de la planilla de avance (r79, ADR-0056), 29-oct-2026. Toma los envíos que dejó
// la tanda e10 en envios.jsonl —el informe de torre con fotos generales y uno de la planilla, tal como llegaron— y les
// pasa el código real del relevo: el PDF, el avance de la torre, el compilado y la consulta `planilla`.
// Se corre justo después de e10 (otra tanda borra envios.jsonl) con:
//   python3 qc/banco/pdf/headless-relevo.py <banco> t79planilla "Particion.gs,Copiar.gs,Oficina.gs,Codigo.gs,Planilla.gs,Compilado.gs,Consolidado.gs"
(function () {
  var R = [], ok = function (n, c, d) { R.push((c ? '✅ ' : '❌ ') + n + (d ? ' — ' + d : '')); };
  var x = new XMLHttpRequest(); x.open('GET', '/envios.jsonl?' + Date.now(), false); x.send();
  var envios = x.responseText.trim().split('\n').filter(Boolean).map(function (l) { return JSON.parse(l); });
  var eA = envios.filter(function (e) { return /-P05AA1-/.test(e.numero || '') && e.datos && e.datos.planilla; }).pop();
  var eT = envios.filter(function (e) { return e.datos && e.datos.ambito === 'torre' && (e.fotos || []).some(function (n) { return /^aptosgen-/.test(n); }); }).pop();
  if (!eA || !eT) return '❌ No están los envíos de e10 en envios.jsonl (córrala justo antes): ' + envios.length + ' envíos';
  var sobre = function (e) { return { numero: e.numero, tipo: 'obra', sector: 'EZ', torre: 'T-07', datos: e.datos, fotos: (e.fotos || []).map(function (n) { return { nombre: n, dato: 'ID:' + n }; }) }; };
  window._torreCompuesta = function (p) { return p.sector + '-' + String(p.torre).replace('-', ''); };
  var pA = sobre(eA), pT = sobre(eT);

  // ── el PDF del apartamento ──
  var hA = '', errA = ''; try { hA = _pdfHtml(pA); } catch (e) { errA = e.message; }
  // La fila de la subpartida en el PDF: su nombre y, en la sexta celda, el %.
  var filaPct = function (h, cod) {
    var hi = HITOS_V2.filter(function (x) { return x.codigos.indexOf(cod) >= 0; })[0]; if (!hi) return null;
    var nom = _pdfEsc(hi.items[hi.codigos.indexOf(cod)]).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var m = h.match(new RegExp('<td>' + nom + '</td>(?:<td[^>]*>[^<]*</td>){3}<td align="right">(\\d+) %</td>')); return m ? +m[1] : null;
  };
  ok('R1 · El PDF del informe de la planilla sale sin error', !errA && hA.length > 1000, errA);
  ok('R2 · Cada fila con su % de la planilla: 3.01 → 75, 3.02 → 100, 4.01 (estado) → 37, 2.02 (de antes) → 100', filaPct(hA, '3.01') === 75 && filaPct(hA, '3.02') === 100 && filaPct(hA, '4.01') === 37 && filaPct(hA, '2.02') === 100,
     [filaPct(hA, '3.01'), filaPct(hA, '3.02'), filaPct(hA, '4.01'), filaPct(hA, '2.02')].join(' / '));
  ok('R3 · La nota sale como texto (comillas, «&» y la etiqueta escapadas) y no hay sección de fotos generales', hA.indexOf('&lt;i&gt;nada&lt;/i&gt;') > 0 && hA.indexOf('<i>nada</i>') < 0 && hA.indexOf('FOTOS GENERALES') < 0);
  // ── lo que el avance de la torre y el compilado leen ──
  var pcts = _pctsDelInforme(JSON.parse(JSON.stringify(eA.datos)));
  var esperado = { '3.01': 75, '3.02': 100, '4.01': 37, '11.01': 100, '2.02': 100 };
  var difs = Object.keys(esperado).filter(function (c) { return pcts[c] !== esperado[c]; });
  ok('R4 · El avance de la torre lee exactamente lo de la planilla', !difs.length, difs.map(function (c) { return c + '=' + pcts[c]; }).join(' ') || JSON.stringify(pcts).slice(0, 160));
  var torreSolo = Object.keys(pcts).filter(function (c) { var h = HITOS_V2.filter(function (h) { return h.codigos.indexOf(c) >= 0; })[0]; if (!h) return false; var a = (h.ambito || [])[h.codigos.indexOf(c)]; return a === 'T'; });
  ok('R5 · …y no cuenta ninguna subpartida de torre (van fuera de ámbito)', !torreSolo.length, torreSolo.join(','));
  var cmp = null, errC = ''; try { cmp = _compPctsDeInforme(JSON.parse(JSON.stringify(eA.datos))); } catch (e) { errC = e.message; }
  ok('R6 · El compilado saca el % de cada hito del informe sin error (hito 3 y 4 con número)', !errC && cmp && typeof cmp.pcts.hito_servicios === 'number' && typeof cmp.pcts.hito_acabados === 'number', errC || JSON.stringify(cmp && cmp.pcts).slice(0, 200));
  // ── el PDF de torre con las fotos generales ──
  var hT = '', errT = ''; try { hT = _pdfHtml(pT); } catch (e) { errT = e.message; }
  var iFG = hT.indexOf('FOTOS GENERALES DE LOS APARTAMENTOS (5)');
  ok('R7 · El PDF de torre trae «FOTOS GENERALES DE LOS APARTAMENTOS (5)» con las cinco y en orden', !errT && iFG > 0 && (hT.slice(iFG).match(/src="ID:aptosgen-\d"/g) || []).length === 5, errT || (hT.slice(iFG).match(/src="ID:aptosgen-\d"/g) || []).join(','));
  ok('R8 · …después de los hitos, y su texto escapado (« & », la etiqueta como texto)', iFG > hT.lastIndexOf('HITO ') && hT.indexOf('P08 &amp; P09 &lt;b&gt;urgente&lt;/b&gt;') > iFG);
  ok('R9 · Ninguna foto general aparece dentro de un hito', hT.slice(0, iFG).indexOf('aptosgen') < 0);
  // ── la consulta `planilla` ──
  var leidos = [];
  var bak = { c: window.carpetaDeTorre, l: window._leerAvanceTorre };
  window.carpetaDeTorre = function (s, t) { return { s: s, t: t }; };
  window._leerAvanceTorre = function (carpeta, nombre) { leidos.push(nombre); return { archivo: null, datos: { torre: 'EZ-T07', informes: { TORRE: { nro: 'X' }, P01AA1: { nro: 'Y', pcts: { '3.01': 50 } } } } }; };
  var q1 = _planillaDeTorre({ sector: 'EZ', torre: 'T-07' }), q2 = _planillaDeTorre({ sector: 'EZ', torre: 'T-07', prueba: true });
  var q3 = _planillaDeTorre({ sector: 'EZ' }), q4 = _planillaDeTorre({ sector: 'ZZ', torre: 'T-07' });
  ok('R10 · `planilla` da los apartamentos sin el informe de torre; con prueba lee el PRUEBA-; sin torre o con un sector raro, error', q1.ok && Object.keys(q1.informes).join() === 'P01AA1' && leidos[0] === AVT_ARCHIVO && leidos[1] === 'PRUEBA-' + AVT_ARCHIVO && !q3.ok && !q4.ok, JSON.stringify([q1, q3.error, q4.error]).slice(0, 200));
  // ── el avance bajo candado ──
  var archivo = { txt: JSON.stringify({ torre: 'EZ-T07', informes: {} }), setContent: function (t) { this.txt = t; } }, log = [];
  window._leerAvanceTorre = function () { return { archivo: archivo, datos: JSON.parse(archivo.txt) }; };
  window.Utilities.formatDate = function () { return '2026-10-29'; };   // _hoy() del relevo
  window.LockService = { getScriptLock: function () { return { waitLock: function () { log.push('espera'); }, releaseLock: function () { log.push('suelta'); } }; } };
  var envio = function (e) { return { numero: e.numero, tipo: '', sector: 'EZ', torre: 'T-07', datos: JSON.parse(JSON.stringify(e.datos)) }; };
  var e2 = JSON.parse(JSON.stringify(eA)); e2.numero = e2.numero.replace('-P05AA1-', '-P05AA2-'); e2.datos.apto = 'A2';
  var r1 = null, r2 = null, errAv = ''; try { r1 = actualizarAvanceTorre(envio(eA)); r2 = actualizarAvanceTorre(envio(e2)); } catch (e) { errAv = e.message; }
  var guardado = JSON.parse(archivo.txt).informes;
  ok('R11 · Dos envíos seguidos: el avance guarda los dos apartamentos, cada escritura entre «espera» y «suelta»', !errAv && guardado.P05AA1 && guardado.P05AA2 && log.join(',') === 'espera,suelta,espera,suelta', errAv || log.join(',') + ' · ' + Object.keys(guardado).join(','));
  log = []; archivo.setContent = function () { throw new Error('Drive no contesta'); };
  try { actualizarAvanceTorre(envio(eA)); } catch (e) {}
  ok('R12 · Si Drive falla al escribir, el candado se suelta igual (el siguiente envío no se queda esperando)', log.join(',') === 'espera,suelta', log.join(','));
  window.carpetaDeTorre = bak.c; window._leerAvanceTorre = bak.l;
  ok('R13 · La versión del relevo es r79', /^r79-/.test(RELEVO_VERSION), RELEVO_VERSION);
  return R.join('\n');
})();
