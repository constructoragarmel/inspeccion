// ESTRÉS 27 · el teléfono lleno mientras se llena la planilla (2-nov-2026, Christian, T-57: «perdió todos los pisos»). Antes, si el
// borrador no cabía, fallaba callado y al cerrarse la app se perdía todo. Se simula el almacenamiento lleno haciendo fallar
// localStorage.setItem del borrador. Se corre en inspeccion.html?prueba=1 a 375×812.
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem('garmel_reports_list', '[]');
localStorage.removeItem('garmel_actual'); localStorage.removeItem('garmel_planilla_abierta');
Object.keys(localStorage).filter(k => /^garmel_planilla_/.test(k)).forEach(k => localStorage.removeItem(k));
await Q.relevo({ caido: false, fallar: [], lento: 0, colgar: 0, perder: false, cortar: 0, borrar: true });
await Q.relevo({ sembrarAvance: { sector: 'EZ', torre: 'T-17', prueba: true, informes: {} } });
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const E = () => _plEstado(), N = (k, c) => E().est.N[k] && E().est.N[k][c];
const tap = el => { if (!el) throw new Error('no está'); el.click(); };
const dig = d => String(d).split('').forEach(x => tap($('#pl-sheet [data-d="' + x + '"]')));
const teclear = (k, c, v) => { tap($('#planilla .pl-c[data-k="' + k + '"][data-c="' + c + '"]')); dig(v); tap($('#pl-ksi')); };
// El «lleno»: el borrador de la planilla no cabe mientras exista algo de relleno (o siempre, en Z2).
const setBase = Storage.prototype.setItem; let modo = 'relleno';
Storage.prototype.setItem = function(k, v){
  if (/^garmel_planilla_EZ\|T-17$/.test(k) && (modo === 'siempre' || (modo === 'relleno' && localStorage.getItem('garmel_planilla_prev_EZ|T-99') !== null))) {
    const e = new Error('QuotaExceededError'); e.name = 'QuotaExceededError'; throw e; }
  return setBase.apply(this, arguments);
};
try {
  setBase.call(localStorage, 'garmel_planilla_prev_EZ|T-99', JSON.stringify({ fecha: '2026-10-01', informes: { relleno: 'x'.repeat(2000) } }));
  setBase.call(localStorage, 'garmel_aplica_EZ|T-99', '{"codigos":{}}');
  nuevoFormulario(); await esperar(300); setAmbito('apartamento'); await esperar(200);
  sel('fecha', new Date().toISOString().slice(0, 10)); sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-17'); await esperar(400);
  Q.elegir(document.querySelector('.inspector-select'), [...document.querySelector('.inspector-select').options].map(o => o.value).filter(Boolean)[0]); await esperar(200);
  [...document.querySelectorAll('#estatus .ck-lbl')].find(l => /progreso/.test(l.textContent)).click();
  abrirPlanilla(); await hasta(() => E().P && !!$('#pl-cuerpo .pl-g'), 15000); await esperar(250);
  _plIr({ vista: 'tel', piso: 4, hitoSel: 'cap_sanitarias' }); await esperar(80);
  // ── Z1 · Hay caché que se puede volver a bajar: se hace lugar solo, se guarda y no se molesta a nadie ──
  teclear('P04AA1', '3.01', 50); await esperar(100);
  const b1 = JSON.parse(localStorage.getItem('garmel_planilla_EZ|T-17') || 'null');
  ok('Z1 · Lleno con caché de otra torre: se borra la caché, el borrador se guarda y no hay aviso', !!b1 && b1.est.N.P04AA1['3.01'] === 50 && localStorage.getItem('garmel_planilla_prev_EZ|T-99') === null && localStorage.getItem('garmel_aplica_EZ|T-99') === null && !_plSinEspacio() && $('#pl-aviso').hidden,
     JSON.stringify(b1 && b1.est.N) + ' · aviso ' + $('#pl-aviso').textContent.slice(0, 60));
  ok('Z1b · …y el gris guardado de ESTA torre no se toca', localStorage.getItem('garmel_planilla_prev_EZ|T-17') !== null);
  // ── Z2 · Sin nada que borrar: avisa fijo arriba (en rojo) y lo cargado sigue en la pantalla ──
  modo = 'siempre'; teclear('P04AA2', '3.01', 75); await esperar(150);
  const av = $('#pl-aviso');
  ok('Z2 · Lleno de verdad: aviso fijo «El teléfono está lleno: lo que carga en la planilla NO se está guardando», en rojo, y lo cargado sigue', _plSinEspacio() && !av.hidden && av.classList.contains('pl-lleno') && /NO se está guardando/.test(av.textContent) && N('P04AA2', '3.01') === 75, av.textContent.slice(0, 120));
  _plIr({ vista: 'tel', piso: 5, hitoSel: 'cap_sanitarias' }); await esperar(100);
  ok('Z2b · Al cambiar de piso el aviso sigue a la vista', !$('#pl-aviso').hidden && /lleno/.test($('#pl-aviso').textContent));
  // ── Z3 · Vuelve el lugar (borró los enviados): al siguiente cambio se guarda todo y el aviso se va ──
  modo = 'nada'; teclear('P05AB1', '3.02', 25); await esperar(150);
  const b3 = JSON.parse(localStorage.getItem('garmel_planilla_EZ|T-17') || 'null');
  ok('Z3 · Con lugar otra vez: el borrador guarda las tres casillas y el aviso se quita', !_plSinEspacio() && $('#pl-aviso').hidden && !!b3 && b3.est.N.P04AA2['3.01'] === 75 && b3.est.N.P05AB1['3.02'] === 25, JSON.stringify(b3 && b3.est.N));
} finally { Storage.prototype.setItem = setBase; }
cerrarPlanilla(); nuevoFormulario(); localStorage.setItem('garmel_reports_list', '[]'); Object.keys(localStorage).filter(k => /^garmel_planilla_/.test(k)).forEach(k => localStorage.removeItem(k));
