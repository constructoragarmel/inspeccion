// TANDA 90 · Obra, 14-oct-2026 (v168, cambio 184): el envío espera al relevo y, si se corta, pregunta antes de darlo por pendiente.
// Hallazgo: el relevo arma el PDF y empuja a Smartsheet en la misma llamada y con muchas fotos pasaba de los 90 s; el formulario
// decía «La señal no alcanzó» y el inspector reenviaba (34 reenvíos en el registro, 17 el 14-oct). Corre sobre inspeccion.html?prueba=1
// en un navegador A LA VISTA (fotos por canvas e IndexedDB; los temporizadores no pueden ir frenados). El plazo de 5 min se acorta aquí.
// 1 el relevo archiva y tarda más que el plazo: el contador se ve, no dice «La señal no alcanzó», queda enviado y hay UN solo envío
// 2 tocar Enviar otra vez no manda nada (ya se envió y no cambió) · 3 el cuerpo se pierde: dice «todavía no aparece archivado», sigue
// pendiente y se recuerda el corte · 4 con el relevo de vuelta, Enviar lo manda una vez · 5 tras un corte, si el informe llegó por su
// cuenta, Enviar lo reconoce y no lo reenvía · 6 «Enviar todos» con dos pendientes y el relevo lento: los dos enviados, dos envíos, cartel con segundos
localStorage.clear(); await Q.relevo({ borrar: true, tipos: ['inspeccion', 'servicios', 'sha', 'urbanismo'], caido: false, fallar: [], lento: 0, colgar: 0, perder: false });
Q.aceptar = true;
elegirRol('inspector'); await esperar(200);
localStorage.setItem('garmel_clave_envio', 'qc');
const put = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const cabecera = async (apto) => {
  sel('fecha', '2026-10-14'); Q.elegir($('#convenio'), [...$('#convenio').options].find(o => /Ezequiel/.test(o.text)).value); await esperar(200);
  sel('torre', 'T-56'); await esperar(300);
  const emp = [...document.getElementById('empresa').options].map(o => o.value); sel('empresa', emp.find(x => /ALNAVIC/i.test(x)) || emp[1]);
  const is = $('.inspector-select'); is.value = 'OTRO'; is.dispatchEvent(new Event('change', { bubbles: true })); await esperar(100); Q.escribir($('.inspector-manual'), 'Ing. Inspector de ejemplo');
  if (apto !== undefined) { setAmbito('apartamento'); await esperar(200); sel('piso', 'Piso 04'); put('apto', apto); } else { setAmbito('torre'); }
  await esperar(900); document.querySelector('#aviso-anterior .no')?.click();
  const ck = [...document.querySelectorAll('.ck-lbl')].find(l => /En progreso/i.test(l.textContent)); if (ck && !ck.querySelector('input').checked) toggleCk(ck, true);
};
const limpiar = async () => { Q.aceptar = true; nuevoFormulario(); await esperar(300); };
const lista = () => JSON.parse(localStorage.getItem('garmel_reports_list') || '[]');
const log = () => document.getElementById('sendLog').textContent;
const enviar = async (espera) => {
  document.getElementById('btn-enviar-relevo').disabled = false; $('#claveEnvio').value = 'qc'; refrescarEstadoClave();
  const p = enviarAlRelevo();
  let vioContador = false, vioSenal = false;
  const vigia = setInterval(() => { if (/Enviando… \d+ s/.test(document.getElementById('btn-enviar-relevo').innerHTML)) vioContador = true; if (/La señal no alcanzó/.test(log())) vioSenal = true; }, 100);
  await p; clearInterval(vigia); await esperar(300);
  return { log: log(), vioContador, vioSenal };
};
PLAZO_ENVIO_MS = 3000; _REINTENTO_EXISTE_MS = 800;

// ── 1. El relevo archiva pero tarda 7 s en contestar; el plazo es de 3 s ──
await limpiar(); await cabecera('Q1');
put('pr_hito_acc_electricos_0', '4'); put('ej_hito_acc_electricos_0', '2');
Q.ponerFotos($('#fslot_hito_acc_electricos_0 input[type=file]'), [await Q.foto(800, 600, 11)]);
await hasta(() => [...document.querySelectorAll('img[id^=fimg_hito_]')].some(i => i.src && i.src.indexOf('data:') === 0), 20000);
const nro1 = document.getElementById('nro-display').textContent;
await Q.relevo({ colgar: 7 });
const r1 = await enviar();
await Q.relevo({ colgar: 0 });
const env1 = (await Q.envios()).filter(e => e.numero === nro1);
const g1 = lista().find(b => b.nro === nro1);
ok('1 · Relevo lento (7 s, plazo 3 s): se vio el contador, nunca dijo «La señal no alcanzó», dice que ya estaba archivado, queda enviado y hay un solo envío',
   r1.vioContador && !r1.vioSenal && /Ya estaba archivado/.test(r1.log) && g1 && !!g1.enviado && env1.length === 1 && !_cortes[nro1],
   'contador=' + r1.vioContador + ' señal=' + r1.vioSenal + ' envíos=' + env1.length + ' · ' + r1.log.replace(/\n/g, ' ').slice(-160));

// ── 2. Tocar Enviar otra vez no manda nada ──
Q.aceptar = false; Q.dialogos = [];
const antes2 = (await Q.envios()).length;
loadDraftData(lista().findIndex(b => b.nro === nro1)); await esperar(800);
document.getElementById('btn-enviar-relevo').disabled = false; await enviarAlRelevo(); await esperar(500);
Q.aceptar = true;
ok('2 · Con el informe ya enviado, Enviar avisa que ya se envió y, al cancelar, no manda nada',
   (await Q.envios()).length === antes2 && Q.dialogos.some(d => /ya se envió/.test(d)), Q.dialogos.slice(-1)[0]?.slice(0, 100));

// ── 3. El cuerpo se pierde (el relevo no archiva y no contesta) ──
await limpiar(); await cabecera('Q2');
put('pr_hito_acc_electricos_0', '5'); put('ej_hito_acc_electricos_0', '5');
const nro3 = document.getElementById('nro-display').textContent;
await Q.relevo({ perder: true, colgar: 6 });
const r3 = await enviar();
await Q.relevo({ perder: false, colgar: 0 }); await esperar(2500);
const g3 = lista().find(b => b.nro === nro3);
ok('3 · Cuerpo perdido: no dice «La señal no alcanzó», dice que todavía no aparece archivado, sigue pendiente y recuerda el corte',
   !r3.vioSenal && /todavía no aparece archivado/.test(r3.log) && /puede estar terminando/.test(r3.log) && g3 && !g3.enviado && !!_cortes[nro3] && (await Q.envios()).filter(e => e.numero === nro3).length === 0,
   r3.log.replace(/\n/g, ' ').slice(-200));

// ── 4. Con el relevo de vuelta, Enviar lo manda (una vez), tras preguntar si ya llegó ──
const _yaBase = _yaArchivado; let consultas4 = 0; _yaArchivado = async function(){ consultas4++; return _yaBase.apply(this, arguments); };
const r4 = await enviar();
_yaArchivado = _yaBase;
const env4 = (await Q.envios()).filter(e => e.numero === nro3);
ok('4 · Tras el corte, con el relevo de vuelta: pregunta una vez (no está), lo manda una vez y queda enviado',
   consultas4 === 1 && /Archivado en Drive/.test(r4.log) && env4.length === 1 && !!lista().find(b => b.nro === nro3).enviado && !_cortes[nro3],
   'envíos=' + env4.length + ' · ' + r4.log.replace(/\n/g, ' ').slice(-120));

// ── 5. Tras un corte, el informe llegó por su cuenta: Enviar lo reconoce y no lo reenvía ──
await limpiar(); await cabecera('Q3');
put('pr_hito_acc_electricos_0', '3'); put('ej_hito_acc_electricos_0', '1');
const nro5 = document.getElementById('nro-display').textContent;
await Q.relevo({ perder: true, colgar: 5 });
await enviar();
await Q.relevo({ perder: false, colgar: 0 }); await esperar(2000);
// El cuerpo «llega tarde»: se archiva en el relevo falso con ese número sin pasar por el formulario.
await fetch('http://127.0.0.1:8776/exec', { method: 'POST', body: JSON.stringify({ clave: 'qc', numero: nro5, sector: 'EZ', torre: 'T-56', datos: { nro: nro5, torre: 'T-56' }, fotos: [] }) });
const antes5 = (await Q.envios()).length;
const r5 = await enviar();
ok('5 · Si el envío cortado sí llegó, el siguiente Enviar lo reconoce, lo marca enviado y no lo manda otra vez',
   /Ya estaba archivado/.test(r5.log) && (await Q.envios()).length === antes5 && !!lista().find(b => b.nro === nro5).enviado,
   r5.log.replace(/\n/g, ' ').slice(-160));

// ── 6. «Enviar todos» con dos pendientes y el relevo lento ──
await limpiar(); await cabecera('Q4'); put('pr_hito_acc_electricos_0', '2'); put('ej_hito_acc_electricos_0', '2'); clearTimeout(_tempAutoguardado); saveDraft(true);
await limpiar(); await cabecera('Q5'); put('pr_hito_acc_electricos_0', '2'); put('ej_hito_acc_electricos_0', '1'); clearTimeout(_tempAutoguardado); saveDraft(true);
await limpiar();
const pend6 = lista().filter(b => !b.enviado).map(b => b.nro);
await Q.relevo({ colgar: 5 });
Q.dialogos = []; let vioCartel = false, vioSenal6 = false;
const vig6 = setInterval(() => { const c = document.getElementById('cartel-envio'); if (c && /⏳ \d+ s/.test(c.textContent)) vioCartel = true; if (c && /no alcanzó/.test(c.textContent)) vioSenal6 = true; }, 100);
await enviarPendientes(); clearInterval(vig6);
await Q.relevo({ colgar: 0 });
const fin6 = Q.dialogos.slice(-1)[0] || '';
const env6 = (await Q.envios()).filter(e => pend6.indexOf(e.numero) >= 0);
ok('6 · «Enviar todos» con el relevo lento: el cartel muestra los segundos, los dos quedan enviados y hay dos envíos, no cuatro',
   pend6.length === 2 && vioCartel && !vioSenal6 && /Enviados: 2/.test(fin6) && env6.length === 2 && pend6.every(n => !!lista().find(b => b.nro === n).enviado),
   'pendientes=' + pend6.length + ' cartel=' + vioCartel + ' envíos=' + env6.length + ' · ' + fin6.replace(/\n/g, ' ').slice(0, 80));
PLAZO_ENVIO_MS = 300000; _REINTENTO_EXISTE_MS = 15000;
