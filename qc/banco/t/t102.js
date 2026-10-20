// TANDA 102 · v178 (20-oct-2026), pedidos de Diego Orta, en sha.html?prueba=1 (a la vista: envía y recarga nada).
// SHA por manzana (cambio de comun/ubicacion.js y construir-sha.py), el buscador con lo abierto (relevo r70, respuesta armada),
// el panel después del lugar y la memoria de «Toda la zona» por zona.
// 1 cuatro botones de 44 px · 2 en «Manzana» solo manzanas del sector y «Otra» al final · 3 la manzana llena empresa,
// residente, rótulo y número · 4 «Otra manzana» se agrega, normalizada, y queda recordada · 5 «También afecta a» ofrece solo
// manzanas y el número lleva +1 · 6 guardar y reabrir vuelve en «Manzana» · 7 «Una torre» vuelve a las torres y suelta la
// manzana · 8 se envía con la manzana y su ubicación · 9 el panel va después del lugar · 10 el buscador pide lo abierto y lo
// pinta · 11 «Toda la zona» se recuerda por zona y la compartida dice de dónde viene · 12 la que llega del relevo, también
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem(CLAVE_LISTA, '[]');
localStorage.removeItem('garmel_sha_manzanas'); localStorage.removeItem(CLAVE_TORRES); localStorage.removeItem(CLAVE_ACTUAL);
Q.aceptar = true;
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); };
const modo = m => [...document.querySelectorAll('#campo-donde .donde button')].find(b => b.dataset.m === m).click();
const visibles = () => [...document.getElementById('torre').options].filter(o => !o.hidden && o.value).map(o => o.value);
nuevoInforme(); await esperar(300);
// 1
const bs = [...document.querySelectorAll('#campo-donde .donde button')];
ok('1 · Cuatro botones —Una torre, Varias torres, Manzana, Toda la zona— de 44 px o más, en dos filas',
   bs.map(b => b.textContent).join('|') === 'Una torre|Varias torres|Manzana|Toda la zona' && bs.every(b => b.getBoundingClientRect().height >= 44) &&
   bs[0].getBoundingClientRect().top === bs[1].getBoundingClientRect().top && bs[2].getBoundingClientRect().top > bs[0].getBoundingClientRect().top,
   bs.map(b => Math.round(b.getBoundingClientRect().height) + 'px').join(' '));
// 2
sel('convenio', 'Convenio Bielorrusos'); await esperar(200); modo('manzana'); await esperar(300);
const v2 = visibles(), ops = [...document.getElementById('torre').options];
ok('2 · En «Manzana» con Ezequiel Zamora: solo sus manzanas, ninguna torre, y «＋ Otra manzana o lote» al final',
   v2.length >= 9 && v2.every(t => t === '__OTRA_MZ__' || /^M-/.test(t)) && v2[v2.length - 1] === '__OTRA_MZ__' && ops[ops.length - 1].value === '__OTRA_MZ__' && v2.indexOf('M-1 L4') >= 0,
   v2.join(','));
// 3
sel('torre', 'M-1 L4'); await esperar(400);
const ins = document.querySelector('#inspectores select'); if (ins) Q.elegir(ins, [...ins.options].map(o => o.value).find(v => /Birmania/.test(v)));
sel('fecha', '2026-10-20'); await esperar(300);
ok('3 · La manzana llena la contratista de urbanismo y su residente, el rótulo dice «Manzana o lote» y el número la lleva',
   $('#empresa').value === 'ADDISON' && $('#residente').value === 'Ing. Paola Saa' && $('label[for="torre"]').textContent === 'Manzana o lote' && /^PRUEBA-SHA-EZ-M1L4-261020-BR$/.test(numeroInforme()),
   $('#empresa').value + ' · ' + $('#residente').value + ' · ' + numeroInforme());
// 4
sel('torre', '__OTRA_MZ__'); await esperar(200);
const campo = $('#mz-otra-campo'); const vis4 = campo && !campo.hidden;
$('#mz-otra').value = '7 l2'; agregarManzanaSha(); await esperar(300);
const rec = JSON.parse(localStorage.getItem('garmel_sha_manzanas') || '[]');
ok('4 · «Otra manzana» abre un campo; «7 l2» entra como M-7 L2, queda elegida y recordada en el teléfono',
   vis4 && $('#torre').value === 'M-7 L2' && campo.hidden && rec.some(m => m.t === 'M-7 L2' && m.c === 'Convenio Bielorrusos') && $('#empresa').value === 'ADDISON',
   $('#torre').value + ' · ' + JSON.stringify(rec));
// 5
sel('torre', 'M-1 L4'); await esperar(300);
const cand = [...$('#otra-lugar').options].map(o => o.value).filter(Boolean);
sel('otra-lugar', 'M-2'); await esperar(300);
ok('5 · «También afecta a» ofrece solo manzanas; con M-2 el número lleva +1',
   cand.length && cand.every(t => /^M-/.test(t)) && cand.indexOf('M-1 L4') < 0 && /^PRUEBA-SHA-EZ-M1L4\+1-261020-BR$/.test(numeroInforme()),
   cand.join(',') + ' · ' + numeroInforme());
// contestar algo y guardar
const item = document.querySelector('[id^="items-"] .item'); const si = item && [...item.querySelectorAll('button')].find(b => /^S[ií]$/i.test(b.textContent.trim())); if (si) si.click();
const est = $('#estatus'); if (est && est.tagName === 'SELECT') sel('estatus', [...est.options].map(o => o.value).filter(Boolean)[0]);
guardar(false); await esperar(300);
const d0 = listaGuardada()[0];
ok('5b · Lo guardado lleva ubicacion {modo: varias, lugar: manzana, otras: [M-2]}', d0 && d0.torre === 'M-1 L4' && d0.ubicacion && d0.ubicacion.lugar === 'manzana' && d0.ubicacion.modo === 'varias' && (d0.ubicacion.otras || []).join() === 'M-2',
   JSON.stringify(d0 && d0.ubicacion));
// 6
nuevoInforme(); await esperar(300); cargarInforme(d0.id); await esperar(500);
ok('6 · Al reabrirlo vuelve en «Manzana», con M-1 L4 y M-2', _modoDonde === 'manzana' && $('#torre').value === 'M-1 L4' && _otras.join() === 'M-2' && $('label[for="torre"]').textContent === 'Manzana o lote' &&
   [...document.querySelectorAll('#campo-donde .donde button')].find(b => b.dataset.m === 'manzana').classList.contains('on'), _modoDonde + ' · ' + $('#torre').value);
// 8 (antes del 7: se envía este)
const env0 = (await Q.envios()).length;
Q.dialogos.length = 0; await enviarSolo(d0.id); await esperar(800);
const e8 = (await Q.envios()).slice(env0).filter(e => e.numero === d0.nro)[0];
ok('8 · Se envía con la manzana como lugar y su ubicación', e8 && (e8.datos || {}).torre === 'M-1 L4' && ((e8.datos || {}).ubicacion || {}).lugar === 'manzana' && listaGuardada()[0].enviado,
   e8 ? e8.numero + ' · ' + JSON.stringify((e8.datos || {}).ubicacion) : 'no llegó');
// 7
nuevoInforme(); await esperar(300); sel('convenio', 'Convenio Bielorrusos'); modo('manzana'); await esperar(200); sel('torre', 'M-3'); await esperar(300);
modo('una'); await esperar(300);
const v7 = visibles();
ok('7 · Con «Una torre» la lista vuelve a las torres del sector, la manzana se suelta y el rótulo dice «Torre»',
   v7.length && v7.every(t => !/^M-/.test(t) && t !== '__OTRA_MZ__') && $('#torre').value === '' && $('label[for="torre"]').textContent !== 'Manzana o lote' && $('#empresa').value === '',
   v7.slice(0, 5).join(',') + '… · «' + $('#torre').value + '»');
// 9
const panel = document.getElementById('oficina'), tarjeta = $('#torre').closest('.tarjeta');
ok('9 · El panel «Buscar los informes» va después de la tarjeta donde se elige el lugar', !!panel && !!tarjeta && (tarjeta.compareDocumentPosition(panel) & Node.DOCUMENT_POSITION_FOLLOWING) && tarjeta.nextElementSibling === panel);
// 10
sel('torre', 'T-17'); await esperar(300);
let pedido = null; const pedirOrig = _ofiPedir;
_ofiPedir = async c => { pedido = c; return { ok: true, tipo: 'sha', torre: 'T-17', informes: [
  { numero: 'SHA-EZ-T17-261018-BR', revision: 1, fecha: '2026-10-18', lugar: 'T-17', inspectores: ['Birmania Rada'], abiertos: 0 },
  { numero: 'SHA-EZ-T17-261001-BR', revision: 1, fecha: '2026-10-01', lugar: 'T-17', inspectores: ['Birmania Rada'], abiertos: 2, deAntes: true }] }; };
await oficinaBuscar(); await esperar(200); _ofiPedir = pedirOrig;
const lt = $('#ofi-lista').innerText;
ok('10 · El buscador de SHA pide lo abierto y pinta «de antes» con «2 abiertos» y la explicación',
   pedido && pedido.abiertos === true && pedido.dias === 14 && /de antes/.test(lt) && /2 abiertos/.test(lt) && /siguen con algo abierto que ningún informe posterior retomó/.test(lt) && $('#ofi-lista tr.ofi-antes'),
   JSON.stringify(pedido) + ' · ' + lt.slice(0, 120));
// 11
nuevoInforme(); await esperar(300);
const zonaEZ = { id: 'z1', nro: 'PRUEBA-SHA-EZ-ZONA-261019-BR', torre: 'ZONA', convenio: 'Convenio Bielorrusos', fecha: '2026-10-19', guardado: '2026-10-19 10:00', empresa: 'X', residente: 'Y',
  general: [{ id: 'sha_recaudos', items: [{ nombre: 'RIF', sn: 'SI' }] }], apartamentos: [], ubicacion: { modo: 'zona', otras: ['Simón Bolívar'], texto: 'Toda la zona' } };
anotarEstadoTorre(zonaEZ);
const mem = estadosDeTorres();
ok('11a · «Toda la zona» se recuerda por zona: la de EZ y, compartida, la de SB (sin empresa ni residente)',
   mem['ZONA|Convenio Bielorrusos'] && mem['ZONA|Convenio Chinos'] && !mem['ZONA|Convenio Rusos'] && !mem['ZONA'] && mem['ZONA|Convenio Chinos'].zonaDe === 'Convenio Bielorrusos' && mem['ZONA|Convenio Chinos'].empresa === '',
   Object.keys(mem).join(' · '));
modo('zona'); await esperar(200); sel('convenio', 'Convenio Chinos'); await esperar(400);
const av = $('#aviso-historial').innerText;
ok('11b · En «Toda la zona» de Simón Bolívar se ofrece, y dice que es el de toda la zona Ezequiel Zamora', /Toda la zona ya tiene un informe anterior/.test(av) && /Es el de toda la zona Ezequiel Zamora/.test(av), av.slice(0, 160));
sel('convenio', 'Convenio Rusos'); await esperar(400);
ok('11c · En la de Simón Rodríguez, que no afectaba, no se ofrece nada', !$('#aviso-historial').innerText.trim(), $('#aviso-historial').innerText.slice(0, 80));
// 12
const fOrig = window.fetch;
window.fetch = async (u, o) => { const b = JSON.parse(o.body); if (b.accion === 'historial') return { json: async () => ({ ok: true, compartidoDe: 'ZONA',
  informe: Object.assign({}, zonaEZ, { id: 'z2', nro: 'PRUEBA-SHA-EZ-ZONA-261020-BR', fecha: '2026-10-20', residentes: ['R'], estatus: ['En progreso'] }) }) }; return fOrig(u, o); };
_pidiendo = null; await pedirHistorialAlRelevo(); await esperar(300); window.fetch = fOrig;
const m12 = estadosDeTorres()['ZONA|Convenio Rusos'];
ok('12 · La que manda el relevo para la zona de Simón Rodríguez queda con esa zona y dice de cuál viene', m12 && m12.convenio === 'Convenio Rusos' && m12.zonaDe === 'Convenio Bielorrusos' && m12.empresa === '' && /Es el de toda la zona Ezequiel Zamora/.test($('#aviso-historial').innerText),
   JSON.stringify(m12 && { c: m12.convenio, de: m12.zonaDe }));
localStorage.setItem(CLAVE_LISTA, '[]'); localStorage.removeItem(CLAVE_TORRES); localStorage.removeItem('garmel_sha_manzanas');
