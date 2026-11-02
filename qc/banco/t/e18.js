// ESTRÉS 18 · enviar en obra con mala señal (2-nov-2026, 20 rondas de Stephanie: «como un ingeniero en obra»). Lo que pasó de
// verdad: el P02 B1 de la T-58 llegó dos veces (-r2) porque la señal se cortó a mitad de la respuesta, y un borrador de agosto
// salió con «Enviar todos». Rondas R1 a R6 de las 20. Se corre en inspeccion.html?prueba=1 a 375×812.
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem('garmel_reports_list', '[]');
localStorage.removeItem('garmel_cortes'); Object.keys(_cortes).forEach(k => delete _cortes[k]);
const limpiar = () => Object.keys(localStorage).filter(k => /^garmel_planilla_/.test(k)).forEach(k => localStorage.removeItem(k));
limpiar();
await Q.relevo({ caido: false, fallar: [], lento: 0, colgar: 0, perder: false, cortar: 0, borrar: true });
await Q.relevo({ sembrarAvance: { sector: 'EZ', torre: 'T-07', prueba: true, informes: {} } });
PLAZO_ENVIO_MS = 20000; _REINTENTO_EXISTE_MS = 500;
const HOY = new Date().toISOString().slice(0, 10);
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const E = () => _plEstado();
const cabecera = async () => {
  nuevoFormulario(); await esperar(300); setAmbito('apartamento'); await esperar(200);
  sel('fecha', HOY); sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-07'); await esperar(400);
  { const ins = document.querySelector('.inspector-select'); Q.elegir(ins, [...ins.options].map(o => o.value).filter(Boolean)[0]); await esperar(300); }
  if (!document.querySelector('#estatus .ck-lbl.on')) [...document.querySelectorAll('#estatus .ck-lbl')].find(l => /progreso/.test(l.textContent)).click();
};
const tecla = async (k, c, r) => { const cel = $('#planilla .pl-c[data-k="' + k + '"][data-c="' + c + '"]'); if (!cel) throw new Error('no está ' + k + ' ' + c + ' · piso ' + E().piso + ' · pestaña ' + E().hitoSel + ' · vista ' + E().vista + ' · hoja ' + (!!$('#pl-sheet') && $('#pl-sheet').textContent.slice(0, 80)) + ' · celdas ' + [...document.querySelectorAll('#planilla .pl-c')].slice(0, 3).map(x => x.dataset.k + '/' + x.dataset.c).join(',')); cel.click(); await esperar(50); $('#pl-sheet [data-r="' + r + '"]').click(); $('#pl-ksi').click(); await esperar(50); };
const guardarPlanilla = async () => { $('#pl-rev').click(); await esperar(80); if ($('#pl-rr')) $('#pl-rr').click(); $('#pl-rgua').click(); await esperar(600); };
const enviarTodo = async () => { Q.dialogos.length = 0; await enviarPendientes(); await hasta(() => !_tandaEnCurso, 120000); await esperar(500); };
const nros = async (re) => (await Q.envios()).filter(e => e.numero && re.test(e.numero)).map(e => e.numero);
const pend = () => getSavedReports().filter(b => !b.enviado).map(b => b.nro);

// ── R1 · Tres apartamentos; el primero llega pero la señal se corta antes de la respuesta ──
await cabecera(); abrirPlanilla(); await hasta(() => E().P && !!$('#pl-cuerpo .pl-g'), 15000); await esperar(200);
_plIr({ vista: 'tel', piso: 2, hitoSel: 'cap_sanitarias' }); await esperar(100);
for (const a of ['A1', 'A2', 'B1']) await tecla('P02A' + a, '3.01', 50);
await guardarPlanilla(); cerrarPlanilla(); await esperar(200);
await Q.relevo({ cortar: 1 });
await enviarTodo();
const r1 = await nros(/EZ-T07-P02A(A1|A2|B1)-/);
ok('R1 · Corte a mitad de la respuesta en «Enviar todos»: el que llegó se reconoce como enviado y no se duplica', r1.length === 3 && new Set(r1).size === 3 && !pend().length,
   r1.join(', ') + ' · pendientes: ' + pend().join(','));
// ── R2 · Relevo caído: no llega nada, queda la marca de corte, y al volver la señal sale una sola vez ──
await cabecera(); abrirPlanilla(); await hasta(() => E().P && !!$('#pl-cuerpo .pl-g'), 15000); await esperar(200);
_plIr({ vista: 'tel', piso: 3, hitoSel: 'cap_sanitarias' }); await esperar(100); await tecla('P03AA1', '3.01', 75);
await guardarPlanilla(); cerrarPlanilla(); await esperar(200);
await Q.relevo({ caido: true }); await enviarTodo();
const marca = JSON.parse(localStorage.getItem('garmel_cortes') || '{}');
ok('R2 · Sin relevo: queda pendiente y la marca de corte se guarda en el teléfono', pend().some(n => /P03AA1/.test(n)) && Object.keys(marca).some(n => /P03AA1/.test(n)), JSON.stringify(marca));
await Q.relevo({ caido: false }); await enviarTodo();
const r2 = await nros(/EZ-T07-P03AA1-/);
ok('R2b · Con relevo: pregunta, no estaba, lo manda una vez y suelta la marca', r2.length === 1 && !pend().length && !Object.keys(JSON.parse(localStorage.getItem('garmel_cortes') || '{}')).some(n => /P03AA1/.test(n)), r2.join(','));
// ── R3 · La marca sobrevive a «cerrar la app»: se simula borrando la memoria y releyendo del teléfono ──
await cabecera(); abrirPlanilla(); await hasta(() => E().P && !!$('#pl-cuerpo .pl-g'), 15000); await esperar(200);
_plIr({ vista: 'tel', piso: 4, hitoSel: 'cap_sanitarias' }); await esperar(100); await tecla('P04AB2', '3.02', 50);
await guardarPlanilla(); cerrarPlanilla(); await esperar(200);
await Q.relevo({ cortar: 1 });
const _yaBase = _yaArchivado; _yaArchivado = async () => false;   // la pregunta tampoco alcanza: se va la señal del todo
await enviarTodo(); _yaArchivado = _yaBase;
const guardada = JSON.parse(localStorage.getItem('garmel_cortes') || '{}');
ok('R3 · Llegó pero el teléfono no lo supo: queda pendiente con su marca en el teléfono', pend().some(n => /P04AB2/.test(n)) && Object.keys(guardada).some(n => /P04AB2/.test(n)));
await enviarTodo();
const r3 = await nros(/EZ-T07-P04AB2-/);
ok('R3b · Al reintentar pregunta primero, lo encuentra archivado y NO lo manda otra vez (sin -r2)', r3.length === 1 && !pend().length, r3.length + ' envíos');
// ── R4 · Pulsar «Enviar todos» dos veces seguidas ──
await cabecera(); abrirPlanilla(); await hasta(() => E().P && !!$('#pl-cuerpo .pl-g'), 15000); await esperar(200);
_plIr({ vista: 'tel', piso: 5, hitoSel: 'cap_sanitarias' }); await esperar(100); await tecla('P05AA1', '3.01', 25); await tecla('P05AA2', '3.01', 25);
await guardarPlanilla(); cerrarPlanilla(); await esperar(200);
await Q.relevo({ colgar: 2 });
const t1 = enviarPendientes(); await esperar(300); const t2 = enviarPendientes(); await t1; await t2; await hasta(() => !_tandaEnCurso, 60000); await esperar(400);
await Q.relevo({ colgar: 0 });
const r4 = await nros(/EZ-T07-P05AA[12]-/);
ok('R4 · Doble pulsación: cada uno sale una sola vez', r4.length === 2 && new Set(r4).size === 2, r4.join(', '));
// ── R5 · Enviar uno solo desde el formulario y que se corte a mitad de la respuesta ──
await cabecera(); setAmbito('apartamento'); await esperar(200);
sel('piso', 'Piso 06'); await esperar(100); (() => { const s = document.getElementById('apto-sel'); s.value = 'B1'; s.dispatchEvent(new Event('change', { bubbles: true })); })(); await esperar(200);
const pm = document.getElementById('pm_hito_servicios_' + CODIGOS_SUB.hito_servicios.indexOf('3.01')); if (pm) { pm.value = '60'; pm.dispatchEvent(new Event('input', { bubbles: true })); pm.dispatchEvent(new Event('change', { bubbles: true })); }
saveDraft(true); await esperar(300);
await Q.relevo({ cortar: 1 });
Q.dialogos.length = 0; openSend(); await esperar(200); document.getElementById('claveEnvio').value = 'qc'; document.getElementById('btn-enviar-relevo').disabled = false;
const log5pre = ''; const p5 = enviarAlRelevo(); await esperar(400); const log5vivo = document.getElementById('sendLog').textContent; await p5; await esperar(800);
const r5 = await nros(/EZ-T07-P06AB1-/), log5 = log5vivo + ' ' + document.getElementById('sendLog').textContent + ' ' + Q.dialogos.join(' ');
ok('R5 · Envío de uno con corte: dice que se cortó (no «pasaron 5 min»), lo encuentra archivado y no queda pendiente', r5.length === 1 && !pend().some(n => /P06AB1/.test(n)) && !/Pasaron \d+ min/.test(log5), r5.join(',') + ' · ' + (log5.match(/Se cortó[^\n]*|Pasaron[^\n]*/) || [''])[0]);
// ── R6 · Un borrador de hace dos meses en la cola no sale con «Enviar todos» ──
const viejo = Object.assign({}, getSavedReports().find(b => /P02AA1/.test(b.nro)), { id: 'draft_' + new Date(2026, 7, 31, 14, 18).getTime(), timestamp: '31/8/2026, 14:18:18', nro: 'PRUEBA-EZ-T07-P01AA1-260831-XX', fecha: '2026-08-31', enviado: false, piso: 'Piso 01', apto: 'A1' });
const l6 = getSavedReports(); l6.push(viejo); localStorage.setItem('garmel_reports_list', JSON.stringify(l6));
await enviarTodo();
const r6 = await nros(/P01AA1-260831/), avisos = Q.dialogos.join(' | ');
ok('R6 · El guardado en agosto y nunca enviado no sale, y la confirmación dice por qué (cuándo se guardó)', !r6.length && pend().some(n => /260831/.test(n)) && /revisar si todavía va — se guardó el 31-ago \(hace \d+ días\) y nunca salió/.test(avisos), avisos.slice(0, 260));
// R6c · Lo que la oficina pasa HOY de una hoja de hace diez días sí sale: cuenta cuándo se guardó, no la fecha de inspección.
const hoja = Object.assign({}, viejo, { id: 'draft_' + Date.now(), timestamp: new Date().toLocaleString('es-VE'), nro: 'PRUEBA-EZ-T07-P02AA1-261023-XX', fecha: '2026-10-23', piso: 'Piso 02', apto: 'A1' });
const l6c = getSavedReports(); l6c.push(hoja); localStorage.setItem('garmel_reports_list', JSON.stringify(l6c));
await enviarTodo();
ok('R6c · Una hoja del 23-oct pasada hoy sí sale con «Enviar todos»', (await nros(/P02AA1-261023/)).length === 1, Q.dialogos.join(' | ').slice(0, 200));
renderSavedList(); await esperar(100);
ok('R6b · En «Informes» lleva la marca 🕰️ Olvidado', /🕰️ Olvidado, no sale en «Enviar todos»/.test(document.body.textContent));
localStorage.setItem('garmel_reports_list', '[]'); localStorage.removeItem('garmel_cortes'); limpiar(); nuevoFormulario();
