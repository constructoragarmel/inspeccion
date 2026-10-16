// TANDA 84 · V162 (13-oct-2026): el proceso de los compilados de servicios, urbanismo y SHA, con las mismas comprobaciones que
// t79 hizo para obra: borrador por semana, caídas del relevo, fechas, textos raros, nombre fuera de lista, recarga.
if (sessionStorage.getItem('t84')) {
JSON.parse(sessionStorage.getItem('t84') || '[]').forEach(r => Q.R.push(r)); sessionStorage.removeItem('t84');
await esperar(600);
ok('9 · Al recargar vuelve la semana de SHA, con el tipo, la torre y el aviso', !$('#resultado').hidden && $('#tipo').value === 'sha' && $('#torre').value === 'T-01' && /Se muestra la semana/.test($('#estado').textContent) && !$('#bloque-tipo').hidden, $('#tipo').value + ' ' + $('#torre').value);
ok('10 · Ningún control por debajo de 44 px con SHA en pantalla', Q.chicos().length === 0, Q.chicos().join(' '));
localStorage.clear();
} else {
localStorage.clear(); localStorage.setItem('garmel_clave_envio', 'qc'); await Q.relevo({ borrar: true, caido: false, lento: 0 });
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); };
// 1 · El borrador de cada tipo va por semana y por tipo: el texto del miércoles sigue el jueves y no se mezcla entre tipos.
sel('tipo', 'servicios'); sel('sector', 'EZ'); sel('torre', 'T-01'); sel('quien', COORDINADORES[3].n); Q.escribir($('#desde'), '2026-10-08'); Q.escribir($('#hasta'), '2026-10-14');
await generar(); await hasta(() => !$('#resultado').hidden, 5000);
Q.escribir($('#t-exitos'), 'Servicios del miércoles 😊\n«comillas»');
otraVez(); sel('tipo', 'sha'); sel('sector', 'EZ'); sel('torre', 'T-01'); await generar(); await hasta(() => !$('#resultado').hidden, 5000);
ok('1 · El borrador de SHA de la misma torre y semana arranca vacío: no hereda el de servicios', $('#t-exitos').value === '', JSON.stringify($('#t-exitos').value));
Q.escribir($('#t-dificultades'), 'SHA del miércoles');
otraVez(); sel('tipo', 'servicios'); Q.escribir($('#hasta'), '2026-10-15'); await generar(); await hasta(() => !$('#resultado').hidden, 5000);
ok('2 · El texto de servicios del miércoles sigue el jueves (cambió «hasta», no la semana)', $('#t-exitos').value.indexOf('Servicios del miércoles') === 0, JSON.stringify($('#t-exitos').value.slice(0, 40)));
// 3 · Emojis y comillas llegan intactos y el envío lleva tipo y prefijo.
const antes = (await Q.envios()).length; await enviar(); await hasta(() => /archivado|actualizado|No se pudo/.test($('#estado-envio').textContent), 5000);
let env = await Q.envios(), ult = env[env.length - 1] || {};
ok('3 · Emojis y comillas intactos; el archivo es SRV-…-SEM-261008 con PRUEBA en modo de prueba', env.length === antes + 1 && ((ult.datos || {}).textos || {}).exitos === 'Servicios del miércoles 😊\n«comillas»' && ult.tipo === 'compilado-servicios' && /PRUEBA-SRV-EZ-T01-SEM-261008/.test($('#estado-envio').textContent), $('#estado-envio').textContent.slice(0, 90));
// 4 · Relevo caído al generar urbanismo: aviso y botón libre; las manzanas recordadas siguen.
otraVez(); sel('tipo', 'urbanismo'); await esperar(400); sel('torre', 'M-6'); await Q.relevo({ caido: true }); await generar(); await hasta(() => /No se pudo/.test($('#estado').textContent), 8000);
ok('4 · Urbanismo con el relevo caído: «No se pudo armar», botón habilitado y las manzanas recordadas siguen en la lista', /No se pudo armar/.test($('#estado').textContent) && !$('#btn-generar').disabled && $('#torre').options.length === 5, $('#estado').textContent + ' · ' + $('#torre').options.length);
await Q.relevo({ caido: false });
// 5 · Enviar SHA con el relevo caído conserva lo escrito.
otraVez(); sel('tipo', 'sha'); sel('sector', 'EZ'); sel('torre', 'T-01'); await generar(); await hasta(() => !$('#resultado').hidden, 5000);
ok('5 · El borrador de SHA escrito antes sigue ahí', $('#t-dificultades').value === 'SHA del miércoles', $('#t-dificultades').value);
await Q.relevo({ caido: true }); await enviar(); await hasta(() => /No se pudo archivar/.test($('#estado-envio').textContent), 8000);
ok('6 · Enviar SHA con el relevo caído avisa y conserva lo escrito', /sigue guardado en este equipo/.test($('#estado-envio').textContent) && JSON.parse(localStorage.getItem('garmel_compilado_sha_EZ_T-01_2026-10-08') || '{}').dificultades === 'SHA del miércoles', $('#estado-envio').textContent);
await Q.relevo({ caido: false });
// 7 · Fechas al revés y ventana larga se detienen antes de llamar.
Q.escribir($('#desde'), '2026-10-10'); Q.escribir($('#hasta'), '2026-10-09'); await generar();
ok('7 · Fechas al revés en SHA: avisa sin llamar al relevo', /fechas/i.test($('#estado').textContent), $('#estado').textContent);
// 8 · Recargar repinta la semana del tipo que estaba y con el tipo elegido.
Q.escribir($('#desde'), '2026-10-08'); Q.escribir($('#hasta'), '2026-10-14'); await generar(); await hasta(() => !$('#resultado').hidden, 5000);
ok('8 · Preparado para recargar con SHA en pantalla', $('#tipo').value === 'sha' && !!localStorage.getItem('garmel_compilado_semana'));
sessionStorage.setItem('t84', JSON.stringify(Q.R)); setTimeout(function(){ location.reload(); }, 200); throw 'recargando: vuelva a correr t84';
}
