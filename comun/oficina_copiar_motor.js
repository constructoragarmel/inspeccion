// ── Modo oficina y «copiar de otra torre» para servicios, SHA y urbanismo (v144, 7-oct-2026) ──────────────
// Lo que obra tiene desde la v133 (modo oficina, cambio 169) y la v139 (copiar mediciones, comun/copiar_de.js),
// en el motor de servicios. Entra al final del motor, antes del service worker, y envuelve funciones del motor
// (datosDelFormulario, guardar, cargarInforme, vaciarFormulario, enviar, enviarSolo, marcar, tocado, ofrecerHistorial),
// así SHA y urbanismo lo heredan con sus propias reglas de «traer lo anterior».
//
// MODO OFICINA. En pantalla ancha con puntero fino (o ?oficina=1): un panel lista los informes de esta torre (o manzana)
// que el relevo tiene archivados (accion 'oficina-lista', con `tipo`), abre uno completo con sus fotos ('oficina-abrir')
// como un informe más de este equipo, y «Cerrar versión definitiva» lo reenvía con datos.definitiva = {por, fecha, desde}.
// El relevo r50 contesta por tipo y echa el tipo de vuelta: si no lo echa (relevo viejo), no se mezcla nada y se avisa.
//
// COPIAR. Con la torre elegida y el formulario en blanco: «📋 Copiar de otra torre…» (en urbanismo, «de otra manzana»).
// Las fuentes son los informes de las torres de la misma contratista en el sector (este teléfono y el archivo, últimos
// 14 días) y, a pedido, las demás torres del sector. Lo copiado queda marcado «≈ copiado de T-02 · tocar para confirmar»
// hasta que se confirme o se corrija, y NO se puede enviar con respuestas copiadas sin confirmar (la visita anterior
// solo avisa; esto bloquea, porque sería afirmar lo que no se miró). Fotos y observación general no se copian.
// El dato lleva copiadoDe {nro, torre, fecha} y cada respuesta copiada `heredado: <nro de origen>`.

let _ES_OFICINA = /[?&]oficina=1/.test(location.search) ||
  (!!window.matchMedia && matchMedia('(min-width: 1000px)').matches && !matchMedia('(pointer: coarse)').matches);
let _definitiva = null;   // {por, fecha, desde}
let _oficinaDe = null;    // {numero, revision, abierto}
let _copiaDe = null;      // {nro, torre, fecha}
const _OC_MANZANA = (typeof TIPO_INFORME !== 'undefined' && TIPO_INFORME === 'urbanismo');
const _OC_LUGAR = _OC_MANZANA ? { una: 'manzana', otra: 'otra manzana', estas: 'esta manzana', de: 'de la manzana', plural: 'manzanas' }
                           : { una: 'torre', otra: 'otra torre', estas: 'esta torre', de: 'de la torre', plural: 'torres' };
// El motor no tiene un aviso breve (usa alert y cartel): uno propio, que no tapa nada.
function _ocToast(msg){
  let t = document.getElementById('oc-toast');
  if (!t) { t = document.createElement('div'); t.id = 'oc-toast'; t.style.cssText = 'position:fixed;left:50%;bottom:118px;transform:translateX(-50%);max-width:calc(100vw - 24px);background:#323338;color:#fff;padding:11px 16px;border-radius:10px;font-size:13px;font-weight:700;z-index:999;text-align:center;line-height:1.35;transition:opacity .3s'; document.body.appendChild(t); }
  t.textContent = msg; t.style.opacity = '1'; clearTimeout(t._reloj); t._reloj = setTimeout(function(){ t.style.opacity = '0'; }, 3500);
}
function _ofiEsc(x){ return String(x == null ? '' : x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
function _ofiTorre(){ return (document.getElementById('torre') || {}).value || ''; }
function _ofiSector(){ return SECTOR_POR_CONVENIO[(document.getElementById('convenio') || {}).value] || ''; }
function _ofiMensaje(e){ const m = String((e && e.message) || e || ''); return /fetch|network|NetworkError|Load failed/i.test(m) ? 'No hay conexión con la oficina (relevo). Revise la señal o el internet e intente de nuevo.' : m; }
async function _ofiPedir(cuerpo){
  let clave = ''; try { clave = localStorage.getItem('garmel_clave_envio') || ''; } catch (e) {}
  if (!clave) throw new Error('Esta computadora no tiene la clave de envío. Configúrela desde la página de inicio.');
  const corte = new AbortController(); const reloj = setTimeout(() => corte.abort(), 25000);
  try {
    const r = await fetch(RELEVO_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                                        body: JSON.stringify(Object.assign({ clave: clave, tipo: TIPO_INFORME, prueba: !!TEST_MODE }, cuerpo)), signal: corte.signal });
    const j = await r.json();
    if (!j || !j.ok) throw new Error((j && j.error) || 'La oficina (relevo) no respondió');
    // Un relevo anterior al r50 contesta estas consultas solo para obra y no echa el tipo: no se mezcla nada.
    if (j.tipo !== TIPO_INFORME) throw new Error('La oficina (relevo) todavía no atiende esta consulta para este formulario. Avise a Planificación: hace falta el relevo r50.');
    return j;
  } finally { clearTimeout(reloj); }
}

// ── El panel de oficina ────────────────────────────────────────────────────
function _oficinaPanel(){
  let o = document.getElementById('oficina');
  if (o) return o;
  const primera = document.querySelector('main .tarjeta, .tarjeta');
  if (!primera) return null;
  o = document.createElement('div'); o.id = 'oficina'; o.className = 'oficina'; o.style.display = 'none';
  o.innerHTML = '<div class="ofi-cab"><div><b>🖥️ Modo oficina</b> · abra un informe ya enviado desde campo, complételo con teclado y ciérrelo como <b>versión definitiva</b>. La versión de campo se conserva.</div>' +
    '<button type="button" class="ofi-btn" id="ofi-buscar" onclick="oficinaBuscar()">Buscar los informes de ' + _OC_LUGAR.estas + '</button></div>' +
    '<div id="ofi-lista" class="ofi-lista"></div><div id="ofi-estado" class="ofi-estado" style="display:none"></div>';
  primera.parentNode.insertBefore(o, primera);
  return o;
}
function _oficinaMostrar(){ const o = _oficinaPanel(); if (o) o.style.display = _ES_OFICINA ? '' : 'none'; _oficinaEstado(); }
async function oficinaBuscar(){
  const torre = _ofiTorre(), sector = _ofiSector(), caja = document.getElementById('ofi-lista'), btn = document.getElementById('ofi-buscar');
  if (!torre || !sector) { caja.innerHTML = '<p class="ofi-aviso">Elija primero el sector y la ' + _OC_LUGAR.una + ', abajo, y vuelva a buscar.</p>'; return; }
  caja.innerHTML = '<p class="ofi-aviso">⏳ Buscando los informes de ' + _ofiEsc(torre) + ' de los últimos 14 días…</p>';
  if (btn) btn.disabled = true;
  try {
    const r = await _ofiPedir({ accion: 'oficina-lista', sector: sector, torre: torre, dias: 14, pruebas: !!TEST_MODE });
    _oficinaPintar(r.informes || [], torre);
  } catch (e) { caja.innerHTML = '<p class="ofi-aviso">❌ No se pudo: ' + _ofiEsc(_ofiMensaje(e)) + '</p>'; }
  finally { if (btn) btn.disabled = false; }
}
function _oficinaPintar(lista, torre){
  const caja = document.getElementById('ofi-lista');
  if (!lista.length) { caja.innerHTML = '<p class="ofi-aviso">' + _ofiEsc(torre) + ' no tiene informes enviados en los últimos 14 días.</p>'; return; }
  const filas = lista.map(function(x){
    const def = x.definitiva && x.definitiva.por;
    return '<tr><td>' + _ofiEsc(x.fecha) + '</td><td>' + _ofiEsc(x.lugar || torre) + '</td><td>' + _ofiEsc((x.inspectores || []).join(' · ')) + '</td>' +
      '<td>' + (def ? '<span class="ofi-tag def">Definitiva · ' + _ofiEsc(x.definitiva.por) + '</span>' : '<span class="ofi-tag pre">Preliminar</span>') +
      (x.revision > 1 ? ' <small>rev. ' + x.revision + '</small>' : '') + '</td>' +
      '<td style="font-family:monospace;font-size:11px">' + _ofiEsc(x.numero) + '</td>' +
      '<td><button type="button" class="ofi-btn sec" onclick="oficinaAbrir(this.dataset.n)" data-n="' + _ofiEsc(x.numero) + '">Abrir</button></td></tr>';
  }).join('');
  caja.innerHTML = '<table><tr><th>Fecha</th><th>Dónde</th><th>Inspector(es)</th><th>Versión</th><th>N° de informe</th><th></th></tr>' + filas + '</table>' +
    '<p class="ofi-aviso">Al abrir uno, queda en la lista de «Informes» de esta computadora con todo lo que trajo de campo. Lo que cambie aquí no borra nada: al cerrarlo se guarda como una revisión nueva.</p>';
}
// Las fotografías vuelven con el nombre con que viajaron (sobreDe): <servicio>-k, apto-i-<apto>-k, minutas-k, inc-i-k…
function _oficinaFotos(b, fotos){
  const porNombre = {}; (fotos || []).forEach(function(f){ if (f && f.nombre && f.dato) porNombre[String(f.nombre).replace(/-r\d+$/, '')] = f.dato; });
  const pegar = function(lista, nombreDe){ (lista || []).forEach(function(f, k){ if (!f) return; const dato = porNombre[nombreDe(k)]; if (dato) { f.dato = dato; delete f.enDrive; } else { delete f.dato; f.enDrive = true; } }); };
  (b.general || []).forEach(function(g){ pegar(g.fotos, function(k){ return g.id + '-' + (k + 1); }); });
  (b.apartamentos || []).forEach(function(a, i){ pegar(a.fotos, function(k){ const pre = 'apto-' + (i + 1) + '-'; return Object.keys(porNombre).find(function(n){ return n.indexOf(pre) === 0 && n.slice(-(String(k + 1).length + 1)) === '-' + (k + 1); }) || ''; }); });
  pegar(b.fotosMinutas, function(k){ return 'minutas-' + (k + 1); });
  (b.incidencias || []).forEach(function(inc, i){ pegar(inc.fotos, function(k){ return 'inc-' + (i + 1) + '-' + (k + 1); }); });
  pegar(b.fotosGenerales, function(k){ return 'general-' + (k + 1); });
  return Object.keys(porNombre).length;
}
async function oficinaAbrir(numero){
  const caja = document.getElementById('ofi-lista');
  const aviso = document.createElement('p'); aviso.className = 'ofi-aviso'; aviso.textContent = '⏳ Abriendo ' + numero + ' con sus fotografías…'; caja.appendChild(aviso);
  try {
    const r = await _ofiPedir({ accion: 'oficina-abrir', sector: _ofiSector(), torre: _ofiTorre(), numero: numero });
    const d = r.datos || {};
    const b = Object.assign({}, d, {
      id: 'oficina-' + numero, tipo: TIPO_INFORME, nro: numero,
      estatus: Array.isArray(d.estatus) ? (d.estatus[0] || '') : (d.estatus || ''),
      residente: d.residente || (Array.isArray(d.residentes) ? d.residentes[0] : '') || '',
      guardado: new Date().toISOString(),
      enviado: d.enviado || ('archivado, revisión ' + (r.revision || 1)),
      oficina: { numero: numero, revision: r.revision || 1, abierto: new Date().toLocaleString() } });
    delete b.editadoTras; delete b.residentes; delete b.fotosDB;
    const nFotos = _oficinaFotos(b, r.fotos);
    const lista = listaGuardada();
    const pos = lista.findIndex(function(x){ return x && (x.id === b.id || x.nro === numero); });
    if (pos >= 0) { b.id = lista[pos].id; lista[pos] = b; } else lista.push(b);
    localStorage.setItem(CLAVE_LISTA, JSON.stringify(lista));
    try { await FotosDB.borrar(b.id); } catch (e) {}
    sucio = false;
    cargarInforme(b.id);
    _oficinaDe = b.oficina; _definitiva = d.definitiva || null;
    // Las imágenes que llegaron inline pasan a IndexedDB al guardar; el envoltorio de guardar conserva las marcas.
    _fotosSucias = true; guardar(false);
    _oficinaEstado();
    aviso.textContent = '✅ ' + numero + ' abierto: ' + nFotos + ' fotografía(s). Revise, complete y cierre la versión definitiva.';
    const e = document.getElementById('ofi-estado'); if (e) e.scrollIntoView({ block: 'center', behavior: 'smooth' });
  } catch (e) { aviso.textContent = '❌ No se pudo abrir ' + numero + ': ' + _ofiMensaje(e); }
}
function _oficinaEstado(){
  const e = document.getElementById('ofi-estado'); if (!e) return;
  if (!_ES_OFICINA || (!_oficinaDe && !_definitiva)) { e.style.display = 'none'; e.innerHTML = ''; return; }
  const de = _oficinaDe ? 'Abierto desde el archivo: <b>' + _ofiEsc(_oficinaDe.numero) + '</b>' + (_oficinaDe.revision > 1 ? ' (revisión ' + _oficinaDe.revision + ')' : '') : 'Informe de esta computadora';
  const est = _definitiva && _definitiva.por ? ' · <span class="ofi-tag def">Definitiva · ' + _ofiEsc(_definitiva.por) + (_definitiva.fecha ? ' · ' + _ofiEsc(_definitiva.fecha) : '') + '</span>' : ' · <span class="ofi-tag pre">Preliminar</span>';
  e.innerHTML = '<div>' + de + est + '</div><button type="button" class="ofi-btn ok" onclick="cerrarDefinitiva()">' + (_definitiva && _definitiva.por ? '✅ Reenviar la versión definitiva' : '✅ Cerrar versión definitiva') + '</button>';
  e.style.display = '';
}
// Cierra el informe abierto como versión definitiva: pide quién lo cierra, lo deja escrito y lo envía.
function cerrarDefinitiva(por){
  const insp = (typeof inspectoresElegidos === 'function' ? inspectoresElegidos() : []).filter(Boolean);
  if (por === undefined) por = prompt('¿Quién cierra la versión definitiva?\n\nQueda escrito en el informe y en el PDF. Escriba su nombre como en el padrón.', (_definitiva && _definitiva.por) || insp[0] || '');
  if (por === null) return false;
  por = String(por).trim();
  if (!por) { alert('Hace falta el nombre de quien cierra la versión definitiva.'); return false; }
  const h = new Date(); const f = h.getFullYear() + '-' + String(h.getMonth() + 1).padStart(2, '0') + '-' + String(h.getDate()).padStart(2, '0');
  _definitiva = { por: por, fecha: f, desde: _oficinaDe ? _oficinaDe.numero + (_oficinaDe.revision > 1 ? '-r' + _oficinaDe.revision : '') : '' };
  _oficinaEstado();
  const falta = faltan(datosDelFormulario());
  if (falta.length) { alert('A este informe le falta ' + falta.join(', ') + '. Complételo antes de cerrarlo.'); return false; }
  guardar(false);
  oficinaEnviarDefinitiva();
  return true;
}
async function oficinaEnviarDefinitiva(){
  const d = listaGuardada().find(function(x){ return x.id === idActual; });
  if (!d) return;
  let clave = ''; try { clave = localStorage.getItem('garmel_clave_envio') || ''; } catch (e) {}
  if (!clave) { alert('⚠️ Esta computadora todavía no está configurada para enviar.'); return; }
  if (_tandaEnCurso) { alert('Ya hay un envío en curso. Espere a que termine.'); return; }
  _tandaEnCurso = true;
  try {
    cartel('📤 Enviando la versión definitiva de ' + d.nro + '…\n\nNo cierre esta pantalla ni vuelva a pulsar.');
    const r = await enviarUno(d, clave);
    alert(r.ok ? '✓ ' + d.nro + ': versión definitiva enviada. Quedó en Drive › Inspección › ' + _rutaDrive(d) + ' como una revisión nueva.' : '✗ ' + d.nro + ': ' + explicar(r.error));
  } finally { cartel(''); _tandaEnCurso = false; }
  actualizarContador();
  if (_ES_OFICINA && document.getElementById('ofi-lista').querySelector('table')) oficinaBuscar();
}

// ── Copiar de otra torre o manzana ─────────────────────────────────────────
function _copiarClave(s){ return String(s || '').toLowerCase().replace(/[^a-z]/g, '').replace(/rr/g, 'r'); }
function _copiarCandidatas(todasDelSector){
  const t = _ofiTorre(), conv = (document.getElementById('convenio') || {}).value || '';
  const propias = (typeof entradasDe === 'function' ? entradasDe(t) : []).filter(function(x){ return !conv || x.c === conv; });
  const emp = _copiarClave((propias[0] || {}).e || (document.getElementById('empresa') || {}).value);
  const out = [];
  (typeof TORRES_DATA !== 'undefined' ? TORRES_DATA : []).forEach(function(x){
    if (x.t === t || out.indexOf(x.t) >= 0) return;
    if (conv && _copiarClave(x.c) !== _copiarClave(conv)) return;
    const misma = emp && _copiarClave(x.e) === emp;
    if (todasDelSector ? !misma : misma) out.push(x.t);
  });
  return out;
}
function _copiarPuede(){
  if (typeof _cargando !== 'undefined' && _cargando) return false;
  if (!_ofiTorre() || !_ofiSector()) return false;
  if (_copiaDe) return false;
  try { return formularioEnBlanco(); } catch (e) { return false; }
}
function _copiarCaja(){
  let c = document.getElementById('copiar-de');
  if (c) return c;
  const ant = document.getElementById('aviso-historial'); if (!ant) return null;
  c = document.createElement('div'); c.id = 'copiar-de';
  ant.parentNode.insertBefore(c, ant.nextSibling);
  return c;
}
let _copiarTemporizador = null;
function _copiarProgramar(){ clearTimeout(_copiarTemporizador); _copiarTemporizador = setTimeout(_copiarPintarBoton, 600); }
function _copiarPintarBoton(){
  const caja = _copiarCaja(); if (!caja) return;
  if (!_copiarPuede()) { caja.innerHTML = ''; return; }
  if (caja.querySelector('.copiar-panel')) return;
  const rotulo = '📋 Copiar de ' + _OC_LUGAR.otra + '…';
  // Una sola tarjeta: si la propuesta de la visita anterior está a la vista, el botón va dentro de ella.
  const avisoBotones = document.querySelector('#aviso-historial .historial .b');
  if (avisoBotones) {
    caja.innerHTML = '';
    if (!avisoBotones.querySelector('#btn-copiar-de')) {
      const b = document.createElement('button'); b.type = 'button'; b.id = 'btn-copiar-de'; b.className = 'copiar'; b.textContent = rotulo;
      b.onclick = function(){ document.getElementById('aviso-historial').innerHTML = ''; _copiarAbrirPanel(); };
      avisoBotones.appendChild(b);
      // Al tocar «No, empezar en blanco» la tarjeta se va con el botón dentro: vuelve a pintarse suelto.
      const no = avisoBotones.querySelector('.no'); if (no && !no._copiarEnganchado) { no._copiarEnganchado = true; no.addEventListener('click', _copiarProgramar); }
    }
    return;
  }
  caja.innerHTML = '<div class="copiar-boton"><button type="button" id="btn-copiar-de">' + rotulo + '</button></div>';
  caja.querySelector('button').onclick = _copiarAbrirPanel;
}
function _copiarCuenta(e){
  let n = 0;
  (e.general || []).forEach(function(g){ (g.items || []).forEach(function(i){ if (i.sn || i.obs || i.cant || i.cantidad || i.calidad || i.cal) n++; }); });
  n += (e.apartamentos || []).length;
  return n;
}
function _copiarLocales(torres){
  const todos = estadosDeTorres(), out = [];
  torres.forEach(function(t){ const e = todos[t]; if (e && e.nro && _copiarCuenta(e) && (/^PRUEBA-/.test(e.nro) === !!TEST_MODE)) out.push({ nro: e.nro, torre: t, fecha: e.fecha || '', filas: _copiarCuenta(e), origen: 'este teléfono', e: e }); });
  return out;
}
async function _copiarDelArchivo(torres){
  if (!torres.length || !navigator.onLine) return { ok: true, fuentes: [] };
  try { const r = await _ofiPedir({ accion: 'copiar-fuentes', sector: _ofiSector(), torres: torres.slice(0, 8), dias: 14 }); return { ok: true, fuentes: r.fuentes || [] }; }
  catch (e) { return { ok: false, error: _ofiMensaje(e), fuentes: [] }; }
}
function _copiarJuntar(locales, delArchivo){
  const vistos = {}, out = [];
  locales.concat((delArchivo || []).map(function(f){ return Object.assign({ origen: 'archivo' }, f); })).forEach(function(f){ if (!vistos[f.nro]) { vistos[f.nro] = 1; out.push(f); } });
  out.sort(function(a, b){ const ka = a.fecha + a.nro, kb = b.fecha + b.nro; return ka < kb ? 1 : ka > kb ? -1 : 0; });
  return out;
}
function _copiarPintarGrupo(lista, titulo, fuentes){
  const h = document.createElement('div'); h.className = 'g'; h.textContent = titulo; lista.appendChild(h);
  fuentes.forEach(function(f){
    const fila = document.createElement('div'); fila.className = 'f';
    const d = document.createElement('div'); d.className = 'd'; d.textContent = f.torre + ' · ' + f.nro;
    const s = document.createElement('small'); s.textContent = (f.fecha || 'sin fecha') + ' · ' + f.filas + ' respuesta(s) · ' + (f.origen || 'archivo'); d.appendChild(s);
    const b = document.createElement('button'); b.type = 'button'; b.textContent = 'Copiar';
    b.onclick = function(){ _copiarElegir(f, b); };
    fila.appendChild(d); fila.appendChild(b); lista.appendChild(fila);
  });
}
async function _copiarAbrirPanel(){
  const caja = _copiarCaja(); if (!caja || !_copiarPuede()) return;
  const t = _ofiTorre(), hermanas = _copiarCandidatas(false), resto = _copiarCandidatas(true);
  caja.innerHTML = '<div class="copiar-panel"><div class="t">Copiar las respuestas de ' + _ofiEsc(_OC_LUGAR.otra) + '</div>' +
    '<div class="s">Se traen las respuestas y observaciones de cada ítem, marcadas hasta que usted las confirme en sitio o las corrija. Las fotos y la observación general no se copian. No se puede enviar con respuestas copiadas sin confirmar.</div>' +
    '<div class="lista"><p class="s">⏳ Buscando en este teléfono y en el archivo…</p></div>' +
    '<button type="button" class="cerrar">Cerrar</button></div>';
  caja.querySelector('.cerrar').onclick = function(){ caja.innerHTML = ''; _copiarPintarBoton(); };
  const lista = caja.querySelector('.lista');
  const locales = _copiarLocales(hermanas), r = await _copiarDelArchivo(hermanas);
  if (!caja.querySelector('.copiar-panel')) return;
  lista.innerHTML = '';
  if (!r.ok) { const p = document.createElement('p'); p.className = 's'; p.textContent = '⚠️ ' + r.error; lista.appendChild(p); }
  const fuentes = _copiarJuntar(locales, r.fuentes);
  if (!fuentes.length) {
    const p = document.createElement('p'); p.className = 's';
    p.textContent = 'No hay informes de los últimos 14 días en las ' + _OC_LUGAR.plural + ' de la misma contratista' + (hermanas.length ? ' (' + hermanas.join(', ') + ')' : ' (no hay otras en el sector)') + '.';
    lista.appendChild(p);
  } else _copiarPintarGrupo(lista, _OC_LUGAR.plural + ' de la misma contratista (' + hermanas.join(', ') + ')', fuentes);
  if (resto.length) {
    const bs = document.createElement('button'); bs.type = 'button'; bs.className = 'sector';
    bs.textContent = 'Buscar también en las demás ' + _OC_LUGAR.plural + ' del sector (' + resto.length + ')';
    bs.onclick = async function(){
      bs.disabled = true; bs.textContent = '⏳ Buscando en ' + resto.length + ' ' + _OC_LUGAR.plural + '…';
      const loc2 = _copiarLocales(resto); let f2 = loc2.slice();
      for (let i = 0; i < resto.length; i += 8) { const r2 = await _copiarDelArchivo(resto.slice(i, i + 8)); if (!r2.ok) { const p = document.createElement('p'); p.className = 's'; p.textContent = '⚠️ ' + r2.error; lista.appendChild(p); break; } f2 = _copiarJuntar(f2, r2.fuentes); }
      bs.remove();
      if (!f2.length) { const p = document.createElement('p'); p.className = 's'; p.textContent = 'En las demás ' + _OC_LUGAR.plural + ' del sector no hay informes de los últimos 14 días.'; lista.appendChild(p); return; }
      _copiarPintarGrupo(lista, 'otras ' + _OC_LUGAR.plural + ' del sector', f2);
    };
    lista.appendChild(bs);
  }
}
async function _copiarElegir(f, boton){
  const caja = document.getElementById('copiar-de');
  if (!_copiarPuede()) { if (caja) caja.innerHTML = ''; return; }
  let e = f.e;
  if (!e) {
    if (boton) { boton.disabled = true; boton.textContent = '⏳'; }
    let r;
    try { r = await _ofiPedir({ accion: 'copiar-abrir', sector: _ofiSector(), torre: f.torre, numero: f.nro }); }
    catch (err) { _ocToast('⚠️ ' + _ofiMensaje(err)); if (boton) { boton.disabled = false; boton.textContent = 'Copiar'; } return; }
    // El estado de una torre se arma con la misma función que lo arma para la visita anterior (anotarEstadoTorre):
    // así SHA y urbanismo lo arman con sus propios campos. Se usa una llave de paso y se borra.
    const d = JSON.parse(JSON.stringify(r.datos || {}));
    d.torre = '__copia__'; d.id = 'copia-' + Date.now(); d.fecha = d.fecha || f.fecha || '1970-01-01'; d.guardado = d.guardado || new Date().toISOString();
    if (Array.isArray(d.estatus)) d.estatus = d.estatus[0] || '';
    d.residente = d.residente || (Array.isArray(d.residentes) ? d.residentes[0] : '') || '';
    const todos0 = estadosDeTorres(); delete todos0['__copia__']; localStorage.setItem(CLAVE_TORRES, JSON.stringify(todos0));
    anotarEstadoTorre(d);
    const todos1 = estadosDeTorres(); e = todos1['__copia__']; delete todos1['__copia__']; localStorage.setItem(CLAVE_TORRES, JSON.stringify(todos1));
    if (!e) { _ocToast('⚠️ Ese informe no tiene respuestas que copiar'); if (boton) { boton.disabled = false; boton.textContent = 'Copiar'; } return; }
  }
  if (!_copiarPuede()) { if (caja) caja.innerHTML = ''; return; }
  _copiarAplicar(e, f);
}
// Vuelca la fuente con traerHistorial, la función del motor para la visita anterior (cada formulario tiene la suya):
// se inyecta como estado de ESTA torre, se trae y se restaura. Lo que no es respuesta (estatus, residente, empresa,
// convenio) no viaja.
function _copiarAplicar(e, f){
  const t = _ofiTorre();
  const fuente = JSON.parse(JSON.stringify(e));
  ['convenio', 'estatus', 'residente', 'empresa'].forEach(function(k){ delete fuente[k]; });
  fuente.nro = f.nro; fuente.id = 'copia-' + f.nro;
  const todos = estadosDeTorres(); const previo = todos[t];
  todos[t] = fuente; localStorage.setItem(CLAVE_TORRES, JSON.stringify(todos));
  try { traerHistorial(); }
  finally { const t2 = estadosDeTorres(); if (previo) t2[t] = previo; else delete t2[t]; localStorage.setItem(CLAVE_TORRES, JSON.stringify(t2)); }
  _copiaDe = { nro: f.nro, torre: f.torre, fecha: f.fecha || '' };
  _copiarRotular();
  const caja = document.getElementById('copiar-de'); if (caja) caja.innerHTML = '';
  const ant = document.getElementById('aviso-historial'); if (ant) ant.innerHTML = '';
  const n = _copiadasSinConfirmar(datosDelFormulario());
  _ocToast('📋 ' + n + ' respuesta(s) copiadas de ' + f.torre + '. Confirme cada una en sitio o corríjala.');
  marcar();
}
// Las respuestas copiadas llevan su etiqueta, que es también el botón para confirmarlas.
function _copiarRotular(){
  if (!_copiaDe) return;
  document.querySelectorAll('.item.heredado, .fila-apto.heredado').forEach(function(el){
    if (el.dataset.heredado !== _copiaDe.nro) return;
    el.classList.add('copiada');
    const tag = el.querySelector('.etq-her'); if (!tag) return;
    tag.textContent = '≈ copiado de ' + _copiaDe.torre + ' · tocar para confirmar';
    tag.onclick = function(ev){ ev.stopPropagation(); _copiarConfirmar(el); };
  });
}
function _copiarConfirmar(el){
  el.classList.remove('heredado', 'copiada'); delete el.dataset.heredado;
  const tag = el.querySelector('.etq-her'); if (tag) { tag.textContent = 'visita anterior'; tag.onclick = null; }
  actualizarCuentas(); marcar();
}
function _copiadasSinConfirmar(d){
  const nro = d && d.copiadoDe && d.copiadoDe.nro; if (!nro) return 0;
  let n = 0;
  (d.general || []).forEach(function(g){ (g.items || []).forEach(function(i){ if (i.heredado === nro) n++; }); });
  (d.apartamentos || []).forEach(function(a){ if (a.heredado === nro) n++; });
  return n;
}
function _copiarAvisoBloqueo(d){
  const n = _copiadasSinConfirmar(d); if (!n) return false;
  alert(n + ' respuesta(s) de ' + d.nro + ' se copiaron de ' + (d.copiadoDe.torre || _OC_LUGAR.otra) + ' y no se han confirmado en sitio.\n\n' +
        'Revise cada una: toque «tocar para confirmar» si está igual, o corrija la respuesta. Hasta entonces el informe no se envía.');
  return true;
}

// ── Envolturas sobre el motor ──────────────────────────────────────────────
(function(){
  const _datosBase = datosDelFormulario;
  datosDelFormulario = function(){
    const d = _datosBase.apply(this, arguments);
    if (_definitiva) d.definitiva = _definitiva;
    if (_oficinaDe) d.oficina = _oficinaDe;
    if (_copiaDe) d.copiadoDe = _copiaDe;
    return d;
  };
  // Un informe abierto en oficina se trabaja: guardar no lo marca «editado después» ni le quita la marca de enviado.
  const _guardarBase = guardar;
  guardar = function(avisar){
    const r = _guardarBase.apply(this, arguments);
    if (_oficinaDe) {
      try {
        const lista = listaGuardada(); const i = lista.findIndex(function(x){ return x && x.id === idActual; });
        if (i >= 0) { lista[i].oficina = _oficinaDe; if (!lista[i].enviado) lista[i].enviado = 'archivado'; delete lista[i].editadoTras; if (_definitiva) lista[i].definitiva = _definitiva; localStorage.setItem(CLAVE_LISTA, JSON.stringify(lista)); }
      } catch (e) {}
    }
    return r;
  };
  const _cargarBase = cargarInforme;
  cargarInforme = function(id){
    const r = _cargarBase.apply(this, arguments);
    const d = listaGuardada().find(function(x){ return x.id === id; });
    if (d && idActual === d.id) {
      _definitiva = d.definitiva || null; _oficinaDe = d.oficina || null; _copiaDe = d.copiadoDe || null;
      _copiarRotular(); _oficinaEstado();
    }
    return r;
  };
  const _vaciarBase = vaciarFormulario;
  vaciarFormulario = function(){ _definitiva = null; _oficinaDe = null; _copiaDe = null; const r = _vaciarBase.apply(this, arguments); _oficinaEstado(); _copiarProgramar(); return r; };
  const _tocadoBase = tocado;
  tocado = function(el){
    const it = el && el.closest ? el.closest('.item, .fila-apto') : null;
    const r = _tocadoBase.apply(this, arguments);
    if (it && it.classList.contains('copiada')) { it.classList.remove('copiada'); const tag = it.querySelector('.etq-her'); if (tag) { tag.textContent = 'visita anterior'; tag.onclick = null; } }
    return r;
  };
  const _enviarBase = enviar;
  enviar = async function(){
    if (_tandaEnCurso) return _enviarBase.apply(this, arguments);
    const actual = datosDelFormulario();
    if (actual.copiadoDe && _copiarAvisoBloqueo(actual)) return;
    // Lo que está en pantalla se guarda antes de mirar la lista: las confirmaciones recién hechas cuentan.
    try { guardar(false); } catch (e) {}
    const malos = listaGuardada().filter(function(x){ return x && !x.enviado && _copiadasSinConfirmar(x); });
    if (malos.length) { _copiarAvisoBloqueo(malos[0]); return; }
    return _enviarBase.apply(this, arguments);
  };
  const _enviarSoloBase = enviarSolo;
  enviarSolo = async function(id){
    const d = listaGuardada().find(function(x){ return x.id === id; });
    if (d && _copiarAvisoBloqueo(d)) return;
    return _enviarSoloBase.apply(this, arguments);
  };
  ['marcar', 'alElegirTorre', 'alElegirConvenio', 'ofrecerHistorial'].forEach(function(nombre){
    const base = window[nombre]; if (typeof base !== 'function') return;
    window[nombre] = function(){ const r = base.apply(this, arguments); _copiarProgramar(); return r; };
  });
  if (document.readyState !== 'loading') setTimeout(_oficinaMostrar, 0); else document.addEventListener('DOMContentLoaded', _oficinaMostrar);
})();
