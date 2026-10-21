// TANDA 122 · V182 (21-oct-2026, ADR-0050): rondas 6 a 10 del estatus de SHA en el compilado. En compilado.html?prueba=1, a
// 375×812. 6 todo el urbanismo, por torre · 7 el relevo caído al guardar · 8 accesibilidad y tamaño · 9 lo que sale al imprimir ·
// 10 el inspector no puede enviar el compilado ni abrir otro tipo.
localStorage.clear(); localStorage.setItem('garmel_clave_envio', 'qc'); await Q.relevo({ borrar: true, caido: false, lento: 0, fallarTorres: [], tardaTorre: {} });
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); };
const elegir = (s, v) => { s.value = v; s.dispatchEvent(new Event('change', { bubbles: true })); };
const pedir = async () => { await generar(); await hasta(() => !$('#resultado').hidden || /No se pudo|tardó/.test($('#estado').textContent), 8000); await esperar(200); };
const sels = () => $$('#tipo-tabla select.est-sel');
const VICTOR = 'Víctor Mendoza (CIV-NC)', BIRMANIA = 'Birmania Rada (CIV-NC)';
// ── Ronda 6 · todo el urbanismo ──
sel('tipo', 'sha'); sel('sector', 'EZ'); sel('torre', 'URBANISMO'); sel('quien', BIRMANIA); await pedir();
ok('R6.1 · En todo el urbanismo hay un desplegable por hallazgo de cada torre (la zona y la T-01 con dos; la T-05 sin frentes, ninguno)',
   sels().length === 4 && /Sin frentes en este informe/.test($('#tipo-tabla').textContent) && $('#tipo-tabla tr').children.length === 7, sels().length);
elegir(sels()[0], 'En proceso'); elegir(sels()[3], 'Corregido');
const e6 = (await Q.envios()).length; await guardarEstatus(); await hasta(() => /Guardado|No se pudo/.test($('#estado-est').textContent), 5000);
const c6 = ((await Q.envios()).slice(e6)[0] || { datos: {} }).datos.cambios || [];
ok('R6.2 · Cada cambio viaja con su torre: «Toda la zona» y la T-01', c6.length === 2 && c6[0].torre === 'Toda la zona' && c6[0].estatus === 'En proceso' && c6[1].torre === 'T-01' && c6[1].estatus === 'Corregido' && /winches/.test(c6[1].frente), JSON.stringify(c6).slice(0, 220));
otraVez(); sel('torre', 'T-01'); await pedir();
ok('R6.3 · Lo guardado desde todo el urbanismo aparece al abrir la torre sola', sels().find(s => /winches/.test(s.getAttribute('aria-label'))).value === 'Corregido' && /Propuso Birmania Rada/.test($('#tipo-tabla').textContent));
// ── Ronda 7 · el relevo caído al guardar ──
elegir(sels()[0], 'En proceso');
await Q.relevo({ caido: true }); await guardarEstatus(); await hasta(() => /No se pudo|tardó/.test($('#estado-est').textContent), 8000);
ok('R7.1 · Con el relevo caído lo dice, el botón vuelve y lo elegido sigue en el equipo', /No se pudo guardar|tardó/.test($('#estado-est').textContent) && /vuelva a intentar/.test($('#estado-est').textContent) && !$('#btn-est').disabled && /En proceso/.test(localStorage.getItem(claveEst()) || ''), $('#estado-est').textContent.slice(0, 120));
await Q.relevo({ caido: false });
otraVez(); await pedir();
ok('R7.2 · Al volver a generarlo, lo que no se pudo guardar vuelve a estar elegido y resaltado', sels()[0].value === 'En proceso' && sels()[0].closest('tr').classList.contains('est-cambia'));
const e7 = (await Q.envios()).length; await guardarEstatus(); await hasta(() => /Guardado|No se pudo/.test($('#estado-est').textContent), 5000);
ok('R7.3 · Y se guarda al reintentar', /Guardado el estatus de 1 hallazgo/.test($('#estado-est').textContent) && (await Q.envios()).length === e7 + 1);
// ── Ronda 8 · accesibilidad y tamaño ──
ok('R8.1 · Cada desplegable dice de qué hallazgo es (para el lector de pantalla) y su id es único', sels().every(s => /^Estatus hoy de .+: .+/.test(s.getAttribute('aria-label'))) && new Set(sels().map(s => s.id)).size === sels().length, sels().map(s => s.getAttribute('aria-label')).join(' | '));
ok('R8.2 · Ningún control baja de 44 px y la página no se sale de la pantalla', Q.chicos().length === 0 && document.documentElement.scrollWidth <= innerWidth + 1, Q.chicos().join(' ') + ' · ' + document.documentElement.scrollWidth);
// ── Ronda 9 · al imprimir ──
const css = [...document.styleSheets].map(h => { try { return [...h.cssRules].map(r => r.cssText).join('\n'); } catch (e) { return ''; } }).join('\n');
ok('R9.1 · Al imprimir se esconden los desplegables y las notas, y sale el estatus elegido como texto', /@media print[^}]*\.est-sel[^}]*display: none/.test(css) && /\.est-txt[^}]*display: inline/.test(css) && sels()[0].parentNode.querySelector('.est-txt').textContent === 'En proceso' && getComputedStyle(sels()[0].parentNode.querySelector('.est-txt')).display === 'none');
ok('R9.2 · El cuadro del estatus no se imprime', /noprint/.test($('#est-sha').className));
// ── Ronda 10 · el inspector no envía ni abre otro tipo ──
await enviar();
ok('R10.1 · Si el inspector llegara a enviar, lo detiene: el compilado lo envía la coordinación', /lo envía la coordinación/.test($('#estado-envio').textContent));
otraVez(); sel('tipo', 'servicios'); sel('sector', 'EZ'); sel('torre', 'T-01'); const o = document.createElement('option'); o.value = VICTOR; $('#quien').appendChild(o); $('#quien').value = VICTOR; await generar();
ok('R10.2 · La inspección de SHA no puede abrir el compilado de otro tipo', /solo actualiza el compilado de SHA/.test($('#estado').textContent) && $('#resultado').hidden, $('#estado').textContent);
otraVez(); localStorage.clear(); await Q.relevo({ caido: false, lento: 0 });
