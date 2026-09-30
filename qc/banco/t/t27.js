// INFORME ANTERIOR · tanda 2 de 5 — BORDES (29-sep-2026), contra el relevo falso.
localStorage.setItem('garmel_rol', 'inspector');
localStorage.setItem('garmel_clave_envio', 'qc');
const put = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const pct = rid => (document.getElementById('pct_' + rid)?.innerText || '').trim();
const aviso = () => (document.getElementById('aviso-anterior')?.innerText || '').trim();
const limpiar = async () => { Q.aceptar = true; nuevoFormulario(); await esperar(300); };
const cabecera = (piso, apto, fecha) => {
  sel('fecha', fecha || '2026-09-29');
  sel('torre', 'T-07'); sel('convenio', 'Convenio Bielorrusos');
  const emp = [...document.getElementById('empresa').options].map(o => o.value);
  sel('empresa', emp.find(x => /ALNAVIC/i.test(x)) || emp[1]);
  const insp = document.querySelector('.inspector-select');
  insp.value = [...insp.options].map(o => o.value).filter(Boolean)[0]; insp.dispatchEvent(new Event('change', { bubbles: true }));
  if (!document.querySelector('#estatus .ck-lbl.on')) document.querySelector('#estatus .ck-lbl').click();
  if (piso) { sel('piso', piso); put('apto', apto); }
};
const esperarAviso = async (ms) => { await hasta(() => aviso().length > 0, ms || 12000, 100); return aviso(); };
const cerrarAviso = async () => { await esperar(900); document.querySelector('#aviso-anterior .no')?.click(); };
const enviar = async () => { document.getElementById('btn-enviar-relevo').disabled = false; refrescarEstadoClave(); await enviarAlRelevo(); await esperar(500); };
await Q.relevo({ caido: false, fallar: [], lento: 0, borrar: true });

// ── 1. Dos informes anteriores del mismo apartamento: trae el más reciente ──
await limpiar(); setAmbito('apartamento'); cabecera('Piso 08', 'A', '2026-09-20'); await cerrarAviso();
put('pr_hito_acc_electricos_0', '5'); put('ej_hito_acc_electricos_0', '1'); currentEditingIndex = null; _idEnEdicion = null; saveDraft(true);
await limpiar(); setAmbito('apartamento'); cabecera('Piso 08', 'A', '2026-09-28'); await cerrarAviso();
put('pr_hito_acc_electricos_0', '5'); put('ej_hito_acc_electricos_0', '4'); currentEditingIndex = null; _idEnEdicion = null; saveDraft(true);
await limpiar(); setAmbito('apartamento'); cabecera('Piso 08', 'A', '2026-09-29');
const a1 = await esperarAviso(); document.querySelector('#aviso-anterior .si')?.click(); await esperar(300);
ok('1 · Con dos informes del mismo apartamento trae el más reciente (28-sep: 4 de 5)',
   /2026-09-28/.test(a1) && pct('hito_acc_electricos_0') === '80%', '«' + a1.slice(0, 60) + '» · tomas ' + pct('hito_acc_electricos_0'));

// ── 2. Un borrador de la lista anterior no se ofrece ──
const lista2 = getSavedReports().filter(b => !(b.piso === 'Piso 08' && b.apto === 'A'));
const viejo = { id: 'v1-p09', formType: 'detallado', ambito: 'apartamento', torre: 'T-07', piso: 'Piso 09', apto: 'A', fecha: '2026-09-27',
                partidas: { hito_acc_electricos: [{ pr: '5', ej: '5', ud: 'pza' }, {}, {}, {}, {}] }, noInspeccionados: [], fotos: {}, fotobs: {} };
localStorage.setItem('garmel_reports_list', JSON.stringify(lista2.concat([viejo])));
await limpiar(); setAmbito('apartamento'); cabecera('Piso 09', 'A');
await esperar(2500);
const a2 = aviso();
ok('2 · Un borrador de la lista anterior (53) del mismo apartamento no se ofrece como informe anterior',
   !/Este apartamento ya tiene/.test(a2), 'aviso: «' + a2.slice(0, 60) + '»');

// ── 3. Relevo caído y sin clave: ni aviso roto ni error, y el formulario sigue ──
localStorage.setItem('garmel_reports_list', '[]');
await Q.relevo({ caido: true });
await limpiar(); setAmbito('apartamento'); cabecera('Piso 10', 'A');
const t0 = Date.now(); await esperar(3000);
const a3 = aviso(), errores3 = Q.R.filter(r => /pageerror|unhandled/.test(r.n)).length;
localStorage.removeItem('garmel_clave_envio');
await limpiar(); setAmbito('apartamento'); cabecera('Piso 10', 'B'); await esperar(1500);
const a3b = aviso();
localStorage.setItem('garmel_clave_envio', 'qc');
await Q.relevo({ caido: false });
put('pr_hito_acc_electricos_0', '2'); put('ej_hito_acc_electricos_0', '1');
ok('3 · Con el relevo caído o sin clave no aparece aviso ni error, y se sigue midiendo normal',
   a3 === '' && a3b === '' && errores3 === 0 && pct('hito_acc_electricos_0') === '50%',
   'caído «' + a3.slice(0, 20) + '» · sin clave «' + a3b.slice(0, 20) + '» · errores ' + errores3 + ' · ' + (Date.now() - t0) + ' ms');

// ── 4. Lo traído se envía, y la evaluación vuelve vacía ──
await limpiar(); setAmbito('apartamento'); cabecera('Piso 11', 'A'); await cerrarAviso();
put('pr_hito_acc_electricos_0', '6'); put('ej_hito_acc_electricos_0', '3'); setEv(document.querySelector('.ev-btn.M[data-rid="hito_acc_electricos_0"]'));
await enviar();
localStorage.setItem('garmel_reports_list', '[]');
await limpiar(); setAmbito('apartamento'); cabecera('Piso 11', 'A');
await esperarAviso(); document.querySelector('#aviso-anterior .si')?.click(); await esperar(300);
put('ej_hito_acc_electricos_0', '5');
await enviar();
const env4 = (await Q.envios()).filter(e => /P11AA/.test(e.numero)).slice(-1)[0];
const f4 = env4 && env4.datos.partidas.hito_acc_electricos[0];
ok('4 · Se trae del archivo, se corrige una fila y se envía: llegan 5 de 6 y sin la evaluación M de la visita anterior',
   f4 && f4.pr === '6' && f4.ej === '5' && f4.ev === '', f4 ? JSON.stringify(f4) : 'sin envío');

// ── 5. Apartamento «4» y «04» son el mismo para el archivo ──
localStorage.setItem('garmel_reports_list', '[]');
await limpiar(); setAmbito('apartamento'); cabecera('Piso 12', '4'); await cerrarAviso();
put('pr_hito_acc_sanitarios_0', '3'); put('ej_hito_acc_sanitarios_0', '3');
await enviar();
localStorage.setItem('garmel_reports_list', '[]');
await limpiar(); setAmbito('apartamento'); cabecera('Piso 12', '04');
const a5 = await esperarAviso();
ok('5 · El apartamento «4» y el «04» son el mismo: el número de informe los iguala y el archivo lo encuentra',
   /Este apartamento ya tiene un informe/.test(a5) && /del archivo/.test(a5), '«' + a5.slice(0, 70) + '»');
