// TANDA 81 · V157 (13-oct-2026): lo que vio la coordinación de Ezequiel Zamora al salir a WhatsApp y volver: «copias» del
// apartamento ya hecho, y «A-2» que no casa con «A2». Dos fases: antes y después de recargar la página (como el teléfono).
localStorage.setItem('garmel_rol', 'inspector'); Q.aceptar = true;
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const medir = (codigo, pr, ej) => { const rid = 'hito_servicios_' + CODIGOS_SUB.hito_servicios.indexOf(codigo); document.getElementById('pr_' + rid).value = pr; document.getElementById('ej_' + rid).value = ej; recalcRow(document.getElementById('pr_' + rid)); };
const guardar = async () => { clearTimeout(_tempAutoguardado); autoguardar(); await esperar(150); };
if (!sessionStorage.getItem('t81')) {
  localStorage.removeItem('garmel_reports_list'); localStorage.removeItem('garmel_actual');
  nuevoFormulario(); await esperar(300); setAmbito('apartamento'); sel('fecha', '2026-10-13'); sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-16'); sel('piso', 'Piso 01');
  const ap = document.getElementById('apto'); ap.value = 'a-2'; ap.dispatchEvent(new Event('input', { bubbles: true })); ap.dispatchEvent(new Event('change', { bubbles: true })); await esperar(100);
  ok('1 · «a-2» queda «A2» en el campo y en el número del informe', ap.value === 'A2' && /P01AA2/.test(document.getElementById('nro-display').textContent), ap.value + ' · ' + document.getElementById('nro-display').textContent);
  medir('3.01', 6, 4); await guardar();
  ok('2 · Con algo medido hay un borrador, y es el actual', getSavedReports().length === 1 && localStorage.getItem('garmel_actual') === getSavedReports()[0].id, getSavedReports().length + '');
  // Sale a WhatsApp y vuelve sin que el teléfono descargue la pestaña.
  Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new Event('visibilitychange'));
  Object.defineProperty(document, 'hidden', { value: false, configurable: true }); document.dispatchEvent(new Event('visibilitychange'));
  medir('3.02', 10, 5); await guardar();
  ok('3 · Salir y volver sin recargar: sigue siendo un borrador', getSavedReports().length === 1, getSavedReports().length + '');
  sessionStorage.setItem('t81', JSON.stringify(Q.R)); sessionStorage.setItem('t81fase', '1');
  setTimeout(function(){ location.reload(); }, 200);
  throw 'recargando: vuelva a correr t81';
}
JSON.parse(sessionStorage.getItem('t81') || '[]').forEach(r => Q.R.push(r)); sessionStorage.removeItem('t81'); sessionStorage.removeItem('t81fase');
await esperar(2500);   // la recuperación corre 400 ms después de cargar
ok('4 · El teléfono descargó la pestaña: al volver, el informe se recupera y sigue siendo uno', getSavedReports().length === 1 && document.getElementById('apto').value === 'A2' && document.getElementById('torre').value === 'T-16', getSavedReports().length + ' · ' + document.getElementById('apto').value);
medir('3.03', 100, 50); await guardar();
ok('5 · Seguir llenando después de la recarga guarda en el mismo borrador', getSavedReports().length === 1, getSavedReports().length + '');
// El formulario pierde el hilo del borrador (como si fuera una ficha nueva) y guarda el mismo contenido: no se duplica.
currentEditingIndex = null; _idEnEdicion = null; await guardar();
ok('6 · Perder el hilo y guardar el mismo informe no crea una copia', getSavedReports().length === 1, getSavedReports().length + '');
// Cambiar de apartamento sí es otra ficha.
sel('apto', 'B1'); await esperar(100); medir('3.01', 6, 2); await guardar();
ok('7 · Cambiar de apartamento sí crea su propia ficha (2)', getSavedReports().length === 2 && getSavedReports().some(b => /P01AB1/.test(b.nro)), getSavedReports().map(b => b.nro).join(' | '));
nuevoFormulario(); localStorage.removeItem('garmel_reports_list'); localStorage.removeItem('garmel_actual');
