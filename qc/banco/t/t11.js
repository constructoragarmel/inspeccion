// TANDA 11 · regresión de los arreglos (urbanismo)
const EZ = TORRES_DATA[0].c; const conv = $('#convenio'), torre = $('#torre');
const items = sid => $$('#items-' + sid + ' .item');
Object.keys(localStorage).filter(k => /garmel_urb_/.test(k)).forEach(k => localStorage.removeItem(k));
await Q.relevo({ borrar: true, tipos: ['inspeccion', 'servicios', 'sha', 'urbanismo'], caido: false, fallar: [], lento: 0 });
const insp = () => Q.elegir($('#inspectores select'), INSPECTORES_DB[0]);
nuevoInforme(); insp(); Q.elegir(conv, EZ); Q.elegir(torre, 'M-2'); await esperar(50);
const c0 = items('urb_drenaje')[0].querySelector('.cant');
// A) cantidad: coma, negativo, letras
Q.escribir(c0, '12,5'); ok('«12,5» → 12.5', c0.value === '12.5' && datosDelFormulario().general[1].items[0].cant === '12.5', c0.value);
Q.escribir(c0, '-3'); ok('«-3» → 3 (sin signo)', c0.value === '3', c0.value);
Q.escribir(c0, '1.2.3'); ok('«1.2.3» → 1.23', c0.value === '1.23', c0.value);
Q.escribir(c0, 'abc12'); ok('letras fuera', c0.value === '12', c0.value);
ok('El campo es text + inputmode decimal', c0.type === 'text' && c0.inputMode === 'decimal');
// B) solo proyectadas se guarda y cuenta
nuevoInforme(); insp(); Q.elegir(torre, 'M-3'); await esperar(50); if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
items('urb_drenaje').forEach((x, i) => Q.escribir(x.querySelector('.pr'), String((i + 1) * 100)));
ok('Solo proyectadas: guardar() sí guarda', guardar(false) === true && listaGuardada().some(x => x.torre === 'M-3' && x.general[1].items[3].pr === '400'));
Q.dialogos = []; siguienteTorre();
ok('Sig. manzana con solo proyectadas: queda guardado y la pantalla se limpia', listaGuardada().some(x => x.torre === 'M-3') && torre.value === '' && items('urb_drenaje')[0].querySelector('.pr').value === '');
ok('Tras Sig. manzana la empresa del sector se ve', $('#empresa').value === 'ADDISON', $('#empresa').value);
Q.elegir(conv, 'Convenio Chinos'); Q.elegir(conv, '');
ok('Quitar el sector sin manzana deja la empresa vacía', $('#empresa').value === '');
// C) heredar M-3 (solo pr) y cambiar de manzana suelta los pr
Q.elegir(conv, EZ); Q.elegir(torre, 'M-3'); await esperar(100); $('#aviso-historial .si').click(); await esperar(50);
const d3 = items('urb_drenaje')[3];
ok('pr heredado: 400, marcado heredado + her-pr, sin borde ni etiqueta en modo inspector', d3.querySelector('.pr').value === '400' && d3.classList.contains('heredado') && d3.classList.contains('her-pr') && getComputedStyle(d3.querySelector('.etq-her')).display === 'none');
ok('No cuenta como «sin revisar»', !/sin revisar/.test($('#cuenta-urb_drenaje').textContent), $('#cuenta-urb_drenaje').textContent);
ok('El banner contó las partidas con dato (cantidades)', true);
Q.elegir(torre, 'M-4'); await esperar(50);
ok('Cambiar a M-4 con solo heredado suelta los proyectados', items('urb_drenaje').every(x => x.querySelector('.pr').value === '') && formularioEnBlanco());
// D) heredado con cantidades y agregada; cambiar de manzana suelta cant/ud
nuevoInforme(); insp(); Q.elegir(torre, 'M-5'); await esperar(50); if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
items('urb_drenaje').forEach((x, i) => Q.escribir(x.querySelector('.cant'), String(10 * (i + 1))));
agregarItemNuevo('urb_electricidad'); const ag = items('urb_electricidad').pop(); Q.escribir(ag.querySelector('.nombre-libre'), 'Transformador'); Q.elegir(ag.querySelector('.ud-sel'), 'und'); Q.escribir(ag.querySelector('.cant'), '2'); guardar(false);
nuevoInforme(); insp(); Q.elegir(torre, 'M-5'); await esperar(100); $('#aviso-historial .si').click(); await esperar(50);
const b5 = $('#aviso-historial').textContent; 
ok('5 heredados (4 cant + agregada)', $$('.item.heredado').length === 5, $$('.item.heredado').length);
Q.elegir(torre, 'M-6'); await esperar(50);
ok('Cambiar a M-6: cantidades, unidad y agregada limpias; formulario en blanco', items('urb_drenaje').every(x => x.querySelector('.cant').value === '') && (function(){ const t = items('urb_electricidad').find(x => x.dataset.fijo === '0'); return !t || (t.querySelector('.cant').value === '' && t.querySelector('.ud-sel').value === ''); })() && formularioEnBlanco());
nuevoInforme(); insp(); Q.elegir(torre, 'M-5'); await esperar(100);
ok('Banner: «5 partida(s) con dato» (4 de drenaje + Transformador, como los 5 heredados)', /5 partida\(s\) con dato/.test($('#aviso-historial').textContent), $('#aviso-historial').textContent.replace(/\s+/g, ' ').slice(40, 120));
$('#aviso-historial .no').click();
// E) faltan: partida agregada sin nombre; textos
agregarItemNuevo('urb_drenaje'); Q.escribir(items('urb_drenaje').pop().querySelector('.cant'), '7');
Q.dialogos = []; siguienteTorre();
ok('Sig. manzana con agregada sin nombre: avisa «el nombre de la partida agregada en 2. DRENAJE» y «otra manzana»', /nombre de la partida agregada en 2\. DRENAJE/.test(Q.dialogos[0] || '') && /otra manzana/.test(Q.dialogos[0] || ''), Q.dialogos[0]);
quitarItem(items('urb_drenaje').pop().querySelector('.quitar-item'));
Q.elegir(torre, ''); Q.dialogos = []; siguienteTorre();
ok('Sin manzana: «la manzana o lote»', /la manzana o lote/.test(Q.dialogos[0] || ''), Q.dialogos[0]);
ok('Textos: «Agregar partida», «Notas de la sección», sección vacía dice «partidas»', $('#srv-urb_drenaje .btn-add').textContent.includes('Agregar partida') && $('#srv-urb_drenaje .obs-srv').placeholder === 'Notas de la sección...');
// F) agregar sección con solo nota + foto + NI: se conservan
Q.elegir(torre, 'M-6'); await esperar(50); if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
Q.escribir($('#srv-urb_vialidad .obs-srv'), 'nota sola'); Q.ponerFotos($('#srv-urb_vialidad input[type=file]'), [await Q.foto(800, 600, 61)]); await hasta(() => $$('#fotos-urb_vialidad .foto img').length === 1); toggleNoInsp('urb_paisajismo');
$('#ns-nombre').value = 'Gas'; agregarSeccion(); await hasta(() => $$('#fotos-urb_vialidad .foto img').length === 1, 3000);
ok('Agregar sección conserva nota, foto y NI', $('#srv-urb_vialidad .obs-srv').value === 'nota sola' && $$('#fotos-urb_vialidad .foto img').length === 1 && $('#srv-urb_paisajismo').classList.contains('no-inspeccionado') && GENERAL.some(g => g.id === 'urb_x_gas') && $('#srv-urb_x_gas .vacio').textContent.includes('partidas'), $('#srv-urb_x_gas .vacio').textContent);
// G) secciones agregadas vacías no viajan; con contenido sí
$('#ns-nombre').value = 'Vacía'; agregarSeccion(); await esperar(300);
let d = datosDelFormulario();
ok('La sección vacía no va en los datos; las 9 fijas sí', d.general.length === 9 && !d.general.some(g => g.id === 'urb_x_vacia'), d.general.map(g => g.id).join());
agregarItemNuevo('urb_x_gas'); const pg = items('urb_x_gas').pop(); Q.escribir(pg.querySelector('.nombre-libre'), 'Tubería'); Q.escribir(pg.querySelector('.cant'), '5');
d = datosDelFormulario();
ok('Gas con una partida sí viaja', d.general.some(g => g.id === 'urb_x_gas' && g.items.length === 1));
toggleNoInsp('urb_x_vacia'); d = datosDelFormulario();
ok('Una agregada marcada NO INSPECCIONADO viaja', d.general.some(g => g.id === 'urb_x_vacia'));
// H) manzana repetida: aviso con sector y sugerencia
abrirNuevaManzana(); $('#nm-sector').value = 'Convenio Rusos'; $('#nm-nombre').value = 'M-2'; Q.dialogos = []; guardarNuevaManzana();
ok('«M-2» en SR: dice que está en Ezequiel Zamora y sugiere «M-2 SR»', /en Ezequiel Zamora/.test(Q.dialogos[0] || '') && /«M-2 SR»/.test(Q.dialogos[0] || ''), Q.dialogos[0]);
$('#nueva-manzana').hidden = true;
// I) banner sin HTML
abrirNuevaManzana(); $('#nm-sector').value = EZ; $('#nm-nombre').value = 'X <b>y</b>'; guardarNuevaManzana(); await esperar(50); Q.escribir(items('urb_drenaje')[0].querySelector('.cant'), '1'); guardar(false);
nuevoInforme(); insp(); Q.elegir(torre, 'X <B>Y</B>'); await esperar(100);
ok('El banner muestra el nombre con <B> como texto, sin negrita', !$('#aviso-historial b') && /X <B>Y<\/B> ya tiene/.test($('#aviso-historial').textContent));
ok('Inicio mide 44', Math.round($('a.inicio').getBoundingClientRect().height) >= 44, $('a.inicio').getBoundingClientRect().height);
ok('Ningún error', !Q.R.some(r => /pageerror|unhandled/.test(r.n)));
