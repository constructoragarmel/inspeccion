// ── 197. El apartamento por capítulos, como un presupuesto (27-oct-2026) ────────────────────────────────────────────
// Pedido de Génesis Márquez por Diego Orta: «que la app se lleve como un presupuesto de obra: capítulos con sus partidas…
// instalaciones sanitarias todo va ahí, instalaciones eléctricas todo y así»; voz y data va en electricidad. SOLO PANTALLA, en
// el informe de apartamento: las filas de «Instalación de servicios» (hito 3) pasan a su capítulo —Sanitarias, Eléctricas, Gas—
// y cada capítulo lleva detrás su hito de accesorios (7 y 8). Nada más cambia: los hitos, sus códigos, el % de cada hito, el
// cobro por los tres hitos de la ADR-0004, el PDF del relevo y Smartsheet son los de siempre (cobrar por partidas lo decide la
// Gerencia Técnica). El hito 3 queda después de Gas con su porcentaje, sus fotos y su observación. Las filas se mueven en el
// DOM, no se copian: todo lo que lee una fila la busca por su id. En torre vuelve todo a su sitio.
(function(){
  const CAPITULOS = [
    { id: 'cap_sanitarias', nombre: 'INSTALACIONES SANITARIAS', color: '#0277bd', grupo: 'Sanitarias', tras: 'hito_acc_sanitarios' },
    { id: 'cap_electricas', nombre: 'INSTALACIONES ELÉCTRICAS (con voz y data)', color: '#f9a825', grupo: 'Eléctricas', tras: 'hito_acc_electricos' },
    { id: 'cap_gas', nombre: 'GAS', color: '#6d4c41', grupo: 'Gas', tras: null }
  ];
  const H3 = 'hito_servicios';
  function deshacer(){
    const main = document.getElementById('main-content'); if (!main) return;
    document.querySelectorAll('tr[data-cap]').forEach(function(tr){
      const tb = document.getElementById('tbody_' + tr.dataset.capDe); if (tb) tb.appendChild(tr);
      delete tr.dataset.cap; delete tr.dataset.capDe;
    });
    document.querySelectorAll('.capitulo').forEach(function(c){
      c.querySelectorAll(':scope > .p-body > .partida').forEach(function(b){ main.appendChild(b); });
      c.remove();
    });
    const n = document.getElementById('cap-nota-h3'); if (n) n.remove();
  }
  function construir(){
    const main = document.getElementById('main-content'), b3 = document.getElementById('p_' + H3), tb3 = document.getElementById('tbody_' + H3);
    if (!main || !b3 || !tb3 || b3.style.display === 'none') return;
    const tabla3 = tb3.closest('table');
    const codigos = CODIGOS_SUB[H3] || [];
    const grupos = {}; (GRUPOS_PANTALLA[H3] || []).forEach(function(g){ grupos[g[0]] = g[1]; });
    let ultimo = document.getElementById('p_hito_cerramientos');
    CAPITULOS.forEach(function(cap){
      const filas = (grupos[cap.grupo] || []).map(function(c){ return codigos.indexOf(c); })
        .filter(function(i){ return i >= 0 && _aplica(H3, i); })
        .map(function(i){ const e = document.getElementById('pr_' + H3 + '_' + i); return e ? e.closest('tr') : null; }).filter(Boolean);
      const acc = cap.tras ? document.getElementById('p_' + cap.tras) : null;
      if (!filas.length && !(acc && acc.style.display !== 'none')) return;
      const c = document.createElement('div');
      c.className = 'partida capitulo'; c.id = 'p_' + cap.id; c.style.borderLeftColor = cap.color;
      c.innerHTML = '<div class="p-hdr" style="background:' + cap.color + '" onclick="toggleP(\'' + cap.id + '\')"><div class="p-hdr-l"><h2>CAPÍTULO · ' + cap.nombre + '</h2></div>' +
        '<div style="display:flex;align-items:center;gap:9px"><span class="arrow">▼</span></div></div><div class="p-body"></div>';
      const cuerpo = c.querySelector('.p-body');
      if (filas.length && tabla3) {
        const sub = document.createElement('div'); sub.className = 'cap-sub'; sub.textContent = 'Instalación (hito 3: ' + cap.grupo.toLowerCase() + ')';
        const t = tabla3.cloneNode(false); const th = tabla3.querySelector('thead'); if (th) t.appendChild(th.cloneNode(true));
        const tb = document.createElement('tbody'); tb.id = 'capt_' + cap.id; t.appendChild(tb);
        const caja = document.createElement('div'); caja.className = (tabla3.parentElement && tabla3.parentElement !== tb3.closest('.p-body')) ? tabla3.parentElement.className : '';
        caja.appendChild(t); cuerpo.appendChild(sub); cuerpo.appendChild(caja);
        let n = 0;
        filas.forEach(function(tr){ tr.dataset.cap = cap.id; tr.dataset.capDe = H3; tb.appendChild(tr); const num = tr.querySelector('td.n'); if (num) num.textContent = String(++n); });
      }
      if (acc && acc.style.display !== 'none') cuerpo.appendChild(acc);
      if (ultimo && ultimo.parentElement === main) ultimo.after(c); else main.insertBefore(c, main.firstChild);
      ultimo = c;
    });
    // Los rótulos de grupo que quedaron vacíos en el hito 3, fuera; el hito 3 va después de Gas, con su nota.
    tb3.querySelectorAll('tr.subgrupo').forEach(function(tr){ tr.remove(); });
    if (ultimo) ultimo.after(b3);
    const nota = document.createElement('div'); nota.id = 'cap-nota-h3'; nota.className = 'cap-nota';
    nota.textContent = 'Las partidas de este hito están arriba, en los capítulos de sanitarias, eléctricas y gas. Aquí quedan su porcentaje, sus fotografías y su observación.';
    const cuerpo3 = b3.querySelector('.p-body'); if (cuerpo3) cuerpo3.insertBefore(nota, cuerpo3.firstChild);
    let k = 0; tb3.querySelectorAll('tr').forEach(function(tr){ const num = tr.querySelector('td.n'); if (num && tr.style.display !== 'none') num.textContent = String(++k); });
  }
  const _ordenarBase197 = _ordenarPantalla;
  _ordenarPantalla = function(){
    deshacer();
    const r = _ordenarBase197.apply(this, arguments);
    try { if (typeof ambito !== 'undefined' && ambito !== 'torre') construir(); } catch (e) { console.warn('capítulos', e); }
    return r;
  };
  window._capitulosDeshacer197 = deshacer;
  const st = document.createElement('style');
  st.textContent = '.capitulo>.p-body{padding:6px 0 4px}.capitulo>.p-body>.partida{margin:8px 6px 4px}.cap-sub{font-size:12px;font-weight:800;color:#37474f;padding:8px 12px 4px;text-transform:uppercase;letter-spacing:.3px}' +
    '.cap-nota{margin:10px 16px 0;padding:8px 10px;border-radius:8px;background:#fff8e1;color:#5d4037;font-size:12px;line-height:1.35}';
  document.head.appendChild(st);
})();
