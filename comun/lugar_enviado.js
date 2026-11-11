// ── 204. Un informe ya enviado no se muda de torre ni de sector (3-nov-2026) ───────────────────────────────────────────
// Diego Orta, por Génesis Cordobés y Cleidy Chacón: «el sistema nos combina información de los dos sectores». No era el
// relevo: era un informe YA ENVIADO (abierto desde «Informes» o con «Abrir para corregir») al que se le cambió la torre o el
// convenio. El formulario lo tomaba como una corrección y lo mandaba entero —mediciones, fotos y observaciones— al archivo de
// la otra torre, y el original seguía en la suya: EZ-T04-P03AA2-261028-CC salió otra vez como SR-T12-P03AA2-261028-CC, y
// SR-T38-261021-GC, abierto en la oficina, como EZ-T04-261027-GC-r2, que es la última revisión y la que muestra «Ver PDF».
// Ahora, en un informe abierto que ya se envió, cambiar torre o convenio pregunta antes: Aceptar empieza en la torre nueva un
// informe EN BLANCO (con la misma fecha); Cancelar lo deja donde estaba. Un borrador que nunca se envió se sigue corrigiendo
// como antes (elegir mal la torre y arreglarla antes de enviar es normal). Es el mismo archivo en los cuatro formularios:
// obra mira currentEditingIndex; servicios, SHA y urbanismo, idActual.
(function(){
  const OBRA = (typeof getSavedReports === 'function' && typeof loadDraftData === 'function');
  let pasando = false;
  // ── 206. El teléfono recuerda qué números ya envió (11-nov-2026) ───────────────────────────────────────────────────────
  // Diego Orta: EZ-T01-261104-GC y EZ-T04-261110-GC (Génesis Cordobés) salieron con las actividades, las observaciones, las
  // fotos y casi todas las mediciones de SR-T38-261104-GC. No eran informes enviados abiertos para corregir —eso ya lo
  // atajaba el 204—, sino BORRADORES NUEVOS con el contenido de la T-38: el de la T-01 nació 40 s después de enviar la T-38.
  // «Borrar enviados» (y borrar el informe abierto desde «Informes») quitaba de la lista el informe que estaba en pantalla
  // pero dejaba su contenido, y el siguiente autoguardado lo convertía en un borrador nuevo, sin rastro de que ya se había
  // enviado. Ahora: (1) cada número enviado queda anotado 45 días aunque se borre de la lista, y cambiar la torre o el
  // convenio de algo que tiene ese número pregunta igual que el 204; (2) si se borra el informe que está en pantalla, la
  // pantalla queda en blanco.
  const REG = 'garmel_enviados_lugar', DIAS = 45;
  function base(n){ return String(n || '').trim().toUpperCase().replace(/-R\d+$/, ''); }
  function lista(){ try { return (OBRA ? getSavedReports() : listaGuardada()) || []; } catch (e) { return []; } }
  function anotar(){
    let r = {}; try { r = JSON.parse(localStorage.getItem(REG) || '{}') || {}; } catch (e) { r = {}; }
    const ahora = Date.now(); let cambio = false;
    lista().forEach(function(d){
      if (!d || !(d.enviado || d.oficina) || !d.nro || !d.torre) return;
      const k = base(d.nro); if (!k || r[k]) return;
      r[k] = { torre: d.torre, convenio: d.convenio || '', t: ahora }; cambio = true;
    });
    Object.keys(r).forEach(function(k){ if (ahora - (r[k].t || 0) > DIAS * 864e5) { delete r[k]; cambio = true; } });
    if (cambio) { try { localStorage.setItem(REG, JSON.stringify(r)); } catch (e) {} }
    return r;
  }
  function nroEnPantalla(){
    const el = document.getElementById(OBRA ? 'nro-display' : 'nro');
    return el ? String(('value' in el ? el.value : '') || el.textContent || '') : '';
  }
  function hayContenido(){
    try { return OBRA ? (_tieneContenido(getFormData()) || _hayMediciones()) : !informeVacio(datosDelFormulario()); }
    catch (e) { return false; }
  }
  function idEnPantalla(){
    try {
      if (OBRA) return _idEnEdicion || (currentEditingIndex !== null ? ((getSavedReports() || [])[currentEditingIndex] || {}).id : null) || null;
      return idActual || null;
    } catch (e) { return null; }
  }
  function enBlanco(){
    const c = window.confirm; window.confirm = function(){ return true; };
    try {
      if (OBRA) { _hayCambiosSinGuardar = false; nuevoFormulario(); try { localStorage.removeItem('garmel_actual'); } catch (e) {} }
      else vaciarFormulario();
    } finally { window.confirm = c; }
  }
  function envolver(nombre){
    const f = window[nombre]; if (typeof f !== 'function' || f._lugar206) return;
    const g = function(){
      anotar();
      const id = idEnPantalla(), estaba = !!id && lista().some(function(x){ return x && x.id === id; });
      const r = f.apply(this, arguments);
      try {
        if (estaba && !lista().some(function(x){ return x && x.id === id; })) {
          enBlanco();
          if (typeof showToast === 'function') showToast('🧹 El informe que estaba en pantalla se borró de este teléfono: la pantalla quedó en blanco.', 'ok');
        }
      } catch (e) {}
      return r;
    };
    g._lugar206 = true; window[nombre] = g;
  }
  function preparar(){
    anotar();
    (OBRA ? ['borrarEnviados', 'deleteSavedReport'] : ['borrarEnviados', 'borrarInforme']).forEach(envolver);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', preparar); else setTimeout(preparar, 0);
  document.addEventListener('visibilitychange', function(){ anotar(); });
  function abierto(){
    let d = null;
    try {
      if (OBRA) { if (currentEditingIndex !== null && _abiertoParaEditar) d = (getSavedReports() || [])[currentEditingIndex]; }
      else if (idActual) d = (listaGuardada() || []).find(function(x){ return x && x.id === idActual; });
    } catch (e) { d = null; }
    if (d && (d.enviado || d.oficina)) return d;
    // 206: un borrador con el contenido de un informe que este teléfono ya envió (mismo número) cuenta como enviado.
    const nro = base(nroEnPantalla()), r = nro ? anotar()[nro] : null;
    if (r && hayContenido()) return { nro: nro, torre: r.torre, convenio: r.convenio };
    return null;
  }
  function poner(id, v){
    const el = document.getElementById(id); if (!el) return;
    el.value = v; el.dispatchEvent(new Event('change', { bubbles: true }));
  }
  document.addEventListener('change', function(e){
    const el = e.target;
    if (pasando || !el || (el.id !== 'torre' && el.id !== 'convenio')) return;
    const d = abierto(); if (!d) return;
    const antes = String((el.id === 'torre' ? d.torre : d.convenio) || '');
    if (!antes || el.value === antes) return;
    e.stopImmediatePropagation();
    const nuevo = el.value, esTorre = el.id === 'torre';
    const donde = (d.torre || '') + (d.convenio ? ' (' + d.convenio + ')' : '');
    const destino = esTorre ? (nuevo || 'la otra torre') : (nuevo || 'el otro convenio');
    el.value = antes;   // mientras pregunta, y para lo que se guarde ahora, el informe sigue donde estaba
    const si = confirm('Este informe (' + (d.nro || '') + ') ya se envió: está archivado en ' + donde + '.\n\n' +
      'Cambiarle ' + (esTorre ? 'la torre' : 'el convenio') + ' NO lo corrige: lo mandaría otra vez, entero —mediciones, fotos y ' +
      'observaciones—, al archivo de ' + destino + ', con datos de ' + (d.torre || 'esta torre') + '.\n\n' +
      'Aceptar: empezar en ' + destino + ' un informe nuevo, en blanco.\n' +
      'Cancelar: dejar este informe como está.\n\n' +
      'Si se envió con la torre equivocada, avise a Planificación: no se arregla desde aquí.');
    if (!si) return;
    const fecha = (document.getElementById('fecha') || {}).value || '';
    const conv = esTorre ? String(d.convenio || (document.getElementById('convenio') || {}).value || '') : nuevo;
    const c = window.confirm; window.confirm = function(){ return true; };
    pasando = true;
    try {
      if (OBRA) { try { if (_hayCambiosSinGuardar) saveDraft(true); } catch (e2) {} nuevoFormulario(); }
      else nuevoInforme();
      if (fecha) { const f = document.getElementById('fecha'); if (f) f.value = fecha; }
      poner('convenio', conv);
      if (esTorre) poner('torre', nuevo);
    } finally { pasando = false; window.confirm = c; }
    if (OBRA && typeof updateNroInforme === 'function') updateNroInforme();
    if (typeof showToast === 'function') showToast('🆕 Informe nuevo de ' + destino + ', en blanco. ' + (d.nro || 'El anterior') + ' quedó como estaba.', 'ok');
  }, true);
})();
