// ESTRÉS 26 · la planilla vuelve si el teléfono cierra la app (2-nov-2026, Christian: «lo llamaron y perdió lo que estaba haciendo»).
// Sin recargar la página: se deja la nota como la deja un cierre del sistema (la planilla abierta, sin «← Formulario»), se vacía el
// formulario como al arrancar, y se llama a lo mismo que corre al abrir la app. Se corre en inspeccion.html?prueba=1 a 375×812.
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem('garmel_reports_list', '[]');
localStorage.removeItem('garmel_actual'); localStorage.removeItem('garmel_planilla_abierta');
Object.keys(localStorage).filter(k => /^garmel_planilla_/.test(k)).forEach(k => localStorage.removeItem(k));
await Q.relevo({ caido: false, fallar: [], lento: 0, colgar: 0, perder: false, cortar: 0, borrar: true });
await Q.relevo({ sembrarAvance: { sector: 'EZ', torre: 'T-13', prueba: true, informes: {} } });
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const E = () => _plEstado(), N = (k, c) => E().est.N[k] && E().est.N[k][c];
const tap = el => { if (!el) throw new Error('no está'); el.click(); };
const dig = d => String(d).split('').forEach(x => tap($('#pl-sheet [data-d="' + x + '"]')));
nuevoFormulario(); await esperar(300); setAmbito('apartamento'); await esperar(200);
sel('fecha', new Date().toISOString().slice(0, 10)); sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-13'); await esperar(400);
const ins = document.querySelector('.inspector-select'); const quien = [...ins.options].map(o => o.value).filter(Boolean)[2]; Q.elegir(ins, quien); await esperar(300);
[...document.querySelectorAll('#estatus .ck-lbl')].find(l => /progreso/.test(l.textContent)).click();
abrirPlanilla(); await hasta(() => E().P && !!$('#pl-cuerpo .pl-g'), 15000); await esperar(250);
_plIr({ vista: 'tel', piso: 8, hitoSel: 'cap_gas' }); await esperar(100);
tap($('#planilla .pl-c[data-k="P08AB2"][data-c="3.16"]')); dig(50); tap($('#pl-kt')); tap($('#pl-ksi')); await esperar(100);
const nota = localStorage.getItem('garmel_planilla_abierta');
ok('K1 · Mientras se llena, queda anotado qué torre, con qué cabecera y dónde iba (piso 8, Gas)', !!nota && /"torre":"T-13"/.test(nota) && /"piso":8/.test(nota) && /cap_gas/.test(nota) && nota.indexOf(quien) > 0, (nota || '').slice(0, 160));
// El sistema cierra la app (llamada): la planilla queda abierta en la nota; al arrancar, el formulario está vacío.
cerrarPlanilla(); localStorage.setItem('garmel_planilla_abierta', nota); nuevoFormulario(); await esperar(300);
sel('convenio', ''); await esperar(200);
await _plRetomar(); await hasta(() => E().P && !!$('#pl-cuerpo .pl-g'), 15000); await esperar(400);
ok('K2 · Al volver se rehace la cabecera (convenio, torre, inspector, estatus) y se reabre la planilla', !!E().P && document.getElementById('torre').value === 'T-13' && document.querySelector('.inspector-select').value === quien && !!document.querySelector('#estatus .ck-lbl.on'), document.getElementById('torre').value + ' · ' + document.querySelector('.inspector-select').value);
ok('K3 · …en el mismo piso y pestaña, con las 4 casillas y el aviso de que se recuperó', E().piso === 8 && E().hitoSel === 'cap_gas' && ['A1', 'A2', 'B1', 'B2'].every(a => N('P08A' + a, '3.16') === 50) && /Se recuperó la planilla/.test(($('#pl-toast') || {}).textContent || ''), E().piso + ' · ' + E().hitoSel);
// Cerrar a propósito: la nota se va y no vuelve a abrirse sola, pero lo cargado sigue en el borrador.
cerrarPlanilla(); await esperar(200); nuevoFormulario(); await esperar(200); await _plRetomar(); await esperar(800);
ok('K4 · Cerrada a propósito: no se reabre sola, y lo cargado sigue guardado para la próxima vez', !E().P && !localStorage.getItem('garmel_planilla_abierta') && !!localStorage.getItem('garmel_planilla_EZ|T-13'));
// Guardado todo: aunque quede la nota, no hay nada que retomar.
sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-13'); await esperar(300); Q.elegir(document.querySelector('.inspector-select'), quien); await esperar(200);
if (!document.querySelector('#estatus .ck-lbl.on')) [...document.querySelectorAll('#estatus .ck-lbl')].find(l => /progreso/.test(l.textContent)).click();
abrirPlanilla(); await hasta(() => E().P && !!$('#pl-cuerpo .pl-g'), 15000); await esperar(300);
tap($('#pl-rev')); await esperar(120); if ($('#pl-rr')) tap($('#pl-rr')); tap($('#pl-rgua')); await esperar(800);
const nota5 = localStorage.getItem('garmel_planilla_abierta'); cerrarPlanilla(); localStorage.setItem('garmel_planilla_abierta', nota5 || nota); nuevoFormulario(); await esperar(200);
await _plRetomar(); await esperar(800);
ok('K5 · Con todo guardado no reabre nada y borra la nota', !E().P && !localStorage.getItem('garmel_planilla_abierta') && getSavedReports().filter(b => /T13-P08A/.test(b.nro || '')).length === 4);
localStorage.setItem('garmel_reports_list', '[]'); Object.keys(localStorage).filter(k => /^garmel_planilla_/.test(k)).forEach(k => localStorage.removeItem(k)); nuevoFormulario();
