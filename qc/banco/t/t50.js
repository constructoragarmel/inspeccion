// TANDA 50 · V107 (1-oct-2026): que el N/A deje de usarse para «todavía no está hecho». En inspeccion.html.
// 1 la casilla se llama «total» · 2 «0 puestas» sin total da 0 % · 3 vacío no es cero · 4 con total sigue igual
// 5 el cero sin total entra al promedio del hito · 6 un m² en 0 sin total da 0 % · 7 la fila agregada en 0
// 8 al marcar N/A la fila dice qué significa, y se quita al desmarcar · 9 N/A sobre un cero lo saca del promedio
// 10 lo que viaja · 11 con tres N/A pregunta antes de enviar y «Cancelar» no envía · 12 con dos no pregunta
// 13 el borrador conserva el cero · 14 la nota no ensancha la página
localStorage.setItem('garmel_rol', 'inspector');
localStorage.setItem('garmel_clave_envio', 'qc');
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const put = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
const limpiar = async () => { Q.aceptar = true; nuevoFormulario(); await esperar(300); };
const pct = rid => (document.getElementById('pct_' + rid)?.innerText || '').trim();
const badge = h => (document.getElementById('badge_' + h)?.innerText || '').trim();
const est = (rid, v) => setEstado(document.querySelector(`.est-btn[data-rid="${rid}"][data-v="${v}"]`), v);
const na = rid => setEv(document.querySelector(`.ev-btn.NA[data-rid="${rid}"]`));
const nota = rid => (document.getElementById('pct_' + rid)?.closest('tr')?.querySelector('.na-nota')?.textContent || '');
const abrirTodo = () => [...document.querySelectorAll('[id^=badge_]')].forEach(bd => {
  const tr = document.getElementById('pct_' + bd.id.slice(6) + '_0')?.closest('tr'); if (!tr || tr.offsetParent) return;
  let el = bd; for (let k = 0; k < 5 && el; k++) { if (el.getAttribute && el.getAttribute('onclick')) { el.click(); break; } el = el.parentElement; } });
const cabecera = () => {
  sel('fecha', '2026-10-01'); sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-07');
  const emp = [...document.getElementById('empresa').options].map(o => o.value);
  sel('empresa', emp.find(x => /ALNAVIC/i.test(x)) || emp[1]);
  const insp = document.querySelector('.inspector-select');
  insp.value = [...insp.options].map(o => o.value).filter(Boolean)[0]; insp.dispatchEvent(new Event('change', { bubbles: true }));
  const res = document.querySelector('#residentes-container input'); if (res) put(res.id || (res.id = 'res0'), 'Ing. Prueba');
  if (!document.querySelector('#estatus .ck-lbl.on')) document.querySelector('#estatus .ck-lbl').click();
  sel('piso', 'Piso 03'); put('apto', 'A');
};
// Las filas del ámbito, por forma de medir
const filasDe = tipo => { const out = []; _hitosDelAmbito().forEach(p => p.items.forEach((_, i) => { if (!_aplica(p.id, i)) return; const rid = p.id + '_' + i;
  const pr = document.getElementById('pr_' + rid), ej = document.getElementById('ej_' + rid); if (!pr || !ej) return;
  const t = pr.dataset.est ? 'estado' : (pr.placeholder === 'total' || pr.placeholder === 'hay') ? 'conteo' : 'cantidad';
  if (t === tipo) out.push({ rid: rid, pid: p.id }); })); return out; };

await limpiar(); setAmbito('apartamento'); await esperar(200); cabecera(); abrirTodo(); await esperar(300);
const conteos = filasDe('conteo'), cants = filasDe('cantidad');
// un hito con dos filas de conteo, para ver el promedio
const porHito = {}; conteos.forEach(f => (porHito[f.pid] = porHito[f.pid] || []).push(f.rid));
const PID = Object.keys(porHito).find(k => porHito[k].length >= 2), A = porHito[PID][0], B = porHito[PID][1];

// ── 1 ──
const ph = [...document.querySelectorAll('input[id^="pr_"]')].map(e => e.placeholder);
ok('1 · La casilla del conteo se llama «total»; ninguna dice «hay»', conteos.length > 5 && !ph.includes('hay') && document.getElementById('pr_' + A).placeholder === 'total' &&
   !/«hay»/.test(document.body.innerText), conteos.length + ' filas de conteo · placeholder «' + document.getElementById('pr_' + A).placeholder + '»');

// ── 2 ──
put('ej_' + A, '0');
ok('2 · «0 puestas» sin escribir el total: la fila da 0 % y el hito 0 %', pct(A) === '0%' && badge(PID) === '0%', 'fila ' + pct(A) + ' · hito ' + badge(PID));

// ── 3 ──
put('ej_' + A, '');
const vac = pct(A) + '/' + badge(PID);
put('ej_' + A, '3');
ok('3 · Vacío no es cero: sin nada escrito la fila queda en «—»; y «3 puestas» sin total tampoco da porcentaje', vac === '—/—' && pct(A) === '—', 'vacío ' + vac + ' · 3 sin total ' + pct(A));

// ── 4 ──
put('ej_' + A, '0'); put('pr_' + A, '5'); const c4a = pct(A);
put('ej_' + A, '2'); put('pr_' + A, '4'); const c4b = pct(A);
put('ej_' + A, '0'); put('pr_' + A, '0'); const c4c = pct(A);
ok('4 · Con total sigue igual: 0 de 5 da 0 %, 2 de 4 da 50 %; y «0 de 0» ya da 0 % en vez de quedar sin porcentaje', c4a === '0%' && c4b === '50%' && c4c === '0%', c4a + ' · ' + c4b + ' · ' + c4c);

// ── 5 ──
put('pr_' + A, ''); put('ej_' + A, '0'); put('ej_' + B, '4'); put('pr_' + B, '4');
ok('5 · En el hito, un cero sin total y una fila completa promedian 50 %', pct(A) === '0%' && pct(B) === '100%' && badge(PID) === '50%', pct(A) + ' + ' + pct(B) + ' = ' + badge(PID));

// ── 6 ──
const M = cants[0];
put('ej_' + M.rid, '0'); const c6a = pct(M.rid);
const pm = document.getElementById('pm_' + M.rid); let c6b = '(sin % manual)';
if (pm) { put('pm_' + M.rid, '40'); c6b = pct(M.rid); put('pm_' + M.rid, ''); }
ok('6 · Una fila de cantidad (m²) con 0 ejecutado y sin total da 0 %; si el inspector escribe el %, manda el suyo', c6a === '0%' && (!pm || c6b === '40%'), M.rid + ': ' + c6a + ' · con 40 escrito ' + c6b);
put('ej_' + M.rid, '');

// ── 7 ──
addRow(PID); const X = [...document.querySelectorAll('#extra_' + PID + ' tr.extra-row')].pop().dataset.rid;
put('desc_' + X, 'Fila de prueba'); put('ej_' + X, '0');
ok('7 · Una fila agregada con «0 hechas» y sin total da 0 %', pct(X) === '0%', pct(X));
put('ej_' + X, ''); put('desc_' + X, '');

// ── 8 ──
const antes8 = nota(B); na(B); await esperar(100); const con8 = nota(B), vis8 = !!document.getElementById('pct_' + B).closest('tr').querySelector('.na-nota')?.offsetParent;
na(B); await esperar(100); const sin8 = nota(B);
na(B); await esperar(50); setEv(document.querySelector(`.ev-btn.B[data-rid="${B}"]`)); await esperar(50); const otra8 = nota(B);
ok('8 · Al marcar N/A la fila dice debajo qué significa («no existe aquí, o no se pudo ver… ponga 0»); se quita al desmarcar y al elegir otra evaluación',
   antes8 === '' && /no existe aquí/.test(con8) && /ponga 0/.test(con8) && vis8 && sin8 === '' && otra8 === '', 'nota: «' + con8 + '» · a la vista ' + vis8);
setEv(document.querySelector(`.ev-btn.B[data-rid="${B}"]`));

// ── 9 ──
const b9a = badge(PID); na(A); await esperar(100); const b9b = badge(PID); na(A); await esperar(100);
ok('9 · N/A sobre la fila en cero la saca del promedio (50 % → 100 %), y al quitarlo vuelve a 50 %', b9a === '50%' && b9b === '100%' && badge(PID) === '50%', b9a + ' → ' + b9b + ' → ' + badge(PID));

// ── 10 ──
const d10 = getFormData(), iA = +A.match(/_(\d+)$/)[1], fA = d10.partidas[PID][iA];
ok('10 · En los datos viaja el cero tal cual, sin total inventado', fA.ej === '0' && fA.pr === '' && !fA.ev, JSON.stringify(fA));

// ── 11 ──
const tres = conteos.filter(f => f.rid !== A && f.rid !== B).slice(0, 3).map(f => f.rid);
tres.forEach(na); await esperar(100);
document.getElementById('btn-enviar-relevo').disabled = false;
if (typeof refrescarEstadoClave === 'function') refrescarEstadoClave();
const n0 = (await Q.envios()).length; Q.dialogos.length = 0; Q.aceptar = false;
await enviarAlRelevo(); await esperar(600);
const n1 = (await Q.envios()).length, preg = Q.dialogos.filter(m => /Marcó N\/A en 3 filas/.test(m));
ok('11 · Con tres N/A pregunta una vez antes de enviar, dice que lo pendiente va en 0, y con «Cancelar» no se envía nada',
   preg.length === 1 && /NO EXISTE en este apartamento/.test(preg[0]) && /va en 0/.test(preg[0]) && n1 === n0 && !document.getElementById('btn-enviar-relevo').disabled,
   'preguntas ' + preg.length + ' · envíos ' + n0 + ' → ' + n1);

// ── 12 ──
na(tres[2]); await esperar(100); Q.dialogos.length = 0; Q.aceptar = true;
await enviarAlRelevo(); await esperar(800); await hasta(() => !/enviando/i.test(document.getElementById('sendLog').textContent), 20000);
const env = (await Q.envios()).slice(-1)[0] || {}, n2 = (await Q.envios()).length;
const fE = (((env.datos || {}).partidas || {})[PID] || [])[iA] || {};
ok('12 · Con dos N/A no pregunta y el envío sale; el cero llega al relevo como «0» sin total',
   !Q.dialogos.some(m => /Marcó N\/A/.test(m)) && n2 === n0 + 1 && fE.ej === '0' && fE.pr === '', 'preguntas ' + Q.dialogos.filter(m => /Marcó N\/A/.test(m)).length + ' · envíos ' + n2 + ' · fila ' + JSON.stringify(fE));

// ── 13 ──
await limpiar(); setAmbito('apartamento'); await esperar(200); cabecera(); abrirTodo(); await esperar(200);
put('ej_' + A, '0'); put('ej_' + B, '4'); put('pr_' + B, '4');
currentEditingIndex = null; _idEnEdicion = null; saveDraft(true); await esperar(300);
await limpiar(); loadDraftData(0); await esperar(600);
ok('13 · El borrador conserva el cero: al reabrir, la fila sigue en 0 % y el hito en 50 %', pct(A) === '0%' && badge(PID) === '50%', pct(A) + ' · hito ' + badge(PID));

// ── 14 ──
abrirTodo(); await esperar(200); conteos.slice(0, 4).forEach(f => na(f.rid)); await esperar(200);
const ancho = window.innerWidth, notas = [...document.querySelectorAll('.na-nota')].filter(n => n.offsetParent);
const fuera = notas.filter(n => n.getBoundingClientRect().right > ancho + 1 || n.getBoundingClientRect().left < -1);
ok('14 · A ' + ancho + ' px las notas del N/A caben: no ensanchan la página ni se salen', notas.length >= 3 && fuera.length === 0 && document.documentElement.scrollWidth <= ancho + 1,
   notas.length + ' notas · fuera ' + fuera.length + ' · scrollWidth ' + document.documentElement.scrollWidth + ' / ' + ancho + ' · alto de la nota ' + Math.round(notas[0]?.getBoundingClientRect().height || 0) + ' px');
