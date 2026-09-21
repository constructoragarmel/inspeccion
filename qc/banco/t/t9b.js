// tras recargar con ?rol=planificacion&prueba=1 y localStorage corrupto
Q.R.push(...JSON.parse(localStorage.getItem('__qc9') || '[]'));
ok('Recargó con datos corruptos sin error de página', !Q.R.some(r => /pageerror/.test(r.n)));
ok('Reabre el informe que estaba en pantalla (M-3, con 5/6/7)', $('#torre').value === 'M-3' && $$('#items-urb_drenaje .item').slice(0, 3).map(x => x.querySelector('.cant').value).join() === '5,6,7', $('#torre').value + ' · ' + $$('#items-urb_drenaje .item').slice(0, 3).map(x => x.querySelector('.cant').value).join());
ok('?rol=planificacion: modo plan encendido con aviso, y TEST_MODE por prueba=1', document.body.classList.contains('plan') && $('.plan-aviso') && TEST_MODE);
ok('Las 9 manzanas base siguen (la memoria corrupta se ignora)', torresUnicas().length === 9, torresUnicas().length);
ok('Secciones: 8 base (la memoria corrupta se ignora)', GENERAL.length === 8, GENERAL.length);
ok('Partidas recordadas corruptas ([1,2,3]): no rompen', $$('.item').length === 39, $$('.item').length);
ok('El rótulo de abajo dice v85 y en línea', /en línea/.test($('#conexion').textContent) && /v85/.test(document.body.textContent));
