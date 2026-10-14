// TANDA 88 · Obra, 14-oct-2026 (v166, cambio 183): las hojas de minuta de campo viajan al relevo desde el formulario de obra.
// Lo reportó Planificación: una inspectora cargó las fotos de la minuta y «no se reflejan en la torre». Desde el cambio 163 se
// guardaban en el borrador y Smartsheet las contaba, pero el sobre de obra solo llevaba las fotos de los hitos.
// 1 con una hoja cargada, el sobre lleva «minutas-1» además de las fotos de hito · 2 el envío al relevo falso la lleva con ese nombre
// 3 sin hojas no agrega nada. Corre sobre inspeccion.html?prueba=1 en un navegador a la vista (la foto pasa por canvas e IndexedDB).
localStorage.clear(); await Q.relevo({ borrar: true, tipos: ['inspeccion', 'servicios', 'sha', 'urbanismo'], caido: false, fallar: [], lento: 0 });
Q.aceptar = true;
elegirRol('inspector'); await esperar(200);
Q.elegir($('#convenio'), [...$('#convenio').options].find(o => /Ezequiel/.test(o.text)).value); await esperar(200);
Q.elegir($('#torre'), 'T-56'); await esperar(300); setAmbito('torre'); await esperar(400);
const is = $('.inspector-select'); is.value = 'OTRO'; is.dispatchEvent(new Event('change', { bubbles: true })); await esperar(100); Q.escribir($('.inspector-manual'), 'Ing. Inspector de ejemplo');
const ck = [...document.querySelectorAll('.ck-lbl')].find(l => /En progreso/i.test(l.textContent)); if (ck && !ck.querySelector('input').checked) toggleCk(ck, true);
const sinHojas = _fotosParaEnviar().filter(f => /^minutas-/.test(f.nombre)).length;
Q.ponerFotos($('#fslot_minutas_0 input[type=file]'), [await Q.foto(1200, 1600, 7)]);
await hasta(() => { const im = $('#fimg_minutas_0'); return im && im.src && im.src.indexOf('data:') === 0; }, 20000);
Q.ponerFotos($('#fimg_hito_estructura_0') ? $('#fslot_hito_estructura_0 input[type=file]') : $('.foto-slot input[type=file]'), [await Q.foto(800, 600, 8)]);
await hasta(() => [...document.querySelectorAll('img[id^=fimg_hito_]')].some(i => i.src && i.src.indexOf('data:') === 0), 20000);
const sobre = _fotosParaEnviar();
ok('1 · Con una hoja de minuta cargada el sobre lleva «minutas-1» además de la foto del hito (antes solo iba la del hito)',
   sinHojas === 0 && sobre.some(f => f.nombre === 'minutas-1' && /^data:image/.test(f.dato)) && sobre.some(f => /^hito_/.test(f.nombre)),
   sobre.map(f => f.nombre).join(', '));
localStorage.setItem('garmel_clave_envio', 'qc'); $('#claveEnvio').value = 'qc';
const antes = (await Q.envios()).length;
await enviarAlRelevo(); await hasta(async () => (await Q.envios()).length > antes, 15000);
const env = await Q.envios(), ult = env[env.length - 1] || {};
ok('2 · El envío al relevo falso lleva la hoja como «minutas-1» entre las fotos',
   env.length === antes + 1 && (ult.fotos || []).some(n => /minutas-1/.test(typeof n === 'string' ? n : (n && n.nombre) || '')),
   JSON.stringify(ult.fotos || []).slice(0, 200));
nuevoFormulario(); await esperar(300);
ok('3 · Sin hojas de minuta el sobre no agrega nada', _fotosParaEnviar().filter(f => /^minutas-/.test(f.nombre)).length === 0);
