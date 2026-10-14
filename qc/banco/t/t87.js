// TANDA 87 · Obra, 14-oct-2026 (v165, cambio 182): las filas agregadas en campo no pasan al informe siguiente ni se duplican.
// Lo que llegó de obra: EZ-T09-P01AB1-261013-KC con 188 filas agregadas en el hito 2, casi todas repetidas o «(sin descripción)».
// 1 dos filas siguen siendo dos tras reabrir el borrador tres veces · 2 «Nuevo» arranca sin filas agregadas, en pantalla y en los
// datos · 3 «Siguiente apartamento» tampoco las arrastra · 4 un borrador ya contaminado (fantasmas y duplicadas) abre limpio y se
// guarda limpio · 5 una fila agregada recién creada y vacía no viaja en los datos · 6 lo que sí tiene algo viaja completo.
// Corre sobre inspeccion.html?prueba=1.
localStorage.clear(); Q.aceptar = true;
const extras = () => getFormData().partidas['hito_cerramientos_extra'] || [];
const enPantalla = () => document.querySelectorAll('#extra_hito_cerramientos tr').length;
async function cabecera(apto){
  elegirRol('inspector'); await esperar(200);
  Q.elegir($('#convenio'), [...$('#convenio').options].find(o => /Ezequiel/.test(o.text)).value); await esperar(200);
  Q.elegir($('#torre'), 'T-09'); await esperar(300); Q.elegir($('#piso'), [...$('#piso').options].find(o => /01/.test(o.text)).value);
  const ap = $('#apto-sel'); if (ap && ap.offsetParent !== null) Q.elegir(ap, apto); else Q.escribir($('#apto'), apto); await esperar(300);
  const is = $('.inspector-select'); is.value = 'OTRO'; is.dispatchEvent(new Event('change', { bubbles: true })); await esperar(100); Q.escribir($('.inspector-manual'), 'Ing. Inspector de ejemplo');
  const ck = [...document.querySelectorAll('.ck-lbl')].find(l => /En progreso/i.test(l.textContent)); if (ck && !ck.querySelector('input').checked) toggleCk(ck, true);
}
await cabecera('B1');
addRow('hito_cerramientos', 'PAREDES INTERNAS APTO', '10', '5', 'B'); addRow('hito_cerramientos', 'SOBREPISO INTERNO APTO', '', '20', '');
const n0 = extras().length; saveDraft(true);
loadDraftData(0); await esperar(300); const n1 = extras().length;
loadDraftData(0); await esperar(300); saveDraft(true); loadDraftData(0); await esperar(300); const n3 = extras().length;
ok('1 · Dos filas agregadas siguen siendo dos tras reabrir el borrador tres veces', n0 === 2 && n1 === 2 && n3 === 2 && enPantalla() === 2, n0 + ' → ' + n1 + ' → ' + n3 + ' · pantalla ' + enPantalla());
nuevoFormulario(); await esperar(300);
ok('2 · «Nuevo» arranca sin filas agregadas, en pantalla y en los datos', extras().length === 0 && enPantalla() === 0, extras().length + ' en datos · ' + enPantalla() + ' en pantalla');
await cabecera('A1');
addRow('hito_cerramientos', 'MARCO DE PUERTA', '', '3', 'B'); saveDraft(true);
siguienteApartamento(); await esperar(600);
ok('3 · «Siguiente apartamento» no arrastra las filas agregadas del anterior', extras().length === 0 && enPantalla() === 0, extras().length + ' en datos · ' + enPantalla() + ' en pantalla');
// 4. un borrador contaminado como el de la T-09: fantasmas y duplicadas
const lista = getSavedReports(); const b = lista[0];
b.partidas['hito_cerramientos_extra'] = [
  { desc: '', pr: '', ej: '', ev: '' }, { desc: 'PAREDES INTERNAS APTO', pr: '', ej: '12', ev: 'B' }, { desc: '', pr: '', ej: '', ev: '' },
  { desc: '', pr: '', ej: '', ev: '' }, { desc: 'SOBREPISO INTERNO APTO', pr: '', ej: '', ev: '' },
  { desc: '', pr: '', ej: '', ev: '' }, { desc: 'PAREDES INTERNAS APTO', pr: '', ej: '12', ev: 'B' }, { desc: '', pr: '', ej: '', ev: '' },
  { desc: '', pr: '', ej: '', ev: '' }, { desc: 'SOBREPISO INTERNO APTO', pr: '', ej: '', ev: '' }, { desc: 'MONTANTES', pr: '', ej: '', ev: '' }];
localStorage.setItem('garmel_reports_list', JSON.stringify(lista));
loadDraftData(0); await esperar(400);
const d4 = extras().map(r => r.desc + '/' + r.ej + '/' + r.ev);
ok('4 · Un borrador contaminado (11 filas: 6 fantasmas, 2 duplicadas) abre con sus 3 filas reales y se guarda así',
   extras().length === 3 && enPantalla() === 3 && d4.join(' | ') === 'PAREDES INTERNAS APTO/12/B | SOBREPISO INTERNO APTO// | MONTANTES//' && (saveDraft(true), (getSavedReports()[0].partidas['hito_cerramientos_extra'] || []).length === 3),
   d4.join(' | ') + ' · pantalla ' + enPantalla());
addRow('hito_cerramientos'); await esperar(100);
ok('5 · Una fila agregada recién creada y vacía está en pantalla pero no viaja en los datos', enPantalla() === 4 && extras().length === 3, enPantalla() + ' en pantalla · ' + extras().length + ' en datos');
Q.escribir(document.getElementById('desc_hito_cerramientos_extra_' + (PARTIDAS.find(p => p.id === 'hito_cerramientos').items.length + 3)), 'DINTEL');
ok('6 · En cuanto se le escribe la descripción, viaja', extras().length === 4 && extras()[3].desc === 'DINTEL', JSON.stringify(extras()[3]));
