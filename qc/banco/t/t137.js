// TANDA 137 · cambio 197 (27-oct-2026): el apartamento por capítulos, como un presupuesto. Pedido de Génesis Márquez por Diego Orta.
// En inspeccion.html?prueba=1, a 375 px. 1 el orden: tabiquería, capítulo sanitarias, capítulo eléctricas, capítulo gas, hito 3, y
// el resto · 2 sanitarias trae sus cuatro filas del hito 3 y el hito 7 adentro · 3 eléctricas trae las suyas y el hito 8 con voz y
// data · 4 gas trae las dos de gas · 5 el hito 3 queda con su nota, sin filas visibles ni rótulos vacíos · 6 medir una fila de
// sanitarias mueve el % del hito 3 y viaja en el dato del hito 3 · 7 el capítulo se pliega y se despliega · 8 en torre no hay
// capítulos y las filas vuelven al hito 3; al volver a apartamento se rearman · 9 un borrador guardado reabre con sus valores en
// las filas del capítulo · 10 nada se sale y las filas siguen numeradas.
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem('garmel_reports_list', '[]');
await Q.relevo({ caido: false, fallar: [], lento: 0, borrar: true });
Q.aceptar = true;
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const put = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
const rid = cod => { for (const h of PARTIDAS) { const i = (CODIGOS_SUB[h.id] || []).indexOf(cod); if (i >= 0) return h.id + '_' + i; } };
const dentro = (cod, cap) => { const e = document.getElementById('pr_' + rid(cod)) || document.getElementById('ej_' + rid(cod)); return !!e && !!e.closest('#p_' + cap); };
nuevoFormulario(); await esperar(300); setAmbito('apartamento'); await esperar(300);
sel('fecha', '2026-10-27'); sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-07'); sel('piso', 'Piso 03'); put('apto', 'B2'); await esperar(1200);
{ const a = document.getElementById('aviso-anterior'); if (a) a.innerHTML = ''; }
const main = $('#main-content');
const orden = [...main.children].filter(x => x.style.display !== 'none' && /^p_/.test(x.id)).map(x => x.id.replace(/^p_/, ''));
ok('1 · Orden: tabiquería, sanitarias, eléctricas, gas, hito 3 y el resto', orden.slice(0, 5).join(',') === 'hito_cerramientos,cap_sanitarias,cap_electricas,cap_gas,hito_servicios' && orden.indexOf('hito_puertas') > 4, orden.join(','));
ok('2 · Sanitarias: sus cuatro filas del hito 3 y el hito 7 adentro', ['3.01', '3.02', '3.20', '3.21'].every(c => dentro(c, 'cap_sanitarias')) && !!$('#p_cap_sanitarias #p_hito_acc_sanitarios'), ['3.01', '3.02', '3.20', '3.21'].map(c => c + ':' + dentro(c, 'cap_sanitarias')).join(' '));
ok('3 · Eléctricas: las suyas y el hito 8 con voz y data', ['3.04', '3.07', '3.08', '3.03'].every(c => dentro(c, 'cap_electricas')) && !!$('#p_cap_electricas #p_hito_acc_electricos') && dentro('8.05', 'cap_electricas'), ['3.04', '3.03', '8.05'].map(c => c + ':' + dentro(c, 'cap_electricas')).join(' '));
ok('4 · Gas: las dos de gas', ['3.16', '3.17'].every(c => dentro(c, 'cap_gas')));
const visiblesH3 = [...$$('#tbody_hito_servicios tr')].filter(tr => tr.style.display !== 'none');
ok('5 · El hito 3 queda con su nota, sin rótulos vacíos', !!$('#p_hito_servicios #cap-nota-h3') && !$$('#tbody_hito_servicios tr.subgrupo').length, visiblesH3.length + ' filas visibles');
const r1 = rid('3.01'); document.getElementById('pr_' + r1).value = '4'; document.getElementById('ej_' + r1).value = '4'; recalcRow(document.getElementById('pr_' + r1)); document.getElementById('ej_' + r1).dispatchEvent(new Event('input', { bubbles: true })); await esperar(200);
const d6 = getFormData(), i1 = CODIGOS_SUB.hito_servicios.indexOf('3.01');
ok('6 · Medir en sanitarias mueve el % del hito 3 y viaja en el hito 3', $('#badge_hito_servicios').textContent !== '0%' && String(d6.partidas.hito_servicios[i1].ej) === '4', $('#badge_hito_servicios').textContent + ' · ' + JSON.stringify(d6.partidas.hito_servicios[i1]).slice(0, 60));
const c7 = $('#p_cap_sanitarias'), antes7 = c7.classList.contains('collapsed'); c7.querySelector('.p-hdr').click(); const des7 = c7.classList.contains('collapsed'); c7.querySelector('.p-hdr').click();
ok('7 · El capítulo se pliega y se despliega', antes7 !== des7 && c7.classList.contains('collapsed') === antes7);
setAmbito('torre'); await esperar(300);
const enTorre = !$$('.capitulo').length && !!document.getElementById('pr_' + r1) && !!document.getElementById('pr_' + r1).closest('#p_hito_servicios');
setAmbito('apartamento'); await esperar(300);
ok('8 · En torre no hay capítulos y las filas vuelven al hito 3; en apartamento se rearman', enTorre && $$('.capitulo').length === 3 && dentro('3.01', 'cap_sanitarias'), 'torre ' + enTorre + ' · capítulos ' + $$('.capitulo').length);
// 9 · borrador
put('apto', 'B2'); await esperar(300);
document.getElementById('pr_' + r1).value = '6'; document.getElementById('ej_' + r1).value = '5'; recalcRow(document.getElementById('pr_' + r1));
const insp = document.querySelector('.inspector-select'); insp.value = [...insp.options].map(o => o.value).filter(Boolean)[0]; insp.dispatchEvent(new Event('change', { bubbles: true }));
saveDraft(true); await esperar(300); const pos = 0;
nuevoFormulario(); await esperar(300); loadDraftData(pos); await esperar(1200);
ok('9 · El borrador reabre con sus valores en la fila del capítulo', document.getElementById('ej_' + r1).value === '5' && dentro('3.01', 'cap_sanitarias'), document.getElementById('ej_' + r1).value + ' · ' + dentro('3.01', 'cap_sanitarias'));
$$('.capitulo').forEach(c => c.classList.remove('collapsed'));
const nums = [...$$('#capt_cap_sanitarias td.n')].map(t => t.textContent).join(',');
ok('10 · Nada se sale y las filas del capítulo van numeradas', document.documentElement.scrollWidth <= innerWidth + 1 && nums === '1,2,3,4', document.documentElement.scrollWidth + ' · ' + nums);
nuevoFormulario(); localStorage.setItem('garmel_reports_list', '[]');
