// ¿DÓNDE ES? · tanda 2b — SHA (30-sep-2026, PA-112). Correr en sha.html a 375×812 y a 320×640.
localStorage.setItem('garmel_clave_envio', 'qc');
await Q.relevo({ borrar: true, tipos: ['inspeccion', 'servicios', 'sha', 'urbanismo'], caido: false, fallar: [], lento: 0 });
localStorage.setItem('garmel_sha_list', '[]');
const conv = $('#convenio'), torre = $('#torre');
const insp = () => Q.elegir($('#inspectores select'), INSPECTORES_DB[0]);
const nuevo = async () => { Q.aceptar = true; nuevoInforme(); await esperar(80); if ($('#aviso-historial .no')) $('#aviso-historial .no').click(); };
const boton = m => $('#campo-donde button[data-m="' + m + '"]');
const contestar = () => { marcarSN($('#items-' + GENERAL[0].id + ' .item button'), 'SI'); const e = $('#estatus'); if (e && e.tagName === 'SELECT' && !e.value) Q.elegir(e, [...e.options].map(o => o.value).filter(Boolean)[0]); };
const t1 = TORRES_DATA.find(x => entradasDe(x.t).length === 1 && SECTOR_POR_CONVENIO[x.c] === 'EZ');
const t2 = torresUnicas().find(t => t !== t1.t && entradasDe(t).length === 1 && entradasDe(t)[0].c === t1.c && entradasDe(t)[0].e !== t1.e);

// ── 9. SHA varias torres de dos empresas: se asigna a las dos (Skarlet, 30-sep), un solo envío; volver a «Una» devuelve la suya ──
await nuevo(); insp(); Q.elegir(torre, t1.t); await esperar(60); if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
boton('varias').click(); Q.elegir($('#otra-lugar'), t2); contestar();
const nota = $('#otras-empresas').textContent;
guardar(false);
await enviar(); await esperar(600);
const env9 = (await Q.envios()).filter(e => e.tipo === 'sha');
await nuevo(); insp(); Q.elegir(torre, t1.t); await esperar(60); if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
boton('varias').click(); Q.elegir($('#otra-lugar'), t2); const dos9 = $('#empresa').value; boton('una').click();
const vuelta9 = /·/.test(dos9) && $('#empresa').value === t1.e;
ok('9 · SHA: con otra empresa en la otra torre lo avisa; sale un solo informe SHA-…+1 con la ubicación',
   /2 empresas/.test(nota) && env9.length === 1 && /\+1-/.test(env9[0].numero) && env9[0].datos.ubicacion.otras[0] === t2 &&
   env9[0].datos.empresa === t1.e + ' · ' + entradasDe(t2)[0].e && vuelta9,
   nota.slice(0, 90) + ' · ' + (env9[0] || {}).numero + ' · ' + ((env9[0] || {}).datos || {}).empresa + ' · vuelta ' + vuelta9);

// ── 10. SHA toda la zona: sin zona elegida dice «la zona»; los botones y los chips caben a lo ancho ──
await nuevo(); insp(); Q.elegir(conv, '');   // el sector se conserva entre informes: aquí se parte sin él
boton('zona').click(); contestar();
const f10 = faltan(datosDelFormulario()).join(', ');   // el estatus ya va puesto: solo debe faltar la zona
Q.elegir(conv, 'Convenio Rusos'); Q.elegir($('#otra-lugar'), 'Ezequiel Zamora'); Q.elegir($('#otra-lugar'), 'Simón Bolívar');
const ancho = document.documentElement.scrollWidth <= innerWidth + 1;
const quitar = Math.min(...$$('#otras-lista .otra button').map(b => b.getBoundingClientRect().height));
ok('10 · SHA zona: falta «la zona» sin elegirla; con SR elegida, número SHA-SR-ZONA; 2 chips; nada se sale del ancho (' + innerWidth + ' px) y el ✕ mide ≥ 40',
   f10 === 'la zona' && /SHA-SR-ZONA-/.test(numeroInforme()) && $$('#otras-lista .otra').length === 2 && ancho && quitar >= 40,
   'faltan: ' + f10 + ' · ' + numeroInforme() + ' · ancho ' + ancho + ' · ✕ ' + Math.round(quitar));
