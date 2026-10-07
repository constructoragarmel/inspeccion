// TANDA 47 · V105 (1-oct-2026): el ámbito «Estructura» en inspeccion.html, a 375×812.
// 1 el botón y lo que muestra · 2 el número lleva ESTR · 3 lo que viaja · 4 el % · 5 ir a Torre completa y volver
// 6 ir a Apartamento y volver · 7 el borrador reabre en Estructura · 8 el envío · 9 la visita anterior no se cruza con
// la de torre completa (archivo) · 10 ni en el teléfono · 11 cabe en la pantalla
localStorage.setItem('garmel_rol', 'inspector');
localStorage.setItem('garmel_clave_envio', 'qc');
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const put = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
const limpiar = async () => { Q.aceptar = true; nuevoFormulario(); await esperar(300); };
const pct = rid => (document.getElementById('pct_' + rid)?.innerText || '').trim();
const badge = h => (document.getElementById('badge_' + h)?.innerText || '').trim();
const est = (rid, v) => setEstado(document.querySelector(`.est-btn[data-rid="${rid}"][data-v="${v}"]`), v);
const cabecera = () => {
  if (!document.getElementById('fecha').value) sel('fecha', '2026-10-01');
  sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-07');
  const emp = [...document.getElementById('empresa').options].map(o => o.value);
  sel('empresa', emp.find(x => /ALNAVIC/i.test(x)) || emp[1]);
  const insp = document.querySelector('.inspector-select');
  insp.value = [...insp.options].map(o => o.value).find(v => /Carlos J\. Colmenares/.test(v)); insp.dispatchEvent(new Event('change', { bubbles: true }));
  const res = document.querySelector('#residentes-container input'); if (res) put(res.id || (res.id = 'res0'), 'Ing. Prueba');
  if (!document.querySelector('#estatus .ck-lbl.on')) document.querySelector('#estatus .ck-lbl').click();
};
const visibles = () => { const out = []; _hitosDelAmbito().forEach(p => p.items.forEach((_, i) => { if (_aplica(p.id, i)) out.push(CODIGOS_SUB[p.id][i]); })); return out; };
const aLaVista = id => { const c = document.getElementById(id)?.closest('.field'); return !!c && getComputedStyle(c).display !== 'none'; };
const marcado = id => /background:\s*var\(--blue\)/.test(document.getElementById(id).style.cssText);
const nro = () => document.getElementById('nro-display').textContent;
await Q.relevo({ caido: false, fallar: [], lento: 0, borrar: true });

// ── 1. El botón ──
await limpiar(); cabecera();
const bE = document.getElementById('btnAmbEstr');
setAmbito('estructura'); await esperar(200);
const v1 = visibles();
ok('1 · «Estructura» es el tercer botón de «Ámbito del informe»; al tocarlo quedan solo las 6 filas del hito de estructura, sin piso ni apartamento',
   !!bE && /Estructura/.test(bE.textContent) && bE.previousElementSibling.id === 'btnAmbTorre' && v1.join(',') === '1.01,1.02,1.03,1.04,1.05,1.06' &&
   !aLaVista('piso') && !aLaVista('apto') && marcado('btnAmbEstr') && !marcado('btnAmbTorre') && !marcado('btnAmbApto') &&
   [...document.querySelectorAll('[id^="p_hito_"]')].filter(b => getComputedStyle(b).display !== 'none').length === 1,
   v1.join(',') + ' · hitos a la vista: ' + [...document.querySelectorAll('[id^="p_hito_"]')].filter(b => getComputedStyle(b).display !== 'none').length);

// ── 2. El número ──
ok('2 · El número del informe lleva ESTR donde el de apartamento lleva piso y apartamento, y las iniciales CJ', /^PRUEBA-EZ-T07-ESTR-261001-CJ$/.test(nro()), nro());

// ── 3 y 4. Lo que viaja y el % ──
est('hito_estructura_3', 100); est('hito_estructura_4', 50);
const d3 = getFormData();
ok('3 · En los datos viaja «torre» como ámbito y «estructura» como vista, y solo el hito de estructura, con sus 6 filas',
   d3.ambito === 'torre' && d3.vista === 'estructura' && Object.keys(d3.partidas).join(',') === 'hito_estructura,hito_estructura_extra' &&
   d3.partidas.hito_estructura.length === 6 && !d3.partidas.hito_estructura.some(r => r.fueraDeAmbito) && d3.partidas.hito_estructura[4].ej === '50',
   d3.ambito + ' / ' + d3.vista + ' · ' + Object.keys(d3.partidas).join(','));
ok('4 · Obras preliminares 100 % y escaleras (suministro) 50 %: el hito da 75 %, y el total se llama «% avance de estructura de la torre»',
   badge('hito_estructura') === '75%' && /ESTRUCTURA DE LA TORRE/.test(document.getElementById('total-titulo').textContent),
   badge('hito_estructura') + ' · ' + document.getElementById('total-titulo').textContent);

// ── 5. A torre completa y de vuelta ──
setAmbito('torre'); await esperar(200);
const v5 = visibles(), n5 = nro(), p5 = pct('hito_estructura_4');
setAmbito('estructura'); await esperar(200);
ok('5 · «Torre completa» sigue igual: 58 filas con estructura adentro, sin ESTR en el número y con lo medido; al volver a «Estructura» sigue ahí',
   v5.length === 58 && v5.indexOf('1.02') >= 0 && n5 === 'PRUEBA-EZ-T07-261001-CJ' && p5 === '50%' && marcado('btnAmbEstr') &&
   visibles().length === 6 && pct('hito_estructura_4') === '50%', v5.length + ' filas · ' + n5 + ' · escaleras ' + p5);

// ── 6. A apartamento y de vuelta ──
setAmbito('apartamento'); await esperar(200); sel('piso', 'Piso 03'); put('apto', 'A');
const n6 = nro(), v6 = visibles().length;
setAmbito('estructura'); await esperar(200);
const n6b = nro();
setAmbito('apartamento'); await esperar(200);
ok('6 · De apartamento a estructura y de vuelta: 50 filas de apartamento, el piso y el apartamento se conservan',
   v6 === 50 && /-P03AA-/.test(n6) && /-ESTR-/.test(n6b) && document.getElementById('piso').value === 'Piso 03' && document.getElementById('apto').value === 'A' && /-P03AA-/.test(nro()),
   v6 + ' filas · ' + n6 + ' → ' + n6b + ' → ' + nro());

// ── 7. El borrador ──
setAmbito('estructura'); await esperar(200);
currentEditingIndex = null; _idEnEdicion = null; saveDraft(true); await esperar(300);
const guardado = JSON.parse(localStorage.getItem('garmel_reports_list') || '[]')[0] || {};
await limpiar(); const sigue = vista === 'estructura';   // un formulario nuevo se queda en el modo que se venía usando, como con «Torre»
setAmbito('apartamento'); await esperar(200);
const limpio = visibles().length;
loadDraftData(0); await esperar(500);
ok('7 · El borrador guarda la vista y reabre en «Estructura» aunque el formulario esté en otro ámbito; un formulario nuevo se queda en «Estructura»',
   guardado.vista === 'estructura' && guardado.ambito === 'torre' && sigue && limpio === 50 && marcado('btnAmbEstr') && visibles().length === 6 &&
   /-ESTR-/.test(nro()) && pct('hito_estructura_3') === '100%', 'guardado: ' + guardado.ambito + '/' + guardado.vista + ' · reabierto ' + visibles().length + ' filas · ' + nro());

// ── 8. El envío ──
document.getElementById('btn-enviar-relevo').disabled = false;
if (typeof refrescarEstadoClave === 'function') refrescarEstadoClave();
await enviarAlRelevo();
await esperar(800); await hasta(() => !/enviando/i.test(document.getElementById('sendLog').textContent), 20000);
const env = (await Q.envios()).slice(-1)[0] || {};
const pd = (env.datos || {}).partidas || {};
ok('8 · El envío sale con ESTR en el número, ámbito torre, vista estructura y solo el hito de estructura',
   /^PRUEBA-EZ-T07-ESTR-261001-CJ/.test(env.numero || '') && env.ambito === 'torre' && (env.datos || {}).vista === 'estructura' &&
   Object.keys(pd).join(',') === 'hito_estructura,hito_estructura_extra' && pd.hito_estructura[3].ej === '100',
   (env.numero || 'sin envío') + ' · ' + env.ambito + '/' + ((env.datos || {}).vista) + ' · ' + Object.keys(pd).join(','));

// ── 9. La visita anterior, desde el archivo ──
localStorage.removeItem('garmel_reports_list');           // teléfono sin informes: solo queda lo del relevo
const pedir = async vista => { await limpiar(); cabecera(); setAmbito(vista); await esperar(200); return await _anteriorDelArchivo(); };
const aTorre = await pedir('torre'), aEstr = await pedir('estructura');
ok('9 · El archivo no le ofrece el informe de estructura a quien hace la torre completa; a quien hace estructura sí, y sin cantidades de apartamentos',
   aTorre && aTorre.mismo == null && aEstr && aEstr.mismo && /-ESTR-/.test(aEstr.mismo.nro) && aEstr.deLaTorre == null,
   'torre: ' + JSON.stringify(aTorre && aTorre.mismo && aTorre.mismo.nro) + ' · estructura: ' + (aEstr && aEstr.mismo && aEstr.mismo.nro));

// ── 10. La visita anterior, en el teléfono ──
await limpiar(); cabecera(); setAmbito('torre'); await esperar(200);
est('hito_estructura_3', 25); est('hito_exteriores_1', 50);
sel('fecha', '2026-09-30');
currentEditingIndex = null; _idEnEdicion = null; saveDraft(true); await esperar(300);
await limpiar(); cabecera(); setAmbito('estructura'); await esperar(200);
const locE = _anterioresLocales().length;
setAmbito('torre'); await esperar(200);
const locT = _anterioresLocales().length;
ok('10 · Un informe de torre completa guardado en el teléfono no se ofrece como anterior de uno de estructura, y sí de otro de torre', locE === 0 && locT === 1, 'estructura: ' + locE + ' · torre: ' + locT);

// ── 11. Maqueta ──
setAmbito('estructura'); await esperar(200);
const r = document.getElementById('btnAmbEstr').getBoundingClientRect();
ok('11 · Los tres botones caben a ' + innerWidth + ' px y «Estructura» mide al menos 44 px de alto',
   document.documentElement.scrollWidth <= innerWidth + 1 && r.right <= innerWidth && r.height >= 44, 'scrollWidth ' + document.documentElement.scrollWidth + ' · botón hasta ' + Math.round(r.right) + ' · alto ' + Math.round(r.height));
