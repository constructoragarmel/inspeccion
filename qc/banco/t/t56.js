// TANDA 56 · V114 (2-oct-2026): «Actividades en ejecución», una vez por visita a la torre. En inspeccion.html.
// 1 la tarjeta va antes de las observaciones generales y dice qué va en cada una · 2 lo escrito viaja en los datos
// 3 solo con actividades escritas el informe ya tiene contenido · 4 el siguiente apartamento de la torre lo propone
// 5 lo propuesto no cuenta como contenido · 6 al tocarlo deja de ser «del anterior» · 7 otra torre: lo propuesto se retira
// 8 de vuelta a la torre, vuelve · 9 otra fecha: no se propone · 10 lo escrito a mano no se borra al cambiar de torre
// 11 el borrador lo conserva · 12 «limpiar todo» lo quita · 13 la huella de los informes viejos no cambia · 14 cabe en la pantalla
localStorage.setItem('garmel_rol', 'inspector');
localStorage.setItem('garmel_clave_envio', 'qc');
localStorage.removeItem('garmel_actividades');
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const put = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
const limpiar = async () => { Q.aceptar = true; nuevoFormulario(); await esperar(300); };
const cabecera = (torre) => {
  sel('fecha', '2026-10-05'); sel('convenio', 'Convenio Bielorrusos'); sel('torre', torre || 'T-07');
  const emp = [...document.getElementById('empresa').options].map(o => o.value);
  sel('empresa', emp.find(x => /ALNAVIC/i.test(x)) || emp[1]);
  const insp = document.querySelector('.inspector-select');
  insp.value = [...insp.options].map(o => o.value).filter(Boolean)[0]; insp.dispatchEvent(new Event('change', { bubbles: true }));
  const res = document.querySelector('#residentes-container input'); if (res) put(res.id || (res.id = 'res0'), 'Ing. Prueba');
  if (!document.querySelector('#estatus .ck-lbl.on')) document.querySelector('#estatus .ck-lbl').click();
  sel('piso', 'Piso 03'); put('apto', 'A');
};
const act = () => document.getElementById('actividades'), nota = () => document.getElementById('act-heredada');
const TEXTO = 'Acarreo de bloques al piso 4; cuadrilla de friso en los pisos 2 y 3.';

await limpiar(); setAmbito('apartamento'); await esperar(200); cabecera(); await esperar(300);
const card = document.getElementById('act-card'), general = document.getElementById('obs_general').closest('.obs-card');
ok('1 · La tarjeta «Actividades en ejecución» va justo antes de las observaciones generales, y dice qué va en cada una',
   !!card && !!act() && card.querySelector('h3').textContent.trim() === 'Actividades en ejecución' &&
   !!(card.compareDocumentPosition(general) & Node.DOCUMENT_POSITION_FOLLOWING) &&
   /está haciendo hoy en esta torre/.test(card.querySelector('.act-pista').textContent) && /va abajo, en «Observaciones»/.test(card.querySelector('.act-pista').textContent),
   card ? card.querySelector('.act-pista').textContent : 'sin tarjeta');

put('actividades', TEXTO); await esperar(100);
const d2 = getFormData();
ok('2 · Lo escrito viaja en los datos del informe, sin marca de heredado', d2.actividades === TEXTO && d2.actividadesHeredada === false && nota().hidden, JSON.stringify({ a: d2.actividades.slice(0, 30), h: d2.actividadesHeredada }));
ok('3 · Con solo las actividades escritas, el informe ya tiene contenido que guardar', _tieneContenido(d2) === true, String(_tieneContenido(d2)));

Q.aceptar = true; siguienteApartamento(); await esperar(900);
const d4 = getFormData();
ok('4 · En el apartamento siguiente de la misma torre y el mismo día, el campo ya trae lo escrito y avisa que viene del informe anterior',
   act().value === TEXTO && !nota().hidden && /informe anterior de hoy en esta torre/.test(nota().textContent) && d4.actividadesHeredada === true && document.getElementById('apto').value === '',
   'valor: «' + act().value.slice(0, 30) + '…» · aviso a la vista: ' + !nota().hidden + ' · apto: «' + document.getElementById('apto').value + '»');
ok('5 · Lo propuesto no cuenta como contenido: un informe con solo eso no deja ficha', _tieneContenido(d4) === false, String(_tieneContenido(d4)));

put('actividades', TEXTO + ' Llegó el camión de cabillas.'); await esperar(100);
ok('6 · Al tocarlo deja de ser «del anterior»: el aviso se va y pasa a ser de este informe', nota().hidden && getFormData().actividadesHeredada === false && _tieneContenido(getFormData()) === true, 'aviso oculto: ' + nota().hidden);

// de nuevo propuesto, y se cambia de torre
Q.aceptar = true; siguienteApartamento(); await esperar(900);
const propuesto7 = act().value;
sel('torre', 'T-09'); await esperar(300);
ok('7 · Al cambiar de torre, lo propuesto se retira (era de la otra torre)', /camión de cabillas/.test(propuesto7) && act().value === '' && nota().hidden, 'antes: «' + propuesto7.slice(-28) + '» · ahora: «' + act().value + '»');
sel('torre', 'T-07'); await esperar(300);
ok('8 · De vuelta en la torre, vuelve a proponerse', /camión de cabillas/.test(act().value) && !nota().hidden, '«' + act().value.slice(-28) + '»');
sel('fecha', '2026-10-06'); await esperar(300);
ok('9 · Con otra fecha no se propone: es otra visita', act().value === '' && nota().hidden, '«' + act().value + '»');

put('actividades', 'Escrito a mano hoy.'); await esperar(100);
sel('torre', 'T-09'); await esperar(300);
ok('10 · Lo que el inspector escribió a mano no se borra al cambiar de torre', act().value === 'Escrito a mano hoy.' && nota().hidden, '«' + act().value + '»');

// ── 11 ── el borrador
await limpiar(); setAmbito('apartamento'); await esperar(200); cabecera('T-10'); await esperar(200);
put('actividades', 'Vaciado de la losa del piso 5.'); await esperar(100);
currentEditingIndex = null; _idEnEdicion = null; saveDraft(true); await esperar(300);
await limpiar();
const vacio12 = act().value;
loadDraftData(0); await esperar(600);
ok('11 · El borrador conserva las actividades al reabrirlo', act().value === 'Vaciado de la losa del piso 5.' && nota().hidden, '«' + act().value + '»');
ok('12 · «Limpiar todo» deja el campo vacío', vacio12 === '', '«' + vacio12 + '»');

const base = { partidas: {}, fotobs: {}, obs_general: 'x', obs_sp: '', estatus: [], noInspeccionados: [], piso: 'Piso 03', apto: 'A', fecha: '2026-10-05', inspectores: [], residentes: [], agentes: [] };
const vieja = JSON.stringify([base.partidas, base.fotobs, base.obs_general, base.obs_sp, base.estatus, base.noInspeccionados, base.piso, base.apto, base.fecha, base.inspectores, base.residentes, base.agentes]);
ok('13 · Un informe enviado antes de que existiera el campo conserva su huella (no aparece como «editado»); con actividades, la huella cambia',
   _huellaInforme(base) === vieja && _huellaInforme(Object.assign({}, base, { actividades: '' })) === vieja && _huellaInforme(Object.assign({}, base, { actividades: 'algo' })) !== vieja, 'igual sin campo: ' + (_huellaInforme(base) === vieja));

act().scrollIntoView(); await esperar(100);
const r = act().getBoundingClientRect(), ancho = window.innerWidth;
ok('14 · A ' + ancho + ' px el campo cabe, mide al menos 44 px de alto y nada ensancha la página', r.left >= 0 && r.right <= ancho + 1 && r.height >= 44 && document.documentElement.scrollWidth <= ancho + 1,
   'campo ' + Math.round(r.width) + '×' + Math.round(r.height) + ' · scrollWidth ' + document.documentElement.scrollWidth + ' / ' + ancho);
localStorage.removeItem('garmel_actividades');
