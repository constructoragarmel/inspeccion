// ESTRÉS 24 · «Informes» y los cuatro formularios (2-nov-2026, 30 rondas, I1 a I10). En obra: 64 informes de la planilla en la
// lista, «Quitar copias» no se los come, «Enviar todos» con uno olvidado y uno incompleto, y la lista después. En servicios, SHA y
// urbanismo: un borrador olvidado, un corte a mitad de la respuesta, «Pasarelas» en SHA, y en las cuatro ningún error en la
// consola. Se corre en inspeccion.html, servicios.html, sha.html y urbanismo.html (?prueba=1), a 375×812.
const pagina = /sha\.html/.test(location.pathname) ? 'sha' : /urbanismo\.html/.test(location.pathname) ? 'urbanismo' : /servicios\.html/.test(location.pathname) ? 'servicios' : 'obra';
const errores = []; const _err = e => errores.push(String((e && (e.message || (e.reason && e.reason.message))) || e).slice(0, 120));
window.addEventListener('error', _err); window.addEventListener('unhandledrejection', _err);
const _ce = console.error; console.error = function(){ errores.push([...arguments].map(String).join(' ').slice(0, 120)); return _ce.apply(console, arguments); };
localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.removeItem('garmel_cortes'); Object.keys(_cortes).forEach(k => delete _cortes[k]);
await Q.relevo({ borrar: true, tipos: ['inspeccion', 'servicios', 'sha', 'urbanismo'], caido: false, fallar: [], lento: 0, colgar: 0, perder: false, cortar: 0 });
Q.aceptar = true; PLAZO_ENVIO_MS = 20000; _REINTENTO_EXISTE_MS = 500;
const HOY = new Date().toISOString().slice(0, 10), DIEZ = new Date(Date.now() - 10 * 864e5);

if (pagina === 'obra') {
  localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_reports_list', '[]');
  Object.keys(localStorage).filter(k => /^garmel_planilla_/.test(k)).forEach(k => localStorage.removeItem(k));
  await Q.relevo({ sembrarAvance: { sector: 'EZ', torre: 'T-16', prueba: true, informes: {} } });
  const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
  const E = () => _plEstado();
  const celda = (k, c) => $('#planilla .pl-c[data-k="' + k + '"][data-c="' + c + '"]');
  const tap = el => { if (!el) throw new Error('no está'); el.click(); };
  const dig = d => String(d).split('').forEach(x => tap($('#pl-sheet [data-d="' + x + '"]')));
  const teclear = (k, c, v, todos) => { tap(celda(k, c)); dig(v); if (todos) tap($('#pl-kt')); tap($('#pl-ksi')); };
  nuevoFormulario(); await esperar(300); setAmbito('apartamento'); await esperar(200);
  sel('fecha', HOY); sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-16'); await esperar(400);
  { const ins = document.querySelector('.inspector-select'); Q.elegir(ins, [...ins.options].map(o => o.value).filter(Boolean)[0]); await esperar(300); }
  if (!document.querySelector('#estatus .ck-lbl.on')) [...document.querySelectorAll('#estatus .ck-lbl')].find(l => /progreso/.test(l.textContent)).click();
  abrirPlanilla(); await hasta(() => E().P && !!$('#pl-cuerpo .pl-g'), 15000); await esperar(250);
  for (let p = 0; p <= 15; p++) { _plIr({ vista: 'tel', piso: p, hitoSel: 'cap_sanitarias' }); await esperar(20); teclear('P' + String(p).padStart(2, '0') + 'AA1', '3.01', 100, true); }
  tap($('#pl-rev')); await esperar(120); if ($('#pl-rr')) tap($('#pl-rr')); tap($('#pl-rgua')); await esperar(1500); cerrarPlanilla(); await esperar(300);
  // ── I1 · «Informes» con 64 de la planilla: se abre rápido, cuenta 64 pendientes y cada tarjeta dice piso y apartamento ──
  const t1 = performance.now(); if (typeof openSavedList === 'function') openSavedList(); else renderSavedList(); await esperar(50); const ms1 = performance.now() - t1;
  const tarjetas = [...document.querySelectorAll('#savedListContent .saved-item')];
  ok('I1 · «Informes» con 64: se pinta en menos de 1 s, 64 tarjetas y cada una dice su piso y apartamento', tarjetas.length === 64 && ms1 < 1000 && tarjetas.every(t => /(Piso \d\d|Planta Baja) · Apto: [AB][12]/.test(t.textContent)), tarjetas.length + ' · ' + Math.round(ms1) + ' ms');
  // ── I2 · «Quitar copias» no toma por copias a los de la planilla (mismo contenido con «Lo mismo», número propio) ──
  Q.dialogos.length = 0; quitarCopias189(); await esperar(200);
  ok('I2 · «Quitar copias» no quita ninguno de los 64 (cada uno tiene su número y su apartamento)', getSavedReports().length === 64, getSavedReports().length + ' · ' + Q.dialogos.join(' | ').slice(0, 120));
  // ── I3 · «Enviar todos» con un olvidado (guardado hace 10 días) y uno incompleto (sin apartamento) ──
  const base = getSavedReports()[0];
  const olvidado = Object.assign(JSON.parse(JSON.stringify(base)), { id: 'draft_' + DIEZ.getTime(), nro: base.nro.replace(/-P\d\dA[AB][12]-/, '-P01AB2-').replace(/-\d{6}-/, '-' + HOY.slice(2).replace(/-/g, '') + '-'), piso: 'Piso 01', apto: 'B2', enviado: false });
  const incompleto = Object.assign(JSON.parse(JSON.stringify(base)), { id: 'draft_' + (Date.now() - 1000), nro: 'PRUEBA-EZ-T16-P02A--' + HOY.slice(2).replace(/-/g, '') + '-XX', piso: 'Piso 02', apto: '', enviado: false });
  localStorage.setItem('garmel_reports_list', JSON.stringify(getSavedReports().filter(b => !/-P01AB2-/.test(b.nro)).concat([olvidado, incompleto])));
  const n3 = getSavedReports().length; Q.dialogos.length = 0;
  await enviarPendientes(); await hasta(() => !_tandaEnCurso, 200000); await esperar(500);
  const env = (await Q.envios()).filter(e => /EZ-T16-/.test(e.numero || ''));
  const fin = Q.dialogos.join(' | ');
  ok('I3 · Salen los de la planilla (63, sin el que se reemplazó por el olvidado); el olvidado y el incompleto no, y el aviso dice por qué', env.length === 63 && !env.some(e => e.numero === olvidado.nro) && /revisar si todavía va/.test(fin) && /apartamento/.test(fin), env.length + ' de ' + n3 + ' · ' + fin.replace(/\s+/g, ' ').slice(0, 200));
  // ── I4 · Después: en «Informes» los 63 con ✅, quedan 2 pendientes con su marca ──
  renderSavedList(); await esperar(100);
  const pend = getSavedReports().filter(b => !b.enviado);
  ok('I4 · Quedan 2 pendientes (el olvidado con 🕰️ y el incompleto) y 63 enviados', pend.length === 2 && getSavedReports().filter(b => b.enviado).length === 63 && /🕰️ Olvidado/.test(document.getElementById('savedListContent').textContent), pend.map(b => b.nro).join(', '));
  ok('I9 · Obra: ningún error en la consola en toda la tanda', !errores.length, errores.slice(0, 3).join(' | '));
  if (typeof closeSavedList === 'function') closeSavedList();
  localStorage.setItem('garmel_reports_list', '[]'); Object.keys(localStorage).filter(k => /^garmel_planilla_/.test(k)).forEach(k => localStorage.removeItem(k)); nuevoFormulario();
} else {
  localStorage.setItem(CLAVE_LISTA, '[]');
  const nuevo = async () => { Q.aceptar = true; nuevoInforme(); await esperar(150); if ($('#aviso-historial .no')) $('#aviso-historial .no').click(); };
  const escribir = (e, v) => { e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); };
  const opciones = s => [...s.options].map(o => o.value).filter(v => v && v !== 'ZONA');
  const cabecera = async (k) => {
    const s = $('#sector'); if (s && !s.value) { Q.elegir(s, opciones(s)[0]); await esperar(100); }
    const c = $('#convenio'); if (c && !c.value) { Q.elegir(c, opciones(c).includes('Convenio Bielorrusos') ? 'Convenio Bielorrusos' : opciones(c)[0]); await esperar(100); }
    const t = $('#torre'); Q.elegir(t, opciones(t)[k || 0]); await esperar(200); if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
    Q.elegir($('#inspectores select'), INSPECTORES_DB[0]);
    if (pagina === 'sha') { const e = $('#estatus'); Q.elegir(e, opciones(e)[0]); }
    await esperar(100);
  };
  const contestar = () => {
    const it = $('.srv .item'), sid = it.closest('.srv').id.replace('srv-', '');
    if (it.closest('.cuerpo').hidden) plegar(sid);
    if (pagina === 'urbanismo') escribir(it.querySelector('.cant'), '10'); else marcarSN(it.querySelector('.sino').children[0], 'SI');
  };
  const mandar = async () => { Q.dialogos = []; await enviar(); await esperar(400); return Q.dialogos.join(' | '); };
  // ── Corte a mitad de la respuesta en «Enviar todos»: llega una vez y queda enviado (I6 SHA, I7 urbanismo, I8 servicios) ──
  await nuevo(); await cabecera(0); contestar(); guardar(false); const d1 = listaGuardada()[0];
  await Q.relevo({ cortar: 1 }); const fin1 = await mandar();
  const env1 = (await Q.envios()).filter(e => e.numero === d1.nro);
  const tras = await mandar(); const env1b = (await Q.envios()).filter(e => e.numero === d1.nro);
  const ronda = { sha: 'I6', urbanismo: 'I7', servicios: 'I8' }[pagina];
  let extraSha = true, detalleSha = '';
  if (pagina === 'sha') { const filas = [...document.querySelectorAll('#panel-d .fila-obst')].map(f => f.textContent); extraSha = filas.some(t => /Pasarelas/.test(t)) && !filas.some(t => /Andamios/.test(t)); detalleSha = ' · obstáculos: ' + filas.length; }
  ok(ronda + ' · ' + pagina + ': corte a mitad de la respuesta → llega una vez, queda enviado y otro «Enviar» no lo repite' + (pagina === 'sha' ? '; y en obstáculos dice «Pasarelas»' : ''),
     env1.length === 1 && env1b.length === 1 && listaGuardada().find(x => x.id === d1.id).enviado && extraSha, env1.length + '/' + env1b.length + ' · ' + fin1.slice(0, 80) + detalleSha);
  // ── I5 · (servicios, y lo mismo en SHA y urbanismo) un borrador guardado hace 10 días no sale en «Enviar todos» y lleva su marca ──
  await nuevo(); await cabecera(1); contestar(); guardar(false);
  await nuevo(); await esperar(200);   // la pantalla en otro informe: el olvidado no es el que está abierto (si lo estuviera, se guarda de nuevo al enviar)
  const l5 = listaGuardada(); const v5 = l5.find(x => !x.enviado && x.nro); v5.guardado = DIEZ.toISOString(); localStorage.setItem(CLAVE_LISTA, JSON.stringify(l5));
  const fin5 = await mandar(); const env5 = (await Q.envios()).filter(e => e.numero === v5.nro);
  abrirInformes(); await esperar(200);
  const marca5 = /🕰️ Olvidado/.test(($('#modal-informes') || document.body).textContent);
  ok('I5 · ' + pagina + ': el guardado hace 10 días no sale en «Enviar todos», el aviso lo explica y en «Informes» lleva 🕰️', !env5.length && /se guardó el .* y nunca salió/.test(fin5) && marca5, fin5.replace(/\s+/g, ' ').slice(0, 160));
  if (typeof cerrarInformes === 'function') cerrarInformes();
  ok('I10 · ' + pagina + ': ningún error en la consola en toda la tanda', !errores.length, errores.slice(0, 3).join(' | '));
  localStorage.setItem(CLAVE_LISTA, '[]');
}
