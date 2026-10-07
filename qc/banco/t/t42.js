// V100 (30-sep-2026): las subpartidas que decidió la Ing. Beatriz Sevilla, en inspeccion.html a 375×812.
// 1 torre: las nuevas a la vista y el hito 12 con gabinetes y extintores · 2 apartamento: las suyas
// 3 ascensor: compra y llegada, Sí / No · 4 un borrador de antes (hito 12 con 5 filas) se reacomoda
// 5 la visita anterior de antes también · 6 el envío de torre lleva las filas nuevas
localStorage.setItem('garmel_rol', 'inspector');
localStorage.setItem('garmel_clave_envio', 'qc');
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const put = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
const limpiar = async () => { Q.aceptar = true; nuevoFormulario(); await esperar(300); };
const pct = rid => (document.getElementById('pct_' + rid)?.innerText || '').trim();
const cabecera = () => {
  if (!document.getElementById('fecha').value) sel('fecha', '2026-09-30');
  sel('torre', 'T-07'); sel('convenio', 'Convenio Bielorrusos');
  const emp = [...document.getElementById('empresa').options].map(o => o.value);
  sel('empresa', emp.find(x => /ALNAVIC/i.test(x)) || emp[1]);
  const insp = document.querySelector('.inspector-select');
  insp.value = [...insp.options].map(o => o.value).filter(Boolean)[0]; insp.dispatchEvent(new Event('change', { bubbles: true }));
  const res = document.querySelector('#residentes-container input'); if (res) put(res.id || (res.id = 'res0'), 'Ing. Prueba');
  if (!document.querySelector('#estatus .ck-lbl.on')) document.querySelector('#estatus .ck-lbl').click();
};
const visibles = () => {
  const out = [];
  _hitosDelAmbito().forEach(p => p.items.forEach((_, i) => { if (_aplica(p.id, i)) out.push(CODIGOS_SUB[p.id][i]); }));
  return out;
};
const viejo12 = () => [{ ev: '', ej: '50', pr: '', sn: '', pct: '' },   // 12.01 montante (retirado)
                       { pr: '4', ej: '2', ev: '', sn: '', pct: '' },   // 12.02 gabinetes: 2 de 4
                       { pr: '6', ej: '6', ev: '', sn: '', pct: '' },   // 12.03 extintores: 6 de 6
                       { ev: '', ej: '75', pr: '', sn: '', pct: '' },   // 12.04 detección (retirada)
                       { pr: '1', ej: '0', ev: '', sn: '', pct: '' }];  // 12.05 siamesa (retirada)

// ── 1. Torre ──
await limpiar(); setAmbito('torre'); await esperar(200); cabecera();
const vT = visibles();
const nuevasT = ['1.04', '1.05', '1.06', '4.13', '5.07', '7.08', '8.08', '8.09', '9.05', '9.06', '10.08'];
const doce = vT.filter(c => /^12\./.test(c));
const nombres12 = (PARTIDAS.find(p => p.id === 'hito_contra_incendio') || {}).items || [];
ok('1 · Torre: las 11 nuevas a la vista, las de solo apartamento no, y el hito 12 con gabinetes y extintores (12.02 y 12.03)',
   nuevasT.every(c => vT.indexOf(c) >= 0) && vT.indexOf('5.08') < 0 && vT.indexOf('7.09') < 0 &&
   doce.join(',') === '12.02,12.03' && nombres12.join('|') === 'Gabinetes de manguera|Extintores' && vT.length === 58,
   vT.length + ' filas · nuevas que faltan: ' + nuevasT.filter(c => vT.indexOf(c) < 0).join(',') + ' · hito 12: ' + doce.join(',') + ' (' + nombres12.join(', ') + ')');

// ── 2. Apartamento ──
setAmbito('apartamento'); await esperar(200);
const vA = visibles();
ok('2 · Apartamento: piso de cemento, carpintería metálica, instalación de calentadores y de extractores; nada de lo de torre',
   ['4.13', '5.08', '7.09', '8.09'].every(c => vA.indexOf(c) >= 0) && ['1.04', '5.07', '7.08', '9.05', '10.08'].every(c => vA.indexOf(c) < 0) &&
   vA.length === 50, vA.length + ' filas · ' + ['4.13', '5.08', '7.09', '8.09'].map(c => c + (vA.indexOf(c) >= 0 ? '✓' : '✗')).join(' '));

// ── 3. Ascensor ──
setAmbito('torre'); await esperar(200);
const b95 = document.querySelector('.est-btn[data-rid="hito_ascensor_4"][data-sn="Sí"]');
const b96 = document.querySelector('.est-btn[data-rid="hito_ascensor_5"][data-sn="No"]');
if (b95) setSiNo(b95); if (b96) setSiNo(b96);
ok('3 · Ascensor: «compra del equipo» y «equipo en obra» son Sí / No (Sí = 100 %, No = 0 %)',
   !!b95 && !!b96 && pct('hito_ascensor_4') === '100%' && pct('hito_ascensor_5') === '0%',
   'botones ' + !!b95 + '/' + !!b96 + ' · ' + pct('hito_ascensor_4') + ' ' + pct('hito_ascensor_5'));

// ── 4. Un borrador de antes ──
await limpiar(); setAmbito('torre'); await esperar(200); cabecera();
currentEditingIndex = null; _idEnEdicion = null; saveDraft(true); await esperar(300);
const lst = JSON.parse(localStorage.getItem('garmel_reports_list') || '[]');
lst[0].partidas = lst[0].partidas || {};
lst[0].partidas.hito_contra_incendio = viejo12();
localStorage.setItem('garmel_reports_list', JSON.stringify(lst));
await limpiar(); await esperar(200);
loadDraftData(0); await esperar(500);
ok('4 · Un borrador hecho antes (hito 12 con 5 filas) se abre con gabinetes 2 de 4 = 50 % y extintores 100 %',
   pct('hito_contra_incendio_0') === '50%' && pct('hito_contra_incendio_1') === '100%' && !document.getElementById('pct_hito_contra_incendio_2'),
   'gabinetes ' + pct('hito_contra_incendio_0') + ' · extintores ' + pct('hito_contra_incendio_1'));

// ── 5. La visita anterior de antes ──
await limpiar(); setAmbito('torre'); await esperar(200); cabecera();
_traerMediciones({ hito_contra_incendio: viejo12() }, false); await esperar(300);
ok('5 · Lo traído de una visita anterior con el hito 12 viejo cae en gabinetes y extintores, no en otra fila',
   pct('hito_contra_incendio_0') === '50%' && pct('hito_contra_incendio_1') === '100%',
   'gabinetes ' + pct('hito_contra_incendio_0') + ' · extintores ' + pct('hito_contra_incendio_1'));

// ── 6. El envío ──
await Q.relevo({ caido: false, fallar: [], lento: 0, borrar: true });
await limpiar(); setAmbito('torre'); await esperar(200); cabecera();
setEstado(document.querySelector('.est-btn[data-rid="hito_estructura_4"][data-v="50"]'), 50);   // 1.05 escaleras: suministro
setSiNo(document.querySelector('.est-btn[data-rid="hito_ascensor_4"][data-sn="Sí"]'));         // 9.05 comprado
put('pr_hito_puertas_6', '2'); put('ej_hito_puertas_6', '1');                                  // 5.07 puertas de vidrio de PB
document.getElementById('btn-enviar-relevo').disabled = false;
if (typeof refrescarEstadoClave === 'function') refrescarEstadoClave();
await enviarAlRelevo();
await esperar(800); await hasta(() => !/enviando/i.test(document.getElementById('sendLog').textContent), 20000);
const env = (await Q.envios()).slice(-1)[0];
const pd = env && env.datos && env.datos.partidas || {};
ok('6 · El envío de torre lleva 6 filas en estructura y en ascensor, 8 en puertas y 2 en contra incendio, con lo medido en su lugar',
   (pd.hito_estructura || []).length === 6 && pd.hito_estructura[4].ej === '50' && (pd.hito_ascensor || []).length === 6 &&
   /S/.test(pd.hito_ascensor[4].sn || '') && (pd.hito_puertas || []).length === 9 && pd.hito_puertas[6].ej === '1' &&
   (pd.hito_contra_incendio || []).length === 2,
   env ? (env.numero + ' · estructura ' + (pd.hito_estructura || []).length + ' · ascensor[4].sn=' + (pd.hito_ascensor && pd.hito_ascensor[4].sn) +
          ' · puertas ' + (pd.hito_puertas || []).length + ' · h12 ' + (pd.hito_contra_incendio || []).length) : 'sin envío');
