// ── 172. Copiar de otro apartamento o de otra torre (7-oct-2026) ─────────────
// Pedido de la coordinación de inspección (6 y 7-oct): cuando los apartamentos
// o las torres van iguales, arrancar desde las mediciones de uno parecido en
// vez de desde cero. Reglas:
//   1. El inspector elige de dónde copiar; nada se copia solo.
//   2. Cada fila copiada queda marcada «≈ Copiado de …» hasta que la confirme
//      en sitio («Confirmado en sitio») o la corrija. Lo hace el mismo mecanismo
//      de la visita anterior (robustez.js §9); aquí cambia el rótulo y la regla.
//   3. NO se puede enviar con filas copiadas sin confirmar (la visita anterior
//      solo avisa; esto bloquea, porque sería afirmar lo que no se miró).
//   4. El informe lleva `copiadoDe` {nro, torre, piso, apto, fecha} y cada fila
//      copiada `copiadoDe: nro`; el PDF lo dice en la identificación y
//      Smartsheet en «Trajo informe anterior» (relevo r49).
//   Fotos, B/R/M y observaciones nunca se copian.
// Fuentes: informes de la lista v2 de los últimos 14 días, del mismo ámbito, de
// esta torre y de las torres de la misma contratista en el mismo sector; los de
// este teléfono y los del archivo (relevo r49: `copiar-fuentes`, `copiar-abrir`).
let _copiaDe = null;            // de qué informe se copió este
let _copiaOrigenActivo = null;  // mientras se vuelcan las filas, para rotularlas
let _copiarTemporizador = null;

function _copiarClaveTexto(s){ return String(s || '').toLowerCase().replace(/[^a-z]/g, '').replace(/rr/g, 'r'); }

// Esta torre primero, y después las de la misma empresa en el mismo sector.
function _copiarTorresCandidatas(){
  const t = getTorreActual(), conv = (document.getElementById('convenio') || {}).value || '';
  const emp = _copiarClaveTexto(empresaDeTorre(conv, t));
  const out = [t];
  if (!emp) return out;
  TORRES.forEach(function(x){
    if (x.t === t || out.indexOf(x.t) >= 0) return;
    if (_copiarClaveTexto(x.c) !== _copiarClaveTexto(conv)) return;
    if (_copiarClaveTexto(x.e) === emp) out.push(x.t);
  });
  return out;
}

// Todas las torres del mismo sector (convenio), para la búsqueda ampliada (Diego, 7-oct: «en Ezequiel Zamora son
// todas prácticamente la misma»). Se pide aparte porque recorre muchas carpetas del archivo.
function _copiarTorresDelSector(){
  const conv = (document.getElementById('convenio') || {}).value || '', out = [];
  TORRES.forEach(function(x){ if (_copiarClaveTexto(x.c) === _copiarClaveTexto(conv) && out.indexOf(x.t) < 0) out.push(x.t); });
  return out;
}

// Al archivo se le piden las torres de seis en seis, en paralelo: una sola consulta con 33 torres tardaría más de lo que
// espera el teléfono.
async function _copiarPedirFuentes(torres){
  const grupos = [];
  for (let i = 0; i < torres.length; i += 6) grupos.push(torres.slice(i, i + 6));
  const rs = await Promise.all(grupos.map(function(g){
    return _copiarPedir({ accion: 'copiar-fuentes', torres: g, ambito: ambito, vista: (typeof vista !== 'undefined') ? (vista || '') : '', dias: 14 });
  }));
  const fuentes = []; let error = '';
  rs.forEach(function(r){ if (r.ok) (r.fuentes || []).forEach(function(f){ fuentes.push(f); }); else if (!error) error = r.error; });
  return { ok: !error || fuentes.length > 0, error: error, fuentes: fuentes };
}

function _copiarFilasMedidas(partidas){
  let n = 0;
  Object.keys(partidas || {}).forEach(function(pid){
    if (pid.slice(-6) === '_extra') return;
    const a = partidas[pid]; if (!Array.isArray(a)) return;
    a.forEach(function(it){
      if (it && !it.fueraDeAmbito && ['pr', 'ej', 'sn', 'pct'].some(function(k){ return String(it[k] || '').trim() !== ''; })) n++;
    });
  });
  return n;
}

function _copiarEtiqueta(f){
  const partes = [f.torre];
  if ((f.piso || f.apto)) partes.push([f.piso, f.apto ? 'apto ' + f.apto : ''].filter(Boolean).join(' '));
  else partes.push('torre');
  return partes.join(' · ');
}

function _copiarFuentesLocales(torres){
  const idAct = (typeof _idEnEdicion !== 'undefined') ? _idEnEdicion : null;
  const v = (typeof vista !== 'undefined') ? (vista || '') : '';
  return getSavedReports().filter(function(b){
    return b && b.lista === VERSION_LISTA && b.id !== idAct && torres.indexOf(b.torre) >= 0 &&
           (b.ambito || 'apartamento') === ambito && (b.vista || '') === v && _copiarFilasMedidas(b.partidas) > 0;
  }).map(function(b){
    return { nro: b.nro || '', torre: b.torre, piso: b.piso || '', apto: b.apto || '', fecha: b.fecha || '',
             filas: _copiarFilasMedidas(b.partidas), partidas: b.partidas, origen: 'este teléfono' };
  });
}

async function _copiarPedir(cuerpo){
  const clave = localStorage.getItem('garmel_clave_envio') || '';
  if (!clave) return { ok: false, error: 'Este teléfono no tiene la clave: solo se ven los informes guardados aquí.' };
  if (!navigator.onLine) return { ok: false, error: 'Sin señal: solo se ven los informes guardados en este teléfono.' };
  const corte = new AbortController();
  const reloj = setTimeout(function(){ corte.abort(); }, 12000);
  try {
    const r = await fetch(RELEVO_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(Object.assign({ clave: clave, sector: getSectorActual(), prueba: !!TEST_MODE }, cuerpo)), signal: corte.signal });
    const j = await r.json();
    return j && j.ok ? j : { ok: false, error: (j && j.error) || 'El relevo no respondió.' };
  } catch (e) { return { ok: false, error: 'No hay conexión con la oficina (relevo): solo se ven los informes guardados en este teléfono.' }; }
  finally { clearTimeout(reloj); }
}

function _copiarPuede(){
  if (typeof _abiertoParaEditar !== 'undefined' && _abiertoParaEditar) return false;
  if (formType !== 'detallado') return false;
  const t = getTorreActual();
  if (!t || t === '—' || getSectorActual() === 'XX') return false;
  if (ambito !== 'torre' && (!(document.getElementById('piso') || {}).value || !_aptoActual())) return false;
  if (_hayMediciones() || _copiaDe) return false;
  return true;
}

function _copiarProgramar(){
  clearTimeout(_copiarTemporizador);
  _copiarTemporizador = setTimeout(_copiarPintarBoton, 750);
}

function _copiarPintarBoton(){
  const caja = document.getElementById('copiar-de');
  if (!caja) return;
  if (!_copiarPuede()) { caja.innerHTML = ''; return; }
  if (caja.querySelector('.copiar-panel')) return;   // ya está abierto el panel
  caja.innerHTML = '<div class="copiar-boton"><button type="button" id="btn-copiar-de">📋 Copiar de otro ' +
    (ambito === 'torre' ? 'informe de torre' : 'apartamento') + '…</button></div>';
  caja.querySelector('button').onclick = _copiarAbrirPanel;
}

async function _copiarAbrirPanel(){
  const caja = document.getElementById('copiar-de');
  if (!caja || !_copiarPuede()) return;
  const torres = _copiarTorresCandidatas();
  const t = torres[0];
  caja.innerHTML = '<div class="copiar-panel"><div class="t">Copiar las mediciones de otro ' + (ambito === 'torre' ? 'informe de torre' : 'apartamento') + '</div>' +
    '<div class="s">Se traen las cantidades y los estados, marcados hasta que usted los confirme en sitio o los corrija. ' +
    'Fotos, evaluación y observaciones no se copian. No se puede enviar con filas copiadas sin confirmar.</div>' +
    '<div class="lista"><p class="s">⏳ Buscando informes de los últimos 14 días…</p></div>' +
    '<button type="button" class="cerrar">Cerrar</button></div>';
  caja.querySelector('.cerrar').onclick = function(){ caja.innerHTML = ''; _copiarPintarBoton(); };

  const locales = _copiarFuentesLocales(torres);
  const r = await _copiarPedirFuentes(torres);
  if (!caja.querySelector('.copiar-panel')) return;   // se cerró mientras buscaba
  const fuentes = _copiarJuntar(locales, r.fuentes);

  const lista = caja.querySelector('.lista');
  lista.innerHTML = '';
  if (!r.ok) { const p = document.createElement('p'); p.className = 's'; p.textContent = '⚠️ ' + r.error; lista.appendChild(p); }
  if (!fuentes.length) {
    const p = document.createElement('p'); p.className = 's';
    p.textContent = 'No hay informes de ' + (ambito === 'torre' ? 'torre' : 'apartamento') + ' de los últimos 14 días en ' +
      (torres.length > 1 ? torres.join(', ') : t) + '.';
    lista.appendChild(p);
  }
  _copiarPintarGrupo(lista, 'De esta torre (' + t + ')', fuentes.filter(function(f){ return f.torre === t; }));
  _copiarPintarGrupo(lista, 'De torres de la misma contratista (' + torres.slice(1).join(', ') + ')', fuentes.filter(function(f){ return f.torre !== t; }));

  // Las demás torres del sector, solo si se piden: son muchas carpetas.
  const resto = _copiarTorresDelSector().filter(function(x){ return torres.indexOf(x) < 0; });
  if (resto.length) {
    const bs = document.createElement('button'); bs.type = 'button'; bs.className = 'sector';
    bs.textContent = 'Buscar también en las demás torres del sector (' + resto.length + ')';
    bs.onclick = async function(){
      bs.disabled = true; bs.textContent = '⏳ Buscando en ' + resto.length + ' torres…';
      const loc2 = _copiarFuentesLocales(resto);
      const r2 = await _copiarPedirFuentes(resto);
      if (!caja.querySelector('.copiar-panel')) return;
      const f2 = _copiarJuntar(loc2, r2.fuentes);
      bs.remove();
      if (!r2.ok) { const p = document.createElement('p'); p.className = 's'; p.textContent = '⚠️ ' + r2.error; lista.appendChild(p); }
      if (!f2.length) { const p = document.createElement('p'); p.className = 's'; p.textContent = 'En las demás torres del sector no hay informes de ' + (ambito === 'torre' ? 'torre' : 'apartamento') + ' de los últimos 14 días.'; lista.appendChild(p); return; }
      _copiarPintarGrupo(lista, 'De otras torres del sector', f2);
    };
    lista.appendChild(bs);
  }
}

function _copiarJuntar(locales, delArchivo){
  const vistos = {}; const fuentes = [];
  (locales || []).forEach(function(f){ vistos[f.nro] = true; fuentes.push(f); });
  (delArchivo || []).forEach(function(f){ if (!vistos[f.nro]) { f.origen = 'archivo'; vistos[f.nro] = true; fuentes.push(f); } });
  fuentes.sort(function(a, b){ return a.fecha < b.fecha ? 1 : (a.fecha > b.fecha ? -1 : 0); });
  return fuentes;
}

function _copiarPintarGrupo(lista, titulo, fuentes){
  if (!fuentes.length) return;
  const h = document.createElement('div'); h.className = 'g'; h.textContent = titulo; lista.appendChild(h);
  fuentes.forEach(function(f){
    const fila = document.createElement('div'); fila.className = 'f';
    const d = document.createElement('div'); d.className = 'd';
    d.textContent = _copiarEtiqueta(f);
    const s = document.createElement('small'); s.textContent = (f.fecha || 'sin fecha') + ' · ' + f.filas + ' filas medidas · ' + (f.origen || 'archivo'); d.appendChild(s);
    const b = document.createElement('button'); b.type = 'button'; b.textContent = 'Copiar';
    b.onclick = function(){ _copiarElegir(f, b); };
    fila.appendChild(d); fila.appendChild(b); lista.appendChild(fila);
  });
}

async function _copiarElegir(f, boton){
  const caja = document.getElementById('copiar-de');
  if (!_copiarPuede()) { if (caja) caja.innerHTML = ''; return; }
  let partidas = f.partidas;
  if (!partidas) {
    if (boton) { boton.disabled = true; boton.textContent = '⏳'; }
    const r = await _copiarPedir({ accion: 'copiar-abrir', torre: f.torre, numero: f.nro });
    if (!r.ok) { showToast('⚠️ ' + r.error, 'err'); if (boton) { boton.disabled = false; boton.textContent = 'Copiar'; } return; }
    partidas = r.partidas || {};
  }
  if (!_copiarPuede()) { if (caja) caja.innerHTML = ''; return; }
  _copiarAplicar(f, partidas);
}

function _copiarAplicar(f, partidas){
  const caja = document.getElementById('copiar-de');
  _copiaOrigenActivo = f;
  try { _traerMediciones(partidas, false); } finally { _copiaOrigenActivo = null; }
  _copiaDe = { nro: f.nro, torre: f.torre, piso: f.piso || '', apto: f.apto || '', fecha: f.fecha || '' };
  if (typeof _uso !== 'undefined') _uso.anterior = 'copiado de ' + f.nro;
  if (caja) caja.innerHTML = '';
  if (typeof _marcarCambio === 'function') _marcarCambio();
}

function _copiadasSinConfirmar(){ return document.querySelectorAll('tr.heredada.copiada').length; }

// El rótulo de la fila: «≈ Copiado de …» en vez de «↺ De la visita anterior».
function _copiarRotular(rid, f){
  const tr = _filaDe(rid); if (!tr) return;
  tr.classList.add('copiada');
  const tag = tr.querySelector('.heredada-tag'); if (!tag) return;
  const b = tag.querySelector('button');
  tag.textContent = '≈ Copiado de ' + _copiarEtiqueta(f) + ' ';
  if (b) { b.textContent = 'Confirmado en sitio'; tag.appendChild(b); }
}
const _marcarHeredadaBase172 = _marcarHeredada;
_marcarHeredada = function(rid){
  const r = _marcarHeredadaBase172.apply(this, arguments);
  if (_copiaOrigenActivo) _copiarRotular(rid, _copiaOrigenActivo);
  return r;
};

// El dato: el informe dice de dónde se copió, y cada fila copiada también.
const _getFormDataBase172 = getFormData;
getFormData = function(){
  const d = _getFormDataBase172.apply(this, arguments);
  if (!d) return d;
  if (_copiaDe) d.copiadoDe = _copiaDe;
  if (d.partidas) Object.keys(d.partidas).forEach(function(pid){
    const arr = d.partidas[pid];
    if (!Array.isArray(arr) || pid.slice(-6) === '_extra') return;
    arr.forEach(function(r, i){
      const tr = _filaDe(pid + '_' + i);
      if (r && tr && tr.classList.contains('copiada') && _copiaDe) r.copiadoDe = _copiaDe.nro;
    });
  });
  return d;
};

// Al abrir un borrador vuelven las marcas: las copiadas sin confirmar siguen bloqueando el envío.
const _loadDraftDataBase172 = loadDraftData;
loadDraftData = function(index){
  const r = _loadDraftDataBase172.apply(this, arguments);
  try {
    const d = getSavedReports()[index];
    _copiaDe = (d && d.copiadoDe) ? d.copiadoDe : null;
    if (d && d.partidas) Object.keys(d.partidas).forEach(function(pid){
      const arr = d.partidas[pid];
      if (!Array.isArray(arr) || pid.slice(-6) === '_extra') return;
      arr.forEach(function(it, i){
        if (!it) return;
        const rid = pid + '_' + i, tr = _filaDe(rid);
        if (!tr) return;
        if (it.heredado) {
          _copiaOrigenActivo = (it.copiadoDe && _copiaDe) ? _copiaDe : null;
          try { _marcarHeredada(rid); } finally { _copiaOrigenActivo = null; }
        } else if (it.copiadoDe) tr.classList.add('copiada');
      });
    });
    const caja = document.getElementById('copiar-de'); if (caja) caja.innerHTML = '';
  } catch (e) { if (window.console) console.warn('copiar de: al abrir el borrador', e); }
  return r;
};

const _nuevoFormularioBase172 = nuevoFormulario;
nuevoFormulario = function(){ _copiaDe = null; const r = _nuevoFormularioBase172.apply(this, arguments); _copiarProgramar(); return r; };
const _siguienteApartamentoBase172 = siguienteApartamento;
siguienteApartamento = function(){ const r = _siguienteApartamentoBase172.apply(this, arguments); _copiaDe = null; _copiarProgramar(); return r; };

// No se envía con filas copiadas sin confirmar: ni este informe ni en «Enviar todos».
const _enviarAlRelevoBase172 = enviarAlRelevo;
enviarAlRelevo = async function(){
  const n = _copiadasSinConfirmar();
  if (n) {
    alert(n + ' fila(s) se copiaron de ' + (_copiaDe ? _copiarEtiqueta(_copiaDe) : 'otro informe') + ' y no se han confirmado en sitio.\n\n' +
          'Revise cada una: toque «Confirmado en sitio» si está igual, o corrija el valor. Hasta entonces el informe no se envía.');
    const tr = document.querySelector('tr.heredada.copiada'); if (tr && tr.scrollIntoView) tr.scrollIntoView({ block: 'center', behavior: 'smooth' });
    return;
  }
  return _enviarAlRelevoBase172.apply(this, arguments);
};
function _copiadasSinConfirmarEn(b){
  let n = 0;
  Object.keys(b.partidas || {}).forEach(function(pid){ const a = b.partidas[pid]; if (Array.isArray(a)) a.forEach(function(r){ if (r && r.heredado && r.copiadoDe) n++; }); });
  return n;
}
if (typeof _faltanEn === 'function') {
  const _faltanEnBase172 = _faltanEn;
  _faltanEn = function(b){
    const f = _faltanEnBase172.apply(this, arguments) || [];
    const n = _copiadasSinConfirmarEn(b);
    if (n) f.push(n + ' fila(s) copiadas sin confirmar');
    return f;
  };
}

// El botón aparece y desaparece con lo mismo que el aviso del informe anterior.
const _programarAnteriorBase172 = _programarAnterior;
_programarAnterior = function(){ const r = _programarAnteriorBase172.apply(this, arguments); _copiarProgramar(); return r; };
document.addEventListener('input', function(e){ if (e.target && /^(pr|ej|pm|sn)_/.test(e.target.id || '')) _copiarProgramar(); }, true);
