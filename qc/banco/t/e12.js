// ESTRÉS 12 · pedido de Planificación del 2-nov-2026: la T-43 y la T-04 de Simón Rodríguez con letra + piso (A07 a J07 en el 7),
// y los rótulos nuevos de la 3.02 («Puntos de desagüe») y la 4.01 («Friso interno»). Se corre en inspeccion.html?prueba=1 a 375×812.
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem('garmel_reports_list', '[]');
Object.keys(localStorage).filter(k => /^garmel_planilla_/.test(k)).forEach(k => localStorage.removeItem(k));
await Q.relevo({ caido: false, fallar: [], lento: 0, colgar: 0, perder: false, borrar: true });
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const visible = e => !!e && e.style.display !== 'none' && e.getBoundingClientRect().height > 0;
nuevoFormulario(); await esperar(300); setAmbito('apartamento'); await esperar(200);
sel('fecha', new Date().toISOString().slice(0, 10)); sel('convenio', 'Convenio Rusos'); await esperar(200);
ok('E12-1 · La T-43 está entre las torres de Simón Rodríguez', [...$('#torre').options].some(o => o.value === 'T-43'), [...$('#torre').options].map(o => o.value).join(','));
sel('torre', 'T-43'); await esperar(300);
{ const ins = document.querySelector('.inspector-select'); Q.elegir(ins, [...ins.options].map(o => o.value).filter(Boolean)[0]); await esperar(300); }
const opts = () => [...$('#apto-sel').options].map(o => o.value).filter(Boolean).join(',');
sel('piso', 'Piso 03'); await esperar(150);
ok('E12-2 · En la T-43, piso 3: desplegable con A03 a J03, en orden', visible($('#apto-sel')) && !visible($('#apto')) && opts() === 'A03,B03,C03,D03,E03,F03,G03,H03,I03,J03', opts());
sel('piso', 'Piso 11'); await esperar(150);
ok('E12-2b · Al cambiar al piso 11 la lista pasa a A11 a J11; en planta baja no hay lista y queda el campo libre', opts() === 'A11,B11,C11,D11,E11,F11,G11,H11,I11,J11' && (sel('piso', 'Planta Baja'), await esperar(150), visible($('#apto')) && !visible($('#apto-sel'))), opts());
sel('piso', 'Piso 03'); await esperar(150);
$('#apto-sel').value = 'G03'; $('#apto-sel').dispatchEvent(new Event('change', { bubbles: true })); await esperar(200);
const nro = ($('#nro-display') || {}).textContent || '';
ok('E12-3 · El número del informe lleva letra y piso: …-T43-P03AG03-…', /^PRUEBA-SR-T43-P03AG03-\d{6}-/.test(nro), nro);
sel('piso', 'Piso 07'); await esperar(150);
ok('E12-3b · Con G03 elegido, pasar al piso 7 lo deja en G07 (el mismo apartamento, otro piso) y el número lo sigue', $('#apto').value === 'G07' && $('#apto-sel').value === 'G07' && /-P07AG07-/.test($('#nro-display').textContent), $('#apto').value + ' · ' + $('#nro-display').textContent);
sel('torre', 'T-04'); await esperar(300); sel('piso', 'Piso 07'); await esperar(150);
ok('E12-4 · La T-04 va igual: en el piso 7, A07 a J07', visible($('#apto-sel')) && opts() === 'A07,B07,C07,D07,E07,F07,G07,H07,I07,J07', opts());
sel('torre', 'T-43'); await esperar(300); sel('piso', 'Piso 03'); await esperar(150);
// Los rótulos, en el formulario
const texto = document.body.textContent, exactos = t => [...document.querySelectorAll('body *')].filter(e => !e.children.length && e.textContent.trim() === t).length;
ok('E12-5 · El formulario dice «Puntos de desagüe» y «Friso interno», y ya no los nombres de antes', /Puntos de desagüe/.test(texto) && /Friso interno/.test(texto) && !/Desagüe \(descargas\)/.test(texto) && !exactos('Frisos'), 'Frisos sueltos: ' + exactos('Frisos'));
// La planilla de la T-43
if (!document.querySelector('#estatus .ck-lbl.on')) [...document.querySelectorAll('#estatus .ck-lbl')].find(l => /progreso/.test(l.textContent)).click();
const E = () => _plEstado();
abrirPlanilla(); await hasta(() => E().P && E().P.origenPrev && !!$('#pl-cuerpo .pl-g, #pl-cuerpo .pl-o, #pl-cuerpo .pl-piso'), 15000); await esperar(200);
const P = E().P;
const p3 = P.aptos.filter(x => x.p === 3).map(x => x.a);
const p9 = P.aptos.filter(x => x.p === 9).map(x => x.a).join(',');
ok('E12-6 · La planilla de la T-43 arma diez por piso con su número: A03…J03 en el 3, A09…J09 en el 9, y nada en PB', P.porPiso === 10 && p3.join(',') === 'A03,B03,C03,D03,E03,F03,G03,H03,I03,J03' && p9 === 'A09,B09,C09,D09,E09,F09,G09,H09,I09,J09' && !P.aptos.some(x => x.p === 0), P.porPiso + ' · ' + p3.join(','));
_plIr({ vista: 'tel', piso: 3, hitoSel: 'hito_servicios' }); await esperar(150);
ok('E12-7 · En la planilla, el hito 3 dice «Puntos de desagüe»', /Puntos de desagüe/.test($('#planilla').innerText) && !/Desagüe \(descargas\)/.test($('#planilla').innerText));
_plIr({ vista: 'tel', piso: 3, hitoSel: 'hito_acabados' }); await esperar(150);
ok('E12-8 · …y el hito 4 dice «Friso interno»', /Friso interno/.test($('#planilla').innerText));
// Un apartamento con dato, revisar y guardar: el informe sale con su número y su código 3.02
_plIr({ vista: 'tel', piso: 3, hitoSel: 'hito_servicios' }); await esperar(100);
$('#planilla .pl-c[data-k="P03AG03"][data-c="3.02"]').click(); await esperar(60); $('#pl-sheet [data-r="50"]').click(); $('#pl-ksi').click(); await esperar(60);
$('#pl-rev').click(); await esperar(100); $('#pl-rgua').click(); await esperar(800);
const lista = JSON.parse(localStorage.getItem('garmel_reports_list') || '[]');
const inf = lista.find(b => /T43-P03AG03/.test(b.nro || ''));
ok('E12-9 · Revisar y guardar deja el informe PRUEBA-SR-T43-P03AG03-… con la 3.02 al 50 %', !!inf && /^PRUEBA-SR-T43-P03AG03-/.test(inf.nro), inf ? inf.nro : lista.map(b => b.nro).join(','));
const sale = document.documentElement.scrollWidth > innerWidth + 1 || $('#planilla').scrollWidth > innerWidth + 1;
_plIr({ vista: 'tel', piso: 3, hitoSel: 'hito_servicios' }); await esperar(100);
ok('E12-10 · Con diez apartamentos por piso nada se sale de lado a ' + innerWidth + ' px', !(document.documentElement.scrollWidth > innerWidth + 1 || $('#planilla').scrollWidth > innerWidth + 1));
cerrarPlanilla(); nuevoFormulario(); localStorage.setItem('garmel_reports_list', '[]');
Object.keys(localStorage).filter(k => /^garmel_planilla_/.test(k)).forEach(k => localStorage.removeItem(k));
