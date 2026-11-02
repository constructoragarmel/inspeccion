// ESTRÉS 21 · diez rondas sobre la nomenclatura letra + piso de la T-04 y la T-43 (2-nov-2026, «eso no rompe nada, no?»): el
// formulario de punta a punta, borradores viejos de la T-04 abiertos y enviados, la planilla con el historial real, la PB, la T-43
// entera y que Ezequiel Zamora y Simón Bolívar sigan como antes. N1 a N10. Se corre en inspeccion.html?prueba=1 a 375×812.
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem('garmel_reports_list', '[]');
localStorage.removeItem('garmel_cortes'); Object.keys(_cortes).forEach(k => delete _cortes[k]);
const limpiar = () => Object.keys(localStorage).filter(k => /^garmel_planilla_/.test(k)).forEach(k => localStorage.removeItem(k));
limpiar(); Q.aceptar = true;
await Q.relevo({ caido: false, fallar: [], lento: 0, colgar: 0, perder: false, cortar: 0, borrar: true });
{ const real = await (await fetch('/reales/SR-T-04.json?' + Date.now())).json(); const inf = {};
  Object.keys(real.informes || {}).filter(k => k !== 'TORRE').forEach(k => { inf[k] = real.informes[k]; });
  await Q.relevo({ sembrarAvance: { sector: 'SR', torre: 'T-04', prueba: true, informes: inf } }); }
await Q.relevo({ sembrarAvance: { sector: 'SR', torre: 'T-43', prueba: true, informes: {} } });
await Q.relevo({ sembrarAvance: { sector: 'EZ', torre: 'T-11', prueba: true, informes: {} } });
const HOY = new Date().toISOString().slice(0, 10), W = innerWidth;
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const visible = e => !!e && e.style.display !== 'none' && e.getBoundingClientRect().height > 0;
const opts = () => [...$('#apto-sel').options].map(o => o.value).filter(Boolean).join(',');
const E = () => _plEstado();
const elegirApto = async a => { const s = $('#apto-sel'); s.value = a; s.dispatchEvent(new Event('change', { bubbles: true })); await esperar(150); };
// La 3.01 se mide en % donde no hay presupuesto y en puntos (proyectado / ejecutado) donde lo hay, como la T-04.
const medir = () => { const i = CODIGOS_SUB.hito_servicios.indexOf('3.01'), pon = (id, v) => { const e = document.getElementById(id); if (!e) return false; e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); return true; };
  if (!pon('pm_hito_servicios_' + i, '60')) { pon('pr_hito_servicios_' + i, '4'); pon('ej_hito_servicios_' + i, '2'); } };
const cabecera = async (conv, torre) => {
  nuevoFormulario(); await esperar(300); setAmbito('apartamento'); await esperar(200);
  sel('fecha', HOY); sel('convenio', conv); sel('torre', torre); await esperar(400);
  { const ins = document.querySelector('.inspector-select'); Q.elegir(ins, [...ins.options].map(o => o.value).filter(Boolean)[0]); await esperar(300); }
  if (!document.querySelector('#estatus .ck-lbl.on')) [...document.querySelectorAll('#estatus .ck-lbl')].find(l => /progreso/.test(l.textContent)).click();
};
const nro = () => ($('#nro-display') || {}).textContent || '';

// ── N1 · Formulario T-04 de punta a punta: piso 5, D05, medir, «Guardar y otro apto» ──
await cabecera('Convenio Rusos', 'T-04'); sel('piso', 'Piso 05'); await esperar(150); await elegirApto('D05'); medir();
const n1 = nro();
siguienteApartamento(); await esperar(800);
const g1 = getSavedReports().find(b => /T04-P05AD05-/.test(b.nro || ''));
ok('N1 · T-04 piso 5: D05 da …-P05AD05-…, se guarda, y «Guardar y otro apto» deja el piso y la lista A05…J05 lista para el siguiente',
   /-SR-T04-P05AD05-\d{6}-/.test(n1) && !!g1 && g1.apto === 'D05' && document.getElementById('piso').value === 'Piso 05' && !$('#apto').value && visible($('#apto-sel')) && opts() === 'A05,B05,C05,D05,E05,F05,G05,H05,I05,J05',
   n1 + ' · ' + opts());
// ── N2 · «Repetir en otros apartamentos» ofrece los del piso ──
await elegirApto('E05'); medir();
abrirRepetir(); await esperar(200);
const ofrece = [...document.querySelectorAll('#repetir-modal .repetir-lista input')].map(i => i.value).join(',');
ok('N2 · «Repetir» en la T-04 piso 5 ofrece A05…J05 menos el actual (E05)', ofrece === 'A05,B05,C05,D05,F05,G05,H05,I05,J05', ofrece);
$('#repetir-no').click(); await esperar(150);
// ── N3 · Un borrador viejo de la T-04 («C7» en el piso 7) abierto en el formulario ──
const base = getSavedReports().find(b => /P05AD05/.test(b.nro));
const viejo = Object.assign(JSON.parse(JSON.stringify(base)), { id: 'draft_' + (Date.now() - 3600e3), nro: 'PRUEBA-SR-T04-P07AC7-' + HOY.slice(2).replace(/-/g, '') + '-XX', piso: 'Piso 07', apto: 'C7', enviado: false });
const l3 = getSavedReports(); l3.push(viejo); localStorage.setItem('garmel_reports_list', JSON.stringify(l3));
loadDraftData(getSavedReports().length - 1); await esperar(1200);
ok('N3 · Abrir un borrador viejo con «C7» en el piso 7: queda C07 elegido en la lista del piso 7', $('#apto').value === 'C07' && visible($('#apto-sel')) && $('#apto-sel').value === 'C07' && /A07/.test(opts()), $('#apto').value + ' · ' + opts().slice(0, 30));
// ── N4 · «Enviar todos» con borradores viejos: «C7» sale como C07; un «C3» en el piso 2 (error de tipeo) no sale y dice cuáles son ──
nuevoFormulario(); await esperar(300);
const malo = Object.assign(JSON.parse(JSON.stringify(base)), { id: 'draft_' + (Date.now() - 1800e3), nro: 'PRUEBA-SR-T04-P02AC3-' + HOY.slice(2).replace(/-/g, '') + '-XX', piso: 'Piso 02', apto: 'C3', enviado: false });
const l4 = getSavedReports(); l4.push(malo); localStorage.setItem('garmel_reports_list', JSON.stringify(l4));
Q.dialogos.length = 0; await enviarPendientes(); await hasta(() => !_tandaEnCurso, 60000); await esperar(500);
const env4 = (await Q.envios()).filter(e => /SR-T04-/.test(e.numero || ''));
const c7 = env4.find(e => /P07AC7/.test(e.numero)), c3 = env4.find(e => /P02AC3/.test(e.numero)), dlg = Q.dialogos.join(' | ');
ok('N4 · El viejo «C7» sale con apto C07; el «C3» del piso 2 no sale y el aviso dice que en la T-04 son A02…J02', !!c7 && c7.datos.apto === 'C07' && !c3 && /C3/.test(dlg) && /A02/.test(dlg),
   (c7 ? c7.numero + ' apto ' + c7.datos.apto : 'C7 no salió') + ' · ' + dlg.replace(/\s+/g, ' ').slice(0, 220));
// ── N5 · Planilla T-04 con el historial real: el C7 viejo se ve en C07, cargar C07 y reabrir muestra lo nuevo ──
localStorage.setItem('garmel_reports_list', '[]');
await cabecera('Convenio Rusos', 'T-04'); abrirPlanilla(); await hasta(() => E().P && E().P.origenPrev === 'del archivo', 15000); await esperar(250);
const antes5 = E().P.prev.P07AC07 && E().P.prev.P07AC07.nro;   // el C7 real (SR-T04-P07AC7-261027-GM, sin %), empalmado como C07
_plIr({ vista: 'tel', piso: 7, hitoSel: 'cap_sanitarias' }); await esperar(100);
$('#planilla .pl-c[data-k="P07AC07"][data-c="3.01"]').click(); await esperar(60); $('#pl-sheet [data-r="100"]').click(); $('#pl-ksi').click(); await esperar(60);
$('#pl-rev').click(); await esperar(100); if ($('#pl-rr')) $('#pl-rr').click(); $('#pl-rgua').click(); await esperar(700);
const b5 = getSavedReports().find(b => /T04-P07AC07-/.test(b.nro || ''));
cerrarPlanilla(); await esperar(200); abrirPlanilla(); await hasta(() => E().P && /archivo|teléfono/.test(E().P.origenPrev || ''), 15000); await esperar(250);
ok('N5 · El C7 viejo aparece como C07 (con su gris), el informe nuevo sale …-P07AC07-… y al reabrir C07 muestra 100', /-P07AC7-/.test(antes5 || '') && !!b5 && E().P.prev.P07AC07.pcts['3.01'] === 100 && !E().P.aptos.some(x => x.k === 'P07AC7'),
   'antes ' + antes5 + ' · ' + (b5 && b5.nro) + ' · ahora ' + (E().P.prev.P07AC07 && E().P.prev.P07AC07.pcts['3.01']));
// ── N6 · La planta baja de la T-04: sin lista; se puede agregar un apartamento a mano ──
_plIr({ vista: 'tel', piso: 0, hitoSel: 'cap_sanitarias' }); await esperar(120);
const pb0 = E().P.aptos.filter(x => x.p === 0).length;
$('#pl-mas').click(); await esperar(80); { const e = document.getElementById('pl-np'); e.value = '0'; e.dispatchEvent(new Event('input', { bubbles: true })); }
{ const e = document.getElementById('pl-np2'); e.value = '0'; e.dispatchEvent(new Event('input', { bubbles: true })); } { const e = document.getElementById('pl-na'); e.value = 'Local 1'; e.dispatchEvent(new Event('input', { bubbles: true })); }
$('#pl-nsi').click(); await esperar(150);
ok('N6 · En la PB de la T-04 no hay lista (ningún A00) y «＋ Apartamentos» agrega uno ahí', pb0 === 0 && E().P.aptos.some(x => x.p === 0) && !E().P.aptos.some(x => /^[A-J]00$/.test(x.a)), pb0 + ' → ' + E().P.aptos.filter(x => x.p === 0).map(x => x.a).join(','));
cerrarPlanilla(); await esperar(200);
// ── N7 · La T-43 entera: PB a 15, diez por piso con su número, hojas impresas completas, 44 px ──
await cabecera('Convenio Rusos', 'T-43'); abrirPlanilla(); await hasta(() => E().P && !!$('#pl-cuerpo .pl-g, #pl-cuerpo .pl-piso'), 15000); await esperar(250);
const P7 = E().P, p15 = P7.aptos.filter(x => x.p === 15).map(x => x.a).join(',');
_plIr({ vista: 'tel', piso: 15, hitoSel: 'cap_sanitarias' }); await esperar(120);
const chicos = [...document.querySelectorAll('#planilla .pl-c, #planilla .pl-apto')].filter(e => { const r = e.getBoundingClientRect(); return r.width && r.height < 44; }).length;
_plIr({ vista: 'imp', tamano: 'compacta' }); await esperar(200);
const cubre = new Set([...document.querySelectorAll('#planilla .pl-hoja tbody th')].map(t => t.textContent.trim())).size;
ok('N7 · T-43: 150 apartamentos (1 a 15 × 10, sin PB), el 15 con A15…J15, todo de 44 px, y las hojas los cubren todos',
   P7.aptos.length === 150 && p15 === 'A15,B15,C15,D15,E15,F15,G15,H15,I15,J15' && !chicos && cubre >= 150 && document.documentElement.scrollWidth <= W + 1, P7.aptos.length + ' · ' + p15 + ' · chicos ' + chicos + ' · hojas ' + cubre);
cerrarPlanilla(); await esperar(200);
// ── N8 · Ezequiel Zamora sigue igual: A1, A2, B1, B2 en todos los pisos (también PB) y el apartamento no cambia al cambiar de piso ──
await cabecera('Convenio Bielorrusos', 'T-11'); sel('piso', 'Piso 03'); await esperar(150); await elegirApto('B2');
sel('piso', 'Piso 09'); await esperar(150);
const ez = opts(), aEz = $('#apto').value;
abrirPlanilla(); await hasta(() => E().P && !!$('#pl-cuerpo .pl-g'), 15000); await esperar(200);
const pbEz = E().P.aptos.filter(x => x.p === 0).map(x => x.a).join(',');
ok('N8 · EZ: lista A1, A2, B1, B2 en todos los pisos y en PB; cambiar de piso no toca el apartamento (B2)', ez === 'A1,A2,B1,B2' && aEz === 'B2' && pbEz === 'A1,A2,B1,B2', ez + ' · ' + aEz + ' · PB ' + pbEz);
cerrarPlanilla(); await esperar(200);
// ── N9 · Simón Bolívar J-09 sigue con su lista por par de torres ──
await cabecera('Convenio Chinos', 'J-09'); sel('piso', 'Piso 04'); await esperar(150);
ok('N9 · SB J-09 sigue con E11, E12, D11, D12, A1, A2, C1, C2', opts() === 'E11,E12,D11,D12,A1,A2,C1,C2', opts());
// ── N10 · Simón Rodríguez sin lista (T-38) sigue con el campo libre ──
await cabecera('Convenio Rusos', 'T-38'); sel('piso', 'Piso 04'); await esperar(150);
ok('N10 · SR T-38 (sin lista) sigue con el campo libre', visible($('#apto')) && !visible($('#apto-sel')));
nuevoFormulario(); localStorage.setItem('garmel_reports_list', '[]'); limpiar();
