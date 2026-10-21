// TANDA 124 · v184 (21-oct-2026): rondas 1 y 2 del estrés de fin de día, pedido por Stephanie («haz 10 QC … estresa la app lo más
// posible»). En `inspeccion.html?prueba=1`, a 375×812. 1 veinticinco apartamentos seguidos con «Guardar y otro apto»: los contadores
// «Informes (n)» y «Enviar (n)» de la barra nueva, todos con la fecha de hoy y el envío de todos con el relevo lento · 2 el relevo
// caído a mitad: lo que no salió queda pendiente y se cuenta, y al volver sale sin duplicar.
localStorage.clear(); localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc');
Q.aceptar = true; Q.dialogos = [];
const put = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const lista = () => JSON.parse(localStorage.getItem('garmel_reports_list') || '[]');
const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const HOY = iso(new Date());
const cnt = id => (document.getElementById(id) || {}).textContent || '';
await Q.relevo({ caido: false, fallar: [], lento: 0, colgar: 0, perder: false, borrar: true });
nuevoFormulario(); await esperar(300); setAmbito('apartamento');
sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-16');
{ const emp = [...document.getElementById('empresa').options].map(o => o.value); sel('empresa', emp.find(x => /PROCODIMA/i.test(x)) || emp[1]); }
{ const insp = document.querySelector('.inspector-select'); insp.value = [...insp.options].map(o => o.value).filter(Boolean)[0]; insp.dispatchEvent(new Event('change', { bubbles: true })); }
if (!document.querySelector('#estatus .ck-lbl.on')) document.querySelector('#estatus .ck-lbl').click();
const APTOS = ['A1', 'A2', 'B1', 'B2'];
const llenar = async (k) => {
  sel('piso', 'Piso ' + String(1 + Math.floor(k / 4)).padStart(2, '0'));
  const a = APTOS[k % 4]; put('apto', a); sel('apto-sel', a); await esperar(250); document.querySelector('#aviso-anterior .no')?.click();
  put('pr_hito_acc_electricos_0', '6'); put('ej_hito_acc_electricos_0', String(1 + (k % 6)));
};
// ── Ronda 1 ──
const t0 = performance.now();
for (let k = 0; k < 25; k++) { await llenar(k); if (k < 24) { siguienteApartamento(); await esperar(350); } }
saveDraft(true); await esperar(300); actualizarContadores();
const l1 = lista();
ok('R1.1 · 25 apartamentos seguidos con «Guardar y otro apto»: 25 informes distintos, todos con la fecha de hoy', l1.length === 25 && new Set(l1.map(b => b.piso + b.apto)).size === 25 && l1.every(b => b.fecha === HOY),
   l1.length + ' · ' + new Set(l1.map(b => b.piso + b.apto)).size + ' · fechas ' + [...new Set(l1.map(b => b.fecha))].join(',') + ' · ' + Math.round((performance.now() - t0) / 1000) + ' s');
ok('R1.2 · La barra cuenta «Informes (25)» y «Enviar (25)»', cnt('cnt-guardados') === '(25)' && cnt('cnt-pendientes') === '(25)', cnt('cnt-guardados') + ' ' + cnt('cnt-pendientes'));
await Q.relevo({ lento: 0.4 });
const e0 = (await Q.envios()).length; Q.dialogos = [];
const pEnv = enviarPendientes(); await esperar(300); await enviarPendientes();
ok('R1.3 · Tocar «Enviar todos» dos veces no arranca un segundo envío', Q.dialogos.filter(d => /Se van a enviar/.test(d)).length === 1, Q.dialogos.map(d => d.slice(0, 40)).join(' | '));
await pEnv; await hasta(() => !_tandaEnCurso, 60000); await esperar(400); actualizarContadores();
const env1 = (await Q.envios()).slice(e0);
ok('R1.4 · Con el relevo lento salen los 25, una vez cada uno, y «Enviar» queda sin número', env1.length === 25 && new Set(env1.map(e => e.numero)).size === 25 && cnt('cnt-pendientes') === '(0)' && document.getElementById('cnt-pendientes').style.display === 'none',
   env1.length + ' envíos · ' + new Set(env1.map(e => e.numero)).size + ' números · pendientes ' + cnt('cnt-pendientes'));
// ── Ronda 2 ──
await Q.relevo({ lento: 0 });
nuevoFormulario(); await esperar(200); setAmbito('apartamento');
sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-15');
{ const emp = [...document.getElementById('empresa').options].map(o => o.value); sel('empresa', emp.find(x => /PROCODIMA/i.test(x)) || emp[1]); }
{ const insp = document.querySelector('.inspector-select'); insp.value = [...insp.options].map(o => o.value).filter(Boolean)[0]; insp.dispatchEvent(new Event('change', { bubbles: true })); }
if (!document.querySelector('#estatus .ck-lbl.on')) document.querySelector('#estatus .ck-lbl').click();
for (let k = 0; k < 6; k++) { await llenar(k); if (k < 5) { siguienteApartamento(); await esperar(350); } }
saveDraft(true); await esperar(200);
const nros = lista().filter(b => !b.enviado).map(b => b.nro);
await Q.relevo({ fallar: nros.slice(3) });
const e2 = (await Q.envios()).length;
await enviarPendientes(); await hasta(() => !_tandaEnCurso, 60000); await esperar(400); actualizarContadores();
ok('R2.1 · Con tres que el relevo rechaza (el relevo falso anota también los intentos rechazados): salen tres, los otros quedan pendientes y «Enviar (3)» lo dice', new Set((await Q.envios()).slice(e2).map(e => e.numero)).size === 6 && lista().filter(b => !b.enviado).length === 3 && cnt('cnt-pendientes') === '(3)',
   (await Q.envios()).slice(e2).length + ' salieron · pendientes ' + lista().filter(b => !b.enviado).length + ' · ' + cnt('cnt-pendientes'));
await Q.relevo({ fallar: [], caido: true });
await enviarPendientes(); await hasta(() => !_tandaEnCurso, 60000); await esperar(400); actualizarContadores();
ok('R2.2 · Con el relevo caído siguen los tres pendientes y nada se pierde', lista().filter(b => !b.enviado).length === 3 && lista().length === 31, lista().length + ' en el teléfono');
await Q.relevo({ caido: false });
const e3 = (await Q.envios()).length;
await enviarPendientes(); await hasta(() => !_tandaEnCurso, 60000); await esperar(400); actualizarContadores();
const todos = await Q.envios();
ok('R2.3 · Al volver salen los tres que faltaban y ninguno se duplica (31 números distintos en total)', todos.slice(e3).length === 3 && new Set(todos.filter(e => e.numero).map(e => e.numero.replace(/-r\d+$/, ''))).size === 31 && lista().every(b => b.enviado),
   todos.slice(e3).length + ' · ' + new Set(todos.filter(e => e.numero).map(e => e.numero.replace(/-r\d+$/, ''))).size);
ok('R2.4 · Nada se sale de la pantalla y ningún control baja de 44 px', document.documentElement.scrollWidth <= innerWidth + 1 && Q.chicos().length === 0, Q.chicos().join(' '));
nuevoFormulario(); localStorage.removeItem('garmel_reports_list');
