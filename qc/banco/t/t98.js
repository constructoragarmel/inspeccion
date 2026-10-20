// TANDA 98 · v173 (16-oct-2026): Diego Orta, de Planificación, entra a «quién valida» para enviar los compilados de urbanismo.
// 1 la lista trae a los cuatro de siempre en su lugar y a Diego al final, como «Diego Orta · Planificación» · 2 un compilado de
// urbanismo (EZ, M-6) se genera y se envía con su nombre · 3 al recargar, la página recuerda que validaba Diego
localStorage.clear(); localStorage.setItem('garmel_clave_envio', 'qc'); await Q.relevo({ borrar: true, caido: false, lento: 0, colgar: 0, perder: false });
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); };
const ops = [...$('#quien').options].map(o => o.textContent);
// v180: Eduardo Rivero entra después de Miguel (t117); Diego y Miguel siguen en su lugar.
ok('1 · Los cuatro de siempre en su lugar y Diego Orta y Miguel Ávila detrás, como Planificación (v174: Miguel; v180: Eduardo después)',
   COORDINADORES.length >= 6 && COORDINADORES[3].n === 'Hernán Escobar (CIV-151.021)' && COORDINADORES[4].n === 'Diego Orta' && COORDINADORES[5].n === 'Miguel E. Ávila (CIV-NC)' &&
   ops.indexOf('Diego Orta · Planificación') >= 0 && ops.indexOf('Miguel E. Ávila · Planificación') === ops.indexOf('Diego Orta · Planificación') + 1, ops.join(' | '));
sel('tipo', 'urbanismo'); sel('sector', 'EZ'); await hasta(() => [...$('#torre').options].some(o => o.value === 'M-6'), 8000); sel('torre', 'M-6');
sel('quien', 'Diego Orta'); Q.escribir($('#desde'), '2026-10-08'); Q.escribir($('#hasta'), '2026-10-15');
await generar(); await hasta(() => !$('#resultado').hidden, 8000); await esperar(200);
Q.escribir($('#t-hitos'), 'Bote de material en la M-6');
const antes = (await Q.envios()).length; await enviar(); await hasta(() => /archivado|actualizado/.test($('#estado-envio').textContent), 8000);
const ult = (await Q.envios()).slice(antes)[0] || {};
ok('2 · El compilado de urbanismo sale con Diego Orta como quien valida', ult.tipo === 'compilado-urbanismo' && ult.datos && ult.datos.coordinadora === 'Diego Orta',
   JSON.stringify({ tipo: ult.tipo, coord: (ult.datos || {}).coordinadora, estado: $('#estado-envio').textContent.slice(0, 60) }));
const g = JSON.parse(localStorage.getItem('garmel_compilado_ultimo') || '{}');
ok('3 · La página recuerda que validaba Diego para la próxima vez', g.quien === 'Diego Orta' && g.tipo === 'urbanismo', JSON.stringify(g));
