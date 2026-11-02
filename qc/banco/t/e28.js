// ESTRÉS 28 · Torre completa trae sola lo acumulado (2-nov-2026, Leidy en la T-16, por Diego: «¿no debería venir acumulado eso cuando
// se carga la información de la torre?»). Se siembra en el relevo falso el informe de torre REAL del 21-oct (EZ-T16-261021-LV, con
// «Construcción de paredes exteriores» al 89 %). Se corre en inspeccion.html?prueba=1 a 375×812.
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem('garmel_reports_list', '[]');
localStorage.removeItem('garmel_actual');
Q.aceptar = true;
await Q.relevo({ caido: false, fallar: [], lento: 0, colgar: 0, perder: false, cortar: 0, borrar: true });
const real = await (await fetch('/reales/EZ-T16-torre-261021.json?' + Date.now())).json();
await fetch(RELEVO_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ clave: 'qc', numero: real.nro, ambito: 'torre', datos: real }) });
const HOY = new Date().toISOString().slice(0, 10);
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const pm = () => (document.getElementById('pm_hito_cerramientos_0') || {}).value;
const caja = () => document.getElementById('aviso-anterior');
const heredadas = () => document.querySelectorAll('#main-content tr.heredada').length;
const guardadosT16 = () => getSavedReports().filter(b => b.ambito === 'torre' && b.torre === 'T-16');
const cabecera = async (amb, torre) => {
  nuevoFormulario(); await esperar(300); setAmbito(amb); await esperar(250);
  sel('fecha', HOY); sel('convenio', 'Convenio Bielorrusos'); sel('torre', torre); await esperar(1500);
  { const ins = document.querySelector('.inspector-select'); Q.elegir(ins, [...ins.options].map(o => o.value).filter(Boolean)[0]); await esperar(200); }
  if (!document.querySelector('#estatus .ck-lbl.on')) [...document.querySelectorAll('#estatus .ck-lbl')].find(l => /progreso/.test(l.textContent)).click();
};

// ── A1 · Torre completa, T-16 en blanco: llega solo el 89 % del 21-oct, marcado fila por fila, con el aviso y «Empezar vacío» ──
await cabecera('torre', 'T-16');
const b = caja().querySelector('button.no');
ok('A1 · Al elegir la T-16 en Torre completa llega solo lo del 21-oct: paredes exteriores 89 %, «De la visita anterior · Sigue igual» y «Empezar vacío»',
   pm() === '89' && heredadas() > 5 && /Se trajo lo acumulado/.test(caja().textContent) && /21/.test(caja().textContent) && !!b && /Empezar vac/.test(b.textContent) && b.offsetHeight >= 32,
   'pm ' + pm() + ' · heredadas ' + heredadas() + ' · ' + caja().textContent.slice(0, 110));
// ── A2 · Sin tocar nada no queda borrador: ni a los 2 s, ni al salir de la app ──
await esperar(2600);
Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); await esperar(300); delete document.hidden;
ok('A2 · Abrir la torre para mirarla no deja un informe guardado (ni autoguardado ni al salir)', guardadosT16().length === 0, guardadosT16().map(x => x.nro).join(','));
// ── A3 · «Empezar vacío» quita todo lo traído ──
b.click(); await esperar(300);
ok('A3 · «Empezar vacío» deja el informe en blanco, sin marcas ni aviso', !pm() && heredadas() === 0 && !caja().textContent.trim() && !_hayMediciones());
// ── A4 · Se eligió mal la torre: sin tocar nada, al cambiarla se va lo de la otra; al volver, vuelve ──
await cabecera('torre', 'T-16');
const antes = pm();
sel('torre', 'T-17'); await esperar(1500);
const enT17 = pm(), marcasT17 = heredadas(), avisoT17 = caja().textContent;
sel('torre', 'T-16'); await esperar(1500);
ok('A4 · Cambiar de torre sin tocar nada quita lo traído (T-17 sin informe queda en blanco) y al volver a la T-16 llega otra vez',
   antes === '89' && !enT17 && marcasT17 === 0 && !/acumulado/.test(avisoT17) && pm() === '89', antes + ' → ' + enT17 + ' (' + marcasT17 + ') → ' + pm());
// ── A5 · Tocado (un «Sigue igual»), ya es de esta visita: se guarda y cambiar de torre no lo borra ──
document.querySelector('#main-content tr.heredada .sigue-igual').click(); await esperar(2800);
const g5 = guardadosT16();
sel('torre', 'T-17'); await esperar(1500);
ok('A5 · Tocado una vez: el borrador se guarda con lo traído, y cambiar la torre ya no borra nada', g5.length === 1 && JSON.stringify(g5[0].partidas).indexOf('"89"') > 0 && pm() === '89' && !g5[0]._soloTraido,
   'guardados ' + g5.length + ' · pm ' + pm());
localStorage.setItem('garmel_reports_list', '[]');
// ── A6 · Escribir una medición también cuenta como tocado ──
await cabecera('torre', 'T-16');
{ const e = document.getElementById('pm_hito_cerramientos_0'); e.value = '92'; e.dispatchEvent(new Event('input', { bubbles: true })); }
await esperar(2800);
ok('A6 · Corregir el 89 por 92 lo vuelve de esta visita y se autoguarda', _autoTraidoEstado().tocado && guardadosT16().length === 1 && JSON.stringify(guardadosT16()[0].partidas).indexOf('"92"') > 0);
localStorage.setItem('garmel_reports_list', '[]');
// ── A7 · Pasar a «Estructura» o a apartamento sin tocar nada quita lo traído de Torre completa ──
await cabecera('torre', 'T-16'); const a7 = pm();
setAmbito('estructura'); await esperar(1500);
const enEstr = pm(), hayEstr = _hayMediciones();
await cabecera('torre', 'T-16'); setAmbito('apartamento'); await esperar(1500);
ok('A7 · Lo traído solo en Torre completa se quita al pasar a «Estructura» o a apartamento', a7 === '89' && !enEstr && !hayEstr && !_hayMediciones(), a7 + ' · estr ' + enEstr + '/' + hayEstr + ' · apto ' + _hayMediciones());
// ── A8 · En «Estructura» sigue siendo una oferta, no se trae solo ──
await cabecera('estructura', 'T-16');
ok('A8 · En «Estructura» no se trae nada solo', !_hayMediciones() && !/acumulado/.test(caja().textContent), caja().textContent.slice(0, 90));
// ── A9 · Teléfono a 375: el aviso entra sin desbordar ──
await cabecera('torre', 'T-16');
const r = caja().getBoundingClientRect();
ok('A9 · A 375 el aviso cabe en el ancho', r.width > 0 && r.right <= innerWidth + 1 && document.documentElement.scrollWidth <= innerWidth + 1, Math.round(r.right) + ' / ' + innerWidth);
localStorage.setItem('garmel_reports_list', '[]'); nuevoFormulario();
