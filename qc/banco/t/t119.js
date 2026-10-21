// TANDA 119 · V181 (21-oct-2026): rondas 1 a 5 de QC del compilado de obra por contratista (ADR-0049), pedidas por Stephanie antes de
// publicar. En compilado.html?prueba=1, a 375×812, con el relevo falso. 1 semana sin informes en ninguna torre · 2 BZS, siete torres,
// dos lentas y una de 60 apartamentos · 3 una torre que no se puede leer · 4 los números raros del % · 5 textos largos, emojis y saltos.
localStorage.clear(); localStorage.setItem('garmel_clave_envio', 'qc'); await Q.relevo({ borrar: true, caido: false, lento: 0, fallarTorres: [], tardaTorre: {} });
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); };
const con = re => [...$('#torre').options].find(o => re.test(o.value)).value;
const fechas = (d, h) => { Q.escribir($('#desde'), d); Q.escribir($('#hasta'), h); };
const pedir = async (ms) => { await generar(); await hasta(() => !$('#resultado').hidden || /No se pudo|tardó/.test($('#estado').textContent), ms || 15000); await esperar(200); };
const secs = () => $$('#torres-contratista .torre-c');
const sec = t => secs().find(x => x.dataset.torre === t);
sel('tipo', 'obra'); sel('sector', 'EZ'); sel('quien', COORDINADORES[0].n);
// ── Ronda 1 · semana sin informes ──
sel('torre', con(/ALNAVIC/)); fechas('2026-12-03', '2026-12-09'); await pedir();
ok('R1.1 · Semana sin informes: lo dice para la contratista y cada torre dice que no hubo apartamentos ni informe de torre',
   !$('#sin-informes').hidden && /No llegó ningún informe de obra de las torres de .*ALNAVIC/.test($('#sin-informes').textContent) && secs().length === 4 &&
   secs().every(s => /No hubo informes de apartamento/.test(s.textContent) && /No hubo informe de torre/.test(s.textContent) && /0 informes en la semana/.test(s.querySelector('h2').textContent)), $('#sin-informes').textContent.slice(0, 120));
ok('R1.2 · Aun sin informes, cada torre trae su % de la app (es a la fecha, no de la semana)', secs().every(s => /%/.test((s.querySelector('.av-num') || {}).textContent || '')));
Q.escribir($('#t-otros'), 'Semana sin inspección por lluvias');
const e0 = (await Q.envios()).length; await enviar(); await hasta(() => /archivado|No se pudo/.test($('#estado-envio').textContent), 8000);
ok('R1.3 · Y se puede validar y enviar igual', /archivado/.test($('#estado-envio').textContent) && (await Q.envios()).length === e0 + 1, $('#estado-envio').textContent.slice(0, 100));
// ── Ronda 2 · BZS: siete torres, dos lentas, la T-17 con 60 apartamentos ──
otraVez(); await Q.relevo({ tardaTorre: { 'T-46': 2, 'T-48': 3 } }); sel('torre', con(/BELZARUBEZH/)); fechas('2026-10-15', '2026-10-21');
const t0 = performance.now(); const prom = generar(); await esperar(1200);
const enCurso = $('#estado').textContent, btnOff = $('#btn-generar').disabled;
await prom; await hasta(() => !$('#resultado').hidden, 15000); const ms = Math.round(performance.now() - t0);
ok('R2.1 · Mientras lee, dice cuántas de las 7 torres van listas y el botón queda apagado', /de 7 listas/.test(enCurso) && /T-17, T-18, T-19, T-45, T-46, T-47, T-48/.test(enCurso) && btnOff && !$('#btn-generar').disabled, enCurso.slice(0, 160));
ok('R2.2 · Las siete se leen a la vez: con dos de 2 y 3 s, el total ronda 3 s, no 5', ms < 4800, ms + ' ms');
ok('R2.3 · Las siete secciones salen en orden (3 · T-17 … 9 · T-48)', secs().map(s => s.dataset.torre).join() === 'T-17,T-18,T-19,T-45,T-46,T-47,T-48' && /^9 · T-48/.test(secs()[6].querySelector('h2').textContent));
const m17 = sec('T-17').querySelector('table.mz');
ok('R2.4 · La T-17 con 60 apartamentos: 15 pisos, 60 filas, la tabla desliza dentro de su caja y la página no se sale', m17.querySelectorAll('td.piso').length === 15 && m17.querySelectorAll('tr').length === 76 && document.documentElement.scrollWidth <= innerWidth + 1, m17.querySelectorAll('tr').length + ' filas · ' + document.documentElement.scrollWidth);
ok('R2.5 · El membrete suma 7 torres de informes', /T-17: 61/.test($('#membrete').textContent) && (($('#membrete').textContent.match(/T-\d\d: \d+/g) || []).length === 7), $('#membrete').textContent.slice(0, 200));
await Q.relevo({ tardaTorre: {} });
// ── Ronda 3 · una torre que no se puede leer ──
otraVez(); await Q.relevo({ fallarTorres: ['T-07'] }); sel('torre', con(/ALNAVIC/)); await pedir();
ok('R3.1 · Si una torre falla, se ven las demás y la que falló lo dice con un botón para reintentarla', !$('#resultado').hidden && secs().length === 4 && /No se pudo leer/.test(sec('T-07').textContent) && !!sec('T-07').querySelector('.reintentar') && !!sec('T-05').querySelector('.av-pct'), $('#estado').textContent.slice(0, 120) + ' · ' + (sec('T-07') || {}).textContent);
Q.escribir($('#t-hitos'), 'Validación con una torre caída');
await enviar();
ok('R3.2 · No deja enviar con una torre sin leer y dice cuál', /T-07/.test($('#estado-envio').textContent) && /no se pudo leer|vuelva a intentar|reintent/i.test($('#estado-envio').textContent), $('#estado-envio').textContent);
await Q.relevo({ fallarTorres: [] }); sec('T-07').querySelector('.reintentar').click(); await hasta(() => sec('T-07') && !!sec('T-07').querySelector('.av-pct'), 8000);
ok('R3.3 · «Reintentar» trae la torre y lo escrito sigue ahí', !!sec('T-07').querySelector('.av-pct') && $('#t-hitos').value === 'Validación con una torre caída' && /T-07: 4/.test($('#membrete').textContent));
// ── Ronda 4 · los números raros del % ──
const s5 = sec('T-05'), app5 = Number(s5.querySelector('.av-num').textContent.replace(/[^\d.]/g, '')), mot = () => !s5.querySelector('.av-motivo-c').hidden;
const casos = [[String(app5).replace('.', ',') + ',0', false], [' ' + app5 + ' % ', false], [String(app5 + 0.04), false], ['0', true], ['100', true], [String(app5 + 0.1), true]];
const res4 = casos.map(([v, debe]) => { Q.escribir(s5.querySelector('.av-pct'), v); return mot() === debe ? '' : v + '→' + mot(); }).filter(Boolean);
ok('R4.1 · Igual al de la app (con coma, con espacios y %, o a menos de 0,05) no pide motivo; 0, 100 o una décima distinta sí', !res4.length, res4.join(' | '));
Q.escribir(s5.querySelector('.av-pct'), '-5'); await enviar();
ok('R4.2 · Un negativo no se manda', /El % de la T-05 tiene que ser un número entre 0 y 100/.test($('#estado-envio').textContent), $('#estado-envio').textContent);
Q.escribir(s5.querySelector('.av-pct'), '43,5'); Q.escribir(s5.querySelector('.av-motivo'), 'Ajuste por partidas sin medir');
const e1 = (await Q.envios()).length; await enviar(); await hasta(() => /archivado|actualizado|No se pudo/.test($('#estado-envio').textContent), 8000);
const u4 = (await Q.envios()).slice(e1)[0] || {}, t4 = ((u4.datos || {}).torres || []).find(x => x.torre === 'T-05') || {};
ok('R4.3 · «43,5» llega como el número 43.5, con su motivo', t4.pct === 43.5 && /sin medir/.test(t4.motivo), JSON.stringify(t4));
// ── Ronda 5 · textos largos, emojis y saltos ──
const largo = 'Línea uno con «comillas» y "dobles" 😊\nLínea dos\n\n' + 'Texto largo de la coordinación. '.repeat(60);
Q.escribir($('#t-exitos'), largo); Q.escribir(s5.querySelector('.av-nota'), 'Nota 🏗️ con salto\nde línea'); Q.escribir(s5.querySelector('.av-motivo'), 'Motivo con «comillas» 👷\ny salto');
const e2 = (await Q.envios()).length; await enviar(); await hasta(() => /actualizado|archivado|No se pudo/.test($('#estado-envio').textContent) && (Q.envios ? true : true), 8000); await esperar(300);
const u5 = (await Q.envios()).slice(e2)[0] || {}, t5 = ((u5.datos || {}).torres || []).find(x => x.torre === 'T-05') || {};
ok('R5.1 · Textos de casi 2.000 caracteres, emojis, comillas y saltos llegan intactos (validación, nota y motivo)', ((u5.datos || {}).textos || {}).exitos === largo.trim() && t5.nota === 'Nota 🏗️ con salto\nde línea' && t5.motivo === 'Motivo con «comillas» 👷\ny salto', JSON.stringify(t5).slice(0, 160));
ok('R5.2 · Los cuadros crecen con el texto y la página no se sale', $('#t-exitos').scrollHeight <= $('#t-exitos').clientHeight + 4 && document.documentElement.scrollWidth <= innerWidth + 1, $('#t-exitos').scrollHeight + '/' + $('#t-exitos').clientHeight);
ok('R5.3 · Ningún control por debajo de 44 px', Q.chicos().length === 0, Q.chicos().join(' '));
otraVez(); localStorage.clear(); await Q.relevo({ fallarTorres: [], tardaTorre: {} });
