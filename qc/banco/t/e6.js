// ESTRÉS 6 · cambio 198 (27-oct-2026): «Repetir en otros apartamentos» apretado (inspeccion.html?prueba=1, 375 px, a la vista).
// a treinta copias con tres fotos: en menos de 3 s, todas con su número distinto y sus fotos en IndexedDB · b treinta y uno no deja
// guardar y lo dice · c repetir uno abierto «para corregir» desde la oficina (con revisión y versión definitiva): las copias salen
// como borradores nuevos, sin esas marcas · d lo escrito raro («<b>X1</b>», «a-1», espacios; la «/» también separa) se limpia como el
// campo del apartamento y no se cuela HTML · e seguir editando el original después de repetir no toca las copias · f dos toques seguidos a
// «Guardar» no hacen copias dobles.
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem('garmel_reports_list', '[]');
await Q.relevo({ caido: false, fallar: [], lento: 0, colgar: 0, perder: false, borrar: true });
Q.aceptar = true;
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const put = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); };
const rid = cod => { for (const h of PARTIDAS) { const i = (CODIGOS_SUB[h.id] || []).indexOf(cod); if (i >= 0) return h.id + '_' + i; } };
const mide = (cod, pr, ej) => { const r = rid(cod), a = document.getElementById('pr_' + r), b = document.getElementById('ej_' + r); a.value = pr; b.value = ej; recalcRow(a); b.dispatchEvent(new Event('input', { bubbles: true })); };
const cabecera = async (piso, a) => {
  nuevoFormulario(); await esperar(300); setAmbito('apartamento'); await esperar(200);
  sel('fecha', '2026-10-27'); sel('convenio', 'Convenio Rusos'); sel('torre', 'T-04'); await esperar(300); sel('piso', piso); put('apto', a); await esperar(900);
  { const x = document.getElementById('aviso-anterior'); if (x) x.innerHTML = ''; }
  const ins = document.querySelector('.inspector-select'); Q.elegir(ins, [...ins.options].map(o => o.value).filter(Boolean)[0]);
  if (!document.querySelector('#estatus .ck-lbl.on')) document.querySelector('#estatus .ck-lbl').click();
};
const escribir = t => { const x = $('#repetir-txt'); x.value = t; x.dispatchEvent(new Event('input', { bubbles: true })); };
// ── a ──
await cabecera('Piso 09', 'A9'); mide('2.01', '10', '7');
for (let k = 0; k < 3; k++) { Q.ponerFotos(document.querySelector('#fslot_hito_cerramientos_' + k + ' input[type=file]'), [await Q.foto(1200, 900, 600 + k)]); await esperar(1500); }
saveDraft(true); await esperar(300);
const nroA = getFormData().nro;
const treinta = []; for (let p = 1; p <= 30; p++) treinta.push('X' + p);
abrirRepetir(); escribir(treinta.join(' '));
const t0 = performance.now(); $('#repetir-si').click(); const ms = performance.now() - t0; await esperar(1500);
const cA = getSavedReports().filter(b => b.repetidoDe === nroA);
const idb = await Promise.all(cA.slice(0, 30).map(c => _fotosGet(c.id).then(f => f ? Object.values(f).flat().filter(s => _esDato(s)).length : 0)));
ok('a · Treinta copias con tres fotos en menos de 3 s, números distintos y fotos en IndexedDB',
   ms < 3000 && cA.length === 30 && new Set(cA.map(c => c.nro)).size === 30 && idb.every(n => n === 3),
   Math.round(ms) + ' ms · ' + cA.length + ' · fotos ' + [...new Set(idb)].join(','));
// ── b ──
abrirRepetir(); const t31 = []; for (let p = 1; p <= 31; p++) t31.push('Y' + p); escribir(t31.join(','));
ok('b · Treinta y uno no deja guardar y lo dice', $('#repetir-si').disabled && /como mucho 30/.test($('#repetir-van').textContent), $('#repetir-van').textContent.slice(0, 60));
$('#repetir-no').click();
// ── c ──
localStorage.setItem('garmel_reports_list', '[]');
await cabecera('Piso 07', 'C7'); mide('2.01', '10', '3'); saveDraft(true); await esperar(200);
{ const L = getSavedReports(); L[0].oficina = { numero: L[0].nro, revision: 2, abierto: 'ayer' }; L[0].definitiva = { desde: L[0].nro, fecha: '2026-10-27', por: 'X' }; L[0].enviado = 'antes'; localStorage.setItem('garmel_reports_list', JSON.stringify(L)); loadDraftData(0); await esperar(1200); }
const nroC = getFormData().nro;
abrirRepetir(); escribir('D7'); $('#repetir-si').click(); await esperar(600);
const cC = getSavedReports().find(b => b.repetidoDe === nroC);
ok('c · Repetir uno abierto desde la oficina: la copia es un borrador nuevo, sin revisión, definitiva ni enviado',
   !!cC && !cC.oficina && !cC.definitiva && !cC.enviado && cC.apto === 'D7', JSON.stringify(cC && { o: cC.oficina, d: cC.definitiva, e: cC.enviado, a: cC.apto }));
// ── d ──
abrirRepetir(); escribir('<b>X1</b> a-1  e 7');
const van = $('#repetir-van').textContent, html = $('#repetir-van').innerHTML;
ok('d · Lo escrito raro se limpia como el campo del apartamento y no se cuela HTML', /BX1 · B · A1 · E · 7/.test(van) && !/<b>/.test(html), van);
$('#repetir-no').click();
// ── e ──
const antes = JSON.stringify(cC.partidas);
mide('2.01', '10', '9'); saveDraft(true); autoguardar(); await esperar(400);
const cE = getSavedReports().find(b => b.id === cC.id), orig = getSavedReports().find(b => b.nro === nroC && !b.repetidoDe);
ok('e · Editar el original después de repetir no toca la copia', JSON.stringify(cE.partidas) === antes && JSON.stringify(orig.partidas) !== antes);
// ── f ──
abrirRepetir(); escribir('F7 G7'); const si = $('#repetir-si'); si.click(); si.click(); await esperar(600);
const f7 = getSavedReports().filter(b => /-P07AF7-/.test(b.nro)).length, g7 = getSavedReports().filter(b => /-P07AG7-/.test(b.nro)).length;
ok('f · Dos toques seguidos a «Guardar» no hacen copias dobles', f7 === 1 && g7 === 1, 'F7 ' + f7 + ' · G7 ' + g7);
nuevoFormulario(); localStorage.setItem('garmel_reports_list', '[]');
