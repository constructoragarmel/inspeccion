// QC del formulario de servicios (v64) a 375×812 contra un relevo falso.
// Uso: node qc-servicios.js  (sirve ~/Projects/Personal/inspeccion por http)
const { chromium, devices } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const RAIZ = require('path').join(__dirname, '..');
const PUERTO = 8765;

function servir() {
  return new Promise(res => {
    const s = http.createServer((req, r) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p === '/') p = '/index.html';
      const f = path.join(RAIZ, p);
      if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); }
      const ext = path.extname(f);
      const tipo = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png' }[ext] || 'application/octet-stream';
      r.writeHead(200, { 'Content-Type': tipo, 'Cache-Control': 'no-store' });
      r.end(fs.readFileSync(f));
    });
    s.listen(PUERTO, () => res(s));
  });
}

const resultados = [];
function ok(nombre, cond, detalle) {
  resultados.push({ nombre, ok: !!cond, detalle });
  console.log((cond ? '  ✅ ' : '  ❌ ') + nombre + (detalle ? '  — ' + detalle : ''));
}

(async () => {
  const srv = await servir();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, locale: 'es-VE' });
  const page = await ctx.newPage();
  const enviados = [], consultas = [];
  // Relevo falso: acepta todo y guarda el sobre
  let historialRelevo = null;   // lo que el relevo falso contesta a «último informe de la torre»
  await page.route(/script\.google\.com/, async route => {
    const body = route.request().postData();
    if (body && JSON.parse(body).accion === 'historial'){ const q = JSON.parse(body); consultas.push(q); return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, informe: (historialRelevo && historialRelevo.torre === q.torre) ? historialRelevo : null }) }); }
    if (body) enviados.push(JSON.parse(body));
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, version: 'falso' }) });
  });
  page.on('dialog', async d => { dialogos.push(d.message()); await d.accept(); });
  let dialogos = [];
  const URL = `http://localhost:${PUERTO}/servicios.html?prueba=1`;
  await page.goto(URL);
  await page.evaluate(() => { localStorage.clear(); localStorage.setItem('garmel_clave_envio', 'CLAVE-QC'); });
  await page.goto(URL);

  const lista = () => page.evaluate(() => JSON.parse(localStorage.getItem('garmel_srv_list') || '[]'));
  const memoria = () => page.evaluate(() => JSON.parse(localStorage.getItem('garmel_srv_items') || '{}'));
  const torres = () => page.evaluate(() => JSON.parse(localStorage.getItem('garmel_srv_torres') || '{}'));

  console.log('\n— 1. Contenido: nombres y filas con texto');
  const nombres = await page.evaluate(() => Object.fromEntries(GENERAL.map(g => [g.id, g.items])));
  ok('CANTV: renombrado y fibra en su sitio', nombres.srv_cantv[1] === 'Construcción de Canalizaciones Exteriores' && nombres.srv_cantv[2] === 'Colocación de Fibra desde Tanquilla a Módulo' && nombres.srv_cantv.length === 7, nombres.srv_cantv.join(' | '));
  ok('Aguas servidas: los 4 de Hernán', nombres.srv_aguas_servidas.length === 4 && nombres.srv_aguas_servidas[0] === 'Ubicación de Boca de Visita');
  const sinNombre = await page.evaluate(() => [...document.querySelectorAll('.item[data-fijo="1"]')].filter(i => !i.querySelector('.nombre').textContent.trim()).length);
  ok('Ninguna fila fija sin nombre (lección 11)', sinNombre === 0, sinNombre + ' sin nombre');
  const vacios = await page.evaluate(() => [...document.querySelectorAll('.vacio')].filter(v => v.textContent.includes('todavía no tiene')).length);
  ok('Solo 2 servicios avisan que no tienen lista', vacios === 2, vacios);

  console.log('\n— 2. Cabecera: residente, empresa y obs general se guardan solos');
  await page.selectOption('#torre', 'T-05');
  await page.waitForTimeout(100);
  const resAuto = await page.inputValue('#residente');
  await page.fill('#residente', 'ING. PRUEBA RESIDENTE');
  await page.fill('#empresa', 'EMPRESA EDITADA');
  await page.fill('#obs_general', 'Obs general escrita');
  await page.waitForTimeout(2600);
  let l = await lista();
  ok('Residente editado quedó guardado a los 2 s', l.length === 1 && l[0].residente === 'ING. PRUEBA RESIDENTE', JSON.stringify(l[0] && l[0].residente) + ' (maestro decía: ' + resAuto + ')');
  ok('Empresa y obs general también', l[0] && l[0].empresa === 'EMPRESA EDITADA' && l[0].obs_general === 'Obs general escrita');
  // último cambio: solo residente, y salir de la app
  await page.fill('#residente', 'ING. SEGUNDO CAMBIO');
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
  l = await lista();
  ok('Al irse a otra app se guarda en el acto', l[0].residente === 'ING. SEGUNDO CAMBIO', l[0].residente);
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { value: false, configurable: true }); });

  console.log('\n— 3. Al reabrir, vuelve el informe que estaba en pantalla');
  await page.selectOption('#estatus', 'En progreso');
  await page.selectOption('#inspectores select', { index: 1 });
  // contestar dos de aguas servidas y una de CANTV
  await page.click('#srv-srv_aguas_servidas .abrir');
  const itemsAS = page.locator('#items-srv_aguas_servidas .item');
  await itemsAS.nth(0).locator('.sino button').nth(0).click();
  await itemsAS.nth(1).locator('.sino button').nth(1).click();
  await page.click('#srv-srv_cantv .abrir');
  await page.locator('#items-srv_cantv .item').nth(1).locator('.sino button').nth(0).click();
  await page.locator('#items-srv_cantv .item').nth(1).locator('textarea').fill('canalizaciones listas');
  await page.waitForTimeout(2600);
  const idAntes = await page.evaluate(() => idActual);
  await page.reload();
  await page.waitForTimeout(300);
  const idDespues = await page.evaluate(() => idActual);
  const torreDespues = await page.inputValue('#torre');
  const resDespues = await page.inputValue('#residente');
  ok('Mismo informe en pantalla tras recargar', idAntes && idAntes === idDespues && torreDespues === 'T-05' && resDespues === 'ING. SEGUNDO CAMBIO', `${idAntes} → ${idDespues}, ${torreDespues}, ${resDespues}`);
  const cuentaAS = await page.textContent('#cuenta-srv_aguas_servidas');
  ok('Cuenta de aguas servidas 2/4 tras recargar', cuentaAS.includes('2/4'), cuentaAS);
  const abiertos = await page.evaluate(() => ['srv_aguas_servidas', 'srv_cantv', 'srv_gas'].map(s => !document.querySelector('#srv-' + s + ' .cuerpo').hidden));
  ok('Se abren los servicios con contenido, gas sigue plegado', abiertos[0] && abiertos[1] && !abiertos[2], abiertos.join(','));

  console.log('\n— 4. Ítems agregados: se recuerdan, se escribe en el acto, vacíos no viajan');
  await page.click('#srv-srv_incendio .abrir');
  await page.click('#srv-srv_incendio .btn-add');
  const enfocado = await page.evaluate(() => document.activeElement && document.activeElement.classList.contains('nombre-libre'));
  ok('Al agregar, el teclado va al nombre', enfocado);
  await page.keyboard.type('Gabinete de mangueras');
  await page.locator('#items-srv_incendio .item').last().locator('.sino button').nth(0).click();
  await page.click('#srv-srv_incendio .btn-add');   // uno de más, sin nombre ni respuesta
  await page.click('#srv-srv_incendio .btn-add');   // uno con nombre y sin respuesta
  await page.keyboard.type('Rociadores');
  await page.waitForTimeout(2600);
  let m = await memoria();
  ok('La memoria aprendió los dos con nombre', (m.srv_incendio || []).join('|') === 'Gabinete de mangueras|Rociadores', JSON.stringify(m.srv_incendio));
  l = await lista();
  const inc = l[0].general.find(g => g.id === 'srv_incendio');
  ok('En el informe viaja solo el agregado contestado', inc.items.length === 1 && inc.items[0].nombre === 'Gabinete de mangueras' && inc.items[0].agregado, JSON.stringify(inc.items));
  const cuentaInc = await page.textContent('#cuenta-srv_incendio');
  ok('La cuenta de incendio dice 1/3', cuentaInc.includes('1/3'), cuentaInc);

  console.log('\n— 5. Enviar: el sobre lleva lo de hoy, sin heredados');
  await page.click('.acciones .b2');
  await page.waitForTimeout(1500);
  ok('Un sobre enviado al relevo falso', enviados.length === 1, enviados.length);
  const sobre = enviados[0];
  const asEnviado = sobre.datos.general.find(g => g.id === 'srv_aguas_servidas');
  ok('Aguas servidas viaja con los 4 fijos, 2 contestados', asEnviado.items.length === 4 && asEnviado.items.filter(i => i.sn).length === 2);
  ok('Todo lo enviado es de hoy (heredado vacío)', sobre.datos.general.every(g => g.items.every(i => !i.heredado)));
  ok('Residente viaja como lista', JSON.stringify(sobre.datos.residentes) === '["ING. SEGUNDO CAMBIO"]');
  let t = await torres();
  ok('Quedó el estado de T-05 en el teléfono', t['T-05'] && t['T-05'].nro.startsWith('PRUEBA-SRV-') && t['T-05'].general.find(g => g.id === 'srv_incendio').items.length === 1, t['T-05'] && t['T-05'].nro);

  console.log('\n— 6. Tras enviar y recargar, abre en blanco');
  await page.reload(); await page.waitForTimeout(300);
  ok('Sin informe en pantalla', (await page.inputValue('#torre')) === '' && (await page.evaluate(() => idActual)) === null);
  const recordadoPintado = await page.evaluate(() => [...document.querySelectorAll('#items-srv_incendio .item[data-fijo="0"] .nombre-libre')].map(i => i.value));
  ok('Incendio abre con los 2 recordados del teléfono', recordadoPintado.join('|') === 'Gabinete de mangueras|Rociadores', recordadoPintado.join('|'));

  console.log('\n— 7. Historial por torre: se ofrece, se trae, se marca, se toca');
  await page.selectOption('#torre', 'T-05');
  await page.waitForTimeout(200);
  const hist = await page.locator('#aviso-historial .historial').count();
  ok('Aparece la propuesta de traer lo anterior', hist === 1);
  const textoHist = await page.textContent('#aviso-historial');
  ok('La propuesta dice informe, fecha y cuántos', /PRUEBA-SRV-.*T05.*4 ítem/.test(textoHist.replace(/\s+/g, ' ')), textoHist.replace(/\s+/g, ' ').slice(0, 140));
  await page.click('#aviso-historial .si');
  await page.waitForTimeout(200);
  const her = await page.evaluate(() => document.querySelectorAll('.item.heredado').length);
  ok('3 ítems heredados marcados (2 aguas servidas + 1 CANTV; incendio también)', her === 4, her);
  const cuentaHer = await page.textContent('#cuenta-srv_aguas_servidas');
  ok('Cabecera: 2/4 · 2 sin revisar', cuentaHer.includes('2/4') && cuentaHer.includes('2 sin revisar'), cuentaHer);
  const etiquetaVisible = await page.evaluate(() => { const e = document.querySelector('#items-srv_aguas_servidas .item.heredado .etq-her'); return e && getComputedStyle(e).display !== 'none'; });
  ok('La etiqueta «visita anterior» se ve', etiquetaVisible);
  const estatusHer = await page.inputValue('#estatus');
  ok('Estatus se hereda', estatusHer === 'En progreso', estatusHer);
  // tocar uno: cambia a NO
  await itemsAS.nth(0).locator('.sino button').nth(1).click();
  const cuentaTocada = await page.textContent('#cuenta-srv_aguas_servidas');
  ok('Al tocar uno, baja a 1 sin revisar', cuentaTocada.includes('1 sin revisar'), cuentaTocada);
  await page.waitForTimeout(2600);
  l = await lista();
  const nuevo = l.find(x => !x.enviado);
  const asNuevo = nuevo.general.find(g => g.id === 'srv_aguas_servidas');
  ok('Guardado: el tocado sin heredado, el otro con el nro de origen', asNuevo.items[0].heredado === '' && asNuevo.items[0].sn === 'NO' && asNuevo.items[1].heredado.startsWith('PRUEBA-SRV-'), JSON.stringify(asNuevo.items.slice(0, 2)));
  ok('Es un informe distinto del anterior (id nuevo)', nuevo.id !== sobre.datos.id, nuevo.id + ' vs ' + sobre.datos.id);
  // recargar y ver que las marcas vuelven
  await page.reload(); await page.waitForTimeout(300);
  const herTras = await page.evaluate(() => document.querySelectorAll('.item.heredado').length);
  ok('Las marcas de herencia sobreviven a recargar', herTras === 3, herTras);
  // Sin historial cuando el formulario ya tiene contenido
  await page.selectOption('#torre', 'T-05');
  await page.waitForTimeout(200);
  ok('No se vuelve a ofrecer si el formulario ya tiene contenido', (await page.locator('#aviso-historial .historial').count()) === 0);

  console.log('\n— 8. Quitar un recordado: solo aquí / también de los próximos');
  await page.evaluate(() => plegar('srv_incendio', true));
  dialogos = [];
  page.removeAllListeners('dialog');
  page.on('dialog', async d => { dialogos.push(d.message()); await d.dismiss(); });   // Cancelar: solo de este informe
  await page.locator('#items-srv_incendio .item[data-fijo="0"]').last().locator('.quitar-item').click();
  await page.waitForTimeout(100);
  m = await memoria();
  ok('Cancelar: se quita del informe, la memoria lo conserva', (m.srv_incendio || []).includes('Rociadores') && (await page.locator('#items-srv_incendio .item[data-fijo="0"]').count()) === 1, JSON.stringify(m.srv_incendio));
  ok('El diálogo explica las dos salidas', /ACEPTAR/.test(dialogos[0]) && /CANCELAR/.test(dialogos[0]), dialogos[0]);
  page.removeAllListeners('dialog');
  page.on('dialog', async d => { dialogos.push(d.message()); await d.accept(); });
  await page.locator('#items-srv_incendio .item[data-fijo="0"]').last().locator('.quitar-item').click();
  await page.waitForTimeout(100);
  m = await memoria();
  ok('Aceptar: se olvida para los próximos', !(m.srv_incendio || []).includes('Gabinete de mangueras'), JSON.stringify(m.srv_incendio));

  console.log('\n— 9. Un informe viejo con nombres viejos abre bien');
  const viejo = {
    id: 'srv_viejo', tipo: 'servicios', nro: 'PRUEBA-SRV-EZ-T03-260914-HE', torre: 'T-03', convenio: 'Convenio Bielorrusos',
    empresa: 'X', residente: 'Harry Arteaga', fecha: '2026-09-14', estatus: '', inspectores: ['Hernán Escobar (CIV-NC)'],
    obs_general: '', noInspeccionados: [],
    general: [
      { id: 'srv_cantv', nombre: '2. SERVICIOS DE CANTV', items: [{ nombre: 'Conexiones Exteriores', agregado: false, sn: 'SI', obs: 'canal. existentes' }], obs: '', fotos: [] },
      { id: 'srv_aguas_servidas', nombre: '5. AGUAS SERVIDAS', items: [
        { nombre: 'Ubicación de boca de visita', agregado: true, sn: 'SI', obs: '' },
        { nombre: 'Construcción de tanquilla de descarga', agregado: true, sn: 'SI', obs: '' },
        { nombre: 'Conexión a tanquilla de descarga', agregado: true, sn: 'NO', obs: '' },
        { nombre: 'Colocación de bajantes de descarga', agregado: true, sn: 'SI', obs: '' },
        { nombre: '', agregado: true, sn: '', obs: '' }], obs: '', fotos: [] }
    ], apartamentos: [], guardado: '2026-09-14T19:21:20.471Z'
  };
  await page.evaluate(v => { const l = JSON.parse(localStorage.getItem('garmel_srv_list') || '[]'); l.push(v); localStorage.setItem('garmel_srv_list', JSON.stringify(l)); }, viejo);
  await page.evaluate(() => cargarInforme('srv_viejo'));
  await page.waitForTimeout(200);
  const cantvViejo = await page.evaluate(() => { const it = [...document.querySelectorAll('#items-srv_cantv .item')]; return it.map(i => (i.dataset.fijo === '1' ? i.querySelector('.nombre').textContent : i.querySelector('.nombre-libre').value) + ':' + valorSN(i)); });
  ok('«Conexiones Exteriores» cayó en «Construcción de Canalizaciones Exteriores»', cantvViejo[1] === 'Construcción de Canalizaciones Exteriores:SI' && cantvViejo.length === 7, cantvViejo.join(' | '));
  const asViejo = await page.evaluate(() => { const it = [...document.querySelectorAll('#items-srv_aguas_servidas .item')]; return it.map(i => i.dataset.fijo + ':' + valorSN(i)); });
  ok('Los 4 agregados en minúscula cayeron en los 4 fijos, sin duplicar ni fila vacía', asViejo.join('|') === '1:SI|1:SI|1:NO|1:SI', asViejo.join('|'));
  await page.waitForTimeout(2600);
  l = await lista();
  const asGuardado = l.find(x => x.id === 'srv_viejo').general.find(g => g.id === 'srv_aguas_servidas');
  ok('Al reguardarlo, viaja con nombres nuevos y como fijos', asGuardado.items.every(i => !i.agregado) && asGuardado.items[0].nombre === 'Ubicación de Boca de Visita', JSON.stringify(asGuardado.items.map(i => i.nombre)));

  console.log('\n— 10. Apartamentos heredados');
  await page.evaluate(() => nuevoInforme());
  await page.waitForTimeout(100);
  await page.selectOption('#torre', 'T-09');
  await page.selectOption('#estatus', 'Iniciada');
  await page.selectOption('#inspectores select', { index: 1 });
  await page.click('#tab-b');
  await page.click('#panel-b .btn-add');
  await page.locator('.fila-apto .piso').selectOption('P03');
  await page.locator('.fila-apto .apto').fill('3-A');
  await page.locator('.fila-apto [data-campo="apto_electrico__Tomacorrientes"]').fill('12');
  await page.locator('.fila-apto [data-campo="apto_electrico__Energizado"] button').nth(0).click();
  await page.waitForTimeout(2600);
  await page.evaluate(() => siguienteTorre());
  await page.waitForTimeout(200);
  await page.selectOption('#torre', 'T-09');
  await page.waitForTimeout(200);
  const textoHist9 = (await page.textContent('#aviso-historial')).replace(/\s+/g, ' ');
  ok('La propuesta cuenta el apto', /1 apto/.test(textoHist9), textoHist9.slice(0, 120));
  await page.click('#aviso-historial .si');
  await page.waitForTimeout(200);
  const filaHer = await page.evaluate(() => { const f = document.querySelector('#filas-apto .fila-apto'); return f && f.classList.contains('heredado') && f.querySelector('.apto').value === '3-A' && f.querySelector('[data-campo="apto_electrico__Tomacorrientes"]').value === '12'; });
  ok('El apto 3-A vuelve con sus datos y marcado', filaHer);
  await page.click('#tab-b');
  await page.locator('.fila-apto [data-campo="apto_electrico__Interruptores"]').fill('6');
  const filaTocada = await page.evaluate(() => !document.querySelector('#filas-apto .fila-apto').classList.contains('heredado'));
  ok('Al escribir en el apto, deja de ser heredado', filaTocada);

  console.log('\n— 12. Confirmar un heredado y heredar el convenio (T-12, dos convenios)');
  await page.evaluate(() => nuevoInforme()); await page.waitForTimeout(100);
  await page.selectOption('#torre', 'T-12'); await page.selectOption('#convenio', { index: 1 });
  const convElegido = await page.inputValue('#convenio');
  await page.selectOption('#inspectores select', { index: 1 });
  await page.click('#tab-a'); await page.click('#srv-srv_gas .abrir');
  await page.locator('#items-srv_gas .item').nth(0).locator('.sino button').nth(0).click();
  await page.waitForTimeout(2600);
  await page.evaluate(() => siguienteTorre()); await page.waitForTimeout(200);
  await page.selectOption('#torre', 'T-12'); await page.waitForTimeout(200);
  ok('Propuesta visible en pantalla en una torre de dos convenios', await page.evaluate(() => { const r = document.querySelector('#aviso-historial .historial').getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; }));
  await page.click('#aviso-historial .si'); await page.waitForTimeout(200);
  ok('El convenio anterior se eligió solo y trajo la empresa', (await page.inputValue('#convenio')) === convElegido && (await page.inputValue('#empresa')) !== '', (await page.inputValue('#convenio')) + ' / ' + (await page.inputValue('#empresa')));
  const gas0 = page.locator('#items-srv_gas .item').nth(0);
  await gas0.locator('.sino button').nth(0).click();   // mismo valor: confirma
  const confirmado = await gas0.evaluate(el => valorSN(el) + ':' + el.classList.contains('heredado'));
  ok('Tocar el SÍ heredado lo confirma (sigue SÍ, ya no heredado)', confirmado === 'SI:false', confirmado);
  await gas0.locator('.sino button').nth(0).click();   // ahora sí deselecciona
  ok('Un segundo toque, ya de hoy, deselecciona como siempre', (await gas0.evaluate(el => valorSN(el))) === '');

  console.log('\n— 13. Residente escrito a mano se hereda en torres sin residente en el maestro');
  await page.evaluate(() => nuevoInforme()); await page.waitForTimeout(100);
  await page.selectOption('#torre', 'T-46');
  ok('T-46 abre sin residente (maestro vacío)', (await page.inputValue('#residente')) === '');
  await page.fill('#residente', 'ING. ESCRITO A MANO');
  await page.selectOption('#estatus', 'Iniciada'); await page.selectOption('#inspectores select', { index: 1 });
  await page.click('#tab-a'); await page.evaluate(() => plegar('srv_agua', true));
  await page.locator('#items-srv_agua .item').nth(0).locator('.sino button').nth(0).click();
  await page.waitForTimeout(2600);
  await page.evaluate(() => siguienteTorre()); await page.waitForTimeout(150);
  await page.selectOption('#torre', 'T-46'); await page.waitForTimeout(150);
  await page.click('#aviso-historial .si'); await page.waitForTimeout(150);
  ok('Vuelve el residente escrito la vez anterior', (await page.inputValue('#residente')) === 'ING. ESCRITO A MANO', await page.inputValue('#residente'));
  await page.selectOption('#torre', 'T-05'); await page.waitForTimeout(150);
  ok('En T-05, el maestro manda y no lo pisa el historial', (await page.inputValue('#residente')) === 'ING. ANTONIO CUICAS', await page.inputValue('#residente'));

  console.log('\n— 14. El historial llega del relevo cuando el teléfono no lo tiene (Hernán y Oriana se alternan)');
  await page.evaluate(() => nuevoInforme()); await page.waitForTimeout(100);
  historialRelevo = { id: 'srv_otro_telefono', nro: 'PRUEBA-SRV-SR-T38-260913-OP', torre: 'T-38', convenio: 'Convenio Rusos', empresa: 'CONSTRUCTORA 5010, C.A.', residentes: ['ING. JOSE MARTINEZ'], fecha: '2026-09-13', estatus: ['En progreso'], inspectores: ['Oriana Plaza (CIV en trámite)'], obs_general: '', noInspeccionados: ['srv_gas'],
    general: [{ id: 'srv_agua', nombre: '3. AGUA POTABLE', items: [{ nombre: 'Conexiones Exteriores', agregado: false, sn: 'SI', obs: 'desde el teléfono de Oriana', heredado: '' }], obs: '', fotos: [] }], apartamentos: [{ apto: '1-A', piso: 'P01', campos: { 'apto_agua__Instalados': 'SI' }, heredado: '', fotos: [] }], guardado: '2026-09-13T15:00:00.000Z' };
  await page.selectOption('#torre', 'T-38'); await page.waitForTimeout(600);
  const b38 = (await page.textContent('#aviso-historial')).replace(/\s+/g, ' ');
  ok('T-38 sin memoria local: el relevo contesta y aparece la propuesta con el informe de Oriana', /T38-260913-OP/.test(b38) && consultas.some(q => q.torre === 'T-38' && q.sector === 'SR' && q.tipo === 'servicios'), b38.slice(0, 100));
  await page.click('#aviso-historial .si'); await page.waitForTimeout(200);
  const traido = await page.evaluate(() => ({ obs: [...document.querySelectorAll('#items-srv_agua .item')][0].querySelector('textarea').value, gasNI: document.getElementById('srv-srv_gas').classList.contains('no-inspeccionado'), aptos: document.querySelectorAll('.fila-apto').length, her: document.querySelector('.item.heredado').dataset.heredado }));
  ok('Lo de Oriana entra heredado: observación, gas no inspeccionado, 1 apto', traido.obs === 'desde el teléfono de Oriana' && traido.gasNI && traido.aptos === 1 && traido.her === 'PRUEBA-SRV-SR-T38-260913-OP', JSON.stringify(traido));
  // el teléfono tiene algo más nuevo que el relevo: manda el teléfono
  await page.evaluate(() => nuevoInforme()); await page.waitForTimeout(100);
  historialRelevo = Object.assign({}, historialRelevo, { torre: 'T-05', nro: 'PRUEBA-SRV-EZ-T05-260901-OP', fecha: '2026-09-01', id: 'srv_viejo_relevo' });
  const nAntes = consultas.length;
  await page.selectOption('#torre', 'T-05'); await page.waitForTimeout(600);
  const b05 = (await page.textContent('#aviso-historial')).replace(/\s+/g, ' ');
  ok('T-05: el relevo trae uno del 1-sep, el teléfono tiene el de hoy → se ofrece el de hoy', consultas.length > nAntes && /T05-2609\d\d-/.test(b05) && !/260901/.test(b05), b05.slice(0, 90));
  // un borrador en blanco con fecha de hoy no puede pisar el historial, y el relevo que contesta tarde se ofrece igual
  await page.evaluate(() => nuevoInforme()); await page.waitForTimeout(100);
  historialRelevo = Object.assign({}, historialRelevo, { torre: 'T-39', nro: 'PRUEBA-SRV-SR-T39-260913-OP', fecha: '2026-09-13', id: 'srv_relevo_t39' });
  await page.selectOption('#torre', 'T-39'); await page.waitForTimeout(3000);   // pasan los 2 s del guardado automático
  const m39 = await page.evaluate(() => (JSON.parse(localStorage.getItem('garmel_srv_torres') || '{}')['T-39'] || {}).nro);
  const b39 = (await page.textContent('#aviso-historial')).replace(/\s+/g, ' ');
  ok('El borrador vacío no se anota como estado de T-39; queda el del relevo y se ofrece', m39 === 'PRUEBA-SRV-SR-T39-260913-OP' && /T39-260913-OP/.test(b39), m39 + ' · ' + b39.slice(0, 60));
  historialRelevo = null;

  console.log('\n— 11. Tamaños a 375 px');
  const chicos = await page.evaluate(() => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    return [...document.querySelectorAll('button, input:not([type=file]), select, textarea')]
      .filter(vis).filter(e => e.getBoundingClientRect().height < 44)
      .map(e => (e.className || e.tagName) + ':' + Math.round(e.getBoundingClientRect().height));
  });
  ok('Ningún control de llenado por debajo de 44 px', chicos.length === 0, chicos.slice(0, 8).join(', '));
  const anchoDoc = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  ok('Sin scroll horizontal', anchoDoc[0] <= anchoDoc[1], anchoDoc.join(' de '));

  await page.screenshot({ path: 'captura-historial.png', fullPage: false });
  await page.click('#tab-a');
  await page.evaluate(() => document.getElementById('srv-srv_aguas_servidas').scrollIntoView());
  await page.screenshot({ path: 'captura-heredado.png' });

  const malos = resultados.filter(r => !r.ok);
  console.log(`\n${resultados.length - malos.length}/${resultados.length} en verde` + (malos.length ? '  ✗ ' + malos.map(m => m.nombre).join(' · ') : ''));
  await browser.close(); srv.close();
  process.exit(malos.length ? 1 : 0);
})();
