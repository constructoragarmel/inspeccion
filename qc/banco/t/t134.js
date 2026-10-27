// TANDA 134 · relevo r75 (27-oct-2026): el compilado de obra trae todos los apartamentos con su último informe y marca los «de antes».
// Pedido de Diego Orta. En compilado.html?prueba=1, con una semana armada como la devuelve el r75 (dos de la semana, dos de antes y
// el informe de torre de antes). 1 la matriz dice «2 de esta semana y 2 de antes» · 2 los de antes van en gris con «de antes» y su
// fecha · 3 los de la semana, sin marca · 4 el informe de torre de antes lo dice · 5 una semana sin nada de antes no dice «de antes»
// · 6 una torre sin ningún informe de apartamento lo dice sin hablar de «estas fechas» · 7 cabe a 375 px.
const hA = [{ id: 'hito_cerramientos', numero: '2', corto: 'Tabiq.', nombre: 'Tabiquería', apto: true }, { id: 'hito_acabados', numero: '4', corto: 'Acab.', nombre: 'Acabados', apto: true }];
const apto = (piso, a, fecha, antes) => ({ numero: 'EZ-T45-' + piso.replace('Piso ', 'P') + 'A' + a + '-' + fecha.replace(/-/g, '').slice(2) + '-YS', numeroRev: 'EZ-T45-x', bloque: piso + a, fecha: fecha,
  piso: piso, apto: a, inspectores: ['Yenddy Sierra (CIV-307.772)'], pdf: '', pcts: { hito_cerramientos: 100, hito_acabados: 40 }, declarados: {}, noInsp: [], deAntes: antes });
const w = { torre: 'T-45', apartamentos: [apto('Piso 01', 'A1', '2026-10-23', false), apto('Piso 01', 'A2', '2026-10-14', true), apto('Piso 02', 'B1', '2026-10-24', false), apto('Piso 02', 'B2', '2026-10-09', true)] };
const caja = document.createElement('div'); document.body.appendChild(caja);
caja.innerHTML = htmlMatriz(w, hA);
ok('1 · La matriz dice «2 de esta semana y 2 de antes»', /2 de esta semana y 2 de antes/.test(caja.innerText), caja.querySelector('.sub') && caja.querySelector('.sub').innerText);
const filas = [...caja.querySelectorAll('table tr')].filter(tr => tr.querySelector('td b'));
const antes = filas.filter(tr => tr.classList.contains('de-antes'));
ok('2 · Los de antes van en gris con «de antes» y su fecha', antes.length === 2 && antes.every(tr => /de antes/.test(tr.innerText)) && /14-10-2026|14-oct|2026-10-14/.test(antes[0].innerText + antes[1].innerText) && getComputedStyle(antes[0].querySelector('td')).color !== getComputedStyle(filas.find(tr => !tr.classList.contains('de-antes')).querySelector('td')).color, antes.map(tr => tr.innerText.replace(/\s+/g, ' ')).join(' | '));
ok('3 · Los de la semana van sin marca', filas.filter(tr => !tr.classList.contains('de-antes')).every(tr => !/de antes/.test(tr.innerText)) && filas.length === 4);
caja.innerHTML = htmlAreas({ numeroRev: 'EZ-T45-261021-YS', fecha: '2026-10-21', inspectores: ['Yenddy Sierra'], version: 'Preliminar (campo)', pcts: {}, noInsp: [], declarados: {}, deAntes: true }, []);
ok('4 · El informe de torre de antes lo dice', /De antes · sin informe de torre esta semana/.test(caja.innerText), caja.innerText.slice(0, 80));
caja.innerHTML = htmlMatriz({ apartamentos: w.apartamentos.filter(a => !a.deAntes) }, hA);
ok('5 · Sin nada de antes, no habla de «de antes»', /2 de esta semana\./.test(caja.innerText) && !/de antes/.test(caja.innerText), caja.querySelector('.sub').innerText);
caja.innerHTML = htmlMatriz({ apartamentos: [] }, hA);
ok('6 · Sin ningún informe de apartamento lo dice', /No hay informes de apartamento de esta torre/.test(caja.innerText), caja.innerText);
caja.innerHTML = htmlMatriz(w, hA);
ok('7 · Cabe a 375 px (la tabla se desliza dentro de su caja)', document.documentElement.scrollWidth <= innerWidth + 1, document.documentElement.scrollWidth + ' > ' + innerWidth);
caja.remove();
