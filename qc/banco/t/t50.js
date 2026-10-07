// TANDA 50 · V107 (1-oct-2026): que el N/A deje de usarse para «todavía no está hecho». En inspeccion.html.
// 1 la casilla se llama «total» · 2 «0 puestas» sin total da 0 % · 3 vacío no es cero · 4 con total sigue igual
// 5 el cero sin total entra al promedio del hito · 6 un m² en 0 sin total da 0 % · 7 la fila agregada en 0
// 8 al marcar N/A la fila dice qué significa, y se quita al desmarcar · 9 N/A sobre un cero lo saca del promedio
// 10 lo que viaja · 11 con tres N/A pregunta antes de enviar y «Cancelar» no envía · 12 con dos no pregunta
// 13 el borrador conserva el cero · 14 la nota no ensancha la página · 15 y 16 la leyenda al inicio de cada hito (v108)
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
  if (!bd.closest('.partida') || !bd.closest('.partida').classList.contains('collapsed')) return;   // ya abierto (desde el QC de UX el primero viene abierto)
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
ok('8 · Al marcar N/A la fila dice debajo qué significa («no existe aquí, o no se pudo ver… escriba 0»); se quita al desmarcar y al elegir otra evaluación',
   antes8 === '' && /no existe aquí/.test(con8) && /quite el N\/A y escriba 0\./.test(con8) && vis8 && sin8 === '' && otra8 === '', 'nota: «' + con8 + '» · a la vista ' + vis8);
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
   preg.length === 1 && /NO EXISTE en este apartamento/.test(preg[0]) && /va en «No iniciado», en «No» o en 0/.test(preg[0]) && n1 === n0 && !document.getElementById('btn-enviar-relevo').disabled,
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

// ── 15 y 16. La leyenda al inicio de cada hito (v108) ──
const hitos = _hitosDelAmbito().map(p => document.getElementById('p_' + p.id)).filter(Boolean);
const ley = hitos.map(h => h.querySelector('.p-body > .leyenda-na'));
const primera = ley[0];
ok('15 · Cada hito del ámbito abre con la leyenda del N/A, antes de la primera subpartida, y dice que lo no iniciado no es N/A',
   hitos.length >= 8 && ley.every(l => l && l.nextElementSibling && l.nextElementSibling.classList.contains('tbl-wrap') && /no existe aquí/.test(l.textContent) && /no está iniciado/.test(l.textContent)),
   hitos.length + ' hitos · con leyenda ' + ley.filter(Boolean).length);
const vis = ley.filter(l => l && l.offsetParent), r0 = primera.getBoundingClientRect();
ok('16 · La leyenda se ve con el hito abierto, cabe a ' + ancho + ' px y no sale en el PDF (solo pantalla)',
   vis.length >= 8 && vis.every(l => { const r = l.getBoundingClientRect(); return r.left >= 0 && r.right <= ancho + 1 && r.height <= 110; }) &&
   ley.every(l => l.classList.contains('solo-pantalla')) && document.documentElement.scrollWidth <= ancho + 1,
   vis.length + ' a la vista · alto ' + Math.round(r0.height) + ' px · ancho ' + Math.round(r0.width) + ' px');

// ── 17 a 19. La leyenda y la nota nombran solo lo que la fila tiene (v111) ──
await limpiar(); setAmbito('apartamento'); await esperar(200); cabecera(); abrirTodo(); await esperar(200);
const ley17 = pid => (document.querySelector('.leyenda-na[data-p="' + pid + '"] .ley-frase')?.textContent || '');
const a17 = { vent: ley17('hito_ventanas'), prue: ley17('hito_pruebas'), elec: ley17('hito_puertas'), serv: ley17('hito_servicios') };
ok('17 · En apartamento: ventanas y puertas (solo piezas) dicen «escriba 0» y no nombran «No iniciado»; pruebas dice «No»; servicios, que mezcla, dice las dos',
   /escriba 0\.$/.test(a17.vent) && !/No iniciado/.test(a17.vent) && /escriba 0\.$/.test(a17.elec) && !/No iniciado/.test(a17.elec) &&
   /marque «No»\.$/.test(a17.prue) && !/escriba 0/.test(a17.prue) && /marque «No iniciado» o escriba 0 donde se cuenta o se mide\.$/.test(a17.serv),
   'ventanas: …' + a17.vent.slice(-40) + ' | pruebas: …' + a17.prue.slice(-30) + ' | servicios: …' + a17.serv.slice(-60));
setAmbito('torre'); await esperar(300);
const t18 = ley17('hito_acc_electricos');
setAmbito('apartamento'); await esperar(300);
ok('18 · La leyenda sigue al ámbito: accesorios eléctricos en torre solo tiene filas de estado («No iniciado», sin «escriba 0»); en apartamento, las dos',
   /marque «No iniciado»\.$/.test(t18) && !/escriba 0/.test(t18) && /marque «No iniciado» o escriba 0 donde se cuenta o se mide\.$/.test(ley17('hito_acc_electricos')),
   'torre: …' + t18.slice(-40) + ' | apartamento: …' + ley17('hito_acc_electricos').slice(-62));
abrirTodo(); await esperar(200);
const rEst = filasDe('estado')[0].rid, rSN = 'hito_pruebas_0';
na(rEst); na(rSN); await esperar(100);
ok('19 · La nota al marcar N/A dice el gesto de esa fila: «No iniciado» en una de estado, «No» en una de Sí / No',
   /quite el N\/A y marque «No iniciado»\.$/.test(nota(rEst)) && /quite el N\/A y marque «No»\.$/.test(nota(rSN)), nota(rEst).slice(-45) + ' | ' + nota(rSN).slice(-35));

// ── 20 a 23. La leyenda es plegable (v112) ──
const leys = () => [...document.querySelectorAll('.leyenda-na[data-p]')].filter(l => l.offsetParent);
const alto = l => Math.round(l.getBoundingClientRect().height);
const abiertas20 = leys(), a20 = abiertas20.every(l => l.querySelector('.ley-texto').offsetParent && !l.querySelector('.ley-chip').offsetParent);
ok('20 · La primera vez la leyenda sale abierta en cada hito, con su «Entendido · ocultar» y sin la pastilla',
   abiertas20.length >= 6 && a20 && !document.body.classList.contains('ley-na-cerrada') && /Entendido/.test(abiertas20[0].querySelector('.ley-ocultar').textContent), abiertas20.length + ' a la vista · alto ' + alto(abiertas20[0]) + ' px');
const h20 = alto(abiertas20[0]);
abiertas20[0].querySelector('.ley-ocultar').click(); await esperar(100);
const c21 = leys(), todas21 = c21.every(l => !l.querySelector('.ley-texto').offsetParent && l.querySelector('.ley-chip').offsetParent && alto(l) <= 40);
ok('21 · Con un toque en «Entendido» se pliega en TODOS los hitos: queda una pastilla de una línea («¿Cuándo va N/A?») y se recuerda en el teléfono',
   todas21 && localStorage.getItem('garmel_leyenda_na') === '1' && alto(c21[0]) < h20, 'de ' + h20 + ' px a ' + alto(c21[0]) + ' px · guardado ' + localStorage.getItem('garmel_leyenda_na'));
const rN = filasDe('conteo')[0].rid; na(rN); await esperar(100);
ok('22 · Plegada la leyenda, la nota al marcar N/A sigue saliendo en la fila', /quite el N\/A y escriba 0\.$/.test(nota(rN)), nota(rN).slice(-40));
na(rN);
c21[1].querySelector('.ley-chip').click(); await esperar(100);
const a23 = leys().every(l => l.querySelector('.ley-texto').offsetParent);
ok('23 · Tocar la pastilla la vuelve a abrir en todos, y también se recuerda', a23 && localStorage.getItem('garmel_leyenda_na') === '0' && document.documentElement.scrollWidth <= window.innerWidth + 1, 'abiertas ' + a23 + ' · guardado ' + localStorage.getItem('garmel_leyenda_na'));
