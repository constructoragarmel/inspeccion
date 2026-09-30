// ¿DÓNDE ES? · tanda 1 de 2 — SERVICIOS (30-sep-2026, PA-112). Correr en servicios.html a 375×812.
localStorage.setItem('garmel_clave_envio', 'qc');
await Q.relevo({ borrar: true, tipos: ['inspeccion', 'servicios', 'sha', 'urbanismo'], caido: false, fallar: [], lento: 0 });
localStorage.setItem('garmel_srv_list', '[]');
const conv = $('#convenio'), torre = $('#torre');
const insp = () => Q.elegir($('#inspectores select'), INSPECTORES_DB[0]);
const contestar = () => marcarSN($('#items-' + GENERAL[0].id + ' .item button'), 'SI');
const nuevo = async () => { Q.aceptar = true; nuevoInforme(); await esperar(80); if ($('#aviso-historial .no')) $('#aviso-historial .no').click(); };
const boton = m => $('#campo-donde button[data-m="' + m + '"]');
const unaTorre = TORRES_DATA.find(x => entradasDe(x.t).length === 1 && SECTOR_POR_CONVENIO[x.c] === 'EZ');
const otrasEZ = torresUnicas().filter(t => t !== unaTorre.t && entradasDe(t).length === 1 && SECTOR_POR_CONVENIO[entradasDe(t)[0].c] === 'EZ').slice(0, 2);

// ── 1. Por defecto «Una torre», como siempre; los tres botones miden 44 px o más y caben ──
await nuevo();
const alto = Math.min(...$$('#campo-donde button').map(b => b.getBoundingClientRect().height));
const ancho = document.documentElement.scrollWidth <= innerWidth + 1;
ok('1 · Arranca en «Una torre», «También afecta» oculto; botones ≥ 44 px y sin desbordar el ancho',
   boton('una').classList.contains('on') && $('#campo-otras').hidden && alto >= 44 && ancho && !datosDelFormulario().ubicacion,
   'alto ' + Math.round(alto) + ' · ancho ok ' + ancho);

// ── 2. Varias torres: la principal manda empresa y número; las demás se agregan y se quitan ──
insp(); Q.elegir(torre, unaTorre.t); await esperar(50); if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
boton('varias').click();
Q.elegir($('#otra-lugar'), otrasEZ[0]); Q.elegir($('#otra-lugar'), otrasEZ[1]);
const nro2 = numeroInforme(), chips = $$('#otras-lista .otra').length;
$$('#otras-lista .otra button')[1].click();
const tras = _otras.slice();
Q.elegir($('#otra-lugar'), otrasEZ[1]);
const d2 = datosDelFormulario();
const t = limpiar(unaTorre.t);
ok('2 · Varias: 2 chips, el número dice «' + t + '+2», quitar uno funciona, la empresa lleva las de todas y viaja la ubicación',
   chips === 2 && nro2.indexOf('-' + t + '+2-') > 0 && tras.length === 1 && $('#empresa').value === [...new Set([unaTorre.e].concat(otrasEZ.map(t => entradasDe(t)[0].e)).filter(Boolean))].join(' · ') &&
   d2.torre === unaTorre.t && d2.ubicacion && d2.ubicacion.modo === 'varias' && d2.ubicacion.otras.join() === otrasEZ.join() &&
   d2.ubicacion.texto === [unaTorre.t].concat(otrasEZ).join(' · '),
   nro2 + ' · ' + (d2.ubicacion && d2.ubicacion.texto) + ' · ' + $('#empresa').value);

// ── 3. Se envía como un solo informe, se reabre igual y «Varias» sin otras no deja enviar ──
contestar(); guardar(false);
const id3 = idActual;
Q.dialogos = []; await enviar(); await esperar(600);
const env3 = (await Q.envios()).filter(e => e.tipo === 'servicios');
await nuevo();
cargarInforme(id3); await esperar(100);
const reab = boton('varias').classList.contains('on') && $$('#otras-lista .otra').length === 2 && numeroInforme().indexOf('+2-') > 0;
await nuevo(); insp(); Q.elegir(torre, unaTorre.t); await esperar(50); if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
boton('varias').click(); contestar();
const falta3 = faltan(datosDelFormulario()).join(', ');
ok('3 · Un solo envío con la ubicación; al reabrirlo vuelve en «Varias» con sus 2; sin otras dice qué falta',
   env3.length === 1 && env3[0].datos.ubicacion && env3[0].datos.ubicacion.otras.length === 2 && reab && /otras torres/.test(falta3),
   'envíos ' + env3.length + ' · reabierto ' + reab + ' · falta: ' + falta3);

// ── 4. Toda la zona: sin torre, se elige la zona, empresa en blanco, número ZONA; otra zona se agrega ──
await nuevo(); insp(); boton('zona').click(); await esperar(50);
const etiq = document.querySelector('label[for="convenio"]').textContent;
const opciones = [...conv.options].map(o => o.textContent).filter(x => !/Seleccione/.test(x));
Q.elegir(conv, 'Convenio Bielorrusos'); await esperar(50);
Q.elegir($('#otra-lugar'), 'Simón Rodríguez');
contestar();
const d4 = datosDelFormulario();
ok('4 · Toda la zona: campo de torre oculto, «Zona» con las 3, número SRV-EZ-ZONA, ubicación «Toda la zona Ezequiel Zamora · Simón Rodríguez»',
   torre.closest('.campo').hidden && etiq === 'Zona' && /Si aplica/.test($('#empresa').placeholder) && opciones.length === 3 && /SRV-EZ-ZONA-/.test(numeroInforme()) &&
   d4.torre === 'ZONA' && d4.convenio === 'Convenio Bielorrusos' && !faltan(d4).length &&
   d4.ubicacion.texto === 'Toda la zona Ezequiel Zamora · Simón Rodríguez',
   etiq + ' · ' + opciones.join('/') + ' · ' + numeroInforme() + ' · ' + d4.ubicacion.texto);

// ── 5. Se envía con torre ZONA y sector EZ, se reabre en zona; volver a «Una torre» deja todo como antes ──
guardar(false); const id5 = idActual;
await Q.relevo({ borrar: true });
await enviar(); await esperar(600);
const env5 = (await Q.envios()).filter(e => e.tipo === 'servicios');
await nuevo(); cargarInforme(id5); await esperar(100);
const reab5 = boton('zona').classList.contains('on') && torre.value === 'ZONA' && conv.value === 'Convenio Bielorrusos' && $$('#otras-lista .otra').length === 1;
boton('una').click(); await esperar(50);
const vuelta = !torre.closest('.campo').hidden && torre.value === '' && document.querySelector('label[for="convenio"]').textContent === 'Convenio' &&
               $('#campo-otras').hidden && !datosDelFormulario().ubicacion;
ok('5 · Sale con torre ZONA (sector EZ), se reabre en «Toda la zona», y volver a «Una torre» lo deja como siempre',
   env5.length === 1 && /elegir la torre/.test($('#empresa').placeholder) && /SRV-EZ-ZONA-/.test(env5[0].numero) && env5[0].datos.torre === 'ZONA' && reab5 && vuelta, 'envíos ' + env5.length + ' ' + (env5[0] || {}).numero + ' · reabierto ' + reab5 + ' · vuelta ' + vuelta);
