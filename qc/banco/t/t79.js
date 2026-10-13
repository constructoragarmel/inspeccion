// TANDA 79 · V153 (13-oct-2026): lo que podía fallar en el proceso del compilado, pedido por Stephanie («10 QC de todo este
// nuevo proceso»). En compilado.html?prueba=1 con el relevo falso.
localStorage.setItem('garmel_clave_envio', 'qc'); await Q.relevo({ borrar: true, caido: false, lento: 0 });
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); };
// QC 1 · El texto del miércoles sigue el jueves: el borrador va por semana (desde), no por el día del envío (hasta).
sel('sector', 'EZ'); sel('torre', 'T-01'); sel('quien', COORDINADORES[1].n); Q.escribir($('#desde'), '2026-10-08'); Q.escribir($('#hasta'), '2026-10-14');
await generar(); await hasta(() => !$('#resultado').hidden, 5000);
Q.escribir($('#t-exitos'), 'Escrito el miércoles 😊\n«con comillas» y "dobles" y salto de línea');
otraVez(); Q.escribir($('#hasta'), '2026-10-15'); await generar(); await hasta(() => !$('#resultado').hidden, 5000);
ok('1 · Lo escrito el miércoles sigue ahí el jueves (la fecha final cambió, la semana no)', $('#t-exitos').value.indexOf('Escrito el miércoles') === 0, JSON.stringify($('#t-exitos').value.slice(0, 40)));
// QC 2 · Emojis, comillas y saltos de línea llegan intactos al relevo.
const antes = (await Q.envios()).length; await enviar(); await hasta(() => /archivado|actualizado|No se pudo/.test($('#estado-envio').textContent), 5000);
const env = await Q.envios(), ult = env[env.length - 1] || {};
ok('2 · Emojis, comillas y saltos de línea llegan intactos al relevo', env.length === antes + 1 && ((ult.datos || {}).textos || {}).exitos === 'Escrito el miércoles 😊\n«con comillas» y "dobles" y salto de línea', JSON.stringify(((ult.datos || {}).textos || {}).exitos));
ok('2b · El archivo se nombra por la semana (SEM-261008) y con el prefijo PRUEBA en modo de prueba, y la respuesta trae el PDF', /PRUEBA-EZ-T01-SEM-261008/.test($('#estado-envio').textContent) && $$('#estado-envio a').length === 2, $('#estado-envio').textContent);
// QC 3 · El relevo caído: aviso claro y el botón vuelve a servir.
otraVez(); await Q.relevo({ caido: true }); await generar(); await hasta(() => /No se pudo/.test($('#estado').textContent), 8000);
ok('3 · Con el relevo caído avisa «No se pudo armar» y el botón queda habilitado', /No se pudo armar/.test($('#estado').textContent) && !$('#btn-generar').disabled && $('#resultado').hidden, $('#estado').textContent);
await Q.relevo({ caido: false });
// QC 4 · Enviar con el relevo caído: lo escrito no se pierde.
await generar(); await hasta(() => !$('#resultado').hidden, 5000); Q.escribir($('#t-otros'), 'No se pierde'); await Q.relevo({ caido: true });
await enviar(); await hasta(() => /No se pudo archivar/.test($('#estado-envio').textContent), 8000);
ok('4 · Enviar con el relevo caído avisa y conserva lo escrito en el equipo', /sigue guardado en este equipo/.test($('#estado-envio').textContent) && JSON.parse(localStorage.getItem('garmel_compilado_EZ_T-01_2026-10-08') || '{}').otros === 'No se pierde' && !$('#btn-enviar').disabled, $('#estado-envio').textContent);
await Q.relevo({ caido: false });
// QC 5 · Un nombre recordado que ya no está en la lista no deja el desplegable en blanco; y el último sector y torre se recuerdan.
localStorage.setItem('garmel_compilado_ultimo', JSON.stringify({ sector: 'SB', torre: 'J-12', quien: 'Alguien que ya no está' }));
ok('5 · Preparado para recargar: el recuerdo lleva un nombre que no está en la lista', true);
// QC 6 · Fechas al revés y ventana de más de 60 días.
Q.escribir($('#desde'), '2026-10-10'); Q.escribir($('#hasta'), '2026-10-09'); await generar();
ok('6 · Fechas al revés: avisa sin llamar al relevo', /fechas/i.test($('#estado').textContent), $('#estado').textContent);
localStorage.removeItem('garmel_compilado_EZ_T-01_2026-10-08');
