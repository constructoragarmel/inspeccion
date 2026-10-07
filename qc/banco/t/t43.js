// V100 (1-oct-2026): diez QC más de las subpartidas nuevas. Ocho aquí, en inspeccion.html; se corre a 320×640 (el
// ancho más angosto) y las comprobaciones de cálculo valen igual que a 375. Las otras dos (9 y 10) son del relevo y
// se corren en `relevo/index.html` del banco (ver qc/README.md).
// 1 cada fila nueva tiene el control de su forma de medir · 2 % del hito 1 con las nuevas · 3 N/A en una nueva
// 4 «opcional» con el presupuesto de la torre · 5 cambiar de ámbito con filas nuevas · 6 borrador de antes de la v100
// 7 «usar las cantidades» de una visita vieja · 8 a 320 px nada se sale
localStorage.setItem('garmel_rol', 'inspector');
localStorage.setItem('garmel_clave_envio', 'qc');
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const put = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
const limpiar = async () => { Q.aceptar = true; nuevoFormulario(); await esperar(300); };
const pct = rid => (document.getElementById('pct_' + rid)?.innerText || '').trim();
const badge = h => (document.getElementById('badge_' + h)?.innerText || '').trim();
const est = (rid, v) => setEstado(document.querySelector(`.est-btn[data-rid="${rid}"][data-v="${v}"]`), v);
const cabecera = (torre, empresa) => {
  if (!document.getElementById('fecha').value) sel('fecha', '2026-10-01');
  sel('convenio', 'Convenio Bielorrusos'); sel('torre', torre || 'T-07');
  const emp = [...document.getElementById('empresa').options].map(o => o.value);
  sel('empresa', emp.find(x => (empresa || /ALNAVIC/i).test(x)) || emp[1]);
  const insp = document.querySelector('.inspector-select');
  insp.value = [...insp.options].map(o => o.value).filter(Boolean)[0]; insp.dispatchEvent(new Event('change', { bubbles: true }));
  const res = document.querySelector('#residentes-container input'); if (res) put(res.id || (res.id = 'res0'), 'Ing. Prueba');
  if (!document.querySelector('#estatus .ck-lbl.on')) document.querySelector('#estatus .ck-lbl').click();
};
const NUEVAS = { '1.04': 'estado', '1.05': 'estado', '1.06': 'estado', '4.13': 'estado', '5.07': 'pza', '5.08': 'pza',
                 '7.08': 'estado', '7.09': 'pza', '8.08': 'estado', '8.09': 'estado', '9.05': 'sino', '9.06': 'sino', '10.08': 'estado' };
const ridDe = cod => { for (const h of PARTIDAS) { const i = (CODIGOS_SUB[h.id] || []).indexOf(cod); if (i >= 0) return h.id + '_' + i; } return null; };
const tipoEnPantalla = rid => document.querySelector(`.est-btn[data-rid="${rid}"][data-sn]`) ? 'sino'
  : document.querySelector(`.est-btn[data-rid="${rid}"][data-v]`) ? 'estado'
  : (document.getElementById('pr_' + rid) && document.getElementById('ej_' + rid)) ? 'pza' : '?';

// ── 1. Cada fila nueva con su control ──
await limpiar(); setAmbito('torre'); await esperar(200); cabecera();
const malT = [], vistos = {};
Object.keys(NUEVAS).forEach(c => { const rid = ridDe(c); const m = rid && rid.match(/^(.*)_(\d+)$/);
  if (m && _aplica(m[1], +m[2])) { vistos[c] = 1; if (tipoEnPantalla(rid) !== NUEVAS[c]) malT.push(c + '=' + tipoEnPantalla(rid)); } });
setAmbito('apartamento'); await esperar(200);
Object.keys(NUEVAS).forEach(c => { const rid = ridDe(c); const m = rid && rid.match(/^(.*)_(\d+)$/);
  if (m && _aplica(m[1], +m[2])) { vistos[c] = 1; if (tipoEnPantalla(rid) !== NUEVAS[c]) malT.push(c + '=' + tipoEnPantalla(rid)); } });
ok('1 · Las 13 filas nuevas aparecen en algún ámbito y cada una con su control (estado, Sí / No o puestas de hay)',
   Object.keys(vistos).length === 13 && malT.length === 0, Object.keys(vistos).length + ' vistas · mal: ' + (malT.join(', ') || 'ninguna'));

// ── 2. % del hito 1 ──
await limpiar(); setAmbito('torre'); await esperar(200); cabecera();
est(ridDe('1.04'), 100); est(ridDe('1.05'), 50);
ok('2 · Hito 1 con obras preliminares 100 % y escaleras (suministro) 50 %: el hito da 75 %',
   pct(ridDe('1.04')) === '100%' && pct(ridDe('1.05')) === '50%' && badge('hito_estructura') === '75%',
   pct(ridDe('1.04')) + ' · ' + pct(ridDe('1.05')) + ' · hito ' + badge('hito_estructura'));

// ── 3. N/A en una fila nueva ──
est('hito_exteriores_1', 100); est(ridDe('10.08'), 0);
const b3a = badge('hito_exteriores');
setEv(document.querySelector(`.ev-btn.NA[data-rid="${ridDe('10.08')}"]`)); await esperar(100);
const b3b = badge('hito_exteriores');
ok('3 · N/A en «Fachada de vidrio y locales de PB» la saca del promedio del hito 10 (50 % → 100 %)',
   b3a === '50%' && b3b === '100%', b3a + ' → ' + b3b);

// ── 4. «Opcional» según el presupuesto de la torre ──
await limpiar(); setAmbito('torre'); await esperar(200); cabecera('T-56', /TEPUY/i);
await hasta(() => _presupuestoTorre && _presupuestoTorre.codigos, 8000, 200); await esperar(300);
const opc = c => !!document.getElementById('pct_' + ridDe(c))?.closest('tr')?.classList.contains('fuera-presupuesto');
ok('4 · T-56: lo que no está en su presupuesto (preliminares, calentadores) sale «opcional»; el ascensor y la fachada de PB no',
   opc('1.04') && opc('7.08') && !opc('9.05') && !opc('10.08') && !opc('12.02'),
   '1.04 ' + opc('1.04') + ' · 7.08 ' + opc('7.08') + ' · 9.05 ' + opc('9.05') + ' · 10.08 ' + opc('10.08') + ' · 12.02 ' + opc('12.02'));

// ── 5. Cambiar de ámbito con filas nuevas ──
await limpiar(); setAmbito('apartamento'); await esperar(200); cabecera(); sel('piso', 'Piso 03'); put('apto', 'A');
est(ridDe('4.13'), 75);                                           // piso de cemento: los dos
put('pr_' + ridDe('5.08'), '4'); put('ej_' + ridDe('5.08'), '2');   // carpintería metálica: solo apartamento
setAmbito('torre'); await esperar(200);
const d5 = getFormData();
const r413 = d5.partidas.hito_acabados[12] || {}, r508 = d5.partidas.hito_puertas[7] || {};
ok('5 · De apartamento a torre: el piso de cemento sigue en 75 %; la carpintería metálica viaja fuera de ámbito',
   pct(ridDe('4.13')) === '75%' && r413.ej === '75' && !r413.fueraDeAmbito && r508.fueraDeAmbito === true,
   'piso ' + pct(ridDe('4.13')) + ' · 5.08 fueraDeAmbito=' + r508.fueraDeAmbito);

// ── 6. Un borrador de antes de la v100 ──
await limpiar(); setAmbito('torre'); await esperar(200); cabecera();
currentEditingIndex = null; _idEnEdicion = null; saveDraft(true); await esperar(300);
{ const _l = JSON.parse(localStorage.getItem('garmel_reports_list') || '[]'); if (!_l.length) { _l.unshift(getFormData()); localStorage.setItem('garmel_reports_list', JSON.stringify(_l)); } }   /* 176: un informe en blanco ya no se guarda solo; la tanda siembra el borrador viejo a mano */
const lst = JSON.parse(localStorage.getItem('garmel_reports_list') || '[]');
const E = v => ({ pr: '100', ej: String(v), ev: '', ud: 'estado', sn: '', pct: '' });
lst[0].partidas.hito_ascensor = [E(25), E(50), E(75), E(100)];      // la v99 tenía 4 filas
localStorage.setItem('garmel_reports_list', JSON.stringify(lst));
await limpiar(); await esperar(200); loadDraftData(0); await esperar(500);
ok('6 · Un borrador de la v99 (ascensor con 4 filas) abre con sus 4 mediciones en su lugar y las 2 nuevas vacías',
   ['25%', '50%', '75%', '100%'].every((v, i) => pct('hito_ascensor_' + i) === v) && pct('hito_ascensor_4') === '—' && pct('hito_ascensor_5') === '—',
   [0, 1, 2, 3, 4, 5].map(i => pct('hito_ascensor_' + i)).join(' '));

// ── 7. «Usar las cantidades» de una visita vieja ──
await limpiar(); setAmbito('torre'); await esperar(200); cabecera();
const C = (e, p) => ({ pr: p, ej: e, ev: '', ud: 'pza', sn: '', pct: '' });
_traerMediciones({ hito_contra_incendio: [E(50), C('2', '4'), C('6', '6'), E(75), C('0', '1')] }, true); await esperar(300);
const hay0 = document.getElementById('pr_hito_contra_incendio_0').value, hay1 = document.getElementById('pr_hito_contra_incendio_1').value;
const puestas0 = document.getElementById('ej_hito_contra_incendio_0').value;
ok('7 · «Usar las cantidades» de una visita con el hito 12 viejo trae el «hay» de gabinetes (4) y extintores (6), sin las puestas',
   hay0 === '4' && hay1 === '6' && puestas0 === '', 'gabinetes hay=' + hay0 + ' puestas=«' + puestas0 + '» · extintores hay=' + hay1);

// ── 8. A 320 px nada se sale ──
await limpiar(); setAmbito('torre'); await esperar(200); cabecera();
// Abre cada hito cerrado tocando su encabezado (el elemento con onclick por encima del % del hito).
[...document.querySelectorAll('[id^=badge_]')].forEach(bd => {
  const tr = document.getElementById('pct_' + bd.id.slice(6) + '_0')?.closest('tr');
  if (!tr || tr.offsetParent) return;
  let el = bd; for (let k = 0; k < 5 && el; k++) { if (el.getAttribute && el.getAttribute('onclick')) { el.click(); break; } el = el.parentElement; }
});
await esperar(300);
const ancho = window.innerWidth;
const visibles = Object.keys(NUEVAS).map(ridDe).filter(rid => document.getElementById('pct_' + rid)?.closest('tr')?.offsetParent);
const salidas = Object.keys(NUEVAS).map(ridDe).filter(Boolean).filter(rid => {
  const tr = document.getElementById('pct_' + rid)?.closest('tr'); if (!tr || !tr.offsetParent) return false;
  return tr.getBoundingClientRect().right > ancho + 1;
});
ok('8 · A ' + ancho + ' px las filas nuevas (los nombres largos de extractores y calentadores) no ensanchan la página',
   visibles.length >= 11 && document.documentElement.scrollWidth <= ancho + 1 && salidas.length === 0,
   visibles.length + ' filas nuevas a la vista · scrollWidth ' + document.documentElement.scrollWidth + ' / ' + ancho + ' · se salen: ' + (salidas.join(',') || 'ninguna'));
