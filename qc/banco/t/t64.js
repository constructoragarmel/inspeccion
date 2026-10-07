// TANDA 64 · V131 (6-oct-2026): lo que pidió la Coordinación de inspección de Simón Bolívar (PA-121). En inspeccion.html.
// 1 las filas de cinco estados traen la casilla de %; las de Sí/No, no · 2 escribir 60 da 60 % con el mismo dato (100/60)
// 3 tocar un botón pone su número en la casilla · 4 vaciar la casilla deja la fila sin marcar · 5 150 se recorta a 100
// 6 el rótulo dice «Sector» y las opciones nombran los sectores · 7 en torre, la ayuda de «Cerámica en paredes» no habla de la cocina
// 8 en apartamento sí, y el cuerpo marca el ámbito · 9 _rutaDrive dice sector › Torres › torre › Informe · 10 la casilla no sale al imprimir
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc');
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const put = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
const ridDe = cod => { for (const h of PARTIDAS) { const i = (CODIGOS_SUB[h.id] || []).indexOf(cod); if (i >= 0) return h.id + '_' + i; } return null; };
const pct = rid => (document.getElementById('pct_' + rid)?.innerText || '').trim();
const ep = rid => document.getElementById('ep_' + rid), ej = rid => document.getElementById('ej_' + rid), pr = rid => document.getElementById('pr_' + rid);
Q.aceptar = true; nuevoFormulario(); await esperar(300); setAmbito('apartamento'); await esperar(200);
sel('fecha', '2026-10-06'); sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-01'); sel('piso', 'Piso 02'); put('apto', 'A1'); await esperar(300);
const F = ridDe('4.01'), P = ridDe('11.01');   // Frisos: cinco estados · Presión de agua: Sí / No
ok('1 · Las filas de cinco estados traen la casilla de %; las de Sí / No, no', !!ep(F) && !ep(P) && ep(F).getAttribute('inputmode') === 'numeric', 'frisos ' + !!ep(F) + ' · presión ' + !!ep(P));
ep(F).value = '60'; ep(F).dispatchEvent(new Event('input', { bubbles: true })); await esperar(50);
ok('2 · Escribir 60 da 60 % y guarda el mismo dato que los botones: 100 proyectada, 60 ejecutada', pct(F) === '60%' && pr(F).value === '100' && ej(F).value === '60', pct(F) + ' · pr ' + pr(F).value + ' · ej ' + ej(F).value);
const sinBoton = ![...document.querySelectorAll(`.est-btn[data-rid="${F}"]`)].some(b => b.classList.contains('on'));
ok('2b · Con 60 ningún botón queda encendido', sinBoton, '');
document.querySelector(`.est-btn[data-rid="${F}"][data-v="50"]`).click(); await esperar(50);
ok('3 · Tocar «50 %» pone 50 en la casilla y 50 % en la fila', ep(F).value === '50' && pct(F) === '50%', ep(F).value + ' · ' + pct(F));
ep(F).value = ''; ep(F).dispatchEvent(new Event('input', { bubbles: true })); await esperar(50);
ok('4 · Vaciar la casilla deja la fila sin marcar: ni dato ni botón', pr(F).value === '' && ej(F).value === '' && pct(F) !== '0%' && ![...document.querySelectorAll(`.est-btn[data-rid="${F}"]`)].some(b => b.classList.contains('on')), 'pr «' + pr(F).value + '» ej «' + ej(F).value + '» pct ' + pct(F));
ep(F).value = '150'; ep(F).dispatchEvent(new Event('input', { bubbles: true })); await esperar(50);
ok('5 · 150 se recorta a 100 y enciende «100 %»', ep(F).value === '100' && ej(F).value === '100' && !!document.querySelector(`.est-btn[data-rid="${F}"][data-v="100"].on`), ep(F).value + ' · ' + ej(F).value);
const lab = document.getElementById('convenio').closest('.field').querySelector('label'), ops = [...document.getElementById('convenio').options].map(o => o.textContent);
ok('6 · El rótulo dice «Sector» y las opciones nombran los sectores, no los convenios', /^Sector/.test(lab.textContent) && ops.some(t => /Ezequiel Zamora/.test(t)) && !ops.some(t => /^Convenio/.test(t)), lab.textContent + ' · ' + ops.join(' | '));
ok('9 · _rutaDrive dice dónde queda el informe', _rutaDrive() === 'Ezequiel Zamora › Torres › T-01 › Informe', _rutaDrive());
const C = ridDe('4.04'), cajaDe = rid => document.getElementById('pct_' + rid)?.closest('tr')?.querySelector('.ayuda-sub');
const visible = el => !!el && getComputedStyle(el).display !== 'none';
const cajaC = cajaDe(C), apto = cajaC?.querySelector('.ay-apto'), torre = cajaC?.querySelector('.ay-torre');
ok('8 · En apartamento la ayuda de «Cerámica en paredes» habla de la cocina y el cuerpo no marca torre', !!apto && /cocina/.test(apto.textContent) && visible(apto) && !visible(torre) && !document.body.classList.contains('amb-torre'), (apto || {}).textContent);
setAmbito('torre'); await esperar(200);
ok('7 · En torre se ve la redacción de torre, sin cocina, y el cuerpo marca amb-torre', document.body.classList.contains('amb-torre') && visible(torre) && !visible(apto) && !/cocina/.test(torre.textContent), (torre || {}).textContent);
setAmbito('apartamento'); await esperar(100);
const reglaPrint = [...document.styleSheets].some(sh => { try { return [...sh.cssRules].some(r => r.media && /print/.test(r.media.mediaText) && [...r.cssRules].some(x => /\.solo-pantalla/.test(x.selectorText || ''))); } catch (e) { return false; } });
ok('10 · La casilla es solo de pantalla: no sale al imprimir', ep(F).classList.contains('solo-pantalla') && reglaPrint, 'regla print ' + reglaPrint);
Q.aceptar = true; nuevoFormulario(); await esperar(200);
