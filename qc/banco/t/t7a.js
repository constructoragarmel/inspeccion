// servicios ?prueba=1 : botón Inicio, guardar sin esperar los 2 s
Object.keys(localStorage).filter(k => /garmel_(srv|sha|urb|reports)_/.test(k) || /garmel_reports_list|garmel_draft/.test(k)).forEach(k => localStorage.removeItem(k));
const a = $('header a.inicio');
ok('servicios: «🏠 Inicio» arriba a la derecha, enlace a ./index.html con título', a && a.getAttribute('href') === './index.html' && /Guarda el informe/.test(a.title) && a.getBoundingClientRect().right > 300, a && a.textContent);
ok('(HALLAZGO) mide ' + (a && Math.round(a.getBoundingClientRect().height)) + ' px, no 44', a && a.getBoundingClientRect().height >= 44);
ok('No se solapa con el título', a && $('header h1').getBoundingClientRect().right <= a.getBoundingClientRect().left, Math.round($('header h1').getBoundingClientRect().right) + ' vs ' + Math.round(a.getBoundingClientRect().left));
Q.elegir($('#torre'), 'T-05'); await esperar(100); if ($('#aviso-historial .no')) $('#aviso-historial .no').click(); Q.elegir($('#inspectores select'), INSPECTORES_DB[0]);
$$('.item .sino button')[0].click();
ok('Hay cambios sin guardar (sucio) y nada en la lista todavía', sucio && listaGuardada().length === 0);
localStorage.setItem('__qc7', JSON.stringify(Q.R));
a.click();
