// ESTRÉS 30 · entra Claribel Pozo (3-nov-2026, CIV 221.472). En inspección y urbanismo está en el padrón en orden, sale
// «Ing. Claribel Pozo» en el desplegable y sus iniciales CP no chocan con nadie; servicios y SHA siguen con su lista propia
// (Hernán y Oriana; los tres de SHA) pero ya le saben el título. El PDF (vista-previa.js = PDF.gs del relevo) pone «Ing.».
// Se corre en los cuatro formularios a 375×812.
const CP = 'Claribel Pozo (CIV-221.472)';
const propia = /servicios|sha/.test(location.pathname);
const i = INSPECTORES_DB.indexOf(CP);
if (propia) ok('P1 · Servicios y SHA no la agregan: su lista propia queda igual', i < 0 && INSPECTORES_DB.length <= 3, INSPECTORES_DB.join(' | '));
else ok('P1 · Está en el padrón, entre Christian Fricke y Cleidy Chacón (orden por nombre)', i > 0 && /^Christian Fricke/.test(INSPECTORES_DB[i - 1]) && /^Cleidy Chac/.test(INSPECTORES_DB[i + 1]), INSPECTORES_DB.slice(Math.max(0, i - 1), i + 2).join(' | '));
const ini = v => v.replace(/\s*\(CIV[^)]*\)\s*$/, '').split(/\s+/).map(x => x[0]).slice(0, 2).join('').toUpperCase();
const repetidas = INSPECTORES_DB.map(ini).filter((x, k, a) => a.indexOf(x) !== k);
ok('P2 · En el padrón no hay iniciales repetidas (las de ella son CP)', !repetidas.length && ini(CP) === 'CP', 'repetidas: ' + repetidas.join());
ok('P3 · El formulario le sabe el título: «Ing. Claribel Pozo (CIV-221.472)»', _conTitulo195(CP) === 'Ing. ' + CP, _conTitulo195(CP));
await esperar(300);
const sel = document.querySelector('select.inspector-select, #inspectores select, select[id^="insp"]');
const op = sel && [...sel.options].find(o => o.value === CP);
if (!propia) ok('P4 · En el desplegable dice «Ing. Claribel Pozo (CIV-221.472)» y guarda el valor del padrón', !!op && op.textContent.trim() === 'Ing. ' + CP, op ? op.textContent : 'sin opción');
const vp = await (await fetch('vista-previa.js', { cache: 'no-store' })).text();
const m = /var PDF_TITULO_INSPECTOR = (\{[^\n]*?\});/.exec(vp);
const tpdf = m ? JSON.parse(m[1]) : {};
ok('P5 · El PDF (misma plantilla que el relevo) también le pone «Ing.»', tpdf['Claribel Pozo'] === 'Ing.', m ? 'Claribel: ' + tpdf['Claribel Pozo'] : 'sin PDF_TITULO_INSPECTOR');
ok('P6 · Cabe a 375: el desplegable no se sale de la pantalla', !sel || sel.getBoundingClientRect().right <= innerWidth + 1, sel && sel.getBoundingClientRect().right);
