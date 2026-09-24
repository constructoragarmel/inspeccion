// TANDA 20b · sigue a t20 después de recargar la página (QC6).
Q.R.push(...JSON.parse(localStorage.getItem('__qc20') || '[]')); localStorage.removeItem('__qc20');
const b = $$('#items-urb_preliminares .item')[2];
ok('QC6 · tras recargar se reabre el borrador con su camión', b && b.querySelectorAll('.camion').length === 1 && b.querySelector('.placa').value === 'REC', b && b.querySelectorAll('.camion').length);
ok('QC6 · y el ejecutado sigue calculado y bloqueado: 40 + 12 = 52', b && b.querySelector('.cant').value === '52' && b.querySelector('.cant').readOnly, b && b.querySelector('.cant').value);
ok('QC6 · el total del día se ve sin tocar nada', b && /1 camión\(es\) · 4 viaje\(s\) · 12 m³ hoy/.test(b.querySelector('.cam-total').textContent), b && b.querySelector('.cam-total').textContent);
ok('QC6 · sin errores de página', !Q.R.some(r => /pageerror|unhandled/.test(r.n)));
