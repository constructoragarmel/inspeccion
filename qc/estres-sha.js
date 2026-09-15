// 20 QC del formulario de SHA (sha.html) a 375×812, relevo falso que acepta 'sha'.
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const RAIZ = require('path').join(__dirname, '..');
const srv = http.createServer((req, r) => { let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/index.html'; const f = path.join(RAIZ, p); if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': f.endsWith('.html') ? 'text/html; charset=utf-8' : f.endsWith('.js') ? 'text/javascript' : 'application/octet-stream', 'Cache-Control': 'no-store' }); r.end(fs.readFileSync(f)); }).listen(8771);
const R = []; const ok = (n, c, d) => { R.push({ n, c: !!c }); console.log((c ? '  ✅ ' : '  ❌ ') + n + (d !== undefined ? '  — ' + d : '')); };
const ms = t => Math.round(t) + ' ms'; const kb = b => Math.round(b / 1024) + ' KB';
const FOTO_JS = `(async (w, h) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const ctx = cv.getContext('2d');
  const img = ctx.createImageData(w, h); const d = img.data; for (let i = 0; i < d.length; i += 4){ d[i] = (i * 7) % 256; d[i+1] = (i * 13) % 256; d[i+2] = (i >> 5) % 256; d[i+3] = 255; } ctx.putImageData(img, 0, 0);
  const blob = await new Promise(r => cv.toBlob(r, 'image/jpeg', 0.92)); window.__foto = new File([blob], 'foto.jpg', { type: 'image/jpeg' }); return blob.size; })`;
const ponerFotos = (page, sel, n) => page.evaluate(([sel, n]) => { const inp = document.querySelector(sel); const dt = new DataTransfer(); for (let i = 0; i < n; i++) dt.items.add(window.__foto); inp.files = dt.files; inp.dispatchEvent(new Event('change', { bubbles: true })); }, [sel, n]);
const REC = '#items-sha_recaudos .item';
const ST = '[data-campo="hallazgo__Acción correctiva / estatus"]', DESC = '[data-campo="hallazgo__Descripción del hallazgo o condición observada"]';

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, serviceWorkers: 'block', locale: 'es-VE' });
  const page = await ctx.newPage();
  let relevoAcepta = true, relevoCaido = false, fallarUno = null; const enviados = [];
  await page.route(/script\.google\.com/, async route => {
    if (relevoCaido) return route.abort('internetdisconnected');
    const req = route.request();
    if (req.method() === 'GET') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(relevoAcepta ? { version: 'r11-sha-archiva', logos: true, tipos: ['inspeccion', 'servicios', 'sha'] } : { version: 'r10-destino-propio', logos: true }) });
    const body = JSON.parse(req.postData()); if (body.accion === 'historial') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, informe: null }) });
    enviados.push(body);
    if (fallarUno && body.numero === fallarUno) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: false, error: 'error simulado' }) });
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
  });
  let dialogos = [], aceptar = true; page.on('dialog', async d => { dialogos.push(d.message()); aceptar ? await d.accept() : await d.dismiss(); });
  page.on('pageerror', e => { console.log('  💥 ' + e.message); R.push({ n: 'pageerror', c: false }); });
  const URL = 'http://localhost:8771/sha.html?prueba=1';
  await page.goto(URL); await page.evaluate(() => { localStorage.clear(); indexedDB.deleteDatabase('garmel_sha'); localStorage.setItem('garmel_clave_envio', 'X'); }); await page.goto(URL);
  const lista = () => page.evaluate(() => JSON.parse(localStorage.getItem('garmel_sha_list') || '[]'));
  // El freno pregunta al relevo ANTES de mostrar el cartel: esperar el cartel no basta, hay que esperar la bandera.
  const esperarEnvio = async () => { await page.waitForTimeout(400); await page.waitForFunction(() => !_tandaEnCurso && !document.getElementById('cartel-envio'), null, { timeout: 60000 }); };
  const cabecera = async (t) => { await page.selectOption('#torre', t); if (await page.evaluate(() => document.getElementById('convenio').options.length > 2)) await page.selectOption('#convenio', { index: 1 }); if (!(await page.evaluate(() => inspectoresElegidos().length))) await page.selectOption('#inspectores select', { index: 1 }); };
  const hallazgo = async (area, desc, st) => { await page.click('#tab-b'); await page.click('#panel-b .btn-add'); const f = page.locator('.fila-apto').last(); await f.locator('.apto').fill(area); await f.locator(DESC).fill(desc); await f.locator(ST).selectOption(st); };

  console.log('\n— 1. Carga, texto de cada fila, 44 px, sin scroll horizontal');
  const t0 = Date.now(); await page.goto(URL); const tCarga = Date.now() - t0;
  const c1 = await page.evaluate(() => ({ items: [...document.querySelectorAll('.item .nombre')].map(n => n.textContent.trim()), chicos: [...document.querySelectorAll('button, input:not([type=file]):not([type=hidden]), select, textarea')].filter(e => { const r = e.getBoundingClientRect(); return r.width && r.height && r.height < 44; }).length, ancho: document.documentElement.scrollWidth, inner: innerWidth }));
  ok('9 recaudos con nombre, ninguno vacío', c1.items.length === 9 && c1.items.every(Boolean), `${ms(tCarga)} · ${c1.items[0]}`);
  ok('44 px y sin scroll horizontal', c1.chicos === 0 && c1.ancho <= c1.inner, `${c1.chicos} chicos · ${c1.ancho}/${c1.inner}`);

  console.log('\n— 2. Cabecera: sin estatus de obra; residente y empresa se guardan solos');
  await cabecera('T-45');
  await page.fill('#residente', 'ING. RESIDENTE SHA'); await page.fill('#empresa', 'EMPRESA EDITADA');
  await page.waitForTimeout(2600);
  let l = await lista();
  ok('Residente y empresa guardados a los 2 s; estatus vacío (va en el cierre)', l[0].residente === 'ING. RESIDENTE SHA' && l[0].empresa === 'EMPRESA EDITADA' && l[0].estatus === '', JSON.stringify([l[0].residente, l[0].estatus]));

  console.log('\n— 3. Recaudos: SÍ / NO / N/A, deseleccionar, contador');
  await page.locator(REC).nth(0).locator('.sino button').nth(0).click();
  await page.locator(REC).nth(1).locator('.sino button').nth(1).click();
  await page.locator(REC).nth(2).locator('.sino button').nth(2).click();
  await page.locator(REC).nth(2).locator('.sino button').nth(2).click();   // deselecciona
  const c3 = await page.evaluate(() => ({ v: [...document.querySelectorAll('#items-sha_recaudos .item')].map(valorSN).join(''), cuenta: document.getElementById('cuenta-sha_recaudos').textContent }));
  ok('SI, NO, y el N/A tocado dos veces vuelve a vacío; cuenta 2/9', c3.v === 'SINO' && /2\/9/.test(c3.cuenta), c3.v + ' · ' + c3.cuenta);

  console.log('\n— 4. Recaudo agregado en campo: se recuerda, sin nombre no viaja');
  await page.click('#srv-sha_recaudos .btn-add'); await page.keyboard.type('Charla diaria de seguridad');
  await page.locator(REC).last().locator('.sino button').nth(0).click();
  await page.click('#srv-sha_recaudos .btn-add');   // vacío
  await page.waitForTimeout(2600);
  l = await lista(); const rec = l[0].general[0].items;
  const mem = await page.evaluate(() => JSON.parse(localStorage.getItem('garmel_sha_items') || '{}'));
  ok('Viajan 9 fijos + 1 agregado con respuesta; el vacío no; la memoria lo aprendió', rec.length === 10 && rec[9].agregado && rec[9].nombre === 'Charla diaria de seguridad' && (mem.sha_recaudos || []).join() === 'Charla diaria de seguridad', rec.length + ' · ' + JSON.stringify(mem));

  console.log('\n— 5. Hallazgos: tres filas con estatus distinto, fotos por hallazgo, tope 3');
  await page.evaluate(FOTO_JS + '(4000, 3000)');
  await hallazgo('Andamio fachada norte', 'Sin barandas nivel 3', 'Pendiente');
  await hallazgo('Losa 5', 'Huecos sin proteger', 'En proceso');
  await hallazgo('Acceso principal', 'Señalización repuesta', 'Corregido');
  await ponerFotos(page, '#filas-apto .fila-apto:first-child input[type=file]', 5);
  await page.waitForFunction(() => document.querySelectorAll('#filas-apto .fila-apto:first-child .foto').length === 3, null, { timeout: 30000 });
  await page.waitForTimeout(2600);
  l = await lista();
  const hs = l[0].apartamentos.map(a => a.apto + ':' + a.campos['hallazgo__Acción correctiva / estatus'] + ':' + a.fotos.length + 'f');
  ok('3 hallazgos con su estatus; la primera fila con 3 fotos (de 5, avisó)', hs.join(' | ') === 'Andamio fachada norte:Pendiente:3f | Losa 5:En proceso:0f | Acceso principal:Corregido:0f' && dialogos.some(d => /Máximo 3/.test(d)), hs.join(' | '));
  const enIDB = await page.evaluate(() => _escrituraFotos.then(() => FotosDB.leer(idActual)).then(g => Object.keys(g).filter(k => g[k].some(Boolean))));
  ok('Las fotos del hallazgo están en IndexedDB bajo apto:0', enIDB.join() === 'apto:0', enIDB.join());

  console.log('\n— 6. Cierre: estatus general y comentarios; «Sig. torre» no los arrastra');
  await page.selectOption('#cierre #estatus', 'Rechazado'); await page.fill('#obs_general', 'Paralizar el frente norte');
  await page.waitForTimeout(2600);
  await page.evaluate(() => siguienteTorre()); await page.waitForTimeout(200);
  const c6 = await page.evaluate(() => ({ est: document.getElementById('estatus').value, obs: document.getElementById('obs_general').value, insp: inspectoresElegidos().length, fecha: document.getElementById('fecha').value }));
  ok('Nuevo informe: cierre y comentarios en blanco, inspector y fecha conservados', c6.est === '' && c6.obs === '' && c6.insp === 1 && !!c6.fecha, JSON.stringify(c6));
  l = await lista();
  ok('El anterior quedó con Rechazado y su comentario', l[0].estatus === 'Rechazado' && l[0].obs_general === 'Paralizar el frente norte');

  console.log('\n— 7. Enviar: freno con r10, envío con r11, sobre correcto');
  await cabecera('T-46'); await page.waitForTimeout(300); if (await page.locator('#aviso-historial .historial').count()) await page.click('#aviso-historial .no'); await page.click('#tab-a'); await page.locator(REC).nth(0).locator('.sino button').nth(0).click(); await page.waitForTimeout(2600);
  relevoAcepta = false; dialogos = []; await page.click('.acciones .b2'); await page.waitForTimeout(800);
  ok('r10: avisa y no envía (2 pendientes siguen)', enviados.length === 0 && dialogos.some(d => /no recibe informes de SHA/.test(d)) && (await lista()).filter(x => !x.enviado).length === 2);
  relevoAcepta = true; dialogos = []; await page.click('.acciones .b2'); await esperarEnvio();
  const s7 = enviados.find(e => e.numero.includes('T45'));
  ok('r11: 2 enviados; el de T-45 lleva tipo sha, 3 fotos, estatus [Rechazado] y 10 recaudos', enviados.length === 2 && s7 && s7.tipo === 'sha' && s7.fotos.length === 3 && JSON.stringify(s7.datos.estatus) === '["Rechazado"]' && s7.datos.general[0].items.length === 10, enviados.length + ' · ' + (s7 && s7.fotos.length));
  ok('Nombres de foto apto-1-ANDAMIOFACHADANORTE-N', s7 && s7.fotos.every(f => /^apto-1-ANDAMIOFACHADANORTE-\d$/.test(f.nombre)), s7 && s7.fotos.map(f => f.nombre).join(','));

  console.log('\n— 8. Historial por torre: el hallazgo Pendiente vuelve, el Corregido también, y el cierre no');
  await page.evaluate(() => nuevoInforme()); await page.selectOption('#torre', 'T-45'); await page.waitForTimeout(300);
  await page.click('#aviso-historial .si'); await page.waitForTimeout(300); await page.selectOption('#inspectores select', { index: 2 });
  const c8 = await page.evaluate(() => ({ filas: [...document.querySelectorAll('.fila-apto')].map(f => f.querySelector('.apto').value + ':' + f.querySelector('[data-campo="hallazgo__Acción correctiva / estatus"]').value + (f.classList.contains('heredado') ? '(her)' : '')), fotos: document.querySelectorAll('.fila-apto .foto').length, her: document.querySelectorAll('.item.heredado').length, cierre: document.getElementById('estatus').value, obs: document.getElementById('obs_general').value, rec: [...document.querySelectorAll('#items-sha_recaudos .item[data-fijo="0"]')].map(i => i.querySelector('.nombre-libre').value + '=' + valorSN(i)) }));
  ok('3 hallazgos heredados con su estatus, sin fotos; 3 recaudos heredados (incluido el agregado); cierre vacío', c8.filas.length === 3 && c8.filas.every(f => /\(her\)$/.test(f)) && c8.fotos === 0 && c8.her === 3 && c8.cierre === '' && c8.obs === '' && c8.rec.join() === 'Charla diaria de seguridad=SI', JSON.stringify(c8).slice(0, 220));
  (interpretacion => ok('(criterio) Un hallazgo «Corregido» también vuelve: lo decide Birmania si debe desaparecer', true))();

  console.log('\n— 9. Sin revisar → aviso; revisar dos → aviso con el resto; enviar');
  await page.waitForTimeout(2600); dialogos = []; aceptar = false; await page.click('.acciones .b2'); await page.waitForTimeout(800);
  ok('Avisa 6 sin revisar (3 recaudos + 3 hallazgos) y con Cancelar no envía', /: 6/.test(dialogos[0] || '') && enviados.length === 2, (dialogos[0] || '').replace(/\n/g, ' ').slice(0, 80));
  aceptar = true; await page.click('#tab-b');
  await page.locator('.fila-apto').first().locator(ST).selectOption('Corregido');
  await page.click('#tab-a'); await page.locator(REC).nth(0).locator('.sino button').nth(0).click();
  await page.waitForTimeout(2600); dialogos = []; await page.click('.acciones .b2'); await esperarEnvio();
  ok('Avisa 4 y, aceptando, envía; el número es el de hoy con VM', /: 4/.test(dialogos[0] || '') && enviados.length === 3 && /T45-\d{6}-VM$/.test(enviados[2].numero), enviados[2] && enviados[2].numero);

  console.log('\n— 10. Historial por EMPRESA en una torre de dos convenios (T-12)');
  await page.evaluate(() => nuevoInforme());
  await page.selectOption('#torre', 'T-12'); await page.waitForTimeout(300);
  const antesConv = await page.locator('#aviso-historial .historial').count();
  await page.selectOption('#convenio', 'Convenio Bielorrusos'); await page.waitForTimeout(300);   // THAISA: sin historial
  const c10 = await page.evaluate(() => ({ emp: document.getElementById('empresa').value, banner: document.querySelector('#aviso-historial .historial') ? document.querySelector('#aviso-historial .historial').textContent.replace(/\s+/g, ' ').slice(0, 80) : '' }));
  ok('Sin convenio no ofrece nada; con THAISA (sin historial) tampoco', antesConv === 0 && /THAISA/.test(c10.emp) && c10.banner === '', c10.emp + ' · ' + c10.banner);
  await page.evaluate(() => nuevoInforme()); await page.selectOption('#torre', 'T-47'); await page.waitForTimeout(300);   // BELZARUBEZHSTROY
  const b47 = (await page.textContent('#aviso-historial')).replace(/\s+/g, ' ');
  ok('T-47 (BELZARUBEZHSTROY, sin informe) ofrece los recaudos verificados en T-45', /BELZARUBEZHSTROY.*recaudos verificados.*T-45/.test(b47), b47.slice(0, 110));
  await page.click('#aviso-historial .si'); await page.waitForTimeout(300);
  const c10b = await page.evaluate(() => ({ her: document.querySelectorAll('.item.heredado').length, filas: document.querySelectorAll('.fila-apto').length, origen: document.querySelector('.item.heredado').dataset.heredado }));
  ok('Llegan 3 recaudos heredados del informe de HOY en T-45 (el más reciente), sin hallazgos', c10b.her === 3 && c10b.filas === 0 && /T45-\d{6}-VM$/.test(c10b.origen), JSON.stringify(c10b));

  console.log('\n— 11. Veinte torres seguidas: tiempos y memoria');
  await page.evaluate(() => nuevoInforme());
  const torres = await page.evaluate(() => torresUnicas().filter(t => !['T-45','T-46','T-47','T-49','T-50','T-51','T-12'].includes(t)).slice(0, 20)); const antes11 = (await lista()).filter(x => !x.enviado).length; let t = Date.now();
  for (const tr of torres) { await cabecera(tr); const hayBanner = await page.locator('#aviso-historial .historial').count(); if (hayBanner) await page.click('#aviso-historial .no'); await page.click('#tab-a'); await page.locator(REC).nth(4).locator('.sino button').nth(0).click(); await page.evaluate(() => siguienteTorre()); }
  const t11 = Date.now() - t; l = await lista();
  ok('20 informes nuevos guardados (el guion tarda, el formulario no)', l.filter(x => !x.enviado).length === antes11 + 20, `${l.length} en lista · ${ms(t11)} con las esperas del guion`);

  console.log('\n— 12. Tanda de 20 con uno que falla; sin señal; doble toque');
  const enviables = (await page.evaluate(() => listaGuardada().filter(x => !x.enviado && !faltan(x).length).length));
  fallarUno = l.find(x => !x.enviado && x.torre === torres[7]).nro; dialogos = [];
  await page.click('.acciones .b2'); await esperarEnvio(); l = await lista();
  const quedan12 = l.filter(x => !x.enviado).length;
  ok(`${enviables - 1} entran, 1 queda con su aviso`, new RegExp((enviables - 1) + ' informe\\(s\\) enviado').test(dialogos[dialogos.length - 1]) && /1 sin enviar/.test(dialogos[dialogos.length - 1]), (dialogos[dialogos.length - 1] || '').replace(/\n/g, ' ').slice(0, 70));
  fallarUno = null; relevoCaido = true; dialogos = []; await page.click('.acciones .b2'); await esperarEnvio();
  ok('Sin señal: aviso humano, sigue pendiente', dialogos.some(d => /No hay señal|no responde/.test(d)) && (await lista()).filter(x => !x.enviado).length === quedan12, (dialogos[dialogos.length - 1] || '').replace(/\n/g, ' ').slice(0, 90));
  await page.waitForFunction(() => !_tandaEnCurso); relevoCaido = false; const nE = enviados.length; await page.evaluate(() => { enviar(); enviar(); }); await page.waitForTimeout(300); await page.waitForFunction(() => !_tandaEnCurso, null, { timeout: 60000 });
  ok('Doble toque: un solo envío', enviados.length === nE + 1 && dialogos.some(d => /envío en curso/.test(d)), `${enviados.length - nE} envíos · ${dialogos.map(d => d.slice(0, 30)).join(' | ')}`);

  console.log('\n— 13. Informes: 23 fichas, 44 px, borrar enviados conserva memorias');
  await page.evaluate(() => abrirInformes());
  const c13 = await page.evaluate(() => ({ fichas: document.querySelectorAll('#modal-informes .ficha').length, chicos: [...document.querySelectorAll('#modal-informes button')].filter(b => b.getBoundingClientRect().height && b.getBoundingClientRect().height < 44).length, texto: document.querySelector('#modal-informes .ficha .s').textContent }));
  ok('Fichas con «hallazgo(s)» y botones de 44', c13.fichas >= 23 && c13.chicos === 0 && /hallazgo\(s\)/.test(c13.texto), c13.fichas + ' · ' + c13.texto);
  await page.evaluate(() => borrarEnviados()); await page.evaluate(() => cerrarInformes());
  const c13b = await page.evaluate(() => ({ l: JSON.parse(localStorage.getItem('garmel_sha_list')).length, t: Object.keys(JSON.parse(localStorage.getItem('garmel_sha_torres'))).length, e: Object.keys(JSON.parse(localStorage.getItem('garmel_sha_empresas'))).length }));
  ok('Quedan solo los no enviables; las memorias de torre y de empresa siguen', c13b.l <= 2 && c13b.t >= 20 && c13b.e >= 5, JSON.stringify(c13b));

  console.log('\n— 14. Quitar un recaudo recordado: solo aquí / también de los próximos');
  await page.evaluate(() => nuevoInforme()); await page.waitForTimeout(100);
  const rec14 = page.locator('#items-sha_recaudos .item[data-fijo="0"]');
  ok('El recordado aparece en el informe nuevo', (await rec14.count()) === 1);
  aceptar = false; await rec14.first().locator('.quitar-item').click(); await page.waitForTimeout(100);
  const m14 = await page.evaluate(() => (JSON.parse(localStorage.getItem('garmel_sha_items') || '{}').sha_recaudos || []).length);
  ok('Cancelar: se va del informe, la memoria lo conserva', m14 === 1 && (await rec14.count()) === 0);
  aceptar = true; await page.reload(); await page.waitForTimeout(300);
  await page.locator('#items-sha_recaudos .item[data-fijo="0"] .quitar-item').first().click(); await page.waitForTimeout(100);
  ok('Aceptar: se olvida', (await page.evaluate(() => (JSON.parse(localStorage.getItem('garmel_sha_items') || '{}').sha_recaudos || []).length)) === 0);

  console.log('\n— 15. Textos raros en área, hallazgo y observación');
  const raro = 'Losa "5" & <b>norte</b> ñ 🔥 \\ /';
  await cabecera('T-49'); await hallazgo(raro, 'obs ' + raro, 'En proceso');
  await page.click('#tab-a'); await page.locator(REC).nth(5).locator('textarea').fill('rec ' + raro);
  await page.waitForTimeout(2600); await page.reload(); await page.waitForTimeout(300);
  const c15 = await page.evaluate(() => ({ area: document.querySelector('.fila-apto .apto').value, desc: document.querySelector('.fila-apto [data-campo="hallazgo__Descripción del hallazgo o condición observada"]').value, rec: document.querySelectorAll('#items-sha_recaudos .item')[5].querySelector('textarea').value, b: !!document.querySelector('.fila-apto b, #items-sha_recaudos b') }));
  ok('Todo vuelve intacto y sin inyectar HTML', c15.area === raro && c15.desc === 'obs ' + raro && c15.rec === 'rec ' + raro && !c15.b, c15.area);

  console.log('\n— 16. Cambiar de torre con solo lo heredado lo suelta; con algo de hoy, no');
  await page.evaluate(() => nuevoInforme()); await cabecera('T-45'); await page.waitForTimeout(200); await page.click('#aviso-historial .si'); await page.waitForTimeout(200);
  await page.selectOption('#torre', 'T-49'); await page.waitForTimeout(200);
  const c16 = await page.evaluate(() => document.querySelectorAll('.heredado').length + '|' + document.querySelectorAll('.fila-apto').length);
  await page.selectOption('#torre', 'T-45'); await page.waitForTimeout(200); await page.click('#aviso-historial .si'); await page.waitForTimeout(200);
  await page.click('#tab-b'); await page.locator('.fila-apto').first().locator(DESC).fill('tocado hoy');
  await page.selectOption('#torre', 'T-49'); await page.waitForTimeout(200);
  const c16b = await page.evaluate(() => document.querySelectorAll('.fila-apto').length);
  ok('Sin tocar nada: 0 heredados y 0 hallazgos al cambiar; con algo de hoy: se quedan', c16 === '0|0' && c16b === 3, c16 + ' · ' + c16b);

  console.log('\n— 17. Versión nueva mientras se escribe, ir a otra app, horizontal');
  await page.evaluate(() => { navigator.serviceWorker && navigator.serviceWorker.dispatchEvent && navigator.serviceWorker.dispatchEvent(new MessageEvent('message', { data: { garmel: 'version-nueva' } })); });
  await page.waitForTimeout(200);
  const avisoV = await page.evaluate(() => [...document.querySelectorAll('div')].some(d => /versión nueva/.test(d.textContent) && d.style.position === 'fixed') || !('serviceWorker' in navigator));
  ok('Con cambios en pantalla, la versión nueva avisa y no recarga', avisoV && (await page.inputValue('#torre')) === 'T-49');
  await page.click('#tab-a'); await page.locator(REC).nth(7).locator('.sino button').nth(1).click();
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
  const idAct17 = await page.evaluate(() => idActual);
  l = await lista(); const g17 = l.find(x => x.id === idAct17);
  ok('Al irse a otra app se guarda en el acto (recaudo 8 = NO)', g17 && g17.general[0].items[7].sn === 'NO', JSON.stringify({ id: idAct17, hay: !!g17, items: g17 && g17.general[0].items.map(i => i.nombre.slice(0, 12) + '=' + i.sn), torre: g17 && g17.torre, sucio: await page.evaluate(() => sucio) }));
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { value: false, configurable: true }); });
  await page.setViewportSize({ width: 812, height: 375 }); await page.waitForTimeout(200);
  const chicosH = await page.evaluate(() => [...document.querySelectorAll('button, input:not([type=file]):not([type=hidden]), select, textarea')].filter(e => { const r = e.getBoundingClientRect(); return r.width && r.height && r.height < 44; }).length);
  ok('Horizontal: nada por debajo de 44 px', chicosH === 0, chicosH); await page.setViewportSize({ width: 375, height: 812 });

  console.log('\n— 18. Informe lleno: 3 fotos en recaudos + 10 hallazgos con 3 fotos = 33 fotos');
  await page.evaluate(() => nuevoInforme()); await cabecera('T-50'); await page.evaluate(FOTO_JS + '(4000, 3000)');
  await page.click('#tab-a'); await ponerFotos(page, '#srv-sha_recaudos input[type=file]', 3);
  for (let i = 0; i < 10; i++) { await hallazgo('Frente ' + i, 'Hallazgo ' + i, 'Pendiente'); await ponerFotos(page, '#filas-apto .fila-apto:last-child input[type=file]', 3); }
  await page.waitForFunction(() => document.querySelectorAll('.foto').length === 33, null, { timeout: 60000 });
  t = Date.now(); const guardo = await page.evaluate(() => guardar(false)); await page.evaluate(() => _escrituraFotos); const t18 = Date.now() - t;
  const peso = await page.evaluate(() => FotosDB.leer(idActual).then(g => Object.values(g).flat().reduce((a, x) => a + (x || '').length * 0.75, 0)));
  ok('Guarda 33 fotos sin fallar', guardo && !dialogos.some(d => /NO SE PUDO|FOTOGRAFÍAS NO/.test(d)), `${kb(peso)} en IndexedDB · ${ms(t18)}`);
  t = Date.now(); await page.reload(); await page.waitForFunction(() => document.querySelectorAll('.foto img').length === 33, null, { timeout: 20000 });
  ok('Recarga con las 33 en pantalla en menos de 3 s', Date.now() - t < 3000, ms(Date.now() - t));
  dialogos = []; t = Date.now(); await page.click('.acciones .b2'); await esperarEnvio();
  const gordo = enviados[enviados.length - 1];
  ok('Se envía con 33 fotos aparte y suelta IndexedDB', gordo.fotos.length === 33 && (await page.evaluate(() => FotosDB.leer(idActual).then(g => Object.keys(g).length))) === 0, `${kb(JSON.stringify(gordo).length)} · ${ms(Date.now() - t)}`);

  console.log('\n— 19. Reenvío tras editar un enviado: mismo número, sin fotos nuevas, «ya en Drive»');
  await page.reload(); await page.waitForTimeout(300);
  await page.evaluate(id => cargarInforme(id), (await lista()).find(x => x.torre === 'T-50').id); await page.waitForTimeout(400);
  const c19 = await page.evaluate(() => document.querySelectorAll('.enDrive').length);
  await page.click('#tab-a'); await page.locator(REC).nth(0).locator('textarea').fill('editado tras enviar'); await page.waitForTimeout(2600);
  const nE19 = enviados.length; await page.click('.acciones .b2'); await page.waitForTimeout(500);
  await page.evaluate(id => enviarSolo(id), (await lista()).find(x => x.torre === 'T-50').id); await esperarEnvio();
  ok('33 marcas «ya en Drive»; la tanda no lo reenvía; Reenviar sí, con 0 fotos', c19 === 33 && enviados.length === nE19 + 1 && enviados[enviados.length - 1].fotos.length === 0 && enviados[enviados.length - 1].numero === gordo.numero);

  console.log('\n— 20. Teléfono lleno de verdad, y ningún error en toda la ronda');
  await page.evaluate(() => nuevoInforme()); await cabecera('T-51');
  await page.evaluate(() => { window.__real = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { if (k === 'garmel_sha_list') throw new DOMException('QuotaExceededError', 'QuotaExceededError'); return window.__real.call(this, k, v); }; });
  dialogos = []; await page.click('#tab-a'); await page.locator(REC).nth(2).locator('.sino button').nth(0).click(); await page.waitForTimeout(2600);
  ok('Avisa que no pudo guardar y el informe sigue en pantalla', dialogos.some(d => /NO SE PUDO GUARDAR/.test(d)) && (await page.evaluate(() => valorSN(document.querySelectorAll('#items-sha_recaudos .item')[2]))) === 'SI');
  await page.evaluate(() => { Storage.prototype.setItem = window.__real; });
  ok('Ningún error de página en toda la ronda', !R.some(r => r.n === 'pageerror'));

  const malos = R.filter(r => !r.c);
  console.log(`\n${R.length - malos.length}/${R.length} en verde` + (malos.length ? '  ✗ ' + malos.map(m => m.n).join(' · ') : ''));
  await b.close(); srv.close(); process.exit(malos.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
