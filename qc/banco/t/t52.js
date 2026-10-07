// TANDA 52 · V110 (2-oct-2026): «qué incluye» cada subpartida, al tocar el «?» de la fila. En inspeccion.html.
// 1 las 91 subpartidas tienen su línea · 2 cada fila a la vista trae su «?» y la ayuda cerrada · 3 tocar abre, tocar otra vez cierra
// 4 el texto es el de su código · 5 no viaja en los datos ni cambia el avance · 6 las filas agregadas no llevan «?»
// 7 el «?» queda dentro de la pantalla hasta en los nombres largos · 8 con varias ayudas abiertas nada se sale · 9 no sale en el PDF
// 10 un borrador reabre con las ayudas cerradas
localStorage.setItem('garmel_rol', 'inspector');
localStorage.setItem('garmel_clave_envio', 'qc');
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const put = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
const limpiar = async () => { Q.aceptar = true; nuevoFormulario(); await esperar(300); };
const pct = rid => (document.getElementById('pct_' + rid)?.innerText || '').trim();
const fila = rid => document.getElementById('pct_' + rid)?.closest('tr');
const btn = rid => fila(rid)?.querySelector('.ayuda-btn');
const caja = rid => fila(rid)?.querySelector('.ayuda-sub');
const abrirTodo = () => [...document.querySelectorAll('[id^=badge_]')].forEach(bd => {
  const tr = document.getElementById('pct_' + bd.id.slice(6) + '_0')?.closest('tr'); if (!tr || tr.offsetParent) return;
  let el = bd; for (let k = 0; k < 5 && el; k++) { if (el.getAttribute && el.getAttribute('onclick')) { el.click(); break; } el = el.parentElement; } });
const delAmbito = () => { const out = []; _hitosDelAmbito().forEach(p => p.items.forEach((_, i) => { if (_aplica(p.id, i)) out.push(p.id + '_' + i); })); return out; };
const ridDe = cod => { for (const h of PARTIDAS) { const i = (CODIGOS_SUB[h.id] || []).indexOf(cod); if (i >= 0) return h.id + '_' + i; } return null; };

// ── 1 ──
const codigos = [].concat(...PARTIDAS.map(h => CODIGOS_SUB[h.id]));
const sin = codigos.filter(c => !AYUDA_SUB[c] || AYUDA_SUB[c].length < 20), largas = codigos.filter(c => (AYUDA_SUB[c] || '').length > 190);
ok('1 · Las 91 subpartidas tienen su línea de «qué incluye», ninguna vacía ni de más de 190 caracteres, y ninguna con montos',
   codigos.length === 91 && sin.length === 0 && largas.length === 0 && !Object.values(AYUDA_SUB).some(t => /\$|Bs\b|USD/.test(t)), codigos.length + ' códigos · sin línea: ' + (sin.join(',') || 'ninguna'));

// ── 2 ──
await limpiar(); setAmbito('apartamento'); await esperar(200);
sel('fecha', '2026-10-02'); sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-07'); sel('piso', 'Piso 03'); put('apto', 'A'); abrirTodo(); await esperar(300);
const ap = delAmbito(), malAp = ap.filter(r => !btn(r) || !caja(r) || !caja(r).hidden || getComputedStyle(caja(r)).display !== 'none');
setAmbito('torre'); await esperar(200); abrirTodo(); await esperar(300);
const to = delAmbito(), malTo = to.filter(r => !btn(r) || !caja(r) || !caja(r).hidden);
ok('2 · Cada fila a la vista, en apartamento y en torre, trae su «?» con la ayuda cerrada', ap.length === 50 && malAp.length === 0 && to.length > 30 && malTo.length === 0,
   'apartamento ' + ap.length + ' filas, mal ' + malAp.length + ' · torre ' + to.length + ' filas, mal ' + malTo.length);

// ── 3 y 4 ──
setAmbito('apartamento'); await esperar(200); abrirTodo(); await esperar(200);
const R = ridDe('3.04');
btn(R).click(); await esperar(50);
const abierta = !caja(R).hidden && caja(R).offsetParent !== null && btn(R).getAttribute('aria-expanded') === 'true', texto = caja(R).textContent;
btn(R).click(); await esperar(50);
ok('3 · Tocar el «?» abre la línea debajo del nombre; tocarlo otra vez la cierra', abierta && caja(R).hidden && btn(R).getAttribute('aria-expanded') === 'false', 'abierta ' + abierta + ' · después cerrada ' + caja(R).hidden);
ok('4 · La línea es la de su código: «Canalizaciones» dice la tubería embutida con sus cajas y cajetines', /^Qué incluye: La tubería eléctrica embutida \(EMT o PVC\) con sus cajas y cajetines\.$/.test(texto) &&
   // v131: las filas «Ambos» con redacción propia para torre llevan las dos en la página (.ay-apto / .ay-torre); aquí vale la de apartamento.
   ap.every(r => { const m = r.match(/^(.*)_(\d+)$/); const sp = caja(r).querySelector('.ay-apto'); const txt = sp ? 'Qué incluye: ' + sp.textContent : caja(r).textContent; return txt === 'Qué incluye: ' + AYUDA_SUB[CODIGOS_SUB[m[1]][+m[2]]]; }), texto);

// ── 5 ──
const E = ridDe('4.01');
setEstado(document.querySelector(`.est-btn[data-rid="${E}"][data-v="50"]`), 50);
const antes5 = pct(E) + '/' + document.getElementById('total-num').textContent;
btn(E).click(); btn(R).click(); await esperar(100);
const d5 = JSON.stringify(getFormData());
ok('5 · Abrir ayudas no cambia el avance ni viaja en los datos', pct(E) + '/' + document.getElementById('total-num').textContent === antes5 && pct(E) === '50%' && !/Qué incluye|AYUDA|ayuda/.test(d5), antes5 + ' · datos sin ayuda: ' + !/Qué incluye/.test(d5));

// ── 6 ──
addRow('hito_cerramientos'); await esperar(100);
const extra = [...document.querySelectorAll('#extra_hito_cerramientos tr.extra-row')].pop();
ok('6 · Una fila agregada en campo no lleva «?»: no hay nada que explicar de ella', !!extra && !extra.querySelector('.ayuda-btn'), 'fila agregada: ' + !!extra);

// ── 7 y 8 ──
const ancho = window.innerWidth;
setAmbito('torre'); await esperar(200); abrirTodo(); await esperar(300);
const visT = delAmbito().filter(r => fila(r) && fila(r).offsetParent);
const fueraB = visT.filter(r => { const b = btn(r).getBoundingClientRect(); return b.left < 0 || b.right > ancho || b.width < 24; });
ok('7 · A ' + ancho + ' px el «?» queda dentro de la pantalla en todas las filas, también en los nombres largos del ascensor', visT.length > 30 && fueraB.length === 0,
   visT.length + ' filas · «?» fuera: ' + (fueraB.join(',') || 'ninguno'));
visT.forEach(r => { if (caja(r).hidden) btn(r).click(); }); await esperar(200);
const fueraC = visT.filter(r => { const c = caja(r).getBoundingClientRect(); return c.left < 0 || c.right > ancho + 1; });
ok('8 · Con todas las ayudas abiertas nada se sale ni ensancha la página', fueraC.length === 0 && document.documentElement.scrollWidth <= ancho + 1,
   'ayudas abiertas ' + visT.length + ' · fuera ' + fueraC.length + ' · scrollWidth ' + document.documentElement.scrollWidth + ' / ' + ancho);

// ── 9 ──
const todosB = [...document.querySelectorAll('.ayuda-btn')], todasC = [...document.querySelectorAll('.ayuda-sub')];
ok('9 · Ni el «?» ni la ayuda salen en el PDF: los dos son solo de pantalla', todosB.length >= 89 && todosB.every(b => b.classList.contains('solo-pantalla')) && todasC.every(c => c.classList.contains('solo-pantalla')),
   todosB.length + ' botones · ' + todasC.length + ' ayudas');

// ── 10 ──
setAmbito('apartamento'); await esperar(200);
currentEditingIndex = null; _idEnEdicion = null; saveDraft(true); await esperar(300);
await limpiar(); loadDraftData(0); await esperar(600); abrirTodo(); await esperar(200);
const abiertas10 = delAmbito().filter(r => caja(r) && !caja(r).hidden).length;
ok('10 · Un borrador reabre con todas las ayudas cerradas y con su medición', abiertas10 === 0 && pct(E) === '50%', 'abiertas ' + abiertas10 + ' · friso ' + pct(E));
