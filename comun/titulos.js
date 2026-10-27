// ── 195. El título de cada inspector en los desplegables (27-oct-2026) ─────────────────────────────────────────────
// Pedido de los inspectores por Diego Orta: que salgan «Ing. Fulano», «Arq. Fulano», como los residentes. El título viene de
// la hoja de cargos (comun/maestros.py, TITULO_INSPECTOR, por nombre). Solo cambia lo que se VE en cada opción: el valor
// sigue siendo el del padrón, así las iniciales del número de informe, los borradores guardados y los informes viejos no
// cambian. El PDF del relevo pone el mismo título (PDF.gs, r75). Es el mismo archivo en los cuatro formularios.
function _conTitulo195(v){
  v = String(v || '');
  if (!v || /^(Ing|Arq|TSU)\b/i.test(v) || typeof TITULO_INSPECTOR === 'undefined') return v;
  const t = TITULO_INSPECTOR[v.replace(/\s*\(CIV[^)]*\)\s*$/, '').trim()];
  return t ? t + ' ' + v : v;
}
(function(){
  const SEL = 'select.inspector-select, #inspectores select, select[id^="insp"]';
  function titular(sel){
    if (!sel || !sel.options) return;
    for (const o of sel.options) {
      if (!o.value || o.value === 'OTRO' || o.dataset.t195 === o.value) continue;
      o.textContent = _conTitulo195(o.value); o.dataset.t195 = o.value;
    }
  }
  function recorrer(n){
    if (!n || n.nodeType !== 1) return;
    if (n.matches && n.matches(SEL)) titular(n);
    if (n.querySelectorAll) n.querySelectorAll(SEL).forEach(titular);
  }
  function arrancar(){
    recorrer(document.body);
    new MutationObserver(function(ms){ ms.forEach(function(m){
      m.addedNodes.forEach(recorrer);
      if (m.target && m.target.tagName === 'SELECT') recorrer(m.target);
    }); }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar); else arrancar();
})();
