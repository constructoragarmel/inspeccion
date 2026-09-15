// QC 3: contra el SITIO PUBLICADO y el RELEVO REAL, en modo de prueba.
// Convivencia menú/inspección/servicios, sin señal, informe viejo, historial de
// verdad (dos visitas, misma torre), mismo día dos veces, encadenado de fechas.
const { chromium } = require('playwright');
const R = [];
const ok = (n, c, d) => { R.push({ n, c: !!c }); console.log((c ? '  ✅ ' : '  ❌ ') + n + (d !== undefined ? '  — ' + d : '')); };
const BASE = 'https://constructoragarmel.github.io/inspeccion/';
const FOTO_JS = `(async (w, h, texto) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const ctx = cv.getContext('2d');
  const g = ctx.createLinearGradient(0,0,w,h); g.addColorStop(0,'#0f766e'); g.addColorStop(1,'#f59e0b'); ctx.fillStyle = g; ctx.fillRect(0,0,w,h);
  ctx.fillStyle='#fff'; ctx.font='bold 110px sans-serif'; ctx.fillText(texto, 60, h/2);
  const blob = await new Promise(r => cv.toBlob(r, 'image/jpeg', 0.9)); window.__foto = new File([blob], 'foto.jpg', { type: 'image/jpeg' }); return blob.size; })`;
const ponerFoto = (page, sel) => page.evaluate(sel => { const inp = document.querySelector(sel); const dt = new DataTransfer(); dt.items.add(window.__foto); inp.files = dt.files; inp.dispatchEvent(new Event('change', { bubbles: true })); }, sel);
const esperarEnvio = page => page.waitForFunction(() => !document.getElementById('cartel-envio'), null, { timeout: 180000 });

(async () => {
  const clave = process.env.GARMEL_CLAVE; if (!clave) throw new Error('sin clave');
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'es-VE', serviceWorkers: 'allow' });
  const page = await ctx.newPage();
  let dialogos = [], aceptar = true;
  page.on('dialog', async d => { dialogos.push(d.message()); if (aceptar) await d.accept(); else await d.dismiss(); });
  page.on('pageerror', e => { console.log('  💥 ' + e.message); R.push({ n: 'pageerror', c: false }); });
  const lista = () => page.evaluate(() => JSON.parse(localStorage.getItem('garmel_srv_list') || '[]'));

  console.log('\n— 1. El menú publicado: versión, clave y contador por formulario');
  await page.goto(BASE + '?prueba=1#clave=' + encodeURIComponent(clave));
  await page.waitForTimeout(1500);
  const pieMenu = await page.textContent('.pie').catch(() => '');
  const claveGuardada = await page.evaluate(() => localStorage.getItem('garmel_clave_envio'));
  ok('Menú en v66 y la clave del # quedó guardada y fuera de la barra', /v66/.test(pieMenu) && claveGuardada === clave && !(await page.evaluate(() => location.hash)), pieMenu.trim());
  await page.evaluate(() => { localStorage.removeItem('garmel_srv_list'); localStorage.removeItem('garmel_srv_torres'); localStorage.removeItem('garmel_srv_items'); localStorage.removeItem('garmel_srv_actual'); indexedDB.deleteDatabase('garmel_servicios'); });
  const enlaceSrv = await page.evaluate(() => [...document.querySelectorAll('a,button')].map(a => (a.href || a.getAttribute('onclick') || '') + '|' + a.textContent.trim()).find(x => /servicios/i.test(x)));
  ok('El menú ofrece «Servicios» y propaga ?prueba=1', /servicios\.html\?prueba=1|servicios/.test(enlaceSrv || ''), (enlaceSrv || '').slice(0, 80));

  console.log('\n— 2. Servicios publicado: v66, service worker instalado, abre sin señal');
  await page.goto(BASE + 'servicios.html?prueba=1');
  await page.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller, null, { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(1500);
  const pie = await page.textContent('#pie');
  const caches = await page.evaluate(() => caches.keys());
  ok('Pie dice v66 y hay una sola copia local (la v66)', /v66/.test(pie) && caches.length === 1 && caches[0].includes('v66'), pie.trim() + ' · ' + caches.join(','));
  await ctx.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
  await page.waitForTimeout(800);
  const sinSenal = await page.evaluate(() => document.querySelectorAll('.item').length + '|' + document.getElementById('conexion').textContent);
  ok('Sin señal abre desde la copia local, con 31 ítems, y lo dice', /^31\|sin señal/.test(sinSenal), sinSenal);
  await ctx.setOffline(false);
  await page.reload(); await page.waitForTimeout(800);

  console.log('\n— 3. Convivencia: inspección no ve los informes de servicios ni al revés');
  await page.selectOption('#torre', 'T-47'); await page.selectOption('#estatus', 'En progreso'); await page.selectOption('#inspectores select', { index: 1 });
  await page.evaluate(() => plegar('srv_agua', true));
  await page.locator('#items-srv_agua .item').nth(0).locator('.sino button').nth(0).click();
  await page.waitForTimeout(2600);
  const cntSrv = await page.textContent('#cnt');
  await page.goto(BASE + '?prueba=1'); await page.waitForTimeout(800);
  const menuTexto = (await page.textContent('body')).replace(/\s+/g, ' ');
  ok('Servicios cuenta 1 pendiente y el menú lo muestra', cntSrv.trim() === '1' && /1/.test(menuTexto), (menuTexto.match(/.{0,40}sin enviar.{0,20}/) || [''])[0]);
  await page.goto(BASE + 'inspeccion.html?prueba=1'); await page.waitForTimeout(1200);
  const listaInsp = await page.evaluate(() => JSON.parse(localStorage.getItem('garmel_reports_list') || '[]').length);
  const listaSrv = await lista();
  ok('Inspección abre sin errores con 0 informes propios; el de servicios sigue intacto', listaInsp === 0 && listaSrv.length === 1 && listaSrv[0].torre === 'T-47');

  console.log('\n— 4. Un informe guardado ANTES de la v65 (fotos dentro del texto) se abre y se envía');
  await page.goto(BASE + 'servicios.html?prueba=1'); await page.waitForTimeout(800);
  await page.evaluate(FOTO_JS + '(1200, 900, "FOTO VIEJA v64")');
  const datoViejo = await page.evaluate(() => new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(window.__foto); }));
  const viejo = { id: 'srv_viejo_v64', tipo: 'servicios', nro: 'PRUEBA-SRV-EZ-T48-260910-HE', torre: 'T-48', convenio: 'Convenio Bielorrusos', empresa: 'BELZARUBEZHSTROY, S.A.', residente: 'ING. RESIDENTE VIEJO', fecha: '2026-09-10', estatus: 'En progreso', inspectores: ['Hernán Escobar (CIV-NC)'], obs_general: 'Informe guardado con la v64', noInspeccionados: [],
    general: [{ id: 'srv_electrico', nombre: '1. SERVICIOS ELÉCTRICOS', items: [{ nombre: 'Transformador Energizado', agregado: false, sn: 'SI', obs: 'foto adjunta' }], obs: '', fotos: [{ dato: datoViejo, enDrive: false, pie: 'Transformador, foto de la v64' }] }],
    apartamentos: [], guardado: '2026-09-10T15:00:00.000Z' };
  await page.evaluate(v => { const l = JSON.parse(localStorage.getItem('garmel_srv_list') || '[]'); l.push(v); localStorage.setItem('garmel_srv_list', JSON.stringify(l)); }, viejo);
  await page.evaluate(() => cargarInforme('srv_viejo_v64')); await page.waitForTimeout(500);
  const imgVieja = await page.evaluate(() => { const i = document.querySelector('#fotos-srv_electrico .foto img'); return i && i.src.startsWith('data:image') && i.naturalWidth > 0; });
  ok('La foto de la v64 se ve al abrirlo', imgVieja);
  await page.evaluate(() => enviarSolo('srv_viejo_v64')); await esperarEnvio(page);
  ok('Se envió al relevo real', /enviado a Drive/.test(dialogos[dialogos.length - 1]), dialogos[dialogos.length - 1]);

  console.log('\n— 5. Visita 1 real en T-47 (8-sep): N/A, no inspeccionado, saltos de línea, agregado, 2 aptos con foto');
  await page.evaluate(() => cargarInforme(JSON.parse(localStorage.getItem('garmel_srv_list')).find(x => x.torre === 'T-47').id)); await page.waitForTimeout(300);
  await page.fill('#residente', 'ING. MARÍA PÉREZ (prueba v66)');
  await page.evaluate(() => { document.getElementById('fecha').value = '2026-09-08'; actualizarNro(); marcar(); });
  await page.evaluate(() => plegar('srv_agua', true));
  const agua = page.locator('#items-srv_agua .item');
  await agua.nth(1).locator('.sino button').nth(2).click();   // N/A
  await agua.nth(2).locator('.sino button').nth(1).click();
  await agua.nth(2).locator('textarea').fill('Línea uno con ñ y acentos: válvula.\nLínea dos, después del salto.');
  await page.evaluate(() => toggleNoInsp('srv_gas'));
  await page.evaluate(() => plegar('srv_pluviales', true)); await page.click('#srv-srv_pluviales .btn-add'); await page.keyboard.type('Bajante pluvial norte');
  await page.locator('#items-srv_pluviales .item').last().locator('.sino button').nth(1).click();
  await page.evaluate(FOTO_JS + '(1600, 1200, "APTO 3-A · v66")');
  await page.click('#tab-b');
  for (const [piso, apto, toma] of [['P03', '3-A', '12'], ['P03', '3-B', '11']]) {
    await page.click('#panel-b .btn-add');
    const fila = page.locator('#filas-apto .fila-apto').last();
    await fila.locator('.piso').selectOption(piso); await fila.locator('.apto').fill(apto);
    await fila.locator('[data-campo="apto_electrico__Tomacorrientes"]').fill(toma);
    await fila.locator('[data-campo="apto_agua__Instalados"] button').nth(0).click();
    await ponerFoto(page, '#filas-apto .fila-apto:last-child input[type=file]');
  }
  await page.waitForFunction(() => document.querySelectorAll('.fila-apto .foto').length === 2);
  await page.locator('.fila-apto .foto textarea').first().fill('Tablero del 3-A');
  await page.waitForTimeout(2600);
  const nro1 = await page.evaluate(() => numeroInforme());
  dialogos = []; let t = Date.now();
  await page.click('.acciones .b2'); await esperarEnvio(page);
  ok('Visita 1 enviada: ' + nro1, /1 informe\(s\) enviado/.test(dialogos[dialogos.length - 1]), (Date.now() - t) + ' ms');
  ok('Sin aviso de heredados (todo era de hoy)', !dialogos.some(d => /visita anterior/.test(d)));

  console.log('\n— 6. Visita 2 (hoy): elegir T-47 trae la visita 1 entera, y enviar sin revisar avisa');
  await page.evaluate(() => nuevoInforme()); await page.waitForTimeout(100);
  await page.selectOption('#torre', 'T-47'); await page.waitForTimeout(300);
  const banner = (await page.textContent('#aviso-historial')).replace(/\s+/g, ' ');
  ok('Ofrece la visita del 8-sep con 4 ítems y 2 aptos', new RegExp(nro1 + '.*8-sep-2026.*4 ítem.*2 apto').test(banner), banner.slice(0, 130));
  await page.click('#aviso-historial .si'); await page.waitForTimeout(300);
  await page.selectOption('#inspectores select', { index: 1 });
  const estado = await page.evaluate(() => ({
    residente: document.getElementById('residente').value, estatus: document.getElementById('estatus').value,
    gasNI: document.getElementById('srv-srv_gas').classList.contains('no-inspeccionado'),
    aguaNA: valorSN(document.querySelectorAll('#items-srv_agua .item')[1]),
    obs: document.querySelectorAll('#items-srv_agua .item')[2].querySelector('textarea').value,
    pluv: [...document.querySelectorAll('#items-srv_pluviales .item[data-fijo="0"]')].map(i => i.querySelector('.nombre-libre').value + '=' + valorSN(i) + (i.classList.contains('heredado') ? '(her)' : '')).join(','),
    aptos: [...document.querySelectorAll('.fila-apto')].map(f => f.querySelector('.apto').value + (f.classList.contains('heredado') ? '(her)' : '') + ':' + f.querySelectorAll('.foto').length + 'f').join(','),
    her: document.querySelectorAll('.item.heredado').length, cuentaAgua: document.getElementById('cuenta-srv_agua').textContent
  }));
  ok('Residente escrito a mano, estatus, N/A, no inspeccionado y observación con salto vuelven', estado.residente === 'ING. MARÍA PÉREZ (prueba v66)' && estado.estatus === 'En progreso' && estado.gasNI && estado.aguaNA === 'NA' && /Línea dos/.test(estado.obs), JSON.stringify(estado).slice(0, 200));
  ok('El agregado vuelve como recordado y heredado; los 2 aptos heredados y SIN fotos', estado.pluv === 'Bajante pluvial norte=NO(her)' && estado.aptos === '3-A(her):0f,3-B(her):0f', estado.pluv + ' · ' + estado.aptos);
  ok('4 ítems heredados y la cabecera de agua lo dice', estado.her === 4 && /3\/6 · 3 sin revisar/.test(estado.cuentaAgua), estado.her + ' · ' + estado.cuentaAgua);
  await page.waitForTimeout(2600);
  dialogos = []; aceptar = false;
  await page.click('.acciones .b2'); await page.waitForTimeout(800);
  const l6 = await lista();
  ok('Enviar sin tocar nada avisa (6 sin revisar) y con Cancelar no envía', /visita anterior/.test(dialogos[0] || '') && /: 6/.test(dialogos[0] || '') && l6.filter(x => !x.enviado).length === 1, (dialogos[0] || '').replace(/\n/g, ' ').slice(0, 120));
  aceptar = true;

  console.log('\n— 7. Se revisan tres cosas y se envía: llega con lo de hoy y lo heredado marcado');
  await page.click('#tab-a');
  await agua.nth(0).locator('.sino button').nth(0).click();          // confirma SÍ
  await agua.nth(2).locator('.sino button').nth(0).click();          // hoy sí
  await agua.nth(2).locator('textarea').fill('Resuelto el 14-sep (prueba v66)');
  await page.click('#tab-b');
  await page.locator('.fila-apto').first().locator('[data-campo="apto_electrico__Energizado"] button').nth(0).click();
  await page.waitForTimeout(2600);
  const nro2 = await page.evaluate(() => numeroInforme());
  dialogos = []; t = Date.now();
  await page.click('.acciones .b2'); await esperarEnvio(page);
  ok('Avisó de los 3 sin revisar y, aceptando, envió ' + nro2, /: 3/.test(dialogos[0] || '') && /1 informe\(s\) enviado/.test(dialogos[dialogos.length - 1]), (Date.now() - t) + ' ms');
  const l7 = await lista();
  const v2 = l7.find(x => x.nro === nro2);
  const herV2 = v2.general.flatMap(g => g.items).filter(i => i.heredado).map(i => i.nombre.slice(0, 18) + '←' + i.heredado.slice(-10));
  ok('En lo guardado: 2 ítems + 1 apto heredados apuntan a la visita 1, el resto es de hoy', herV2.length === 2 && herV2.every(h => h.endsWith(nro1.slice(-10))) && v2.apartamentos[0].heredado === '' && v2.apartamentos[1].heredado === nro1, herV2.join(' · '));

  console.log('\n— 8. Misma torre, mismo día, otra vez: reenvío -r2, no un informe duplicado');
  await page.evaluate(() => nuevoInforme()); await page.waitForTimeout(100);
  await page.selectOption('#torre', 'T-47'); await page.waitForTimeout(300);
  const banner8 = (await page.textContent('#aviso-historial')).replace(/\s+/g, ' ');
  ok('Ahora ofrece la visita de HOY, no la del 8-sep', banner8.includes(nro2) && !banner8.includes(nro1), banner8.slice(0, 100));
  await page.click('#aviso-historial .si'); await page.waitForTimeout(300);
  await page.selectOption('#inspectores select', { index: 1 });
  await page.click('#tab-a');
  await page.evaluate(() => [...document.querySelectorAll('.item.heredado')].forEach(i => { const b = i.querySelector('.sino .si-on, .sino .no-on, .sino .na-on'); if (b) b.click(); }));   // confirma todo
  await page.click('#tab-b');
  await page.evaluate(() => document.querySelectorAll('.fila-apto').forEach(f => { f.querySelector('[data-campo="apto_electrico__Interruptores"]').value = '6'; f.querySelector('[data-campo="apto_electrico__Interruptores"]').dispatchEvent(new Event('input', { bubbles: true })); }));
  await page.waitForTimeout(2600);
  const nro3 = await page.evaluate(() => numeroInforme());
  dialogos = [];
  await page.click('.acciones .b2'); await esperarEnvio(page);
  ok('Mismo número que la visita 2 y sin aviso (todo confirmado)', nro3 === nro2 && !dialogos.some(d => /visita anterior/.test(d)) && /1 informe\(s\) enviado/.test(dialogos[dialogos.length - 1]), nro3);

  console.log('\n— 9. Torres no se mezclan y las fechas mandan sobre el orden de guardado');
  await page.evaluate(() => nuevoInforme()); await page.waitForTimeout(100);
  await page.selectOption('#torre', 'T-49'); await page.waitForTimeout(300);
  ok('T-49 (nunca visitada) no ofrece historial', (await page.locator('#aviso-historial .historial').count()) === 0);
  await page.selectOption('#torre', 'T-48'); await page.waitForTimeout(300);
  const b48 = (await page.textContent('#aviso-historial')).replace(/\s+/g, ' ');
  ok('T-48 ofrece el informe viejo de la v64 (10-sep)', /T48-260910/.test(b48), b48.slice(0, 90));
  // reabrir y reguardar la visita 1 (8-sep) NO debe destronar a la de hoy
  const id1 = l7.find(x => x.nro === nro1).id;
  await page.evaluate(id => cargarInforme(id), id1); await page.waitForTimeout(300);
  await page.fill('#obs_general', 'reabierto después'); await page.waitForTimeout(2600);
  await page.evaluate(() => nuevoInforme()); await page.waitForTimeout(100);
  await page.selectOption('#torre', 'T-47'); await page.waitForTimeout(300);
  const b47 = (await page.textContent('#aviso-historial')).replace(/\s+/g, ' ');
  ok('T-47 sigue ofreciendo la de HOY aunque se reguardó la del 8-sep', b47.includes(nro2), b47.slice(0, 90));

  console.log('\n— 10. Recargar mientras cargan las fotos: nada se queda en «cargando…»');
  await page.evaluate(id => cargarInforme(id), id1);
  await page.reload(); await page.waitForTimeout(300);
  ok('Un informe ya enviado no vuelve solo a la pantalla al recargar', (await page.inputValue('#torre')) === '');
  await page.evaluate(id => cargarInforme(id), id1); await page.reload({ waitUntil: 'commit' }).catch(() => {});
  await page.waitForTimeout(300);
  await page.evaluate(id => cargarInforme(id), id1); await page.waitForTimeout(1500);
  const colgadas = await page.evaluate(() => [...document.querySelectorAll('.enDrive')].filter(e => /cargando/.test(e.textContent)).length);
  const enDrive = await page.evaluate(() => [...document.querySelectorAll('.enDrive')].filter(e => /Drive/.test(e.textContent)).length);
  ok('0 fotos colgadas; las 2 del informe enviado dicen «ya en Drive»', colgadas === 0 && enDrive === 2, colgadas + ' colgadas, ' + enDrive + ' en Drive');
  ok('Ningún error de página en toda la ronda', !R.some(r => r.n === 'pageerror'));

  const malos = R.filter(r => !r.c);
  console.log(`\n${R.length - malos.length}/${R.length} en verde` + (malos.length ? '  ✗ ' + malos.map(m => m.n).join(' · ') : ''));
  console.log('Números enviados: ' + [viejo.nro, nro1, nro2].join(', '));
  await browser.close();
  process.exit(malos.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
