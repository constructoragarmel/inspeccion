// TANDA 96 · v171 (15-oct-2026): diez QC del compilado de servicios por urbanismo antes de avisar a Planificación (pedido de Stephanie).
// Nueve aquí, en compilado.html?prueba=1 a 375×812 contra el relevo falso; la décima (el borrador del informe toma el compilado de todo el
// urbanismo) se corre contra el relevo real desde el editor. Cada paso, sobre los bordes donde ya falló algún compilado.
// 1 borrador por semana: lo escrito sigue al cambiar «hasta» y no se mezcla con el de una torre del mismo sector y semana
// 2 de todo el urbanismo a una torre y de vuelta: el aviso de guardado vuelve a su texto, la tabla cambia de columnas, no quedan filas viejas
// 3 cambiar a SHA u obra con «Todo el urbanismo» elegido: la opción desaparece y no se puede pedir un SHA de todo el urbanismo
// 4 relevo caído al generar: aviso claro y botón habilitado · 5 relevo caído al enviar: avisa y conserva lo escrito
// 6 semana sin informes: lo dice para «todo el urbanismo» y la tabla dice que no hubo · 7 «Enviar de nuevo» lo actualiza (no crea otro)
// 8 a 320×568: nada se sale, nada por debajo de 44 px, y la columna Torre queda fija al deslizar la tabla · 9 al recargar vuelve todo
if (sessionStorage.getItem('t96')) {
  JSON.parse(sessionStorage.getItem('t96') || '[]').forEach(r => Q.R.push(r)); sessionStorage.removeItem('t96');
  await esperar(800);
  ok('9 · Al recargar vuelve la semana de todo el urbanismo, con su tabla por torre y lo escrito',
     $('#torre').value === 'URBANISMO' && !$('#resultado').hidden && /Todo el urbanismo/.test($('#titulo').textContent) && $('#tipo-tabla tr th').textContent === 'Torre' &&
     $('#t-otros').value === 'Antes de recargar' && /todo el urbanismo/.test($('#estado').textContent),
     $('#torre').value + ' · ' + $('#estado').textContent.slice(0, 70) + ' · ' + JSON.stringify($('#t-otros').value));
  localStorage.clear();
} else {
localStorage.clear(); localStorage.setItem('garmel_clave_envio', 'qc'); await Q.relevo({ borrar: true, caido: false, lento: 0, colgar: 0, perder: false });
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); };
const fechas = (d, h) => { Q.escribir($('#desde'), d); Q.escribir($('#hasta'), h); };
const pedir = async () => { await generar(); await hasta(() => !$('#resultado').hidden || /No se pudo/.test($('#estado').textContent), 8000); await esperar(200); };
const urb = async () => { sel('tipo', 'servicios'); sel('sector', 'SB'); await esperar(100); sel('torre', 'URBANISMO'); sel('quien', COORDINADORES[3].n); };
// 1
await urb(); fechas('2026-10-08', '2026-10-14'); await pedir();
Q.escribir($('#t-exitos'), 'Urbanismo del miércoles ✅'); await esperar(300);
const guardadoUrb = $('#guardado-txt').textContent;   // para el paso 2: justo después de escribir dice «Borrador guardado ✓»
otraVez(); sel('torre', 'J-07'); await pedir();
const deTorre = $('#t-exitos').value;
otraVez(); sel('torre', 'URBANISMO'); fechas('2026-10-08', '2026-10-15'); await pedir();
ok('1 · El borrador de todo el urbanismo sigue al cambiar «hasta» y no aparece en el de la J-07 del mismo sector y semana',
   deTorre === '' && $('#t-exitos').value === 'Urbanismo del miércoles ✅', 'J-07=' + JSON.stringify(deTorre) + ' urbanismo=' + JSON.stringify($('#t-exitos').value));
// 2
otraVez(); sel('torre', 'J-07'); await pedir();
const enTorre = { th: $('#tipo-tabla tr th').textContent, filas: [...$$('#tipo-tabla tr td:first-child')].filter(td => /Toda la zona/.test(td.textContent)).length, titulo: $('#titulo').textContent, guardado: $('#guardado-txt').textContent };
otraVez(); sel('torre', 'URBANISMO'); await pedir();
ok('2 · De todo el urbanismo a una torre y de vuelta: sin columna Torre ni filas de otros lugares en la torre, y vuelven al regresar',
   enTorre.th === 'Ente' && enTorre.filas === 0 && /J-07/.test(enTorre.titulo) && $('#tipo-tabla tr th').textContent === 'Torre' && /Borrador guardado/.test(guardadoUrb) && !/Borrador guardado/.test(enTorre.guardado),
   JSON.stringify(enTorre).slice(0, 160));
// 3
otraVez(); sel('tipo', 'sha'); await esperar(100);
const conSha = [...$('#torre').options].some(o => o.value === 'URBANISMO'), torreSha = $('#torre').value;
sel('tipo', 'obra'); await esperar(100);
const conObra = [...$('#torre').options].some(o => o.value === 'URBANISMO'), torreObra = $('#torre').value;
// v174: SHA también tiene «Todo el urbanismo», así que al pasar de servicios a SHA la elección se mantiene; en obra desaparece.
ok('3 · Al pasar a SHA la opción sigue (v174) y queda elegida; al pasar a obra desaparece y la torre queda sin elegir',
   conSha && torreSha === 'URBANISMO' && !conObra && torreObra === '', 'sha=' + conSha + ' obra=' + conObra + ' torreSha=«' + torreSha + '» torreObra=«' + torreObra + '»');
// 4
await urb(); await Q.relevo({ caido: true }); await generar(); await hasta(() => /No se pudo/.test($('#estado').textContent), 8000);
ok('4 · Relevo caído al generar todo el urbanismo: «No se pudo armar» y el botón queda habilitado',
   /No se pudo armar/.test($('#estado').textContent) && !$('#btn-generar').disabled, $('#estado').textContent.slice(0, 80));
await Q.relevo({ caido: false });
// 5
await pedir(); Q.escribir($('#t-dificultades'), 'Falta medidor en J-08');
await Q.relevo({ caido: true }); await enviar(); await hasta(() => /No se pudo archivar/.test($('#estado-envio').textContent), 8000);
const borr5 = JSON.parse(localStorage.getItem('garmel_compilado_servicios_SB_URBANISMO_2026-10-08') || '{}');
ok('5 · Relevo caído al enviar: avisa, conserva lo escrito en el equipo y el botón sigue disponible',
   /sigue guardado en este equipo/.test($('#estado-envio').textContent) && borr5.dificultades === 'Falta medidor en J-08' && !$('#btn-enviar').disabled,
   $('#estado-envio').textContent.slice(0, 90));
await Q.relevo({ caido: false });
// 6
otraVez(); fechas('2026-12-03', '2026-12-09'); await pedir();
ok('6 · Semana sin informes: dice «No llegó ningún informe de servicios de todo el urbanismo» y la tabla, que no hubo',
   !$('#sin-informes').hidden && /de todo el urbanismo entre/.test($('#sin-informes').textContent) && /No hubo informes de servicios/.test($('#tipo-sub').textContent) && !$('#tipo-tabla').innerHTML,
   $('#sin-informes').textContent.slice(0, 90) + ' · ' + $('#tipo-sub').textContent);
// 7
otraVez(); fechas('2026-10-08', '2026-10-14'); await pedir();
const antes7 = (await Q.envios()).length;
await enviar(); await hasta(() => /archivado|actualizado/.test($('#estado-envio').textContent), 8000);
const primero = $('#estado-envio').textContent, boton = $('#btn-enviar').textContent;
Q.escribir($('#t-otros'), 'Agregado después'); await enviar(); await hasta(() => /actualizado/.test($('#estado-envio').textContent), 8000);
const env7 = (await Q.envios()).slice(antes7);
ok('7 · Enviar y «Enviar de nuevo»: el segundo dice «actualizado», con el mismo número y el texto nuevo',
   /archivado/.test(primero) && /Enviar de nuevo/.test(boton) && /actualizado/.test($('#estado-envio').textContent) && env7.length === 2 && env7[0].numero === env7[1].numero && env7[1].datos.textos.otros === 'Agregado después',
   env7.map(e => e.numero).join(' | ') + ' · ' + $('#estado-envio').textContent.slice(0, 60));
// 8
const vw = innerWidth, sc = $('#tipo-tabla').closest('.scroll');
sc.scrollLeft = 400; await esperar(200);
const celda = $$('#tipo-tabla tr td:first-child').find(td => /T-01|Toda la zona/.test(td.textContent));
const fija = celda && Math.abs(celda.getBoundingClientRect().left - sc.getBoundingClientRect().left) < 3;
sc.scrollLeft = 0;
ok('8 · A ' + vw + ' px nada se sale, nada por debajo de 44 px, y la columna Torre queda fija al deslizar la tabla',
   document.documentElement.scrollWidth <= innerWidth && Q.chicos().length === 0 && fija, 'desborde=' + (document.documentElement.scrollWidth - innerWidth) + ' chicos=' + Q.chicos().length + ' fija=' + fija);
// 9 (prepara la recarga)
Q.escribir($('#t-otros'), 'Antes de recargar'); await esperar(300);
sessionStorage.setItem('t96', JSON.stringify(Q.R));
ok('9a · Preparado para recargar con todo el urbanismo en pantalla', !!localStorage.getItem('garmel_compilado_semana'));
}
