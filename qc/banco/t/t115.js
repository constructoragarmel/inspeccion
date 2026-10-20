// TANDA 115 · v180 (20-oct-2026, comun/antes_de_enviar.js): la fecha que no es hoy se pregunta UNA vez, al elegirla, en
// servicios.html, sha.html y urbanismo.html (?prueba=1). Lo mismo que t114 en obra, con «Sig. torre» en vez de «Siguiente apto.».
// La tanda «está» en el 13-oct cambiando `_hoy192`. Sin datos reales.
// 1 elegir el 5-oct estando en el 13-oct pregunta una vez y con «sí» se queda · 2 tres lugares más con «Sig. torre» no vuelven a
// preguntar, los cuatro quedan con el 5-oct y un aviso dice «Sigue con la fecha 05-oct» · 3 «Guardar» y «Enviar» no preguntan ·
// 4 abrir un informe del 5-oct sin nada confirmado no pregunta · 5 con «no» vuelve la fecha que había y el número no cambia ·
// 6 hoy no pregunta nada.
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem(CLAVE_LISTA, '[]');
localStorage.removeItem(CLAVE_TORRES); localStorage.removeItem(CLAVE_ACTUAL);
Q.aceptar = true;
await Q.relevo({ caido: false, fallar: [], lento: 0, colgar: 0, perder: false, borrar: true });
const hoyReal = _hoy192;
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); };
const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const olvidar = () => Object.keys(_fechasOk192).forEach(k => delete _fechasOk192[k]);
const preguntas = () => Q.dialogos.filter(d => /La fecha que eligió/.test(d));
const insp = () => { const i = document.querySelector('#inspectores select'); if (i && !i.value) Q.elegir(i, [...i.options].map(o => o.value).filter(Boolean)[0]); };
const est = () => { const e = $('#estatus'); if (e && e.tagName === 'SELECT' && !e.value) sel('estatus', [...e.options].map(o => o.value).filter(Boolean)[0]); };
const contestar = () => {
  const it = document.querySelector('[id^="items-"] .item');
  const si = [...it.querySelectorAll('button')].find(b => /^S[ií]$/i.test(b.textContent.trim()));
  if (si) si.click(); else { const c = it.querySelector('.cant'); c.value = '5'; c.dispatchEvent(new Event('input', { bubbles: true })); }
};
const lugares = () => [...document.getElementById('torre').options].map(o => o.value).filter(v => v && v !== 'ZONA');
const lugar = async t => { sel('torre', t); await esperar(400); if ($('#aviso-historial .no')) $('#aviso-historial .no').click(); insp(); est(); contestar(); };

// 1
_hoy192 = () => new Date(2026, 9, 13, 10, 23);
olvidar(); nuevoInforme(); await esperar(300); sel('convenio', 'Convenio Bielorrusos'); await esperar(150);
const L = lugares();
Q.dialogos = []; sel('fecha', '2026-10-05');
ok('1 · Elegir el 5-oct estando en el 13-oct pregunta una vez «… es el 05-oct, no hoy (13-oct). ¿Es correcta?» y con «sí» se queda',
   preguntas().length === 1 && /es el 05-oct, no hoy \(13-oct\)/.test(preguntas()[0]) && document.getElementById('fecha').value === '2026-10-05',
   preguntas().map(d => d.replace(/\n/g, ' ')).join(' | '));

// 2
await lugar(L[0]);
const avisos = [];
for (const t of [L[1], L[2], L[3]]) {
  siguienteTorre(); await esperar(600);
  const a = document.getElementById('aviso192'); avisos.push(a && !a.hidden ? a.textContent : '');
  await lugar(t);
}
guardar(false); await esperar(300);
const fechas = listaGuardada().map(b => b.fecha);
ok('2 · Tres lugares más con «Sig. torre» no vuelven a preguntar; los cuatro quedan con el 5-oct y el aviso dice «Sigue con la fecha 05-oct»',
   preguntas().length === 1 && fechas.length === 4 && fechas.every(f => f === '2026-10-05') && avisos.every(t => /Sigue con la fecha 05-oct, no la de hoy/.test(t)),
   fechas.join(',') + ' · preguntas=' + preguntas().length + ' · ' + avisos.join(' / ').slice(0, 160));

// 3
Q.dialogos = []; guardar(true); await esperar(200);
const e0 = (await Q.envios()).length;
await enviar(); await hasta(() => !_tandaEnCurso, 40000); await esperar(600);
ok('3 · «Guardar» y «Enviar» no preguntan la fecha, y salen los cuatro con el 5-oct',
   !Q.dialogos.some(d => /La fecha que eligió|¿Seguro/.test(d)) && (await Q.envios()).slice(e0).filter(e => e.numero && e.datos.fecha === '2026-10-05').length === 4,
   Q.dialogos.map(d => d.replace(/\n/g, ' ').slice(0, 60)).join(' | '));

// 4
const otro = Object.assign(JSON.parse(JSON.stringify(listaGuardada()[0])), { id: String(listaGuardada()[0].id).split('_')[0] + '_' + Date.now(), enviado: undefined });
localStorage.setItem(CLAVE_LISTA, JSON.stringify([otro])); olvidar(); nuevoInforme(); await esperar(200);
Q.dialogos = []; cargarInforme(otro.id); await esperar(600);
ok('4 · Abrir un informe con el 5-oct, sin nada confirmado en esta sesión, no pregunta', preguntas().length === 0 && document.getElementById('fecha').value === '2026-10-05');

// 5
olvidar(); nuevoInforme(); await esperar(300); sel('convenio', 'Convenio Bielorrusos'); await esperar(150); await lugar(L[0]);
sel('fecha', '2026-10-13'); await esperar(100); const nro5 = numeroInforme();
Q.aceptar = false; Q.dialogos = []; sel('fecha', '2026-10-05'); await esperar(200); Q.aceptar = true;
ok('5 · Con «no» vuelve la fecha que había (el 13-oct) y el número del informe sigue siendo el del 13',
   preguntas().length === 1 && document.getElementById('fecha').value === '2026-10-13' && numeroInforme() === nro5 && /261013/.test(nro5),
   document.getElementById('fecha').value + ' · ' + nro5 + ' → ' + numeroInforme());

// 6
_hoy192 = hoyReal; olvidar(); localStorage.setItem(CLAVE_LISTA, '[]'); nuevoInforme(); await esperar(300);
sel('convenio', 'Convenio Bielorrusos'); await esperar(150);
Q.dialogos = []; sel('fecha', iso(new Date())); await lugar(L[0]); siguienteTorre(); await esperar(600);
const a6 = document.getElementById('aviso192');
await lugar(L[1]); guardar(true); await esperar(200);
ok('6 · Con la fecha de hoy no se pregunta ni se avisa nada', !Q.dialogos.some(d => /La fecha que eligió/.test(d)) && !(a6 && !a6.hidden && /Sigue con la fecha/.test(a6.textContent)),
   Q.dialogos.map(d => d.slice(0, 50)).join(' | '));
_hoy192 = hoyReal; localStorage.setItem(CLAVE_LISTA, '[]');
