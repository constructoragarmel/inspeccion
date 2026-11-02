// ESTRÉS 25 · lo que pidió Leidy el 2-nov-2026 (T-16, «Torre completa»): «cargar los datos que ya tenía almacenados y agregar
// mediciones nuevas». Un informe de torre que ya tiene más de la mitad de las filas medidas: «Completar lo vacío con otro informe
// de torre…» se ofrece igual, trae el de la visita anterior solo en lo vacío, no toca lo nuevo, lo copiado queda por confirmar, y en
// torre se piden 45 días al archivo. Y que el informe de torre se recupere al salir y volver (Liz). Se corre en inspeccion.html?prueba=1.
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem('garmel_reports_list', '[]');
Q.aceptar = true;
await Q.relevo({ caido: false, fallar: [], lento: 0, colgar: 0, perder: false, cortar: 0, borrar: true });
const HOY = new Date().toISOString().slice(0, 10);
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const fila = (pid, cod) => pid + '_' + CODIGOS_SUB[pid].indexOf(cod);
const mide = (rid, pr, ej) => { const a = document.getElementById('pr_' + rid), b = document.getElementById('ej_' + rid); if (!a || !b) return false; a.value = pr; b.value = ej; recalcRow(a); b.dispatchEvent(new Event('input', { bubbles: true })); return true; };
const cabecera = async (fecha) => {
  nuevoFormulario(); await esperar(300); setAmbito('torre'); await esperar(250);
  sel('fecha', fecha); sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-16'); await esperar(900);
  { const ins = document.querySelector('.inspector-select'); Q.elegir(ins, [...ins.options].map(o => o.value).filter(Boolean)[0]); await esperar(300); }
  if (!document.querySelector('#estatus .ck-lbl.on')) [...document.querySelectorAll('#estatus .ck-lbl')].find(l => /progreso/.test(l.textContent)).click();
  const c = document.getElementById('aviso-anterior'); if (c) c.innerHTML = '';
};
// Filas de torre con proyectada y ejecutada (las que se ven en «Torre completa»).
// (Las de los hitos plegados también cuentan: se mira que la fila no esté oculta por el ámbito, no que esté a la vista.)
const filasTorre = () => [...document.querySelectorAll('#main-content input[id^="pr_"]')].filter(e => { const tr = e.closest('tr'), bl = e.closest('.partida');
  return document.getElementById('ej_' + e.id.slice(3)) && tr && tr.style.display !== 'none' && (!bl || bl.style.display !== 'none'); }).map(e => e.id.slice(3));

// La visita anterior: un informe de torre de la T-16 con todas sus filas medidas, enviado.
await cabecera('2026-10-21');
const todas = filasTorre();
todas.forEach((rid, i) => mide(rid, '10', String(i % 10)));
saveDraft(true); await esperar(300);
await enviarPendientes(); await hasta(() => !_tandaEnCurso, 60000); await esperar(400);
const anterior = getSavedReports().find(b => b.ambito === 'torre');
localStorage.setItem('garmel_reports_list', '[]');   // es otro teléfono: lo anterior solo está en el archivo

// ── L1 · Hoy: más de la mitad de las filas con mediciones nuevas, y aun así se ofrece completar lo vacío ──
await cabecera(HOY);
const nuevas = todas.slice(0, Math.ceil(todas.length * 0.6));
nuevas.forEach(rid => mide(rid, '20', '15')); await esperar(1300);
const btn = document.getElementById('btn-copiar-de');
ok('L1 · Con ' + nuevas.length + ' de ' + todas.length + ' filas ya medidas hoy, se ofrece «Completar lo vacío con otro informe de torre…»', !!btn && /Completar lo vac.*informe de torre/.test(btn.textContent) && btn.offsetHeight >= 44, btn ? btn.textContent : 'sin botón');
// ── L2 · El panel pide 45 días al archivo y lista el de la visita anterior ──
let pedido = null; const _f = window.fetch; window.fetch = function(u, o){ try { const b = JSON.parse((o && o.body) || '{}'); if (b.accion === 'copiar-fuentes') pedido = b; } catch (e) {} return _f.apply(this, arguments); };
btn.click(); await esperar(2000); window.fetch = _f;
const items = [...document.querySelectorAll('#copiar-de .f')];
const it = items.find(x => /T-16/.test(x.textContent) && /21-oct|2026-10-21|21\/10/.test(x.textContent)) || items[0];
ok('L2 · Pide al archivo 45 días (torre) y ofrece el informe de torre del 21-oct', !!pedido && pedido.dias === 45 && pedido.ambito === 'torre' && !!it && /T-16/.test(it.textContent), (pedido && pedido.dias) + ' días · ' + items.map(x => x.textContent.trim().slice(0, 60)).join(' | '));
// ── L3 · Copiar: llena solo lo vacío con lo anterior; lo de hoy queda igual ──
it.querySelector('button').click(); await esperar(800);
const hoyIgual = nuevas.every(rid => document.getElementById('ej_' + rid).value === '15' && document.getElementById('pr_' + rid).value === '20');
const vacias = todas.slice(nuevas.length), llenas = vacias.filter(rid => document.getElementById('pr_' + rid).value === '10');
const marcadas = document.querySelectorAll('tr.heredada.copiada').length;
ok('L3 · Lo medido hoy queda igual (' + nuevas.length + '), las ' + vacias.length + ' vacías se llenan con lo del 21-oct y quedan «≈ Copiado» por confirmar', hoyIgual && llenas.length === vacias.length && marcadas === vacias.length, 'hoy igual ' + hoyIgual + ' · llenas ' + llenas.length + '/' + vacias.length + ' · marcadas ' + marcadas);
// ── L4 · No se envía con lo copiado sin confirmar; confirmado, sale una vez ──
Q.dialogos.length = 0; const n0 = (await Q.envios()).length;
openSend(); await esperar(200); document.getElementById('claveEnvio').value = 'qc'; document.getElementById('btn-enviar-relevo').disabled = false;
await enviarAlRelevo(); await esperar(600);
const bloqueado = Q.dialogos.some(m => /no se han confirmado/.test(m)) && (await Q.envios()).length === n0;
[...document.querySelectorAll('tr.heredada.copiada .sigue-igual')].forEach(b => b.click()); await esperar(300);
openSend(); await esperar(200); document.getElementById('claveEnvio').value = 'qc'; document.getElementById('btn-enviar-relevo').disabled = false;
await enviarAlRelevo(); await esperar(2000);
const env = (await Q.envios()).slice(n0).filter(e => /EZ-T16-\d{6}-/.test(e.numero || ''));
ok('L4 · Sin confirmar lo copiado no sale; confirmado, sale una vez con lo nuevo y lo anterior', bloqueado && env.length === 1, 'bloqueado ' + bloqueado + ' · envíos ' + env.length);
// ── L5 · El informe de torre se recupera al «salir» (la app pasa a segundo plano) aunque no se toque Guardar ──
localStorage.setItem('garmel_reports_list', '[]');
await cabecera(HOY); mide(todas[0], '30', '12'); await esperar(300);
Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange'));
await esperar(300); delete document.hidden;
const g5 = getSavedReports().find(b => b.ambito === 'torre' && b.torre === 'T-16');
ok('L5 · Al salir sin tocar Guardar, el informe de torre ya quedó guardado en el teléfono con lo medido', !!g5 && JSON.stringify(g5.partidas).indexOf('"30"') > 0, g5 ? g5.nro : 'no se guardó');
localStorage.setItem('garmel_reports_list', '[]'); nuevoFormulario();
