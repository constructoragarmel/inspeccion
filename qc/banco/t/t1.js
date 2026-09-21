// TANDA 1 · Urbanismo: cabecera, sector primero, manzanas, agregar manzana, número
const conv = $('#convenio'), torre = $('#torre'); const EZ = TORRES_DATA[0].c;
const ops = sel => [...sel.options].map(o => o.value + '|' + o.textContent);
const hoy = $('#fecha').value; const fec = hoy.slice(2).replace(/-/g, '');

// 1. estado inicial
ok('Sector: 3 opciones con nombre de sector, primero «Seleccione sector»', ops(conv).length === 4 && /Ezequiel Zamora/.test(ops(conv)[1]) && /Simón Rodríguez/.test(ops(conv)[2]) && /Simón Bolívar/.test(ops(conv)[3]) && /Seleccione sector/.test(ops(conv)[0]), ops(conv).join(' ; '));
ok('Sin sector: 9 manzanas, cada una con su sector al lado', ops(torre).length === 10 && ops(torre).slice(1).every(o => / · Ezequiel Zamora$/.test(o)), ops(torre).slice(0, 3).join(' ; '));
ok('El sector va ANTES que la manzana en la pantalla', conv.getBoundingClientRect().top < torre.getBoundingClientRect().top);
ok('Inspectores: Gabriel, Mariana y Alejandro primero', INSPECTORES_DB.slice(0, 3).map(x => x.split(' ')[0]).join() === 'Gabriel,Mariana,Alejandro', INSPECTORES_DB.slice(0, 4).join(' | '));
ok('Número inicial PRUEBA-URB-XX----fecha---', $('#nro').textContent === 'PRUEBA-URB-XX-----' + fec + '---', $('#nro').textContent);

// 2. elegir sector filtra
Q.elegir(conv, EZ);
ok('EZ: 9 manzanas sin rótulo de sector; empresa ADDISON', ops(torre).length === 10 && ops(torre).slice(1).every(o => !/ · /.test(o)) && $('#empresa').value === 'ADDISON', ops(torre)[1] + ' · ' + $('#empresa').value);
Q.elegir(conv, 'Convenio Rusos');
ok('SR: sin manzanas, la lista lo dice; empresa PROCODIMA', ops(torre).length === 1 && /Sin manzanas cargadas/.test(ops(torre)[0]) && /PROCODIMA/.test($('#empresa').value), ops(torre)[0] + ' · ' + $('#empresa').value);
Q.elegir(conv, 'Convenio Chinos');
ok('SB: sin manzanas; empresa RACAR', ops(torre).length === 1 && /RACAR/.test($('#empresa').value), $('#empresa').value);
Q.elegir(conv, '');
ok('Sin sector otra vez: vuelven las 9 con rótulo', ops(torre).length === 10);
ok('(HALLAZGO) quitar el sector sin manzana elegida deja la empresa del sector anterior', $('#empresa').value === '', $('#empresa').value);

// 3. manzana sin sector → el sector se marca solo
Q.elegir(torre, 'M-1 L2');
ok('Elegir M-1 L2 sin sector marca Ezequiel Zamora y ADDISON', conv.value === EZ && $('#empresa').value === 'ADDISON', conv.value + ' · ' + $('#empresa').value);
ok('(UX) tras marcarse solo el sector, la lista sigue mostrando todas con rótulo (no se refiltra)', ops(torre).length === 10, ops(torre)[1]);
Q.elegir($('#inspectores select'), INSPECTORES_DB[0]);
ok('Número PRUEBA-URB-EZ-M1L2-fecha-GB', $('#nro').textContent === 'PRUEBA-URB-EZ-M1L2-' + fec + '-GB', $('#nro').textContent);

// 4. cambiar de sector suelta la manzana; quitar el sector también
Q.elegir(conv, 'Convenio Rusos');
ok('Cambiar a SR suelta M-1 L2, empresa PROCODIMA, número URB-SR----', torre.value === '' && /PROCODIMA/.test($('#empresa').value) && $('#nro').textContent === 'PRUEBA-URB-SR-----' + fec + '-GB', torre.value + ' · ' + $('#nro').textContent);
Q.elegir(conv, EZ); Q.elegir(torre, 'M-2'); Q.elegir(conv, '');
ok('Quitar el sector suelta M-2 y la empresa', torre.value === '' && $('#empresa').value === '' && conv.value === '', torre.value + '|' + $('#empresa').value);

// 5. agregar manzana
Q.elegir(conv, 'Convenio Chinos');
abrirNuevaManzana();
ok('La caja abre con el sector actual (SB) puesto y el foco en el nombre', !$('#nueva-manzana').hidden && $('#nm-sector').value === 'Convenio Chinos' && document.activeElement === $('#nm-nombre'), $('#nm-sector').value);
Q.dialogos = []; $('#nm-nombre').value = '   '; guardarNuevaManzana();
ok('Nombre vacío: avisa y no agrega', Q.dialogos.length === 1 && /nombre/.test(Q.dialogos[0]) && TORRES_DATA.length === 9, Q.dialogos[0]);
$('#nm-nombre').value = '  m-2   l3 '; guardarNuevaManzana();
ok('«  m-2   l3 » entra como «M-2 L3» en SB, elegida, con RACAR, caja cerrada', torre.value === 'M-2 L3' && conv.value === 'Convenio Chinos' && /RACAR/.test($('#empresa').value) && $('#nueva-manzana').hidden && $('#nm-nombre').value === '', torre.value + ' · ' + $('#empresa').value);
ok('Número con la manzana nueva: URB-SB-M2L3', /^PRUEBA-URB-SB-M2L3-/.test($('#nro').textContent), $('#nro').textContent);
ok('Queda en el teléfono (garmel_urb_manzanas)', JSON.stringify(manzanasRecordadas()) === JSON.stringify([{ t: 'M-2 L3', c: 'Convenio Chinos', e: 'RACAR INGENIEROS, C.A.', r: '' }]), localStorage.getItem('garmel_urb_manzanas'));
Q.dialogos = []; abrirNuevaManzana(); $('#nm-nombre').value = 'M-2 L3'; guardarNuevaManzana();
ok('Repetida: avisa «ya está en la lista»', /ya está en la lista/.test(Q.dialogos[0] || '') && TORRES_DATA.length === 10, Q.dialogos[0]);
Q.dialogos = []; $('#nm-sector').value = 'Convenio Rusos'; $('#nm-nombre').value = 'M-2'; guardarNuevaManzana();
ok('(LÍMITE) «M-2» en Simón Rodríguez se rechaza porque M-2 existe en Ezequiel Zamora: el nombre es único en todo el sitio', /ya está en la lista/.test(Q.dialogos[0] || ''), Q.dialogos[0]);
$('#nueva-manzana').hidden = true;
// nombres raros
abrirNuevaManzana(); $('#nm-sector').value = 'Convenio Rusos'; $('#nm-nombre').value = 'Ñandú/2 "b" <b>x</b>'; guardarNuevaManzana();
ok('Nombre raro en SR: mayúsculas tal cual, sector SR, PROCODIMA', torre.value === 'ÑANDÚ/2 "B" <B>X</B>' && conv.value === 'Convenio Rusos' && /PROCODIMA/.test($('#empresa').value), torre.value);
ok('Número limpia acentos y símbolos: URB-SR-NANDU2BBXB', /^PRUEBA-URB-SR-NANDU2BBXB-/.test($('#nro').textContent), $('#nro').textContent);
ok('La opción muestra el texto sin interpretar HTML', !torre.querySelector('option b') && [...torre.options].some(o => o.textContent === 'ÑANDÚ/2 "B" <B>X</B>'));

// 6. filtro con manzanas agregadas, sin sector con rótulo
Q.elegir(conv, '');
const todas = ops(torre);
ok('Sin sector: 11 manzanas, las nuevas con su sector', todas.length === 12 && todas.some(o => /M-2 L3 · Simón Bolívar/.test(o)) && todas.some(o => /ÑANDÚ.* · Simón Rodríguez/.test(o)), todas.slice(-2).join(' ; '));
Q.elegir(conv, 'Convenio Chinos');
ok('SB: solo M-2 L3', ops(torre).length === 2 && ops(torre)[1] === 'M-2 L3|M-2 L3', ops(torre).join(';'));
Q.elegir(conv, 'Convenio Rusos');
ok('SR: solo ÑANDÚ', ops(torre).length === 2 && /ÑANDÚ/.test(ops(torre)[1]), ops(torre).join(';'));

// 7. Sig. manzana: qué falta y qué se conserva
Q.elegir(torre, 'ÑANDÚ/2 "B" <B>X</B>');
Q.dialogos = []; siguienteTorre();
ok('Sig. manzana con el informe en blanco: se guarda? no hay nada; alerta o no', true, Q.dialogos.join(' | ').slice(0, 120));
Q.elegir(torre, ''); Q.dialogos = []; siguienteTorre();
ok('Sin manzana: el aviso de «falta» habla de MANZANA y SECTOR, no de torre/convenio', /manzana/i.test(Q.dialogos[0] || '') && !/torre/i.test(Q.dialogos[0] || ''), Q.dialogos[0]);
Q.elegir(torre, 'ÑANDÚ/2 "B" <B>X</B>');
Q.escribir($('#residente'), 'ING. RESIDENTE SR');
const it0 = $('#items-urb_drenaje .item'); Q.escribir(it0.querySelector('.cant'), '12.5');
Q.dialogos = []; siguienteTorre();
ok('Sig. manzana: guarda 1 informe, conserva sector SR, inspector GB y fecha; suelta manzana, residente y empresa? (empresa por sector)', listaGuardada().length === 1 && conv.value === 'Convenio Rusos' && inspectoresElegidos()[0] === INSPECTORES_DB[0] && $('#fecha').value === hoy && torre.value === '', JSON.stringify({ l: listaGuardada().length, c: conv.value, e: $('#empresa').value, r: $('#residente').value }));
ok('(UX) tras Sig. manzana la empresa del sector queda visible', /PROCODIMA/.test($('#empresa').value), $('#empresa').value);
ok('El informe guardado lleva manzana, sector, empresa, residente y la cantidad', (function(){ const d = listaGuardada()[0]; return d.torre === 'ÑANDÚ/2 "B" <B>X</B>' && d.convenio === 'Convenio Rusos' && /PROCODIMA/.test(d.empresa) && d.residente === 'ING. RESIDENTE SR' && d.general[0].items[0].cant === '12.5' && d.general[0].items[0].ud === 'm'; })(), JSON.stringify(listaGuardada()[0]).slice(0, 200));

// 8. residente «se recuerda por manzana»: volver a elegirla
Q.elegir(torre, 'ÑANDÚ/2 "B" <B>X</B>'); await esperar(300);
const banner = $('#aviso-historial').textContent.replace(/\s+/g, ' ');
ok('Al volver a la manzana ofrece la visita anterior', /ya tiene un informe anterior/.test(banner), banner.slice(0, 100));
ok('(UX) el residente NO vuelve solo al elegir la manzana: solo con «Sí, traer lo anterior»', $('#residente').value === '', $('#residente').value);
ok('(UX) el banner cuenta «0 ítem(s) contestado(s)» aunque haya una cantidad escrita: cuenta solo calidades', /0 ítem\(s\)/.test(banner), banner.match(/\d+ ítem\(s\)[^.]*/) && banner.match(/\d+ ítem\(s\)[^.]*/)[0]);
ok('El banner no inyecta HTML con el nombre raro de la manzana', !$('#aviso-historial b'));
$('#aviso-historial .si').click(); await esperar(100);
ok('Con «Sí»: residente vuelve, la cantidad 12.5 vuelve en amarillo (heredada)', $('#residente').value === 'ING. RESIDENTE SR' && it0.querySelector('.cant').value === '12.5' && it0.classList.contains('heredado'), $('#residente').value + ' · ' + it0.querySelector('.cant').value);

// 9. Nuevo conserva sector
nuevoInforme();
ok('«Nuevo» deja manzana vacía y conserva el sector', torre.value === '' && conv.value === 'Convenio Rusos');
