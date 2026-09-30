// PRIMERO EL SECTOR · SHA (30-sep-2026). Correr en sha.html a 375×812.
localStorage.setItem('garmel_clave_envio', 'qc');
await Q.relevo({ borrar: true, tipos: ['inspeccion', 'servicios', 'sha', 'urbanismo'], caido: false, fallar: [], lento: 0 });
localStorage.setItem('garmel_sha_list', '[]');
const conv = $('#convenio'), torre = $('#torre');
const insp = () => Q.elegir($('#inspectores select'), INSPECTORES_DB[0]);
const nuevo = async () => { Q.aceptar = true; nuevoInforme(); await esperar(80); if ($('#aviso-historial .no')) $('#aviso-historial .no').click(); };
await nuevo();

// ── 9. Lo que falta dice «el sector», no «el convenio» ──
insp(); marcarSN($('#items-' + GENERAL[0].id + ' .item button'), 'SI');
const f9 = faltan(datosDelFormulario());
ok('9 · SHA: sin sector ni torre, lo que falta dice «el sector»', f9.includes('el sector') && !f9.includes('el convenio'), f9.join(', '));

// ── 10. Un borrador de la T-07 de Simón Rodríguez se abre bien aunque en pantalla esté Ezequiel Zamora ──
Q.elegir(conv, 'Convenio Rusos'); await esperar(60); Q.elegir(torre, 'T-07'); await esperar(80); if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
const e = $('#estatus'); Q.elegir(e, [...e.options].map(o => o.value).filter(Boolean)[0]);
guardar(false); const id10 = idActual;
await nuevo(); Q.elegir(conv, 'Convenio Bielorrusos'); await esperar(60);
cargarInforme(id10); await esperar(150);
ok('10 · SHA: el borrador de la T-07 de Simón Rodríguez vuelve con su sector, su empresa (TSURU) y SHA-SR-T07',
   conv.value === 'Convenio Rusos' && torre.value === 'T-07' && /TSURU/.test($('#empresa').value) && /SHA-SR-T07/.test(numeroInforme()),
   conv.value + ' · ' + torre.value + ' · ' + $('#empresa').value + ' · ' + numeroInforme());
