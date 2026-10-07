// TANDA 49 · V106 (1-oct-2026): filas agregadas en campo con porcentaje, y el botón «Tomar foto». En inspeccion.html.
// 1 la fila agregada pide «hechas de total» · 2 su % y el del hito · 3 lo que viaja · 4 el borrador · 5 sin total no hay %
// 6 cabe en la pantalla · 7 el botón de cámara pone la foto en el primer hueco · 8 la segunda va al siguiente y la galería sigue
// 9 con los seis huecos llenos avisa
localStorage.setItem('garmel_rol', 'inspector');
localStorage.setItem('garmel_clave_envio', 'qc');
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const put = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
const limpiar = async () => { Q.aceptar = true; nuevoFormulario(); await esperar(300); };
const pct = rid => (document.getElementById('pct_' + rid)?.innerText || '').trim();
const badge = h => (document.getElementById('badge_' + h)?.innerText || '').trim();
const aLaVista = id => { const e = document.getElementById(id); return !!e && e.offsetParent !== null; };
const abrir = pid => { const tr = document.getElementById('pr_' + pid + '_0')?.closest('tr'); if (tr && !tr.offsetParent && document.getElementById('p_' + pid).classList.contains('collapsed')) { /* la fila 0 puede ser de torre (oculta en apto); desde el QC de UX el primer hito viene abierto */ let el = document.getElementById('badge_' + pid); for (let k = 0; k < 5 && el; k++) { if (el.getAttribute && el.getAttribute('onclick')) { el.click(); break; } el = el.parentElement; } } };
const PID = 'hito_cerramientos';

await limpiar(); setAmbito('apartamento'); await esperar(200);
sel('fecha', '2026-10-01'); sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-07'); sel('piso', 'Piso 03'); put('apto', 'A');
abrir(PID); await esperar(200);
addRow(PID); addRow(PID);
const filas = [...document.querySelectorAll('#extra_' + PID + ' tr.extra-row')], r1 = filas[0].dataset.rid, r2 = filas[1].dataset.rid;

// ── 1. La fila agregada ──
ok('1 · Como inspector, la fila agregada muestra las dos casillas: «hechas» y «total»',
   currentMode === 'inspector' && aLaVista('ej_' + r1) && aLaVista('pr_' + r1) && document.getElementById('ej_' + r1).placeholder === 'hechas' &&
   document.getElementById('pr_' + r1).placeholder === 'total', 'ej ' + aLaVista('ej_' + r1) + ' · pr ' + aLaVista('pr_' + r1));

// ── 2. Su porcentaje ──
put('desc_' + r1, 'Pared 1 tabique interno'); put('ej_' + r1, '6'); put('pr_' + r1, '12');
put('desc_' + r2, 'Pared 2 tabique interno'); put('ej_' + r2, '10'); put('pr_' + r2, '10');
ok('2 · Pared 1: 6 de 12 da 50 %; pared 2: 10 de 10 da 100 %; el hito, con solo esas dos filas medidas, da 75 %',
   pct(r1) === '50%' && pct(r2) === '100%' && badge(PID) === '75%', pct(r1) + ' · ' + pct(r2) + ' · hito ' + badge(PID));

// ── 3. Lo que viaja ──
const d3 = getFormData(), ex = d3.partidas[PID + '_extra'];
ok('3 · En los datos viajan la descripción, lo hecho y el total de cada fila agregada',
   ex.length === 2 && ex[0].desc === 'Pared 1 tabique interno' && ex[0].ej === '6' && ex[0].pr === '12' && ex[1].pr === '10', JSON.stringify(ex));

// ── 4. El borrador ──
currentEditingIndex = null; _idEnEdicion = null; saveDraft(true); await esperar(300);
await limpiar(); loadDraftData(0); await esperar(500); abrir(PID); await esperar(200);
const f4 = [...document.querySelectorAll('#extra_' + PID + ' tr.extra-row')];
ok('4 · El borrador reabre con las dos filas, sus cantidades y sus porcentajes',
   f4.length === 2 && document.getElementById('pr_' + f4[0].dataset.rid).value === '12' && pct(f4[0].dataset.rid) === '50%' && badge(PID) === '75%',
   f4.length + ' filas · ' + pct(f4[0].dataset.rid) + ' · hito ' + badge(PID));

// ── 5. Sin total ──
addRow(PID); const r5 = [...document.querySelectorAll('#extra_' + PID + ' tr.extra-row')][2].dataset.rid;
put('ej_' + r5, '4');
ok('5 · Una fila agregada con lo hecho pero sin el total no inventa un porcentaje y no mueve el del hito', pct(r5) === '—' && badge(PID) === '75%', pct(r5) + ' · hito ' + badge(PID));

// ── 6. Maqueta ──
const tr6 = document.getElementById('row_' + r5).getBoundingClientRect();
ok('6 · Con filas agregadas, nada se sale a ' + innerWidth + ' px', document.documentElement.scrollWidth <= innerWidth + 1 && tr6.right <= innerWidth + 1, 'scrollWidth ' + document.documentElement.scrollWidth + ' · fila hasta ' + Math.round(tr6.right));

// ── 7 a 9. La cámara ──
const cam = document.querySelector('#p_' + PID + ' .btn-camara input');
const conFoto = () => [0, 1, 2, 3, 4, 5].filter(fi => { const i = document.getElementById('fimg_' + PID + '_' + fi); return i && i.style.display !== 'none' && i.getAttribute('src'); });
ok('7a · Cada hito tiene su botón «Tomar foto», que abre la cámara', !!cam && cam.getAttribute('capture') === 'environment' && /Tomar foto/.test(cam.closest('label').textContent) &&
   document.querySelectorAll('[id^="p_"] .btn-camara input').length === PARTIDAS.length, document.querySelectorAll('[id^="p_"] .btn-camara input').length + ' botones en los hitos (el de minutas, v116, va aparte)');
Q.ponerFotos(cam, [await Q.foto(800, 600, 1)]);
await hasta(() => conFoto().length === 1, 30000);
ok('7 · La foto tomada con la cámara cae en el primer hueco libre', conFoto().join() === '0', 'huecos con foto: ' + conFoto().join());
Q.ponerFotos(document.querySelector('#fslot_' + PID + '_3 input'), [await Q.foto(800, 600, 2)]);
await hasta(() => conFoto().length === 2, 30000);
await esperar(1700);
Q.ponerFotos(cam, [await Q.foto(800, 600, 3)]);
await hasta(() => conFoto().length === 3, 30000);
ok('8 · La galería sigue funcionando en cada hueco (foto en el 4.º) y la siguiente de la cámara va al segundo', conFoto().join() === '0,1,3', 'huecos con foto: ' + conFoto().join());
for (const fi of [2, 4, 5]) { await esperar(1700); Q.ponerFotos(cam, [await Q.foto(640, 480, 10 + fi)]); await hasta(() => conFoto().indexOf(fi) >= 0, 30000); }
Q.dialogos.length = 0; await esperar(1700);
Q.ponerFotos(cam, [await Q.foto(640, 480, 99)]); await esperar(800);
ok('9 · Con los seis huecos llenos, la cámara avisa y no pisa ninguna foto', conFoto().length === 6 && /ya tiene sus 6 fotos/.test(Q.dialogos.join()), conFoto().length + ' fotos · ' + Q.dialogos.join(' / ').slice(0, 80));
