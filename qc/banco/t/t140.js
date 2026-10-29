// TANDA 140 · cambio 200 (29-oct-2026, ADR-0056): «Fotos generales de los apartamentos» en el informe de torre. En
// inspeccion.html?prueba=1, a 375 px y A LA VISTA. 1 la tarjeta sale en torre y no en apartamento · 2 dos fotos y el texto
// quedan en el borrador (fotos en IndexedDB) · 3 al reabrirlo vuelven · 4 «Enviar todos» las manda como «aptosgen-N» con el
// texto · 5 un informe nuevo empieza sin ellas · 6 en apartamento no viajan aunque hayan quedado en pantalla · 7 a 375 px
// nada se sale y lo que se toca mide 44.
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem('garmel_reports_list', '[]');
await Q.relevo({ caido: false, fallar: [], lento: 0, colgar: 0, perder: false, borrar: true });
Q.aceptar = true;
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const visible = id => { const e = document.getElementById(id); return !!e && e.offsetParent !== null; };
const cabecera = async (amb) => {
  nuevoFormulario(); await esperar(300); setAmbito(amb); await esperar(200);
  sel('fecha', new Date().toISOString().slice(0, 10)); sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-07'); await esperar(400);
  const ins = document.querySelector('.inspector-select'); Q.elegir(ins, [...ins.options].map(o => o.value).filter(Boolean)[0]); await esperar(200);
  if (!document.querySelector('#estatus .ck-lbl.on')) [...document.querySelectorAll('#estatus .ck-lbl')].find(l => /progreso/.test(l.textContent)).click();
  const res = document.querySelector('#residentes-container input'); if (res && !res.value) { res.value = 'Ing. Prueba'; res.dispatchEvent(new Event('input', { bubbles: true })); }
};
const nFotos = () => [0, 1, 2, 3, 4, 5].filter(i => { const im = document.getElementById('fimg_aptosgen_' + i); return im && im.src && im.src.indexOf('data:') === 0; }).length;
// ── 1 ──
await cabecera('apartamento');
const enApto = visible('aptosgen-card'); setAmbito('torre'); await esperar(200);
ok('1 · La tarjeta sale en el informe de torre y no en el de apartamento', !enApto && visible('aptosgen-card'), 'apto ' + enApto + ' · torre ' + visible('aptosgen-card'));
// ── 2 ──
await cabecera('torre');
const rid = 'hito_cerramientos_' + CODIGOS_SUB.hito_cerramientos.indexOf('2.01');
{ const pr = document.getElementById('pr_' + rid), ej = document.getElementById('ej_' + rid); if (pr && ej) { pr.value = '10'; ej.value = '5'; recalcRow(pr); ej.dispatchEvent(new Event('input', { bubbles: true })); } }
Q.ponerFotos(document.querySelector('#fslot_aptosgen_0 input[type=file]'), [await Q.foto(1200, 900, 401)]); await esperar(1500);
Q.ponerFotos(document.querySelector('#fslot_aptosgen_1 input[type=file]'), [await Q.foto(1200, 900, 402)]); await esperar(1500);
Q.escribir(document.getElementById('obs_aptosgen'), 'Foto 1: P05 A1 cerámica terminada · Foto 2: P08 B2 filtración');
saveDraft(true); await esperar(600);
const L2 = getSavedReports(), b2 = L2[0];
const idb = b2 ? await _fotosGet(b2.id) : null;
ok('2 · Dos fotos y el texto quedan en el borrador; las fotos en IndexedDB', !!b2 && b2.obsAptosGen === 'Foto 1: P05 A1 cerámica terminada · Foto 2: P08 B2 filtración' && !!idb && (idb.aptosgen || []).filter(s => _esDato(s)).length === 2, b2 ? JSON.stringify(b2.fotos && b2.fotos.aptosgen).slice(0, 80) : 'sin borrador');
// ── 3 ──
nuevoFormulario(); await esperar(400);
const vacio = nFotos() === 0 && document.getElementById('obs_aptosgen').value === '';
loadDraftData(0); await esperar(2000);
ok('3 · Un informe nuevo empieza sin ellas; al reabrir el borrador vuelven las dos y el texto', vacio && nFotos() === 2 && /filtración/.test(document.getElementById('obs_aptosgen').value), 'nuevo vacío ' + vacio + ' · fotos ' + nFotos());
// ── 4 ──
nuevoFormulario(); await esperar(300);
const env0 = (await Q.envios()).length;
await enviarPendientes(); await hasta(() => !_tandaEnCurso, 60000); await esperar(800);
const e4 = (await Q.envios()).slice(env0).find(e => e.numero && /T07-\d{6}-/.test(e.numero));
ok('4 · «Enviar todos» las manda como «aptosgen-1» y «aptosgen-2», con el texto', !!e4 && ['aptosgen-1', 'aptosgen-2'].every(n => (e4.fotos || []).indexOf(n) >= 0) && e4.datos.obsAptosGen && /P08 B2/.test(e4.datos.obsAptosGen), e4 ? e4.numero + ' · ' + (e4.fotos || []).join(',') : Q.dialogos.slice(-1).join(' ').slice(0, 160));
// ── 5 y 6 ──
localStorage.setItem('garmel_reports_list', '[]');
await cabecera('torre');
Q.ponerFotos(document.querySelector('#fslot_aptosgen_0 input[type=file]'), [await Q.foto(800, 600, 403)]); await esperar(1500);
Q.escribir(document.getElementById('obs_aptosgen'), 'algo');
setAmbito('apartamento'); await esperar(200);
const g6 = getFormData(), f6 = _fotosParaEnviar();
ok('5 · En apartamento no se ven ni viajan, aunque hayan quedado en pantalla', !visible('aptosgen-card') && (g6.fotos.aptosgen || []).length === 0 && g6.obsAptosGen === '' && !f6.some(f => /^aptosgen-/.test(f.nombre)));
setAmbito('torre'); await esperar(200);
ok('6 · Al volver a torre siguen ahí', nFotos() === 1 && document.getElementById('obs_aptosgen').value === 'algo');
// ── 7 ──
document.getElementById('aptosgen-card').scrollIntoView(); await esperar(100);
const chicos = [...document.querySelectorAll('#aptosgen-card label.btn-camara, #aptosgen-card textarea')].filter(e => { const r = e.getBoundingClientRect(); return r.width && r.height && r.height < 44 && e.offsetParent; }).map(e => e.className + ':' + Math.round(e.getBoundingClientRect().height));
ok('7 · A ' + innerWidth + ' px nada se sale; el botón de la cámara y el texto miden 44 px o más (el ✕ es el de siempre)', document.documentElement.scrollWidth <= innerWidth + 1 && !chicos.length, chicos.join(',') || 'ok');
nuevoFormulario(); localStorage.setItem('garmel_reports_list', '[]');
