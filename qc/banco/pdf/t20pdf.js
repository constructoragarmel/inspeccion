// QC10 de la tanda 20 · el PDF de urbanismo con camiones, contra PDF.gs.
// En la consola de 127.0.0.1:8781: await window.__listo; eval(await (await fetch('t20pdf.js')).text())
(() => {
  const R = [], ok = (n, c, d) => R.push((c ? '✅ ' : '❌ ') + n + (d !== undefined ? ' — ' + String(d).slice(0, 200) : ''));
  const sobre = items => ({ numero: 'PRUEBA-URB-EZ-M2-260924-GB', tipo: 'urbanismo', sector: 'EZ', torre: 'M-2', fotos: [],
    datos: { fecha: '2026-09-24', inspectores: ['Gabriel Barrios'], general: [{ id: 'urb_preliminares', nombre: '1. OBRAS PRELIMINARES', obs: '', fotos: [], items }] } });
  const trs = h => [(h.match(/<tr[\s>]/g) || []).length, (h.match(/<\/tr>/g) || []).length];
  const muchos = Array.from({ length: 30 }, (_, i) => ({ placa: 'P' + (i + 1), m3: String((i + 1) / 10), viajes: String(i % 4 + 1) }));
  let h = _pdfHtmlUrbanismo(sobre([{ nombre: 'Bote de material', cant: '1113.9', ud: 'm³', sn: 'B', base: '1000', camiones: muchos }]));
  ok('30 camiones: los 30 en una fila, con la cuenta', (h.match(/Camión \d+ \(P\d+\)/g) || []).length === 30 && /Hoy: 113.9 m³ · acumulado anterior 1000 m³/.test(h), (h.match(/Hoy:[^<]*/) || [])[0]);
  ok('30 camiones: <tr> y </tr> cuadran', trs(h)[0] === trs(h)[1], trs(h).join('/'));
  h = _pdfHtmlUrbanismo(sobre([{ nombre: 'Bote de material', cant: '7', ud: 'm³', camiones: [{ placa: '<script>x()</script>"&', m3: '7' }] }]));
  ok('Placa con <script>, comillas y &: escapada', !/<script>x/.test(h) && /&lt;script&gt;/.test(h), (h.match(/Camión 1[^<]*/) || [])[0]);
  ok('Sin «viajes» (dato viejo o roto): 0 viaje(s), sin NaN', /7 m³ × 0 viaje\(s\)/.test(h) && !/NaN/.test(h));
  ok('Sin acumulado anterior: no dice «acumulado anterior»', !/acumulado anterior/.test(h));
  h = _pdfHtmlUrbanismo(sobre([{ nombre: 'Bote de material', cant: '5', ud: 'm³', sn: 'B' }]));
  ok('Informe sin camiones (v88 o anterior): ninguna fila de camiones', !/Camiones:/.test(h) && trs(h)[0] === trs(h)[1]);
  h = _pdfHtmlUrbanismo(sobre([{ nombre: 'Bote de material', cant: '5', ud: 'm³', camiones: [] }]));
  ok('Lista de camiones vacía: nada', !/Camiones:/.test(h));
  h = _pdfHtmlUrbanismo(sobre([{ nombre: 'Movimiento de tierra', cant: '0.3', ud: 'm³', camiones: [{ placa: 'A', m3: '0.1', viajes: '1' }, { placa: 'B', m3: '0.2', viajes: '1' }] }]));
  ok('Redondeo: 0.1 + 0.2 = «Hoy: 0.3 m³»', /Hoy: 0.3 m³/.test(h), (h.match(/Hoy:[^<]*/) || [])[0]);
  h = _pdfHtmlUrbanismo(sobre([{ nombre: 'Bote de material', cant: '12', ud: 'm³', heredado: 'URB-X', camiones: [{ placa: 'H', m3: '12', viajes: '1' }] }]));
  ok('La fila de camiones va justo debajo de su partida', /Bote de material[\s\S]*?<\/tr><tr><td><\/td><td colspan="6"[^>]*><b>Camiones:<\/b> Camión 1 \(H\)/.test(h));
  h = _pdfHtmlUrbanismo(sobre([{ nombre: 'Bote de material', ud: 'm³', camiones: [{ placa: 'SIN', m3: '3', viajes: '2' }] }]));
  ok('(BORDE) camiones sin cant ni calidad: la partida no sale y los camiones tampoco', !/Camiones:/.test(h), /Bote de material/.test(h) ? 'sale' : 'no sale');
  window.__t20pdf = R; return R;
})();
