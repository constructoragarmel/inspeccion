#!/usr/bin/env python3
"""Construye index.html a partir del formulario original de Skarlet Gómez.

Entrada:  fuente/Formularios.V8272026.html  (no se modifica)
Salida:   index.html

Cada cambio está numerado y explicado. Si el original cambia y una sustitución
deja de encontrar su ancla, el script falla en vez de producir un archivo a medias.
"""
import base64, os, re, sys

RAIZ = os.path.dirname(os.path.abspath(__file__))
ORIG = os.path.join(RAIZ, "fuente", "Formularios.V8272026.html")
SALIDA = os.path.join(RAIZ, "index.html")
LOGOS = os.path.join(RAIZ, "recursos")

cambios = []

def b64(nombre, mime):
    with open(os.path.join(LOGOS, nombre), "rb") as f:
        return "data:%s;base64,%s" % (mime, base64.b64encode(f.read()).decode())

def sustituir(s, viejo, nuevo, etiqueta, n=1):
    if s.count(viejo) < 1:
        sys.exit("✗ No se encontró el ancla de: %s" % etiqueta)
    cambios.append(etiqueta)
    return s.replace(viejo, nuevo, n)

s = open(ORIG, encoding="utf-8").read()

LOGO_GARMEL = b64("garmel.png", "image/png")
LOGO_GMVV   = b64("gmvv.png", "image/png")

# ── 1. Fuera las dos librerías que se bajaban de internet ───────────────────
# No se usaban nunca (el PDF sale de window.print()) y sin señal la página
# se quedaba esperándolas. En su lugar entra el manifiesto de la app.
s = sustituir(s,
 '<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>\n'
 '<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>',
 '<link rel="manifest" href="manifest.json">\n'
 '<meta name="theme-color" content="#1a237e">\n'
 '<meta name="mobile-web-app-capable" content="yes">\n'
 '<meta name="apple-mobile-web-app-capable" content="yes">\n'
 '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n'
 '<meta name="apple-mobile-web-app-title" content="Inspección GARMEL">\n'
 '<link rel="apple-touch-icon" href="icon-192.png">',
 "1· quitar librerías externas y declarar la app")

# ── 3. Logos reales en el encabezado del informe ────────────────────────────
# Eran una «C» y una «G» dibujadas a mano, y un emblema oficial aproximado
# con tres polígonos de colores. Van al PDF, así que son la cara del informe.
ini_l = s.index('<div style="display:flex;align-items:center;gap:18px">\n    <div style="text-align:center">')
fin_l = s.index('<div>\n      <h2 id="logo-title"')
s = sustituir(s, s[ini_l:fin_l],
 '<div style="display:flex;align-items:center;gap:18px">\n'
 '    <img src="' + LOGO_GARMEL + '" alt="Constructora Garmel, C.A." '
 'style="height:56px;width:auto;flex-shrink:0">\n'
 '    <div style="width:1px;height:50px;background:#e0e0e0"></div>\n'
 '    <img src="' + LOGO_GMVV + '" alt="Gran Misión Vivienda Venezuela" '
 'style="height:52px;width:auto;flex-shrink:0">\n'
 '    <div style="width:1px;height:50px;background:#e0e0e0"></div>\n'
 '    ',
 "3· logos reales en el encabezado del informe")

# ── 4. Las fotografías se reducen solas al entrar ───────────────────────────
# El inspector no hace nada distinto: toma la foto como siempre. En el momento
# en que entra al formulario se reescala, porque una foto de cámara en crudo
# no cabe en el almacenamiento del navegador.
s = sustituir(s,
"""function loadFoto(pid,fi,inp){
  const file=inp.files[0]; if(!file) return;
  const r=new FileReader();
  r.onload=e=>{
    const img=document.getElementById(`fimg_${pid}_${fi}`);
    img.src=e.target.result; img.style.display='block';
    const slot=document.getElementById(`fslot_${pid}_${fi}`);
    slot.querySelector('span').style.display='none';
  };
  r.readAsDataURL(file);
}""",
"""const MAX_FOTO_PX = 1280;      // lado mayor tras reducir
const CALIDAD_FOTO = 0.72;     // suficiente para respaldo de inspección

function _pintarFoto(pid, fi, dato){
  const img  = document.getElementById(`fimg_${pid}_${fi}`);
  const slot = document.getElementById(`fslot_${pid}_${fi}`);
  if(img){ img.src = dato; img.style.display = 'block'; }
  if(slot){ const sp = slot.querySelector('span'); if(sp) sp.style.display = 'none'; }
}

function loadFoto(pid,fi,inp){
  const file = inp.files[0]; if(!file) return;
  const r = new FileReader();
  r.onload = e => {
    const original = e.target.result;
    const tmp = new Image();
    tmp.onload = () => {
      try {
        let w = tmp.naturalWidth, h = tmp.naturalHeight;
        const esc = Math.min(1, MAX_FOTO_PX / Math.max(w, h));
        w = Math.max(1, Math.round(w * esc));
        h = Math.max(1, Math.round(h * esc));
        const cv = document.createElement('canvas');
        cv.width = w; cv.height = h;
        const cx = cv.getContext('2d');
        cx.fillStyle = '#fff'; cx.fillRect(0, 0, w, h);
        cx.drawImage(tmp, 0, 0, w, h);
        _pintarFoto(pid, fi, cv.toDataURL('image/jpeg', CALIDAD_FOTO));
      } catch(err) {
        _pintarFoto(pid, fi, original);   // si el navegador no deja, va la original
      }
    };
    tmp.onerror = () => _pintarFoto(pid, fi, original);
    tmp.src = original;
  };
  r.readAsDataURL(file);
}""",
 "4· reducción automática de fotografías")

# ── 5. Las fotos y las observaciones entran al borrador ─────────────────────
# Este era el defecto que hacía perder el producto de la inspección: getFormData
# no las recogía, así que no es que se perdieran al sincronizar — nunca entraban.
s = sustituir(s,
"""    partidas:{}, extraRows: extraRows
  };""",
"""    partidas:{}, extraRows: extraRows,
    fotos:{}, fotobs:{}
  };

  // Las fotografías y las observaciones por partida entran al borrador en los
  // dos modos de llenado. Antes no entraban —getFormData no las recogía— y por
  // eso se perdían al guardar y volver.
  PARTIDAS.forEach(p=>{
    d.fotobs[p.id] = document.getElementById('fotobs_'+p.id)?.value || '';
    d.fotos[p.id]  = [0,1,2].map(fi=>{
      const im = document.getElementById(`fimg_${p.id}_${fi}`);
      return (im && im.src && im.src.indexOf('data:') === 0) ? im.src : '';
    });
  });""",
 "5· guardar fotos y observaciones en el borrador")

# ── 6. …y vuelven al abrir el borrador ──────────────────────────────────────
s = sustituir(s,
"""  closeSavedModal();
  showToast('📂 Borrador cargado correctamente para edición', 'ok');""",
"""  PARTIDAS.forEach(p=>{
    if(d.fotobs && d.fotobs[p.id] !== undefined){
      const t = document.getElementById('fotobs_'+p.id);
      if(t) t.value = d.fotobs[p.id];
    }
    if(d.fotos && d.fotos[p.id]){
      d.fotos[p.id].forEach((src,fi)=>{ if(src) _pintarFoto(p.id, fi, src); });
    }
  });

  closeSavedModal();
  showToast('📂 Borrador cargado correctamente para edición', 'ok');""",
 "6· restaurar fotos y observaciones al abrir el borrador")

# ── 7. Aviso claro si el teléfono se queda sin espacio ──────────────────────
s = sustituir(s,
"""  } catch(e){
    showToast('❌ Error al guardar: ' + e.message, 'err');
  }""",
"""  } catch(e){
    const sinEspacio = /quota|exceeded|storage/i.test(e.name + ' ' + e.message);
    showToast(sinEspacio
      ? '❌ El teléfono se quedó sin espacio para borradores. Envíe o elimine informes guardados antes de continuar.'
      : '❌ Error al guardar: ' + e.message, 'err');
  }""",
 "7· aviso de almacenamiento lleno")

# ── 8. El número de informe deja de depender de un contador ─────────────────
# El contador vivía en cada teléfono por separado: dos inspectores generaban el
# mismo número. Y el número no llevaba el sector, así que «Torre 12» no
# identificaba una torre (existe en Ezequiel Zamora y en Simón Rodríguez).
# PROVISIONAL: la convención definitiva es PA-23, y si Inmobiliaria Nacional
# tiene padrón oficial (PA-41), ese manda sobre este esquema.
s = sustituir(s,
"""function updateNroInforme() {
  const yr    = new Date().getFullYear();
  const cnt   = String(reportCounter + 1).padStart(3, '0');
  const torre = getTorreActual();
  const apto  = document.getElementById('apto')?.value?.trim() || '—';
  const nro   = 'GARMEL-' + yr + '-' + cnt + '-' + torre + '-' + apto;""",
"""const SECTOR_POR_CONVENIO = {
  'Convenio Bielorusos': 'EZ',   // Ezequiel Zamora
  'Convenio Rusos':      'SR',   // Simón Rodríguez
  'Convenio Chinos':     'SB'    // Simón Bolívar
};

function _limpiar(v){
  return (v == null ? '' : String(v)).trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

// El piso es un desplegable con valores tipo «Piso 03»: hay que sacarle el número.
function _digitosFinales(v, ancho){
  const m = String(v == null ? '' : v).match(/(\\d+)\\s*$/);
  return m ? m[1].padStart(ancho, '0') : '';
}

function getSectorActual(){
  return SECTOR_POR_CONVENIO[document.getElementById('convenio')?.value] || 'XX';
}

function normalizaTorre(t){
  const m = String(t || '').trim().toUpperCase().match(/^([A-Z]+)[\\s-]*0*(\\d+)$/);
  return m ? m[1] + String(m[2]).padStart(2, '0') : (_limpiar(t) || 'T--');
}

function getInicialesInspector(){
  const lista = (typeof getInspectoresValues === 'function') ? getInspectoresValues() : [];
  if(!lista.length) return '--';
  const partes = String(lista[0]).replace(/^(ING|ARQ|TSU)\\.?\\s*/i, '').trim().split(/\\s+/);
  const ini = ((partes[0] || '')[0] || '') + ((partes[1] || '')[0] || '');
  return _limpiar(ini) || '--';
}

function updateNroInforme() {
  const sector = getSectorActual();
  const torre  = normalizaTorre(getTorreActual());
  const piso   = _digitosFinales(document.getElementById('piso')?.value, 2) || '--';
  const avRaw  = _limpiar(document.getElementById('apto')?.value);
  const apto   = avRaw ? (/^\\d+$/.test(avRaw) ? avRaw.padStart(2, '0') : avRaw) : '--';
  const fv     = document.getElementById('fecha')?.value || '';
  const fecha  = /^\\d{4}-\\d{2}-\\d{2}$/.test(fv) ? fv.slice(2).replace(/-/g, '') : '------';
  const inic   = getInicialesInspector();
  const nro    = (TEST_MODE ? 'PRUEBA-' : '') +
                 [sector, torre, 'P' + piso + 'A' + apto, fecha, inic].join('-');""",
 "8· número de informe compuesto, sin contador")

# ── 10. Etiquetas y botones que ya no corresponden ──────────────────────────
s = sustituir(s, 'Formato: GARMEL-AÑO-NRO-Torre-Apto',
 'Formato: Sector-Torre-Piso/Apto-Fecha-Inspector',
 "10· etiqueta del formato del número")

s = sustituir(s, 'GARMEL-2026-001-—-—', 'XX-T---P--A---------',
 "11· número de ejemplo en el encabezado", n=2)

s = sustituir(s, '📤 <span>Sincronización monday.com</span>',
 '📶 <span>Funciona sin señal</span>',
 "11b· la pantalla de inicio ya no promete una sincronización que no existe")

s = sustituir(s,
 '<button class="hbtn hbtn-reset" onclick="resetCorrelativo()" title="Reiniciar correlativo" '
 'style="background:rgba(255,200,0,.2);border:1px solid rgba(255,200,0,.3)">🔄 <span>Reiniciar N°</span></button>',
 '<!-- Botón «Reiniciar N°» retirado: el número ya no depende de un contador. -->',
 "12· retirar el botón de reiniciar correlativo")

# (el envío se rehace entero más abajo, cambio 17)


# ── 15. Las fotografías salían del tamaño de una estampilla en el PDF ───────
# En pantalla los recuadros son de 90x70 px, y el PDF los imprimía igual: la
# foto es la evidencia de la inspección y salía ilegible. En impresión pasan a
# ocupar un tercio del ancho, recortadas a la caja pero sin deformar, y los
# recuadros vacíos desaparecen en vez de imprimirse como cajas punteadas.
s = sustituir(s,
 """  .foto-sec{padding:6px 10px;margin:4px 10px}
  .foto-grid{flex-wrap:wrap}
  .foto-slot{width:80px!important;height:65px!important}
  .foto-slot span{display:none}""",
 """  /* Fotografías: tamaño legible en el PDF, sin recuadros vacíos.
     Antes salían de 80x65 px, o sea del tamaño de una estampilla, y la
     fotografía es justamente la evidencia de la inspección. */
  .foto-sec{background:#fff!important;border:1px solid #ddd!important;margin:6px 10px;padding:8px 10px;page-break-inside:avoid}
  .foto-sec-title{font-size:9px!important;margin-bottom:5px}
  /* Tres por fila, y las siguientes bajan. Con «nowrap» seis fotografías se
     comprimían a 114 px y volvían al tamaño estampilla que esto vino a evitar. */
  .foto-grid{display:flex!important;gap:6px!important;flex-wrap:wrap!important;align-items:flex-start}
  .foto-slot{width:calc(33.333% - 4px)!important;height:auto!important;aspect-ratio:4/3;border:1px solid #ccc!important;border-radius:4px!important;flex:0 0 calc(33.333% - 4px)!important;page-break-inside:avoid}
  .foto-slot img{position:absolute!important;inset:0;width:100%!important;height:100%!important;object-fit:cover;print-color-adjust:exact;-webkit-print-color-adjust:exact}
  .foto-slot span{display:none}
  .foto-slot.sin-foto{display:none!important}
  .foto-obs{margin-top:6px}
  .foto-obs textarea{border:none!important;border-top:1px solid #eee!important;border-radius:0!important;padding:4px 0 0!important;font-size:9px!important;min-height:0!important;resize:none!important;overflow:hidden!important}""",
 "15a· fotografías legibles en el PDF")

# Marcar los recuadros vacíos justo antes de imprimir, y ajustar la altura de
# las observaciones para que no salgan cortadas en el PDF.
s = sustituir(s,
"""function openSend() {
  document.getElementById('overlay').classList.add('open');
}""",
"""// ═══════════════════════════════════════════════
// PREPARAR EL DOCUMENTO ANTES DE IMPRIMIR
// Un recuadro de foto vacío no debe salir en el informe, y un cuadro de
// observaciones con barra de desplazamiento sale cortado en el PDF.
// ═══════════════════════════════════════════════
function _prepararImpresion(){
  document.querySelectorAll('.foto-slot').forEach(sl=>{
    const im = sl.querySelector('img');
    const tiene = im && im.src && im.src.indexOf('data:') === 0;
    sl.classList.toggle('sin-foto', !tiene);
  });
  document.querySelectorAll('.foto-obs textarea, #obs_general, #obs_sp').forEach(t=>{
    if(!t.dataset.altoOriginal) t.dataset.altoOriginal = t.style.height || '';
    t.style.height = 'auto';
    t.style.height = t.scrollHeight + 'px';
  });
}
function _restaurarTrasImpresion(){
  document.querySelectorAll('.foto-obs textarea, #obs_general, #obs_sp').forEach(t=>{
    t.style.height = t.dataset.altoOriginal || '';
  });
}
window.addEventListener('beforeprint', _prepararImpresion);
window.addEventListener('afterprint', _restaurarTrasImpresion);

function openSend() {
  document.getElementById('overlay').classList.add('open');
}""",
 "15b· preparar fotos y observaciones antes de imprimir")


# ── 16. Ámbito del informe: torre o apartamento ─────────────────────────────
# Los hitos 1 y 7 son de torre —no se inspecciona un ascensor en el apartamento
# 3-A— y el resto son de apartamento (ADR-0017). El formulario pregunta el
# ámbito y muestra solo los hitos que aplican; piso y apartamento dejan de ser
# obligatorios cuando el informe es de torre.
s = sustituir(s,
 """  <div class="sec-lbl">📍 Ubicación</div>""",
 """  <div class="sec-lbl">📍 Ubicación</div>
  <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:0 0 12px">
    <span style="font-size:12px;font-weight:700;color:#555">ÁMBITO DEL INFORME:</span>
    <button type="button" id="btnAmbApto" onclick="setAmbito('apartamento')"
      style="padding:6px 15px;border:2px solid #e65100;border-radius:20px;font-size:12px;font-weight:700;cursor:pointer;background:#e65100;color:#fff">🚪 Apartamento</button>
    <button type="button" id="btnAmbTorre" onclick="setAmbito('torre')"
      style="padding:6px 15px;border:2px solid #e0e0e0;border-radius:20px;font-size:12px;font-weight:700;cursor:pointer;background:#f5f5f5;color:#666">🏢 Torre completa</button>
    <span id="ambito-nota" style="font-size:11px;color:#888"></span>
  </div>""",
 "16a· selector de ámbito en la ficha de ubicación")

s = sustituir(s,
 """let formType = 'detallado'; // 'detallado' u 'hitos'""",
 """let formType = 'detallado'; // 'detallado' u 'hitos'

// ── ÁMBITO DEL INFORME ─────────────────────────────────────────────────────
// Qué hito se evalúa por torre y cuál por apartamento es criterio de
// ingeniería (ADR-0017). Esta lista es lo único que hay que cambiar si el
// ingeniero responsable decide otro reparto.
const HITOS_DE_TORRE = ['hito_estructura', 'hito_mecanicas'];
let ambito = 'apartamento';   // 'apartamento' u 'torre'

function setAmbito(a){
  ambito = (a === 'torre') ? 'torre' : 'apartamento';
  const esTorre = (ambito === 'torre');

  const on  = 'padding:6px 15px;border:2px solid #e65100;border-radius:20px;font-size:12px;font-weight:700;cursor:pointer;background:#e65100;color:#fff';
  const off = 'padding:6px 15px;border:2px solid #e0e0e0;border-radius:20px;font-size:12px;font-weight:700;cursor:pointer;background:#f5f5f5;color:#666';
  const bA = document.getElementById('btnAmbApto'), bT = document.getElementById('btnAmbTorre');
  if(bA) bA.style.cssText = esTorre ? off : on;
  if(bT) bT.style.cssText = esTorre ? on  : off;

  // Piso y apartamento solo aplican al informe de vivienda. Se guardan al
  // ocultarlos y se devuelven al volver: si no, un toque en «Torre completa»
  // borraba lo que ya se había escrito.
  ['piso','apto'].forEach(id=>{
    const el = document.getElementById(id);
    const campo = el ? el.closest('.field') : null;
    if(campo) campo.style.display = esTorre ? 'none' : '';
    if(!el) return;
    if(esTorre){
      if(el.value) el.dataset.guardado = el.value;
      el.value = '';
    } else if(!el.value && el.dataset.guardado){
      el.value = el.dataset.guardado;
    }
  });

  // Se muestran solo los hitos del ámbito elegido.
  if (typeof PARTIDAS !== 'undefined') PARTIDAS.forEach(p=>{
    const bloque = document.getElementById('p_' + p.id);
    if(!bloque) return;
    const deTorre = HITOS_DE_TORRE.indexOf(p.id) >= 0;
    bloque.style.display = (deTorre === esTorre) ? '' : 'none';
  });

  const nota = document.getElementById('ambito-nota');
  if(nota) nota.textContent = esTorre
    ? 'Estructura, ascensores y áreas comunes — no aplica a una vivienda'
    : 'Acabados, carpintería e instalaciones de la vivienda';

  updateDocInfo();
}""",
 "16b· lógica del ámbito")

# El número ya no da por hecho que hay apartamento.
s = sustituir(s,
 """  const nro    = (TEST_MODE ? 'PRUEBA-' : '') +
                 [sector, torre, 'P' + piso + 'A' + apto, fecha, inic].join('-');""",
 """  const bloque = (ambito === 'torre') ? 'TORRE' : ('P' + piso + 'A' + apto);
  const nro    = (TEST_MODE ? 'PRUEBA-' : '') +
                 [sector, torre, bloque, fecha, inic].join('-');""",
 "16c· el número admite informes de torre")

# El ámbito viaja en el borrador y vuelve al abrirlo.
s = sustituir(s,
 """    formType: formType,
    timestamp: new Date().toLocaleString(),""",
 """    formType: formType,
    ambito: ambito,
    timestamp: new Date().toLocaleString(),""",
 "16d· el ámbito entra al borrador")

s = sustituir(s,
 """  formType = d.formType || 'detallado';""",
 """  formType = d.formType || 'detallado';
  setAmbito(d.ambito || 'apartamento');""",
 "16e· el ámbito vuelve al abrir el borrador")


# ── 17. El envío va al relevo de Garmel, no a monday.com ───────────────────
# ADR-0014 fijó Smartsheet como plataforma y no adoptó Monday. El envío pasa al
# relevo, que archiva en Drive y anota la fila del registro. La DIRECCIÓN va
# aquí porque sin la clave no sirve de nada; la CLAVE la escribe el inspector
# una vez en su teléfono y NO se versiona (ADR-0015).
s = sustituir(s,
 """    <h3>📤 Enviar a monday.com</h3>
    <p>Ingresa tu API token para registrar este informe en el tablero <strong>Formulario de Inspecciones</strong>.</p>
    <label>monday.com API Token</label>
    <input type="text" id="mondayToken" placeholder="eyJhbGci..." spellcheck="false">
    <div class="m-btns">
      <button class="m-btn m-cancel" onclick="closeSend()">Cancelar</button>
      <button class="m-btn m-confirm" id="btn-enviar-monday" onclick="sendToMonday()">📤 Enviar ahora</button>
    </div>""",
 """    <h3>📤 Enviar informe</h3>
    <p>Se archiva en la carpeta de Drive de la torre y queda anotado en el registro.
       <strong>La clave se escribe una sola vez en este teléfono.</strong></p>
    <label>Clave de envío</label>
    <input type="password" id="claveEnvio" placeholder="La que le dieron en la oficina" spellcheck="false" autocomplete="off">
    <div class="m-btns">
      <button class="m-btn m-cancel" onclick="closeSend()">Cancelar</button>
      <button class="m-btn m-confirm" id="btn-enviar-relevo" onclick="enviarAlRelevo()">📤 Enviar ahora</button>
    </div>""",
 "17a· la ventana de envío pide la clave, no un token de Monday")

s = sustituir(s,
 """function openSend() {
  document.getElementById('overlay').classList.add('open');
}""",
 """function openSend() {
  const c = document.getElementById('claveEnvio');
  if(c) c.value = localStorage.getItem('garmel_clave_envio') || '';
  document.getElementById('overlay').classList.add('open');
}""",
 "17b· la clave guardada se recuerda en el teléfono")

# Se reemplaza la función entera de envío a Monday.
ini = s.index("async function sendToMonday() {")
fin = s.index("// Inicialización general al cargar")
s = sustituir(s, s[ini:fin],
 """const RELEVO_URL = 'https://script.google.com/macros/s/AKfycbylEnXp9Fsg0YWEQS4YQiGp3CCZmIWTnsWBD0KEw5quMkexDcBieUESBkmTspqAsvjoXQ/exec';

// Devuelve una copia del informe sin las imágenes incrustadas. Se envían
// aparte, como archivos, y duplicarlas dentro del JSON no aporta nada.
function _sinFotos(d){
  const copia = Object.assign({}, d);
  delete copia.fotos;
  return copia;
}

// Recoge las fotografías tal como quedaron tras reducirse, con un nombre que
// dice de qué hito son.
function _fotosParaEnviar(){
  const out = [];
  if (typeof PARTIDAS === 'undefined') return out;
  PARTIDAS.forEach(p=>{
    [0,1,2].forEach(fi=>{
      const im = document.getElementById(`fimg_${p.id}_${fi}`);
      if(im && im.src && im.src.indexOf('data:') === 0){
        out.push({ nombre: p.id + '-' + (fi + 1), dato: im.src });
      }
    });
  });
  return out;
}

async function enviarAlRelevo() {
  const clave = (document.getElementById('claveEnvio').value || '').trim();
  const logEl = document.getElementById('sendLog');
  const btn   = document.getElementById('btn-enviar-relevo');

  if(!clave){ alert('Escriba la clave de envío.'); return; }

  const datos = getFormData();
  if(!getTorreActual() || getTorreActual() === '—'){
    alert('Falta la torre. Sin torre no se puede archivar el informe.');
    return;
  }

  const fotos = _fotosParaEnviar();
  logEl.style.display = 'block';
  logEl.textContent = 'Enviando ' + datos.nro + '…\\n' +
                      fotos.length + ' fotografía(s)\\n';
  btn.disabled = true;

  try {
    // Content-Type de texto plano a propósito: evita la verificación previa de
    // CORS, que Apps Script no responde.
    const r = await fetch(RELEVO_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        clave:  clave,
        numero: datos.nro,
        sector: getSectorActual(),
        torre:  getTorreActual(),
        ambito: ambito,
        // Las fotografías van UNA vez, en su propio arreglo. Si se dejaran
        // también dentro de «datos», el envío pesaría el doble — y en obra,
        // con señal mala, eso decide si el informe llega o no.
        datos:  _sinFotos(datos),
        fotos:  fotos
      })
    });
    const res = await r.json();

    if(res.ok){
      localStorage.setItem('garmel_clave_envio', clave);
      logEl.textContent += '✅ Archivado en Drive\\n' + (res.archivos || []).join('\\n');
      showToast('✅ Informe enviado y archivado', 'ok');
      closeSend();
    } else {
      logEl.textContent += '❌ ' + (res.error || 'Error desconocido');
      showToast('❌ ' + (res.error || 'No se pudo enviar'), 'err');
    }
  } catch(e) {
    logEl.textContent += '❌ Sin conexión o el relevo no responde: ' + e.message +
      '\\nEl borrador sigue guardado en este teléfono. Intente de nuevo con señal.';
    showToast('❌ No se pudo enviar. El borrador no se perdió', 'err');
  } finally {
    btn.disabled = false;
  }
}

""", "17c· enviar al relevo en lugar de a monday.com")


# ── 18. Dos textos de la interfaz que todavía nombraban a monday.com ───────
s = sustituir(s, "⚠️ Torre no registrada en monday.com",
 "⚠️ Torre no registrada en el maestro", "18a· aviso de torre no registrada")

s = sustituir(s,
 "Lista de borradores almacenados en este teléfono. Selecciona uno para cargarlo, modificarlo o enviarlo directamente a monday.com.",
 "Lista de borradores almacenados en este teléfono. Selecciona uno para cargarlo, modificarlo o enviarlo.",
 "18b· texto de la lista de guardados")


# ── 19. Aplicar el ámbito al terminar de dibujar el formulario ─────────────
# Sin esto, al abrir se ven los siete hitos, incluidos los de torre, hasta que
# alguien toca el selector.
s = sustituir(s,
 """  if(formType === 'hitos') {
    const mb = document.getElementById('mode-bar');
    if(mb) mb.style.display = 'none';
  }
}""",
 """  if(formType === 'hitos') {
    const mb = document.getElementById('mode-bar');
    if(mb) mb.style.display = 'none';
  }

  setAmbito(ambito);
}""",
 "19· aplicar el ámbito al dibujar el formulario")


# ── 20. Configuración del teléfono sin que el inspector escriba nada ───────
# El enlace de configuración lleva la clave después del #, que NO sale del
# teléfono: no viaja al servidor, no queda en registros de GitHub. Se guarda y
# se borra de la barra de direcciones en el acto.
s = sustituir(s,
 """let formType = 'detallado'; // 'detallado' u 'hitos'""",
 """let formType = 'detallado'; // 'detallado' u 'hitos'

// ── CONFIGURACIÓN DEL TELÉFONO ─────────────────────────────────────────────
// Se abre una sola vez un enlace con  #clave=...  y este teléfono queda
// configurado para siempre. El inspector no escribe nada nunca.
// Lo que va después del # no se envía al servidor: solo lo ve el navegador.
(function configurarDesdeEnlace(){
  try {
    const m = (location.hash || '').match(/[#&]clave=([^&]+)/);
    if(!m) return;
    const clave = decodeURIComponent(m[1]).trim();
    if(clave) localStorage.setItem('garmel_clave_envio', clave);
    // Se borra de la barra de direcciones para que no quede a la vista.
    history.replaceState(null, '', location.pathname + location.search);
    window.addEventListener('load', function(){
      if(typeof showToast === 'function') showToast('✅ Este teléfono quedó configurado', 'ok');
    });
  } catch(e) { /* sin almacenamiento disponible */ }
})();""",
 "20a· el enlace de configuración deja la clave en el teléfono")

# Indicador y botón de prueba en la ventana de envío.
s = sustituir(s,
 """    <label>Clave de envío</label>
    <input type="password" id="claveEnvio" placeholder="La que le dieron en la oficina" spellcheck="false" autocomplete="off">
    <div class="m-btns">
      <button class="m-btn m-cancel" onclick="closeSend()">Cancelar</button>
      <button class="m-btn m-confirm" id="btn-enviar-relevo" onclick="enviarAlRelevo()">📤 Enviar ahora</button>
    </div>""",
 """    <div id="estado-clave" style="font-size:12px;font-weight:700;margin:4px 0 10px"></div>
    <label>Clave de envío</label>
    <input type="password" id="claveEnvio" placeholder="La que le dieron en la oficina" spellcheck="false" autocomplete="off">
    <div class="m-btns">
      <button class="m-btn m-cancel" onclick="closeSend()">Cancelar</button>
      <button class="m-btn m-cancel" id="btn-probar-clave" onclick="probarClave()">🔑 Probar clave</button>
      <button class="m-btn m-confirm" id="btn-enviar-relevo" onclick="enviarAlRelevo()">📤 Enviar ahora</button>
    </div>""",
 "20b· indicador de configuración y botón de probar clave")

s = sustituir(s,
 """function openSend() {
  const c = document.getElementById('claveEnvio');
  if(c) c.value = localStorage.getItem('garmel_clave_envio') || '';
  document.getElementById('overlay').classList.add('open');
}""",
 """function openSend() {
  refrescarEstadoClave();
  document.getElementById('overlay').classList.add('open');
}

function refrescarEstadoClave(){
  const guardada = localStorage.getItem('garmel_clave_envio') || '';
  const c = document.getElementById('claveEnvio');
  if(c) c.value = guardada;
  const e = document.getElementById('estado-clave');
  if(e){
    e.textContent = guardada ? '✓ Este teléfono está configurado'
                             : '⚠️ Este teléfono todavía no está configurado';
    e.style.color = guardada ? '#2e7d32' : '#e65100';
  }
}

// Comprueba la clave contra el relevo sin enviar ningún informe, para poder
// dejar un teléfono listo en la oficina.
// El relevo comprueba la clave ANTES que cualquier otra cosa, así que
// cualquier respuesta distinta de «Clave incorrecta» significa que pasó.
async function probarClave(){
  const clave = (document.getElementById('claveEnvio').value || '').trim();
  const logEl = document.getElementById('sendLog');
  const btn   = document.getElementById('btn-probar-clave');
  if(!clave){ alert('Escriba la clave para probarla.'); return; }

  logEl.style.display = 'block';
  logEl.textContent = 'Comprobando la clave…\\n';
  btn.disabled = true;
  try {
    const r = await fetch(RELEVO_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ clave: clave, prueba: true })
    });
    const res = await r.json();
    if(res.error === 'Clave incorrecta'){
      logEl.textContent += '❌ Esa clave no es la correcta.';
      showToast('❌ Clave incorrecta', 'err');
    } else {
      localStorage.setItem('garmel_clave_envio', clave);
      refrescarEstadoClave();
      logEl.textContent += '✅ Clave correcta. Este teléfono quedó configurado.';
      showToast('✅ Teléfono configurado', 'ok');
    }
  } catch(e) {
    logEl.textContent += '❌ No se pudo comprobar: ' + e.message + '\\nHace falta señal para esto.';
    showToast('❌ Sin conexión para comprobar', 'err');
  } finally {
    btn.disabled = false;
  }
}""",
 "20c· comprobar la clave sin enviar un informe")

s = sustituir(s,
 """      localStorage.setItem('garmel_clave_envio', clave);
      logEl.textContent += '✅ Archivado en Drive\\n'""",
 """      localStorage.setItem('garmel_clave_envio', clave);
      refrescarEstadoClave();
      logEl.textContent += '✅ Archivado en Drive\\n'""",
 "20d· el indicador se actualiza tras un envío bueno")


# ── 21. Trabajo de campo: no perder lo escrito, no dejar salir un informe a
#        medias, y distinguir «cero» de «no lo pude ver» ───────────────────

# 21a · Autoguardado. Antes solo guardaba el botón, a mano. En un teléfono con
# poca memoria el navegador descarta la pestaña en segundo plano y se pierde
# todo lo escrito, en silencio y sin que nadie lo note hasta abrir y ver
# el formulario en blanco.
s = sustituir(s,
 """// ── CONFIGURACIÓN DEL TELÉFONO ─────────────────────────────────────────────""",
 """// ── AUTOGUARDADO ───────────────────────────────────────────────────────────
// Guarda solo, en el mismo borrador, dos segundos después del último cambio y
// cada medio minuto. No crea un borrador por cada tecla: reutiliza el que está
// en edición, igual que el botón de guardar.
let _hayCambiosSinGuardar = false;
let _tempAutoguardado = null;

function _marcarCambio(){
  _hayCambiosSinGuardar = true;
  clearTimeout(_tempAutoguardado);
  _tempAutoguardado = setTimeout(autoguardar, 2000);
}

function autoguardar(){
  try {
    if(typeof getTorreActual !== 'function') return;
    const t = getTorreActual();
    if(!t || t === '—') return;            // todavía no hay nada que valga la pena
    saveDraft(true);
    _hayCambiosSinGuardar = false;
    _pintarEstadoGuardado(new Date());
  } catch(e) { /* si no hay espacio, saveDraft ya avisa */ }
}

function _pintarEstadoGuardado(cuando){
  const el = document.getElementById('estado-guardado');
  if(!el) return;
  const hh = String(cuando.getHours()).padStart(2,'0');
  const mm = String(cuando.getMinutes()).padStart(2,'0');
  el.textContent = '💾 guardado ' + hh + ':' + mm;
  el.style.color = '#2e7d32';
}

document.addEventListener('input',  _marcarCambio, true);
document.addEventListener('change', _marcarCambio, true);
setInterval(function(){ if(_hayCambiosSinGuardar) autoguardar(); }, 30000);

window.addEventListener('beforeunload', function(e){
  if(_hayCambiosSinGuardar){ e.preventDefault(); e.returnValue = ''; }
});

// ── CONEXIÓN ───────────────────────────────────────────────────────────────
// El inspector necesita saber si «Enviar» va a funcionar antes de tocarlo.
function _pintarConexion(){
  const el = document.getElementById('estado-conexion');
  if(!el) return;
  if(navigator.onLine){
    el.textContent = '● en línea';
    el.style.color = '#2e7d32';
  } else {
    el.textContent = '● sin señal — el informe queda guardado aquí';
    el.style.color = '#e65100';
  }
}
window.addEventListener('online',  _pintarConexion);
window.addEventListener('offline', _pintarConexion);
window.addEventListener('load',    _pintarConexion);

// ── CONFIGURACIÓN DEL TELÉFONO ─────────────────────────────────────────────""",
 "21a· autoguardado y estado de conexión")

# El autoguardado no debe gritar un aviso cada dos segundos.
s = sustituir(s,
 """function saveDraft(){
  try{""",
 """function saveDraft(silencioso){
  try{""",
 "21b· saveDraft admite guardar en silencio")

s = sustituir(s,
 """      showToast('✅ Borrador modificado y actualizado con éxito', 'ok');""",
 """      if(!silencioso) showToast('✅ Borrador modificado y actualizado con éxito', 'ok');""",
 "21c· sin aviso al autoguardar (modificado)")

s = sustituir(s,
 """      showToast('✅ Nuevo borrador guardado localmente','ok');""",
 """      if(!silencioso) showToast('✅ Nuevo borrador guardado localmente','ok');""",
 "21d· sin aviso al autoguardar (nuevo)")

# 21e · Los dos indicadores, en la barra superior donde siempre se ven.
s = sustituir(s,
 """  <button class="hbtn hbtn-pdf" onclick="window.print()">🖨️ <span>PDF</span></button>""",
 """  <button class="hbtn hbtn-pdf" onclick="imprimirInforme()">🖨️ <span>PDF</span></button>
  <span id="estado-guardado" style="font-size:11px;font-weight:700;color:#999;align-self:center;margin-left:4px"></span>
  <span id="estado-conexion" style="font-size:11px;font-weight:700;align-self:center;margin-left:8px"></span>""",
 "21e· indicadores de guardado y de conexión en la barra")

# 21f · Validación. Nueve campos marcados con * y nada los comprobaba. Importa
# más que antes porque el número del informe se compone de ellos: un informe sin
# torre se archiva como XX-T---P--A--------- y eso ya no se arregla.
s = sustituir(s,
 """async function enviarAlRelevo() {""",
 """// Devuelve la lista de campos obligatorios que faltan, según el ámbito.
function camposFaltantes(){
  const falta = [];
  const simple = [['fecha','Fecha de inspección'], ['convenio','Convenio'],
                  ['empresa','Empresa ejecutora'], ['torre','Torre']];
  simple.forEach(function(par){
    const el = document.getElementById(par[0]);
    if(!el || !String(el.value || '').trim()) falta.push(par[1]);
  });
  if(document.getElementById('torre')?.value === 'NO_REG' &&
     !String(document.getElementById('torre-manual')?.value || '').trim()){
    falta.push('Nombre de la torre');
  }
  if(ambito !== 'torre'){
    if(!String(document.getElementById('piso')?.value || '')) falta.push('Piso');
    if(!String(document.getElementById('apto')?.value || '').trim()) falta.push('N° de apartamento');
  }
  if(typeof getResidentesValues === 'function' && !getResidentesValues().length) falta.push('Ingeniero residente');
  if(typeof getInspectoresValues === 'function' && !getInspectoresValues().length) falta.push('Ingeniero inspector');
  if(!document.querySelectorAll('#estatus .ck-lbl.on').length) falta.push('Estatus de la obra');
  return falta;
}

function _avisarFaltantes(falta){
  return 'Faltan estos datos obligatorios:\\n\\n  ·  ' + falta.join('\\n  ·  ');
}

// El PDF avisa pero deja seguir: a veces se imprime un informe a medias a
// propósito. El envío no, porque lo que se archiva mal se queda mal.
function imprimirInforme(){
  const falta = camposFaltantes();
  if(falta.length && !confirm(_avisarFaltantes(falta) + '\\n\\n¿Generar el PDF de todos modos?')) return;
  window.print();
}

async function enviarAlRelevo() {
  const falta = camposFaltantes();
  if(falta.length){
    alert(_avisarFaltantes(falta) + '\\n\\nEl número del informe se arma con estos datos, ' +
          'así que sin ellos quedaría mal archivado.');
    return;
  }""",
 "21f· validación de los campos obligatorios")

# Ya no hace falta la comprobación suelta de torre que había dentro del envío.
s = sustituir(s,
 """  const datos = getFormData();
  if(!getTorreActual() || getTorreActual() === '—'){
    alert('Falta la torre. Sin torre no se puede archivar el informe.');
    return;
  }

  const fotos = _fotosParaEnviar();""",
 """  const datos = getFormData();
  const fotos = _fotosParaEnviar();""",
 "21g· quitar la comprobación de torre, ya cubierta")

# 21h · Seis huecos de fotografía en vez de tres. Ahora que pesan 24 KB y no
# 3 MB, tres se quedaban cortos para una patología o para la estructura.
s = s.replace("[0,1,2].map(fi=>", "[0,1,2,3,4,5].map(fi=>")
s = s.replace("[0,1,2].forEach(fi=>", "[0,1,2,3,4,5].forEach(fi=>")
cambios.append("21h· seis fotografías por hito en vez de tres")

# 21i · La cámara, no la galería. Un atributo.
s = sustituir(s,
 """<input type="file" accept="image/*" onchange="loadFoto('${p.id}',${fi},this)">""",
 """<input type="file" accept="image/*" capture="environment" onchange="loadFoto('${p.id}',${fi},this)">""",
 "21i· la foto abre la cámara y no la galería", n=2)


# ── 22. «No inspeccionado» y «no aplica» dejan de ser un cero ─────────────
# Hoy, si el inspector no pudo entrar a un apartamento o la torre no tiene
# ascensor, la única salida es dejarlo en cero — y cero significa «no está
# construido». Todo promedio que suba a la torre, a la zona y al tablero
# ejecutivo queda sesgado hacia abajo, y nadie puede distinguir una obra
# atrasada de una obra no inspeccionada.

# 22a · A nivel de ítem: un cuarto botón junto a B / R / M.
s = sustituir(s,
 """<button class="ev-btn M" data-rid="${rid}" onclick="setEv(this)">M</button>""",
 """<button class="ev-btn M" data-rid="${rid}" onclick="setEv(this)">M</button>
            <button class="ev-btn NA" data-rid="${rid}" onclick="setEv(this)" title="No aplica o no se pudo verificar — no cuenta para el promedio">N/A</button>""",
 "22a· botón N/A junto a B/R/M")

s = sustituir(s,
 """.ev-btn.M.on{background:#c62828;border-color:#c62828;color:#fff}""",
 """.ev-btn.M.on{background:#c62828;border-color:#c62828;color:#fff}
.ev-btn.NA{border-color:#bdbdbd}
.ev-btn.NA.on{background:#757575;border-color:#757575;color:#fff}""",
 "22b· estilo del botón N/A")

# 22c · A nivel de hito: un interruptor en la cabecera, para cuando no se llegó
# a inspeccionar el hito entero.
s = sustituir(s,
 """          <div style="display:flex;align-items:center;gap:9px">
            <div class="pct-bdg" id="badge_${p.id}">0%</div>""",
 """          <div style="display:flex;align-items:center;gap:9px">
            <span class="no-insp-tgl" id="noinsp_${p.id}" onclick="event.stopPropagation();toggleNoInspeccionado('${p.id}')"
                  title="Marcar el hito como no inspeccionado en esta visita">⊘</span>
            <div class="pct-bdg" id="badge_${p.id}">0%</div>""",
 "22c· interruptor de hito no inspeccionado")

s = sustituir(s,
 """.ev-btn.NA{border-color:#bdbdbd}""",
 """.no-insp-tgl{cursor:pointer;font-size:15px;opacity:.45;padding:0 4px;user-select:none;color:#fff}
.no-insp-tgl.on{opacity:1;background:rgba(0,0,0,.28);border-radius:6px}
.partida.no-inspeccionada .p-body{opacity:.38;pointer-events:none}
.partida.no-inspeccionada .p-hdr h2::after{content:' · NO INSPECCIONADO';font-size:10px;opacity:.85}
.ev-btn.NA{border-color:#bdbdbd}""",
 "22d· estilo del hito no inspeccionado")

# 22e · La lógica, y lo que de verdad importa: que no cuenten en el promedio.
s = sustituir(s,
 """function recalcTotal(){""",
 """// Un hito no inspeccionado no vale cero: vale «no se sabe». Se apaga, no
// aporta al promedio de la torre, y queda registrado como tal en el informe.
let hitosNoInspeccionados = {};

function toggleNoInspeccionado(pid){
  hitosNoInspeccionados[pid] = !hitosNoInspeccionados[pid];
  _pintarNoInspeccionado(pid);
  recalcTotal();
  _marcarCambio();
}

function _pintarNoInspeccionado(pid){
  const activo = !!hitosNoInspeccionados[pid];
  const bloque = document.getElementById('p_' + pid);
  const tgl    = document.getElementById('noinsp_' + pid);
  if(bloque) bloque.classList.toggle('no-inspeccionada', activo);
  if(tgl)    tgl.classList.toggle('on', activo);
  ['badge_','fpct_','rpct_'].forEach(function(pfx){
    const el = document.getElementById(pfx + pid);
    if(el && activo) el.textContent = '—';
  });
  if(!activo && typeof recalcP === 'function') recalcP(pid);
}

function recalcTotal(){""",
 "22e· lógica del hito no inspeccionado")

# El promedio de la torre ya excluye los hitos que muestran «—», así que basta
# con que un hito apagado muestre «—». Pero el promedio del hito sí tiene que
# saltarse los ítems marcados N/A.
s = sustituir(s,
 """  all.forEach(inp=>{
    const rid=inp.dataset.rid;
    const pr=parseFloat(inp.value)||0;
    const ej=parseFloat(document.getElementById('ej_'+rid)?.value)||0;
    if(pr>0){sumPct+=Math.min(100,Math.round((ej/pr)*100));cnt++;}
  });""",
 """  all.forEach(inp=>{
    const rid=inp.dataset.rid;
    // Un ítem marcado N/A no entra al promedio: no es un cero, es «no cuenta».
    if(document.querySelector(`.ev-btn.NA.on[data-rid="${rid}"]`)) return;
    const pr=parseFloat(inp.value)||0;
    const ej=parseFloat(document.getElementById('ej_'+rid)?.value)||0;
    if(pr>0){sumPct+=Math.min(100,Math.round((ej/pr)*100));cnt++;}
  });""",
 "22f· los ítems N/A no entran al promedio del hito")

s = sustituir(s,
 """function recalcP(pid){
  if(formType === 'hitos') return;""",
 """function recalcP(pid){
  if(formType === 'hitos') return;
  if(hitosNoInspeccionados[pid]) return;""",
 "22g· un hito apagado no recalcula")

# 22h · Viaja en el borrador y vuelve al abrirlo.
s = sustituir(s,
 """    formType: formType,
    ambito: ambito,""",
 """    formType: formType,
    ambito: ambito,
    noInspeccionados: Object.keys(hitosNoInspeccionados).filter(k=>hitosNoInspeccionados[k]),""",
 "22h· los hitos no inspeccionados entran al borrador")

s = sustituir(s,
 """  setAmbito(d.ambito || 'apartamento');""",
 """  setAmbito(d.ambito || 'apartamento');
  hitosNoInspeccionados = {};
  (d.noInspeccionados || []).forEach(function(pid){
    hitosNoInspeccionados[pid] = true;
    _pintarNoInspeccionado(pid);
  });""",
 "22i· vuelven al abrir el borrador")

# 22j · Y se limpian al empezar un informe nuevo. `initAppContent` redibuja los
# hitos, así que basta con vaciar el registro antes de que vuelva a pintarlos.
s = sustituir(s,
 """  initAppContent();
  updateNroInforme();
  showToast('🆕 Formulario limpio para nuevo registro', 'ok');""",
 """  hitosNoInspeccionados = {};
  initAppContent();
  updateNroInforme();
  showToast('🆕 Formulario limpio para nuevo registro', 'ok');""",
 "22j· se limpian al empezar un informe nuevo")

# 22k · Y una leyenda de qué significa cada letra, que no existía en ninguna parte.
s = sustituir(s,
 """  <div class="sec-lbl">📍 Ubicación</div>""",
 """  <div style="background:#f5f7ff;border:1px solid #e0e4ff;border-radius:8px;padding:8px 12px;margin:0 0 12px;font-size:11px;color:#444;line-height:1.6">
    <strong style="color:#1a237e">Escala de evaluación:</strong>
    <b>B</b> = ejecutado conforme, sin observaciones ·
    <b>R</b> = ejecutado con defectos subsanables, requiere corrección ·
    <b>M</b> = mal ejecutado o inservible, requiere rehacer ·
    <b>N/A</b> = no aplica o no se pudo verificar — <em>no cuenta para el promedio</em>
  </div>
  <div class="sec-lbl">📍 Ubicación</div>""",
 "22k· leyenda de B / R / M / N-A")


# ── 23. Un borrador pertenece a su número de informe ──────────────────────
# El fallo: si el inspector terminaba el apartamento 04 y cambiaba al 05 sin
# tocar «Nuevo», el autoguardado seguía escribiendo en el MISMO borrador y el
# 04 se destruía, en silencio. Y pasa justo en el caso normal: sin señal no
# puede enviar entre apartamentos, así que el borrador es lo único que existe.

# 23a · ¿Tiene el informe algo que perder?
s = sustituir(s,
 """function autoguardar(){""",
 """// Un informe «tiene contenido» si ya se evaluó algo. Mientras solo se esté
// llenando el encabezado no hay nada que proteger, y así no se generan
// borradores sueltos cada vez que se toca la torre o el piso.
function _tieneContenido(d){
  if(!d) return false;
  if(String(d.obs_general || '').trim()) return true;
  if((d.fotos && Object.keys(d.fotos).some(k => (d.fotos[k]||[]).some(Boolean)))) return true;
  if(d.fotobs && Object.values(d.fotobs).some(v => String(v||'').trim())) return true;
  if(d.noInspeccionados && d.noInspeccionados.length) return true;
  if(!d.partidas) return false;
  return Object.keys(d.partidas).some(function(k){
    const v = d.partidas[k];
    if(Array.isArray(v)) return v.some(function(f){ return f && (f.pr || f.ej || f.ev); });
    if(v && typeof v === 'object') return !!(v.pct || String(v.obs||'').trim());
    return false;
  });
}

// El número identifica al informe. Si cambia mientras se edita un borrador que
// ya tiene contenido, es OTRO informe: el anterior se conserva y este empieza
// su propia ficha.
let _numeroDelBorrador = null;

function _separarSiCambioElInforme(){
  if(currentEditingIndex === null) return;
  const numeroAhora = document.getElementById('nro-display')?.textContent || '';
  if(!_numeroDelBorrador || _numeroDelBorrador === numeroAhora) return;
  const lista = getSavedReports();
  const anterior = lista[currentEditingIndex];
  if(anterior && _tieneContenido(anterior)){
    currentEditingIndex = null;          // el siguiente guardado crea ficha nueva
    showToast('📄 El informe anterior quedó guardado aparte', 'ok');
  }
  _numeroDelBorrador = numeroAhora;
}

function autoguardar(){""",
 "23a· separar el borrador cuando cambia el informe")

s = sustituir(s,
 """    if(!t || t === '—') return;            // todavía no hay nada que valga la pena
    saveDraft(true);""",
 """    if(!t || t === '—') return;            // todavía no hay nada que valga la pena
    _separarSiCambioElInforme();
    saveDraft(true);
    _numeroDelBorrador = document.getElementById('nro-display')?.textContent || null;""",
 "23b· el autoguardado respeta la separación")

s = sustituir(s,
 """function saveDraft(silencioso){
  try{""",
 """function saveDraft(silencioso){
  try{
    if(!silencioso) _separarSiCambioElInforme();""",
 "23c· el guardado a mano también")

s = sustituir(s,
 """  hitosNoInspeccionados = {};
  (d.noInspeccionados || []).forEach(function(pid){""",
 """  _numeroDelBorrador = d.nro || null;
  hitosNoInspeccionados = {};
  (d.noInspeccionados || []).forEach(function(pid){""",
 "23d· al abrir un borrador se recuerda a qué informe pertenece")

s = sustituir(s,
 """  hitosNoInspeccionados = {};
  initAppContent();""",
 """  hitosNoInspeccionados = {};
  _numeroDelBorrador = null;
  initAppContent();""",
 "23e· «Nuevo» olvida el informe anterior")

# ── 24. «Guardar y siguiente apartamento» ─────────────────────────────────
# De los nueve campos del encabezado, siete se repiten en todo el recorrido de
# una torre. Veinte apartamentos son 180 campos escritos, de los cuales 140
# sobran.
s = sustituir(s,
 """  <button class="hbtn hbtn-nuevo" onclick="nuevoFormulario()" title="Nuevo informe — limpia el formulario">🆕 <span>Nuevo</span></button>""",
 """  <button class="hbtn hbtn-nuevo" onclick="siguienteApartamento()" title="Cierra este informe y prepara el siguiente, conservando torre, empresa y personal">➡️ <span>Siguiente apto.</span></button>
  <button class="hbtn hbtn-nuevo" onclick="nuevoFormulario()" title="Nuevo informe — limpia todo el formulario">🆕 <span>Nuevo</span></button>""",
 "24a· botón de siguiente apartamento")

s = sustituir(s,
 """function nuevoFormulario() {""",
 """// Cierra el informe actual y deja el formulario listo para el siguiente
// apartamento de la misma torre: conserva convenio, empresa, residente,
// inspector, torre y estatus, y limpia solo lo que cambia.
function siguienteApartamento(){
  const falta = camposFaltantes();
  if(falta.length && !confirm(_avisarFaltantes(falta) +
      '\\n\\n¿Guardar así y pasar al siguiente apartamento?')) return;

  saveDraft();                       // el informe actual queda con su propia ficha
  currentEditingIndex = null;        // el siguiente no lo pisa
  _numeroDelBorrador = null;

  document.getElementById('apto').value = '';
  document.getElementById('obs_general').value = '';
  document.getElementById('obs_sp').value = '';
  hitosNoInspeccionados = {};
  initAppContent();                  // redibuja los hitos vacíos
  updateNroInforme();

  const apto = document.getElementById('apto');
  if(apto){ apto.focus(); }
  showToast('➡️ Informe guardado. Listo para el siguiente apartamento', 'ok');
}

function nuevoFormulario() {""",
 "24b· lógica de siguiente apartamento")

# ── 25. Saber cuál ya se envió ────────────────────────────────────────────
s = sustituir(s,
 """      localStorage.setItem('garmel_clave_envio', clave);
      refrescarEstadoClave();""",
 """      localStorage.setItem('garmel_clave_envio', clave);
      refrescarEstadoClave();
      _marcarComoEnviado(datos.nro);""",
 "25a· marcar el borrador como enviado")

s = sustituir(s,
 """function getSavedReports() {""",
 """// Deja constancia de qué informes ya se fueron, para no reenviarlos por
// descuido y crear copias -r2 en Drive.
function _marcarComoEnviado(nro){
  try{
    const lista = getSavedReports();
    let cambio = false;
    lista.forEach(function(b){
      if(b && b.nro === nro && !b.enviado){ b.enviado = new Date().toLocaleString(); cambio = true; }
    });
    if(cambio) localStorage.setItem('garmel_reports_list', JSON.stringify(lista));
  }catch(e){}
}

function getSavedReports() {""",
 "25b· registrar el envío en el borrador")

s = sustituir(s,
 """        <span class="saved-item-sub">📅 Guardado: ${item.timestamp}</span>""",
 """        <span class="saved-item-sub">📅 Guardado: ${item.timestamp}</span>
        <span class="saved-item-sub" style="color:${item.enviado ? '#2e7d32' : '#e65100'};font-weight:700">${item.enviado ? '✅ Enviado ' + item.enviado : '⏳ Sin enviar'}</span>""",
 "25c· la lista muestra qué se envió y qué no")

s = sustituir(s,
 """function sendSavedDirect(index) {
  loadDraftData(index);
  openSend();
}""",
 """function sendSavedDirect(index) {
  const b = getSavedReports()[index];
  if(b && b.enviado && !confirm('Este informe ya se envió el ' + b.enviado +
      '.\\n\\nVolver a enviarlo creará una copia en Drive. ¿Continuar?')) return;
  loadDraftData(index);
  openSend();
}

// ── 26 · Enviar todo lo pendiente de una vez ────────────────────────────
// Al volver a la oficina con doce informes, mandarlos de a uno es tedioso y se
// queda alguno por el camino.
async function enviarPendientes(){
  const clave = localStorage.getItem('garmel_clave_envio') || '';
  if(!clave){ alert('Este teléfono todavía no está configurado. Abra Enviar y escriba la clave una vez.'); return; }

  const lista = getSavedReports();
  const pendientes = lista.map(function(b,i){ return {b:b, i:i}; })
                          .filter(function(x){ return x.b && !x.b.enviado; });
  if(!pendientes.length){ showToast('No hay informes sin enviar', 'ok'); return; }
  if(!confirm('Se van a enviar ' + pendientes.length + ' informe(s) sin enviar. ¿Continuar?')) return;

  let bien = 0, mal = 0;
  for(const x of pendientes){
    showToast('Enviando ' + (bien + mal + 1) + ' de ' + pendientes.length + '…', 'ok');
    const ok = await _enviarUno(x.b, clave);
    if(ok){ bien++; } else { mal++; }
  }
  renderSavedList();
  alert('Enviados: ' + bien + '\\nCon problemas: ' + mal +
        (mal ? '\\n\\nLos que fallaron siguen guardados y se pueden reintentar.' : ''));
}

// Envía un borrador ya guardado, sin cargarlo en pantalla.
async function _enviarUno(b, clave){
  try{
    const fotos = [];
    if(b.fotos) Object.keys(b.fotos).forEach(function(pid){
      (b.fotos[pid]||[]).forEach(function(src, fi){
        if(src) fotos.push({ nombre: pid + '-' + (fi+1), dato: src });
      });
    });
    const sector = (typeof SECTOR_POR_CONVENIO !== 'undefined' && SECTOR_POR_CONVENIO[b.convenio]) || 'XX';
    const r = await fetch(RELEVO_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ clave: clave, numero: b.nro, sector: sector,
                             torre: b.torre, ambito: b.ambito || 'apartamento',
                             datos: _sinFotos(b), fotos: fotos })
    });
    const res = await r.json();
    if(res.ok){ _marcarComoEnviado(b.nro); return true; }
    return false;
  }catch(e){ return false; }
}""",
 "25d· avisar al reenviar, y enviar todos los pendientes")

s = sustituir(s,
 """      <button class="m-btn m-cancel" onclick="closeSavedModal()">Cerrar</button>""",
 """      <button class="m-btn m-cancel" onclick="closeSavedModal()">Cerrar</button>
      <button class="m-btn m-confirm" onclick="enviarPendientes()">📤 Enviar todos los pendientes</button>""",
 "26· botón de enviar todos los pendientes")


# ── 27. Correcciones salidas de las rondas de prueba ──────────────────────

# 27a · Los acentos y la eñe se borraban en vez de convertirse, y eso hacía
# colisionar identificadores distintos: «Ñ2» daba A02, igual que el apartamento
# «2». Y un inspector llamado «Ñandú Óscar» quedaba con iniciales «--».
s = sustituir(s,
 """function _limpiar(v){
  return (v == null ? '' : String(v)).trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}""",
 """function _limpiar(v){
  // Primero se convierten los acentos y la eñe a su letra base; si se borraran,
  // «Ñ2» y «2» darían el mismo identificador, y las iniciales de un nombre
  // acentuado quedarían vacías.
  return (v == null ? '' : String(v))
    .normalize('NFD').replace(/[\\u0300-\\u036f]/g, '')
    .trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}""",
 "27a· los acentos y la eñe se convierten, no se borran")

# 27b · Una cantidad negativa daba un avance negativo: «10 / -2» mostraba -20 %.
s = sustituir(s,
 """function recalcRow(inp){
  const rid=inp.dataset.rid, pid=inp.dataset.p;
  const pr=parseFloat(document.getElementById('pr_'+rid)?.value)||0;
  const ej=parseFloat(document.getElementById('ej_'+rid)?.value)||0;""",
 """function recalcRow(inp){
  const rid=inp.dataset.rid, pid=inp.dataset.p;
  // Una cantidad negativa no existe en obra: se trata como cero en vez de
  // producir un avance negativo.
  const pr=Math.max(0, parseFloat(document.getElementById('pr_'+rid)?.value)||0);
  const ej=Math.max(0, parseFloat(document.getElementById('ej_'+rid)?.value)||0);""",
 "27b· las cantidades negativas no producen avances negativos")

s = sustituir(s,
 """    const pr=parseFloat(inp.value)||0;
    const ej=parseFloat(document.getElementById('ej_'+rid)?.value)||0;
    if(pr>0){sumPct+=Math.min(100,Math.round((ej/pr)*100));cnt++;}""",
 """    const pr=Math.max(0, parseFloat(inp.value)||0);
    const ej=Math.max(0, parseFloat(document.getElementById('ej_'+rid)?.value)||0);
    if(pr>0){sumPct+=Math.min(100,Math.round((ej/pr)*100));cnt++;}""",
 "27c· lo mismo en el promedio del hito")

# 27d · Si el borrador en edición ya no existe —porque el navegador desalojó los
# datos, o porque hay otra pestaña abierta— getFormData reventaba, y con él el
# autoguardado: el inspector seguía escribiendo y nada se guardaba.
s = sustituir(s,
 """    id: currentEditingIndex !== null ? getSavedReports()[currentEditingIndex].id : ('draft_' + Date.now()),""",
 """    id: _idDelBorradorEnEdicion(),""",
 "27d· getFormData deja de reventar con un índice huérfano")

s = sustituir(s,
 """function getFormData(){""",
 """// Si el índice en edición ya no corresponde a ningún borrador, se abandona en
// vez de reventar. Pasaba de verdad: bastaba con que el navegador desalojara el
// almacenamiento para que el autoguardado dejara de funcionar en silencio.
function _idDelBorradorEnEdicion(){
  if(currentEditingIndex === null) return 'draft_' + Date.now();
  const b = getSavedReports()[currentEditingIndex];
  if(b && b.id) return b.id;
  currentEditingIndex = null;
  return 'draft_' + Date.now();
}

function getFormData(){""",
 "27e· recuperarse del índice huérfano")

# 27f · Y que el aviso no sea un mensaje técnico en inglés.
s = sustituir(s,
 """    const sinEspacio = /quota|exceeded|storage/i.test(e.name + ' ' + e.message);
    showToast(sinEspacio
      ? '❌ El teléfono se quedó sin espacio para borradores. Envíe o elimine informes guardados antes de continuar.'
      : '❌ Error al guardar: ' + e.message, 'err');""",
 """    const sinEspacio = /quota|exceeded|storage/i.test(e.name + ' ' + e.message);
    showToast(sinEspacio
      ? '❌ El teléfono se quedó sin espacio. Envíe o elimine informes guardados antes de seguir.'
      : '❌ No se pudo guardar el informe. Anote lo importante y avise a la oficina.', 'err');
    if(!sinEspacio && window.console) console.error('Fallo al guardar:', e);""",
 "27f· mensaje comprensible en vez del error técnico")

# 27g · Pedirle al navegador que NO desaloje nuestros datos. Sin esto, Chrome
# puede borrar el almacenamiento del sitio cuando el teléfono se quede sin
# espacio, y se llevaría por delante los informes sin enviar.
s = sustituir(s,
 """// Inicialización general al cargar
window.onload = function() {""",
 """// Los informes sin enviar viven en este teléfono y en ningún otro lado. Se le
// pide al navegador que trate ese almacenamiento como permanente, para que no
// lo borre cuando el teléfono se quede sin espacio.
if (navigator.storage && navigator.storage.persist) {
  window.addEventListener('load', function(){
    navigator.storage.persisted().then(function(yaEsta){
      if(!yaEsta) navigator.storage.persist();
    }).catch(function(){});
  });
}

// Inicialización general al cargar
window.onload = function() {""",
 "27g· pedir almacenamiento permanente")


# ── 28. Correcciones del modo por hitos, que es el que usan en campo ──────

# 28a · El porcentaje se guardaba crudo. El distintivo mostraba 100 % y el
# informe llevaba «150»; mostraba 0 % y llevaba «-20». Lo que llegaba a Drive y
# a Smartsheet era el valor sin corregir, que es justo lo que ensucia el
# consolidado. Ahora se corrige el campo, no solo lo que se ve.
s = sustituir(s,
 """function recalcHito(pid) {
  const inp = document.getElementById('hitopct_' + pid);
  let val = parseFloat(inp.value) || 0;
  if(val > 100) val = 100;
  if(val < 0) val = 0;""",
 """function recalcHito(pid) {
  const inp = document.getElementById('hitopct_' + pid);
  let val = parseFloat(inp.value) || 0;
  if(val > 100) val = 100;
  if(val < 0) val = 0;
  val = Math.round(val);
  // El campo se corrige a sí mismo: si no, el informe viaja con el valor crudo
  // aunque en pantalla se vea el correcto.
  if(inp.value !== '' && String(val) !== inp.value) inp.value = String(val);""",
 "28a· el porcentaje se corrige en el campo, no solo en el distintivo")

# 28b · Marcar un hito como no inspeccionado no se podía deshacer: al
# reactivarlo el distintivo se quedaba en «—» para siempre, porque se llamaba a
# recalcP, que en este modo no hace nada.
s = sustituir(s,
 """  if(!activo && typeof recalcP === 'function') recalcP(pid);""",
 """  if(!activo){
    if(formType === 'hitos'){
      if(typeof recalcHito === 'function') recalcHito(pid);
    } else if(typeof recalcP === 'function'){
      recalcP(pid);
    }
  }""",
 "28b· se puede deshacer «no inspeccionado» en modo hitos")

# 28c · Y que un hito apagado no siga recalculándose por detrás.
s = sustituir(s,
 """function recalcHito(pid) {
  const inp = document.getElementById('hitopct_' + pid);""",
 """function recalcHito(pid) {
  if(hitosNoInspeccionados[pid]) return;
  const inp = document.getElementById('hitopct_' + pid);""",
 "28c· un hito apagado no recalcula")


# ── 29. El informe cuenta y guarda solo los hitos de su ámbito ────────────
# Un informe de torre estaba sumando al total los hitos de apartamento que
# quedaban ocultos, y los enviaba dentro del informe. El inspector no los veía y
# aun así viajaban. Lo que se ve tiene que ser lo que se manda.
s = sustituir(s,
 """function recalcTotal(){
  let sum=0,cnt=0;
  PARTIDAS.forEach(p=>{""",
 """// Los hitos que corresponden al ámbito elegido. Todo lo demás está oculto y no
// forma parte de este informe.
function _hitosDelAmbito(){
  const esTorre = (ambito === 'torre');
  return PARTIDAS.filter(function(p){
    return (HITOS_DE_TORRE.indexOf(p.id) >= 0) === esTorre;
  });
}

function recalcTotal(){
  let sum=0,cnt=0;
  _hitosDelAmbito().forEach(p=>{""",
 "29a· el total suma solo los hitos del ámbito")

s = sustituir(s,
 """  PARTIDAS.forEach(p=>{
    d.fotobs[p.id] = document.getElementById('fotobs_'+p.id)?.value || '';""",
 """  _hitosDelAmbito().forEach(p=>{
    d.fotobs[p.id] = document.getElementById('fotobs_'+p.id)?.value || '';""",
 "29b· solo se guardan las fotos del ámbito")

s = sustituir(s,
 """  if (formType === 'hitos') {
    PARTIDAS.forEach(p => {
      d.partidas[p.id] = {""",
 """  if (formType === 'hitos') {
    _hitosDelAmbito().forEach(p => {
      d.partidas[p.id] = {""",
 "29c· solo se guardan los hitos del ámbito (modo simplificado)")

s = sustituir(s,
 """  } else {
    PARTIDAS.forEach(p=>{
      d.partidas[p.id]=p.items.map((_,i)=>{""",
 """  } else {
    _hitosDelAmbito().forEach(p=>{
      d.partidas[p.id]=p.items.map((_,i)=>{""",
 "29d· lo mismo en el modo detallado")

s = sustituir(s,
 """function _fotosParaEnviar(){
  const out = [];
  if (typeof PARTIDAS === 'undefined') return out;
  PARTIDAS.forEach(p=>{""",
 """function _fotosParaEnviar(){
  const out = [];
  if (typeof PARTIDAS === 'undefined') return out;
  _hitosDelAmbito().forEach(p=>{""",
 "29e· solo se envían las fotos del ámbito")

# ── 30. Un 99,9 % no es un 100 % ──────────────────────────────────────────
# Redondear hacia arriba declara terminado algo que no lo está, y el 100 % es
# justo el umbral que habilita el cobro (ADR-0004). Se trunca.
s = sustituir(s,
 """  val = Math.round(val);""",
 """  val = Math.floor(val);   // 99,9 % no es 100 %: el 100 % habilita cobro""",
 "30· el porcentaje se trunca, no se redondea hacia arriba")

# ── 31. El número del informe se quedaba sin las iniciales del inspector ───
# El inspector se elige DESPUÉS de torre, piso y apartamento, y elegirlo no
# recalculaba el número. Como el número se lee de la pantalla al guardar y al
# enviar, el informe llegaba a Drive y a la hoja de registro como
# «EZ-T45-P03A04-260828---». Rompía el identificador de ADR-0016.
s = sustituir(s,
 """    manualInput.style.display = 'none';
    manualInput.value = sel.value;
  }
}""",
 """    manualInput.style.display = 'none';
    manualInput.value = sel.value;
  }
  // El número del informe lleva las iniciales del inspector: si no se recalcula
  // aquí, se queda con las de antes de elegirlo — es decir, con ninguna.
  if (typeof updateNroInforme === 'function') updateNroInforme();
}""",
 "31· el número del informe recoge al inspector recién elegido")

# ── 32. La fecha era la de Greenwich, no la del teléfono ───────────────────
# toISOString() da la fecha UTC. Venezuela es UTC−4, así que a partir de las
# 8 de la noche el formulario abría con el día siguiente — y esa fecha entra
# también en el número del informe y en el nombre del archivo en Drive.
s = sustituir(s,
 """  const today = new Date().toISOString().split('T')[0];""",
 """  const ahora = new Date();
  const today = ahora.getFullYear() + '-' +
                String(ahora.getMonth() + 1).padStart(2, '0') + '-' +
                String(ahora.getDate()).padStart(2, '0');""",
 "32· la fecha es la del teléfono, no la de Greenwich")

# ── 33. «Guardar Borrador» no separaba un apartamento del siguiente ────────
# _separarSiCambioElInforme() se rinde mientras _numeroDelBorrador sea nulo, y
# ese valor solo lo escribía autoguardar(). Quien guardaba a mano y cambiaba de
# apartamento antes del autoguardado sobrescribía el informe anterior.
s = sustituir(s,
 """    localStorage.setItem('garmel_reports_list', JSON.stringify(list));
  } catch(e){""",
 """    localStorage.setItem('garmel_reports_list', JSON.stringify(list));
    // Deja anotado a qué informe pertenece lo que acaba de guardarse. Sin esto,
    // el siguiente apartamento se guardaba encima de este.
    _numeroDelBorrador = document.getElementById('nro-display')?.textContent || null;
  } catch(e){""",
 "33· guardar a mano también separa un informe del siguiente")

# ── 34. El total redondeaba hacia arriba lo que cada hito truncaba ─────────
# El cambio 30 trunca cada hito porque el 100 % es el umbral que habilita el
# cobro. El total hacía Math.round, así que cuatro hitos al 100 % y uno al 98 %
# daban un apartamento «terminado». Se trunca igual que sus partes.
s = sustituir(s,
 """  const pct=cnt>0?Math.round(sum/cnt):null;
  const el=document.getElementById('total-num');""",
 """  const pct=cnt>0?Math.floor(sum/cnt):null;   // igual que cada hito: no se redondea hacia arriba
  const el=document.getElementById('total-num');""",
 "34· el total se trunca, igual que cada hito")

# ── 35. Un porcentaje borrado valía 0 %, no «sin dato» ─────────────────────
# Un hito nunca tocado mostraba «—» y quedaba fuera del promedio; uno donde se
# escribió algo y luego se borró mostraba 0 % y sí entraba. Son dos maneras de
# decir lo mismo con dos resultados distintos. Para decir «no se inspeccionó»
# está el interruptor de «no inspeccionado», que es explícito.
s = sustituir(s,
 """function recalcHito(pid) {
  if(hitosNoInspeccionados[pid]) return;
  const inp = document.getElementById('hitopct_' + pid);""",
 """function recalcHito(pid) {
  if(hitosNoInspeccionados[pid]) return;
  const inp = document.getElementById('hitopct_' + pid);

  // Campo vacío es «todavía no se sabe», no «cero por ciento». Vuelve a «—» y
  // sale del promedio del apartamento, como si no se hubiera tocado nunca.
  if((inp.value || '').trim() === ''){
    ['badge_', 'fpct_', 'rpct_'].forEach(pfx => {
      const el = document.getElementById(pfx + pid);
      if(!el) return;
      el.textContent = '—';
      el.className = el.className.replace(/ [gyr] /g, ' ').trim();
    });
    ['fbar_', 'rbar_'].forEach(pfx => {
      const el = document.getElementById(pfx + pid);
      if(el) el.style.width = '0%';
    });
    recalcTotal();
    return;
  }""",
 "35· un porcentaje borrado vuelve a «sin dato», no a cero")

# ── 36. El envío se quedaba colgado con señal mala ────────────────────────
# fetch sin límite espera indefinidamente. En una torre, con una barra de
# señal, el inspector no sabe si esperar o repetir. A los 90 s se corta solo.
s = sustituir(s,
 """  try {
    // Content-Type de texto plano a propósito: evita la verificación previa de
    // CORS, que Apps Script no responde.
    const r = await fetch(RELEVO_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },""",
 """  // Con señal mala un envío puede quedarse esperando para siempre. A los 90
  // segundos se corta y se avisa, en vez de dejar el botón muerto.
  const corte = new AbortController();
  const reloj = setTimeout(function(){ corte.abort(); }, 90000);

  try {
    // Content-Type de texto plano a propósito: evita la verificación previa de
    // CORS, que Apps Script no responde.
    const r = await fetch(RELEVO_URL, {
      method: 'POST',
      signal: corte.signal,
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },""",
 "36a· el envío se rinde a los 90 segundos")

s = sustituir(s,
 """  } catch(e) {
    logEl.textContent += '❌ Sin conexión o el relevo no responde: ' + e.message +
      '\\nEl borrador sigue guardado en este teléfono. Intente de nuevo con señal.';
    showToast('❌ No se pudo enviar. El borrador no se perdió', 'err');
  } finally {
    btn.disabled = false;
  }""",
 """  } catch(e) {
    const seRindio = (e && e.name === 'AbortError');
    logEl.textContent += seRindio
      ? '❌ La señal no alcanzó para enviar (90 s sin respuesta).' +
        '\\nEl borrador sigue guardado en este teléfono. Intente donde haya mejor señal.'
      : '❌ Sin conexión o el relevo no responde: ' + e.message +
        '\\nEl borrador sigue guardado en este teléfono. Intente de nuevo con señal.';
    showToast(seRindio ? '❌ Sin señal suficiente. El borrador no se perdió'
                       : '❌ No se pudo enviar. El borrador no se perdió', 'err');
  } finally {
    clearTimeout(reloj);
    btn.disabled = false;
  }""",
 "36b· decir que fue la señal, no un error raro")

# ── 38. Activar el modo de prueba deja de ser un toque suelto ──────────────
# El botón vive en la barra del inspector. Un toque sin querer marca todos los
# informes del día como PRUEBA-…
s = sustituir(s,
 """function toggleTestMode() {
  TEST_MODE = !TEST_MODE;""",
 """function toggleTestMode() {
  if(!TEST_MODE && !confirm('¿Activar el MODO PRUEBA?\\n\\nLos informes quedarán marcados como PRUEBA y no cuentan como inspección real.')) return;
  TEST_MODE = !TEST_MODE;""",
 "38· el modo de prueba pregunta antes de activarse")

# ── 39. El formulario se llena en un teléfono, parado en una torre ─────────
# Tres cosas medidas en pantalla de 375 px: la cabecera se comía el 31 % del
# alto con ocho botones; todos los campos estaban a 13 px, y por debajo de
# 16 px Safari hace zoom solo al enfocarlos —de ahí que «la pantalla salte»—;
# y el bloque del número de informe se salía 7 px por la derecha, con lo que
# la página entera se podía arrastrar de lado.
s = sustituir(s,
 """@media print{""",
 """/* ── EN EL TELÉFONO, EN OBRA ───────────────────────────────────────────── */
@media (max-width: 700px){
  /* Safari hace zoom solo al enfocar un campo de menos de 16px, y después hay
     que despincharlo a mano. A 16px la pantalla deja de saltar. */
  input:not([type=file]), select, textarea{ font-size:16px !important; }

  /* Mínimo táctil: 44px es la guía de Apple, 48 la de Material. Todo estaba
     entre 32 y 34, que con guantes de obra es tocar el botón de al lado. */
  input:not([type=file]), select, textarea, .hbtn{ min-height:44px; }
  .ev-btn{ min-height:38px; padding:6px 12px; font-size:12px; }

  /* La cabecera ocupaba 252px de 826. El subtítulo no dice nada que el título
     no diga, y los botones se reparten el ancho en filas parejas. */
  .hdr{ padding:8px 12px; gap:6px; }
  .hdr h1{ font-size:13px; line-height:1.3; }
  .hdr p{ display:none; }
  .hdr-btns{ gap:6px; width:100%; }
  .hbtn{ flex:1 1 38%; justify-content:center; padding:8px 10px; font-size:12.5px; }
  .hbtn-test{ flex:0 0 auto; }

  /* El bloque «Informe N° / Fecha / Torre» se salía por la derecha. */
  .logo-bar{ flex-wrap:wrap; padding:10px 14px; gap:8px; }
  .doc-info{ text-align:left; width:100%; }
}

@media print{""",
 "39· que se pueda llenar de pie en una torre, con guantes")

# ── 40. Ocho botones no caben en un teléfono ──────────────────────────────
# Medido en 375 px: la barra ocupaba el 31 % del alto, y al agrandar los
# botones a un tamaño que se pueda tocar con guantes subía al 35 %. El problema
# no es el tamaño, es cuántos hay. En una torre solo se usan tres a cada rato
# —guardar, pasar al siguiente apartamento, enviar—; los otros cinco son de una
# vez por jornada. Esos se van detrás de «⋯ Más». En pantalla grande no cambia
# nada: el grupo se disuelve y siguen todos en fila.
ini_b = s.index('<div class="hdr-btns">')
fin_b = s.index('</div>', s.index('<!-- Botón «Reiniciar N°» retirado'))
s = sustituir(s, s[ini_b:fin_b],
 '<div class="hdr-btns">\n'
 '    <button class="hbtn hbtn-save" onclick="saveDraft()" title="Guardar o actualizar borrador localmente">💾 <span>Guardar</span></button>\n'
 '    <button class="hbtn hbtn-nuevo" onclick="siguienteApartamento()" title="Cierra este informe y prepara el siguiente, conservando torre, empresa y personal">➡️ <span>Siguiente apto.</span></button>\n'
 '    <button class="hbtn hbtn-send" onclick="openSend()">📤 <span>Enviar</span></button>\n'
 '    <button class="hbtn hbtn-mas" id="btn-mas" onclick="toggleMasAcciones()" title="Resto de las acciones">⋯ <span>Más</span></button>\n'
 '    <span id="estado-guardado" style="font-size:11px;font-weight:700;color:#999;align-self:center;margin-left:4px"></span>\n'
 '    <span id="estado-conexion" style="font-size:11px;font-weight:700;align-self:center;margin-left:8px"></span>\n'
 '    <div class="hdr-sec" id="hdr-sec">\n'
 '      <button class="hbtn hbtn-finalizar" onclick="finalizarInforme()" title="Finalizar informe, guardar, incrementar correlativo y volver a la pantalla de inicio">✅ <span>Finalizar</span></button>\n'
 '      <button class="hbtn hbtn-saved-list" onclick="openSavedModal()" title="Ver informes almacenados localmente">📁 <span>Guardados</span></button>\n'
 '      <button class="hbtn hbtn-pdf" onclick="imprimirInforme()">🖨️ <span>PDF</span></button>\n'
 '      <button class="hbtn hbtn-nuevo" onclick="nuevoFormulario()" title="Nuevo informe — limpia todo el formulario">🆕 <span>Nuevo</span></button>\n'
 '      <button class="hbtn hbtn-test" id="btn-test" onclick="toggleTestMode()" title="Activar modo de prueba — el correlativo NO se incrementa" style="background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3)">🧪 <span>Prueba</span></button>\n'
 '    </div>\n'
 '    <!-- Botón «Reiniciar N°» retirado: el número ya no depende de un contador. -->\n'
 '  ',
 "40a· solo las tres acciones de campo quedan a la vista")

s = sustituir(s,
 "function toggleTestMode() {",
 "// El resto de las acciones. En pantalla grande el grupo no existe como caja\n"
 "// —los botones quedan en la misma fila—, así que esto solo actúa en teléfono.\n"
 "function toggleMasAcciones(){\n"
 "  const caja = document.getElementById('hdr-sec');\n"
 "  const btn  = document.getElementById('btn-mas');\n"
 "  if(!caja) return;\n"
 "  const abierto = caja.classList.toggle('abierto');\n"
 "  if(btn) btn.querySelector('span').textContent = abierto ? 'Menos' : 'Más';\n"
 "}\n"
 "\n"
 "function toggleTestMode() {",
 "40b· abrir y cerrar el resto de las acciones")

s = sustituir(s,
 "  .hbtn{ flex:1 1 38%; justify-content:center; padding:8px 10px; font-size:12.5px; }\n"
 "  .hbtn-test{ flex:0 0 auto; }",
 "  .hbtn{ flex:1 1 38%; justify-content:center; padding:8px 10px; font-size:12.5px; }\n"
 "  /* Las cinco acciones de una vez por jornada viven plegadas. */\n"
 "  .hdr-sec{ display:none; width:100%; gap:6px; flex-wrap:wrap; }\n"
 "  .hdr-sec.abierto{ display:flex; }",
 "40c· el grupo plegado, solo en teléfono")

s = sustituir(s,
 ".hdr-btns{display:flex;gap:7px;flex-wrap:wrap}",
 ".hdr-btns{display:flex;gap:7px;flex-wrap:wrap}\n"
 "/* En pantalla grande el grupo se disuelve: los botones siguen en la misma\n"
 "   fila, como siempre, y «⋯ Más» no hace falta. */\n"
 ".hdr-sec{display:contents}\n"
 ".hdr-btns .hbtn-mas{background:rgba(255,255,255,.18);color:#fff;border:1px solid rgba(255,255,255,.3);display:none}\n"
 "@media(max-width:700px){.hdr-btns .hbtn-mas{display:flex}}",
 "40d· en pantalla grande no cambia nada")


# ── 41. Avisar antes de quedarse sin espacio, no cuando ya falló ──────────
# El aviso que había llega tarde: salta cuando el guardado YA reventó. Chrome
# en Android tapa el localStorage en 5 MB por origen, y un informe de
# apartamento con sus fotos pesa una fracción grande de eso — cuánto depende de
# la foto, y eso todavía no está medido en obra. Mientras tanto, el inspector
# tiene que enterarse a tiempo de que le queda poco, con el teléfono en la mano
# y la torre delante, no cuando ya perdió el informe.
s = sustituir(s,
 "    // Deja anotado a qué informe pertenece lo que acaba de guardarse. Sin esto,\n"
 "    // el siguiente apartamento se guardaba encima de este.\n"
 "    _numeroDelBorrador = document.getElementById('nro-display')?.textContent || null;",
 "    // Deja anotado a qué informe pertenece lo que acaba de guardarse. Sin esto,\n"
 "    // el siguiente apartamento se guardaba encima de este.\n"
 "    _numeroDelBorrador = document.getElementById('nro-display')?.textContent || null;\n"
 "    if(!silencioso) avisarSiQuedaPocoEspacio();",
 "41a· revisar el espacio cada vez que se guarda a mano")

s = sustituir(s,
 "function openSavedModal() {",
 "// Cuánto ocupan los informes que todavía no se han enviado. El tope de\n"
 "// Chrome en Android son 5 MB por origen; se avisa al 70 % para que dé tiempo\n"
 "// de enviar o borrar, y no cuando ya no cabe nada.\n"
 "const TOPE_ALMACEN = 5 * 1024 * 1024;\n"
 
 "\n"
 "function espacioUsado(){\n"
 "  try { return (localStorage.getItem('garmel_reports_list') || '').length * 2; }\n"
 "  catch(e){ return 0; }\n"
 "}\n"
 "\n"
 "function avisarSiQuedaPocoEspacio(){\n"
 "  const usado = espacioUsado();\n"
 "  if(usado < TOPE_ALMACEN * 0.7) return;\n"
 "  const sinEnviar = getSavedReports().filter(function(b){ return !b.enviado; }).length;\n"
 "  showToast('⚠️ El teléfono va lleno: ' + Math.round(usado/1048576*10)/10 +\n"
 "            ' MB en informes sin enviar. Envíe los ' + sinEnviar + ' pendientes antes de seguir.', 'err');\n"
 "}\n"
 "\n"
 "function openSavedModal() {",
 "41b· medir el espacio y avisar al 70 %")


# ── 42. Fuera la portada: la herramienta abre en el formulario ────────────
# La portada pedía un toque para no decidir nada: el inspector siempre va al
# mismo sitio. Además sus cuatro tarjetas —«Funciona sin señal», «Registro de
# Fotografías»…— tenían fondo, borde y esquinas redondeadas, o sea el aspecto
# exacto de un botón, pero eran <div> inertes. Y llevaba una segunda copia de
# los dos logos en base64, que pesa en obra y no aporta.
ini_w = s.index('<div id="welcome-screen">')
fin_w = s.index('<!-- STICKY NAV -->')
s = sustituir(s, s[ini_w:fin_w], '', "42a· retirar la portada entera")

# ── 43. Cada modo tiene su enlace ─────────────────────────────────────────
# El enlace pelado abre el formulario por hitos, que es el de campo. Quien
# necesite el detallado en oficina usa …/?modo=detallado. Es el mismo archivo:
# una publicación, una caché, un sitio donde corregir. La separación vive en el
# enlace que se le manda a cada quien, no en el código.
s = sustituir(s,
 "  updateDocInfo();\n"
 "};",
 "  updateDocInfo();\n"
 "\n"
 "  // Sin portada intermedia: se entra directo al formulario que toque.\n"
 "  const modo = new URLSearchParams(location.search).get('modo');\n"
 "  startApp(modo === 'detallado' ? 'detallado' : 'hitos');\n"
 "};",
 "43· abrir directo, y el detallado por ?modo=detallado")

# ── 44. «Finalizar» ya no puede volver a una portada que no existe ────────
# Volvía a la pantalla de inicio. Ahora deja el formulario limpio y listo para
# el informe siguiente, que es lo que en realidad hacía falta después de cerrar
# uno: seguir trabajando, no volver a elegir.
s = sustituir(s,
 "  showToast('✅ ¡Informe finalizado con éxito!', 'ok');\n"
 "  setTimeout(() => {\n"
 "    const welcome = document.getElementById('welcome-screen');\n"
 "    if(welcome) welcome.classList.remove('hidden');\n"
 "  }, 1200);",
 "  showToast('✅ ¡Informe finalizado con éxito!', 'ok');\n"
 "  setTimeout(function(){\n"
 "    currentEditingIndex = null;   // el siguiente informe no pisa al que acaba de cerrarse\n"
 "    _numeroDelBorrador = null;\n"
 "    hitosNoInspeccionados = {};\n"
 "    ['apto', 'obs_general', 'obs_sp'].forEach(function(id){\n"
 "      const el = document.getElementById(id);\n"
 "      if(el) el.value = '';\n"
 "    });\n"
 "    initAppContent();             // redibuja los hitos vacíos, igual que «Siguiente apto.»\n"
 "    updateDocInfo();\n"
 "    window.scrollTo(0, 0);\n"
 "    showToast('Listo para el siguiente informe', 'ok');\n"
 "  }, 1200);",
 "44· finalizar deja el formulario listo para el siguiente")


# ── 45. Los dos contadores de la cabecera ─────────────────────────────────
# Al quitar la portada se perdió el único momento en que el inspector veía algo
# antes de ponerse a llenar. Si arrastra informes de ayer sin enviar, nada se lo
# recuerda. Ahora la cabecera lo dice sola: «Enviar (3)» son los que faltan por
# mandar —el número que importa, porque esos viven solo en este teléfono— y
# «Guardados (7)» es todo lo que hay almacenado.
s = sustituir(s,
 '<button class="hbtn hbtn-send" onclick="openSend()">📤 <span>Enviar</span></button>',
 '<button class="hbtn hbtn-send" onclick="openSend()">📤 <span>Enviar</span><b id="cnt-pendientes" style="display:none;margin-left:5px"></b></button>',
 "45a· sitio para el contador de pendientes")

s = sustituir(s,
 '<button class="hbtn hbtn-saved-list" onclick="openSavedModal()" title="Ver informes almacenados localmente">📁 <span>Guardados</span></button>',
 '<button class="hbtn hbtn-saved-list" onclick="openSavedModal()" title="Ver informes almacenados localmente">📁 <span>Guardados</span><b id="cnt-guardados" style="display:none;margin-left:5px"></b></button>',
 "45b· sitio para el contador de guardados")

s = sustituir(s,
 "function openSavedModal() {",
 "// Cuántos informes hay guardados y cuántos siguen sin enviar. Se repinta cada\n"
 "// vez que esa cuenta puede haber cambiado: al guardar, al borrar, al enviar y\n"
 "// al abrir la herramienta.\n"
 "function actualizarContadores(){\n"
 "  let lista = [];\n"
 "  try { lista = getSavedReports(); } catch(e){ return; }\n"
 "  const pendientes = lista.filter(function(b){ return b && !b.enviado; }).length;\n"
 "  const pintar = function(id, n){\n"
 "    const el = document.getElementById(id);\n"
 "    if(!el) return;\n"
 "    el.textContent = '(' + n + ')';\n"
 "    el.style.display = n > 0 ? 'inline' : 'none';\n"
 "  };\n"
 "  pintar('cnt-pendientes', pendientes);\n"
 "  pintar('cnt-guardados', lista.length);\n"
 "}\n"
 "\n"
 "function openSavedModal() {",
 "45c· contar los guardados y los que faltan por enviar")

# Los cuatro sitios donde esa cuenta cambia.
s = sustituir(s,
 "    if(!silencioso) avisarSiQuedaPocoEspacio();",
 "    actualizarContadores();\n"
 "    if(!silencioso) avisarSiQuedaPocoEspacio();",
 "45d· recontar al guardar")

s = sustituir(s,
 "    if(cambio) localStorage.setItem('garmel_reports_list', JSON.stringify(lista));\n"
 "  }catch(e){}",
 "    if(cambio) localStorage.setItem('garmel_reports_list', JSON.stringify(lista));\n"
 "    actualizarContadores();\n"
 "  }catch(e){}",
 "45e· recontar al enviar")

s = sustituir(s,
 "  renderSavedList();\n"
 "  showToast('🗑️ Informe eliminado de la lista', 'ok');",
 "  renderSavedList();\n"
 "  actualizarContadores();\n"
 "  showToast('🗑️ Informe eliminado de la lista', 'ok');",
 "45f· recontar al borrar")

s = sustituir(s,
 "  startApp(modo === 'detallado' ? 'detallado' : 'hitos');",
 "  startApp(modo === 'detallado' ? 'detallado' : 'hitos');\n"
 "  actualizarContadores();",
 "45g· recontar al abrir la herramienta")


# ── 46. Un informe enviado no vuelve solo a «sin enviar» ──────────────────
# getFormData() arma el borrador desde la pantalla, y la pantalla no sabe si ya
# se envió. Así que el autoguardado —cada 30 s, sin que nadie toque nada—
# reescribía la ficha encima y borraba la marca. Consecuencia: «Enviar
# pendientes» lo tomaba por pendiente y lo archivaba OTRA VEZ en Drive, con su
# fila repetida en el Registro. La marca se conserva; si de verdad hace falta
# reenviarlo, el botón de enviar pregunta primero, que para eso está.
s = sustituir(s,
 "    if(currentEditingIndex !== null && list[currentEditingIndex]) {\n"
 "      list[currentEditingIndex] = data;",
 "    if(currentEditingIndex !== null && list[currentEditingIndex]) {\n"
 "      if(list[currentEditingIndex].enviado && !data.enviado){\n"
 "        data.enviado = list[currentEditingIndex].enviado;\n"
 "      }\n"
 "      list[currentEditingIndex] = data;",
 "46· lo enviado sigue enviado aunque se vuelva a guardar")


# ── 13. Registrar el service worker, que es lo que hace que abra sin señal ──
s = sustituir(s,
"""// Inicialización general al cargar
window.onload = function() {""",
"""// ═══════════════════════════════════════════════
// FUNCIONAMIENTO SIN SEÑAL
// El navegador se guarda una copia la primera vez que se abre con internet.
// A partir de ahí abre sin señal, indefinidamente, y se actualiza solo cuando
// vuelve a haber conexión.
// ═══════════════════════════════════════════════
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function(){
    navigator.serviceWorker.register('sw.js').catch(function(){ /* sin copia local */ });
  });
}

// Inicialización general al cargar
window.onload = function() {""",
 "13· registrar el service worker")

open(SALIDA, "w", encoding="utf-8").write(s)

print("✓ index.html construido — %d KB" % (os.path.getsize(SALIDA) // 1024))
for i, c in enumerate(cambios, 1):
    print("   %s" % c)
