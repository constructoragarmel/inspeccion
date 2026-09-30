// ── 152. Lo que no está en el presupuesto, el conteo imposible y el uso (30-sep-2026) ──

// (a) Las subpartidas que no están en el presupuesto de la contratista de esa torre se
// marcan «opcional»: se pueden llenar, pero no cuentan para el avance y el inspector
// sabe que puede saltarlas. El relevo (r28, `accion: 'aplica'`) dice cuáles están —solo
// códigos, nunca montos— y la respuesta se guarda en el teléfono para trabajar sin señal.
let _presupuestoTorre = null;          // { torre, contratista, codigos: {codigo: true} } o null
let _presupuestoPidiendo = '';

// La misma torre existe en dos zonas (T-07 en EZ y en SR): todo va con la zona delante.
function _torreConZona(){
  const t = getTorreActual(), z = getSectorActual();
  return (t && t !== '—' && z && z !== 'XX') ? z + '-' + t : '';
}
function _presupuestoGuardado(clave){
  try { return JSON.parse(localStorage.getItem('garmel_aplica_' + clave) || 'null'); } catch(e) { return null; }
}

async function _pedirPresupuesto(){
  const torre = _torreConZona();                  // «EZ-T-07»; vacío hasta que se sepa la zona
  if (!torre || formType !== 'detallado') { _presupuestoTorre = null; _marcarPresupuesto(); return; }
  const guardado = _presupuestoGuardado(torre);
  if (guardado) { _presupuestoTorre = guardado; _marcarPresupuesto(); }
  const clave = localStorage.getItem('garmel_clave_envio') || '';
  if (!clave || !navigator.onLine || _presupuestoPidiendo === torre) return;
  _presupuestoPidiendo = torre;
  const corte = new AbortController();
  const reloj = setTimeout(function(){ corte.abort(); }, 9000);
  try {
    const r = await fetch(RELEVO_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ clave: clave, accion: 'aplica', sector: getSectorActual(), torre: getTorreActual() }), signal: corte.signal });
    const j = await r.json();
    if (j && j.ok) {
      const dato = (j.codigos && j.codigos.length)
        ? { torre: torre, contratista: j.contratista || '', codigos: j.codigos.reduce(function(o, c){ o[c] = true; return o; }, {}) }
        : { torre: torre, sinPresupuesto: true };
      try { localStorage.setItem('garmel_aplica_' + torre, JSON.stringify(dato)); } catch(e) {}
      if (_torreConZona() === torre) { _presupuestoTorre = dato; _marcarPresupuesto(); }
    }
  } catch(e) {} finally { clearTimeout(reloj); _presupuestoPidiendo = ''; }
}

function _marcarPresupuesto(){
  const p = _presupuestoTorre;
  const valido = p && p.codigos && p.torre === _torreConZona();
  PARTIDAS.forEach(function(h){
    (h.items || []).forEach(function(_, i){
      const celda = document.getElementById('pct_' + h.id + '_' + i);
      const tr = celda && celda.closest('tr');
      if (!tr) return;
      const cod = ((typeof CODIGOS_SUB !== 'undefined' && CODIGOS_SUB[h.id]) || [])[i];
      const opcional = !!(valido && cod && !p.codigos[cod]);
      tr.classList.toggle('fuera-presupuesto', opcional);
      const desc = tr.querySelector('td.desc');
      let tag = desc && desc.querySelector('.opcional-tag');
      if (opcional && desc && !tag) {
        tag = document.createElement('span');
        tag.className = 'opcional-tag';
        desc.appendChild(tag);
      }
      if (tag) {
        if (opcional) tag.textContent = 'No está en el presupuesto' + (p.contratista ? ' de ' + p.contratista : '') + ' · opcional';
        else tag.remove();
      }
    });
  });
}

// (b) El aviso de «más puestas que las que hay» se dejó en espera (Stephanie, 30-sep-2026):
// al principio las medidas en obra no serán exactas y cuenta lo que se ve contra lo que hay
// en teoría. Se decide después de ver cómo se comportan los primeros informes.

// (c) El uso, sin nada a la vista del inspector: cuánto tiempo activo lleva el informe (pausas de más de 5 minutos no
// cuentan), cuántas filas se midieron y cuántas quedaron vacías, y si se trajo el informe
// anterior. Viaja en el informe (`datos.uso`) y el relevo lo anota en el registro.
const USO_PAUSA_MS = 5 * 60 * 1000;
let _uso = { activoMs: 0, ultimo: 0, anterior: '' };
function _usoNuevo(){ _uso = { activoMs: 0, ultimo: 0, anterior: '' }; }
// Las escuchas del formulario se registraron con la función original de _marcarCambio,
// así que el tiempo se mide con escuchas propias.
function _usoTic(){
  const ahora = Date.now();
  if (_uso.ultimo && ahora - _uso.ultimo < USO_PAUSA_MS) _uso.activoMs += ahora - _uso.ultimo;
  _uso.ultimo = ahora;
}
document.addEventListener('input', _usoTic, true);
document.addEventListener('change', _usoTic, true);
document.addEventListener('click', function(e){ if (e.target && e.target.closest && e.target.closest('.est-btn, .ev-btn')) _usoTic(); }, true);
const _getFormDataBase152 = getFormData;
getFormData = function(){
  const d = _getFormDataBase152.apply(this, arguments);
  if (d && d.partidas && formType === 'detallado') {
    let medidas = 0, vacias = 0;
    _hitosDelAmbito().forEach(function(h){
      (d.partidas[h.id] || []).forEach(function(r, i){
        if (!r || r.fueraDeAmbito) return;
        if (['pr', 'ej', 'sn', 'pct'].some(function(k){ return String(r[k] || '').trim() !== ''; }) || r.ev) medidas++;
        else vacias++;
      });
    });
    d.uso = { segundos: Math.round(_uso.activoMs / 1000), activoMs: _uso.activoMs, medidas: medidas, vacias: vacias,
              anterior: _uso.anterior || '' };
  }
  return d;
};

// Enganches: redibujar las filas vuelve a marcar lo opcional; abrir un borrador recupera su
// tiempo y pide el presupuesto de su torre; un formulario limpio empieza a contar de cero.
const _initAppContentBase152 = initAppContent;
initAppContent = function(){ const r = _initAppContentBase152.apply(this, arguments); try { _marcarPresupuesto(); } catch(e) {} return r; };
const _loadDraftDataBase152 = loadDraftData;
loadDraftData = function(index){
  const d = (getSavedReports() || [])[index];
  const r = _loadDraftDataBase152.apply(this, arguments);
  if (_abiertoParaEditar && d) {
    _usoNuevo();
    if (d.uso) { _uso.activoMs = d.uso.activoMs || 0; _uso.anterior = d.uso.anterior || ''; }
    _pedirPresupuesto();
  }
  return r;
};
const _nuevoFormularioBase152 = nuevoFormulario;
nuevoFormulario = function(){
  const r = _nuevoFormularioBase152.apply(this, arguments);
  if (!document.getElementById('torre').value) { _usoNuevo(); _presupuestoTorre = null; _marcarPresupuesto(); }
  return r;
};
document.addEventListener('change', function(e){
  if (e.target && /^(torre|convenio)$/.test(e.target.id)) _pedirPresupuesto();
}, true);
