// PRIMERO EL SECTOR · servicios (30-sep-2026). Correr en servicios.html a 375×812.
localStorage.setItem('garmel_clave_envio', 'qc');
await Q.relevo({ borrar: true, tipos: ['inspeccion', 'servicios', 'sha', 'urbanismo'], caido: false, fallar: [], lento: 0 });
localStorage.setItem('garmel_srv_list', '[]');
const conv = $('#convenio'), torre = $('#torre');
const insp = () => Q.elegir($('#inspectores select'), INSPECTORES_DB[0]);
const nuevo = async () => { Q.aceptar = true; nuevoInforme(); await esperar(80); if ($('#aviso-historial .no')) $('#aviso-historial .no').click(); };
const visible = t => { const o = [...torre.options].find(x => x.value === t); return !!o && !o.hidden && !o.disabled; };
await nuevo();

// ── 6. «Sector» arriba de la torre, con los nombres ──
const orden = conv.compareDocumentPosition(torre) & Node.DOCUMENT_POSITION_FOLLOWING;
ok('6 · Servicios: «Sector» va antes que la torre y muestra los nombres de los sectores',
   !!orden && document.querySelector('label[for="convenio"]').textContent === 'Sector' &&
   [...conv.options].filter(o => o.value).map(o => o.textContent).sort().join('|') === 'Ezequiel Zamora|Simón Bolívar|Simón Rodríguez',
   [...conv.options].map(o => o.textContent).join(', '));

// ── 7. El caso del 30-sep: T-15 con T-14 y T-13 en Ezequiel Zamora ya no mete a Master ni a su residente ──
insp(); Q.elegir(conv, 'Convenio Bielorrusos'); await esperar(60);
Q.elegir(torre, 'T-15'); await esperar(80); if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
$('#campo-donde button[data-m="varias"]').click();
const cand = [...$('#otra-lugar').options].map(o => o.value).filter(Boolean);
Q.elegir($('#otra-lugar'), 'T-14'); Q.elegir($('#otra-lugar'), 'T-13');
ok('7 · T-15 + T-14 + T-13 en Ezequiel Zamora: la empresa es solo Procodima, sin Master ni ERICK MARTINEZ; no se ofrecen torres de otro sector',
   $('#empresa').value === 'PROCODIMA, C.A.' && !/MASTER|ERICK/.test($('#empresa').value + $('#residente').value) &&
   !cand.includes('T-38') && !cand.includes('T-39') && cand.includes('T-13'),
   $('#empresa').value + ' · ' + $('#residente').value + ' · T-38 ofrecida: ' + cand.includes('T-38'));

// ── 8. Simón Rodríguez: la T-13 es de Master; pasar a Ezequiel Zamora la conserva con Procodima; la T-38 se oculta ──
await nuevo(); insp(); Q.elegir(conv, 'Convenio Rusos'); await esperar(60);
Q.elegir(torre, 'T-13'); await esperar(80); if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
const empSR = $('#empresa').value, nroSR = numeroInforme();
Q.elegir(conv, 'Convenio Bielorrusos'); await esperar(80);
Q.elegir(torre, 'T-13'); await esperar(80);
ok('8 · T-13 en Simón Rodríguez es Master (SRV-SR-T13); en Ezequiel Zamora es Procodima (SRV-EZ-T13); la T-38 no se ve en Ezequiel Zamora',
   /MASTER/.test(empSR) && /SRV-SR-T13/.test(nroSR) && /PROCODIMA/.test($('#empresa').value) && /SRV-EZ-T13/.test(numeroInforme()) && !visible('T-38'),
   empSR + ' ' + nroSR + ' · ' + $('#empresa').value + ' ' + numeroInforme());
