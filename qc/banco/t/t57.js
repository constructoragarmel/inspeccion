// TANDA 57 · V114 (2-oct-2026): lo que pide el informe único de coordinadores, fuera de obra. Se corre en sha.html,
// urbanismo.html y servicios.html; cada página comprueba lo suyo. No envía nada.
// SHA: «Solución» y «Responsable del correctivo» en cada hallazgo (las dos columnas de su matriz que faltaban).
// Urbanismo: «Actividades en ejecución», antes de la observación general. Servicios: no lleva campo nuevo (ahí las
// actividades son la observación de cada servicio).
const pagina = /sha\.html/.test(location.pathname) ? 'sha' : /urbanismo\.html/.test(location.pathname) ? 'urbanismo' : 'servicios';
const nuevo = async () => { Q.aceptar = true; nuevoInforme(); await esperar(120); if ($('#aviso-historial .no')) $('#aviso-historial .no').click(); };
const escribir = (e, v) => { e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); };
await esperar(500);
const ancho = window.innerWidth;

if (pagina === 'sha') {
  const K = { d: 'hallazgo__Descripción del hallazgo o condición observada', e: 'hallazgo__Acción correctiva / estatus', s: 'hallazgo__Solución', r: 'hallazgo__Responsable del correctivo' };
  await nuevo(); verPanel('b'); await esperar(50); addApartamento(); await esperar(100);
  const f = $('#filas-apto .fila-apto'), campos = [...f.querySelectorAll('[data-campo]')];
  const sol = f.querySelector('[data-campo="' + K.s + '"]'), res = f.querySelector('[data-campo="' + K.r + '"]');
  const rot = e => (e.previousElementSibling && e.previousElementSibling.classList.contains('rot-campo')) ? e.previousElementSibling.textContent : '';
  ok('1 · Cada hallazgo trae cuatro campos, en el orden de la matriz de SHA: descripción, estatus, solución y responsable del correctivo',
     campos.length === 4 && campos.map(c => c.dataset.campo).join('|') === [K.d, K.e, K.s, K.r].join('|'), campos.map(c => c.dataset.campo.split('__')[1]).join(' · '));
  ok('2 · «Solución» es un cuadro de texto y «Responsable del correctivo» una línea; los dos llevan su rótulo encima y una pista dentro',
     !!sol && sol.tagName === 'TEXTAREA' && !!res && res.tagName === 'INPUT' && rot(sol) === 'Solución' && rot(res) === 'Responsable del correctivo' &&
     /se acordó o se le pidió/.test(sol.placeholder) && /Quién lo va a corregir/.test(res.placeholder), rot(sol) + ' («' + sol.placeholder + '») · ' + rot(res) + ' («' + res.placeholder + '»)');

  f.querySelector('.apto').value = 'Andamio de la fachada norte';
  escribir(f.querySelector('[data-campo="' + K.d + '"]'), 'Andamio sin rodapié ni baranda.');
  escribir(f.querySelector('[data-campo="' + K.e + '"]'), 'Pendiente');
  escribir(sol, 'Se pidió completar el andamio antes de seguir.'); escribir(res, 'Ing. residente');
  const d3 = datosDelFormulario(), c3 = (d3.apartamentos[0] || {}).campos || {};
  ok('3 · Lo escrito viaja con el hallazgo, y la descripción sigue siendo el primer campo', c3[K.s] === 'Se pidió completar el andamio antes de seguir.' && c3[K.r] === 'Ing. residente' && Object.keys(c3)[0] === K.d && c3[K.e] === 'Pendiente', JSON.stringify(c3).slice(0, 200));

  escribir(sol, ''); escribir(res, '');
  const f4 = faltan(datosDelFormulario()).join(' | ');
  ok('4 · No son obligatorios: vacíos, el formulario no los reclama', !/Soluci|Responsable/i.test(f4), 'faltan: ' + (f4 || 'nada'));

  escribir(sol, 'Se pidió completar el andamio antes de seguir.'); escribir(res, 'Ing. residente');
  Q.elegir($('#torre'), TORRES_DATA[0].t); await esperar(100); if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
  guardar(false); const id5 = idActual; await esperar(200);
  await nuevo(); cargarInforme(id5); await esperar(300); verPanel('b');
  const g = $('#filas-apto .fila-apto');
  ok('5 · Guardado y vuelto a abrir, el hallazgo conserva la solución y el responsable',
     !!g && g.querySelector('[data-campo="' + K.s + '"]').value === 'Se pidió completar el andamio antes de seguir.' && g.querySelector('[data-campo="' + K.r + '"]').value === 'Ing. residente',
     g ? g.querySelector('[data-campo="' + K.r + '"]').value : 'sin hallazgo');

  await nuevo(); verPanel('b');
  addApartamento({ apto: 'Losa 5', piso: '', campos: { [K.d]: 'Hueco sin proteger.', [K.e]: 'En proceso', [K.s]: 'Colocar tapa provisional.', [K.r]: 'SHA de la contratista' }, fotos: [] }); await esperar(100);
  const h = $('#filas-apto .fila-apto');
  ok('6 · Un hallazgo que vuelve de la visita anterior trae también su solución y su responsable', h.querySelector('[data-campo="' + K.s + '"]').value === 'Colocar tapa provisional.' && h.querySelector('[data-campo="' + K.r + '"]').value === 'SHA de la contratista',
     h.querySelector('[data-campo="' + K.s + '"]').value + ' · ' + h.querySelector('[data-campo="' + K.r + '"]').value);

  const cajas = [...h.querySelectorAll('[data-campo], .rot-campo')].map(e => e.getBoundingClientRect());
  ok('7 · A ' + ancho + ' px los campos caben, la línea del responsable mide al menos 44 px y nada ensancha la página',
     cajas.every(r => r.left >= 0 && r.right <= ancho + 1) && h.querySelector('[data-campo="' + K.r + '"]').getBoundingClientRect().height >= 44 && document.documentElement.scrollWidth <= ancho + 1,
     'responsable ' + Math.round(h.querySelector('[data-campo="' + K.r + '"]').getBoundingClientRect().height) + ' px · scrollWidth ' + document.documentElement.scrollWidth + ' / ' + ancho);
  ok('8 · SHA no lleva «Actividades en ejecución»: su informe es la matriz de hallazgos', !document.getElementById('actividades') && !('actividades' in datosDelFormulario()), 'campo: ' + !!document.getElementById('actividades'));
  await nuevo();
} else if (pagina === 'urbanismo') {
  await nuevo();
  const a = document.getElementById('actividades'), card = document.getElementById('tarjeta-actividades'), og = document.getElementById('obs_general').closest('.tarjeta');
  ok('1 · «Actividades en ejecución» va después de las secciones y antes de la observación general (entre las dos, desde la v116, las minutas), y dice qué va en cada una',
     !!a && !!card && !!(card.compareDocumentPosition(og) & Node.DOCUMENT_POSITION_FOLLOWING) && card.previousElementSibling.id === 'agregar-seccion' && /Actividades en ejecución/.test(card.querySelector('label').textContent) &&
     /haciendo hoy en esta manzana/.test(card.querySelector('.act-pista').textContent) && /observación general/.test(card.querySelector('.act-pista').textContent), card ? card.querySelector('.act-pista').textContent : 'sin tarjeta');
  const vacio0 = informeVacio(datosDelFormulario());
  escribir(a, 'Limpieza y desmalezamiento en la zona posterior; replanteo topográfico.');
  const d2 = datosDelFormulario();
  ok('2 · Lo escrito viaja en los datos, y con solo eso el informe ya no está vacío', d2.actividades === 'Limpieza y desmalezamiento en la zona posterior; replanteo topográfico.' && vacio0 === true && informeVacio(d2) === false, 'vacío antes: ' + vacio0 + ' · después: ' + informeVacio(d2));
  const s = document.getElementById('sector'); if (s) { Q.elegir(s, [...s.options].map(o => o.value).filter(Boolean)[0]); await esperar(80); }
  const t = document.getElementById('torre'); Q.elegir(t, [...t.options].map(o => o.value).filter(Boolean)[0]); await esperar(100); if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
  escribir(a, 'Limpieza y desmalezamiento en la zona posterior; replanteo topográfico.');
  guardar(false); const id3 = idActual; await esperar(200);
  await nuevo(); const blanco = document.getElementById('actividades').value;
  cargarInforme(id3); await esperar(300);
  ok('3 · «Nuevo» lo deja en blanco, y al reabrir el informe guardado vuelve lo escrito', blanco === '' && /replanteo topográfico/.test(document.getElementById('actividades').value), 'tras «Nuevo»: «' + blanco + '» · reabierto: «' + document.getElementById('actividades').value.slice(0, 30) + '…»');
  a.scrollIntoView(); await esperar(80);
  const r = a.getBoundingClientRect();
  ok('4 · A ' + ancho + ' px el campo cabe, mide al menos 44 px y nada ensancha la página', r.left >= 0 && r.right <= ancho + 1 && r.height >= 44 && document.documentElement.scrollWidth <= ancho + 1, Math.round(r.width) + '×' + Math.round(r.height) + ' · scrollWidth ' + document.documentElement.scrollWidth + ' / ' + ancho);
  await nuevo();
} else {
  await nuevo();
  ok('1 · Servicios no lleva campo nuevo: ahí lo que se está haciendo se escribe en la observación de cada servicio',
     !document.getElementById('actividades') && !('actividades' in datosDelFormulario()) && $$('.obs-srv').length >= 5, 'campo: ' + !!document.getElementById('actividades') + ' · observaciones por servicio: ' + $$('.obs-srv').length);
}
