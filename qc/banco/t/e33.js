// ESTRÉS 33 · «lo de Génesis», todos los caminos (11-nov-2026, QC de 20 rondas antes de publicar la v206). Un informe con el
// contenido de otro termina en otra torre, otro sector u otra fecha. G1 enviar con «Enviar todos» y cambiarle la torre al que quedó
// en pantalla · G2 «Copiar de…» no ofrece un informe del teléfono de OTRO sector con la misma torre (SR-T12-…-LV salió de EZ-T16) ·
// G3 la papelera del informe abierto deja la pantalla en blanco · G4 cambiarle la FECHA a uno enviado también pregunta (el
// EZ-T04-261104-GC-r2 de Génesis llevaba los datos del 10-nov) · G5 el registro se olvida a los 45 días y un teléfono lleno no rompe
// nada. En inspeccion.html?prueba=1, a 375×812.
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc');
localStorage.removeItem('garmel_enviados_lugar'); localStorage.setItem('garmel_reports_list', '[]'); localStorage.removeItem('garmel_cortes');
await Q.relevo({ borrar: true, caido: false, fallar: [], lento: 0, colgar: 0, perder: false, cortar: 0 });
const errores = []; const _err = e => errores.push(String((e && (e.message || (e.reason && e.reason.message))) || e).slice(0, 120));
window.addEventListener('error', _err); window.addEventListener('unhandledrejection', _err);
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const pregunto = () => Q.dialogos.some(m => /ya se envi/.test(m));
const lista = () => getSavedReports();
const insp = () => { const i = document.querySelector('.inspector-select'); if (i && !i.value) Q.elegir(i, [...i.options].map(o => o.value).filter(Boolean)[0]); };
const hacer = async (conv, t, como) => {
  Q.aceptar = true; const antes = lista().map(x => x.id);
  nuevoFormulario(); await esperar(300); setAmbito('torre'); await esperar(250);
  sel('convenio', conv); sel('torre', t); await esperar(900); insp();
  { const c = document.getElementById('aviso-anterior'); if (c) { const v = c.querySelector('button.no'); if (v) v.click(); c.innerHTML = ''; } }
  if (!document.querySelector('#estatus .ck-lbl.on')) { const l = [...document.querySelectorAll('#estatus .ck-lbl')].find(l => /progreso/.test(l.textContent)); if (l) l.click(); }
  const i = document.querySelector('#main-content input[id^="pr_"]'), j = document.getElementById('ej_' + i.id.slice(3));
  i.value = '10'; recalcRow(i); j.value = '4'; j.dispatchEvent(new Event('input', { bubbles: true }));
  const a = document.getElementById('actividades'); if (a) { a.value = 'Actividades de ' + t; a.dispatchEvent(new Event('input', { bubbles: true })); }
  saveDraft(true); await esperar(300);
  const l = lista(), d = l.find(x => !antes.includes(x.id));
  if (como) { Object.assign(d, como); localStorage.setItem('garmel_reports_list', JSON.stringify(l)); loadDraftData(lista().findIndex(x => x.id === d.id)); await esperar(700); }
  return d;
};
const EZ = 'Convenio Bielorrusos', SR = 'Convenio Rusos';

// ── G1 · Se envía con «Enviar todos» el que está en pantalla; queda en pantalla. Cambiarle la torre pregunta ──
const g1 = await hacer(EZ, 'T-04');
Q.aceptar = true; await enviarPendientes(); await hasta(() => (lista().find(x => x.id === g1.id) || {}).enviado, 20000); await esperar(400);
const env1 = (await Q.envios()).filter(e => e.numero === g1.nro).length;
Q.dialogos.length = 0; Q.aceptar = false;
sel('torre', 'T-05'); await esperar(600);
ok('G1 · Enviado con «Enviar todos» y todavía en pantalla: cambiarle la torre pregunta «ya se envió», y Cancelar lo deja en T-04',
   env1 === 1 && pregunto() && $('#torre').value === 'T-04', 'envíos ' + env1 + ' · torre ' + $('#torre').value + ' · diálogos ' + Q.dialogos.length);

// ── G2 · «Copiar de…»: un informe del teléfono de EZ T-12 no sale como fuente en SR T-12 (y en EZ T-12 sí) ──
const g2 = await hacer(EZ, 'T-12');
Q.aceptar = true; nuevoFormulario(); await esperar(300); setAmbito('torre'); await esperar(250);
sel('convenio', SR); sel('torre', 'T-12'); await esperar(600);
const fSR = _copiarFuentesLocales(_copiarTorresCandidatas()).filter(f => f.nro === g2.nro);
nuevoFormulario(); await esperar(300); setAmbito('torre'); await esperar(250);
sel('convenio', EZ); sel('torre', 'T-12'); await esperar(600);
const fEZ = _copiarFuentesLocales(_copiarTorresCandidatas()).filter(f => f.nro === g2.nro);
ok('G2 · «Copiar de…» en SR T-12 no ofrece ' + g2.nro + ' (es de Ezequiel Zamora); en EZ T-12 sí', !fSR.length && fEZ.length === 1, 'en SR ' + fSR.length + ' · en EZ ' + fEZ.length);

// ── G3 · La papelera del informe abierto: pantalla en blanco y ningún borrador nuevo con lo suyo ──
const g3 = await hacer(EZ, 'T-13', { enviado: new Date().toLocaleString() });
const n3 = lista().length; Q.aceptar = true;
deleteSavedReport(lista().findIndex(x => x.id === g3.id)); await esperar(500);
saveDraft(true); await esperar(300);
ok('G3 · Borrar con la papelera el informe que está abierto: queda en blanco y no nace un borrador con su contenido',
   !_hayMediciones() && lista().length === n3 - 1 && !lista().some(x => x.torre === 'T-13' && !x.enviado), 'lista ' + n3 + '→' + lista().length + ' · mediciones ' + _hayMediciones());

// ── G4 · A uno enviado, cambiarle la fecha pregunta; Cancelar lo deja con su fecha ──
const g4 = await hacer(EZ, 'T-14', { enviado: new Date().toLocaleString() });
const f4 = $('#fecha').value; Q.dialogos.length = 0; Q.aceptar = false;
sel('fecha', '2026-01-05'); await esperar(500);
ok('G4 · Enviado + cambiarle la fecha: pregunta y Cancelar lo deja con la suya (' + f4 + ')', pregunto() && $('#fecha').value === f4 && _hayMediciones(),
   'fecha ' + $('#fecha').value + ' · diálogos ' + Q.dialogos.map(m => m.slice(0, 60)).join(' | '));
Q.dialogos.length = 0; Q.aceptar = true;
sel('fecha', '2026-01-05'); await esperar(900);
{ const c = document.getElementById('aviso-anterior'); if (c) c.innerHTML = ''; }
const orig4 = lista().find(x => x.id === g4.id);
ok('G4b · …y Aceptar: informe en blanco del 2026-01-05 en la misma torre; el enviado sigue con su fecha',
   // En «Torre completa» la misma torre trae sola lo acumulado de la visita anterior (cambio de e28), marcado como anterior: eso
   // es lo esperado. Lo que no puede venir es lo escrito en el enviado sin marca: sus actividades.
   pregunto() && $('#fecha').value === '2026-01-05' && $('#torre').value === 'T-14' && orig4 && orig4.fecha === f4 &&
   (!$('#actividades').value || !!$('#actividades').dataset.heredado) && !document.querySelector('#main-content tr.copiada'),
   $('#fecha').value + ' · ' + $('#torre').value + ' · actividades «' + $('#actividades').value.slice(0, 30) + '» heredadas ' + !!$('#actividades').dataset.heredado + ' · original ' + (orig4 && orig4.fecha));

// ── G5 · El registro: lo de hace 50 días se olvida, y con el almacenamiento lleno nada revienta ──
localStorage.setItem('garmel_enviados_lugar', JSON.stringify({ 'EZ-T99-260901-XX': ['T-99', 0, '2026-09-01', Math.floor(Date.now() / 864e5) - 50] }));
document.dispatchEvent(new Event('visibilitychange')); await esperar(100);
const olvido = !JSON.parse(localStorage.getItem('garmel_enviados_lugar') || '{}')['EZ-T99-260901-XX'];
const set0 = Storage.prototype.setItem; let reventó = '';
Storage.prototype.setItem = function(k, v){ if (k === 'garmel_enviados_lugar') throw new DOMException('lleno', 'QuotaExceededError'); return set0.call(this, k, v); };
try { const g5 = await hacer(EZ, 'T-15', { enviado: new Date().toLocaleString() }); Q.aceptar = false; sel('torre', 'T-16'); await esperar(500); }
catch (e) { reventó = String(e && e.message || e); }
finally { Storage.prototype.setItem = set0; }
ok('G5 · Lo anotado hace 50 días se olvida, y con el registro sin espacio cambiar la torre no revienta', olvido && !reventó && !errores.length, 'olvidó ' + olvido + ' · ' + reventó + ' · ' + errores.slice(0, 2).join(' | '));

Q.aceptar = true; localStorage.setItem('garmel_reports_list', '[]'); localStorage.removeItem('garmel_enviados_lugar'); nuevoFormulario();
