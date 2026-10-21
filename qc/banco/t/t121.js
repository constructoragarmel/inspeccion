// TANDA 121 · V182 (21-oct-2026, ADR-0050, pedido de Diego Orta): rondas 1 a 5 del estatus de SHA en el compilado. En
// compilado.html?prueba=1, a 375×812, con el relevo falso (r73). 1 la inspección de SHA abre su compilado · 2 cambia y guarda el
// estatus · 3 la coordinación lo ve propuesto · 4 la coordinación lo valida al enviar · 5 volver a obra no arrastra nada.
localStorage.clear(); localStorage.setItem('garmel_clave_envio', 'qc'); await Q.relevo({ borrar: true, caido: false, lento: 0, fallarTorres: [], tardaTorre: {} });
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); };
const elegir = (s, v) => { s.value = v; s.dispatchEvent(new Event('change', { bubbles: true })); };
const pedir = async () => { await generar(); await hasta(() => !$('#resultado').hidden || /No se pudo|tardó/.test($('#estado').textContent), 8000); await esperar(200); };
const sels = () => $$('#tipo-tabla select.est-sel');
const fila = re => sels().find(s => re.test(s.getAttribute('aria-label')));
const VICTOR = 'Víctor Mendoza (CIV-NC)', DIEGO = 'Diego Orta';
// ── Ronda 1 · la inspección de SHA abre su compilado ──
sel('tipo', 'sha'); sel('sector', 'EZ'); await esperar(50);
const grupos = [...$('#quien').querySelectorAll('optgroup')].map(g => g.label + ':' + g.children.length);
ok('R1.1 · En SHA, «Quién» separa la coordinación (valida y envía) de la inspección de SHA (actualiza el estatus), con sus tres inspectores',
   grupos.length === 2 && /Coordinación · valida/.test(grupos[0]) && /Inspección de SHA · actualiza el estatus:3/.test(grupos[1]) && /coordinación o inspección de SHA/.test($('#lbl-quien').textContent) &&
   [...$('#quien').options].some(o => o.value === VICTOR && /Víctor Mendoza · Inspección de SHA/.test(o.textContent)), grupos.join(' | '));
sel('torre', 'T-01'); sel('quien', VICTOR); await pedir();
ok('R1.2 · Para el inspector no hay validación ni «Enviar»: hay «Estatus hoy» y «Guardar el estatus para la coordinación»',
   !$('#resultado').hidden && $('#validacion').hidden && $('#btn-enviar').hidden && !$('#est-sha').hidden && !$('#est-acciones').hidden && /Usted actualiza el estatus/.test($('#est-aviso').textContent) && /Actualiza el estatus:/.test($('#membrete').textContent), $('#est-aviso').textContent.slice(0, 80));
ok('R1.3 · La tabla suma la columna «Estatus hoy», un desplegable por hallazgo que arranca en «Sin cambio»',
   /Estatus hoy/.test($('#tipo-tabla tr').textContent) && sels().length === 2 && sels().every(s => s.value === '' && [...s.options].map(o => o.text).join() === 'Sin cambio,Pendiente,En proceso,Corregido'), sels().length);
// ── Ronda 2 · cambia y guarda ──
await guardarEstatus();
ok('R2.1 · Guardar sin cambiar nada lo dice y no manda', /No cambió el estatus de ningún hallazgo/.test($('#estado-est').textContent) && !(await Q.envios()).some(e => e.tipo === 'sha-estatus'));
elegir(fila(/Albañilería/), 'Corregido'); await esperar(50);
ok('R2.2 · El hallazgo que cambia se resalta y lo elegido queda en el equipo antes de guardar', fila(/Albañilería/).closest('tr').classList.contains('est-cambia') && /Corregido/.test(localStorage.getItem(claveEst()) || ''), localStorage.getItem(claveEst()));
const e2 = (await Q.envios()).length; await guardarEstatus(); await hasta(() => /Guardado|No se pudo/.test($('#estado-est').textContent), 5000);
const u2 = (await Q.envios()).slice(e2)[0] || {};
ok('R2.3 · Guarda solo lo que cambió, con quién, el lugar, el hallazgo y el estatus que traía el informe',
   /Guardado el estatus de 1 hallazgo/.test($('#estado-est').textContent) && u2.tipo === 'sha-estatus' && u2.datos.por === VICTOR && u2.datos.cambios.length === 1 &&
   u2.datos.cambios[0].torre === 'T-01' && u2.datos.cambios[0].estatus === 'Corregido' && u2.datos.cambios[0].antes === 'Pendiente' && u2.datos.prueba === true && !localStorage.getItem(claveEst()), JSON.stringify(u2.datos || {}).slice(0, 200));
await guardarEstatus();
ok('R2.4 · Lo guardado ya no cuenta como cambio: otro toque no vuelve a mandar', /No cambió/.test($('#estado-est').textContent) && (await Q.envios()).length === e2 + 1);
// ── Ronda 3 · la coordinación lo ve propuesto ──
otraVez(); sel('quien', DIEGO); await pedir();
const alb = fila(/Albañilería/), win = fila(/winches/);
ok('R3.1 · La coordinación ve la validación y «Enviar», y no el botón del inspector', !$('#validacion').hidden && !$('#btn-enviar').hidden && $('#est-acciones').hidden && !$('#est-sha').hidden);
ok('R3.2 · Lo que propuso el inspector viene cargado, resaltado, con quién y cuándo; el aviso cuenta los cambios',
   alb.value === 'Corregido' && alb.closest('tr').classList.contains('est-cambia') && /Propuso Víctor Mendoza · 21-oct: Corregido/.test(alb.closest('td').textContent) &&
   win.value === '' && /propuso 1 cambio de estatus/.test($('#est-aviso').textContent), alb.closest('td').textContent + ' · ' + $('#est-aviso').textContent.slice(0, 90));
// ── Ronda 4 · la valida al enviar ──
elegir(win, 'Corregido'); Q.escribir($('#t-hitos'), 'Semana de SHA en la T-01');
const e4 = (await Q.envios()).length; await enviar(); await hasta(() => /archivado|actualizado|No se pudo/.test($('#estado-envio').textContent), 6000);
const u4 = (await Q.envios()).slice(e4)[0] || {}, est4 = (u4.datos || {}).estatus || [];
ok('R4.1 · Al enviar se validan los dos (el propuesto y el que eligió la coordinación), con el estatus que traía cada uno',
   u4.tipo === 'compilado-sha' && est4.length === 2 && est4.every(x => x.torre === 'T-01' && x.estatus === 'Corregido') && est4.map(x => x.antes).join() === 'Pendiente,En proceso' && /2 hallazgos validados/.test($('#estado-envio').textContent) && /ya no vuelve/.test($('#estado-envio').textContent), JSON.stringify(est4).slice(0, 200) + ' · ' + $('#estado-envio').textContent.slice(0, 120));
otraVez(); await pedir();
ok('R4.2 · Al volver a generarlo dice quién lo validó y cuándo', /Validado por Diego Orta · 21-oct/.test(fila(/Albañilería/).closest('td').textContent) && fila(/winches/).value === 'Corregido', fila(/Albañilería/).closest('td').textContent);
// ── Ronda 5 · volver a obra no arrastra nada ──
otraVez(); sel('quien', VICTOR); await pedir(); const ocultaInsp = $('#validacion').hidden;
otraVez(); sel('tipo', 'obra'); await esperar(50);
ok('R5.1 · En obra, «Quién valida» vuelve a ser solo la coordinación y el inspector de SHA sale de la lista', ocultaInsp && !$('#quien').querySelector('optgroup') && ![...$('#quien').options].some(o => o.value === VICTOR) && $('#quien').value === '' && $('#lbl-torre').textContent === 'Contratista', $('#quien').value);
sel('sector', 'EZ'); sel('torre', [...$('#torre').options].find(o => /ALNAVIC/.test(o.value)).value); sel('quien', DIEGO); await pedir();
ok('R5.2 · Y el compilado de obra trae la validación y «Enviar» a la vista', !$('#validacion').hidden && !$('#btn-enviar').hidden && $('#est-sha').hidden);
otraVez(); localStorage.clear(); await Q.relevo({ caido: false, lento: 0 });
