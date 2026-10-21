// TANDA 125 · v184 (21-oct-2026): rondas 3 a 5 del estrés de fin de día, en `sha.html?prueba=1` a 375×812 (la barra nueva del motor,
// la misma de servicios y urbanismo). 3 quince torres seguidas con «Guardar y otra torre», un hallazgo en cada una: los contadores y el
// envío con el relevo lento y el doble toque · 4 «⋯ Más» abierto y cerrado 30 veces, «🖨️ PDF» lo cierra, «🧹 Limpiar todo» con «no»
// no borra nada · 5 la fecha: un informe guardado de otro día abierto y «Guardar y otra torre» deja el nuevo con la de hoy.
const DESC = '[data-campo="hallazgo__Descripción del hallazgo o condición observada"]', ST = '[data-campo="hallazgo__Acción correctiva / estatus"]';
Object.keys(localStorage).filter(k => /garmel_sha_/.test(k)).forEach(k => localStorage.removeItem(k));
localStorage.setItem('garmel_clave_envio', 'qc'); Q.aceptar = true; Q.dialogos = [];
await Q.relevo({ caido: false, fallar: [], lento: 0, colgar: 0, perder: false, borrar: true });
const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const HOY = iso(new Date());
const cnt = id => ((document.getElementById(id) || {}).textContent || '').trim();
nuevoInforme(); await esperar(200);
Q.elegir($('#convenio'), 'Convenio Bielorrusos'); await esperar(100);
const TORRES = [...$('#torre').options].map(o => o.value).filter(v => /^T-\d+$/.test(v)).slice(0, 15);
Q.elegir($('#inspectores select'), INSPECTORES_DB.find(n => /V[ií]ctor/.test(n)) || INSPECTORES_DB[0]);
{ const es = $('#estatus'); Q.elegir(es, [...es.options].map(o => o.value).filter(Boolean)[0]); }   // en SHA el estatus general es obligatorio
const hallazgo = (txt) => { $('#tab-b') && $('#tab-b').click(); $('#panel-b .btn-add').click(); const f = $$('.fila-apto').pop(); Q.escribir(f.querySelector('.apto'), 'Frente ' + txt); Q.escribir(f.querySelector(DESC), 'Hallazgo ' + txt); Q.elegir(f.querySelector(ST), 'Pendiente'); };
// ── Ronda 3 ──
const t0 = performance.now();
for (let k = 0; k < TORRES.length; k++) {
  Q.elegir($('#torre'), TORRES[k]); await esperar(250); if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
  hallazgo(TORRES[k]); { const es = $('#estatus'); Q.elegir(es, [...es.options].map(o => o.value).filter(Boolean)[0]); }   // el estatus general es de cada inspección: «Sig. torre» no lo arrastra (construir-sha.py, 17)
  if (k < TORRES.length - 1) { siguienteTorre(); await esperar(250); }
}
guardar(false); await esperar(200); actualizarContador();
const l = listaGuardada();
ok('R3.1 · Quince torres seguidas con «Guardar y otra torre»: 15 informes, uno por torre, todos de hoy y con su hallazgo', l.length === 15 && new Set(l.map(x => x.torre)).size === 15 && l.every(x => x.fecha === HOY && (x.apartamentos || []).length === 1),
   l.length + ' · torres ' + new Set(l.map(x => x.torre)).size + ' · fechas ' + [...new Set(l.map(x => x.fecha))].join() + ' · ' + Math.round((performance.now() - t0) / 1000) + ' s');
ok('R3.2 · La barra dice «Informes (15)» y «Enviar (15)», como en obra', cnt('cnt') === '(15)' && cnt('cnt-pend') === '(15)', cnt('cnt') + ' ' + cnt('cnt-pend'));
await Q.relevo({ lento: 0.4 }); Q.dialogos = [];
const e0 = (await Q.envios()).length;
const p = enviar(); await esperar(250); await enviar();
await p; await hasta(() => !_tandaEnCurso, 60000); await esperar(500); actualizarContador();
const env = (await Q.envios()).slice(e0);
ok('R3.3 · El doble toque en «Enviar» lo frena, y con el relevo lento salen los 15 una vez cada uno', Q.dialogos.some(d => /Ya hay un envío en curso/.test(d)) && env.length === 15 && new Set(env.map(e => e.numero)).size === 15,
   env.length + ' · ' + Q.dialogos.map(d => d.slice(0, 30)).join(' | '));
ok('R3.4 · Después del envío «Enviar» queda sin número y «Informes (15)» sigue', cnt('cnt-pend') === '' && cnt('cnt') === '(15)', cnt('cnt') + ' / ' + cnt('cnt-pend'));
await Q.relevo({ lento: 0 });
// ── Ronda 4 ──
const mas = $('#fila-mas'), btn = $('#btn-mas');
let malos = 0;
for (let k = 0; k < 30; k++) { btn.click(); const abierto = mas.classList.contains('abierto'); if (abierto !== (k % 2 === 0) || (abierto && getComputedStyle(mas).display === 'none') || (!abierto && getComputedStyle(mas).display !== 'none')) malos++; }
ok('R4.1 · «⋯ Más» abierto y cerrado 30 veces: siempre se ve lo que dice, y el botón dice «Más» o «Menos»', malos === 0 && !mas.classList.contains('abierto') && btn.textContent.includes('Más'), malos + ' fallos');
btn.click(); const altoMas = [...mas.querySelectorAll('.hbtn')].map(b => Math.round(b.getBoundingClientRect().height));
ok('R4.2 · Abierto, sus botones van en cuadrícula pareja (ninguno estirado) y miden ≥44 px', altoMas.every(h => h >= 44 && h < 70) && getComputedStyle(mas).display === 'grid', altoMas.join(','));
Q.escribir(document.getElementById('obs_general'), 'Texto que no se debe perder'); Q.aceptar = false; Q.dialogos = [];
[...mas.querySelectorAll('.hbtn')].find(b => /Limpiar todo/.test(b.textContent)).click(); await esperar(200); Q.aceptar = true;
ok('R4.3 · «🧹 Limpiar todo» pregunta y con «no» no borra nada', Q.dialogos.length >= 1 && document.getElementById('obs_general').value === 'Texto que no se debe perder', Q.dialogos.map(d => d.slice(0, 50)).join(' | '));
const abiertoAntes = mas.classList.contains('abierto');
try { vistaPrevia(); } catch (e) {} await esperar(600);
ok('R4.4 · «🖨️ PDF» (la vista previa) cierra el «Más» al abrirse', abiertoAntes && !mas.classList.contains('abierto') && btn.textContent.includes('Más'));
if (typeof _vpCerrar === 'function') _vpCerrar(); await esperar(200);   // que la hoja no se quede para la tanda siguiente
// ── Ronda 5 ──
const viejo = Object.assign(JSON.parse(JSON.stringify(listaGuardada()[0])), { id: 'qc125-' + Date.now(), fecha: '2026-10-05', enviado: undefined, nro: '' });
localStorage.setItem('garmel_sha_list', JSON.stringify([viejo].concat(listaGuardada()))); Object.keys(_fechasOk192).forEach(k => delete _fechasOk192[k]);
nuevoInforme(); await esperar(200); Q.dialogos = [];
cargarInforme(viejo.id); await esperar(600);
const abierta = $('#fecha').value;
siguienteTorre(); await esperar(600);
const aviso = [($('#toast') || {}).textContent || '', ($('#aviso192') || {}).textContent || ''].join(' ');
ok('R5.1 · En SHA, abrir un informe del 5-oct y tocar «Guardar y otra torre» deja el nuevo con la fecha de hoy y lo avisa, sin preguntar',
   abierta === '2026-10-05' && $('#fecha').value === HOY && /Informe nuevo con la fecha de hoy/.test(aviso) && !Q.dialogos.some(d => /La fecha que eligió/.test(d)), abierta + ' → ' + $('#fecha').value + ' · ' + aviso.slice(0, 90));
ok('R5.2 · El del 5-oct sigue con su fecha', listaGuardada().some(x => x.id === viejo.id && x.fecha === '2026-10-05'));
ok('R5.3 · Nada se sale de la pantalla y ningún control baja de 44 px', document.documentElement.scrollWidth <= innerWidth + 1 && Q.chicos().length === 0, Q.chicos().join(' '));
Object.keys(localStorage).filter(k => /garmel_sha_list/.test(k)).forEach(k => localStorage.removeItem(k)); nuevoInforme();
