// INFORME ANTERIOR · tanda 4 de 5 — ESTRÉS Y CONTINUIDAD (29-sep-2026), contra el relevo falso.
localStorage.setItem('garmel_rol', 'inspector');
localStorage.setItem('garmel_clave_envio', 'qc');
const put = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const pct = rid => (document.getElementById('pct_' + rid)?.innerText || '').trim();
const aviso = () => (document.getElementById('aviso-anterior')?.innerText || '').trim();
const limpiar = async () => { Q.aceptar = true; nuevoFormulario(); await esperar(300); };
const cabecera = (piso, apto) => {
  sel('fecha', '2026-09-29'); sel('torre', 'T-07'); sel('convenio', 'Convenio Bielorrusos');
  const emp = [...document.getElementById('empresa').options].map(o => o.value);
  sel('empresa', emp.find(x => /ALNAVIC/i.test(x)) || emp[1]);
  const insp = document.querySelector('.inspector-select');
  insp.value = [...insp.options].map(o => o.value).filter(Boolean)[0]; insp.dispatchEvent(new Event('change', { bubbles: true }));
  if (!document.querySelector('#estatus .ck-lbl.on')) document.querySelector('#estatus .ck-lbl').click();
  if (piso) { sel('piso', piso); put('apto', apto); }
};
const esperarAviso = async (ms) => { await hasta(() => aviso().length > 0, ms || 12000, 100); return aviso(); };
await Q.relevo({ caido: false, fallar: [], lento: 0, borrar: true });
localStorage.setItem('garmel_reports_list', '[]');

// ── 11. Lo traído queda guardado solo (autoguardado) con la lista v2 ──
await limpiar(); setAmbito('apartamento'); cabecera('Piso 02', 'A'); await esperar(900); document.querySelector('#aviso-anterior .no')?.click();
put('pr_hito_acc_electricos_0', '4'); put('ej_hito_acc_electricos_0', '2'); currentEditingIndex = null; _idEnEdicion = null; saveDraft(true);
await limpiar(); setAmbito('apartamento'); cabecera('Piso 02', 'A');
await esperarAviso(); document.querySelector('#aviso-anterior .si')?.click(); await esperar(300);
autoguardar(); await esperar(200);
const g = getSavedReports()[0] || {};
ok('11 · Lo traído se guarda como borrador nuevo de la lista v2, con sus mediciones',
   g.lista === 'v2' && g.partidas && g.partidas.hito_acc_electricos && g.partidas.hito_acc_electricos[0].ej === '2' && getSavedReports().length === 2,
   'borradores ' + getSavedReports().length + ' · lista ' + g.lista + ' · ej ' + (g.partidas && g.partidas.hito_acc_electricos && g.partidas.hito_acc_electricos[0].ej));

// ── 12. «Limpiar todo» vuelve a ofrecer el del mismo apartamento ──
await limpiar(); setAmbito('apartamento'); cabecera('Piso 02', 'A');
const a12 = await esperarAviso();
ok('12 · Tras «Limpiar todo», el mismo apartamento vuelve a ofrecer su informe anterior', /Este apartamento ya tiene/.test(a12), '«' + a12.slice(0, 50) + '»');

// ── 13. Cuarenta borradores de la torre: buscar el anterior es instantáneo ──
const base = getSavedReports();
const plantilla = base[0];
const muchos = [];
for (let k = 0; k < 40; k++) muchos.push(Object.assign(JSON.parse(JSON.stringify(plantilla)), { id: 'm' + k, apto: 'M' + k, piso: 'Piso ' + String(1 + k % 12).padStart(2, '0'), fecha: '2026-09-' + String(1 + k % 28).padStart(2, '0') }));
localStorage.setItem('garmel_reports_list', JSON.stringify(muchos.concat(base)));
await limpiar(); setAmbito('apartamento'); cabecera('Piso 05', 'M4');
const t0 = performance.now(); const r13 = _anterioresLocales(); const ms13 = performance.now() - t0;
const a13 = await esperarAviso();
ok('13 · Con 42 borradores en el teléfono, la búsqueda local tarda < 50 ms y encuentra el apartamento M4',
   ms13 < 50 && r13.some(x => x.mismo && x.b.apto === 'M4') && /Este apartamento ya tiene/.test(a13), Math.round(ms13 * 10) / 10 + ' ms · ' + r13.length + ' candidatos');

// ── 14. «Enviar todos» con borradores traídos ──
localStorage.setItem('garmel_reports_list', JSON.stringify(getSavedReports().slice(0, 3).map((b, i) => Object.assign(b, { nro: 'PRUEBA-EZ-T07-P0' + (i + 1) + 'AX' + i + '-260929-QC', enviado: false }))));
Q.aceptar = true; await enviarPendientes(); await esperar(600);
const envs = (await Q.envios()).filter(e => /AX\d-260929-QC/.test(e.numero));
ok('14 · «Enviar todos» manda los borradores (traídos incluidos) con la lista v2', envs.length === 3 && envs.every(e => e.datos.lista === 'v2'),
   envs.length + ' enviados · ' + envs.map(e => e.datos.lista).join(','));

// ── 15. El aviso no sale en la impresión del teléfono ──
await limpiar(); setAmbito('apartamento'); cabecera('Piso 02', 'A'); await esperarAviso();
const reglasPrint = [...document.styleSheets].flatMap(s => { try { return [...s.cssRules]; } catch(e) { return []; } })
  .filter(r => r.media && /print/.test(r.media.mediaText)).map(r => r.cssText).join(' ');
ok('15 · Al imprimir desde el teléfono el aviso no aparece (#aviso-anterior oculto en @media print)',
   /#aviso-anterior[^{]*\{[^}]*display:\s*none/.test(reglasPrint), reglasPrint.match(/#aviso-anterior[^}]*\}/)?.[0] || 'sin regla');
