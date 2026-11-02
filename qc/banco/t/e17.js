// ESTRÉS 17 · la planilla con el historial REAL de Drive (avance-torre.json de cada torre, copiado al banco en /reales/ el 2-nov-2026):
// EZ-T08 (lo que vio Liz), EZ-T58 (la que cargó Christian hoy), SR-T04 (nombres mezclados) y SB-D-08 (A07 y A7). En cada una:
// ningún apartamento con historial se pierde ni se repite, salen la PB y del 1 al 15 (o más), y el gris es el último % del archivo.
// Se corre en inspeccion.html?prueba=1 a 375×812.
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem('garmel_reports_list', '[]');
const limpiar = () => Object.keys(localStorage).filter(k => /^garmel_planilla_/.test(k)).forEach(k => localStorage.removeItem(k));
await Q.relevo({ caido: false, fallar: [], lento: 0, colgar: 0, perder: false, borrar: true });
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const E = () => _plEstado();
const TORRES = [['EZ', 'T-08', 'Convenio Bielorrusos'], ['EZ', 'T-58', 'Convenio Bielorrusos'], ['SR', 'T-04', 'Convenio Rusos'], ['SB', 'D-08', 'Convenio Chinos']];
for (const [sector, torre, conv] of TORRES) {
  const real = await (await fetch('/reales/' + sector + '-' + torre + '.json?' + Date.now())).json();
  const informes = {}; Object.keys(real.informes || {}).filter(k => k !== 'TORRE').forEach(k => { informes[k] = real.informes[k]; });
  await Q.relevo({ sembrarAvance: { sector, torre, prueba: true, informes } });
  limpiar(); nuevoFormulario(); await esperar(300); setAmbito('apartamento'); await esperar(200);
  sel('fecha', new Date().toISOString().slice(0, 10)); sel('convenio', conv); sel('torre', torre); await esperar(400);
  { const ins = document.querySelector('.inspector-select'); Q.elegir(ins, [...ins.options].map(o => o.value).filter(Boolean)[0]); await esperar(300); }
  if (!document.querySelector('#estatus .ck-lbl.on')) [...document.querySelectorAll('#estatus .ck-lbl')].find(l => /progreso/.test(l.textContent)).click();
  abrirPlanilla(); await hasta(() => E().P && E().P.origenPrev === 'del archivo', 15000); await esperar(250);
  const P = E().P, keys = P.aptos.map(x => x.k), hist = Object.keys(informes);
  const perdidos = hist.filter(k => keys.indexOf(k) < 0), dup = keys.filter((k, i) => keys.indexOf(k) !== i);
  const maxHist = Math.max(...hist.map(k => +k.slice(1, 3)));
  ok('E17 ' + sector + '-' + torre + ' · Los ' + hist.length + ' apartamentos con historial están todos, sin repetidos', !perdidos.length && !dup.length, 'perdidos ' + perdidos.join(',') + ' · repetidos ' + dup.join(','));
  ok('E17 ' + sector + '-' + torre + ' · Pisos de la PB al ' + Math.max(15, maxHist), P.pisoMin === 0 && P.pisos === Math.max(15, maxHist), P.pisoMin + '–' + P.pisos);
  // El gris: para cada apartamento con historial, cada % del archivo es lo que muestra como anterior.
  const malos = []; hist.forEach(k => { const pc = (informes[k] || {}).pcts || {}; Object.keys(pc).forEach(c => { if (E().P.prev[k] && E().P.prev[k].pcts && E().P.prev[k].pcts[c] !== pc[c]) malos.push(k + ' ' + c); }); });
  ok('E17 ' + sector + '-' + torre + ' · El gris de cada casilla es el último % del archivo', !malos.length, malos.slice(0, 5).join(', '));
  const porPiso = p => P.aptos.filter(x => x.p === p).map(x => x.a).join(',');
  const muestra = sector === 'EZ' ? 'A1,A2,B1,B2' : sector === 'SR' ? 'A7,B7,C7,D7,E7,F7,G7,H7,I7,J7' : 'A07,B07,C07,D07,E07,F07';
  const p7 = porPiso(7).split(',').filter(a => muestra.split(',').indexOf(a) >= 0).join(',');
  ok('E17 ' + sector + '-' + torre + ' · El piso 7 trae su juego completo (' + muestra + ')', p7 === muestra, porPiso(7));
  ok('E17 ' + sector + '-' + torre + ' · Un piso sin informe (el 14) también trae su juego', porPiso(14).split(',').length >= muestra.split(',').length, porPiso(14));
  cerrarPlanilla(); await esperar(200);
}
nuevoFormulario(); localStorage.setItem('garmel_reports_list', '[]'); limpiar();
