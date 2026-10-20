// TANDA 114 · v180 (20-oct-2026, cambio 192): la fecha que no es hoy se pregunta UNA vez, al elegirla, en obra
// (`inspeccion.html?prueba=1`). Criterio de Stephanie del 20-oct: «preguntar una sola vez al elegir una fecha que no sea la de
// hoy, sin repetir en los apartamentos siguientes ni al guardar o enviar». El caso real: a las 10:23 del 13-oct se eligió el
// 5-oct y «Siguiente apto.» la arrastró hasta las 10:59. La tanda «está» en el 13-oct cambiando `_hoy192`. Sin datos reales.
// 1 elegir el 5-oct estando en el 13-oct pregunta «La fecha que eligió es el 05-oct, no hoy (13-oct). ¿Es correcta?» y con «sí»
// se queda · 2 tres apartamentos más con «Guardar y otro apto» no vuelven a preguntar, los cuatro quedan con el 5-oct y un aviso
// dice «Sigue con la fecha 05-oct» · 3 volver a elegir el 5-oct no pregunta · 4 «Guardar» y «Enviar todos» no preguntan ·
// 5 abrir un borrador del 5-oct en otra sesión no pregunta · 6 con «no» vuelve la fecha que había (hoy), el número y la cabecera
// no ven la equivocada · 7 con «no» y sin fecha antes, queda vacía · 8 hoy no pregunta nada (guardar, siguiente, enviar) ·
// 9 a las 23:30 de hoy, la de hoy sigue siendo hoy (hora del teléfono, no UTC).
localStorage.clear();
localStorage.setItem('garmel_rol', 'inspector');
localStorage.setItem('garmel_clave_envio', 'qc');
Q.aceptar = true;
const hoyReal = _hoy192;
const put = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const lista = () => JSON.parse(localStorage.getItem('garmel_reports_list') || '[]');
const olvidar = () => Object.keys(_fechasOk192).forEach(k => delete _fechasOk192[k]);
const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const preguntas = () => Q.dialogos.filter(d => /La fecha que eligió/.test(d));
const cabecera = () => {
  sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-16');
  const emp = [...document.getElementById('empresa').options].map(o => o.value); sel('empresa', emp.find(x => /PROCODIMA/i.test(x)) || emp[1]);
  const insp = document.querySelector('.inspector-select'); insp.value = [...insp.options].map(o => o.value).filter(Boolean)[0]; insp.dispatchEvent(new Event('change', { bubbles: true }));
  sel('piso', 'Piso 01');
  if (!document.querySelector('#estatus .ck-lbl.on')) document.querySelector('#estatus .ck-lbl').click();
};
const apto = async (a, n) => { put('apto', a); sel('apto-sel', a); await esperar(900); document.querySelector('#aviso-anterior .no')?.click();
  put('pr_hito_acc_electricos_0', '6'); put('ej_hito_acc_electricos_0', String(n)); };
await Q.relevo({ caido: false, fallar: [], lento: 0, colgar: 0, perder: false, borrar: true });

// 1 · el 13-oct a las 10:23 se elige el 5-oct
_hoy192 = () => new Date(2026, 9, 13, 10, 23);
olvidar(); nuevoFormulario(); await esperar(300); setAmbito('apartamento'); cabecera();
Q.dialogos = []; sel('fecha', '2026-10-05');
ok('1 · Elegir el 5-oct estando en el 13-oct pregunta una vez «La fecha que eligió es el 05-oct, no hoy (13-oct). ¿Es correcta?» y con «sí» se queda',
   preguntas().length === 1 && /es el 05-oct, no hoy \(13-oct\)/.test(preguntas()[0]) && /¿Es correcta\?/.test(preguntas()[0]) && document.getElementById('fecha').value === '2026-10-05',
   preguntas().map(d => d.replace(/\n/g, ' ')).join(' | '));

// 2 · tres apartamentos más
await apto('A1', 1);
const avisos = [];
for (const [a, n] of [['A2', 2], ['B1', 3], ['B2', 4]]) {
  siguienteApartamento(); await esperar(500);
  avisos.push((document.getElementById('toast') || {}).textContent || '');
  await apto(a, n);
}
saveDraft(true);
const fechas = lista().map(b => b.apto + ':' + b.fecha).sort().join(',');
ok('2 · Tres apartamentos más con «Guardar y otro apto» no vuelven a preguntar; los cuatro quedan con el 5-oct y el aviso dice «Sigue con la fecha 05-oct»',
   preguntas().length === 1 && fechas === 'A1:2026-10-05,A2:2026-10-05,B1:2026-10-05,B2:2026-10-05' && avisos.every(t => /Sigue con la fecha 05-oct, no la de hoy/.test(t)),
   fechas + ' · preguntas=' + preguntas().length + ' · ' + avisos[0]);

// 3 · volver a elegir el 5-oct
sel('fecha', '2026-10-05');
ok('3 · Volver a elegir el 5-oct (ya confirmado) no pregunta', preguntas().length === 1);

// 4 · guardar y enviar todos
Q.dialogos = []; saveDraft(); await esperar(200);
const e0 = (await Q.envios()).length;
await enviarPendientes(); await hasta(() => !_tandaEnCurso, 30000); await esperar(400);
ok('4 · «Guardar» y «Enviar todos» no preguntan la fecha, y salen los cuatro con el 5-oct',
   !Q.dialogos.some(d => /fecha/i.test(d) && !/Se van a enviar|Enviados/.test(d)) && (await Q.envios()).slice(e0).filter(e => e.numero && e.datos.fecha === '2026-10-05').length === 4,
   Q.dialogos.map(d => d.replace(/\n/g, ' ').slice(0, 60)).join(' | '));

// 5 · abrir un borrador del 5-oct en otra sesión (sin nada confirmado)
const otro = Object.assign(JSON.parse(JSON.stringify(lista()[0])), { id: 'draft_' + Date.now(), enviado: undefined });
localStorage.setItem('garmel_reports_list', JSON.stringify([otro])); olvidar();
nuevoFormulario(); await esperar(200); Q.dialogos = [];
loadDraftData(0); await esperar(700);
ok('5 · Abrir un borrador con el 5-oct, sin nada confirmado en esta sesión, no pregunta (no es una elección en el selector)',
   preguntas().length === 0 && document.getElementById('fecha').value === '2026-10-05', document.getElementById('fecha').value);

// 6 · «no»: vuelve la que había
olvidar(); nuevoFormulario(); await esperar(300); setAmbito('apartamento'); cabecera();
sel('fecha', '2026-10-13'); await esperar(100);
const docAntes = (document.getElementById('doc-fecha') || {}).textContent;
Q.aceptar = false; Q.dialogos = []; sel('fecha', '2026-10-05'); await esperar(200); Q.aceptar = true;
ok('6 · Con «no» vuelve la fecha que había (el 13-oct), y la cabecera del informe nunca mostró el 5-oct',
   preguntas().length === 1 && document.getElementById('fecha').value === '2026-10-13' && (document.getElementById('doc-fecha') || {}).textContent === docAntes && !/2026-10-05/.test(docAntes),
   document.getElementById('fecha').value + ' · cabecera «' + (document.getElementById('doc-fecha') || {}).textContent + '»');

// 7 · «no» sin fecha antes
nuevoFormulario(); await esperar(300); document.getElementById('fecha').dataset.antes192 = '';
Q.aceptar = false; Q.dialogos = []; sel('fecha', '2026-10-04'); await esperar(200); Q.aceptar = true;
ok('7 · Con «no» y sin fecha antes, el campo queda vacío para elegir de nuevo', preguntas().length === 1 && document.getElementById('fecha').value === '', '«' + document.getElementById('fecha').value + '»');

// 8 · hoy: no pregunta nada
_hoy192 = hoyReal; olvidar(); localStorage.setItem('garmel_reports_list', '[]');
nuevoFormulario(); await esperar(300); setAmbito('apartamento'); cabecera();
Q.dialogos = []; sel('fecha', iso(new Date())); await apto('A1', 2);
siguienteApartamento(); await esperar(500); const t8 = (document.getElementById('toast') || {}).textContent || '';
await apto('A2', 3); saveDraft();
await enviarPendientes(); await hasta(() => !_tandaEnCurso, 30000); await esperar(400);
ok('8 · Con la fecha de hoy no se pregunta nada: ni al elegirla, ni al pasar de apartamento, ni al guardar o enviar',
   !Q.dialogos.some(d => /La fecha que eligió|¿Seguro/.test(d)) && !/Sigue con la fecha/.test(t8) && lista().length === 2 && lista().every(b => b.enviado),
   Q.dialogos.map(d => d.replace(/\n/g, ' ').slice(0, 50)).join(' | '));

// 9 · a las 23:30
_hoy192 = () => new Date(2026, 9, 13, 23, 30); olvidar();
Q.dialogos = []; sel('fecha', '2026-10-13'); await esperar(100);
const n9a = preguntas().length; sel('fecha', '2026-10-14'); await esperar(100);
ok('9 · A las 23:30 del 13-oct, elegir el 13 no pregunta y el 14 sí (hora del teléfono, no UTC)', n9a === 0 && preguntas().length === 1, n9a + ' / ' + preguntas().length);
_hoy192 = hoyReal; localStorage.clear();
