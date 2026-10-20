// TANDA 105 · QC 1 y 2 de la v178 (20-oct-2026), en sha.html?prueba=1: SHA por manzana de punta a punta y los cambios de modo.
// 1 un hallazgo con foto en una manzana se guarda con su manzana · 2 «Sig. torre» en «Manzana» sigue en «Manzana», con el sector
// y la lista de manzanas · 3 «Sig. torre» en «Una torre» sigue en torres · 4 la visita anterior de una manzana se ofrece en esa
// manzana y no en una torre · 5 «Toda la zona» → «Manzana» → «Una torre» deja todo coherente · 6 un borrador de manzana
// recuperado al arrancar abre en «Manzana» · 7 la «Otra manzana» escrita en urbanismo aparece en SHA · 8 sin sector, «Otra
// manzana» avisa y no agrega
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem(CLAVE_LISTA, '[]');
localStorage.removeItem(CLAVE_TORRES); localStorage.removeItem('garmel_sha_manzanas');
Q.aceptar = true;
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); };
const modo = m => [...document.querySelectorAll('#campo-donde .donde button')].find(b => b.dataset.m === m).click();
const visibles = () => [...document.getElementById('torre').options].filter(o => !o.hidden && o.value).map(o => o.value);
const insp = () => { const i = document.querySelector('#inspectores select'); if (i) Q.elegir(i, [...i.options].map(o => o.value).find(v => /Birmania/.test(v))); };
nuevoInforme(); await esperar(300);
sel('convenio', 'Convenio Bielorrusos'); modo('manzana'); await esperar(200); sel('torre', 'M-5'); await esperar(400); insp(); sel('fecha', '2026-10-20');
const est = $('#estatus'); if (est && est.tagName === 'SELECT') sel('estatus', [...est.options].map(o => o.value).filter(Boolean)[0]);
// 1 · un hallazgo con foto
const tabAp = [...document.querySelectorAll('button')].find(b => /Hallazgos|Frentes/i.test(b.textContent) && b.offsetParent); if (tabAp) tabAp.click(); await esperar(200);
if (typeof addApartamento === 'function') addApartamento({ apto: 'Zanja de drenaje', campos: { 'Descripción del hallazgo': 'Zanja sin señalizar', 'Estatus': 'Pendiente' }, fotos: [] });
await esperar(200);
const item = document.querySelector('[id^="items-"] .item'); const si = item && [...item.querySelectorAll('button')].find(b => /^S[ií]$/i.test(b.textContent.trim())); if (si) si.click();
guardar(false); await esperar(300);
const d1 = listaGuardada()[0];
ok('1 · Un hallazgo en la manzana M-5 se guarda con la manzana, la contratista de urbanismo y su número', d1 && d1.torre === 'M-5' && d1.empresa === 'ADDISON' && /SHA-EZ-M5-261020-BR/.test(d1.nro) && (d1.apartamentos || []).length === 1 && d1.ubicacion && d1.ubicacion.lugar === 'manzana',
   d1 && (d1.nro + ' · ' + d1.empresa + ' · ' + (d1.apartamentos || []).length));
// 2 · «Sig. torre» en «Manzana»
siguienteTorre(); await esperar(400);
const v2 = visibles();
ok('2 · «Sig. torre» en «Manzana» sigue en «Manzana», con el sector y solo manzanas', _modoDonde === 'manzana' && $('#convenio').value === 'Convenio Bielorrusos' && v2.length && v2.every(t => /^M-|__OTRA_MZ__/.test(t)) && $('label[for="torre"]').textContent === 'Manzana o lote',
   _modoDonde + ' · «' + $('#convenio').value + '» · ' + v2.slice(0, 3).join(','));
// 3 · «Sig. torre» en «Una torre»
modo('una'); await esperar(200); sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-05'); await esperar(400); insp(); if (si) { const it2 = document.querySelector('[id^="items-"] .item'); [...it2.querySelectorAll('button')].find(b => /^S[ií]$/i.test(b.textContent.trim())).click(); }
if (est && est.tagName === 'SELECT') sel('estatus', [...est.options].map(o => o.value).filter(Boolean)[0]);
siguienteTorre(); await esperar(400);
const v3 = visibles();
ok('3 · «Sig. torre» en «Una torre» sigue en torres', _modoDonde === 'una' && v3.length && v3.every(t => !/^M-/.test(t)), _modoDonde + ' · ' + v3.slice(0, 3).join(','));
// 4 · la visita anterior de la manzana
nuevoInforme(); await esperar(300); sel('convenio', 'Convenio Bielorrusos'); modo('manzana'); await esperar(200); sel('torre', 'M-5'); await esperar(500);
const av4 = $('#aviso-historial').innerText;
modo('una'); await esperar(200); sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-06'); await esperar(500);
const av4b = $('#aviso-historial').innerText;
ok('4 · La visita anterior de M-5 se ofrece en M-5, y en una torre sin informe no aparece', /M-5 ya tiene un informe anterior/.test(av4) && !/M-5/.test(av4b), av4.slice(0, 60) + ' / «' + av4b.slice(0, 40) + '»');
// 5 · zona → manzana → una torre
modo('zona'); await esperar(200); sel('convenio', 'Convenio Bielorrusos'); await esperar(200);
modo('manzana'); await esperar(300);
const t5a = $('#torre').value, vis5 = visibles();
modo('una'); await esperar(300);
ok('5 · De «Toda la zona» a «Manzana» y a «Una torre»: el lugar empieza vacío cada vez y la lista es la del modo', t5a === '' && vis5.every(t => /^M-|__OTRA_MZ__/.test(t)) && $('#torre').value === '' && visibles().every(t => !/^M-/.test(t)) && !$('#torre').closest('.campo').hidden,
   '«' + t5a + '» · ' + vis5.slice(0, 2).join(','));
// 6 · borrador de manzana recuperado al arrancar: lo que hace el final de ubicacion.js
nuevoInforme(); await esperar(300); cargarInforme(d1.id); await esperar(400);
const ok6a = _modoDonde === 'manzana';
_modoDonde = 'una'; _pintarDonde();   // como si el arranque lo hubiera dejado en «una»
const t0 = document.getElementById('torre').value; if (t0 && t0 !== 'ZONA' && _esManzanaT(t0)) _modoDonde = 'manzana'; _torresDelSector(); _pintarDonde();
ok('6 · Un borrador de manzana abre en «Manzana» (al cargarlo y al arrancar con él en pantalla)', ok6a && _modoDonde === 'manzana' && $('label[for="torre"]').textContent === 'Manzana o lote');
// 7 · lo escrito en urbanismo
localStorage.setItem('garmel_urb_manzanas', JSON.stringify([{ t: 'M-9 L1', c: 'Convenio Bielorrusos', e: 'ADDISON', r: '' }]));
_manzanasConocidas().forEach(m => _sumarManzana(m.t, m.c)); _torresDelSector();
ok('7 · Una manzana agregada en urbanismo en este teléfono aparece en SHA', visibles().indexOf('M-9 L1') >= 0, visibles().join(','));
// 8 · sin sector
nuevoInforme(); await esperar(300); _sectorElegido = ''; sel('convenio', ''); modo('manzana'); await esperar(200);
Q.dialogos.length = 0; const otraVisible = [...$('#torre').options].find(o => o.value === '__OTRA_MZ__').hidden === false;
$('#mz-otra').value = '8'; agregarManzanaSha(); await esperar(200);
ok('8 · Sin sector, «Otra manzana» no se ofrece y, si se fuerza, avisa y no agrega', !otraVisible && /sector/.test(Q.dialogos.join(' ')) && !TORRES_DATA.some(x => x.t === 'M-8'), Q.dialogos.join(' | '));
localStorage.setItem(CLAVE_LISTA, '[]'); localStorage.removeItem(CLAVE_TORRES); localStorage.removeItem('garmel_urb_manzanas'); localStorage.removeItem('garmel_sha_manzanas');
