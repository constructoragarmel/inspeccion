// ── 154. Primero el sector (Diego Orta, 30-sep-2026) ──
// «Que la caída sea sector, torre y de ahí para abajo», y con el nombre del sector, no
// el del convenio: se va migrando de «bielorrusos, rusos, chinos» a Ezequiel Zamora,
// Simón Rodríguez y Simón Bolívar. El campo es el mismo de siempre (el valor sigue
// siendo el convenio, que es lo que leen el número, el relevo y los borradores); cambia
// el rótulo, el orden y lo que muestra. Elegido el sector, la lista de torres queda solo
// con las suyas: la T-04, la T-07, la T-12 y la T-13 existen en dos sectores y ya no se
// confunden. Sin sector elegido, la torre funciona como antes.
const _NOMBRE_SECTOR_INSP = { 'Convenio Bielorrusos': 'Ezequiel Zamora', 'Convenio Rusos': 'Simón Rodríguez', 'Convenio Chinos': 'Simón Bolívar' };

function _rotularSectores(){
  const sel = document.getElementById('convenio');
  if (!sel) return;
  [...sel.options].forEach(function(o){
    // En el HTML las opciones no traen «value»: el valor sale del texto. Se fija antes
    // de cambiar el rótulo, o el valor pasaría a ser el nombre del sector.
    if (!o.hasAttribute('value')) o.setAttribute('value', o.value);
    if (!o.value) o.textContent = '— Seleccione sector —';
    else if (_NOMBRE_SECTOR_INSP[o.value]) o.textContent = _NOMBRE_SECTOR_INSP[o.value];
  });
}
function _filtrarTorres(){
  const c = (document.getElementById('convenio') || {}).value || '';
  const sel = document.getElementById('torre');
  if (!sel) return;
  [...sel.options].forEach(function(o){
    if (!o.value) { o.textContent = c ? '— Seleccione torre —' : '— Elija primero el sector —'; return; }
    if (o.value === 'NO_REG') return;
    const ok = !c || _zonasDeTorre(o.value).indexOf(c) >= 0;
    o.hidden = !ok; o.disabled = !ok;
  });
}

(function(){
  const conv = document.getElementById('convenio');
  const torre = document.getElementById('torre');
  if (!conv || !torre) return;
  const campo = conv.closest('.field'), campoTorre = torre.closest('.field');
  campoTorre.parentElement.insertBefore(campo, campoTorre);
  const lab = campo.querySelector('label'); if (lab) lab.textContent = 'Sector *';
  _rotularSectores(); _filtrarTorres();
})();

const _opcionesDeConvenioBase154 = _opcionesDeConvenio;
_opcionesDeConvenio = function(){ const r = _opcionesDeConvenioBase154.apply(this, arguments); _rotularSectores(); return r; };

// Con el sector ya elegido, una torre que existe en dos sectores toma el elegido: no
// hace falta el aviso de «figura en dos zonas» ni volver a preguntar.
const _rellenarDesdeLaTorreBase154 = _rellenarDesdeLaTorre;
_rellenarDesdeLaTorre = function(t){
  const convSel = document.getElementById('convenio');
  const c = convSel ? convSel.value : '';
  const zonas = _zonasDeTorre(t);
  if (c && zonas.length > 1 && zonas.indexOf(c) >= 0) {
    _opcionesDeConvenio(null);
    convSel.value = c;
    _convenioPrevio = c;
    const avisoZ = document.getElementById('aviso-zona'); if (avisoZ) avisoZ.style.display = 'none';
    filtrarPorConvenio();
    const e = document.getElementById('empresa'); const emp = empresaDeTorre(c, t);
    if (e && emp) e.value = emp;
    return;
  }
  return _rellenarDesdeLaTorreBase154.apply(this, arguments);
};

// Cambiar de sector suelta la torre si no es de ese sector.
const _handleConvenioChangeBase154 = handleConvenioChange;
handleConvenioChange = function(sel){
  const r = _handleConvenioChangeBase154.apply(this, arguments);
  const c = document.getElementById('convenio').value;
  const torre = document.getElementById('torre');
  if (torre && torre.value && torre.value !== 'NO_REG' && c && _zonasDeTorre(torre.value).indexOf(c) < 0) {
    torre.value = ''; handleTorreChange();
    document.getElementById('convenio').value = c;
  }
  _filtrarTorres();
  return r;
};

const _loadDraftDataBase154 = loadDraftData;
loadDraftData = function(){ const r = _loadDraftDataBase154.apply(this, arguments); _rotularSectores(); _filtrarTorres(); return r; };
const _nuevoFormularioBase154 = nuevoFormulario;
nuevoFormulario = function(){ const r = _nuevoFormularioBase154.apply(this, arguments); _rotularSectores(); _filtrarTorres(); return r; };
