// TANDA 138 · cambio 198 (27-oct-2026): «🔁 Repetir en otros apartamentos». En inspeccion.html?prueba=1, a 375 px y A LA VISTA.
// 1 el botón está bajo el apartamento, y se esconde en torre · 2 con lista (Ezequiel Zamora) ofrece los otros tres del piso, no el de
// pantalla · 3 marcar tres guarda tres copias con su número, su apartamento, `repetidoDe` y lo mismo medido; el de pantalla sigue en
// edición · 4 las fotos de la copia van a IndexedDB con su propio id · 5 repetir otra vez no duplica: lo dice y no deja guardar ·
// 6 sin lista (Simón Rodríguez) se escriben: «b10, c10 C10 A10 d10» da B10 C10 D10 · 7 abrir una copia la trae con su apartamento,
// lo medido y la foto · 8 «Enviar todos» manda cada copia con su número y su foto · 9 en blanco o sin apartamento no repite: lo dice ·
// 10 nada se sale a 375 px y los botones miden 44 px.
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem('garmel_reports_list', '[]');
await Q.relevo({ caido: false, fallar: [], lento: 0, colgar: 0, perder: false, borrar: true });
Q.aceptar = true;
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const put = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); };
const apto = v => { const a = document.getElementById('apto-sel'); if (a && a.style.display !== 'none') { a.value = v; a.dispatchEvent(new Event('change', { bubbles: true })); } else put('apto', v); };
const rid = cod => { for (const h of PARTIDAS) { const i = (CODIGOS_SUB[h.id] || []).indexOf(cod); if (i >= 0) return h.id + '_' + i; } };
const mide = (cod, pr, ej) => { const r = rid(cod), a = document.getElementById('pr_' + r), b = document.getElementById('ej_' + r); a.value = pr; b.value = ej; recalcRow(a); b.dispatchEvent(new Event('input', { bubbles: true })); };
const cabecera = async (conv, torre, piso, a) => {
  nuevoFormulario(); await esperar(300); setAmbito('apartamento'); await esperar(200);
  sel('fecha', '2026-10-27'); sel('convenio', conv); sel('torre', torre); await esperar(300); sel('piso', piso); apto(a); await esperar(900);
  { const x = document.getElementById('aviso-anterior'); if (x) x.innerHTML = ''; }
  const ins = document.querySelector('.inspector-select'); Q.elegir(ins, [...ins.options].map(o => o.value).filter(Boolean)[0]);
  if (!document.querySelector('#estatus .ck-lbl.on')) document.querySelector('#estatus .ck-lbl').click();
};
// ── 1 ──
await cabecera('Convenio Bielorrusos', 'T-07', 'Piso 03', 'B2');
const b1 = document.getElementById('btn-repetir');
const visible1 = !!b1 && b1.offsetParent !== null && !!b1.closest('*') && b1.previousElementSibling && b1.previousElementSibling.id === 'apto-sel';
setAmbito('torre'); await esperar(200); const oculto1 = b1.offsetParent === null; setAmbito('apartamento'); await esperar(300);
ok('1 · El botón está bajo el apartamento y se esconde en torre', visible1 && oculto1 && b1.offsetParent !== null, 'visible ' + visible1 + ' · en torre oculto ' + oculto1);
// ── 2 ──
mide('3.01', '6', '4'); mide('2.01', '10', '10');
const inp = [...document.querySelectorAll('input[type=file]')].find(i => /cerramientos/.test((i.closest('[id]') || {}).id || '')) || document.querySelector('input[type=file]');
Q.ponerFotos(inp, [await Q.foto(1200, 900, 138)]); await esperar(1500);
saveDraft(true); await esperar(300);
const idOrig = getFormData().id, nroOrig = getFormData().nro;
b1.click(); await esperar(200);
const ofrece = $$('#repetir-modal .repetir-lista input').map(i => i.value);
ok('2 · Con lista ofrece los otros tres del piso (A1, A2, B1), no B2', ofrece.join(',') === 'A1,A2,B1', ofrece.join(','));
// ── 3 ──
$$('#repetir-modal .repetir-lista input').forEach(i => { i.checked = true; i.dispatchEvent(new Event('change', { bubbles: true })); });
const rot3 = $('#repetir-si').textContent;
$('#repetir-si').click(); await esperar(800);
const L3 = getSavedReports(), copias = L3.filter(b => b.repetidoDe === nroOrig);
const igual = c => JSON.stringify(c.partidas) === JSON.stringify(L3.find(b => b.id === idOrig).partidas);
ok('3 · Tres copias con su número, apartamento, repetidoDe y lo mismo medido; el de pantalla sigue en edición',
   rot3 === 'Guardar 3 copias' && copias.length === 3 && copias.map(c => c.apto).sort().join(',') === 'A1,A2,B1' &&
   copias.every(c => c.nro === nroOrig.replace('-P03AB2-', '-P03A' + c.apto + '-') && c.id !== idOrig && igual(c) && !c.enviado) &&
   getSavedReports()[currentEditingIndex].id === idOrig && getFormData().apto === 'B2',
   rot3 + ' · ' + copias.map(c => c.nro).join(' '));
// ── 4 ──
const f4 = await _fotosGet(copias[0].id), fo = await _fotosGet(idOrig);
const n4 = f4 ? Object.values(f4).flat().filter(s => _esDato(s)).length : -1;
ok('4 · La foto de la copia está en IndexedDB con su propio id', copias.every(c => c.fotosEnIdb) && n4 === 1 && !!fo, 'fotos de la copia ' + n4);
// ── 5 ──
b1.click(); await esperar(200);
const a5 = $$('#repetir-modal .repetir-lista input').find(i => i.value === 'A1'); a5.checked = true; a5.dispatchEvent(new Event('change', { bubbles: true }));
ok('5 · Repetir otra vez en A1: dice que ya hay y no deja guardar', $('#repetir-si').disabled && /Ya hay informe de A1/.test($('#repetir-van').textContent), $('#repetir-van').textContent);
$('#repetir-no').click(); await esperar(100);
// ── 6 ──
await cabecera('Convenio Rusos', 'T-04', 'Piso 10', 'A10');
mide('2.01', '20', '0'); saveDraft(true); await esperar(300);
const nro6 = getFormData().nro;
b1.click(); await esperar(200);
const t6 = $('#repetir-txt'); t6.value = 'b10, c10 C10 A10 d10'; t6.dispatchEvent(new Event('input', { bubbles: true }));
const van6 = $('#repetir-van').textContent;
$('#repetir-si').click(); await esperar(800);
const c6 = getSavedReports().filter(b => b.repetidoDe === nro6).map(b => b.apto).sort();
ok('6 · Sin lista se escriben: «b10, c10 C10 A10 d10» guarda B10, C10 y D10', !!t6 && c6.join(',') === 'B10,C10,D10' && /3 copia/.test(van6), van6 + ' → ' + c6.join(','));
// ── 7 ──
const posC = getSavedReports().findIndex(b => b.repetidoDe === nroOrig && b.apto === 'A2');
loadDraftData(posC); await esperar(1500);
const fimg = $$('img[id^="fimg_"]').filter(im => im.src && im.src.indexOf('data:') === 0).length;
ok('7 · Abrir la copia A2 la trae con su apartamento, lo medido y la foto',
   getFormData().apto === 'A2' && document.getElementById('ej_' + rid('3.01')).value === '4' && fimg === 1 && /-P03AA2-/.test(getFormData().nro),
   getFormData().apto + ' · ej ' + document.getElementById('ej_' + rid('3.01')).value + ' · fotos ' + fimg);
// ── 8 ──
nuevoFormulario(); await esperar(300);
const env0 = (await Q.envios()).length;
Q.dialogos = []; await enviarPendientes(); await hasta(() => !_tandaEnCurso, 60000); await esperar(800);
const env = (await Q.envios()).slice(env0).filter(e => e.numero);
const deEZ = env.filter(e => /EZ-T07-P03A/.test(e.numero));
ok('8 · «Enviar todos» manda cada copia con su número y su foto',
   ['A1', 'A2', 'B1', 'B2'].every(a => deEZ.some(e => e.numero.indexOf('-P03A' + a + '-') > 0 && (e.fotos || []).length === 1)) && env.some(e => /-P10AD10-/.test(e.numero)),
   env.map(e => e.numero + ':' + (e.fotos || []).length).join(' '));
// ── 9 ──
nuevoFormulario(); await esperar(300); setAmbito('apartamento'); await esperar(200);
Q.dialogos = []; abrirRepetir(); const d9a = Q.dialogos.slice();
sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-07'); await esperar(300); sel('piso', 'Piso 05'); apto('A1'); await esperar(600);
Q.dialogos = []; abrirRepetir(); const d9b = Q.dialogos.slice();
const abierto9 = $('#repetir-modal') && $('#repetir-modal').style.display === 'flex';
ok('9 · Sin apartamento lo pide; en blanco pide llenarlo primero; el panel no se abre', /elija .*apartamento/.test(d9a.join(' ')) && /no tiene nada medido/.test(d9b.join(' ')) && !abierto9, d9a.concat(d9b).join(' | ').slice(0, 200));
// ── 10 ──
await cabecera('Convenio Bielorrusos', 'T-07', 'Piso 06', 'A1'); mide('2.01', '5', '5'); saveDraft(true);
b1.click(); await esperar(200);
const altos = $$('#repetir-modal .repetir-lista label, #repetir-modal .m-btn').map(e => Math.round(e.getBoundingClientRect().height));
ok('10 · Nada se sale a 375 px y todo lo que se toca mide 44 px o más', document.documentElement.scrollWidth <= innerWidth + 1 && altos.every(h => h >= 44) && b1.getBoundingClientRect().height >= 44,
   document.documentElement.scrollWidth + ' / ' + innerWidth + ' · ' + altos.join(','));
$('#repetir-no').click(); nuevoFormulario(); localStorage.setItem('garmel_reports_list', '[]');
