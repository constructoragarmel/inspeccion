// tras recargar con ?rol=planificacion&prueba=1 y localStorage corrupto
// 17-nov-2026: urbanismo tiene 11 secciones fijas y 56 partidas desde la v188 (27-oct, 1de10c7), no 9 y 42; y el rótulo de abajo
// dice la versión publicada, no «v85».
Q.R.push(...JSON.parse(localStorage.getItem('__qc9') || '[]'));
ok('Recargó con datos corruptos sin error de página', !Q.R.some(r => /pageerror/.test(r.n)));
ok('Reabre el informe que estaba en pantalla (M-3, con 5/6/7)', $('#torre').value === 'M-3' && $$('#items-urb_drenaje .item').slice(0, 3).map(x => x.querySelector('.cant').value).join() === '5,6,7', $('#torre').value + ' · ' + $$('#items-urb_drenaje .item').slice(0, 3).map(x => x.querySelector('.cant').value).join());
ok('?rol=planificacion: modo plan encendido con aviso, y TEST_MODE por prueba=1', document.body.classList.contains('plan') && $('.plan-aviso') && TEST_MODE);
ok('Las 9 manzanas base siguen (la memoria corrupta se ignora)', torresUnicas().length === 9, torresUnicas().length);
ok('Secciones: 11 base (la memoria corrupta se ignora)', GENERAL.length === 11, GENERAL.length);
ok('Partidas recordadas corruptas ([1,2,3]): no rompen', $$('.item').length === 56, $$('.item').length);
ok('El rótulo de abajo dice la versión y en línea', /en línea/.test($('#conexion').textContent) && /· v\d+/.test($('#pie').textContent), $('#pie').textContent);
