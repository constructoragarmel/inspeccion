// ESTRÉS 16 · el encabezado fijo al cargar (Planificación, 2-nov-2026). En 📱 Obra, al bajar por las filas de un capítulo largo,
// el piso, las pestañas y la fila de apartamentos siguen a la vista, y la barra de abajo no tapa la última fila.
// Se corre en inspeccion.html?prueba=1 en el teléfono (375×812) y apaisado (812×375).
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem('garmel_reports_list', '[]');
const limpiar = () => Object.keys(localStorage).filter(k => /^garmel_planilla_/.test(k)).forEach(k => localStorage.removeItem(k));
limpiar();
await Q.relevo({ caido: false, fallar: [], lento: 0, colgar: 0, perder: false, borrar: true });
await Q.relevo({ sembrarAvance: { sector: 'SR', torre: 'T-04', prueba: true, informes: { P12AJ12: { nro: 'PRUEBA-SR-T04-P12AJ12-261020-XX', fecha: '2026-10-20', piso: 'Piso 12', apto: 'J12', pcts: { '3.01': 50 } }, P12AA12: { nro: 'PRUEBA-SR-T04-P12AA12-261020-XX', fecha: '2026-10-20', piso: 'Piso 12', apto: 'A12', pcts: { '3.01': 50 } } } } });
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const E = () => _plEstado(), W = innerWidth, H = innerHeight, tam = W + '×' + H;
nuevoFormulario(); await esperar(300); setAmbito('apartamento'); await esperar(200);
sel('fecha', new Date().toISOString().slice(0, 10)); sel('convenio', 'Convenio Rusos'); sel('torre', 'T-04'); await esperar(400);
{ const ins = document.querySelector('.inspector-select'); Q.elegir(ins, [...ins.options].map(o => o.value).filter(Boolean)[0]); await esperar(300); }
if (!document.querySelector('#estatus .ck-lbl.on')) [...document.querySelectorAll('#estatus .ck-lbl')].find(l => /progreso/.test(l.textContent)).click();
abrirPlanilla(); await hasta(() => E().P && !!$('#pl-cuerpo .pl-g'), 15000); await esperar(250);
_plIr({ vista: 'tel', piso: 7, hitoSel: 'cap_electricas' }); await esperar(200);
// Apaisado: el piso y las pestañas se van al bajar; la caja de la tabla se ve entera al llevarla arriba.
{ // Si de entrada no cabe (apaisado, teléfono chico), se baja la planilla hasta que la caja quede bajo lo fijo de arriba.
  const pl = $('#planilla'), gw0 = $('#planilla .pl-gw'), br0 = $('#pl-barra').getBoundingClientRect();
  if (gw0.getBoundingClientRect().bottom > br0.top + 1) { const tp = $('#planilla .pl-top'), fijo = getComputedStyle(tp).position === 'sticky' ? tp.getBoundingClientRect().height : 0;
    pl.scrollTop += gw0.getBoundingClientRect().top - fijo; await esperar(120); } }
const gw = $('#planilla .pl-gw'), th = () => $('#planilla .pl-g thead th:nth-child(2)'), barra = $('#pl-barra').getBoundingClientRect();
ok('E16-1 ' + tam + ' · La caja de la tabla termina antes de la barra de abajo y tiene su propio desplazamiento', gw.getBoundingClientRect().bottom <= barra.top + 1 && gw.scrollHeight > gw.clientHeight,
   'caja ' + Math.round(gw.getBoundingClientRect().top) + '–' + Math.round(gw.getBoundingClientRect().bottom) + ' · barra ' + Math.round(barra.top) + ' · ' + gw.scrollHeight + '/' + gw.clientHeight);
gw.scrollTop = 99999; await esperar(120);
const ultima = [...gw.querySelectorAll('tbody tr')].pop().getBoundingClientRect(), cab = th().getBoundingClientRect();
ok('E16-2 ' + tam + ' · Abajo del todo, la fila de apartamentos sigue pegada arriba de la caja y dice A7', Math.abs(cab.top - gw.getBoundingClientRect().top) <= 2 && /A7/.test(th().textContent), Math.round(cab.top) + ' vs ' + Math.round(gw.getBoundingClientRect().top));
ok('E16-3 ' + tam + ' · …y la última fila se ve entera, sin quedar bajo la barra', ultima.bottom <= barra.top + 1 && ultima.top >= cab.bottom - 1, Math.round(ultima.top) + '–' + Math.round(ultima.bottom));
const chips = $('#planilla .pl-chips').getBoundingClientRect(), psel = $('#pl-psel').getBoundingClientRect();
ok('E16-4 ' + tam + ' · Las pestañas y el piso siguen a la vista (si cabe todo)', $('#planilla').scrollTop > 0 || (chips.top >= 0 && chips.bottom <= H && psel.top >= 0), Math.round(chips.top) + ' · ' + Math.round(psel.top));
// Tocar una casilla de abajo con la caja desplazada: abre el teclado de esa casilla y guarda.
const ult = [...gw.querySelectorAll('tbody tr')].pop().querySelector('.pl-c[data-k="P07AJ7"]');
ult.click(); await esperar(80); $('#pl-sheet [data-r="50"]').click(); $('#pl-ksi').click(); await esperar(80);
ok('E16-5 ' + tam + ' · Cargar la última casilla con la caja abajo funciona (P07 J7)', E().est.N.P07AJ7 && Object.values(E().est.N.P07AJ7)[0] === 50, JSON.stringify(E().est.N));
// Cambiar de piso y de pestaña recalcula la caja.
$('#pl-sig').click(); await esperar(150);
ok('E16-6 ' + tam + ' · Al pasar de piso la caja se rehace y la tabla vuelve arriba', $('#planilla .pl-gw').scrollTop === 0 && $('#planilla .pl-gw').style.maxHeight !== '' && +$('#pl-psel').value === 8);
ok('E16-7 ' + tam + ' · Nada se sale de lado', !(document.documentElement.scrollWidth > W + 1));
cerrarPlanilla(); nuevoFormulario(); localStorage.setItem('garmel_reports_list', '[]'); limpiar();
