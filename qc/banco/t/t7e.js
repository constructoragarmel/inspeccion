// SHA ?prueba=1: Inicio guarda incidencia recién escrita
Q.R.push(...JSON.parse(localStorage.getItem('__qc7') || '[]'));
const a = $('header a.inicio'); ok('sha: botón Inicio presente', !!a);
Q.elegir($('#torre'), 'T-45'); await esperar(100); if ($('#aviso-historial .no')) $('#aviso-historial .no').click(); Q.elegir($('#inspectores select'), INSPECTORES_DB[0]);
verPanel('c'); addIncidencia(); const f = $$('#filas-inc .fila-inc').pop(); Q.elegir(f.querySelector('.inc-tipo-sel'), 'Corte o herida'); Q.escribir(f.querySelector('.inc-notas'), 'antes de salir');
localStorage.setItem('__qc7', JSON.stringify(Q.R)); irAlMenu();
