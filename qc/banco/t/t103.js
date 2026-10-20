// TANDA 103 · v178 (20-oct-2026), pedidos 1 y 5 de Diego Orta, en urbanismo.html, servicios.html o inspeccion.html (?prueba=1&oficina=1).
// Urbanismo y servicios: 1 tres botones, sin «Manzana» · 2 el panel va después de la tarjeta del lugar · 3 el caso de Gabriel
// Barrios (19-oct): toda la zona Ezequiel Zamora que también afecta a Simón Bolívar y Simón Rodríguez es la visita anterior de
// esas zonas, y lo dice; la de Ezequiel Zamora sigue con la suya · 4 al traerla, la zona de la pantalla no cambia · 5 una manzana
// sigue como siempre (urbanismo) · 6 el aviso del panel dice «arriba».
// Obra: 1 el panel va después de la ubicación y antes de los hitos · 2 el aviso dice «arriba».
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc');
Q.aceptar = true;
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); };
const panel = document.getElementById('oficina');
if (typeof TIPO_INFORME === 'undefined') {
  // ── obra ──
  const est = document.getElementById('estatus'), rej = est.closest('.field').parentElement;
  const hito = document.querySelector('[id^="p_"]');
  ok('1 · Obra: el panel de oficina va después de la ubicación (estatus) y antes de los hitos',
     rej.nextElementSibling === panel && (!hito || (panel.compareDocumentPosition(hito) & Node.DOCUMENT_POSITION_FOLLOWING)), panel.previousElementSibling && panel.previousElementSibling.className);
  _ES_OFICINA = true; _oficinaMostrar(); await oficinaBuscar(); await esperar(200);
  ok('2 · Obra: sin torre, el aviso dice que se elige «arriba»', /arriba en «Identificación del proyecto»/.test($('#ofi-lista').innerText), $('#ofi-lista').innerText.slice(0, 100));
} else {
  localStorage.setItem(CLAVE_LISTA, '[]'); localStorage.removeItem(CLAVE_TORRES); localStorage.removeItem(CLAVE_ACTUAL);
  nuevoInforme(); await esperar(300);
  const URB = TIPO_INFORME === 'urbanismo';
  const bs = [...document.querySelectorAll('#campo-donde .donde button')].map(b => b.dataset.m);
  ok('1 · ' + TIPO_INFORME + ': tres botones, sin «Manzana»', bs.join() === 'una,varias,zona', bs.join());
  const tarjeta = $('#torre').closest('.tarjeta');
  ok('2 · El panel «Buscar los informes» va después de la tarjeta del lugar', !!panel && tarjeta.nextElementSibling === panel);
  // 3 · el informe de Gabriel del 19-oct, guardado en este teléfono
  const gb = { id: 'g1', nro: 'PRUEBA-' + (URB ? 'URB' : 'SRV') + '-EZ-ZONA-261019-GB', torre: 'ZONA', convenio: 'Convenio Bielorrusos', fecha: '2026-10-19', guardado: '2026-10-19 16:40',
    empresa: URB ? 'ADDISON' : '', residente: '', general: [{ id: (URB ? 'urb_preliminares' : 'srv_electrico'), obs: '', items: [{ nombre: URB ? 'Movimiento de tierra' : 'Ubicación de Punto de Conexión', sn: URB ? '' : 'SI', cant: URB ? '15' : '', obs: 'Demolición de carpeta' }] }],
    apartamentos: [], ubicacion: { modo: 'zona', otras: ['Simón Bolívar', 'Simón Rodríguez'], texto: 'Toda la zona Ezequiel Zamora · Simón Bolívar · Simón Rodríguez' } };
  anotarEstadoTorre(gb);
  const m = estadosDeTorres();
  ok('3a · Queda como visita anterior de las tres zonas, cada una con su zona', ['Convenio Bielorrusos', 'Convenio Chinos', 'Convenio Rusos'].every(c => m['ZONA|' + c] && m['ZONA|' + c].convenio === c) && !m['ZONA'],
     Object.keys(m).join(' · '));
  [...document.querySelectorAll('#campo-donde .donde button')].find(b => b.dataset.m === 'zona').click(); await esperar(200);
  sel('convenio', 'Convenio Chinos'); await esperar(400);
  const av = $('#aviso-historial').innerText;
  ok('3b · En toda la zona Simón Bolívar se ofrece, y dice que es el de toda la zona Ezequiel Zamora', /Toda la zona ya tiene un informe anterior/.test(av) && /Es el de toda la zona Ezequiel Zamora/.test(av), av.slice(0, 160));
  sel('convenio', 'Convenio Bielorrusos'); await esperar(400);
  const av2 = $('#aviso-historial').innerText;
  ok('3c · En Ezequiel Zamora se ofrece el suyo, sin decir que viene de otra', /ya tiene un informe anterior/.test(av2) && !/Es el de toda la zona/.test(av2), av2.slice(0, 100));
  // 4
  sel('convenio', 'Convenio Chinos'); await esperar(400);
  const si = $('#aviso-historial .si'); if (si) si.click(); await esperar(400);
  const d = datosDelFormulario();
  ok('4 · Al traerlo, la zona sigue siendo Simón Bolívar y llega lo de Gabriel marcado «visita anterior»', d.convenio === 'Convenio Chinos' && d.torre === 'ZONA' && document.querySelector('.item.heredado, .heredado'),
     d.convenio + ' · ' + d.torre);
  // 5
  if (URB) {
    nuevoInforme(); await esperar(300); sel('convenio', 'Convenio Bielorrusos'); await esperar(300); sel('torre', 'M-6'); await esperar(400);
    ok('5 · Urbanismo: una manzana sigue como siempre (número y empresa)', /^PRUEBA-URB-EZ-M6-/.test(numeroInforme()) && $('#empresa').value === 'ADDISON', numeroInforme() + ' · ' + $('#empresa').value);
  }
  // 6
  nuevoInforme(); await esperar(300); _ES_OFICINA = true; _oficinaMostrar(); await oficinaBuscar(); await esperar(200);
  ok('6 · Sin lugar elegido, el aviso del panel dice «arriba»', /, arriba, y vuelva a buscar/.test($('#ofi-lista').innerText), $('#ofi-lista').innerText.slice(0, 100));
  localStorage.setItem(CLAVE_LISTA, '[]'); localStorage.removeItem(CLAVE_TORRES);
}
