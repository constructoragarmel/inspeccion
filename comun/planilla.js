// ── 199. Planilla de avance por torre (29-oct-2026, ADR-0056) ─────────────────────────────────────────────────────
// Diego Orta y las inspectoras: un informe por apartamento cuesta 10 minutos y se repite cada semana hasta llegar a
// 100 %. La planilla pone la torre entera en una tabla —apartamentos y subpartidas, el último % en gris— y se toca
// solo lo que avanzó: en el teléfono en obra, o en papel y después en la computadora. La hoja se imprime desde aquí.
// Al guardar, cada apartamento que cambió sale como un informe NORMAL en «Informes» (mismo número, misma cabecera,
// todas sus subpartidas: las de antes y las nuevas), y se envía con «Enviar todos»: el relevo, el PDF, Smartsheet,
// el avance y el compilado no cambian. El % va en el `pct` de la fila; las de estado en `ej` sobre 100, como sus
// botones; las de Sí / No en `sn`. Lo anterior sale del avance-torre.json del archivo (relevo r79, `planilla`) y de
// los informes de este teléfono. Solo obra: servicios, SHA y urbanismo no tienen apartamentos.
(function(){
  const esc = function(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  const pad = function(n){ return String(n).padStart(2, '0'); };
  const iso = function(d){ return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  const HOY = function(){ return iso(new Date()); };
  const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const fechaLarga = function(f){ const p = String(f || '').split('-'); return p.length === 3 ? (+p[2]) + '-' + MESES[+p[1] - 1] + '-' + p[0] : String(f || ''); };
  const CORTO = { hito_cerramientos: 'Cerramientos', hito_servicios: 'Servicios', hito_acabados: 'Acabados', hito_puertas: 'Puertas',
                  hito_ventanas: 'Ventanas', hito_acc_sanitarios: 'Sanitarios', hito_acc_electricos: 'Eléctricos', hito_pruebas: 'Pruebas' };
  const MAX_DESHACER = 100, MAX_COLS = 14;
  const TAMANOS = { comoda: { filas: 24, txt: 'Cómoda para escribir' }, compacta: { filas: 40, txt: 'Compacta' }, toda: { filas: 48, txt: 'Toda la torre en una hoja (letra chica)' } };   // con más de 48 filas la hoja se corta y no se puede escribir

  // ── la lista: las subpartidas que se miden por apartamento ──
  function lista(){
    const out = [];
    PARTIDAS.forEach(function(h){
      const subs = [];
      (h.items || []).forEach(function(n, i){
        const amb = ((AMBITO_SUB[h.id] || [])[i]) || 'AMBOS';
        if (amb === 'T') return;
        const c = ((CODIGOS_SUB[h.id] || [])[i]); if (!c) return;
        const u = (UNIDADES[h.id] || [])[i];
        subs.push({ c: c, n: n, i: i, u: u, sino: u === 'sino', estado: u === 'estado', ay: (typeof AYUDA_SUB !== 'undefined' && AYUDA_SUB[c]) || '' });
      });
      if (subs.length) out.push({ id: h.id, n: h.nombre, num: (String(h.nombre).match(/HITO (\d+)/) || [])[1] || '', corto: CORTO[h.id] || h.nombre, subs: subs });
    });
    return out;
  }
  let LISTA = null, SUBS = {};
  function prepararLista(){ LISTA = lista(); SUBS = {}; LISTA.forEach(function(h){ h.subs.forEach(function(s){ SUBS[s.c] = Object.assign({ h: h }, s); }); }); }

  // ── el % de una fila guardada, como lo cuenta el relevo (_pdfPctFila) ──
  function pctFila(r){
    if (!r || r.fueraDeAmbito || String(r.ev || '') === 'N/A') return null;
    if (r.pct !== undefined && String(r.pct).trim() !== '') { const pm = parseFloat(String(r.pct).replace(',', '.')); if (!isNaN(pm)) return Math.min(100, Math.max(0, Math.floor(pm))); }
    const pr = parseFloat(r.pr); let ej = parseFloat(r.ej);
    if (!(pr > 0)) { const sn = String(r.sn || '').toUpperCase(); if (sn === 'SÍ' || sn === 'SI') return 100; if (sn === 'NO') return 0; return (String(r.ej).trim() === '0' || String(r.pr).trim() === '0') ? 0 : null; }
    if (isNaN(ej) || ej < 0) ej = 0;
    return Math.min(100, Math.round(ej / pr * 100));   // redondea como _pdfPctFila del relevo
  }
  function pctsDe(d){
    const out = {};
    Object.keys(d.partidas || {}).forEach(function(pid){
      const filas = d.partidas[pid]; if (!Array.isArray(filas) || /_extra$/.test(pid)) return;
      if ((d.noInspeccionados || []).indexOf(pid) >= 0) return;
      filas.forEach(function(r, i){ const c = (CODIGOS_SUB[pid] || [])[i], v = pctFila(r); if (c && v !== null) out[c] = v; });
    });
    return out;
  }
  const claveDe = function(nro){ const m = String(nro || '').toUpperCase().match(/-(P\d{2}A[^-]*)-\d{6}-/); return m ? m[1] : null; };
  // Limpio como el número del formulario (_limpiar): «1 lateral» → «1LATERAL», la clave que guarda el archivo.
  const bloque = function(p, a){ const av = _limpiar(a); return 'P' + pad(p) + 'A' + (/^\d+$/.test(av) ? av.padStart(2, '0') : av); };
  // La planta baja es el piso 00 del número (ADR-0016) y «Planta Baja» en el desplegable del formulario.
  const nomPiso = function(p){ return p === 0 ? 'Planta Baja' : 'Piso ' + pad(p); };
  const corPiso = function(p){ return p === 0 ? 'PB' : 'P' + pad(p); };

  // ── el estado de la planilla abierta ──
  let P = null, est = { N: {}, C: {} }, pila = [], vista = 'tel', piso = 1, hitoSel = 'hito_servicios', tamano = 'comoda';
  const enPapel = {}, abiertos = { hito_servicios: true };
  const CLAVE = function(){ return 'garmel_planilla_' + P.sector + '|' + P.torre; };
  function guardarBorrador(){ try {
    localStorage.setItem(CLAVE(), JSON.stringify({ est: est, pasa: P.pasa, impresa: P.impresa, extra: P.extra, pisos: P.pisosElegido || 0, oficina: !!P.oficina }));
  } catch (e) {} }
  function leerBorrador(){ try { return JSON.parse(localStorage.getItem(CLAVE()) || 'null'); } catch (e) { return null; } }
  function antesDeCambiar(){ pila.push(JSON.stringify(est)); if (pila.length > MAX_DESHACER) pila.shift(); }
  const nuevo = function(k, c){ return !!(est.N[k] && c in est.N[k]); };
  const prev = function(k, c){ const x = P.prev[k]; return x && x.pcts && x.pcts[c] !== undefined ? x.pcts[c] : null; };
  const valor = function(k, c){ return nuevo(k, c) ? est.N[k][c] : prev(k, c); };
  function poner(k, c, v){
    if (v === '' || v == null || isNaN(v) || v === prev(k, c)) { if (est.N[k]) { delete est.N[k][c]; if (!Object.keys(est.N[k]).length) delete est.N[k]; } return; }
    (est.N[k] = est.N[k] || {})[c] = Math.max(0, Math.min(100, Math.round(v)));
  }
  const baja = function(k, c){ return nuevo(k, c) && prev(k, c) !== null && est.N[k][c] < prev(k, c); };
  const fmt = function(c, v){ if (v === null || v === undefined) return '·'; return SUBS[c].sino ? (v >= 100 ? 'Sí' : 'No') : String(v); };
  window._plLeerValor = function(raw, sino){
    const t = String(raw == null ? '' : raw).trim().toLowerCase();
    if (t === '') return '';
    if (sino) { if (/^(s|si|sí|x|✓|1|100|hecha)$/.test(t)) return 100; if (/^(n|no|0|-|—)$/.test(t)) return 0; return null; }
    // «75%», « 80 », «60,4». No: «0,5» (una fracción de Excel sin formato de %), «1.000» (miles), negativos ni texto.
    const m = t.replace(/\s|%/g, '').replace(',', '.');
    if (!/^\d{1,3}(\.\d{1,2})?$/.test(m)) return null;
    const f = parseFloat(m); if (f > 0 && f < 1) return null;
    const v = Math.round(f); return v >= 0 && v <= 100 ? v : null;
  };

  // ── los apartamentos de la torre ──
  function armarAptos(){
    const lista = (typeof _aptosDeSector === 'function' && _aptosDeSector()) || null;
    let maxP = P.pisosElegido || 0;
    Object.keys(P.prev).forEach(function(k){ const m = k.match(/^P(\d{2})A/); if (m) maxP = Math.max(maxP, +m[1]); });
    (P.extra || []).forEach(function(x){ maxP = Math.max(maxP, x.p); });
    if (!maxP) maxP = lista ? 15 : 1;
    P.pisos = maxP;
    // La planta baja solo aparece si ya tiene algo: un informe o un apartamento agregado.
    P.pisoMin = (Object.keys(P.prev).some(function(k){ return /^P00A/.test(k); }) || (P.extra || []).some(function(x){ return x.p === 0; })) ? 0 : 1;
    const out = [], vistos = {};
    for (let p = P.pisoMin; p <= maxP; p++) {
      const deEste = [];
      if (lista && p > 0) lista.forEach(function(a){ deEste.push(a); });
      Object.keys(P.prev).forEach(function(k){ const m = k.match(/^P(\d{2})A(.+)$/); if (m && +m[1] === p) { const a = String(P.prev[k].apto || m[2]).trim().toUpperCase(); if (deEste.indexOf(a) < 0) deEste.push(a); } });
      (P.extra || []).forEach(function(x){ if (x.p === p && deEste.indexOf(x.a) < 0) deEste.push(x.a); });
      deEste.forEach(function(a, i){ const k = bloque(p, a); if (vistos[k]) return; vistos[k] = true; out.push({ p: p, a: a, k: k, i: i }); });
    }
    P.aptos = out;
    P.porPiso = lista ? lista.length : 0;
  }
  const aptoDe = function(k){ return P.aptos.find(function(x){ return x.k === k; }); };

  // ── lo anterior: el archivo (r79) y este teléfono ──
  async function traerArchivo(){
    const clave = localStorage.getItem('garmel_clave_envio') || '';
    if (!clave || !navigator.onLine) return null;
    const corte = new AbortController(), reloj = setTimeout(function(){ corte.abort(); }, 12000);
    try {
      const r = await fetch(RELEVO_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ clave: clave, accion: 'planilla', sector: P.sector, torre: P.torre, prueba: !!TEST_MODE }), signal: corte.signal });
      const j = await r.json();
      return (j && j.ok && j.informes) ? j.informes : null;
    } catch (e) { return null; } finally { clearTimeout(reloj); }
  }
  function delTelefono(){
    const out = {};
    getSavedReports().forEach(function(b){
      if (!b || b.lista !== VERSION_LISTA || b.torre !== P.torre || (b.ambito || 'apartamento') !== 'apartamento') return;
      if (String(b.nro || '').indexOf(P.sector + '-') !== 0) return;
      const k = claveDe(b.nro); if (!k) return;
      const f = String(b.fecha || '') + '|' + String(b.timestamp || '');
      if (out[k] && out[k].orden >= f) return;
      out[k] = { nro: b.nro, fecha: b.fecha || '', piso: b.piso || '', apto: b.apto || '', pcts: pctsDe(b), orden: f, telefono: true };
    });
    return out;
  }
  function mezclar(archivo){
    const prev = {};
    Object.keys(archivo || {}).forEach(function(k){ prev[k] = archivo[k]; });
    const tel = delTelefono();
    Object.keys(tel).forEach(function(k){ if (!prev[k] || String(tel[k].fecha) >= String(prev[k].fecha || '')) prev[k] = tel[k]; });
    return prev;
  }

  // ── abrir ──
  window.abrirPlanilla = async function(){
    if (atrasPendiente) await atrasPendiente;   // se acaba de cerrar: que el historial termine de volver antes de entrar otra vez
    if (P && raiz && !raiz.hidden) return;   // dos toques al botón: una sola planilla
    const d = getFormData(), falta = [];
    const torre = getTorreActual(), sector = getSectorActual();
    if (!torre || torre === '—' || torre === 'SIN-REG') falta.push('la torre');
    if (!sector || sector === 'XX') falta.push('el convenio');
    if (!d.fecha) falta.push('la fecha');
    if (!(d.inspectores || []).filter(Boolean).length) falta.push('el inspector');
    if (!(d.estatus || []).filter(Boolean).length) falta.push('el estatus de la obra');
    if (falta.length) { alert('Para abrir la planilla, primero elija en la cabecera ' + falta.join(', ') + '. Se ponen una sola vez y valen para todos los apartamentos.'); return; }
    if (d.fecha > HOY()) { alert('La fecha de la cabecera es futura (' + fechaLarga(d.fecha) + '). Corríjala antes de abrir la planilla.'); return; }
    prepararLista();
    // La cabecera se usa tal cual en cada informe: lo que es de otro informe (el de torre, una copia) no viaja.
    ['obsAptosGen', 'copiadoDe', 'fotos', 'fotobs', 'enviado', 'editadoTras', 'oficina', 'definitiva', 'fotosEnIdb', 'repetidoDe', 'separadoDe', 'planilla', 'uso'].forEach(function(c){ delete d[c]; });
    const mio = P = { sector: sector, torre: torre, cab: d, prev: {}, aptos: [], pisos: 0, extra: [], pasa: '', impresa: '', origenPrev: '', oficina: false };
    est = { N: {}, C: {} }; pila = [];
    const b = leerBorrador();
    if (b) { if (b.est) est = b.est; P.pasa = b.pasa || ''; P.impresa = b.impresa || ''; P.extra = b.extra || []; P.pisosElegido = b.pisos || 0; P.oficina = !!b.oficina; }
    LISTA.forEach(function(h){ if (!(h.id in enPapel)) enPapel[h.id] = true; });
    if (!LISTA.some(function(h){ return h.id === hitoSel; })) hitoSel = LISTA[0].id;
    vista = innerWidth >= 900 ? 'tabla' : 'tel';
    montar(); entrarAlHistorial();
    pintarCargando();
    // Primero lo guardado (sirve sin señal) y se puede trabajar ya; el archivo, si contesta, lo pone al día.
    let guardado = null; try { guardado = JSON.parse(localStorage.getItem('garmel_planilla_prev_' + P.sector + '|' + P.torre) || 'null'); } catch (e) {}
    P.prev = mezclar(guardado ? guardado.informes : null);
    P.origenPrev = guardado ? 'guardado el ' + fechaLarga(guardado.fecha) : 'solo de este teléfono';
    armarAptos(); piso = Math.min(Math.max(P.pisoMin, piso), P.pisos);
    const recuperado = function(){ const r = resumen(); return r.ks.length ? '↩︎ Se recuperó lo que había quedado sin guardar: ' + r.n + ' casilla(s) en ' + r.ks.length + ' apartamento(s).' : ''; };
    const yaHayAlgo = !!guardado || Object.keys(P.prev).length > 0;
    if (yaHayAlgo && navigator.onLine && localStorage.getItem('garmel_clave_envio')) { P.aviso = '🔄 Actualizando con el archivo; mientras tanto lo gris es ' + P.origenPrev + '. ' + recuperado(); mostrar(vista); }
    const del = await traerArchivo();
    if (P !== mio) return;
    if (del) {
      try { localStorage.setItem('garmel_planilla_prev_' + P.sector + '|' + P.torre, JSON.stringify({ fecha: HOY(), informes: del })); } catch (e) {}
      P.prev = mezclar(del); P.origenPrev = 'del archivo';
    }
    armarAptos(); piso = Math.min(Math.max(P.pisoMin, piso), P.pisos);
    P.aviso = (del ? '' : '📵 Sin conexión con el archivo: lo gris es ' + P.origenPrev + '. ') + recuperado();
    refrescar();
  };
  // Repinta sin perder lo que se está escribiendo en la tabla de la oficina.
  function refrescar(){
    const a = document.activeElement; let foco = null;
    if (a && a.classList && a.classList.contains('pl-pc') && raiz && raiz.contains(a)) { escribir(a); foco = [a.dataset.k, a.dataset.c]; }
    mostrar(vista);
    if (foco) { const i = document.querySelector('#pl-cuerpo input.pl-pc[data-k="' + foco[0] + '"][data-c="' + foco[1] + '"]'); if (i) i.focus(); }
  }
  // El «atrás» del teléfono (Android) cierra primero la hoja de abajo y después la planilla, sin salir de la página.
  // Al cerrar con «← Formulario» la planilla pide su propio «atrás». Ese «atrás» puede llegar tarde (con el teléfono ocupado),
  // cuando ya se volvió a abrir: se cuenta y se ignora siempre, llegue cuando llegue. Abrir espera a que llegue (como mucho 600 ms).
  let enHistorial = false, propios = 0, atrasPendiente = null, finAtras = null;
  function entrarAlHistorial(){ if (enHistorial) return; try { history.pushState({ planilla: 1 }, ''); enHistorial = true; } catch (e) {} }
  const soltarEspera = function(){ if (finAtras) { const f = finAtras; finAtras = null; atrasPendiente = null; f(); } };
  function salirDelHistorial(){
    enHistorial = false;
    atrasPendiente = new Promise(function(res){ finAtras = res; });
    setTimeout(soltarEspera, 600);
    try { propios++; history.back(); } catch (e) { propios--; soltarEspera(); }
  }
  addEventListener('popstate', function(){
    if (propios > 0) { propios--; soltarEspera(); return; }   // el «atrás» que pidió la planilla al cerrarse
    if (!enHistorial) return;
    enHistorial = false;
    if (!P || !raiz || raiz.hidden) return;
    const f = document.getElementById('pl-fondo');
    if (f && !f.hidden) { cerrarSheet(); entrarAlHistorial(); return; }
    cerrarPlanilla(true);
  });
  window._plEstado = function(){ return { P: P, est: est, pila: pila, vista: vista, piso: piso, hitoSel: hitoSel, tamano: tamano, LISTA: LISTA }; };
  window._plIr = function(o){ if (o.piso) piso = o.piso; if (o.hitoSel) hitoSel = o.hitoSel; if (o.tamano) tamano = o.tamano; if (o.abrir) abiertos[o.abrir] = true; if (o.enPapel) Object.keys(o.enPapel).forEach(function(k){ enPapel[k] = o.enPapel[k]; }); mostrar(o.vista || vista); };

  // ── la pantalla ──
  let raiz = null;
  function montar(){
    raiz = document.getElementById('planilla');
    if (!raiz) { raiz = document.createElement('div'); raiz.id = 'planilla'; document.body.appendChild(raiz); }
    raiz.innerHTML =
      '<div class="pl-top"><div class="pl-fila"><button type="button" class="pl-volver" id="pl-volver" title="Volver al formulario">← Formulario</button>' +
      '<div class="pl-tit"><b>📋 Planilla de avance</b><span>' + esc(P.sector) + ' · ' + esc(P.torre) + ' · ' + esc(P.cab.empresa || '') + '</span></div></div>' +
      '<div class="pl-cab">Visita del <b>' + esc(fechaLarga(P.cab.fecha)) + '</b> · ' + esc((P.cab.inspectores || []).join(', ')) + ' · ' + esc((P.cab.estatus || []).join(', ')) + ' <span class="pl-nota">(se cambian en el formulario)</span></div>' +
      '<nav class="pl-tabs" role="tablist">' +
      '<button type="button" role="tab" data-v="tel" title="Para llenar en obra, en el teléfono">📱 Obra</button><button type="button" role="tab" data-v="tabla" title="Para pasar la hoja en la computadora">💻 Oficina</button>' +
      '<button type="button" role="tab" data-v="imp">🖨 Imprimir</button><button type="button" role="tab" data-v="guia">📖 Guía</button></nav></div>' +
      '<div class="pl-aviso" id="pl-aviso" hidden></div>' +
      '<div class="pl-cuerpo" id="pl-cuerpo"></div>' +
      '<div class="pl-barra" id="pl-barra"><div class="pl-btxt" id="pl-btxt"></div><button type="button" class="pl-btn" id="pl-undo" aria-label="Deshacer el último cambio">↶</button><button type="button" class="pl-btn pri" id="pl-rev">Revisar y guardar</button></div>' +
      '<div class="pl-toast" id="pl-toast" role="status" aria-live="polite" hidden></div>' +
      '<div class="pl-fondo" id="pl-fondo" hidden><div class="pl-sheet" id="pl-sheet" role="dialog" aria-modal="true"></div></div>';
    raiz.hidden = false; document.body.classList.add('pl-abierta');
    raiz.querySelectorAll('.pl-tabs button').forEach(function(b){ b.onclick = function(){ confirmarFoco(); mostrar(b.dataset.v); }; });
    raiz.querySelector('#pl-volver').onclick = cerrarPlanilla;
    raiz.querySelector('#pl-undo').onclick = deshacer;
    raiz.querySelector('#pl-rev').onclick = revisar;
    raiz.querySelector('#pl-fondo').addEventListener('click', function(e){ if (e.target.id === 'pl-fondo') cerrarSheet(); });
  }
  function cerrarPlanilla(desdeAtras){
    if (!raiz) return;
    if (desdeAtras !== true && enHistorial) salirDelHistorial();
    if (!P) { raiz.hidden = true; return; }
    confirmarFoco(); guardarBorrador();
    raiz.hidden = true; raiz.innerHTML = ''; document.body.classList.remove('pl-abierta', 'pl-imp-hojas', 'pl-imp-guia');
    const r = resumen(); P = null;
    if (r.ks.length && typeof showToast === 'function') showToast('📋 La planilla queda guardada en este teléfono sin enviar (' + r.n + ' casilla(s)). Ábrala otra vez para revisarla y guardarla.', 'ok');
  }
  window.cerrarPlanilla = cerrarPlanilla;
  function pintarCargando(){ const c = document.getElementById('pl-cuerpo'); if (c) c.innerHTML = '<p class="pl-lead">Trayendo lo último de cada apartamento de la torre…</p>'; }
  function mostrar(v){
    if (!P || !raiz) return;
    vista = v;
    raiz.querySelectorAll('.pl-tabs button').forEach(function(b){ b.setAttribute('aria-selected', b.dataset.v === v); });
    document.getElementById('pl-barra').hidden = !(v === 'tel' || v === 'tabla');
    document.body.classList.toggle('pl-imp-guia', v === 'guia'); document.body.classList.toggle('pl-imp-hojas', v !== 'guia');
    const av = document.getElementById('pl-aviso'); av.hidden = !P.aviso; av.textContent = P.aviso || '';
    if (v === 'tel') pintarTel(); else if (v === 'tabla') pintarTabla(); else if (v === 'imp') pintarImp(); else pintarGuia();
  }
  let tAviso;
  function aviso(t){ const e = document.getElementById('pl-toast'); if (!e) return; e.textContent = t; e.hidden = false; clearTimeout(tAviso); tAviso = setTimeout(function(){ e.hidden = true; }, 4500); }
  window._plUltimoAviso = function(){ const e = document.getElementById('pl-toast'); return e ? e.textContent : ''; };
  function abrirSheet(html){ const f = document.getElementById('pl-fondo'), s = document.getElementById('pl-sheet'); s.innerHTML = html; f.hidden = false; const x = s.querySelector('[autofocus]') || s.querySelector('button'); if (x) setTimeout(function(){ x.focus(); }, 30); }
  function cerrarSheet(){ const f = document.getElementById('pl-fondo'); if (f) { f.hidden = true; document.getElementById('pl-sheet').innerHTML = ''; } }
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && P && raiz && !document.getElementById('pl-fondo').hidden) cerrarSheet(); });

  // ── 📱 en obra ──
  function claseCelda(k, c){
    if (nuevo(k, c)) return baja(k, c) ? 'pl-c cambio baja' : 'pl-c cambio';
    const v = prev(k, c); return v === null ? 'pl-c vacia' : v >= 100 ? 'pl-c done' : 'pl-c';
  }
  function pintarTel(){
    const cuerpo = document.getElementById('pl-cuerpo');
    const conCambios = function(p){ return P.aptos.some(function(x){ return x.p === p && (est.N[x.k] || est.C[x.k]); }); };
    let opts = ''; for (let p = P.pisoMin; p <= P.pisos; p++) opts += '<option value="' + p + '">' + nomPiso(p) + (conCambios(p) ? ' •' : '') + '</option>';
    const aptos = P.aptos.filter(function(x){ return x.p === piso; });
    const h = LISTA.find(function(x){ return x.id === hitoSel; });
    let t = '<div class="pl-piso"><button type="button" id="pl-ant" aria-label="Piso anterior"' + (piso <= P.pisoMin ? ' disabled' : '') + '>‹</button><select id="pl-psel" aria-label="Piso">' + opts + '</select><button type="button" id="pl-sig" aria-label="Piso siguiente"' + (piso >= P.pisos ? ' disabled' : '') + '>›</button></div>' +
      '<div class="pl-chips" role="group" aria-label="Hito">' + LISTA.map(function(x){
        const n = aptos.reduce(function(a, y){ return a + x.subs.filter(function(s){ return nuevo(y.k, s.c); }).length; }, 0);
        return '<button type="button" data-h="' + x.id + '" aria-pressed="' + (x.id === hitoSel) + '">H' + x.num + ' ' + esc(x.corto) + (n ? '<span class="pl-cnt">' + n + '</span>' : '') + '</button>'; }).join('') + '</div>';
    if (!aptos.length) t += '<p class="pl-lead">' + (P.aptos.length ? 'Este piso' : 'Esta torre') + ' no tiene apartamentos en la lista. Agréguelos aquí: se pueden poner varios y en varios pisos de una vez.</p>';
    else {
      t += '<div class="pl-gw"><table class="pl-g' + (aptos.length > 4 ? ' ancho' : '') + '"><thead><tr><th scope="col">' + nomPiso(piso) + '</th>' + aptos.map(function(x){
        return '<th scope="col"><button type="button" class="pl-apto' + (est.C[x.k] ? ' tiene' : '') + '" data-com="' + x.k + '">' + esc(x.a) + '<small>' + (est.C[x.k] ? 'nota' : '+ nota') + '</small></button></th>'; }).join('') + '</tr></thead><tbody>';
      h.subs.forEach(function(s){
        t += '<tr><th scope="row"><button type="button" class="pl-ay" data-ay="' + s.c + '"><span>' + s.c + (s.sino ? ' · sí / no' : '') + '</span>' + esc(s.n) + '</button></th>';
        aptos.forEach(function(x){
          const v = valor(x.k, s.c);
          t += '<td><button type="button" class="' + claseCelda(x.k, s.c) + '" data-k="' + x.k + '" data-c="' + s.c + '" aria-label="' + esc(s.n) + ', ' + esc(x.a) + ': ' + fmt(s.c, v) + '">' +
            (nuevo(x.k, s.c) ? '<b>' + fmt(s.c, v) + '</b><small>antes ' + fmt(s.c, prev(x.k, s.c)) + '</small>' : '<span>' + fmt(s.c, v) + '</span>') + '</button></td>';
        });
        t += '</tr>';
      });
      t += '</tbody></table></div><div class="pl-ley"><span><i class="g"></i>Lo último (gris)</span><span><i class="d"></i>Ya en 100 %</span><span><i class="c"></i>Cambiado hoy</span><span><i class="b"></i>Bajó: revisar</span><span>· sin dato</span></div>';
    }
    // Torres sin lista (Simón Rodríguez): los apartamentos se agregan desde el teléfono, no solo en la oficina.
    t += '<div class="pl-ib"><button type="button" class="pl-btn" id="pl-mas">＋ Apartamentos</button></div>';
    cuerpo.innerHTML = t;
    document.getElementById('pl-mas').onclick = agregarApto;
    const sel = document.getElementById('pl-psel'); sel.value = piso; sel.onchange = function(){ piso = +sel.value; pintarTel(); };
    document.getElementById('pl-ant').onclick = function(){ if (piso > P.pisoMin) { piso--; pintarTel(); } };
    document.getElementById('pl-sig').onclick = function(){ if (piso < P.pisos) { piso++; pintarTel(); } };
    cuerpo.querySelectorAll('.pl-chips button').forEach(function(b){ b.onclick = function(){ hitoSel = b.dataset.h; pintarTel(); }; });
    cuerpo.querySelectorAll('.pl-c').forEach(function(b){ b.onclick = function(){ tocar(b.dataset.k, b.dataset.c); }; });
    cuerpo.querySelectorAll('[data-com]').forEach(function(b){ b.onclick = function(){ comentario(b.dataset.com); }; });
    cuerpo.querySelectorAll('[data-ay]').forEach(function(b){ b.onclick = function(){ ayuda(b.dataset.ay); }; });
    barra();
  }
  // ADR-0053: lo que llegó al 100 % quedó cerrado; se puede corregir, pero se pide a propósito.
  function tocar(k, c){
    if (!nuevo(k, c) && prev(k, c) >= 100) {
      const s = SUBS[c], x = aptoDe(k);
      abrirSheet('<h3>' + s.c + ' ' + esc(s.n) + '</h3><p class="pl-sub">' + nomPiso(x.p) + ' · ' + esc(x.a) + '</p><p>✅ Ya estaba al 100 % y quedó cerrada. Ábrala solo si hay que corregirla.</p>' +
        '<div class="pl-acc"><button type="button" class="pl-btn" id="pl-c100-no" autofocus>Dejarla así</button><button type="button" class="pl-btn" id="pl-c100-si">🔓 Corregir</button></div>');
      document.getElementById('pl-c100-no').onclick = cerrarSheet;
      document.getElementById('pl-c100-si').onclick = function(){ teclado(k, c); };
      return;
    }
    teclado(k, c);
  }
  function teclado(k, c){
    const s = SUBS[c], x = aptoDe(k), antes = prev(k, c);
    const otros = P.aptos.filter(function(y){ return y.p === x.p && y.k !== k; });
    let buf = nuevo(k, c) ? String(est.N[k][c]) : '', fresco = true;
    abrirSheet('<h3>' + s.c + ' ' + esc(s.n) + '</h3><p class="pl-sub">' + nomPiso(x.p) + ' · ' + esc(x.a) + ' · antes: <b>' + (antes === null ? 'sin dato' : fmt(c, antes) + (s.sino ? '' : ' %')) + '</b></p>' +
      (s.sino ? '<div class="pl-sino"><button type="button" data-v="0" aria-pressed="' + (valor(k, c) === 0) + '">No hecha</button><button type="button" data-v="100" aria-pressed="' + (valor(k, c) >= 100) + '">Sí, hecha</button></div>'
        : '<div class="pl-disp" id="pl-kd" aria-live="polite"></div><div class="pl-kw" id="pl-kw"></div>' +
          '<div class="pl-rap">' + [0, 25, 50, 75, 100].map(function(v){ return '<button type="button" data-r="' + v + '">' + v + '</button>'; }).join('') + '</div>' +
          '<div class="pl-pad">' + [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function(d){ return '<button type="button" data-d="' + d + '">' + d + '</button>'; }).join('') +
          '<button type="button" class="sm" data-x="borrar">Borrar</button><button type="button" data-d="0">0</button><button type="button" class="sm" data-x="igual">Igual que antes</button></div>') +
      (otros.length ? '<label class="pl-todos"><input type="checkbox" id="pl-kt"> Lo mismo en ' + (otros.length > 4 ? 'los otros ' + otros.length + ' apartamentos' : otros.map(function(y){ return esc(y.a); }).join(', ')) + ' de este piso</label>' : '') +
      '<div class="pl-acc"><button type="button" class="pl-btn" id="pl-kno">Cancelar</button>' + (s.sino ? '' : '<button type="button" class="pl-btn pri" id="pl-ksi">Listo</button>') + '</div>');
    let hecho = false;
    const guardar = function(v){
      if (hecho) return; hecho = true;
      antesDeCambiar(); poner(k, c, v);
      const t = document.getElementById('pl-kt'), saltados = [];
      if (t && t.checked && v !== '') otros.forEach(function(y){ const vy = valor(y.k, c); if (vy !== null && v < vy) saltados.push(y.a + ' (' + fmt(c, vy) + ')'); else poner(y.k, c, v); });
      cerrarSheet(); guardarBorrador(); repintar();
      if (saltados.length) aviso('No se bajó ' + saltados.join(', ') + ': ya tenían más. Si es una corrección, cámbielos uno por uno.');
    };
    if (s.sino) document.querySelectorAll('#pl-sheet .pl-sino button').forEach(function(b){ b.onclick = function(){ guardar(+b.dataset.v); }; });
    else {
      const d = document.getElementById('pl-kd'), w = document.getElementById('pl-kw');
      const ver = function(){
        d.innerHTML = buf === '' ? '<span class="vacio">' + (antes === null ? '—' : antes) + '</span><small>%</small>' : buf + '<small>%</small>';
        const v = +buf, b = buf !== '' && antes !== null && v < antes;
        w.className = 'pl-kw' + (b ? ' ojo' : '');
        w.textContent = b ? 'Baja de ' + antes + ' % a ' + v + ' %. Si es una corrección se guarda igual y queda marcada.' : (buf === '' || v === antes ? 'Sin cambio: queda lo de antes.' : '');
      };
      document.querySelectorAll('#pl-sheet [data-r]').forEach(function(b){ b.onclick = function(){ buf = b.dataset.r; fresco = true; ver(); }; });
      document.querySelectorAll('#pl-sheet [data-d]').forEach(function(b){ b.onclick = function(){ const nb = (fresco ? '' : buf) + b.dataset.d; fresco = false; if (+nb <= 100) buf = String(+nb); else aviso('Como mucho 100 %.'); ver(); }; });
      document.querySelector('#pl-sheet [data-x="borrar"]').onclick = function(){ buf = buf.slice(0, -1); fresco = false; ver(); };
      document.querySelector('#pl-sheet [data-x="igual"]').onclick = function(){ buf = ''; fresco = true; ver(); };
      document.getElementById('pl-ksi').onclick = function(){ guardar(buf === '' ? '' : +buf); };
      ver();
    }
    document.getElementById('pl-kno').onclick = cerrarSheet;
  }
  function comentario(k){
    const x = aptoDe(k);
    abrirSheet('<h3>Nota · ' + nomPiso(x.p) + ' · ' + esc(x.a) + '</h3><p class="pl-sub">Opcional y sin límite. Va en las observaciones del informe de este apartamento.</p>' +
      '<textarea id="pl-ct" autofocus aria-label="Nota">' + esc(est.C[k] || '') + '</textarea><div class="pl-acc"><button type="button" class="pl-btn" id="pl-cno">Cancelar</button><button type="button" class="pl-btn pri" id="pl-csi">Listo</button></div>');
    document.getElementById('pl-cno').onclick = cerrarSheet;
    document.getElementById('pl-csi').onclick = function(){ const v = document.getElementById('pl-ct').value.trim(); antesDeCambiar(); if (v) est.C[k] = v; else delete est.C[k]; cerrarSheet(); guardarBorrador(); repintar(); };
  }
  function ayuda(c){
    const s = SUBS[c];
    abrirSheet('<h3>' + s.c + ' ' + esc(s.n) + '</h3><p class="pl-sub">' + esc(s.h.n) + '</p><p>' + esc(s.ay || 'Sin descripción.') + '</p><div class="pl-acc"><button type="button" class="pl-btn pri" id="pl-ayok" autofocus>Cerrar</button></div>');
    document.getElementById('pl-ayok').onclick = cerrarSheet;
  }
  function deshacer(){ if (!pila.length) return; est = JSON.parse(pila.pop()); guardarBorrador(); repintar(); aviso('Se deshizo el último cambio.'); }
  window._plDeshacer = deshacer;
  function repintar(){ if (vista === 'tel') pintarTel(); else if (vista === 'tabla') pintarTabla(); barra(); }

  // ── 💻 en la oficina ──
  const prom = function(k, h){ const v = h.subs.map(function(s){ return valor(k, s.c); }).filter(function(x){ return x !== null; }); return v.length ? Math.round(v.reduce(function(a, b){ return a + b; }, 0) / v.length) : null; };
  const posterior = function(k){ const x = P.prev[k]; return !!(P.impresa && x && x.fecha && x.fecha > P.impresa); };
  const claseInput = function(k, c){ return nuevo(k, c) ? (baja(k, c) ? 'pl-pc cambio baja' : 'pl-pc cambio') : (prev(k, c) >= 100 ? 'pl-pc done' : 'pl-pc'); };
  const textoInput = function(k, c){ return nuevo(k, c) ? fmt(c, est.N[k][c]) : ''; };
  function pintarTabla(){
    const cuerpo = document.getElementById('pl-cuerpo');
    const tw0 = cuerpo.querySelector('.pl-tw'), sx = tw0 ? tw0.scrollLeft : 0, sy = tw0 ? tw0.scrollTop : 0;
    const nPost = P.aptos.filter(function(x){ return posterior(x.k); }).length;
    let t = '<div class="pl-ocab"><label>La pasa<input id="pl-pasa" type="text" autocomplete="off" placeholder="Nombre de quien la pasa" value="' + esc(P.pasa) + '"></label>' +
      '<label>Hoja impresa el<input id="pl-impresa" type="date" value="' + esc(P.impresa) + '"></label>' +
      '<label>Pisos de la torre<input id="pl-npisos" type="number" min="1" max="40" inputmode="numeric" value="' + P.pisos + '"></label>' +
      '<button type="button" class="pl-btn" id="pl-mas">＋ Apartamentos</button><button type="button" class="pl-btn pri" id="pl-airimp">🖨 Imprimir hojas para obra</button></div>' +
      '<p class="pl-lead">Si viene de una hoja impresa, ponga quién la pasa y la fecha de la hoja. Enter baja al apartamento siguiente; Tab va a la derecha. Se puede pegar un bloque copiado de Excel.</p>' +
      (nPost ? '<div class="pl-post">⚠️ <b>' + nPost + ' apartamento(s) tuvieron otro informe después de que se imprimió la hoja</b> (marcados con ⚠️). La hoja trae un número más viejo: si el de la hoja es menor, no lo baje sin revisar.</div>' : '') +
      '<div class="pl-tw"><table class="pl-o"><thead><tr><th class="esq" rowspan="2" scope="col">Piso · apto</th>';
    LISTA.forEach(function(h){ const ab = !!abiertos[h.id]; t += '<th scope="colgroup" colspan="' + (ab ? h.subs.length : 1) + '"><button type="button" class="pl-hb" data-h="' + h.id + '" aria-expanded="' + ab + '"><span class="fl">▸</span>H' + h.num + ' ' + esc(h.corto) + '</button></th>'; });
    t += '<th rowspan="2" scope="col">Nota</th></tr><tr>';
    LISTA.forEach(function(h){ if (abiertos[h.id]) h.subs.forEach(function(s){ t += '<th scope="col" title="' + esc(s.n) + '"' + (fueraPresupuesto(s.c) ? ' class="opc"' : '') + '>' + s.c + '</th>'; }); else t += '<th scope="col">prom.</th>'; });
    t += '</tr></thead><tbody>';
    P.aptos.forEach(function(x, r){
      t += '<tr' + (x.i === 0 && x.p > P.pisoMin ? ' class="np"' : '') + '><th scope="row">' + (posterior(x.k) ? '<span title="Otro informe del ' + esc(fechaLarga(P.prev[x.k].fecha)) + '">⚠️</span> ' : '') + corPiso(x.p) + ' · ' + esc(x.a) + '</th>';
      let col = 0;
      LISTA.forEach(function(h){
        if (abiertos[h.id]) h.subs.forEach(function(s){
          t += '<td><input class="' + claseInput(x.k, s.c) + '" inputmode="' + (s.sino ? 'text' : 'decimal') + '" maxlength="6" autocomplete="off" data-r="' + r + '" data-col="' + (col++) + '" data-c="' + s.c + '" data-k="' + x.k + '" placeholder="' + fmt(s.c, prev(x.k, s.c)) + '" value="' + textoInput(x.k, s.c) + '" aria-label="' + esc(s.n) + ', piso ' + x.p + ' ' + esc(x.a) + '"></td>';
        });
        else { const p = prom(x.k, h); t += '<td class="prom">' + (p === null ? '—' : p + '%<span class="bar"><span style="width:' + p + '%"></span></span>') + '</td>'; }
      });
      t += '<td><input class="pl-com" data-com="' + x.k + '" value="' + esc(est.C[x.k] || '') + '" placeholder="—" aria-label="Nota piso ' + x.p + ' ' + esc(x.a) + '"></td></tr>';
    });
    cuerpo.innerHTML = t + '</tbody></table></div>';
    const tw = cuerpo.querySelector('.pl-tw'); tw.scrollLeft = sx; tw.scrollTop = sy;
    document.getElementById('pl-pasa').onchange = function(e){ P.pasa = e.target.value.trim(); e.target.classList.remove('err'); guardarBorrador(); };
    document.getElementById('pl-impresa').onchange = function(e){ P.impresa = e.target.value; guardarBorrador(); pintarTabla(); };
    document.getElementById('pl-npisos').onchange = function(e){ const n = Math.max(1, Math.min(40, parseInt(e.target.value, 10) || 1)); const maxConDato = Math.max.apply(null, [0].concat(P.aptos.filter(function(x){ return P.prev[x.k] || est.N[x.k] || est.C[x.k]; }).map(function(x){ return x.p; })));
      if (n < maxConDato) { aviso('El piso ' + maxConDato + ' tiene datos: no se puede quitar.'); e.target.value = P.pisos; return; }
      P.pisosElegido = n; armarAptos(); guardarBorrador(); pintarTabla(); };
    document.getElementById('pl-mas').onclick = agregarApto;
    document.getElementById('pl-airimp').onclick = function(){ mostrar('imp'); };
    cuerpo.querySelectorAll('.pl-hb').forEach(function(b){ b.onclick = function(){ abiertos[b.dataset.h] = !abiertos[b.dataset.h]; pintarTabla(); }; });
    cuerpo.querySelectorAll('input.pl-pc').forEach(function(i){
      i.addEventListener('change', function(){ escribir(i); });
      i.addEventListener('keydown', function(e){
        if (e.key !== 'Enter') return; e.preventDefault(); escribir(i);
        const sig = cuerpo.querySelector('input.pl-pc[data-col="' + i.dataset.col + '"][data-r="' + (+i.dataset.r + (e.shiftKey ? -1 : 1)) + '"]');
        if (sig) { sig.focus(); sig.select(); }
      });
      i.addEventListener('paste', function(e){ pegar(e, i); });
    });
    cuerpo.querySelectorAll('input.pl-com').forEach(function(i){ i.addEventListener('change', function(){ const v = i.value.trim(); antesDeCambiar(); if (v) est.C[i.dataset.com] = v; else delete est.C[i.dataset.com]; P.oficina = true; guardarBorrador(); barra(); }); });
    barra();
  }
  function fueraPresupuesto(c){ const p = (typeof _presupuestoTorre !== 'undefined') ? _presupuestoTorre : null; return !!(p && p.codigos && p.torre === P.sector + '-' + P.torre && !p.codigos[c]); }
  function escribir(i){
    const k = i.dataset.k, c = i.dataset.c, raw = i.value;
    if (String(raw).trim() === textoInput(k, c)) return;
    const v = _plLeerValor(raw, SUBS[c].sino);
    if (v === null) { i.className = 'pl-pc mal'; aviso('«' + String(raw).trim().slice(0, 12) + '» no es un % válido (0 a 100' + (SUBS[c].sino ? ', o sí / no' : '') + '). Quedó como estaba.'); i.value = textoInput(k, c); setTimeout(function(){ if (P && i.isConnected) i.className = claseInput(k, c); }, 1800); return; }
    antesDeCambiar(); poner(k, c, v); P.oficina = true; guardarBorrador();
    i.value = textoInput(k, c); i.className = claseInput(k, c);
    if (baja(k, c)) aviso('Baja de ' + fmt(c, prev(k, c)) + ' a ' + fmt(c, est.N[k][c]) + ': queda marcada para revisar.');
    barra();
  }
  function pegar(e, i){
    const txt = (e.clipboardData || window.clipboardData).getData('text');
    if (!/[\t\n]/.test(String(txt).trim())) return;
    e.preventDefault();
    const filas = txt.replace(/\r/g, '').replace(/\n+$/, '').split('\n').map(function(f){ return f.split('\t'); });
    const r0 = +i.dataset.r, c0 = +i.dataset.col, cuerpo = document.getElementById('pl-cuerpo');
    let ok = 0, malos = 0, fuera = 0; antesDeCambiar();
    filas.forEach(function(f, dr){ f.forEach(function(raw, dc){
      const dst = cuerpo.querySelector('input.pl-pc[data-r="' + (r0 + dr) + '"][data-col="' + (c0 + dc) + '"]');
      if (!dst) { if (String(raw).trim() !== '') fuera++; return; }
      const v = _plLeerValor(raw, SUBS[dst.dataset.c].sino);
      if (v === null) { malos++; return; } if (v === '') return;
      poner(dst.dataset.k, dst.dataset.c, v); ok++;
    }); });
    if (ok) P.oficina = true;
    guardarBorrador(); pintarTabla();
    aviso('Se pegaron ' + ok + ' casilla' + (ok === 1 ? '' : 's') + (malos ? '; ' + malos + ' no eran % válidos y se dejaron como estaban' : '') + (fuera ? '; ' + fuera + ' quedaban fuera de la tabla (abra el hito o revise desde dónde pegó)' : '') + '.');
  }
  function agregarApto(){
    abrirSheet('<h3>＋ Apartamentos</h3><p class="pl-sub">Los que no están en la lista de la torre. Se pueden poner varios, separados por espacio o coma, y en varios pisos de una vez. La planta baja es el piso 0.</p>' +
      '<div class="pl-ocab"><label>Del piso<input id="pl-np" type="number" min="0" max="40" inputmode="numeric" value="' + piso + '"></label><label>al piso<input id="pl-np2" type="number" min="0" max="40" inputmode="numeric" value="' + piso + '"></label></div>' +
      '<div class="pl-ocab"><label style="flex:1">Apartamentos<input id="pl-na" type="text" autocapitalize="characters" autocomplete="off" placeholder="Ej: A1 A2 B1 B2"></label></div>' +
      '<div class="pl-acc"><button type="button" class="pl-btn" id="pl-nno">Cancelar</button><button type="button" class="pl-btn pri" id="pl-nsi">Agregar</button></div>');
    document.getElementById('pl-nno').onclick = cerrarSheet;
    document.getElementById('pl-nsi').onclick = function(){
      const p1 = parseInt(document.getElementById('pl-np').value, 10), p2v = parseInt(document.getElementById('pl-np2').value, 10), p2 = isNaN(p2v) ? p1 : p2v;
      const nombres = _aptosEscritos(document.getElementById('pl-na').value, '');
      if (!(p1 >= 0 && p1 <= 40) || !(p2 >= p1 && p2 <= 40) || !nombres.length) { aviso('Ponga los pisos (0 a 40, el primero no mayor que el segundo) y al menos un apartamento.'); return; }
      const nuevos = [];
      for (let p = p1; p <= p2; p++) nombres.forEach(function(a){ if (!P.aptos.some(function(x){ return x.k === bloque(p, a); }) && !nuevos.some(function(x){ return x.p === p && x.a === a; })) nuevos.push({ p: p, a: a }); });
      if (P.aptos.length + nuevos.length > 600) { aviso('Serían ' + (P.aptos.length + nuevos.length) + ' apartamentos: como mucho 600 por planilla.'); return; }
      const ya = (p2 - p1 + 1) * nombres.length - nuevos.length;
      if (!nuevos.length) { aviso(ya === 1 ? 'Ese apartamento ya está en la planilla.' : 'Esos apartamentos ya están en la planilla.'); return; }
      P.extra = P.extra.concat(nuevos); P.pisosElegido = Math.max(P.pisosElegido || 0, p2); armarAptos();
      if (!P.aptos.some(function(x){ return x.p === piso; })) piso = nuevos[0].p;
      guardarBorrador(); cerrarSheet(); repintar();
      aviso('Se agregaron ' + nuevos.length + ' apartamento' + (nuevos.length === 1 ? '' : 's') + (ya ? ' (' + ya + ' ya estaban)' : '') + '.');
    };
  }


  // ── 🖨 imprimir ──
  const cabe = function(t){ return t !== 'toda' || P.aptos.length <= TAMANOS.toda.filas; };
  function tramos(){
    const n = P.pisos - P.pisoMin + 1, porPiso = Math.max(1, P.porPiso || Math.ceil(P.aptos.length / Math.max(1, n)));
    const max = tamano === 'toda' ? n : Math.max(1, Math.floor(TAMANOS[tamano].filas / porPiso));
    const partes = Math.ceil(n / max), paso = Math.ceil(n / partes), out = [];
    for (let a = P.pisoMin; a <= P.pisos; a += paso) out.push([a, Math.min(P.pisos, a + paso - 1)]);
    return out;
  }
  function grupos(){
    const g = []; let cur = [], n = 0;
    LISTA.filter(function(h){ return enPapel[h.id]; }).forEach(function(h){ if (n + h.subs.length > MAX_COLS && cur.length) { g.push(cur); cur = []; n = 0; } cur.push(h); n += h.subs.length; });
    if (cur.length) g.push(cur); return g;
  }
  // En la hoja, un hito de una o dos columnas lleva su nombre corto: el largo no cabe.
  function pintarImp(){
    if (!cabe(tamano)) tamano = 'compacta';
    const tr = tramos(), gs = grupos(), total = gs.length * tr.length;
    let t = '<p class="pl-lead">Carta horizontal, para llevar a obra. Lo gris es el último % de cada casilla; lo que ya está en 100 % sale sombreado: ahí no hay nada que anotar.</p>' +
      '<div class="pl-ctrl" role="group" aria-label="Hitos">' + LISTA.map(function(h){ return '<label><input type="checkbox" data-h="' + h.id + '"' + (enPapel[h.id] ? ' checked' : '') + '> H' + h.num + ' ' + esc(h.corto) + '</label>'; }).join('') + '</div>' +
      '<div class="pl-ctrl" role="group" aria-label="Tamaño"><span>Tamaño de la hoja:</span>' + Object.keys(TAMANOS).map(function(k){
        const n = k === 'toda' ? P.pisos - P.pisoMin + 1 : (function(){ const s = tamano; tamano = k; const x = tramos()[0]; tamano = s; return x[1] - x[0] + 1; })();
        return '<label' + (cabe(k) ? '' : ' title="No caben ' + P.aptos.length + ' apartamentos en una hoja"') + '><input type="radio" name="pl-tam" value="' + k + '"' + (k === tamano ? ' checked' : '') + (cabe(k) ? '' : ' disabled') + '> ' + TAMANOS[k].txt + (cabe(k) ? ' · ' + n + ' piso' + (n === 1 ? '' : 's') : ' · no cabe') + '</label>'; }).join('') + '</div>' +
      '<div class="pl-ib"><button type="button" class="pl-btn pri" id="pl-imprimir"' + (total ? '' : ' disabled') + '>🖨 Imprimir estas hojas</button><span class="pl-tot">' + (total ? total + ' hoja' + (total === 1 ? '' : 's') : 'Marque al menos un hito.') + '</span></div><div id="pl-hojas">';
    const hoyL = fechaLarga(HOY()); let nh = 0;
    gs.forEach(function(g){ tr.forEach(function(m){
      nh++;
      const cols = []; g.forEach(function(h){ h.subs.forEach(function(s){ cols.push(s); }); });
      const filas = P.aptos.filter(function(x){ return x.p >= m[0] && x.p <= m[1]; });
      const denso = filas.length > 30;
      let tb = '<table><colgroup><col style="width:60px">' + cols.map(function(){ return '<col>'; }).join('') + '<col style="width:120px"></colgroup><thead><tr><th class="hg"></th>' +
        g.map(function(h){ return '<th class="hg" colspan="' + h.subs.length + '">H' + h.num + ' ' + esc(h.subs.length <= 2 ? h.corto : String(h.n).replace(/^HITO \d+: /, '')) + '</th>'; }).join('') + '<th class="hg"></th></tr><tr><th>Piso<br>apto</th>' +
        cols.map(function(s){ return '<th><span class="c">' + s.c + '</span>' + esc(s.n.length > 34 ? s.n.slice(0, 32) + '…' : s.n) + (s.sino ? ' (✓)' : '') + '</th>'; }).join('') + '<th>Observaciones</th></tr></thead><tbody>';
      filas.forEach(function(x, i){
        tb += '<tr' + (i > 0 && x.p !== filas[i - 1].p ? ' class="np"' : '') + '><th>' + corPiso(x.p) + ' ' + esc(x.a) + '</th>' +
          cols.map(function(s){ const v = prev(x.k, s.c); return '<td' + (v >= 100 ? ' class="lleno"' : '') + '><span class="p">' + (v === null ? '' : s.sino ? (v >= 100 ? '✓' : 'No') : v) + '</span></td>'; }).join('') + '<td></td></tr>';
      });
      t += '<div class="pl-hm"><div class="pl-hoja' + (denso ? ' denso' : '') + '"><div class="h-cab"><h3>Planilla de avance por apartamento · ' + esc(P.sector) + ' ' + esc(P.torre) + ' · ' + esc(P.cab.empresa || '') + '</h3><div class="der">Hitos ' + g.map(function(h){ return h.num; }).join(', ') + ' · Pisos ' + (m[0] === 0 ? 'PB' : m[0]) + ' a ' + m[1] + '<br>Impresa el ' + hoyL + ' · Hoja ' + nh + ' de ' + total + '</div></div>' +
        '<div class="h-campos"><span>Inspector:</span><span>Fecha de la visita:</span><span>Firma:</span></div>' + tb + '</tbody></table>' +
        '<div class="h-pie"><span>Anote el % nuevo solo donde cambió. Lo gris es lo último cargado; lo sombreado ya está en 100 %. Al pasarla, ponga «Hoja impresa el ' + hoyL + '».</span></div></div></div>';
    }); });
    document.getElementById('pl-cuerpo').innerHTML = t + '</div>';
    document.querySelectorAll('#pl-cuerpo .pl-ctrl input[type=checkbox]').forEach(function(i){ i.onchange = function(){ enPapel[i.dataset.h] = i.checked; pintarImp(); }; });
    document.querySelectorAll('#pl-cuerpo .pl-ctrl input[type=radio]').forEach(function(i){ i.onchange = function(){ tamano = i.value; pintarImp(); }; });
    document.getElementById('pl-imprimir').onclick = function(){ document.body.classList.add('pl-imp-hojas'); document.body.classList.remove('pl-imp-guia'); window.print(); };
    escalar();
  }
  function escalar(){ document.querySelectorAll('#planilla .pl-hm').forEach(function(m){ const s = Math.min(1, m.clientWidth / 1056); m.firstElementChild.style.transform = 'scale(' + s + ')'; m.style.height = (816 * s) + 'px'; }); }
  addEventListener('resize', function(){ if (P && vista === 'imp') escalar(); });

  // ── 📖 guía ──
  function pintarGuia(){
    document.getElementById('pl-cuerpo').innerHTML = '<div class="pl-ib"><button type="button" class="pl-btn pri" id="pl-impguia">🖨 Imprimir la guía</button></div><h2 class="pl-gtit">Guía de subpartidas por apartamento</h2><div class="pl-guia">' +
      LISTA.map(function(h){ return '<section><h3>' + esc(h.n) + '</h3><dl>' + h.subs.map(function(s){ return '<dt><span>' + s.c + '</span>' + esc(s.n) + '</dt><dd>' + esc(s.ay || 'Sin descripción.') + '</dd>'; }).join('') + '</dl></section>'; }).join('') + '</div>';
    document.getElementById('pl-impguia').onclick = function(){ document.body.classList.add('pl-imp-guia'); document.body.classList.remove('pl-imp-hojas'); window.print(); };
  }

  // ── revisar y guardar ──
  function resumen(){
    if (!P) return { ks: [], n: 0, bajas: [] };
    const ks = P.aptos.map(function(x){ return x.k; }).filter(function(k){ return est.N[k] || est.C[k]; });
    const n = ks.reduce(function(a, k){ return a + (est.N[k] ? Object.keys(est.N[k]).length : 0); }, 0);
    const bajas = []; ks.forEach(function(k){ Object.keys(est.N[k] || {}).forEach(function(c){ if (baja(k, c)) bajas.push([k, c]); }); });
    return { ks: ks, n: n, bajas: bajas };
  }
  window._plResumen = resumen;
  function barra(){
    const r = resumen(), b = document.getElementById('pl-btxt'); if (!b) return;
    b.innerHTML = r.ks.length ? '<b>' + r.n + ' casilla' + (r.n === 1 ? '' : 's') + '</b> en ' + r.ks.length + ' apartamento' + (r.ks.length === 1 ? '' : 's') + (r.bajas.length ? ' · <span class="ojo">' + r.bajas.length + ' baja' + (r.bajas.length === 1 ? '' : 's') + '</span>' : '') : 'Toque una casilla para cambiarla.';
    document.getElementById('pl-rev').disabled = !r.ks.length;
    document.getElementById('pl-undo').disabled = !pila.length;
  }
  // El número del informe de un apartamento, armado como updateNroInforme con las piezas de la cabecera. No se parte el
  // número que muestra el formulario: desde estructura trae «-ESTR-», y uno reabierto muestra el suyo sin recalcularlo.
  function inicialesDe(insp){
    const partes = String((insp || [])[0] || '').replace(/^(ING|ARQ|TSU)\.?\s*/i, '').trim().split(/\s+/);
    return _limpiar(((partes[0] || '')[0] || '') + ((partes[1] || '')[0] || '')) || '--';
  }
  function nroPara(x, cab, sector, torre){
    cab = cab || P.cab; sector = sector || P.sector; torre = torre || P.torre;
    const f = /^\d{4}-\d{2}-\d{2}$/.test(cab.fecha || '') ? cab.fecha.slice(2).replace(/-/g, '') : '------';
    const n = (TEST_MODE ? 'PRUEBA-' : '') + [sector, normalizaTorre(torre), bloque(x.p, x.a), f, inicialesDe(cab.inspectores)].join('-');
    return /(^|-)XX-|-T---(-|$)|P--|A--|------|---$/.test(n) ? null : n;
  }
  window._plNroPara = function(p, a){ return P ? nroPara({ p: p, a: a }) : nroPara({ p: p, a: a }, getFormData(), getSectorActual(), getTorreActual()); };
  function faltantes(){
    const f = [];
    if (P.impresa && !P.pasa) f.push('quién pasa la hoja (arriba, en «💻 Oficina»)');
    if (P.impresa && P.cab.fecha < P.impresa) f.push('que la fecha de la visita (' + fechaLarga(P.cab.fecha) + ', en la cabecera) no sea anterior a la hoja impresa (' + fechaLarga(P.impresa) + ')');
    if (P.impresa && P.impresa > HOY()) f.push('una fecha de hoja impresa que no sea futura');
    if (!nroPara({ p: 1, a: 'A1' })) f.push('el número de informe completo en la cabecera (convenio, torre, fecha e inspector)');
    return f;
  }
  function confirmarFoco(){ const a = document.activeElement; if (a && a.classList && a.classList.contains('pl-pc') && raiz && raiz.contains(a)) escribir(a); }
  function revisar(){
    confirmarFoco();
    const r = resumen(), falta = faltantes();
    if (!r.ks.length) return;
    if (vista === 'tabla') { const e = document.getElementById('pl-pasa'); if (e && P.impresa && !P.pasa) e.classList.add('err'); }
    const lista = getSavedReports();
    let h = '<h3>Se guardarían ' + r.ks.length + ' informe' + (r.ks.length === 1 ? '' : 's') + '</h3><p class="pl-sub">Uno por apartamento que cambió, con la cabecera del formulario (' + esc(fechaLarga(P.cab.fecha)) + ', ' + esc((P.cab.inspectores || []).join(', ')) + ')' + (P.pasa ? '; la pasó ' + esc(P.pasa) : '') + '. Quedan en «Informes» para enviar.</p>';
    if (falta.length) h += '<div class="pl-faltan">Antes de guardar falta ' + falta.join('; ') + '.</div>';
    let choques = 0, correcciones = 0;
    r.ks.forEach(function(k){
      const x = aptoDe(k), cs = est.N[k] ? Object.keys(est.N[k]) : [], nro = nroPara(x);
      const choca = nro && lista.some(function(b){ return b && b.nro === nro && !b.enviado; });
      // Mismo número = mismo apartamento, mismo día y misma inspectora: el relevo lo guarda como corrección (-r2) y pasa a
      // ser el último. Lleva los % de la planilla, no las fotos ni las observaciones del que ya se envió.
      const enviadoHoy = !choca && nro && (lista.some(function(b){ return b && b.nro === nro && b.enviado; }) || (P.prev[k] && P.prev[k].nro === nro && !P.prev[k].telefono));
      if (choca) choques++; if (enviadoHoy) correcciones++;
      h += '<div class="pl-ra"><h4>' + nomPiso(x.p) + ' · ' + esc(x.a) + '</h4><div class="pl-nro">' + esc(nro || '—') + '</div>' +
        (choca ? '<div class="pl-faltan">Ya hay un informe de este apartamento con esta fecha en el teléfono, sin enviar. Envíelo o bórrelo primero: este no se guarda.</div>' : '') +
        (enviadoHoy ? '<div class="pl-post">Ya se envió hoy un informe de este apartamento con este número. Este entra como corrección y pasa a ser el último del día: lleva los % de la planilla, pero no las fotos ni las observaciones del que ya se envió (esas quedan en el de antes). Si el de hoy tenía fotos, mejor corríjalo en «Informes».</div>' : '') + '<ul>' +
        cs.map(function(c){ return '<li' + (baja(k, c) ? ' class="b"' : '') + '>' + c + ' ' + esc(SUBS[c].n) + ': ' + (prev(k, c) === null ? 'sin dato' : fmt(c, prev(k, c))) + ' → <b>' + fmt(c, est.N[k][c]) + '</b>' + (baja(k, c) ? ' (baja)' : '') + '</li>'; }).join('') +
        (est.C[k] ? '<li>Nota: ' + esc(est.C[k]) + '</li>' : '') + (!cs.length ? '<li>Solo nota: lleva los mismos % de antes.</li>' : '') + '</ul></div>';
    });
    if (r.bajas.length) h += '<label class="pl-todos"><input type="checkbox" id="pl-rb"> Confirmo que ' + (r.bajas.length === 1 ? 'la baja es una corrección' : 'las ' + r.bajas.length + ' bajas son correcciones') + '</label>';
    if (correcciones) h += '<label class="pl-todos"><input type="checkbox" id="pl-rr"> Entiendo que ' + (correcciones === 1 ? 'el ya enviado hoy queda reemplazado' : 'los ' + correcciones + ' ya enviados hoy quedan reemplazados') + ' por este</label>';
    h += '<div class="pl-acc"><button type="button" class="pl-btn" id="pl-rseg">Seguir editando</button><button type="button" class="pl-btn pri" id="pl-rgua">Guardar</button></div>' +
      '<div class="pl-acc"><button type="button" class="pl-btn peligro" id="pl-rdes">Descartar los cambios</button></div>';
    abrirSheet(h);
    const g = document.getElementById('pl-rgua'), cb = document.getElementById('pl-rb'), cr = document.getElementById('pl-rr');
    const habil = function(){ g.disabled = falta.length > 0 || (cb && !cb.checked) || (cr && !cr.checked) || choques === r.ks.length; };
    if (cb) cb.onchange = habil; if (cr) cr.onchange = habil; habil();
    document.getElementById('pl-rseg').onclick = cerrarSheet;
    g.onclick = function(){ if (!g.disabled) { g.disabled = true; guardarTodo(r); } };
    document.getElementById('pl-rdes').onclick = function(){
      abrirSheet('<h3>¿Descartar los cambios?</h3><p class="pl-sub">Se pierden ' + r.n + ' casilla(s) y las notas de ' + r.ks.length + ' apartamento(s). No se puede deshacer.</p><div class="pl-acc"><button type="button" class="pl-btn" id="pl-dno" autofocus>No, volver</button><button type="button" class="pl-btn peligro" id="pl-dsi">Sí, descartar</button></div>');
      document.getElementById('pl-dno').onclick = revisar;
      document.getElementById('pl-dsi').onclick = function(){ est = { N: {}, C: {} }; pila = []; guardarBorrador(); cerrarSheet(); repintar(); aviso('Se descartaron los cambios.'); };
    };
  }
  window._plRevisar = revisar;
  // Todas las subpartidas del apartamento —las de antes y las nuevas— en el formato del formulario.
  function partidasPara(k){
    const out = {};
    PARTIDAS.forEach(function(h){
      if (!(AMBITO_SUB[h.id] || []).some(function(a){ return a !== 'T'; })) return;
      out[h.id] = (h.items || []).map(function(_, i){
        const u = (UNIDADES[h.id] || [])[i], amb = (AMBITO_SUB[h.id] || [])[i] || 'AMBOS';
        const r = { pr: '', ej: '', ev: '', ud: u === 'sino' ? '' : (Array.isArray(u) ? u[0] : (u || '')), sn: '', pct: '' };
        if (amb === 'T') { r.fueraDeAmbito = true; return r; }
        const v = valor(k, (CODIGOS_SUB[h.id] || [])[i]);
        if (v === null || v === undefined) return r;
        if (u === 'sino') { r.pr = '100'; r.ej = v >= 100 ? '100' : '0'; r.sn = v >= 100 ? 'Sí' : 'No'; }
        else if (u === 'estado') { r.pr = '100'; r.ej = String(v); }
        else r.pct = String(v);
        return r;
      });
      out[h.id + '_extra'] = [];
    });
    return out;
  }
  window._plPartidasPara = partidasPara;
  function guardarTodo(r){
    const lista = getSavedReports(), hechos = [], saltados = [], base = P.cab, ahora = Date.now();
    r.ks.forEach(function(k, j){
      const x = aptoDe(k), nro = nroPara(x);
      if (!nro || lista.some(function(b){ return b && b.nro === nro && !b.enviado; })) { saltados.push(corPiso(x.p) + ' ' + x.a); return; }
      const d = JSON.parse(JSON.stringify(base));
      d.id = 'draft_' + ahora + '_pl' + j; d.formType = 'detallado'; d.lista = VERSION_LISTA; d.ambito = 'apartamento'; d.vista = '';
      d.piso = nomPiso(x.p); d.apto = x.a; d.nro = nro; d.timestamp = new Date().toLocaleString();
      d.partidas = partidasPara(k); d.extraRows = {}; d.noInspeccionados = []; d.obs_sp = ''; d.obs_general = est.C[k] || '';
      d.actividades = ''; d.actividadesHeredada = false; d.agentes = [];
      d.fotobs = {}; Object.keys(d.partidas).forEach(function(pid){ if (!/_extra$/.test(pid)) d.fotobs[pid] = ''; });
      d.planilla = { origen: (P.oficina || P.impresa) ? 'oficina' : 'obra', pasa: P.pasa || '', impresa: P.impresa || '', guardada: new Date().toISOString() };
      d.uso = { planilla: true };
      lista.unshift(d); hechos.push({ k: k, nro: nro });
    });
    try { localStorage.setItem('garmel_reports_list', JSON.stringify(lista)); }
    catch (e) { aviso('❌ El teléfono se quedó sin espacio. Envíe o elimine informes y vuelva a guardar: la planilla no se perdió.'); document.getElementById('pl-rgua').disabled = false; return; }
    if (typeof currentEditingIndex !== 'undefined' && currentEditingIndex !== null) currentEditingIndex += hechos.length;
    hechos.forEach(function(h){ const x = P.prev[h.k] = P.prev[h.k] || { pcts: {} }; x.pcts = Object.assign({}, x.pcts || {}, est.N[h.k] || {}); x.fecha = P.cab.fecha; x.nro = h.nro; x.telefono = true; delete est.N[h.k]; delete est.C[h.k]; });
    pila = []; guardarBorrador();
    if (typeof actualizarContadores === 'function') actualizarContadores();
    abrirSheet('<h3>✅ ' + hechos.length + ' informe' + (hechos.length === 1 ? '' : 's') + ' en «Informes»</h3><p class="pl-sub">Se envían con «Enviar todos», como cualquier informe. Sin señal se quedan en el teléfono hasta que vuelva.</p>' +
      (saltados.length ? '<div class="pl-faltan">No se guardaron: ' + esc(saltados.join(', ')) + '. Ya hay un informe sin enviar de ese apartamento con esta fecha.</div>' : '') +
      '<ul class="pl-nros">' + hechos.map(function(h){ return '<li>' + esc(h.nro) + '</li>'; }).join('') + '</ul>' +
      '<div class="pl-acc"><button type="button" class="pl-btn" id="pl-fseg">Seguir en la planilla</button><button type="button" class="pl-btn pri" id="pl-fenv" autofocus>Enviar ahora</button></div>');
    document.getElementById('pl-fseg').onclick = function(){ cerrarSheet(); repintar(); };
    document.getElementById('pl-fenv').onclick = function(){ if (this.disabled) return; this.disabled = true; cerrarSheet(); cerrarPlanilla(); if (typeof enviarPendientes === 'function') enviarPendientes(); };
    repintar();
  }

  // ── el botón en el formulario, junto al ámbito ──
  function boton(){
    // Después de los botones del ámbito (apartamento, torre, estructura), no entre ellos.
    const t = document.getElementById('btnAmbEstr') || document.getElementById('btnAmbTorre'); if (!t || document.getElementById('btn-planilla')) return;
    const b = document.createElement('button'); b.type = 'button'; b.id = 'btn-planilla'; b.className = 'btn-planilla';
    b.textContent = '📋 Planilla de la torre'; b.title = 'Varios apartamentos a la vez: el último % en gris, se cambia solo lo que avanzó';
    b.onclick = function(){ abrirPlanilla(); };
    t.parentNode.insertBefore(b, t.nextSibling);
  }
  if (document.readyState !== 'loading') setTimeout(boton, 0); else document.addEventListener('DOMContentLoaded', boton);

  // Una fila de conteo (puntos, piezas) que llega con % de planilla no tiene dónde mostrarlo en el formulario: se le
  // pone el campo de % para que no se pierda al abrir el informe ni al traer sus mediciones (ADR-0056).
  function asegurarPct(partidas){
    Object.keys(partidas || {}).forEach(function(pid){
      const filas = partidas[pid]; if (!Array.isArray(filas) || /_extra$/.test(pid)) return;
      filas.forEach(function(f, i){
        if (!f || f.pct === undefined || String(f.pct).trim() === '') return;
        const rid = pid + '_' + i; if (document.getElementById('pm_' + rid)) return;
        const ej = document.getElementById('ej_' + rid); if (!ej || ej.type === 'hidden') return;
        const m = document.createElement('input'); m.type = 'text'; m.className = 'num pct-man'; m.id = 'pm_' + rid; m.dataset.rid = rid; m.dataset.p = pid;
        m.setAttribute('inputmode', 'decimal'); m.placeholder = '%'; m.title = '% de la planilla de avance; si se deja vacío se calcula con las cantidades';
        m.oninput = function(){ recalcRow(m); };
        ej.parentNode.insertBefore(m, ej.nextSibling);
      });
    });
  }
  window._plAsegurarPct = asegurarPct;
  // Al abrir un borrador, loadDraftData vuelve a dibujar las filas (initAppContent) y después las llena: el campo se pone
  // entre las dos cosas.
  // La marca de la planilla (origen, quién la pasó, la hoja impresa) sigue con el informe aunque se corrija en el formulario;
  // solo con ese informe: si se separa en otro (otro piso o apartamento), el nuevo no la lleva.
  let pctPendiente = null, planillaDe = null;
  if (typeof loadDraftData === 'function') { const _base199 = loadDraftData; loadDraftData = function(index){ try { const b = getSavedReports()[index]; pctPendiente = b ? b.partidas : null; planillaDe = (b && b.planilla) ? { id: b.id, m: b.planilla } : null; } catch (e) {} try { return _base199.apply(this, arguments); } finally { pctPendiente = null; } }; }
  if (typeof nuevoFormulario === 'function') { const _base199n = nuevoFormulario; nuevoFormulario = function(){ planillaDe = null; return _base199n.apply(this, arguments); }; }
  if (typeof getFormData === 'function') { const _base199g = getFormData; getFormData = function(){ const d = _base199g.apply(this, arguments); if (d && planillaDe && d.id === planillaDe.id && !d.planilla) d.planilla = planillaDe.m; return d; }; }
  if (typeof initAppContent === 'function') { const _base199i = initAppContent; initAppContent = function(){ const r = _base199i.apply(this, arguments); try { if (pctPendiente) asegurarPct(pctPendiente); } catch (e) {} return r; }; }
  if (typeof _traerMediciones === 'function') { const _base199t = _traerMediciones; _traerMediciones = function(partidas){ try { asegurarPct(partidas); } catch (e) {} return _base199t.apply(this, arguments); }; }

  const st = document.createElement('style');
  st.textContent = [
    'button.btn-planilla{padding:6px 15px;border:2px solid #1f6f8b;border-radius:20px;font-size:12px;font-weight:700;cursor:pointer;background:#eef7fa;color:#1f4f63;min-height:44px}',
    '#planilla{position:fixed;inset:0;z-index:2500;background:#eef2f5;color:#13212c;overflow:auto;-webkit-overflow-scrolling:touch;padding:0 0 120px;font-size:15px}',
    '#planilla[hidden]{display:none}body.pl-abierta{overflow:hidden}',
    '#planilla .pl-top{position:sticky;top:0;z-index:5;background:#1a237e;color:#fff;padding:8px 12px calc(6px);padding-top:calc(8px + env(safe-area-inset-top,0px))}',
    '#planilla .pl-fila{display:flex;gap:10px;align-items:center}',
    // Teléfono apaisado: la barra de arriba se va con el desplazamiento y la tabla tiene la pantalla.
    '@media (max-height:500px){#planilla .pl-top{position:static}}',
    '#planilla .pl-volver{flex:0 0 auto;min-height:44px;padding:0 12px;border-radius:8px;border:1px solid rgba(255,255,255,.5);background:transparent;color:#fff;font-weight:700;font-size:14px}',
    '#planilla .pl-tit{display:flex;flex-direction:column;line-height:1.2;min-width:0}#planilla .pl-tit b{font-size:17px}#planilla .pl-tit span{font-size:12.5px;opacity:.85}',
    '#planilla .pl-cab{font-size:13px;margin:6px 0 4px;opacity:.95}#planilla .pl-nota{opacity:.7}',
    '#planilla .pl-tabs{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding-top:4px}',
    '#planilla .pl-tabs button{flex:0 0 auto;min-height:44px;padding:0 11px;border-radius:22px;border:1px solid rgba(255,255,255,.45);background:transparent;color:#fff;font-weight:700;font-size:15px}',
    '#planilla .pl-tabs button[aria-selected="true"]{background:#fff;color:#1a237e}',
    '#planilla .pl-aviso{margin:10px 12px 0;padding:8px 12px;border-radius:8px;background:#fff8e1;border:1px solid #f59e0b;font-size:14px}#planilla .pl-aviso[hidden]{display:none}',
    '#planilla .pl-cuerpo{padding:8px 12px}',
    '#planilla .pl-lead{color:#5a6a77;font-size:14px;margin:6px 0 10px;max-width:72ch}',
    '#planilla .pl-piso{display:flex;gap:8px;align-items:center;margin:4px 0 8px;max-width:620px}',
    '#planilla .pl-piso button{width:52px;min-height:48px;border-radius:8px;border:1px solid #d3dce3;background:#fff;font-size:24px}#planilla .pl-piso button:disabled{opacity:.35}',
    '#planilla .pl-piso select{flex:1;min-width:0;min-height:48px;border-radius:8px;border:1px solid #d3dce3;background:#fff;font-size:20px;font-weight:800;text-align:center}',
    '#planilla .pl-chips{display:flex;gap:6px;overflow-x:auto;padding-bottom:6px;max-width:620px}',
    '#planilla .pl-chips button{flex:0 0 auto;min-height:44px;padding:0 12px;border-radius:8px;border:1px solid #d3dce3;background:#fff;font-weight:700;font-size:14px}',
    '#planilla .pl-chips button[aria-pressed="true"]{border-color:#1f6f8b;background:#e2eff4;box-shadow:inset 0 -3px 0 #1f6f8b}',
    '#planilla .pl-cnt{display:inline-block;min-width:20px;margin-left:4px;padding:0 5px;border-radius:10px;background:#1f6f8b;color:#fff;font-size:12px}',
    '#planilla .pl-gw{overflow-x:auto;border:1px solid #d3dce3;border-radius:10px;background:#fff;max-width:620px}',
    '#planilla table{border-collapse:separate;border-spacing:0;min-width:0}',   // el formulario da a toda tabla 640 px de mínimo
    '#planilla .pl-g{width:100%;table-layout:auto}#planilla .pl-g th,#planilla .pl-g td{border-bottom:1px solid #d3dce3;white-space:normal}',
    '#planilla .pl-g thead th{position:sticky;top:0;background:#fff;padding:4px 2px;font-size:15px;z-index:1}',
    '#planilla .pl-g thead th:first-child{text-align:left;padding-left:8px;color:#5a6a77;font-weight:500;font-size:13px}',
    '#planilla .pl-g.ancho thead th:first-child,#planilla .pl-g.ancho tbody th{position:sticky;left:0;z-index:2;background:#fff;min-width:116px;max-width:116px;box-shadow:1px 0 0 #d3dce3}',
    '#planilla .pl-apto{min-height:44px;width:100%;border:0;background:none;font-weight:800;font-size:16px;display:flex;flex-direction:column;align-items:center;justify-content:center}',
    '#planilla .pl-apto small{font-weight:500;font-size:11px;color:#5a6a77}#planilla .pl-apto.tiene small{color:#1f6f8b;font-weight:700}',
    '#planilla .pl-g tbody th{text-align:left;font-weight:500;font-size:13.5px;padding:4px 4px 4px 8px;line-height:1.25}',
    '#planilla .pl-ay{border:0;background:none;padding:0;text-align:left;min-height:44px;color:inherit;font:inherit;white-space:normal;overflow-wrap:anywhere}#planilla .pl-ay span{display:block;color:#5a6a77;font-weight:700;font-size:12px}',
    '#planilla .pl-g td{padding:2px;width:56px}',
    '#planilla .pl-c{width:100%;min-width:48px;min-height:48px;border-radius:7px;border:1px solid #d3dce3;background:#eef2f5;display:flex;flex-direction:column;align-items:center;justify-content:center;font-variant-numeric:tabular-nums;line-height:1.1;padding:2px;color:#5a6a77;font-size:15px}',
    '#planilla .pl-c.vacia{background:#fff;color:#a0adb7}#planilla .pl-c.done{background:#e6eee8;border-color:transparent;color:#3d6b4c;font-weight:700}',
    '#planilla .pl-c.cambio{background:#e2eff4;border:2px solid #1f6f8b;color:#13212c}#planilla .pl-c.cambio b{font-size:18px}#planilla .pl-c.cambio small{font-size:10.5px;color:#5a6a77}',
    '#planilla .pl-c.baja{background:#fcefe0;border-color:#a6530a}',
    '#planilla .pl-ley{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:12.5px;color:#5a6a77;margin:8px 2px}#planilla .pl-ley i{display:inline-block;width:14px;height:14px;border-radius:3px;vertical-align:-2px;margin-right:4px;border:1px solid #d3dce3}',
    '#planilla .pl-ley i.g{background:#eef2f5}#planilla .pl-ley i.d{background:#e6eee8}#planilla .pl-ley i.c{background:#e2eff4;border-color:#1f6f8b}#planilla .pl-ley i.b{background:#fcefe0;border-color:#a6530a}',
    '#planilla .pl-ocab{display:flex;flex-wrap:wrap;gap:8px;align-items:flex-end;margin:4px 0}',
    '#planilla .pl-ocab label{display:flex;flex-direction:column;font-size:12px;color:#5a6a77;gap:2px}#planilla .pl-ocab input{min-height:44px;border:1px solid #d3dce3;border-radius:6px;padding:4px 8px;font-size:16px;background:#fff;min-width:0}',
    '#planilla .pl-ocab input.err{border-color:#b42318;background:#fde8e6}#planilla #pl-npisos,#planilla #pl-np,#planilla #pl-np2{width:90px}',
    '#planilla .pl-post{margin:6px 0;padding:8px 12px;border-radius:8px;background:#fcefe0;border:1px solid #a6530a;font-size:14px}',
    '#planilla .pl-tw{overflow:auto;max-height:70vh;border:1px solid #d3dce3;border-radius:10px;background:#fff}',
    '#planilla .pl-o{font-size:14px}#planilla .pl-o th,#planilla .pl-o td{border-right:1px solid #d3dce3;border-bottom:1px solid #d3dce3;white-space:nowrap}',
    '#planilla .pl-o thead th{position:sticky;background:#fff;z-index:2}#planilla .pl-o thead tr:first-child th{top:0;height:46px}#planilla .pl-o thead tr:nth-child(2) th{top:46px;font-size:12.5px;color:#5a6a77;padding:4px;height:34px}',
    '#planilla .pl-o thead th.opc{color:#a0adb7;font-style:italic}',
    '#planilla .pl-o .esq{left:0;z-index:4!important;text-align:left;padding:0 10px;min-width:96px}',
    '#planilla .pl-o tbody th{position:sticky;left:0;background:#fff;z-index:1;text-align:left;padding:0 10px;font-weight:700}',
    '#planilla .pl-o tbody tr.np > *{border-top:2px solid #5a6a77}',
    '#planilla .pl-hb{min-height:44px;width:100%;border:0;background:none;font-weight:800;font-size:14px;padding:0 10px;display:flex;align-items:center;gap:6px;color:#1a237e}#planilla .pl-hb[aria-expanded="true"] .fl{display:inline-block;transform:rotate(90deg)}',
    '#planilla .pl-o td{padding:2px;text-align:center}#planilla .pl-o td.prom{color:#5a6a77;min-width:64px;font-variant-numeric:tabular-nums}',
    '#planilla .pl-o td.prom .bar{display:block;height:4px;border-radius:2px;background:#d3dce3;margin:2px 6px 0;overflow:hidden}#planilla .pl-o td.prom .bar span{display:block;height:100%;background:#1f6f8b}',
    '#planilla .pl-pc{width:54px;min-height:38px;border:1px solid transparent;border-radius:5px;background:#eef2f5;text-align:center;font-variant-numeric:tabular-nums;font-size:15px}',
    '#planilla .pl-pc.done{background:#e6eee8}#planilla .pl-pc.cambio{background:#e2eff4;border-color:#1f6f8b;font-weight:700}#planilla .pl-pc.baja{background:#fcefe0;border-color:#a6530a}#planilla .pl-pc.mal{background:#fde8e6;border-color:#b42318}',
    '#planilla .pl-com{width:200px;min-height:38px;border:1px solid #d3dce3;border-radius:5px;padding:0 6px;font-size:13.5px}',
    '#planilla .pl-ctrl{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:8px 0}#planilla .pl-ctrl label{display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:0 12px;border:1px solid #d3dce3;border-radius:8px;background:#fff;font-weight:700;font-size:14px}',
    '#planilla .pl-ib{display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center;margin:10px 0}#planilla .pl-tot{color:#5a6a77;font-size:14px}',
    '#planilla .pl-hm{position:relative;width:100%;margin:12px 0 18px;overflow:hidden}',
    '#planilla .pl-hoja{position:absolute;top:0;left:0;width:1056px;height:816px;transform-origin:0 0;background:#fff;color:#111;box-shadow:0 1px 2px rgba(0,0,0,.15),0 6px 20px rgba(0,0,0,.12);padding:34px 38px;display:flex;flex-direction:column;overflow:hidden;font-family:Arial,sans-serif}',
    '#planilla .pl-hoja .h-cab{display:flex;justify-content:space-between;gap:20px;border-bottom:2px solid #111;padding-bottom:6px}#planilla .pl-hoja .h-cab h3{font-size:18px;margin:0}#planilla .pl-hoja .der{text-align:right;font-size:11.5px;line-height:1.35;white-space:nowrap}',
    '#planilla .pl-hoja .h-campos{display:flex;gap:30px;font-size:12px;margin:8px 0 6px}#planilla .pl-hoja .h-campos span{flex:1;border-bottom:1px solid #111;padding-bottom:2px}',
    '#planilla .pl-hoja table{width:100%;border-collapse:collapse;table-layout:fixed;flex:1}#planilla .pl-hoja th,#planilla .pl-hoja td{border:1px solid #555;font-size:10px;padding:0;color:#111;background:#fff;text-transform:none;letter-spacing:0}',   // el formulario pinta los th de azul con letra blanca
    '#planilla .pl-hoja thead th{font-weight:700;line-height:1.1;padding:2px;vertical-align:bottom;height:54px;overflow:hidden}#planilla .pl-hoja thead th .c{display:block;font-size:12px}#planilla .pl-hoja thead th.hg{height:auto;font-size:11px;background:#e9edf2;padding:3px}',
    '#planilla .pl-hoja tbody th{font-weight:700;font-size:11px;text-align:left;padding:0 4px;white-space:nowrap;overflow:hidden}#planilla .pl-hoja tbody tr.np > *{border-top:2px solid #111}',
    '#planilla .pl-hoja td{position:relative}#planilla .pl-hoja td .p{position:absolute;top:1px;left:2px;font-size:8.5px;color:#8a8a8a}#planilla .pl-hoja td.lleno{background:#e3e3e3}#planilla .pl-hoja td.lleno .p{color:#333;font-weight:700}',
    '#planilla .pl-hoja .h-pie{font-size:10.5px;margin-top:6px;color:#333}',
    '#planilla .pl-hoja.denso{padding:24px 30px}#planilla .pl-hoja.denso tbody th{font-size:7.5px;line-height:8px}#planilla .pl-hoja.denso thead th{height:38px;font-size:8px}#planilla .pl-hoja.denso td .p{font-size:7px;top:0}',
    '#planilla .pl-gtit{display:none}#planilla .pl-guia{columns:2 340px;column-gap:20px}#planilla .pl-guia section{break-inside:avoid;background:#fff;border:1px solid #d3dce3;border-radius:10px;padding:10px 14px;margin:0 0 12px}',
    '#planilla .pl-guia h3{font-size:16px;color:#1a237e;margin:0 0 4px}#planilla .pl-guia dt{font-weight:700;margin-top:8px}#planilla .pl-guia dt span{color:#5a6a77;margin-right:6px}#planilla .pl-guia dd{margin:0;font-size:13.5px;color:#5a6a77}',
    '#planilla .pl-barra{position:fixed;left:0;right:0;bottom:0;z-index:6;background:#fff;border-top:1px solid #d3dce3;padding:10px 12px calc(10px + env(safe-area-inset-bottom,0px));display:flex;gap:8px;align-items:center}#planilla .pl-barra[hidden]{display:none}',
    '#planilla .pl-btxt{flex:1;min-width:0;font-size:14px}#planilla .pl-btxt b{font-size:16px}#planilla .ojo{color:#a6530a}',
    '#planilla .pl-btn{min-height:46px;padding:0 14px;border-radius:8px;border:1px solid #d3dce3;background:#fff;font-weight:800;font-size:15px;white-space:nowrap;color:#13212c}',
    '#planilla .pl-btn.pri{background:#1f6f8b;border-color:#1f6f8b;color:#fff}#planilla .pl-btn.peligro{color:#b42318;border-color:#b42318}#planilla .pl-btn:disabled{opacity:.45}',
    '#planilla .pl-toast{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(80px + env(safe-area-inset-bottom,0px));z-index:9;width:max-content;max-width:92vw;background:#13212c;color:#fff;padding:10px 14px;border-radius:10px;font-size:14px}#planilla .pl-toast[hidden]{display:none}',
    '#planilla .pl-fondo{position:fixed;inset:0;z-index:8;background:rgba(10,25,40,.45);display:flex;align-items:flex-end;justify-content:center}#planilla .pl-fondo[hidden]{display:none}',
    '#planilla .pl-sheet{width:100%;max-width:480px;max-height:92vh;overflow:auto;background:#fff;border-radius:14px 14px 0 0;padding:14px 16px calc(14px + env(safe-area-inset-bottom,0px))}',
    '@media (min-width:760px){#planilla .pl-fondo{align-items:center}#planilla .pl-sheet{border-radius:14px}}',
    '#planilla .pl-sheet h3{font-size:18px;margin:0}#planilla .pl-sub{color:#5a6a77;font-size:14px;margin:2px 0 8px}',
    '#planilla .pl-disp{display:flex;align-items:baseline;justify-content:center;gap:4px;font-weight:800;font-size:46px;font-variant-numeric:tabular-nums}#planilla .pl-disp small{font-size:22px;color:#5a6a77}#planilla .pl-disp .vacio{color:#a0adb7}',
    '#planilla .pl-kw{min-height:20px;font-size:13.5px;color:#5a6a77;text-align:center;margin-bottom:6px}#planilla .pl-kw.ojo{color:#a6530a}',
    '#planilla .pl-rap{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-bottom:6px}#planilla .pl-pad{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}',
    '#planilla .pl-rap button,#planilla .pl-pad button,#planilla .pl-sino button{min-height:52px;border-radius:8px;border:1px solid #d3dce3;background:#eef2f5;font-weight:800;font-size:22px;color:#13212c}',
    '#planilla .pl-rap button{font-size:18px;background:#e2eff4}#planilla .pl-pad button.sm{font-size:14px}#planilla .pl-sino{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0}#planilla .pl-sino button[aria-pressed="true"]{border:2px solid #1f6f8b;background:#e2eff4}',
    '#planilla .pl-todos{display:flex;align-items:center;gap:10px;min-height:48px;margin-top:8px;font-size:15px}#planilla .pl-todos input{width:22px;height:22px;flex:0 0 auto}',
    '#planilla .pl-acc{display:flex;gap:8px;justify-content:flex-end;margin-top:10px}#planilla .pl-acc .pl-btn{flex:1}',
    '#planilla .pl-sheet textarea{width:100%;min-height:140px;border:1px solid #d3dce3;border-radius:8px;padding:8px;font-size:16px;box-sizing:border-box}',
    '#planilla .pl-ra{border-top:1px solid #d3dce3;padding:8px 0}#planilla .pl-ra h4{margin:0;font-size:15px}#planilla .pl-nro,#planilla .pl-nros li{font-family:ui-monospace,Menlo,monospace;font-size:12px;color:#1f6f8b;word-break:break-all}',
    '#planilla .pl-ra ul{margin:4px 0 0;padding-left:18px;font-size:13.5px;overflow-wrap:anywhere}#planilla .pl-ra .b{color:#a6530a}',
    '#planilla .pl-faltan{background:#fde8e6;border:1px solid #b42318;border-radius:8px;padding:8px 10px;font-size:14px;margin:8px 0}',
    '@page planillaH{size:letter landscape;margin:0}@page planillaG{size:letter portrait;margin:14mm}',
    '@media print{',
    '  body.pl-abierta > *:not(#planilla){display:none!important}',
    '  body.pl-abierta #planilla{position:static!important;overflow:visible!important;background:#fff!important;padding:0!important}',
    '  body.pl-abierta #planilla .pl-top,body.pl-abierta #planilla .pl-aviso,body.pl-abierta #planilla .pl-barra,body.pl-abierta #planilla .pl-toast,body.pl-abierta #planilla .pl-fondo,body.pl-abierta #planilla .pl-lead,body.pl-abierta #planilla .pl-ctrl,body.pl-abierta #planilla .pl-ib{display:none!important}',
    '  body.pl-imp-hojas #planilla .pl-cuerpo{padding:0!important}',
    '  body.pl-imp-hojas #planilla .pl-hm{page:planillaH;height:auto!important;margin:0!important;overflow:visible!important;break-after:page}body.pl-imp-hojas #planilla .pl-hm:last-child{break-after:auto}',
    '  body.pl-imp-hojas #planilla .pl-hoja{position:relative!important;transform:none!important;box-shadow:none!important}',
    // El formulario, al imprimir, da a cada columna de cualquier tabla un ancho por su posición (44 % la segunda): en la hoja manda el colgroup.
    '  #planilla .pl-hoja table{width:100%!important;table-layout:fixed!important}#planilla .pl-hoja table th,#planilla .pl-hoja table td{width:auto!important;border:1px solid #555!important}#planilla .pl-hoja tbody th{text-align:left!important}#planilla .pl-hoja thead th{text-align:center!important}',
    '  #planilla .pl-hoja td.lleno,#planilla .pl-hoja thead th.hg{-webkit-print-color-adjust:exact;print-color-adjust:exact}',
    '  body.pl-imp-guia #planilla .pl-gtit{display:block;page:planillaG;font-size:18pt;margin:0 0 4mm}',
    '  body.pl-imp-guia #planilla .pl-guia{page:planillaG;columns:2;column-gap:8mm}body.pl-imp-guia #planilla .pl-guia section{break-inside:auto;border:1px solid #888;margin:0 0 4mm;font-size:10pt}',
    '  body.pl-imp-guia #planilla .pl-guia h3,body.pl-imp-guia #planilla .pl-guia dt{break-after:avoid}body.pl-imp-guia #planilla .pl-guia dd{break-inside:avoid}',
    '}'
  ].join('\n');
  document.head.appendChild(st);
})();
