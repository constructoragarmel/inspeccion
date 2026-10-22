// TANDA 128 · v186 (22-oct-2026): «Completar lo vacío con otro apartamento» en obra. Pedido de Diego Orta por Mariana Rojas: al
// reabrir un informe ya enviado con un solo dato, el botón de copiar no salía. Ahora sale si hay un cuarto de las filas medidas o
// menos, y copia solo en las filas vacías. 1 el informe reabierto (ya enviado, una fila medida) ofrece «Completar lo vacío…» ·
// 2 el panel lo dice y lista la fuente · 3 la fila medida queda igual y sin marca; las vacías se llenan y quedan «≈ Copiado de» ·
// 4 el dato · 5 no se envía sin confirmar · 6 confirmadas, sale como revisión · 7 nada se sale a 375 px.
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.removeItem('garmel_reports_list');
await Q.relevo({ caido: false, fallar: [], lento: 0, borrar: true });
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const put = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
const fila = (pid, cod) => pid + '_' + CODIGOS_SUB[pid].indexOf(cod);
const mide = (rid, pr, ej) => { document.getElementById('pr_' + rid).value = pr; document.getElementById('ej_' + rid).value = ej; recalcRow(document.getElementById('pr_' + rid)); document.getElementById('ej_' + rid).dispatchEvent(new Event('input', { bubbles: true })); };
const completar = () => { const insp = document.querySelector('.inspector-select'); if (insp) { insp.value = [...insp.options].map(o => o.value).filter(Boolean)[0]; insp.dispatchEvent(new Event('change', { bubbles: true })); } const res = document.querySelector('#residentes-container input'); if (res && !res.value) { res.value = 'Ing. Prueba'; res.dispatchEvent(new Event('input', { bubbles: true })); } if (!document.querySelector('#estatus .ck-lbl.on')) document.querySelector('#estatus .ck-lbl').click(); const emp = document.getElementById('empresa'); if (emp && !emp.value) emp.value = [...emp.options].map(o => o.value).filter(Boolean)[0]; const be = document.getElementById('btn-enviar-relevo'); if (be) be.disabled = false; if (typeof refrescarEstadoClave === 'function') refrescarEstadoClave(); };
Q.aceptar = true;
let envios = 0; const _fetch = window.fetch; window.fetch = function(u, o){ try { const b = JSON.parse((o && o.body) || '{}'); if (b.numero && b.datos) envios++; } catch (e) {} return _fetch.apply(this, arguments); };
const R1 = fila('hito_servicios', '3.01'), R2 = fila('hito_servicios', '3.02'), R3 = fila('hito_acabados', '4.01');
// Fuente: T-01 piso 03 apto B1 con tres filas medidas.
nuevoFormulario(); await esperar(300); setAmbito('apartamento'); await esperar(200);
sel('fecha', '2026-10-20'); sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-01'); sel('piso', 'Piso 03'); put('apto', 'B1'); await esperar(1200);
{ const a = document.getElementById('aviso-anterior'); if (a) a.innerHTML = ''; }
mide(R1, '6', '4'); mide(R2, '5', '5'); mide(R3, '100', '50'); saveDraft(true); await esperar(300);
// Destino: T-02 piso 05 apto A1 con una sola fila medida (la 3.01, con otros números), guardado y dado por enviado.
nuevoFormulario(); await esperar(300); setAmbito('apartamento'); await esperar(200);
sel('fecha', '2026-10-21'); sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-02'); sel('piso', 'Piso 05'); put('apto', 'A1'); await esperar(1200);
{ const a = document.getElementById('aviso-anterior'); if (a) a.innerHTML = ''; }
mide(R1, '9', '9'); completar(); saveDraft(true); await esperar(300);
{ const l = getSavedReports(); const i = l.findIndex(b => b && /T02-P05AA1/.test(b.nro || '')); l[i].enviado = true; localStorage.setItem('garmel_reports_list', JSON.stringify(l)); }
const pos = getSavedReports().findIndex(b => b && /T02-P05AA1/.test(b.nro || ''));
nuevoFormulario(); await esperar(300); loadDraftData(pos); await esperar(1500);
const b1 = document.getElementById('btn-copiar-de');
ok('1 · Reabierto (ya enviado, una fila medida de muchas) ofrece «Completar lo vacío con otro apartamento…»', !!b1 && /Completar lo vac.o con otro apartamento/.test(b1.textContent) && b1.offsetHeight >= 44 && _abiertoParaEditar, b1 ? b1.textContent + ' alto ' + b1.offsetHeight : 'sin botón · editar ' + _abiertoParaEditar);
b1.click(); await esperar(1500);
const panel = document.querySelector('#copiar-de .copiar-panel'), items = [...document.querySelectorAll('#copiar-de .f')];
ok('2 · El panel dice que solo llena lo vacío y lista la T-01 · Piso 03 apto B1', !!panel && /Completar lo vac/.test(panel.querySelector('.t').textContent) && /Solo se llenan las filas vac/.test(panel.textContent) && items.some(x => /T-01 · Piso 03 apto B1/.test(x.textContent)), panel ? panel.querySelector('.t').textContent + ' · ' + items.map(x => x.textContent.trim().slice(0, 50)).join(' | ') : 'sin panel');
items.find(x => /T-01 · Piso 03 apto B1/.test(x.textContent)).querySelector('button').click(); await esperar(800);
const v = id => document.getElementById(id).value, marcada = rid => { const tr = _filaDe(rid); return !!tr && tr.classList.contains('copiada'); };
ok('3 · La fila que ya tenía (3.01: 9 y 9) queda igual y sin marca; las vacías (3.02 y 4.01) se llenan y quedan «≈ Copiado de»',
   v('pr_' + R1) === '9' && v('ej_' + R1) === '9' && !marcada(R1) && v('pr_' + R2) === '5' && v('ej_' + R3) === '50' && marcada(R2) && marcada(R3) && document.querySelectorAll('tr.heredada.copiada').length === 2,
   [v('pr_' + R1), v('ej_' + R1), marcada(R1), v('pr_' + R2), marcada(R2), v('ej_' + R3), marcada(R3), document.querySelectorAll('tr.heredada.copiada').length].join(' · '));
const d4 = getFormData(), arr = d4.partidas.hito_servicios, i1 = CODIGOS_SUB.hito_servicios.indexOf('3.01'), i2 = CODIGOS_SUB.hito_servicios.indexOf('3.02');
ok('4 · El dato dice de dónde se completó; la fila propia no lleva origen y la copiada sí', d4.copiadoDe && /T01-P03AB1/.test(d4.copiadoDe.nro) && !arr[i1].copiadoDe && !arr[i1].heredado && arr[i2].copiadoDe === d4.copiadoDe.nro, JSON.stringify(d4.copiadoDe) + ' · ' + JSON.stringify([arr[i1].copiadoDe || '', arr[i2].copiadoDe || '']));
ok('4b · Ya completado, el botón no vuelve a ofrecerse', !document.getElementById('btn-copiar-de'));
completar(); Q.dialogos.length = 0; const a5 = envios; await enviarAlRelevo(); await esperar(400);
ok('5 · No se envía con filas copiadas sin confirmar', Q.dialogos.some(m => /no se han confirmado/.test(m)) && envios === a5, Q.dialogos.join(' | ').slice(0, 120));
[...document.querySelectorAll('tr.heredada.copiada .sigue-igual')].forEach(b => b.click()); await esperar(200);
completar(); Q.dialogos.length = 0; const a6 = envios; await enviarAlRelevo(); await esperar(2500);
const env = (await Q.envios()).slice(-1)[0] || {};
ok('6 · Confirmadas, se envía (el número de revisión lo pone el relevo)', envios === a6 + 1 && /T02-P05AA1/.test(env.numero || ''), 'envíos ' + (envios - a6) + ' · ' + (env.numero || '') + ' · ' + Q.dialogos.join(' | ').slice(0, 100));
// Con muchos datos: nada.
nuevoFormulario(); await esperar(300); setAmbito('apartamento'); await esperar(200);
sel('fecha', '2026-10-21'); sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-02'); sel('piso', 'Piso 06'); put('apto', 'A1'); await esperar(1200);
{ const prs = [...document.querySelectorAll('input[id^="pr_"]')]; prs.slice(0, Math.ceil(prs.length / 2)).forEach(e => { e.value = '1'; e.dispatchEvent(new Event('input', { bubbles: true })); }); } await esperar(1200);
ok('6b · Con la mitad de las filas medidas no se ofrece', !document.getElementById('btn-copiar-de'));
ok('7 · Nada se sale de la pantalla y ningún control baja de 44 px', document.documentElement.scrollWidth <= innerWidth + 1 && Q.chicos().length === 0, Q.chicos().join(' '));
window.fetch = _fetch; nuevoFormulario(); await esperar(200); localStorage.removeItem('garmel_reports_list');
