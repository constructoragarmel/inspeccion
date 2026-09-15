// Contra el sitio publicado y el relevo real: elegir T-12 (Convenio Rusos) en un teléfono limpio
// debe traer el informe de Hernán del 14-sep desde Drive, sin que este teléfono lo tenga.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const page = await (await b.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, serviceWorkers: 'allow' })).newPage();
  const URL = 'https://constructoragarmel.github.io/inspeccion/servicios.html';   // sin ?prueba: el historial real no es de prueba
  await page.goto(URL); await page.waitForTimeout(1500);
  await page.evaluate(k => { localStorage.clear(); localStorage.setItem('garmel_clave_envio', k); }, process.env.GARMEL_CLAVE);
  await page.goto(URL); await page.waitForTimeout(1200);
  console.log('pie:', (await page.textContent('#pie')).trim());
  const t0 = Date.now();
  await page.selectOption('#torre', 'T-12'); await page.selectOption('#convenio', 'Convenio Rusos');
  await page.waitForFunction(() => document.querySelector('#aviso-historial .historial'), null, { timeout: 30000 }).catch(() => {});
  const banner = ((await page.textContent('#aviso-historial')) || '').replace(/\s+/g, ' ');
  console.log('banner a los', Date.now() - t0, 'ms:', banner.slice(0, 160) || '(ninguno)');
  const mem = await page.evaluate(() => { const t = JSON.parse(localStorage.getItem('garmel_srv_torres') || '{}')['T-12']; return t && { nro: t.nro, fecha: t.fecha, residente: t.residente, items: t.general.reduce((s, g) => s + g.items.filter(i => i.sn).length, 0) }; });
  console.log('memoria de T-12 en este teléfono (venida del relevo):', JSON.stringify(mem));
  await b.close();
})();
