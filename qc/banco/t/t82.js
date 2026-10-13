// TANDA 82 · V158 (13-oct-2026): el apartamento como desplegable en Ezequiel Zamora (A1, A2, B1, B2) y campo libre donde no
// hay nomenclatura. En inspeccion.html.
localStorage.setItem('garmel_rol', 'inspector'); Q.aceptar = true; localStorage.removeItem('garmel_reports_list'); localStorage.removeItem('garmel_actual');
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const vis = id => { const e = document.getElementById(id); return !!e && e.style.display !== 'none' && !e.closest('[hidden]'); };
nuevoFormulario(); await esperar(300); setAmbito('apartamento'); sel('fecha', '2026-10-13');
ok('1 · Sin torre, el apartamento es un campo libre', vis('apto') && !vis('apto-sel'));
sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-16'); sel('piso', 'Piso 02'); await esperar(100);
ok('2 · En Ezequiel Zamora aparece el desplegable con A1, A2, B1 y B2, y el campo se esconde', vis('apto-sel') && !vis('apto') && [...document.getElementById('apto-sel').options].slice(1).map(o => o.value).join(',') === 'A1,A2,B1,B2', [...document.getElementById('apto-sel').options].map(o => o.value).join(','));
sel('apto-sel', 'B2'); await esperar(100);
ok('3 · Elegir B2 escribe el apartamento y el número del informe', document.getElementById('apto').value === 'B2' && /P02AB2/.test(document.getElementById('nro-display').textContent), document.getElementById('nro-display').textContent);
const rid = 'hito_servicios_' + CODIGOS_SUB.hito_servicios.indexOf('3.01'); document.getElementById('pr_' + rid).value = '6'; document.getElementById('ej_' + rid).value = '4'; recalcRow(document.getElementById('pr_' + rid));
clearTimeout(_tempAutoguardado); autoguardar(); await esperar(150);
ok('4 · Se guarda con el apartamento elegido', getSavedReports().length === 1 && getSavedReports()[0].apto === 'B2', JSON.stringify(getSavedReports().map(b => b.apto)));
siguienteApartamento(); await esperar(200);
ok('5 · «Guardar y otro apto» deja el desplegable vacío y listo', vis('apto-sel') && document.getElementById('apto-sel').value === '' && document.getElementById('apto').value === '');
sel('convenio', 'Convenio Chinos'); sel('torre', 'J-07'); await esperar(100);
ok('6 · En una torre sin nomenclatura (J-07) vuelve el campo libre', vis('apto') && !vis('apto-sel'));
sel('torre', 'J-12'); await esperar(100);
ok('6b · En la J-12 la lista es la de su par de torres: E21, E22, D21, D22, B1, B2, F1, F2', vis('apto-sel') && [...document.getElementById('apto-sel').options].slice(1).map(o => o.value).join(',') === 'E21,E22,D21,D22,B1,B2,F1,F2', [...document.getElementById('apto-sel').options].map(o => o.value).join(','));
sel('torre', 'J-09'); await esperar(100);
ok('6c · En la J-09, la de la J-09 y la J-10', [...document.getElementById('apto-sel').options].slice(1).map(o => o.value).join(',') === 'E11,E12,D11,D12,A1,A2,C1,C2');
sel('torre', 'J-07'); await esperar(100);
// Un borrador de Ezequiel Zamora con un apartamento fuera de la lista no se pierde: se abre con el campo libre.
const lista = getSavedReports(); lista[0].apto = 'C7'; localStorage.setItem('garmel_reports_list', JSON.stringify(lista)); loadDraftData(0); await esperar(200);
ok('7 · Un borrador con un apartamento fuera de la lista se abre con el campo libre y lo conserva', vis('apto') && !vis('apto-sel') && document.getElementById('apto').value === 'C7', document.getElementById('apto').value);
ok('8 · El desplegable mide al menos 44 px cuando se ve', (sel('convenio', 'Convenio Bielorrusos'), sel('torre', 'T-01'), document.getElementById('apto').value = '', _aplicarListaApto(), document.getElementById('apto-sel').getBoundingClientRect().height >= 44), document.getElementById('apto-sel').getBoundingClientRect().height + '');
nuevoFormulario(); localStorage.removeItem('garmel_reports_list'); localStorage.removeItem('garmel_actual');
