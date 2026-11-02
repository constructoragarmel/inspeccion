// ESTRÉS 13 · lo que vio la inspección de Ezequiel Zamora el 2-nov-2026 (por Planificación): en la planilla, desde el teléfono, no
// llegaban a los pisos sin ningún informe. Ahora en EZ salen del piso 1 al 16 con A1, A2, B1 y B2 aunque el historial llegue al 3.
// Se corre en inspeccion.html?prueba=1 a 375×812.
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem('garmel_reports_list', '[]');
Object.keys(localStorage).filter(k => /^garmel_planilla_/.test(k)).forEach(k => localStorage.removeItem(k));
await Q.relevo({ caido: false, fallar: [], lento: 0, colgar: 0, perder: false, borrar: true });
const s = {}; for (let p = 1; p <= 3; p++) ['A1', 'A2'].forEach(a => { const k = 'P' + String(p).padStart(2, '0') + 'A' + a; s[k] = { nro: 'PRUEBA-EZ-T07-' + k + '-261020-XX', fecha: '2026-10-20', piso: 'Piso ' + String(p).padStart(2, '0'), apto: a, pcts: { '2.02': 100, '3.01': 50 } }; });
await Q.relevo({ sembrarAvance: { sector: 'EZ', torre: 'T-07', prueba: true, informes: s } });
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
nuevoFormulario(); await esperar(300); setAmbito('apartamento'); await esperar(200);
sel('fecha', new Date().toISOString().slice(0, 10)); sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-07'); await esperar(400);
{ const ins = document.querySelector('.inspector-select'); Q.elegir(ins, [...ins.options].map(o => o.value).filter(Boolean)[0]); await esperar(300); }
if (!document.querySelector('#estatus .ck-lbl.on')) [...document.querySelectorAll('#estatus .ck-lbl')].find(l => /progreso/.test(l.textContent)).click();
const E = () => _plEstado();
abrirPlanilla(); await hasta(() => E().P && /archivo|teléfono|guardado/.test(E().P.origenPrev) && !!$('#pl-cuerpo .pl-g, #pl-cuerpo .pl-piso'), 15000); await esperar(200);
const P = E().P;
ok('E13-1 · Con informes solo hasta el piso 3, la planilla de EZ trae del piso 1 al 16', P.pisoMin === 1 && P.pisos === 16 && P.aptos.length === 64, P.pisoMin + '–' + P.pisos + ' · ' + P.aptos.length + ' apartamentos · ' + P.origenPrev);
_plIr({ vista: 'tel', piso: 1, hitoSel: 'hito_servicios' }); await esperar(120);
const opciones = [...$('#pl-psel').options].map(o => +o.value);
ok('E13-2 · En 📱 Obra el selector de piso llega al 16', opciones[0] === 1 && opciones[opciones.length - 1] === 16 && opciones.length === 16, opciones.join(','));
$('#pl-psel').value = '10'; $('#pl-psel').dispatchEvent(new Event('change')); await esperar(120);
const cab = [...document.querySelectorAll('#planilla .pl-g thead th')].map(t => t.textContent);
ok('E13-3 · El piso 10, sin ningún informe, muestra A1, A2, B1 y B2 con sus casillas', /10/.test(cab[0]) && ['A1', 'A2', 'B1', 'B2'].every(a => cab.some(t => t.indexOf(a) === 0)) && !!$('#planilla .pl-c[data-k="P10AB2"][data-c="3.01"]'), cab.join(' | '));
$('#planilla .pl-c[data-k="P10AB2"][data-c="3.01"]').click(); await esperar(80); $('#pl-sheet [data-r="25"]').click(); $('#pl-ksi').click(); await esperar(80);
for (let i = 0; i < 15 && +$('#pl-psel').value < 16; i++) { $('#pl-sig').click(); await esperar(40); }
ok('E13-4 · «Siguiente» llega al piso 16 y ahí se detiene', +$('#pl-psel').value === 16 && (($('#pl-sig').click(), await esperar(40)), +$('#pl-psel').value === 16));
$('#planilla .pl-c[data-k="P16AA1"][data-c="3.01"]').click(); await esperar(80); $('#pl-sheet [data-r="50"]').click(); $('#pl-ksi').click(); await esperar(80);
$('#pl-rev').click(); await esperar(100); $('#pl-rgua').click(); await esperar(900);
const lista = JSON.parse(localStorage.getItem('garmel_reports_list') || '[]').map(b => b.nro);
ok('E13-5 · Revisar y guardar deja los dos informes nuevos: P10AB2 y P16AA1', lista.some(n => /EZ-T07-P10AB2-/.test(n)) && lista.some(n => /EZ-T07-P16AA1-/.test(n)) && lista.length === 2, lista.join(', '));
ok('E13-6 · Nada se sale de lado a ' + innerWidth + ' px', !(document.documentElement.scrollWidth > innerWidth + 1 || $('#planilla').scrollWidth > innerWidth + 1));
cerrarPlanilla(); nuevoFormulario(); localStorage.setItem('garmel_reports_list', '[]');
Object.keys(localStorage).filter(k => /^garmel_planilla_/.test(k)).forEach(k => localStorage.removeItem(k));
// Simón Bolívar no cambia: la J-09 sigue con sus pisos según el historial.
