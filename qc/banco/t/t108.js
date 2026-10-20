// TANDA 108 · QC 1 a 4 de la segunda serie (20-oct-2026), en inspeccion.html?prueba=1, a la vista (fotos y envío).
// 1 un día real: tres apartamentos seguidos con «Guardar y otro apto», con medida, conteo, estado y foto, y «Enviar todos»:
//   tres envíos con números distintos, todos enviados, el contador en cero · 2 el teléfono de Leidy simulado: 60 informes
//   (8 enviados, 20 copias de ellos, 5 copias de originales sin enviar, 3 copias distintas, 4 en blanco, 20 propios sin
//   enviar): «Quitar copias» quita las 20, el aviso se lee (largo razonable) y lo demás queda · 3 «Enviar todos» sobre eso
//   no manda copias ni blancos · 4 «Mandar la lista» después sigue contando bien
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem('garmel_reports_list', '[]');
Q.aceptar = true;
await Q.relevo({ caido: false, fallar: [], lento: 0, colgar: 0, perder: false });
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); };
const apto = v => { const a = document.querySelector('select[onchange*="_aptoDesdeLista"]'); a.value = v; a.dispatchEvent(new Event('change', { bubbles: true })); };
const medir = async (k) => {
  const ins = [...document.querySelectorAll('input.num')].filter(i => i.offsetParent && !i.readOnly);
  if (ins[0]) { ins[0].value = String(10 + k); ins[0].dispatchEvent(new Event('input', { bubbles: true })); }
  const fila = _filaDe('hito_servicios_2'); if (fila) { const b = [...fila.querySelectorAll('button')].find(x => /En proceso/.test(x.textContent)); if (b) b.click(); }
  const inp = [...document.querySelectorAll('input[type=file]')].find(i => /cerramientos/.test((i.closest('[id]') || {}).id || '') ) || document.querySelector('input[type=file]');
  if (inp && k === 0) { Q.ponerFotos(inp, [await Q.foto(1200, 900, 108)]); await esperar(1500); }
};
sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-01'); await esperar(400);
const ins = document.querySelector('.inspector-select'); Q.elegir(ins, [...ins.options].map(o => o.value).find(v => /Cleidy/.test(v)));
sel('piso', 'Piso 03'); apto('A1'); document.querySelector('#estatus input').click(); await esperar(200);
await medir(0);
for (const [k, a] of [[1, 'A2'], [2, 'B1']]) { siguienteApartamento(); await esperar(700); apto(a); await esperar(200); await medir(k); }
autoguardar(); await esperar(300);
const antes = getSavedReports().filter(b => !b.enviado);
const env0 = (await Q.envios()).length;
Q.dialogos = []; await enviarPendientes(); await hasta(() => !_tandaEnCurso, 40000); await esperar(600);
const env = (await Q.envios()).slice(env0).filter(e => e.numero);
const nros = env.map(e => e.numero);
ok('1 · Tres apartamentos seguidos: tres envíos con números distintos (P03 A1, A2, B1), todos enviados, la foto en el primero y el contador en cero',
   antes.length === 3 && env.length === 3 && new Set(nros).size === 3 && nros.every(n => /PRUEBA-EZ-T01-P03A(A1|A2|B1)-/.test(n)) &&
   getSavedReports().every(b => b.enviado) && (env.find(e => /A1-/.test(e.numero)).fotos || []).length === 1 && /Enviar\s*$|Enviar \(0\)|^📤 Enviar$/.test(([...document.querySelectorAll('button')].find(b => /Enviar/.test(b.innerText) && b.offsetParent) || {}).innerText.trim()),
   nros.join(', ') + ' · ' + antes.length + ' antes');
// 2 · el teléfono de Leidy
const P = (pr, ej, ev, ud) => ({ pr: pr || '', ej: ej || '', ev: ev || '', ud: ud || '', sn: '', pct: '' });
const base = { lista: 'v2', formType: 'detallado', ambito: 'apartamento', vista: '', fecha: '2026-10-15', convenio: 'Convenio Bielorrusos', empresa: 'PROCODIMA, C.A.', torre: 'T-15',
  inspectores: ['Leidy Villamizar (CIV-258.266)'], estatus: ['En progreso'], fotos: {}, fotobs: {}, noInspeccionados: [], extraRows: {}, timestamp: '15/10/2026, 10:00:00 a.m.' };
const L = []; let id = 1000;
const lugares = [];
for (let p = 1; p <= 4; p++) for (const a of ['A1', 'A2', 'B1', 'B2']) lugares.push(['Piso 0' + p, a]);
const orig = (i, env) => Object.assign({}, base, { id: 'draft_' + (id++), piso: lugares[i][0], apto: lugares[i][1], nro: 'EZ-T15-P0' + lugares[i][0].slice(-1) + 'A' + lugares[i][1] + '-261015-LV', enviado: env ? '15/10/2026, 12:00' : undefined, partidas: { hito_puertas: [P('6', String(2 + i), 'B', 'pza')] } });
const copia = (o, mas) => Object.assign({}, o, { id: 'draft_' + (id++), nro: 'XX-T---P--A---261015---', enviado: undefined, uso: { segundos: 0 }, partidas: { hito_puertas: [P('6', mas ? '9' : o.partidas.hito_puertas[0].ej, '', 'pza')] } });
const enviados = [0, 1, 2, 3, 4, 5, 6, 7].map(i => orig(i, true)); enviados.forEach(o => L.push(o));
enviados.forEach((o, i) => { L.push(copia(o)); L.push(copia(o)); if (i < 4) L.push(copia(o)); });   // 20 copias contenidas
const sinEnviar = [8, 9, 10, 11, 12].map(i => orig(i, false)); sinEnviar.forEach(o => { L.push(o); L.push(copia(o)); });   // 5 + 5
[0, 1, 2].forEach(i => L.push(copia(enviados[i], true)));   // 3 distintas
for (let k = 0; k < 4; k++) L.push(Object.assign({}, base, { id: 'draft_' + (id++), nro: '(se arma al completar la cabecera)', piso: '', apto: '', partidas: {} }));
for (let k = L.length; k < 60; k++) L.push(Object.assign(orig(13 + (k % 3), false), { piso: 'Piso 0' + (5 + (k % 4)), apto: 'C' + k, nro: 'EZ-T15-P05AC' + k + '-261015-LV' }));
nuevoFormulario(); await esperar(300);   // la pantalla vacía: si no, «Enviar todos» guarda el último de la T-01 sobre la lista simulada
localStorage.setItem('garmel_reports_list', JSON.stringify(L)); currentEditingIndex = null; _idEnEdicion = null;
const n0 = getSavedReports().length;
const t0 = performance.now(); Q.dialogos = []; quitarCopias189(); await esperar(500); const ms = Math.round(performance.now() - t0);
const aviso = Q.dialogos[0] || '', quedan = getSavedReports();
ok('2 · Teléfono de Leidy (60): «Quitar copias» quita las 20 copias de enviados, deja las 5 de sin enviar, las 3 distintas, los blancos y los propios; el aviso se lee',
   n0 === 60 && quedan.length === 40 && /Hay 20 copia/.test(aviso) && /TODAVÍA NO SE ENVIARON/.test(aviso) && aviso.length < 2500 && ms < 2000,
   n0 + ' → ' + quedan.length + ' · aviso de ' + aviso.length + ' caracteres · ' + ms + ' ms');
// 3 · Enviar todos sobre lo que quedó
const env1 = (await Q.envios()).length;
Q.dialogos = []; await enviarPendientes(); await hasta(() => !_tandaEnCurso, 60000); await esperar(600);
const mandados = (await Q.envios()).slice(env1).filter(e => e.numero).map(e => e.numero);
ok('3 · «Enviar todos» manda los propios, no manda copias ni blancos, y dice cuáles deja',
   mandados.length > 0 && mandados.every(n => /^EZ-T15-P0/.test(n)) && !mandados.some(n => /XX-/.test(n)) && /es copia de/.test(Q.dialogos.join(' ')),
   mandados.length + ' mandados · ' + (Q.dialogos[0] || '').slice(0, 140));
// 4 · la lista
const t = _textoLista187();
ok('4 · «Mandar la lista» después cuenta bien lo que hay', /informes:/.test(t.split('\n')[1]) && t.split('\n').length === getSavedReports().length + 3, t.split('\n')[1]);
localStorage.setItem('garmel_reports_list', '[]');
