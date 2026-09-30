// ROBUSTEZ · tanda 2 de 4 — BORRADORES VACÍOS Y «ENVIAR TODOS» (30-sep-2026), contra el relevo falso.
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
  if (apto !== undefined) { sel('piso', 'Piso 06'); put('apto', apto); }
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

// ── 6. Un informe con cabecera pero sin nada medido no deja ficha; al medir algo, sí ──
await limpiar(); setAmbito('apartamento'); cabecera('V1'); await esperar(900); document.querySelector('#aviso-anterior .no')?.click();
autoguardar(); await esperar(200);
const antes6 = lista().length;
put('pr_hito_acc_electricos_0', '5'); autoguardar(); await esperar(200);
ok('6 · El autoguardado no crea un borrador vacío (solo cabecera), y sí lo crea en cuanto hay algo medido',
   antes6 === 0 && lista().length === 1 && lista()[0].apto === 'V1', 'antes=' + antes6 + ' después=' + lista().length);

// ── 7. «Enviar todos» no manda los incompletos y dice qué les falta ──
localStorage.setItem('garmel_reports_list', '[]');
const a = await nuevo('E1', '6', '3'), b = await nuevo('E2', '6', '6');
const c = await nuevo('E3', '6', '1');
const l7 = lista(); const ic = l7.find(x => x.id === c.id); ic.apto = ''; ic.estatus = []; localStorage.setItem('garmel_reports_list', JSON.stringify(l7));
await limpiar();
Q.aceptar = true; Q.dialogos = [];
await enviarPendientes(); await esperar(400);
const env7 = await Q.envios();
const conf7 = Q.dialogos.find(d => /Se van a enviar/.test(d)) || '';
ok('7 · «Enviar todos» manda los 2 completos, deja el incompleto y avisa «falta: apartamento, estatus»',
   env7.length === 2 && /Se van a enviar 2/.test(conf7) && /falta: apartamento, estatus/.test(conf7) && !lista().find(x => x.id === c.id).enviado,
   'envíos=' + env7.length + ' · ' + conf7.replace(/\n/g, ' ').slice(0, 140));

// ── 8. Si uno falla, dice cuál y por qué; los demás salen ──
await Q.relevo({ borrar: true });
localStorage.setItem('garmel_reports_list', '[]');
const f1 = await nuevo('R1', '4', '2'), f2 = await nuevo('R2', '4', '4');
await Q.relevo({ fallar: [f2.nro] });
await limpiar(); Q.dialogos = [];
await enviarPendientes(); await esperar(400);
const fin8 = Q.dialogos.slice(-1)[0] || '';
await Q.relevo({ fallar: [] });
ok('8 · Con un fallo del relevo: «Enviados: 1 · Con problemas: 1» y el motivo junto a su número',
   /Enviados: 1/.test(fin8) && /Con problemas: 1/.test(fin8) && fin8.indexOf(f2.nro + ' — fallo simulado del relevo') >= 0 && !lista().find(x => x.id === f2.id).enviado,
   fin8.replace(/\n/g, ' ').slice(0, 160));

// ── 9. Si el relevo no contesta, se corta (a los 90 s; aquí acortado) y lo dice ──
const st = window.setTimeout;
// El plazo de 90 s se acorta a 1,5 s con la espera del banco (MessageChannel): con la pestaña oculta,
// Chrome retrasa los setTimeout y el relevo lento contestaba antes del corte.
window.setTimeout = function(f, ms){ if (ms === 90000) { esperar(1500).then(f); return 0; } return st.apply(window, arguments); };
await Q.relevo({ lento: 4 });
Q.dialogos = [];
const t9 = Date.now();
await enviarPendientes();
const dur9 = Date.now() - t9;
window.setTimeout = st;
await Q.relevo({ lento: 0 });
await esperar(3500);                                   // que el relevo lento termine su respuesta
const fin9 = Q.dialogos.slice(-1)[0] || '';
ok('9 · Sin respuesta del relevo: el envío se corta solo, dice «sin respuesta en 90 s (señal mala)» y el informe sigue pendiente',
   /sin respuesta en 90 s/.test(fin9) && dur9 < 3800 && !lista().find(x => x.id === f2.id).enviado && !_tandaEnCurso,
   Math.round(dur9) + ' ms · ' + fin9.replace(/\n/g, ' ').slice(0, 120));

// ── 10. Lo que está en pantalla se guarda antes de «Enviar todos» ──
await Q.relevo({ borrar: true });
const i10 = lista().findIndex(x => x.id === f2.id);
loadDraftData(i10); await esperar(300);
put('ej_hito_acc_electricos_0', '3'); clearTimeout(_tempAutoguardado);      // sin autoguardado de por medio
Q.dialogos = [];
await enviarPendientes(); await esperar(300);
const env10 = (await Q.envios()).find(e => e.datos && e.datos.id === f2.id);
ok('10 · «Enviar todos» guarda antes lo que está en pantalla: sale con 3 puestas, no con las 4 guardadas',
   env10 && env10.datos.partidas.hito_acc_electricos[0].ej === '3', env10 ? 'ej=' + env10.datos.partidas.hito_acc_electricos[0].ej : 'no salió');
