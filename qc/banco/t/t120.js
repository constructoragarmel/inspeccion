// TANDA 120 · V181 (21-oct-2026): rondas 6 a 10 de QC del compilado de obra por contratista (ADR-0049). En compilado.html?prueba=1, a
// 375×812. 6 una contratista de una sola torre · 7 cambiar de contratista y de semana sin mezclar borradores · 8 el relevo caído o lento
// al enviar y el doble toque · 9 accesibilidad (etiquetas, aria, foco) · 10 lo que sale al imprimir.
localStorage.clear(); localStorage.setItem('garmel_clave_envio', 'qc'); await Q.relevo({ borrar: true, caido: false, lento: 0, fallarTorres: [], tardaTorre: {} });
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); };
const con = re => [...$('#torre').options].find(o => re.test(o.value)).value;
const fechas = (d, h) => { Q.escribir($('#desde'), d); Q.escribir($('#hasta'), h); };
const pedir = async () => { await generar(); await hasta(() => !$('#resultado').hidden || /No se pudo|tardó/.test($('#estado').textContent), 15000); await esperar(200); };
const secs = () => $$('#torres-contratista .torre-c');
const sec = t => secs().find(x => x.dataset.torre === t);
sel('tipo', 'obra'); sel('quien', COORDINADORES[0].n); fechas('2026-10-15', '2026-10-21');
// ── Ronda 6 · una sola torre ──
sel('sector', 'SR'); const TSURU = con(/TSURU/); sel('torre', TSURU);
await Q.relevo({ lento: 1 }); const p6 = generar(); await esperar(400); const lee6 = $('#estado').textContent; await p6; await hasta(() => !$('#resultado').hidden, 8000); await Q.relevo({ lento: 0 });
ok('R6.1 · Una contratista de una torre: la opción dice su torre, el aviso dice «la T-07» y no «las 1 torres»', /TSURU.* · T-07$/.test([...$('#torre').options].find(o => o.value === TSURU).textContent) && /la T-07 de/.test(lee6) && !/las 1/.test(lee6), JSON.stringify(lee6.slice(0, 120)));
ok('R6.2 · Una sola sección (3 · T-07) y el membrete sin el desglose por torre', secs().length === 1 && /^3 · T-07/.test(secs()[0].querySelector('h2').textContent) && !/T-07: \d/.test($('#membrete').textContent) && /Torres: T-07/.test($('#membrete').textContent));
Q.escribir($('#t-hitos'), 'Tsuru: cierre de fachada');
const e6 = (await Q.envios()).length; await enviar(); await hasta(() => /archivado|No se pudo/.test($('#estado-envio').textContent), 8000);
const u6 = (await Q.envios()).slice(e6)[0] || {};
ok('R6.3 · Se envía con una sola torre y el nombre de la contratista', /archivado/.test($('#estado-envio').textContent) && /CON-SR-TSURU/.test(u6.numero || '') && ((u6.datos || {}).torres || []).length === 1, (u6.numero || '') + ' ' + $('#estado-envio').textContent.slice(0, 80));
// ── Ronda 7 · cambiar de contratista y de semana ──
otraVez(); sel('sector', 'EZ'); const ALN = con(/ALNAVIC/), RIO = con(/R[IÍ]O LIM[OÓ]N/); sel('torre', ALN); await pedir();
Q.escribir($('#t-hitos'), 'Texto de Alnavic'); Q.escribir(sec('T-06').querySelector('.av-pct'), '33'); Q.escribir(sec('T-06').querySelector('.av-motivo'), 'Motivo de Alnavic');
otraVez(); sel('torre', RIO); await pedir();
ok('R7.1 · Otra contratista arranca limpia: ni la validación ni el % de la anterior', $('#t-hitos').value === '' && secs().every(s => !s.querySelector('.av-pct') || s.querySelector('.av-pct').value === ''), $('#t-hitos').value);
Q.escribir($('#t-hitos'), 'Texto de Río Limón');
otraVez(); sel('torre', ALN); await pedir();
ok('R7.2 · Al volver a la primera, su borrador sigue: el texto, el 33 y su motivo', $('#t-hitos').value === 'Texto de Alnavic' && sec('T-06').querySelector('.av-pct').value === '33' && !sec('T-06').querySelector('.av-motivo-c').hidden && sec('T-06').querySelector('.av-motivo').value === 'Motivo de Alnavic');
otraVez(); fechas('2026-10-08', '2026-10-14'); await pedir();
ok('R7.3 · La misma contratista en otra semana arranca limpia', $('#t-hitos').value === '' && sec('T-06').querySelector('.av-pct').value === '', $('#t-hitos').value);
otraVez(); fechas('2026-10-15', '2026-10-21'); sel('torre', RIO); await pedir();
ok('R7.4 · Y la otra contratista conserva el suyo', $('#t-hitos').value === 'Texto de Río Limón');
// ── Ronda 8 · el relevo caído o lento al enviar, y el doble toque ──
otraVez(); sel('torre', ALN); await pedir();
await Q.relevo({ caido: true }); await enviar(); await hasta(() => /No se pudo archivar/.test($('#estado-envio').textContent), 8000);
ok('R8.1 · Con el relevo caído al enviar: lo dice, conserva la validación y el % de cada torre, y el botón vuelve', /sigue guardado en este equipo/.test($('#estado-envio').textContent) && !$('#btn-enviar').disabled &&
   ((JSON.parse(localStorage.getItem(claveBorrador()) || '{}').torres || {})['T-06'] || {}).pct === '33', $('#estado-envio').textContent.slice(0, 120));
await Q.relevo({ caido: false, lento: 1.5 });
const e8 = (await Q.envios()).length; const env1 = enviar(); await esperar(200);
const apagado = $('#btn-enviar').disabled, espera = $('#estado-envio').textContent; $('#btn-enviar').click(); await env1; await esperar(1800);
ok('R8.2 · Mientras archiva, el botón queda apagado y dice que espera; un segundo toque no manda otro', apagado && /Archivando el compilado de la contratista/.test(espera) && (await Q.envios()).length === e8 + 1, espera.slice(0, 80) + ' · envíos ' + ((await Q.envios()).length - e8));
await Q.relevo({ lento: 0 });
// ── Ronda 9 · accesibilidad ──
const campos = $$('#torres-contratista input, #torres-contratista textarea');
const sinEtiqueta = campos.filter(c => !c.id || !document.querySelector('label[for="' + c.id + '"]'));
const ids = campos.map(c => c.id), repetidos = ids.filter((x, i) => ids.indexOf(x) !== i);
ok('R9.1 · Cada cuadro de cada torre tiene su etiqueta y su id es único', campos.length === 12 && !sinEtiqueta.length && !repetidos.length, campos.length + ' · sin etiqueta ' + sinEtiqueta.length + ' · repetidos ' + repetidos.join());
const ver = sec('T-05').querySelector('.av-ver');
ok('R9.2 · «¿De dónde sale?» dice si está abierto y qué abre', ver.getAttribute('aria-expanded') === 'false' && !!document.getElementById(ver.getAttribute('aria-controls')));
Q.escribir(sec('T-05').querySelector('.av-pct'), '70'); await enviar();
ok('R9.3 · Si falta un motivo, el foco va a ese cuadro (el lector de pantalla llega solo)', document.activeElement === sec('T-05').querySelector('.av-motivo'));
ok('R9.4 · Las secciones de las torres son tarjetas con su título h2 y sus partes con h3', secs().every(s => s.querySelector('h2') && s.querySelectorAll('h3').length === 3));
// ── Ronda 10 · lo que sale al imprimir ──
Q.escribir(sec('T-05').querySelector('.av-motivo'), 'La contratista declaró 70'); Q.escribir(sec('T-08').querySelector('.av-nota'), 'Sin escaleras todavía');
const r5 = sec('T-05').querySelector('.av-resumen').textContent, r6 = sec('T-06').querySelector('.av-resumen').textContent, r7 = sec('T-07').querySelector('.av-resumen').textContent, r8 = sec('T-08').querySelector('.av-resumen').textContent;
ok('R10.1 · Cada torre tiene su resumen para el papel: el % validado (o el de la app), el motivo y la nota', /validado: 70 %/.test(r5) && /Por qué es distinto: La contratista declaró 70/.test(r5) && /validado: 33 %/.test(r6) && /\(el de la app\)/.test(r7) && /Nota de la T-08: Sin escaleras todavía/.test(r8), [r5, r6, r7, r8].join(' || '));
const css = [...document.styleSheets].map(h => { try { return [...h.cssRules].map(r => r.cssText).join('\n'); } catch (e) { return ''; } }).join('\n');
ok('R10.2 · Al imprimir se esconden los cuadros y los botones de cada torre y sale el resumen', /@media print[\s\S]*\.av-campos[\s\S]*display: none/.test(css) && /@media print[\s\S]*\.av-resumen[\s\S]*display: block/.test(css) && getComputedStyle(sec('T-05').querySelector('.av-resumen')).display === 'none');
ok('R10.3 · Ningún control por debajo de 44 px y nada se sale', Q.chicos().length === 0 && document.documentElement.scrollWidth <= innerWidth + 1, Q.chicos().join(' '));
otraVez(); localStorage.clear(); await Q.relevo({ caido: false, lento: 0 });
