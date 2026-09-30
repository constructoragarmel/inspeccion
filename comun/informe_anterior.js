// ── 151. El informe anterior (29-sep-2026) ─────────────────────────────────
// Para que el inspector no cuente otra vez lo que ya contó. Al elegir torre,
// piso y apartamento (o torre, en un informe de torre), si todavía no hay nada
// medido, el formulario busca el último informe de la lista v2 de ese mismo
// apartamento —primero en este teléfono, después en el archivo (relevo r27)— y
// ofrece traer sus mediciones: se corrige solo lo que cambió. La evaluación
// B/R/M, las fotos y las observaciones NO se traen: son de cada visita.
// Si ese apartamento no tiene informe, ofrece las cantidades «hay» del último
// apartamento de la torre: los apartamentos se repiten, y así solo se cuentan
// las puestas. Nada se trae sin que el inspector lo pida.
let _anteriorOfrecido = '';
let _temporizadorAnterior = null;

function _hayMediciones(){
  return Array.prototype.some.call(
    document.querySelectorAll('input[id^="pr_"], input[id^="ej_"], input[id^="pm_"], input[id^="sn_"]'),
    function(e){ return String(e.value || '').trim() !== ''; });
}

function _aptoActual(){
  return String((document.getElementById('apto') || {}).value || '').trim().toUpperCase();
}

function _claveAnterior(){
  return [getTorreActual(), ambito,
          ambito === 'torre' ? '' : (document.getElementById('piso') || {}).value || '',
          ambito === 'torre' ? '' : _aptoActual()].join('|');
}

// El bloque de piso y apartamento del número de informe: «P03AA».
function _bloqueActual(){
  if (ambito === 'torre') return null;
  const piso = _digitosFinales(document.getElementById('piso')?.value, 2);
  const avRaw = _limpiar(document.getElementById('apto')?.value);
  if (!piso || !avRaw) return null;
  return 'P' + piso + 'A' + (/^\d+$/.test(avRaw) ? avRaw.padStart(2, '0') : avRaw);
}

function _fechaDe(b){ return String(b.fecha || '') + '|' + String(b.timestamp || ''); }

function _anterioresLocales(){
  const t = getTorreActual(), piso = (document.getElementById('piso') || {}).value || '', apto = _aptoActual();
  return getSavedReports().filter(function(b){
    return b && b.lista === VERSION_LISTA && b.id !== _idEnEdicion && b.torre === t &&
           (b.ambito || 'apartamento') === ambito && _tieneContenido(b);
  }).map(function(b){
    return { b: b, mismo: ambito === 'torre' ? true :
                          (b.piso === piso && String(b.apto || '').trim().toUpperCase() === apto) };
  }).sort(function(x, y){ return _fechaDe(y.b) < _fechaDe(x.b) ? -1 : 1; });
}

async function _anteriorDelArchivo(){
  const clave = localStorage.getItem('garmel_clave_envio') || '';
  if (!clave || !navigator.onLine) return null;
  const corte = new AbortController();
  const reloj = setTimeout(function(){ corte.abort(); }, 9000);
  try {
    const r = await fetch(RELEVO_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ clave: clave, accion: 'historial', tipo: 'obra', sector: getSectorActual(),
                             torre: getTorreActual(), bloque: _bloqueActual(), prueba: !!TEST_MODE }),
      signal: corte.signal });
    const j = await r.json();
    return (j && j.ok) ? j : null;
  } catch (e) { return null; } finally { clearTimeout(reloj); }
}

function _programarAnterior(){
  // Un aviso que ya no corresponde (cambió la torre, el piso o el apartamento) se
  // quita en el acto: tocarlo traería las mediciones de OTRO apartamento.
  const caja = document.getElementById('aviso-anterior');
  if (caja && caja.dataset.clave && caja.dataset.clave !== _claveAnterior()) { caja.innerHTML = ''; caja.dataset.clave = ''; }
  clearTimeout(_temporizadorAnterior);
  _temporizadorAnterior = setTimeout(_ofrecerAnterior, 700);
}

async function _ofrecerAnterior(){
  const caja = document.getElementById('aviso-anterior');
  if (!caja) return;
  if (_abiertoParaEditar || formType !== 'detallado') return;
  const t = getTorreActual();
  if (!t || t === '—') return;
  // Sin zona (la torre existe en dos zonas y no se eligió el convenio) el archivo no sabe dónde buscar.
  if (getSectorActual() === 'XX') return;
  if (ambito !== 'torre' && (!(document.getElementById('piso') || {}).value || !_aptoActual())) return;
  const clave = _claveAnterior();
  if (clave === _anteriorOfrecido) return;
  if (_hayMediciones()) return;
  _anteriorOfrecido = clave;
  caja.innerHTML = '';

  const locales = _anterioresLocales();
  let mismo = (locales.find(function(x){ return x.mismo; }) || {}).b || null;
  let deLaTorre = ambito === 'torre' ? null : ((locales.find(function(x){ return !x.mismo; }) || {}).b || null);
  let origen = 'guardado en este teléfono';
  if (!mismo) {
    const r = await _anteriorDelArchivo();
    if (clave !== _claveAnterior() || _hayMediciones()) return;   // cambió mientras se buscaba
    if (r && r.mismo) { mismo = r.mismo; origen = 'del archivo'; }
    if (!deLaTorre && r && r.deLaTorre) deLaTorre = r.deLaTorre;
  }
  if (mismo) {
    const quien = ambito === 'torre' ? 'Esta torre' : 'Este apartamento';
    _pintarAvisoAnterior(caja, quien + ' ya tiene un informe (' + (mismo.fecha || 'sin fecha') + ', ' + origen + ').',
      '¿Traer sus mediciones? Así solo corrige lo que cambió. La evaluación B/R/M, las fotos y las observaciones se hacen de nuevo.',
      'Traer mediciones', function(){ _traerMediciones(mismo.partidas, false); });
  } else if (deLaTorre && ambito !== 'torre') {
    const cual = [deLaTorre.piso, deLaTorre.apto ? 'apto ' + deLaTorre.apto : ''].filter(Boolean).join(' · ');
    _pintarAvisoAnterior(caja, '¿Usar las cantidades «hay» de otro apartamento de esta torre?',
      'Del ' + (cual || 'último informe') + ' (' + (deLaTorre.fecha || 'sin fecha') + '). Los apartamentos se repiten: ' +
      'así solo cuenta las puestas. Revise las que no coincidan.',
      'Usar las cantidades', function(){ _traerMediciones(deLaTorre.partidas, true); });
  }
}

function _pintarAvisoAnterior(caja, titulo, texto, boton, alAceptar){
  caja.dataset.clave = _claveAnterior();
  caja.innerHTML =
    '<div class="aviso-anterior"><div class="t"></div><div class="s"></div>' +
    '<div class="b"><button type="button" class="si"></button><button type="button" class="no">No, empezar vacío</button></div></div>';
  caja.querySelector('.t').textContent = titulo;
  caja.querySelector('.s').textContent = texto;
  const si = caja.querySelector('.si');
  si.textContent = boton;
  si.onclick = function(){
    // Última defensa: si entre medio cambió el apartamento o se midió algo, no se trae.
    if (caja.dataset.clave !== _claveAnterior() || _hayMediciones()) { caja.innerHTML = ''; return; }
    caja.innerHTML = ''; alAceptar();
  };
  caja.querySelector('.no').onclick = function(){ caja.innerHTML = ''; };
}

// Vuelca las mediciones de otro informe de la lista v2. soloHay: solo la
// cantidad «hay» de las filas que se cuentan.
function _traerMediciones(partidas, soloHay){
  let n = 0;
  Object.keys(partidas || {}).forEach(function(pid){
    if (pid.slice(-6) === '_extra') return;
    const arr = partidas[pid];
    if (!Array.isArray(arr)) return;
    arr.forEach(function(item, i){
      if (!item || item.fueraDeAmbito || !_aplica(pid, i)) return;
      const rid = pid + '_' + i;
      const pr = document.getElementById('pr_' + rid), ej = document.getElementById('ej_' + rid);
      if (!pr && !ej) return;
      if (soloHay) {
        if (!_esConteo(pid, i) || !String(item.pr || '').trim()) return;
        pr.value = item.pr; recalcRow(pr); n++;
        return;
      }
      const hay = ['pr', 'ej', 'sn', 'pct'].some(function(k){ return String(item[k] || '').trim() !== ''; });
      if (!hay) return;
      const ud = document.getElementById('ud_' + pid + '_' + i);
      if (ud && item.ud) { ud.value = item.ud; if (typeof _unidadElegida === 'function') _unidadElegida(ud); }
      if (pr && item.pr !== undefined) pr.value = item.pr;
      if (ej && item.ej !== undefined) ej.value = item.ej;
      const sn = document.getElementById('sn_' + rid); if (sn && item.sn !== undefined) sn.value = item.sn;
      const pm = document.getElementById('pm_' + rid); if (pm && item.pct !== undefined) pm.value = item.pct;
      recalcRow(pr || ej); n++;
    });
  });
  if (typeof _uso !== 'undefined') _uso.anterior = soloHay ? 'hay' : 'mediciones';
  if (typeof _marcarCambio === 'function') _marcarCambio();
  showToast(soloHay ? '📋 ' + n + ' cantidades «hay» copiadas. Cuente las puestas.'
                    : '📋 ' + n + ' mediciones traídas. Corrija lo que cambió y evalúe de nuevo.', 'ok');
}

document.addEventListener('change', function(e){
  if (e.target && /^(torre|piso|convenio)$/.test(e.target.id)) _programarAnterior();
}, true);
document.addEventListener('input', function(e){
  if (e.target && e.target.id === 'apto') _programarAnterior();
}, true);
