// TANDA 76 · V144 (7-oct-2026): un informe en blanco no se guarda en obra. Lo vio la coordinación desde la laptop: solo
// cambiando de torre quedó un borrador en blanco por torre, uno cada 2-3 s. En inspeccion.html, sin ventana sirve.
localStorage.setItem('garmel_rol', 'inspector'); localStorage.removeItem('garmel_reports_list'); Q.aceptar = true;
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const put = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
nuevoFormulario(); await esperar(300); setAmbito('apartamento'); sel('fecha', '2026-10-05'); sel('convenio', 'Convenio Bielorrusos');
for (const t of ['T-01', 'T-02', 'T-03', 'T-04']) { sel('torre', t); clearTimeout(_tempAutoguardado); autoguardar(); await esperar(100); }
ok('1 · Cambiar de torre cuatro veces con el autoguardado no deja ningún borrador', getSavedReports().length === 0, getSavedReports().map(b => b.nro).join(' | '));
Q.dialogos.length = 0; const r2 = saveDraft(false);
ok('2 · «Guardar» a mano con el informe en blanco avisa y no guarda', r2 === false && getSavedReports().length === 0, String(r2));
sel('piso', 'Piso 02'); put('apto', 'A1'); await esperar(300);
const rid = 'hito_servicios_' + CODIGOS_SUB.hito_servicios.indexOf('3.01');
document.getElementById('pr_' + rid).value = '6'; document.getElementById('ej_' + rid).value = '4'; recalcRow(document.getElementById('pr_' + rid));
clearTimeout(_tempAutoguardado); autoguardar(); await esperar(100);
ok('3 · Con algo medido sí se guarda (un borrador)', getSavedReports().length === 1 && getSavedReports()[0].torre === 'T-04', getSavedReports().length + '');
// Un borrador que ya existía con contenido y hoy se vació se conserva (no se pierde al vaciar una casilla).
document.getElementById('pr_' + rid).value = ''; document.getElementById('ej_' + rid).value = ''; recalcRow(document.getElementById('pr_' + rid));
clearTimeout(_tempAutoguardado); autoguardar(); await esperar(100);
ok('4 · Si el borrador ya existía y se vació, se conserva (sigue 1)', getSavedReports().length === 1, getSavedReports().length + '');
// Los que ya quedaron: «Quitar los borradores en blanco».
const lista = getSavedReports(); const b = Object.assign({}, lista[0]); ['T-02', 'T-03'].forEach((t, i) => { lista.push(Object.assign({}, b, { id: 'blanco' + i, nro: 'PRUEBA-EZ-' + t.replace('-', '') + '-P--A---261005-CC', torre: t, partidas: {} })); });
localStorage.setItem('garmel_reports_list', JSON.stringify(lista)); renderSavedList(); await esperar(100);
const bq = document.getElementById('btn-quitar-blancos');
ok('5 · «Informes» ofrece quitar los borradores en blanco y dice cuántos (3)', !!bq && bq.style.display !== 'none' && /3 borrador/.test(bq.textContent), bq ? bq.textContent : 'sin botón');
quitarBorradoresEnBlanco(); await esperar(100);
ok('6 · Quitarlos deja la lista vacía y el botón se esconde', getSavedReports().length === 0 && document.getElementById('btn-quitar-blancos').style.display === 'none', getSavedReports().length + '');
nuevoFormulario(); await esperar(100); localStorage.removeItem('garmel_reports_list');
