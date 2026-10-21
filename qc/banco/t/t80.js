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
  const b = document.querySelector('.hdr-comp');   // v184: arriba, al lado de «Inicio», en los cuatro
  const antes = getSavedReports().length;
  // No navegamos de verdad (la tanda moriría): se comprueba que el botón guarda y a dónde manda.
  const irReal = location.href; let destino = ''; const desc = Object.getOwnPropertyDescriptor(window, 'location');
  try { window.__irAlCompiladoDestino = ''; const orig = irAlCompilado; } catch (e) {}
  ok('8 · Obra tiene el botón «Compilado» arriba, a la vista, con su ayuda y 44 px', !!b && /Compilado/.test(b.textContent) && /semana/.test(b.title) && b.getBoundingClientRect().height >= 44 && !b.closest('#hdr-sec'), b ? b.outerHTML.slice(0, 120) : 'sin botón');
  try { if (typeof autoguardar === 'function') autoguardar(); } catch (e) {}
  ok('8b · Antes de salir, el informe a medio llenar queda guardado (lo que hace irAlCompilado)', getSavedReports().length === antes + 1 || getSavedReports().some(r => r.torre === 'T-02'), getSavedReports().length + ' guardados');
  ok('8c · irAlCompilado manda a compilado.html y conserva el modo de prueba', /compilado\.html' \+ \(TEST_MODE \? '\?prueba=1' : ''\)/.test(irAlCompilado.toString()), irAlCompilado.toString().slice(0, 160));
  nuevoFormulario(); localStorage.removeItem('garmel_reports_list');
} else {
  const b = document.querySelector('header .hdr-boton.compilado');
  ok('9 · ' + pagina.replace('auto-', '') + ' tiene el botón «Compilado» arriba (v184), guarda antes, abre en su tipo y conserva el modo de prueba', !!b && b.getBoundingClientRect().height >= 44 && /irAlCompiladoDe/.test(b.getAttribute('onclick')) && /guardar\(false\)/.test(irAlCompiladoDe.toString()) && /compilado\.html\?de=/.test(irAlCompiladoDe.toString()) && /prueba=1/.test(irAlCompiladoDe.toString()), b ? b.getAttribute('onclick') : 'sin botón');
}
