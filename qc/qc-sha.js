// QC del formulario de SEGURIDAD INDUSTRIAL (sha.html) a 375×812, relevo falso.
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const RAIZ = require('path').join(__dirname, '..');
const srv = http.createServer((req, r) => { let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/index.html'; const f = path.join(RAIZ, p); if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': f.endsWith('.html') ? 'text/html; charset=utf-8' : f.endsWith('.js') ? 'text/javascript' : 'application/octet-stream', 'Cache-Control': 'no-store' }); r.end(fs.readFileSync(f)); }).listen(8770);
const R = []; const ok = (n, c, d) => { R.push({ n, c: !!c }); console.log((c ? '  ✅ ' : '  ❌ ') + n + (d !== undefined ? '  — ' + d : '')); };
(async () => {
  const b = await chromium.launch();
  const page = await (await b.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, serviceWorkers: 'block' })).newPage();
  let relevoAcepta = false; const enviados = [];
  await page.route(/script\.google\.com/, async route => {
    const req = route.request();
    if (req.method() === 'GET') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(relevoAcepta ? { version: 'r11-sha', logos: true, tipos: ['inspeccion', 'servicios', 'sha'] } : { version: 'r10-cuenta-nueva', logos: true }) });
    const cuerpo = JSON.parse(req.postData()); if (cuerpo.accion === 'historial') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, informe: null }) });
    enviados.push(cuerpo); return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
  });
  let dialogos = [], aceptar = true; page.on('dialog', async d => { dialogos.push(d.message()); aceptar ? await d.accept() : await d.dismiss(); });
  page.on('pageerror', e => { console.log('  💥 ' + e.message); R.push({ n: 'pageerror', c: false }); });
  const URL = 'http://localhost:8770/sha.html?prueba=1';
  await page.goto(URL); await page.evaluate(() => { localStorage.clear(); localStorage.setItem('garmel_clave_envio', 'X'); }); await page.goto(URL);
  const lista = () => page.evaluate(() => JSON.parse(localStorage.getItem('garmel_sha_list') || '[]'));

  console.log('\n— 1. Contenido y maqueta');
  const c = await page.evaluate(() => ({ h1: document.querySelector('h1').textContent, tabs: [...document.querySelectorAll('.pestanas button')].map(b => b.textContent), items: document.querySelectorAll('.item').length, abierto: !document.querySelector('#srv-sha_recaudos .cuerpo').hidden, estatusEnCabecera: !!document.querySelector('.rejilla #estatus'), cierre: [...document.querySelectorAll('#cierre #estatus option')].map(o => o.textContent), insp: INSPECTORES_DB, nro: document.getElementById('nro').textContent }));
  ok('Título, pestañas Recaudos / Hallazgos, 9 recaudos abiertos', /INSPECCIÓN SHA/.test(c.h1) && c.tabs.join('|') === 'Recaudos|Hallazgos de campo' && c.items === 9 && c.abierto, c.tabs.join('|') + ' · ' + c.items);
  ok('El estatus salió de la cabecera y el cierre tiene los 3 del borrador', !c.estatusEnCabecera && c.cierre.slice(1).join('|') === 'Aprobado|Aprobado con observaciones|Rechazado');
  ok('Firman Birmania y Víctor; el número empieza por SHA-', c.insp.length === 2 && /SHA-/.test(c.nro), c.insp.join(', ') + ' · ' + c.nro);
  const chicos = await page.evaluate(() => [...document.querySelectorAll('button, input:not([type=file]):not([type=hidden]), select, textarea')].filter(e => { const r = e.getBoundingClientRect(); return r.width && r.height && r.height < 44; }).length);
  ok('Nada por debajo de 44 px', chicos === 0, chicos);

  console.log('\n— 2. Un hallazgo: área, descripción, estatus (lista) y foto');
  await page.selectOption('#torre', 'T-45'); await page.selectOption('#inspectores select', { index: 1 });
  await page.locator('#items-sha_recaudos .item').nth(0).locator('.sino button').nth(0).click();
  await page.locator('#items-sha_recaudos .item').nth(3).locator('.sino button').nth(1).click();
  await page.locator('#items-sha_recaudos .item').nth(3).locator('textarea').fill('Sin registro INPSASEL vigente');
  await page.click('#tab-b'); await page.click('#panel-b .btn-add');
  const fila = page.locator('.fila-apto').first();
  const sinPiso = await fila.evaluate(f => !f.querySelector('select.piso') && !!f.querySelector('input.piso[type=hidden]'));
  ok('La fila no pide piso; el área es la cabecera', sinPiso);
  await fila.locator('.apto').fill('Andamio fachada norte');
  await fila.locator('[data-campo="hallazgo__Descripción del hallazgo o condición observada"]').fill('Andamio sin barandas en el nivel 3');
  await fila.locator('[data-campo="hallazgo__Acción correctiva / estatus"]').selectOption('Pendiente');
  await page.selectOption('#cierre #estatus', 'Aprobado con observaciones');
  await page.fill('#obs_general', 'Corregir antes del viernes');
  await page.waitForTimeout(2600);
  let l = await lista();
  const h = l[0].apartamentos[0];
  ok('Guardado: hallazgo con área, descripción y estatus; cierre y comentarios', h.apto === 'Andamio fachada norte' && h.campos['hallazgo__Acción correctiva / estatus'] === 'Pendiente' && l[0].estatus === 'Aprobado con observaciones' && l[0].obs_general === 'Corregir antes del viernes' && l[0].tipo === 'sha', JSON.stringify(h.campos));
  ok('El número lleva torre, fecha e iniciales BR', /^PRUEBA-SHA-EZ-T45-\d{6}-BR$/.test(l[0].nro), l[0].nro);

  console.log('\n— 3. Freno: el relevo sin «sha» no recibe; con «sha» sí');
  dialogos = []; await page.click('.acciones .b2'); await page.waitForTimeout(800);
  ok('Con r10 avisa que el relevo no recibe SHA y no manda nada', enviados.length === 0 && dialogos.some(d => /todavía no recibe informes de SHA/.test(d)), (dialogos[0] || '').slice(0, 90));
  ok('El informe sigue pendiente', (await lista()).filter(x => !x.enviado).length === 1);
  relevoAcepta = true; dialogos = [];
  await page.click('.acciones .b2'); await page.waitForFunction(() => !document.getElementById('cartel-envio')); await page.waitForTimeout(300);
  ok('Con r11 (tipos incluye sha) se envía: sobre tipo sha, estatus como lista', enviados.length === 1 && enviados[0].tipo === 'sha' && JSON.stringify(enviados[0].datos.estatus) === '["Aprobado con observaciones"]', JSON.stringify(enviados[0] && enviados[0].datos.estatus));

  console.log('\n— 4. Historial por torre: el hallazgo Pendiente vuelve y se pone Corregido');
  await page.evaluate(() => nuevoInforme()); await page.selectOption('#torre', 'T-45'); await page.waitForTimeout(300);
  const banner = (await page.textContent('#aviso-historial')).replace(/\s+/g, ' ');
  ok('Ofrece la visita anterior con 2 recaudos y 1 hallazgo', /2 ítem.*1 hallazgo/.test(banner), banner.slice(0, 110));
  await page.click('#aviso-historial .si'); await page.waitForTimeout(300);
  await page.selectOption('#inspectores select', { index: 2 });   // Víctor
  const estadoHer = await page.evaluate(() => ({ cierre: document.getElementById('estatus').value, her: document.querySelectorAll('.item.heredado').length, fila: document.querySelector('.fila-apto').classList.contains('heredado'), st: document.querySelector('.fila-apto [data-campo="hallazgo__Acción correctiva / estatus"]').value }));
  ok('Vuelven 2 recaudos y el hallazgo Pendiente heredados; el cierre NO se hereda', estadoHer.her === 2 && estadoHer.fila && estadoHer.st === 'Pendiente' && estadoHer.cierre === '', JSON.stringify(estadoHer));
  await page.click('#tab-b');
  await page.locator('.fila-apto [data-campo="hallazgo__Acción correctiva / estatus"]').selectOption('Corregido');
  const desmarcada = await page.evaluate(() => !document.querySelector('.fila-apto').classList.contains('heredado'));
  ok('Cambiar el estatus a Corregido lo convierte en de hoy', desmarcada);
  const nroVM = await page.evaluate(() => numeroInforme());
  ok('Con Víctor el número termina en VM', /-VM$/.test(nroVM), nroVM);

  console.log('\n— 5. Historial por EMPRESA: otra torre de la misma contratista trae solo los recaudos');
  await page.waitForTimeout(2600); await page.evaluate(() => siguienteTorre()); await page.waitForTimeout(200);
  await page.selectOption('#torre', 'T-46'); await page.waitForTimeout(300);   // BELZARUBEZHSTROY, como T-45
  const b46 = (await page.textContent('#aviso-historial')).replace(/\s+/g, ' ');
  ok('T-46 no tiene informe, pero BELZARUBEZHSTROY sí: ofrece los recaudos', /BELZARUBEZHSTROY.*recaudos verificados/.test(b46) && /T-45/.test(b46), b46.slice(0, 120));
  await page.click('#aviso-historial .si'); await page.waitForTimeout(300);
  const rec = await page.evaluate(() => ({ her: document.querySelectorAll('.item.heredado').length, filas: document.querySelectorAll('.fila-apto').length, cuenta: document.getElementById('cuenta-sha_recaudos').textContent }));
  ok('Llegan los 2 recaudos heredados y NINGÚN hallazgo de la otra torre', rec.her === 2 && rec.filas === 0, JSON.stringify(rec));
  await page.selectOption('#torre', 'T-49'); await page.waitForTimeout(300);   // DRIJECAE: otra empresa
  const t49 = await page.evaluate(() => ({ her: document.querySelectorAll('.item.heredado').length, banner: document.querySelector('#aviso-historial .historial') ? 1 : 0 }));
  ok('Cambiar a una torre de otra empresa suelta lo heredado y no ofrece nada', t49.her === 0 && t49.banner === 0, JSON.stringify(t49));

  console.log('\n— 6. Convivencia: no toca las claves de servicios');
  const claves = await page.evaluate(() => Object.keys(localStorage).filter(k => /garmel_srv/.test(k)).length);
  ok('Ninguna clave garmel_srv_* escrita por SHA', claves === 0);
  await page.reload(); await page.waitForTimeout(300);
  ok('Al recargar vuelve el informe de T-49 en pantalla', (await page.inputValue('#torre')) === 'T-49');
  ok('Ningún error de página', !R.some(r => r.n === 'pageerror'));

  await page.screenshot({ path: 'sha-1.png' });
  await page.selectOption('#torre', 'T-45'); await page.waitForTimeout(400);
  await page.screenshot({ path: 'sha-2.png' });
  const malos = R.filter(r => !r.c);
  console.log(`\n${R.length - malos.length}/${R.length} en verde` + (malos.length ? '  ✗ ' + malos.map(m => m.n).join(' · ') : ''));
  await b.close(); srv.close(); process.exit(malos.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
