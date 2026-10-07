// TANDA 72 · V142 (7-oct-2026): «🏠 Inicio» a la vista a cualquier ancho, en inspeccion.html. Pedido de Francisco: en la
// computadora el formulario de obra no tenía cómo volver al menú (servicios, SHA y urbanismo sí). Se corre a 375 y a 1280.
const b = document.querySelector('.hdr-inicio');
const vis = el => !!el && el.offsetParent !== null && getComputedStyle(el).display !== 'none';
const r = b ? b.getBoundingClientRect() : null;
ok('1 · El botón «Inicio» del encabezado está a la vista a ' + innerWidth + ' px', vis(b) && /Inicio/.test(b.textContent), b ? getComputedStyle(b).display : 'sin botón');
ok('2 · Mide al menos 44 px de alto y cabe en el encabezado sin salirse', !!r && r.height >= 44 && r.right <= innerWidth && r.left >= 0, r ? Math.round(r.height) + ' px · derecha ' + Math.round(r.right) : '');
ok('3 · Guarda y lleva al menú con el modo de prueba (irAlMenu existe y mira TEST_MODE)', typeof irAlMenu === 'function' && /index\.html/.test(String(irAlMenu)) && /prueba=1/.test(String(irAlMenu)), '');
