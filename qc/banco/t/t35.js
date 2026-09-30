// ROBUSTEZ · tanda 4 de 4 — COMA DECIMAL, LO TRAÍDO DE LA VISITA ANTERIOR, FINALIZAR (30-sep-2026).
localStorage.setItem('garmel_rol', 'inspector');
localStorage.setItem('garmel_clave_envio', 'qc');
const put = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const cabecera = (apto, torre) => {
  sel('fecha', '2026-09-30'); sel('torre', torre || 'T-07'); sel('convenio', 'Convenio Bielorrusos');
  const emp = [...document.getElementById('empresa').options].map(o => o.value);
  sel('empresa', emp.find(x => /ALNAVIC/i.test(x)) || emp[1]);
  const insp = document.querySelector('.inspector-select');
  insp.value = [...insp.options].map(o => o.value).filter(Boolean)[0]; insp.dispatchEvent(new Event('change', { bubbles: true }));
  if (apto !== undefined) { sel('piso', 'Piso 08'); put('apto', apto); }
  if (!document.querySelector('#estatus .ck-lbl.on')) document.querySelector('#estatus .ck-lbl').click();
};
const limpiar = async () => { Q.aceptar = true; nuevoFormulario(); await esperar(300); };
const lista = () => JSON.parse(localStorage.getItem('garmel_reports_list') || '[]');
const pct = rid => (document.getElementById('pct_' + rid)?.innerText || '').trim();
const aviso = () => (document.getElementById('aviso-anterior')?.innerText || '').trim();
// Teclear de verdad: cada carácter entra por un evento input, como en el teléfono.
const teclear = (id, txt) => { const e = document.getElementById(id); e.value = ''; for (const ch of txt) { e.value += ch; e.dispatchEvent(new Event('input', { bubbles: true })); } return e.value; };
await Q.relevo({ caido: false, fallar: [], lento: 0, borrar: true });
localStorage.setItem('garmel_reports_list', '[]');

// ── 16. La coma decimal: «12,5» queda 12.5 y calcula; letras y puntos de más se quitan ──
await limpiar(); setAmbito('torre'); await esperar(200); cabecera(undefined, 'T-09'); await esperar(900); document.querySelector('#aviso-anterior .no')?.click();
const tipos = ['pr_hito_estructura_2', 'ej_hito_estructura_2', 'pm_hito_estructura_0'].map(id => document.getElementById(id)?.type + '/' + document.getElementById(id)?.inputMode);
const v1 = teclear('pr_hito_estructura_2', '12,5'), v2 = teclear('ej_hito_estructura_2', '6,25'), v3 = teclear('pm_hito_estructura_0', '1.2.3');
const v4 = teclear('pm_hito_estructura_1', 'a7x');
ok('16 · Coma decimal: «12,5» → 12.5 y «6,25» → 6.25 (50 %); «1.2.3» → 1.23; «a7x» → 7; las casillas son texto con teclado decimal',
   v1 === '12.5' && v2 === '6.25' && v3 === '1.23' && v4 === '7' && pct('hito_estructura_2') === '50%' && tipos.every(t => /^text\/decimal$/.test(t)),
   'v1=' + v1 + ' v2=' + v2 + ' v3=' + v3 + ' v4=' + v4 + ' % ' + pct('hito_estructura_2') + ' · ' + tipos.join(','));

// ── 17. El conteo: texto con teclado numérico, y un % escrito de más se queda en 100 ──
await limpiar(); setAmbito('apartamento'); cabecera('D1'); await esperar(900); document.querySelector('#aviso-anterior .no')?.click();
const ej = document.getElementById('ej_hito_acc_electricos_0'), pr = document.getElementById('pr_hito_acc_electricos_0');
teclear('pr_hito_acc_electricos_0', '8'); teclear('ej_hito_acc_electricos_0', '4');
const pmMan = document.querySelector('input[id^="pm_hito_acabados"]') || document.querySelector('input.pct-man');
const pmId = pmMan && pmMan.id; if (pmId) teclear(pmId, '150');
const td = ej.closest('td'), desb = td.scrollWidth > td.clientWidth + 1;
ok('17 · Conteo: «text» con teclado numérico, 4 de 8 = 50 %; un % escrito de 150 cuenta 100 %; la celda no se desborda',
   ej.type === 'text' && ej.inputMode === 'numeric' && pr.inputMode === 'numeric' && pct('hito_acc_electricos_0') === '50%' &&
   (!pmId || pct(pmId.slice(3)) === '100%') && !desb,
   ej.type + '/' + ej.inputMode + ' · ' + pct('hito_acc_electricos_0') + ' · ' + pmId + '=' + (pmId ? pct(pmId.slice(3)) : '—') + ' · desborda=' + desb);

// ── 18. Traer mediciones marca las filas traídas; «Sigue igual», tocar la fila y volver a tocar el estado las confirman ──
setEstado(document.querySelector('.est-btn[data-rid="hito_acabados_1"][data-v="50"]'), 50);
put('pr_hito_acc_electricos_1', '3'); put('ej_hito_acc_electricos_1', '1');
// Y dos filas más que NO se van a revisar hoy, para la 19.
const otras = [...document.querySelectorAll('input[type="text"][id^="ej_hito_"]')].map(e => e.id.slice(3))
  .filter(rid => !/^hito_acc_electricos_[01]$/.test(rid) && document.getElementById('pr_' + rid) && document.getElementById('pr_' + rid).type === 'text' && !/_extra_/.test(rid) && _aplica(rid.replace(/_\d+$/, ''), +rid.match(/_(\d+)$/)[1])).slice(0, 2);
otras.forEach(rid => { put('pr_' + rid, '10'); put('ej_' + rid, '5'); });
clearTimeout(_tempAutoguardado); currentEditingIndex = null; _idEnEdicion = null; saveDraft(true);
const semilla = lista()[0];
const traibles = Object.keys(semilla.partidas).filter(k => !/_extra$/.test(k)).reduce((n, k) => n + (semilla.partidas[k] || []).filter(it => it && ['pr', 'ej', 'sn', 'pct'].some(c => String(it[c] || '').trim())).length, 0);
await limpiar(); setAmbito('apartamento'); cabecera('D1');
await hasta(() => aviso().length > 0, 12000, 100);
document.querySelector('#aviso-anterior .si')?.click(); await esperar(300);
const marcadas = [...document.querySelectorAll('tr.heredada')].map(tr => tr.querySelector('[id^="pct_"]').id.slice(4));
const etiqueta = document.querySelector('tr.heredada .heredada-tag')?.innerText || '';
document.querySelector('tr.heredada .sigue-igual') && document.querySelector('#pct_hito_acc_electricos_0').closest('tr').querySelector('.sigue-igual').click();
put('ej_hito_acc_electricos_1', '2');
setEstado(document.querySelector('.est-btn[data-rid="hito_acabados_1"][data-v="50"]'), 50);
const quedan = [...document.querySelectorAll('tr.heredada')].map(tr => tr.querySelector('[id^="pct_"]').id.slice(4));
ok('18 · Se marcan exactamente las ' + traibles + ' filas traídas; «Sigue igual», escribir y re-tocar el estado las confirman (y el 50 % se queda)',
   marcadas.length === traibles && traibles >= 5 && /De la visita anterior/.test(etiqueta) && /Sigue igual/.test(etiqueta) &&
   !quedan.includes('hito_acc_electricos_0') && !quedan.includes('hito_acc_electricos_1') && !quedan.includes('hito_acabados_1') &&
   quedan.length === traibles - 3 && otras.length === 2 && otras.every(r => quedan.includes(r)) && pct('hito_acabados_1') === '50%',
   'marcadas=' + marcadas.join(',') + ' · quedan=' + quedan.join(',') + ' · acabados ' + pct('hito_acabados_1'));

// ── 19. Lo que no se revisó viaja como heredado, sobrevive a guardar y abrir, y antes de enviar se pregunta ──
const quedan19 = quedan.length;
const d19 = getFormData();
const her19 = Object.values(d19.partidas).flat().filter(r => r && r.heredado).length;
saveDraft(true); const id19 = _idEnEdicion;
await limpiar();
loadDraftData(lista().findIndex(b => b.id === id19)); await esperar(300);
const tras19 = document.querySelectorAll('tr.heredada').length;
Q.dialogos = []; Q.aceptar = false;
document.getElementById('btn-enviar-relevo').disabled = false; refrescarEstadoClave();
await enviarAlRelevo(); await esperar(300);
const envCancel = (await Q.envios()).length;
const preg = Q.dialogos.find(d => /visita anterior/.test(d)) || '';
Q.aceptar = true;
await enviarAlRelevo(); await esperar(800);
const env19 = (await Q.envios()).find(e => e.datos && e.datos.id === id19);
const herEnv = env19 ? Object.values(env19.datos.partidas).flat().filter(r => r && r.heredado).length : -1;
ok('19 · ' + quedan19 + ' fila(s) sin revisar: viajan con «heredado», siguen marcadas al reabrir, y enviar pregunta (cancelar no envía)',
   quedan19 === 2 && her19 === quedan19 && tras19 === quedan19 && /no se revisaron hoy/.test(preg) && envCancel === 0 && herEnv === quedan19,
   'datos=' + her19 + ' · reabierto=' + tras19 + ' · cancelado envió ' + envCancel + ' · enviado heredado=' + herEnv);

// ── 20. «Usar las cantidades» no marca nada; Finalizar suelta el informe: el siguiente no lo pisa ──
localStorage.setItem('garmel_reports_list', '[]');
await Q.relevo({ borrar: true });
await limpiar(); setAmbito('apartamento'); cabecera('H1'); await esperar(900); document.querySelector('#aviso-anterior .no')?.click();
put('pr_hito_acc_electricos_0', '6'); put('ej_hito_acc_electricos_0', '6');
Q.aceptar = true;
finalizarInforme(); await esperar(1600);
const fin = lista()[0];
put('apto', 'H2'); await hasta(() => aviso().length > 0, 12000, 100);
const esCantidades = /cantidades «hay»/.test(aviso());
document.querySelector('#aviso-anterior .si')?.click(); await esperar(300);
const marc20 = document.querySelectorAll('tr.heredada').length;
put('ej_hito_acc_electricos_0', '2'); autoguardar(); await esperar(200);
const l20 = lista();
ok('20 · Tras Finalizar el siguiente es otro borrador (H1 intacto con 6 de 6); «Usar las cantidades» no marca filas; «en curso» apunta al nuevo',
   l20.length === 2 && l20.find(b => b.id === fin.id).apto === 'H1' && l20.find(b => b.id === fin.id).partidas.hito_acc_electricos[0].ej === '6' &&
   esCantidades && marc20 === 0 && localStorage.getItem('garmel_actual') !== fin.id && localStorage.getItem('garmel_actual') === _idEnEdicion,
   'borradores=' + l20.length + ' · H1 ej=' + (l20.find(b => b.id === fin.id) || {partidas:{hito_acc_electricos:[{}]}}).partidas.hito_acc_electricos[0].ej + ' · cantidades=' + esCantidades + ' · marcadas=' + marc20);
