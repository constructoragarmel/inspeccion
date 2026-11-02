// ESTRÉS 22 · la oficina y el papel (2-nov-2026, 30 rondas, O1 a O10): imprimir la T-04 con letra + piso, pasar a mano una hoja
// de hace tres días (quién la pasa, fecha de la hoja, la fecha de la visita), los avisos de fechas imposibles, el ⚠️ cuando el archivo
// es más nuevo que la hoja, pegar una hoja entera de Excel con Sí / No, «Pisos de la torre» en la T-43, «Toda la torre» cuando no
// cabe, la guía y la vista previa a 375. Se corre en inspeccion.html?prueba=1 (375×812 a la vista; 500 sin ventana).
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem('garmel_reports_list', '[]');
localStorage.removeItem('garmel_cortes'); Object.keys(_cortes).forEach(k => delete _cortes[k]);
const limpiar = () => Object.keys(localStorage).filter(k => /^garmel_planilla_/.test(k)).forEach(k => localStorage.removeItem(k));
limpiar(); Q.aceptar = true;
await Q.relevo({ caido: false, fallar: [], lento: 0, colgar: 0, perder: false, cortar: 0, borrar: true });
{ const real = await (await fetch('/reales/SR-T-04.json?' + Date.now())).json(); const inf = {};
  Object.keys(real.informes || {}).filter(k => k !== 'TORRE').forEach(k => { inf[k] = real.informes[k]; });
  await Q.relevo({ sembrarAvance: { sector: 'SR', torre: 'T-04', prueba: true, informes: inf } }); }
await Q.relevo({ sembrarAvance: { sector: 'SR', torre: 'T-43', prueba: true, informes: {} } });
await Q.relevo({ sembrarAvance: { sector: 'EZ', torre: 'T-12', prueba: true, informes: {} } });
const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const HOY = iso(new Date()), HACE3 = iso(new Date(Date.now() - 3 * 864e5)), MANANA = iso(new Date(Date.now() + 864e5)), W = innerWidth;
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const E = () => _plEstado(), N = (k, c) => E().est.N[k] && E().est.N[k][c];
const cabecera = async (conv, torre, fecha) => {
  nuevoFormulario(); await esperar(300); setAmbito('apartamento'); await esperar(200);
  sel('fecha', fecha || HOY); sel('convenio', conv); sel('torre', torre); await esperar(400);
  { const ins = document.querySelector('.inspector-select'); Q.elegir(ins, [...ins.options].map(o => o.value).filter(Boolean)[0]); await esperar(300); }
  if (!document.querySelector('#estatus .ck-lbl.on')) [...document.querySelectorAll('#estatus .ck-lbl')].find(l => /progreso/.test(l.textContent)).click();
};
const abrir = async () => { abrirPlanilla(); await hasta(() => E().P && /archivo|teléfono|guardado/.test(E().P.origenPrev || '') && !!$('#pl-cuerpo .pl-g, #pl-cuerpo .pl-piso, #pl-cuerpo .pl-tw'), 15000); await esperar(250); };
const inp = (k, c) => $('#planilla input.pl-pc[data-k="' + k + '"][data-c="' + c + '"]');
const escribirEn = (k, c, v) => { const i = inp(k, c); if (!i) throw new Error('no está ' + k + ' ' + c); i.focus(); i.value = v; i.dispatchEvent(new Event('change')); return i; };

// ── O1 · Imprimir la T-04 (10 por piso, letra + piso): cada tamaño cubre todos, sin hojas cortadas ──
await cabecera('Convenio Rusos', 'T-04'); await abrir();
const total4 = E().P.aptos.length;
const hojas = [];
for (const t of ['comoda', 'compacta', 'toda']) {
  _plIr({ vista: 'imp', tamano: t }); await esperar(200);
  const dis = !!($('#planilla input[name=pl-tam][value=' + t + ']') || {}).disabled;
  const filas = [...document.querySelectorAll('#planilla .pl-hoja tbody th')].map(x => x.textContent.trim());
  hojas.push({ t, dis, n: document.querySelectorAll('#planilla .pl-hoja').length, filas: new Set(filas).size, a07: filas.some(f => /C07/.test(f)) });
}
ok('O1 · T-04 impresa: «cómoda» y «compacta» cubren los ' + total4 + ' (con C07, no C7); «toda» se apaga si no cabe', hojas.filter(h => !h.dis).every(h => h.filas >= total4 && h.a07) && hojas.find(h => h.t === 'toda').dis === (total4 > 48), JSON.stringify(hojas));
cerrarPlanilla(); await esperar(200);
// ── O2 · Pasar a mano una hoja de hace tres días: visita de hace 3 días, hoja impresa ese día, quién la pasa ──
await cabecera('Convenio Bielorrusos', 'T-12', HACE3); await abrir();
_plIr({ vista: 'tabla' }); await esperar(200);
sel('pl-impresa', HACE3); await esperar(100);
escribirEn('P03AA1', '3.01', '75'); escribirEn('P03AA2', '3.01', '75%'); escribirEn('P03AB1', '3.02', ' 50 '); await esperar(100);
$('#pl-rev').click(); await esperar(150);
const sinPasa = $('#pl-sheet').textContent;
ok('O2 · Sin «quién pasa la hoja» no deja guardar y lo dice', /falta quién pasa la hoja/.test(sinPasa) && !!$('#pl-rgua') && $('#pl-rgua').disabled, sinPasa.replace(/\s+/g, ' ').slice(0, 160));
if ($('#pl-rseg')) $('#pl-rseg').click(); else if ($('#pl-sheet [id$="no"]')) $('#pl-sheet [id$="no"]').click(); await esperar(100);
_plIr({ vista: 'tabla' }); await esperar(120); sel('pl-pasa', 'Oficina Ciudad Tiuna'); await esperar(80);
$('#pl-rev').click(); await esperar(150); if ($('#pl-rr')) $('#pl-rr').click(); $('#pl-rgua').click(); await esperar(800);
const of = getSavedReports().filter(b => /EZ-T12-P03A/.test(b.nro || ''));
const f0 = of[0] || {};
ok('O2b · Salen 3 informes con la fecha de la visita (hace 3 días), origen «oficina», quién la pasa y la hoja impresa', of.length === 3 && of.every(b => b.fecha === HACE3 && b.planilla && b.planilla.origen === 'oficina' && b.planilla.pasa === 'Oficina Ciudad Tiuna' && b.planilla.impresa === HACE3) && of.every(b => b.nro.indexOf(HACE3.slice(2).replace(/-/g, '')) > 0),
   of.length + ' · ' + JSON.stringify(f0.planilla) + ' · ' + f0.fecha + ' · ' + f0.nro);
cerrarPlanilla(); await esperar(200);
Q.dialogos.length = 0; await enviarPendientes(); await hasta(() => !_tandaEnCurso, 60000); await esperar(400);
ok('O2c · «Enviar todos» los manda (guardados hoy: no son «olvidados» aunque la visita sea de hace 3 días)', (await Q.envios()).filter(e => /EZ-T12-P03A/.test(e.numero || '')).length === 3, Q.dialogos.join(' | ').slice(0, 160));
// ── O3 · Fechas imposibles: hoja impresa después de la visita, u hoja futura ──
await cabecera('Convenio Bielorrusos', 'T-12', HACE3); await abrir(); _plIr({ vista: 'tabla' }); await esperar(150);
sel('pl-pasa', 'Oficina'); sel('pl-impresa', HOY); escribirEn('P05AA1', '3.01', '25'); $('#pl-rev').click(); await esperar(150);
const t3a = $('#pl-sheet').textContent; if ($('#pl-rseg')) $('#pl-rseg').click(); await esperar(80);
_plIr({ vista: 'tabla' }); await esperar(100); sel('pl-impresa', MANANA); $('#pl-rev').click(); await esperar(150);
const t3b = $('#pl-sheet').textContent; if ($('#pl-rseg')) $('#pl-rseg').click(); await esperar(80);
ok('O3 · No guarda si la hoja es posterior a la visita ni si es futura, y dice qué corregir', /no sea anterior a la hoja impresa/.test(t3a) && /no sea futura/.test(t3b), t3a.replace(/\s+/g, ' ').slice(0, 120) + ' || ' + t3b.replace(/\s+/g, ' ').slice(0, 120));
_plDeshacer(); cerrarPlanilla(); await esperar(200); limpiar();
// ── O4 · La hoja es de antes que lo que ya está en el archivo: ⚠️ en esa fila ──
await Q.relevo({ sembrarAvance: { sector: 'EZ', torre: 'T-12', prueba: true, informes: { P06AA1: { nro: 'PRUEBA-EZ-T12-P06AA1-' + HOY.slice(2).replace(/-/g, '') + '-ZZ', fecha: HOY, piso: 'Piso 06', apto: 'A1', pcts: { '3.01': 100 } } } } });
await cabecera('Convenio Bielorrusos', 'T-12'); await abrir(); _plIr({ vista: 'tabla' }); await esperar(150);
sel('pl-impresa', HACE3); await esperar(150);
const fila6 = [...document.querySelectorAll('#planilla .pl-tw tbody th')].find(t => /06 · A1|P06.*A1|6 · A1/.test(t.textContent));
ok('O4 · Con la hoja de hace 3 días, el apartamento que ya tiene un informe de hoy lleva ⚠️', !!fila6 && /⚠️/.test(fila6.textContent), fila6 ? fila6.textContent : 'sin fila');
cerrarPlanilla(); await esperar(200); limpiar();
// ── O5 · Pegar una hoja de Excel: 4 filas × 4 columnas de Sanitarias con vacíos, «—», y en Pruebas sí / no / x ──
await cabecera('Convenio Bielorrusos', 'T-12'); await abrir(); _plIr({ vista: 'tabla' }); await esperar(150);
const pegar = (k, c, txt) => { const dt = new DataTransfer(); dt.setData('text/plain', txt); const i = inp(k, c); i.focus(); i.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true })); };
pegar('P08AA1', '3.01', '100\t50\t\t25\r\n90\t—\t10\t\r\n80\t40\t20\t5\r\n\t\t\t\r\n');
const p5 = ['P08AA1', 'P08AA2', 'P08AB1', 'P08AB2'].map(k => ['3.01', '3.02', '3.20', '3.21'].map(c => N(k, c) === undefined ? '·' : N(k, c)).join('/')).join(' | ');
_plIr({ abrir: 'hito_pruebas' }); _plIr({ vista: 'tabla' }); await esperar(150);
const pr = inp('P08AA1', '11.01'); let p5b = 'sin columna de pruebas';
if (pr) { pegar('P08AA1', '11.01', 'si\r\nx\r\nno\r\nquizás\r\n'); p5b = ['P08AA1', 'P08AA2', 'P08AB1', 'P08AB2'].map(k => N(k, '11.01') === undefined ? '·' : N(k, '11.01')).join('/'); }
ok('O5 · Pegar de Excel: los números en su casilla, «—» y vacíos no tocan nada; en Sí/No «si» y «x» son 100, «no» es 0 y «quizás» no entra',
   p5 === '100/50/·/25 | 90/·/10/· | 80/40/20/5 | ·/·/·/·' && (p5b === '100/100/0/·' || p5b === 'sin columna de pruebas'), p5 + ' · pruebas ' + p5b);
cerrarPlanilla(); await esperar(200); limpiar();
// ── O6 · T-43 en la oficina: «Pisos de la torre» a 12 deja 120 (letra + piso) y no baja de lo que tiene datos ──
await cabecera('Convenio Rusos', 'T-43'); await abrir(); _plIr({ vista: 'tabla' }); await esperar(150);
escribirEn('P11AJ11', '3.01', '50'); await esperar(60);
{ const np = $('#pl-npisos'); np.value = '12'; np.dispatchEvent(new Event('change')); await esperar(150); }
const a12 = E().P.aptos.length, tiene12 = E().P.aptos.some(x => x.k === 'P12AJ12');
{ const np = $('#pl-npisos'); np.value = '9'; np.dispatchEvent(new Event('change')); await esperar(150); }
ok('O6 · T-43: 12 pisos son 120 (P12 con J12); bajar a 9 con datos en el 11 no deja y lo dice', a12 === 120 && tiene12 && E().P.pisos === 12 && /11 tiene datos/.test(_plUltimoAviso()), a12 + ' · ' + E().P.pisos + ' · ' + _plUltimoAviso());
// ── O7 · La oficina en una tableta: la T-43 con todos los capítulos abiertos se pinta rápido ──
E().LISTA.forEach(h => _plIr({ abrir: h.id })); const t7 = performance.now(); _plIr({ vista: 'tabla' }); await esperar(10); const ms7 = performance.now() - t7;
const nIn = document.querySelectorAll('#planilla input.pl-pc').length;
ok('O7 · T-43 con todo abierto: ' + nIn + ' casillas pintadas en menos de 2 s', nIn > 4000 && ms7 < 2000, Math.round(ms7) + ' ms');
_plDeshacer(); cerrarPlanilla(); await esperar(200); limpiar();
// ── O8 · «Toda la torre en una hoja» con 64 apartamentos (EZ, PB a 15): se apaga y dice por qué ──
await cabecera('Convenio Bielorrusos', 'T-12'); await abrir(); _plIr({ vista: 'imp', tamano: 'toda' }); await esperar(200);
const opToda = $('#planilla input[name=pl-tam][value=toda]');
ok('O8 · Con 64 apartamentos «Toda la torre» no se puede (la hoja se cortaría) y lo explica', (!!opToda && (opToda.disabled || opToda.closest('[aria-disabled="true"]'))) || /cortaría|no cabe|más de 48/i.test($('#planilla').textContent), opToda ? opToda.outerHTML.slice(0, 120) : $('#planilla .pl-tot') && $('#planilla .pl-tot').textContent);
// ── O9 · La guía: cada capítulo con sus hitos, la 5.04 con su nombre nuevo, y nada cortado a este ancho ──
_plIr({ vista: 'guia' }); await esperar(150);
const g = $('#planilla').textContent;
ok('O9 · La guía lista Sanitarias (hitos 3 y 7), Eléctricas (3 y 8) y Gas, con «Marcos metálicos de puertas», y no se sale de lado', /Instalaciones sanitarias \(hitos 3 y 7\)/.test(g) && /voz y data \(hitos 3 y 8\)/.test(g) && /Marcos metálicos de puertas/.test(g) && document.documentElement.scrollWidth <= W + 1);
// ── O10 · Vista previa de la hoja a este ancho e «Imprimir» llama una sola vez al diálogo ──
_plIr({ vista: 'imp', tamano: 'comoda' }); await esperar(200);
const hj = $('#planilla .pl-hoja').getBoundingClientRect(); let impr = 0; const pb = window.print; window.print = () => { impr++; };
if ($('#pl-imprimir') && !$('#pl-imprimir').disabled) { $('#pl-imprimir').click(); await esperar(300); }
window.print = pb;
ok('O10 · La hoja se ve entera al ancho (' + W + ' px) y «Imprimir» abre el diálogo una vez', hj.right <= W + 1 && hj.width > 200 && impr === 1, Math.round(hj.width) + ' px · impresiones ' + impr);
cerrarPlanilla(); nuevoFormulario(); localStorage.setItem('garmel_reports_list', '[]'); limpiar();
