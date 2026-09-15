// Estrés del formulario de servicios (v64) a 375×812, relevo falso.
// Mide tiempos, tamaños, fotos, almacenamiento, red caída y textos raros.
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const RAIZ = require('path').join(__dirname, '..');
const PUERTO = 8767;
const srv = http.createServer((req, r) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/index.html';
  const f = path.join(RAIZ, p); if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': f.endsWith('.html') ? 'text/html; charset=utf-8' : f.endsWith('.js') ? 'text/javascript' : 'application/octet-stream', 'Cache-Control': 'no-store' });
  r.end(fs.readFileSync(f));
}).listen(PUERTO);

const R = [];
const ok = (n, c, d) => { R.push({ n, c: !!c }); console.log((c ? '  ✅ ' : '  ❌ ') + n + (d !== undefined ? '  — ' + d : '')); };
const ms = t => Math.round(t) + ' ms';

// Una fotografía "de cámara": 4000×3000 con ruido, para que pese como una real.
const FOTO_JS = `(async (w, h) => {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const ctx = cv.getContext('2d');
  const img = ctx.createImageData(w, h); const d = img.data;
  for (let i = 0; i < d.length; i += 4){ d[i] = (i * 7) % 256; d[i+1] = (i * 13) % 256; d[i+2] = (i >> 5) % 256; d[i+3] = 255; }
  ctx.putImageData(img, 0, 0);
  const blob = await new Promise(r => cv.toBlob(r, 'image/jpeg', 0.92));
  window.__foto = new File([blob], 'foto.jpg', { type: 'image/jpeg' });
  return blob.size;
})`;
async function ponerFotos(page, inputSel, n) {
  return page.evaluate(([sel, n]) => {
    const inp = document.querySelector(sel);
    const dt = new DataTransfer();
    for (let i = 0; i < n; i++) dt.items.add(window.__foto);
    inp.files = dt.files;
    inp.dispatchEvent(new Event('change', { bubbles: true }));
  }, [inputSel, n]);
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, locale: 'es-VE' });
  const page = await ctx.newPage();
  const enviados = [];
  let relevoCaido = false, fallarUno = null;
  await page.route(/script\.google\.com/, async route => {
    if (relevoCaido) return route.abort('internetdisconnected');
    const body = JSON.parse(route.request().postData() || '{}');
    if (body.accion === 'historial') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, informe: null }) });
    enviados.push(body);
    if (fallarUno && body.numero === fallarUno) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: false, error: 'error simulado' }) });
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
  });
  let dialogos = [];
  page.on('dialog', async d => { dialogos.push(d.message()); await d.accept(); });
  page.on('pageerror', e => { console.log('  💥 error de página: ' + e.message); R.push({ n: 'pageerror', c: false }); });
  const URL = `http://localhost:${PUERTO}/servicios.html?prueba=1`;
  await page.goto(URL);
  await page.evaluate(() => { localStorage.clear(); localStorage.setItem('garmel_clave_envio', 'X'); });
  const lista = () => page.evaluate(() => JSON.parse(localStorage.getItem('garmel_srv_list') || '[]'));
  const bytesLS = () => page.evaluate(() => { let b = 0; for (const k in localStorage) if (Object.hasOwn(localStorage, k)) b += (localStorage[k] || '').length * 2; return b; });
  const bytesIDB = () => page.evaluate(() => FotosDB.leer(idActual).then(g => Object.values(g).flat().reduce((a, x) => a + (x || '').length * 0.75, 0)));
  const usoNav = () => page.evaluate(() => navigator.storage.estimate().then(e => e.usage));
  const kb = b => Math.round(b / 1024) + ' KB';
  const cabecera = async (torre, conv) => {
    await page.selectOption('#torre', torre);
    if (conv) await page.selectOption('#convenio', { index: 1 });
    await page.selectOption('#estatus', 'En progreso');
    await page.selectOption('#inspectores select', { index: 1 });
  };

  console.log('\n— 1. Carga y pintado');
  const t0 = Date.now();
  await page.goto(URL);
  const tCarga = Date.now() - t0;
  const nItems = await page.evaluate(() => document.querySelectorAll('.item').length);
  const tam = fs.statSync(path.join(RAIZ, 'servicios.html')).size;
  ok('Abre y pinta 7 servicios / 31 ítems', nItems === 31, `${nItems} ítems, ${ms(tCarga)}, ${kb(tam)} el archivo`);
  ok('Carga en menos de 1 s (local)', tCarga < 1000, ms(tCarga));

  console.log('\n— 2. Una fotografía de cámara: reducción y peso');
  const bruto = await page.evaluate(FOTO_JS + '(4000, 3000)');
  await cabecera('T-05');
  await page.click('#srv-srv_electrico .abrir');
  let t = Date.now();
  await ponerFotos(page, '#srv-srv_electrico input[type=file]', 1);
  await page.waitForFunction(() => document.querySelectorAll('#fotos-srv_electrico .foto').length === 1);
  const tRed = Date.now() - t;
  const pesoRed = await page.evaluate(() => document.querySelector('#fotos-srv_electrico .foto img').src.length * 0.75);
  const dims = await page.evaluate(() => new Promise(r => { const i = new Image(); i.onload = () => r(i.width + '×' + i.height); i.src = document.querySelector('#fotos-srv_electrico .foto img').src; }));
  ok('4000×3000 → 1280×960', dims === '1280×960', `${kb(bruto)} en bruto → ${kb(pesoRed)} en ${ms(tRed)}`);
  ok('La foto reducida pesa menos de 400 KB', pesoRed < 400 * 1024, kb(pesoRed));

  console.log('\n— 3. Tope por sección: 5 de golpe, entran 3');
  await ponerFotos(page, '#srv-srv_electrico input[type=file]', 5);
  await page.waitForTimeout(1500);
  const nFotos = await page.evaluate(() => document.querySelectorAll('#fotos-srv_electrico .foto').length);
  ok('Quedan 3 y avisó', nFotos === 3 && dialogos.some(d => /Máximo 3/.test(d)), `${nFotos} fotos · «${(dialogos.find(d => /Máximo/.test(d)) || '').slice(0, 60)}»`);

  console.log('\n— 4. Un informe cargado hasta el tope: 36 fotos');
  dialogos = [];
  for (const g of ['srv_cantv', 'srv_agua', 'srv_gas', 'srv_aguas_servidas', 'srv_incendio', 'srv_pluviales']) {
    await page.evaluate(id => plegar(id, true), g);
    await ponerFotos(page, `#srv-${g} input[type=file]`, 3);
  }
  await page.click('#tab-b');
  for (let i = 0; i < 5; i++) {
    await page.click('#panel-b .btn-add');
    const fila = page.locator('#filas-apto .fila-apto').last();
    await fila.locator('.piso').selectOption('P0' + (i + 1));
    await fila.locator('.apto').fill((i + 1) + '-A');
    await fila.locator('[data-campo="apto_electrico__Tomacorrientes"]').fill(String(10 + i));
    await ponerFotos(page, `#filas-apto .fila-apto:last-child input[type=file]`, 3);
  }
  await page.waitForFunction(() => document.querySelectorAll('.foto').length === 36, null, { timeout: 30000 });
  t = Date.now();
  const guardo = await page.evaluate(() => guardar(false));
  await page.evaluate(() => _escrituraFotos);
  const tGuardar = Date.now() - t;
  const bytes = await bytesLS();
  const enIDB = await bytesIDB();
  ok('36 fotos: guarda sin fallar', guardo && !dialogos.some(d => /NO SE PUDO|FOTOGRAFÍAS NO/.test(d)), `texto ${kb(bytes)} en localStorage · fotos ${kb(enIDB)} en IndexedDB · ${ms(tGuardar)}`);
  ok('El texto del informe pesa menos de 100 KB', bytes < 100 * 1024, kb(bytes));
  ok('Las 36 imágenes están en IndexedDB', enIDB > 36 * 100 * 1024, kb(enIDB));
  t = Date.now();
  for (let i = 0; i < 10; i++) await page.evaluate(() => guardar(false));
  const t10 = Date.now() - t;
  ok('10 guardados seguidos del texto (sin tocar fotos) en menos de 500 ms', t10 < 500, ms(t10));
  ok('Ningún aviso de espacio con un informe lleno', !dialogos.some(d => /espacio/.test(d)), dialogos.filter(d => /espacio/.test(d)).length + ' avisos');
  t = Date.now();
  await page.reload(); await page.waitForTimeout(200);
  await page.waitForFunction(() => document.querySelectorAll('.foto').length === 36, null, { timeout: 15000 });
  const tRecarga = Date.now() - t;
  ok('Recarga con las 36 fotos en pantalla', true, ms(tRecarga));
  ok('Recarga en menos de 3 s', tRecarga < 3000, ms(tRecarga));

  console.log('\n— 5. Enviar el gordo: el sobre y lo que queda en el teléfono');
  t = Date.now();
  await page.click('.acciones .b2');
  await page.waitForFunction(() => !document.getElementById('cartel-envio'), null, { timeout: 60000 });
  const tEnvio = Date.now() - t;
  const sobre = enviados[enviados.length - 1];
  const tamSobre = JSON.stringify(sobre).length;
  ok('El sobre lleva 36 fotos aparte y datos sin imágenes', sobre.fotos.length === 36 && !JSON.stringify(sobre.datos).includes('data:image'), `${kb(tamSobre)}, ${ms(tEnvio)}`);
  const despues = await bytesLS();
  const idbTras = await bytesIDB();
  ok('Al enviarse suelta las fotos de IndexedDB', idbTras === 0, `${kb(enIDB)} → ${kb(idbTras)}`);
  const fichas = await page.evaluate(() => document.querySelectorAll('#fotos-srv_electrico .foto').length);
  ok('En pantalla las fotos siguen (aún no se recargó)', fichas === 3);
  await page.reload(); await page.waitForTimeout(200);
  ok('Tras enviar, abre en blanco', (await page.inputValue('#torre')) === '');

  console.log('\n— 6. Reabrir el enviado: fotos «ya en Drive», editar → Reenviar sin duplicar');
  let l = await lista();
  await page.evaluate(id => cargarInforme(id), l[0].id);
  const enDrive = await page.evaluate(() => document.querySelectorAll('.enDrive').length);
  ok('36 marcas «ya en Drive»', enDrive === 36, enDrive);
  await page.evaluate(() => plegar('srv_electrico', true));
  await page.locator('#items-srv_electrico .item').nth(0).locator('textarea').fill('editado tras enviar');
  await page.waitForTimeout(2600);
  l = await lista();
  ok('Editado tras enviar: conserva la marca y anota', l[0].enviado && l[0].editadoTras, l[0].editadoTras);
  const nAntes = enviados.length;
  await page.click('.acciones .b2'); await page.waitForTimeout(500);
  ok('«Enviar» (tanda) no lo reenvía solo', enviados.length === nAntes && dialogos.some(d => /No hay informes pendientes/.test(d)));
  await page.evaluate(id => enviarSolo(id), l[0].id);
  await page.waitForFunction(() => !document.getElementById('cartel-envio'));
  const re = enviados[enviados.length - 1];
  ok('Reenviar explícito manda el mismo número, 0 fotos nuevas', re.numero === sobre.numero && re.fotos.length === 0, `${re.numero}, ${re.fotos.length} fotos`);

  console.log('\n— 7. Veinte torres seguidas con «Sig. torre»');
  await page.evaluate(() => nuevoInforme());
  dialogos = [];
  const torres = await page.evaluate(() => torresUnicas().slice(0, 20));
  t = Date.now();
  for (const tr of torres) {
    await page.selectOption('#torre', tr);
    const hay2 = await page.evaluate(() => document.getElementById('convenio').options.length > 2);
    if (hay2) await page.selectOption('#convenio', { index: 1 });
    if (!(await page.inputValue('#estatus'))) await page.selectOption('#estatus', 'En progreso');
    if (!(await page.evaluate(() => inspectoresElegidos().length))) await page.selectOption('#inspectores select', { index: 1 });
    await page.evaluate(() => plegar('srv_agua', true));
    await page.locator('#items-srv_agua .item').nth(0).locator('.sino button').nth(0).click();
    await page.evaluate(() => siguienteTorre());
  }
  const t20 = Date.now() - t;
  l = await lista();
  ok('20 informes guardados, cada uno con su torre', l.filter(x => !x.enviado).length === 20 && new Set(l.map(x => x.torre)).size >= 20, `${l.length} en lista, ${ms(t20)} en total`);
  ok('Inspector y estatus se conservaron torre a torre', (await page.evaluate(() => inspectoresElegidos().length)) === 1 && (await page.inputValue('#estatus')) === 'En progreso');
  ok('«Sig. torre» con cabecera incompleta se niega', await (async () => { dialogos = []; await page.evaluate(() => siguienteTorre()); return dialogos.some(d => /le falta/.test(d)); })(), dialogos[0]);
  const tt = await page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('garmel_srv_torres') || '{}')).length);
  ok('Hay memoria de al menos 20 torres', tt >= 20, tt);

  console.log('\n— 8. «Informes» con 21 fichas: abre rápido y todo se toca');
  t = Date.now();
  await page.evaluate(() => abrirInformes());
  const tModal = Date.now() - t;
  const fichasN = await page.evaluate(() => document.querySelectorAll('#modal-informes .ficha').length);
  const chicosModal = await page.evaluate(() => [...document.querySelectorAll('#modal-informes button')].filter(b => b.getBoundingClientRect().height && b.getBoundingClientRect().height < 44).length);
  ok('21 fichas, botones de 44', fichasN === 21 && chicosModal === 0, `${fichasN} fichas, ${ms(tModal)}, ${chicosModal} botones chicos`);
  const capa = await page.evaluate(() => { const b = document.querySelector('#modal-informes .caja button.btn-add'); const r = b.getBoundingClientRect(); return document.elementFromPoint(r.x + 10, r.y + 10) === b; });
  ok('El primer botón del panel está bajo el dedo (elementFromPoint)', capa);
  await page.evaluate(() => cerrarInformes());

  console.log('\n— 9. Tanda de 20 con uno que falla en medio');
  fallarUno = l[10].nro;
  dialogos = [];
  t = Date.now();
  await page.click('.acciones .b2');
  await page.waitForFunction(() => !document.getElementById('cartel-envio'), null, { timeout: 120000 });
  const tTanda = Date.now() - t;
  l = await lista();
  ok('19 enviados, 1 sigue pendiente con su aviso', l.filter(x => x.enviado).length === 20 && l.filter(x => !x.enviado).length === 1 && dialogos.some(d => /19 informe\(s\) enviado/.test(d) && /1 sin enviar/.test(d)), `${ms(tTanda)} · ${(dialogos[dialogos.length - 1] || '').slice(0, 80).replace(/\n/g, ' ')}`);
  fallarUno = null;

  console.log('\n— 10. Sin señal: el informe no se pierde y el aviso es humano');
  relevoCaido = true; dialogos = [];
  await page.click('.acciones .b2');
  await page.waitForFunction(() => !document.getElementById('cartel-envio'), null, { timeout: 60000 });
  ok('Aviso: no hay señal, sigue guardado', dialogos.some(d => /No hay señal|sin enviar/.test(d)), (dialogos[dialogos.length - 1] || '').slice(0, 90).replace(/\n/g, ' '));
  relevoCaido = false;
  await page.click('.acciones .b2');
  await page.waitForFunction(() => !document.getElementById('cartel-envio'));
  l = await lista();
  ok('Con señal, entra', l.every(x => x.enviado));

  console.log('\n— 11. Doble toque en Enviar');
  await page.evaluate(() => nuevoInforme());
  await cabecera('T-38');
  await page.evaluate(() => plegar('srv_gas', true));
  await page.locator('#items-srv_gas .item').nth(0).locator('.sino button').nth(2).click();
  await page.waitForTimeout(2600);
  const nE = enviados.length;
  await page.evaluate(() => { enviar(); enviar(); });
  await page.waitForFunction(() => !document.getElementById('cartel-envio'));
  ok('Dos toques, un solo envío', enviados.length === nE + 1 && dialogos.some(d => /envío en curso/.test(d)), (enviados.length - nE) + ' envíos');

  console.log('\n— 12. Borrar los enviados: la memoria de torres sobrevive');
  await page.evaluate(() => borrarEnviados());
  const ttDespues = await page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('garmel_srv_torres') || '{}')).length);
  ok('0 informes en el teléfono y la memoria de torres intacta', (await lista()).length === 0 && ttDespues >= 21, `${ttDespues} torres`);
  await page.evaluate(() => cerrarInformes());
  await page.evaluate(() => nuevoInforme());
  await page.selectOption('#torre', 'T-38'); await page.waitForTimeout(150);
  ok('T-38 ofrece su historial aunque el informe se borró', (await page.locator('#aviso-historial .historial').count()) === 1);

  console.log('\n— 13. Cadena de herencia y cambio de torre a medias');
  await page.click('#aviso-historial .si'); await page.waitForTimeout(150);
  const her0 = await page.evaluate(() => document.querySelector('#items-srv_gas .item.heredado').dataset.heredado);
  await page.selectOption('#torre', 'T-39'); await page.waitForTimeout(150);
  const quedo = await page.evaluate(() => document.querySelectorAll('.item.heredado').length);
  ok('Cambiar de torre sin tocar nada suelta lo heredado', quedo === 0, quedo + ' heredados');
  await page.selectOption('#torre', 'T-38'); await page.waitForTimeout(150);
  await page.click('#aviso-historial .si'); await page.waitForTimeout(150);
  await page.selectOption('#inspectores select', { index: 1 });
  await page.evaluate(() => plegar('srv_agua', true));
  await page.locator('#items-srv_agua .item').nth(0).locator('.sino button').nth(0).click();   // algo de hoy
  await page.evaluate(() => { document.getElementById('fecha').value = '2026-09-21'; actualizarNro(); marcar(); });
  await page.waitForTimeout(2600);
  await page.evaluate(() => siguienteTorre()); await page.waitForTimeout(150);
  await page.selectOption('#torre', 'T-38'); await page.waitForTimeout(150);
  await page.click('#aviso-historial .si'); await page.waitForTimeout(150);
  const cadena = await page.evaluate(() => [...document.querySelectorAll('.item.heredado')].map(i => i.dataset.heredado));
  ok('El gas heredado dos veces sigue apuntando al informe ORIGINAL; el agua al del 21-sep', cadena.some(h => h === her0) && cadena.some(h => /260921/.test(h)), cadena.join(' | '));
  await page.selectOption('#torre', 'T-39'); await page.waitForTimeout(150);
  ok('Con algo de hoy… no: era todo heredado, se suelta también', (await page.evaluate(() => document.querySelectorAll('.item.heredado').length)) === 0);
  await page.selectOption('#torre', 'T-38'); await page.waitForTimeout(150);
  await page.click('#aviso-historial .si'); await page.waitForTimeout(150);
  await page.locator('#items-srv_agua .item').nth(1).locator('.sino button').nth(1).click();   // algo de hoy
  await page.selectOption('#torre', 'T-39'); await page.waitForTimeout(150);
  ok('Con algo de hoy, cambiar de torre NO borra nada', (await page.evaluate(() => document.querySelectorAll('.item.heredado').length)) > 0);
  await page.evaluate(() => nuevoInforme());

  console.log('\n— 14. Textos raros en ítems y observaciones');
  const raro = 'Tanquilla "A" & <b>fibra</b> ñandú 🔥 \\ /';
  await cabecera('T-45');
  await page.evaluate(() => plegar('srv_pluviales', true));
  await page.click('#srv-srv_pluviales .btn-add');
  await page.keyboard.type(raro);
  await page.locator('#items-srv_pluviales .item').last().locator('.sino button').nth(0).click();
  await page.locator('#items-srv_pluviales .item').last().locator('textarea').fill('obs ' + raro);
  await page.waitForTimeout(2600);
  await page.reload(); await page.waitForTimeout(200);
  const vuelto = await page.evaluate(() => { const it = document.querySelector('#items-srv_pluviales .item[data-fijo="0"]'); return it.querySelector('.nombre-libre').value + '||' + it.querySelector('textarea').value + '||' + valorSN(it); });
  ok('El nombre raro va y vuelve intacto (sin inyectar HTML)', vuelto === raro + '||obs ' + raro + '||SI', vuelto);
  const bTag = await page.evaluate(() => !!document.querySelector('#items-srv_pluviales b'));
  ok('No se inyectó una etiqueta <b>', !bTag);
  await page.evaluate(() => siguienteTorre()); await page.waitForTimeout(150);
  const recordadoRaro = await page.evaluate(() => document.querySelector('#items-srv_pluviales .item[data-memoria] .nombre-libre').value);
  ok('Recordado con el nombre raro intacto en el informe siguiente', recordadoRaro === raro, recordadoRaro);

  console.log('\n— 15. Treinta ítems recordados en un servicio');
  await page.evaluate(() => { const m = JSON.parse(localStorage.getItem('garmel_srv_items') || '{}'); m.srv_incendio = Array.from({ length: 30 }, (_, i) => 'Ítem de incendio ' + (i + 1)); localStorage.setItem('garmel_srv_items', JSON.stringify(m)); });
  t = Date.now(); await page.reload(); await page.waitForTimeout(200);
  const nInc = await page.evaluate(() => document.querySelectorAll('#items-srv_incendio .item').length);
  ok('Pinta 30 recordados sin pestañear', nInc === 30, `${nInc} ítems, ${ms(Date.now() - t)}`);
  const notaOculta = await page.evaluate(() => document.querySelector('#srv-srv_incendio .vacio').hidden);
  ok('La nota «sin lista» se esconde cuando hay recordados', notaOculta);

  console.log('\n— 16. Versión nueva mientras se escribe: avisa, no recarga');
  await cabecera('T-46');
  await page.evaluate(() => plegar('srv_agua', true));
  await page.locator('#items-srv_agua .item').nth(0).locator('.sino button').nth(0).click();
  await page.evaluate(() => { const ev = new MessageEvent('message', { data: { garmel: 'version-nueva' } }); navigator.serviceWorker.dispatchEvent(ev); });
  await page.waitForTimeout(300);
  const avisoV = await page.evaluate(() => [...document.querySelectorAll('div')].some(d => /versión nueva/.test(d.textContent) && d.style.position === 'fixed'));
  ok('Aparece el aviso de versión nueva y la torre sigue', avisoV && (await page.inputValue('#torre')) === 'T-46');

  console.log('\n— 17. Horizontal (812×375)');
  await page.setViewportSize({ width: 812, height: 375 });
  await page.waitForTimeout(200);
  const chicosH = await page.evaluate(() => [...document.querySelectorAll('button, input:not([type=file]), select, textarea')].filter(e => { const r = e.getBoundingClientRect(); return r.width && r.height && r.height < 44; }).length);
  const fuenteH = await page.evaluate(() => getComputedStyle(document.querySelector('#residente')).fontSize);
  ok('Nada por debajo de 44 y campos a 16 px', chicosH === 0 && fuenteH === '16px', `${chicosH} chicos, ${fuenteH}`);
  await page.setViewportSize({ width: 375, height: 812 });

  console.log('\n— 18. Ir a otra app con cambios: guarda en el acto');
  await page.locator('#items-srv_agua .item').nth(2).locator('.sino button').nth(1).click();
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
  l = await lista();
  const g = l.find(x => x.torre === 'T-46');
  ok('Guardado con el tercer ítem en NO', g && g.general.find(x => x.id === 'srv_agua').items[2].sn === 'NO');
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { value: false, configurable: true }); });

  console.log('\n— 19. Apartamento: 20 filas, y una foto en una fila heredada la desmarca');
  await page.click('#tab-b');
  t = Date.now();
  for (let i = 0; i < 20; i++) { await page.click('#panel-b .btn-add'); }
  const t20a = Date.now() - t;
  ok('20 filas de apartamento en menos de 3 s', (await page.evaluate(() => document.querySelectorAll('.fila-apto').length)) === 20 && t20a < 3000, ms(t20a));
  await page.evaluate(() => { document.querySelectorAll('.fila-apto').forEach((f, i) => { f.querySelector('.piso').value = 'P01'; f.querySelector('.apto').value = '1-' + i; }); marcar(); });
  await page.waitForTimeout(2600);
  await page.evaluate(() => siguienteTorre()); await page.waitForTimeout(150);
  await page.selectOption('#torre', 'T-46'); await page.waitForTimeout(150);
  await page.click('#aviso-historial .si'); await page.waitForTimeout(150);
  await page.click('#tab-b');
  const herAptos = await page.evaluate(() => document.querySelectorAll('.fila-apto.heredado').length);
  ok('20 aptos heredados', herAptos === 20, herAptos);
  await page.evaluate(FOTO_JS + '(1600, 1200)');
  await ponerFotos(page, '#filas-apto .fila-apto:first-child input[type=file]', 1);
  await page.waitForFunction(() => document.querySelector('#filas-apto .fila-apto:first-child .foto'));
  const primeraDesmarcada = await page.evaluate(() => !document.querySelector('#filas-apto .fila-apto:first-child').classList.contains('heredado'));
  ok('Una foto en la fila la convierte en «de hoy»', primeraDesmarcada);

  console.log('\n— 20. El teléfono lleno de verdad: guardar falla y NO se limpia nada');
  await page.evaluate(() => { const real = Storage.prototype.setItem; window.__real = real; Storage.prototype.setItem = function (k, v) { if (k === 'garmel_srv_list') throw new DOMException('QuotaExceededError', 'QuotaExceededError'); return real.call(this, k, v); }; });
  dialogos = [];
  await page.click('#tab-a');
  await page.evaluate(() => plegar('srv_gas', true));
  await page.locator('#items-srv_gas .item').nth(3).locator('.sino button').nth(0).click();
  await page.waitForTimeout(2600);
  const sigueEnPantalla = await page.evaluate(() => valorSN(document.querySelectorAll('#items-srv_gas .item')[3]));
  ok('Avisa que no pudo guardar y el informe sigue en pantalla', dialogos.some(d => /NO SE PUDO GUARDAR/.test(d)) && sigueEnPantalla === 'SI', (dialogos[0] || '').slice(0, 60));
  await page.evaluate(() => { Storage.prototype.setItem = window.__real; });
  dialogos = [];
  await page.evaluate(() => siguienteTorre());
  ok('Sig. torre no limpia si no pudo guardar (ya restaurado: guarda y limpia)', (await page.inputValue('#torre')) === '' );

  const malos = R.filter(r => !r.c);
  console.log(`\n${R.length - malos.length}/${R.length} en verde` + (malos.length ? '  ✗ ' + malos.map(m => m.n).join(' · ') : ''));
  await browser.close(); srv.close();
  process.exit(malos.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
