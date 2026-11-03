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
  function abierto(){
    let d = null;
    try {
      if (OBRA) { if (currentEditingIndex !== null && _abiertoParaEditar) d = (getSavedReports() || [])[currentEditingIndex]; }
      else if (idActual) d = (listaGuardada() || []).find(function(x){ return x && x.id === idActual; });
    } catch (e) { d = null; }
    return (d && (d.enviado || d.oficina)) ? d : null;
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
