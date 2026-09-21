Q.R.push(...JSON.parse(localStorage.getItem('__qc7') || '[]'));
ok('Sin prueba llega a index.html sin query', /index\.html$/.test(location.href), location.href);
ok('El informe en blanco no dejó borrador (sigue 1 en la lista)', JSON.parse(localStorage.getItem('garmel_srv_list') || '[]').length === 1);
localStorage.setItem('__qc7', JSON.stringify(Q.R));
