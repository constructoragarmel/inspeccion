// ESTRÉS 11 · planilla de avance (cambio 199), 29-oct-2026. QC18 de las 20 rondas: las pantallas. Se corre en cada tamaño
// (320×568, 360×740, 375×812, 414×896, 812×375 apaisado, 768×1024 y 1280×800), A LA VISTA, en inspeccion.html?prueba=1.
// En cada vista (obra, oficina, imprimir, guía) y en cada hoja de abajo (teclado, Sí / No, nota, revisar, ＋ apartamentos):
// la página no se sale de lado, todo lo que se toca mide 44 px o más, los botones de la hoja se alcanzan, y en el
// teléfono apaisado queda al menos la mitad de la pantalla para la tabla.
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem('garmel_reports_list', '[]');
Object.keys(localStorage).filter(k => /^garmel_planilla_/.test(k)).forEach(k => localStorage.removeItem(k));
await Q.relevo({ caido: false, fallar: [], lento: 0, colgar: 0, perder: false, borrar: true });
const s = {}; for (let p = 1; p <= 12; p++) ['A1', 'A2', 'B1', 'B2'].forEach(a => { const k = 'P' + String(p).padStart(2, '0') + 'A' + a; s[k] = { nro: 'PRUEBA-EZ-T07-' + k + '-261020-XX', fecha: '2026-10-20', piso: 'Piso ' + String(p).padStart(2, '0'), apto: a, pcts: { '2.02': 100, '3.01': 50, '11.01': 0 } }; });
await Q.relevo({ sembrarAvance: { sector: 'EZ', torre: 'T-07', prueba: true, informes: s } });
const W = innerWidth, H = innerHeight, tam = W + '×' + H;
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
nuevoFormulario(); await esperar(300); setAmbito('apartamento'); await esperar(200);
sel('fecha', new Date().toISOString().slice(0, 10)); sel('convenio', 'Convenio Chinos'); sel('torre', 'J-09'); await esperar(400);
{ const ins = document.querySelector('.inspector-select'); Q.elegir(ins, [...ins.options].map(o => o.value).filter(Boolean)[0]); await esperar(300); }
if (!document.querySelector('#estatus .ck-lbl.on')) [...document.querySelectorAll('#estatus .ck-lbl')].find(l => /progreso/.test(l.textContent)).click();
const bp = $('#btn-planilla').getBoundingClientRect();
ok('QC18a ' + tam + ' · El botón de la planilla se ve entero, mide 44 y no saca el formulario de lado', bp.height >= 44 && bp.right <= W && document.documentElement.scrollWidth <= W + 1, Math.round(bp.height) + ' · ' + document.documentElement.scrollWidth);
const E = () => _plEstado();
abrirPlanilla(); await hasta(() => E().P && E().P.origenPrev && !!$('#pl-cuerpo .pl-g, #pl-cuerpo .pl-o, #pl-cuerpo .pl-piso'), 15000); await esperar(200);
const chicos = (raizSel) => [...document.querySelectorAll(raizSel + ' button, ' + raizSel + ' select, ' + raizSel + ' input:not([type=checkbox]):not([type=radio]), ' + raizSel + ' textarea, ' + raizSel + ' label')]
  .filter(e => { const r = e.getBoundingClientRect(); if (!r.width || !r.height || e.closest('[hidden]')) return false; if (e.tagName === 'LABEL' && !e.querySelector('input')) return false; if (e.closest('.pl-hoja')) return false; return r.height < 44 && !(e.classList.contains('pl-pc') || e.classList.contains('pl-com')); })
  .map(e => (e.id || e.className || e.tagName) + ':' + Math.round(e.getBoundingClientRect().height));
const sale = () => document.documentElement.scrollWidth > W + 1 || $('#planilla').scrollWidth > W + 1;
const malos = [];
for (const v of ['tel', 'tabla', 'imp', 'guia']) {
  _plIr({ vista: v, piso: 3, hitoSel: 'hito_servicios' }); await esperar(120);
  const c = chicos('#planilla'); if (c.length) malos.push(v + ' chicos ' + c.slice(0, 4).join(','));
  if (sale()) malos.push(v + ' se sale ' + $('#planilla').scrollWidth);
}
ok('QC18b ' + tam + ' · Obra, oficina, imprimir y guía: nada se sale de lado y lo que se toca mide 44', !malos.length, malos.join(' | '));
_plIr({ vista: 'tel', piso: 3, hitoSel: 'hito_servicios' }); await esperar(100);
const top = getComputedStyle($('#planilla .pl-top')).position === 'sticky' ? $('#planilla .pl-top').getBoundingClientRect().height : 0, barra = $('#pl-barra').getBoundingClientRect().height;
ok('QC18c ' + tam + ' · Arriba y abajo fijos no se comen la pantalla: queda la mitad o más para la tabla', (H - top - barra) >= H * 0.5, 'arriba fija ' + Math.round(top) + ' · abajo ' + Math.round(barra) + ' · alto ' + H);
const hojaOk = (nombre, botonSel) => {
  const sh = $('#pl-sheet'), r = sh.getBoundingClientRect(), b = $(botonSel);
  const alcanza = b && (b.getBoundingClientRect().bottom <= H + 1 || sh.scrollHeight > sh.clientHeight);
  const c = chicos('#pl-sheet');
  return { ok: r.top >= -1 && r.right <= W + 1 && alcanza && !c.length, d: nombre + ' top ' + Math.round(r.top) + ' alto ' + Math.round(r.height) + (alcanza ? '' : ' botón fuera') + (c.length ? ' chicos ' + c.join(',') : '') };
};
const hs = [];
$('#planilla .pl-c[data-k="P03AA1"][data-c="3.01"]').click(); await esperar(80); hs.push(hojaOk('teclado', '#pl-ksi')); $('#pl-kno').click();
_plIr({ hitoSel: 'hito_pruebas' }); await esperar(60); $('#planilla .pl-c[data-k="P03AA1"][data-c="11.01"]').click(); await esperar(80); hs.push(hojaOk('sí/no', '#pl-kno')); $('#pl-kno').click();
$('#planilla [data-com="P03AA1"]').click(); await esperar(80); hs.push(hojaOk('nota', '#pl-csi')); $('#pl-csi').click();
$('#pl-mas').click(); await esperar(80); hs.push(hojaOk('＋ apartamentos', '#pl-nsi')); $('#pl-nno').click();
_plIr({ hitoSel: 'hito_servicios' }); await esperar(60);
for (const a of ['A1', 'A2', 'C1', 'C2', 'D11', 'D12', 'E11', 'E12']) { $('#planilla .pl-c[data-k="P03A' + a + '"][data-c="3.01"]').click(); $('#pl-sheet [data-r="25"]').click(); $('#pl-ksi').click(); }
$('#pl-rev').click(); await esperar(80); hs.push(hojaOk('revisar (8 apartamentos)', '#pl-rgua')); $('#pl-rseg').click();
ok('QC18d ' + tam + ' · Teclado, Sí / No, nota, ＋ apartamentos y revisar: caben de lado, sus botones se alcanzan y miden 44', hs.every(x => x.ok), hs.filter(x => !x.ok).map(x => x.d).join(' | ') || hs.map(x => x.d).join(' | '));
_plIr({ vista: 'imp' }); await esperar(100);
const hm = $('#planilla .pl-hm').getBoundingClientRect(), hj = $('#planilla .pl-hoja').getBoundingClientRect();
ok('QC18e ' + tam + ' · La vista previa de la hoja se achica al ancho y se ve entera', hj.right <= W + 1 && Math.abs(hj.width / hj.height - 1056 / 816) < 0.02, Math.round(hj.width) + '×' + Math.round(hj.height));
cerrarPlanilla(); nuevoFormulario(); localStorage.setItem('garmel_reports_list', '[]');
Object.keys(localStorage).filter(k => /^garmel_planilla_/.test(k)).forEach(k => localStorage.removeItem(k));
