// ESTRÉS 38 · entra Rafael Mota (19-nov-2026, CIV 213.794). En inspección y urbanismo está en el padrón en orden, sale
// «Ing. Rafael Mota» en el desplegable y sus iniciales RM no chocan con nadie; servicios y SHA siguen con su lista propia
// (Hernán y Oriana; los tres de SHA) pero ya le saben el título. El PDF del relevo (PDF.gs) todavía no le pone «Ing.»:
// eso entra con el próximo despliegue del relevo, desde la computadora que tenga la sesión de admin@ (no se comprueba aquí).
// Se corre en los cuatro formularios a 375×812.
const RM = 'Rafael Mota (CIV-213.794)';
const propia = /servicios|sha/.test(location.pathname);
const i = INSPECTORES_DB.indexOf(RM);
if (propia) ok('P1 · Servicios y SHA no lo agregan: su lista propia queda igual', i < 0 && INSPECTORES_DB.length <= 3, INSPECTORES_DB.join(' | '));
else ok('P1 · Está en el padrón, entre Oriana Plaza y Selehidy Rivero (orden por nombre)', i > 0 && /^Oriana Plaza/.test(INSPECTORES_DB[i - 1]) && /^Selehidy Rivero/.test(INSPECTORES_DB[i + 1]), INSPECTORES_DB.slice(Math.max(0, i - 1), i + 2).join(' | '));
const ini = v => v.replace(/\s*\(CIV[^)]*\)\s*$/, '').split(/\s+/).map(x => x[0]).slice(0, 2).join('').toUpperCase();
const repetidas = INSPECTORES_DB.map(ini).filter((x, k, a) => a.indexOf(x) !== k);
ok('P2 · En el padrón no hay iniciales repetidas (las de él son RM)', !repetidas.length && ini(RM) === 'RM', 'repetidas: ' + repetidas.join());
ok('P3 · El formulario le sabe el título: «Ing. Rafael Mota (CIV-213.794)»', _conTitulo195(RM) === 'Ing. ' + RM, _conTitulo195(RM));
await esperar(300);
const sel = document.querySelector('select.inspector-select, #inspectores select, select[id^="insp"]');
const op = sel && [...sel.options].find(o => o.value === RM);
if (!propia) ok('P4 · En el desplegable dice «Ing. Rafael Mota (CIV-213.794)» y guarda el valor del padrón', !!op && op.textContent.trim() === 'Ing. ' + RM, op ? op.textContent : 'sin opción');
ok('P5 · Cabe a 375: el desplegable no se sale de la pantalla', !sel || sel.getBoundingClientRect().right <= innerWidth + 1, sel && sel.getBoundingClientRect().right);
