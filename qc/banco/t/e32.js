// ESTRÉS 32 · el teléfono recuerda qué números ya envió (cambio 206, 11-nov-2026). Diego Orta: EZ-T01-261104-GC y
// EZ-T04-261110-GC (Génesis Cordobés) eran borradores NUEVOS con el contenido de SR-T38-261104-GC, que ya se había enviado:
// «Borrar enviados» quitaba de la lista el informe que estaba en pantalla y dejaba su contenido para el siguiente autoguardado.
// Se corre en los cuatro formularios a 375×812.
const OBRA = typeof loadDraftData === 'function';
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc');
localStorage.removeItem('garmel_enviados_lugar');
await Q.relevo({ caido: false, fallar: [], lento: 0, colgar: 0, perder: false, cortar: 0, borrar: true });
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const valores = id => [...document.getElementById(id).options].map(o => o.value).filter(x => x && x !== 'OTRO' && !/varias|zona/i.test(x));
const pregunto = () => Q.dialogos.some(m => /ya se envi/.test(m));
const CL = OBRA ? 'garmel_reports_list' : CLAVE_LISTA;
let lista, abrir, enBlanco, conv1, t1, t2, t3;
if (OBRA) { localStorage.setItem(CL, '[]'); lista = () => getSavedReports(); abrir = d => loadDraftData(lista().findIndex(x => x.id === d.id)); conv1 = 'Convenio Bielorrusos'; enBlanco = () => !_hayMediciones(); }
else { localStorage.setItem(CL, '[]'); lista = () => listaGuardada(); abrir = d => cargarInforme(d.id); enBlanco = () => informeVacio(datosDelFormulario()); [conv1] = valores('convenio'); }
const hacer = async (t, como) => {
  Q.aceptar = true; const antes = lista().map(x => x.id);
  if (OBRA) {
    nuevoFormulario(); await esperar(300); setAmbito('torre'); await esperar(250);
    sel('convenio', conv1); sel('torre', t); await esperar(900);
    { const c = document.getElementById('aviso-anterior'); if (c) { const v = c.querySelector('button.no'); if (v) v.click(); c.innerHTML = ''; } }
    const i = document.querySelector('#main-content input[id^="pr_"]'), j = document.getElementById('ej_' + i.id.slice(3));
    i.value = '10'; recalcRow(i); j.value = '4'; j.dispatchEvent(new Event('input', { bubbles: true }));
    saveDraft(true); await esperar(300);
  } else {
    nuevoInforme(); await esperar(200);
    Q.elegir($('#convenio'), conv1); await esperar(200); const tt = $('#torre'); tt.value = t; tt.dispatchEvent(new Event('change', { bubbles: true })); await esperar(400);
    if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
    const o = $('#obs_general'); o.value = 'Prueba e32 en ' + t; o.dispatchEvent(new Event('input', { bubbles: true }));
    guardar(false); await esperar(300);
  }
  const l = lista(), d = l.find(x => !antes.includes(x.id));
  Object.assign(d, como); localStorage.setItem(CL, JSON.stringify(l));
  abrir(d); await esperar(700);
  return d;
};
const guardarAhora = () => { if (OBRA) saveDraft(true); else guardar(false); };
const URB = /urbanismo/.test(location.pathname);
if (OBRA) [t1, t2, t3] = ['T-04', 'T-12', 'T-05'];
else if (URB) { conv1 = valores('convenio').find(x => /Bielo/.test(x)); [t1, t2, t3] = ['M-2', 'M-4', 'M-5']; }
else { Q.elegir($('#convenio'), conv1); await esperar(300); [t1, t2, t3] = valores('torre'); }

// ── X1 · Enviado en pantalla + «Borrar enviados»: la pantalla queda en blanco y al guardar no nace un borrador con lo suyo ──
const env = await hacer(t1, { enviado: new Date().toLocaleString() });
Q.aceptar = true; borrarEnviados(); await esperar(600);
guardarAhora(); await esperar(400);
ok('X1 · Borrar enviados con el informe en pantalla: queda en blanco y no aparece un borrador nuevo con su contenido',
   enBlanco() && !lista().some(x => x && !x.enviado && x.torre === t1), 'en blanco ' + enBlanco() + ' · lista ' + lista().length);
// ── X2 · El número quedó anotado aunque ya no esté en la lista ──
let reg = {}; try { reg = JSON.parse(localStorage.getItem('garmel_enviados_lugar') || '{}'); } catch (e) {}
const k = String(env.nro).toUpperCase();
ok('X2 · ' + env.nro + ' sigue anotado como enviado en ' + t1 + ' después de borrarlo', !!reg[k] && reg[k].torre === t1, JSON.stringify(reg[k] || null));
// ── X3 · Un borrador huérfano con ese número (como el de Génesis): cambiar la torre pregunta; Cancelar lo deja ──
const env2 = await hacer(t1, { enviado: new Date().toLocaleString() });
document.dispatchEvent(new Event('visibilitychange'));
localStorage.setItem(CL, JSON.stringify(lista().filter(x => x.id !== env2.id)));   // como antes del 206: fuera de la lista…
if (OBRA) { currentEditingIndex = null; _idEnEdicion = null; _abiertoParaEditar = false; } else idActual = null;   // …y suelto
guardarAhora(); await esperar(300);
Q.dialogos.length = 0; Q.aceptar = false;
sel('torre', t2); await esperar(600);
ok('X3 · Borrador con el número de uno enviado: cambiar la torre pregunta «ya se envió» y Cancelar lo deja en ' + t1,
   pregunto() && $('#torre').value === t1 && !enBlanco(), $('#torre').value + ' · diálogos ' + Q.dialogos.length);
// ── X4 · …y Aceptar empieza en blanco en la torre nueva ──
Q.dialogos.length = 0; Q.aceptar = true;
sel('torre', t2); await esperar(1200);
{ const c = document.getElementById('aviso-anterior'); if (c) c.innerHTML = ''; }
ok('X4 · …y Aceptar: ' + t2 + ' en blanco', pregunto() && $('#torre').value === t2 && enBlanco(), $('#torre').value + ' · en blanco ' + enBlanco());
// ── X5 · Un borrador de otro día que nunca se envió se corrige como siempre ──
localStorage.setItem(CL, '[]');   // en obra, un borrador con el mismo número que otro de la lista lo pisa
await hacer(t1, {}); sel('fecha', '2026-01-03'); await esperar(300);
Q.dialogos.length = 0; Q.aceptar = true;
sel('torre', t3); await esperar(900);
ok('X5 · Borrador nunca enviado: cambiar la torre no pregunta y conserva lo medido', !pregunto() && $('#torre').value === t3 && !enBlanco(),
   'diálogos: ' + Q.dialogos.join(' | ').slice(0, 120));
ok('X6 · Cabe a 375: nada se sale de la pantalla', document.documentElement.scrollWidth <= innerWidth + 1, document.documentElement.scrollWidth + ' / ' + innerWidth);
Q.aceptar = true; localStorage.removeItem('garmel_enviados_lugar');
if (OBRA) { localStorage.setItem(CL, '[]'); nuevoFormulario(); } else { localStorage.setItem(CL, '[]'); nuevoInforme(); }
