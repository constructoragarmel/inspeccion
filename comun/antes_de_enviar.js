// ── 192. Lo que no debe salir en «Enviar todos» (20-oct-2026) ───────────────────────────────────────────────────────
// El 20-oct una inspectora vació su teléfono con «Enviar todos» y salieron borradores viejos: informes hechos el 13-oct con
// fecha 5-oct (una sola fecha mal elegida a las 10:23 y arrastrada con «Siguiente apto.»), apartamentos a medias («A», «B»,
// «B-1» donde la torre usa A1, A2, B1, B2) y uno sin nada medido. Hubo que limpiarlos a mano en Drive, en el registro y en
// Smartsheet, donde el reenvío de un número pisa la versión anterior. Tres frenos, en los cuatro formularios salvo lo dicho:
//   1 · FECHA QUE NO ES HOY (criterio de Stephanie, 20-oct-2026: «preguntar una sola vez al elegir una fecha que no sea la de
//       hoy, sin repetir en los apartamentos siguientes ni al guardar o enviar»). Al elegir en «Fecha de inspección» una fecha
//       que no es la de hoy —en la hora del teléfono— se pregunta «La fecha que eligió es el 05-oct, no hoy (13-oct). ¿Es
//       correcta?». Si no, vuelve la que había y se abre el selector. Una fecha confirmada no se vuelve a preguntar, y la que
//       arrastran «Siguiente apto.» y «Sig. torre» o la que repone un borrador al abrirse no pasan por aquí: no son una
//       elección en el selector. Al guardar y al enviar no se pregunta nada. Al pasar al siguiente apartamento o a la
//       siguiente torre con una fecha que no es hoy, un aviso la muestra.
//   2 · APARTAMENTO A MEDIAS (solo obra): donde la torre tiene lista de apartamentos (cambio 181), un apartamento que no
//       tiene su forma —letra y número: «A» o «B» donde son A1/B1, «B-1» con guion— no se envía y se marca en «Informes».
//       Si al quitarle guiones y espacios queda uno de la lista («B-1» → «B1», «b1» → «B1») se corrige solo. Uno con la
//       forma bien pero fuera de la lista («C1») sigue pasando, como decidió el 181 para las torres con otra nomenclatura.
//       Servicios, SHA y urbanismo no tienen este campo: su «Apto / área» admite un área («Sala de bombas») y en SHA y
//       urbanismo esas filas son hallazgos y manzanas, así que una lista no aplica.
//   3 · NADA MEDIDO: un informe sin ninguna partida llena —en obra ninguna ejecutada, evaluación, Sí/No ni %; en los otros
//       tres ninguna respuesta, cantidad, camión, maquinaria, fila de apartamento o hallazgo, incidencia ni obstáculo— no
//       sale en «Enviar todos»: queda en «Informes» con la marca «Vacío, no se envía» y se borra con 🗑️ Borrar. La
//       proyectada no cuenta (puede venir de la visita anterior). Enviado de a uno se pregunta antes, por si de verdad
//       va así.
const _MESES192 = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
function _hoy192(){ return new Date(); }   // las tandas del banco la cambian para «estar» en otro día
function _iso192(d){ return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function _fechaCorta192(iso){ const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || '').trim()); return m ? m[3] + '-' + _MESES192[+m[2] - 1] : String(iso || ''); }

// ── 1 · Fecha que no es hoy ──
const _fechasOk192 = {};   // las confirmadas en esta sesión
let _revirtiendo192 = false;
function _avisoCorto192(texto){
  if (typeof showToast === 'function') { showToast(texto, 'ok'); return; }
  let a = document.getElementById('aviso192');
  if (!a) {
    a = document.createElement('div'); a.id = 'aviso192'; a.setAttribute('role', 'status');
    a.style.cssText = 'position:fixed;left:16px;right:16px;top:76px;z-index:9998;padding:12px 14px;border-radius:10px;' +
      'background:#1e293b;color:#fff;font-size:15px;font-weight:700;line-height:1.35;text-align:center;box-shadow:0 4px 14px rgba(0,0,0,.25)';
    document.body.appendChild(a);
  }
  a.textContent = texto; a.hidden = false;
  clearTimeout(_avisoCorto192._t); _avisoCorto192._t = setTimeout(function(){ a.hidden = true; }, 4500);
}
// Lo que había antes de tocar el selector, para volver a ello si la respuesta es «no».
['focusin', 'pointerdown'].forEach(function(ev){
  document.addEventListener(ev, function(e){ const el = e.target; if (el && el.id === 'fecha') el.dataset.antes192 = el.value; }, true);
});
// En captura: corre antes que el onchange del propio campo, y si la respuesta es «no» nadie más ve la fecha equivocada.
document.addEventListener('change', function(e){
  const el = e.target;
  if (!el || el.id !== 'fecha' || _revirtiendo192) return;
  const v = el.value, hoy = _iso192(_hoy192());
  if (!v || v === hoy || _fechasOk192[v]) { el.dataset.antes192 = v; return; }
  if (confirm('📅 La fecha que eligió es el ' + _fechaCorta192(v) + ', no hoy (' + _fechaCorta192(hoy) + ').\n\n¿Es correcta?')) {
    _fechasOk192[v] = true; el.dataset.antes192 = v; return;
  }
  e.stopImmediatePropagation();
  const antes = el.dataset.antes192 || '';
  el.value = antes === v ? '' : antes;
  _revirtiendo192 = true;
  try { el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); }
  finally { _revirtiendo192 = false; }
  try { el.focus(); if (el.showPicker) el.showPicker(); } catch (er) {}
}, true);
// «Siguiente apto.» y «Sig. torre» arrastran la fecha sin preguntar; si no es hoy, se dice.
// v183 (21-oct-2026, Diego Orta: «cuando cargan información de una inspección anterior la fecha que sale en el informe nuevo sigue
// siendo la anterior»): solo se arrastra la fecha que el inspector ELIGIÓ y confirmó en esta sesión (cargar seguidos los de un día
// anterior, el caso del 13-oct). Si la fecha vino de un informe abierto de otro día, el informe nuevo arranca con la de hoy, y se dice.
function _avisarFechaArrastrada192(){
  const el = document.getElementById('fecha'), v = (el || {}).value || '', hoy = _iso192(_hoy192());
  if (!v || v === hoy) return;
  if (_fechasOk192[v]) { _avisoCorto192('📅 Sigue con la fecha ' + _fechaCorta192(v) + ', no la de hoy.'); return; }
  el.value = hoy; el.dataset.antes192 = hoy;
  _revirtiendo192 = true;
  try { el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); }
  finally { _revirtiendo192 = false; }
  _avisoCorto192('📅 Informe nuevo con la fecha de hoy (' + _fechaCorta192(hoy) + '). El anterior era del ' + _fechaCorta192(v) + '.');
}
['siguienteApartamento', 'siguienteTorre'].forEach(function(n){
  if (typeof window[n] !== 'function') return;
  const base = window[n];
  window[n] = function(){ const r = base.apply(this, arguments); setTimeout(_avisarFechaArrastrada192, 300); return r; };
});

// ── 2 · Apartamento ── null: no hay lista, está vacío (eso lo dice lo que falta) o está bien. {normal}: se corrige solo. {mal}.
function _formaApto192(v){ return String(v).replace(/[A-Z]/g, 'L').replace(/[0-9]/g, '9'); }
function _revisarApto192(apto, lista){
  if (!lista || !lista.length) return null;
  const v = String(apto || '').trim().toUpperCase(); if (!v) return null;
  if (lista.indexOf(v) >= 0) return null;
  const limpio = v.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Z0-9]/g, '');
  if (lista.indexOf(limpio) >= 0) return { normal: limpio };
  if (/^[A-Z0-9]+$/.test(v) && lista.map(_formaApto192).indexOf(_formaApto192(v)) >= 0) return null;
  return { mal: true, lista: lista };
}

// ── 3 · Nada medido ──
function _lleno192(v){ return v !== undefined && v !== null && String(v).trim() !== ''; }
function _nadaMedido192(d){
  if (!d) return false;
  if (Array.isArray(d.general)) {   // servicios, SHA y urbanismo
    if (d.general.some(function(g){ return (g.items || []).some(function(i){ return _lleno192(i.sn) || _lleno192(i.cant) || (i.camiones || []).length || _lleno192(i.maquinaria); }); })) return false;
    if ((d.apartamentos || []).some(function(a){ return Object.keys(a.campos || {}).some(function(k){ return _lleno192(a.campos[k]); }); })) return false;
    if ((d.incidencias || []).length) return false;
    if (typeof hayObstaculos === 'function' && hayObstaculos(d.obstaculos)) return false;
    return true;
  }
  const P = d.partidas || {};   // obra
  const fila = function(f){ return f && (_lleno192(f.ej) || _lleno192(f.ev) || _lleno192(f.sn) || _lleno192(f.pct)); };
  if (Object.keys(P).some(function(k){ const v = P[k]; return Array.isArray(v) ? v.some(fila) : !!(v && typeof v === 'object' && _lleno192(v.pct)); })) return false;
  const E = d.extraRows || {};
  if (Object.keys(E).some(function(k){ return [].concat(E[k] || []).some(fila); })) return false;
  return true;
}
function _fueraDeTanda192(b){ return _nadaMedido192(b); }
function _marca192(texto){
  const s = document.createElement('span'); s.className = 'marca192'; s.textContent = texto;
  s.style.cssText = 'display:block;margin-top:4px;padding:6px 8px;border-radius:6px;font-size:12.5px;line-height:1.35;font-weight:700;' +
    'white-space:normal;overflow-wrap:anywhere;background:#fee2e2;color:#991b1b';
  return s;
}
const _MARCA_VACIO192 = '⛔ Vacío, no se envía: no tiene nada medido. Si no sirve, bórrelo con 🗑️ Borrar.';

// ── Obra (inspeccion.html) ──
if (typeof getFormData === 'function' && typeof getSavedReports === 'function' && typeof enviarPendientes === 'function') {
  const _aptosDe192 = function(b){
    const z = (typeof SECTOR_POR_CONVENIO !== 'undefined' && SECTOR_POR_CONVENIO[b.convenio]) || '', t = b.torre || '';
    if (typeof APARTAMENTOS_POR_TORRE !== 'undefined' && APARTAMENTOS_POR_TORRE[z + '|' + t]) return APARTAMENTOS_POR_TORRE[z + '|' + t];
    return (typeof APARTAMENTOS_POR_SECTOR !== 'undefined' && APARTAMENTOS_POR_SECTOR[z]) || null;
  };
  const _deApto192 = function(b){ return b && (b.ambito || 'apartamento') !== 'torre' && b.vista !== 'estructura'; };
  window._aptoMal192 = function(b){ if (!_deApto192(b)) return null; const r = _revisarApto192(b.apto, _aptosDe192(b)); return r && r.mal ? r : null; };
  const _textoApto192 = function(b, r){ return 'el apartamento «' + b.apto + '» no es de la lista: en la ' + b.torre + ' son ' + r.lista.join(', '); };
  const _ponerAptoEnPantalla192 = function(v){
    const el = document.getElementById('apto'); if (!el || el.value === v) return;
    el.value = v; if (typeof _aplicarListaApto === 'function') _aplicarListaApto(); if (typeof updateDocInfo === 'function') updateDocInfo();
  };

  // Guardar a mano con el apartamento a medias: se guarda y se avisa.
  const _saveDraftBase192 = saveDraft;
  saveDraft = function(silencioso){
    const r = _saveDraftBase192.apply(this, arguments);
    if (!silencioso && r !== false) {
      try { const d = getFormData(), m = _aptoMal192(d); if (m) setTimeout(function(){ showToast('⚠️ Guardado, pero ' + _textoApto192(d, m) + '. Así no se envía.', 'err'); }, 60); } catch (e) {}
    }
    return r;
  };
  // Enviar el de pantalla (también el que se abre desde «Informes» con 📤 Enviar).
  const _enviarAlRelevoBase192 = enviarAlRelevo;
  enviarAlRelevo = async function(){
    try {
      if (!camposFaltantes().length) {
        const d = getFormData(), m = _aptoMal192(d);
        if (m) {
          alert('⚠️ No se envía: ' + _textoApto192(d, m) + '.\n\nElija el apartamento de la lista y vuelva a enviar.');
          const s = document.getElementById('apto-sel'), el = (s && s.style.display !== 'none') ? s : document.getElementById('apto');
          if (el) { try { el.scrollIntoView({ block: 'center' }); el.focus(); } catch (e) {} }
          return;
        }
        if (_nadaMedido192(d) && !confirm('⛔ Este informe no tiene nada medido: ninguna ejecutada, evaluación, Sí/No ni %.\n\n«Enviar todos» no lo manda. ¿Enviarlo de todos modos?')) return;
      }
    } catch (e) {}
    return _enviarAlRelevoBase192.apply(this, arguments);
  };
  // Lo que «Enviar todos» deja fuera, y por qué.
  const _faltanEnBase192 = _faltanEn;
  _faltanEn = function(b){
    const f = _faltanEnBase192.apply(this, arguments) || [];
    try {
      if (_nadaMedido192(b)) f.push('medir algo — está vacío y no se envía (bórrelo con 🗑️ Borrar si no sirve)');
      const m = _aptoMal192(b); if (m) f.push('corregir el apartamento «' + b.apto + '»: en la ' + b.torre + ' son ' + m.lista.join(', '));
    } catch (e) {}
    return f;
  };
  // La lista para la oficina (187) dice lo mismo.
  if (typeof _faltanDe187 === 'function') {
    const _faltanDe187Base192 = _faltanDe187;
    _faltanDe187 = function(b){
      const f = _faltanDe187Base192.apply(this, arguments) || [];
      try { if (!b.enviado) { if (_nadaMedido192(b)) f.push('medir algo (vacío, no se envía)'); const m = _aptoMal192(b); if (m) f.push('corregir el apartamento «' + b.apto + '»'); } } catch (e) {}
      return f;
    };
  }
  // «Enviar todos»: antes de mirar qué falta, «B-1» pasa a «B1» donde es de la lista.
  const _enviarPendientesBase192 = enviarPendientes;
  enviarPendientes = async function(){
    if (!_tandaEnCurso && localStorage.getItem('garmel_clave_envio')) {
      try {
        if (_tieneContenido(getFormData())) saveDraft(true);
        const lista = getSavedReports(); let cambio = false;
        lista.forEach(function(b){
          if (!b || b.enviado || !_deApto192(b)) return;
          const r = _revisarApto192(b.apto, _aptosDe192(b));
          if (r && r.normal) { b.apto = r.normal; cambio = true; if (b.id === _idEnEdicion) _ponerAptoEnPantalla192(r.normal); }
        });
        if (cambio) localStorage.setItem('garmel_reports_list', JSON.stringify(lista));
      } catch (e) { console.warn('192:', e); }
    }
    return _enviarPendientesBase192.apply(this, arguments);
  };
  // Al abrir un borrador, «B-1» pasa a «B1» si es de la lista; si está a medias, se dice.
  const _loadDraftDataBase192 = loadDraftData;
  loadDraftData = function(){
    const r = _loadDraftDataBase192.apply(this, arguments);
    try {
      const b = _idEnEdicion && getSavedReports().find(function(x){ return x && x.id === _idEnEdicion; });
      if (b && !b.enviado && _deApto192(b)) {
        const v = _revisarApto192(b.apto, _aptosDe192(b));
        if (v && v.normal) _ponerAptoEnPantalla192(v.normal);
        else if (v && v.mal) setTimeout(function(){ showToast('⚠️ ' + _textoApto192(b, v).replace(/^el/, 'El') + '. Corríjalo antes de enviar.', 'err'); }, 700);
      }
    } catch (e) {}
    return r;
  };
  // Las marcas en «Informes».
  const _renderSavedListBase192 = renderSavedList;
  renderSavedList = function(){
    const r = _renderSavedListBase192.apply(this, arguments);
    try {
      const l = getSavedReports();
      document.querySelectorAll('#savedListContent .saved-item').forEach(function(card, i){
        const b = l[i]; if (!b || b.enviado) return;
        const info = card.querySelector('.saved-item-info') || card;
        if (_nadaMedido192(b)) info.appendChild(_marca192(_MARCA_VACIO192));
        const m = _aptoMal192(b); if (m) info.appendChild(_marca192('⚠️ ' + _textoApto192(b, m).replace(/^el/, 'El') + '. Ábralo con 📂 Editar y corríjalo: así no se envía.'));
      });
    } catch (e) {}
    return r;
  };
}

// ── Servicios, SHA y urbanismo (el motor de construir-servicios.py) ──
if (typeof datosDelFormulario === 'function' && typeof listaGuardada === 'function' && typeof enviarSolo === 'function') {
  const _enviarSoloBase192 = enviarSolo;
  enviarSolo = async function(id){
    const d = listaGuardada().find(function(x){ return x.id === id; });
    if (d && !d.enviado && !_tandaEnCurso && _nadaMedido192(d) &&
        !confirm('⛔ ' + (d.nro || 'Este informe') + ' no tiene nada medido.\n\n«Enviar todos» no lo manda. ¿Enviarlo de todos modos?')) return;
    return _enviarSoloBase192.apply(this, arguments);
  };
  // Lo que «Enviar todos» dejó fuera, para el aviso del final (lo llama enviar() del motor).
  window._resumenFuera192 = function(){
    const l = listaGuardada().filter(function(b){ return !b.enviado && !faltan(b).length && _fueraDeTanda192(b); });
    if (!l.length) return '';
    return '\n\nNo salieron y siguen en el teléfono (' + l.length + '):\n' + l.map(function(b){
      return '· ' + b.nro + ' — vacío: no tiene nada medido. Bórrelo con 🗑️ Borrar en Informes, o si de verdad va así envíelo solo con 📤 Enviar.';
    }).join('\n');
  };
  const _abrirInformesBase192 = abrirInformes;
  abrirInformes = function(){
    const r = _abrirInformesBase192.apply(this, arguments);
    try {
      const l = [...listaGuardada()].reverse();
      document.querySelectorAll('#modal-informes .ficha').forEach(function(card, i){
        const b = l[i]; if (!b || b.enviado) return;
        if (_nadaMedido192(b)) card.insertBefore(_marca192(_MARCA_VACIO192), card.querySelector('.b'));
      });
    } catch (e) {}
    return r;
  };
}
