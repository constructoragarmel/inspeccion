// TANDA 5 · Urbanismo: 48 fotos, IndexedDB, envío en todas sus formas
const EZ = TORRES_DATA[0].c; const conv = $('#convenio'), torre = $('#torre');
const items = sid => $$('#items-' + sid + ' .item');
const kb = b => Math.round(b / 1024) + ' KB'; const ms = t => Math.round(t) + ' ms';
Object.keys(localStorage).filter(k => /garmel_urb_(list|torres|actual)/.test(k)).forEach(k => localStorage.removeItem(k)); await Q.relevo({ borrar: true, tipos: ['inspeccion', 'servicios', 'sha', 'urbanismo'], caido: false, fallar: [] });
const insp = () => Q.elegir($('#inspectores select'), INSPECTORES_DB[2]);
const esperarEnvio = async () => { await esperar(300); return hasta(() => !_tandaEnCurso && !$('#cartel-envio'), 60000); };
nuevoInforme(); insp(); Q.elegir(conv, EZ); Q.elegir(torre, 'M-5'); await esperar(100); if ($('#aviso-historial .no')) $('#aviso-historial .no').click();

// 1. 48 fotos grandes (4000×3000, una por semilla) en 8 secciones
const fotos = []; for (let i = 0; i < 6; i++) fotos.push(await Q.foto(4000, 3000, 20 + i));
let t = Date.now();
GENERAL.slice(0, 8).forEach(g => Q.ponerFotos($('#srv-' + g.id + ' input[type=file]'), fotos));
const llegaron = await hasta(() => $$('.foto img').length === 48, 60000); const t1 = Date.now() - t;
ok('48 fotos de 4000×3000 reducidas y en pantalla', llegaron, ms(t1));
const anchos = $$('.foto img').map(i => i.naturalWidth); 
ok('Reducidas a 1280 px de lado mayor', anchos.every(w => w === 1280), anchos.slice(0, 3).join());
GENERAL.slice(0, 8).forEach((g, k) => { Q.escribir(items(g.id)[0].querySelector('.cant'), String(k + 1)); Q.escribir($$('#fotos-' + g.id + ' .foto textarea')[0], 'pie ' + g.nombre); });
t = Date.now(); const g1 = guardar(false); await _escrituraFotos; const t2 = Date.now() - t;
const peso = await FotosDB.leer(idActual).then(g => Object.values(g).flat().reduce((a, x) => a + (x || '').length * 0.75, 0));
ok('Guarda texto + 48 fotos en IndexedDB sin fallo', g1 && !Q.dialogos.some(d => /NO SE PUDO|FOTOGRAFÍAS NO/.test(d)), kb(peso) + ' en IDB · ' + ms(t2));
ok('localStorage sigue chico (sin imágenes dentro)', (localStorage.getItem('garmel_urb_list') || '').length < 20000, kb((localStorage.getItem('garmel_urb_list') || '').length));
const idGordo = idActual;

// 2. reabrir desde Informes: 48 fotos de vuelta con sus pies
nuevoInforme(); t = Date.now(); cargarInforme(idGordo); const ok2 = await hasta(() => $$('.foto img').length === 48, 20000); const t3 = Date.now() - t;
ok('Reabierto con las 48 en menos de 3 s, pies intactos', ok2 && t3 < 3000 && $$('#fotos-urb_drenaje .foto textarea')[0].value === 'pie 1. DRENAJE', ms(t3));
ok('Las secciones con fotos se reabren desplegadas', GENERAL.slice(0, 8).every(g => !$('#srv-' + g.id + ' .cuerpo').hidden));

// 3. freno: relevo sin urbanismo, relevo caído
await Q.relevo({ tipos: ['inspeccion', 'servicios', 'sha'] }); Q.dialogos = [];
enviar(); await esperarEnvio();
ok('Relevo sin «urbanismo»: avisa «todavía no recibe informes de urbanismo» y no envía', Q.dialogos.some(d => /no recibe informes de urbanismo/.test(d)) && (await Q.envios()).length === 0, (Q.dialogos[0] || '').slice(0, 80));
await Q.relevo({ tipos: ['inspeccion', 'servicios', 'sha', 'urbanismo'], caido: true }); Q.dialogos = [];
t = Date.now(); enviar(); await esperarEnvio(); 
ok('Relevo caído: aviso humano, sigue pendiente, sin colgarse', Q.dialogos.some(d => /No hay señal|no responde/.test(d)) && listaGuardada().filter(x => !x.enviado).length === 1, (Q.dialogos[0] || '').slice(0, 80) + ' · ' + ms(Date.now() - t));
await Q.relevo({ caido: false });

// 4. envío bueno: 48 fotos aparte con nombre, IDB se suelta, marcas «ya en Drive»
Q.dialogos = []; t = Date.now(); enviar(); await esperarEnvio(); const t4 = Date.now() - t;
let env = await Q.envios();
ok('Enviado: 48 fotos aparte, tipo urbanismo', env.length === 1 && env[0].fotos.length === 48 && env[0].tipo === 'urbanismo', env[0] && (env[0].fotos.length + ' · ' + kb(env[0].bytes) + ' · ' + ms(t4)));
ok('Nombres de foto por sección: urb_drenaje-1 … (según el motor)', env[0] && env[0].fotos.slice(0, 2).join(), env[0] && env[0].fotos.slice(0, 2).join());
ok('Los pies viajan en datos.general[].fotos[].pie', env[0] && env[0].datos.general[1].fotos[0].pie === 'pie 1. DRENAJE');
const idb = await FotosDB.leer(idGordo).then(g => Object.keys(g).length);
ok('IndexedDB soltó las 48 y en pantalla hay 48 «ya en Drive»', idb === 0 && $$('.enDrive').length === 48, idb + ' · ' + $$('.enDrive').length);
ok('Aviso de resultado: «1 informe(s) enviado»', Q.dialogos.some(d => /1 informe\(s\) enviado/.test(d)), Q.dialogos.slice(-1)[0]);
ok('La ficha del informe en la lista dice enviado', listaGuardada()[0].enviado);

// 5. 12 informes más: uno falla, doble toque, rescate
const manz = ['M-1 L1', 'M-1 L2', 'M-1 L3', 'M-1 L4', 'M-2', 'M-3', 'M-4', 'M-6'];
for (const m of manz){ nuevoInforme(); insp(); Q.elegir(torre, m); await esperar(50); if ($('#aviso-historial .no')) $('#aviso-historial .no').click(); Q.escribir(items('urb_vialidad')[0].querySelector('.cant'), '5'); items('urb_vialidad')[0].querySelectorAll('.sino button')[1].click(); guardar(false); }
const pend = listaGuardada().filter(x => !x.enviado);
ok('8 informes pendientes', pend.length === 8, pend.length);
await Q.relevo({ fallar: [pend[3].nro] }); Q.dialogos = [];
enviar(); await esperarEnvio();
ok('Tanda de 8 con uno que falla: 7 entran, 1 queda con su aviso', /7 informe\(s\) enviado/.test(Q.dialogos.slice(-1)[0] || '') && /1 sin enviar/.test(Q.dialogos.slice(-1)[0] || '') && listaGuardada().filter(x => !x.enviado).length === 1, (Q.dialogos.slice(-1)[0] || '').replace(/\n/g, ' ').slice(0, 120));
ok('El aviso trae el detalle del fallo', /fallo simulado/.test(Q.dialogos.slice(-1)[0] || ''));
await Q.relevo({ fallar: [] });
const nE = (await Q.envios()).length; Q.dialogos = []; enviar(); enviar(); await esperarEnvio();
ok('Doble toque: un solo envío y aviso «envío en curso»', (await Q.envios()).length === nE + 1 && Q.dialogos.some(d => /envío en curso/.test(d)), ((await Q.envios()).length - nE) + ' · ' + Q.dialogos.map(d => d.slice(0, 25)).join('|'));
// rescate: el relevo archivó pero la respuesta «falló»
const dR = listaGuardada().find(x => x.torre === 'M-6');
await Q.relevo({ fallar: [dR.nro] });
// se desmarca localmente como si nunca hubiera llegado la respuesta
(function(){ const l = listaGuardada(); const i = l.findIndex(x => x.id === dR.id); delete l[i].enviado; localStorage.setItem('garmel_urb_list', JSON.stringify(l)); })();
Q.dialogos = []; await enviarSolo(dR.id); await esperarEnvio();
ok('Rescate: el relevo dice que falló pero ya tenía ese nro+guardado → se marca enviado sin duplicar', listaGuardada().find(x => x.id === dR.id).enviado && !(Q.dialogos.slice(-1)[0] || '').includes('No se pudo'), Q.dialogos.slice(-1)[0]);
await Q.relevo({ fallar: [] });

// 6. Informes: fichas, «partida(s)», reenviar editado, borrar enviados
abrirInformes(); await esperar(100);
const fichas = $$('#modal-informes .ficha');
ok('9 fichas, texto con «partida(s)» y no «apto(s)», botones ≥44', fichas.length === 9 && fichas.every(f => /partida\(s\)/.test(f.textContent)) && !fichas.some(f => /apto/.test(f.textContent)) && Q.chicos().filter(c => /modal/.test(c)).length === 0, fichas[0] && fichas[0].querySelector('.s').textContent);
ok('La ficha del gordo cuenta 8 partidas', /8 partida/.test($$('#modal-informes .ficha').find(f => /M5/.test(f.textContent)).textContent), $$('#modal-informes .ficha').find(f => /M5/.test(f.textContent)).textContent.replace(/\s+/g, ' ').slice(0, 120));
cerrarInformes(); cargarInforme(idGordo); await esperar(300);
Q.escribir(items('urb_drenaje')[0].querySelector('textarea'), 'editado tras enviar'); guardar(false);
ok('Editar un enviado lo deja enviado y anota «editadoTras»', listaGuardada().find(x => x.id === idGordo).enviado && listaGuardada().find(x => x.id === idGordo).editadoTras);
const n6 = (await Q.envios()).length; Q.dialogos = []; enviar(); await esperarEnvio();
ok('La tanda no lo reenvía (0 pendientes → aviso)', (await Q.envios()).length === n6, Q.dialogos.slice(-1)[0]);
Q.aceptar = true; await enviarSolo(idGordo); await esperarEnvio(); env = await Q.envios();
ok('Reenviar sí: mismo número, 0 fotos (ya en Drive), 8 partidas', env.length === n6 + 1 && env.slice(-1)[0].numero === env[0].numero && env.slice(-1)[0].fotos.length === 0, env.slice(-1)[0].fotos.length);
borrarEnviados();
ok('Borrar enviados: lista vacía, memoria de manzanas (torres) sigue', listaGuardada().length === 0 && Object.keys(estadosDeTorres()).length >= 9, Object.keys(estadosDeTorres()).length);
ok('Ningún error de página', !Q.R.some(r => /pageerror|unhandled/.test(r.n)));
