// LISTA V2 · tanda 3 de 4 — FOTOS Y ENVÍO (29-sep-2026), en inspeccion.html a 375×812, contra el relevo falso.
localStorage.setItem('garmel_rol', 'inspector');
localStorage.setItem('garmel_clave_envio', 'qc');
const put = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const cabecera = (apto) => {
  if (!document.getElementById('fecha').value) sel('fecha', '2026-09-29');
  sel('torre', 'T-07'); sel('convenio', 'Convenio Bielorrusos');
  const emp = [...document.getElementById('empresa').options].map(o => o.value);
  sel('empresa', emp.find(x => /ALNAVIC/i.test(x)) || emp[1]);
  const insp = document.querySelector('.inspector-select');
  insp.value = [...insp.options].map(o => o.value).filter(Boolean)[0]; insp.dispatchEvent(new Event('change', { bubbles: true }));
  if (apto !== undefined) { sel('piso', 'Piso 04'); put('apto', apto); }
  if (!document.querySelector('#estatus .ck-lbl.on')) document.querySelector('#estatus .ck-lbl').click();
};
const limpiar = async () => { Q.aceptar = true; nuevoFormulario(); await esperar(300); };
const enviar = async () => {
  document.getElementById('btn-enviar-relevo').disabled = false; refrescarEstadoClave();
  await enviarAlRelevo(); await esperar(600);
  await hasta(() => !/Enviando/.test(document.getElementById('sendLog').textContent.split('\n').slice(-1)[0]), 60000);
  await esperar(400);
  return document.getElementById('sendLog').textContent;
};
await Q.relevo({ caido: false, fallar: [], lento: 0, borrar: true });   // cuenta solo los envíos de esta tanda

// ── 11 y 12. Seis fotos en cada uno de los 8 hitos de un informe de torre ──
await limpiar(); setAmbito('torre'); await esperar(200); cabecera();
const hitos = _hitosDelAmbito().map(p => p.id);
let semilla = 1;
for (const pid of hitos) {
  for (let k = 0; k < 6; k++) {
    Q.ponerFotos(document.querySelector('#fslot_' + pid + '_' + k + ' input[type=file]'), [await Q.foto(800, 600, semilla++)]);
  }
}
await hasta(() => hitos.every(pid => [0, 1, 2, 3, 4, 5].every(k => /^data:/.test(document.getElementById('fimg_' + pid + '_' + k)?.src || ''))), 90000, 200);
setEstado(document.querySelector('.est-btn[data-rid="hito_contra_incendio_0"][data-v="100"]'), 100);
const log11 = await enviar();
const env11 = (await Q.envios()).slice(-1)[0];
const nombres = (env11 && env11.fotos) || [];
ok('11 · 48 fotos (6 en cada uno de los 8 hitos de torre, hito 12 incluido) llegan al relevo',
   hitos.length === 8 && nombres.length === 48 && hitos.every(pid => nombres.filter(n => n.indexOf(pid + '-') === 0).length === 6) && env11.datos.lista === 'v2',
   (env11 && env11.numero) + ' · ' + nombres.length + ' fotos · ' + log11.split('\n').slice(-3).join(' '));
ok('12 · Los nombres de las fotos casan con el patrón de limpieza del relevo (hito_[a-z_]+-N), también las del hito 12',
   nombres.length === 48 && nombres.every(n => /^hito_[a-z_]+-[1-6]$/.test(n)), nombres.filter(n => /incendio/.test(n)).join(' '));

// ── 13. El relevo se cae y vuelve ──
await limpiar(); setAmbito('apartamento'); await esperar(150); cabecera('R1');
put('pr_hito_acc_electricos_0', '4'); put('ej_hito_acc_electricos_0', '2');
await Q.relevo({ caido: true });
const nro13 = document.getElementById('nro-display').textContent;
const log13a = await enviar();
const guardado = getSavedReports().find(b => b.nro === nro13);
await Q.relevo({ caido: false });
const log13b = await enviar();
const env13 = (await Q.envios()).filter(e => e.numero === nro13);
ok('13 · Con el relevo caído avisa y el borrador sigue guardado sin enviar; al volver se envía una vez',
   /❌|no se pudo|No se pudo/i.test(log13a) && guardado && !guardado.enviado && /✅/.test(log13b) && env13.length === 1,
   'caído: «' + log13a.split('\n').slice(-1)[0].slice(0, 60) + '» · guardado=' + !!guardado + ' · vuelta: ' + env13.length + ' envío(s)');

// ── 14. Doble toque en Enviar ──
await limpiar(); setAmbito('apartamento'); await esperar(150); cabecera('R2');
setEstado(document.querySelector('.est-btn[data-rid="hito_acabados_0"][data-v="25"]'), 25);
const nro14 = document.getElementById('nro-display').textContent;
await Q.relevo({ lento: 2 });
document.getElementById('btn-enviar-relevo').disabled = false; refrescarEstadoClave();
const p1 = enviarAlRelevo(), p2 = enviarAlRelevo();
await Promise.all([p1, p2]); await esperar(3000);
await Q.relevo({ lento: 0 });
const env14 = (await Q.envios()).filter(e => e.numero === nro14);
ok('14 · Dos toques seguidos en Enviar mandan un solo informe', env14.length === 1, env14.length + ' envío(s) de ' + nro14);

// ── 15. «Enviar todos» con un borrador viejo y uno nuevo ──
const lista = getSavedReports().map(b => Object.assign(b, { enviado: true }));   // lo anterior, dado por enviado
const nuevo = JSON.parse(JSON.stringify(lista[0]));
Object.assign(nuevo, { id: 'mix-v2', nro: 'PRUEBA-EZ-T07-P04M2-260929-QC', enviado: false, lista: 'v2' });
const viejo = { id: 'mix-v1', formType: 'detallado', ambito: 'apartamento', noInspeccionados: [], fecha: '2026-09-28', nro: 'PRUEBA-EZ-T07-P04M1-260928-QC',
                convenio: 'Convenio Bielorrusos', empresa: nuevo.empresa, residentes: [], inspectores: nuevo.inspectores, torre: 'T-07', piso: 'Piso 04', apto: 'M1',
                obs_sp: '', obs_general: '', agentes: [], estatus: nuevo.estatus, extraRows: {}, fotos: {}, fotobs: {}, medicion: 'propuesta', enviado: false,
                partidas: { hito_puertas: [{ pr: '', ej: '3', ev: 'B', ud: 'pza', sn: '', pct: '' }, {}, {}] } };
localStorage.setItem('garmel_reports_list', JSON.stringify(lista.concat([viejo, nuevo])));
Q.aceptar = true;
await enviarPendientes(); await esperar(800);
const envs = await Q.envios();
const e1 = envs.filter(e => e.numero === viejo.nro).slice(-1)[0], e2 = envs.filter(e => e.numero === nuevo.nro).slice(-1)[0];
ok('15 · «Enviar todos» manda el viejo sin marca (el relevo lo lee con las 53) y el nuevo con lista v2',
   e1 && !e1.datos.lista && (e1.datos.partidas.hito_puertas || []).length === 3 && e2 && e2.datos.lista === 'v2',
   'viejo: ' + (e1 ? 'llegó, lista=' + e1.datos.lista : 'no llegó') + ' · nuevo: ' + (e2 ? 'lista=' + e2.datos.lista : 'no llegó'));
