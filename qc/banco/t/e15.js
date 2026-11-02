// ESTRÉS 15 · la planilla en secuencia (Planificación, 2-nov-2026): el hito 3 por capítulos —Sanitarias, Eléctricas con voz y data,
// Gas—, cada uno con su instalación y después sus accesorios; y la 5.04 «Marcos metálicos de puertas». Solo pantalla: los
// informes salen con sus hitos de siempre. Se corre en inspeccion.html?prueba=1 a 375×812.
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem('garmel_reports_list', '[]');
const limpiar = () => Object.keys(localStorage).filter(k => /^garmel_planilla_/.test(k)).forEach(k => localStorage.removeItem(k));
limpiar();
await Q.relevo({ caido: false, fallar: [], lento: 0, colgar: 0, perder: false, borrar: true });
await Q.relevo({ sembrarAvance: { sector: 'EZ', torre: 'T-07', prueba: true, informes: {} } });
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const E = () => _plEstado();
nuevoFormulario(); await esperar(300); setAmbito('apartamento'); await esperar(200);
sel('fecha', new Date().toISOString().slice(0, 10)); sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-07'); await esperar(400);
{ const ins = document.querySelector('.inspector-select'); Q.elegir(ins, [...ins.options].map(o => o.value).filter(Boolean)[0]); await esperar(300); }
if (!document.querySelector('#estatus .ck-lbl.on')) [...document.querySelectorAll('#estatus .ck-lbl')].find(l => /progreso/.test(l.textContent)).click();
abrirPlanilla(); await hasta(() => E().P && !!$('#pl-cuerpo .pl-g, #pl-cuerpo .pl-piso'), 15000); await esperar(250);
_plIr({ vista: 'tel', piso: 2 }); await esperar(120);
const chips = [...document.querySelectorAll('#planilla .pl-chips button')].map(b => b.textContent.replace(/\d+$/, '').trim());
ok('E15-1 · Las pestañas van en la secuencia de obra: Cerramientos, Sanitarias, Eléctricas, Gas, Puertas, Ventanas, Acabados, Pruebas',
   chips.join('|') === 'H2 Cerramientos|Sanitarias|Eléctricas|Gas|H5 Puertas|H6 Ventanas|H4 Acabados|H11 Pruebas', chips.join(' | '));
ok('E15-2 · Abre en «Sanitarias»', E().hitoSel === 'cap_sanitarias' && $('#planilla .pl-chips [aria-pressed="true"]').dataset.h === 'cap_sanitarias');
const filas = () => [...document.querySelectorAll('#planilla .pl-g tbody tr')].map(tr => tr.classList.contains('pl-sep') ? '[' + tr.textContent.trim() + ']' : (tr.querySelector('.pl-ay span') || {}).textContent.split(' ')[0]);
const san = filas();
ok('E15-3 · Sanitarias: «Instalación» (3.01, 3.02, CP 3.20, TR 3.21) y después «Accesorios» (hito 7)',
   san.slice(0, 6).join(',') === '[Instalación],3.01,3.02,3.20,3.21,[Accesorios]' && san.slice(6).every(c => /^7\./.test(c)) && san.length > 7, san.join(','));
$('#planilla .pl-chips [data-h="cap_electricas"]').click(); await esperar(100);
const ele = filas();
ok('E15-4 · Eléctricas: instalación (3.04, 3.07, 3.08, 3.03) y sus accesorios del hito 8, voz y data incluida (8.04, 8.05)',
   ele.slice(0, 6).join(',') === '[Instalación],3.04,3.07,3.08,3.03,[Accesorios]' && ele.indexOf('8.05') > 0 && ele.indexOf('8.04') > 0 && ele.slice(6).every(c => /^8\./.test(c)), ele.join(','));
$('#planilla .pl-chips [data-h="cap_gas"]').click(); await esperar(100);
const gas = filas();
ok('E15-5 · Gas: 3.16 y 3.17, sin rótulos (no tiene accesorios)', gas.join(',') === '3.16,3.17', gas.join(','));
const todos = [].concat(...E().LISTA.map(h => h.subs.map(s => s.c))), hitos = [].concat(...E().HITOS.map(h => h.subs.map(s => s.c)));
ok('E15-6 · Ninguna subpartida de apartamento se pierde ni se repite entre pestañas', todos.length === hitos.length && hitos.every(c => todos.indexOf(c) >= 0), todos.length + ' / ' + hitos.length);
// Cargar en tres capítulos y guardar: los informes salen con sus hitos de siempre.
const tecla = async (k, c, r) => { $('#planilla .pl-c[data-k="' + k + '"][data-c="' + c + '"]').click(); await esperar(60); $('#pl-sheet [data-r="' + r + '"]').click(); $('#pl-ksi').click(); await esperar(60); };
await tecla('P02AA1', '3.16', 50);
$('#planilla .pl-chips [data-h="cap_electricas"]').click(); await esperar(80); await tecla('P02AA1', '3.07', 75); await tecla('P02AA1', '8.05', 100);
$('#planilla .pl-chips [data-h="cap_sanitarias"]').click(); await esperar(80); await tecla('P02AA1', '7.01', 25);
const cnt = [...document.querySelectorAll('#planilla .pl-chips button')].map(b => (b.querySelector('.pl-cnt') || {}).textContent || '0').join(',');
ok('E15-7 · Cada pestaña cuenta sus cambios: Sanitarias 1, Eléctricas 2, Gas 1', cnt === '0,1,2,1,0,0,0,0', cnt);
$('#pl-rev').click(); await esperar(100); $('#pl-rgua').click(); await esperar(900);
const inf = JSON.parse(localStorage.getItem('garmel_reports_list') || '[]').find(b => /EZ-T07-P02AA1-/.test(b.nro || ''));
const d = inf && (typeof loadDraftData === 'function' ? (loadDraftData(inf.id) || inf) : inf);
const pct = (hid, c) => { const h = (typeof PARTIDAS !== 'undefined' ? PARTIDAS : []).find(x => x.id === hid); const i = (CODIGOS_SUB[hid] || []).indexOf(c); return d && d.partidas && d.partidas[hid] && d.partidas[hid][i] ? String(d.partidas[hid][i].pct) : 'sin dato'; };
ok('E15-8 · El informe guarda cada % en su hito de siempre: 3.16 y 3.07 en el 3, 7.01 en el 7, 8.05 en el 8',
   pct('hito_servicios', '3.16') === '50' && pct('hito_servicios', '3.07') === '75' && pct('hito_acc_sanitarios', '7.01') === '25' && pct('hito_acc_electricos', '8.05') === '100',
   [pct('hito_servicios', '3.16'), pct('hito_servicios', '3.07'), pct('hito_acc_sanitarios', '7.01'), pct('hito_acc_electricos', '8.05')].join(' / '));
// Oficina e imprimir
_plIr({ vista: 'tabla' }); await esperar(120);
const cab = [...document.querySelectorAll('#planilla .pl-hb')].map(b => b.textContent.replace('▸', '').trim());
ok('E15-9 · En 💻 Oficina las columnas van igual y abre con «Sanitarias» desplegada', cab.slice(0, 4).join('|') === 'H2 Cerramientos|Sanitarias|Eléctricas|Gas' && $('#planilla .pl-hb[data-h="cap_sanitarias"]').getAttribute('aria-expanded') === 'true', cab.join(' | '));
_plIr({ vista: 'imp', tamano: 'comoda' }); await esperar(120);
const hj = $$('#planilla .pl-hoja thead th.hg').map(t => t.textContent).join(' | ');
ok('E15-10 · La hoja impresa rotula los capítulos por su nombre', /Instalaciones sanitarias/.test(hj) && /Instalaciones eléctricas, voz y data/.test(hj), hj.slice(0, 200));
_plIr({ vista: 'guia' }); await esperar(100);
ok('E15-11 · La guía dice «Marcos metálicos de puertas» en la 5.04, y no «de madera»', /5\.04\s*Marcos metálicos de puertas/.test($('#planilla').textContent) && !/Marcos de puertas de madera/.test($('#planilla').textContent));
ok('E15-12 · Nada se sale de lado a ' + innerWidth + ' px', !(document.documentElement.scrollWidth > innerWidth + 1 || $('#planilla').scrollWidth > innerWidth + 1));
cerrarPlanilla(); nuevoFormulario(); localStorage.setItem('garmel_reports_list', '[]'); limpiar();
