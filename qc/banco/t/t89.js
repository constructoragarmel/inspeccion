// TANDA 89 · Urbanismo, 14-oct-2026 (v167): el residente de la contratista se propone solo (lista de Planificación del 14-oct).
// 1 al elegir el sector sin manzana · 2 en una manzana sin residente recordado · 3 lo escrito a mano por manzana manda al reabrir
// 4 cambia con el sector · 5 una manzana nueva nace con su residente. Corre sobre urbanismo.html?prueba=1.
localStorage.clear(); Q.aceptar = true;
Q.elegir($('#convenio'), 'Convenio Bielorusos'); await esperar(150); Q.elegir($('#torre'), 'M-3'); await esperar(200);
ok('1 · En una manzana sin residente recordado, empresa ADDISON y residente «Ing. Paola Saa»', $('#empresa').value === 'ADDISON' && $('#residente').value === 'Ing. Paola Saa', $('#empresa').value + ' · ' + $('#residente').value);
Q.elegir($('#torre'), ''); await esperar(200);
ok('2 · Al quitar la manzana y quedar solo el sector, sigue el residente de la contratista', $('#residente').value === 'Ing. Paola Saa', $('#residente').value);
Q.elegir($('#torre'), 'M-3'); await esperar(200);
Q.escribir($('#residente'), 'Ing. Otra Persona'); Q.elegir($('#inspectores select'), INSPECTORES_DB[1]);
plegar('urb_preliminares', true); const cant = $$('#items-urb_preliminares .item .cant')[0]; Q.escribir(cant, '10');
guardar(false); const id = idActual; nuevoInforme(); await esperar(200);
cargarInforme(id); await esperar(300);
ok('3 · Lo escrito a mano se guarda y manda al reabrir', $('#residente').value === 'Ing. Otra Persona', $('#residente').value);
nuevoInforme(); await esperar(200); Q.elegir($('#convenio'), 'Convenio Rusos'); await esperar(150); Q.elegir($('#torre'), [...$('#torre').options].map(o => o.value).find(v => v && v !== 'ZONA') || ''); await esperar(200);
ok('4 · En Simón Rodríguez, PROCODIMA con «Ing. Gustavo Guillén»', /PROCODIMA/.test($('#empresa').value) && $('#residente').value === 'Ing. Gustavo Guillén', $('#empresa').value + ' · ' + $('#residente').value);
Q.elegir($('#convenio'), 'Convenio Chinos'); await esperar(150); Q.elegir($('#torre'), [...$('#torre').options].map(o => o.value).find(v => v && v !== 'ZONA') || ''); await esperar(200);
ok('4b · En Simón Bolívar, RACAR con «Ing. Nelson Socorro»', /RACAR/.test($('#empresa').value) && $('#residente').value === 'Ing. Nelson Socorro', $('#empresa').value + ' · ' + $('#residente').value);
const nueva = (typeof guardarNuevaManzana === 'function');
ok('5 · Una manzana nueva nace con el residente de su contratista (en la lista recordada)', nueva && (function(){ try { $('#nm-nombre').value = 'M-QC-89'; $('#nm-sector').value = 'Convenio Chinos'; guardarNuevaManzana(); const f = TORRES_DATA.find(x => x.t === 'M-QC-89'); return f && f.r === 'Ing. Nelson Socorro'; } catch (e) { return 'ERR ' + e; } })() === true, JSON.stringify((TORRES_DATA.find(x => x.t === 'M-QC-89') || {})));
