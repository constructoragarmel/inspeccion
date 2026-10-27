// ESTRÉS 4 · v188 (27-oct-2026): QC15 y QC17 en OBRA (inspeccion.html?prueba=1, 375 px). Sin datos reales.
// QC15 todo junto: lo cerrado al 100 % vive dentro de los capítulos, sobrevive a cambiar de ámbito y volver, «Completar lo vacío»
// no lo pisa, y el PDF del teléfono (imprimir) no revienta · QC17 300 acciones al azar (ámbito, apartamento, medir, no
// inspeccionado, habilitar, guardar, abrir) sin un solo error de JavaScript, con las filas siempre una vez cada una y tres
// capítulos en apartamento.
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const put = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
const rid = cod => { for (const h of PARTIDAS) { const i = (CODIGOS_SUB[h.id] || []).indexOf(cod); if (i >= 0) return h.id + '_' + i; } };
const mide = (r, pr, ej) => { const a = document.getElementById('pr_' + r), b = document.getElementById('ej_' + r); if (!a || !b || a.disabled) return; a.value = pr; b.value = ej; recalcRow(a); b.dispatchEvent(new Event('input', { bubbles: true })); };
const insp = () => { const s = document.querySelector('.inspector-select'); s.value = [...s.options].map(o => o.value).filter(Boolean)[0]; s.dispatchEvent(new Event('change', { bubbles: true })); if (!document.querySelector('#estatus .ck-lbl.on')) document.querySelector('#estatus .ck-lbl').click(); };
const lugar = async (apto) => { nuevoFormulario(); await esperar(250); setAmbito('apartamento'); await esperar(200); sel('fecha', '2026-10-27'); sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-09'); sel('piso', 'Piso 04'); put('apto', apto); };
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem('garmel_reports_list', '[]');
await Q.relevo({ caido: false, fallar: [], lento: 0, borrar: true });
Q.aceptar = true;
const errores = []; const alErr = e => errores.push(String(e.message || e.reason || e)); window.addEventListener('error', alErr); window.addEventListener('unhandledrejection', alErr);
// ── QC15 ──
await lugar('A1'); await esperar(900); { const a = document.getElementById('aviso-anterior'); if (a) a.innerHTML = ''; }
insp(); mide(rid('3.01'), '6', '6'); mide(rid('3.16'), '2', '2'); mide(rid('8.05'), '1', '1'); saveDraft(true); await esperar(300);
await lugar('A1'); await hasta(() => document.querySelector('#aviso-anterior .si'), 6000, 100); await esperar(200);
const cerrados = () => $$('tr.cerrado100').map(tr => (tr.closest('.capitulo') || {}).id || (tr.closest('.partida') || {}).id).sort().join(',');
const c1 = cerrados();
setAmbito('torre'); await esperar(150); setAmbito('apartamento'); await esperar(200);
ok('QC15a · Lo cerrado vive dentro de su capítulo (sanitarias, gas, y el 8.05 en el hito 8) y sigue cerrado al ir a torre y volver', /p_cap_gas/.test(c1) && /p_cap_sanitarias/.test(c1) && $$('tr.cerrado100').length >= 3 && document.getElementById('ej_' + rid('3.16')).disabled, c1 + ' · tras volver: ' + cerrados());
if (typeof _copiarProgramar === 'function') { _copiarProgramar(); await esperar(900); }
const b15 = document.getElementById('btn-copiar-de');
ok('QC15b · Con lo cerrado, la oferta de traer o copiar sigue y lo cerrado no se toca', document.getElementById('ej_' + rid('3.01')).value === '6' && (!!document.querySelector('#aviso-anterior .si') || !!b15));
const _print = window.print; let imprimio = 0; window.print = () => { imprimio++; };
try { imprimirInforme(); } catch (e) { errores.push('imprimir: ' + e.message); }
window.print = _print;
ok('QC15c · El PDF del teléfono (imprimir) sale sin error con capítulos y filas cerradas', imprimio === 1 && !errores.length, errores.join(' | '));
// ── QC17 ──
const aptos = ['A1', 'A2', 'B1', 'B2'], cods = ['3.01', '3.02', '3.04', '3.07', '3.16', '3.17', '4.01', '8.01', '8.05', '2.01'];
let semilla = 7; const azar = n => { semilla = (semilla * 9301 + 49297) % 233280; return Math.floor(semilla / 233280 * n); };
const t0 = performance.now(); let acciones = 0;
for (let k = 0; k < 300; k++) {
  const a = azar(9);
  try {
    if (a === 0) setAmbito(azar(4) ? 'apartamento' : 'torre');
    else if (a === 1) put('apto', aptos[azar(4)]);
    else if (a === 2 || a === 3) { const c = cods[azar(cods.length)], r = rid(c); if (r) mide(r, String(1 + azar(9)), String(azar(10))); }
    else if (a === 4) toggleNoInspeccionado(['hito_servicios', 'hito_acc_electricos', 'hito_cerramientos'][azar(3)]);
    else if (a === 5) { const b = document.querySelector('.abrir100'); if (b) b.click(); }
    else if (a === 6) saveDraft(true);
    else if (a === 7) { const l = getSavedReports(); if (l.length) loadDraftData(azar(l.length)); }
    else { const c = document.querySelector('.capitulo .p-hdr'); if (c) c.click(); }
    acciones++;
  } catch (e) { errores.push('acción ' + k + ' (' + a + '): ' + e.message); }
  if (k % 25 === 24) await esperar(30);
}
await esperar(400);
const ids = $$('#main-content input[id^="pr_"]').map(e => e.id), repetidos = ids.length - new Set(ids).size;
setAmbito('apartamento'); await esperar(200);
ok('QC17a · 300 acciones al azar sin un error de JavaScript', !errores.length && acciones === 300, errores.slice(0, 3).join(' | ') + ' · ' + Math.round(performance.now() - t0) + ' ms');
ok('QC17b · Cada fila sigue estando una sola vez y en apartamento hay tres capítulos', repetidos === 0 && $$('.capitulo').length === 3 && $$('#capt_cap_sanitarias tr').length === 4, 'repetidos ' + repetidos + ' · capítulos ' + $$('.capitulo').length);
ok('QC17c · Nada se sale a 375 px', document.documentElement.scrollWidth <= innerWidth + 1, document.documentElement.scrollWidth + ' > ' + innerWidth);
window.removeEventListener('error', alErr); window.removeEventListener('unhandledrejection', alErr);
nuevoFormulario(); localStorage.setItem('garmel_reports_list', '[]');
