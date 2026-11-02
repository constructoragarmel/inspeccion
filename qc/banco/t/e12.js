// ESTRÉS 12 · pedido de Planificación del 2-nov-2026: la T-43 de Simón Rodríguez con diez apartamentos por piso (A01 a A10),
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
const opts = [...$('#apto-sel').options].map(o => o.value).filter(Boolean);
ok('E12-2 · En la T-43 el apartamento es un desplegable con A01 a A10, en orden', visible($('#apto-sel')) && !visible($('#apto')) && opts.join(',') === 'A01,A02,A03,A04,A05,A06,A07,A08,A09,A10', opts.join(','));
{ const ins = document.querySelector('.inspector-select'); Q.elegir(ins, [...ins.options].map(o => o.value).filter(Boolean)[0]); await esperar(300); }
sel('piso', [...$('#piso').options].map(o => o.value).find(v => /03/.test(v)) || 'Piso 03'); await esperar(100);
$('#apto-sel').value = 'A07'; $('#apto-sel').dispatchEvent(new Event('change', { bubbles: true })); await esperar(200);
const nro = ($('#nro-display') || {}).textContent || '';
ok('E12-3 · El número del informe lleva el apartamento con su cero: …-T43-P03AA07-…', /^PRUEBA-SR-T43-P03AA07-\d{6}-/.test(nro), nro);
sel('torre', 'T-04'); await esperar(300);
ok('E12-4 · La T-04 sigue con el campo libre (sus informes traen A12, J12)', visible($('#apto')) && !visible($('#apto-sel')));
sel('torre', 'T-43'); await esperar(300);
// Los rótulos, en el formulario
const texto = document.body.textContent, exactos = t => [...document.querySelectorAll('body *')].filter(e => !e.children.length && e.textContent.trim() === t).length;
ok('E12-5 · El formulario dice «Puntos de desagüe» y «Friso interno», y ya no los nombres de antes', /Puntos de desagüe/.test(texto) && /Friso interno/.test(texto) && !/Desagüe \(descargas\)/.test(texto) && !exactos('Frisos'), 'Frisos sueltos: ' + exactos('Frisos'));
// La planilla de la T-43
if (!document.querySelector('#estatus .ck-lbl.on')) [...document.querySelectorAll('#estatus .ck-lbl')].find(l => /progreso/.test(l.textContent)).click();
const E = () => _plEstado();
abrirPlanilla(); await hasta(() => E().P && E().P.origenPrev && !!$('#pl-cuerpo .pl-g, #pl-cuerpo .pl-o, #pl-cuerpo .pl-piso'), 15000); await esperar(200);
const P = E().P;
const p3 = P.aptos.filter(x => x.p === 3).map(x => x.a);
ok('E12-6 · La planilla de la T-43 arma diez apartamentos por piso, A01 a A10', P.porPiso === 10 && p3.join(',') === 'A01,A02,A03,A04,A05,A06,A07,A08,A09,A10' && P.aptos.some(x => x.k === 'P03AA07'), P.porPiso + ' · ' + p3.join(','));
_plIr({ vista: 'tel', piso: 3, hitoSel: 'hito_servicios' }); await esperar(150);
ok('E12-7 · En la planilla, el hito 3 dice «Puntos de desagüe»', /Puntos de desagüe/.test($('#planilla').innerText) && !/Desagüe \(descargas\)/.test($('#planilla').innerText));
_plIr({ vista: 'tel', piso: 3, hitoSel: 'hito_acabados' }); await esperar(150);
ok('E12-8 · …y el hito 4 dice «Friso interno»', /Friso interno/.test($('#planilla').innerText));
// Un apartamento con dato, revisar y guardar: el informe sale con su número y su código 3.02
_plIr({ vista: 'tel', piso: 3, hitoSel: 'hito_servicios' }); await esperar(100);
$('#planilla .pl-c[data-k="P03AA07"][data-c="3.02"]').click(); await esperar(60); $('#pl-sheet [data-r="50"]').click(); $('#pl-ksi').click(); await esperar(60);
$('#pl-rev').click(); await esperar(100); $('#pl-rgua').click(); await esperar(800);
const lista = JSON.parse(localStorage.getItem('garmel_reports_list') || '[]');
const inf = lista.find(b => /T43-P03AA07/.test(b.nro || ''));
ok('E12-9 · Revisar y guardar deja el informe PRUEBA-SR-T43-P03AA07-… con la 3.02 al 50 %', !!inf && /^PRUEBA-SR-T43-P03AA07-/.test(inf.nro), inf ? inf.nro : lista.map(b => b.nro).join(','));
const sale = document.documentElement.scrollWidth > innerWidth + 1 || $('#planilla').scrollWidth > innerWidth + 1;
_plIr({ vista: 'tel', piso: 3, hitoSel: 'hito_servicios' }); await esperar(100);
ok('E12-10 · Con diez apartamentos por piso nada se sale de lado a ' + innerWidth + ' px', !(document.documentElement.scrollWidth > innerWidth + 1 || $('#planilla').scrollWidth > innerWidth + 1));
cerrarPlanilla(); nuevoFormulario(); localStorage.setItem('garmel_reports_list', '[]');
Object.keys(localStorage).filter(k => /^garmel_planilla_/.test(k)).forEach(k => localStorage.removeItem(k));
