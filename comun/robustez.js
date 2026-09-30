// ── 153. Lo que servicios, SHA y urbanismo ya aprendieron en obra (30-sep-2026) ──
// Stephanie: «toda esa lista de 9 está bien, hazlos todos». Cada punto dice de dónde viene.

// ═══ 1. Las fotos van a IndexedDB, no al almacenamiento chico ═══════════════
// Servicios, 14-sep (commit 899e4c8): «localStorage corta en 4,8 MB … 36 fotos ×
// ~214 KB ≈ 7,7 MB: NO CABÍA, y el fallo de guardado dejaba «Enviar» mandando la
// versión anterior sin las fotos nuevas». Aquí eran hasta 72 fotos por informe.
// El borrador guarda una marca «idb» en cada casilla con foto; las fotos van aparte,
// con el id del borrador. Un borrador viejo con las fotos dentro se sigue leyendo y
// se pasa solo a IndexedDB al guardarlo. Sin IndexedDB (navegador raro, modo privado)
// todo sigue como antes.
const FOTOS_DB = 'garmel_inspeccion', FOTOS_TIENDA = 'fotos';
let _idbOk = (typeof indexedDB !== 'undefined');
let _idbPromesa = null;
let _fotosSucias = false, _restaurandoFotos = false, _fotosGuardadasDe = null;

function _idb(){
  if (!_idbOk) return Promise.reject(new Error('sin IndexedDB'));
  if (!_idbPromesa) {
    _idbPromesa = new Promise(function(res, rej){
      const r = indexedDB.open(FOTOS_DB, 1);
      r.onupgradeneeded = function(){ r.result.createObjectStore(FOTOS_TIENDA, { keyPath: 'id' }); };
      r.onsuccess = function(){ res(r.result); };
      r.onerror = function(){ rej(r.error); };
    });
    _idbPromesa.catch(function(){ _idbOk = false; });
  }
  return _idbPromesa;
}
function _idbHacer(modo, fn){
  return _idb().then(function(db){
    return new Promise(function(res, rej){
      const tx = db.transaction(FOTOS_TIENDA, modo);
      let salida;
      const r = fn(tx.objectStore(FOTOS_TIENDA));
      if (r) r.onsuccess = function(){ salida = r.result; };
      tx.oncomplete = function(){ res(salida); };
      tx.onerror = tx.onabort = function(){ rej(tx.error); };
    });
  });
}
function _fotosPut(id, fotos){ return _idbHacer('readwrite', function(t){ return t.put({ id: id, fotos: fotos, cuando: Date.now() }); }); }
function _fotosGet(id){ return _idbHacer('readonly', function(t){ return t.get(id); }).then(function(r){ return r ? r.fotos : null; }); }
function _fotosDel(id){ return _idbHacer('readwrite', function(t){ return t.delete(id); }).catch(function(){}); }
function _esDato(s){ return typeof s === 'string' && s.indexOf('data:') === 0; }
function _hayFotosReales(fotos){
  return Object.keys(fotos || {}).some(function(pid){ return (fotos[pid] || []).some(_esDato); });
}

// Lo que se escribe en la lista: las fotos se cambian por la marca «idb».
// Un informe enviado (y no editado después) ya no guarda fotos: están en Drive.
// Mientras las fotos de un borrador abierto todavía se están pintando, se
// conservan las marcas que ya tenía: guardar en ese instante no las borra.
function _fotosAIdb(d, previo){
  if (!d) return d;
  if (d.enviado && !d.editadoTras) {
    const m = Object.assign({}, d, { fotos: {} }); delete m.fotosEnIdb;
    Object.keys(d.fotos || {}).forEach(function(pid){ m.fotos[pid] = (d.fotos[pid] || []).map(function(){ return ''; }); });
    return m;
  }
  if (_restaurandoFotos && previo && previo.fotosEnIdb && previo.id === d.id) return Object.assign({}, d, { fotosEnIdb: true, fotos: previo.fotos });
  if (!_idbOk || !_hayFotosReales(d.fotos)) return d;
  const copia = {};
  Object.keys(d.fotos).forEach(function(pid){ copia[pid] = (d.fotos[pid] || []).slice(); });
  if (_fotosSucias || _fotosGuardadasDe !== d.id) {
    const id = d.id;
    _fotosSucias = false; _fotosGuardadasDe = id;
    _fotosPut(id, copia).catch(function(){
      // No se pudo: se vuelve al almacenamiento de antes para no perder nada.
      _idbOk = false; _fotosGuardadasDe = null;
      try { saveDraft(true); } catch(e) {}
      showToast('⚠️ No se pudieron guardar las fotos aparte: quedan en el espacio chico del teléfono. Envíe pronto.', 'err');
    });
  }
  const m = Object.assign({}, d, { fotosEnIdb: true, fotos: {} });
  Object.keys(copia).forEach(function(pid){
    m.fotos[pid] = copia[pid].map(function(s){ return _esDato(s) ? 'idb' : (s || ''); });
  });
  return m;
}

const _pintarFotoBase153 = _pintarFoto;
_pintarFoto = function(pid, fi, dato){ const r = _pintarFotoBase153.apply(this, arguments); if (!_restaurandoFotos) _fotosSucias = true; return r; };
const _removeFotoBase153 = removeFoto;
removeFoto = function(){ const r = _removeFotoBase153.apply(this, arguments); _fotosSucias = true; return r; };

// Borra de IndexedDB lo que ya no es de ningún borrador pendiente.
function _limpiarFotosHuerfanas(){
  if (!_idbOk) return Promise.resolve();
  const vivos = {};
  getSavedReports().forEach(function(b){ if (b && b.id && (!b.enviado || b.editadoTras)) vivos[b.id] = true; });
  return _idbHacer('readonly', function(t){ return t.getAllKeys(); }).then(function(ids){
    return Promise.all((ids || []).filter(function(id){ return !vivos[id] && id !== _idEnEdicion; }).map(_fotosDel));
  }).catch(function(){});
}

// ═══ 2. Un borrador sin nada medido no se guarda solo ════════════════════════
// Servicios, 17-sep (v79): «elegir una torre y tocar Nuevo dejaba una ficha a medias por
// cada intento», y «Enviar todos» la mandaba a Drive y a Smartsheet.
const _autoguardarBase153 = autoguardar;
autoguardar = function(){
  try {
    const d = getFormData();
    const existe = getSavedReports().some(function(b){ return b && b.id === d.id; });
    if (!existe && !_tieneContenido(d)) return;
  } catch(e) {}
  return _autoguardarBase153.apply(this, arguments);
};

// ═══ 4. «Enviado» se marca por id, no por número ═════════════════════════════
// Dos borradores con el mismo número (el mismo apartamento, el mismo día, rehecho)
// quedaban los dos «enviados» y el otro perdía sus fotos. Servicios lo hace por id.
// También sirve para reenviar: la marca se actualiza y se quita «editado después».
_marcarComoEnviado = function(nro, id){
  try {
    const lista = getSavedReports();
    let cambio = false;
    lista.forEach(function(b){
      if (!b || (id ? b.id !== id : (b.nro !== nro || b.enviado))) return;
      b.enviado = new Date().toLocaleString(); delete b.editadoTras; cambio = true;
      if (b.fotos) Object.keys(b.fotos).forEach(function(pid){ b.fotos[pid] = (b.fotos[pid] || []).map(function(){ return ''; }); });
      delete b.fotosEnIdb;
      if (localStorage.getItem('garmel_actual') === b.id) localStorage.removeItem('garmel_actual');
    });
    if (cambio) localStorage.setItem('garmel_reports_list', JSON.stringify(lista));
    actualizarContadores();
    _limpiarFotosHuerfanas();
  } catch(e) {
    showToast('⚠️ ' + nro + ' SÍ se envió, pero no se pudo marcar como enviado en este teléfono. No lo vuelva a enviar: ya está en Drive.', 'err');
  }
};

// ═══ 3. «Enviar todos» como en servicios ═════════════════════════════════════
// Con tope de 90 s por informe (servicios: «con señal mala el envío se quedaba colgado sin
// decir nada»), el motivo de cada fallo (v77, 17-sep: «no hubo forma de saber por qué»),
// guardando antes lo que está en pantalla («se envía lo guardado, no lo que se ve») y sin
// mandar informes a medias (v78: dice cuáles y qué les falta).
let _motivoEnvio = '';
_enviarUno = async function(b, clave){
  _motivoEnvio = '';
  try {
    if (b && b.fotosEnIdb) {
      const f = await _fotosGet(b.id).catch(function(){ return null; });
      if (!f) { _motivoEnvio = 'no se encontraron sus fotos en este teléfono'; return false; }
      b = Object.assign({}, b, { fotos: f });
    }
    const fotos = [];
    if (b.fotos) Object.keys(b.fotos).forEach(function(pid){
      (b.fotos[pid] || []).forEach(function(src, fi){ if (_esDato(src)) fotos.push({ nombre: pid + '-' + (fi + 1), dato: src }); });
    });
    const sector = (typeof SECTOR_POR_CONVENIO !== 'undefined' && SECTOR_POR_CONVENIO[b.convenio]) || 'XX';
    const corte = new AbortController();
    const reloj = setTimeout(function(){ corte.abort(); }, 90000);
    let r;
    try {
      r = await fetch(RELEVO_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ clave: clave, numero: b.nro, sector: sector, torre: b.torre, ambito: b.ambito || 'apartamento',
                               datos: _sinFotos(b), fotos: fotos }), signal: corte.signal });
    } finally { clearTimeout(reloj); }
    const res = await r.json();
    if (res.ok) { _marcarComoEnviado(b.nro, b.id); return true; }
    _motivoEnvio = res.error || 'el relevo no lo aceptó';
    return false;
  } catch(e) {
    _motivoEnvio = (e && e.name === 'AbortError') ? 'sin respuesta en 90 s (señal mala)'
                                                  : 'sin conexión: ' + String(e && e.message || e).slice(0, 60);
    return false;
  }
};

function _faltanEn(b){
  const f = [];
  if (!b.fecha) f.push('fecha'); if (!b.convenio) f.push('convenio'); if (!b.empresa) f.push('empresa');
  if (!b.torre) f.push('torre');
  if ((b.ambito || 'apartamento') !== 'torre') { if (!b.piso) f.push('piso'); if (!String(b.apto || '').trim()) f.push('apartamento'); }
  if (!(b.inspectores || []).length) f.push('inspector'); if (!(b.estatus || []).length) f.push('estatus');
  return f;
}

enviarPendientes = async function(){
  if (_tandaEnCurso) { showToast('Ya hay un envío en curso. Espere a que termine.', 'err'); return; }
  const clave = localStorage.getItem('garmel_clave_envio') || '';
  if (!clave) { alert('Este teléfono todavía no está configurado. Abra Enviar y escriba la clave una vez.'); return; }
  try { if (_tieneContenido(getFormData())) saveDraft(true); } catch(e) {}
  const pendientes = getSavedReports().filter(function(b){ return b && !b.enviado; });
  if (!pendientes.length) { showToast('No hay informes sin enviar', 'ok'); return; }
  const completos = pendientes.filter(function(b){ return !_faltanEn(b).length; });
  const incompletos = pendientes.filter(function(b){ return _faltanEn(b).length; });
  const listaIncompletos = incompletos.map(function(b){ return '· ' + (b.nro || 'sin número') + ' — falta: ' + _faltanEn(b).join(', '); }).join('\n');
  if (!completos.length) {
    alert('Hay ' + pendientes.length + ' informe(s) sin enviar, pero ninguno está completo:\n\n' + listaIncompletos + '\n\nÁbralos, complételos y vuelva a intentarlo.');
    return;
  }
  const heredadas = completos.reduce(function(a, b){ return a + _heredadasEn(b); }, 0);
  if (!confirm('Se van a enviar ' + completos.length + ' informe(s).' +
      (heredadas ? '\n\n⚠️ Traen ' + heredadas + ' fila(s) de la visita anterior sin revisar hoy.' : '') +
      (incompletos.length ? '\n\nNo se envían ' + incompletos.length + ' incompleto(s):\n' + listaIncompletos : '') +
      '\n\n¿Continuar?')) return;
  _tandaEnCurso = true;
  let bien = 0; const fallos = [];
  try {
    for (const b of completos) {
      _cartelEnvio('📤 Enviando ' + (bien + fallos.length + 1) + ' de ' + completos.length + '…\n\nNo cierre esta pantalla ni vuelva a pulsar Enviar.');
      if (await _enviarUno(b, clave)) bien++;
      else fallos.push('· ' + (b.nro || 'sin número') + ' — ' + (_motivoEnvio || 'no se pudo'));
    }
  } finally { _cartelEnvio(''); _tandaEnCurso = false; }
  renderSavedList();
  alert('Enviados: ' + bien + '\nCon problemas: ' + fallos.length +
        (fallos.length ? '\n\n' + fallos.join('\n') + '\n\nLos que fallaron siguen guardados y se pueden reintentar.' : '') +
        (incompletos.length ? '\n\nSin enviar por incompletos: ' + incompletos.length : ''));
};

// ═══ 5. Abrir un informe guardado no pierde ni pisa nada ═════════════════════
// Servicios (21-sep): «una constante fuera de sitio dejó un informe sin inspector ni
// incidencias». Lo que hay en pantalla se guarda antes de abrir otro; y si el que se
// abre llega incompleto (un hito que no se pudo restaurar), no se guarda encima del bueno.
let _bloqueoGuardado = false;
const _saveDraftBase153 = saveDraft;
saveDraft = function(silencioso){
  if (_bloqueoGuardado) {
    if (!silencioso) showToast('⚠️ Este informe se abrió incompleto: no se guarda encima del que está bien. Ábralo de nuevo o avise a la oficina.', 'err');
    return false;
  }
  return _saveDraftBase153.apply(this, arguments);
};
const _deleteSavedReportBase153 = deleteSavedReport;
deleteSavedReport = function(){ const r = _deleteSavedReportBase153.apply(this, arguments); _limpiarFotosHuerfanas(); return r; };
const _borrarEnviadosBase153 = borrarEnviados;
borrarEnviados = function(){ const r = _borrarEnviadosBase153.apply(this, arguments); _limpiarFotosHuerfanas(); return r; };

let _fotosListas = Promise.resolve();
const _loadDraftDataBase153 = loadDraftData;
loadDraftData = function(index){
  let d = (getSavedReports() || [])[index];
  // Guardar lo de pantalla puede correr la lista (un borrador nuevo entra arriba):
  // después se vuelve a buscar el que se pidió por su id, no por su puesto.
  try {
    if (d && d.id !== _idEnEdicion && _tieneContenido(getFormData()) && saveDraft(true)) {
      const i = getSavedReports().findIndex(function(b){ return b && b.id === d.id; });
      if (i >= 0) index = i;
    }
  } catch(e) {}
  _bloqueoGuardado = false;
  _restaurandoFotos = true;
  const r = _loadDraftDataBase153.call(this, index);
  _restaurandoFotos = false;
  clearTimeout(_tempAutoguardado); _hayCambiosSinGuardar = false;
  if (typeof _falloAlAbrir !== 'undefined' && _falloAlAbrir.length) _bloqueoGuardado = true;
  if (d && _abiertoParaEditar) {
    // Las fotos que están en IndexedDB.
    if (d.fotosEnIdb) {
      _restaurandoFotos = true;
      _fotosListas = _fotosGet(d.id).then(function(f){
        if (!f) { showToast('⚠️ No se encontraron las fotos de este informe en el teléfono.', 'err'); return; }
        Object.keys(f).forEach(function(pid){ (f[pid] || []).forEach(function(src, fi){ if (_esDato(src)) _pintarFoto(pid, fi, src); }); });
        _fotosGuardadasDe = d.id; _fotosSucias = false;
      }).catch(function(){}).then(function(){ _restaurandoFotos = false; clearTimeout(_tempAutoguardado); _hayCambiosSinGuardar = false; });
    }
    // Punto 9: lo que vino de la visita anterior y no se revisó sigue marcado.
    Object.keys(d.partidas || {}).forEach(function(pid){
      const arr = d.partidas[pid];
      if (Array.isArray(arr)) arr.forEach(function(item, i){ if (item && item.heredado) _marcarHeredada(pid + '_' + i); });
    });
  }
  return r;
};

// ═══ 6. «Editado después de enviarlo» ════════════════════════════════════════
// Servicios (3-sep): «la siguiente tanda lo reenviaba callada —sin fotos— y duplicaba su fila
// en Smartsheet». Aquí: se marca, se ve en la lista y se reenvía a propósito.
// Las fotos no entran: al enviarse se quitan del teléfono, y compararlas daría
// «editado» siempre.
function _huellaInforme(b){
  return JSON.stringify([b.partidas, b.fotobs, b.obs_general, b.obs_sp, b.estatus, b.noInspeccionados, b.piso, b.apto, b.fecha,
                         b.inspectores, b.residentes, b.agentes]);
}
const _renderSavedListBase153 = renderSavedList;
renderSavedList = function(){
  const r = _renderSavedListBase153.apply(this, arguments);
  const lista = getSavedReports();
  document.querySelectorAll('#savedListContent .saved-item').forEach(function(card, i){
    const b = lista[i];
    if (!b || !b.enviado || !b.editadoTras) return;
    const info = card.querySelector('.saved-item-info');
    const s = document.createElement('span');
    s.className = 'saved-item-sub editado-tras';
    s.textContent = '✏️ Editado después de enviarlo (' + b.editadoTras + '): reenvíelo';
    info.appendChild(s);
    const bt = card.querySelector('.s-btn-send');
    if (bt) bt.textContent = '🔁 Reenviar';
  });
  return r;
};
sendSavedDirect = async function(index){
  const b = getSavedReports()[index];
  if (b && b.enviado && !confirm(b.editadoTras
      ? 'Este informe se envió el ' + b.enviado + ' y se editó después.\n\nReenviarlo actualiza Smartsheet con la versión nueva (en Drive queda también la anterior). ¿Continuar?'
      : 'Este informe ya se envió el ' + b.enviado + '.\n\nVolver a enviarlo creará una copia en Drive. ¿Continuar?')) return;
  loadDraftData(index);
  await _fotosListas;          // que las fotos de IndexedDB estén pintadas antes de enviar
  openSend();
};

// ═══ 7. Si el teléfono recarga, el informe que se estaba llenando vuelve ═════
// Servicios, 14-sep (primer día de uso): «un teléfono que descarga la pestaña mientras se
// atiende una llamada devolvía un formulario vacío».
function _olvidarActual(){ try { localStorage.removeItem('garmel_actual'); } catch(e) {} }
const _nuevoFormularioBase153 = nuevoFormulario;
nuevoFormulario = function(){
  const r = _nuevoFormularioBase153.apply(this, arguments);
  if (!document.getElementById('torre').value) { _olvidarActual(); _bloqueoGuardado = false; _fotosGuardadasDe = null; _fotosSucias = false; }
  return r;
};
const _siguienteApartamentoBase153 = siguienteApartamento;
siguienteApartamento = function(){
  const r = _siguienteApartamentoBase153.apply(this, arguments);
  if (!_idEnEdicion) { _olvidarActual(); _fotosGuardadasDe = null; _fotosSucias = false; }
  return r;
};
// «Finalizar» dejaba puesto el id del informe cerrado: el autoguardado del siguiente
// se escribía ENCIMA del que se acababa de finalizar (QC del 30-sep-2026). Se arregla
// en finalizarInforme mismo (cambio 153j de construir.py).
window.addEventListener('load', function(){
  setTimeout(function(){
    try {
      const id = localStorage.getItem('garmel_actual');
      if (!id || _idEnEdicion) return;
      const lista = getSavedReports();
      const i = lista.findIndex(function(b){ return b && b.id === id && !b.enviado; });
      if (i < 0) { _olvidarActual(); return; }
      loadDraftData(i);
      _abiertoParaEditar = false;          // se sigue llenando como antes de la recarga
      // Después de los avisos de arranque, que si no lo tapan.
      setTimeout(function(){ showToast('↩️ Se recuperó el informe que estaba llenando', 'ok'); }, 1800);
    } catch(e) {}
  }, 400);
});

// ═══ 8. La coma decimal ═════════════════════════════════════════════════════
// Urbanismo, 21-sep: «en un teléfono con teclado es-VE el decimal es la coma y un campo
// `number` la rechaza en silencio». Las casillas pasan a texto con teclado numérico, y aquí
// la coma se vuelve punto y se quita lo que no es número, antes de que se calcule nada.
document.addEventListener('input', function(e){
  const el = e.target;
  if (!el || !el.classList || !el.classList.contains('num') || el.type !== 'text') return;
  let v = String(el.value || '').replace(/,/g, '.').replace(/[^0-9.]/g, '');
  const p = v.indexOf('.');
  if (p >= 0) v = v.slice(0, p + 1) + v.slice(p + 1).replace(/\./g, '');
  if (v !== el.value) el.value = v;
}, true);

// ═══ 9. Lo traído de la visita anterior se ve y se confirma ══════════════════
// Servicios, 14-sep: «un informe que sale todo heredado sin que nadie lo sepa es un
// documento que afirma cosas que hoy no se miraron». Cada fila traída queda marcada hasta
// que se toca (o «Sigue igual»); viaja con `heredado: true`, y antes de enviar se avisa.
function _filaDe(rid){ const c = document.getElementById('pct_' + rid); return c && c.closest('tr'); }
function _marcarHeredada(rid){
  const tr = _filaDe(rid);
  if (!tr || tr.classList.contains('heredada')) return;
  tr.classList.add('heredada');
  const desc = tr.querySelector('td.desc');
  if (!desc) return;
  const tag = document.createElement('span');
  tag.className = 'heredada-tag';
  tag.innerHTML = '↺ De la visita anterior <button type="button" class="sigue-igual">Sigue igual</button>';
  tag.querySelector('button').onclick = function(ev){ ev.stopPropagation(); _confirmarFila(rid); if (typeof _marcarCambio === 'function') _marcarCambio(); };
  desc.appendChild(tag);
}
function _confirmarFila(rid){
  const tr = (rid && rid.nodeType) ? rid : _filaDe(rid);
  if (!tr) return;
  tr.classList.remove('heredada');
  const tag = tr.querySelector('.heredada-tag'); if (tag) tag.remove();
}
function _heredadasEnPantalla(){ return document.querySelectorAll('tr.heredada').length; }
function _heredadasEn(b){
  let n = 0;
  Object.keys(b.partidas || {}).forEach(function(pid){ const a = b.partidas[pid]; if (Array.isArray(a)) a.forEach(function(r){ if (r && r.heredado) n++; }); });
  return n;
}
// Tocar la fila la da por revisada. En estados y Sí/No, volver a tocar el valor que ya
// tenía lo CONFIRMA (en vez de borrarlo, que es lo que hace fuera de este caso).
['input', 'change'].forEach(function(tipo){
  document.addEventListener(tipo, function(e){ const tr = e.target && e.target.closest && e.target.closest('tr.heredada'); if (tr) _confirmarFila(tr); }, true);
});
document.addEventListener('click', function(e){
  const b = e.target && e.target.closest && e.target.closest('tr.heredada .ev-btn');
  if (b) _confirmarFila(b.dataset.rid);
}, true);
const _setEstadoBase153 = setEstado;
setEstado = function(btn, valor){
  const tr = btn && btn.closest('tr.heredada');
  if (tr) {
    const ej = document.getElementById('ej_' + btn.dataset.rid);
    _confirmarFila(btn.dataset.rid);
    if (ej && ej.value !== '' && Number(ej.value) === valor) { if (typeof _marcarCambio === 'function') _marcarCambio(); return; }
  }
  return _setEstadoBase153.apply(this, arguments);
};
const _setSiNoBase153 = setSiNo;
setSiNo = function(btn){
  const tr = btn && btn.closest('tr.heredada');
  if (tr) {
    const sn = document.getElementById('sn_' + btn.dataset.rid);
    _confirmarFila(btn.dataset.rid);
    if (sn && sn.value === btn.dataset.sn) { if (typeof _marcarCambio === 'function') _marcarCambio(); return; }
  }
  return _setSiNoBase153.apply(this, arguments);
};
// Solo «Traer las mediciones»: con «Usar las cantidades» se copia el «hay», que no
// cambia entre visitas, y las puestas se cuentan igual.
const _traerMedicionesBase153 = _traerMediciones;
_traerMediciones = function(partidas, soloHay){
  const filas = [];
  if (!soloHay && !_hayMediciones()) Object.keys(partidas || {}).forEach(function(pid){
    const arr = partidas[pid];
    if (pid.slice(-6) === '_extra' || !Array.isArray(arr)) return;
    arr.forEach(function(item, i){
      if (!item || item.fueraDeAmbito || !_aplica(pid, i) || !_filaDe(pid + '_' + i)) return;
      if (['pr', 'ej', 'sn', 'pct'].some(function(k){ return String(item[k] || '').trim() !== ''; })) filas.push(pid + '_' + i);
    });
  });
  const r = _traerMedicionesBase153.apply(this, arguments);
  filas.forEach(_marcarHeredada);
  return r;
};
const _getFormDataBase153 = getFormData;
getFormData = function(){
  const d = _getFormDataBase153.apply(this, arguments);
  if (d && d.partidas) Object.keys(d.partidas).forEach(function(pid){
    const arr = d.partidas[pid];
    if (!Array.isArray(arr) || pid.slice(-6) === '_extra') return;
    arr.forEach(function(r, i){ const tr = _filaDe(pid + '_' + i); if (r && tr && tr.classList.contains('heredada')) r.heredado = true; });
  });
  return d;
};
const _enviarAlRelevoBase153 = enviarAlRelevo;
enviarAlRelevo = async function(){
  const n = _heredadasEnPantalla();
  await _fotosListas;
  if (n && !confirm(n + ' fila(s) vienen de la visita anterior y no se revisaron hoy (están marcadas «↺ De la visita anterior»).\n\n' +
                    '¿Enviar igual? Si ya las miró, toque «Sigue igual» en cada una.')) return;
  return _enviarAlRelevoBase153.apply(this, arguments);
};
