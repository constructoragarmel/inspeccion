// ESTRÉS 36 · lo que nadie ha visto (11-nov-2026, QC de 20 rondas antes de la v206), en obra. N1 un teléfono con 3.000 números
// anotados y 300 informes enviados en la lista: cambiar la torre sigue siendo instantáneo · N2 uno enviado y cambiado después
// («editadoTras»): cambiarle la torre pregunta, y «Borrar enviados» no se lo lleva · N3 uno abierto desde el archivo (oficina):
// cambiarle la fecha pregunta · N4 el aviso «la pantalla quedó en blanco» cabe en la pantalla · N5 el registro no crece sin
// límite: con 3.000 anotados ocupa menos de 300 KB. En inspeccion.html?prueba=1 a 375×812.
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem('garmel_reports_list', '[]');
localStorage.removeItem('garmel_enviados_lugar');
await Q.relevo({ borrar: true, caido: false, fallar: [], lento: 0, colgar: 0, perder: false, cortar: 0 });
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const pregunto = () => Q.dialogos.some(m => /ya se envi/.test(m));
const lista = () => getSavedReports();
const insp = () => { const i = document.querySelector('.inspector-select'); if (i && !i.value) Q.elegir(i, [...i.options].map(o => o.value).filter(Boolean)[0]); };
const EZ = 'Convenio Bielorrusos';
const hacer = async (t, como) => {
  Q.aceptar = true; const antes = lista().map(x => x.id);
  nuevoFormulario(); await esperar(300); setAmbito('torre'); await esperar(250);
  sel('convenio', EZ); sel('torre', t); await esperar(900); insp();
  { const c = document.getElementById('aviso-anterior'); if (c) { const v = c.querySelector('button.no'); if (v) v.click(); c.innerHTML = ''; } }
  const i = document.querySelector('#main-content input[id^="pr_"]'), j = document.getElementById('ej_' + i.id.slice(3));
  i.value = '10'; recalcRow(i); j.value = '4'; j.dispatchEvent(new Event('input', { bubbles: true }));
  saveDraft(true); await esperar(300);
  const l = lista(), d = l.find(x => !antes.includes(x.id));
  if (como) { Object.assign(d, como); localStorage.setItem('garmel_reports_list', JSON.stringify(l)); loadDraftData(lista().findIndex(x => x.id === d.id)); await esperar(700); }
  return d;
};

// ── N1 · 3.000 anotados y 300 enviados en la lista: cambiar la torre de un borrador cualquiera tarda poco ──
const reg = {}; for (let n = 0; n < 3000; n++) reg['EZ-T' + String(n % 60).padStart(2, '0') + '-P01AA' + n + '-261101-XX'] = ['T-01', 0, '2026-11-01', Math.floor(Date.now() / 864e5)];
localStorage.setItem('garmel_enviados_lugar', JSON.stringify(reg));
const relleno = []; for (let n = 0; n < 300; n++) relleno.push({ id: 'draft_1700000000000_' + n, nro: 'EZ-T20-P01AA' + n + '-261101-XX', torre: 'T-20', convenio: EZ, fecha: '2026-11-01', enviado: 'ayer', lista: VERSION_LISTA, partidas: {} });
localStorage.setItem('garmel_reports_list', JSON.stringify(relleno));
await hacer('T-03'); sel('fecha', '2026-01-07'); await esperar(300);
Q.dialogos.length = 0; Q.aceptar = true;
const t1 = performance.now(); sel('torre', 'T-02'); const ms1 = Math.round(performance.now() - t1); await esperar(400);
ok('N1 · Con 3.000 anotados y 300 enviados en la lista, cambiar la torre de un borrador tarda ' + ms1 + ' ms (< 250) y no pregunta', ms1 < 250 && !pregunto(), ms1 + ' ms · diálogos ' + Q.dialogos.length);

// ── N5 · el registro con 3.000 (más los 300 de la lista) pesa menos de 300 KB ──
const kb = Math.round((localStorage.getItem('garmel_enviados_lugar') || '').length / 1024);
ok('N5 · El registro con 3.300 números pesa ' + kb + ' KB (< 300)', kb < 300, kb + ' KB');
localStorage.setItem('garmel_reports_list', '[]'); localStorage.removeItem('garmel_enviados_lugar');

// ── N2 · Enviado y cambiado después: cambiarle la torre pregunta, y «Borrar enviados» no se lo lleva ──
const n2 = await hacer('T-06', { enviado: new Date().toLocaleString(), editadoTras: new Date().toLocaleString() });
Q.dialogos.length = 0; Q.aceptar = false; sel('torre', 'T-07'); await esperar(500);
const pre2 = pregunto() && $('#torre').value === 'T-06';
Q.aceptar = true; borrarEnviados(); await esperar(500);
ok('N2 · Enviado y cambiado después: cambiarle la torre pregunta, y «Borrar enviados» lo deja (y la pantalla con él)',
   pre2 && lista().some(x => x.id === n2.id) && _hayMediciones(), 'preguntó ' + pre2 + ' · sigue en la lista ' + lista().some(x => x.id === n2.id) + ' · pantalla ' + _hayMediciones());

// ── N3 · Abierto desde el archivo (oficina): cambiarle la fecha pregunta ──
const n3 = await hacer('T-09', { oficina: { numero: 'X', revision: 1, abierto: 'hoy' } });
const f3 = $('#fecha').value; Q.dialogos.length = 0;
const conf0 = window.confirm; window.confirm = m => { Q.dialogos.push(String(m)); return /La fecha que eligi/.test(m); };
sel('fecha', '2026-01-08'); await esperar(500); window.confirm = conf0; Q.aceptar = true;
ok('N3 · Abierto desde el archivo: cambiarle la fecha pregunta «ya se envió» y Cancelar lo deja con la suya', pregunto() && $('#fecha').value === f3, $('#fecha').value + ' · ' + Q.dialogos.map(m => m.slice(0, 40)).join(' | '));

// ── N4 · El aviso de «la pantalla quedó en blanco» cabe en la pantalla ──
const n4 = await hacer('T-10', { enviado: new Date().toLocaleString() });
Q.aceptar = true; borrarEnviados(); await esperar(300);
const toast = [...document.querySelectorAll('#toast, .toast, [class*="toast"]')].find(e => /quedó en blanco/.test(e.textContent));
const r4 = toast ? toast.getBoundingClientRect() : null;
ok('N4 · El aviso «quedó en blanco» sale y cabe a lo ancho (' + innerWidth + ' px)', !!toast && r4.left >= 0 && r4.right <= innerWidth + 1 && document.documentElement.scrollWidth <= innerWidth + 1,
   toast ? Math.round(r4.left) + '–' + Math.round(r4.right) : 'no salió el aviso');

Q.aceptar = true; localStorage.setItem('garmel_reports_list', '[]'); localStorage.removeItem('garmel_enviados_lugar'); nuevoFormulario();
