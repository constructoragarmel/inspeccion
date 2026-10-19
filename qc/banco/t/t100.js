// TANDA 100 · v175 (19-oct-2026, cambio 187): «Mandar la lista a la oficina» desde «Informes». Diego: a Leidy le salían 60 informes
// (52 sin enviar) con seis apartamentos. La lista dice de cada informe número, lugar, hora, si se envió, qué le falta, si tiene
// medición y fotos, y si es idéntico a otro. 1 el botón está en «Informes» y mide 44 px · 2 la lista trae los tres informes con
// su número y lugar · 3 marca la copia idéntica «IGUAL AL n» · 4 dice qué le falta al que no puede enviarse · 5 marca el blanco ·
// 6 se abre el menú de compartir con el texto (y si no hay, se copia) · 7 nada cambió en el teléfono
localStorage.clear(); Q.aceptar = true;
const base = { lista: 'v2', formType: 'detallado', ambito: 'apartamento', vista: '', fecha: '2026-10-19', convenio: 'BIE', empresa: 'PROCODIMA, C.A.',
  torre: 'T-15', inspectores: ['Leidy Villamizar'], estatus: ['En progreso'], partidas: { hito_puertas: [{ pr: '6', ej: '4', ev: 'B' }] }, fotos: {}, fotobs: {}, noInspeccionados: [] };
const lista = [
  Object.assign({}, base, { id: 'd1', nro: 'EZ-T15-P06AA1-261019-LV', piso: '06', apto: 'A1', timestamp: '19/10/2026, 11:10:00 a.m.' }),
  Object.assign({}, base, { id: 'd2', nro: 'EZ-T15-P06AA1-261019-LV', piso: '06', apto: 'A1', timestamp: '19/10/2026, 11:12:00 a.m.' }),
  Object.assign({}, base, { id: 'd3', nro: 'EZ-T15-P06AA2-261019-LV', piso: '06', apto: 'A2', estatus: [], timestamp: '19/10/2026, 11:19:31 a.m.' }),
  Object.assign({}, base, { id: 'd4', nro: '(se arma al completar la cabecera)', piso: '', apto: '', partidas: {}, timestamp: '19/10/2026, 11:57:56 a.m.' }),
  Object.assign({}, base, { id: 'd5', nro: 'EZ-T15-261019-LV', ambito: 'torre', piso: '', apto: '', enviado: '19/10/2026, 12:30', timestamp: '19/10/2026, 11:57:56 a.m.' })
];
localStorage.setItem('garmel_reports_list', JSON.stringify(lista));
const antes = localStorage.getItem('garmel_reports_list');
let compartido = null; const shareOrig = navigator.share;
Object.defineProperty(navigator, 'share', { configurable: true, value: async (o) => { compartido = o; } });
openSavedModal(); await esperar(400);
const btn = $('#btn-lista-oficina');
ok('1 · El botón está en «Informes», visible y de 44 px o más', !!btn && btn.offsetParent !== null && btn.getBoundingClientRect().height >= 44, btn ? Math.round(btn.getBoundingClientRect().height) + ' px' : 'no está');
const t = _textoLista187(), lin = t.split('\n');
ok('2 · Trae los cinco con número y lugar, y el resumen arriba', lin.length === 8 && /5 informes: 1 enviados, 4 sin enviar/.test(lin[1]) && /^1\. EZ-T15-P06AA1-261019-LV · T-15 P06 A1/.test(lin[3]) && /T-15 \(torre\)/.test(lin[7]), lin.slice(0, 4).join(' ⏎ '));
ok('3 · La copia idéntica dice «IGUAL AL 1» y el resumen la cuenta', /IGUAL AL 1$/.test(lin[4]) && !/IGUAL/.test(lin[3]) && /1 iguales a otro/.test(lin[1]), lin[4]);
ok('4 · El que no puede enviarse dice qué le falta', /falta: estatus/.test(lin[5]) && /falta: piso, apartamento/.test(lin[6]) && !/falta/.test(lin[7]), lin[5] + ' ⏎ ' + lin[6]);
ok('5 · El que no tiene nada medido dice EN BLANCO y el número sin armar dice «sin número»', /^4\. sin número .*EN BLANCO/.test(lin[6]), lin[6]);
btn.click(); await esperar(300);
ok('6 · Abre el menú de compartir del teléfono con ese texto', compartido && compartido.text === t, compartido ? compartido.text.slice(0, 60) : 'no se abrió');
ok('7 · No cambia nada en el teléfono', localStorage.getItem('garmel_reports_list') === antes);
Object.defineProperty(navigator, 'share', { configurable: true, value: shareOrig });
