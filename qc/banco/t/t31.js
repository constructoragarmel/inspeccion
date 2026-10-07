// PRESUPUESTO Y USO (cambio 152, 30-sep-2026): cinco QC contra el relevo falso.
// El relevo falso deja fuera del presupuesto de la T-07: 8.03, 8.04, 4.10, 4.11, 5.04 y 5.05, y la T-17 no tiene presupuesto.
localStorage.setItem('garmel_rol', 'inspector');
localStorage.setItem('garmel_clave_envio', 'qc');
const put = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const limpiar = async () => { Q.aceptar = true; nuevoFormulario(); await esperar(300); };
const opcionales = () => [...document.querySelectorAll('tr.fuera-presupuesto')].map(tr => tr.querySelector('[id^="pct_"]').id.slice(4)).sort();
const esperadas = ['hito_acabados_10', 'hito_acabados_9', 'hito_acc_electricos_2', 'hito_acc_electricos_3', 'hito_puertas_3', 'hito_puertas_4'].sort();
const cabecera = (torre, piso, apto) => {
  sel('fecha', '2026-09-30'); sel('torre', torre); sel('convenio', 'Convenio Bielorrusos');
  const insp = document.querySelector('.inspector-select');
  insp.value = [...insp.options].map(o => o.value).filter(Boolean)[0]; insp.dispatchEvent(new Event('change', { bubbles: true }));
  if (!document.querySelector('#estatus .ck-lbl.on')) document.querySelector('#estatus .ck-lbl').click();
  if (piso) { sel('piso', piso); put('apto', apto); }
};
await Q.relevo({ caido: false, fallar: [], lento: 0, borrar: true });
Object.keys(localStorage).filter(k => /^garmel_aplica_/.test(k)).forEach(k => localStorage.removeItem(k));
localStorage.setItem('garmel_reports_list', '[]');

// ── 1. Al elegir la torre, lo que no está en su presupuesto queda «opcional» ──
await limpiar(); setAmbito('apartamento'); cabecera('T-07');
await hasta(() => opcionales().length > 0, 10000, 100);
const o1 = opcionales();
const tag = document.querySelector('tr.fuera-presupuesto .opcional-tag')?.innerText || '';
ok('1 · T-07: exactamente las 6 subpartidas fuera del presupuesto quedan marcadas «opcional», con el nombre de la contratista',
   JSON.stringify(o1) === JSON.stringify(esperadas) && /No está en el presupuesto de Alnavic \(falso\) · opcional/.test(tag),
   o1.join(',') + ' · «' + tag + '»');

// ── 2. Sin señal usa lo guardado en el teléfono ──
await Q.relevo({ caido: true });
await limpiar(); setAmbito('apartamento'); cabecera('T-07'); await esperar(1500);
const o2 = opcionales();
await Q.relevo({ caido: false });
ok('2 · Con el relevo caído, la marca sale igual de lo que el teléfono guardó', JSON.stringify(o2) === JSON.stringify(esperadas), o2.length + ' marcadas');

// ── 3. Una torre sin presupuesto no marca nada, y volver a la T-07 vuelve a marcar ──
sel('torre', 'T-17'); await esperar(1500);
const o3 = opcionales();
sel('torre', 'T-07'); sel('convenio', 'Convenio Bielorrusos');   // la T-07 está en dos zonas: al cambiar de torre se vuelve a elegir
await hasta(() => opcionales().length === 6, 8000, 100);
ok('3 · T-17 (sin presupuesto): ninguna fila opcional; al volver a la T-07, las 6 otra vez', o3.length === 0 && opcionales().length === 6,
   'T-17: ' + o3.length + ' · T-07: ' + opcionales().length);

// ── 4. Se mantiene al redibujar: cambiar de ámbito, abrir un borrador ──
setAmbito('torre'); await esperar(200); setAmbito('apartamento'); await esperar(200);
const tras = opcionales().length;
put('pr_hito_acc_electricos_0', '4'); put('ej_hito_acc_electricos_0', '2'); sel('piso', 'Piso 02'); put('apto', 'Q');
currentEditingIndex = null; _idEnEdicion = null; saveDraft(true); await esperar(200);
await limpiar(); await esperar(200);
const limpio = opcionales().length;
loadDraftData(getSavedReports().findIndex(b => b.apto === 'Q')); await hasta(() => opcionales().length === 6, 8000, 100);
ok('4 · Cambiar de ámbito las conserva, «Limpiar todo» las quita y abrir un borrador de la T-07 las vuelve a poner',
   tras === 6 && limpio === 0 && opcionales().length === 6, 'tras ámbito ' + tras + ' · limpio ' + limpio + ' · borrador ' + opcionales().length +
   ' · convenio «' + document.getElementById('convenio').value + '» zona «' + _torreConZona() + '» borradores Q: ' + getSavedReports().filter(b => b.apto === 'Q').map(b => (b.convenio || '—') + '/' + b.torre).join(' '));

// ── 5. El uso viaja en el informe, sin nada a la vista ──
await limpiar(); setAmbito('apartamento'); cabecera('T-07', 'Piso 03', 'U');
await hasta(() => !!document.querySelector('#aviso-anterior .si'), 10000, 100);
document.querySelector('#aviso-anterior .si')?.click(); await esperar(300);   // trae el «hay» del Q
put('ej_hito_acc_electricos_0', '3'); await esperar(1100);
setEstado(document.querySelector('.est-btn[data-rid="hito_acabados_0"][data-v="50"]'), 50); await esperar(1100);
put('pr_hito_acc_sanitarios_0', '2'); put('ej_hito_acc_sanitarios_0', '2');
const d5 = getFormData();
const u = d5.uso || {};
const medidas = _hitosDelAmbito().reduce((a, h) => a + (d5.partidas[h.id] || []).filter(r => r && !r.fueraDeAmbito && (['pr', 'ej', 'sn', 'pct'].some(k => String(r[k] || '').trim()) || r.ev)).length, 0);
const visible = /minutos activos|filas vac[ií]as|filas medidas/i.test(document.body.innerText);
ok('5 · El informe lleva el uso (tiempo activo, filas medidas y vacías, si se trajo el anterior) y nada de eso se ve en pantalla',
   u.segundos >= 2 && u.medidas === medidas && u.medidas + u.vacias === 50 && u.anterior === 'hay' && !visible,
   JSON.stringify({ segundos: u.segundos, medidas: u.medidas, vacias: u.vacias, anterior: u.anterior, esperadas: medidas, visible: visible }));
