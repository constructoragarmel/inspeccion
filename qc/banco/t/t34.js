// ROBUSTEZ · tanda 3 de 4 — ENVIADO POR ID, ABRIR SIN PERDER, «EDITADO DESPUÉS» (30-sep-2026).
// Termina dejando un informe a medias para t34b, que se corre DESPUÉS de recargar la página.
localStorage.setItem('garmel_rol', 'inspector');
localStorage.setItem('garmel_clave_envio', 'qc');
const put = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const cabecera = (apto) => {
  sel('fecha', '2026-09-30'); sel('torre', 'T-07'); sel('convenio', 'Convenio Bielorrusos');
  const emp = [...document.getElementById('empresa').options].map(o => o.value);
  sel('empresa', emp.find(x => /ALNAVIC/i.test(x)) || emp[1]);
  const insp = document.querySelector('.inspector-select');
  insp.value = [...insp.options].map(o => o.value).filter(Boolean)[0]; insp.dispatchEvent(new Event('change', { bubbles: true }));
  if (apto !== undefined) { sel('piso', 'Piso 07'); put('apto', apto); }
  if (!document.querySelector('#estatus .ck-lbl.on')) document.querySelector('#estatus .ck-lbl').click();
};
const limpiar = async () => { Q.aceptar = true; nuevoFormulario(); await esperar(300); };
const lista = () => JSON.parse(localStorage.getItem('garmel_reports_list') || '[]');
const nuevo = async (apto, hay, puestas) => {
  await limpiar(); setAmbito('apartamento'); cabecera(apto); await esperar(900); document.querySelector('#aviso-anterior .no')?.click();
  put('pr_hito_acc_electricos_0', hay); put('ej_hito_acc_electricos_0', puestas);
  clearTimeout(_tempAutoguardado); currentEditingIndex = null; _idEnEdicion = null; saveDraft(true);
  return lista()[0];
};
await Q.relevo({ caido: false, fallar: [], lento: 0, borrar: true });
localStorage.setItem('garmel_reports_list', '[]');

// ── 11. Dos borradores con el mismo número: enviar uno no marca el otro ──
const d1 = await nuevo('M1', '5', '1');
const d2 = await nuevo('M1', '5', '2');
Q.ponerFotos(document.querySelector('#fslot_' + _hitosDelAmbito()[0].id + '_0 input[type=file]'), [await Q.foto(800, 600, 7)]);
await hasta(() => /^data:/.test(document.getElementById('fimg_' + _hitosDelAmbito()[0].id + '_0').src), 10000, 100);
saveDraft(true); await esperar(500);
const ok11 = await _enviarUno(lista().find(x => x.id === d1.id), 'qc'); await esperar(300);
const l11 = lista(), x1 = l11.find(x => x.id === d1.id), x2 = l11.find(x => x.id === d2.id);
ok('11 · Mismo número (M1 dos veces): se marca enviado solo el que salió; el otro sigue pendiente y con su foto',
   ok11 && d1.nro === d2.nro && d1.id !== d2.id && !!x1.enviado && !x2.enviado && x2.fotosEnIdb === true && !!(await _fotosGet(d2.id)),
   'nro ' + d1.nro + ' / ' + d2.nro + ' · env1=' + !!x1.enviado + ' env2=' + !!x2.enviado);

// ── 12. Abrir otro informe guarda antes lo que está en pantalla ──
await limpiar(); setAmbito('apartamento'); cabecera('A12'); await esperar(900); document.querySelector('#aviso-anterior .no')?.click();
put('pr_hito_acc_electricos_0', '9'); put('ej_hito_acc_electricos_0', '9');
clearTimeout(_tempAutoguardado);                                 // el autoguardado no llegó a pasar
const n12 = lista().length;
loadDraftData(lista().findIndex(x => x.id === d2.id)); await esperar(300);
const a12 = lista().find(x => x.apto === 'A12');
ok('12 · Con un informe sin guardar en pantalla, abrir otro lo guarda antes (A12 con 9 de 9 queda en la lista)',
   lista().length === n12 + 1 && a12 && a12.partidas.hito_acc_electricos[0].ej === '9' && document.getElementById('apto').value === 'M1',
   'antes ' + n12 + ' · después ' + lista().length + ' · pantalla ' + document.getElementById('apto').value);

// ── 13. Un informe que se abre incompleto no se guarda encima del bueno ──
const l13 = lista(); const roto = l13.find(x => x.apto === 'A12');
roto.partidas.hito_acc_electricos = [null];                  // una fila que no se puede leer
localStorage.setItem('garmel_reports_list', JSON.stringify(l13));
const ts13 = JSON.stringify(roto.partidas);
loadDraftData(lista().findIndex(x => x.apto === 'A12')); await esperar(300);
const bloqueado = _bloqueoGuardado;
put('obs_general', 'esto no debe pisar el borrador'); saveDraft(true); autoguardar(); await esperar(300);
const l13b = lista().find(x => x.apto === 'A12');
ok('13 · Abierto incompleto: queda bloqueado y ni el guardado ni el autoguardado lo pisan',
   (_falloAlAbrir.length > 0 && (bloqueado && JSON.stringify(l13b.partidas) === ts13 && l13b.obs_general !== 'esto no debe pisar el borrador')),
   'fallos=' + _falloAlAbrir.join(',') + ' · bloqueado=' + bloqueado + ' · obs=' + (l13b.obs_general || '').slice(0, 20));
Q.fallo13 = _falloAlAbrir.length;

// ── 14. Enviado y editado después: se marca, se ve y se reenvía; sin cambios no se marca ──
localStorage.setItem('garmel_reports_list', '[]'); await limpiar();
const e1 = await nuevo('ED1', '8', '2');
await _enviarUno(lista()[0], 'qc');
loadDraftData(0); await esperar(300); saveDraft(true); await esperar(100);
const sinCambio = lista()[0].editadoTras;
put('ej_hito_acc_electricos_0', '5'); saveDraft(true);
const conCambio = lista()[0].editadoTras;
openSavedModal(); renderSavedList(); await esperar(200);
const tarjeta = document.querySelector('#savedListContent .saved-item');
const txt14 = tarjeta ? tarjeta.innerText : '';
Q.dialogos = []; Q.aceptar = true;
await Q.relevo({ borrar: true });
await sendSavedDirect(0); await esperar(300);
document.getElementById('btn-enviar-relevo').disabled = false; refrescarEstadoClave();
await enviarAlRelevo(); await esperar(800);
const reenv = (await Q.envios()).find(x => x.datos && x.datos.id === e1.id);
ok('14 · Enviado: guardarlo sin cambios no lo marca; cambiarlo sí («✏️ Editado después…», «🔁 Reenviar»); al reenviar sale con 5 y se quita la marca',
   !sinCambio && !!conCambio && /Editado después/.test(txt14) && /Reenviar/.test(txt14) && Q.dialogos.some(d => /se editó después/.test(d)) &&
   reenv && reenv.datos.partidas.hito_acc_electricos[0].ej === '5' && !lista()[0].editadoTras,
   'sin=' + sinCambio + ' con=' + !!conCambio + ' · tarjeta ' + /Editado/.test(txt14) + ' · reenvío ej=' + (reenv ? reenv.datos.partidas.hito_acc_electricos[0].ej : '—'));
closeSavedModal();

// ── 15 (primera mitad). Se deja un informe a medias guardado; t34b recarga y lo busca ──
await limpiar(); setAmbito('apartamento'); cabecera('REC'); await esperar(900); document.querySelector('#aviso-anterior .no')?.click();
put('pr_hito_acc_electricos_0', '7'); put('ej_hito_acc_electricos_0', '2');
autoguardar(); await esperar(200);
Q.idRecuperar = lista()[0].id;
localStorage.setItem('qc_rec', Q.idRecuperar);
ok('15a · Queda anotado el informe en curso para recuperarlo', localStorage.getItem('garmel_actual') === Q.idRecuperar, localStorage.getItem('garmel_actual'));
