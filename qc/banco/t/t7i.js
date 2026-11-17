// inspección ?prueba=1: Inicio dentro de «⋯ Más»
// 17-nov-2026: desde la v142 (7-oct, t72) «🏠 Inicio» va a la vista en el encabezado (.hdr-inicio) a cualquier ancho, no dentro de
// «⋯ Más». Se prueba eso: a la vista sin tocar nada y de 44 px o más.
Q.R.push(...JSON.parse(localStorage.getItem('__qc7') || '[]'));
localStorage.setItem('garmel_rol', 'inspector');
const b = $('.hdr-inicio');
ok('inspección: botón Inicio en el encabezado (v142), no dentro de «Más»', !!b && /Inicio/.test(b.textContent) && !b.closest('#mas-acciones, .mas-acciones'), b ? b.parentElement.id + '/' + b.parentElement.className : 'sin botón');
ok('A la vista sin tocar nada, con ≥44 px', !!b && b.getBoundingClientRect().height >= 44 && b.getBoundingClientRect().right <= innerWidth + 1, b ? Math.round(b.getBoundingClientRect().height) + ' px' : '');
ok('TEST_MODE encendido por ?prueba=1', TEST_MODE);
ok('autoguardar existe', typeof autoguardar === 'function');
localStorage.setItem('__qc7', JSON.stringify(Q.R));
