// TANDA 113 · v180 (20-oct-2026, comun/antes_de_enviar.js): lo que no debe salir en «Enviar todos», en servicios.html, sha.html y
// urbanismo.html (?prueba=1). El mismo teléfono que t112, sin apartamentos (aquí no aplica): cuatro informes con fecha 5-oct hechos
// el 13-oct, uno sin nada medido y uno de hoy. Sin datos reales. La fecha se pregunta al elegirla (t115), no aquí.
// 1 «Enviar» no pregunta la fecha, manda los cuatro y el de hoy, no el vacío, y el aviso final dice cuál no salió y qué hacer ·
// 2 en «Informes» el vacío lleva la marca, los demás no, y nada se sale · 3 «📤 Enviar» de uno vacío pregunta: «Cancelar» no lo
// manda, «Aceptar» sí · 4 qué es «nada medido» en este formulario · 5 un informe de hoy bien hecho sale sin ninguna pregunta nueva ·
// 6 «Guardar» un informe del 5-oct no pregunta la fecha.
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem(CLAVE_LISTA, '[]');
localStorage.removeItem(CLAVE_TORRES); localStorage.removeItem(CLAVE_ACTUAL);
Q.aceptar = true;
await Q.relevo({ caido: false, fallar: [], lento: 0, colgar: 0, perder: false, borrar: true });
const TIPO = TIPO_INFORME, SHA = TIPO === 'sha', URB = TIPO === 'urbanismo';
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); };
const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const HOY = iso(new Date());
const C13 = new Date(2026, 9, 13, 10, 0).getTime();
const insp = () => { const i = document.querySelector('#inspectores select'); Q.elegir(i, [...i.options].map(o => o.value).filter(Boolean)[0]); };
const est = () => { const e = $('#estatus'); if (e && e.tagName === 'SELECT') sel('estatus', [...e.options].map(o => o.value).filter(Boolean)[0]); };
const contestar = () => {
  const it = document.querySelector('[id^="items-"] .item');
  const si = [...it.querySelectorAll('button')].find(b => /^S[ií]$/i.test(b.textContent.trim()));
  if (si) si.click(); else { const c = it.querySelector('.cant'); c.value = '5'; c.dispatchEvent(new Event('input', { bubbles: true })); }
};
const pantalla = async () => {
  nuevoInforme(); await esperar(300);
  sel('convenio', 'Convenio Bielorrusos'); await esperar(150);
  const t = [...document.getElementById('torre').options].map(o => o.value).filter(v => v && v !== 'ZONA')[0];
  sel('torre', t); await esperar(400); if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
  insp(); sel('fecha', HOY); est(); contestar();
};
await pantalla(); guardar(false); await esperar(300);
const molde = listaGuardada()[0];
ok('0 · El molde se guardó con una respuesta', !!molde && !_nadaMedido192(molde), molde && molde.nro);
const pref = String(molde.id).split('_')[0];
const hacer = (i, o) => Object.assign(JSON.parse(JSON.stringify(molde)), { id: pref + '_' + (C13 + i * 60000), fecha: '2026-10-05', nro: molde.nro + '-Q' + i, enviado: undefined }, o || {});
const vaciar = b => { b.general.forEach(g => g.items.forEach(i => { i.sn = ''; i.cant = ''; i.camiones = []; i.maquinaria = ''; })); b.apartamentos = []; b.incidencias = []; b.obstaculos = []; return b; };
const telefono = () => [hacer(1), hacer(2), hacer(3), hacer(4), vaciar(hacer(5)), hacer(6, { fecha: HOY, id: pref + '_' + (Date.now() - 60000), nro: molde.nro + '-HOY' })];
const poner = l => { localStorage.setItem(CLAVE_LISTA, JSON.stringify(l)); };

// 1
nuevoInforme(); await esperar(200); poner(telefono());
let e0 = (await Q.envios()).length; Q.dialogos = [];
await enviar(); await hasta(() => !_tandaEnCurso, 40000); await esperar(600);
let env = (await Q.envios()).slice(e0).filter(e => e.numero);
const fin = Q.dialogos[Q.dialogos.length - 1] || '';
ok('1 · Sin preguntar la fecha salen los cuatro del 5-oct y el de hoy, no el vacío; el aviso final lo nombra y dice qué hacer',
   !Q.dialogos.some(d => /La fecha que eligió|¿Seguro/.test(d)) && env.length === 5 && !env.some(e => /-Q5$/.test(e.numero)) &&
   /No salieron y siguen en el teléfono \(1\)/.test(fin) && /-Q5 — vacío: no tiene nada medido\. Bórrelo con 🗑️ Borrar en Informes/.test(fin) && !listaGuardada().find(b => /-Q5$/.test(b.nro)).enviado,
   env.map(e => e.numero.slice(-4)).join(',') + ' · ' + fin.replace(/\n/g, ' ').slice(0, 220));

// 2
poner(telefono()); abrirInformes(); await esperar(300);
const fichas = [...document.querySelectorAll('#modal-informes .ficha')], rev = [...listaGuardada()].reverse();
const marcas = re => { const i = rev.findIndex(b => re.test(b.nro)); return fichas[i] ? [...fichas[i].querySelectorAll('.marca192')].map(s => s.textContent) : null; };
const caja = document.querySelector('#modal-informes .caja');
ok('2 · En «Informes» el vacío dice «Vacío, no se envía»; los del 5-oct y el de hoy nada; nada se sale a ' + innerWidth + ' px',
   (marcas(/-Q5$/) || []).some(t => /Vacío, no se envía/.test(t)) && (marcas(/-Q2$/) || ['x']).length === 0 && (marcas(/-HOY$/) || ['x']).length === 0 &&
   fichas.every(f => f.scrollWidth <= f.clientWidth + 1) && caja.scrollWidth <= caja.clientWidth + 1,
   JSON.stringify({ q5: marcas(/-Q5$/), q2: marcas(/-Q2$/), hoy: marcas(/-HOY$/) }).slice(0, 240));
cerrarInformes();

// 3
const idV = listaGuardada().find(b => /-Q5$/.test(b.nro)).id;
e0 = (await Q.envios()).length; Q.aceptar = false; Q.dialogos = [];
await enviarSolo(idV); await esperar(400); Q.aceptar = true;
const n3a = (await Q.envios()).length - e0, p3 = Q.dialogos.some(d => /no tiene nada medido/.test(d));
Q.dialogos = []; await enviarSolo(idV); await hasta(() => !_tandaEnCurso, 30000); await esperar(400);
ok('3 · «📤 Enviar» de uno vacío pregunta; con «Cancelar» no sale y con «Aceptar» sí', p3 && n3a === 0 && (await Q.envios()).length - e0 === 1 && !!listaGuardada().find(b => b.id === idV).enviado,
   [p3, n3a, (await Q.envios()).length - e0].join(','));

// 4
const base4 = vaciar(hacer(7)); base4.obs_general = 'Visita sin trabajos'; base4.general[0].obs = 'nota';
const con = f => { const b = JSON.parse(JSON.stringify(base4)); f(b); return !_nadaMedido192(b); };
ok('4 · «Nada medido» aquí: una nota u observación no cuenta; una respuesta, una fila de ' + (SHA ? 'hallazgo' : 'apartamento') + ' con algo' +
   (SHA ? ', una incidencia o un obstáculo' : URB ? ', una cantidad, un camión o maquinaria' : '') + ' sí',
   _nadaMedido192(base4) && con(b => b.general[0].items[0].sn = 'SI') && con(b => b.apartamentos = [{ apto: 'x', campos: { c: 'SI' } }]) &&
   !con(b => b.apartamentos = [{ apto: 'solo el nombre', campos: { c: '' } }]) &&
   (!SHA || (con(b => b.incidencias = [{ tipo: 'Caída' }]) && con(b => b.obstaculos = [{ obs: 'escombros' }]))) &&
   (!URB || (con(b => b.general[0].items[0].cant = '3') && con(b => b.general[0].items[0].camiones = [{ placa: 'A1' }]) && con(b => b.general[0].items[0].maquinaria = 'retro'))));

// 5
poner([]); await pantalla(); e0 = (await Q.envios()).length; Q.dialogos = [];
await enviar(); await hasta(() => !_tandaEnCurso, 40000); await esperar(600);
ok('5 · Un informe de hoy bien hecho sale sin ninguna pregunta nueva ni aviso de «No salieron»',
   (await Q.envios()).length === e0 + 1 && !Q.dialogos.some(d => /La fecha que eligió|No salieron|nada medido/.test(d)), Q.dialogos.map(d => d.slice(0, 60)).join(' | '));

// 6
poner([hacer(8)]); cargarInforme(listaGuardada()[0].id); await esperar(500);
Q.dialogos = []; guardar(true); await esperar(200);
ok('6 · Abrir y «Guardar» un informe del 5-oct no pregunta la fecha', !Q.dialogos.some(d => /fecha/i.test(d)) && listaGuardada()[0].fecha === '2026-10-05',
   Q.dialogos.map(d => d.slice(0, 60)).join(' | '));
localStorage.setItem(CLAVE_LISTA, '[]');
