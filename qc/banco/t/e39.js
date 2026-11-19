// ESTRÉS 39 · entra Gehosmary Mendoza y sale Skarlet Gómez (19-nov-2026). En inspección y urbanismo Gehosmary está en el
// padrón en orden («Gehosmary A. Mendoza (CIV-NC)», entre Gabriel Jelenkovic y Génesis Cordobés), sale «Ing.» en el
// desplegable y sus iniciales GA no chocan con nadie (GM es Génesis Márquez). Skarlet ya no está en el padrón, pero el
// formulario le sigue sabiendo el título para sus informes viejos. Servicios y SHA siguen con su lista propia.
const GA = 'Gehosmary A. Mendoza (CIV-NC)', SG = 'Skarlet Gómez (CIV-317.442)';
const propia = /servicios|sha/.test(location.pathname);
const i = INSPECTORES_DB.indexOf(GA);
if (propia) ok('P1 · Servicios y SHA no la agregan: su lista propia queda igual', i < 0 && INSPECTORES_DB.length <= 3, INSPECTORES_DB.join(' | '));
else ok('P1 · Está en el padrón, entre Gabriel Jelenkovic y Génesis Cordobés', i > 0 && /^Gabriel Jelenkovic/.test(INSPECTORES_DB[i - 1]) && /^Génesis Cordob/.test(INSPECTORES_DB[i + 1]), INSPECTORES_DB.slice(Math.max(0, i - 1), i + 2).join(' | '));
ok('P2 · Skarlet Gómez ya no está en el padrón', INSPECTORES_DB.indexOf(SG) < 0 && !INSPECTORES_DB.some(v => /^Skarlet/.test(v)), INSPECTORES_DB.filter(v => /Skarlet/.test(v)).join());
const ini = v => v.replace(/\s*\(CIV[^)]*\)\s*$/, '').split(/\s+/).map(x => x[0]).slice(0, 2).join('').toUpperCase();
const repetidas = INSPECTORES_DB.map(ini).filter((x, k, a) => a.indexOf(x) !== k);
ok('P3 · Sin iniciales repetidas (las de ella son GA)', !repetidas.length && ini(GA) === 'GA', 'repetidas: ' + repetidas.join());
ok('P4 · Título: «Ing. Gehosmary A. Mendoza (CIV-NC)», y Skarlet lo conserva para lo viejo', _conTitulo195(GA) === 'Ing. ' + GA && _conTitulo195(SG) === 'Ing. ' + SG, _conTitulo195(GA) + ' / ' + _conTitulo195(SG));
await esperar(300);
const sel = document.querySelector('select.inspector-select, #inspectores select, select[id^="insp"]');
if (!propia) {
  const op = sel && [...sel.options].find(o => o.value === GA);
  ok('P5 · En el desplegable dice «Ing. Gehosmary A. Mendoza (CIV-NC)» y no sale Skarlet', !!op && op.textContent.trim() === 'Ing. ' + GA && ![...sel.options].some(o => /Skarlet/.test(o.value)), op ? op.textContent : 'sin opción');
}
ok('P6 · Cabe a 375: el desplegable no se sale de la pantalla', !sel || sel.getBoundingClientRect().right <= innerWidth + 1, sel && sel.getBoundingClientRect().right);
