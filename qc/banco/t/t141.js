// TANDA 141 · v210 (19-nov-2026): una torre que el relevo da por buena pero llega sin notas ni apartamentos. La noche del 18-nov
// el compilado de Drijecae (Ezequiel Zamora, 12 al 18-nov) se cayó entero con «can't access property "filter", d.notas is
// undefined»; al día siguiente la misma semana llegó completa. En compilado.html?prueba=1, a 375×812, con el relevo falso.
// 1 la torre incompleta sale como «No se pudo leer» con «Reintentar» y las demás se ven · 2 la consola dice qué faltó ·
// 3 no deja enviar con ella sin leer · 4 «Reintentar» la trae · 5 en servicios, una semana incompleta da un aviso y no revienta.
localStorage.clear(); localStorage.setItem('garmel_clave_envio', 'qc');
await Q.relevo({ borrar: true, caido: false, lento: 0, fallarTorres: [], tardaTorre: {}, incompletaTorres: ['T-07'] });
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); };
const con = re => [...$('#torre').options].find(o => re.test(o.value) || re.test(o.textContent)).value;
const pedir = async () => { await generar(); await hasta(() => !$('#resultado').hidden || /No se pudo|tardó/.test($('#estado').textContent), 15000); await esperar(200); };
const secs = () => $$('#torres-contratista .torre-c');
const sec = t => secs().find(x => x.dataset.torre === t);
const avisos = []; const warn0 = console.warn; console.warn = function () { avisos.push([...arguments].join(' ')); return warn0.apply(console, arguments); };
sel('tipo', 'obra'); sel('sector', 'EZ'); sel('quien', COORDINADORES[0].n); sel('torre', con(/ALNAVIC/));
Q.escribir($('#desde'), '2026-10-09'); Q.escribir($('#hasta'), '2026-10-15');
await pedir();
ok('1 · La torre incompleta no tumba el compilado: sale «No se pudo leer la T-07 … incompleta» con «Reintentar» y las otras tres se ven',
   !$('#resultado').hidden && secs().length === 4 && /No se pudo leer la T-07/.test(sec('T-07').textContent) && /incompleta/.test(sec('T-07').textContent) &&
   !!sec('T-07').querySelector('.reintentar') && ['T-05', 'T-06', 'T-08'].every(t => !!sec(t).querySelector('.av-pct')) && !/d\.notas/.test($('#estado').textContent),
   $('#estado').textContent.slice(0, 140) + ' · ' + ((sec('T-07') || {}).textContent || '').slice(0, 140));
ok('2 · La consola dice qué faltó y qué traía', avisos.some(a => /sin notas, apartamentos, hitos/.test(a) && /trae: ok, sector, torre/.test(a)), avisos.join(' | ').slice(0, 200));
Q.escribir($('#t-hitos'), 'Validación con una torre incompleta'); await enviar();
ok('3 · No deja enviar con la T-07 sin leer', /T-07/.test($('#estado-envio').textContent), $('#estado-envio').textContent.slice(0, 140));
await Q.relevo({ incompletaTorres: [] }); sec('T-07').querySelector('.reintentar').click();
await hasta(() => sec('T-07') && !!sec('T-07').querySelector('.av-pct'), 8000);
ok('4 · «Reintentar» trae la torre completa y lo escrito sigue ahí', !!sec('T-07').querySelector('.av-pct') && $('#t-hitos').value === 'Validación con una torre incompleta' && $('#estado').hidden);
// ── 5 · servicios: la semana de una torre llega incompleta ──
otraVez(); await Q.relevo({ incompletaTorres: ['T-05'] });
sel('tipo', 'servicios'); sel('sector', 'EZ'); sel('torre', 'T-05'); sel('quien', COORDINADORES[0].n);
await pedir();
ok('5 · En servicios, una semana incompleta avisa que vuelva a intentar y la página sigue en pie', $('#resultado').hidden && /incompleta.*Vuelva a intentar/.test($('#estado').textContent) && !$('#btn-generar').disabled,
   $('#estado').textContent.slice(0, 160));
await Q.relevo({ incompletaTorres: [] }); console.warn = warn0;
ok('6 · A 375 px nada se sale', document.documentElement.scrollWidth <= innerWidth + 1, document.documentElement.scrollWidth + ' / ' + innerWidth);
