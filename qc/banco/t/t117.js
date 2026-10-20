// TANDA 117 · v180 (20-oct-2026): dos pedidos de Diego Orta en el compilado (`compilado.html?prueba=1`, a 375 × 812).
// El número …-SEM-261008 lleva el lunes de la semana (así desde el r55, no se cambia) y se leía como la fecha de generación:
// la página lo dice en palabras. Y Eduardo Rivero entra como coordinador de urbanismo.
// 1 Eduardo está al final de «Quién valida» como «Eduardo Rivero · Urbanismo», sin mover a los demás · 2 al generar, arriba dice
// «Semana del 08 al 14-oct · generado el DD-mmm por Eduardo Rivero» y ya no la fila «Generado» · 3 al enviar, el aviso lo repite
// junto al número · 4 al volver a generar la misma semana, el aviso de lo archivado dice «generado el DD-mmm por Eduardo Rivero» ·
// 5 una semana entre dos meses dice «del 29-sep al 05-oct» · 6 la línea cabe a 375 px.
localStorage.clear(); localStorage.setItem('garmel_clave_envio', 'qc'); await Q.relevo({ borrar: true, caido: false, lento: 0, colgar: 0, perder: false });
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); };
const M = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const dm = iso => { const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[3] + '-' + M[+m[2] - 1] : '?'; };   // el relevo falso contesta fechas fijas
const ops = [...$('#quien').options].map(o => o.textContent);
ok('1 · Eduardo Rivero al final de «Quién valida» como «Eduardo Rivero · Urbanismo»; Diego y Miguel siguen antes',
   COORDINADORES[COORDINADORES.length - 1].n === 'Eduardo Rivero (CIV-169.435)' && COORDINADORES[COORDINADORES.length - 1].a === 'Urbanismo' &&
   ops[ops.length - 1] === 'Eduardo Rivero · Urbanismo' && ops[ops.length - 2] === 'Miguel E. Ávila · Planificación', ops.slice(-3).join(' | '));
sel('tipo', 'urbanismo'); sel('sector', 'EZ'); await hasta(() => [...$('#torre').options].some(o => o.value === 'M-6'), 8000); sel('torre', 'M-6');
sel('quien', 'Eduardo Rivero (CIV-169.435)'); Q.escribir($('#desde'), '2026-10-08'); Q.escribir($('#hasta'), '2026-10-14');
await generar(); await hasta(() => !$('#resultado').hidden, 8000); await esperar(200);
const linea = ($('#linea-semana') || {}).textContent || '', GEN = dm(DATA.generado);
ok('2 · Arriba dice «Semana del 08 al 14-oct · generado el ' + GEN + ' por Eduardo Rivero» (el día que contestó el relevo), y ya no hay fila «Generado:»',
   GEN !== '?' && linea === 'Semana del 08 al 14-oct · generado el ' + GEN + ' por Eduardo Rivero' && !/Generado:/.test($('#membrete').textContent), '«' + linea + '»');
const r6 = $('#linea-semana').getBoundingClientRect();
ok('6 · La línea de la semana cabe a ' + innerWidth + ' px', r6.right <= innerWidth && document.documentElement.scrollWidth <= innerWidth, Math.round(r6.right) + ' / ' + innerWidth);
Q.escribir($('#t-hitos'), 'Bote de material en la M-6');
await enviar(); await hasta(() => /archivado|actualizado/.test($('#estado-envio').textContent), 8000);
const est = $('#estado-envio').textContent, ARCH = dm(DATA.archivado && DATA.archivado.guardado);
ok('3 · Al enviar, el aviso dice el número y, en palabras, la semana y quién y cuándo lo archivó', /SEM-/.test(est) && ARCH !== '?' && est.indexOf('(Semana del 08 al 14-oct · generado el ' + ARCH + ' por Eduardo Rivero)') >= 0, est.slice(0, 200));
otraVez(); await esperar(200);
sel('tipo', 'urbanismo'); sel('sector', 'EZ'); await hasta(() => [...$('#torre').options].some(o => o.value === 'M-6'), 8000); sel('torre', 'M-6');
sel('quien', 'Diego Orta'); Q.escribir($('#desde'), '2026-10-08'); Q.escribir($('#hasta'), '2026-10-14');
await generar(); await hasta(() => !$('#resultado').hidden, 8000); await esperar(300);
const av = $('#aviso-archivado');
const ARCH4 = dm(DATA.archivado && DATA.archivado.guardado);
ok('4 · Al volver a generar la misma semana, el aviso de lo archivado dice «generado el ' + ARCH4 + ' por Eduardo Rivero»',
   av && !av.hidden && ARCH4 !== '?' && av.textContent.indexOf('(generado el ' + ARCH4 + ' por Eduardo Rivero)') >= 0, av ? av.textContent.slice(0, 160) : 'sin aviso');
otraVez(); await esperar(200);
sel('tipo', 'urbanismo'); sel('sector', 'EZ'); await hasta(() => [...$('#torre').options].some(o => o.value === 'M-6'), 8000); sel('torre', 'M-6');
Q.escribir($('#desde'), '2026-09-29'); Q.escribir($('#hasta'), '2026-10-05');
await generar(); await hasta(() => !$('#resultado').hidden, 8000); await esperar(200);
ok('5 · Una semana entre dos meses dice «Semana del 29-sep al 05-oct»', /^Semana del 29-sep al 05-oct · generado el /.test(($('#linea-semana') || {}).textContent || ''), ($('#linea-semana') || {}).textContent);
localStorage.clear();
