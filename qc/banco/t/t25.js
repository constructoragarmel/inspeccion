// LISTA V2 · tanda 4 de 4 — UX Y MAQUETA (29-sep-2026). Se corre a 375×812 y otra vez a 320×640.
// La tabla de «Memoria técnica» se sale por la derecha desde antes de la v91 (t10 falla igual en la v90):
// aquí se excluye a propósito para medir solo lo nuevo.
localStorage.setItem('garmel_rol', 'inspector');
const W = window.innerWidth;
const visible = el => { if (!el) return false; for (let x = el; x && x !== document.body; x = x.parentElement) { const cs = getComputedStyle(x); if (cs.display === 'none' || cs.visibility === 'hidden') return false; } const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
const abrirTodo = () => document.querySelectorAll('.partida.collapsed').forEach(p => p.classList.remove('collapsed'));
const fuera = () => [...document.querySelectorAll('body *')].filter(e => !e.closest('.memoria-table') && visible(e) && e.getBoundingClientRect().right > W + 1)
  .map(e => e.tagName + '.' + String(e.className).slice(0, 20) + '=' + Math.round(e.getBoundingClientRect().right));
setModeUI('inspector');

// ── 16. Sin scroll horizontal con todos los hitos abiertos, en los dos ámbitos ──
const r16 = [];
for (const amb of ['apartamento', 'torre']) {
  setAmbito(amb); await esperar(200); abrirTodo(); await esperar(200);
  r16.push(amb + ': ancho ' + document.documentElement.scrollWidth + '/' + W + ', fuera ' + fuera().length + (fuera().length ? ' (' + fuera().slice(0, 3).join(' ') + ')' : ''));
}
ok('16 · @' + W + ': sin scroll horizontal ni nada saliéndose, con los 8 hitos abiertos en apartamento y en torre',
   r16.every(x => { const m = x.match(/ancho (\d+)\/\d+, fuera (\d+)/); return m && +m[1] <= W && +m[2] === 0; }), r16.join(' | '));

// ── 17. Controles nuevos tocables: ≥ 44 px de alto ──
setAmbito('apartamento'); await esperar(200); abrirTodo();
const controles = [...document.querySelectorAll('.est-btn, .col-ejecutada.conteo .num, .pct-man')].filter(visible);
const chicos = controles.filter(e => e.getBoundingClientRect().height < 44).map(e => (e.id || e.className.slice(0, 12)) + ':' + Math.round(e.getBoundingClientRect().height));
ok('17 · @' + W + ': los ' + controles.length + ' botones de estado/Sí-No y casillas de conteo miden ≥ 44 px', chicos.length === 0, chicos.slice(0, 6).join(' · '));

// ── 18. La fila de conteo cabe en su tarjeta, y ningún nombre de subpartida se corta ──
const malos18 = [];
document.querySelectorAll('.col-ejecutada.conteo').forEach(td => {
  if (!visible(td)) return;
  const tr = td.closest('tr'), rTr = tr.getBoundingClientRect();
  [...td.querySelectorAll('input, .de')].forEach(x => { const r = x.getBoundingClientRect(); if (r.right > rTr.right + 1 || r.left < rTr.left - 1) malos18.push(x.id || 'de'); });
});
const cortados = [...document.querySelectorAll('td.desc')].filter(visible).filter(td => td.scrollWidth > td.clientWidth + 2).map(td => td.innerText.slice(0, 25));
ok('18 · @' + W + ': «puestas de hay» cabe en su tarjeta y ningún nombre de subpartida queda cortado', malos18.length === 0 && cortados.length === 0,
   'fuera: ' + malos18.slice(0, 4).join(',') + ' · cortados: ' + cortados.slice(0, 4).join(' | '));

// ── 19. Rol Planificación: ve la proyectada de las cantidades, y el conteo no se duplica ──
setModeUI('planificacion'); await esperar(150);
const prCant = document.getElementById('pr_hito_cerramientos_1');     // tabiquería (m²)
const prCont = document.querySelectorAll('[id="pr_hito_acc_electricos_0"]');
const vis19 = visible(prCant) && prCont.length === 1 && visible(prCont[0]);
setModeUI('inspector'); await esperar(150);
const oculto19 = !visible(document.getElementById('pr_hito_cerramientos_1')) && visible(document.getElementById('pr_hito_acc_electricos_0'));
ok('19 · Planificación ve la proyectada de las cantidades; el inspector no, pero sí «hay» en el conteo (una sola casilla)',
   vis19 && oculto19, 'planif: cant=' + visible(prCant) + ' conteo×' + prCont.length + ' · inspector: cant oculta=' + !visible(document.getElementById('pr_hito_cerramientos_1')) + ' conteo visible=' + visible(document.getElementById('pr_hito_acc_electricos_0')));
