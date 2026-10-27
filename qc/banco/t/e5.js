// ESTRÉS 5 · v188 (27-oct-2026): QC16, el compilado con muchos apartamentos «de antes» (compilado.html?prueba=1, 375 px).
// a 60 apartamentos (30 de antes) se pintan en menos de 300 ms, en orden de piso, y dicen «30 de esta semana y 30 de antes» ·
// b un apartamento con nombre raro («<b>A1» y comillas) se escribe como texto · c una torre con TODO de antes y el informe de torre
// de antes lo dice sin inventar «esta semana» · d siete torres de una contratista, cada una con lo suyo, sin mezclar · e cabe.
const hA = [{ id: 'hito_cerramientos', numero: '2', corto: 'Tabiq.', nombre: 'Tabiquería', apto: true }, { id: 'hito_servicios', numero: '3', corto: 'Serv.', nombre: 'Servicios', apto: true }, { id: 'hito_acabados', numero: '4', corto: 'Acab.', nombre: 'Acabados', apto: true }];
const apto = (piso, a, fecha, antes) => ({ numero: 'EZ-T45-' + piso.replace('Piso ', 'P') + 'A' + a + '-' + fecha.replace(/-/g, '').slice(2) + '-YS', numeroRev: 'EZ-T45-' + a, bloque: piso + a, fecha, piso, apto: a, inspectores: ['Yenddy Sierra (CIV-307.772)'], pdf: '', pcts: { hito_cerramientos: 100, hito_servicios: 50, hito_acabados: 0 }, declarados: {}, noInsp: [], deAntes: antes });
const sesenta = []; for (let p = 1; p <= 15; p++) ['A1', 'A2', 'B1', 'B2'].forEach((a, i) => sesenta.push(apto('Piso ' + String(p).padStart(2, '0'), a, (p + i) % 2 ? '2026-10-24' : '2026-10-10', !((p + i) % 2))));
const caja = document.createElement('div'); document.body.appendChild(caja);
const t0 = performance.now(); caja.innerHTML = htmlMatriz({ torre: 'T-45', apartamentos: sesenta }, hA); const ms = performance.now() - t0;
const filas = [...caja.querySelectorAll('table tr')].filter(tr => tr.querySelector('td b'));
const pisos = [...caja.querySelectorAll('td.piso')].map(t => t.innerText.trim());
ok('QC16a · 60 apartamentos (30 de antes) en menos de 300 ms, por piso, con la cuenta', ms < 300 && filas.length === 60 && filas.filter(tr => tr.classList.contains('de-antes')).length === 30 && /30 de esta semana y 30 de antes/.test(caja.innerText) && pisos[0] === 'Piso 01' && pisos.length === 15, Math.round(ms) + ' ms · ' + filas.length + ' · ' + pisos.slice(0, 2).join(','));
caja.innerHTML = htmlMatriz({ apartamentos: [Object.assign(apto('Piso 01', '<b>A1"', '2026-10-24', true), {})] }, hA);
ok('QC16b · Un nombre raro se escribe como texto, no como HTML', !caja.querySelector('table b b') && /<b>A1"/.test(caja.innerText), caja.innerText.slice(0, 80));
caja.innerHTML = htmlAreas({ numeroRev: 'EZ-T45-261010-YS', fecha: '2026-10-10', inspectores: ['Yenddy Sierra'], version: 'Preliminar (campo)', pcts: {}, noInsp: [], declarados: {}, deAntes: true }, []) + htmlMatriz({ apartamentos: sesenta.filter(a => a.deAntes) }, hA);
ok('QC16c · Todo de antes: «0 de esta semana y 30 de antes» y el informe de torre lo dice', /0 de esta semana y 30 de antes/.test(caja.innerText) && /De antes · sin informe de torre esta semana/.test(caja.innerText));
let html = ''; for (let t = 45; t <= 51; t++) html += '<section id="t' + t + '">' + htmlMatriz({ torre: 'T-' + t, apartamentos: sesenta.slice(0, t - 40).map(a => Object.assign({}, a, { numeroRev: 'EZ-T' + t + '-' + a.apto })) }, hA) + '</section>';
caja.innerHTML = html;
const ok7 = [45, 46, 47, 48, 49, 50, 51].every(t => caja.querySelector('#t' + t).querySelectorAll('tr td b').length === t - 40 && [...caja.querySelector('#t' + t).querySelectorAll('a, td')].every(x => !/EZ-T(4[5-9]|5[01])-/.test(x.textContent) || x.textContent.indexOf('EZ-T' + t + '-') >= 0));
ok('QC16d · Siete torres de una contratista, cada una con sus apartamentos, sin mezclar', ok7);
caja.innerHTML = htmlMatriz({ torre: 'T-45', apartamentos: sesenta }, hA);
ok('QC16e · Cabe a 375 px: la matriz se desliza dentro de su caja', document.documentElement.scrollWidth <= innerWidth + 1, document.documentElement.scrollWidth + ' > ' + innerWidth);
caja.remove();
