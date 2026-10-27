// ESTRÉS 2 · v188 (27-oct-2026): QC7 a QC11 de lo construido, en URBANISMO (urbanismo.html?prueba=1, 375 px). Se corre dos veces:
// la primera deja un borrador con hoy/anterior y recarga la página. Sin datos reales.
// QC7 «Hoy» con coma decimal, letras, números grandes y sumas con decimales · QC8 cambiar de manzana suelta lo heredado, también
// hoy y anterior · QC9 «Bote de material» y «Desmalezamiento» (camiones de registro) conviven con el día · QC10 tres visitas
// encadenadas (10, +5, +2,5) y una recarga de la página en medio · QC11 una sección «Gas» agregada a mano con fotos no se absorbe
// (las fotos van por sección), y el rol de Planificación con proyectado sigue calculando el avance sobre el acumulado.
const items = sid => $$('#items-' + sid + ' .item');
const fijo = (sid, n) => items(sid).find(i => (i.querySelector('.nombre') || {}).textContent === n);
const v = (it, c) => it.querySelector(c).value;
const hoyIso = (() => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); })();
const cabecera = async (manzana) => { Q.elegir($('#convenio'), 'Convenio Bielorusos'); const t = $('#torre'); t.value = manzana; t.dispatchEvent(new Event('change', { bubbles: true })); $('#fecha').value = hoyIso; await esperar(400); if ($('#aviso-historial .no')) $('#aviso-historial .no').click(); const ins = document.querySelector('#inspectores select'); Q.elegir(ins, [...ins.options].map(o => o.value).filter(x => x && x !== 'OTRO')[0]); };
if (!sessionStorage.getItem('e2')) {
  localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem('garmel_urb_list', '[]');
  await Q.relevo({ caido: false, fallar: [], lento: 0, borrar: true });
  Q.aceptar = true;
  // ── QC7 ──
  nuevoInforme(); await esperar(300);
  const e = fijo('urb_drenaje', 'Excavación'), h = e.querySelector('.hoy'), a = e.querySelector('.ant');
  Q.escribir(h, '12,5'); const r1 = v(e, '.cant');
  Q.escribir(h, '1a2b'); const r2 = v(e, '.cant');
  Q.escribir(a, '999999.99'); Q.escribir(h, '0.01'); const r3 = v(e, '.cant');
  Q.escribir(a, '0.1'); Q.escribir(h, '0.2'); const r4 = v(e, '.cant');
  Q.escribir(a, ''); Q.escribir(h, ''); const r5 = v(e, '.cant');
  ok('QC7 · Coma decimal, letras, números grandes y decimales: 12.5 · 12 · 1000000 · 0.3 · vacío', r1 === '12.5' && r2 === '12' && r3 === '1000000' && r4 === '0.3' && r5 === '', [r1, r2, r3, r4, r5].join(' · '));
  // ── QC8 ──
  nuevoInforme(); await cabecera('M-5');
  const orig = estadosDeTorres;
  estadosDeTorres = () => ({ 'M-5': { nro: 'URB-EZ-M5-261026-GB', general: [{ id: 'urb_drenaje', nombre: '2. DRENAJE', items: [{ nombre: 'Excavación', cant: '100', ud: 'm³' }], obs: '' }] } });
  try { traerHistorial(); } finally { estadosDeTorres = orig; }
  const e8 = fijo('urb_drenaje', 'Excavación'); const her8 = v(e8, '.ant');
  const t8 = $('#torre'); t8.value = 'M-4'; t8.dispatchEvent(new Event('change', { bubbles: true })); await esperar(400); if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
  const e8b = fijo('urb_drenaje', 'Excavación');
  ok('QC8 · Cambiar de manzana suelta lo heredado: anterior, hoy y acumulado vacíos', her8 === '100' && v(e8b, '.ant') === '' && v(e8b, '.hoy') === '' && v(e8b, '.cant') === '', her8 + ' → ' + [v(e8b, '.ant'), v(e8b, '.hoy'), v(e8b, '.cant')].join('|'));
  // ── QC9 ──
  nuevoInforme(); await esperar(200);
  const bote = fijo('urb_preliminares', 'Bote de material'), des = fijo('urb_preliminares', 'Desmalezamiento');
  bote.querySelector('.camiones .btn-add').click(); Q.escribir(bote.querySelector('.camion .m3'), '7'); Q.escribir(bote.querySelector('.camion .placa'), 'AB1');
  Q.escribir(des.querySelector('.hoy'), '300'); des.querySelector('.camiones .btn-add').click(); Q.escribir(des.querySelector('.camion .m3'), '9');
  ok('QC9 · Bote de material calcula con camiones (7) y Desmalezamiento con «Hoy» (300) aunque tenga camiones de registro', v(bote, '.cant') === '7' && !bote.querySelector('.hoy') && v(des, '.cant') === '300' && !!des.querySelector('.hoy'), v(bote, '.cant') + ' · ' + v(des, '.cant'));
  // ── QC10, primera parte: visita 1 (hoy 10) enviada, y un borrador de la visita 2 con +5 ──
  localStorage.setItem('garmel_urb_list', '[]');   // lo de QC7 a QC9 se autoguardó: fuera, para no confundir los borradores
  nuevoInforme(); await cabecera('M-2');
  Q.escribir(fijo('urb_drenaje', 'Excavación').querySelector('.hoy'), '10'); guardar(false); await esperar(300);
  const d1 = listaGuardada().find(b => b.torre === 'M-2'); await enviarSolo(d1.id); await esperar(800);
  nuevoInforme(); await cabecera('M-2');
  const orig2 = estadosDeTorres; estadosDeTorres = () => ({ 'M-2': d1 });
  try { traerHistorial(); } finally { estadosDeTorres = orig2; }
  const e10 = fijo('urb_drenaje', 'Excavación'); Q.escribir(e10.querySelector('.hoy'), '5'); guardar(false); await esperar(300);
  sessionStorage.setItem('e2', listaGuardada().find(b => b.torre === 'M-2' && b.id !== d1.id).id);
  sessionStorage.setItem('e2r', JSON.stringify(Q.R));   // lo de antes de recargar se vuelve a contar en la segunda vuelta
  location.reload();
  throw 'recargando: vuelva a correr e2';
}
const id2 = sessionStorage.getItem('e2'); sessionStorage.removeItem('e2');
try { JSON.parse(sessionStorage.getItem('e2r') || '[]').forEach(x => Q.R.push(x)); } catch (e) {} sessionStorage.removeItem('e2r');
Q.aceptar = true;
cargarInforme(id2); await esperar(600);
const e10 = fijo('urb_drenaje', 'Excavación');
ok('QC10a · Después de recargar, la visita 2 sigue: anterior 10, hoy 5, acumulado 15', v(e10, '.ant') === '10' && v(e10, '.hoy') === '5' && v(e10, '.cant') === '15', [v(e10, '.ant'), v(e10, '.hoy'), v(e10, '.cant')].join('|'));
await enviarSolo(id2); await esperar(800);
const d2 = listaGuardada().find(b => b.id === id2);
nuevoInforme(); Q.elegir($('#convenio'), 'Convenio Bielorusos'); $('#torre').value = 'M-2';
const orig3 = estadosDeTorres; estadosDeTorres = () => ({ 'M-2': d2 });
try { traerHistorial(); } finally { estadosDeTorres = orig3; }
const e10c = fijo('urb_drenaje', 'Excavación'); Q.escribir(e10c.querySelector('.hoy'), '2,5');
ok('QC10b · Visita 3: hereda 15 y con 2,5 de hoy acumula 17.5', v(e10c, '.ant') === '15' && v(e10c, '.cant') === '17.5', [v(e10c, '.ant'), v(e10c, '.cant')].join('|'));
// ── QC11 ──
nuevoInforme();
const lista = listaGuardada();
lista.push({ id: 'urb_conFotos', tipo: 'urbanismo', nro: 'URB-EZ-M6-261020-GB', torre: 'M-6', convenio: 'Convenio Bielorusos', fecha: '2026-10-20', inspectores: [INSPECTORES_DB[1]], general: [
  { id: 'urb_x_gas', nombre: '10. GAS', items: [{ nombre: 'Zanja', agregado: true, cant: '4', sn: 'B' }], obs: 'con foto', fotos: [{ nombre: 'f1', enDrive: true }] }], noInspeccionados: [], apartamentos: [] });
localStorage.setItem('garmel_urb_list', JSON.stringify(lista));
cargarInforme('urb_conFotos'); await esperar(300);
ok('QC11a · Una «Gas» agregada a mano CON fotos no se absorbe: queda como estaba, con sus fotos', GENERAL.some(g => g.id === 'urb_x_gas') && !!document.getElementById('srv-urb_x_gas'), GENERAL.map(g => g.id).slice(-3).join(','));
if (typeof alternarPlanificacion === 'function') alternarPlanificacion(true);
nuevoInforme(); await esperar(200);
const p11 = fijo('urb_vialidad', 'Aceras'); Q.escribir(p11.querySelector('.ant'), '50'); Q.escribir(p11.querySelector('.hoy'), '25'); Q.escribir(p11.querySelector('.pr'), '300');
ok('QC11b · Con proyectado 300 y acumulado 75, el avance dice 25%', /25%/.test(p11.querySelector('.avance').textContent), p11.querySelector('.avance').textContent);
if (typeof alternarPlanificacion === 'function') alternarPlanificacion(false);
ok('QC11c · Nada se sale a 375 px', document.documentElement.scrollWidth <= innerWidth + 1, document.documentElement.scrollWidth + ' > ' + innerWidth);
nuevoInforme(); localStorage.setItem('garmel_urb_list', '[]'); localStorage.removeItem('garmel_urb_secciones');
