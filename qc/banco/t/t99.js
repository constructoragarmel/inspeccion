// TANDA 99 · v174 (16-oct-2026): el compilado de urbanismo también por «todo el urbanismo» (relevo r68), pedido de Planificación el día del corte.
// 1 en urbanismo, la primera opción es «★ Todo el urbanismo (todas las manzanas y la zona)», y en obra y SHA no aparece · 2 se genera:
// título, tabla por manzana con la columna Manzana, la que no trae cantidades lo dice · 3 se envía con Diego Orta y dice General › Urbanismo
// · 4 nada se sale a 375 px y la tabla se desliza dentro de su caja · 5 al recargar vuelve igual · 6 una manzana sola sigue como antes
// · 7 SHA de todo el urbanismo: tabla por torre con su contratista, y la torre sin frentes lo dice · 8 se envía y dice General › SHA
localStorage.clear(); localStorage.setItem('garmel_clave_envio', 'qc'); await Q.relevo({ borrar: true, caido: false, lento: 0, colgar: 0, perder: false });
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); };
const opts = () => [...$('#torre').options].map(o => o.value + '|' + o.textContent);
sel('tipo', 'urbanismo'); sel('sector', 'EZ'); await hasta(() => [...$('#torre').options].some(o => o.value === 'M-6'), 8000);
const ou = opts(); sel('tipo', 'sha'); sel('sector', 'EZ'); await esperar(100); const os = opts(); sel('tipo', 'obra'); sel('sector', 'EZ'); await esperar(100); const oo = opts();
ok('1 · En urbanismo la primera opción es todo el urbanismo (de las manzanas); en SHA, el de las torres; en obra no aparece (desde la v181, obra se elige por contratista)',
   ou[1] === 'URBANISMO|★ Todo el urbanismo (todas las manzanas y la zona)' && os[1] === 'URBANISMO|★ Todo el urbanismo (todas las torres y la zona)' && !oo.some(x => x.startsWith('URBANISMO')) && $('#lbl-torre').textContent === 'Contratista', ou.slice(0, 3).join(' / '));
sel('tipo', 'urbanismo'); sel('sector', 'EZ'); await hasta(() => [...$('#torre').options].some(o => o.value === 'URBANISMO'), 8000); sel('torre', 'URBANISMO');
sel('quien', 'Diego Orta'); Q.escribir($('#desde'), '2026-10-08'); Q.escribir($('#hasta'), '2026-10-15');
await generar(); await hasta(() => !$('#resultado').hidden, 8000); await esperar(300);
const tabla = $('#tipo-tabla').innerText;
ok('2 · Título, tabla por manzana y la manzana sin cantidades lo dice',
   /Todo el urbanismo/.test($('#titulo').textContent) && /cada manzana/.test($('#tipo-titulo').textContent) && /^Manzana/i.test(tabla) && /Toda la zona/.test(tabla) && /M-6/.test(tabla) &&
   /Sin cantidades en este informe\. Actividades: Replanteo/.test(tabla) && /Bote de material/.test(tabla) && /2 camiones, 5 viajes, 82 m³/.test(tabla),
   $('#titulo').textContent + ' · ' + $('#tipo-sub').textContent);
Q.escribir($('#t-hitos'), 'Bote de material en la M-6 y replanteo en la M-1');
const antes = (await Q.envios()).length; await enviar(); await hasta(() => /archivado|actualizado/.test($('#estado-envio').textContent), 8000);
const ult = (await Q.envios()).slice(antes)[0] || {};
ok('3 · Se envía con Diego Orta y dice que va a General › Urbanismo del sector',
   ult.tipo === 'compilado-urbanismo' && ult.numero === 'COMPILADO-URBANISMO' && (ult.datos || {}).coordinadora === 'Diego Orta' && /General › Urbanismo del sector/.test($('#estado-envio').textContent),
   $('#estado-envio').textContent.slice(0, 120));
const anchoPag = document.documentElement.scrollWidth, caja = $('#tipo-tabla').closest('div'), cs = getComputedStyle(caja);
ok('4 · A 375 px nada se sale de la página; la tabla se desliza dentro de su caja',
   anchoPag <= innerWidth + 1 && (cs.overflowX === 'auto' || cs.overflowX === 'scroll'), 'página ' + anchoPag + ' · ventana ' + innerWidth + ' · caja ' + cs.overflowX);
const g = JSON.parse(localStorage.getItem('garmel_compilado_semana') || '{}');
ok('5 · Lo generado queda guardado para repintarse al recargar', g.tipo === 'urbanismo' && g.torre === 'URBANISMO' && (g.porTorre || []).length === 3, JSON.stringify({ tipo: g.tipo, torre: g.torre, n: (g.porTorre || []).length }));
otraVez(); sel('torre', 'M-6'); await generar(); await hasta(() => !$('#resultado').hidden, 8000); await esperar(200);
ok('6 · Una manzana sola sigue como antes: último informe, sin columna Manzana',
   /último informe\)/.test($('#tipo-titulo').textContent) && /^Sección/i.test($('#tipo-tabla').innerText) && /Manzana M-6/.test($('#titulo').textContent), $('#tipo-titulo').textContent + ' · ' + $('#titulo').textContent);
otraVez(); sel('tipo', 'sha'); sel('sector', 'EZ'); await esperar(100); sel('torre', 'URBANISMO'); await generar(); await hasta(() => !$('#resultado').hidden, 8000); await esperar(300);
const ts = $('#tipo-tabla').innerText;
ok('7 · SHA de todo el urbanismo: tabla por torre con la contratista de cada una; la que no tiene frentes lo dice',
   /cada torre/.test($('#tipo-titulo').textContent) && /^Torre\tContratista/i.test(ts) && /RÍO LIMÓN/.test(ts) && /ALNAVIC[^\n]*Sin frentes en este informe/.test(ts) && /Trabajador sin casco/.test(ts) && /Todo el urbanismo/.test($('#titulo').textContent),
   $('#tipo-sub').textContent);
Q.escribir($('#t-dificultades'), 'Alnavic sin frentes; Río Limón trabajador sin casco');
const a2 = (await Q.envios()).length; await enviar(); await hasta(() => /archivado|actualizado/.test($('#estado-envio').textContent), 8000);
const u2 = (await Q.envios()).slice(a2)[0] || {};
ok('8 · El de SHA se envía y dice que va a General › SHA del sector', u2.tipo === 'compilado-sha' && u2.numero === 'COMPILADO-URBANISMO' && /General › SHA del sector/.test($('#estado-envio').textContent) && document.documentElement.scrollWidth <= innerWidth + 1,
   $('#estado-envio').textContent.slice(0, 100));
