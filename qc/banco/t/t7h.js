Q.R.push(...JSON.parse(localStorage.getItem('__qc7') || '[]'));
const l = JSON.parse(localStorage.getItem('garmel_urb_list') || '[]');
ok('Urbanismo: cantidad 44 guardada al salir; menú con prueba', l.length === 1 && l[0].general[0].items[0].cant === '44' && /prueba=1/.test(location.href), l.length + ' · ' + location.href);
const card = $$('a').find(e => /Urbanismo/.test(e.textContent));
ok('La tarjeta de urbanismo cuenta 1 sin enviar', card && /1/.test(card.textContent), card && card.textContent.replace(/\s+/g, ' '));
localStorage.setItem('__qc7', JSON.stringify(Q.R));
