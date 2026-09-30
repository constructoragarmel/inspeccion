// LISTA V2 (29-sep-2026): cinco QC de la medición nueva, en inspeccion.html a 375×812.
// 1 cada forma de medir calcula · 2 guardar y reabrir · 3 un borrador de la lista anterior
// 4 informe de torre y filas fuera de ámbito · 5 el envío lleva la lista y su forma
localStorage.setItem('garmel_rol', 'inspector');
localStorage.setItem('garmel_clave_envio', 'qc');
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const put = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
const pct = rid => (document.getElementById('pct_' + rid).innerText || '').trim();
const cabecera = () => {
  if (!document.getElementById('fecha').value) sel('fecha', '2026-09-29');
  sel('torre', 'T-07'); sel('convenio', 'Convenio Bielorrusos');
  const emp = [...document.getElementById('empresa').options].map(o => o.value);
  sel('empresa', emp.find(x => /ALNAVIC/i.test(x)) || emp[1]);
  const insp = document.querySelector('.inspector-select');
  insp.value = [...insp.options].map(o => o.value).filter(Boolean)[0]; insp.dispatchEvent(new Event('change', { bubbles: true }));
  const res = document.querySelector('#residentes-container input'); if (res) put(res.id || (res.id = 'res0'), 'Ing. Prueba');
  if (!document.querySelector('#estatus .ck-lbl.on')) document.querySelector('#estatus .ck-lbl').click();
};

// ── 1. Cada forma de medir calcula ──
if (typeof setAmbito === 'function') setAmbito('apartamento');
cabecera(); sel('piso', 'Piso 03'); put('apto', 'A');
put('ej_hito_acc_electricos_0', '3'); put('pr_hito_acc_electricos_0', '5');
setEstado(document.querySelector('.est-btn[data-rid="hito_acabados_0"][data-v="75"]'), 75);
setSiNo(document.querySelector('.est-btn[data-rid="hito_pruebas_0"][data-sn="Sí"]'));
setSiNo(document.querySelector('.est-btn[data-rid="hito_pruebas_1"][data-sn="No"]'));
put('pm_hito_cerramientos_1', '40');
const conPm = [...document.querySelectorAll('[id^=pm_]')].map(e => e.id.slice(3)).filter(rid => { const m = rid.match(/^(.*)_(\d+)$/); return m && _aplica(m[1], +m[2]); });
const cantidades = _hitosDelAmbito().reduce((a, p) => a + p.items.filter((_, i) => _aplica(p.id, i) && _pctManualPermitido(p.id, i)).length, 0);
ok('1 · Conteo 3 de 5 = 60 %, estado «Avanzado» = 75 %, Sí = 100 % y No = 0 % (hito 50 %), m² con % escrito = 40 %',
   pct('hito_acc_electricos_0') === '60%' && pct('hito_acabados_0') === '75%' && pct('hito_pruebas_0') === '100%' &&
   pct('hito_pruebas_1') === '0%' && document.getElementById('badge_hito_pruebas').innerText.trim() === '50%' && pct('hito_cerramientos_1') === '40%',
   [pct('hito_acc_electricos_0'), pct('hito_acabados_0'), pct('hito_pruebas_0'), pct('hito_pruebas_1'), pct('hito_cerramientos_1')].join(' '));
ok('1b · El % escrito solo existe en filas de cantidad (m², m³, ml/kg)', conPm.length === cantidades, conPm.join(',') + ' vs ' + cantidades);

// ── 2. Guardar y reabrir ──
saveDraft(true);
await esperar(300);
const lista = getSavedReports();
const idx = lista.length - 1;
const guardado = lista[idx];
Q.aceptar = true; nuevoFormulario(); await esperar(300);
Q.aceptar = true;
loadDraftData(idx);
await esperar(400);
ok('2 · Guardado con lista v2 y reabierto con los mismos valores',
   guardado.lista === 'v2' && document.getElementById('ej_hito_acc_electricos_0').value === '3' &&
   document.getElementById('pr_hito_acc_electricos_0').value === '5' && pct('hito_acabados_0') === '75%' &&
   pct('hito_pruebas_0') === '100%' && pct('hito_pruebas_1') === '0%' && document.getElementById('pm_hito_cerramientos_1').value === '40',
   'lista=' + guardado.lista + ' ej=' + document.getElementById('ej_hito_acc_electricos_0').value + ' acab=' + pct('hito_acabados_0'));

// ── 3. Un borrador de la lista anterior ──
const viejo = JSON.parse(JSON.stringify(guardado));
delete viejo.lista; viejo.id = 'viejo-qc'; viejo.nro = 'PRUEBA-EZ-T07-P03AB-260929-QC'; viejo.apto = 'B';
viejo.partidas = { hito_servicios: [{ pr: '1', ej: '1', sn: 'Sí', pct: '40', ev: 'B', ud: '' }, {}, {}, {}, {}, {}, {}, {}, {}],
                   hito_puertas: [{ pr: '', ej: '3', ev: 'B', ud: 'pza' }, {}, {}] };
localStorage.setItem('garmel_reports_list', JSON.stringify(getSavedReports().concat([viejo])));
const iv = getSavedReports().length - 1;
Q.dialogos = []; Q.aceptar = false;
loadDraftData(iv);
await esperar(200);
const noAbrio = Q.dialogos.some(m => /lista ANTERIOR/.test(m)) && document.getElementById('apto').value !== 'B';
Q.aceptar = true;
loadDraftData(iv);
await esperar(400);
const abrioSinMedir = document.getElementById('apto').value === 'B' && document.getElementById('ej_hito_puertas_0').value === '' &&
                      pct('hito_servicios_0') === '—';
const enviadoViejo = await _enviarUno(viejo, 'qc');
await esperar(500);
const ev = (await Q.envios()).slice(-1)[0];
ok('3 · Borrador anterior: avisa, no se abre si se cancela, se abre sin mediciones si se acepta, y «Enviar todos» lo manda tal cual',
   noAbrio && abrioSinMedir && enviadoViejo && ev && ev.numero === viejo.nro && !ev.datos.lista && (ev.datos.partidas.hito_servicios || []).length === 9,
   'noAbrio=' + noAbrio + ' sinMedir=' + abrioSinMedir + ' enviado=' + enviadoViejo + ' ' + (ev && ev.numero));

// ── 4. Informe de torre y filas fuera de ámbito ──
Q.aceptar = true; nuevoFormulario(); await esperar(300);
setAmbito('torre');
await esperar(200);
const vis = _hitosDelAmbito().map(p => p.id);
put('ej_hito_servicios_4', '1'); put('pr_hito_servicios_4', '1');          // módulo del edificio (torre): 100 %
put('ej_hito_servicios_0', '0'); put('pr_hito_servicios_0', '8');          // aguas blancas (apartamento, oculta): 0 %
const b3 = document.getElementById('badge_hito_servicios').innerText.trim();
ok('4 · Torre: hitos 1, 9, 10 y 12 a la vista, puertas no, y una fila oculta de apartamento no baja el promedio',
   ['hito_estructura', 'hito_ascensor', 'hito_exteriores', 'hito_contra_incendio'].every(h => vis.indexOf(h) >= 0) &&
   vis.indexOf('hito_puertas') < 0 && b3 === '100%', vis.join(',') + ' · hito 3 = ' + b3);

// ── 5. El envío lleva la lista y su forma ──
cabecera();
setEstado(document.querySelector('.est-btn[data-rid="hito_contra_incendio_0"][data-v="50"]'), 50);
document.getElementById('btn-enviar-relevo').disabled = false;
if (typeof refrescarEstadoClave === 'function') refrescarEstadoClave();
await enviarAlRelevo();
await esperar(800); await hasta(() => !/enviando/i.test(document.getElementById('sendLog').textContent), 20000);
const env = (await Q.envios()).slice(-1)[0];
const pd = env && env.datos && env.datos.partidas || {};
ok('5 · Envío de torre: lista v2, 19 filas en servicios, contra incendio al 50 % y las filas de apartamento marcadas fuera de ámbito',
   env && env.datos.lista === 'v2' && env.datos.ambito === 'torre' && (pd.hito_servicios || []).length === 19 &&
   pd.hito_contra_incendio && pd.hito_contra_incendio[0].ej === '50' && pd.hito_servicios[0].fueraDeAmbito === true &&
   !pd.hito_servicios[4].fueraDeAmbito,
   env && (env.numero + ' · lista=' + env.datos.lista + ' · servicios=' + (pd.hito_servicios || []).length));
