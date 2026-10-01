// INFORME ANTERIOR · tanda 3 de 5 — INTERACCIÓN (29-sep-2026), contra el relevo falso.
localStorage.setItem('garmel_rol', 'inspector');
localStorage.setItem('garmel_clave_envio', 'qc');
const put = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const pct = rid => (document.getElementById('pct_' + rid)?.innerText || '').trim();
const aviso = () => (document.getElementById('aviso-anterior')?.innerText || '').trim();
const limpiar = async () => { Q.aceptar = true; nuevoFormulario(); await esperar(300); };
const cabecera = (torre, piso, apto) => {
  sel('fecha', '2026-09-29'); sel('torre', torre || 'T-07'); sel('convenio', 'Convenio Bielorrusos');
  const insp = document.querySelector('.inspector-select');
  insp.value = [...insp.options].map(o => o.value).filter(Boolean)[0]; insp.dispatchEvent(new Event('change', { bubbles: true }));
  if (!document.querySelector('#estatus .ck-lbl.on')) document.querySelector('#estatus .ck-lbl').click();
  if (piso) { sel('piso', piso); put('apto', apto); }
};
const esperarAviso = async (ms) => { await hasta(() => aviso().length > 0, ms || 12000, 100); return aviso(); };
const guardarNuevo = () => { currentEditingIndex = null; _idEnEdicion = null; saveDraft(true); };
await Q.relevo({ caido: false, fallar: [], lento: 0, borrar: true });
localStorage.setItem('garmel_reports_list', '[]');

// Semillas: un apartamento de la T-07 y otro de la T-08, medidos.
await limpiar(); setAmbito('apartamento'); cabecera('T-07', 'Piso 02', 'A'); await esperar(900); document.querySelector('#aviso-anterior .no')?.click();
put('pr_hito_acc_electricos_0', '6'); put('ej_hito_acc_electricos_0', '6');
setEstado(document.querySelector('.est-btn[data-rid="hito_acabados_1"][data-v="50"]'), 50);
guardarNuevo();
await limpiar(); setAmbito('apartamento'); cabecera('T-08', 'Piso 02', 'A'); await esperar(900); document.querySelector('#aviso-anterior .no')?.click();
put('pr_hito_acc_electricos_0', '7'); put('ej_hito_acc_electricos_0', '0'); guardarNuevo();

// ── 6. Cambiar de torre con el aviso a la vista lo quita en el acto y ofrece el de la otra ──
await limpiar(); setAmbito('apartamento'); cabecera('T-07', 'Piso 02', 'A');
const a6a = await esperarAviso();
sel('torre', 'T-08'); await esperar(50);
const inmediato = aviso();
const a6b = await esperarAviso();
document.querySelector('#aviso-anterior .si')?.click(); await esperar(300);
ok('6 · Al cambiar de torre el aviso viejo se quita en el acto y el nuevo trae lo de la T-08 (7 de 0)',
   a6a.length > 0 && inmediato === '' && a6b.length > 0 && document.getElementById('pr_hito_acc_electricos_0').value === '7',
   'antes «' + a6a.slice(0, 25) + '» · inmediato «' + inmediato.slice(0, 20) + '» · hay=' + document.getElementById('pr_hito_acc_electricos_0').value);

// ── 7. Si empezó a medir con el aviso a la vista, «Traer» no pisa nada ──
await limpiar(); setAmbito('apartamento'); cabecera('T-07', 'Piso 02', 'A');
await esperarAviso();
put('pr_hito_acc_electricos_1', '3');
document.querySelector('#aviso-anterior .si')?.click(); await esperar(300);
ok('7 · Con algo ya medido, tocar «Traer» no trae nada (no pisa lo escrito) y el aviso se va',
   document.getElementById('pr_hito_acc_electricos_0').value === '' && document.getElementById('pr_hito_acc_electricos_1').value === '3' && aviso() === '',
   'tomas hay=«' + document.getElementById('pr_hito_acc_electricos_0').value + '» · interr=' + document.getElementById('pr_hito_acc_electricos_1').value);

// ── 8. Las cantidades «hay»: solo filas de conteo del apartamento ──
await limpiar(); setAmbito('apartamento'); cabecera('T-07', 'Piso 03', 'Z');
const a8 = await esperarAviso(); document.querySelector('#aviso-anterior .si')?.click(); await esperar(300);
const conValor = [...document.querySelectorAll('input[id^="pr_"], input[id^="ej_"], input[id^="pm_"]')].filter(e => e.value).map(e => e.id);
ok('8 · «Usar las cantidades» llena solo el «hay» de las filas de conteo que traía (nada de puestas, estados ni %)',
   /Usar los totales/.test(a8) && conValor.length === 1 && conValor[0] === 'pr_hito_acc_electricos_0' && pct('hito_acabados_1') === '—',
   conValor.join(','));

// ── 9. Torre: trae cantidades con su unidad (ml/kg) y el % escrito ──
await limpiar(); setAmbito('torre'); await esperar(200); cabecera('T-09'); await esperar(900); document.querySelector('#aviso-anterior .no')?.click();
const ud = document.getElementById('ud_hito_estructura_1'); ud.value = 'kg'; ud.dispatchEvent(new Event('change', { bubbles: true }));
put('pm_hito_estructura_1', '35'); put('pm_hito_estructura_0', '80');
setEstado(document.querySelector('.est-btn[data-rid="hito_exteriores_7"][data-v="25"]'), 25);   // v100: el hito 12 ya no tiene filas de estado
guardarNuevo();
await limpiar(); setAmbito('torre'); await esperar(200); cabecera('T-09');
const a9 = await esperarAviso(); document.querySelector('#aviso-anterior .si')?.click(); await esperar(300);
ok('9 · Torre: trae el acero con su unidad kg y su 35 %, el encofrado al 80 % y contra incendio al 25 %',
   /Esta torre/.test(a9) && document.getElementById('ud_hito_estructura_1').value === 'kg' && pct('hito_estructura_1') === '35%' &&
   pct('hito_estructura_0') === '80%' && pct('hito_exteriores_7') === '25%',
   'ud=' + document.getElementById('ud_hito_estructura_1').value + ' acero ' + pct('hito_estructura_1') + ' encofrado ' + pct('hito_estructura_0') + ' fachada PB ' + pct('hito_exteriores_7'));

// ── 10. La consulta al archivo lleva el bloque bien armado y la marca de prueba ──
const orig = window.fetch; let cuerpo = null;
window.fetch = function(u, o){ try { const b = JSON.parse(o && o.body || '{}'); if (b.accion === 'historial') cuerpo = b; } catch(e){} return orig.apply(this, arguments); };
localStorage.setItem('garmel_reports_list', '[]');
await limpiar(); setAmbito('apartamento'); cabecera('T-07', 'Piso 04', '7'); await esperar(2500);
window.fetch = orig;
ok('10 · La consulta al archivo pide la T-07, el bloque P04A07 (el del número de informe) y dice que es prueba',
   cuerpo && cuerpo.tipo === 'obra' && cuerpo.torre === 'T-07' && cuerpo.bloque === 'P04A07' && cuerpo.prueba === true && cuerpo.clave === 'qc',
   JSON.stringify(cuerpo || {}).replace(/"clave":"[^"]*"/, '"clave":"…"'));
