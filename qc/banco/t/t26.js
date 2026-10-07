// INFORME ANTERIOR (cambio 151, 29-sep-2026): cinco QC en inspeccion.html, contra el relevo falso.
localStorage.setItem('garmel_rol', 'inspector');
localStorage.setItem('garmel_clave_envio', 'qc');
const put = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const pct = rid => (document.getElementById('pct_' + rid)?.innerText || '').trim();
const caja = () => document.getElementById('aviso-anterior');
const aviso = () => (caja()?.innerText || '').trim();
const limpiar = async () => { Q.aceptar = true; nuevoFormulario(); await esperar(300); };
const cabecera = (piso, apto) => {
  if (!document.getElementById('fecha').value) sel('fecha', '2026-09-29');
  sel('torre', 'T-07'); sel('convenio', 'Convenio Bielorrusos');
  const emp = [...document.getElementById('empresa').options].map(o => o.value);
  sel('empresa', emp.find(x => /ALNAVIC/i.test(x)) || emp[1]);
  const insp = document.querySelector('.inspector-select');
  insp.value = [...insp.options].map(o => o.value).filter(Boolean)[0]; insp.dispatchEvent(new Event('change', { bubbles: true }));
  if (!document.querySelector('#estatus .ck-lbl.on')) document.querySelector('#estatus .ck-lbl').click();
  if (piso) { sel('piso', piso); put('apto', apto); }
};
const esperarAviso = async () => { await hasta(() => aviso().length > 0, 12000, 100); return aviso(); };
const medir = () => {
  put('pr_hito_acc_electricos_0', '5'); put('ej_hito_acc_electricos_0', '3');                 // conteo 3 de 5
  put('pr_hito_acc_sanitarios_0', '2'); put('ej_hito_acc_sanitarios_0', '2');                 // ducha 2 de 2
  setEstado(document.querySelector('.est-btn[data-rid="hito_acabados_0"][data-v="75"]'), 75);   // frisos 75
  setEv(document.querySelector('.ev-btn.R[data-rid="hito_acabados_0"]'));
};
await Q.relevo({ caido: false, fallar: [], lento: 0, borrar: true });

// ── 1. Del mismo teléfono ──
await limpiar(); setAmbito('apartamento'); cabecera('Piso 05', 'A');
await esperar(900);
const antesDeMedir = aviso();
medir(); saveDraft(true); await esperar(200);
await limpiar(); setAmbito('apartamento'); cabecera('Piso 05', 'A');
const a1 = await esperarAviso();
document.querySelector('#aviso-anterior .si')?.click(); await esperar(300);
ok('1 · Mismo apartamento guardado en el teléfono: ofrece traerlo y trae mediciones (no la evaluación)',
   antesDeMedir === '' && /Este apartamento ya tiene un informe/.test(a1) && /este teléfono/.test(a1) &&
   pct('hito_acc_electricos_0') === '60%' && pct('hito_acabados_0') === '75%' &&
   !document.querySelector('.ev-btn.on[data-rid="hito_acabados_0"]') && aviso() === '',
   'aviso: «' + a1.slice(0, 70) + '» · tomas ' + pct('hito_acc_electricos_0') + ' · frisos ' + pct('hito_acabados_0'));

// ── 2. Del archivo (otro teléfono): se envía, se borra lo local y se vuelve a pedir ──
await limpiar(); setAmbito('apartamento'); cabecera('Piso 06', 'B');
await esperar(900); document.querySelector('#aviso-anterior .no')?.click();
medir(); document.getElementById('btn-enviar-relevo').disabled = false; refrescarEstadoClave();
await enviarAlRelevo(); await esperar(600);
localStorage.setItem('garmel_reports_list', '[]');
await limpiar(); setAmbito('apartamento'); cabecera('Piso 06', 'B');
const a2 = await esperarAviso();
document.querySelector('#aviso-anterior .si')?.click(); await esperar(300);
ok('2 · Sin nada en el teléfono, lo trae del archivo (relevo) y vuelca las mediciones',
   /del archivo/.test(a2) && pct('hito_acc_sanitarios_0') === '100%' && pct('hito_acabados_0') === '75%',
   'aviso: «' + a2.slice(0, 80) + '» · ducha ' + pct('hito_acc_sanitarios_0'));

// ── 3. Apartamento nuevo: ofrece las cantidades «hay» de otro de la torre ──
await limpiar(); setAmbito('apartamento'); cabecera('Piso 07', 'C');
const a3 = await esperarAviso();
document.querySelector('#aviso-anterior .si')?.click(); await esperar(300);
const pr3 = document.getElementById('pr_hito_acc_electricos_0').value, ej3 = document.getElementById('ej_hito_acc_electricos_0').value;
ok('3 · Apartamento sin informe: copia solo las cantidades «hay» (no las puestas ni los estados)',
   /Empezar desde otro apartamento|Usar los totales/.test(a3) && pr3 === '5' && ej3 === '' && pct('hito_acabados_0') === '—' && document.getElementById('pr_hito_acc_sanitarios_0').value === '2',
   'aviso: «' + a3.slice(0, 60) + '» · tomas hay=' + pr3 + ' puestas=' + ej3 + ' · frisos ' + pct('hito_acabados_0'));

// ── 4. Cuándo NO ofrece ──
await limpiar(); setAmbito('apartamento'); cabecera();
put('pr_hito_acc_electricos_0', '9');                                         // ya hay algo medido
sel('piso', 'Piso 05'); put('apto', 'A'); await esperar(1500);
const conMedida = aviso();
await limpiar(); setAmbito('apartamento'); cabecera('Piso 05', 'A');
await esperarAviso(); document.querySelector('#aviso-anterior .no')?.click(); await esperar(200);
put('apto', 'A '); await esperar(1200); const trasNo = aviso();                 // mismo apartamento: no insiste
put('apto', 'B'); const otro = await esperarAviso();                            // otro: vuelve a ofrecer
put('pr_hito_acc_electricos_1', '4'); saveDraft(true); await esperar(200);   // un borrador que abrir…
const idx = getSavedReports().findIndex(b => b.apto === 'B' && b.piso === 'Piso 05');
Q.aceptar = true; loadDraftData(idx); await esperar(1500); const alEditar = aviso();
ok('4 · No ofrece si ya hay algo medido, ni tras decir «No», ni al abrir un borrador; sí al cambiar de apartamento',
   conMedida === '' && trasNo === '' && otro.length > 0 && alEditar === '',
   'idx=' + idx + ' conMedida=«' + conMedida.slice(0, 20) + '» trasNo=«' + trasNo.slice(0, 20) + '» otro=«' + otro.slice(0, 30) + '» editar=«' + alEditar.slice(0, 20) + '»');

// ── 5. Informe de torre, y el aviso cabe en pantalla ──
await limpiar(); setAmbito('torre'); await esperar(200); cabecera();
await esperar(900); document.querySelector('#aviso-anterior .no')?.click();
setEstado(document.querySelector('.est-btn[data-rid="hito_exteriores_1"][data-v="50"]'), 50);
saveDraft(true); await esperar(200);
await limpiar(); setAmbito('torre'); await esperar(200); cabecera();
const a5 = await esperarAviso();
const r = caja().getBoundingClientRect();
const botones = [...caja().querySelectorAll('button')].map(b => Math.round(b.getBoundingClientRect().height));
document.querySelector('#aviso-anterior .si')?.click(); await esperar(300);
ok('5 · Torre: ofrece el último informe de torre y lo trae; el aviso cabe en ' + innerWidth + ' px con botones ≥ 44 px',
   /Esta torre ya tiene un informe/.test(a5) && pct('hito_exteriores_1') === '50%' && r.right <= innerWidth && botones.every(h => h >= 44),
   'aviso: «' + a5.slice(0, 50) + '» · h12 ' + pct('hito_exteriores_1') + ' · ancho ' + Math.round(r.right) + ' · botones ' + botones.join(','));
