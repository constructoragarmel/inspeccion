// TANDA 132 · cambio 194b (27-oct-2026): buscar por apartamento en el buscador de informes (Diego Orta: «por torre/apartamento»).
// Corre en los cuatro formularios (?prueba=1), con el relevo falso. 1 sobre la lista sale el filtro y cuántos informes hay ·
// 2 en obra, «a1» deja solo el apartamento A1 y «03 b2» solo el B2 del piso 03 (en los otros tres, el número deja su fila) ·
// 3 algo que no está deja cero y lo dice · 4 borrar el filtro vuelve a mostrar todo · 5 cambiar a 30 días vuelve a buscar con
// dias: 30 y lo dice · 6 «Ver PDF» sigue en cada fila · 7 nada se sale a 375 px y el filtro mide 44 px.
const OBRA = typeof enviarPendientes === 'function';
const CL = OBRA ? 'garmel_reports_list' : CLAVE_LISTA;
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem(CL, '[]');
if (!OBRA) { localStorage.removeItem(CLAVE_TORRES); localStorage.removeItem(CLAVE_ACTUAL); }
Q.aceptar = true;
await Q.relevo({ caido: false, fallar: [], lento: 0, colgar: 0, perder: false, borrar: true });
const sel = (id, v) => { const e = document.getElementById(id); if (!e) return; e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const put = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
let LUGAR = 'T-07'; const NROS = [];
if (OBRA) {
  for (const [piso, apto] of [['Piso 03', 'B2'], ['Piso 05', 'A1']]) {
    nuevoFormulario(); await esperar(300); setAmbito('apartamento'); await esperar(200);
    sel('fecha', '2026-10-26'); sel('convenio', 'Convenio Bielorrusos'); sel('torre', LUGAR); sel('piso', piso); put('apto', apto);
    const insp = document.querySelector('.inspector-select'); insp.value = [...insp.options].map(o => o.value).filter(Boolean)[0]; insp.dispatchEvent(new Event('change', { bubbles: true }));
    if (!document.querySelector('#estatus .ck-lbl.on')) document.querySelector('#estatus .ck-lbl').click();
    await esperar(400); { const a = document.getElementById('aviso-anterior'); if (a) a.innerHTML = ''; }
    let F = null; for (const h of PARTIDAS) { const i = (CODIGOS_SUB[h.id] || []).indexOf('4.01'); if (i >= 0) F = h.id + '_' + i; }
    document.querySelector(`.est-btn[data-rid="${F}"][data-v="50"]`).click();
    saveDraft(true); await esperar(200); NROS.push(document.getElementById('nro-display').textContent.trim());
    document.getElementById('claveEnvio').value = 'qc'; await enviarAlRelevo(); await esperar(800);
  }
  localStorage.setItem(CL, '[]'); nuevoFormulario(); await esperar(300); sel('convenio', 'Convenio Bielorrusos'); sel('torre', LUGAR); await esperar(300);
} else {
  LUGAR = TIPO_INFORME === 'urbanismo' ? [...document.getElementById('torre').options].map(o => o.value).filter(Boolean)[0] : 'T-01';
  nuevoInforme(); await esperar(300); sel('convenio', 'Convenio Bielorrusos'); sel('torre', LUGAR); sel('fecha', '2026-10-26'); await esperar(600);
  if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
  const ins = document.querySelector('#inspectores select'); if (ins) Q.elegir(ins, [...ins.options].map(o => o.value).filter(v => v && v !== 'OTRO')[0]);
  const est = document.getElementById('estatus'); if (est && est.tagName === 'SELECT') est.value = [...est.options].map(o => o.value).filter(Boolean)[0];
  const item = document.querySelector('[id^="items-"] .item'); const si = item && [...item.querySelectorAll('button')].find(b => /^S[ií]$/i.test(b.textContent.trim()));
  if (si) si.click(); else { const c = item && item.querySelector('.cant'); if (c) { c.value = '7'; c.dispatchEvent(new Event('input', { bubbles: true })); } }
  guardar(false); await esperar(300); const d0 = listaGuardada()[0]; NROS.push(d0.nro);
  await enviarSolo(d0.id); await esperar(800);
  localStorage.setItem(CL, '[]'); nuevoInforme(); await esperar(300); sel('convenio', 'Convenio Bielorrusos'); sel('torre', LUGAR); await esperar(300);
  if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
}
_ES_OFICINA = true; _oficinaMostrar();
const pedidos = []; const _fetch = window.fetch; window.fetch = function(u, o){ try { const b = JSON.parse((o && o.body) || '{}'); if (b.accion === 'oficina-lista') pedidos.push(b); } catch (e) {} return _fetch.apply(this, arguments); };
await oficinaBuscar(); await esperar(300);
const filtro = $('#ofi-filtro'), visibles = () => $$('#ofi-lista table tr').slice(1).filter(tr => tr.style.display !== 'none');
const escribe = v => { filtro.value = v; filtro.dispatchEvent(new Event('input', { bubbles: true })); };
ok('1 · Sobre la lista sale el filtro y cuántos informes hay', !!filtro && /\d+ informes?/.test($('#ofi-cuenta').textContent) && visibles().length === NROS.length && pedidos[0] && pedidos[0].dias === 14, ($('#ofi-cuenta') || {}).textContent + ' · ' + visibles().length);
if (OBRA) {
  escribe('a1'); const v1 = visibles().map(tr => tr.innerText);
  escribe('03 b2'); const v2 = visibles().map(tr => tr.innerText);
  ok('2 · «a1» deja solo el A1 y «03 b2» solo el B2 del piso 03', v1.length === 1 && /A1/.test(v1[0]) && v2.length === 1 && /Piso 03/.test(v2[0]) && /B2/.test(v2[0]) && /1 de 2/.test($('#ofi-cuenta').textContent), v1.length + ' · ' + v2.length);
} else {
  escribe(NROS[0].slice(-12).toLowerCase()); const v1 = visibles();
  ok('2 · El número deja su fila', v1.length === 1 && v1[0].innerText.indexOf(NROS[0]) >= 0, v1.length);
}
escribe('zzz-no-esta'); ok('3 · Algo que no está deja cero y lo dice', visibles().length === 0 && /^0 de/.test($('#ofi-cuenta').textContent), $('#ofi-cuenta').textContent);
escribe(''); ok('4 · Sin filtro vuelve todo', visibles().length === NROS.length, visibles().length);
const d = $('#ofi-dias'); d.value = '30'; d.dispatchEvent(new Event('change', { bubbles: true })); await hasta(() => pedidos.length >= 2, 5000, 100); await esperar(300);
ok('5 · A 30 días vuelve a buscar con dias: 30 y lo deja elegido', pedidos.length === 2 && pedidos[1].dias === 30 && $('#ofi-dias').value === '30', JSON.stringify(pedidos.map(p => p.dias)));
ok('6 · «Ver PDF» sigue en cada fila', $$('#ofi-lista table tr').slice(1).every(tr => tr.querySelector('button.ofi-ver')));
const d2 = $('#ofi-dias'); d2.value = '14'; d2.dispatchEvent(new Event('change', { bubbles: true })); await esperar(600);
ok('7 · Nada se sale a 375 px y el filtro mide 44 px', document.documentElement.scrollWidth <= innerWidth + 1 && $('#ofi-filtro').offsetHeight >= 44, document.documentElement.scrollWidth + ' · ' + $('#ofi-filtro').offsetHeight);
window.fetch = _fetch; localStorage.setItem(CL, '[]'); _ES_OFICINA = false; _oficinaMostrar();
