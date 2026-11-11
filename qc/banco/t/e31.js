// ESTRÉS 31 · un informe ya enviado no se muda de torre ni de convenio (3-nov-2026, Diego Orta por Génesis y Cleidy: «el sistema nos
// combina información de los dos sectores»). Abierto un informe enviado, cambiarle torre o convenio pregunta; Cancelar lo deja igual,
// Aceptar empieza en la torre nueva uno en blanco y el enviado no se toca. Un borrador sin enviar se sigue corrigiendo como antes, y
// uno abierto desde el archivo (oficina) también pregunta. Se corre en los cuatro formularios a 375×812.
const OBRA = typeof loadDraftData === 'function';
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc');
await Q.relevo({ caido: false, fallar: [], lento: 0, colgar: 0, perder: false, cortar: 0, borrar: true });
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const valores = id => [...document.getElementById(id).options].map(o => o.value).filter(x => x && x !== 'OTRO' && !/varias|zona/i.test(x));
const pregunto = () => Q.dialogos.some(m => /ya se envi/.test(m));
let lista, guardados, abrir, enBlanco, conv1, conv2, t1, t2, t3;
if (OBRA) {
  localStorage.setItem('garmel_reports_list', '[]');
  lista = () => getSavedReports(); abrir = d => loadDraftData(lista().findIndex(x => x.id === d.id));
  conv1 = 'Convenio Bielorrusos'; conv2 = 'Convenio Rusos';
  enBlanco = () => !_hayMediciones();
} else {
  localStorage.setItem(CLAVE_LISTA, '[]');
  lista = () => listaGuardada(); abrir = d => cargarInforme(d.id);
  enBlanco = () => informeVacio(datosDelFormulario());
  [conv1, conv2] = valores('convenio');
}
// Un informe con contenido en conv1 / torre t, guardado en la lista; `como` = {enviado} o {oficina}.
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
    const o = $('#obs_general'); o.value = 'Prueba e31 en ' + t; o.dispatchEvent(new Event('input', { bubbles: true }));
    guardar(false); await esperar(300);
  }
  const l = lista(), d = l.find(x => !antes.includes(x.id));
  Object.assign(d, como); localStorage.setItem(OBRA ? 'garmel_reports_list' : CLAVE_LISTA, JSON.stringify(l));
  abrir(d); await esperar(700);
  return d;
};
const URB = /urbanismo/.test(location.pathname);
if (OBRA) [t1, t2, t3] = ['T-04', 'T-12', 'T-05'];
else if (URB) { conv1 = valores('convenio').find(x => /Bielo/.test(x)); conv2 = valores('convenio').find(x => x !== conv1); [t1, t2, t3] = ['M-2', 'M-4', 'M-5']; }
else { Q.elegir($('#convenio'), conv1); await esperar(300); [t1, t2, t3] = valores('torre'); }
// ── W1 · Enviado, cambiar el convenio y Cancelar: pregunta, y todo queda igual ──
const env = await hacer(t1, { enviado: new Date().toLocaleString() });
const n0 = lista().length, nro0 = env.nro;
Q.dialogos.length = 0; Q.aceptar = false;
sel('convenio', conv2); await esperar(500);
ok('W1 · Enviado + cambiar el convenio + Cancelar: pregunta «ya se envió» y el informe sigue en ' + conv1 + ' · ' + t1 + ' con lo medido',
   pregunto() && $('#convenio').value === conv1 && $('#torre').value === t1 && !enBlanco() && lista().length === n0,
   $('#convenio').value + ' · ' + $('#torre').value + ' · diálogos ' + Q.dialogos.length);
// ── W2 · Enviado, cambiar la torre y Aceptar: en la torre nueva, en blanco; el enviado no se toca ──
Q.dialogos.length = 0; Q.aceptar = true;
sel('torre', t2); await esperar(1200);
{ const c = document.getElementById('aviso-anterior'); if (c) c.innerHTML = ''; }
const orig = lista().find(x => x.id === env.id);
ok('W2 · …y Aceptar: queda ' + t2 + ' en blanco, y ' + nro0 + ' sigue en ' + t1 + ' con lo suyo',
   pregunto() && $('#torre').value === t2 && $('#convenio').value === conv1 && enBlanco() && !!orig && orig.torre === t1 && orig.nro === nro0 && !lista().some(x => x.id !== env.id && x.torre === t2),
   $('#torre').value + ' · en blanco ' + enBlanco() + ' · original ' + (orig && orig.torre + ' ' + orig.nro));
// ── W3 · Un borrador que nunca se envió se corrige como antes: sin pregunta, conserva lo medido ──
const bor = await hacer(t1, {});
// 206: con la misma fecha tendría el número de W1, que ya se envió, y preguntaría con razón; otro día es otro informe.
sel('fecha', '2026-01-02'); await esperar(300);
Q.dialogos.length = 0; Q.aceptar = true;
sel('torre', t3); await esperar(900);
ok('W3 · Borrador sin enviar: cambiar la torre no pregunta y conserva lo medido (se corrige la torre)',
   !pregunto() && $('#torre').value === t3 && !enBlanco(), 'diálogos: ' + Q.dialogos.join(' | ').slice(0, 120));
// ── W4 · Abierto desde el archivo (oficina) también pregunta ──
const t4 = OBRA ? 'T-13' : t1;   // en obra, otro número: el mismo número que un borrador de la lista lo pisa
const ofi = await hacer(t4, { oficina: { numero: 'X', revision: 1, abierto: 'hoy' } });
Q.dialogos.length = 0; Q.aceptar = false;
sel('torre', t2); await esperar(500);
ok('W4 · Abierto desde el archivo: cambiar la torre pregunta, y Cancelar lo deja en ' + t4, pregunto() && $('#torre').value === t4 && !enBlanco(), $('#torre').value);
// ── W5 · El aviso cabe a 375 (es un confirm del sistema) y nada se sale de la pantalla ──
ok('W5 · Cabe a 375: nada se sale de la pantalla', document.documentElement.scrollWidth <= innerWidth + 1, document.documentElement.scrollWidth + ' / ' + innerWidth);
Q.aceptar = true;
if (OBRA) { localStorage.setItem('garmel_reports_list', '[]'); nuevoFormulario(); } else { localStorage.setItem(CLAVE_LISTA, '[]'); nuevoInforme(); }
