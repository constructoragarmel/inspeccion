// TANDA 101 · v177 (20-oct-2026, cambio 189): «Quitar copias de informes ya enviados» en «Informes». Casos armados sobre la
// forma de las dos copias reales (T-52 del 19-oct: la copia trae menos que el original; T-46 del 14-oct: la copia trae una
// «ejecutada 0» que el original no). Sin datos reales: los textos son inventados.
// 1 el botón está en «Informes» y mide 44 px · 2 con el original enviado, el aviso lo lista con ✅ y al aceptar se va solo la
// copia · 3 la que tiene algo distinto no se quita y se nombra para revisar · 4 con el original sin enviar no se quita y se
// dice cuál enviar primero · 5 una copia con una foto que el original no tiene no se quita · 6 un informe sin número de
// otro lugar no se toca ni se nombra · 7 «Cancelar» no cambia nada · 8 tres copias del mismo original: «(3 copias)» y se
// van las tres · 9 sin copias dice «No hay copias» · 10 las fotos que se borran son las de la copia, no las del original ·
// 11 si la copia era la que estaba en pantalla, el formulario la suelta · 12 «Enviar todos» manda el original y deja fuera la
// copia · 13 después «Quitar copias» la quita con el original ya enviado
localStorage.clear(); Q.aceptar = true;
const P = (pr, ej, ev, ud) => ({ pr: pr || '', ej: ej || '', ev: ev || '', ud: ud || '', sn: '', pct: '' });
const base = { lista: 'v2', formType: 'detallado', ambito: 'apartamento', vista: '', fecha: '2026-10-19', convenio: 'Convenio Bielorrusos',
  empresa: 'DRIJECAE 3003, C.A.', torre: 'T-52', piso: 'Piso 01', apto: 'B1', inspectores: ['Inspectora Prueba (CIV-1)'], residentes: ['Residente Prueba'],
  estatus: ['Iniciada'], fotos: {}, fotobs: { hito_cerramientos: '- Levantamiento de paredes.' }, noInspeccionados: [], extraRows: {},
  actividades: '- Acarreo de materiales.', obs_general: '', obs_sp: '' };
const orig = (o) => Object.assign({}, base, { partidas: { hito_servicios: [P('11', '11', 'B', 'pto'), P('6', '6', 'B', 'pto'), P('100', '25', 'B', 'estado')] } }, o);
const copia = (o) => Object.assign({}, base, { nro: 'XX-T---P--A---261019---', uso: { segundos: 0, activoMs: 1 },
  partidas: { hito_servicios: [P('11', '11', '', 'pto'), P('6', '6', '', 'pto'), P('', '', '', 'estado')] } }, o);
const ENV = '19/10/2026, 15:14';
const poner = l => { localStorage.setItem('garmel_reports_list', JSON.stringify(l)); currentEditingIndex = null; _idEnEdicion = null; };
const ids = () => getSavedReports().map(b => b.id).join(',');
const ultimo = () => Q.dialogos[Q.dialogos.length - 1] || '';

// 1
openSavedModal(); await esperar(400);
const btn = $('#btn-quitar-copias');
ok('1 · El botón está en «Informes», visible y de 44 px o más', !!btn && btn.offsetParent !== null && btn.getBoundingClientRect().height >= 44,
   btn ? Math.round(btn.getBoundingClientRect().height) + ' px · «' + btn.textContent.trim() + '»' : 'no está');

// 2 · la de la T-52: original enviado, copia con menos
poner([orig({ id: 'draft_1000', nro: 'EZ-T52-P01AB1-261019-MR', enviado: ENV }), copia({ id: 'draft_2000' }),
       orig({ id: 'draft_0500', nro: 'EZ-T52-P01AB2-261019-MR', apto: 'B2' })]);
Q.dialogos = []; quitarCopias189(); await esperar(600);
ok('2 · Original enviado: el aviso lo lista con ✅ «enviado», dice que lo enviado sigue en Drive, y se va solo la copia',
   /✅ EZ-T52-P01AB1-261019-MR — enviado/.test(Q.dialogos[0] || '') && /sigue en Drive/.test(Q.dialogos[0] || '') && ids() === 'draft_1000,draft_0500',
   ids() + ' · ' + (Q.dialogos[0] || '').slice(0, 120));

// 3 · la de la T-46: la copia trae una «ejecutada 0» que el original no
const o46 = Object.assign(orig({ id: 'draft_1000', nro: 'EZ-T46-P01AA2-261014-YS', torre: 'T-46', apto: 'A2', enviado: ENV }));
o46.partidas = { hito_cerramientos: [P(), P('', '', '', 'm²')] };
const c46 = copia({ id: 'draft_2000', torre: 'T-46', apto: 'A2', uso: { segundos: 47, activoMs: 46645 } });
c46.partidas = { hito_cerramientos: [P(), Object.assign(P('', '0', '', 'm²'), { pct: '0' })] };
poner([o46, c46]); Q.dialogos = []; quitarCopias189(); await esperar(300);
ok('3 · La que tiene algo que el original no tiene NO se quita, y el aviso dice que se revise y dónde',
   ids() === 'draft_1000,draft_2000' && /No hay copias para quitar/.test(ultimo()) && /revise/.test(ultimo()) && /T-46 Piso 01 A2/.test(ultimo()), ultimo().slice(0, 200));

// 4 · original sin enviar
poner([orig({ id: 'draft_1000', nro: 'EZ-T52-P01AB1-261019-MR' }), copia({ id: 'draft_2000' })]);
Q.dialogos = []; quitarCopias189(); await esperar(300);
ok('4 · Con el original sin enviar no se quita, y dice cuál enviar primero',
   ids() === 'draft_1000,draft_2000' && /TODAVÍA NO SE ENVIARON/.test(ultimo()) && /EZ-T52-P01AB1-261019-MR/.test(ultimo()), ultimo().slice(0, 160));

// 5 · la copia tiene una foto que el original no
poner([orig({ id: 'draft_1000', nro: 'EZ-T52-P01AB1-261019-MR', enviado: ENV }), copia({ id: 'draft_2000', fotos: { hito_servicios: ['idb'] } })]);
Q.dialogos = []; quitarCopias189(); await esperar(300);
ok('5 · Una copia con una foto que el original no tiene no se quita', ids() === 'draft_1000,draft_2000' && /revise/.test(ultimo()), ultimo().slice(0, 120));

// 6 · un informe sin número de otro lugar (uno nuevo a medio llenar)
poner([orig({ id: 'draft_1000', nro: 'EZ-T52-P01AB1-261019-MR', enviado: ENV }), copia({ id: 'draft_2000', apto: 'B2' })]);
Q.dialogos = []; quitarCopias189(); await esperar(300);
ok('6 · Un informe sin número de otro apartamento no se toca ni se nombra', ids() === 'draft_1000,draft_2000' && /No hay copias/.test(ultimo()) && !/B2/.test(ultimo()), ultimo().slice(0, 120));

// 7 · «Cancelar»
poner([orig({ id: 'draft_1000', nro: 'EZ-T52-P01AB1-261019-MR', enviado: ENV }), copia({ id: 'draft_2000' })]);
const antes7 = localStorage.getItem('garmel_reports_list');
Q.aceptar = false; Q.dialogos = []; quitarCopias189(); await esperar(300); Q.aceptar = true;
ok('7 · «Cancelar» no cambia nada', localStorage.getItem('garmel_reports_list') === antes7 && Q.dialogos.length === 1);

// 8 · tres copias del mismo original · 10 · qué fotos se borran
const borradas = []; const delOrig = _fotosDel; _fotosDel = id => { borradas.push(id); return Promise.resolve(); };
poner([orig({ id: 'draft_1000', nro: 'EZ-T52-P01AB1-261019-MR', enviado: ENV }), copia({ id: 'draft_2000' }), copia({ id: 'draft_3000' }), copia({ id: 'draft_4000' })]);
Q.dialogos = []; quitarCopias189(); await esperar(600);
_fotosDel = delOrig;
ok('8 · Tres copias del mismo original: el aviso dice «(3 copias)» y se van las tres', /\(3 copias\)/.test(Q.dialogos[0] || '') && ids() === 'draft_1000', ids());
ok('10 · Se borran las fotos de las tres copias y no las del original', borradas.sort().join(',') === 'draft_2000,draft_3000,draft_4000', borradas.join(','));

// 9
Q.dialogos = []; quitarCopias189(); await esperar(300);
ok('9 · Sin copias dice «No hay copias para quitar»', /No hay copias para quitar/.test(ultimo()), ultimo().slice(0, 80));

// 11 · la copia estaba abierta en pantalla
poner([orig({ id: 'draft_1000', nro: 'EZ-T52-P01AB1-261019-MR', enviado: ENV }), copia({ id: 'draft_2000' })]);
currentEditingIndex = 1; _idEnEdicion = 'draft_2000';
Q.dialogos = []; quitarCopias189(); await esperar(400);
ok('11 · Si la copia era la que estaba en pantalla, el formulario la suelta (el próximo guardado no la revive)',
   _idEnEdicion === null && currentEditingIndex === null && ids() === 'draft_1000', String(_idEnEdicion) + ' / ' + currentEditingIndex);
// 12 y 13 · lo que se les pide en obra, de punta a punta: «Enviar todos» y después «Quitar copias»
await Q.relevo({ caido: false, fallar: [], lento: 0, colgar: 0, perder: false });
localStorage.setItem('garmel_clave_envio', 'qc');
poner([orig({ id: 'draft_1000', nro: 'PRUEBA-EZ-T52-P01AB1-261019-MR' }), copia({ id: 'draft_2000', nro: 'PRUEBA-XX-T---P--A---261019---' })]);
const envAntes = (await Q.envios()).length;
Q.dialogos = []; await enviarPendientes(); await hasta(() => !_tandaEnCurso, 30000); await esperar(500);
const env = (await Q.envios()).slice(envAntes).filter(e => e.numero);
ok('12 · «Enviar todos» manda el original y deja fuera la copia diciendo de cuál es copia',
   env.length === 1 && env[0].numero === 'PRUEBA-EZ-T52-P01AB1-261019-MR' && /es copia de PRUEBA-EZ-T52-P01AB1-261019-MR/.test(Q.dialogos[0] || '') &&
   !!getSavedReports().find(b => b.id === 'draft_1000').enviado,
   env.map(e => e.numero).join(',') + ' · ' + (Q.dialogos[0] || '').slice(0, 160));
Q.dialogos = []; quitarCopias189(); await esperar(600);
ok('13 · Después, «Quitar copias» la quita con el original ya en ✅, y el original sigue en el teléfono como enviado',
   /✅ PRUEBA-EZ-T52-P01AB1-261019-MR — enviado/.test(Q.dialogos[0] || '') && ids() === 'draft_1000', ids());
localStorage.clear();
