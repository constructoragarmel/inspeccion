// ── Residentes como lista desplegable (v178, 20-oct-2026, Diego Orta: «¿Se puede agregar los residentes como una lista
// desplegable?») ─────────────────────────────────────────────────────────────────────────────────────────────────────
// El campo sigue siendo de texto —hay torres sin residente en el cuadro y se escribe el que se encontró en obra—, y lleva
// un botón «▾» que despliega debajo los conocidos, en tres grupos: los de ESA contratista en el sector según el cuadro, los
// que este teléfono ya escribió para ella y los demás del sector. Tocar uno lo pone en el campo. No se usa <datalist>: en
// Android sale pegado al teclado y no se ve que existe. Va en los cuatro formularios: obra (varios residentes,
// `.residente-input`) y el motor de servicios, SHA y urbanismo (`#residente`). Nada se elige solo.
(function(){
  const datos = (typeof TORRES !== 'undefined') ? TORRES : (typeof TORRES_DATA !== 'undefined' ? TORRES_DATA : []);
  const partir = function(v){ return String(v || '').split(/\s*(?:\/|·)\s*/).map(function(x){ return x.trim(); }).filter(Boolean); };
  const val = function(id){ const e = document.getElementById(id); return e ? String(e.value || '') : ''; };
  const esc = function(x){ return String(x == null ? '' : x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); };
  function guardados(){
    const out = [];
    ['garmel_reports_list', (typeof CLAVE_LISTA !== 'undefined') ? CLAVE_LISTA : ''].forEach(function(k){
      if (!k) return;
      try { const l = JSON.parse(localStorage.getItem(k) || '[]'); if (Array.isArray(l)) l.forEach(function(b){
        if (!b) return;
        partir([].concat(b.residentes || []).concat(b.residente ? [b.residente] : []).join(' / ')).forEach(function(r){ out.push({ r: r, e: b.empresa || '', c: b.convenio || '' }); });
      }); } catch(e) {}
    });
    return out;
  }
  function sugeridos(){
    const conv = val('convenio'), empresas = partir(val('empresa'));
    const grupos = [[], [], []], vistos = {};
    const poner = function(g, r, etq){ const k = r.toLowerCase(); if (!r || vistos[k]) return; vistos[k] = true; grupos[g].push({ r: r, etq: etq }); };
    datos.forEach(function(x){ if ((!conv || x.c === conv) && empresas.indexOf(x.e) >= 0) partir(x.r).forEach(function(r){ poner(0, r, x.t); }); });
    if (typeof RESIDENTE_POR_EMPRESA !== 'undefined') empresas.forEach(function(e){ partir(RESIDENTE_POR_EMPRESA[e]).forEach(function(r){ poner(0, r, ''); }); });
    if (typeof RESIDENTE_URB_SHA !== 'undefined') empresas.forEach(function(e){ partir(RESIDENTE_URB_SHA[e]).forEach(function(r){ poner(0, r, 'urbanismo'); }); });
    guardados().forEach(function(x){ if (empresas.indexOf(x.e) >= 0 || (!empresas.length && (!conv || x.c === conv))) poner(1, x.r, ''); });
    datos.forEach(function(x){ if (!conv || x.c === conv) partir(x.r).forEach(function(r){ poner(2, r, String(x.e || '').replace(/,? C\.?A\.?$/i, '') + ' · ' + x.t); }); });
    return { grupos: grupos, empresa: empresas.join(' · ') };
  }
  (function(){
    const st = document.createElement('style');
    st.textContent =
      '.res-caja{position:relative;display:block;flex:1;min-width:0}' +
      '.res-caja>input{width:100%;padding-right:52px !important;box-sizing:border-box}' +
      '.res-abrir{position:absolute;right:2px;top:50%;transform:translateY(-50%);width:44px;height:44px;border:0;background:transparent;' +
      'color:#1a237e;font-size:20px;font-weight:700;cursor:pointer;border-radius:10px}' +
      '.res-abrir:focus-visible{outline:2px solid #1a237e}' +
      '.res-lista{margin-top:4px;border:1.5px solid #c5cae9;border-radius:10px;background:#fff;max-height:300px;overflow:auto;' +
      'box-shadow:0 6px 18px rgba(26,35,126,.12)}' +
      '.res-lista .res-g{font-size:11px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.3px;padding:8px 12px 4px;background:#f5f6fc}' +
      '.res-lista button{display:block;width:100%;min-height:44px;text-align:left;border:0;border-top:1px solid #eef0f8;background:#fff;' +
      'padding:8px 12px;font-size:14px;color:#1b2235;cursor:pointer}' +
      '.res-lista button small{display:block;color:#64748b;font-size:11.5px}' +
      '.res-lista .res-vacio{padding:10px 12px;font-size:13px;color:#64748b}';
    document.head.appendChild(st);
  })();
  function cerrar(){ document.querySelectorAll('.res-lista').forEach(function(l){ l.remove(); }); document.querySelectorAll('.res-abrir').forEach(function(b){ b.setAttribute('aria-expanded', 'false'); b.textContent = '▾'; }); }
  function abrir(inp, btn){
    const ya = btn.getAttribute('aria-expanded') === 'true';
    cerrar();
    if (ya) return;   // segundo toque: se cierra
    const s = sugeridos(), t = ['De ' + (s.empresa || 'la contratista'), 'Escritos en este teléfono', 'Otros del sector'];
    let h = '';
    s.grupos.forEach(function(g, i){
      if (!g.length) return;
      h += '<div class="res-g">' + esc(t[i]) + '</div>' + g.map(function(x){
        return '<button type="button" data-r="' + esc(x.r) + '">' + esc(x.r) + (x.etq ? '<small>' + esc(x.etq) + '</small>' : '') + '</button>'; }).join('');
    });
    if (!h) h = '<div class="res-vacio">Todavía no hay residentes conocidos para ' + (s.empresa ? esc(s.empresa) : 'este sector') + '. Escríbalo arriba.</div>';
    const l = document.createElement('div'); l.className = 'res-lista'; l.setAttribute('role', 'listbox'); l.innerHTML = h;
    l.addEventListener('click', function(ev){
      const b = ev.target.closest('button[data-r]'); if (!b) return;
      // En «Varias torres» el campo junta los residentes con « · »: el que se toca se SUMA, no borra a los demás.
      const ya = String(inp.value || '').split(' · ').map(function(x){ return x.trim(); }).filter(Boolean);
      if (ya.length > 1) { if (ya.indexOf(b.dataset.r) < 0) ya.push(b.dataset.r); inp.value = ya.join(' · '); }
      else inp.value = b.dataset.r;
      inp.dispatchEvent(new Event('input', { bubbles: true })); inp.dispatchEvent(new Event('change', { bubbles: true }));
      cerrar();
    });
    // Debajo del campo, fuera de él (la flecha no se mueve); en obra, debajo de la fila con su ✕.
    const ancla = inp.parentElement.closest('.multi-input-row') || inp.parentElement;
    ancla.after(l);
    btn.setAttribute('aria-expanded', 'true'); btn.textContent = '▴';
  }
  function esResidente(el){ return el && el.tagName === 'INPUT' && (el.id === 'residente' || (el.classList && el.classList.contains('residente-input'))); }
  function preparar(el){
    if (!esResidente(el) || el.dataset.resLista) return;
    el.dataset.resLista = '1';
    if (el.placeholder === 'Nombre y credencial del residente...') el.placeholder = 'Escriba o elija con ▾';
    const caja = document.createElement('span'); caja.className = 'res-caja';
    el.parentNode.insertBefore(caja, el); caja.appendChild(el);
    const b = document.createElement('button'); b.type = 'button'; b.className = 'res-abrir'; b.textContent = '▾';
    b.setAttribute('aria-label', 'Elegir el residente de una lista'); b.setAttribute('aria-expanded', 'false');
    b.addEventListener('click', function(){ abrir(el, b); });
    caja.appendChild(b);
  }
  window._residentesSugeridos = sugeridos;
  document.addEventListener('click', function(ev){ if (!ev.target.closest || !ev.target.closest('.res-caja, .res-lista')) cerrar(); }, true);
  function todos(){ document.querySelectorAll('#residente, .residente-input').forEach(preparar); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', todos); else todos();
  new MutationObserver(function(ms){ ms.forEach(function(m){ m.addedNodes.forEach(function(n){
    if (n.nodeType !== 1) return; if (esResidente(n)) preparar(n); if (n.querySelectorAll) n.querySelectorAll('.residente-input').forEach(preparar);
  }); }); }).observe(document.body || document.documentElement, { childList: true, subtree: true });
})();
