// TANDA 63 · V129 (5-oct-2026): «Borrar los enviados» pregunta antes y no se lleva lo que falta reenviar.
// Se corre en los cuatro formularios. No envía nada. Planificación preguntó qué hacía el botón: en servicios, SHA y
// urbanismo borraba sin preguntar, y en los cuatro se llevaba también el informe «editado después de enviarlo».
const esObra = typeof getSavedReports === 'function';
const K = esObra ? 'garmel_reports_list' : (/SHA/.test(document.title) ? 'garmel_sha_list' : /Urbanismo/.test(document.title) ? 'garmel_urb_list' : 'garmel_srv_list');
const ids = () => JSON.parse(localStorage.getItem(K) || '[]').map(x => x.id).join(',');
const uno = (id, extra) => Object.assign({ id: id, numero: 'PRUEBA-' + id, nro: 'PRUEBA-' + id, torre: 'T-01', sector: 'EZ', apto: id, fecha: '2026-10-05', timestamp: '5/10/2026', formType: 'detallado', partidas: {}, hallazgos: [], incidencias: [] }, extra);
const sembrar = () => localStorage.setItem(K, JSON.stringify([uno('a', { enviado: '2/10/2026' }), uno('b', { enviado: '2/10/2026', editadoTras: '5/10/2026' }), uno('c', {})]));
sembrar(); Q.dialogos.length = 0; Q.aceptar = false; borrarEnviados();
ok('1 · Pregunta antes de borrar, y dice que siguen guardados', Q.dialogos.some(d => /YA ENVIADOS/.test(d) && /Siguen guardados/.test(d)), Q.dialogos.join(' | '));
ok('2 · Si se dice que no, no se borra nada', ids() === 'a,b,c', ids());
ok('3 · La pregunta avisa del que falta reenviar', Q.dialogos.some(d => /reenv/i.test(d)), Q.dialogos.join(' | '));
Q.aceptar = true; borrarEnviados(); await esperar(200);
ok('4 · Se va el enviado; quedan el que falta reenviar y el que no se ha enviado', ids() === 'b,c', ids());
Q.dialogos.length = 0; borrarEnviados(); await esperar(200);
ok('5 · Sin nada que borrar, no borra y lo dice', ids() === 'b,c', ids() + ' · ' + Q.dialogos.join(' | '));
if (!esObra) {
  sembrar(); abrirInformes(); await esperar(100);
  const m = $('#modal-informes');
  ok('6 · La lista dice cuántos faltan por reenviar y el botón cuenta solo los que se van', /falta reenviar/.test(m.innerText) && /Borrar el que ya se envió/.test(m.innerText), m.innerText.slice(0, 160).replace(/\s+/g, ' '));
  cerrarInformes();
}
localStorage.removeItem(K);
