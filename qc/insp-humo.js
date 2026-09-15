const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const RAIZ = require('path').join(__dirname, '..');
const srv = http.createServer((req, r) => { let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/index.html'; const f = path.join(RAIZ, p); if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': f.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream' }); r.end(fs.readFileSync(f)); }).listen(8769);
(async () => {
  const b = await chromium.launch(); const page = await (await b.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true })).newPage();
  const errores = []; page.on('pageerror', e => errores.push(e.message)); page.on('dialog', d => d.accept());
  await page.goto('http://localhost:8769/inspeccion.html?prueba=1'); await page.waitForTimeout(1500);
  const r = await page.evaluate(() => ({ n: (typeof INSPECTORES_DB !== 'undefined') ? INSPECTORES_DB.length : -1, victor: INSPECTORES_DB.includes('Víctor Mendoza (CIV-NC)'), hernan: INSPECTORES_DB.find(x => x.startsWith('Hernán')), pie: (document.body.textContent.match(/v\d+/) || [''])[0] }));
  const opciones = await page.evaluate(() => { const s = [...document.querySelectorAll('select')].find(s => [...s.options].some(o => /Skarlet/.test(o.textContent))); return s ? s.options.length : -1; });
  console.log(JSON.stringify(r), 'opciones en el desplegable:', opciones, 'errores:', errores.length ? errores : 'ninguno');
  await b.close(); srv.close();
})();
