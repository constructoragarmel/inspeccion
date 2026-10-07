// LISTA V2 · tanda 1 de 4 — PARTIDAS Y CÁLCULO (29-sep-2026), en inspeccion.html a 375×812.
// Las cifras esperadas salen de comun/lista_v2.py calculadas aparte en Python, no del formulario:
// apartamento 50 filas en 8 hitos (1 cantidad, 33 conteo, 13 estado, 3 sí/no);
// torre 58 filas en 11 hitos (8 cantidad, 8 conteo, 36 estado, 6 sí/no).
// (v134, 6-oct: el hito 3 suma 3.20 y 3.21 (centro de piso y tapón de registro); 7.06 y 7.07 retiradas.)
// (v100, 30-sep: +4 de apartamento y +11 de torre, menos las 3 retiradas del hito 12.)
localStorage.setItem('garmel_rol', 'inspector');
const put = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
const pct = rid => (document.getElementById('pct_' + rid)?.innerText || '').trim();
const visible = el => { if (!el) return false; for (let x = el; x && x !== document.body; x = x.parentElement) { const cs = getComputedStyle(x); if (cs.display === 'none' || cs.visibility === 'hidden') return false; } return true; };
const abrirTodo = () => document.querySelectorAll('.partida.collapsed').forEach(p => p.classList.remove('collapsed'));
const tipo = (p, i) => _esSiNo(p, i) ? 'sino' : _esEstado(p, i) ? 'estado' : _esConteo(p, i) ? 'conteo' : 'cantidad';
const esperado = { apartamento: { filas: 50, hitos: 8, cantidad: 1, conteo: 33, estado: 13, sino: 3 },
                   torre:       { filas: 58, hitos: 11, cantidad: 8, conteo: 8, estado: 36, sino: 6 } };

// ── 1. Cada ámbito muestra exactamente sus filas ──
let r1 = [], ok1 = true;
for (const amb of ['apartamento', 'torre']) {
  setAmbito(amb); await esperar(200); abrirTodo();
  const filas = PARTIDAS.flatMap(p => p.items.map((_, i) => ({ p: p.id, i }))).filter(x => visible(document.getElementById('pct_' + x.p + '_' + x.i)));
  const hitos = PARTIDAS.filter(p => visible(document.getElementById('p_' + p.id))).length;
  const cuenta = { cantidad: 0, conteo: 0, estado: 0, sino: 0 };
  filas.forEach(x => cuenta[tipo(x.p, x.i)]++);
  const e = esperado[amb];
  const bien = filas.length === e.filas && hitos === e.hitos && ['cantidad', 'conteo', 'estado', 'sino'].every(k => cuenta[k] === e[k]);
  ok1 = ok1 && bien;
  r1.push(amb + ': ' + filas.length + ' filas/' + hitos + ' hitos ' + JSON.stringify(cuenta));
}
ok('1 · Cada ámbito muestra exactamente sus filas y tipos (50 en apartamento, 58 en torre)', ok1, r1.join(' | '));

// ── 2. Cada tipo de fila tiene sus controles y no otros ──
setAmbito('apartamento'); await esperar(200); abrirTodo();
const malos2 = [];
PARTIDAS.forEach(p => p.items.forEach((_, i) => {
  if (!_aplica(p.id, i)) return;
  const rid = p.id + '_' + i, t = tipo(p.id, i);
  const est = document.querySelectorAll(`.est-btn[data-rid="${rid}"]`).length;
  const pm = !!document.getElementById('pm_' + rid);
  const ej = document.getElementById('ej_' + rid), pr = document.getElementById('pr_' + rid);
  const bien = t === 'estado' ? (est === 5 && !pm && ej.type === 'hidden') :
               t === 'sino' ? (est === 2 && !pm && ej.type === 'hidden') :
               t === 'conteo' ? (est === 0 && !pm && ej.type === 'text' && pr.type === 'text' && visible(pr) && visible(ej) && ej.closest('td') === pr.closest('td')) :
               (est === 0 && pm && ej.type === 'text');
  if (!bien) malos2.push(rid + ':' + t + ' est=' + est + ' pm=' + pm);
}));
ok('2 · Estado: 5 botones · Sí/No: 2 · conteo: «puestas de hay» visibles juntas · % escrito solo en cantidades', malos2.length === 0, malos2.slice(0, 5).join(' · '));

// ── 3. Valores de borde en el conteo y en los estados ──
const c = 'hito_acc_electricos_0';
put('ej_' + c, '7'); put('pr_' + c, '5'); const a = pct(c);           // más puestas que las que hay: tope 100
put('ej_' + c, '3'); put('pr_' + c, '0'); const b = pct(c);           // hay 0: no se sabe
put('ej_' + c, '-2'); put('pr_' + c, '4'); const d = pct(c);          // el «-» no entra (v96): queda 2 de 4 = 50 %
put('ej_' + c, '1'); put('pr_' + c, '3'); const e3 = pct(c);          // 33,3 → se trunca a 33
const bt = document.querySelector('.est-btn[data-rid="hito_acabados_2"][data-v="50"]');
setEstado(bt, 50); const f1 = pct('hito_acabados_2'); setEstado(bt, 50); const f2 = pct('hito_acabados_2');   // tocar dos veces lo borra
const sn = document.querySelector('.est-btn[data-rid="hito_pruebas_0"][data-sn="Sí"]');
setSiNo(sn); const g1 = pct('hito_pruebas_0'); setSiNo(sn); const g2 = pct('hito_pruebas_0');
ok('3 · Bordes: 7 de 5 = 100 %, de 0 = —, «-2» queda 2 (50 %), 1 de 3 = 33 %; estado y Sí se borran al volver a tocarlos',
   a === '100%' && b === '—' && d === '50%' && document.getElementById('ej_' + c).value !== '-2' && e3 === '33%' && f1 === '50%' && f2 === '—' && g1 === '100%' && g2 === '—',
   [a, b, d, e3, f1, f2, g1, g2].join(' '));

// ── 4. El % del hito y el total son el promedio simple de lo que se ve ──
const vals = [0, 25, 50, 75, 100];
let n = 0;
PARTIDAS.forEach(p => p.items.forEach((_, i) => {
  if (!_aplica(p.id, i)) return; n++; const rid = p.id + '_' + i, t = tipo(p.id, i);
  if (t === 'estado') setEstado(document.querySelector(`.est-btn[data-rid="${rid}"][data-v="${vals[n % 5]}"]`), vals[n % 5]);
  else if (t === 'sino') setSiNo(document.querySelector(`.est-btn[data-rid="${rid}"][data-sn="${n % 2 ? 'Sí' : 'No'}"]`));
  else if (t === 'conteo') { put('pr_' + rid, String(2 + n % 4)); put('ej_' + rid, String(n % 3)); }
  else put('pm_' + rid, String((n * 17) % 101));
}));
const malos4 = []; let sumT = 0, cntT = 0;
_hitosDelAmbito().forEach(p => {
  let s = 0, k = 0;
  p.items.forEach((_, i) => { if (!_aplica(p.id, i)) return; const v = pct(p.id + '_' + i); if (/%$/.test(v)) { s += parseInt(v); k++; } });
  const esp = k ? Math.floor(s / k) + '%' : '—', vis = document.getElementById('badge_' + p.id).innerText.trim();
  if (esp !== vis) malos4.push(p.id + ' ' + esp + '≠' + vis);
  if (k) { sumT += Math.floor(s / k); cntT++; }
});
const totEsp = Math.floor(sumT / cntT) + '%', totVis = document.getElementById('total-num').innerText.trim();
ok('4 · % de cada hito = promedio de sus filas visibles, y el total = promedio de hitos', malos4.length === 0 && totEsp === totVis, malos4.join(' · ') + ' total ' + totEsp + ' vs ' + totVis);

// ── 5. N/A y «no inspeccionado» salen del cálculo ──
const antesH = document.getElementById('badge_hito_acc_electricos').innerText.trim();
const rNA = 'hito_acc_electricos_1';
const pNA = pct(rNA);
setEv(document.querySelector(`.ev-btn.NA[data-rid="${rNA}"]`));
let s5 = 0, k5 = 0; PARTIDAS.find(p => p.id === 'hito_acc_electricos').items.forEach((_, i) => { const rid = 'hito_acc_electricos_' + i; if (rid === rNA) return; const v = pct(rid); if (/%$/.test(v)) { s5 += parseInt(v); k5++; } });
const conNA = document.getElementById('badge_hito_acc_electricos').innerText.trim();
toggleNoInspeccionado('hito_acabados'); await esperar(100);
const acab = document.getElementById('badge_hito_acabados').innerText.trim();
const d5 = getFormData();
toggleNoInspeccionado('hito_acabados'); await esperar(100);
ok('5 · N/A saca la fila del promedio y «no inspeccionado» saca el hito (y viaja marcado)',
   conNA === Math.floor(s5 / k5) + '%' && acab === '—' && d5.noInspeccionados.indexOf('hito_acabados') >= 0,
   'antes ' + antesH + ' (fila ' + pNA + ') → con N/A ' + conNA + ' · acabados ' + acab);
