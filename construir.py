#!/usr/bin/env python3
"""Construye index.html a partir del formulario original de Skarlet Gómez.

Entrada:  fuente/Formulario Garmel.V8262026.html  (no se modifica)
Salida:   index.html

Cada cambio está numerado y explicado. Si el original cambia y una sustitución
deja de encontrar su ancla, el script falla en vez de producir un archivo a medias.
"""
import base64, os, re, sys

RAIZ = os.path.dirname(os.path.abspath(__file__))
ORIG = os.path.join(RAIZ, "fuente", "Formulario Garmel.V8262026.html")
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

# ── 2. Logos reales en la pantalla de inicio ────────────────────────────────
ini_w = s.index('<div class="welcome-logos">')
fin_w = s.index('<h1 class="welcome-title">')
s = sustituir(s, s[ini_w:fin_w],
 '<div class="welcome-logos">\n'
 '      <div style="background:#fff;border-radius:12px;padding:12px 16px;display:flex;'
 'align-items:center;gap:16px">\n'
 '        <img src="' + LOGO_GARMEL + '" alt="Constructora Garmel, C.A." style="height:52px;width:auto">\n'
 '        <div style="width:1px;height:44px;background:#ddd"></div>\n'
 '        <img src="' + LOGO_GMVV + '" alt="Gran Misión Vivienda Venezuela" style="height:52px;width:auto">\n'
 '      </div>\n'
 '    </div>\n\n    ',
 "2· logos reales en la pantalla de inicio")

# ── 3. Logos reales en el encabezado del informe ────────────────────────────
# Eran una «C» y una «G» dibujadas a mano, y un emblema oficial aproximado
# con tres polígonos de colores. Van al PDF, así que son la cara del informe.
ini_l = s.index('<div style="display:flex;align-items:center;gap:18px">\n    <div style="text-align:center">')
fin_l = s.index('<div>\n      <h2 style="font-size:16px;font-weight:900;color:var(--blue)">INFORME DE INSPECCIÓN TÉCNICA</h2>')
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
  };
  PARTIDAS.forEach(p=>{
    d.partidas[p.id]=p.items.map((_,i)=>{""",
"""    partidas:{}, extraRows: extraRows,
    fotos:{}, fotobs:{}
  };
  PARTIDAS.forEach(p=>{
    d.fotobs[p.id] = document.getElementById('fotobs_'+p.id)?.value || '';
    d.fotos[p.id]  = [0,1,2].map(fi=>{
      const im = document.getElementById(`fimg_${p.id}_${fi}`);
      return (im && im.src && im.src.indexOf('data:') === 0) ? im.src : '';
    });
    d.partidas[p.id]=p.items.map((_,i)=>{""",
 "5· guardar fotos y observaciones en el borrador")

# ── 6. …y vuelven al abrir el borrador ──────────────────────────────────────
s = sustituir(s,
"""  updateDocInfo();
  closeSavedModal();
  showToast('📂 Borrador cargado. Puede modificarlo y hacer clic en Guardar Borrador.', 'ok');""",
"""  PARTIDAS.forEach(p=>{
    if(d.fotobs && d.fotobs[p.id] !== undefined){
      const t = document.getElementById('fotobs_'+p.id);
      if(t) t.value = d.fotobs[p.id];
    }
    if(d.fotos && d.fotos[p.id]){
      d.fotos[p.id].forEach((src,fi)=>{ if(src) _pintarFoto(p.id, fi, src); });
    }
  });

  updateDocInfo();
  closeSavedModal();
  showToast('📂 Borrador cargado. Puede modificarlo y hacer clic en Guardar Borrador.', 'ok');""",
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

# ── 14. El botón «Enviar» no fallaba en silencio, ahora dice qué hacer ──────
# En esta versión `sendToMonday()` no existe: el botón llamaba a una función
# ausente y no pasaba nada. Mientras el envío automático no esté montado, dice
# en voz alta cuál es el paso que sí funciona.
s = sustituir(s,
 """      <button class="m-btn m-confirm" id="btn-enviar-monday" onclick="sendToMonday()">📤 Enviar ahora</button>""",
 """      <button class="m-btn m-confirm" id="btn-enviar-monday" onclick="avisoEnvioManual()">📤 Enviar ahora</button>""",
 "14a· el botón de enviar deja de llamar a una función inexistente")

s = sustituir(s,
 """function openSend(){document.getElementById('overlay').classList.add('open');const t=localStorage.getItem('monday_token');if(t)document.getElementById('mondayToken').value=t;}""",
 """function openSend(){
  document.getElementById('overlay').classList.add('open');
}

// El envío automático todavía no está montado. Hasta que lo esté, el circuito
// es: generar el PDF y subirlo a la carpeta de Drive de la torre.
function avisoEnvioManual(){
  closeSend();
  alert('El envío automático todavía no está disponible.\\n\\n' +
        'Por ahora:\\n' +
        '1. Toque el botón 🖨️ PDF\\n' +
        '2. Elija «Guardar como PDF»\\n' +
        '3. Suba ese archivo a la carpeta de Drive de la torre\\n\\n' +
        'El borrador queda guardado en este teléfono.');
}""",
 "14b· instrucción clara en lugar de un botón mudo")

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
  .foto-grid{display:flex!important;gap:6px!important;flex-wrap:nowrap!important;align-items:flex-start}
  .foto-slot{width:33%!important;height:auto!important;aspect-ratio:4/3;border:1px solid #ccc!important;border-radius:4px!important;flex:1 1 33%!important;page-break-inside:avoid}
  .foto-slot img{position:absolute!important;inset:0;width:100%!important;height:100%!important;object-fit:cover;print-color-adjust:exact;-webkit-print-color-adjust:exact}
  .foto-slot span{display:none}
  .foto-slot.sin-foto{display:none!important}
  .foto-obs{margin-top:6px}
  .foto-obs textarea{border:none!important;border-top:1px solid #eee!important;border-radius:0!important;padding:4px 0 0!important;font-size:9px!important;min-height:0!important;resize:none!important;overflow:hidden!important}""",
 "15a· fotografías legibles en el PDF")

# Marcar los recuadros vacíos justo antes de imprimir, y ajustar la altura de
# las observaciones para que no salgan cortadas en el PDF.
s = sustituir(s,
 """// ═══════════════════════════════════════════════
// MONDAY INTEGRATION & PDF GENERATION""",
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

// ═══════════════════════════════════════════════
// MONDAY INTEGRATION & PDF GENERATION""",
 "15b· preparar fotos y observaciones antes de imprimir")

# ── 13. Registrar el service worker, que es lo que hace que abra sin señal ──
s = sustituir(s,
"""function showPdfOverlay(show) {
  var ov = document.getElementById('pdf-overlay');
  if (ov) ov.style.display = show ? 'flex' : 'none';
}""",
"""function showPdfOverlay(show) {
  var ov = document.getElementById('pdf-overlay');
  if (ov) ov.style.display = show ? 'flex' : 'none';
}

// ═══════════════════════════════════════════════
// FUNCIONAMIENTO SIN SEÑAL
// El navegador se guarda una copia la primera vez que se abre con internet.
// A partir de ahí abre sin señal, indefinidamente, y se actualiza solo cuando
// vuelve a haber conexión.
// ═══════════════════════════════════════════════
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function(){
    navigator.serviceWorker.register('sw.js').catch(function(){ /* sin copia local */ });
  });
}""",
 "13· registrar el service worker")

open(SALIDA, "w", encoding="utf-8").write(s)

print("✓ index.html construido — %d KB" % (os.path.getsize(SALIDA) // 1024))
for i, c in enumerate(cambios, 1):
    print("   %s" % c)
