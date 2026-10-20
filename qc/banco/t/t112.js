// TANDA 112 · v180 (20-oct-2026, cambio 192): lo que no debe salir en «Enviar todos», en obra (`inspeccion.html?prueba=1`).
// Reproduce el teléfono del 20-oct: 8 borradores de la T-16 (Ezequiel Zamora, A1 A2 B1 B2) con fecha 5-oct hechos el 13-oct,
// tres con el apartamento a medias («A», «B», «B-1») y uno sin nada medido, más uno de hoy bien hecho. Sin datos reales.
// La fecha se pregunta al elegirla en el selector (t114); aquí se comprueba que ni guardar ni enviar la vuelven a preguntar.
// 1 «Enviar todos» no pregunta la fecha, manda los que están bien (con «B-1» ya como «B1») y deja fuera «A», «B» y el vacío
// diciendo por qué · 2 los que no salieron siguen en el teléfono sin enviar · 3 las marcas en «Informes» (vacío, apartamento)
// caben a 375 px y el de hoy no lleva ninguna · 4 «Guardar» con «A» guarda, avisa que así no se envía y no pregunta la fecha ·
// 5 «Enviar» de uno con «A» no sale · 6 uno vacío enviado solo pregunta y con «Cancelar» no sale · 7 al abrir el de «B-1» se
// ve «B1» en la lista · 8 en una torre sin lista «A» pasa, en la T-16 «C1» pasa y «4B» no · 9 un informe de torre sin nada
// medido es vacío y con un % no · 10 la lista para la oficina dice por qué no salen.
localStorage.clear();
localStorage.setItem('garmel_rol', 'inspector');
localStorage.setItem('garmel_clave_envio', 'qc');
Q.aceptar = true;
const put = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const lista = () => JSON.parse(localStorage.getItem('garmel_reports_list') || '[]');
const poner = l => { localStorage.setItem('garmel_reports_list', JSON.stringify(l)); currentEditingIndex = null; _idEnEdicion = null; };
const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const HOY = iso(new Date());
const C13 = new Date(2026, 9, 13, 10, 0).getTime();
const limpio = a => String(a).toUpperCase().replace(/[^A-Z0-9]/g, '');

// Un borrador de verdad, hecho en pantalla, como molde.
await Q.relevo({ caido: false, fallar: [], lento: 0, colgar: 0, perder: false, borrar: true });
nuevoFormulario(); await esperar(300); setAmbito('apartamento');
sel('fecha', HOY); sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-16');
{ const emp = [...document.getElementById('empresa').options].map(o => o.value); sel('empresa', emp.find(x => /PROCODIMA/i.test(x)) || emp[1]); }
{ const insp = document.querySelector('.inspector-select'); insp.value = [...insp.options].map(o => o.value).filter(Boolean)[0]; insp.dispatchEvent(new Event('change', { bubbles: true })); }
sel('piso', 'Piso 01'); put('apto', 'A1'); _aptoDesdeLista && sel('apto-sel', 'A1');
if (!document.querySelector('#estatus .ck-lbl.on')) document.querySelector('#estatus .ck-lbl').click();
await esperar(900); document.querySelector('#aviso-anterior .no')?.click();
put('pr_hito_acc_electricos_0', '6'); put('ej_hito_acc_electricos_0', '3');
clearTimeout(_tempAutoguardado); currentEditingIndex = null; _idEnEdicion = null; saveDraft(true);
const molde = lista()[0];
ok('0 · El molde se guardó en la T-16 con su medición', !!molde && molde.torre === 'T-16' && molde.partidas && molde.partidas.hito_acc_electricos,
   molde ? molde.torre + ' ' + molde.apto : 'sin molde');
const hacer = (i, apto, piso, o) => {
  const b = JSON.parse(JSON.stringify(molde));
  Object.assign(b, { id: 'draft_' + (C13 + i * 60000), fecha: '2026-10-05', apto: apto, piso: piso || 'Piso 01', enviado: undefined, timestamp: '13/10/2026, 10:0' + i },
                o || {});
  b.nro = 'PRUEBA-EZ-T16-P' + (b.piso === 'Piso 02' ? '02' : '01') + 'A' + limpio(apto) + '-261005-QC';
  return b;
};
const vacio = b => { b.partidas = JSON.parse(JSON.stringify(b.partidas)); Object.keys(b.partidas).forEach(k => { const v = b.partidas[k];
  if (Array.isArray(v)) v.forEach(f => { if (f) { f.ej = ''; f.ev = ''; f.sn = ''; f.pct = ''; } }); }); return b; };
const telefono = () => [
  hacer(1, 'A1'), hacer(2, 'A2'), hacer(3, 'A'), hacer(4, 'B'), hacer(5, 'B-1'), vacio(hacer(6, 'B2')), hacer(7, 'A1', 'Piso 02'), hacer(8, 'A2', 'Piso 02'),
  Object.assign(JSON.parse(JSON.stringify(molde)), { id: 'draft_' + (Date.now() - 60000), apto: 'B2', nro: 'PRUEBA-EZ-T16-P01AB2-' + HOY.slice(2).replace(/-/g, '') + '-HOY' })
];

// 1-2 · «Enviar todos» con «Aceptar» en todo
poner(telefono()); nuevoFormulario(); await esperar(200);
let envAntes = (await Q.envios()).length;
Q.dialogos = []; await enviarPendientes(); await hasta(() => !_tandaEnCurso, 30000); await esperar(400);
let env = (await Q.envios()).slice(envAntes).filter(e => e.numero);
const nums = env.map(e => e.numero).sort();
const b1 = env.find(e => /P01AB1/.test(e.numero));
ok('1 · Sin preguntar la fecha salen 6 (A1, A2, B-1 como B1, P02 A1, P02 A2 y el de hoy); «A», «B» y el vacío no, y se dice por qué',
   !Q.dialogos.some(d => /fecha que eligió|¿Seguro/.test(d)) && env.length === 6 && !!b1 && b1.datos.apto === 'B1' &&
   !nums.some(n => /P01AA-|P01AB-|P01AB2-261005/.test(n)) &&
   Q.dialogos.some(d => /Se van a enviar 6/.test(d) && /corregir el apartamento «A»: en la T-16 son A1, A2, B1, B2/.test(d) && /«B»/.test(d) && /medir algo — está vacío/.test(d)),
   nums.join(',') + ' · ' + (Q.dialogos.find(d => /Se van a enviar/.test(d)) || '').replace(/\n/g, ' ').slice(0, 300));
const quedan = lista().filter(b => !b.enviado).map(b => b.apto).sort().join(',');
ok('2 · Siguen en el teléfono sin enviar «A», «B» y el vacío (B2); el «B-1» quedó guardado como «B1»', quedan === 'A,B,B2' && lista().some(b => b.apto === 'B1' && b.enviado), quedan);

// 3 · Las marcas en «Informes»
poner(telefono()); openSavedModal(); await esperar(400);
const cards = [...document.querySelectorAll('#savedListContent .saved-item')];
const marcasDe = apto => { const i = lista().findIndex(b => b.apto === apto && b.piso === 'Piso 01' && !/HOY/.test(b.nro)); return cards[i] ? [...cards[i].querySelectorAll('.marca192')].map(s => s.textContent) : null; };
const hoyCard = cards[lista().findIndex(b => /HOY/.test(b.nro))];
const anchoBien = cards.every(c => c.scrollWidth <= c.clientWidth + 1) && document.querySelector('#savedOverlay .modal').scrollWidth <= document.querySelector('#savedOverlay .modal').clientWidth + 1;
ok('3 · Marcas: el vacío dice «Vacío, no se envía», el de «A» qué apartamentos hay, el de A2 (bien) ninguna, el de hoy ninguna; nada se sale a ' + innerWidth + ' px',
   (marcasDe('B2') || []).some(t => /Vacío, no se envía/.test(t) && /🗑️ Borrar/.test(t)) && (marcasDe('A') || []).some(t => /«A».*A1, A2, B1, B2/.test(t)) &&
   (marcasDe('A2') || ['x']).length === 0 && hoyCard && !hoyCard.querySelector('.marca192') && anchoBien,
   JSON.stringify({ B2: marcasDe('B2'), A: marcasDe('A'), A2: marcasDe('A2'), ancho: anchoBien }).slice(0, 240));
closeSavedModal();

// 4 · «Guardar» con «A»
poner([hacer(3, 'A')]); loadDraftData(0); await esperar(900);
Q.dialogos = []; const r4 = saveDraft(); await esperar(200);
const toast4 = (document.getElementById('toast') || {}).textContent || '';
ok('4 · «Guardar» un borrador del 5-oct con «A» guarda, avisa «así no se envía» y no pregunta la fecha',
   r4 !== false && /el apartamento «A» no es de la lista/.test(toast4) && /Así no se envía/.test(toast4) && !Q.dialogos.some(d => /fecha/.test(d)) && lista()[0].apto === 'A',
   r4 + ' · ' + toast4.slice(0, 120) + ' · ' + Q.dialogos.map(d => d.slice(0, 50)).join(' | '));

// 5 · «Enviar» de uno con «A» no sale
poner([hacer(3, 'A', 'Piso 01', { fecha: HOY, id: 'draft_' + (Date.now() - 1000) })]);
loadDraftData(0); await esperar(500);
envAntes = (await Q.envios()).length; Q.dialogos = [];
openSend(); await esperar(200); document.getElementById('claveEnvio').value = 'qc';
await enviarAlRelevo(); await esperar(800);
ok('5 · «Enviar» de uno con apartamento «A» no sale y dice qué apartamentos tiene la T-16',
   (await Q.envios()).length === envAntes && Q.dialogos.some(d => /No se envía: el apartamento «A» no es de la lista: en la T-16 son A1, A2, B1, B2/.test(d)),
   Q.dialogos.map(d => d.slice(0, 90)).join(' | '));
try { closeSend(); } catch (e) {}

// 6 · uno vacío enviado solo pregunta, y con «Cancelar» no sale
poner([vacio(hacer(6, 'B2', 'Piso 01', { fecha: HOY, id: 'draft_' + (Date.now() - 1000) }))]);
loadDraftData(0); await esperar(500);
envAntes = (await Q.envios()).length; Q.aceptar = false; Q.dialogos = [];
openSend(); await esperar(200); document.getElementById('claveEnvio').value = 'qc';
await enviarAlRelevo(); await esperar(800); Q.aceptar = true;
ok('6 · «Enviar» de uno sin nada medido pregunta antes, y con «Cancelar» no sale',
   (await Q.envios()).length === envAntes && Q.dialogos.some(d => /no tiene nada medido/.test(d) && /Enviarlo de todos modos/.test(d)), Q.dialogos.map(d => d.slice(0, 80)).join(' | '));
try { closeSend(); } catch (e) {}

// 7 · al abrir el de «B-1» se ve «B1»
poner([hacer(5, 'B-1', 'Piso 01', { fecha: HOY, id: 'draft_' + (Date.now() - 1000) })]);
loadDraftData(0); await esperar(500);
const s10 = document.getElementById('apto-sel');
ok('7 · Al abrir el borrador de «B-1» el apartamento queda «B1» y se ve elegido en la lista', document.getElementById('apto').value === 'B1' && s10 && s10.style.display !== 'none' && s10.value === 'B1',
   document.getElementById('apto').value + ' · ' + (s10 && s10.style.display) + ' · ' + (s10 && s10.value));

// 8 · torre sin lista y formas
const SR = Object.assign(hacer(9, 'A'), { convenio: 'Convenio Rusos', torre: 'T-04' });
ok('8 · En una torre sin lista «A» pasa; en la T-16 «C1» pasa (forma de la lista) y «4B», «A 1 B» no',
   !_aptoMal192(SR) && !_aptoMal192(hacer(9, 'C1')) && !!_aptoMal192(hacer(9, '4B')) && !!_aptoMal192(hacer(9, 'AB1')) && !_aptoMal192(hacer(9, 'b1')),
   [!!_aptoMal192(SR), !!_aptoMal192(hacer(9, 'C1')), !!_aptoMal192(hacer(9, '4B')), !!_aptoMal192(hacer(9, 'AB1'))].join(','));

// 9 · torre
const T = { ambito: 'torre', partidas: { hito_x: [{ pr: '10', ej: '', ev: '', sn: '', pct: '' }], hito_y: { pct: '', obs: 'algo' } } };
const T2 = JSON.parse(JSON.stringify(T)); T2.partidas.hito_y.pct = '40';
const T3 = JSON.parse(JSON.stringify(T)); T3.extraRows = { hito_x: [{ desc: 'Fila de campo', pr: '', ej: '3', ev: '' }] };
ok('9 · Un informe de torre sin nada medido es vacío (la proyectada y una nota no cuentan); con un % o una fila agregada con ejecutada, no',
   _nadaMedido192(T) && !_nadaMedido192(T2) && !_nadaMedido192(T3) && _aptoMal192(Object.assign({ apto: 'A', torre: 'T-16', convenio: 'Convenio Bielorrusos' }, T)) === null);

// 10 · la lista para la oficina
poner(telefono());
const txt = _textoLista187();
ok('10 · «Mandar la lista a la oficina» dice por qué no salen: el vacío y el apartamento (la fecha no: se pregunta al enviar)',
   /falta: medir algo \(vacío, no se envía\)/.test(txt) && /falta: corregir el apartamento «A»/.test(txt) && /3 con datos que faltan/.test(txt), txt.split('\n').filter(l => /falta/.test(l)).slice(0, 3).join(' | ').slice(0, 240));

localStorage.clear();
