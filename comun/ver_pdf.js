// ── 194. «Ver PDF» en el buscador de informes, sin traerlo al formulario, y buscar por apartamento (27-oct-2026) ───────────────────────────
// Diego Orta, 27-oct: «debería haber una opción de ver el pdf sin que se cargue en el formulario porque entonces ahí se
// crea un borrador». En el panel de oficina («Buscar los informes de esta torre»), cada informe archivado lleva ahora
// «📄 Ver PDF» junto a «Abrir para corregir». Ver PDF le pide al relevo (r74, accion 'oficina-pdf') el PDF de la última
// revisión, tal como quedó en Drive, y lo abre en otra pestaña: no toca «Informes» ni lo que hay en pantalla, y sirve
// aunque la computadora no tenga acceso a la unidad de Drive. Es el mismo archivo en los cuatro formularios: obra pide
// con _oficinaPedir y getTorreActual; servicios, SHA y urbanismo con _ofiPedir (que añade el tipo) y _ofiTorre.
(function(){
  const MOTOR = (typeof _ofiPedir === 'function');
  const pedir = function(c){ return MOTOR ? _ofiPedir(c) : _oficinaPedir(c); };
  const torre = function(){ return MOTOR ? _ofiTorre() : getTorreActual(); };
  const sector = function(){ return MOTOR ? _ofiSector() : getSectorActual(); };
  const urls = {};   // un PDF ya traído no se vuelve a pedir en esta sesión

  function _blobDe(b64){
    const bin = atob(b64), n = bin.length, u = new Uint8Array(n);
    for (let i = 0; i < n; i++) u[i] = bin.charCodeAt(i);
    return new Blob([u], { type: 'application/pdf' });
  }
  // Deja en el panel el enlace al PDF, por si el navegador no abrió la pestaña (bloqueo de ventanas) o se cerró.
  function _enlace(aviso, numero, url, archivo){
    aviso.innerHTML = '📄 ' + _ofiEsc(archivo || numero) + ' · <a href="' + url + '" target="_blank" rel="noopener">abrir el PDF</a> · ' +
      '<a href="' + url + '" download="' + _ofiEsc(archivo || (numero + '.pdf')) + '">descargarlo</a>';
  }
  window.oficinaVerPdf = async function(numero){
    const caja = document.getElementById('ofi-lista');
    let aviso = caja.querySelector('.ofi-pdf[data-n="' + CSS.escape(numero) + '"]');
    if (!aviso) { aviso = document.createElement('p'); aviso.className = 'ofi-aviso ofi-pdf'; aviso.dataset.n = numero; caja.appendChild(aviso); }
    // La pestaña se abre ya, dentro del toque: abierta después de esperar al relevo, el navegador la bloquea.
    let w = null;
    try { w = window.open('', '_blank'); if (w && w.document) w.document.write('<p style="font:16px sans-serif;padding:24px">⏳ Trayendo el PDF de ' + _ofiEsc(numero) + '…</p>'); } catch (e) { w = null; }
    try {
      let x = urls[numero];
      if (!x) {
        aviso.textContent = '⏳ Trayendo el PDF de ' + numero + '…';
        // `nro` y no `numero`, a propósito: un relevo sin la acción contesta «Faltan numero…» en vez de archivar algo (como el 184).
        const r = await pedir({ accion: 'oficina-pdf', sector: sector(), torre: torre(), nro: numero });
        if (!r.pdf) throw new Error('El relevo no devolvió el PDF. Puede que todavía no tenga la versión r74: avise a Planificación.');
        x = urls[numero] = { url: URL.createObjectURL(_blobDe(r.pdf)), archivo: r.archivo };
      }
      _enlace(aviso, numero, x.url, x.archivo);
      if (w) w.location.href = x.url;
    } catch (e) {
      if (w) try { w.close(); } catch (e2) {}
      aviso.textContent = '❌ No se pudo traer el PDF de ' + numero + ': ' + _ofiMensaje(e);
    }
  };

  // Cada fila del buscador: «📄 Ver PDF» antes de «Abrir para corregir». El texto del pie dice la diferencia.
  const _pintarBase194 = _oficinaPintar;
  _oficinaPintar = function(lista, t){
    const r = _pintarBase194.apply(this, arguments);
    const caja = document.getElementById('ofi-lista');
    caja.querySelectorAll('button[data-n]').forEach(function(b){
      if (!/oficinaAbrir/.test(b.getAttribute('onclick') || '')) return;
      b.textContent = 'Abrir para corregir';
      const v = document.createElement('button'); v.type = 'button'; v.className = 'ofi-btn ofi-ver'; v.dataset.n = b.dataset.n;
      v.textContent = '📄 Ver PDF'; v.setAttribute('onclick', 'oficinaVerPdf(this.dataset.n)');
      b.parentNode.insertBefore(v, b);
    });
    caja.querySelectorAll('p.ofi-aviso').forEach(function(p){
      if (/Al abrir uno, queda en la lista/.test(p.textContent))
        p.innerHTML = '<b>📄 Ver PDF</b> muestra el informe tal como quedó archivado, sin traerlo a esta computadora: no crea ningún borrador. ' +
          '<b>Abrir para corregir</b> lo trae a «Informes» con todo lo que trajo de campo; lo que cambie no borra nada: al cerrarlo se guarda como una revisión nueva.';
    });
    return r;
  };
  // 194b · Buscar por apartamento (Diego Orta, 27-oct: «por torre/apartamento»): sobre la lista de la torre, un filtro que deja
  // solo las filas que tienen todo lo escrito (piso, apartamento, inspector, fecha o número; sin importar acentos ni mayúsculas),
  // y cuántos días hacia atrás buscar (14, 30 o 60; el relevo no da más de 60).
  let _ofiDias = 14;
  const _norm = function(t){ return String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); };
  if (MOTOR) { const _b = _ofiPedir; _ofiPedir = function(c){ if (c && c.accion === 'oficina-lista') c.dias = _ofiDias; return _b.apply(this, arguments); }; }
  else { const _b = _oficinaPedir; _oficinaPedir = function(c){ if (c && c.accion === 'oficina-lista') c.dias = _ofiDias; return _b.apply(this, arguments); }; }
  window._ofiFiltrar194 = function(){
    const caja = document.getElementById('ofi-lista'), q = _norm((document.getElementById('ofi-filtro') || {}).value).split(/\s+/).filter(Boolean);
    let n = 0, v = 0;
    caja.querySelectorAll('table tr').forEach(function(tr, i){
      if (i === 0) return; n++;
      const t = _norm(tr.innerText), ve = q.every(function(x){ return t.indexOf(x) >= 0; });
      tr.style.display = ve ? '' : 'none'; if (ve) v++;
    });
    const c = document.getElementById('ofi-cuenta'); if (c) c.textContent = q.length ? v + ' de ' + n : n + ' informe' + (n === 1 ? '' : 's');
  };
  const _pintarFiltro = _oficinaPintar;
  _oficinaPintar = function(){
    const r = _pintarFiltro.apply(this, arguments);
    const caja = document.getElementById('ofi-lista'), tabla = caja.querySelector('table');
    if (_ofiDias !== 14) caja.querySelectorAll('p.ofi-aviso').forEach(function(p){ p.innerHTML = p.innerHTML.replace('últimos 14 días', 'últimos ' + _ofiDias + ' días'); });
    const f = document.createElement('div'); f.className = 'ofi-filtro';
    f.innerHTML = (tabla ? '<input type="search" id="ofi-filtro" placeholder="Filtrar: piso, apto, inspector, fecha o número" oninput="_ofiFiltrar194()" autocomplete="off">' +
      '<span id="ofi-cuenta"></span>' : '') +
      '<label>Buscar en los últimos <select id="ofi-dias" onchange="_ofiDiasCambio194(this.value)">' +
      [14, 30, 60].map(function(d){ return '<option value="' + d + '"' + (d === _ofiDias ? ' selected' : '') + '>' + d + '</option>'; }).join('') + '</select> días</label>';
    caja.insertBefore(f, caja.firstChild);
    if (tabla) _ofiFiltrar194();
    return r;
  };
  window._ofiDiasCambio194 = function(v){ _ofiDias = parseInt(v, 10) || 14; oficinaBuscar(); };

  const st = document.createElement('style');
  st.textContent = '.ofi-lista td:last-child{white-space:nowrap}.ofi-btn.ofi-ver{margin-right:6px}.ofi-pdf a{font-weight:700}' +
    '.ofi-filtro{display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center;margin:0 0 8px}.ofi-filtro input{flex:1 1 220px;min-width:0;min-height:44px;padding:8px 10px;border:1px solid #c7d2fe;border-radius:8px;font-size:15px;box-sizing:border-box}' +
    '.ofi-filtro select{min-height:44px;font-size:15px}.ofi-filtro #ofi-cuenta{font-size:12px;color:#5a6672}.ofi-filtro label{font-size:13px}';
  document.head.appendChild(st);
})();
