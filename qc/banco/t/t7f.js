Q.R.push(...JSON.parse(localStorage.getItem('__qc7') || '[]'));
const l = JSON.parse(localStorage.getItem('garmel_sha_list') || '[]');
ok('SHA: la incidencia recién escrita quedó guardada al salir', l.length === 1 && l[0].incidencias && l[0].incidencias[0].notas === 'antes de salir', JSON.stringify(l[0] && l[0].incidencias));
localStorage.setItem('__qc7', JSON.stringify(Q.R));
