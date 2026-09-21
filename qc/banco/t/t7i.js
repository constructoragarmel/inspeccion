// inspección ?prueba=1: Inicio dentro de «⋯ Más»
Q.R.push(...JSON.parse(localStorage.getItem('__qc7') || '[]'));
localStorage.setItem('garmel_rol', 'inspector');
const b = $('.hbtn-inicio');
ok('inspección: botón Inicio existe, dentro del grupo de «Más»', !!b && !!b.closest('#mas-acciones, .mas-acciones, [id*=mas]'), b && b.parentElement.id + '/' + b.parentElement.className);
const visibleAntes = b && b.getBoundingClientRect().height > 0;
if (typeof toggleMasAcciones === 'function') toggleMasAcciones();
ok('Oculto hasta tocar «Más», y al tocarlo se ve con ≥44 px', !visibleAntes && b.getBoundingClientRect().height >= 44, visibleAntes + ' → ' + Math.round(b.getBoundingClientRect().height));
ok('TEST_MODE encendido por ?prueba=1', TEST_MODE);
ok('autoguardar existe', typeof autoguardar === 'function');
localStorage.setItem('__qc7', JSON.stringify(Q.R));
