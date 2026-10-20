// TANDA 106 · QC 3 y 4 de la v178 (20-oct-2026), en urbanismo.html?prueba=1 (a la vista: envía).
// 3 · el caso de Gabriel de punta a punta: un informe de toda la zona Ezequiel Zamora que también afecta a Simón Bolívar y
// Simón Rodríguez se llena y se guarda; uno nuevo de toda la zona Simón Bolívar lo ofrece, al traerlo la empresa es la de
// urbanismo de Simón Bolívar y no la de EZ, el número es de SB, lo traído queda marcado y se envía con su zona.
// 4 · la memoria vieja «ZONA» de un teléfono que viene de la v177 pasa a la de su zona y se sigue ofreciendo.
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem(CLAVE_LISTA, '[]');
localStorage.removeItem(CLAVE_TORRES); localStorage.removeItem(CLAVE_ACTUAL);
Q.aceptar = true;
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); };
const modo = m => [...document.querySelectorAll('#campo-donde .donde button')].find(b => b.dataset.m === m).click();
const insp = () => { const i = document.querySelector('#inspectores select'); if (i) Q.elegir(i, [...i.options].map(o => o.value).find(v => /Gabriel Barrios/.test(v))); };
nuevoInforme(); await esperar(300);
modo('zona'); await esperar(200); sel('convenio', 'Convenio Bielorrusos'); await esperar(300);
sel('otra-lugar', 'Simón Bolívar'); await esperar(150); sel('otra-lugar', 'Simón Rodríguez'); await esperar(150);
insp(); sel('fecha', '2026-10-19');
const cant = document.querySelector('[id^="items-"] .item input.cant, [id^="items-"] .item input[type=text]');
if (cant) { cant.value = '14.55'; cant.dispatchEvent(new Event('input', { bubbles: true })); }
const obs = document.querySelector('[id^="items-"] .item textarea'); if (obs) { obs.value = 'Demolición de carpeta asfáltica'; obs.dispatchEvent(new Event('input', { bubbles: true })); }
guardar(false); await esperar(300);
const g = listaGuardada()[0];
ok('3a · El de toda la zona EZ con otras dos zonas se guarda con su ubicación y número', g && g.torre === 'ZONA' && g.convenio === 'Convenio Bielorrusos' && (g.ubicacion.otras || []).join() === 'Simón Bolívar,Simón Rodríguez' && /^PRUEBA-URB-EZ-ZONA-261019-GB$/.test(g.nro),
   g && (g.nro + ' · ' + JSON.stringify(g.ubicacion)));
nuevoInforme(); await esperar(300);
modo('zona'); await esperar(200); sel('convenio', 'Convenio Chinos'); await esperar(500);
const av = $('#aviso-historial').innerText;
ok('3b · En uno nuevo de toda la zona Simón Bolívar se ofrece el de Gabriel, diciendo de dónde viene', /Es el de toda la zona Ezequiel Zamora/.test(av), av.slice(0, 140));
const si = $('#aviso-historial .si'); if (si) si.click(); await esperar(400);
insp(); sel('fecha', '2026-10-20'); await esperar(200);
const d = datosDelFormulario();
const heredados = document.querySelectorAll('.item.heredado').length;
ok('3c · Al traerlo: zona y empresa de Simón Bolívar (RACAR), número de SB, lo traído marcado «visita anterior»',
   d.convenio === 'Convenio Chinos' && /RACAR/.test(d.empresa) && /^PRUEBA-URB-SB-ZONA-261020-GB$/.test(numeroInforme()) && heredados >= 1,
   d.empresa + ' · ' + numeroInforme() + ' · ' + heredados + ' heredado(s)');
// confirmar lo heredado (tocarlo) y enviar
document.querySelectorAll('.item.heredado input, .item.heredado textarea').forEach(el => el.dispatchEvent(new Event('input', { bubbles: true })));
guardar(false); await esperar(300);
const sb = listaGuardada().find(x => /-SB-ZONA-/.test(x.nro)); const env0 = (await Q.envios()).length; const nro = sb && sb.nro;
Q.dialogos.length = 0; if (sb) await enviarSolo(sb.id); await esperar(800);
const e = (await Q.envios()).slice(env0).filter(x => x.numero === nro)[0];
ok('3d · Se envía con la zona Simón Bolívar', e && (e.datos || {}).convenio === 'Convenio Chinos' && (e.datos || {}).torre === 'ZONA', e ? e.numero + ' · ' + (e.datos || {}).convenio : 'no llegó · ' + Q.dialogos.join(' | ').slice(0, 120));
// 4 · la memoria vieja
localStorage.setItem(CLAVE_TORRES, JSON.stringify({ ZONA: { id: 'viejo', nro: 'PRUEBA-URB-SR-ZONA-261015-ER', fecha: '2026-10-15', guardado: '2026-10-15 10:00', convenio: 'Convenio Rusos',
  general: [{ id: 'urb_preliminares', items: [{ nombre: 'Movimiento de tierra', cant: '10' }] }], apartamentos: [] } }));
const m4 = estadosDeTorres();
ok('4a · La memoria «ZONA» de la v177 pasa a «ZONA|Convenio Rusos» y se borra la vieja', m4['ZONA|Convenio Rusos'] && !m4.ZONA && !JSON.parse(localStorage.getItem(CLAVE_TORRES)).ZONA, Object.keys(m4).join(','));
const pedirOrig = pedirHistorialAlRelevo; pedirHistorialAlRelevo = async () => {};   // el relevo falso no distingue zonas: aquí solo cuenta la memoria
nuevoInforme(); await esperar(300); modo('zona'); await esperar(200); sel('convenio', 'Convenio Rusos'); await esperar(500);
ok('4b · Y se sigue ofreciendo en toda la zona Simón Rodríguez', /ya tiene un informe anterior/.test($('#aviso-historial').innerText) && /261015/.test($('#aviso-historial').innerText), $('#aviso-historial').innerText.slice(0, 80));
pedirHistorialAlRelevo = pedirOrig;
localStorage.setItem(CLAVE_LISTA, '[]'); localStorage.removeItem(CLAVE_TORRES);
