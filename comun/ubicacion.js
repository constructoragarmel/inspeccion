// ── ¿Dónde es? Una torre, varias, o toda una zona (PA-112, 30-sep-2026) ──
// Pedido de los inspectores de urbanismo, servicios y SHA (Skarlet Gómez, vía
// Stephanie): hay incidencias que pasan entre dos manzanas, entre dos torres o en
// todo un urbanismo, y hoy obligan a hacer tres o cuatro informes de lo mismo.
// Sigue siendo UN informe:
//  · «Varias»: la torre (o manzana) del desplegable es la PRINCIPAL —ahí se
//    archiva— y las demás quedan como «también afecta a»,
//    en el informe, en el PDF y en Smartsheet (columna «Ubicación»). El número
//    lleva cuántas más: SRV-EZ-T07+2-260930-HE, para no pisar el informe de la
//    T-07 sola del mismo día.
//  · «Toda la zona»: el lugar es ZONA y el relevo lo archiva en la carpeta
//    «General» de la zona; la zona se elige donde va el convenio (cada convenio es
//    una zona). Si también toca otras zonas, se agregan.
// Skarlet Gómez, 30-sep: «los tres urbanismos» son las tres zonas, y lo que está
// entre dos contratistas «se debería asignar a ambas»: en «Varias», empresa y
// residente llevan los de todas las torres (o manzanas), separados por « · ».
const _LUGAR = /manzana/i.test((document.querySelector('label[for="torre"]') || {}).textContent || '') ? 'manzana' : 'torre';
const _TXT_DONDE = _LUGAR === 'manzana'
  ? { una: 'Una manzana o lote', varias: 'Varias manzanas', otra: '＋ Agregar otra manzana o lote', plural: 'manzanas' }
  : { una: 'Una torre', varias: 'Varias torres', otra: '＋ Agregar otra torre', plural: 'torres' };
const _ZONA_NOMBRE = { 'Convenio Bielorrusos': 'Ezequiel Zamora', 'Convenio Rusos': 'Simón Rodríguez', 'Convenio Chinos': 'Simón Bolívar' };
let _modoDonde = 'una', _otras = [];
let _propios = { empresa: '', residente: '' };   // los de la principal, como los dejó la cascada
let _etiquetaConvenio = (document.querySelector('label[for="convenio"]') || {}).textContent || 'Convenio';
// ── Primero el sector (Diego Orta, 30-sep-2026) ──
// «Que la caída sea sector, torre y de ahí para abajo», con el nombre del sector y no
// el del convenio. Elegido el sector, la lista de torres queda solo con las suyas: la
// T-04, la T-07, la T-12 y la T-13 existen en dos sectores, y así ya no se mezclan
// (el 30-sep un informe de SHA de la T-13 sumó la empresa de la T-13 del otro sector).
// Urbanismo ya elegía primero el sector: allí no se toca.
const _SECTOR_PRIMERO = (typeof llenarManzanas !== 'function');
let _sectorElegido = '';
// En «Toda la zona» no hay torre que llene empresa y residente: el rótulo lo dice.
const _placeholders = { empresa: (document.getElementById('empresa') || {}).placeholder || '',
                        residente: (document.getElementById('residente') || {}).placeholder || '' };

(function(){
  const st = document.createElement('style');
  st.textContent =
    '.donde{display:flex;gap:6px;flex-wrap:wrap}' +
    '.donde button{flex:1 1 30%;min-height:44px;border:2px solid var(--azul);background:#fff;color:var(--azul);' +
    'border-radius:10px;font-weight:700;font-size:13px;padding:6px 8px;cursor:pointer}' +
    '.donde button.on{background:var(--azul);color:#fff}' +
    '.donde-ayuda{font-size:12px;color:#475569;margin-top:6px}' +
    '#otras-lista{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px}' +
    '.otra{display:inline-flex;align-items:center;gap:2px;background:var(--azul-cl);color:var(--azul);border-radius:16px;' +
    'padding:2px 2px 2px 12px;font-weight:700;font-size:13px}' +
    '.otra button{min-width:40px;min-height:40px;border:0;background:transparent;color:var(--azul);font-size:16px;cursor:pointer}' +
    '.otras-empresas{font-size:12px;color:#8f4b00;margin-top:6px}';
  document.head.appendChild(st);
  const torre = document.getElementById('torre');
  const rej = torre.closest('.rejilla') || torre.closest('.campo').parentElement;
  const caja = document.createElement('div');
  caja.className = 'campo'; caja.id = 'campo-donde'; caja.style.gridColumn = '1 / -1';
  caja.innerHTML = '<label>¿Dónde es?</label><div class="donde" role="radiogroup" aria-label="¿Dónde es?">' +
    [['una', _TXT_DONDE.una], ['varias', _TXT_DONDE.varias], ['zona', 'Toda la zona']].map(function(x){
      return '<button type="button" role="radio" data-m="' + x[0] + '">' + x[1] + '</button>'; }).join('') +
    '</div><div class="donde-ayuda" id="donde-ayuda"></div>';
  rej.insertBefore(caja, rej.firstChild);
  if (_SECTOR_PRIMERO) {
    const cc = document.getElementById('convenio').closest('.campo');
    torre.closest('.campo').before(cc);
    const lc = document.querySelector('label[for="convenio"]'); if (lc) lc.textContent = 'Sector';
    _etiquetaConvenio = 'Sector';
    _opcionesSector();
  }
  caja.querySelectorAll('button').forEach(function(b){ b.onclick = function(){ ponerModoDonde(b.dataset.m); }; });
  const otras = document.createElement('div');
  otras.className = 'campo'; otras.id = 'campo-otras'; otras.hidden = true; otras.style.gridColumn = '1 / -1';
  otras.innerHTML = '<label for="otra-lugar">También afecta a</label><div id="otras-lista"></div>' +
    '<select id="otra-lugar"></select><div class="otras-empresas" id="otras-empresas"></div>';
  torre.closest('.campo').after(otras);
  document.getElementById('otra-lugar').onchange = function(){
    const v = this.value; this.value = '';
    if (v && _otras.indexOf(v) < 0) { _otras.push(v); _alCambiarOtras(); }
  };
})();

function _asegurarOpcionZona(){
  const sel = document.getElementById('torre');
  if (![...sel.options].some(function(o){ return o.value === 'ZONA'; })) {
    const o = document.createElement('option'); o.value = 'ZONA'; o.textContent = '🌐 Toda la zona'; sel.appendChild(o);
  }
}
function _nombreZona(c){ return _ZONA_NOMBRE[c] || c || ''; }
function _entradasDelSector(t){
  const c = _sectorElegido || document.getElementById('convenio').value;
  const todas = entradasDe(t) || [];
  const del = todas.filter(function(x){ return x.c === c; });
  return (c && del.length) ? del : todas;
}
function _opcionesSector(){
  if (!_SECTOR_PRIMERO) return;
  const conv = document.getElementById('convenio');
  const v = _sectorElegido || conv.value;
  // QC de UX del 7-oct-2026: el mismo orden que en el formulario de obra (Simón Bolívar, Simón Rodríguez, Ezequiel Zamora).
  const ordenSectores = ['Convenio Chinos', 'Convenio Rusos', 'Convenio Bielorrusos'];
  const claves = Object.keys(SECTOR_POR_CONVENIO).sort(function(a, b){ const i = ordenSectores.indexOf(a), j = ordenSectores.indexOf(b); return (i < 0 ? 99 : i) - (j < 0 ? 99 : j); });
  conv.innerHTML = '<option value="">— Seleccione sector —</option>' + claves.map(function(c){
    return '<option value="' + escapar(c) + '">' + escapar(_nombreZona(c)) + '</option>'; }).join('');
  if (v && SECTOR_POR_CONVENIO[v]) conv.value = v;
}
function _torresDelSector(){
  if (!_SECTOR_PRIMERO) return;
  const sel = document.getElementById('torre');
  [...sel.options].forEach(function(o){
    if (!o.value) { o.textContent = _sectorElegido ? '— Seleccione torre —' : '— Elija primero el sector —'; return; }
    if (o.value === 'ZONA') return;
    const ok = !_sectorElegido || (entradasDe(o.value) || []).some(function(x){ return x.c === _sectorElegido; });
    o.hidden = !ok; o.disabled = !ok;
  });
}
function _unicos(l){ const r = []; l.forEach(function(x){ x = String(x || '').trim(); if (x && r.indexOf(x) < 0) r.push(x); }); return r; }
function _empresasDeTodas(){
  return _unicos([_propios.empresa].concat([].concat.apply([], _otras.map(function(t){ return _entradasDelSector(t).map(function(x){ return x.e; }); }))));
}
// Empresa y residente de «Varias»: los de la principal más los de las demás.
function _asignarATodas(){
  if (_modoDonde !== 'varias') return;
  const res = _unicos([_propios.residente].concat([].concat.apply([], _otras.map(function(t){ return _entradasDelSector(t).map(function(x){ return x.r; }); }))));
  document.getElementById('empresa').value = _empresasDeTodas().join(' · ');
  document.getElementById('residente').value = res.join(' · ');
}
function _recordarPropios(){
  _propios = { empresa: document.getElementById('empresa').value, residente: document.getElementById('residente').value };
}
function _alCambiarOtras(){ _asignarATodas(); _pintarDonde(); actualizarNro(); marcar(); }
function quitarOtra(i){ _otras.splice(i, 1); _alCambiarOtras(); }

function _pintarDonde(){
  document.querySelectorAll('#campo-donde .donde button').forEach(function(b){
    const on = b.dataset.m === _modoDonde; b.classList.toggle('on', on); b.setAttribute('aria-checked', on ? 'true' : 'false');
  });
  const principal = document.getElementById('torre').value;
  const conv = document.getElementById('convenio').value;
  document.getElementById('torre').closest('.campo').hidden = (_modoDonde === 'zona');
  const lab = document.querySelector('label[for="convenio"]');
  if (lab) lab.textContent = (_modoDonde === 'zona' && _LUGAR === 'torre') ? 'Zona' : _etiquetaConvenio;
  ['empresa', 'residente'].forEach(function(id){
    const e = document.getElementById(id);
    if (e && _placeholders[id]) e.placeholder = (_modoDonde === 'zona' && _LUGAR === 'torre') ? 'Si aplica, escríbalo aquí' : _placeholders[id];
  });
  document.getElementById('donde-ayuda').textContent =
    _modoDonde === 'varias' ? 'Elija abajo la ' + (_LUGAR === 'manzana' ? 'manzana principal' : 'torre principal') +
                              ' (ahí se archiva el informe) y agregue las demás.'
  : _modoDonde === 'zona'   ? 'Para lo que no es de una ' + _LUGAR + ' sino de toda la zona. Se archiva en la carpeta «General» de la zona.'
  : '';
  const campo = document.getElementById('campo-otras');
  campo.hidden = (_modoDonde === 'una');
  if (campo.hidden) return;
  const zona = _modoDonde === 'zona';
  document.getElementById('otras-lista').innerHTML = _otras.map(function(x, i){
    return '<span class="otra">' + escapar(x) + '<button type="button" aria-label="Quitar ' + escapar(x) + '" onclick="quitarOtra(' + i + ')">✕</button></span>';
  }).join('');
  const candidatos = zona
    ? Object.keys(SECTOR_POR_CONVENIO).map(_nombreZona).filter(function(z){ return z !== _nombreZona(conv); })
    : torresUnicas().filter(function(t){ return t !== principal && (!_sectorElegido || (entradasDe(t) || []).some(function(x){ return x.c === _sectorElegido; })); });
  const sel = document.getElementById('otra-lugar');
  sel.innerHTML = '<option value="">' + (zona ? '＋ Agregar otra zona' : _TXT_DONDE.otra) + '</option>' +
    candidatos.filter(function(x){ return _otras.indexOf(x) < 0; })
              .map(function(x){ return '<option value="' + escapar(x) + '">' + escapar(x) + '</option>'; }).join('');
  // Lo que está entre dos contratistas se asigna a las dos (Skarlet, 30-sep).
  let emp = '';
  if (!zona && _otras.length) {
    const n = _empresasDeTodas().length;
    if (n > 1) emp = 'Se asigna a las ' + n + ' empresas de estas ' + _TXT_DONDE.plural + '.';
  }
  document.getElementById('otras-empresas').textContent = emp;
}

function ponerModoDonde(m){
  if (m === _modoDonde) return;
  const antes = _modoDonde;
  _modoDonde = m;
  const torre = document.getElementById('torre');
  if (m === 'zona') {
    _otras = [];
    _asegurarOpcionZona(); torre.value = 'ZONA'; alElegirTorre();
  } else {
    if (m === 'una' || antes === 'zona') _otras = [];
    if (antes === 'zona') { torre.value = ''; alElegirTorre(); }
    if (antes === 'varias' && m === 'una') {
      document.getElementById('empresa').value = _propios.empresa; document.getElementById('residente').value = _propios.residente;
    }
    if (m === 'varias' && antes === 'una') _recordarPropios();
  }
  _pintarDonde(); actualizarNro(); marcar();
}

function _textoUbicacion(){
  const t = document.getElementById('torre').value;
  if (_modoDonde === 'zona') return 'Toda la zona ' + _nombreZona(document.getElementById('convenio').value) + (_otras.length ? ' · ' + _otras.join(' · ') : '');
  if (_modoDonde === 'varias') return [t].concat(_otras).filter(Boolean).join(' · ');
  return '';
}

// La zona se elige donde va el convenio: los tres convenios son las tres zonas.
function _zonaElegida(){
  if ('ZONA' !== _torreAnterior && !_cargando && soloHeredado()) soltarHeredado();
  _torreAnterior = 'ZONA';
  const conv = document.getElementById('convenio');
  if (_LUGAR === 'torre') {
    const v = conv.value;
    conv.innerHTML = '<option value="">— Seleccione zona —</option>' + Object.keys(SECTOR_POR_CONVENIO).map(function(c){
      return '<option value="' + escapar(c) + '">' + escapar(_nombreZona(c)) + '</option>'; }).join('');
    if (v && SECTOR_POR_CONVENIO[v]) conv.value = v;
    if (!_cargando) { document.getElementById('empresa').value = ''; document.getElementById('residente').value = ''; }
  } else if (typeof EMPRESA_POR_SECTOR !== 'undefined' && !_cargando) {
    document.getElementById('empresa').value = EMPRESA_POR_SECTOR[conv.value] || '';
    document.getElementById('residente').value = '';
  }
  document.getElementById('aviso-torre').innerHTML = '';
  actualizarNro(); marcar();
  ofrecerHistorial();
  pedirHistorialAlRelevo();
}

const _alElegirTorreBaseU = alElegirTorre;
alElegirTorre = function(){
  const t = document.getElementById('torre').value;
  if (t === 'ZONA') { _modoDonde = 'zona'; _pintarDonde(); return _zonaElegida(); }
  if (_modoDonde === 'zona') { _modoDonde = 'una'; _otras = []; }
  const r = _alElegirTorreBaseU.apply(this, arguments);
  if (_SECTOR_PRIMERO) {
    // El motor rehace el desplegable con los convenios de la torre: se devuelven los tres sectores.
    const conv = document.getElementById('convenio');
    const filas = entradasDe(t) || [];
    if (t && _sectorElegido && filas.some(function(x){ return x.c === _sectorElegido; })) {
      _opcionesSector(); conv.value = _sectorElegido;
      const f = filas.find(function(x){ return x.c === _sectorElegido; });
      if (!_cargando) { document.getElementById('empresa').value = f.e || ''; document.getElementById('residente').value = f.r || ''; }
      document.getElementById('aviso-torre').innerHTML = '';
      actualizarNro(); pedirHistorialAlRelevo();
    } else {
      const v = conv.value;
      _opcionesSector();
      if (v) { conv.value = v; _sectorElegido = v; }
    }
    _torresDelSector();
  }
  if (_otras.indexOf(t) >= 0) _otras.splice(_otras.indexOf(t), 1);   // la principal no es «también»
  if (!_cargando) { _recordarPropios(); _asignarATodas(); }
  _pintarDonde();
  return r;
};

const _alElegirConvenioBaseU = alElegirConvenio;
alElegirConvenio = function(){
  if (_modoDonde !== 'zona') {
    if (_SECTOR_PRIMERO) {
      _sectorElegido = document.getElementById('convenio').value;
      const torre = document.getElementById('torre');
      if (torre.value && !(entradasDe(torre.value) || []).some(function(x){ return x.c === _sectorElegido; })) {
        torre.value = ''; alElegirTorre();
        document.getElementById('convenio').value = _sectorElegido;
      }
      _otras = _otras.filter(function(t){ return (entradasDe(t) || []).some(function(x){ return x.c === _sectorElegido; }); });
      _torresDelSector();
    }
    const r = _alElegirConvenioBaseU.apply(this, arguments);
    if (!_cargando) { _recordarPropios(); _asignarATodas(); }
    _pintarDonde(); return r;
  }
  const c = document.getElementById('convenio').value;
  if (_SECTOR_PRIMERO) _sectorElegido = c;
  if (typeof llenarManzanas === 'function') llenarManzanas(c);
  _asegurarOpcionZona(); document.getElementById('torre').value = 'ZONA';
  if (typeof EMPRESA_POR_SECTOR !== 'undefined' && !_cargando) document.getElementById('empresa').value = EMPRESA_POR_SECTOR[c] || '';
  const nombre = _nombreZona(c);
  if (_otras.indexOf(nombre) >= 0) _otras.splice(_otras.indexOf(nombre), 1);
  _pintarDonde(); actualizarNro(); marcar();
  pedirHistorialAlRelevo();
};

// En urbanismo el desplegable de manzanas se rehace al elegir sector: la opción
// ZONA se repone y, si estaba elegida, se conserva.
if (typeof llenarManzanas === 'function') {
  const _llenarManzanasBaseU = llenarManzanas;
  llenarManzanas = function(){
    const eraZona = document.getElementById('torre').value === 'ZONA';
    const r = _llenarManzanasBaseU.apply(this, arguments);
    if (eraZona || _modoDonde === 'zona') { _asegurarOpcionZona(); document.getElementById('torre').value = 'ZONA'; }
    return r;
  };
}

const _actualizarNroBaseU = actualizarNro;
actualizarNro = function(){
  const r = _actualizarNroBaseU.apply(this, arguments);
  if (_modoDonde === 'varias' && _otras.length) {
    const el = document.getElementById('nro');
    const t = limpiar(document.getElementById('torre').value);
    if (t) el.textContent = el.textContent.replace('-' + t + '-', '-' + t + '+' + _otras.length + '-');
  }
  return r;
};

const _datosDelFormularioBaseU = datosDelFormulario;
datosDelFormulario = function(){
  const d = _datosDelFormularioBaseU.apply(this, arguments);
  if (_modoDonde !== 'una') d.ubicacion = { modo: _modoDonde, otras: _otras.slice(), texto: _textoUbicacion() };
  return d;
};

const _faltanBaseU = faltan;
// Cada informe se revisa con SU ubicación, no con la de la pantalla: «Enviar» pasa
// por aquí con todos los borradores pendientes (QC del 30-sep-2026).
faltan = function(d){
  let f = _faltanBaseU.apply(this, arguments);
  const u = (d && d.ubicacion) || {};
  const modo = (d && d.torre === 'ZONA') ? 'zona' : (u.modo || 'una');
  if (modo === 'zona') f = f.map(function(x){ return /convenio|sector/.test(x) ? 'la zona' : x; });
  else if (_SECTOR_PRIMERO) f = f.map(function(x){ return x === 'el convenio' ? 'el sector' : x; });
  if (modo === 'varias' && !(u.otras || []).length) f.push('las otras ' + _TXT_DONDE.plural + ' (o elija «' + _TXT_DONDE.una + '»)');
  return f;
};

const _vaciarFormularioBaseU = vaciarFormulario;
vaciarFormulario = function(){
  _modoDonde = 'una'; _otras = [];
  const r = _vaciarFormularioBaseU.apply(this, arguments);
  _pintarDonde();
  return r;
};

const _cargarInformeBaseU = cargarInforme;
cargarInforme = function(id){
  const d = listaGuardada().find(function(x){ return x.id === id; });
  if (d && d.torre === 'ZONA') _asegurarOpcionZona();
  if (d && _SECTOR_PRIMERO && d.convenio) _sectorElegido = d.convenio;
  const r = _cargarInformeBaseU.apply(this, arguments);
  if (d && idActual === d.id) {
    const u = d.ubicacion || {};
    _modoDonde = d.torre === 'ZONA' ? 'zona' : (u.modo === 'varias' ? 'varias' : 'una');
    _otras = (u.otras || []).slice();
    const e0 = String(d.empresa || '').split(' · ')[0], r0 = String(d.residente || '').split(' · ')[0];
    _propios = { empresa: e0, residente: r0 };
    _pintarDonde(); actualizarNro();
  }
  return r;
};

// ── Un informe de varias torres también es la visita anterior de las demás (v116, 2-oct-2026) ──
// Se archiva una sola vez, en la principal, y hasta ahora solo la principal lo recordaba: al volver solo a la
// T-14, el formulario no ofrecía los hallazgos del informe hecho para la T-15, la T-14 y la T-13. Ahora la memoria
// del teléfono lo anota en cada una (y el relevo hace lo mismo para los demás teléfonos: VariasTorres.gs). Un
// informe propio de la torre, más nuevo, sigue mandando: la regla de fechas es la de siempre.
const _anotarEstadoTorreBaseU = anotarEstadoTorre;
anotarEstadoTorre = function(d){
  _anotarEstadoTorreBaseU.apply(this, arguments);
  const u = d && d.ubicacion;
  if (!u || u.modo !== 'varias') return;
  (u.otras || []).forEach(function(o){
    if (o && o !== d.torre) _anotarEstadoTorreBaseU(Object.assign({}, d, { torre: o }));
  });
};

_pintarDonde();
_torresDelSector();
