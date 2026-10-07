// TANDA 71 · V140 (7-oct-2026): reenviar un informe ya enviado sin cambios avisa y ofrece no enviar. En inspeccion.html, contra el relevo falso.
// 1 un informe enviado y reabierto sin cambios: Enviar pregunta y con Cancelar no manda nada · 2 con un cambio no pregunta eso y envía · 3 un informe nuevo no pregunta
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.removeItem('garmel_reports_list');
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const put = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
const fila = (pid, cod) => pid + '_' + CODIGOS_SUB[pid].indexOf(cod);
const mide = (rid, pr, ej) => { document.getElementById('pr_' + rid).value = pr; document.getElementById('ej_' + rid).value = ej; recalcRow(document.getElementById('pr_' + rid)); document.getElementById('ej_' + rid).dispatchEvent(new Event('input', { bubbles: true })); };
const completar = () => { const insp = document.querySelector('.inspector-select'); if (insp) { insp.value = [...insp.options].map(o => o.value).filter(Boolean)[0]; insp.dispatchEvent(new Event('change', { bubbles: true })); } const res = document.querySelector('#residentes-container input'); if (res) { res.value = 'Ing. Prueba'; res.dispatchEvent(new Event('input', { bubbles: true })); } if (!document.querySelector('#estatus .ck-lbl.on')) document.querySelector('#estatus .ck-lbl').click(); const be = document.getElementById('btn-enviar-relevo'); if (be) be.disabled = false; if (typeof refrescarEstadoClave === 'function') refrescarEstadoClave(); };
let envios = 0; const _fetch = window.fetch; window.fetch = function(u, o){ try { const b = JSON.parse((o && o.body) || '{}'); if (b.numero && b.datos) envios++; } catch (e) {} return _fetch.apply(this, arguments); };
Q.aceptar = true; nuevoFormulario(); await esperar(300); setAmbito('apartamento'); await esperar(200);
sel('fecha', '2026-10-07'); sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-01'); sel('piso', 'Piso 04'); put('apto', 'C1'); await esperar(1200);
const cajaAnt = document.getElementById('aviso-anterior'); if (cajaAnt) cajaAnt.innerHTML = '';
mide(fila('hito_servicios', '3.01'), '6', '4'); completar(); saveDraft(true); await esperar(300);
Q.dialogos.length = 0; const e0 = envios; await enviarAlRelevo(); await esperar(2500);
ok('3 · Un informe nuevo se envía sin preguntar por cambios', envios === e0 + 1 && !Q.dialogos.some(m => /no cambió nada/.test(m)), 'envíos ' + (envios - e0) + ' · ' + Q.dialogos.join(' | ').slice(0, 120));
// Reabrirlo sin tocar nada y enviar
const pos = getSavedReports().findIndex(b => b && /P04AC1/.test(b.nro || ''));
nuevoFormulario(); await esperar(300); loadDraftData(pos); await esperar(800); completar();
Q.dialogos.length = 0; Q.aceptar = false; const e1 = envios; await enviarAlRelevo(); await esperar(800);
const preg = Q.dialogos.filter(m => /no cambió nada/.test(m));
ok('1 · Reabierto sin cambios, Enviar avisa «no cambió nada desde entonces» y con Cancelar no manda nada', preg.length === 1 && /revisión idéntica/.test(preg[0]) && envios === e1, 'preguntas ' + preg.length + ' · envíos ' + (envios - e1) + ' · ' + Q.dialogos.join(' | ').slice(0, 120));
// Con un cambio, envía sin esa pregunta
Q.aceptar = true; mide(fila('hito_servicios', '3.02'), '5', '2'); await esperar(2300); completar();
Q.dialogos.length = 0; const e2 = envios; await enviarAlRelevo(); await esperar(2500);
ok('2 · Con un cambio no pregunta por cambios y envía la revisión', envios === e2 + 1 && !Q.dialogos.some(m => /no cambió nada/.test(m)), 'envíos ' + (envios - e2) + ' · ' + Q.dialogos.join(' | ').slice(0, 120));
window.fetch = _fetch; nuevoFormulario(); await esperar(200); localStorage.removeItem('garmel_reports_list');
