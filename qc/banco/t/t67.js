// TANDA 67 · V135 (6-oct-2026): el orden en pantalla del apartamento sigue la secuencia de obra (PA-121). En inspeccion.html.
// 1 en apartamento los bloques visibles van en la secuencia de obra · 2 en «Instalación de servicios» las filas se agrupan por disciplina con rótulo
// 3 los accesorios eléctricos separan Voz y data · 4 la numeración sigue lo que se ve · 5 el dato no cambia: lo marcado en 3.20 se guarda en su índice
// 6 en torre vuelve el orden de la lista y no hay rótulos · 7 al abrir un borrador de apartamento el orden se mantiene
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc');
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const put = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
// v188 (cambio 197): en apartamento los capítulos traen dentro los hitos 7 y 8; se cuentan en el orden en que se ven.
const visibles = () => [...document.querySelectorAll('#main-content .partida')].filter(b => b.style.display !== 'none').map(b => b.id.slice(2));
const filasDe = pid => [...document.querySelectorAll((/^cap_/.test(pid) ? '#capt_' : '#tbody_') + pid + ' > tr')].filter(tr => tr.style.display !== 'none').map(tr => tr.classList.contains('subgrupo') ? '[' + tr.textContent.trim() + ']' : (CODIGOS_SUB[/^cap_/.test(pid) ? 'hito_servicios' : pid] || [])[+tr.querySelector('[id^="pr_"]').id.split('_').pop()]);
const numeros = pid => [...document.querySelectorAll((/^cap_/.test(pid) ? '#capt_' : '#tbody_') + pid + ' > tr:not(.subgrupo)')].filter(tr => tr.style.display !== 'none').map(tr => tr.querySelector('td.n').textContent);
Q.aceptar = true; nuevoFormulario(); await esperar(300); setAmbito('apartamento'); await esperar(300);
sel('fecha', '2026-10-06'); sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-01'); sel('piso', 'Piso 02'); put('apto', 'A1'); await esperar(300);
ok('1 · En apartamento: tabiquería, los capítulos (con sus accesorios dentro), el hito 3 y el resto en la secuencia de obra', visibles().join(',') === 'hito_cerramientos,cap_sanitarias,hito_acc_sanitarios,cap_electricas,hito_acc_electricos,cap_gas,hito_servicios,hito_puertas,hito_ventanas,hito_acabados,hito_pruebas', visibles().join(','));
const f3 = ['cap_sanitarias', 'cap_electricas', 'cap_gas'].map(c => filasDe(c).join(' ')).join(' | ');
ok('2 · Las filas del hito 3 por capítulo: Sanitarias (aguas blancas, desagüe, CP, TR), Eléctricas, Gas', f3 === '3.01 3.02 3.20 3.21 | 3.04 3.07 3.08 3.03 | 3.16 3.17', f3);
const f8 = filasDe('hito_acc_electricos');
ok('3 · Los accesorios eléctricos separan Voz y data al final', f8.join(' ') === '[Eléctricos] 8.01 8.02 8.03 8.06 8.07 8.09 [Voz y data] 8.05 8.04', f8.join(' '));
ok('4 · La numeración sigue lo que se ve: 1 a 4 en sanitarias, 1 a 4 en eléctricas, 1 a 2 en gas, 1 a 8 en accesorios eléctricos', numeros('cap_sanitarias').join(',') === '1,2,3,4' && numeros('cap_electricas').join(',') === '1,2,3,4' && numeros('cap_gas').join(',') === '1,2' && numeros('hito_acc_electricos').join(',') === '1,2,3,4,5,6,7,8', numeros('cap_sanitarias').join(',') + ' · ' + numeros('hito_acc_electricos').join(','));
const iCP = CODIGOS_SUB.hito_servicios.indexOf('3.20');
document.getElementById('ej_hito_servicios_' + iCP).value = '2'; document.getElementById('pr_hito_servicios_' + iCP).value = '4'; recalcRow(document.getElementById('pr_hito_servicios_' + iCP));
let bd = document.getElementById('ej_hito_servicios_' + iCP); bd.dispatchEvent(new Event('input', { bubbles: true }));
const d5 = getFormData();
ok('5 · El dato no cambia de sitio: lo marcado en el centro de piso queda en el índice de 3.20 (' + iCP + ')', iCP === 19 && d5.partidas.hito_servicios[iCP] && d5.partidas.hito_servicios[iCP].ej === '2' && d5.partidas.hito_servicios.length === 21, JSON.stringify(d5.partidas.hito_servicios[iCP]));
saveDraft(true); await esperar(200);
setAmbito('torre'); await esperar(300);
const vT = visibles(), f3T = filasDe('hito_servicios');
ok('6 · En torre vuelve el orden de la lista y no hay rótulos de disciplina', vT[0] === 'hito_estructura' && vT.indexOf('hito_acabados') < vT.indexOf('hito_puertas') && !f3T.some(x => /^\[/.test(x)) && document.querySelectorAll('#main-content tr.subgrupo').length === 0, vT.join(',') + ' · ' + f3T.join(' '));
setAmbito('apartamento'); await esperar(200); loadDraftData(0); await esperar(600);
ok('7 · Al abrir el borrador de apartamento vuelven los capítulos, con el dato en su fila', visibles()[1] === 'cap_sanitarias' && filasDe('cap_sanitarias')[2] === '3.20' && document.getElementById('ej_hito_servicios_' + iCP).value === '2', visibles().slice(0, 3).join(',') + ' · ' + filasDe('cap_sanitarias').join(' '));
Q.aceptar = true; nuevoFormulario(); await esperar(200); localStorage.removeItem('garmel_reports_list');
