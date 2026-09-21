// TANDA 10 · maqueta: 375, controles <44, scroll horizontal, cabecera; se corre en cada formulario y ancho (el ancho lo pone el navegador)
const nombre = document.title.replace(/ — GARMEL/, '') + ' @' + innerWidth + 'x' + innerHeight;
const desc = e => { const r = e.getBoundingClientRect(); return e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (e.className ? '.' + String(e.className).split(' ')[0] : '') + '=' + Math.round(r.height) + 'px «' + (e.textContent || e.placeholder || '').trim().slice(0, 18) + '»'; };
const visibles = $$('button, input:not([type=file]):not([type=hidden]), select, textarea, a.inicio').filter(e => { const r = e.getBoundingClientRect(); return r.width && r.height && !e.closest('[hidden]') && getComputedStyle(e).visibility !== 'hidden'; });
const chicos = visibles.filter(e => e.getBoundingClientRect().height < 44);
ok(nombre + ': sin scroll horizontal', document.documentElement.scrollWidth <= innerWidth, document.documentElement.scrollWidth + '/' + innerWidth);
ok(nombre + ': todo control visible ≥44 px (' + visibles.length + ' controles)', chicos.length === 0, [...new Set(chicos.map(desc))].slice(0, 8).join(' · '));
const ini = $('a.inicio, .hbtn-inicio'); const h1 = $('header h1, .hdr h1');
if (ini && h1 && ini.getBoundingClientRect().height) ok(nombre + ': «Inicio» no se solapa con el título ni sale de la pantalla', h1.getBoundingClientRect().right <= ini.getBoundingClientRect().left + 1 && ini.getBoundingClientRect().right <= innerWidth, Math.round(h1.getBoundingClientRect().right) + ' | ' + Math.round(ini.getBoundingClientRect().left) + '-' + Math.round(ini.getBoundingClientRect().right));
const fuera = $$('body *').filter(e => { const r = e.getBoundingClientRect(); return r.width && r.right > innerWidth + 1 && getComputedStyle(e).position !== 'fixed'; });
ok(nombre + ': ningún elemento se sale por la derecha', fuera.length === 0, [...new Set(fuera.map(desc))].slice(0, 5).join(' · '));
localStorage.setItem('__qc10', JSON.stringify((JSON.parse(localStorage.getItem('__qc10') || '[]')).concat(Q.R)));
