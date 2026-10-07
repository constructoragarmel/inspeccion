// TANDA 73 · V142 (7-oct-2026): abrir un informe enviado solo para verlo no lo deja «editado después». En servicios.html,
// sha.html y urbanismo.html (motor compartido). Es lo mismo que la v140 hizo en inspección (t71), en la forma de este motor:
// aquí no se reenvía desde el formulario, sino que «guardar» marcaba editadoTras y la lista ofrecía «Reenviar».
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem(CLAVE_LISTA, '[]');
Q.aceptar = true;
const sel = (id, v) => { const e = document.getElementById(id); if (!e) return; e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
nuevoInforme(); await esperar(300);
sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-01'); sel('fecha', '2026-10-07');
if (document.getElementById('manzana')) sel('manzana', [...document.getElementById('manzana').options].map(o => o.value).filter(Boolean)[0]);
await esperar(500);
const item = document.querySelector('[id^="items-"] .item');
const si = item && [...item.querySelectorAll('button')].find(b => /^S[ií]$/i.test(b.textContent.trim()));
if (si) si.click(); else { const ta = document.querySelector('textarea'); ta.value = 'nota de prueba'; ta.dispatchEvent(new Event('input', { bubbles: true })); }
await esperar(300); guardar(true); await esperar(300);
const d0 = listaGuardada()[0];
ok('1 · Hay un informe guardado con contenido', !!d0 && !informeVacio(d0), d0 && d0.nro);
marcarEnviado(d0.id, d0.nro); await esperar(300);
const l1 = listaGuardada()[0];
ok('2 · Queda marcado como enviado, sin «editado después»', !!l1.enviado && !l1.editadoTras, JSON.stringify([l1.enviado, l1.editadoTras]));
nuevoInforme(); await esperar(300); cargarInforme(d0.id); await esperar(900);
guardar(false); await esperar(300);
const l2 = listaGuardada()[0];
ok('3 · Reabierto sin tocar nada, guardar (lo que hace «Inicio» al salir) NO lo marca «editado después»', !!l2.enviado && !l2.editadoTras, JSON.stringify([l2.enviado, l2.editadoTras]));
Q.dialogos.length = 0; guardar(true); await esperar(200);
ok('4 · «Guardar» a mano dice que no cambió nada', Q.dialogos.some(m => /no cambió nada/.test(m)), Q.dialogos.join(' | ').slice(0, 120));
const ta = document.querySelector('#obs_general') || document.querySelector('textarea'); ta.value = 'ahora sí cambió'; ta.dispatchEvent(new Event('input', { bubbles: true }));
await esperar(200); guardar(false); await esperar(300);
const l3 = listaGuardada()[0];
ok('5 · Con un cambio de verdad sí queda «editado después», y sigue enviado', !!l3.enviado && !!l3.editadoTras, JSON.stringify([l3.enviado, l3.editadoTras]));
nuevoInforme(); await esperar(200); localStorage.setItem(CLAVE_LISTA, '[]');
