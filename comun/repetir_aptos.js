// ── 198. «Repetir en otros apartamentos del piso» (27-oct-2026) ─────────────────────────────────────────────────────
// Génesis Márquez mandó en T-04 de Simón Rodríguez un informe por piso con diez apartamentos en la casilla («A10B10C10…»):
// llenar diez iguales uno por uno es fastidioso. Pero el compilado, el avance y los hitos cuentan por apartamento, y así
// el piso entero era uno solo (se separaron en el relevo con Separar.gs). Ahora: se llena uno, se toca «🔁 Repetir en
// otros apartamentos», se marcan los que quedaron igual y se guarda una copia por cada uno, con su número, sus fotos y
// la marca `repetidoDe`. Quedan en «Informes» como borradores para enviar (o corregir lo distinto antes). Solo obra:
// servicios, SHA y urbanismo no llevan apartamento.
(function(){
  const MAX = 30;
  const esc = function(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  const enApto = function(){ return typeof ambito === 'undefined' || ambito === 'apartamento'; };

  // El número de la copia: el mismo con otro apartamento («-P10AA10-» → «-P10AB10-»).
  window._nroRepetido = function(nro, apto){
    const m = String(nro || '').match(/^(.*-P\d{2}A)[^-]*(-\d{6}-.*)$/);
    return m ? m[1] + apto + m[2] : null;
  };
  // «B10, c10 d10» → ['B10', 'C10', 'D10'], sin repetidos ni el de pantalla.
  window._aptosEscritos = function(txt, actual){
    const vistos = {};
    return String(txt || '').split(/[\s,;\/]+/).map(function(a){ return _limpiar(a); })
      .filter(function(a){ if (!a || a === actual || vistos[a]) return false; vistos[a] = true; return true; });
  };

  function _boton(){
    const sel = document.getElementById('apto-sel'); if (!sel || document.getElementById('btn-repetir')) return;
    const b = document.createElement('button'); b.type = 'button'; b.id = 'btn-repetir'; b.className = 'repetir';
    b.textContent = '🔁 Repetir en otros apartamentos…'; b.onclick = function(){ abrirRepetir(); };
    sel.parentNode.insertBefore(b, sel.nextSibling);
    _mostrarBoton();
  }
  function _mostrarBoton(){ const b = document.getElementById('btn-repetir'); if (b) b.style.display = enApto() ? '' : 'none'; }

  window.abrirRepetir = function(){
    const d = getFormData(), actual = _limpiar(d.apto);
    const falta = [];
    if (!getTorreActual() || getTorreActual() === '—') falta.push('la torre');
    if (!d.piso) falta.push('el piso');
    if (!actual) falta.push('el apartamento');
    if (falta.length) { alert('Para repetirlo, primero elija ' + falta.join(', ') + ' de este informe.'); return; }
    if (!_tieneContenido(d)) { alert('Este informe todavía no tiene nada medido. Llénelo primero y después repítalo en los demás.'); return; }
    if (!_nroRepetido(d.nro, actual)) { alert('El número de este informe está incompleto (' + d.nro + '). Revise la cabecera.'); return; }
    const lista = (typeof _aptosDeSector === 'function' && _aptosDeSector()) || null;
    let caja = document.getElementById('repetir-modal');
    if (!caja) { caja = document.createElement('div'); caja.id = 'repetir-modal'; caja.className = 'repetir-fondo'; document.body.appendChild(caja); }
    caja.innerHTML = '<div class="repetir-caja" role="dialog" aria-label="Repetir en otros apartamentos">' +
      '<h3>🔁 Repetir en otros apartamentos</h3>' +
      '<p>Se guarda este informe (<b>' + esc(d.piso) + ' · ' + esc(actual) + '</b>) y una copia igual, con sus fotos, para cada apartamento que marque. ' +
      'Cada copia lleva su propio número. Si alguno tiene algo distinto, ábralo en «Informes» y corríjalo antes de enviar.</p>' +
      (lista
        ? '<div class="repetir-lista">' + lista.filter(function(a){ return a !== actual; }).map(function(a){
            return '<label><input type="checkbox" value="' + esc(a) + '"> ' + esc(a) + '</label>'; }).join('') + '</div>'
        : '<label class="repetir-rot" for="repetir-txt">Escriba los apartamentos, separados por espacio o coma</label>' +
          '<input id="repetir-txt" type="text" autocapitalize="characters" autocomplete="off" placeholder="Ej: B10 C10 D10">') +
      '<p class="repetir-van" id="repetir-van"></p>' +
      '<div class="repetir-btns"><button type="button" class="m-btn m-cancel" id="repetir-no">Cancelar</button>' +
      '<button type="button" class="m-btn m-confirm" id="repetir-si" disabled>Guardar copias</button></div></div>';
    caja.style.display = 'flex';
    const elegidos = function(){
      return lista ? Array.prototype.map.call(caja.querySelectorAll('.repetir-lista input:checked'), function(i){ return i.value; })
                   : _aptosEscritos(document.getElementById('repetir-txt').value, actual);
    };
    const pintar = function(){
      const v = elegidos(), si = document.getElementById('repetir-si'), van = document.getElementById('repetir-van');
      const ya = getSavedReports().map(function(b){ return b && b.nro; });
      const repetidos = v.filter(function(a){ return ya.indexOf(_nroRepetido(d.nro, a)) >= 0; });
      van.textContent = !v.length ? '' : v.length > MAX ? '⚠️ Son ' + v.length + ': como mucho ' + MAX + ' de una vez.'
        : 'Se guardan ' + v.length + ' copia(s): ' + v.join(' · ') + (repetidos.length ? '. ⚠️ Ya hay informe de ' + repetidos.join(', ') + ' con esta fecha en el teléfono: no se repite.' : '');
      const n = v.length - repetidos.length;
      si.disabled = !n || v.length > MAX;
      si.textContent = n ? 'Guardar ' + n + ' copia' + (n === 1 ? '' : 's') : 'Guardar copias';
    };
    caja.querySelectorAll('input').forEach(function(i){ i.addEventListener(i.type === 'checkbox' ? 'change' : 'input', pintar); });
    document.getElementById('repetir-no').onclick = function(){ caja.style.display = 'none'; };
    document.getElementById('repetir-si').onclick = function(){
      const r = repetirEn(elegidos());
      caja.style.display = 'none';
      if (r && r.hechos.length) {
        showToast('✅ ' + r.hechos.length + ' copia(s) guardada(s): ' + r.hechos.join(' · ') + '. Están en «Informes» para enviar', 'ok');
        if (typeof openSavedModal === 'function') setTimeout(openSavedModal, 400);
      }
    };
    pintar();
    const t = document.getElementById('repetir-txt'); if (t) setTimeout(function(){ t.focus(); }, 50);
  };

  // Guarda el de pantalla y una copia por apartamento. Devuelve {hechos, saltados}.
  window.repetirEn = function(aptos){
    if (saveDraft(true) === false) { showToast('❌ No se pudo guardar este informe; no se hicieron copias.', 'err'); return null; }
    const d = getFormData(), base = _limpiar(d.apto), hechos = [], saltados = [];
    let lista = getSavedReports();
    (aptos || []).slice(0, MAX).forEach(function(a, i){
      a = _limpiar(a);
      const nro = _nroRepetido(d.nro, a);
      if (!a || a === base || !nro) return;
      if (lista.some(function(b){ return b && b.nro === nro; })) { saltados.push(a); return; }
      const c = JSON.parse(JSON.stringify(d));
      ['enviado', 'editadoTras', 'oficina', 'definitiva', 'fotosEnIdb'].forEach(function(k){ delete c[k]; });
      c.id = 'draft_' + Date.now() + '_r' + i; c.apto = a; c.nro = nro; c.repetidoDe = d.nro;
      c.timestamp = new Date().toLocaleString();
      // Las fotos de la copia, aparte en IndexedDB con su propio id (como las del original); si no se puede, en la ficha.
      if (typeof _idbOk !== 'undefined' && _idbOk && typeof _hayFotosReales === 'function' && _hayFotosReales(c.fotos)) {
        const copia = {}; Object.keys(c.fotos).forEach(function(pid){ copia[pid] = (c.fotos[pid] || []).slice(); });
        _fotosPut(c.id, copia).catch(function(){});
        Object.keys(c.fotos).forEach(function(pid){ c.fotos[pid] = c.fotos[pid].map(function(s){ return _esDato(s) ? 'idb' : (s || ''); }); });
        c.fotosEnIdb = true;
      }
      lista.unshift(c); hechos.push(a);
    });
    try { localStorage.setItem('garmel_reports_list', JSON.stringify(lista)); }
    catch (e) { showToast('❌ El teléfono se quedó sin espacio para las copias. Envíe o elimine informes y vuelva a intentar.', 'err'); return { hechos: [], saltados: saltados }; }
    // El de pantalla sigue siendo el que se editaba: la lista se movió, se vuelve a ubicar por id.
    if (d.id) { const p = lista.findIndex(function(b){ return b && b.id === d.id; }); if (p >= 0) currentEditingIndex = p; }
    if (typeof actualizarContadores === 'function') actualizarContadores();
    return { hechos: hechos, saltados: saltados };
  };

  const st = document.createElement('style');
  st.textContent = 'button.repetir{display:block;width:100%;min-height:44px;margin:8px 0 0;padding:10px;border:1px dashed #1f6f8b;border-radius:8px;background:#eef7fa;color:#1f4f63;font-size:15px}' +
    '.repetir-fondo{position:fixed;inset:0;background:rgba(0,0,0,.45);display:none;align-items:center;justify-content:center;z-index:3000;padding:16px}' +
    '.repetir-caja{background:#fff;border-radius:12px;max-width:440px;width:100%;max-height:90vh;overflow:auto;padding:16px;box-sizing:border-box}' +
    '.repetir-caja h3{margin:0 0 8px;font-size:18px}.repetir-caja p{font-size:14px;line-height:1.4;margin:6px 0}' +
    '.repetir-lista{display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:8px;margin:10px 0}' +
    '.repetir-lista label{display:flex;align-items:center;gap:6px;min-height:44px;padding:0 10px;border:1px solid #ccd;border-radius:8px;font-size:16px}' +
    '.repetir-rot{display:block;font-size:14px;margin:10px 0 4px}#repetir-txt{width:100%;box-sizing:border-box;min-height:44px;font-size:16px;padding:8px}' +
    '.repetir-van{color:#1f4f63;font-weight:600}.repetir-btns{display:flex;gap:8px;justify-content:flex-end;margin-top:12px}.repetir-btns .m-btn{min-height:44px}';
  document.head.appendChild(st);

  if (typeof setAmbito === 'function') { const _setAmbitoBase198 = setAmbito; setAmbito = function(){ const r = _setAmbitoBase198.apply(this, arguments); _mostrarBoton(); return r; }; }
  if (document.readyState !== 'loading') setTimeout(_boton, 0); else document.addEventListener('DOMContentLoaded', _boton);
})();
