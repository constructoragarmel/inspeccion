// ESTRÉS 35 · servicios, SHA y urbanismo con lo de las últimas semanas (11-nov-2026, QC de 20 rondas antes de la v206). S1 lo de
// Ángel Sánchez (SHA, 10-nov: «no están en manzana, están en la calle principal de la entrada… se intentó eso pero pide torre»):
// «Toda la zona» se guarda y se envía sin pedir torre · S2 borrar el informe abierto deja la pantalla en blanco · S3 a uno enviado,
// cambiarle la fecha pregunta (cambio 207) · S4 «Nuevo» después de enviar no arrastra nada · S5 ningún error en la consola.
// Se corre en servicios.html, sha.html y urbanismo.html (?prueba=1), a 375×812.
const pagina = /sha\.html/.test(location.pathname) ? 'sha' : /urbanismo\.html/.test(location.pathname) ? 'urbanismo' : 'servicios';
const errores = []; const _err = e => errores.push(String((e && (e.message || (e.reason && e.reason.message))) || e).slice(0, 120));
window.addEventListener('error', _err); window.addEventListener('unhandledrejection', _err);
const _ce = console.error; console.error = function(){ errores.push([...arguments].map(String).join(' ').slice(0, 120)); return _ce.apply(console, arguments); };
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem(CLAVE_LISTA, '[]');
localStorage.removeItem('garmel_cortes'); localStorage.removeItem('garmel_enviados_lugar'); if (typeof _cortes !== 'undefined') Object.keys(_cortes).forEach(k => delete _cortes[k]);
await Q.relevo({ borrar: true, tipos: ['inspeccion', 'servicios', 'sha', 'urbanismo'], caido: false, fallar: [], lento: 0, colgar: 0, perder: false, cortar: 0 });
Q.aceptar = true; if (typeof PLAZO_ENVIO_MS !== 'undefined') PLAZO_ENVIO_MS = 20000;
const HOY = new Date().toISOString().slice(0, 10);
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); };
const escribir = (e, v) => { e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); };
const opciones = s => [...s.options].map(o => o.value).filter(v => v && v !== 'ZONA' && !/OTRA/.test(v));
const modo = m => { const b = [...document.querySelectorAll('#campo-donde .donde button')].find(b => b.dataset.m === m); if (b) b.click(); return !!b; };
const nuevo = async () => { Q.aceptar = true; nuevoInforme(); await esperar(200); if ($('#aviso-historial .no')) $('#aviso-historial .no').click(); };
const resto = async () => {
  Q.elegir($('#inspectores select'), INSPECTORES_DB[0]);
  if (pagina === 'sha') { const e = $('#estatus'); if (e && e.tagName === 'SELECT') Q.elegir(e, opciones(e)[0]); }
  await esperar(100);
  const it = $('.srv .item'); if (it) { const sid = it.closest('.srv').id.replace('srv-', ''); if (it.closest('.cuerpo').hidden) plegar(sid);
    if (pagina === 'urbanismo') escribir(it.querySelector('.cant'), '10'); else marcarSN(it.querySelector('.sino').children[0], 'SI'); }
  const o = $('#obs_general'); if (o) escribir(o, 'Prueba e35 ' + pagina);
};
const enUna = async (k) => {
  await nuevo(); modo('una'); await esperar(150);
  const c = $('#convenio'); Q.elegir(c, opciones(c).includes('Convenio Bielorrusos') ? 'Convenio Bielorrusos' : opciones(c)[0]); await esperar(200);
  const t = $('#torre'); Q.elegir(t, opciones(t)[k || 0]); await esperar(300); if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
  await resto(); guardar(false); await esperar(300);
  return listaGuardada().find(x => x.id === idActual);
};
const mandar = async () => { Q.dialogos = []; await enviar(); await esperar(500); return Q.dialogos.join(' | '); };

// ── S1 · «Toda la zona» (la calle de entrada no es torre ni manzana): se guarda y se envía sin pedir torre ──
if (document.querySelector('#campo-donde .donde button[data-m="zona"]')) {
  await nuevo(); modo('zona'); await esperar(200);
  Q.elegir($('#convenio'), opciones($('#convenio')).includes('Convenio Bielorrusos') ? 'Convenio Bielorrusos' : opciones($('#convenio'))[0]); await esperar(300);
  sel('fecha', HOY); await resto(); guardar(false); await esperar(300);
  const d1 = listaGuardada().find(x => x.id === idActual) || {};
  const falta1 = faltan(datosDelFormulario());
  const fin1 = await mandar(); const env1 = (await Q.envios()).filter(e => e.numero === d1.nro);
  ok('S1 · ' + pagina + ' «Toda la zona»: no pide torre, se guarda como ' + (d1.nro || '—') + ' y se envía una vez',
     d1.torre === 'ZONA' && !falta1.length && env1.length === 1 && !/la torre/.test(fin1), 'torre ' + d1.torre + ' · falta [' + falta1.join(', ') + '] · envíos ' + env1.length + ' · ' + fin1.replace(/\s+/g, ' ').slice(0, 120));
} else ok('S1 · ' + pagina + ': no tiene «Toda la zona» (no aplica)', true);

// ── S2 · Borrar el informe abierto (enviado) deja la pantalla en blanco y no vuelve como borrador ──
const d2 = await enUna(0); const l2 = listaGuardada(); l2.find(x => x.id === d2.id).enviado = new Date().toLocaleString(); localStorage.setItem(CLAVE_LISTA, JSON.stringify(l2));
cargarInforme(d2.id); await esperar(400);
Q.aceptar = true; borrarInforme(d2.id); await esperar(400); guardar(false); await esperar(300);
ok('S2 · ' + pagina + ': borrar desde «Informes» el que está abierto deja la pantalla en blanco y no vuelve como borrador',
   informeVacio(datosDelFormulario()) && !listaGuardada().some(x => x.torre === d2.torre && !x.enviado), 'vacío ' + informeVacio(datosDelFormulario()) + ' · lista ' + listaGuardada().length);
if (typeof cerrarInformes === 'function') cerrarInformes();

// ── S3 · A uno enviado, cambiarle la fecha pregunta; Cancelar lo deja ──
const d3 = await enUna(1); const l3 = listaGuardada(); l3.find(x => x.id === d3.id).enviado = new Date().toLocaleString(); localStorage.setItem(CLAVE_LISTA, JSON.stringify(l3));
cargarInforme(d3.id); await esperar(400);
// Como una persona: «Sí» a «¿La fecha es correcta?» (que en estos tres corre primero) y Cancelar a «ya se envió».
const f3 = $('#fecha').value; Q.dialogos = []; const conf0 = window.confirm;
window.confirm = m => { Q.dialogos.push(String(m)); return /La fecha que eligi/.test(m); };
sel('fecha', '2026-01-06'); await esperar(400); window.confirm = conf0; Q.aceptar = true;
ok('S3 · ' + pagina + ': a uno enviado, cambiarle la fecha pregunta «ya se envió» y Cancelar lo deja con la suya', Q.dialogos.some(m => /ya se envi/.test(m)) && $('#fecha').value === f3 && !informeVacio(datosDelFormulario()),
   $('#fecha').value + ' · ' + Q.dialogos.map(m => m.slice(0, 50)).join(' | '));

// ── S4 · Enviado de verdad y «Nuevo»: lo nuevo no arrastra nada del anterior ──
Q.aceptar = true; const d4 = await enUna(2); await mandar();
await nuevo(); await esperar(200);
ok('S4 · ' + pagina + ': después de enviar, «Nuevo» queda en blanco y el enviado quedó marcado', informeVacio(datosDelFormulario()) && !!(listaGuardada().find(x => x.id === d4.id) || {}).enviado,
   'vacío ' + informeVacio(datosDelFormulario()));

ok('S5 · ' + pagina + ': ningún error en la consola en toda la tanda', !errores.length, errores.slice(0, 3).join(' | '));
ok('S6 · ' + pagina + ': cabe a 375', document.documentElement.scrollWidth <= innerWidth + 1, document.documentElement.scrollWidth + ' / ' + innerWidth);
console.error = _ce; Q.aceptar = true; localStorage.setItem(CLAVE_LISTA, '[]'); localStorage.removeItem('garmel_enviados_lugar'); nuevoInforme();
