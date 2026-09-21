// urbanismo ?prueba=1
Q.R.push(...JSON.parse(localStorage.getItem('__qc7') || '[]'));
const a = $('header a.inicio'); ok('urbanismo: botón Inicio presente y ≥44? ' + Math.round(a.getBoundingClientRect().height), !!a);
Q.elegir($('#convenio'), TORRES_DATA[0].c); Q.elegir($('#torre'), 'M-2'); await esperar(100); if ($('#aviso-historial .no')) $('#aviso-historial .no').click(); Q.elegir($('#inspectores select'), INSPECTORES_DB[0]);
Q.escribir($('#items-urb_drenaje .item .cant'), '44');
localStorage.setItem('__qc7', JSON.stringify(Q.R)); $('header a.inicio').click();
