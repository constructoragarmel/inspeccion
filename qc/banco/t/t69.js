// TANDA 69 · V139 (7-oct-2026): copiar las mediciones de otro apartamento o de otra torre parecida. En inspeccion.html, contra el relevo falso.
// 1 con torre, piso y apto y sin medir aparece el botón · 2 el panel lista el apartamento guardado en este teléfono · 3 copiar llena las filas y las marca «≈ Copiado de»
// 4 el dato lleva copiadoDe y cada fila copiada también · 5 no se puede enviar con filas sin confirmar · 6 guardar y reabrir conserva las marcas
// 7 «Confirmado en sitio» quita la marca · 8 con todas confirmadas sí envía · 9 en torre, el panel ofrece la torre de la misma contratista · 11 las demás torres del sector solo al pedirlas · 10 un informe con mediciones no ofrece copiar
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.removeItem('garmel_reports_list');
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const put = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
const fila = (pid, cod) => pid + '_' + CODIGOS_SUB[pid].indexOf(cod);
const mide = (rid, pr, ej) => { document.getElementById('pr_' + rid).value = pr; document.getElementById('ej_' + rid).value = ej; recalcRow(document.getElementById('pr_' + rid)); document.getElementById('ej_' + rid).dispatchEvent(new Event('input', { bubbles: true })); };
Q.aceptar = true; const alertasDesde = () => Q.dialogos.slice();
const completar = () => { const insp = document.querySelector('.inspector-select'); if (insp) { insp.value = [...insp.options].map(o => o.value).filter(Boolean)[0]; insp.dispatchEvent(new Event('change', { bubbles: true })); } const res = document.querySelector('#residentes-container input'); if (res) { res.value = 'Ing. Prueba'; res.dispatchEvent(new Event('input', { bubbles: true })); } if (!document.querySelector('#estatus .ck-lbl.on')) document.querySelector('#estatus .ck-lbl').click(); const emp = document.getElementById('empresa'); if (emp && !emp.value) { emp.value = [...emp.options].map(o => o.value).filter(Boolean)[0]; }  const be = document.getElementById('btn-enviar-relevo'); if (be) be.disabled = false; if (typeof refrescarEstadoClave === 'function') refrescarEstadoClave(); };
let envios = 0; const _fetch = window.fetch; window.fetch = function(u, o){ try { const b = JSON.parse((o && o.body) || '{}'); if (b.numero && b.datos) envios++; } catch (e) {} return _fetch.apply(this, arguments); };
// Fuente: T-01 piso 02 apto A1 con tres mediciones, guardado en este teléfono.
nuevoFormulario(); await esperar(300); setAmbito('apartamento'); await esperar(200);
sel('fecha', '2026-10-06'); sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-01'); sel('piso', 'Piso 02'); put('apto', 'A1'); await esperar(1200);
const cajaAnt = document.getElementById('aviso-anterior'); if (cajaAnt) cajaAnt.innerHTML = '';
mide(fila('hito_servicios', '3.01'), '6', '4'); mide(fila('hito_servicios', '3.02'), '5', '5'); mide(fila('hito_acabados', '4.01'), '100', '50');
saveDraft(true); await esperar(300);
// Destino: T-01 piso 03 apto A2, vacío.
nuevoFormulario(); await esperar(300); setAmbito('apartamento'); await esperar(200);
sel('fecha', '2026-10-07'); sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-01'); sel('piso', 'Piso 03'); put('apto', 'A2'); await esperar(1400);
const btn = document.getElementById('btn-copiar-de');
ok('1 · Con torre, piso y apartamento y nada medido aparece «Copiar de otro apartamento…»', !!btn && btn.offsetHeight >= 44, btn ? btn.textContent + ' alto ' + btn.offsetHeight : 'sin botón');
btn.click(); await esperar(1500);
const items = [...document.querySelectorAll('#copiar-de .f')];
ok('2 · El panel lista el apartamento guardado en este teléfono (T-01 · Piso 02 apto A1, 3 filas)', items.length >= 1 && /T-01 · Piso 02 apto A1/.test(items[0].textContent) && /3 filas/.test(items[0].textContent), items.map(x => x.textContent.trim().slice(0, 70)).join(' | '));
items[0].querySelector('button').click(); await esperar(600);
const copiadas = document.querySelectorAll('tr.heredada.copiada').length, tag = document.querySelector('tr.heredada.copiada .heredada-tag');
ok('3 · Copiar llena las tres filas y las marca «≈ Copiado de T-01 · Piso 02 apto A1» con «Confirmado en sitio»', copiadas === 3 && document.getElementById('pr_' + fila('hito_servicios', '3.01')).value === '6' && tag && /Copiado de T-01 · Piso 02 apto A1/.test(tag.textContent) && /Confirmado en sitio/.test(tag.querySelector('button').textContent), copiadas + ' · ' + (tag ? tag.textContent.trim() : ''));
const d4 = getFormData();
ok('4 · El dato dice de dónde se copió, y cada fila copiada lleva el número de origen', d4.copiadoDe && /EZ-T01-P02AA1-261006/.test(d4.copiadoDe.nro) && d4.partidas.hito_servicios[CODIGOS_SUB.hito_servicios.indexOf('3.01')].copiadoDe === d4.copiadoDe.nro && d4.partidas.hito_servicios[CODIGOS_SUB.hito_servicios.indexOf('3.01')].heredado === true, JSON.stringify(d4.copiadoDe));
completar(); Q.dialogos.length = 0; const antes5 = envios; await enviarAlRelevo(); await esperar(400); const al5 = Q.dialogos.filter(m => /no se han confirmado/.test(m));
ok('5 · No se puede enviar con filas copiadas sin confirmar: avisa y no manda nada', al5.length === 1 && envios === antes5, Q.dialogos.join(' | ').slice(0, 160) + ' · envíos ' + (envios - antes5));
saveDraft(true); await esperar(200); const pos6 = getSavedReports().findIndex(b => b && /P03AA2/.test(b.nro || ''));
nuevoFormulario(); await esperar(300); loadDraftData(pos6); await esperar(700);
ok('6 · Guardar y reabrir el borrador conserva las tres marcas y el origen', document.querySelectorAll('tr.heredada.copiada').length === 3 && _copiaDe && /P02AA1/.test(_copiaDe.nro) && !document.getElementById('btn-copiar-de'), document.querySelectorAll('tr.heredada.copiada').length + ' · ' + JSON.stringify(_copiaDe));
document.querySelector('tr.heredada.copiada .sigue-igual').click(); await esperar(200);
ok('7 · «Confirmado en sitio» quita la marca de esa fila y la fila sigue contando como copiada en el dato', document.querySelectorAll('tr.heredada.copiada').length === 2 && document.querySelectorAll('tr.copiada').length === 3 && getFormData().partidas.hito_servicios.filter(r => r && r.copiadoDe && !r.heredado).length === 1, document.querySelectorAll('tr.heredada.copiada').length + ' sin confirmar');
[...document.querySelectorAll('tr.heredada.copiada .sigue-igual')].forEach(b => b.click()); await esperar(200);
completar(); Q.dialogos.length = 0; const antes8 = envios; await enviarAlRelevo(); await esperar(2500);
ok('8 · Con todas confirmadas sí se envía (y el dato viaja con copiadoDe)', envios === antes8 + 1 && !Q.dialogos.some(m => /no se han confirmado/.test(m)), 'envíos ' + (envios - antes8) + ' · diálogos ' + Q.dialogos.join(' | ').slice(0, 160));
// Torre: la T-02 es de la misma contratista que la T-01 (Río Limón). Un informe de torre de T-02 en el teléfono se ofrece para la T-01.
nuevoFormulario(); await esperar(300); setAmbito('torre'); await esperar(200);
sel('fecha', '2026-10-06'); sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-02'); await esperar(1200);
if (cajaAnt) cajaAnt.innerHTML = '';
mide(fila('hito_estructura', '1.01'), '1000', '800'); saveDraft(true); await esperar(300);
nuevoFormulario(); await esperar(300); setAmbito('torre'); await esperar(200);
sel('fecha', '2026-10-07'); sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-01'); await esperar(1400);
const btn9 = document.getElementById('btn-copiar-de'); if (btn9) { btn9.click(); await esperar(1500); }
const grupos = [...document.querySelectorAll('#copiar-de .g')].map(g => g.textContent), items9 = [...document.querySelectorAll('#copiar-de .f')];
ok('9 · En torre, el panel ofrece el informe de la T-02 bajo «torres de la misma contratista»', !!btn9 && grupos.some(g => /misma contratista.*T-02/.test(g)) && items9.some(x => /T-02 · torre/.test(x.textContent)), grupos.join(' | ') + ' · ' + items9.map(x => x.textContent.trim().slice(0, 40)).join(' | '));
// Otra contratista del mismo sector: la T-07 (Alnavic). Un informe de torre de T-07 solo aparece al pedir «las demás torres del sector».
const bsec = document.querySelector('#copiar-de .sector');
const antes11 = [...document.querySelectorAll('#copiar-de .f')].some(x => /T-07/.test(x.textContent));
document.querySelector('#copiar-de .cerrar').click(); await esperar(200);
nuevoFormulario(); await esperar(300); setAmbito('torre'); await esperar(200);
sel('fecha', '2026-10-06'); sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-07'); await esperar(1200); if (cajaAnt) cajaAnt.innerHTML = '';
mide(fila('hito_estructura', '1.01'), '500', '100'); saveDraft(true); await esperar(300);
nuevoFormulario(); await esperar(300); setAmbito('torre'); await esperar(200);
sel('fecha', '2026-10-07'); sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-01'); await esperar(1400);
document.getElementById('btn-copiar-de').click(); await esperar(1500);
const sinSector = [...document.querySelectorAll('#copiar-de .f')].some(x => /T-07/.test(x.textContent));
const bs11 = document.querySelector('#copiar-de .sector'), txt11 = bs11 ? bs11.textContent : ''; if (bs11) { bs11.click(); await esperar(2500); }
const grupos11 = [...document.querySelectorAll('#copiar-de .g')].map(g => g.textContent), conSector = [...document.querySelectorAll('#copiar-de .f')].some(x => /T-07 · torre/.test(x.textContent));
ok('11 · La T-07 (otra contratista) no sale de entrada; con «Buscar también en las demás torres del sector» aparece bajo «otras torres del sector»', !!bsec && !antes11 && !sinSector && !!bs11 && /demás torres del sector \(\d+\)/.test(txt11) && grupos11.some(g => /otras torres del sector/.test(g)) && conSector, txt11 + ' · antes ' + sinSector + ' · después ' + conSector + ' · ' + grupos11.join(' | '));
document.querySelector('#copiar-de .cerrar').click(); await esperar(200);
mide(fila('hito_estructura', '1.01'), '900', '100'); await esperar(1000);
ok('10 · Con algo medido el botón no se ofrece', !document.getElementById('btn-copiar-de'), document.getElementById('copiar-de').innerHTML.slice(0, 60));
window.fetch = _fetch; nuevoFormulario(); await esperar(200); localStorage.removeItem('garmel_reports_list');
