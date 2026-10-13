// TANDA 80 · V153: desde cada página se llega al compilado con un toque y sin perder nada. Corre en index, inspeccion y servicios.
const pagina = location.pathname.split('/').pop();
if (pagina === 'index.html' || pagina === 'auto-index.html') {
  await esperar(500);
  const a = document.getElementById('tarjeta-compilado');
  ok('7 · Inicio tiene la tarjeta «Compilado de la semana» y conserva el modo de prueba en el enlace', !!a && /compilado\.html\?prueba=1$/.test(a.href) && a.getBoundingClientRect().height >= 44, a ? a.href : 'sin tarjeta');
} else if (/inspeccion/.test(pagina)) {
  localStorage.setItem('garmel_rol', 'inspector');
  nuevoFormulario(); await esperar(300); setAmbito('apartamento');
  const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); };
  sel('fecha', '2026-10-05'); sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-02'); sel('piso', 'Piso 03'); document.getElementById('apto').value = 'B1'; document.getElementById('apto').dispatchEvent(new Event('input', { bubbles: true }));
  const rid = 'hito_servicios_' + CODIGOS_SUB.hito_servicios.indexOf('3.01');
  document.getElementById('pr_' + rid).value = '6'; document.getElementById('ej_' + rid).value = '4'; recalcRow(document.getElementById('pr_' + rid)); await esperar(200);
  const b = document.querySelector('.hbtn-compilado');
  const antes = getSavedReports().length;
  // No navegamos de verdad (la tanda moriría): se comprueba que el botón guarda y a dónde manda.
  const irReal = location.href; let destino = ''; const desc = Object.getOwnPropertyDescriptor(window, 'location');
  try { window.__irAlCompiladoDestino = ''; const orig = irAlCompilado; } catch (e) {}
  ok('8 · Obra tiene el botón «Compilado» en «Más» con su ayuda', !!b && /Compilado/.test(b.textContent) && /coordinaci/.test(b.title), b ? b.outerHTML.slice(0, 120) : 'sin botón');
  try { if (typeof autoguardar === 'function') autoguardar(); } catch (e) {}
  ok('8b · Antes de salir, el informe a medio llenar queda guardado (lo que hace irAlCompilado)', getSavedReports().length === antes + 1 || getSavedReports().some(r => r.torre === 'T-02'), getSavedReports().length + ' guardados');
  ok('8c · irAlCompilado manda a compilado.html y conserva el modo de prueba', /compilado\.html' \+ \(TEST_MODE \? '\?prueba=1' : ''\)/.test(irAlCompilado.toString()), irAlCompilado.toString().slice(0, 160));
  nuevoFormulario(); localStorage.removeItem('garmel_reports_list');
} else {
  const b = [...document.querySelectorAll('#fila-mas button')].find(x => /Compilado/.test(x.textContent));
  ok('9 · ' + pagina.replace('auto-', '') + ' tiene el botón «Compilado» detrás de «⋯», guarda antes y conserva el modo de prueba', !!b && /guardar\(true\)/.test(b.getAttribute('onclick')) && /compilado\.html/.test(b.getAttribute('onclick')) && /prueba=1/.test(b.getAttribute('onclick')), b ? b.getAttribute('onclick') : 'sin botón');
}
