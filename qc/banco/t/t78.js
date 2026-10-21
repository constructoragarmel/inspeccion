// TANDA 78 · V151 (13-oct-2026), reescrita en la V181 (21-oct-2026, ADR-0049): la página «Compilado de la semana» de OBRA, que
// desde la v181 va por contratista. El relevo falso contesta la semana de cada torre como el r72 (con su % de avance de la app; la
// T-02 sin presupuesto cargado) y archiva como _compGuardarContratista. En compilado.html?prueba=1, a 375×812.
localStorage.removeItem('garmel_clave_envio'); localStorage.removeItem('garmel_compilado_ultimo'); localStorage.removeItem('garmel_compilado_semana'); await Q.relevo({ borrar: true });
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); };
sel('tipo', 'obra'); sel('sector', '');
await generar(); ok('1 · Sin sector ni contratista avisa', /contratista/i.test($('#estado').textContent), $('#estado').textContent);
sel('sector', 'EZ');
const ops = [...$('#torre').options];
const RIO = (ops.find(o => /R[IÍ]O LIM[OÓ]N/i.test(o.value)) || {}).value;
ok('2 · Elegido el sector, se elige la CONTRATISTA y cada opción dice sus torres; nada de otro sector', $('#lbl-torre').textContent === 'Contratista' && /1 · Qué contratista/.test($('#h-pedido').textContent) &&
   !!RIO && /T-01, T-02, T-03, T-04/.test(ops.find(o => o.value === RIO).textContent) && !ops.some(o => /J-12/.test(o.textContent)), ops.length + ' opciones');
sel('torre', RIO); sel('quien', COORDINADORES[0].n); const QUIEN = COORDINADORES[0].n;
ok('2b · «Quién valida» ofrece solo a los coordinadores de área, y los nombra con su área', $('#quien').options.length === COORDINADORES.length + 1 && /Inspección de obra/.test($('#quien').options[1].textContent), $('#quien').options.length + ' opciones');
ok('3 · Por defecto «desde» es un jueves anterior a hoy y «hasta» es hoy', new Date($('#desde').value + 'T12:00:00').getDay() === 4 && $('#desde').value < $('#hasta').value, $('#desde').value + ' → ' + $('#hasta').value);
await generar(); ok('4 · Sin clave guardada manda a Inicio', /clave/i.test($('#estado').textContent) && !!$('#estado').querySelector('a'), $('#estado').textContent);
localStorage.setItem('garmel_clave_envio', 'mala'); await generar();
ok('5 · Con clave equivocada lo dice', /clave/i.test($('#estado').textContent) && $('#resultado').hidden, $('#estado').textContent);
localStorage.setItem('garmel_clave_envio', 'qc'); await generar(); await hasta(() => !$('#resultado').hidden, 8000);
const secs = $$('#torres-contratista .torre-c');
ok('6 · Arma el compilado de la contratista: título con sector y contratista, una sección por torre (3 a 6) y el membrete con los informes de cada una',
   !$('#resultado').hidden && /Ezequiel Zamora · .*R[IÍ]O LIM[OÓ]N/i.test($('#titulo').textContent) && secs.length === 4 && /^3 · T-01/.test(secs[0].querySelector('h2').textContent) && /^6 · T-04/.test(secs[3].querySelector('h2').textContent) &&
   /Torres: T-01, T-02, T-03, T-04/.test($('#membrete').textContent) && /T-01: 4 · T-02: 3/.test($('#membrete').textContent) && $('#membrete').textContent.indexOf(QUIEN) >= 0 && $('#bloque-aptos').hidden && $('#bloque-notas').hidden, $('#titulo').textContent + ' · ' + secs.length);
const s1 = secs[0], s2 = secs[1], s4 = secs[3];
ok('7 · Cada torre trae su matriz (3 aptos en 2 pisos, n/i, — y %, enlaces), sus áreas comunes y sus notas', s1.querySelectorAll('table.mz td.piso').length === 2 && s1.querySelectorAll('table.mz td.ni').length === 1 && /45%/.test(s1.querySelector('table.mz').textContent) &&
   s1.querySelectorAll('table.mz a.doc').length === 3 && /QC-TORRE-r2/.test(s1.textContent) && s1.querySelectorAll('.nota').length === 3 && /Vaciado de losa/.test(s1.textContent), s1.querySelectorAll('table.mz tr').length + ' filas');
ok('8 · La T-02, sin informe de torre, lo dice; y sin presupuesto, dice que la app no tiene un % y pide escribirlo', /No hubo informe de torre/.test(s2.textContent) && /La app no tiene un % de avance/.test(s2.textContent) && /No hay presupuesto cargado/.test(s2.textContent) && !s2.querySelector('.av-ver'));
ok('9 · El % de la app de cada torre, con lo medido, los pesos provisionales y el último informe; el cuadro validado lo ofrece como valor por defecto',
   /42 %/.test(s1.querySelector('.av-num').textContent) && /Medido el 31 % del presupuesto · pesos provisionales · último informe/.test(s1.textContent) && /52 %/.test(s4.querySelector('.av-num').textContent) &&
   s1.querySelector('.av-pct').placeholder === '42 (el de la app)' && s1.querySelector('.av-motivo-c').hidden);
const ver = s1.querySelector('.av-ver'); ver.click(); await esperar(100);
const des = s1.querySelector('.av-desglose');
ok('10 · «¿De dónde sale?» abre la cuenta: cada partida con su peso, su promedio y en cuántos lugares, la sin medir en gris; y se vuelve a cerrar',
   !des.hidden && ver.getAttribute('aria-expanded') === 'true' && /Frisos/.test(des.textContent) && /12.4 %/.test(des.textContent) && /60 %/.test(des.textContent) && /3 de 4/.test(des.textContent) && /sin medir/.test(des.textContent) && des.querySelectorAll('td.sinm').length >= 1 && /nadie ha medido no cuenta/.test(des.textContent) &&
   (ver.click(), des.hidden && ver.textContent === '¿De dónde sale?'));
Q.escribir(s1.querySelector('.av-pct'), '42'); await esperar(50);
const mismoSinMotivo = s1.querySelector('.av-motivo-c').hidden;
Q.escribir(s1.querySelector('.av-pct'), '55'); await esperar(50);
ok('11 · Poner el mismo % de la app no pide motivo; poner otro abre «¿Por qué es distinto del de la app?»', mismoSinMotivo && !s1.querySelector('.av-motivo-c').hidden && /distinto del de la app/.test(s1.querySelector('.av-motivo-c label').textContent));
await enviar(); ok('12 · Sin ningún texto escrito no manda', /al menos uno/.test($('#estado-envio').textContent) || /Falta por qué/.test($('#estado-envio').textContent), $('#estado-envio').textContent);
Q.escribir($('#t-hitos'), 'Avanza la albañilería en las cuatro torres'); Q.escribir($('#t-dificultades'), 'Dificultad de prueba');
await enviar(); ok('13 · Un % distinto sin motivo no se manda: dice de qué torre y cuál es el de la app, y lleva al cuadro', /Falta por qué el % de la T-01 es distinto del de la app \(42 %\)/.test($('#estado-envio').textContent) && document.activeElement === s1.querySelector('.av-motivo'), $('#estado-envio').textContent);
Q.escribir(s1.querySelector('.av-motivo'), 'La contratista entró con la estructura hecha');
Q.escribir(s2.querySelector('.av-pct'), '130'); await enviar();
ok('14 · Un % fuera de 0 a 100 no se manda', /El % de la T-02 tiene que ser un número entre 0 y 100/.test($('#estado-envio').textContent), $('#estado-envio').textContent);
Q.escribir(s2.querySelector('.av-pct'), '20'); await esperar(50);
ok('15 · En la torre sin % de la app, cualquier número pide de dónde sale', !s2.querySelector('.av-motivo-c').hidden && /¿Por qué es distinto\?/.test(s2.querySelector('.av-motivo-c label').textContent));
Q.escribir(s2.querySelector('.av-motivo'), 'Lo declaró la contratista y lo revisó la inspección');
Q.escribir(s4.querySelector('.av-nota'), 'Escaleras paradas por falta de pletina');
const kb = claveBorrador();
const bor = JSON.parse(localStorage.getItem(kb) || '{}');
ok('16 · Lo escrito queda como borrador en el equipo: los textos y, por torre, el %, el motivo y la nota', (bor.textos || {}).hitos === 'Avanza la albañilería en las cuatro torres' && ((bor.torres || {})['T-01'] || {}).pct === '55' && /estructura hecha/.test(((bor.torres || {})['T-01'] || {}).motivo) && /pletina/.test(((bor.torres || {})['T-04'] || {}).nota), kb + ' ' + JSON.stringify(bor).slice(0, 160));
const antes = (await Q.envios()).length; await enviar(); await hasta(() => /archivado|actualizado|No se pudo/.test($('#estado-envio').textContent), 8000);
const env = await Q.envios(), ult = env[env.length - 1] || {}, ts = (ult.datos || {}).torres || [];
ok('17 · Enviar archiva UNO por contratista, con los textos, quién valida y por torre el %, el motivo y la nota; lo confirma con el PDF',
   /archivado/.test($('#estado-envio').textContent) && /CON-EZ-/.test($('#estado-envio').textContent) && /General › Informe › Compilados semanales/.test($('#estado-envio').textContent) && /T-01, T-02, T-03, T-04/.test($('#estado-envio').textContent) && $$('#estado-envio a').length === 2 &&
   env.length === antes + 1 && ult.tipo === 'compilado-obra-contratista' && (ult.datos || {}).coordinadora === QUIEN && ts.length === 4 &&
   ts[0].pct === 55 && /estructura hecha/.test(ts[0].motivo) && ts[0].app === 42 && ts[1].pct === 20 && ts[2].pct === '' && ts[2].motivo === '' && /pletina/.test(ts[3].nota), $('#estado-envio').textContent.slice(0, 220));
ok('18 · Tras enviar, el borrador local se borra', !localStorage.getItem(kb));
await generar(); await hasta(() => !$('#aviso-archivado').hidden, 8000);
const n1 = $$('#torres-contratista .torre-c')[0];
ok('19 · Generarlo otra vez la misma semana carga lo archivado: textos, el 55 con su motivo y la nota de la T-04, y avisa que reemplaza',
   /ya tiene un compilado archivado de la contratista/.test($('#aviso-archivado').textContent) && $('#t-hitos').value === 'Avanza la albañilería en las cuatro torres' && n1.querySelector('.av-pct').value === '55' && !n1.querySelector('.av-motivo-c').hidden && /estructura hecha/.test(n1.querySelector('.av-motivo').value) &&
   /pletina/.test($$('#torres-contratista .torre-c')[3].querySelector('.av-nota').value), $('#aviso-archivado').textContent.slice(0, 120));
await enviar(); await hasta(() => /actualizado/.test($('#estado-envio').textContent), 8000);
ok('20 · Enviarlo otra vez la misma semana lo actualiza, no duplica', /actualizado/.test($('#estado-envio').textContent), $('#estado-envio').textContent.slice(0, 120));
ok('21 · «Otra contratista o semana» esconde el resultado', $('#btn-otra').textContent === '↩ Otra contratista o semana' && (otraVez(), $('#resultado').hidden));
sel('tipo', 'servicios'); sel('sector', 'EZ');
ok('22 · Servicios sigue por torre (o todo el urbanismo), no por contratista', $('#lbl-torre').textContent === 'Torre o todo el urbanismo' && [...$('#torre').options].some(o => o.value === 'T-01') && /1 · Qué torre/.test($('#h-pedido').textContent));
sel('tipo', 'obra'); sel('sector', 'EZ'); sel('torre', RIO); await generar(); await hasta(() => !$('#resultado').hidden, 8000);
ok('23 · La página no se sale de la pantalla y ningún control baja de 44 px', document.documentElement.scrollWidth <= innerWidth + 1 && Q.chicos().length === 0, document.documentElement.scrollWidth + ' · ' + Q.chicos().join(' '));
otraVez(); localStorage.removeItem('garmel_clave_envio'); localStorage.removeItem('garmel_compilado_ultimo');
