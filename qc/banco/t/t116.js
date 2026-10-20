// TANDA 116 · v180 (20-oct-2026, cambio 193, comun/pantalla_encendida.js): el teléfono no se duerme mientras envía. Pedido de
// Diego Orta. Corre en los cuatro formularios (?prueba=1), a la vista. El Wake Lock del navegador se sustituye por uno que cuenta
// pedidos y liberaciones. Sin datos reales.
// 1 durante «Enviar todos» sale arriba «Mantenga la app abierta y el teléfono desbloqueado hasta que termine», se pide
// wakeLock('screen') una vez y al terminar se suelta y el aviso se va · 2 si el bloqueo se pierde (la página se ocultó) y vuelve a
// verse con el envío en curso, se pide otra vez · 3 si se cancela antes de enviar no hay aviso ni bloqueo · 4 sin Wake Lock en el
// navegador sale el aviso, el envío termina y no hay error · 5 un envío cortado a la mitad (el relevo archivó, la respuesta no
// llegó) queda enviado y el siguiente «Enviar todos» no lo repite · 6 el envío de uno solo también lo hace · 7 el aviso cabe a
// 375 px.
const OBRA = typeof enviarPendientes === 'function';
const CL = OBRA ? 'garmel_reports_list' : CLAVE_LISTA;
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem(CL, '[]');
if (!OBRA) { localStorage.removeItem(CLAVE_TORRES); localStorage.removeItem(CLAVE_ACTUAL); }
Q.aceptar = true;
await Q.relevo({ caido: false, fallar: [], lento: 0, colgar: 0, perder: false, borrar: true });
const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const HOY = iso(new Date());
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); };
// El Wake Lock de mentira
const W = { pedidos: 0, soltados: 0, vivos: [] };
const conLock = () => Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: { request: async t => {
  W.pedidos++; const s = { tipo: t, l: [], addEventListener(e, f){ this.l.push(f); }, release(){ if (this.fuera) return Promise.resolve(); this.fuera = true; W.soltados++; this.l.forEach(f => f()); return Promise.resolve(); } };
  W.vivos.push(s); return s; } } });
const sinLock = () => Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: undefined });
const reiniciar = () => { W.pedidos = 0; W.soltados = 0; W.vivos = []; };
const aviso = () => document.getElementById('aviso-envio193');

// Los informes: obra con la forma de t101; los otros tres, hechos en pantalla como molde.
let molde = null;
if (!OBRA) {
  const insp = () => { const i = document.querySelector('#inspectores select'); Q.elegir(i, [...i.options].map(o => o.value).filter(Boolean)[0]); };
  const est = () => { const e = $('#estatus'); if (e && e.tagName === 'SELECT') sel('estatus', [...e.options].map(o => o.value).filter(Boolean)[0]); };
  nuevoInforme(); await esperar(300); sel('convenio', 'Convenio Bielorrusos'); await esperar(150);
  sel('torre', [...document.getElementById('torre').options].map(o => o.value).filter(v => v && v !== 'ZONA')[0]); await esperar(400);
  if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
  insp(); sel('fecha', HOY); est();
  const it = document.querySelector('[id^="items-"] .item'), si = [...it.querySelectorAll('button')].find(b => /^S[ií]$/i.test(b.textContent.trim()));
  if (si) si.click(); else { const c = it.querySelector('.cant'); c.value = '5'; c.dispatchEvent(new Event('input', { bubbles: true })); }
  guardar(false); await esperar(300); molde = listaGuardada()[0]; localStorage.setItem(CL, '[]'); nuevoInforme(); await esperar(200);
}
if (OBRA) { localStorage.removeItem('garmel_actual'); nuevoFormulario(); await esperar(300); }   // nada en pantalla que «Enviar todos» guarde y mande
const P = (pr, ej) => ({ pr: pr, ej: ej, ev: 'B', ud: 'pto', sn: '', pct: '' });
const informe = (i, o) => OBRA
  ? Object.assign({ lista: 'v2', formType: 'detallado', ambito: 'apartamento', vista: '', fecha: HOY, convenio: 'Convenio Bielorrusos', empresa: 'DRIJECAE 3003, C.A.',
      torre: 'T-52', piso: 'Piso 0' + i, apto: 'B1', inspectores: ['Inspectora Prueba (CIV-1)'], residentes: [], estatus: ['Iniciada'], fotos: {}, fotobs: {}, noInspeccionados: [],
      extraRows: {}, partidas: { hito_servicios: [P('11', '11')] }, id: 'draft_' + (Date.now() - i * 1000), nro: 'PRUEBA-EZ-T52-P0' + i + 'AB1-W' + i }, o || {})
  : Object.assign(JSON.parse(JSON.stringify(molde)), { id: String(molde.id).split('_')[0] + '_' + (Date.now() - i * 1000), nro: molde.nro + '-W' + i, enviado: undefined }, o || {});
const poner = l => { localStorage.setItem(CL, JSON.stringify(l)); if (OBRA) { currentEditingIndex = null; _idEnEdicion = null; } };
const lista = () => JSON.parse(localStorage.getItem(CL) || '[]');
const todos = () => OBRA ? enviarPendientes() : enviar();
Q.envios = (orig => async () => (await orig()).filter(e => /-W\d$/.test(e.numero || '')))(Q.envios);   // solo los envíos de esta tanda

// 1 y 7
conLock(); reiniciar(); poner([informe(1), informe(2)]);
await Q.relevo({ colgar: 2 });
let e0 = (await Q.envios()).length; Q.dialogos = [];
let p = todos(); await hasta(() => aviso(), 8000);
const txt1 = aviso() ? aviso().textContent : '', ped1 = W.pedidos;
const r7 = aviso() ? aviso().getBoundingClientRect() : null;
await p; await hasta(() => !_tandaEnCurso, 30000); await esperar(300);
ok('1 · Durante «Enviar todos» sale «Mantenga la app abierta y el teléfono desbloqueado hasta que termine», se pide wakeLock(\'screen\') una vez, y al terminar se suelta y el aviso se va',
   /Mantenga la app abierta y el teléfono desbloqueado hasta que termine/.test(txt1) && ped1 === 1 && W.vivos[0] && W.vivos[0].tipo === 'screen' &&
   W.soltados === W.pedidos && !aviso() && (await Q.envios()).length - e0 === 2,
   'aviso «' + txt1.slice(0, 50) + '» · pedidos ' + ped1 + '/' + W.pedidos + ' · soltados ' + W.soltados + ' · envíos ' + ((await Q.envios()).length - e0));
ok('7 · El aviso cabe a ' + innerWidth + ' px y queda arriba, encima del cartel de envío', !!r7 && r7.left >= 0 && r7.right <= innerWidth && r7.top < 40, r7 ? JSON.stringify([r7.left, r7.right, r7.top].map(Math.round)) : 'sin aviso');

// 2
reiniciar(); poner([informe(1), informe(2)]);
p = todos(); await hasta(() => aviso() && W.vivos.length, 8000);
W.vivos[0].release();                                  // la página se ocultó: el navegador suelta el bloqueo
document.dispatchEvent(new Event('visibilitychange'));  // y vuelve a verse
await hasta(() => W.pedidos >= 2, 3000);
const ped2 = W.pedidos;
await p; await hasta(() => !_tandaEnCurso, 30000); await esperar(300);
ok('2 · Si el bloqueo se pierde y la página vuelve a verse con el envío en curso, se pide otra vez; al final no queda ninguno', ped2 === 2 && W.vivos.every(s => s.fuera) && !aviso(),
   'pedidos ' + ped2 + ' · vivos ' + W.vivos.filter(s => !s.fuera).length);
await Q.relevo({ colgar: 0 });

// 3
reiniciar(); e0 = (await Q.envios()).length;
if (OBRA) { poner([informe(1)]); Q.aceptar = false; Q.dialogos = []; await enviarPendientes(); Q.aceptar = true; }
else { const v = informe(1); v.general.forEach(g => g.items.forEach(i => { i.sn = ''; i.cant = ''; })); v.apartamentos = []; v.incidencias = []; poner([v]);
       Q.aceptar = false; Q.dialogos = []; await enviarSolo(v.id); Q.aceptar = true; }
await esperar(300);
ok('3 · Si se cancela antes de enviar no hay aviso ni bloqueo, ni envío', W.pedidos === 0 && !aviso() && (await Q.envios()).length === e0, 'pedidos ' + W.pedidos + ' · ' + Q.dialogos.map(d => d.slice(0, 40)).join(' | '));

// 4
sinLock(); reiniciar(); poner([informe(3)]); e0 = (await Q.envios()).length;
await Q.relevo({ colgar: 1 });
p = todos(); const vio4 = await hasta(() => aviso(), 8000);
await p; await hasta(() => !_tandaEnCurso, 30000); await esperar(300);
await Q.relevo({ colgar: 0 });
ok('4 · Sin Wake Lock en el navegador sale el aviso igual, el envío termina y no hay error', vio4 && !aviso() && (await Q.envios()).length - e0 === 1 && lista().every(b => b.enviado),
   'aviso ' + vio4 + ' · envíos ' + ((await Q.envios()).length - e0));
conLock();

// 5 · cortado a la mitad
reiniciar(); poner([informe(4), informe(5)]); e0 = (await Q.envios()).length;
const plazo = PLAZO_ENVIO_MS, reint = _REINTENTO_EXISTE_MS;
PLAZO_ENVIO_MS = 1000; _REINTENTO_EXISTE_MS = 300;
await Q.relevo({ colgar: 3 });
Q.dialogos = []; await todos(); await hasta(() => !_tandaEnCurso, 40000); await esperar(3500);
await Q.relevo({ colgar: 0 }); PLAZO_ENVIO_MS = plazo; _REINTENTO_EXISTE_MS = reint;
const n5a = (await Q.envios()).length - e0, env5a = lista().every(b => b.enviado);
Q.dialogos = []; await todos(); await hasta(() => !_tandaEnCurso, 20000); await esperar(400);
const n5b = (await Q.envios()).length - e0;
ok('5 · Cortado a la mitad (el relevo archivó, la respuesta no llegó): quedan enviados, y el siguiente «Enviar todos» no repite nada',
   n5a === 2 && env5a && n5b === 2 && W.soltados === W.pedidos && !aviso(), 'envíos ' + n5a + ' → ' + n5b + ' · enviados ' + env5a + ' · ' + Q.dialogos.map(d => d.replace(/\n/g, ' ').slice(0, 50)).join(' | '));

// 6 · uno solo
reiniciar(); poner([informe(6)]); e0 = (await Q.envios()).length;
await Q.relevo({ colgar: 1 });
if (OBRA) { loadDraftData(0); await esperar(500); openSend(); await esperar(200); document.getElementById('claveEnvio').value = 'qc'; document.getElementById('btn-enviar-relevo').disabled = false; p = enviarAlRelevo(); }
else p = enviarSolo(lista()[0].id);
const vio6 = await hasta(() => aviso(), 8000), ped6 = W.pedidos;
await p; await hasta(() => !_tandaEnCurso, 20000); await esperar(400);
await Q.relevo({ colgar: 0 });
ok('6 · El envío de uno solo también muestra el aviso y pide el bloqueo, y al terminar los suelta', vio6 && ped6 === 1 && W.soltados === 1 && !aviso() && (await Q.envios()).length - e0 === 1,
   'aviso ' + vio6 + ' · pedidos ' + ped6 + ' · soltados ' + W.soltados);
if (OBRA) { try { closeSend(); } catch (e) {} nuevoFormulario(); localStorage.removeItem('garmel_actual'); }
localStorage.setItem(CL, '[]');
