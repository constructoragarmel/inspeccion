// servicios SIN prueba, en blanco → Inicio no deja borrador y va a index.html sin query
Q.R.push(...JSON.parse(localStorage.getItem('__qc7') || '[]'));
ok('Sin ?prueba: TEST_MODE apagado', !TEST_MODE);
localStorage.setItem('__qc7', JSON.stringify(Q.R));
irAlMenu();
