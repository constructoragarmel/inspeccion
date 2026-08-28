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


# ── 47. Decía «máx. 3» y hay seis ranuras ─────────────────────────────────
# Texto que quedó de cuando eran tres. Quien lo lea deja de tomar fotos a la
# tercera, y la foto es la evidencia que sostiene la valuación.
s = sustituir(s, "(máx. 3)", "(máx. 6)", "47· el máximo de fotos que dice es el que hay", 2)

# ── 48. El nombre del hito se repetía cuatro veces en la misma tarjeta ─────
# En el encabezado, en la etiqueta del porcentaje, en la de observaciones y en
# la de fotografías. La tarjeta ocupaba 631 px de 812 en un teléfono, y buena
# parte era repetir lo que el encabezado ya dice. Se recorta EN PANTALLA y se
# conserva entero EN EL PDF, que es lo que llega al Ministerio y ahí sí hace
# falta que cada sección diga de qué hito habla.
s = sustituir(s,
 "<h2>${p.nombre} (Evaluación por Hitos)</h2>",
 "<h2>${p.nombre}<span class=\"solo-impresion\"> (Evaluación por Hitos)</span></h2>",
 "48a· el encabezado del hito no repite el modo")

s = sustituir(s,
 "<label>Porcentaje general de avance en este hito (${p.nombre}) *</label>",
 "<label>Porcentaje de avance<span class=\"solo-impresion\"> en este hito (${p.nombre})</span> *</label>",
 "48b· etiqueta corta del porcentaje")

s = sustituir(s,
 "<label>Observaciones visuales de obra — ${p.nombre}</label>",
 "<label>Observaciones visuales de obra<span class=\"solo-impresion\"> — ${p.nombre}</span></label>",
 "48c· etiqueta corta de observaciones")

s = sustituir(s,
 '<div class="foto-sec-title">📷 Fotografías — ${p.nombre} (máx. 6)</div>\n'
 '            <div class="foto-grid" id="fotos_${p.id}">\n'
 '              ${[0,1,2,3,4,5].map(fi=>`',
 '<div class="foto-sec-title">📷 Fotografías<span class="solo-impresion"> — ${p.nombre}</span> (máx. 6)</div>\n'
 '            <div class="foto-grid" id="fotos_${p.id}">\n'
 '              ${[0,1,2,3,4,5].map(fi=>`',
 "48d· etiqueta corta de fotografías (solo en el modo por hitos)")

# ── 49. Los controles más pequeños eran los más delicados ─────────────────
# El interruptor de «no inspeccionado» medía 19×20 px y la flecha de plegar
# 11×18. El primero es justo el que evita que un hito que nadie fue a ver
# cuente como 0 %: si no se puede tocar con guantes, en la práctica no existe.
# Y en «Guardados», borrar (32 px) estaba pegado a enviar (54 px) — un informe
# sin enviar vive solo en ese teléfono.
s = sustituir(s,
 "@media print{",
 "/* Lo que solo tiene sentido en el papel. */\n"
 ".solo-impresion{display:none}\n"
 "\n"
 "/* Los dos controles del encabezado de cada hito, tocables con guantes. */\n"
 "@media (max-width: 700px){\n"
 "  .no-insp-tgl, .arrow{\n"
 "    min-width:44px; min-height:44px;\n"
 "    display:inline-flex; align-items:center; justify-content:center;\n"
 "  }\n"
 "  .p-hdr{ padding:6px 10px 6px 16px; }\n"
 "  /* Borrar deja de estar pegado a enviar: son lo contrario una de otra. */\n"
 "  .saved-item{ flex-wrap:wrap; gap:8px; }\n"
 "  .saved-item-actions{ width:100%; gap:10px; }\n"
 "  .s-btn{ min-height:44px; font-size:12.5px; padding:8px 12px; flex:1 1 auto; }\n"
 "  .s-btn-del{ flex:0 0 56px; margin-left:26px; }\n"
 "}\n"
 "\n"
 "@media print{",
 "49· agrandar los controles chicos y apartar el de borrar")

s = sustituir(s,
 "  .hdr-btns,.arrow,.add-row-btn,#mode-bar,.hbtn,",
 "  .solo-impresion{display:inline!important}\n"
 "  .hdr-btns,.arrow,.add-row-btn,#mode-bar,.hbtn,",
 "49b· en el papel vuelve el nombre completo del hito")


# ── 50. Lo marcado tiene que verse en papel, y en blanco y negro ──────────
# El estatus de la obra, los agentes externos y la evaluación B/R/M señalan lo
# elegido con texto BLANCO sobre fondo de color. El navegador imprime en modo
# «economy», que descarta los fondos: eso deja texto blanco sobre papel blanco,
# o sea la selección desaparecida del informe. Y el expediente de rendición se
# entrega en tres ejemplares FÍSICOS (`PA-76`), así que puede además salir de
# una impresora en blanco y negro.
#
# Se invierte para el papel —negro sobre blanco, con borde grueso— y se añade
# una marca ▣/▢ que no depende de ningún color para leerse.
s = sustituir(s,
 "  .bar-bg{display:none}",
 "  /* Lo seleccionado, legible aunque la impresora descarte fondos o sea B/N. */\n"
 "  .ck-lbl.on, .ag-btn.on, .ev-btn.on{\n"
 "    background:#fff!important; color:#000!important;\n"
 "    border:2px solid #000!important; font-weight:800!important;\n"
 "    print-color-adjust:exact; -webkit-print-color-adjust:exact;\n"
 "  }\n"
 "  .ck-lbl, .ag-btn{ color:#000!important; }\n"
 "  .ck-lbl.on::before, .ag-btn.on::before{ content:'▣\\00A0'; }\n"
 "  .ck-lbl:not(.on)::before, .ag-btn:not(.on)::before{ content:'▢\\00A0'; color:#888; }\n"
 "  .bar-bg{display:none}",
 "50· lo marcado se ve en papel aunque se impriman sin color")


# ── 51. La clave se comprueba, no se cree ─────────────────────────────────
# El teléfono guardaba lo que viniera en el enlace y decía «configurado»
# aunque la clave estuviera mal. Y llega mal con facilidad: WhatsApp y otros
# suelen dejar fuera la puntuación final de una URL, así que una clave que
# termine en «!» puede llegar cortada. El error no se veía hasta el primer
# envío, en la torre, con el informe ya hecho.
#
# El relevo comprueba la clave ANTES de mirar nada más y responde «Clave
# incorrecta» o «Faltan numero, sector o torre». Ese segundo error significa
# que la clave está bien. Sirve de comprobación y no crea nada en Drive.
s = sustituir(s,
 "    if(clave) localStorage.setItem('garmel_clave_envio', clave);\n"
 "    // Se borra de la barra de direcciones para que no quede a la vista.\n"
 "    history.replaceState(null, '', location.pathname + location.search);\n"
 "    window.addEventListener('load', function(){\n"
 "      if(typeof showToast === 'function') showToast('✅ Este teléfono quedó configurado', 'ok');\n"
 "    });",
 "    if(clave) localStorage.setItem('garmel_clave_envio', clave);\n"
 "    // Se borra de la barra de direcciones para que no quede a la vista.\n"
 "    history.replaceState(null, '', location.pathname + location.search);\n"
 "    window.addEventListener('load', function(){\n"
 "      comprobarClave(clave);\n"
 "    });",
 "51a· al configurar, comprobar en vez de suponer")

s = sustituir(s,
 "// ── ÁMBITO DEL INFORME ─────────────────────────────────────────────────────",
 "// Le pregunta al relevo si esta clave sirve. No manda ningún informe: el\n"
 "// relevo rechaza la clave antes de mirar el resto, así que un envío vacío\n"
 "// distingue «clave mala» de «clave buena, faltan datos» sin crear nada.\n"
 "async function comprobarClave(clave){\n"
 "  const aviso = function(t, tipo){ if(typeof showToast === 'function') showToast(t, tipo); };\n"
 "  if(!navigator.onLine){\n"
 "    aviso('Clave guardada. Se comprobará en el primer envío con señal.', 'ok');\n"
 "    return;\n"
 "  }\n"
 "  const corte = new AbortController();\n"
 "  const reloj = setTimeout(function(){ corte.abort(); }, 20000);\n"
 "  try{\n"
 "    const r = await fetch(RELEVO_URL, {\n"
 "      method: 'POST',\n"
 "      signal: corte.signal,\n"
 "      headers: { 'Content-Type': 'text/plain;charset=utf-8' },\n"
 "      body: JSON.stringify({ clave: clave })\n"
 "    });\n"
 "    const res = await r.json();\n"
 "    if(res.ok || !/clave/i.test(res.error || '')){\n"
 "      aviso('✅ Este teléfono quedó configurado', 'ok');\n"
 "    } else {\n"
 "      localStorage.removeItem('garmel_clave_envio');\n"
 "      if(typeof refrescarEstadoClave === 'function') refrescarEstadoClave();\n"
 "      alert('La clave del enlace NO es correcta.\\n\\n' +\n"
 "            'Suele pasar cuando el enlace llega cortado por WhatsApp. ' +\n"
 "            'Pida que se lo reenvíen y ábralo completo.');\n"
 "    }\n"
 "  } catch(e){\n"
 "    aviso('Clave guardada. No se pudo comprobar ahora; se verá en el primer envío.', 'ok');\n"
 "  } finally {\n"
 "    clearTimeout(reloj);\n"
 "  }\n"
 "}\n"
 "\n"
 "// ── ÁMBITO DEL INFORME ─────────────────────────────────────────────────────",
 "51b· preguntarle al relevo si la clave sirve")

# ── 52. La leyenda B/R/M salía donde no hay botones B/R/M ─────────────────
# La escala «B = conforme · R = defectos subsanables · M = mal ejecutado ·
# N/A» explica los botones del modo detallado. En el modo por hitos —el que se
# usa en obra— esos botones no existen: el inspector escribe un porcentaje. La
# leyenda quedaba explicando controles que no están en pantalla.
s = sustituir(s,
 '<div style="background:#f5f7ff;border:1px solid #e0e4ff;border-radius:8px;padding:8px 12px;margin:0 0 12px;font-size:11px;color:#444;line-height:1.6">\n'
 '    <strong style="color:#1a237e">Escala de evaluación:</strong>',
 '<div id="escala-brm" style="background:#f5f7ff;border:1px solid #e0e4ff;border-radius:8px;padding:8px 12px;margin:0 0 12px;font-size:11px;color:#444;line-height:1.6">\n'
 '    <strong style="color:#1a237e">Escala de evaluación:</strong>',
 "52a· poder señalar la leyenda de la escala")

s = sustituir(s,
 "function setupFormTypeUI() {",
 "function setupFormTypeUI() {\n"
 "  // La escala B/R/M solo describe los botones del modo detallado.\n"
 "  const escala = document.getElementById('escala-brm');\n"
 "  if (escala) escala.style.display = (formType === 'hitos') ? 'none' : '';",
 "52b· la escala solo donde hay botones que explicar")


# ── 53. Siete hitos son una serie, no siete cosas distintas ───────────────
# Cada hito traía su propio color: gris azulado, índigo, turquesa, naranja,
# naranja quemado, rojo y verde. Un arcoíris que además gasta los colores que
# SÍ significan algo — el rojo y el naranja leen como alarma cuando solo son
# categorías. Se pasan a una sola familia de azules, y el verde, el ámbar y el
# rojo quedan reservados para el avance y las alertas, que es información.
s = sustituir(s,
 "const PARTIDAS = [",
 "// Una escala de azules, de la más oscura a la más clara, para que los siete\n"
 "// hitos se lean como una serie ordenada. El color de cada hito en el archivo\n"
 "// original se conserva en el dato; lo que cambia es cómo se pinta.\n"
 "const ESCALA_HITOS = ['#1a237e','#283593','#303f9f','#3949ab','#1565c0','#0277bd','#01579b'];\n"
 "function colorHito(p){\n"
 "  const i = (typeof PARTIDAS !== 'undefined') ? PARTIDAS.indexOf(p) : -1;\n"
 "  return ESCALA_HITOS[i] || ESCALA_HITOS[0];\n"
 "}\n"
 "\n"
 "const PARTIDAS = [",
 "53a· una escala de azules en vez de un color por hito")

s = sustituir(s, "d.style.borderLeftColor = p.color;", "d.style.borderLeftColor = colorHito(p);",
              "53b· borde del hito, modo por hitos")
s = sustituir(s, "d.style.borderLeftColor=p.color;", "d.style.borderLeftColor=colorHito(p);",
              "53c· borde del hito, modo detallado")
s = sustituir(s, '<div class="p-hdr" style="background:${p.color}"',
                 '<div class="p-hdr" style="background:${colorHito(p)}"',
              "53d· encabezado del hito", 2)
s = sustituir(s, 'style="width:0%;background:${p.color}"', 'style="width:0%;background:${colorHito(p)}"',
              "53e· barras de avance", 3)
s = sustituir(s, '<thead style="background:${p.color}">', '<thead style="background:${colorHito(p)}">',
              "53f· cabecera de la tabla del modo detallado")

# ── 54. Los emojis, solo donde son una acción ─────────────────────────────
# 🏛️ 🧱 🚪 🔧 ⚡ 🔥 ⚙️ en los hitos y 📋 🏗️ 📍 📊 en los títulos de sección le
# dan al informe aire de cartel escolar, y este documento lo firma un ingeniero
# y lo lee un Ministerio. Se quedan los de las acciones —guardar, enviar,
# finalizar, guardados, PDF, borrar—, que son de lectura universal y ayudan a
# encontrar el botón de un vistazo.
s = sustituir(s,
 '<div class="p-hdr-l"><span style="font-size:17px">${p.icon}</span><h2>${p.nombre}<span class="solo-impresion"> (Evaluación por Hitos)</span></h2></div>',
 '<div class="p-hdr-l"><h2>${p.nombre}<span class="solo-impresion"> (Evaluación por Hitos)</span></h2></div>',
 "54a· sin icono en el encabezado del hito")

s = sustituir(s,
 '<div class="p-hdr-l"><span style="font-size:17px">${p.icon}</span><h2>${p.nombre}</h2></div>',
 '<div class="p-hdr-l"><h2>${p.nombre}</h2></div>',
 "54b· sin icono en el encabezado del hito, modo detallado")

s = sustituir(s, '<div class="res-name">${p.icon} ${p.nombre}</div>',
                 '<div class="res-name">${p.nombre}</div>',
              "54c· sin icono en el resumen")

for viejo, nuevo, etiq in [
    ('id="hdr-title">📋 Informe de Inspección Técnica de Obra',
     'id="hdr-title">Informe de Inspección Técnica de Obra', "54d· título"),
    ('<div class="sec-lbl">📋 Identificación del Proyecto',
     '<div class="sec-lbl">Identificación del Proyecto', "54e· sección identificación"),
    ('<div class="sec-lbl">🏗️ Empresa y Personal',
     '<div class="sec-lbl">Empresa y Personal', "54f· sección empresa"),
    ('<div class="sec-lbl">📍 Ubicación',
     '<div class="sec-lbl">Ubicación', "54g· sección ubicación"),
    ('<div class="sec-div">📊 EVALUACIÓN DE AVANCE POR HITOS Y SUBITEMS',
     '<div class="sec-div">EVALUACIÓN DE AVANCE POR HITOS Y SUBITEMS', "54h· divisor de evaluación"),
    ("hdrTitle.textContent = '📋 Informe de Inspección por Hitos",
     "hdrTitle.textContent = 'Informe de Inspección por Hitos", "54i· título en modo hitos"),
    ("hdrTitle.textContent = '📋 Informe de Inspección Técnica de",
     "hdrTitle.textContent = 'Informe de Inspección Técnica de", "54j· título en modo detallado"),
    ('<div class="foto-sec-title">📷 Fotografías',
     '<div class="foto-sec-title">Fotografías', "54k· sección de fotografías"),
]:
    s = sustituir(s, viejo, nuevo, etiq)


# ── 55. Los botones tenían que parecer botones ────────────────────────────
# En la barra azul los botones eran blanco translúcido sobre azul: se leían
# como texto sobre un fondo, no como algo que se pulsa. Pasan a relleno sólido
# con borde, jerarquizados por lo que hacen:
#   Guardar   — blanco sobre azul: la acción constante, el mayor contraste
#   Siguiente — azul acero: se usa una vez por apartamento
#   Enviar    — verde: es lo único que saca el informe del teléfono
#   Más       — contorno: no es una acción, es un cajón
s = sustituir(s,
 ".hbtn{padding:7px 13px;border:none;border-radius:7px;font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:5px;transition:all .15s}",
 ".hbtn{padding:8px 14px;border:1.5px solid transparent;border-radius:7px;font-size:12px;font-weight:700;"
 "cursor:pointer;display:flex;align-items:center;gap:6px;transition:all .15s;letter-spacing:.2px}",
 "55a· los botones llevan borde propio")

s = sustituir(s,
 ".hbtn-nuevo{background:rgba(105,240,174,.25);color:#fff;border:1px solid rgba(105,240,174,.4)}\n"
 ".hbtn-save{background:rgba(255,255,255,.2);color:#fff}\n"
 ".hbtn-saved-list{background:rgba(255,193,7,.3);color:#fff;border:1px solid rgba(255,193,7,.5)}\n"
 ".hbtn-send{background:#43a047;color:#fff}\n"
 ".hbtn-pdf{background:var(--orange);color:#fff}\n"
 ".hbtn-finalizar{background:#8e24aa;color:#fff;border:1px solid rgba(255,255,255,.3)}",
 "/* Relleno sólido y contraste real: sobre la barra azul, un botón tiene que\n"
 "   distinguirse del fondo sin que haya que adivinarlo. */\n"
 ".hbtn-save{background:#fff;color:#1a237e;border-color:#fff}\n"
 ".hbtn-nuevo{background:#1e88e5;color:#fff;border-color:#64b5f6}\n"
 ".hbtn-send{background:#2e7d32;color:#fff;border-color:#66bb6a}\n"
 ".hbtn-finalizar{background:#0d47a1;color:#fff;border-color:#5c8fd6}\n"
 ".hbtn-saved-list{background:#e8eaf6;color:#1a237e;border-color:#c5cae9}\n"
 ".hbtn-pdf{background:#eceff1;color:#37474f;border-color:#cfd8dc}\n"
 ".hbtn-mas{background:transparent;color:#fff;border-color:rgba(255,255,255,.55)}\n"
 ".hbtn-test{background:transparent;color:#fff;border-color:rgba(255,255,255,.35);font-weight:600}",
 "55b· cada botón con su color, según lo que hace")

# La regla del cambio 40d ponía el color de «Más» y ya no hace falta.
s = sustituir(s,
 ".hdr-btns .hbtn-mas{background:rgba(255,255,255,.18);color:#fff;border:1px solid rgba(255,255,255,.3);display:none}",
 ".hdr-btns .hbtn-mas{display:none}",
 "55c· «Más» toma su color de la regla nueva")

# El botón de prueba traía su color escrito en el atributo style, que gana a
# cualquier hoja: se quita para que lo gobierne la clase.
s = sustituir(s,
 ' title="Activar modo de prueba — el correlativo NO se incrementa" style="background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3)"',
 ' title="Activar modo de prueba — el correlativo NO se incrementa"',
 "55d· el modo prueba deja de llevar su color a mano")

s = sustituir(s,
 "    btn.style.background = '#c62828'; btn.style.borderColor = '#c62828';",
 "    btn.style.background = '#c62828'; btn.style.borderColor = '#ef5350';",
 "55e· el aviso de modo prueba, con borde visible")

s = sustituir(s,
 "    btn.style.background = 'rgba(255,255,255,.15)'; btn.style.borderColor = 'rgba(255,255,255,.3)';",
 "    btn.style.background = ''; btn.style.borderColor = '';",
 "55f· al salir del modo prueba, vuelve a su color de clase")


# ── 56. El interruptor de «no inspeccionado», legible y fuera del PDF ─────
# Ya se puede tocar (44 px), pero seguía siendo un ⊘ al 45 % de opacidad que
# no se lee como un control. Es el que evita que un hito que nadie fue a ver
# cuente como 0 %, así que tiene que verse. Y en el papel sobra: el rótulo
# «· NO INSPECCIONADO» ya dice lo mismo, y un ⊘ suelto junto a cada hito es
# ruido en un documento que firma un ingeniero.
s = sustituir(s,
 ".no-insp-tgl{cursor:pointer;font-size:15px;opacity:.45;padding:0 4px;user-select:none;color:#fff}",
 ".no-insp-tgl{cursor:pointer;font-size:15px;opacity:.85;padding:0 4px;user-select:none;color:#fff;"
 "border:1.5px solid rgba(255,255,255,.5);border-radius:6px;line-height:1}",
 "56a· el interruptor se ve como un control")

s = sustituir(s,
 ".no-insp-tgl.on{opacity:1;background:rgba(0,0,0,.28);border-radius:6px}",
 ".no-insp-tgl.on{opacity:1;background:rgba(0,0,0,.35);border-color:#fff;border-width:2px}",
 "56b· y se nota cuando está activado")

s = sustituir(s,
 "  .hdr-btns,.arrow,.add-row-btn,#mode-bar,.hbtn,",
 "  .hdr-btns,.arrow,.no-insp-tgl,.add-row-btn,#mode-bar,.hbtn,",
 "56c· el interruptor no sale en el PDF")


# ── 57. Oscuro sobre oscuro: el porcentaje era ilegible ───────────────────
# Auditado con la fórmula de contraste de la WCAG sobre la pantalla real: 67
# elementos por debajo del mínimo. El peor, con diferencia, es el número que da
# sentido a toda la herramienta: el distintivo de porcentaje va sobre el
# encabezado azul del hito con el color semántico pensado para fondo claro.
# Verde #2e7d32 sobre azul #0277bd da 1,07 de contraste — invisible. El rojo,
# 1,6. El ámbar, 2,17.
#
# El distintivo pasa a fondo blanco sólido, y los tres colores semánticos se
# oscurecen para que también se lean sobre blanco, donde el ámbar daba 2,65.
s = sustituir(s,
 ".pct-bdg{background:rgba(255,255,255,.25);color:#fff;font-weight:900;font-size:14px;padding:3px 11px;border-radius:20px;min-width:52px;text-align:center}",
 ".pct-bdg{background:#fff;color:#1a237e;font-weight:900;font-size:14px;padding:3px 11px;border-radius:20px;min-width:52px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,.25)}",
 "57a· el porcentaje sobre blanco, legible en cualquier encabezado")

s = sustituir(s,
 ".g{color:#2e7d32}.y{color:#f57f17}.r{color:#c62828}",
 "/* Oscurecidos para pasar el 4,5:1 sobre blanco: antes el ámbar daba 2,65. */\n"
 ".g{color:#1b5e20}.y{color:#8f4b00}.r{color:#b71c1c}",
 "57b· verde, ámbar y rojo legibles sobre blanco")

# Texto auxiliar: #aaa sobre blanco daba 2,32 en 44 sitios, y #888 daba 3,54.
s = sustituir(s, ".field-note{font-size:10px;color:#aaa;margin-top:2px}",
                 ".field-note{font-size:10px;color:#5f6b7a;margin-top:2px}",
              "57c· las notas de campo se leen")
s = sustituir(s, "color:#aaa", "color:#5f6b7a", "57d· resto del texto auxiliar", 40)
s = sustituir(s, "color:#888", "color:#5a6672", "57e· subtítulos", 20)

# Blanco sobre #1e88e5 daba 3,68; sobre #1565c0 da 5,14.
s = sustituir(s, ".hbtn-nuevo{background:#1e88e5;color:#fff;border-color:#64b5f6}",
                 ".hbtn-nuevo{background:#1565c0;color:#fff;border-color:#64b5f6}",
              "57f· el azul de los botones aguanta el texto blanco")

# Blanco sobre naranja #e65100 daba 3,79 en los selectores de modo y de ámbito.
s = sustituir(s, "background:#e65100;color:#fff", "background:#a63d00;color:#fff",
              "57g· el naranja de los selectores se oscurece", 4)

# Los dos indicadores de estado iban en verde oscuro sobre la barra azul: 1,12.
s = sustituir(s, "el.textContent = '💾 guardado ' + hh + ':' + mm;\n  el.style.color = '#2e7d32';",
                 "el.textContent = '💾 guardado ' + hh + ':' + mm;\n  el.style.color = '#c8e6c9';",
              "57h· «guardado» se lee sobre la barra azul")


# ── 58. Ordenar los botones por el recorrido del inspector ───────────────
# Había ocho botones y cuatro nombres que compiten: «Guardar», «Guardados»,
# «Finalizar» y «Nuevo». Nadie puede saber cuál hace qué.
#
# En una jornada de ocho apartamentos: se pasa al siguiente 8 veces, se envía
# entre 1 y 8, se guarda a mano por tranquilidad —el autoguardado ya corre cada
# 30 s—, y el PDF, el informe en blanco y el modo prueba no se tocan casi nunca.
#
#   Primero  ➡️ Guardar y siguiente  — el verbo del trabajo, 8 veces al día
#   Igual    📤 Enviar (n)           — no por frecuencia, por riesgo: hasta que
#                                      se pulse, el informe vive en UN teléfono
#   Después  💾 Guardar              — la red de seguridad
#   Guardado ⋯ Más                   — lo de una vez por jornada
#
# «Finalizar» se retira: desde que dejó de existir la portada hacía lo mismo que
# «Siguiente apto.» pero SIN guardar antes — se probó y perdía lo escrito desde
# el último autoguardado. Y el contador que incrementaba ya no alimenta el
# número del informe desde el cambio 8.
ini_b = s.index('<div class="hdr-btns">')
fin_b = s.index('</div>', s.index('<!-- Botón «Reiniciar N°» retirado'))
s = sustituir(s, s[ini_b:fin_b],
 '<div class="hdr-btns">\n'
 '    <button class="hbtn hbtn-nuevo" onclick="siguienteApartamento()" title="Guarda este informe y prepara el del siguiente apartamento, conservando torre, empresa y personal">➡️ <span>Guardar y siguiente</span></button>\n'
 '    <button class="hbtn hbtn-save" onclick="saveDraft()" title="Guarda el informe en este teléfono. También se guarda solo cada 30 segundos">💾 <span>Guardar</span></button>\n'
 '    <button class="hbtn hbtn-send" onclick="openSend()" title="Manda los informes a Drive. Hasta que se envían, viven solo en este teléfono">📤 <span>Enviar</span><b id="cnt-pendientes" style="display:none;margin-left:5px"></b></button>\n'
 '    <button class="hbtn hbtn-mas" id="btn-mas" onclick="toggleMasAcciones()" title="Resto de las acciones">⋯ <span>Más</span></button>\n'
 '    <span id="estado-guardado" style="font-size:11px;font-weight:700;color:#bcc6e0;align-self:center;margin-left:4px"></span>\n'
 '    <span id="estado-conexion" style="font-size:11px;font-weight:700;align-self:center;margin-left:8px"></span>\n'
 '    <div class="hdr-sec" id="hdr-sec">\n'
 '      <button class="hbtn hbtn-saved-list" onclick="openSavedModal()" title="Los informes que hay en este teléfono, enviados y sin enviar">📁 <span>Mis informes</span><b id="cnt-guardados" style="display:none;margin-left:5px"></b></button>\n'
 '      <button class="hbtn hbtn-pdf" onclick="imprimirInforme()" title="Genera el PDF del informe que está en pantalla">🖨️ <span>PDF</span></button>\n'
 '      <button class="hbtn hbtn-nuevo2" onclick="nuevoFormulario()" title="Vacía el formulario entero, incluidas torre y empresa. Para empezar en otra torre">🆕 <span>Informe en blanco</span></button>\n'
 '      <button class="hbtn hbtn-test" id="btn-test" onclick="toggleTestMode()" title="Activar modo de prueba — los informes quedan marcados como PRUEBA">🧪 <span>Prueba</span></button>\n'
 '    </div>\n'
 '    <!-- «Finalizar» retirado: hacía lo mismo que «Guardar y siguiente» pero sin guardar. -->\n'
 '  ',
 "58a· los botones, ordenados por lo que se usa y cuándo")

# El estilo de «Finalizar» ya no tiene dueño; «Informe en blanco» toma el suyo,
# más apagado que el azul de la acción principal para que no compitan.
s = sustituir(s,
 ".hbtn-finalizar{background:#0d47a1;color:#fff;border-color:#5c8fd6}",
 ".hbtn-nuevo2{background:#e8eaf6;color:#1a237e;border-color:#c5cae9}",
 "58b· «Informe en blanco» no compite con la acción principal")

# En el teléfono, las dos acciones de más peso ocupan la fila entera.
s = sustituir(s,
 "  .hbtn{ flex:1 1 38%; justify-content:center; padding:8px 10px; font-size:12.5px; }",
 "  .hbtn{ flex:1 1 38%; justify-content:center; padding:8px 10px; font-size:12.5px; }\n"
 "  /* La acción que se usa ocho veces al día se lleva la fila entera; las\n"
 "     otras tres se reparten la siguiente. Dos filas, no cuatro. */\n"
 "  .hbtn-nuevo{ flex:1 1 100%; font-size:13.5px; }\n"
 "  .hbtn-save, .hbtn-send, .hbtn-mas{ flex:1 1 28%; }",
 "58c· las dos acciones principales, a fila completa")

# ── 59. «Simplificado» ya no distingue nada ──────────────────────────────
# Distinguía dos modos cuando compartían pantalla de inicio. Ahora cada uno
# tiene su enlace, y la palabra solo sugiere que el inspector usa una versión
# menor de algo.
s = sustituir(s, "'Informe de Inspección por Hitos (Simplificado)'",
                 "'Informe de Inspección por Hitos'",
              "59· fuera «(Simplificado)»")


# ── 60. El indicador de conexión tampoco se leía sobre el azul ───────────
# Verde #2e7d32 sobre la barra azul da 1,12 de contraste, y el naranja #e65100
# de «sin señal» tampoco pasa. Y «sin señal» es justo lo que el inspector
# necesita ver antes de tocar Enviar.
s = sustituir(s,
 "    el.textContent = '● en línea';\n"
 "    el.style.color = '#2e7d32';",
 "    el.textContent = '● en línea';\n"
 "    el.style.color = '#a5d6a7';",
 "60a· «en línea» legible sobre la barra")

s = sustituir(s,
 "    el.textContent = '● sin señal — el informe queda guardado aquí';\n"
 "    el.style.color = '#e65100';",
 "    el.textContent = '● sin señal — el informe queda guardado aquí';\n"
 "    el.style.color = '#ffcc80';",
 "60b· «sin señal» legible sobre la barra")

# ── 61. Los cinco avisos que quedaban por debajo del mínimo ──────────────
# Tras la pasada anterior el audit bajó de 67 fallos a 5, y los cinco son
# avisos: justo el texto que tiene que leerse. El ámbar #f57f17 sobre blanco da
# 2,65 y el naranja #e65100 sobre su propio fondo crema da 3,46.
s = sustituir(s,
 '<span style="font-size:10px;color:#f57f17;margin-top:2px;display:block">⚠️ Torre no registrada en el maestro</span>',
 '<span style="font-size:10px;color:#8f4b00;font-weight:700;margin-top:2px;display:block">⚠️ Torre no registrada en el maestro</span>',
 "61a· el aviso de torre no registrada se lee")

s = sustituir(s,
 '<option value="NO_REG" style="color:#e65100;font-weight:700">⚠️ No registrada — ingresar manualmente</option>',
 '<option value="NO_REG" style="color:#8f4b00;font-weight:700">⚠️ No registrada — ingresar manualmente</option>',
 "61b· la opción «no registrada» se lee")

s = sustituir(s, 'background:#fff3e0;color:#e65100;border:1px solid #ffcc80',
                 'background:#fff3e0;color:#8f4b00;border:1px solid #e6a860',
              "61c· el distintivo de modo se lee")

s = sustituir(s, "badge.style.background = '#fff3e0'; badge.style.color = '#e65100'; badge.style.borderColor = '#ffcc80';",
                 "badge.style.background = '#fff3e0'; badge.style.color = '#8f4b00'; badge.style.borderColor = '#e6a860';",
              "61d· y también cuando se repinta")

# Los dos indicadores de la barra: el verde y el ámbar claros que puse antes
# se quedaban en 3,5 y 4,27 sobre el extremo claro del degradado.
s = sustituir(s, "el.style.color = '#a5d6a7';", "el.style.color = '#e8f5e9';",
              "61e· «en línea», más claro")
s = sustituir(s, "el.style.color = '#ffcc80';", "el.style.color = '#ffe9c7';",
              "61f· «sin señal», más claro")
s = sustituir(s, "el.style.color = '#c8e6c9';", "el.style.color = '#e8f5e9';",
              "61g· «guardado», más claro")


# ── 62. La misma opción se dibuja dos veces, y solo una estaba corregida ─
# El desplegable de torres se reconstruye por JavaScript al elegir el convenio,
# y ahí la opción «No registrada» se creaba de nuevo con el naranja viejo. El
# audit lo cazó: el único fallo que quedaba en toda la pantalla.
s = sustituir(s,
 "  noReg.style.color = '#e65100';",
 "  noReg.style.color = '#8f4b00';",
 "62· el aviso también se lee cuando lo redibuja el JavaScript")

# ── 63. El PDF decía «ponderado», y no lo es ─────────────────────────────
# El informe que va al Ministerio rotulaba el número global como «Promedio
# ponderado de los hitos y subitems». No está ponderado por nada: los pesos son
# `PA-03` y todavía no existen, así que es un promedio simple de los hitos que
# se inspeccionaron. Llamarlo ponderado en un documento firmado le da una
# validez que no tiene — y es justo el número que ESTADO-ACTUAL advierte que no
# debe sostener nada financiero.
s = sustituir(s,
 '<div style="font-size:11px;opacity:.7;margin-top:3px">Promedio ponderado de los hitos y subitems</div>',
 '<div style="font-size:11px;opacity:.85;margin-top:3px">Promedio simple de los hitos inspeccionados · sin ponderar</div>',
 "63a· el promedio se llama por su nombre")

# El rótulo decía las dos cosas a la vez, en los dos ámbitos.
s = sustituir(s,
 '<h2>% AVANCE GENERAL DE LA TORRE / APARTAMENTO</h2>',
 '<h2 id="total-titulo">% AVANCE GENERAL</h2>',
 "63b· un rótulo, no dos")

# ── 64. El resumen mezclaba «no aplica» con «no se inspeccionó» ──────────
# En un informe de apartamento el resumen listaba también los hitos de torre, y
# al revés, todos con un «—». Pero ese mismo «—» marca un hito que SÍ tocaba y
# no se pudo ver. Dos cosas distintas con el mismo signo, en la página que lee
# la Dirección. Las filas fuera de ámbito se ocultan, igual que las tarjetas.
s = sustituir(s,
 '      <div class="res-row">\n'
 '        <div class="res-name">${p.nombre}</div>',
 '      <div class="res-row" id="res_${p.id}">\n'
 '        <div class="res-name">${p.nombre}</div>',
 "64a· cada fila del resumen se puede señalar")

s = sustituir(s,
 "    const bloque = document.getElementById('p_' + p.id);\n"
 "    if(!bloque) return;\n"
 "    const deTorre = HITOS_DE_TORRE.indexOf(p.id) >= 0;\n"
 "    bloque.style.display = (deTorre === esTorre) ? '' : 'none';",
 "    const deTorre = HITOS_DE_TORRE.indexOf(p.id) >= 0;\n"
 "    const propio = (deTorre === esTorre);\n"
 "    const bloque = document.getElementById('p_' + p.id);\n"
 "    if(bloque) bloque.style.display = propio ? '' : 'none';\n"
 "    // La fila del resumen va con su tarjeta: un hito de torre no tiene por\n"
 "    // qué aparecer con un guion en el informe de un apartamento.\n"
 "    const fila = document.getElementById('res_' + p.id);\n"
 "    if(fila) fila.style.display = propio ? '' : 'none';",
 "64b· el resumen solo muestra los hitos del ámbito")

s = sustituir(s,
 "  const nota = document.getElementById('ambito-nota');",
 "  const tt = document.getElementById('total-titulo');\n"
 "  if(tt) tt.textContent = esTorre ? '% AVANCE GENERAL DE LA TORRE' : '% AVANCE GENERAL DEL APARTAMENTO';\n"
 "\n"
 "  const nota = document.getElementById('ambito-nota');",
 "64c· el rótulo del total sigue al ámbito")

# ── 65. El papel imprimía los textos de ayuda y los mensajes de pantalla ──
# En los hitos sin observación salía impreso «Describa brevemente los subitems
# inspeccionados…» y «Observación sobre las fotografías de este hito…», que son
# el texto de ayuda del campo vacío. En el informe parecen contenido. Igual la
# tabla de memoria con «No hay apartamentos registrados para la torre T-45»,
# que es un mensaje de interfaz. Y «(máx. 6)» es una instrucción de captura:
# en el papel no aporta.
s = sustituir(s,
 "  .bar-bg{display:none}",
 "  /* El texto de ayuda de un campo vacío no es contenido del informe. */\n"
 "  ::placeholder{color:transparent!important}\n"
 "  ::-webkit-input-placeholder{color:transparent!important}\n"
 "  .tabla-vacia{display:none!important}\n"
 "  .solo-pantalla{display:none!important}\n"
 "  /* Un desplegable impreso con su flecha parece un formulario, no un informe. */\n"
 "  select{appearance:none!important;-webkit-appearance:none!important;background-image:none!important;\n"
 "         border:none!important;padding-left:0!important;font-weight:700!important;color:#000!important}\n"
 "  .bar-bg{display:none}",
 "65a· el papel no imprime ayudas ni mensajes de pantalla")

s = sustituir(s,
 '<td colspan="4" style="color:#5a6672;padding:10px">No hay apartamentos registrados para la torre ${torreActual}.</td>',
 '<td colspan="4" class="tabla-vacia" style="color:#5a6672;padding:10px">No hay apartamentos registrados para la torre ${torreActual}.</td>',
 "65b· el mensaje de tabla vacía es de pantalla")

s = sustituir(s, ' (máx. 6)</div>', '<span class="solo-pantalla"> (máx. 6)</span></div>',
              "65c· «máx. 6» es una instrucción de captura, no del informe", 2)

# ── 66. Los cuatro emojis que quedaban en los títulos ────────────────────
for viejo, nuevo, etiq in [
    ('<h3>🔌 Agentes de Contacto', '<h3>Agentes de Contacto', "66a· agentes"),
    ('<h3>🏗️ Memoria Técnica y Consolidado', '<h3>Memoria Técnica y Consolidado', "66b· memoria"),
    ('<h3>📝 Observaciones y Sugerencias', '<h3>Observaciones y Sugerencias', "66c· observaciones"),
    ('<h2>📊 Resumen por Hito</h2>', '<h2>Resumen por Hito</h2>', "66d· resumen"),
]:
    s = sustituir(s, viejo, nuevo, etiq)

# ── 67. El porcentaje salía RECORTADO en el PDF ─────────────────────────
# El hallazgo más serio de la revisión del PDF: 85 se imprimía «8», 100 «1»,
# 60 «6» y 40 «4». La regla de impresión `.num{width:40px!important}` estrangula
# el campo, mientras el `font-size:14px` que lleva en línea sobrevive — y a ese
# tamaño no caben dos dígitos en 40 px. El número del que trata toda la
# herramienta llegaba al Ministerio a medias.
s = sustituir(s,
 "  .num{border:none!important;background:transparent!important;font-size:9px;width:40px!important}",
 "  .num{border:none!important;background:transparent!important;font-size:9px;width:40px!important}\n"
 "  /* El porcentaje del hito lleva font-size en línea: con 40 px se recortaba. */\n"
 "  .hito-pct-input{width:70px!important;font-size:13px!important;\n"
 "                  border:1px solid #bbb!important;padding:2px 6px!important;text-align:center}",
 "67· el porcentaje cabe entero en el papel")


# ── 68. Marcar «N/A» no recalculaba el promedio del hito ─────────────────
# La leyenda del modo detallado promete que N/A «no cuenta para el promedio», y
# `recalcP` efectivamente lo excluye — pero `setEv` solo pintaba el botón y no
# volvía a calcular. El porcentaje se quedaba con la fila dentro hasta que el
# inspector tocara alguna cantidad. Medido: cuatro filas al 100, 20, 40 y 60
# dan 55 %; al marcar N/A la del 20 debería dar 67 % y seguía en 55 %.
# El promedio del hito viaja al informe, así que era un número mal.
s = sustituir(s,
 "function setEv(btn){\n"
 "  const rid=btn.dataset.rid;\n"
 "  const isAlreadyOn = btn.classList.contains('on');\n"
 "  document.querySelectorAll(`.ev-btn[data-rid=\"${rid}\"]`).forEach(b=>b.classList.remove('on'));\n"
 "  if (!isAlreadyOn) {\n"
 "    btn.classList.add('on');\n"
 "  }\n"
 "}",
 "function setEv(btn){\n"
 "  const rid=btn.dataset.rid;\n"
 "  const isAlreadyOn = btn.classList.contains('on');\n"
 "  document.querySelectorAll(`.ev-btn[data-rid=\"${rid}\"]`).forEach(b=>b.classList.remove('on'));\n"
 "  if (!isAlreadyOn) {\n"
 "    btn.classList.add('on');\n"
 "  }\n"
 "  // Un ítem marcado N/A sale del promedio del hito, y uno que deja de estarlo\n"
 "  // vuelve a entrar. Sin esto el porcentaje se quedaba con el valor viejo.\n"
 "  const pid = (document.getElementById('pr_' + rid) || {}).dataset\n"
 "            ? document.getElementById('pr_' + rid).dataset.p : null;\n"
 "  if(pid && typeof recalcP === 'function') recalcP(pid);\n"
 "  if(typeof _marcarCambio === 'function') _marcarCambio();\n"
 "}",
 "68· marcar la evaluación recalcula el promedio")


# ── 69. Lo escrito en un campo podía romper la lista de informes ─────────
# «Mis informes» pintaba con innerHTML el número, la torre y el apartamento tal
# como se guardaron. Un apartamento escrito con un «<» —o cualquier cosa que se
# parezca a una etiqueta— se interpreta como HTML: la ficha se dibuja mal o
# desaparece de la lista. Y esa lista es el único sitio desde donde se recupera
# o se envía un informe que todavía vive SOLO en ese teléfono.
# Probado con `<img src=x onerror=…>` en la torre: se ejecutaba.
s = sustituir(s,
 "function renderSavedList() {",
 "// Lo que se guardó es texto, no HTML. Se escapa antes de pintarlo.\n"
 "function _txt(v){\n"
 "  return String(v == null ? '' : v)\n"
 "    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')\n"
 "    .replace(/\"/g,'&quot;').replace(/'/g,'&#39;');\n"
 "}\n"
 "\n"
 "function renderSavedList() {",
 "69a· una función para escapar lo guardado")

s = sustituir(s,
 "<span class=\"saved-item-title\">${item.nro || 'Sin Correlativo'} (${item.formType === 'hitos' ? 'Hitos' : 'Detallado'})</span>\n"
 "        <span class=\"saved-item-sub\">📍 Torre: ${item.torre || '—'} | Apto: ${item.apto || '—'}</span>\n"
 "        <span class=\"saved-item-sub\">📅 Guardado: ${item.timestamp}</span>\n"
 "        <span class=\"saved-item-sub\" style=\"color:${item.enviado ? '#2e7d32' : '#e65100'};font-weight:700\">${item.enviado ? '✅ Enviado ' + item.enviado : '⏳ Sin enviar'}</span>",
 "<span class=\"saved-item-title\">${_txt(item.nro || 'Sin Correlativo')} (${item.formType === 'hitos' ? 'Hitos' : 'Detallado'})</span>\n"
 "        <span class=\"saved-item-sub\">📍 Torre: ${_txt(item.torre || '—')} | Apto: ${_txt(item.apto || '—')}</span>\n"
 "        <span class=\"saved-item-sub\">📅 Guardado: ${_txt(item.timestamp)}</span>\n"
 "        <span class=\"saved-item-sub\" style=\"color:${item.enviado ? '#1b5e20' : '#8f4b00'};font-weight:700\">${item.enviado ? '✅ Enviado ' + _txt(item.enviado) : '⏳ Sin enviar'}</span>",
 "69b· la lista de informes muestra texto, no HTML")

# La tabla de memoria pinta la torre y el apartamento por el mismo camino.
s = sustituir(s,
 "No hay apartamentos registrados para la torre ${torreActual}.",
 "No hay apartamentos registrados para la torre ${_txt(torreActual)}.",
 "69c· lo mismo en la tabla de memoria")

# ── 70. La coma decimal vaciaba el porcentaje sin decir nada ─────────────
# En Venezuela se escribe «99,7». El campo es `type=number` y con coma queda
# inválido: `.value` devuelve vacío, el hito pasa a «—» y sale del promedio,
# sin ningún aviso. El inspector cree que puso 99,7. Se acepta la coma y se
# trata como el separador decimal que es.
s = sustituir(s,
 "  const inp = document.getElementById('hitopct_' + pid);\n"
 "\n"
 "  // Campo vac\u00edo es",
 "  const inp = document.getElementById('hitopct_' + pid);\n"
 "\n"
 "  // El teclado del tel\u00e9fono ofrece coma decimal. Con \u00ab99,7\u00bb el campo queda\n"
 "  // inv\u00e1lido y `value` devuelve vac\u00edo: el hito se iba a \u00ab\u2014\u00bb y sal\u00eda del promedio\n"
 "  // sin avisar, mientras el inspector cre\u00eda haber puesto 99,7.\n"
 "  if((inp.value || '') === '' && inp.dataset.crudo){\n"
 "    const conPunto = String(inp.dataset.crudo).replace(',', '.');\n"
 "    if(/^\\d*\\.?\\d+$/.test(conPunto)) inp.value = conPunto;\n"
 "  }\n"
 "\n"
 "  // Campo vac\u00edo es",
 "70a\u00b7 aceptar la coma decimal en el porcentaje")

s = sustituir(s,
 'oninput="recalcHito(\'${p.id}\')"',
 'oninput="this.dataset.crudo=this.value;recalcHito(\'${p.id}\')" onkeydown="if(event.key===\',\'){event.preventDefault();this.value=this.value+\'.\';}"',
 "70b· la coma se escribe como punto directamente")


# ── 71. Con dos pestañas abiertas se perdía un informe entero ────────────
# El teléfono guarda los informes en una lista y la app recordaba en qué
# POSICIÓN estaba el que se edita. Si otra pestaña inserta uno, las posiciones
# corren y esa posición pasa a señalar el informe de la otra.
#
# Reproducido: pestaña A guarda el apto 101 → [101]. Pestaña B guarda el 202 →
# [202, 101]. A vuelve a guardar y escribe en la posición 0 → [101, 101].
# El informe del 202 desaparece, sin ningún aviso, y era la única copia.
#
# No hace falta buscar el caso raro: el inspector abre el enlace de WhatsApp y
# además tiene el ícono en la pantalla de inicio, o deja una pestaña vieja.
#
# Cada borrador ya trae un `id` estable. Se sigue el id, no el sitio.
s = sustituir(s,
 "function _idDelBorradorEnEdicion(){\n"
 "  if(currentEditingIndex === null) return 'draft_' + Date.now();\n"
 "  const b = getSavedReports()[currentEditingIndex];\n"
 "  if(b && b.id) return b.id;\n"
 "  currentEditingIndex = null;\n"
 "  return 'draft_' + Date.now();\n"
 "}",
 "// A qué informe pertenece lo que hay en pantalla. Es el id del borrador, no\n"
 "// su posición en la lista: la posición cambia si otra pestaña guarda algo.\n"
 "let _idEnEdicion = null;\n"
 "\n"
 "function _idDelBorradorEnEdicion(){\n"
 "  if(_idEnEdicion) return _idEnEdicion;\n"
 "  if(currentEditingIndex === null) return 'draft_' + Date.now();\n"
 "  const b = getSavedReports()[currentEditingIndex];\n"
 "  if(b && b.id) return b.id;\n"
 "  currentEditingIndex = null;\n"
 "  return 'draft_' + Date.now();\n"
 "}",
 "71a· el informe en edición se identifica por su id")

s = sustituir(s,
 "    const data = getFormData();\n"
 "    const list = getSavedReports();\n"
 "    if(currentEditingIndex !== null && list[currentEditingIndex]) {\n"
 "      if(list[currentEditingIndex].enviado && !data.enviado){\n"
 "        data.enviado = list[currentEditingIndex].enviado;\n"
 "      }\n"
 "      list[currentEditingIndex] = data;\n"
 "      if(!silencioso) showToast('✅ Borrador modificado y actualizado con éxito', 'ok');\n"
 "    } else {\n"
 "      list.unshift(data);\n"
 "      currentEditingIndex = 0;\n"
 "      if(!silencioso) showToast('✅ Nuevo borrador guardado localmente','ok');\n"
 "    }",
 "    const data = getFormData();\n"
 "    const list = getSavedReports();\n"
 "    // Se busca por id porque la lista pudo moverse desde otra pestaña.\n"
 "    let pos = -1;\n"
 "    if(data.id){ pos = list.findIndex(function(b){ return b && b.id === data.id; }); }\n"
 "    if(pos >= 0) {\n"
 "      if(list[pos].enviado && !data.enviado){\n"
 "        data.enviado = list[pos].enviado;\n"
 "      }\n"
 "      list[pos] = data;\n"
 "      currentEditingIndex = pos;\n"
 "      if(!silencioso) showToast('✅ Borrador modificado y actualizado con éxito', 'ok');\n"
 "    } else {\n"
 "      list.unshift(data);\n"
 "      currentEditingIndex = 0;\n"
 "      if(!silencioso) showToast('✅ Nuevo borrador guardado localmente','ok');\n"
 "    }\n"
 "    _idEnEdicion = data.id || null;",
 "71b· guardar escribe sobre el informe correcto, no sobre la posición")

# Al cargar un borrador, ese pasa a ser el informe en edición.
s = sustituir(s,
 "  currentEditingIndex = index;",
 "  currentEditingIndex = index;\n"
 "  _idEnEdicion = d.id || null;",
 "71c· cargar un borrador fija cuál se está editando")

# Y los tres sitios que cierran un informe tienen que soltar el id.
s = sustituir(s,
 "  currentEditingIndex = null;        // el siguiente no lo pisa\n"
 "  _numeroDelBorrador = null;",
 "  currentEditingIndex = null;        // el siguiente no lo pisa\n"
 "  _idEnEdicion = null;\n"
 "  _numeroDelBorrador = null;",
 "71d· «Guardar y siguiente» suelta el informe cerrado")

s = sustituir(s,
 "    currentEditingIndex = null;          // el siguiente guardado crea ficha nueva",
 "    currentEditingIndex = null;          // el siguiente guardado crea ficha nueva\n"
 "    _idEnEdicion = null;",
 "71e· al cambiar de apartamento se suelta el anterior")

s = sustituir(s,
 "  if(!confirm('¿Desea iniciar un nuevo informe? Se limpiarán los campos actuales.')) return;\n"
 "  currentEditingIndex = null;",
 "  if(!confirm('¿Desea iniciar un nuevo informe? Se limpiarán los campos actuales.')) return;\n"
 "  currentEditingIndex = null;\n"
 "  _idEnEdicion = null;",
 "71f· «Informe en blanco» suelta el informe anterior")

s = sustituir(s,
 "  if(currentEditingIndex === index) currentEditingIndex = null;\n"
 "  else if(currentEditingIndex > index) currentEditingIndex--;",
 "  if(currentEditingIndex === index){ currentEditingIndex = null; _idEnEdicion = null; }\n"
 "  else if(currentEditingIndex > index) currentEditingIndex--;",
 "71g· borrar el que se edita suelta también su id")


# ── 72. Al girar el teléfono se caían todos los arreglos ────────────────
# Los bloques móviles se activaban por ANCHO (700 px). Un iPhone en horizontal
# mide 812 o más, así que en horizontal volvía todo lo corregido: la cabecera
# con sus siete botones ocupando el 39 % de una pantalla de 375 px de alto,
# veinte objetivos táctiles por debajo de 44 px y treinta y nueve campos por
# debajo de 16 px — o sea el zoom automático de Safari otra vez.
#
# Se separan los dos criterios, que no son el mismo:
#   · la ergonomía del dedo depende del PUNTERO, no del tamaño de la pantalla
#   · el apilado de la cabecera depende del ESPACIO, ancho o alto
s = sustituir(s,
 "@media (max-width: 700px){\n"
 "  /* Safari hace zoom solo al enfocar un campo de menos de 16px, y después hay\n"
 "     que despincharlo a mano. A 16px la pantalla deja de saltar. */\n"
 "  input:not([type=file]), select, textarea{ font-size:16px !important; }",
 "/* Se toca con el dedo: da igual la orientación y da igual el tamaño. */\n"
 "@media (max-width: 700px), (max-height: 520px), (pointer: coarse){\n"
 "  /* Safari hace zoom solo al enfocar un campo de menos de 16px, y después hay\n"
 "     que despincharlo a mano. A 16px la pantalla deja de saltar. */\n"
 "  input:not([type=file]), select, textarea{ font-size:16px !important; }",
 "72a· la ergonomía táctil no depende de la orientación")

s = sustituir(s,
 "@media (max-width: 700px){\n"
 "  .no-insp-tgl, .arrow{\n"
 "    min-width:44px; min-height:44px;",
 "@media (max-width: 700px), (max-height: 520px), (pointer: coarse){\n"
 "  .no-insp-tgl, .arrow{\n"
 "    min-width:44px; min-height:44px;",
 "72b· lo mismo para los controles del hito y del modal")

# La cabecera se apila también cuando falta ALTO, que es lo que pasa en horizontal.
s = sustituir(s, "@media(max-width:700px){.hdr-btns .hbtn-mas{display:flex}}",
                 "@media(max-width:700px),(max-height:520px){.hdr-btns .hbtn-mas{display:flex}}",
              "72c· «Más» aparece también con el teléfono acostado")


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
