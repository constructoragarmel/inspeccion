// TANDA 123 · v183 (21-oct-2026, Diego Orta): «cuando cargan información de una inspección anterior (obras) la fecha que sale en
// el informe nuevo sigue siendo la anterior». En `inspeccion.html?prueba=1`. Se abre un informe del 5-oct guardado en el teléfono
// y se toca «Siguiente apto.» estando en el 21-oct. 1 el informe nuevo arranca con la fecha de hoy, el número la lleva y un aviso lo
// dice, sin preguntar · 2 el del 5-oct no se toca · 3 si en esta sesión el inspector ELIGIÓ y confirmó el 5-oct, «Siguiente apto.»
// lo sigue arrastrando (el caso del 13-oct, t114) · 4 con la fecha de hoy no pasa nada · 5 el formulario de torre («Sig. torre»
// está en servicios, que comparte el código: ver t123b).
localStorage.clear();
localStorage.setItem('garmel_rol', 'inspector');
localStorage.setItem('garmel_clave_envio', 'qc');
Q.aceptar = true;
const put = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const lista = () => JSON.parse(localStorage.getItem('garmel_reports_list') || '[]');
const olvidar = () => Object.keys(_fechasOk192).forEach(k => delete _fechasOk192[k]);
const preguntas = () => Q.dialogos.filter(d => /La fecha que eligió/.test(d));
const toast = () => [(document.getElementById('toast') || {}).textContent || '', (document.getElementById('aviso192') || {}).textContent || ''].join(' ');
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
_hoy192 = () => new Date(2026, 9, 21, 10, 0);

// Un informe del 5-oct guardado en el teléfono (como si viniera de otro día)
olvidar(); nuevoFormulario(); await esperar(300); setAmbito('apartamento'); cabecera();
sel('fecha', '2026-10-05'); await apto('A1', 3); saveDraft(true); await esperar(200);
const viejo = lista()[0];
// Otra sesión: nada confirmado. Se abre ese informe y se toca «Siguiente apto.»
olvidar(); nuevoFormulario(); await esperar(200); Q.dialogos = [];
loadDraftData(0); await esperar(700);
const abierto = document.getElementById('fecha').value;
siguienteApartamento(); await esperar(600);
const nro = (document.getElementById('nro-display') || {}).textContent || '';
ok('1 · Abrir un informe del 5-oct y tocar «Siguiente apto.» deja el nuevo con la fecha de hoy (21-oct), en el número, con un aviso y sin preguntar',
   abierto === '2026-10-05' && document.getElementById('fecha').value === '2026-10-21' && /261021/.test(nro) && /Informe nuevo con la fecha de hoy \(21-oct\)\. El anterior era del 05-oct/.test(toast()) && preguntas().length === 0,
   abierto + ' → ' + document.getElementById('fecha').value + ' · ' + nro + ' · ' + toast().slice(0, 120) + ' · preguntas=' + preguntas().length);
await apto('A2', 4); saveDraft(true); await esperar(200);
const l2 = lista().map(b => b.apto + ':' + b.fecha).sort().join(',');
ok('2 · El del 5-oct no se toca; el nuevo se guarda con el 21-oct', l2 === 'A1:2026-10-05,A2:2026-10-21' && lista().some(b => b.id === viejo.id && b.fecha === '2026-10-05'), l2);

// 3 · en esta sesión el inspector eligió y confirmó el 5-oct: se sigue arrastrando
olvidar(); nuevoFormulario(); await esperar(300); setAmbito('apartamento'); cabecera(); Q.dialogos = [];
sel('fecha', '2026-10-05'); await apto('B1', 5);
siguienteApartamento(); await esperar(600);
ok('3 · Si el 5-oct lo eligió y confirmó en esta sesión, «Siguiente apto.» lo arrastra como antes, con su aviso',
   preguntas().length === 1 && document.getElementById('fecha').value === '2026-10-05' && /Sigue con la fecha 05-oct, no la de hoy/.test(toast()), document.getElementById('fecha').value + ' · ' + toast().slice(0, 80));

// 4 · con la fecha de hoy no pasa nada
olvidar(); nuevoFormulario(); await esperar(300); setAmbito('apartamento'); cabecera(); sel('fecha', '2026-10-21'); await apto('B2', 6);
['toast', 'aviso192'].forEach(id => { const e = document.getElementById(id); if (e) e.textContent = ''; }); Q.dialogos = []; siguienteApartamento(); await esperar(600);
ok('4 · Con la fecha de hoy, «Siguiente apto.» no cambia nada ni avisa de la fecha', document.getElementById('fecha').value === '2026-10-21' && !/Informe nuevo con la fecha|Sigue con la fecha/.test(toast()) && preguntas().length === 0, toast().slice(0, 80));
nuevoFormulario(); localStorage.removeItem('garmel_reports_list'); _hoy192 = () => new Date();
