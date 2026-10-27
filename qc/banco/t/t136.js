// TANDA 136 · cambio 196 (27-oct-2026): lo que ya llegó al 100 % queda cerrado en la visita siguiente. Pedido de los inspectores por
// Diego Orta. En inspeccion.html?prueba=1, a 375 px. Un informe anterior del mismo apartamento (guardado en el teléfono) con la 3.01
// completa (6 de 6), la 3.02 a medias (3 de 5) y la 4.01 en estado 100 %. 1 al elegir el apartamento, la 3.01 y la 4.01 se traen
// solas y quedan cerradas; la 3.02 no · 2 la tarjeta dice cuántas quedaron cerradas · 3 lo cerrado no se puede escribir · 4 «Traer
// mediciones» sigue ofreciéndose y trae la 3.02 sin pisar lo cerrado · 5 el dato lleva `cerrado100` con el número de origen en las
// dos cerradas y en la otra no · 6 «🔓 Habilitar» abre la fila y le quita la marca · 7 cambiar de apartamento vacía lo cerrado ·
// 8 se envía sin pedir confirmar lo cerrado · 9 el botón mide 44 px y nada se sale.
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem('garmel_reports_list', '[]');
await Q.relevo({ caido: false, fallar: [], lento: 0, borrar: true });
Q.aceptar = true;
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const put = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
const fila = (pid, cod) => pid + '_' + CODIGOS_SUB[pid].indexOf(cod);
const mide = (rid, pr, ej) => { document.getElementById('pr_' + rid).value = pr; document.getElementById('ej_' + rid).value = ej; recalcRow(document.getElementById('pr_' + rid)); document.getElementById('ej_' + rid).dispatchEvent(new Event('input', { bubbles: true })); };
const R1 = fila('hito_servicios', '3.01'), R2 = fila('hito_servicios', '3.02');
let R3 = null; for (const h of PARTIDAS) { const i = (CODIGOS_SUB[h.id] || []).indexOf('4.01'); if (i >= 0) R3 = h.id + '_' + i; }
const completar = () => { const insp = document.querySelector('.inspector-select'); insp.value = [...insp.options].map(o => o.value).filter(Boolean)[0]; insp.dispatchEvent(new Event('change', { bubbles: true })); if (!document.querySelector('#estatus .ck-lbl.on')) document.querySelector('#estatus .ck-lbl').click(); };
const lugar = async (apto) => { nuevoFormulario(); await esperar(300); setAmbito('apartamento'); await esperar(200); sel('fecha', '2026-10-27'); sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-07'); sel('piso', 'Piso 03'); put('apto', apto); };
// El anterior: hecho en pantalla y guardado
await lugar('B2'); await esperar(1200); { const a = document.getElementById('aviso-anterior'); if (a) a.innerHTML = ''; }
completar(); mide(R1, '6', '6'); mide(R2, '5', '3'); document.querySelector(`.est-btn[data-rid="${R3}"][data-v="100"]`).click();
saveDraft(true); await esperar(300);
const ANT = getSavedReports()[0].nro;
// La visita siguiente
await lugar('B2'); await hasta(() => document.querySelector('#aviso-anterior .si'), 5000, 100); await esperar(200);
const tr = rid => document.getElementById('pr_' + rid).closest('tr');
ok('1 · La 3.01 y la 4.01 se traen solas y quedan cerradas; la 3.02 no', tr(R1).classList.contains('cerrado100') && tr(R3).classList.contains('cerrado100') && !tr(R2).classList.contains('cerrado100') &&
   document.getElementById('ej_' + R1).value === '6' && document.getElementById('pr_' + R2).value === '', [tr(R1).className, tr(R2).className, document.getElementById('ej_' + R1).value].join(' · '));
ok('2 · La tarjeta dice cuántas quedaron cerradas', /2 partidas que ya estaban al 100 % quedan cerradas/.test($('#aviso-anterior').innerText), $('#aviso-anterior').innerText.slice(0, 120));
ok('3 · Lo cerrado no se puede escribir', document.getElementById('pr_' + R1).disabled && document.getElementById('ej_' + R1).disabled && [...tr(R3).querySelectorAll('.est-btn')].every(b => b.disabled));
$('#aviso-anterior .si').click(); await esperar(400);
ok('4 · «Traer mediciones» trae la 3.02 y no pisa lo cerrado', document.getElementById('pr_' + R2).value === '5' && document.getElementById('ej_' + R2).value === '3' && document.getElementById('ej_' + R1).value === '6' && tr(R1).classList.contains('cerrado100'),
   [document.getElementById('pr_' + R2).value, document.getElementById('ej_' + R2).value].join('/'));
const d5 = getFormData(), a5 = d5.partidas.hito_servicios, i1 = CODIGOS_SUB.hito_servicios.indexOf('3.01'), i2 = CODIGOS_SUB.hito_servicios.indexOf('3.02');
const p3 = R3.slice(0, R3.lastIndexOf('_')), i3 = +R3.slice(R3.lastIndexOf('_') + 1);
ok('5 · El dato lleva «cerrado100» con el número de origen en las cerradas, y en la otra no', a5[i1].cerrado100 === ANT && d5.partidas[p3][i3].cerrado100 === ANT && !a5[i2].cerrado100, JSON.stringify([a5[i1].cerrado100, a5[i2].cerrado100]));
if (getComputedStyle(tr(R1).closest('.p-body')).display === 'none') toggleP('hito_servicios'); await esperar(200);
const b6 = tr(R1).querySelector('.abrir100');
ok('9 · El botón «Habilitar» mide 44 px y nada se sale', b6.offsetHeight >= 44 && document.documentElement.scrollWidth <= innerWidth + 1, b6.offsetHeight + ' · ' + document.documentElement.scrollWidth);
b6.click();
ok('6 · «🔓 Habilitar» abre la fila y le quita la marca', !tr(R1).classList.contains('cerrado100') && !document.getElementById('ej_' + R1).disabled && !getFormData().partidas.hito_servicios[i1].cerrado100);
// 8 · se envía sin pedir confirmar lo cerrado
completar(); const be = document.getElementById('btn-enviar-relevo'); if (be) be.disabled = false; if (typeof refrescarEstadoClave === 'function') refrescarEstadoClave();
Q.dialogos.length = 0; const n0 = (await Q.envios()).length; await enviarAlRelevo(); await esperar(2000);
const env = (await Q.envios()).slice(-1)[0] || {};
ok('8 · Se envía sin pedir confirmar lo cerrado, y la 4.01 viaja cerrada', (await Q.envios()).length === n0 + 1 && ((env.datos || {}).partidas || {})[p3][i3].cerrado100 === ANT && !Q.dialogos.some(m => /confirm/i.test(m)), Q.dialogos.join(' | ').slice(0, 100));
// 7 · cambiar de apartamento
await lugar('B2'); await hasta(() => document.querySelector('#aviso-anterior .si'), 5000, 100); await esperar(200);
put('apto', 'A1'); await esperar(300);
ok('7 · Cambiar de apartamento vacía lo cerrado', !document.querySelector('tr.cerrado100') && document.getElementById('ej_' + R1).value === '' && !document.getElementById('ej_' + R1).disabled, document.getElementById('ej_' + R1).value);
nuevoFormulario(); localStorage.setItem('garmel_reports_list', '[]');
