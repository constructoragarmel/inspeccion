// LISTA V2 · tanda 2 de 4 — BORRADORES Y DATOS (29-sep-2026), en inspeccion.html a 375×812.
localStorage.setItem('garmel_rol', 'inspector');
const put = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const pct = rid => (document.getElementById('pct_' + rid)?.innerText || '').trim();
const tipo = (p, i) => _esSiNo(p, i) ? 'sino' : _esEstado(p, i) ? 'estado' : _esConteo(p, i) ? 'conteo' : 'cantidad';
const cabecera = (apto) => {
  if (!document.getElementById('fecha').value) sel('fecha', '2026-09-29');
  sel('torre', 'T-07'); sel('convenio', 'Convenio Bielorrusos');
  const emp = [...document.getElementById('empresa').options].map(o => o.value);
  sel('empresa', emp.find(x => /ALNAVIC/i.test(x)) || emp[1]);
  const insp = document.querySelector('.inspector-select');
  insp.value = [...insp.options].map(o => o.value).filter(Boolean)[0]; insp.dispatchEvent(new Event('change', { bubbles: true }));
  if (apto !== undefined) { sel('piso', 'Piso 03'); put('apto', apto); }
  if (!document.querySelector('#estatus .ck-lbl.on')) document.querySelector('#estatus .ck-lbl').click();
};
const llenar = (semilla) => {
  const vals = [0, 25, 50, 75, 100]; let n = semilla || 0;
  PARTIDAS.forEach(p => p.items.forEach((_, i) => {
    if (!_aplica(p.id, i)) return; n++; const rid = p.id + '_' + i, t = tipo(p.id, i);
    if (t === 'estado') setEstado(document.querySelector(`.est-btn[data-rid="${rid}"][data-v="${vals[n % 5]}"]`), vals[n % 5]);
    else if (t === 'sino') setSiNo(document.querySelector(`.est-btn[data-rid="${rid}"][data-sn="${n % 2 ? 'Sí' : 'No'}"]`));
    else if (t === 'conteo') { put('pr_' + rid, String(2 + n % 4)); put('ej_' + rid, String(n % 3)); }
    else { put('pm_' + rid, String((n * 17) % 101)); const u = document.getElementById('ud_' + p.id + '_' + i); if (u) { u.value = 'kg'; u.dispatchEvent(new Event('change', { bubbles: true })); } }
    if (n % 4 === 0) setEv(document.querySelector(`.ev-btn.${['B', 'R', 'M', 'NA'][n % 4]}[data-rid="${rid}"]`) || document.querySelector(`.ev-btn.B[data-rid="${rid}"]`));
  }));
};
const limpiar = async () => { Q.aceptar = true; nuevoFormulario(); await esperar(300); };
const soloPartidas = d => JSON.stringify(Object.keys(d.partidas).sort().map(k => [k, d.partidas[k]]));

// ── 6. Ida y vuelta completa: todas las filas de los dos ámbitos ──
let r6 = [];
for (const amb of ['apartamento', 'torre']) {
  await limpiar(); setAmbito(amb); await esperar(150); cabecera(amb === 'torre' ? undefined : 'C'); llenar(amb === 'torre' ? 7 : 3);
  const antes = getFormData(); saveDraft(true); await esperar(200);
  const idx = getSavedReports().findIndex(b => b.nro === antes.nro);   // saveDraft pone los nuevos AL PRINCIPIO
  await limpiar(); loadDraftData(idx); await esperar(400);
  const despues = getFormData();
  r6.push(amb + ':' + (soloPartidas(antes) === soloPartidas(despues)) + ' lista=' + getSavedReports()[idx].lista + ' ámbito=' + despues.ambito);
}
ok('6 · Guardar, limpiar y reabrir devuelve exactamente las mismas mediciones (46 filas de apartamento y 48 de torre)',
   r6.every(x => /:true lista=v2/.test(x)), r6.join(' | '));

// ── 7. Cambiar de ámbito a mitad del llenado ──
await limpiar(); setAmbito('apartamento'); await esperar(150); cabecera('D');
put('pm_hito_cerramientos_1', '40');                                        // tabiquería: ambos
setEstado(document.querySelector('.est-btn[data-rid="hito_acabados_0"][data-v="75"]'), 75);   // frisos: ambos
put('pr_hito_acc_electricos_0', '5'); put('ej_hito_acc_electricos_0', '5'); // tomas: solo apartamento
setAmbito('torre'); await esperar(200);
const dT = getFormData();
const enTorre = pct('hito_cerramientos_1') === '40%' && pct('hito_acabados_0') === '75%' && !dT.partidas.hito_acc_electricos;
setAmbito('apartamento'); await esperar(200);
const deVuelta = pct('hito_acc_electricos_0') === '100%' && pct('hito_acabados_0') === '75%';
ok('7 · Pasar a torre conserva lo común, deja fuera lo del apartamento, y al volver sigue todo', enTorre && deVuelta,
   'torre: tabiq ' + pct('hito_cerramientos_1') + ' · eléctricos en el sobre: ' + !!dT.partidas.hito_acc_electricos + ' · vuelta: tomas ' + pct('hito_acc_electricos_0'));

// ── 8. Treinta borradores ──
const base = getSavedReports().length;
for (let k = 0; k < 30; k++) {
  await limpiar(); setAmbito('apartamento'); cabecera('Z' + k);
  put('pr_hito_acc_electricos_0', '4'); put('ej_hito_acc_electricos_0', String(k % 5));
  currentEditingIndex = null; _idEnEdicion = null; saveDraft(true);
}
await esperar(300);
renderSavedList();
const total8 = getSavedReports().length;
await limpiar(); loadDraftData(getSavedReports().findIndex(b => b.apto === 'Z14')); await esperar(400);
ok('8 · 30 borradores guardados; el 15.º se reabre con su apartamento y su conteo',
   total8 - base === 30 && document.getElementById('apto').value === 'Z14' && document.getElementById('ej_hito_acc_electricos_0').value === '4',
   'nuevos ' + (total8 - base) + ' · abierto ' + document.getElementById('apto').value + ' ej=' + document.getElementById('ej_hito_acc_electricos_0').value);

// ── 9. Borradores viejos de distintas formas ──
const listaAhora = getSavedReports();
const plantilla = JSON.parse(JSON.stringify(listaAhora[listaAhora.length - 1]));
const vHitos = Object.assign({}, plantilla, { id: 'v-hitos', lista: undefined, formType: 'hitos', apto: 'H1', nro: 'PRUEBA-EZ-T07-P03H1-260929-QC',
                                             partidas: { hito_servicios: { pct: '40', obs: 'viejo por hitos' } } });
const vVacio = Object.assign({}, plantilla, { id: 'v-vacio', lista: undefined, apto: 'H2', nro: 'PRUEBA-EZ-T07-P03H2-260929-QC', partidas: {} });
delete vHitos.lista; delete vVacio.lista;
localStorage.setItem('garmel_reports_list', JSON.stringify(listaAhora.concat([vHitos, vVacio])));
const n9 = getSavedReports().length;
Q.dialogos = []; Q.aceptar = true;
await limpiar(); Q.dialogos = [];
loadDraftData(n9 - 2); await esperar(400);
const hitosOk = Q.dialogos.some(m => /lista ANTERIOR/.test(m)) && document.getElementById('apto').value === 'H1' && formType === 'detallado';
Q.dialogos = [];
await limpiar(); Q.dialogos = [];
loadDraftData(n9 - 1); await esperar(400);
const vacioOk = !Q.dialogos.some(m => /lista ANTERIOR/.test(m)) && document.getElementById('apto').value === 'H2';
ok('9 · Viejo «por hitos»: avisa y se abre como detallado sin mediciones · viejo sin mediciones: se abre sin aviso',
   hitosOk && vacioOk, 'porHitos=' + hitosOk + ' (formType ' + formType + ') · vacío=' + vacioOk);

// ── 10. El autoguardado escribe la lista v2 en el almacenamiento ──
await limpiar(); setAmbito('torre'); await esperar(150); cabecera();
setEstado(document.querySelector('.est-btn[data-rid="hito_contra_incendio_3"][data-v="25"]'), 25);
autoguardar(); await esperar(200);
const crudo = JSON.parse(localStorage.getItem('garmel_reports_list') || '[]');
const ult = crudo[0] || {};                                           // el más nuevo va primero
ok('10 · El autoguardado deja en el teléfono un borrador de torre con lista v2 y el hito 12 medido',
   ult.lista === 'v2' && ult.ambito === 'torre' && ult.partidas && ult.partidas.hito_contra_incendio && ult.partidas.hito_contra_incendio[3].ej === '25',
   'lista=' + ult.lista + ' ámbito=' + ult.ambito + ' h12[3]=' + (ult.partidas && ult.partidas.hito_contra_incendio && ult.partidas.hito_contra_incendio[3].ej));
