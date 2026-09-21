Q.R.push(...JSON.parse(localStorage.getItem('__qc7') || '[]'));
ok('Llegó al menú con ?prueba=1', /index\.html\?prueba=1$/.test(location.href), location.href);
const l = JSON.parse(localStorage.getItem('garmel_srv_list') || '[]');
ok('El informe de servicios se guardó antes de salir, con la respuesta', l.length === 1 && l[0].torre === 'T-05' && l[0].general.some(g => g.items.some(i => i.sn === 'SI')), l.length);
ok('El menú muestra 1 sin enviar en servicios', /1/.test(($$('.tarjeta, a, div').find(e => /Servicios públicos/.test(e.textContent) && /sin enviar|solo en este/.test(e.textContent)) || {}).textContent || ''), ($$('a').find(e => /Servicios públicos/.test(e.textContent)) || {}).textContent);
ok('Cuatro tarjetas, la de urbanismo enlaza a urbanismo.html?prueba=1', $$('a[href*=".html"]').length >= 4 && $$('a').some(e => /urbanismo\.html\?prueba=1$/.test(e.getAttribute('href'))), $$('a[href*=".html"]').map(e => e.getAttribute('href')).join(' '));
ok('Cartel de modo de prueba', /MODO DE PRUEBA/.test($('#prueba').textContent));
ok('Todas las tarjetas ≥44 px y sin scroll horizontal', $$('a[href*=".html"]').every(e => e.getBoundingClientRect().height >= 44) && document.documentElement.scrollWidth <= innerWidth);
localStorage.setItem('__qc7', JSON.stringify(Q.R));
