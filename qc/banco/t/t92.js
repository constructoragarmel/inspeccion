// TANDA 92 · Obra, 14-oct-2026 (v169, cambio 185): al abrir un borrador se ofrece quitar de una vez las filas agregadas sin medición.
// Lo que quedó en obra tras la v165: en los borradores viejos del teléfono siguen las filas con descripción distinta y sin medición
// (once marcos de puerta en EZ-T09-P01AB1-261013-KC) y la inspectora las ve y las reenvía cada vez que abre uno.
// 1 un borrador con 11 filas sin medición y 2 con medición: «Sí» → quedan 2 en pantalla, en los datos y en el borrador guardado ·
// 2 el mismo borrador con «No» → quedan 13 · 3 con 2 filas sin medición no se pregunta · 4 la ✕ quita la fila también de los datos
// (antes viajaba con la descripción de la memoria) · 5 el texto del confirm es el acordado · 6 una fila con medición nunca se toca.
// Corre sobre inspeccion.html?prueba=1.
localStorage.clear(); Q.aceptar = true;
const extras = () => getFormData().partidas['hito_puertas_extra'] || [];
const enPantalla = () => document.querySelectorAll('#extra_hito_puertas tr').length;
const guardadas = () => (getSavedReports()[0].partidas['hito_puertas_extra'] || []).length;
async function cabecera(apto){
  elegirRol('inspector'); await esperar(200);
  Q.elegir($('#convenio'), [...$('#convenio').options].find(o => /Ezequiel/.test(o.text)).value); await esperar(200);
  Q.elegir($('#torre'), 'T-09'); await esperar(300); Q.elegir($('#piso'), [...$('#piso').options].find(o => /01/.test(o.text)).value);
  const ap = $('#apto-sel'); if (ap && ap.offsetParent !== null) Q.elegir(ap, apto); else Q.escribir($('#apto'), apto); await esperar(300);
  const is = $('.inspector-select'); is.value = 'OTRO'; is.dispatchEvent(new Event('change', { bubbles: true })); await esperar(100); Q.escribir($('.inspector-manual'), 'Ing. Inspector de ejemplo');
  const ck = [...document.querySelectorAll('.ck-lbl')].find(l => /En progreso/i.test(l.textContent)); if (ck && !ck.querySelector('input').checked) toggleCk(ck, true);
}
const sinMedicion = ['MARCO DE PUERTA 0.70 M', 'MARCO DE PUERTA 0.80 M', 'MARCO DE PUERTA 0.90 M', 'MARCOS DE PUERTAS DE MADERA', 'MARCOS DE PUERTAS INTERNAS',
  'MARCO DE PUERTA PRINCIPAL', 'MARCOS DE PUERTA', 'MARCO PUERTA BAÑO', 'MARCO PUERTA COCINA', 'MARCO DE PUERTAS', 'MARCOS DE PUERTAS DE MADERA 0.70'];
function contaminar(cuantasSin){
  const lista = getSavedReports(); const b = lista[0];
  b.partidas['hito_puertas_extra'] = [{ desc: 'MARCO DE PUERTA 0.70 M', pr: '6', ej: '4', ev: 'B' }]
    .concat(sinMedicion.slice(0, cuantasSin).map(d => ({ desc: d, pr: '', ej: '', ev: '' })))
    .concat([{ desc: 'MARCO DE PUERTA 0.90 M', pr: '', ej: '2', ev: '' }]);
  localStorage.setItem('garmel_reports_list', JSON.stringify(lista));
}
await cabecera('B1');
addRow('hito_puertas', 'MARCO DE PUERTA 0.70 M', '6', '4', 'B'); saveDraft(true);
// 1. once sin medición y dos con medición, «Sí»
contaminar(11); Q.dialogos.length = 0; Q.aceptar = true;
loadDraftData(0); await esperar(400);
const d1 = extras().map(r => r.desc + '/' + r.pr + '/' + r.ej + '/' + r.ev);
ok('1 · Con 11 filas sin medición y 2 con medición, «Sí» deja las 2 en pantalla, en los datos y en el borrador guardado',
   enPantalla() === 2 && extras().length === 2 && guardadas() === 2 && d1.join(' | ') === 'MARCO DE PUERTA 0.70 M/6/4/B | MARCO DE PUERTA 0.90 M//2/',
   'pantalla ' + enPantalla() + ' · datos ' + extras().length + ' · guardadas ' + guardadas() + ' · ' + d1.join(' | '));
const pregunta = Q.dialogos.find(m => /filas agregadas en campo sin medición/.test(m)) || '';
ok('5 · El texto del confirm es el acordado y cuenta 11',
   pregunta === 'Este informe trae 11 filas agregadas en campo sin medición (restos de un error corregido el 14-oct).\n\n¿Las quito? Las que tienen medición se quedan.',
   JSON.stringify(pregunta));
// 2. el mismo borrador, «No»
contaminar(11); Q.dialogos.length = 0; Q.aceptar = false;
loadDraftData(0); await esperar(400);
ok('2 · Con «No» quedan las 13 como estaban, y al guardar siguen 13',
   enPantalla() === 13 && extras().length === 13 && Q.dialogos.some(m => /trae 11 filas/.test(m)) && (saveDraft(true), guardadas() === 13),
   'pantalla ' + enPantalla() + ' · datos ' + extras().length + ' · guardadas ' + guardadas() + ' · diálogos ' + Q.dialogos.length);
Q.aceptar = true;
// 3. con dos sin medición no se pregunta
contaminar(2); Q.dialogos.length = 0;
loadDraftData(0); await esperar(400);
ok('3 · Con 2 filas sin medición no se pregunta y quedan las 4',
   enPantalla() === 4 && extras().length === 4 && !Q.dialogos.some(m => /sin medición/.test(m)),
   'pantalla ' + enPantalla() + ' · datos ' + extras().length + ' · diálogos ' + JSON.stringify(Q.dialogos));
// 4. la ✕ quita la fila también de los datos
const trSin = [...document.querySelectorAll('#extra_hito_puertas tr')].find(tr => (document.getElementById('desc_' + tr.dataset.rid) || {}).value === 'MARCO DE PUERTA 0.80 M');
deleteExtraRow(trSin.dataset.rid, 'hito_puertas'); await esperar(100);
saveDraft(true);
ok('4 · La ✕ quita la fila de la pantalla, de los datos y del borrador guardado (antes viajaba con la descripción de la memoria)',
   enPantalla() === 3 && extras().length === 3 && guardadas() === 3 && !extras().some(r => r.desc === 'MARCO DE PUERTA 0.80 M'),
   'pantalla ' + enPantalla() + ' · datos ' + extras().length + ' · guardadas ' + guardadas());
// 6. reabrir: la fila quitada no vuelve y las medidas siguen intactas
loadDraftData(0); await esperar(400);
const d6 = extras().map(r => r.desc + '/' + r.pr + '/' + r.ej + '/' + r.ev);
ok('6 · Al reabrir, la fila quitada no vuelve y las dos con medición siguen intactas',
   enPantalla() === 3 && d6.includes('MARCO DE PUERTA 0.70 M/6/4/B') && d6.includes('MARCO DE PUERTA 0.90 M//2/') && !d6.some(x => /0\.80/.test(x)),
   d6.join(' | '));
