// TANDA 79b · V153: tras recargar con un nombre recordado que ya no está en la lista (sigue a t79).
await esperar(300);
ok('5 · Al abrir, sector y torre recordados; «quién valida» no queda en blanco sino en «— Seleccione —»', $('#sector').value === 'SB' && $('#torre').value === 'J-12' && $('#quien').selectedIndex === 0, $('#sector').value + ' ' + $('#torre').value + ' idx ' + $('#quien').selectedIndex);
localStorage.removeItem('garmel_compilado_ultimo'); localStorage.removeItem('garmel_clave_envio');
