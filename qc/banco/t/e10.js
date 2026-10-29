// ESTRÉS 10 · planilla de avance (cambios 199 y 200), 29-oct-2026. QC16, QC17 y QC19 de las 20 rondas.
// inspeccion.html?prueba=1, a 375 px y A LA VISTA.
// QC16 (lado del teléfono) el recorrido: el informe de torre con fotos generales y los de la planilla llegan al relevo con lo
//      que el PDF, el avance y el compilado leen. Deja los envíos en envios.jsonl para t79planilla (lado del relevo).
//      Fotos generales: la séptima no entra, quitar una deja el hueco, cambiar de torre las vacía.
// QC17 imprimir: EZ con 15 pisos, SB J-09 (8 por piso) y una torre de 40 pisos; cada tamaño, hitos marcados y desmarcados,
//      ninguna hoja cortada ni vacía, el número de hojas que dice es el que hay, la guía.
// QC19 300 toques al azar por toda la planilla (pestañas, pisos, hitos, casillas, teclado, notas, deshacer, pegar) sin un
//      error de JavaScript, y al final lo que dice la barra coincide con lo que se guardaría.
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem('garmel_reports_list', '[]');
Object.keys(localStorage).filter(k => /^garmel_planilla_/.test(k)).forEach(k => localStorage.removeItem(k));
await Q.relevo({ caido: false, fallar: [], lento: 0, colgar: 0, perder: false, borrar: true });
const semilla = (pisos) => { const s = {}; for (let p = 1; p <= pisos; p++) ['A1', 'A2', 'B1', 'B2'].forEach(a => { const k = 'P' + String(p).padStart(2, '0') + 'A' + a; s[k] = { nro: 'PRUEBA-EZ-T07-' + k + '-261020-XX', fecha: '2026-10-20', piso: 'Piso ' + String(p).padStart(2, '0'), apto: a, pcts: { '2.02': 100, '3.01': 50, '3.02': 40, '4.01': 25, '11.01': 0 } }; }); return s; };
await Q.relevo({ sembrarAvance: { sector: 'EZ', torre: 'T-07', prueba: true, informes: semilla(12) } });
Q.aceptar = true;
const HOY = new Date().toISOString().slice(0, 10);
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const cabecera = async (o) => {
  o = o || {};
  nuevoFormulario(); await esperar(300); setAmbito(o.amb || 'apartamento'); await esperar(200);
  sel('fecha', HOY); sel('convenio', o.convenio || 'Convenio Bielorrusos'); sel('torre', o.torre || 'T-07'); await esperar(400);
  const ins = document.querySelector('.inspector-select'); Q.elegir(ins, [...ins.options].map(o => o.value).filter(Boolean)[0]); await esperar(300);
  if (!document.querySelector('#estatus .ck-lbl.on')) [...document.querySelectorAll('#estatus .ck-lbl')].find(l => /progreso/.test(l.textContent)).click();
  const res = document.querySelector('#residentes-container input'); if (res && !res.value) { res.value = 'Ing. Prueba'; res.dispatchEvent(new Event('input', { bubbles: true })); }
};
const E = () => _plEstado();
const celda = (k, c) => $('#planilla .pl-c[data-k="' + k + '"][data-c="' + c + '"]');
const tap = el => { if (!el) throw new Error('no está'); el.click(); };
const teclear = (k, c, v, todos) => { tap(celda(k, c)); String(v).split('').forEach(x => tap($('#pl-sheet [data-d="' + x + '"]'))); if (todos) tap($('#pl-kt')); tap($('#pl-ksi')); };
const ir = async o => { _plIr(o); await esperar(60); };
const listo = () => E().P && /archivo|teléfono|guardado/.test(E().P.origenPrev) && !!$('#pl-cuerpo .pl-g, #pl-cuerpo .pl-o, #pl-cuerpo .pl-piso');
const abrir = async () => { abrirPlanilla(); await hasta(() => listo() && !/Actualizando/.test($('#pl-aviso').textContent), 15000); await esperar(150); };
const nFotos = () => [0, 1, 2, 3, 4, 5].filter(i => { const im = document.getElementById('fimg_aptosgen_' + i); return im && im.src && im.src.indexOf('data:') === 0; }).length;
const errJS = []; const _oe = window.onerror; window.onerror = (m) => { errJS.push(String(m)); };

// ── QC16 · el recorrido, lado del teléfono ──
await cabecera({ amb: 'torre' });
for (let i = 0; i < 6; i++) { Q.ponerFotos(document.querySelector('#fslot_aptosgen_' + i + ' input[type=file]'), [await Q.foto(1000, 750, 900 + i)]); await esperar(1200); }
Q.dialogos = []; Q.ponerFotos(document.querySelector('#fslot_aptosgen_5 input[type=file]'), [await Q.foto(1000, 750, 999)]); await esperar(800);
const sexta = document.getElementById('fimg_aptosgen_5').src;
ok('QC16a · Seis fotos generales; una más sobre la sexta la reemplaza (no hay séptima) y nada se pierde', nFotos() === 6, nFotos() + ' · ' + Q.dialogos.join(' | ').slice(0, 120));
removeFoto('aptosgen', 2); await esperar(300);
ok('QC16b · Quitar la tercera deja cinco', nFotos() === 5);
Q.escribir(document.getElementById('obs_aptosgen'), 'Fotos 1-2: P05 A1 cerámica · 4-6: «filtración» en P08 & P09 <b>urgente</b>');
const rid = cod => { for (const h of PARTIDAS) { const i = (CODIGOS_SUB[h.id] || []).indexOf(cod); if (i >= 0) return h.id + '_' + i; } };
{ const pr = document.getElementById('pr_' + rid('2.01')), ej = document.getElementById('ej_' + rid('2.01')); pr.value = '10'; ej.value = '5'; recalcRow(pr); ej.dispatchEvent(new Event('input', { bubbles: true })); }
saveDraft(true); await esperar(500);
const nroTorre = getFormData().nro;
// Los de la planilla, desde la misma cabecera.
await abrir(); await ir({ vista: 'tel', piso: 5, hitoSel: 'hito_servicios' });
teclear('P05AA1', '3.01', 75); teclear('P05AA1', '3.02', 100);
await ir({ hitoSel: 'hito_acabados' }); teclear('P05AA1', '4.01', 37);
await ir({ hitoSel: 'hito_pruebas' }); tap(celda('P05AA1', '11.01')); tap($('#pl-sheet .pl-sino [data-v="100"]'));
tap($('#planilla [data-com="P05AA1"]')); $('#pl-ct').value = 'Cerámica «terminada»; falta & sobra <i>nada</i>'; tap($('#pl-csi'));
tap($('#pl-rev')); await esperar(60); tap($('#pl-rgua')); await esperar(250);
const env0 = (await Q.envios()).length;
tap($('#pl-fenv')); await esperar(300); await hasta(() => !_tandaEnCurso, 90000); await esperar(800);
const env = (await Q.envios()).slice(env0).filter(e => e.numero);
const eT = env.find(e => e.numero === nroTorre), eA = env.find(e => /-P05AA1-/.test(e.numero));
ok('QC16c · «Enviar ahora» manda los dos: el de torre y el de P05 A1', !!eT && !!eA, env.map(e => e.numero).join(' '));
ok('QC16d · El de torre lleva las cinco fotos como «aptosgen-N» y el texto con sus comillas y «&» tal cual', !!eT && (eT.fotos || []).filter(n => /^aptosgen-/.test(n)).length === 5 && eT.datos.obsAptosGen.indexOf('«filtración» en P08 & P09 <b>urgente</b>') > 0, eT ? (eT.fotos || []).join(',') : '');
ok('QC16e · El de P05 A1 no lleva ninguna foto ni el texto de las generales, y sí la nota y la marca de planilla', !!eA && !(eA.fotos || []).length && !String(eA.datos.obsAptosGen || '') && /terminada/.test(eA.datos.obs_general) && eA.datos.planilla && eA.datos.planilla.origen === 'obra', eA ? JSON.stringify(eA.fotos) : '');
nuevoFormulario(); await esperar(300); setAmbito('torre'); await esperar(200);
ok('QC16f · Un informe nuevo de torre empieza sin fotos generales ni texto', nFotos() === 0 && document.getElementById('obs_aptosgen').value === '');
// El de la planilla, tal como llegó, para la tanda del relevo.
window.__casosPlanilla = { torre: eT, apto: eA };

// ── QC17 · imprimir ──
const corta = () => $$('#planilla .pl-hoja').filter(h => h.scrollHeight > h.clientHeight + 1 || [...h.querySelectorAll('tbody th, thead th')].some(t => t.scrollWidth > t.clientWidth + 2 && /^P|^PB/.test(t.textContent))).length;
const vacias = () => $$('#planilla .pl-hoja').filter(h => !h.querySelector('tbody tr')).length;
const hojas = async (casos) => { const r = []; for (const t of casos) { _plIr({ tamano: t, vista: 'imp' }); await esperar(80); const n = $$('#planilla .pl-hoja').length, dice = +(($('#planilla .pl-tot').textContent.match(/(\d+) hoja/) || [])[1] || 0);
  const cubre = new Set($$('#planilla .pl-hoja tbody th').map(t => t.textContent)).size; r.push({ t, n, dice, mal: corta() + vacias(), cubre, dis: !!($(`#planilla input[name=pl-tam][value=${t}]`) || {}).disabled }); } return r; };
await cabecera(); await abrir(); await ir({ vista: 'tabla' });
{ const np = $('#pl-npisos'); np.value = '15'; np.dispatchEvent(new Event('change')); await esperar(100); }
const h17a = await hojas(['comoda', 'compacta', 'toda']);
ok('QC17a · EZ con 15 pisos × 4: cada tamaño cubre los 60 apartamentos, ninguna hoja cortada ni vacía, y dice cuántas hojas son', h17a.every(x => (x.dis || (x.mal === 0 && x.n === x.dice && x.cubre === 60))), JSON.stringify(h17a));
const marcados = E().LISTA.map(h => h.id); _plIr({ enPapel: Object.fromEntries(marcados.map(h => [h, false])) }); _plIr({ vista: 'imp' }); await esperar(80);
ok('QC17b · Sin ningún hito marcado: «Imprimir» se apaga y dice que marque uno', $('#pl-imprimir').disabled && /Marque al menos un hito/.test($('#planilla .pl-tot').textContent));
_plIr({ enPapel: { hito_servicios: true } }); _plIr({ vista: 'imp', tamano: 'comoda' }); await esperar(80);
const cols = $$('#planilla .pl-hoja')[0].querySelectorAll('thead tr:nth-child(2) th').length - 2;
ok('QC17c · Solo el hito 3: las hojas llevan sus subpartidas de apartamento y nada más', cols === E().LISTA.find(h => h.id === 'hito_servicios').subs.length, cols + ' columnas');
_plIr({ enPapel: Object.fromEntries(marcados.map(h => [h, true])) });
cerrarPlanilla();
await cabecera({ convenio: 'Convenio Chinos', torre: 'J-09' }); await abrir();
const h17d = await hojas(['comoda', 'compacta', 'toda']);
ok('QC17d · SB J-09 (8 por piso): «toda la torre» se apaga si no cabe; las demás cubren todo sin cortarse', h17d.every(x => x.dis || (x.mal === 0 && x.n === x.dice && x.cubre === E().P.aptos.length)), JSON.stringify(h17d) + ' · ' + E().P.aptos.length);
cerrarPlanilla();
await cabecera(); await abrir(); await ir({ vista: 'tabla' });
{ const np = $('#pl-npisos'); np.value = '40'; np.dispatchEvent(new Event('change')); await esperar(150); }
const h17e = await hojas(['comoda', 'compacta']);
ok('QC17e · Una torre de 40 pisos (160 apartamentos): las hojas salen completas y sin cortes', h17e.every(x => x.mal === 0 && x.n === x.dice && x.cubre === 160), JSON.stringify(h17e));
_plIr({ vista: 'guia' }); await esperar(60);
ok('QC17f · La guía: las 50 subpartidas, cada una con su descripción, y su botón de imprimir', $$('#planilla .pl-guia dt').length === 50 && $$('#planilla .pl-guia dd').every(d => d.textContent.trim().length > 10) && !!$('#pl-impguia'));
{ const np = $('#pl-npisos') || null; } cerrarPlanilla();
Object.keys(localStorage).filter(k => /^garmel_planilla_EZ/.test(k)).forEach(k => localStorage.removeItem(k));

// ── QC19 · 300 toques al azar ──
localStorage.setItem('garmel_reports_list', '[]');
await cabecera(); await abrir();
let semillaR = 12345; const azar = n => { semillaR = (semillaR * 16807) % 2147483647; return semillaR % n; };
const acciones = [
  () => tap($$('#planilla .pl-tabs button')[azar(2)]),
  () => { const b = $('#pl-sig'); if (b && !b.disabled) tap(b); },
  () => { const b = $('#pl-ant'); if (b && !b.disabled) tap(b); },
  () => { const cs = $$('#planilla .pl-chips button'); if (cs.length) tap(cs[azar(cs.length)]); },
  () => { const cs = $$('#planilla .pl-c'); if (!cs.length) return; tap(cs[azar(cs.length)]);
          if ($('#pl-c100-si')) tap(azar(2) ? $('#pl-c100-si') : $('#pl-c100-no'));
          if ($('#pl-sheet .pl-sino')) { tap($$('#pl-sheet .pl-sino button')[azar(2)]); return; }
          if ($('#pl-kd')) { for (let i = azar(4); i >= 0; i--) tap($$('#pl-sheet [data-d], #pl-sheet [data-r], #pl-sheet [data-x]')[azar(17)]); if (azar(3) === 0 && $('#pl-kt')) tap($('#pl-kt')); tap(azar(5) ? $('#pl-ksi') : $('#pl-kno')); } },
  () => { const cs = $$('#planilla [data-com]'); if (!cs.length || cs[0].tagName !== 'BUTTON') return; tap(cs[azar(cs.length)]); $('#pl-ct').value = azar(2) ? 'nota ' + azar(99) : ''; tap($('#pl-csi')); },
  () => { const b = $('#pl-undo'); if (b && !b.disabled) tap(b); },
  () => { const is = $$('#planilla input.pl-pc'); if (!is.length) return; const i = is[azar(is.length)]; i.focus(); i.value = ['', '0', '45', '100', 'x', '99%', '0,5'][azar(7)]; i.dispatchEvent(new Event('change')); },
  () => { const is = $$('#planilla input.pl-pc'); if (!is.length) return; const dt = new DataTransfer(); dt.setData('text/plain', '10\t20\n30\t40\n'); const i = is[azar(is.length)]; i.focus(); i.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true })); },
  () => { const hb = $$('#planilla .pl-hb'); if (hb.length) tap(hb[azar(hb.length)]); },
  () => { tap($('#pl-rev')); if ($('#pl-rseg')) tap($('#pl-rseg')); },
  () => { if (!$('#pl-fondo').hidden) document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); },
];
let fallos19 = [];
const t19 = performance.now();
for (let i = 0; i < 300; i++) { const k = azar(acciones.length); try { acciones[k](); } catch (e) { fallos19.push(i + ':' + k + ':' + e.message); } if (i % 25 === 0) await esperar(10); }
const ms19 = performance.now() - t19;
ok('QC19a · 300 toques al azar sin un error de JavaScript ni un toque que falle', !errJS.length && !fallos19.length, (errJS.concat(fallos19)).join(' | ').slice(0, 220));
ok('QC19b · …en menos de 30 s (ningún repintado lento)', ms19 < 30000, Math.round(ms19) + ' ms');
const r19 = _plResumen();
const contados = Object.keys(E().est.N).reduce((a, k) => a + Object.keys(E().est.N[k]).length, 0);
ok('QC19c · Lo que dice la barra coincide con lo anotado, y nada fuera de 0 a 100', r19.n === contados && Object.values(E().est.N).every(o => Object.values(o).every(v => Number.isInteger(v) && v >= 0 && v <= 100)), r19.n + ' / ' + contados);
if (!$('#pl-fondo').hidden) document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
_plIr({ vista: 'tel' }); await esperar(60);
if (r19.ks.length) { tap($('#pl-rev')); await esperar(60); if ($('#pl-rb')) tap($('#pl-rb')); if ($('#pl-rr')) tap($('#pl-rr')); tap($('#pl-rgua')); await esperar(400); }
const L19 = getSavedReports();
ok('QC19d · Guardado al final: un informe por apartamento tocado, cada uno con número distinto', L19.length === r19.ks.length && new Set(L19.map(b => b.nro)).size === L19.length, L19.length + ' / ' + r19.ks.length);
if ($('#pl-fseg')) tap($('#pl-fseg')); cerrarPlanilla();
ok('QC19e · Ningún error de JavaScript en las tres rondas', !errJS.length, errJS.join(' | ').slice(0, 200));
window.onerror = _oe;
nuevoFormulario(); localStorage.setItem('garmel_reports_list', '[]');
Object.keys(localStorage).filter(k => /^garmel_planilla_/.test(k)).forEach(k => localStorage.removeItem(k));
