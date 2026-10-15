// TANDA 95 · v171 (15-oct-2026): el compilado de servicios POR URBANISMO (todo el sector), pedido de Planificación: servicios no
// trabaja por torre en todos los sectores (en Ezequiel Zamora la semana del 8 trajo un solo informe, de toda la zona). Corre en
// compilado.html?prueba=1 contra el relevo falso, que contesta `porTorre` como el r64.
// 1 la opción «Todo el urbanismo» aparece solo en servicios, y primero · 2 no aparece en obra, urbanismo ni SHA
// 3 el compilado de todo el urbanismo muestra «Todo el urbanismo» y una tabla con columna Torre y una fila por lugar
// 4 enviar lo archiva como SRV-…-URBANISMO-SEM-261008 con el texto · 5 nada por debajo de 44 px · 6 una torre sigue como antes
localStorage.clear(); localStorage.setItem('garmel_clave_envio', 'qc'); await Q.relevo({ borrar: true, caido: false, lento: 0, colgar: 0, perder: false });
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); };
const opciones = () => [...$('#torre').options].map(o => o.value);
sel('tipo', 'servicios'); sel('sector', 'EZ'); await esperar(100);
ok('1 · Servicios: «Todo el urbanismo» es la primera opción después de «Seleccione torre»', opciones()[1] === 'URBANISMO' && /Todo el urbanismo/.test($('#torre').options[1].textContent), opciones().slice(0, 3).join(','));
const otros = {};
for (const t of ['obra', 'sha']) { sel('tipo', t); sel('sector', 'EZ'); await esperar(100); otros[t] = opciones().indexOf('URBANISMO') < 0; }
sel('tipo', 'urbanismo'); await esperar(400); otros.urbanismo = opciones().indexOf('URBANISMO') < 0;
ok('2 · Obra, SHA y urbanismo no la ofrecen', otros.obra && otros.sha && otros.urbanismo, JSON.stringify(otros));
sel('tipo', 'servicios'); sel('sector', 'EZ'); await esperar(100); sel('torre', 'URBANISMO'); sel('quien', COORDINADORES[3].n);
Q.escribir($('#desde'), '2026-10-08'); Q.escribir($('#hasta'), '2026-10-14');
await generar(); await hasta(() => !$('#resultado').hidden, 8000);
const filasTorre = [...$$('#tipo-tabla tr')].map(tr => (tr.children[0] || {}).textContent || '').filter(t => /Toda la zona|T-01/.test(t));
ok('3 · El título dice «Todo el urbanismo» y la tabla tiene columna Torre con «Toda la zona» y «T-01», cada una con su informe',
   /Todo el urbanismo/.test($('#titulo').textContent) && $('#tipo-tabla tr th').textContent === 'Torre' && filasTorre.length === 2 && /SRV-QC-ZONA/.test(filasTorre[0]),
   $('#titulo').textContent + ' · ' + filasTorre.map(t => t.slice(0, 30)).join(' | '));
Q.escribir($('#t-hitos'), 'Servicios de todo el urbanismo: gas en 3 torres');
const antes = (await Q.envios()).length; await enviar(); await hasta(() => /archivado|actualizado|No se pudo/.test($('#estado-envio').textContent), 8000);
const env = await Q.envios(), ult = env[env.length - 1] || {};
ok('4 · Enviar lo archiva como SRV-EZ-URBANISMO-SEM-… con el texto, y el aviso dice «General › Servicios del sector»',
   env.length === antes + 1 && /URBANISMO/.test(ult.numero || '') && ((ult.datos || {}).textos || {}).hitos === 'Servicios de todo el urbanismo: gas en 3 torres' && /General › Servicios/.test($('#estado-envio').textContent),
   (ult.numero || '') + ' · ' + $('#estado-envio').textContent.slice(0, 90));
ok('5 · Nada por debajo de 44 px con todo el urbanismo en pantalla', Q.chicos().length === 0, Q.chicos().join(' '));
otraVez(); sel('torre', 'T-01'); await generar(); await hasta(() => !$('#resultado').hidden, 8000);
ok('6 · Una torre sola sigue como antes: sin columna Torre y con el título de la torre',
   $('#tipo-tabla tr th').textContent === 'Ente' && /T-01/.test($('#titulo').textContent) && !/Todo el urbanismo/.test($('#titulo').textContent), $('#titulo').textContent);
localStorage.clear();
