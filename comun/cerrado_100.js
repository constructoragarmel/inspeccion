// ── 196. Lo que ya llegó al 100 % queda cerrado en la visita siguiente (27-oct-2026) ─────────────────────────────
// Pedido de los inspectores por Diego Orta: «si ya ese hito está 100 %, que se bloquee… para el próximo me aparece bloqueado»,
// y «un botón que lo habilite, pero que si no es necesario no pida validar una próxima vez». Va por PARTIDA (fila), no por
// hito: así sirve igual si la pantalla se ordena por capítulos. Al elegir un apartamento (o la torre) que ya tiene informe,
// las filas que en ese informe estaban completas (ejecutado ≥ proyectado, o estado 100 %) se traen solas y quedan cerradas:
// no se escriben, no piden confirmación y no cuentan como «medido hoy» para las demás ofertas. «🔓 Habilitar» las abre
// para corregirlas. El dato lleva `cerrado100: <número de origen>` en cada fila que viajó cerrada. Solo obra: servicios, SHA
// y urbanismo no miden porcentaje por partida.
(function(){
  function completa(item){
    const pr = parseFloat(item.pr), ej = parseFloat(item.ej), pm = parseFloat(item.pct);
    return (pr > 0 && ej >= pr) || pm >= 100;
  }
  function filaDe(rid){ const e = document.getElementById('pr_' + rid) || document.getElementById('ej_' + rid); return e ? e.closest('tr') : null; }
  function controles(tr){ return tr.querySelectorAll('input, select, textarea, button.est-btn'); }
  function cerrar(tr, nro, fecha){
    tr.classList.add('cerrado100'); tr.dataset.cerrado100 = nro || 'anterior';
    controles(tr).forEach(function(c){ c.disabled = true; });
    let b = tr.querySelector('.cerr100');
    if (!b) {
      b = document.createElement('div'); b.className = 'cerr100';
      const tds = tr.querySelectorAll('td'), celda = tds[1] || tds[0]; if (celda) celda.appendChild(b);   // la 0 es la franja de color
    }
    b.innerHTML = '<span>✅ 100 %' + (fecha ? ' desde el ' + fecha : '') + '</span><button type="button" class="abrir100">🔓 Habilitar</button>';
    b.querySelector('.abrir100').onclick = function(){ abrir(tr); };
  }
  function abrir(tr){
    tr.classList.remove('cerrado100'); delete tr.dataset.cerrado100;
    controles(tr).forEach(function(c){ c.disabled = false; });
    const b = tr.querySelector('.cerr100'); if (b) b.remove();
    if (typeof _marcarCambio === 'function') _marcarCambio();
  }
  function abrirTodas(){ document.querySelectorAll('tr.cerrado100').forEach(abrir); }
  // Al cambiar de lugar, lo que se trajo cerrado era de OTRO apartamento: se vacía, no se deja escrito.
  function soltarTodas(){
    document.querySelectorAll('tr.cerrado100').forEach(function(tr){
      abrir(tr);
      tr.querySelectorAll('input[id^="pr_"], input[id^="ej_"], input[id^="pm_"]').forEach(function(e){ e.value = ''; });
      const e = tr.querySelector('input[id^="pr_"], input[id^="ej_"]'); if (e) recalcRow(e);
    });
  }

  // Del informe anterior de este mismo lugar: las filas completas, cerradas. Devuelve cuántas.
  window._cerrar100 = function(mismo){
    soltarTodas();
    if (!mismo || !mismo.partidas || _abiertoParaEditar) return 0;
    let n = 0;
    Object.keys(mismo.partidas).forEach(function(pid){
      if (pid.slice(-6) === '_extra') return;
      const arr = mismo.partidas[pid]; if (!Array.isArray(arr)) return;
      arr.forEach(function(item, i){
        if (!item || item.fueraDeAmbito || !completa(item)) return;
        if (typeof _aplica === 'function' && !_aplica(pid, i)) return;
        const rid = pid + '_' + i, tr = filaDe(rid); if (!tr) return;
        const pr = document.getElementById('pr_' + rid), ej = document.getElementById('ej_' + rid), pm = document.getElementById('pm_' + rid);
        if (pr && item.pr !== undefined) pr.value = item.pr;
        if (ej && item.ej !== undefined) ej.value = item.ej;
        if (pm && item.pct !== undefined) pm.value = item.pct;
        const ud = document.getElementById('ud_' + rid); if (ud && item.ud) { ud.value = item.ud; if (typeof _unidadElegida === 'function') _unidadElegida(ud); }
        recalcRow(pr || ej);
        cerrar(tr, mismo.nro || mismo.numero || '', mismo.fecha || '');
        n++;
      });
    });
    if (n && typeof _marcarCambio === 'function') _marcarCambio();
    return n;
  };

  // Lo cerrado no cuenta como «ya se midió algo hoy» (si no, la oferta de traer el resto se cancelaría sola), y traer o
  // completar no lo pisa.
  const _hayBase = _hayMediciones;
  _hayMediciones = function(){
    return Array.prototype.some.call(
      document.querySelectorAll('input[id^="pr_"], input[id^="ej_"], input[id^="pm_"], input[id^="sn_"]'),
      function(e){ return String(e.value || '').trim() !== '' && !e.closest('tr.cerrado100'); });
  };
  const _filaBase = _filaConDato;
  _filaConDato = function(rid){ const tr = filaDe(rid); return (tr && tr.classList.contains('cerrado100')) || _filaBase(rid); };
  const _traerBase = _traerMediciones;
  _traerMediciones = function(partidas, soloHay){
    const cerradas = [].slice.call(document.querySelectorAll('tr.cerrado100'));
    const antes = cerradas.map(function(tr){ return [].map.call(controles(tr), function(c){ return c.value; }); });
    const r = _traerBase.apply(this, arguments);
    cerradas.forEach(function(tr, k){ [].forEach.call(controles(tr), function(c, j){ if (c.value !== antes[k][j]) c.value = antes[k][j]; }); });
    return r;
  };
  // El dato: cada fila que viaja cerrada dice de dónde viene.
  const _getBase = getFormData;
  getFormData = function(){
    const d = _getBase.apply(this, arguments);
    document.querySelectorAll('tr.cerrado100').forEach(function(tr){
      const e = tr.querySelector('input[id^="pr_"], input[id^="ej_"]'); if (!e) return;
      const rid = e.id.slice(3), k = rid.lastIndexOf('_'), pid = rid.slice(0, k), i = +rid.slice(k + 1);
      const arr = (d.partidas || {})[pid]; if (Array.isArray(arr) && arr[i]) arr[i].cerrado100 = tr.dataset.cerrado100;
    });
    return d;
  };
  // Un informe nuevo, otro apartamento o abrir uno guardado empiezan sin nada cerrado.
  ['nuevoFormulario', 'loadDraftData'].forEach(function(f){
    if (typeof window[f] !== 'function') return;
    const base = window[f];
    window[f] = function(){ soltarTodas(); return base.apply(this, arguments); };
  });
  document.addEventListener('change', function(e){ if (e.target && /^(torre|piso|convenio)$/.test(e.target.id)) soltarTodas(); }, true);
  document.addEventListener('input', function(e){ if (e.target && e.target.id === 'apto') soltarTodas(); }, true);

  const st = document.createElement('style');
  st.textContent = 'tr.cerrado100 td{background:#f0fdf4}tr.cerrado100 input:disabled,tr.cerrado100 select:disabled{color:#166534;background:#f0fdf4;-webkit-text-fill-color:#166534}' +
    '.cerr100{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:4px;font-size:12px;font-weight:700;color:#166534}' +
    '.cerr100 .abrir100{min-height:44px;padding:6px 12px;border:1px solid #86efac;border-radius:8px;background:#fff;color:#166534;font-weight:800;font-size:13px}';
  document.head.appendChild(st);
})();
