// ROBUSTEZ · tanda 1 de 4 — FOTOS EN INDEXEDDB (30-sep-2026), en inspeccion.html a 375×812, contra el relevo falso.
localStorage.setItem('garmel_rol', 'inspector');
localStorage.setItem('garmel_clave_envio', 'qc');
const put = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const cabecera = (apto) => {
  sel('fecha', '2026-09-30'); sel('torre', 'T-07'); sel('convenio', 'Convenio Bielorrusos');
  const emp = [...document.getElementById('empresa').options].map(o => o.value);
  sel('empresa', emp.find(x => /ALNAVIC/i.test(x)) || emp[1]);
  const insp = document.querySelector('.inspector-select');
  insp.value = [...insp.options].map(o => o.value).filter(Boolean)[0]; insp.dispatchEvent(new Event('change', { bubbles: true }));
  if (apto !== undefined) { sel('piso', 'Piso 05'); put('apto', apto); }
  if (!document.querySelector('#estatus .ck-lbl.on')) document.querySelector('#estatus .ck-lbl').click();
};
const limpiar = async () => { Q.aceptar = true; nuevoFormulario(); await esperar(300); document.querySelector('#aviso-anterior .no')?.click(); };
const lista = () => JSON.parse(localStorage.getItem('garmel_reports_list') || '[]');
const fotosEnPantalla = () => [...document.querySelectorAll('img[id^="fimg_"]')].filter(i => /^data:/.test(i.src || '')).length;
const contar = f => Object.values(f || {}).reduce((a, arr) => a + (arr || []).filter(x => /^data:/.test(x || '')).length, 0);
await Q.relevo({ caido: false, fallar: [], lento: 0, borrar: true });
localStorage.setItem('garmel_reports_list', '[]');

// ── 1. Doce fotos: a IndexedDB, y en la lista solo la marca ──
await limpiar(); setAmbito('apartamento'); cabecera('F1'); await esperar(900); document.querySelector('#aviso-anterior .no')?.click();
put('pr_hito_acc_electricos_0', '8'); put('ej_hito_acc_electricos_0', '4');
const hitos = _hitosDelAmbito().map(p => p.id).slice(0, 2);
let semilla = 1;
for (const pid of hitos) for (let k = 0; k < 6; k++)
  Q.ponerFotos(document.querySelector('#fslot_' + pid + '_' + k + ' input[type=file]'), [await Q.foto(1600, 1200, semilla++)]);
await hasta(() => fotosEnPantalla() === 12, 60000, 200);
saveDraft(true); await esperar(800);
const b1 = lista()[0], id1 = b1 && b1.id;
const enIdb1 = await _fotosGet(id1);
const texto = localStorage.getItem('garmel_reports_list') || '';
ok('1 · 12 fotos: el borrador guarda la marca «idb», las 12 fotos están en IndexedDB y la lista pesa poco',
   b1 && b1.fotosEnIdb === true && !/data:image/.test(texto) && contar(enIdb1) === 12 &&
   Object.values(b1.fotos).flat().filter(x => x === 'idb').length === 12 && texto.length < 60000,
   'enIdb=' + contar(enIdb1) + ' · marcas=' + (b1 ? Object.values(b1.fotos).flat().filter(x => x === 'idb').length : '?') + ' · lista ' + Math.round(texto.length / 1024) + ' KB');

// ── 2. Abrir otro y volver: las fotos reaparecen; guardar mientras se pintan no las borra ──
await limpiar(); setAmbito('apartamento'); cabecera('F2'); await esperar(900); document.querySelector('#aviso-anterior .no')?.click();
put('pr_hito_acc_electricos_0', '3'); saveDraft(true);
const i1 = lista().findIndex(b => b.id === id1);
loadDraftData(i1);
saveDraft(true);                                  // en el instante en que todavía no se pintan
const marcasTrasGuardar = Object.values(lista().find(b => b.id === id1).fotos).flat().filter(x => x === 'idb').length;
await hasta(() => fotosEnPantalla() === 12, 8000, 100);
await esperar(300);
ok('2 · Reabierto: se pintan las 12 fotos desde IndexedDB, y un guardado a mitad de camino no las pierde',
   fotosEnPantalla() === 12 && marcasTrasGuardar === 12 && contar(await _fotosGet(id1)) === 12 && document.getElementById('apto').value === 'F1',
   'pantalla=' + fotosEnPantalla() + ' · marcas tras guardar=' + marcasTrasGuardar + ' · apto=' + document.getElementById('apto').value);

// ── 3. Quitar una foto y guardar: IndexedDB queda con 11 ──
removeFoto(hitos[0], 2); saveDraft(true); await esperar(600);
const tras3 = await _fotosGet(id1);
ok('3 · Quitar una foto y guardar deja 11 en IndexedDB y la casilla vacía en la lista',
   contar(tras3) === 11 && (tras3[hitos[0]] || [])[2] === '' && lista().find(b => b.id === id1).fotos[hitos[0]][2] === '',
   'idb=' + contar(tras3));

// ── 4. «Enviar todos» manda las 11 fotos que están en IndexedDB y después las borra de ahí ──
await limpiar();
Q.aceptar = true; Q.dialogos = [];
await enviarPendientes(); await esperar(500);
const env = await Q.envios();
const e1 = env.find(e => e.datos && e.datos.id === id1);
ok('4 · «Enviar todos» toma las fotos de IndexedDB (11), marca enviado y las borra de IndexedDB',
   e1 && e1.fotos.length === 11 && !!lista().find(b => b.id === id1).enviado && (await _fotosGet(id1)) === null,
   'enviadas=' + (e1 ? e1.fotos.length : 'ninguno') + ' · idb=' + JSON.stringify(await _fotosGet(id1)).slice(0, 30) + ' · ' + Q.dialogos.slice(-1)[0]?.replace(/\n/g, ' ').slice(0, 80));

// ── 5. Un borrador de antes (fotos dentro de la lista) se abre, se ve y pasa a IndexedDB al guardarse ──
const f5 = [await Q.foto(400, 300, 50), await Q.foto(400, 300, 51)];
const dataUrl = f => new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(f); });
const du = [await dataUrl(f5[0]), await dataUrl(f5[1])];
await limpiar(); setAmbito('apartamento'); cabecera('F5'); await esperar(900); document.querySelector('#aviso-anterior .no')?.click();
put('pr_hito_acc_electricos_0', '2'); saveDraft(true);
const l5 = lista(); const viejo = l5[0];
delete viejo.fotosEnIdb; viejo.fotos[hitos[0]] = [du[0], du[1], '', '', '', ''];
localStorage.setItem('garmel_reports_list', JSON.stringify(l5));
await _fotosDel(viejo.id);
await limpiar();
loadDraftData(lista().findIndex(b => b.id === viejo.id));
await hasta(() => fotosEnPantalla() === 2, 5000, 100);
const vistas = fotosEnPantalla();
saveDraft(true); await esperar(600);
const mig = lista().find(b => b.id === viejo.id);
ok('5 · Un borrador viejo con las fotos dentro se abre con sus 2 fotos y al guardarse pasa a IndexedDB',
   vistas === 2 && mig.fotosEnIdb === true && !/data:image/.test(localStorage.getItem('garmel_reports_list')) && contar(await _fotosGet(viejo.id)) === 2,
   'vistas=' + vistas + ' · idb=' + contar(await _fotosGet(viejo.id)));
