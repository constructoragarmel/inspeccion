// ESTRÉS 14 · que ninguna torre deje fuera pisos o apartamentos sin informe (Stephanie, 2-nov-2026, a partir de la T-08 de EZ).
// Torres sin lista: los apartamentos de cada piso se deducen del historial. Se corre en inspeccion.html?prueba=1 a 375×812.
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem('garmel_reports_list', '[]');
const limpiar = () => Object.keys(localStorage).filter(k => /^garmel_planilla_/.test(k)).forEach(k => localStorage.removeItem(k));
limpiar();
await Q.relevo({ caido: false, fallar: [], lento: 0, colgar: 0, perder: false, borrar: true });
const inf = (sector, torre, pares) => { const s = {}; pares.forEach(([p, a]) => { const k = 'P' + String(p).padStart(2, '0') + 'A' + a; s[k] = { nro: 'PRUEBA-' + sector + '-' + torre.replace('-', '') + '-' + k + '-261020-XX', fecha: '2026-10-20', piso: 'Piso ' + String(p).padStart(2, '0'), apto: a, pcts: { '3.01': 50 } }; }); return s; };
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const E = () => _plEstado();
const abrirEn = async (convenio, torre) => {
  limpiar(); nuevoFormulario(); await esperar(300); setAmbito('apartamento'); await esperar(200);
  sel('fecha', new Date().toISOString().slice(0, 10)); sel('convenio', convenio); sel('torre', torre); await esperar(400);
  { const ins = document.querySelector('.inspector-select'); Q.elegir(ins, [...ins.options].map(o => o.value).filter(Boolean)[0]); await esperar(300); }
  if (!document.querySelector('#estatus .ck-lbl.on')) [...document.querySelectorAll('#estatus .ck-lbl')].find(l => /progreso/.test(l.textContent)).click();
  abrirPlanilla(); await hasta(() => E().P && /archivo|teléfono|guardado|nada/.test(E().P.origenPrev || 'nada') && !!$('#pl-cuerpo .pl-g, #pl-cuerpo .pl-piso, #pl-cuerpo .pl-lead'), 15000); await esperar(250);
};
const delPiso = p => E().P.aptos.filter(x => x.p === p).map(x => x.a).join(',');

// 1 · Letra + piso (como la T-04 de SR): A2 y B2 en el 2, C3 en el 3, J5 en el 5.
await Q.relevo({ sembrarAvance: { sector: 'SR', torre: 'T-04', prueba: true, informes: inf('SR', 'T-04', [[2, 'A2'], [2, 'B2'], [3, 'C3'], [5, 'J5']]) } });
await abrirEn('Convenio Rusos', 'T-04');
ok('E14-1 · Letra con su piso: cada piso del 1 al 15 trae A, B, C y J con su número (A10, B10, C10, J10 en el 10)',
   E().P.pisos === 15 && delPiso(0) === '' && delPiso(10) === 'A10,B10,C10,J10' && delPiso(1) === 'A1,B1,C1,J1' && delPiso(5) === 'A5,B5,C5,J5', E().P.pisos + ' · 10: ' + delPiso(10) + ' · 1: ' + delPiso(1));
_plIr({ vista: 'tel', piso: 12, hitoSel: 'hito_servicios' }); await esperar(120);
const c = $('#planilla .pl-c[data-k="P12AJ12"][data-c="3.01"]');
ok('E14-2 · En 📱 Obra el piso 12, sin ningún informe, tiene la casilla de J12 y se puede cargar', !!c && (c.click(), await esperar(60), $('#pl-sheet [data-r="25"]').click(), $('#pl-ksi').click(), await esperar(60), _plEstado().P && true) && /25/.test($('#planilla .pl-c[data-k="P12AJ12"][data-c="3.01"]').textContent));
cerrarPlanilla(); await esperar(150);

// 2 · Nombres fijos por piso (como la J-11): D22 y E22 en el 1 y el 2.
await Q.relevo({ sembrarAvance: { sector: 'SB', torre: 'J-08', prueba: true, informes: inf('SB', 'J-08', [[1, 'D22'], [1, 'E22'], [2, 'D22']]) } });
await abrirEn('Convenio Chinos', 'J-08');
ok('E14-3 · Nombres que no llevan el piso se repiten tal cual en todos: D22 y E22 de la PB al 15', E().P.pisos === 15 && delPiso(9) === 'D22,E22' && delPiso(15) === 'D22,E22' && delPiso(0) === 'D22,E22' && delPiso(2) === 'D22,E22', '9: ' + delPiso(9) + ' · 15: ' + delPiso(15) + ' · PB: ' + delPiso(0));
cerrarPlanilla(); await esperar(150);

// 3 · Con cero (C03 en el 3) y un «A1» suelto en el piso 1, que no se toma como letra + piso.
await Q.relevo({ sembrarAvance: { sector: 'SB', torre: 'D-08', prueba: true, informes: inf('SB', 'D-08', [[3, 'C03'], [1, 'A1']]) } });
await abrirEn('Convenio Chinos', 'D-08');
ok('E14-4 · «C03» en el 3 da C07 en el 7 (con su cero); el «A1» que solo se vio en el piso 1 se queda en el 1', delPiso(7) === 'C07' && delPiso(1) === 'C01,A1', '7: ' + delPiso(7) + ' · 1: ' + delPiso(1));
cerrarPlanilla(); await esperar(150);

// 3b · «9 lateral» en el 9: número del piso al principio.
await Q.relevo({ sembrarAvance: { sector: 'SR', torre: 'T-38', prueba: true, informes: inf('SR', 'T-38', [[9, '9 lateral'], [1, '1 centro']]) } });
await abrirEn('Convenio Rusos', 'T-38');
ok('E14-4b · «9 lateral» en el 9 da «4 LATERAL» en el 4; «1 centro», visto solo en el 1, no se repite', delPiso(4) === '4 LATERAL' && delPiso(1) === '1 LATERAL,1 CENTRO', '4: ' + delPiso(4) + ' · 1: ' + delPiso(1));
cerrarPlanilla(); await esperar(150);

// 4 · Torre sin ningún informe ni lista: 16 pisos, y en cada uno se ofrece agregar.
await Q.relevo({ sembrarAvance: { sector: 'SR', torre: 'T-13', prueba: true, informes: {} } });
await abrirEn('Convenio Rusos', 'T-13');
_plIr({ vista: 'tel', piso: 9, hitoSel: 'hito_servicios' }); await esperar(120);
ok('E14-5 · Sin informes ni lista: va de la PB al 15 y en cada piso ofrece «＋ Apartamentos»', E().P.pisos === 15 && [...$('#pl-psel').options].length === 16 && !!$('#pl-mas') && /no tiene apartamentos/.test($('#planilla').textContent), E().P.pisos + ' · ' + [...$('#pl-psel').options].length);
// 5 · «Pisos de la torre» en la oficina manda: 9 deja la torre en 9.
_plIr({ vista: 'tabla' }); await esperar(120);
{ const np = $('#pl-npisos'); np.value = '9'; np.dispatchEvent(new Event('change')); await esperar(100); }
ok('E14-6 · Fijar 9 pisos en la oficina deja la torre en 9 (sin datos más arriba)', E().P.pisos === 9, String(E().P.pisos));
ok('E14-7 · Nada se sale de lado a ' + innerWidth + ' px', !(document.documentElement.scrollWidth > innerWidth + 1 || $('#planilla').scrollWidth > innerWidth + 1));
cerrarPlanilla(); nuevoFormulario(); localStorage.setItem('garmel_reports_list', '[]'); limpiar();
