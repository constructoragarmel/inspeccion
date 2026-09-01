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

# ── Los once hitos del desglose de agosto: transcritos y DESACTIVADOS ──────
# Skarlet Gómez los aporta el 28-ago-2026 y están construidos (cambio 86),
# pero chocan con ADR-0017, que aprobó la Ing. Beatriz Sevilla, y con el
# ámbito del formulario. Ver C-28 en fuentes/contradicciones.md.
# Se activan poniendo esto en True, cuando Ingeniería lo valide.
ONCE_HITOS = True

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
LOGO_MINHVI = b64("minhvi.png", "image/png")   # ver cambio 3

# Los once hitos del Excel de agosto (ver cambio 86).
#
# ÚNICA DESVIACIÓN del Excel, y está aprobada: el hito 6 traía una sola
# subpartida, «Instalación de ventanas y vidrios», y desde el 31-ago-2026 son
# DOS —ventanas y vidrios se instalan y se cuentan por separado en obra—. Lo
# pidió Skarlet Gómez y lo aprobó la Ing. Beatriz Sevilla (ADR-0025). El
# desglose pasa de 50 subpartidas a 51.
PARTIDAS_ONCE = """const PARTIDAS = [
  {
    "id": "hito_estructura", 
    "nombre": "HITO 1: ESTRUCTURA", 
    "icon": "", 
    "color": "#1a237e", 
    "items": ["Encofrado", "Acero de refuerzo", "Vaciados"]
  }, 
  {
    "id": "hito_cerramientos", 
    "nombre": "HITO 2: CERRAMIENTOS Y ALBAÑILERÍA", 
    "icon": "", 
    "color": "#283593", 
    "items": ["Construcción de paredes exteriores", "Tabiquería interior", "Impermeabilización de azotea"]
  }, 
  {
    "id": "hito_servicios", 
    "nombre": "HITO 3: INSTALACIÓN DE SERVICIOS", 
    "icon": "", 
    "color": "#303f9f", 
    "items": ["Sanitarias y pluviales — Aguas blancas", "Sanitarias y pluviales — Desagüe", "Sanitarias y pluviales — Bajante de aguas de lluvias", "Eléctricas y datos — Cableados", "Eléctricas y datos — Tableros principales", "Eléctricas y datos — Canalizaciones", "Eléctricas y datos — Equipamiento de cuarto de módulos", "Gas — Montante", "Gas — Manifold"]
  }, 
  {
    "id": "hito_acabados", 
    "nombre": "HITO 4: ACABADOS", 
    "icon": "", 
    "color": "#3949ab", 
    "items": ["Frisos", "Encamisados", "Cerámica en paredes", "Cerámica en pisos", "Construcción de sobrepisos", "Pintura en paredes", "Texturizado de techos"]
  }, 
  {
    "id": "hito_puertas", 
    "nombre": "HITO 5: PUERTAS", 
    "icon": "", 
    "color": "#1565c0", 
    "items": ["Puertas metálicas", "Puertas de servicios", "Puertas de madera"]
  }, 
  {
    "id": "hito_ventanas", 
    "nombre": "HITO 6: VENTANAS", 
    "icon": "", 
    "color": "#0277bd", 
    "items": ["Instalación de ventanas", "Instalación de vidrios"]
  }, 
  {
    "id": "hito_acc_sanitarios", 
    "nombre": "HITO 7: ACCESORIOS SANITARIOS", 
    "icon": "", 
    "color": "#01579b", 
    "items": ["Ducha", "Fregadero de acero inoxidable", "W.C.", "Lavamanos", "Batea", "C.P.", "T.R."]
  }, 
  {
    "id": "hito_acc_electricos", 
    "nombre": "HITO 8: ACCESORIOS ELÉCTRICOS", 
    "icon": "", 
    "color": "#0d47a1", 
    "items": ["Tomacorrientes", "Interruptores", "Toma de data", "Breakers"]
  }, 
  {
    "id": "hito_ascensor", 
    "nombre": "HITO 9: ASCENSOR", 
    "icon": "", 
    "color": "#26418f", 
    "items": ["Adecuación y verificación de plomada en foso y cuarto de máquina", "Instalación de guías, rieles y soporte estructural en la caja", "Montaje de cabina, motor y contrapeso", "Instalación de puertas de piso, botoneras y sistema electrónico de control"]
  }, 
  {
    "id": "hito_exteriores", 
    "nombre": "HITO 10: ACABADOS EXTERIORES Y ÁREAS COMUNES", 
    "icon": "", 
    "color": "#1e3a8a", 
    "items": ["Revestimiento y pintura de fachada exterior", "Adecuación de accesos y pasillos", "Instalación de iluminación en común", "Instalación de barandas", "Instalación de pasamanos escaleras"]
  }, 
  {
    "id": "hito_pruebas", 
    "nombre": "HITO 11: PRUEBAS", 
    "icon": "", 
    "color": "#172554", 
    "items": ["Presión de agua", "Hermeticidad", "Carga eléctrica", "Pruebas de cargas, velocidad y certificación de seguridad de ascensores"]
  }
]"""

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
#
# El emblema oficial es el del **Ministerio del Poder Popular para Hábitat y
# Vivienda**, no el de la Gran Misión Vivienda Venezuela: cambiado el
# 31-ago-2026 a pedido de Francisco José García Guinand.
#
# El archivo sale de un **documento oficial del propio ministerio** —la
# *Declaración Jurada de Compromiso de Responsabilidad Social*, que Garmel
# aportó el 31-ago-2026—, extraído del `.docx`. Esa procedencia importa: es el
# emblema tal como el ministerio lo usa en un papel que se firma, y no una
# reconstrucción nuestra.
#
# Resuelve además la discordancia del texto. La versión tomada antes de la
# biblioteca del sitio —minhvi.gob.ve— decía «para **la** Hábitat y Vivienda»,
# y el glosario registra la forma oficial **sin** «la». La del documento no
# lleva «la»: las dos fuentes ya coinciden, sin que hiciera falta editarle el
# emblema a un ministerio.
#
# Va **a todo color** —la bandera en amarillo, azul y rojo—, no en azul
# monocromo. El fondo blanco del JPEG se hizo transparente por inundación desde
# los bordes, que es lo único que respeta el blanco de adentro: las estrellas y
# la franja de la bandera. Es apaisado —4 a 1—, así que va a 40 px de alto,
# donde mide 160 px de ancho.
#
# Va con PALETA de 256 colores, no en color verdadero: 23 KB en vez de 113 KB,
# a igual resolución. Esto no es pulcritud, es alcance — el formulario entero se
# descarga dentro de una torre con mala señal, y el color verdadero le sumaba
# 88 KB al archivo. El bandeado que eso introduce en los degradados de la
# bandera solo se ve ampliando al triple; a los 40 px a los que se usa, y en el
# papel, no aparece.
#
# El de Garmel va igual, por el mismo motivo: 37 KB a 9 KB, sin diferencia
# visible ni siquiera al doble de su tamaño de uso. Es un monograma negro, así
# que la paleta no tiene degradados que estropear.
ini_l = s.index('<div style="display:flex;align-items:center;gap:18px">\n    <div style="text-align:center">')
fin_l = s.index('<div>\n      <h2 id="logo-title"')
s = sustituir(s, s[ini_l:fin_l],
 '<div style="display:flex;align-items:center;gap:18px">\n'
 '    <img src="' + LOGO_GARMEL + '" alt="Constructora Garmel, C.A." '
 'style="height:56px;width:auto;flex-shrink:0">\n'
 '    <div class="logo-sep-minhvi" style="width:1px;height:50px;background:#e0e0e0"></div>\n'
 '    <img class="logo-minhvi" src="' + LOGO_MINHVI + '" '
 'alt="Ministerio del Poder Popular para Hábitat y Vivienda" '
 'style="height:40px;width:auto;flex-shrink:0">\n'
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

# 21i · La cámara SIN cerrar la puerta a la galería.
#
# Estuvo un tiempo con `capture="environment"`, que fuerza la cámara y nada
# más. Resolvía el problema de origen —abría la galería por defecto, cuando lo
# normal es fotografiar en el sitio— pero creaba otro: **no dejaba adjuntar**
# una foto ya tomada, que es justo lo que hace falta cuando se llena el informe
# al salir de la torre o desde una computadora. Pedido en campo el 31-ago-2026.
#
# Sin el atributo, el teléfono ofrece las tres: cámara, galería y archivos. Es
# una opción más de toque, no una menos.
# Por eso aquí no se toca nada: el original ya está bien. Este comentario existe
# para que nadie vuelva a "arreglarlo" añadiendo el atributo.

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

# ── 73. El informe impreso deja de ser una foto de la pantalla ───────────
# En pantalla el instrumento es una herramienta de campo y tiene que seguir
# siéndolo: objetivos de 44 px, letra de 16, colores que se distinguen con
# guantes y un contador que persigue al inspector. Nada de eso sirve en papel.
#
# El informe es un documento oficial: lo firma un ingeniero, lo lee la Alta
# Dirección y termina en el expediente de rendición, que se entrega en tres
# ejemplares físicos (`PA-76`). Ahí el recuadro de cada campo, el bloque de
# color de cada hito y la tarjeta con sombra no son información: son ruido que
# gasta papel. Un informe de un apartamento ocupaba SEIS páginas, y la mitad
# era relleno.
#
# Este bloque se aplica solo al imprimir. La pantalla no cambia en nada.
s = sustituir(s,
 "  @page{margin:12mm 10mm;size:A4 portrait}\n"
 "}",
 "  /* ══ El informe como documento ══════════════════════════════════════\n"
 "     Todo lo anterior corrige la pantalla para el papel. Lo que sigue le da\n"
 "     forma de documento: sin cajas, sin rellenos de color, sin repeticiones. */\n"
 "\n"
 "  /* La barra azul de la aplicación no es parte del informe: el membrete con\n"
 "     los logos, el título y el número ya está justo debajo. */\n"
 "  .hdr{display:none!important}\n"
 "\n"
 "  body{font-size:10.5px;color:#111}\n"
 "  .logo-bar{padding:0 0 8px!important;margin-bottom:10px;border-bottom:2px solid #1a237e!important}\n"
 "  .meta-card{padding:0!important;border:none!important;margin-bottom:10px}\n"
 "  .content{padding:0!important}\n"
 "\n"
 "  /* Rótulos de sección: una línea de texto con su regla, no una banda. */\n"
 "  .sec-div{background:none!important;color:#1a237e!important;border:none!important;\n"
 "           border-bottom:1px solid #1a237e!important;padding:8px 0 3px!important;\n"
 "           letter-spacing:.6px;font-size:9.5px!important;margin:10px 0 6px}\n"
 "  .sec-lbl{color:#1a237e!important;margin-bottom:5px!important;font-size:9px!important}\n"
 "\n"
 "  /* Los campos rellenados: etiqueta pequeña arriba, valor en negro debajo,\n"
 "     con una guía discreta. Un recuadro de formulario no aporta nada. */\n"
 "  .field label{color:#5a6672!important;font-size:8px!important;letter-spacing:.3px}\n"
 "  .field input, .field select, .meta-card input, .meta-card select{\n"
 "    border:none!important;border-bottom:1px dotted #b9c0cc!important;border-radius:0!important;\n"
 "    background:none!important;padding:1px 0!important;font-size:11px!important;\n"
 "    font-weight:700!important;color:#111!important;height:auto!important;min-height:0!important;\n"
 "  }\n"
 "\n"
 "  /* Cada hito, una sección del documento. */\n"
 "  .partida{border:none!important;border-radius:0!important;box-shadow:none!important;\n"
 "           margin:0 0 9px!important;padding:0!important;break-inside:auto;page-break-inside:auto}\n"
 "  .p-hdr{background:none!important;color:#111!important;padding:0 0 2px!important;\n"
 "         margin-bottom:5px;border-bottom:1px solid #98a2b3!important;\n"
 "         print-color-adjust:economy;-webkit-print-color-adjust:economy}\n"
 "  .p-hdr h2{color:#1a237e!important;font-size:10.5px!important;letter-spacing:.2px}\n"
 "  .p-body{padding:0!important}\n"
 "  /* El porcentaje ya está junto al título del hito: el campo lo repetía. */\n"
 "  .campo-pct{display:none!important}\n"
 "  /* Y el pie del hito lo repetía por tercera vez. */\n"
 "  .p-foot{display:none!important}\n"
 "  .pct-bdg{background:none!important;box-shadow:none!important;padding:0!important;\n"
 "           min-width:0!important;font-size:11px!important;font-weight:900!important}\n"
 "  .partida.no-inspeccionada .p-body{opacity:1!important}\n"
 "\n"
 "  /* Las observaciones son prosa del informe, no el contenido de una casilla. */\n"
 "  textarea{border:none!important;background:none!important;border-radius:0!important;\n"
 "           padding:0!important;margin:0!important;resize:none!important;overflow:hidden!important;\n"
 "           font-family:Georgia,'Times New Roman',serif!important;font-size:10.5px!important;\n"
 "           line-height:1.45!important;color:#111!important;min-height:0!important}\n"
 "  #obs_general, #obs_sp{font-size:11px!important}\n"
 "\n"
 "  /* Fotografías: una fila de imágenes bajo su rótulo, sin marco ni fondo. */\n"
 "  .foto-sec{background:none!important;border:none!important;margin:5px 0 0!important;\n"
 "            padding:0!important;break-inside:avoid;page-break-inside:avoid}\n"
 "  .foto-sec-title{color:#5a6672!important;font-size:8px!important;margin-bottom:3px!important;\n"
 "                  text-transform:uppercase;letter-spacing:.3px}\n"
 "  .foto-obs textarea{font-style:italic;font-size:9.5px!important}\n"
 "  .foto-obs{margin-top:3px!important;border-top:none!important}\n"
 "  .foto-obs textarea{border-top:none!important;padding-top:0!important}\n"
 "\n"
 "  /* Bloques finales: tarjetas fuera, contenido dentro. */\n"
 "  .sp-card, .resumen, .obs-card{background:none!important;box-shadow:none!important;\n"
 "    border:none!important;border-radius:0!important;padding:0!important;margin:0 0 9px!important}\n"
 "  .sp-card h3, .resumen h2, .obs-card h3{color:#1a237e!important;font-size:9.5px!important;\n"
 "    text-transform:uppercase;letter-spacing:.6px;border-bottom:1px solid #1a237e!important;\n"
 "    padding-bottom:3px;margin-bottom:6px!important}\n"
 "  .res-row{margin-bottom:2px!important;padding:1px 0;border-bottom:1px dotted #dde1e8}\n"
 "  .res-name{font-size:10px!important}\n"
 "  .res-pct{font-size:11px!important}\n"
 "\n"
 "  /* El total: la cifra que se busca al abrir el informe. Se destaca con\n"
 "     tipografía y reglas, no con un bloque de color de media página. */\n"
 "  .total-card{background:none!important;color:#111!important;box-shadow:none!important;\n"
 "    border:none!important;border-top:2px solid #1a237e!important;\n"
 "    border-bottom:2px solid #1a237e!important;border-radius:0!important;\n"
 "    padding:7px 0!important;margin:0 0 9px!important;\n"
 "    display:flex;align-items:baseline;justify-content:center;gap:12px;text-align:left}\n"
 "  .total-card h2{color:#1a237e!important;font-size:10px!important;letter-spacing:.6px;margin:0}\n"
 "  .total-num{font-size:26px!important;letter-spacing:-.5px;color:#111!important}\n"
 "  .total-card>div:last-child{display:none!important}   /* la barra de progreso */\n"
 "  .total-card>div[style*='opacity']{font-size:8.5px!important;opacity:1!important;color:#5a6672!important}\n"
 "\n"
 "  @page{margin:11mm 11mm;size:A4 portrait}\n"
 "}",
 "73· el informe impreso es un documento, no una captura de pantalla")

# El campo del porcentaje necesita poder señalarse para no repetirlo en papel.
s = sustituir(s,
 '<div class="field" style="margin-bottom:12px;">\n'
 '              <label>Porcentaje de avance',
 '<div class="field campo-pct" style="margin-bottom:12px;">\n'
 '              <label>Porcentaje de avance',
 "73b· poder señalar el campo del porcentaje")

# ── 74. Lo que está vacío no ocupa una página ────────────────────────────
# Un hito sin observación imprimía igual el rótulo «OBSERVACIONES VISUALES DE
# OBRA — HITO 5…» con un hueco debajo, y otro tanto con «FOTOGRAFÍAS — …».
# Dos rótulos huérfanos por hito, unos 150 px de blanco cada uno. En un informe
# de siete hitos eso es media página de nada.
#
# CSS no puede preguntar si un textarea está vacío, pero el preparado de la
# impresión ya recorre el documento: que marque lo vacío al pasar.
s = sustituir(s,
 "function _prepararImpresion(){\n"
 "  document.querySelectorAll('.foto-slot').forEach(sl=>{",
 "function _prepararImpresion(){\n"
 "  // Un campo sin nada escrito no tiene por qué llevarse su rótulo al papel.\n"
 "  document.querySelectorAll('textarea').forEach(t=>{\n"
 "    const caja = t.closest('.field') || t.closest('.foto-obs');\n"
 "    if(caja) caja.classList.toggle('vacio-impresion', !(t.value || '').trim());\n"
 "  });\n"
 "  // Y una sección de fotografías sin ninguna fotografía, tampoco.\n"
 "  document.querySelectorAll('.foto-sec').forEach(sec=>{\n"
 "    const hay = [...sec.querySelectorAll('img')].some(im => im.src && im.src.indexOf('data:') === 0);\n"
 "    const obs = sec.querySelector('.foto-obs textarea');\n"
 "    const hayNota = obs && (obs.value || '').trim();\n"
 "    sec.classList.toggle('vacio-impresion', !hay && !hayNota);\n"
 "  });\n"
 "  document.querySelectorAll('.foto-slot').forEach(sl=>{",
 "74a· marcar lo vacío antes de imprimir")

s = sustituir(s,
 "function _restaurarTrasImpresion(){",
 "function _restaurarTrasImpresion(){\n"
 "  document.querySelectorAll('.vacio-impresion').forEach(e=>e.classList.remove('vacio-impresion'));",
 "74b· y desmarcarlo al volver a la pantalla")

# ── 75. Lo que quedaba con aire de interfaz en el documento ──────────────
# La memoria por torre seguía siendo una tarjeta blanca con sombra, con su
# tabla vacía y el texto «Agregue o registre los apartamentos evaluados…», que
# es una instrucción para quien llena, no información para quien lee. El
# estatus de la obra gastaba cinco renglones para marcar uno. Y quedaban las
# ayudas de la interfaz: el formato del identificador y la nota del residente.
s = sustituir(s,
 "  .sp-card, .resumen, .obs-card{background:none!important;box-shadow:none!important;",
 "  .vacio-impresion{display:none!important}\n"
 "\n"
 "  /* Instrucciones para quien llena; no son contenido del informe. */\n"
 "  .field-note, .memoria-card p, .hint-formato{display:none!important}\n"
 "\n"
 "  /* El estatus, en un renglón: se marca uno de cinco. */\n"
 "  #estatus{gap:4px!important;margin-top:1px!important}\n"
 "  #estatus .ck-lbl{padding:1px 5px!important;font-size:9px!important;border-width:1px!important}\n"
 "  #estatus .ck-lbl:not(.on){display:none!important}\n"
 "  #agentes .ck-lbl, #agentes .ag-btn{padding:1px 6px!important;font-size:9px!important}\n"
 "\n"
 "  /* La memoria por torre: si no tiene apartamentos cargados, no dice nada. */\n"
 "  .memoria-card{background:none!important;box-shadow:none!important;border:none!important;\n"
 "                border-radius:0!important;padding:0!important;margin:0 0 9px!important}\n"
 "  .memoria-card h3{color:#1a237e!important;font-size:9.5px!important;text-transform:uppercase;\n"
 "                   letter-spacing:.6px;border-bottom:1px solid #1a237e!important;\n"
 "                   padding-bottom:3px;margin-bottom:5px!important}\n"
 "  .memoria-card:has(.tabla-vacia){display:none!important}\n"
 "\n"
 "  /* El número de informe es un dato, no un campo resaltado. */\n"
 "  #nro-display{background:none!important;border:none!important;padding:0!important;\n"
 "               color:#111!important;font-size:11px!important}\n"
 "\n"
 "  .sp-card, .resumen, .obs-card{background:none!important;box-shadow:none!important;",
 "75· fuera lo que era interfaz y no informe")

# El rótulo del formato del identificador necesita poder señalarse.
s = sustituir(s,
 '<span style="font-size:10px;color:#5f6b7a;margin-top:2px;display:block">Formato: Sector-Torre-Piso/Apto-Fecha-Inspector</span>',
 '<span class="hint-formato" style="font-size:10px;color:#5f6b7a;margin-top:2px;display:block">Formato: Sector-Torre-Piso/Apto-Fecha-Inspector</span>',
 "75b· poder señalar la ayuda del formato")

# ── 76. «(Evaluación por Hitos)» en cada uno de los siete títulos ────────
# Lo puse yo para que el papel conservara el contexto, pero el documento entero
# se titula «Informe de Inspección por Hitos»: repetirlo siete veces no informa.
s = sustituir(s,
 '<h2>${p.nombre}<span class="solo-impresion"> (Evaluación por Hitos)</span></h2>',
 '<h2>${p.nombre}</h2>',
 "76· el título del hito no repite el del informe")

# ── 77. Remates del documento ───────────────────────────────────────────
# Al dejar que los hitos fluyan entre páginas —que es lo que quitó las páginas
# medio vacías— apareció el efecto contrario: el título del hito 4 quedó al pie
# de una página y su observación al principio de la siguiente. Un título
# huérfano se arregla pidiendo que no se corte justo después de él.
#
# Y quedaban marcas de formulario que en un documento firmado no significan
# nada: el asterisco de «campo obligatorio» y el icono del calendario.
s = sustituir(s,
 "  .vacio-impresion{display:none!important}",
 "  .vacio-impresion{display:none!important}\n"
 "\n"
 "  /* Un título no se queda solo al pie de una página. */\n"
 "  .p-hdr, .sec-div, .sec-lbl, .foto-sec-title, .field label,\n"
 "  .sp-card h3, .resumen h2, .obs-card h3, .memoria-card h3{\n"
 "    break-after:avoid; page-break-after:avoid;\n"
 "  }\n"
 "  .res-row, .total-card{break-inside:avoid; page-break-inside:avoid}\n"
 "\n"
 "  /* Aire entre los bloques finales. */\n"
 "  .sp-card h3, .resumen h2, .obs-card h3{margin-top:11px!important}\n"
 "\n"
 "  /* El selector de fecha es un control, no parte del informe. */\n"
 "  input[type=date]::-webkit-calendar-picker-indicator{display:none!important}",
 "77a· títulos que no quedan huérfanos, y sin controles de formulario")

# El asterisco de obligatorio se retira al imprimir y vuelve al salir.
s = sustituir(s,
 "  document.querySelectorAll('.foto-slot').forEach(sl=>{",
 "  // El asterisco marca «campo obligatorio» mientras se llena. En el documento\n"
 "  // firmado no significa nada.\n"
 "  document.querySelectorAll('.field label, .sec-lbl').forEach(l=>{\n"
 "    if(l.dataset.conAsterisco) return;\n"
 "    const t = l.textContent;\n"
 "    if(/\\s\\*\\s*$/.test(t)){ l.dataset.conAsterisco = t; l.textContent = t.replace(/\\s\\*\\s*$/, ''); }\n"
 "  });\n"
 "  document.querySelectorAll('.foto-slot').forEach(sl=>{",
 "77b· quitar el asterisco de obligatorio al imprimir")

s = sustituir(s,
 "  document.querySelectorAll('.vacio-impresion').forEach(e=>e.classList.remove('vacio-impresion'));",
 "  document.querySelectorAll('.vacio-impresion').forEach(e=>e.classList.remove('vacio-impresion'));\n"
 "  document.querySelectorAll('[data-con-asterisco]').forEach(l=>{\n"
 "    l.textContent = l.dataset.conAsterisco;\n"
 "    delete l.dataset.conAsterisco;\n"
 "  });",
 "77c· y devolverlo al volver a la pantalla")

# ── 78. El último resto de formulario en el documento ───────────────────
# «● Auto-generado» junto al número le dice al inspector que no lo escriba él.
# En el documento firmado no aporta: el número es el número.
s = sustituir(s,
 '<label>N\u00b0 de Informe <span style="color:#2e7d32;font-size:9px">\u25cf Auto-generado</span></label>',
 '<label>N\u00b0 de Informe <span class="solo-pantalla" style="color:#1b5e20;font-size:9px">\u25cf Auto-generado</span></label>',
 "78\u00b7 el aviso de autogenerado no va al papel")

# ── 79. En el informe firmado, el porcentaje va en negro ────────────────
# En pantalla el verde, el ámbar y el rojo ayudan al inspector a barrer siete
# hitos de un vistazo, y ahí se quedan. En el papel dicen «bien / regular /
# mal» sobre un umbral que NADIE ha definido: los pesos son `PA-03` y el
# criterio de aceptación lo fija el ingeniero responsable, no un color de la
# herramienta. Un 40 % en rojo dentro de un documento que va al Ministerio es
# un juicio implícito que el informe no está en condiciones de emitir.
s = sustituir(s,
 "  .vacio-impresion{display:none!important}",
 "  /* El color es una ayuda de la pantalla, no un dictamen. En el papel, la\n"
 "     cifra sola: quien la lea aplicará el criterio que corresponda. */\n"
 "  .g, .y, .r, .pct-bdg, .res-pct, .p-foot-pct, .pv, .total-num{ color:#111!important }\n"
 "\n"
 "  .vacio-impresion{display:none!important}",
 "79\u00b7 sin verde, \u00e1mbar ni rojo en el informe firmado")

# ── 80. Los bloques de color que quedaban en el modo detallado ───────────
# El modo por hitos ya salía como documento, pero el detallado —el de oficina—
# conservaba lo que se había quitado en el otro: la cabecera de cada tabla como
# una banda azul sólida, la escala B/R/M dentro de una caja de color, y la
# columna «cantidad faltante» en naranja, que es otro juicio de color sin
# criterio detrás. La numeración de filas, además, iba en gris #bbb: ilegible
# impresa.
s = sustituir(s,
 "  /* El color es una ayuda de la pantalla, no un dictamen. En el papel, la\n"
 "     cifra sola: quien la lea aplicará el criterio que corresponda. */\n"
 "  .g, .y, .r, .pct-bdg, .res-pct, .p-foot-pct, .pv, .total-num{ color:#111!important }",
 "  /* El color es una ayuda de la pantalla, no un dictamen. En el papel, la\n"
 "     cifra sola: quien la lea aplicará el criterio que corresponda. */\n"
 "  .g, .y, .r, .pct-bdg, .res-pct, .p-foot-pct, .pv, .total-num,\n"
 "  td[id^='flt_'], .flt{ color:#111!important }\n"
 "\n"
 "  /* La cabecera de la tabla, texto sobre una regla en vez de una banda.\n"
 "     El color de fondo lo lleva el <thead> en un atributo style, que gana a\n"
 "     cualquier hoja: hay que anularlo ahí, no solo en las celdas. */\n"
 "  thead, table thead{background:none!important;background-image:none!important}\n"
 "  thead th{\n"
 "    background:none!important; color:#1a237e!important;\n"
 "    border:none!important; border-bottom:1.2px solid #1a237e!important;\n"
 "    print-color-adjust:economy!important; -webkit-print-color-adjust:economy!important;\n"
 "  }\n"
 "  tbody td{border-color:#dde1e8!important}\n"
 "  td.n{color:#5a6672!important}\n"
 "\n"
 "  /* La escala de evaluación es una nota al pie, no un recuadro de color. */\n"
 "  #escala-brm{background:none!important;border:none!important;border-left:2px solid #1a237e!important;\n"
 "              border-radius:0!important;padding:2px 0 2px 8px!important;font-size:9px!important;\n"
 "              margin:0 0 8px!important;color:#333!important}",
 "80· el modo detallado también deja de traer bloques de color")

# ── 81. Las observaciones largas se cortaban en el PDF ───────────────────
# Al imprimir, la altura de cada cuadro de observaciones se calculaba con
# `scrollHeight`, que mide con la tipografía de PANTALLA. En el papel el texto
# va en otra familia y otro cuerpo, ocupa más líneas, y el `overflow:hidden`
# recortaba lo que sobraba. Medido con una observación de dos párrafos: el
# informe terminaba a media frase —«…condicionado a la llegada del material.
# Queda»— y el resto no salía. Nadie se enteraría: en pantalla está entero.
#
# Un cuadro de texto no crece solo; un párrafo sí. Al imprimir se vuelca el
# contenido a un párrafo de verdad y se imprime ese.
s = sustituir(s,
 "  document.querySelectorAll('.foto-obs textarea, #obs_general, #obs_sp').forEach(t=>{\n"
 "    if(!t.dataset.altoOriginal) t.dataset.altoOriginal = t.style.height || '';\n"
 "    t.style.height = 'auto';\n"
 "    t.style.height = t.scrollHeight + 'px';\n"
 "  });",
 "  // Cada observación se vuelca a un párrafo, que crece con su contenido. La\n"
 "  // altura calculada del cuadro dependía de la letra de la pantalla y en el\n"
 "  // papel recortaba el final del texto.\n"
 "  document.querySelectorAll('textarea').forEach(t=>{\n"
 "    let p = t.nextElementSibling;\n"
 "    if(!p || !p.classList || !p.classList.contains('texto-impreso')){\n"
 "      p = document.createElement('div');\n"
 "      p.className = 'texto-impreso';\n"
 "      t.parentNode.insertBefore(p, t.nextSibling);\n"
 "    }\n"
 "    p.textContent = t.value || '';\n"
 "  });",
 "81a· volcar las observaciones a un párrafo antes de imprimir")

s = sustituir(s,
 "  /* Las observaciones son prosa del informe, no el contenido de una casilla. */\n"
 "  textarea{border:none!important;background:none!important;border-radius:0!important;\n"
 "           padding:0!important;margin:0!important;resize:none!important;overflow:hidden!important;\n"
 "           font-family:Georgia,'Times New Roman',serif!important;font-size:10.5px!important;\n"
 "           line-height:1.45!important;color:#111!important;min-height:0!important}\n"
 "  #obs_general, #obs_sp{font-size:11px!important}",
 "  /* Las observaciones son prosa del informe, no el contenido de una casilla.\n"
 "     Se imprime el párrafo, no el cuadro: un cuadro recorta, un párrafo no. */\n"
 "  textarea{display:none!important}\n"
 "  .texto-impreso{display:block!important;\n"
 "           font-family:Georgia,'Times New Roman',serif!important;font-size:10.5px!important;\n"
 "           line-height:1.45!important;color:#111!important;\n"
 "           white-space:pre-wrap;word-break:break-word;margin:0!important;padding:0!important}\n"
 "  #obs_general + .texto-impreso, #obs_sp + .texto-impreso{font-size:11px!important}\n"
 "  .foto-obs .texto-impreso{font-style:italic;font-size:9.5px!important}",
 "81b· imprimir el párrafo en vez del cuadro")

# En pantalla el párrafo no existe: el inspector escribe en el cuadro de siempre.
s = sustituir(s,
 ".field-note{font-size:10px;color:#5f6b7a;margin-top:2px}",
 ".field-note{font-size:10px;color:#5f6b7a;margin-top:2px}\n"
 "/* Copia de las observaciones que solo se usa al imprimir. */\n"
 ".texto-impreso{display:none}",
 "81c· el párrafo no se ve en pantalla")

# Y lo vacío se decide sobre el mismo texto.
s = sustituir(s,
 "    const caja = t.closest('.field') || t.closest('.foto-obs');\n"
 "    if(caja) caja.classList.toggle('vacio-impresion', !(t.value || '').trim());",
 "    const caja = t.closest('.field') || t.closest('.foto-obs');\n"
 "    if(caja) caja.classList.toggle('vacio-impresion', !(t.value || '').trim());",
 "81d· sin cambio en la marca de vacío")

# ── 82. El informe se imprimía siempre en A4 ────────────────────────────
# `@page{size:A4 portrait}` fija el papel: el PDF sale 210 x 297 mm aunque la
# impresora tenga otra cosa. En oficina venezolana lo corriente es **Carta**
# (215,9 x 279,4 mm), que es 18 mm más corta: la impresora acaba reescalando el
# documento para que quepa —el cuerpo de 10,5 px baja a ~9,9— o recortando el
# pie. Y el expediente de rendición se entrega en tres ejemplares FÍSICOS
# (`PA-76`), así que el papel real importa.
#
# Se conserva la orientación vertical y se deja que el navegador use el papel
# que tenga cargado. El diseño es fluido, así que encaja en los dos.
s = sustituir(s,
 "  @page{margin:11mm 11mm;size:A4 portrait}",
 "  @page{margin:11mm 11mm;size:portrait}",
 "82\u00b7 el informe se adapta al papel de la impresora, A4 o Carta")

# ── 83. Los errores del relevo llegaban en jerga al inspector ───────────
# Cuando el relevo falla por algo que no es la clave ni un dato que falte, el
# aviso que veía el inspector era el error crudo del servidor —«TypeError: no
# se pudo crear la carpeta»—. En una torre eso no le dice qué hacer. Los tres
# errores previsibles se explican; el resto pasa a un mensaje accionable, y el
# técnico queda en el registro de envío, que es donde sirve para diagnosticar.
s = sustituir(s,
 "    } else {\n"
 "      logEl.textContent += '\u274c ' + (res.error || 'Error desconocido');\n"
 "      showToast('\u274c ' + (res.error || 'No se pudo enviar'), 'err');\n"
 "    }",
 "    } else {\n"
 "      const err = res.error || 'Error desconocido';\n"
 "      // El detalle t\u00e9cnico siempre queda escrito, para poder diagnosticar.\n"
 "      logEl.textContent += '\u274c ' + err;\n"
 "      // Y al inspector se le dice qu\u00e9 hacer, no qu\u00e9 fall\u00f3 por dentro.\n"
 "      const conocido = /clave|faltan|sector/i.test(err);\n"
 "      showToast(conocido\n"
 "        ? '\u274c ' + err\n"
 "        : '\u274c El relevo no pudo archivarlo. El informe sigue guardado aqu\u00ed: reint\u00e9ntelo, y si vuelve a fallar avise a la oficina.', 'err');\n"
 "    }",
 "83\u00b7 el error del relevo se explica en vez de mostrarse crudo")

# ── 84. «Guardado con éxito» antes de haber guardado ────────────────────
# El aviso de éxito se emitía ANTES del `localStorage.setItem`. Si el guardado
# fallaba —el teléfono sin espacio es el caso real—, el inspector veía primero
# «✅ Nuevo borrador guardado localmente» y a continuación «❌ El teléfono se
# quedó sin espacio». El primero es el que se lee, y no se había guardado nada.
s = sustituir(s,
 "      list[pos] = data;\n"
 "      currentEditingIndex = pos;\n"
 "      if(!silencioso) showToast('✅ Borrador modificado y actualizado con éxito', 'ok');\n"
 "    } else {\n"
 "      list.unshift(data);\n"
 "      currentEditingIndex = 0;\n"
 "      if(!silencioso) showToast('✅ Nuevo borrador guardado localmente','ok');\n"
 "    }\n"
 "    _idEnEdicion = data.id || null;\n"
 "    localStorage.setItem('garmel_reports_list', JSON.stringify(list));",
 "      list[pos] = data;\n"
 "      currentEditingIndex = pos;\n"
 "    } else {\n"
 "      list.unshift(data);\n"
 "      currentEditingIndex = 0;\n"
 "    }\n"
 "    _idEnEdicion = data.id || null;\n"
 "    // El aviso va DESPUÉS de escribir: si esto revienta por falta de espacio,\n"
 "    // el inspector no puede haber leído antes que se guardó bien.\n"
 "    localStorage.setItem('garmel_reports_list', JSON.stringify(list));\n"
 "    if(!silencioso) showToast(pos >= 0\n"
 "      ? '✅ Borrador modificado y actualizado con éxito'\n"
 "      : '✅ Nuevo borrador guardado localmente', 'ok');",
 "84a· el aviso de guardado se emite después de guardar")

# ── 85. Una ficha vacía en la lista dejaba sin acceso a todo lo guardado ─
# `renderSavedList` recorría la lista tal cual. Con un hueco —un `null` de un
# guardado interrumpido o de una versión anterior— reventaba al leer `.nro`, y
# «Mis informes» dejaba de abrirse. Es el único sitio desde donde se recupera o
# se envía un informe que vive SOLO en ese teléfono.
s = sustituir(s,
 "function getSavedReports() {\n"
 "  try {\n"
 "    return JSON.parse(localStorage.getItem('garmel_reports_list') || '[]');\n"
 "  } catch(e) { return []; }\n"
 "}",
 "function getSavedReports() {\n"
 "  try {\n"
 "    const l = JSON.parse(localStorage.getItem('garmel_reports_list') || '[]');\n"
 "    // Un hueco en la lista no debe dejar sin acceso al resto: se descartan las\n"
 "    // fichas que no son un informe, y si lo guardado no es siquiera una lista\n"
 "    // se empieza de cero en vez de reventar.\n"
 "    return Array.isArray(l) ? l.filter(function(b){ return b && typeof b === 'object'; }) : [];\n"
 "  } catch(e) { return []; }\n"
 "}",
 "85· una ficha rota no tumba la lista de informes")

if ONCE_HITOS:
    # ── 86. Los once hitos del desglose de agosto, completos ────────────
    # Skarlet Gómez informa (28-ago-2026) que **el modo detallado es el que se va a
    # usar** —de ahí sale la fórmula del porcentaje, porque se calcula por cantidad
    # proyectada contra ejecutada en cada subpartida— y que **los hitos estaban
    # cortados: son once, no siete**.
    #
    # Se transcriben del Excel "Hitos en desglose Ciudad Tiuna. Agosto.xlsx"
    # (Drive 1AOY-IjbDjdCLZ_J41vGdzLdI2j18F13S, modificado el 27-ago-2026):
    # **11 hitos y 50 subpartidas**, contra los 7 hitos y 31 ítems que traía el
    # formulario. El original **no trae ninguna cifra**: es estructura, no pesos,
    # así que `PA-03` sigue abierta.
    #
    # ATENCIÓN: esto NO está aprobado y choca con tres cosas ya escritas, todas
    # registradas como **C-28** en fuentes/contradicciones.md:
    #   1. ADR-0017 fijó **siete** hitos, aprobados por la Ing. Beatriz Sevilla, y
    #      dice expresamente que no se pueden inferir hitos adicionales sin el
    #      ingeniero responsable.
    #   2. Los once hitos son de **TORRE** según C-26; este formulario se llena por
    #      **apartamento**. Ascensor, acabados exteriores y pruebas de ascensores no
    #      son partidas de una vivienda.
    #   3. **Contra incendio** y **mecánicas** existían en los siete y **no están**
    #      entre los once. Adoptarlos los saca del instrumento, con PA-89 vivo.
    ini_p = s.index("const PARTIDAS = [")
    fin_p = s.index("\n]", ini_p) + 2
    s = sustituir(s, s[ini_p:fin_p], PARTIDAS_ONCE,
     "86· los once hitos con sus 50 subpartidas, del Excel de agosto")

    # Con once hitos el reparto de ámbito cambia: los de torre ya no son dos.
    s = sustituir(s,
     "const HITOS_DE_TORRE = ['hito_estructura', 'hito_mecanicas'];",
     "// PROVISIONAL. Qué hito se evalúa por torre y cuál por apartamento es criterio\n"
     "// de ingeniería; esta lista es una propuesta a confirmar. Dos hitos quedan\n"
     "// MEZCLADOS y no se resuelven aquí: el 2 lleva la impermeabilización de azotea\n"
     "// y el 3 el equipamiento de cuarto de módulos, que son de torre dentro de un\n"
     "// hito de apartamento. Ver C-28.\n"
     "const HITOS_DE_TORRE = ['hito_estructura', 'hito_ascensor', 'hito_exteriores', 'hito_pruebas'];",
     "86b· reparto de ámbito provisional para once hitos")

# ── 87. El enlace de campo abre el detallado, no el de hitos ────────────
# Se invierte la entrada del cambio 43. El modo por hitos pedía un porcentaje a
# ojo; el detallado lo CALCULA por cantidad proyectada contra ejecutada en cada
# subpartida. Es la diferencia entre avance declarado y avance verificado, que
# es justo lo que pregunta `PA-43`, y es la razón que da Skarlet Gómez para
# usarlo. Ver ADR-0018.
#
#   .../inspeccion/            -> detallado, el que se llena en obra
#   .../inspeccion/?modo=hitos -> el de hitos, que se conserva sin retirar
s = sustituir(s,
 "  startApp(modo === 'detallado' ? 'detallado' : 'hitos');",
 "  startApp(modo === 'hitos' ? 'hitos' : 'detallado');",
 "87\u00b7 el enlace pelado abre el detallado", 3)

# ── 88. Se ocultaban cuatro hitos sin decirlo en ninguna parte ───────────
# El informe abre en ámbito apartamento, que esconde los hitos de torre: la
# lista empieza en el 2 y termina en el 8. El selector de ámbito que lo explica
# está a 1.200 px del inicio —fuera de la primera pantalla— y mide 32 px, por
# debajo de los 44 que llevan el resto de los controles.
#
# El resultado es que el formulario parece incompleto. Le pasó a quien conoce
# el sistema; a un inspector le pasa igual. El aviso se pone DONDE se nota la
# ausencia: en la cabecera de la lista de hitos, con la cuenta y con el botón
# para cambiar de ámbito ahí mismo.
s = sustituir(s,
 '<div class="sec-div">EVALUACIÓN DE AVANCE POR HITOS Y SUBITEMS',
 '<div class="sec-div">EVALUACIÓN DE AVANCE POR HITOS Y SUBITEMS'
 '<span id="aviso-ambito" style="display:block;text-transform:none;letter-spacing:0;'
 'font-weight:600;font-size:11.5px;color:#1a237e;margin-top:5px"></span>',
 "88a· sitio para el aviso de ámbito, donde se nota la ausencia")

s = sustituir(s,
 "  const nota = document.getElementById('ambito-nota');",
 "  // Se dice cuántos hitos se están mostrando y cuáles quedan fuera: si no, la\n"
 "  // numeración salta y el formulario parece incompleto.\n"
 "  const aviso = document.getElementById('aviso-ambito');\n"
 "  if(aviso && typeof PARTIDAS !== 'undefined'){\n"
 "    const propios = PARTIDAS.filter(function(p){\n"
 "      return (HITOS_DE_TORRE.indexOf(p.id) >= 0) === esTorre; });\n"
 "    const fuera = PARTIDAS.filter(function(p){\n"
 "      return (HITOS_DE_TORRE.indexOf(p.id) >= 0) !== esTorre; })\n"
 "      .map(function(p){ return (p.nombre.match(/[0-9]+/) || [''])[0]; })\n"
 "      .filter(Boolean);\n"
 "    aviso.textContent = 'Se muestran ' + propios.length + ' de los ' + PARTIDAS.length +\n"
 "      ' hitos: los de ' + (esTorre ? 'torre' : 'apartamento') + '.' +\n"
 "      (fuera.length ? '  Los hitos ' + fuera.join(', ') + ' son de ' +\n"
 "        (esTorre ? 'apartamento' : 'torre') + ' y van en su propio informe.' : '');\n"
 "  }\n"
 "\n"
 "  const nota = document.getElementById('ambito-nota');",
 "88b· decir cuántos hitos se muestran y cuáles quedan fuera")

# El selector de ámbito llevaba su tamaño escrito en el atributo style, que gana
# a la hoja: por eso se quedó en 32 px cuando todo lo demás subió a 44.
s = sustituir(s,
 "  const on  = 'padding:6px 15px;border:2px solid #e65100;border-radius:20px;font-size:12px;font-weight:700;cursor:pointer;background:#a63d00;color:#fff';\n"
 "  const off = 'padding:6px 15px;border:2px solid #e0e0e0;border-radius:20px;font-size:12px;font-weight:700;cursor:pointer;background:#f5f5f5;color:#666';",
 "  const base = 'padding:10px 16px;border-radius:22px;font-size:13px;font-weight:700;cursor:pointer;min-height:44px;';\n"
 "  const on  = base + 'border:2px solid #a63d00;background:#a63d00;color:#fff';\n"
 "  const off = base + 'border:2px solid #c9cdd6;background:#fff;color:#37474f';",
 "88c· el selector de ámbito, tocable con guantes")

s = sustituir(s,
 'style="padding:6px 15px;border:2px solid #e65100;border-radius:20px;font-size:12px;font-weight:700;cursor:pointer;background:#a63d00;color:#fff">🚪 Apartamento</button>',
 'style="padding:10px 16px;border:2px solid #a63d00;border-radius:22px;font-size:13px;font-weight:700;cursor:pointer;min-height:44px;background:#a63d00;color:#fff">🚪 Apartamento</button>',
 "88d· y su estado inicial con el mismo tamaño")

s = sustituir(s,
 'style="padding:6px 15px;border:2px solid #e0e0e0;border-radius:20px;font-size:12px;font-weight:700;cursor:pointer;background:#f5f5f5;color:#666">🏢 Torre completa</button>',
 'style="padding:10px 16px;border:2px solid #c9cdd6;border-radius:22px;font-size:13px;font-weight:700;cursor:pointer;min-height:44px;background:#fff;color:#37474f">🏢 Torre completa</button>',
 "88e· lo mismo para el de torre")

# En el papel el aviso sobra: el informe ya declara su ámbito arriba.
s = sustituir(s,
 "  .vacio-impresion{display:none!important}",
 "  #aviso-ambito{display:none!important}\n"
 "  .vacio-impresion{display:none!important}",
 "88f· el aviso de ámbito no va al documento")

# ── 89. En el teléfono, cada subpartida deja de ser una fila de tabla ────
# El modo detallado pasó a ser el instrumento de campo (ADR-0018) y nunca se
# había medido en un teléfono, porque hasta ahora el de campo era el de hitos.
#
# Medido en 375 px: la tabla ocupa **689 px** dentro de un contenedor de 354, y
# aun ocultando la cantidad proyectada en modo Inspector se queda en 640. O sea
# que el inspector tiene que **arrastrar de lado en cada una de las 34 filas**
# para llegar a la cantidad ejecutada y a la evaluación. Y los botones B/R/M
# miden **36x38 px**: 136 controles por debajo del mínimo que lleva todo lo
# demás desde la ronda de móvil.
#
# En una pantalla estrecha la fila se apila: la descripción arriba, y debajo lo
# que se llena. Desaparece el arrastre lateral y los botones caben a 44 px.
# En pantalla ancha la tabla no cambia.
s = sustituir(s,
 "  .no-insp-tgl, .arrow{\n"
 "    min-width:44px; min-height:44px;",
 "  /* ── El detallado, apilado: sin arrastre lateral ─────────────────── */\n"
 "  .tbl-wrap{ overflow-x:visible!important; }\n"
 "  .tbl-wrap table{ min-width:0!important; width:100%!important; }\n"
 "  .tbl-wrap thead{ display:none; }\n"
 "  .tbl-wrap tbody, .tbl-wrap tr, .tbl-wrap td{ display:block; width:auto!important; }\n"
 "  .tbl-wrap tr{\n"
 "    border:1px solid #e0e4ff; border-radius:8px; padding:9px 11px;\n"
 "    margin-bottom:9px; background:#fff; position:relative;\n"
 "  }\n"
 "  .tbl-wrap td{ border:none!important; padding:0!important; text-align:left!important; }\n"
 "  /* El número de la subpartida, como distintivo en la esquina. */\n"
 "  .tbl-wrap td.n{\n"
 "    position:absolute; top:9px; right:11px; width:auto!important;\n"
 "    font-size:11px; color:#8a93a3; font-weight:800;\n"
 "  }\n"
 "  .tbl-wrap td.desc{\n"
 "    font-size:14px!important; font-weight:700; color:#1a237e;\n"
 "    padding-right:26px!important; margin-bottom:8px!important; line-height:1.3;\n"
 "  }\n"
 "  .tbl-wrap td.desc input{ font-size:14px!important; font-weight:700; }\n"
 "  /* Las dos cantidades, cada una con su rótulo delante. */\n"
 "  .tbl-wrap td.col-proyectada, .tbl-wrap td.col-ejecutada{\n"
 "    display:flex!important; align-items:center; gap:9px; margin-bottom:7px!important;\n"
 "  }\n"
 "  .tbl-wrap td.col-proyectada::before{ content:'Proyectada'; }\n"
 "  .tbl-wrap td.col-ejecutada::before{ content:'Ejecutada'; }\n"
 "  .tbl-wrap td.col-proyectada::before, .tbl-wrap td.col-ejecutada::before{\n"
 "    flex:0 0 92px; font-size:11px; font-weight:800; color:#5a6672;\n"
 "    text-transform:uppercase; letter-spacing:.3px;\n"
 "  }\n"
 "  .tbl-wrap td .num{ width:96px!important; }\n"
 "  /* La evaluación, en su fila, con los botones ya tocables. */\n"
 "  .tbl-wrap td.col-eval{ margin-top:2px!important; }\n"
 "  .tbl-wrap .ev{ display:flex; gap:7px; }\n"
 "  .tbl-wrap .ev-btn{ flex:1 1 0; min-height:44px; font-size:14px; }\n"
 "  /* Lo calculado, en una línea al pie, sin campo que llenar. */\n"
 "  .tbl-wrap td.falt-cell, .tbl-wrap td.pct-cell{\n"
 "    display:inline-flex!important; align-items:center; gap:6px;\n"
 "    margin-top:8px!important; font-size:12px;\n"
 "  }\n"
 "  .tbl-wrap td.falt-cell::before{ content:'Faltante'; }\n"
 "  .tbl-wrap td.pct-cell::before{ content:'Avance'; }\n"
 "  .tbl-wrap td.falt-cell::before, .tbl-wrap td.pct-cell::before{\n"
 "    font-size:10px; font-weight:800; color:#5a6672; text-transform:uppercase;\n"
 "  }\n"
 "  .tbl-wrap td.pct-cell{ margin-left:16px!important; }\n"
 "  .tbl-wrap td.pct-cell .bar-bg{ display:none; }\n"
 "\n"
 "  .no-insp-tgl, .arrow{\n"
 "    min-width:44px; min-height:44px;",
 "89a· en el teléfono la subpartida se apila en vez de arrastrarse")

# Las celdas necesitan poder señalarse una a una.
s = sustituir(s,
 '<td><input type="number" class="num" min="0" id="ej_${rid}" data-rid="${rid}" data-p="${p.id}" oninput="recalcRow(this)" placeholder="0"></td>\n'
 '          <td><div class="ev">',
 '<td class="col-ejecutada"><input type="number" class="num" min="0" id="ej_${rid}" data-rid="${rid}" data-p="${p.id}" oninput="recalcRow(this)" placeholder="0"></td>\n'
 '          <td class="col-eval"><div class="ev">',
 "89b· poder señalar la cantidad ejecutada y la evaluación")

# ── 90. En el teléfono los hitos abren plegados ─────────────────────────
# Con once hitos y las subpartidas apiladas, el formulario abría entero: 17
# pantallas de scroll para recorrer las 34 subpartidas de un apartamento. El
# inspector pierde de vista dónde está.
#
# Plegados, el encabezado de cada hito sigue mostrando su nombre y su
# porcentaje, así que la lista completa cabe en dos pantallas y se despliega el
# que se va a llenar. En pantalla ancha no cambia: ahí caben.
s = sustituir(s,
 "  if(document.getElementById('inspectores-container').children.length === 0) addInspectorField();",
 "  // En una pantalla estrecha se abre la lista plegada. El encabezado de cada\n"
 "  // hito ya dice su nombre y su porcentaje, así que sigue informando.\n"
 "  try{\n"
 "    if(window.matchMedia &&\n"
 "       window.matchMedia('(max-width: 700px), (pointer: coarse)').matches){\n"
 "      document.querySelectorAll('.partida').forEach(function(p){ p.classList.add('collapsed'); });\n"
 "    }\n"
 "  } catch(e) { /* sin matchMedia se deja desplegado */ }\n"
 "\n"
 "  if(document.getElementById('inspectores-container').children.length === 0) addInspectorField();",
 "90· en el teléfono los hitos abren plegados")

# ── 91. Los once hitos se muestran siempre, en los dos ámbitos ─────────────
# Lo pide Skarlet Gómez (28-ago-2026): que los hitos se vean completos, sea el
# informe de un apartamento o de una torre.
#
# Lo que se retira es el REPARTO POR ÁMBITO, que era nuestro y era provisional:
# ADR-0018 §3 lo dice en su propio texto —"PROVISIONAL, a confirmar por el
# ingeniero responsable"— y deja dos hitos declaradamente mezclados: el 2 lleva
# la impermeabilización de azotea y el 3 el equipamiento de cuarto de módulos,
# que son de torre dentro de un hito de apartamento. Ocultar hitos sobre una
# partición sin confirmar decide por el inspector algo que nadie decidió.
#
# El ámbito NO desaparece: sigue gobernando piso y apartamento, y sigue
# poniendo TORRE en el identificador. Lo único que deja de hacer es esconder.
#
# El caso "este hito no aplica aquí" ya tenía respuesta y es mejor que ocultar:
# «hito no inspeccionado», que no cuenta para el promedio. Un cero significa
# "no está construido"; ocultarlo no significa nada y no queda registrado.

s = sustituir(s,
 "  // Se muestran solo los hitos del ámbito elegido.\n"
 "  if (typeof PARTIDAS !== 'undefined') PARTIDAS.forEach(p=>{\n"
 "    const deTorre = HITOS_DE_TORRE.indexOf(p.id) >= 0;\n"
 "    const propio = (deTorre === esTorre);\n"
 "    const bloque = document.getElementById('p_' + p.id);\n"
 "    if(bloque) bloque.style.display = propio ? '' : 'none';\n"
 "    // La fila del resumen va con su tarjeta: un hito de torre no tiene por\n"
 "    // qué aparecer con un guion en el informe de un apartamento.\n"
 "    const fila = document.getElementById('res_' + p.id);\n"
 "    if(fila) fila.style.display = propio ? '' : 'none';\n"
 "  });",
 "  // Los hitos se muestran completos en los dos ámbitos. Se recorren igual\n"
 "  // para devolver a la vista lo que una versión anterior hubiera ocultado.\n"
 "  if (typeof PARTIDAS !== 'undefined') PARTIDAS.forEach(p=>{\n"
 "    const bloque = document.getElementById('p_' + p.id);\n"
 "    if(bloque) bloque.style.display = '';\n"
 "    const fila = document.getElementById('res_' + p.id);\n"
 "    if(fila) fila.style.display = '';\n"
 "  });",
 "91a· los hitos ya no se ocultan por ámbito")

s = sustituir(s,
 "// Los hitos que corresponden al ámbito elegido. Todo lo demás está oculto y no\n"
 "// forma parte de este informe.\n"
 "function _hitosDelAmbito(){\n"
 "  const esTorre = (ambito === 'torre');\n"
 "  return PARTIDAS.filter(function(p){\n"
 "    return (HITOS_DE_TORRE.indexOf(p.id) >= 0) === esTorre;\n"
 "  });\n"
 "}",
 "// Los hitos que entran en el informe. La función se conserva —de ella cuelgan\n"
 "// el promedio, el guardado del borrador y el envío— porque el invariante que\n"
 "// la justificó sigue en pie: lo que se ve tiene que ser lo que se manda. Al\n"
 "// mostrarse los once, los once entran.\n"
 "function _hitosDelAmbito(){\n"
 "  return PARTIDAS;\n"
 "}",
 "91b· el promedio, el guardado y el envío toman los once")

s = sustituir(s,
 "  const aviso = document.getElementById('aviso-ambito');\n"
 "  if(aviso && typeof PARTIDAS !== 'undefined'){\n"
 "    const propios = PARTIDAS.filter(function(p){\n"
 "      return (HITOS_DE_TORRE.indexOf(p.id) >= 0) === esTorre; });\n"
 "    const fuera = PARTIDAS.filter(function(p){\n"
 "      return (HITOS_DE_TORRE.indexOf(p.id) >= 0) !== esTorre; })\n"
 "      .map(function(p){ return (p.nombre.match(/[0-9]+/) || [''])[0]; })\n"
 "      .filter(Boolean);\n"
 "    aviso.textContent = 'Se muestran ' + propios.length + ' de los ' + PARTIDAS.length +\n"
 "      ' hitos: los de ' + (esTorre ? 'torre' : 'apartamento') + '.' +\n"
 "      (fuera.length ? '  Los hitos ' + fuera.join(', ') + ' son de ' +\n"
 "        (esTorre ? 'apartamento' : 'torre') + ' y van en su propio informe.' : '');\n"
 "  }",
 "  // El aviso existía para explicar una ausencia. Ya no hay ausencia que\n"
 "  // explicar: ahora dice qué hacer con el hito que no aplique, que es lo que\n"
 "  // evita que alguien le ponga cero.\n"
 "  const aviso = document.getElementById('aviso-ambito');\n"
 "  if(aviso && typeof PARTIDAS !== 'undefined'){\n"
 "    aviso.textContent = 'Se muestran los ' + PARTIDAS.length + ' hitos. El que no '\n"
 "      + 'aplique a este informe, márquelo como «hito no inspeccionado»: así no '\n"
 "      + 'cuenta para el promedio, que no es lo mismo que ponerle cero.';\n"
 "  }",
 "91c· el aviso dice qué hacer con el hito que no aplica")

s = sustituir(s,
 "  const nota = document.getElementById('ambito-nota');\n"
 "  if(nota) nota.textContent = esTorre\n"
 "    ? 'Estructura, ascensores y áreas comunes — no aplica a una vivienda'\n"
 "    : 'Acabados, carpintería e instalaciones de la vivienda';",
 "  // La nota describía el reparto de hitos, que ya no existe. Ahora describe\n"
 "  // lo que el ámbito sí sigue decidiendo.\n"
 "  const nota = document.getElementById('ambito-nota');\n"
 "  if(nota) nota.textContent = esTorre\n"
 "    ? 'Informe de la torre completa — sin piso ni apartamento; el número sale …-TORRE-…'\n"
 "    : 'Informe de una vivienda — piso y apartamento son obligatorios';",
 "91d· la nota del ámbito dice lo que el ámbito decide de verdad")

# Sin filtro por ámbito, la lista se queda sin un solo consumidor. Se retira en
# vez de dejarla como código muerto: el reparto que proponía está escrito en
# ADR-0018 §3, que es donde se decide si vuelve y con qué contenido.
s = sustituir(s,
 "// PROVISIONAL. Qué hito se evalúa por torre y cuál por apartamento es criterio\n"
 "// de ingeniería; esta lista es una propuesta a confirmar. Dos hitos quedan\n"
 "// MEZCLADOS y no se resuelven aquí: el 2 lleva la impermeabilización de azotea\n"
 "// y el 3 el equipamiento de cuarto de módulos, que son de torre dentro de un\n"
 "// hito de apartamento. Ver C-28.\n"
 "const HITOS_DE_TORRE = ['hito_estructura', 'hito_ascensor', 'hito_exteriores', 'hito_pruebas'];\n",
 "",
 "91e· retirar HITOS_DE_TORRE, que se queda sin consumidores")

# ── 92. Los datos de torre salen del cuadro de Gerencia Técnica ────────────
# Fuente: `CUADRO RESUMEN DE SECTORES EMP-OBRAS 28.08.26.xlsx` — Drive
# `1GdkAY-PKzrFUzFy2PvGkYDv0Q0NzRzrM`, del 28-ago-2026. Es la respuesta de
# Gerencia Técnica a C-27, y coincide **exactamente** con el maestro
# `ASIGNACIONES CIUDAD TIUNA CONTINGENCIA 2026.xlsx` del 13-ago: mismas 46
# asignaciones, mismos sectores, y sus totales cuadran (792 + 588 + 1.788 =
# 3.168 apartamentos).
#
# Lo que había estaba mal en tres cosas distintas, y las tres se corrigen aquí:
#
#   1. NUEVE TORRES EN EL SECTOR EQUIVOCADO. Las 01, 02, 03 (Río Limón), 09,
#      10, 11 (Thaissa MM) y 14, 15, 16 (Procodima) estaban bajo Convenio
#      Rusos; son de Ezequiel Zamora. Son 540 apartamentos, y el sector decide
#      el identificador del informe y la carpeta de Drive donde se archiva.
#   2. TRES A MEDIAS. Las 04, 12 y 13 existen en DOS sectores —esa es la
#      duplicación de PA-23—. Estaba solo la copia rusa; faltaba la bielorrusa.
#   3. UNA INVENTADA. La T-04 bajo Convenio Chinos no existe en ningún
#      documento: Simón Bolívar solo tiene D-08 y J-07 a J-12.
#
# Además los ceros a la izquierda: T-5, T-6, T-7 y T-8 se escribían sin cero y
# quedaban sueltas al final del desplegable, entre las cuarenta.
#
# Y EL CAMBIO DE FONDO: el residente y la empresa pasan a colgar de la TORRE,
# no de la empresa. El cuadro da residentes DISTINTOS para torres de la misma
# contratista —Río Limón tiene a Harry Arteaga en la T-01 y a María T. Marcano
# en la T-02; Alnavic, a Antonio Cuicas en la T-05 y a José V. Gonzáles en la
# T-06—. Un residente por empresa no puede representar eso, y precargaba el
# nombre equivocado.
#
# Donde el cuadro no dice residente, se deja EN BLANCO y lo escribe el
# inspector. No se hereda el de otra torre de la misma empresa: el cuadro
# REPITE el nombre cuando una persona cubre varias torres —Drijecae lo pone
# cuatro veces, Grupo Tepuy tres—, así que una casilla vacía significa «no
# consta», no «el mismo de arriba». Son 26 torres con residente de 46.

s = sustituir(s,
 """const EMPRESA_RESIDENTE = {"ALNAVIC, C.A.": "ING. ANTONIO CUICAS", "AROA, C.A.": "", "BELZARUBEZHSTORY, S.A.": "ING. FELIX PINTO", "CIVIKA PRO, C.A.": "", "CONSTRUCTORA 5010, C.A.": "ING. JOSE MARTINEZ", "CONSTRUCTORA SB 86, C.A.": "ING. JULIO LUQUEZ", "CONSTRUCTORA VIALPA, C.A.": "ING. ADRIAN OLIVARES", "DRIJECAE, C.A.": "", "GRUPO TEPUY, C.A.": "", "ING & ARQ 1111, C.A.": "ING. JHOANNY LOPEZ", "JVR INGENIERÍA C,A.": "ING. JUAN COLMENARES / ARQ. EVER AVENDAÑO", "MASTER REFORMAS RR, C.A.": "ING. ERICK MARTINEZ", "PROCODIMA, C.A.": "ING. LEONARDO TORRES", "RACAR INGENIEROS, C.A.": "ING. GERARDO ARGARIN", "RÍO LIMÓN, C.A.": "ING. HARRY ARTEAGA", "THAISSA MM INVERSIONES, C.A.": "ING. MANUEL PAEZ", "TSURU, C.A.": "MILTON RODRIGUEZ", "ZERPA CONSTRUCCIONES, C.A.": "ING. IVAN MEDINA"};""",
 """const TORRES = [
  {t:'T-01',  c:'Convenio Bielorusos',   e:"RÍO LIMÓN, C.A.",               r:"ING HARRY ARTEAGA"},
  {t:'T-02',  c:'Convenio Bielorusos',   e:"RÍO LIMÓN, C.A.",               r:"ING MARIA T MARCANO"},
  {t:'T-03',  c:'Convenio Bielorusos',   e:"RÍO LIMÓN, C.A.",               r:""},
  {t:'T-04',  c:'Convenio Bielorusos',   e:"RÍO LIMÓN, C.A.",               r:""},
  {t:'T-05',  c:'Convenio Bielorusos',   e:"ALNAVIC, C.A.",                 r:"ING. ANTONIO CUICAS"},
  {t:'T-06',  c:'Convenio Bielorusos',   e:"ALNAVIC, C.A.",                 r:"ING JOSE V GONZALES"},
  {t:'T-07',  c:'Convenio Bielorusos',   e:"ALNAVIC, C.A.",                 r:""},
  {t:'T-08',  c:'Convenio Bielorusos',   e:"ALNAVIC, C.A.",                 r:""},
  {t:'T-09',  c:'Convenio Bielorusos',   e:"THAISSA MM INVERSIONES, C.A.",  r:"ING MANUEL PAEZ"},
  {t:'T-10',  c:'Convenio Bielorusos',   e:"THAISSA MM INVERSIONES, C.A.",  r:""},
  {t:'T-11',  c:'Convenio Bielorusos',   e:"THAISSA MM INVERSIONES, C.A.",  r:""},
  {t:'T-12',  c:'Convenio Bielorusos',   e:"THAISSA MM INVERSIONES, C.A.",  r:""},
  {t:'T-13',  c:'Convenio Bielorusos',   e:"PROCODIMA, C.A.",               r:"ING. LEONARDO TORRES"},
  {t:'T-14',  c:'Convenio Bielorusos',   e:"PROCODIMA, C.A.",               r:""},
  {t:'T-15',  c:'Convenio Bielorusos',   e:"PROCODIMA, C.A.",               r:""},
  {t:'T-16',  c:'Convenio Bielorusos',   e:"PROCODIMA, C.A.",               r:""},
  {t:'T-17',  c:'Convenio Bielorusos',   e:"BELZARUBEZHSTORY, S.A.",        r:"ING FELIX PINTO"},
  {t:'T-18',  c:'Convenio Bielorusos',   e:"BELZARUBEZHSTORY, S.A.",        r:""},
  {t:'T-19',  c:'Convenio Bielorusos',   e:"BELZARUBEZHSTORY, S.A.",        r:""},
  {t:'T-45',  c:'Convenio Bielorusos',   e:"BELZARUBEZHSTORY, S.A.",        r:""},
  {t:'T-46',  c:'Convenio Bielorusos',   e:"BELZARUBEZHSTORY, S.A.",        r:""},
  {t:'T-47',  c:'Convenio Bielorusos',   e:"BELZARUBEZHSTORY, S.A.",        r:""},
  {t:'T-48',  c:'Convenio Bielorusos',   e:"BELZARUBEZHSTORY, S.A.",        r:""},
  {t:'T-49',  c:'Convenio Bielorusos',   e:"DRIJECAE, C.A.",                r:"ARQ. MARIANO RIVAS"},
  {t:'T-50',  c:'Convenio Bielorusos',   e:"DRIJECAE, C.A.",                r:"ARQ. MARIANO RIVAS"},
  {t:'T-51',  c:'Convenio Bielorusos',   e:"DRIJECAE, C.A.",                r:"ARQ. MARIANO RIVAS"},
  {t:'T-52',  c:'Convenio Bielorusos',   e:"DRIJECAE, C.A.",                r:"ARQ. MARIANO RIVAS"},
  {t:'T-53',  c:'Convenio Bielorusos',   e:"CIVIKA PRO, C.A.",              r:"ING. ANDREA LEON"},
  {t:'T-54',  c:'Convenio Bielorusos',   e:"CIVIKA PRO, C.A.",              r:"ING.ASTRID LARES"},
  {t:'T-55',  c:'Convenio Bielorusos',   e:"CIVIKA PRO, C.A.",              r:""},
  {t:'T-56',  c:'Convenio Bielorusos',   e:"GRUPO TEPUY, C.A.",             r:"ING. JIMMY CASIOPO"},
  {t:'T-57',  c:'Convenio Bielorusos',   e:"GRUPO TEPUY, C.A.",             r:"ING. JIMMY CASIOPO"},
  {t:'T-58',  c:'Convenio Bielorusos',   e:"GRUPO TEPUY, C.A.",             r:"ING. JIMMY CASIOPO"},
  {t:'T-04',  c:'Convenio Rusos',        e:"AROA, C.A.",                    r:""},
  {t:'T-07',  c:'Convenio Rusos',        e:"TSURU, C.A.",                   r:"MILTON RODRIGUEZ"},
  {t:'T-12',  c:'Convenio Rusos',        e:"ZERPA CONSTRUCCIONES, C.A.",    r:"ING. IVAN MEDINA"},
  {t:'T-13',  c:'Convenio Rusos',        e:"MASTER REFORMAS RR, C.A.",      r:"ING. ERICK MARTINEZ"},
  {t:'T-38',  c:'Convenio Rusos',        e:"CONSTRUCTORA 5010, C.A.",       r:"ING. JOSE MARTINEZ"},
  {t:'T-39',  c:'Convenio Rusos',        e:"JVR INGENIERÍA C,A.",           r:"ING. JUAN COLMENARES ARQ EVER AVENDAÑO"},
  {t:'D-08',  c:'Convenio Chinos',       e:"CONSTRUCTORA VIALPA, C.A.",     r:"ING ADRIAN OLIVARES"},
  {t:'J-07',  c:'Convenio Chinos',       e:"ING & ARQ 1111, C.A.",          r:"ING. JOANNY TAPIA / ING. JHOANNY LOPEZ"},
  {t:'J-08',  c:'Convenio Chinos',       e:"CONSTRUCTORA SB 86, C.A.",      r:"ING. JULIO LUQUEZ"},
  {t:'J-09',  c:'Convenio Chinos',       e:"RACAR INGENIEROS, C.A.",        r:"ING. GERARDO ARGARIN"},
  {t:'J-10',  c:'Convenio Chinos',       e:"RACAR INGENIEROS, C.A.",        r:""},
  {t:'J-11',  c:'Convenio Chinos',       e:"RACAR INGENIEROS, C.A.",        r:"ING.RADAMEZ RIVAS"},
  {t:'J-12',  c:'Convenio Chinos',       e:"RACAR INGENIEROS, C.A.",        r:""},
];""",
 "92a\u00b7 la tabla de torres del cuadro del 28-ago, con su empresa y su residente")

# CONVENIO_DATA se deriva de TORRES en vez de escribirse aparte: así no pueden
# volver a discrepar entre sí, que es exactamente lo que pasaba.
s = sustituir(s,
 """const CONVENIO_DATA = {"Convenio Bielorusos": {"empresas": {"ALNAVIC, C.A.": "ING. ANTONIO CUICAS", "BELZARUBEZHSTORY, S.A.": "ING. FELIX PINTO", "CIVIKA PRO, C.A.": "", "DRIJECAE, C.A.": "", "GRUPO TEPUY, C.A.": "", "PROCODIMA, C.A.": "ING. LEONARDO TORRES", "RÍO LIMÓN, C.A.": "ING. HARRY ARTEAGA", "THAISSA MM INVERSIONES, C.A.": "ING. MANUEL PAEZ"}, "torres": ["T-17", "T-18", "T-19", "T-45", "T-46", "T-47", "T-48", "T-49", "T-5", "T-50", "T-51", "T-52", "T-53", "T-54", "T-55", "T-56", "T-57", "T-58", "T-6", "T-7", "T-8"]}, "Convenio Rusos": {"empresas": {"AROA, C.A.": "", "CONSTRUCTORA 5010, C.A.": "ING. JOSE MARTINEZ", "JVR INGENIERÍA C,A.": "ING. JUAN COLMENARES / ARQ. EVER AVENDAÑO", "MASTER REFORMAS RR, C.A.": "ING. ERICK MARTINEZ", "TSURU, C.A.": "MILTON RODRIGUEZ", "ZERPA CONSTRUCCIONES, C.A.": "ING. IVAN MEDINA"}, "torres": ["T-01", "T-02", "T-03", "T-04", "T-07", "T-09", "T-10", "T-11", "T-12", "T-13", "T-14", "T-15", "T-16", "T-38", "T-39"]}, "Convenio Chinos": {"empresas": {"CONSTRUCTORA SB 86, C.A.": "ING. JULIO LUQUEZ", "CONSTRUCTORA VIALPA, C.A.": "ING. ADRIAN OLIVARES", "ING & ARQ 1111, C.A.": "ING. JHOANNY LOPEZ", "RACAR INGENIEROS, C.A.": "ING. GERARDO ARGARIN"}, "torres": ["D-08", "J-07", "J-08", "J-09", "J-10", "J-11", "J-12", "T-04"]}};""",
 """const CONVENIO_DATA = (function(){
  const d = {};
  TORRES.forEach(function(x){
    if(!d[x.c]) d[x.c] = { empresas: {}, torres: [] };
    d[x.c].empresas[x.e] = '';
    if(d[x.c].torres.indexOf(x.t) < 0) d[x.c].torres.push(x.t);
  });
  Object.keys(d).forEach(function(c){ d[c].torres.sort(); });
  return d;
})();""",
 "92b\u00b7 el desplegable se deriva de la tabla, y no puede discrepar de ella")

s = sustituir(s,
 """function autoResidenteConv() {
  const conv  = document.getElementById('convenio').value;
  const emp   = document.getElementById('empresa').value;
  let res = '';
  if (conv && CONVENIO_DATA[conv] && emp) res = CONVENIO_DATA[conv].empresas[emp] || '';
  if (!res && emp) {
    Object.values(CONVENIO_DATA).forEach(cd => { if(!res && cd.empresas && cd.empresas[emp] !== undefined) res = cd.empresas[emp] || ''; });
  }
  if (!res && emp) res = EMPRESA_RESIDENTE[emp] || '';

  const container = document.getElementById('residentes-container');
  if (container.children.length === 0 || (container.children.length === 1 && container.querySelector('input').value === '')) {
    container.innerHTML = '';
    if (res) {
      res.split('/').forEach(rName => addResidenteField(rName.trim()));
    } else {
      addResidenteField('');
    }
  }
}
""",
 """// El residente lo fija la TORRE. Ver el cambio 92 para el porqué.
// Nunca pisa lo que haya escrito una persona: solo sustituye lo que puso el
// propio formulario, de modo que cambiar de torre actualiza el nombre pero
// escribirlo a mano lo deja quieto.
let _residenteAuto = '';

function residenteDeTorre(conv, torre){
  for (let i = 0; i < TORRES.length; i++){
    if (TORRES[i].t === torre && (!conv || TORRES[i].c === conv)) return TORRES[i].r || '';
  }
  return '';
}

function empresaDeTorre(conv, torre){
  for (let i = 0; i < TORRES.length; i++){
    if (TORRES[i].t === torre && (!conv || TORRES[i].c === conv)) return TORRES[i].e || '';
  }
  return '';
}

function autoResidenteConv() {
  const conv = document.getElementById('convenio').value;
  const tor  = document.getElementById('torre').value;
  const res  = residenteDeTorre(conv, tor);

  const cont = document.getElementById('residentes-container');
  if (!cont) return;
  const escritos = Array.prototype.slice.call(cont.querySelectorAll('.residente-input'))
    .map(function(i){ return i.value.trim(); }).filter(Boolean);
  if (escritos.length && escritos.join(' / ') !== _residenteAuto) return;

  cont.innerHTML = '';
  if (res) res.split('/').forEach(function(r){ addResidenteField(r.trim()); });
  else addResidenteField('');
  _residenteAuto = res ? res.split('/').map(function(r){ return r.trim(); }).join(' / ') : '';
}
""",
 "92c\u00b7 el residente lo fija la torre, y no pisa lo escrito a mano")

s = sustituir(s,
 """function handleTorreChange() {
  const val  = document.getElementById('torre').value;
  const wrap = document.getElementById('torre-manual-wrap');
  if (wrap) {
    wrap.style.display = (val === 'NO_REG') ? 'block' : 'none';
    if (val === 'NO_REG') setTimeout(() => document.getElementById('torre-manual')?.focus(), 50);
  }
  updateNroInforme();
  renderMemoriaTable();
}
""",
 """function handleTorreChange() {
  const val  = document.getElementById('torre').value;
  const wrap = document.getElementById('torre-manual-wrap');
  if (wrap) {
    wrap.style.display = (val === 'NO_REG') ? 'block' : 'none';
    if (val === 'NO_REG') setTimeout(() => document.getElementById('torre-manual')?.focus(), 50);
  }
  // La empresa la determina la torre, no al revés: antes el inspector de la
  // Torre 01 no tenía a Río Limón en la lista porque la torre estaba en otro
  // convenio. Se preselecciona la que asigna el cuadro y se puede cambiar, por
  // si en obra la ejecuta otra.
  const conv   = document.getElementById('convenio').value;
  const emp    = empresaDeTorre(conv, val);
  const empSel = document.getElementById('empresa');
  if (emp && empSel && Array.prototype.slice.call(empSel.options).some(function(o){ return o.value === emp; })) {
    empSel.value = emp;
  }
  autoResidenteConv();
  updateNroInforme();
  renderMemoriaTable();
}
""",
 "92d\u00b7 elegir torre preselecciona su empresa y trae su residente")

# ── 93. Dos pérdidas silenciosas de datos que salieron del QC ──────────────
# Las dos se descubrieron ejecutando, y las dos pierden información SIN AVISAR,
# que es lo peor que puede hacer un instrumento que produce un documento firmado.
#
# 93a · UN NOMBRE CON COMILLAS SE TRUNCA. Los campos de residente e inspector
#   se componen con innerHTML e interpolan el valor dentro de value="...". Un
#   nombre como  ING. JOSE "EL CATIRE" PEREZ  cierra el atributo en la primera
#   comilla: el campo se queda en «ING. JOSE» y el resto se convierte en
#   atributos sueltos del input. Medido: el apóstrofo, el < y el & pasan
#   intactos; solo la comilla doble rompe. El apodo entre comillas no es raro
#   en obra. Se asigna por PROPIEDAD en vez de por atributo, que además elimina
#   de raíz la inyección de atributos.
#
# 93b · EL IDENTIFICADOR NO TIENE TOPE. Con «torre no registrada» el nombre lo
#   escribe el inspector y entra entero en el número del informe: 300
#   caracteres dan un identificador de 320, y la validación lo deja pasar. Ese
#   número es el nombre del archivo en Drive, cuyo tope son 255. Se acota a 12
#   caracteres, que deja el identificador completo en 34.

s = sustituir(s,
 """  row.innerHTML = `
    <input type="text" class="residente-input" placeholder="Nombre y credencial del residente..." value="${val}">
    <button type="button" class="btn-remove-item" onclick="this.parentElement.remove()">✕</button>
  `;
  container.appendChild(row);""",
 """  row.innerHTML = `
    <input type="text" class="residente-input" placeholder="Nombre y credencial del residente...">
    <button type="button" class="btn-remove-item" onclick="this.parentElement.remove()">✕</button>
  `;
  // Por propiedad, no dentro del atributo: un nombre con comillas —un apodo en
  // obra— cerraba el value y se perdía a la mitad, sin avisar.
  row.querySelector('.residente-input').value = val;
  container.appendChild(row);""",
 "93a· un residente con comillas ya no se trunca")

s = sustituir(s,
 """    <input type="text" class="inspector-manual" placeholder="Nombre y CIV..." value="${isCustom && selectedVal ? selectedVal : ''}" style="${isCustom && selectedVal ? '' : 'display:none;'} margin-top:2px">
    <button type="button" class="btn-remove-item" onclick="this.parentElement.remove()">✕</button>
  `;
  container.appendChild(row);""",
 """    <input type="text" class="inspector-manual" placeholder="Nombre y CIV..." style="${isCustom && selectedVal ? '' : 'display:none;'} margin-top:2px">
    <button type="button" class="btn-remove-item" onclick="this.parentElement.remove()">✕</button>
  `;
  // Lo mismo que en el residente: por propiedad.
  row.querySelector('.inspector-manual').value = (isCustom && selectedVal) ? selectedVal : '';
  container.appendChild(row);""",
 "93b· lo mismo para el inspector escrito a mano")

s = sustituir(s,
 """  const m = String(t || '').trim().toUpperCase().match(/^([A-Z]+)[\\s-]*0*(\\d+)$/);
  return m ? m[1] + String(m[2]).padStart(2, '0') : (_limpiar(t) || 'T--');""",
 """  const m = String(t || '').trim().toUpperCase().match(/^([A-Z]+)[\\s-]*0*(\\d+)$/);
  // El nombre escrito a mano se acota: entra en el identificador, y el
  // identificador es el nombre del archivo en Drive, que tiene tope de 255.
  return m ? m[1] + String(m[2]).padStart(2, '0') : (_limpiar(t).slice(0, 12) || 'T--');""",
 "93c· el identificador deja de crecer sin tope")

# ── 94. Tres arreglos pedidos tras revisar el instrumento ──────────────────
#
# 94a · EL ESTATUS SE ORDENA POR EL CICLO DE LA OBRA, y se retira «Pendiente».
#   Estaba en orden arbitrario —En progreso, Iniciada, Finalizada, Pendiente,
#   Paralizada—, que obliga a leer las cinco cada vez. Pasa a seguir la vida de
#   la obra: Iniciada → En progreso → Finalizada, y Paralizada aparte, porque
#   es una interrupción, no una etapa. «Pendiente» se quita: no se distinguía
#   de «Iniciada» sin definirlo, y una etiqueta que dos inspectores entienden
#   distinto ensucia todo lo que se consolide después.
#
# 94b · EL MODO DE PRUEBA DEJA DE ESTAR EN LA BARRA. Estaba junto a «Enviar»,
#   y marca los informes con el prefijo PRUEBA-. Un toque por error en obra
#   produce un informe que parece bueno y no lo es. Pasa a pedirse por enlace
#   —`?prueba=1`—, igual que el modo por hitos: quien lo necesita lo abre así,
#   y en el teléfono del inspector no existe.
#
# 94c · EL IDENTIFICADOR NO REPITE «TORRE». `SR-T12-TORRE-260828-CF` dice dos
#   veces lo mismo: la T-12 ya está en el segundo bloque. El informe de torre
#   pasa a `SR-T12-260828-CF`, y sigue siendo inequívoco: si lleva bloque de
#   piso y apartamento es de una vivienda, y si no, es de la torre entera.
#   Comprobado que el relevo NO lee «TORRE» del número: archiva con los campos
#   `sector` y `torre` que van aparte, y usa el número solo como nombre de
#   archivo. Todavía no se ha enviado ningún informe real, así que no deja
#   ninguna serie a medias. Modifica el esquema de ADR-0016, que es provisional.

s = sustituir(s,
 """        <label class="ck-lbl" onclick="toggleCk(this,true)"><input type="checkbox" value="En progreso">En progreso</label>
        <label class="ck-lbl" onclick="toggleCk(this,true)"><input type="checkbox" value="Iniciada">Iniciada</label>
        <label class="ck-lbl" onclick="toggleCk(this,true)"><input type="checkbox" value="Finalizada">Finalizada</label>
        <label class="ck-lbl" onclick="toggleCk(this,true)"><input type="checkbox" value="Pendiente">Pendiente</label>
        <label class="ck-lbl" onclick="toggleCk(this,true)"><input type="checkbox" value="Paralizada">Paralizada</label>""",
 """        <label class="ck-lbl" onclick="toggleCk(this,true)"><input type="checkbox" value="Iniciada">Iniciada</label>
        <label class="ck-lbl" onclick="toggleCk(this,true)"><input type="checkbox" value="En progreso">En progreso</label>
        <label class="ck-lbl" onclick="toggleCk(this,true)"><input type="checkbox" value="Finalizada">Finalizada</label>
        <label class="ck-lbl" onclick="toggleCk(this,true)"><input type="checkbox" value="Paralizada">Paralizada</label>""",
 "94a· el estatus sigue el ciclo de la obra, y sin «Pendiente»")

s = sustituir(s,
 """      <button class="hbtn hbtn-test" id="btn-test" onclick="toggleTestMode()" title="Activar modo de prueba — los informes quedan marcados como PRUEBA">🧪 <span>Prueba</span></button>""",
 """      <button class="hbtn hbtn-test" id="btn-test" onclick="toggleTestMode()" style="display:none" title="Activar modo de prueba — los informes quedan marcados como PRUEBA">🧪 <span>Prueba</span></button>""",
 "94b· el botón de prueba nace oculto")

s = sustituir(s,
 "  startApp(modo === 'hitos' ? 'hitos' : 'detallado');",
 "  // El modo de prueba se pide por enlace, no con un botón al lado de «Enviar».\n"
 "  if (new URLSearchParams(location.search).get('prueba') === '1') {\n"
 "    const bt = document.getElementById('btn-test');\n"
 "    if (bt) bt.style.display = '';\n"
 "  }\n"
 "  startApp(modo === 'hitos' ? 'hitos' : 'detallado');",
 "94b2· solo aparece con ?prueba=1")

s = sustituir(s,
 "  const bloque = (ambito === 'torre') ? 'TORRE' : ('P' + piso + 'A' + apto);\n"
 "  const nro    = (TEST_MODE ? 'PRUEBA-' : '') +\n"
 "                 [sector, torre, bloque, fecha, inic].join('-');",
 "  // En el informe de torre no se repite «TORRE»: la torre ya está en el\n"
 "  // bloque anterior. Sigue siendo inequívoco — con bloque de piso y\n"
 "  // apartamento es de una vivienda; sin él, de la torre entera.\n"
 "  const bloque = (ambito === 'torre') ? null : ('P' + piso + 'A' + apto);\n"
 "  const nro    = (TEST_MODE ? 'PRUEBA-' : '') +\n"
 "                 [sector, torre, bloque, fecha, inic].filter(Boolean).join('-');",
 "94c· el identificador de torre deja de repetir TORRE")

# ── 94d. «Hito no inspeccionado» también en el modo de campo ───────────────
# El control existía, la función existía, y el promedio y el PDF ya lo
# respetaban — pero el botón SOLO estaba dibujado en la rama del modo por
# hitos, que es el que nadie usa. En el modo detallado, que es el de campo, no
# había forma de marcar un hito entero como no inspeccionado desde la pantalla.
#
# Se lleva el mismo control a la cabecera del hito en la rama detallada. Y se
# le pone TEXTO además del símbolo: el ⊘ solo se explicaba con un `title`, y
# un `title` no existe en una pantalla táctil — no hay puntero que reposar—,
# así que en el teléfono era un símbolo sin explicación.
s = sustituir(s,
 """      d.innerHTML=`
        <div class="p-hdr" style="background:${colorHito(p)}" onclick="toggleP('${p.id}')">
          <div class="p-hdr-l"><h2>${p.nombre}</h2></div>
          <div style="display:flex;align-items:center;gap:9px">
            <div class="pct-bdg" id="badge_${p.id}">—</div>
            <span class="arrow">▼</span>
          </div>
        </div>""",
 """      d.innerHTML=`
        <div class="p-hdr" style="background:${colorHito(p)}" onclick="toggleP('${p.id}')">
          <div class="p-hdr-l"><h2>${p.nombre}</h2></div>
          <div style="display:flex;align-items:center;gap:9px">
            <span class="no-insp-tgl" id="noinsp_${p.id}"
                  onclick="event.stopPropagation();toggleNoInspeccionado('${p.id}')"
                  title="Marcar el hito completo como no inspeccionado en esta visita">⊘ No inspeccionado</span>
            <div class="pct-bdg" id="badge_${p.id}">—</div>
            <span class="arrow">▼</span>
          </div>
        </div>""",
 "94d· el hito completo se puede marcar no inspeccionado en el modo de campo")

# El control llevaba tamaño de símbolo suelto. Con texto necesita caja propia,
# y 44 px de alto como el resto de lo que se toca con guantes.
s = sustituir(s,
 ".no-insp-tgl{",
 ".no-insp-tgl{min-height:44px;display:inline-flex;align-items:center;gap:4px;"
 "padding:0 10px;border-radius:14px;font-size:11px;font-weight:700;white-space:nowrap;",
 "94e· el control se puede tocar con guantes y dice lo que hace")

# ── 95. Cambiar la empresa dejaba al informe contradiciéndose ──────────────
# Defecto introducido por el cambio 92 y encontrado usando el formulario: al
# mover el residente de la empresa a la TORRE, la empresa quedó editable por
# libre y su `onchange` siguió apuntando a `autoResidenteConv()`, que ya no la
# mira. Resultado: se elegía la T-01, entraban Río Limón y Harry Arteaga, se
# cambiaba la empresa a Alnavic… y el residente seguía siendo el de Río Limón.
# El informe salía con torre de una contratista, empresa de otra y residente de
# una tercera, sin avisar de nada.
#
# Qué se hace y por qué NO se rellena con otro nombre: el cuadro del 28-ago da
# el residente por torre bajo la contratista que tiene asignada. Si el
# inspector dice que la ejecuta otra empresa, **no existe dato** de quién es el
# residente en ese caso —Alnavic tiene residentes en la T-05 y la T-06, y
# ninguno es «el de Alnavic en la T-01»—. Inventarlo sería exactamente lo que
# este instrumento no debe hacer. Así que se limpia y se dice por qué, para
# que lo escriba quien esté en obra.
#
# La discrepancia no es un error del inspector: el maestro mismo marca
# «POSIBLE REASIGNACIÓN» en las torres 45 a 48, y PA-33 pregunta justo por esa
# doble capa. Por eso se avisa en vez de impedirlo.

s = sustituir(s,
 """      <label>Empresa ejecutora *</label>
      <select id="empresa" onchange="autoResidenteConv()">""",
 """      <label>Empresa ejecutora *</label>
      <span id="aviso-empresa" style="display:none;font-size:11.5px;font-weight:600;color:#8f4b00;margin-bottom:4px"></span>
      <select id="empresa" onchange="handleEmpresaChange()">""",
 "95a· sitio para el aviso, y la empresa llama a su propia función")

s = sustituir(s,
 """function handleTorreChange() {""",
 """// Cambiar la empresa a una que no es la que el cuadro asigna a esta torre es
// legítimo —el maestro mismo prevé reasignaciones—, pero entonces no sabemos
// quién es el residente: se limpia y se dice, en vez de dejar el de antes.
function handleEmpresaChange(){
  const conv   = document.getElementById('convenio').value;
  const tor    = document.getElementById('torre').value;
  const emp    = document.getElementById('empresa').value;
  const propia = (tor && tor !== 'NO_REG') ? empresaDeTorre(conv, tor) : '';
  const aviso  = document.getElementById('aviso-empresa');

  if (!propia || !emp || emp === propia) {
    if (aviso) { aviso.style.display = 'none'; aviso.textContent = ''; }
    autoResidenteConv();
  } else {
    if (aviso) {
      aviso.style.display = 'block';
      // El nombre de la empresa ya termina en punto («C.A.»): no se le pega otro.
      aviso.textContent = ('⚠️ Según el cuadro, la ' + tor + ' la ejecuta ' + propia).replace(/\.$/, '') +
        '. Escriba el ingeniero residente que encontró en obra.';
    }
    // Solo se borra lo que puso el formulario; lo escrito a mano se respeta.
    const cont = document.getElementById('residentes-container');
    if (cont) {
      const puestos = Array.prototype.slice.call(cont.querySelectorAll('.residente-input'))
        .map(function(i){ return i.value.trim(); }).filter(Boolean);
      if (!puestos.length || puestos.join(' / ') === _residenteAuto) {
        cont.innerHTML = '';
        addResidenteField('');
        _residenteAuto = '';
      }
    }
  }
  updateNroInforme();
}

function handleTorreChange() {""",
 "95b· si la empresa no es la de la torre, se limpia el residente y se avisa")

# Al cambiar de torre el aviso puede quedar colgado de la torre anterior.
s = sustituir(s,
 "  autoResidenteConv();\n"
 "  updateNroInforme();\n"
 "  renderMemoriaTable();\n"
 "}",
 "  autoResidenteConv();\n"
 "  const av = document.getElementById('aviso-empresa');\n"
 "  if (av) { av.style.display = 'none'; av.textContent = ''; }\n"
 "  updateNroInforme();\n"
 "  renderMemoriaTable();\n"
 "}",
 "95c· el aviso no se queda colgado al cambiar de torre")

# ── 96. El rol se elige antes de ver el formulario ─────────────────────────
# El cambio 42 retiró la portada original porque «pedía un toque para no
# decidir nada»: sus cuatro tarjetas eran <div> inertes. Esta sí decide algo, y
# es lo que la barra de modo no lograba: hasta ahora el rol era un par de
# botones en la cabecera, sin estado evidente y a un toque accidental de
# cambiar en mitad de una inspección.
#
# Ahora se elige al abrir, con las dos opciones explicadas, y la barra de modo
# deja de tener botones: pasa a ser un rótulo de lo que se eligió, con un
# «cambiar» explícito que vuelve a abrir la pantalla. Cambiar de rol NO redibuja
# los hitos —solo muestra u oculta la columna de cantidad proyectada—, así que
# hacerlo a mitad de un informe no pierde nada de lo ya escrito.
#
# Se recuerda la última elección en ese teléfono para dejarla resaltada: sigue
# haciendo falta un toque, que es lo pedido, pero no hay que pensarlo dos veces.
# Se reutiliza el id `welcome-screen` porque conserva su CSS y, sobre todo, la
# regla de impresión que lo mantiene fuera del PDF.

s = sustituir(s,
 """<div id="mode-bar" style="background:#fff;padding:10px 22px;display:flex;align-items:center;gap:12px;border-bottom:3px solid var(--blue-l);flex-wrap:wrap">
  <span style="font-size:11px;font-weight:800;color:#555;text-transform:uppercase;letter-spacing:.5px">Modo:</span>
  <button id="btnInspector" onclick="setModeUI('inspector')" style="padding:6px 15px;border:2px solid #e65100;border-radius:20px;font-size:12px;font-weight:700;cursor:pointer;background:#a63d00;color:#fff">👷 Inspector</button>
  <button id="btnPlanif" onclick="setModeUI('planificacion')" style="padding:6px 15px;border:2px solid #e0e0e0;border-radius:20px;font-size:12px;font-weight:700;cursor:pointer;background:#f5f5f5;color:#666">📊 Gerencia de Planificación</button>
  <span id="mode-badge" style="padding:3px 12px;border-radius:12px;font-size:11px;font-weight:700;background:#fff3e0;color:#8f4b00;border:1px solid #e6a860">Inspector: ingresa cantidades ejecutadas · Proyectada solo la ve Planificación</span>
</div>""",
 """<div id="welcome-screen">
  <div class="welcome-card">
    <div style="font-size:12px;font-weight:800;letter-spacing:1.4px;opacity:.75;margin-bottom:6px">CONSTRUCTORA GARMEL, C.A.</div>
    <div style="font-size:21px;font-weight:800;margin-bottom:26px">Informe de Inspección Técnica</div>
    <div style="font-size:14px;font-weight:700;margin-bottom:16px">¿Con qué rol va a llenar el informe?</div>

    <button id="rol-inspector" onclick="elegirRol('inspector')" style="width:100%;min-height:44px;text-align:left;padding:15px 18px;margin-bottom:12px;border-radius:13px;border:2px solid rgba(255,255,255,.35);background:rgba(255,255,255,.10);color:#fff;cursor:pointer">
      <div style="font-size:16px;font-weight:800">👷 Inspector</div>
      <div style="font-size:12.5px;opacity:.85;margin-top:4px;line-height:1.45">Registra en obra la <b>cantidad ejecutada</b> de cada subpartida. No ve la cantidad proyectada.</div>
    </button>

    <button id="rol-planificacion" onclick="elegirRol('planificacion')" style="width:100%;min-height:44px;text-align:left;padding:15px 18px;border-radius:13px;border:2px solid rgba(255,255,255,.35);background:rgba(255,255,255,.10);color:#fff;cursor:pointer">
      <div style="font-size:16px;font-weight:800">📊 Gerencia de Planificación</div>
      <div style="font-size:12.5px;opacity:.85;margin-top:4px;line-height:1.45">Además ve y carga la <b>cantidad proyectada</b>, que es la meta contra la que se calcula el avance.</div>
    </button>

    <div id="rol-recordado" style="font-size:11.5px;opacity:.7;margin-top:18px"></div>
  </div>
</div>
<div id="mode-bar" style="background:#fff;padding:10px 22px;display:flex;align-items:center;gap:10px;border-bottom:3px solid var(--blue-l);flex-wrap:wrap">
  <span id="mode-badge" style="padding:4px 12px;border-radius:12px;font-size:11.5px;font-weight:700;background:#fff3e0;color:#8f4b00;border:1px solid #e6a860"></span>
  <button id="btn-cambiar-rol" onclick="abrirEleccionDeRol()" style="min-height:44px;padding:4px 12px;border:1.5px solid #c9cdd6;border-radius:16px;font-size:11.5px;font-weight:700;cursor:pointer;background:#fff;color:#37474f">Cambiar</button>
</div>""",
 "96a· pantalla de elección de rol, y la barra deja de tener botones de modo")

# setModeUI pintaba dos botones que ya no existen. Se queda con el rótulo.
s = sustituir(s,
 "  const bi = document.getElementById('btnInspector');\n"
 "  const bp = document.getElementById('btnPlanif');\n"
 "  const badge = document.getElementById('mode-badge');",
 "  const badge = document.getElementById('mode-badge');",
 "96b· setModeUI ya no pinta los botones retirados")

s = sustituir(s,
 "  if (mode === 'inspector') {\n"
 "    if (bi) { bi.style.background = '#e65100'; bi.style.borderColor = '#e65100'; bi.style.color = '#fff'; }\n"
 "    if (bp) { bp.style.background = '#f5f5f5'; bp.style.borderColor = '#e0e0e0'; bp.style.color = '#666'; }\n"
 "    if (badge) {",
 "  if (mode === 'inspector') {\n"
 "    if (badge) {",
 "96c· lo mismo en la rama de inspector")

# La rama de planificación seguía pintando los dos botones retirados: sin esto,
# elegir «Gerencia de Planificación» reventaba con «bi is not defined» y dejaba
# la aplicación en blanco. Apareció al probar la pantalla nueva.
s = sustituir(s,
 "    if (bi) { bi.style.background = '#f5f5f5'; bi.style.borderColor = '#e0e0e0'; bi.style.color = '#666'; }\n"
 "    if (bp) { bp.style.background = 'var(--blue)'; bp.style.borderColor = 'var(--blue)'; bp.style.color = '#fff'; }\n"
 "    if (badge) {",
 "    if (badge) {",
 "96g\u00b7 la rama de planificaci\u00f3n tampoco pinta los botones retirados")

s = sustituir(s,
 "      badge.textContent = 'Planificación: acceso completo — cantidades proyectadas y métricas de avance';",
 "      badge.textContent = '📊 Gerencia de Planificación — carga la cantidad proyectada';",
 "96h· el rótulo de planificación, igual de corto")

s = sustituir(s,
 "      badge.textContent = 'Inspector: ingresa cantidades ejecutadas · Proyectada solo la ve Planificación';",
 "      badge.textContent = '👷 Inspector — registra la cantidad ejecutada';",
 "96d· el rótulo dice el rol, no una explicación larga")

s = sustituir(s,
 "function startApp(tipo = 'detallado') {",
 """// El rol se elige antes de ver nada, y se recuerda en este teléfono para
// dejarlo resaltado la próxima vez.
function abrirEleccionDeRol(){
  const w = document.getElementById('welcome-screen');
  if (!w) return;
  const previo = localStorage.getItem('garmel_rol') || '';
  const nota = document.getElementById('rol-recordado');
  [['inspector','rol-inspector'], ['planificacion','rol-planificacion']].forEach(function(par){
    const b = document.getElementById(par[1]);
    if (!b) return;
    const elegido = (par[0] === previo);
    b.style.background  = elegido ? 'rgba(255,255,255,.24)' : 'rgba(255,255,255,.10)';
    b.style.borderColor = elegido ? '#fff' : 'rgba(255,255,255,.35)';
  });
  if (nota) nota.textContent = previo
    ? 'La última vez se usó ' + (previo === 'inspector' ? 'Inspector' : 'Gerencia de Planificación') + '.'
    : '';
  w.classList.remove('hidden');
}

function elegirRol(rol){
  localStorage.setItem('garmel_rol', rol);
  const w = document.getElementById('welcome-screen');
  if (w) w.classList.add('hidden');
  // El orden importa: primero se dibujan los hitos, y después se aplica el rol,
  // que es lo que muestra u oculta la columna de cantidad proyectada.
  if (!_appArrancada) { startApp('detallado'); _appArrancada = true; }
  setModeUI(rol);
}
let _appArrancada = false;

function startApp(tipo = 'detallado') {""",
 "96e· elegir rol arranca la aplicación y aplica el modo")

s = sustituir(s,
 "  startApp(modo === 'hitos' ? 'hitos' : 'detallado');",
 "  // No se entra al formulario sin haber elegido rol.\n"
 "  if (modo === 'hitos') { startApp('hitos'); _appArrancada = true; setModeUI('inspector'); }\n"
 "  else { abrirEleccionDeRol(); }",
 "96f· al abrir se pide el rol antes que nada")

# ── 97. En el teléfono, el modo Inspector no ocultaba la cantidad proyectada
# `setModeUI` ocultaba la columna con un estilo EN LÍNEA (`display:none`). En
# pantalla estrecha la regla responsiva la vuelve a mostrar con
# `display:flex !important`, y un `!important` de hoja de estilos le gana a un
# estilo en línea sin `!important`. Medido: en 426 px de ancho el campo de
# cantidad proyectada mide 44 px de alto en los DOS modos.
#
# Es decir: justo en el dispositivo de campo, el inspector veía la cantidad
# proyectada —la meta— antes de medir. Que es exactamente lo que el rol
# promete evitar, y ahora que el rol se elige en una pantalla previa, la
# promesa tiene que cumplirse.
#
# Se cambia a una clase en el <body>, que compite en el mismo terreno.
s = sustituir(s,
 "  #aviso-ambito{display:none!important}\n",
 "  #aviso-ambito{display:none!important}\n"
 "}\n"
 "\n"
 "/* El rol Inspector oculta la cantidad proyectada. Va como clase y con\n"
 "   !important porque la disposición de teléfono fuerza `display:flex\n"
 "   !important` sobre estas celdas, y un estilo en línea no le gana. */\n"
 "body.ocultar-proyectada th.col-proyectada,\n"
 "body.ocultar-proyectada td.col-proyectada{display:none!important}\n"
 "\n"
 "@media print{\n",
 "97a· la columna se oculta con una clase, no con estilo en línea")

s = sustituir(s,
 "    document.querySelectorAll('th.col-proyectada, td.col-proyectada').forEach(el => el.style.display = 'none');",
 "    document.body.classList.add('ocultar-proyectada');\n"
 "    document.querySelectorAll('th.col-proyectada, td.col-proyectada').forEach(el => el.style.display = '');",
 "97b· inspector: se pone la clase")

s = sustituir(s,
 "    document.querySelectorAll('th.col-proyectada, td.col-proyectada').forEach(el => el.style.display = '');\n"
 "  }\n"
 "}",
 "    document.body.classList.remove('ocultar-proyectada');\n"
 "    document.querySelectorAll('th.col-proyectada, td.col-proyectada').forEach(el => el.style.display = '');\n"
 "  }\n"
 "}",
 "97c· planificación: se quita")

# ── 98. Coherencia de color, y hacer visible el botón de borrar ────────────
#
# 98a · BORRAR PARECÍA NO EXISTIR. El botón es un 🗑️ solo, sobre un fondo casi
#   blanco (#ffebee). Un emoji se pinta con sus propios colores y NO obedece al
#   `color` de la regla, así que a ese tamaño se leía como una casilla vacía —
#   hasta el punto de que al revisarlo se preguntó si se podía borrar—. Pasa a
#   llevar la palabra, borde rojo de verdad y 44 px de alto.
#
# 98b · EL VERDE GRITABA CUATRO VECES. Con tres informes guardados había cinco
#   botones verdes sólidos a la vez. El verde se queda como color de «enviar»,
#   pero en reposo va claro —fondo #e8f5e9, texto #1b5e20, borde verde— y se
#   pone sólido al pulsarlo. Se conserva sólido «Enviar todos los pendientes»,
#   que es la acción principal del cuadro: así queda un único foco verde en
#   pantalla en vez de cinco.
#
# 98c · LOS ÚLTIMOS NARANJAS PASAN A LA ESCALA DE AZULES. Quedaban dos sitios:
#   el selector de ámbito (#a63d00) y la insignia del rol (#fff3e0/#e6a860). Se
#   alinean con lo que ya usan el estatus y «Mis informes» —#1a237e sobre
#   blanco, y #e8eaf6 con borde #c5cae9—. El naranja se conserva SOLO donde
#   significa algo: la cantidad faltante.
#
# 98d · «(Detallado)» sale del nombre del informe guardado: es el estándar
#   desde ADR-0018, así que no distingue nada. Se conserva «(Hitos)», que sí.

s = sustituir(s,
 ".s-btn-del { background: #ffebee; color: var(--red); }",
 ".s-btn-del{background:#fdecea;color:#b71c1c;border:1.5px solid #e57373;min-height:44px;font-weight:700}\n"
 ".s-btn-del:hover,.s-btn-del:active{background:#c62828;color:#fff;border-color:#c62828}",
 "98a· el botón de borrar se ve y se puede tocar")

s = sustituir(s,
 '<button class="s-btn s-btn-del" onclick="deleteSavedReport(${index})">🗑️</button>',
 '<button class="s-btn s-btn-del" onclick="deleteSavedReport(${index})">🗑️ Borrar</button>',
 "98a2· y dice lo que hace, en vez de solo el icono")

s = sustituir(s,
 "  .s-btn-del{ flex:0 0 56px; margin-left:26px; }",
 "  .s-btn-del{ flex:0 0 auto; padding:8px 16px; margin-left:20px; }",
 "98a3· en el teléfono le cabe la palabra")

s = sustituir(s,
 ".hbtn-send{background:#2e7d32;color:#fff;border-color:#66bb6a}",
 "/* El verde queda como color de «enviar», pero en reposo va claro: con varios\n"
 "   informes guardados había cinco botones verdes sólidos compitiendo. */\n"
 ".hbtn-send{background:#e8f5e9;color:#1b5e20;border-color:#66bb6a}\n"
 ".hbtn-send:hover,.hbtn-send:active{background:#2e7d32;color:#fff;border-color:#2e7d32}",
 "98b· el «Enviar» de la cabecera, claro en reposo")

s = sustituir(s,
 ".s-btn-send { background: var(--green); color: #fff; }",
 ".s-btn-send{background:var(--green-l);color:#1b5e20;border:1.5px solid #66bb6a;font-weight:700}\n"
 ".s-btn-send:hover,.s-btn-send:active{background:var(--green);color:#fff;border-color:var(--green)}",
 "98b2· y el de cada informe de la lista")

s = sustituir(s,
 "  const on  = base + 'border:2px solid #a63d00;background:#a63d00;color:#fff';\n"
 "  const off = base + 'border:2px solid #c9cdd6;background:#fff;color:#37474f';",
 "  // Mismo azul que el estatus: una sola familia de color en todo el formulario.\n"
 "  const on  = base + 'border:2px solid var(--blue);background:var(--blue);color:#fff';\n"
 "  const off = base + 'border:2px solid #c5cae9;background:#fff;color:var(--blue)';",
 "98c· el selector de ámbito entra en la escala de azules")

s = sustituir(s,
 "      badge.style.background = '#fff3e0'; badge.style.color = '#8f4b00'; badge.style.borderColor = '#e6a860';",
 "      badge.style.background = 'var(--blue-l)'; badge.style.color = 'var(--blue)'; badge.style.borderColor = '#c5cae9';",
 "98c2· la insignia del rol, también")

s = sustituir(s,
 """<span id="mode-badge" style="padding:4px 12px;border-radius:12px;font-size:11.5px;font-weight:700;background:#fff3e0;color:#8f4b00;border:1px solid #e6a860"></span>""",
 """<span id="mode-badge" style="padding:4px 12px;border-radius:12px;font-size:11.5px;font-weight:700;background:var(--blue-l);color:var(--blue);border:1px solid #c5cae9"></span>""",
 "98c3· y su estado inicial")

s = sustituir(s,
 """<span class="saved-item-title">${_txt(item.nro || 'Sin Correlativo')} (${item.formType === 'hitos' ? 'Hitos' : 'Detallado'})</span>""",
 """<span class="saved-item-title">${_txt(item.nro || 'Sin Correlativo')}${item.formType === 'hitos' ? ' (Hitos)' : ''}</span>""",
 "98d· «(Detallado)» sale del nombre: es el estándar, no distingue nada")

# ── 99. El destello naranja del ámbito al cargar ───────────────────────────
# El botón «Apartamento» llevaba su estado activo escrito en el atributo style,
# en naranja. `setAmbito` lo repinta de azul al arrancar, pero entre el primer
# pintado y esa llamada se ve un destello del color viejo. Se corrige en el
# origen para que no exista ni un fotograma.
s = sustituir(s,
 'style="padding:10px 16px;border:2px solid #a63d00;border-radius:22px;font-size:13px;font-weight:700;cursor:pointer;min-height:44px;background:#a63d00;color:#fff">🚪 Apartamento</button>',
 'style="padding:10px 16px;border:2px solid var(--blue);border-radius:22px;font-size:13px;font-weight:700;cursor:pointer;min-height:44px;background:var(--blue);color:#fff">🚪 Apartamento</button>',
 "99· sin destello naranja al cargar")

# ── 100. «Cargar para Editar» se parte en tres líneas ──────────────────────
# En el teléfono la etiqueta se rompía en tres renglones y era lo que apretaba
# la fila de tres botones. «Editar» dice lo mismo: al lado están «Enviar» y
# «Borrar», y el verbo solo basta.
s = sustituir(s,
 '>📂 Cargar para Editar</button>',
 '>📂 Editar</button>',
 "100· «Editar», que cabe en una línea")

# ── 101. Abrir un borrador viejo dejaba el instrumento en el otro modo ─────
# Encontrado en QC. Un borrador guardado con la versión anterior lleva
# `formType: 'hitos'`, y `loadDraftData` lo aplica al instrumento entero. Hasta
# ahí es correcto: hay que verlo como se llenó. El problema es que NO VUELVE —
# ni «Informe en blanco» ni «Guardar y siguiente» restauran el modo—, así que
# el inspector abre un informe de agosto y **todo lo que llene el resto del día
# va en el modo por hitos**, que es el que ADR-0018 descartó por producir
# avance declarado en vez de verificado.
#
# Se recuerda el modo con el que se entró y se restaura al empezar un informe
# nuevo. Abrir el viejo sigue mostrándolo tal cual se llenó.
s = sustituir(s,
 "function startApp(tipo = 'detallado') {\n"
 "  formType = tipo;",
 "// El modo con el que se entró. Abrir un borrador de otra versión lo cambia\n"
 "// para poder verlo como se llenó, y al empezar uno nuevo se vuelve a este.\n"
 "let _modoDeSesion = 'detallado';\n"
 "\n"
 "function startApp(tipo = 'detallado') {\n"
 "  formType = tipo;\n"
 "  _modoDeSesion = tipo;",
 "101a· se recuerda el modo con el que se abrió")

s = sustituir(s,
 "function nuevoFormulario() {\n"
 "  if(!confirm('¿Desea iniciar un nuevo informe? Se limpiarán los campos actuales.')) return;\n"
 "  currentEditingIndex = null;",
 "function nuevoFormulario() {\n"
 "  if(!confirm('¿Desea iniciar un nuevo informe? Se limpiarán los campos actuales.')) return;\n"
 "  // Un informe nuevo vuelve siempre al modo de la sesión.\n"
 "  if (formType !== _modoDeSesion) { formType = _modoDeSesion; setupFormTypeUI(); }\n"
 "  currentEditingIndex = null;",
 "101b· «Informe en blanco» vuelve al modo de la sesión")

s = sustituir(s,
 "    currentEditingIndex = null;   // el siguiente informe no pisa al que acaba de cerrarse\n"
 "    _numeroDelBorrador = null;\n"
 "    hitosNoInspeccionados = {};",
 "    currentEditingIndex = null;   // el siguiente informe no pisa al que acaba de cerrarse\n"
 "    _numeroDelBorrador = null;\n"
 "    hitosNoInspeccionados = {};\n"
 "    if (formType !== _modoDeSesion) { formType = _modoDeSesion; setupFormTypeUI(); }",
 "101c· «Guardar y siguiente», igual")

# ── 102. Dos malos usos que producían un informe equivocado en silencio ────
#
# 102a · EL ÁMBITO RESUCITABA EL APARTAMENTO ANTERIOR. Al pasar a ámbito Torre,
#   piso y apartamento se guardan en `dataset.guardado` y se limpian; al volver
#   se devuelven. Correcto dentro de un informe. El problema es que ese guardado
#   NUNCA SE BORRA: después de «Guardar y siguiente», tocar «Torre completa» y
#   volver **rellena el apartamento del informe anterior**.
#
#   En obra: se termina el 7, se pulsa siguiente, se toca el ámbito por error y
#   vuelve el 7. Si nadie lo nota, el apartamento 8 se archiva con el número del
#   7 — mismo identificador, mismo nombre de archivo en Drive.
#
# 102b · CAMBIAR DE CONVENIO CONSERVABA LA EVALUACIÓN. Al cambiarlo se vacían
#   torre, empresa y residente —correcto, la lista de torres es otra—, pero las
#   cantidades medidas se quedan. El informe podía terminar con la cabecera de
#   un sector y las mediciones de una torre de otro. No se borra nada: se avisa
#   y se deja decidir, porque volver a medir un apartamento no es una opción.

s = sustituir(s,
 "    ['apto', 'obs_general', 'obs_sp'].forEach(function(id){\n"
 "      const el = document.getElementById(id);\n"
 "      if(el) el.value = '';\n"
 "    });",
 "    ['apto', 'obs_general', 'obs_sp'].forEach(function(id){\n"
 "      const el = document.getElementById(id);\n"
 "      if(el) el.value = '';\n"
 "    });\n"
 "    // Y el respaldo que guarda el selector de ámbito, o el apartamento del\n"
 "    // informe anterior reaparece al tocar «Torre completa» y volver.\n"
 "    ['piso','apto'].forEach(function(id){\n"
 "      const el = document.getElementById(id);\n"
 "      if(el) delete el.dataset.guardado;\n"
 "    });",
 "102a· «Guardar y siguiente» borra también el respaldo del ámbito")

s = sustituir(s,
 "  document.getElementById('piso').value = '';\n"
 "  document.getElementById('apto').value = '';",
 "  document.getElementById('piso').value = '';\n"
 "  document.getElementById('apto').value = '';\n"
 "  ['piso','apto'].forEach(function(id){\n"
 "    const el = document.getElementById(id);\n"
 "    if(el) delete el.dataset.guardado;\n"
 "  });",
 "102a2· «Informe en blanco», igual")

s = sustituir(s,
 '<select id="convenio" onchange="filtrarPorConvenio()">',
 '<select id="convenio" onchange="handleConvenioChange(this)">',
 "102b· el convenio pasa por su propia función")

s = sustituir(s,
 "function filtrarPorConvenio() {",
 """// Cambiar de convenio vacía torre, empresa y residente, pero NO las cantidades
// ya medidas: borrarlas sería tirar el trabajo de un apartamento. Se avisa,
// porque el informe quedaría con la cabecera de un sector y las mediciones de
// una torre de otro.
let _convenioPrevio = '';

function _hayEvaluacion(){
  if (typeof PARTIDAS === 'undefined') return false;
  return PARTIDAS.some(function(p){
    const b = document.getElementById('badge_' + p.id);
    return b && b.textContent.trim() !== '—';
  });
}

function handleConvenioChange(sel){
  const nuevo = sel.value;
  if (_convenioPrevio && nuevo && nuevo !== _convenioPrevio && _hayEvaluacion()) {
    const sigue = confirm('Este informe ya tiene subpartidas medidas.\\n\\n' +
      'Al cambiar de convenio se vacían torre, empresa y residente, pero las ' +
      'cantidades medidas se conservan: el informe quedaría con la cabecera de ' +
      '«' + nuevo + '» y mediciones tomadas en otra torre.\\n\\n' +
      '¿Cambiar de todos modos?');
    if (!sigue) { sel.value = _convenioPrevio; return; }
  }
  _convenioPrevio = nuevo;
  filtrarPorConvenio();
}

function filtrarPorConvenio() {""",
 "102b2· avisar antes de cambiar de convenio con mediciones hechas")

# ── 103. La marca de «enviado» estaba en el botón equivocado ───────────────
# Encontrado en QC, y son dos caras del mismo error de copiado.
#
# 103a · «📤 Enviar» NO marcaba el informe como enviado. `enviarAlRelevo`
#   guarda la clave, escribe «✅ Archivado en Drive» y cierra la ventana, pero
#   nunca llama a `_marcarComoEnviado`. El informe sigue contando como
#   pendiente: al final del día «Enviar todos los pendientes» lo manda otra vez
#   y el relevo lo archiva como `-r2`. Duplicado en Drive por cada informe que
#   se envíe de uno en uno.
#
# 103b · «🔑 Probar clave» SÍ marcaba. `probarClave` llamaba a
#   `_marcarComoEnviado(datos.nro)`, y `datos` ni siquiera existe en esa
#   función. Dos consecuencias:
#     · lanza `ReferenceError: datos is not defined`, que cae en el catch, así
#       que **con la clave correcta el botón dice que falló** — comprobado:
#       «❌ No se pudo comprobar: datos is not defined». La clave sí se guarda,
#       pero quien esté configurando teléfonos en la oficina creerá que no.
#     · y de haber funcionado habría sido peor: marcaría como enviado un
#       informe que nadie mandó, y «Enviar todos los pendientes» lo saltaría
#       para siempre. Ese informe se perdería sin que nadie se entere.
#
#   Probar la clave no tiene nada que ver con enviar un informe. Se retira.

s = sustituir(s,
 "      localStorage.setItem('garmel_clave_envio', clave);\n"
 "      refrescarEstadoClave();\n"
 "      _marcarComoEnviado(datos.nro);\n"
 "      logEl.textContent += '✅ Clave correcta. Este teléfono quedó configurado.';",
 "      localStorage.setItem('garmel_clave_envio', clave);\n"
 "      refrescarEstadoClave();\n"
 "      logEl.textContent += '✅ Clave correcta. Este teléfono quedó configurado.';",
 "103b· probar la clave deja de marcar informes como enviados")

s = sustituir(s,
 "      localStorage.setItem('garmel_clave_envio', clave);\n"
 "      refrescarEstadoClave();\n"
 "      logEl.textContent += '✅ Archivado en Drive\\n' + (res.archivos || []).join('\\n');",
 "      localStorage.setItem('garmel_clave_envio', clave);\n"
 "      refrescarEstadoClave();\n"
 "      // Sin esto el informe sigue contando como pendiente y «Enviar todos»\n"
 "      // lo manda otra vez: el relevo lo archivaría como -r2.\n"
 "      _marcarComoEnviado(datos.nro);\n"
 "      logEl.textContent += '✅ Archivado en Drive\\n' + (res.archivos || []).join('\\n');",
 "103a· enviar sí marca el informe como enviado")

# ── 103c. Foco visible al navegar con teclado ──────────────────────────────
# Los botones llevan `outline:none`, así que en el escritorio de oficina —donde
# se usa el rol de Planificación— no se ve dónde está el foco al tabular. Se
# devuelve solo para navegación por teclado: `:focus-visible` no se dispara al
# tocar la pantalla, así que en obra no cambia nada.
s = sustituir(s,
 "body.ocultar-proyectada th.col-proyectada,\n",
 "button:focus-visible,select:focus-visible,input:focus-visible,\n"
 "textarea:focus-visible,.ck-lbl:focus-visible,.ev-btn:focus-visible{\n"
 "  outline:3px solid #1565c0; outline-offset:2px;\n"
 "}\n"
 "\n"
 "body.ocultar-proyectada th.col-proyectada,\n",
 "103c· foco visible al navegar con teclado")

# ── 104. La empresa vuelve a sugerir residente cuando es inequívoco ────────
# El cambio 92 movió el residente de la empresa a la TORRE, porque el cuadro
# del 28-ago da nombres distintos para torres de una misma contratista. Correcto
# — pero se pasó de frenada: al elegir convenio y empresa dejó de aparecer nada,
# aunque en la mayoría de los casos el dato es inequívoco.
#
# Contado sobre la propia tabla, de las 18 empresas:
#   · 13 tienen UN SOLO residente conocido en todas sus torres  → se rellena
#   ·  4 tienen VARIOS —Alnavic, Civika Pro, Río Limón y RACAR— → hay que
#      elegir la torre, y se dice por qué
#   ·  1 no tiene ninguno —AROA—                                → queda en blanco
#
# La torre sigue mandando siempre que esté elegida: es el dato más específico.
# La empresa solo rellena cuando NO hay torre y no hay ambigüedad. Así se
# aprovecha todo lo que la fuente dice, y ni un dato más.

s = sustituir(s,
 "function empresaDeTorre(conv, torre){",
 """// Los residentes DISTINTOS que le constan a una empresa en todas sus torres.
function residentesDeEmpresa(conv, emp){
  const vistos = [];
  TORRES.forEach(function(x){
    if (x.c === conv && x.e === emp && x.r && vistos.indexOf(x.r) < 0) vistos.push(x.r);
  });
  return vistos;
}

// Qué residente corresponde con lo que hay elegido ahora mismo, y por qué.
// La torre manda; la empresa solo decide cuando no hay torre y el dato es
// inequívoco. Nunca se rellena con el de otra torre: eso sería inventar.
function _residenteQueToca(){
  const conv = document.getElementById('convenio').value;
  const tor  = document.getElementById('torre').value;
  const emp  = document.getElementById('empresa').value;

  if (tor && tor !== 'NO_REG') {
    const propia = empresaDeTorre(conv, tor);
    if (!emp || emp === propia) return { valor: residenteDeTorre(conv, tor), nota: '' };
    return { valor: '', nota: 'Según el cuadro, la ' + tor + ' la ejecuta ' +
      String(propia).replace(/\\.$/, '') + '. Escriba el ingeniero residente que encontró en obra.' };
  }
  if (emp && conv) {
    const lista = residentesDeEmpresa(conv, emp);
    if (lista.length === 1) return { valor: lista[0], nota: '' };
    if (lista.length > 1)  return { valor: '', nota: 'Esta empresa tiene ' + lista.length +
      ' ingenieros residentes según el cuadro. Elija la torre y se pondrá el que corresponde.' };
  }
  return { valor: '', nota: '' };
}

function empresaDeTorre(conv, torre){""",
 "104a· saber qué residente toca, y por qué")

s = sustituir(s,
 """function autoResidenteConv() {
  const conv = document.getElementById('convenio').value;
  const tor  = document.getElementById('torre').value;
  const res  = residenteDeTorre(conv, tor);

  const cont = document.getElementById('residentes-container');
  if (!cont) return;
  const escritos = Array.prototype.slice.call(cont.querySelectorAll('.residente-input'))
    .map(function(i){ return i.value.trim(); }).filter(Boolean);
  if (escritos.length && escritos.join(' / ') !== _residenteAuto) return;

  cont.innerHTML = '';
  if (res) res.split('/').forEach(function(r){ addResidenteField(r.trim()); });
  else addResidenteField('');
  _residenteAuto = res ? res.split('/').map(function(r){ return r.trim(); }).join(' / ') : '';
}""",
 """function autoResidenteConv() {
  const q = _residenteQueToca();
  const res = q.valor;

  const aviso = document.getElementById('aviso-empresa');
  if (aviso) {
    aviso.textContent = q.nota ? '⚠️ ' + q.nota : '';
    aviso.style.display = q.nota ? 'block' : 'none';
  }

  const cont = document.getElementById('residentes-container');
  if (!cont) return;
  const escritos = Array.prototype.slice.call(cont.querySelectorAll('.residente-input'))
    .map(function(i){ return i.value.trim(); }).filter(Boolean);
  if (escritos.length && escritos.join(' / ') !== _residenteAuto) return;

  cont.innerHTML = '';
  if (res) res.split('/').forEach(function(r){ addResidenteField(r.trim()); });
  else addResidenteField('');
  _residenteAuto = res ? res.split('/').map(function(r){ return r.trim(); }).join(' / ') : '';
}""",
 "104b· autoResidenteConv usa la regla completa y pinta su aviso")

# handleEmpresaChange se queda sin trabajo propio: todo vive en la regla.
s = sustituir(s,
 """function handleEmpresaChange(){
  const conv   = document.getElementById('convenio').value;
  const tor    = document.getElementById('torre').value;
  const emp    = document.getElementById('empresa').value;
  const propia = (tor && tor !== 'NO_REG') ? empresaDeTorre(conv, tor) : '';
  const aviso  = document.getElementById('aviso-empresa');

  if (!propia || !emp || emp === propia) {
    if (aviso) { aviso.style.display = 'none'; aviso.textContent = ''; }
    autoResidenteConv();
  } else {
    if (aviso) {
      aviso.style.display = 'block';
      // El nombre de la empresa ya termina en punto («C.A.»): no se le pega otro.
      aviso.textContent = ('⚠️ Según el cuadro, la ' + tor + ' la ejecuta ' + propia).replace(/\\.$/, '') +
        '. Escriba el ingeniero residente que encontró en obra.';
    }
    // Solo se borra lo que puso el formulario; lo escrito a mano se respeta.
    const cont = document.getElementById('residentes-container');
    if (cont) {
      const puestos = Array.prototype.slice.call(cont.querySelectorAll('.residente-input'))
        .map(function(i){ return i.value.trim(); }).filter(Boolean);
      if (!puestos.length || puestos.join(' / ') === _residenteAuto) {
        cont.innerHTML = '';
        addResidenteField('');
        _residenteAuto = '';
      }
    }
  }
  updateNroInforme();
}""",
 """function handleEmpresaChange(){
  autoResidenteConv();
  updateNroInforme();
}""",
 "104c· la empresa delega en la misma regla, sin duplicarla")

# El aviso ya lo gestiona la regla: handleTorreChange no debe borrarlo a mano.
s = sustituir(s,
 "  autoResidenteConv();\n"
 "  const av = document.getElementById('aviso-empresa');\n"
 "  if (av) { av.style.display = 'none'; av.textContent = ''; }\n"
 "  updateNroInforme();\n"
 "  renderMemoriaTable();\n"
 "}",
 "  autoResidenteConv();\n"
 "  updateNroInforme();\n"
 "  renderMemoriaTable();\n"
 "}",
 "104d· un solo sitio decide el aviso")

# ── 105. Decir por qué el residente se queda en blanco ─────────────────────
# Caso real al probarlo: se elige PROCODIMA y aparece «ING. LEONARDO TORRES»
# —es el único que le consta a esa empresa—; se elige la T-14 y el nombre
# desaparece sin explicación. Es lo correcto: el cuadro da a Leonardo Torres
# como residente de la T-13 y de la T-14 no dice nada, así que ponerlo ahí
# sería afirmar algo que la fuente no dice. Pero en pantalla parecía un fallo.
#
# Se deja el campo en blanco y se dice qué sí consta, para que el inspector
# escriba a quien encontró en obra con la información delante. Es `PA-94`, ya
# preguntada a Gerencia Técnica: si confirman que el residente cubre todas las
# torres de su empresa, esto se convierte en autocompletado y el aviso sobra.
s = sustituir(s,
 "  if (tor && tor !== 'NO_REG') {\n"
 "    const propia = empresaDeTorre(conv, tor);\n"
 "    if (!emp || emp === propia) return { valor: residenteDeTorre(conv, tor), nota: '' };",
 "  if (tor && tor !== 'NO_REG') {\n"
 "    const propia = empresaDeTorre(conv, tor);\n"
 "    if (!emp || emp === propia) {\n"
 "      const deLaTorre = residenteDeTorre(conv, tor);\n"
 "      if (deLaTorre) return { valor: deLaTorre, nota: '' };\n"
 "      // La torre no trae residente. Si a su empresa le consta alguno, se dice\n"
 "      // cuál —sin ponerlo—, para no afirmar lo que la fuente no dice.\n"
 "      const otros = residentesDeEmpresa(conv, propia || emp);\n"
 "      if (otros.length) {\n"
 "        return { valor: '', nota: 'El cuadro no dice quién es el residente de la ' + tor +\n"
 "          '. En otras torres de ' + String(propia || emp) + ' figura ' +\n"
 "          otros.join(' y ') + '. Escriba el que encontró en obra.' };\n"
 "      }\n"
 "      return { valor: '', nota: '' };\n"
 "    }",
 "105· decir qué consta cuando la torre no trae residente")

# ── 106. «Limpiar todo», que existía pero no se encontraba ─────────────────
# Pedido al usarlo: un botón para borrar todo lo llenado y empezar de nuevo.
# La función ya existía —`nuevoFormulario`, comprobado que limpia ubicación,
# personal, estatus, organismos, observaciones, evaluación, notas de foto,
# filas extra, hitos no inspeccionados y las fotografías— pero fallaban las dos
# cosas que la hacen usable:
#
#   · SE LLAMABA «Informe en blanco», que suena a «empezar otro informe», no a
#     «bórrame lo que acabo de escribir».
#   · Y ESTABA ESCONDIDA tras el menú «⋯ Más». Medido: 0 × 0 px, display:none.
#
# Pasa a llamarse «🧹 Limpiar todo» y sube a la fila visible. Para no añadir
# altura a una cabecera que ya ocupa el 19 % de la pantalla, baja «💾 Guardar»
# al menú: es el único botón de la fila que duplica algo que ya ocurre solo
# —el autoguardado corre a los 2 s de la última tecla y cada 30 s— y su
# resultado se ve al lado, en el rótulo «guardado hh:mm». «Guardar y siguiente»
# también guarda, así que no queda ningún camino sin guardado.
#
# Y el aviso de confirmación dice qué se borra y qué NO: los informes ya
# guardados en «Mis informes» no se tocan, que es la duda razonable antes de
# pulsar un botón que se llama «limpiar todo».

s = sustituir(s,
 '    <button class="hbtn hbtn-save" onclick="saveDraft()" title="Guarda el informe en este teléfono. También se guarda solo cada 30 segundos">💾 <span>Guardar</span></button>\n',
 '',
 "106a· «Guardar» sale de la fila visible")

s = sustituir(s,
 '      <button class="hbtn hbtn-nuevo2" onclick="nuevoFormulario()" title="Vacía el formulario entero, incluidas torre y empresa. Para empezar en otra torre">🆕 <span>Informe en blanco</span></button>\n',
 '      <button class="hbtn hbtn-save" onclick="saveDraft()" title="Guarda el informe en este teléfono. Se guarda solo a los 2 segundos de la última tecla y cada 30 segundos">💾 <span>Guardar</span></button>\n',
 "106b· y baja al menú, donde ya está el resto")

s = sustituir(s,
 '    <button class="hbtn hbtn-mas" id="btn-mas" onclick="toggleMasAcciones()" title="Resto de las acciones">⋯ <span>Más</span></button>',
 '    <button class="hbtn hbtn-nuevo2" onclick="nuevoFormulario()" title="Borra todo lo escrito en este informe y deja el formulario en blanco. Los informes ya guardados no se tocan">🧹 <span>Limpiar todo</span></button>\n'
 '    <button class="hbtn hbtn-mas" id="btn-mas" onclick="toggleMasAcciones()" title="Resto de las acciones">⋯ <span>Más</span></button>',
 "106c· «Limpiar todo» sube a la fila visible")

s = sustituir(s,
 "  if(!confirm('¿Desea iniciar un nuevo informe? Se limpiarán los campos actuales.')) return;",
 "  if(!confirm('\u00bfLimpiar todo este informe?\\n\\nSe borra lo que hay en pantalla: torre, "
 "apartamento, personal, estatus, evaluaci\u00f3n, observaciones y fotograf\u00edas."
 "\\n\\nLos informes que ya est\u00e1n en \u00abMis informes\u00bb NO se tocan.')) return;",
 "106d· el aviso dice qué se borra y qué no")

s = sustituir(s,
 "  showToast('🆕 Formulario limpio para nuevo registro', 'ok');",
 "  showToast('🧹 Formulario limpio', 'ok');",
 "106e· y el mensaje de después, igual de directo")

# ── 107. La pantalla del teléfono deja de gastarse en cromo ────────────────
# Medido en 375×812 antes de esto: la cabecera azul ocupaba el 23 % de la
# pantalla, la barra de rol el 11 % y el bloque de logos y título otro 22 %.
# El primer campo que se puede llenar quedaba a 508 px —el 63 % de la primera
# pantalla es cromo— y el primer hito a 1.741 px, o sea 2,1 pantallas de scroll
# antes de tocar nada de la inspección.

# 107a · El emblema de Gran Misión Vivienda Venezuela sale de la PANTALLA y se
#   conserva en el PDF. Es identidad del documento oficial, no una ayuda para
#   llenarlo. El de Garmel se queda —da contexto de quién inspecciona— pero más
#   pequeño mientras se llena; en el papel vuelve a su tamaño.
s = sustituir(s,
 '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAeAAAAE/',
 '<img class="logo-garmel" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAeAAAAE/',
 "107a· marcar el logo de Garmel")

# 107a2 · ya no hace falta: el emblema y su separador nacen con su clase
# puesta en el cambio 3, que es donde se insertan.

# 107b · El título se acorta y el subtítulo desaparece: «Gerencia GARMEL ·
#   Evaluación por Hitos y Subitems» describía la mecánica interna del
#   instrumento, no el documento.
s = sustituir(s,
 '<h2 id="logo-title" style="font-size:16px;font-weight:900;color:var(--blue)">INFORME DE INSPECCIÓN TÉCNICA</h2>\n'
 '      <p id="logo-sub" style="font-size:10px;color:#5a6672;margin-top:2px">Gerencia GARMEL · Evaluación por Hitos y Subitems</p>',
 '<h2 id="logo-title" style="font-size:16px;font-weight:900;color:var(--blue)">INFORME DE GERENCIA TÉCNICA DE INSPECCIÓN</h2>',
 "107b· título nuevo y fuera el subtítulo")

# setupFormTypeUI volvía a escribir esos textos en cada arranque.
s = sustituir(s,
 "    if (logoTitle) logoTitle.textContent = 'INFORME DE INSPECCIÓN POR HITOS';\n"
 "    if (logoSub) logoSub.textContent = 'Gerencia GARMEL · Evaluación Visual y Porcentual';",
 "    if (logoTitle) logoTitle.textContent = 'INFORME DE GERENCIA TÉCNICA DE INSPECCIÓN';",
 "107b2· el modo por hitos no reescribe el título")

s = sustituir(s,
 "    if (logoTitle) logoTitle.textContent = 'INFORME DE INSPECCIÓN TÉCNICA';\n"
 "    if (logoSub) logoSub.textContent = 'Gerencia GARMEL · Evaluación por Hitos y Subitems';",
 "    if (logoTitle) logoTitle.textContent = 'INFORME DE GERENCIA TÉCNICA DE INSPECCIÓN';",
 "107b3· ni el detallado")

s = sustituir(s,
 "  const logoSub = document.getElementById('logo-sub');\n",
 "",
 "107b4· y se retira la variable que ya no apunta a nada")

# 107c · Los hitos abren plegados TAMBIÉN en escritorio. Desplegados el
#   formulario mide 20,9 pantallas; plegados, 4,9. Y plegados los once con su
#   porcentaje al lado son una lista de verificación: un guion dice «sin tocar».
#   Además, que el escritorio y el teléfono se comporten igual evita que un
#   defecto se esconda en el que no se prueba.
s = sustituir(s,
 "  try{\n"
 "    if(window.matchMedia &&\n"
 "       window.matchMedia('(max-width: 700px), (pointer: coarse)').matches){\n"
 "      document.querySelectorAll('.partida').forEach(function(p){ p.classList.add('collapsed'); });\n"
 "    }\n"
 "  } catch(e) { /* sin matchMedia se deja desplegado */ }",
 "  document.querySelectorAll('.partida').forEach(function(p){ p.classList.add('collapsed'); });",
 "107c· los hitos abren plegados en cualquier pantalla")

# 107d · Los controles que quedaban por debajo de 44 px. Los cinco de «Estatus
#   de la obra» medían 25 px de alto y son campo obligatorio; los de agregar
#   residente e inspector, 27; los de quitar, 30; los organismos, 32.
s = sustituir(s,
 ".btn-remove-item{background:#ffebee;color:var(--red);border:1px solid #ffcdd2;border-radius:6px;width:30px;height:30px;",
 ".btn-remove-item{background:#ffebee;color:var(--red);border:1px solid #ffcdd2;border-radius:6px;width:44px;height:44px;",
 "107d· el botón de quitar, a 44 px")

s = sustituir(s,
 ".btn-add-item{background:var(--blue-l);color:var(--blue);border:1px solid #c5cae9;border-radius:6px;padding:5px 10px;",
 ".btn-add-item{background:var(--blue-l);color:var(--blue);border:1px solid #c5cae9;border-radius:6px;min-height:44px;padding:5px 14px;",
 "107d2· los de agregar, también")

s = sustituir(s,
 ".ck-lbl{display:flex;align-items:center;gap:5px;background:#f5f7ff;border:1.5px solid #e0e4ff;border-radius:6px;padding:5px 10px;",
 ".ck-lbl{display:flex;align-items:center;gap:5px;background:#f5f7ff;border:1.5px solid #e0e4ff;border-radius:6px;min-height:44px;padding:5px 12px;",
 "107d3· el estatus, que es obligatorio")

s = sustituir(s,
 "  display:inline-flex;align-items:center;padding:7px 14px;\n"
 "  background:#f5f7ff;border:2px solid #e0e4ff;border-radius:8px;",
 "  display:inline-flex;align-items:center;min-height:44px;padding:7px 14px;\n"
 "  background:#f5f7ff;border:2px solid #e0e4ff;border-radius:8px;",
 "107d4· y los organismos")

# ── 107e/f. El emblema fuera de pantalla, y las acciones al alcance del pulgar
s = sustituir(s,
 "button:focus-visible,select:focus-visible,input:focus-visible,\n",
 "/* El emblema oficial se lleva el 22 % de la pantalla de un teléfono y no\n"
 "   ayuda a llenar el informe, así que ahí no está. En una pantalla ancha sí\n"
 "   cabe sin quitarle sitio a nada, y en el PDF es la identidad del documento,\n"
 "   así que en los dos se muestra. Estuvo oculto en TODAS las pantallas hasta\n"
 "   el 31-ago-2026; se acota al teléfono, que es de donde salía el motivo. */\n"
 "@media screen and (max-width:700px), screen and (pointer:coarse){\n"
 "  .logo-minhvi, .logo-sep-minhvi{display:none}\n"
 "}\n"
 ".logo-garmel{max-height:34px;width:auto}\n"
 "\n"
 "/* Las cuatro acciones caían en el tercio superior de la pantalla: con una\n"
 "   sola mano —la otra sostiene linterna, plano o casco— el pulgar no llega.\n"
 "   En pantalla estrecha bajan al borde inferior, que es la zona cómoda. */\n"
 "@media (max-width:700px), (pointer:coarse){\n"
 "  .hdr-btns{\n"
 "    position:fixed; left:0; right:0; bottom:0; z-index:900;\n"
 "    background:var(--blue); padding:8px 10px calc(8px + env(safe-area-inset-bottom));\n"
 "    box-shadow:0 -4px 14px rgba(0,0,0,.28); margin:0;\n"
 "  }\n"
 "  /* Y el contenido deja sitio para no quedar debajo de la barra. */\n"
 "  body{padding-bottom:150px}\n"
 "  /* El menú «Más» se despliega hacia arriba, no hacia fuera de la pantalla. */\n"
 "  .hdr-sec{flex-direction:column-reverse}\n"
 "}\n"
 "\n"
 "button:focus-visible,select:focus-visible,input:focus-visible,\n",
 "107e· el emblema fuera de pantalla y las acciones abajo")

s = sustituir(s,
 "@media print{\n"
 "  #welcome-screen{display:none!important}\n",
 "@media print{\n"
 "  #welcome-screen{display:none!important}\n"
 "  /* En el papel vuelven los dos logos, a su tamaño. */\n"
 "  .logo-minhvi, .logo-sep-minhvi{display:inline-block!important}\n"
 "  .logo-garmel{max-height:none!important}\n"
 "  body{padding-bottom:0!important}\n",
 "107f· en el PDF vuelven los dos logos")

s = sustituir(s,
 ".add-row-btn{margin:8px 16px 4px;padding:6px 14px;",
 ".add-row-btn{margin:8px 16px 4px;min-height:44px;padding:6px 16px;",
 "107d5\u00b7 «Agregar subitem», el \u00faltimo que quedaba bajo 44 px")

# ── 108. El PDF gastaba el ancho en las columnas equivocadas ───────────────
#
# 108a · LA CANTIDAD PROYECTADA VOLVÍA A FALTAR EN EL PAPEL. El cambio 97
#   oculta esa columna con `body.ocultar-proyectada`, y esa regla no distingue
#   pantalla de impresión: en rol Inspector el PDF salía sin ella. El rol
#   gobierna quién LLENA el dato, no qué lleva el documento — y sin la
#   proyectada, quien lee el informe no puede comprobar de dónde sale el
#   porcentaje. La ocultación pasa a ser solo de pantalla.
#
# 108b · REPARTO DEL ANCHO. Estaba en 30 % para la descripción y 56 % repartido
#   entre cinco columnas numéricas. Resultado medido en el PDF: «Construcción
#   de paredes exteriores» y «Sanitarias y pluviales — Aguas blancas» partían
#   en dos renglones mientras sobraba blanco a la derecha. Las columnas de
#   cifras no necesitan más que un número de dos o tres dígitos.
#
#   Pasa a 46 % para la descripción, que es lo que hay que leer, y el resto
#   ajustado a su contenido. No se aprieta: se le quita ancho a lo que no lo
#   usa y se le da a lo que sí.

s = sustituir(s,
 "body.ocultar-proyectada th.col-proyectada,\n"
 "body.ocultar-proyectada td.col-proyectada{display:none!important}",
 "/* Solo en PANTALLA. En el papel la cantidad proyectada siempre sale: es la\n"
 "   mitad de la fórmula del avance, y sin ella el informe no se puede\n"
 "   comprobar. El rol decide quién la llena, no qué lleva el documento. */\n"
 "@media screen{\n"
 "  body.ocultar-proyectada th.col-proyectada,\n"
 "  body.ocultar-proyectada td.col-proyectada{display:none!important}\n"
 "}",
 "108a· la proyectada vuelve al PDF en los dos roles")

s = sustituir(s,
 "  table col, table td:nth-child(1){width:22px!important}\n"
 "  table td:nth-child(2){width:30%!important}\n"
 "  table td:nth-child(3),table td:nth-child(4),table td:nth-child(5){width:10%!important}\n"
 "  table td:nth-child(6){width:12%!important}\n"
 "  table td:nth-child(7){width:12%!important}",
 "  /* El ancho va donde se lee. Antes: 30 % para la descripción y 56 % para\n"
 "     cinco columnas de cifras, así que los nombres largos partían en dos\n"
 "     renglones y sobraba blanco a la derecha. */\n"
 "  table th:nth-child(1),table td:nth-child(1){width:20px!important}\n"
 "  table th:nth-child(2),table td:nth-child(2){width:46%!important;text-align:left!important}\n"
 "  table th:nth-child(3),table td:nth-child(3){width:9%!important}\n"
 "  table th:nth-child(4),table td:nth-child(4){width:9%!important}\n"
 "  table th:nth-child(5),table td:nth-child(5){width:11%!important}\n"
 "  table th:nth-child(6),table td:nth-child(6){width:9%!important}\n"
 "  table th:nth-child(7),table td:nth-child(7){width:10%!important}",
 "108b· el ancho va a la descripción, no a las cifras")

# Los rellenos laterales se comían ancho en columnas de dos dígitos.
s = sustituir(s,
 "  tbody td{\n"
 "    padding:3px 5px!important;",
 "  tbody td{\n"
 "    padding:3px 3px!important;",
 "108c· menos relleno lateral en las celdas")

s = sustituir(s,
 "  thead th{\n"
 "    padding:4px 5px!important;",
 "  thead th{\n"
 "    padding:4px 3px!important;",
 "108c2· y en la cabecera")

# La descripción se leía centrada como las cifras.
s = sustituir(s,
 "  td.desc{min-width:0!important;max-width:none!important}",
 "  td.desc{min-width:0!important;max-width:none!important;text-align:left!important;padding-left:5px!important}",
 "108d· la descripción alineada a la izquierda, que es como se lee")

# ── 109. «PROYECTAD / A»: el título se partía a mitad de palabra ───────────
# Los encabezados llevaban `word-break:break-word`, que permite cortar en
# cualquier letra. Con la columna estrecha, «PROYECTADA» salía partida en dos
# renglones como «PROYECTAD» y «A». Se pasa a `overflow-wrap`, que solo parte
# cuando la palabra no cabe de ninguna manera, y se le da a esa columna los
# dos puntos porcentuales que le faltaban, sacándolos de la descripción —que
# tras el cambio 108 sobra ancho: la subpartida más larga ya cabe en una línea.
s = sustituir(s,
 "    white-space:normal!important;\n"
 "    word-break:break-word;\n"
 "  }\n"
 "  tbody td{",
 "    white-space:normal!important;\n"
 "    word-break:normal;\n"
 "    overflow-wrap:break-word;\n"
 "    hyphens:none;\n"
 "  }\n"
 "  tbody td{",
 "109a· los títulos no se parten a mitad de palabra")

s = sustituir(s,
 "  table th:nth-child(2),table td:nth-child(2){width:46%!important;text-align:left!important}\n"
 "  table th:nth-child(3),table td:nth-child(3){width:9%!important}",
 "  table th:nth-child(2),table td:nth-child(2){width:44%!important;text-align:left!important}\n"
 "  table th:nth-child(3),table td:nth-child(3){width:11%!important}",
 "109b· «Cant. proyectada» necesita dos puntos más")

# ── 110. La unidad de medida de cada subpartida ────────────────────────────
# Lo pide Skarlet Gómez el 31-ago-2026, y es lo que le faltaba a la cantidad
# para significar algo: el formulario pedía «cantidad proyectada» y «cantidad
# ejecutada» SIN DECIR DE QUÉ. «12» puede ser 12 puertas o 12 m² de puerta, y
# el porcentaje sale igual de convincente en los dos casos.
#
# La tabla la respondió ella entera el 31-ago (`PA-100`), y la respuesta cambia
# el instrumento más de lo que parecía:
#
#   · 28 subpartidas se miden en m², m³ o pza, y llevan su unidad fija;
#   · 1 admite DOS unidades —acero de refuerzo, en ml o kg— y se elige en el
#     momento, porque depende de cómo venga computada la partida;
#   · 21 NO SE MIDEN POR CANTIDAD: se marcan por estado de avance. Eso no es
#     una unidad, es otro tipo de dato, y lo resuelve el cambio 112.
#
# El sitio definitivo del dato es el maestro `MAE_Hitos_Subpartidas`; esta
# tabla es su copia local, como TORRES.
import json as _json

UD_ESTADO = "estado"                  # no se mide: se elige en qué punto va
UNIDADES = {
    "hito_estructura":     ["m²", ["ml", "kg"], "m³"],
    "hito_cerramientos":   ["m²", "m²", "m²"],
    "hito_servicios":      [UD_ESTADO] * 9,
    "hito_acabados":       ["m²"] * 7,
    "hito_puertas":        ["pza"] * 3,
    "hito_ventanas":       ["pza", "pza"],
    "hito_acc_sanitarios": ["pza"] * 7,
    "hito_acc_electricos": ["pza"] * 4,
    "hito_ascensor":       [UD_ESTADO] * 4,
    "hito_exteriores":     ["m²"] + [UD_ESTADO] * 4,
    "hito_pruebas":        [UD_ESTADO] * 4,
}

# Si alguien añade una subpartida y no su unidad, esto falla al construir y no
# en el teléfono.
if ONCE_HITOS:
    _decl = dict(re.findall(r'"id":\s*"([a-z_0-9]+)".*?"items":\s*(\[[^\]]*\])',
                            PARTIDAS_ONCE, re.S))
    for _id, _lista in _decl.items():
        _n, _m = len(_json.loads(_lista)), len(UNIDADES.get(_id, []))
        if _n != _m:
            sys.exit("✗ %s tiene %d subpartidas y %d unidades" % (_id, _n, _m))

UNIDADES_JS = (
 "// Unidad de medida de cada subpartida, en el mismo orden que sus `items`.\n"
 "// Fuente: Skarlet Gómez, 31-ago-2026 (`PA-100`). Tres formas:\n"
 "//   'm²'          unidad fija\n"
 "//   ['ml','kg']   dos unidades posibles: la elige quien llena\n"
 "//   UD_ESTADO     no se mide por cantidad: se elige en qué punto va\n"
 "// El dato definitivo vive en el maestro MAE_Hitos_Subpartidas.\n"
 "const UD_ESTADO = '%s';\n"
 "const UNIDADES = {\n%s\n};\n"
 "\n"
 "function _esEstado(pid, i){ return (UNIDADES[pid] || [])[i] === UD_ESTADO; }\n"
 "\n"
 "// La unidad va pegada al nombre de la subpartida: es el único sitio que se ve\n"
 "// igual en el teléfono, en el escritorio y en el papel.\n"
 "function _ud(pid, i){\n"
 "  const u = (UNIDADES[pid] || [])[i];\n"
 "  if (u === UD_ESTADO) return '';   // los botones de estado ya lo dicen\n"
 "  if (Array.isArray(u)) {\n"
 "    return ' <select class=\"ud-sel\" id=\"ud_' + pid + '_' + i + '\"' +\n"
 "           ' title=\"Unidad de medida de esta subpartida\" onchange=\"_marcarCambio()\">' +\n"
 "           '<option value=\"\">unidad…</option>' +\n"
 "           u.map(function(x){ return '<option value=\"' + x + '\">' + x + '</option>'; }).join('') +\n"
 "           '</select>';\n"
 "  }\n"
 "  return u ? ' <span class=\"ud\">' + u + '</span>' : '';\n"
 "}\n"
 "\n"
 "// La unidad que de verdad lleva esta fila, ya elegida. Viaja con el informe:\n"
 "// una cantidad sin su unidad no se puede volver a leer dentro de un año.\n"
 "function _udValor(pid, i){\n"
 "  const u = (UNIDADES[pid] || [])[i];\n"
 "  if (Array.isArray(u)) {\n"
 "    const sel = document.getElementById('ud_' + pid + '_' + i);\n"
 "    return sel ? sel.value : '';\n"
 "  }\n"
 "  return u || '';\n"
 "}\n"
 "\n"
) % (UD_ESTADO, "\n".join(
     "  %-23s %s," % ("'%s':" % k, _json.dumps(v, ensure_ascii=False))
     for k, v in UNIDADES.items()).rstrip(","))

s = sustituir(s,
 "const INSPECTORES_DB = [",
 UNIDADES_JS + "const INSPECTORES_DB = [",
 "110a· la tabla de unidades que respondió Skarlet")

s = sustituir(s,
 "          <td class=\"desc\">${item}</td>",
 "          <td class=\"desc\">${item}${_ud(p.id,i)}</td>",
 "110b· la unidad, al lado del nombre de la subpartida")

s = sustituir(s,
 "td.desc{text-align:left;padding-left:13px;font-size:12px;font-weight:500;min-width:160px}",
 "td.desc{text-align:left;padding-left:13px;font-size:12px;font-weight:500;min-width:160px}\n"
 ".ud{display:inline-block;margin-left:6px;padding:1px 6px;border:1px solid #dfe3ea;border-radius:9px;"
 "background:#f4f6fa;color:#5f6b7a;font-size:10.5px;font-weight:700;white-space:nowrap;vertical-align:middle}\n"
 ".ud-sel{margin-left:6px;min-height:34px;padding:2px 6px;border:1.5px solid #c9cdd6;border-radius:7px;"
 "background:#fff8e1;color:#37474f;font-size:11.5px;font-weight:700;vertical-align:middle}",
 "110c· cómo se ven la unidad y el selector en pantalla")

# En el papel no lleva recuadro: es un documento, no una interfaz.
s = sustituir(s,
 "  td.desc{min-width:0!important;max-width:none!important;text-align:left!important;padding-left:5px!important}",
 "  td.desc{min-width:0!important;max-width:none!important;text-align:left!important;padding-left:5px!important}\n"
 "  .ud{border:none!important;background:none!important;padding:0!important;margin-left:4px!important;"
 "color:#444!important;font-size:8.5px!important;font-weight:600!important}\n"
 "  .ud-sel{border:none!important;background:none!important;padding:0!important;margin-left:4px!important;"
 "color:#444!important;font-size:8.5px!important;font-weight:600!important;-webkit-appearance:none;appearance:none}",
 "110d· y en el papel, sin recuadro")


# ── 111. Se retira el modo por hitos ───────────────────────────────────────
# Decidido por Francisco José García Guinand el 31-ago-2026. Deja sin efecto lo
# que ADR-0018 §2 conservaba: el modo por hitos pedía UN PORCENTAJE POR HITO, A
# OJO, y el detallado lo calcula por cantidad proyectada contra ejecutada. Son
# avance declarado y avance verificado, y tener los dos vivos significa
# consolidar juntas dos cosas que no se miden igual, sin nada que las distinga.
#
# Se retira LA ENTRADA, no la máquina de leerlo: `?modo=hitos` deja de existir
# y ya no hay forma de empezar un informe así. Los borradores que quedaran
# guardados en un teléfono desde agosto SIGUEN ABRIÉNDOSE como se llenaron —de
# eso se ocupa el cambio 101—, porque borrar esas ramas los volvería ilegibles.
# El modo de prueba no se toca: es `?prueba=1`, y es otra cosa.
s = sustituir(s,
 "  // Sin portada intermedia: se entra directo al formulario que toque.\n"
 "  const modo = new URLSearchParams(location.search).get('modo');\n",
 "  // Sin portada intermedia: se entra directo al formulario. Hay uno solo —el\n"
 "  // detallado—; el modo por hitos se retir\u00f3 el 31-ago-2026.\n",
 "111a\u00b7 se retira el par\u00e1metro ?modo")

s = sustituir(s,
 "  // No se entra al formulario sin haber elegido rol.\n"
 "  if (modo === 'hitos') { startApp('hitos'); _appArrancada = true; setModeUI('inspector'); }\n"
 "  else { abrirEleccionDeRol(); }",
 "  // No se entra al formulario sin haber elegido rol.\n"
 "  abrirEleccionDeRol();",
 "111b\u00b7 se entra siempre por la elecci\u00f3n de rol")

# ── 112. Veintiuna subpartidas no se miden: se marcan por estado ───────────
# De la respuesta de Skarlet Gómez del 31-ago-2026 (`PA-100`): los nueve ítems
# de INSTALACIÓN DE SERVICIOS, los cuatro de ASCENSOR, los cuatro de PRUEBAS y
# cuatro de ACABADOS EXTERIORES no tienen cantidad que medir. Pedirle a un
# inspector dos cantidades para «Presión de agua» lo obliga a escribir 1 y 1 —o
# a inventarse un número— para decir que se hizo.
#
# Empezaron siendo un sí/no. Se quedaron cortas: **la obra pasa la mayor parte
# del tiempo entre el sí y el no**, y eso no se podía reportar. Desde el
# 31-ago-2026 se marcan con **cinco estados** (decisión de Francisco José García
# Guinand, ADR-0026):
#
#   No iniciado 0 % · Iniciado 25 % · En proceso 50 % · Avanzado 75 % · Culminado 100 %
#
# POR DEBAJO SIGUEN SIENDO LAS MISMAS DOS CANTIDADES, en dos campos ocultos:
# proyectada 100 y ejecutada el porcentaje del estado. Así el porcentaje, el
# promedio del hito, el borrador, el PDF y el relevo a Smartsheet siguen
# funcionando sin tocar nada, y quien lea la hoja ve «100 proyectada, 50
# ejecutada, 50 %», que se explica solo. Sin tocar, las dos vacías: no cuenta
# para el promedio, igual que una fila de cantidad en blanco.
#
# El «faltante» se apaga —«falta 50» no significa nada aquí— y `N/A` se
# conserva, que es lo que distingue «no aplica» de «no se ha empezado».
s = sustituir(s,
 "      const rows = p.items.map((item,i)=>{\n"
 "        const rid=`${p.id}_${i}`;\n"
 "        return `<tr>\n"
 "          <td class=\"n\">${i+1}</td>\n"
 "          <td class=\"desc\">${item}${_ud(p.id,i)}</td>\n"
 "          <td class=\"col-proyectada\"><input type=\"number\" class=\"num\" min=\"0\" id=\"pr_${rid}\" data-rid=\"${rid}\" data-p=\"${p.id}\" oninput=\"recalcRow(this)\" placeholder=\"0\"></td>\n"
 "          <td class=\"col-ejecutada\"><input type=\"number\" class=\"num\" min=\"0\" id=\"ej_${rid}\" data-rid=\"${rid}\" data-p=\"${p.id}\" oninput=\"recalcRow(this)\" placeholder=\"0\"></td>\n",
 "      // Un hito entero de estados no tiene columna de cantidad que rotular.\n"
 "      const soloEstado = p.items.every((_, k) => _esEstado(p.id, k));\n"
 "      const rows = p.items.map((item,i)=>{\n"
 "        const rid=`${p.id}_${i}`;\n"
 "        // Las que no se miden no piden cantidad: piden en qué punto van. Los\n"
 "        // dos campos de cantidad siguen ahí, ocultos, para no cambiar el dato.\n"
 "        const est = _esEstado(p.id, i);\n"
 "        return `<tr>\n"
 "          <td class=\"n\">${i+1}</td>\n"
 "          <td class=\"desc\">${item}${_ud(p.id,i)}</td>\n"
 "          ${est ? `\n"
 "          <td class=\"col-proyectada est-vacia\"><input type=\"hidden\" id=\"pr_${rid}\" data-rid=\"${rid}\" data-p=\"${p.id}\" data-est=\"1\"></td>\n"
 "          <td class=\"col-ejecutada est-cell\"><div class=\"est\">${ESTADOS.map(e => `\n"
 "            <button type=\"button\" class=\"est-btn e${e.v}\" data-rid=\"${rid}\" data-v=\"${e.v}\"\n"
 "                    title=\"${e.n} — ${e.v}%\" onclick=\"setEstado(this,${e.v})\"><b class=\"est-n\">${e.n}</b><i class=\"est-p\">${e.v}%</i></button>`).join('')}\n"
 "          </div><input type=\"hidden\" id=\"ej_${rid}\" data-rid=\"${rid}\" data-p=\"${p.id}\"></td>` : `\n"
 "          <td class=\"col-proyectada\"><input type=\"number\" class=\"num\" min=\"0\" id=\"pr_${rid}\" data-rid=\"${rid}\" data-p=\"${p.id}\" oninput=\"recalcRow(this)\" placeholder=\"0\"></td>\n"
 "          <td class=\"col-ejecutada\"><input type=\"number\" class=\"num\" min=\"0\" id=\"ej_${rid}\" data-rid=\"${rid}\" data-p=\"${p.id}\" oninput=\"recalcRow(this)\" placeholder=\"0\"></td>`}\n",
 "112a· las filas sin cantidad cambian de control, no de dato")

s = sustituir(s,
 "function recalcRow(inp){",
 "// Los cinco estados, en orden. El porcentaje NO es decorativo: es el dato que\n"
 "// se guarda como cantidad ejecutada sobre 100.\n"
 "const ESTADOS = [\n"
 "  { v: 0,   n: 'No iniciado' },\n"
 "  { v: 25,  n: 'Iniciado' },\n"
 "  { v: 50,  n: 'En proceso' },\n"
 "  { v: 75,  n: 'Avanzado' },\n"
 "  { v: 100, n: 'Culminado' }\n"
 "];\n"
 "\n"
 "// Marcar el estado de una fila. Volver a tocar el mismo estado lo borra: «sin\n"
 "// marcar» tiene que poder recuperarse, o un toque por error se queda puesto.\n"
 "// Ojo: «No iniciado» NO es lo mismo que sin marcar. Es un 0 % que sí cuenta.\n"
 "function setEstado(btn, valor){\n"
 "  const rid = btn.dataset.rid;\n"
 "  const pr = document.getElementById('pr_' + rid);\n"
 "  const ej = document.getElementById('ej_' + rid);\n"
 "  if(!pr || !ej) return;\n"
 "  const yaEstaba = (ej.value !== '' && Number(ej.value) === valor);\n"
 "  if(yaEstaba){ pr.value = ''; ej.value = ''; }\n"
 "  else { pr.value = '100'; ej.value = String(valor); }\n"
 "  recalcRow(pr);\n"
 "  if(typeof _marcarCambio === 'function') _marcarCambio();\n"
 "}\n"
 "\n"
 "function recalcRow(inp){",
 "112b· los cinco estados, y cómo se borra una marca")

# Un borrador guardado con la versión de sí/no trae «1 de 1». Se traduce a la
# escala de estados —100 de 100— al abrirlo, o el porcentaje seguiría bien pero
# ningún botón quedaría marcado, y al tocarlo se perdería lo que ya decía.
s = sustituir(s,
 "function recalcRow(inp){\n"
 "  const rid=inp.dataset.rid, pid=inp.dataset.p;",
 "function recalcRow(inp){\n"
 "  const rid=inp.dataset.rid, pid=inp.dataset.p;\n"
 "  const _pr = document.getElementById('pr_'+rid);\n"
 "  if(_pr && _pr.dataset.est && _pr.value === '1'){\n"
 "    const _ej = document.getElementById('ej_'+rid);\n"
 "    _pr.value = '100';\n"
 "    if(_ej) _ej.value = String((parseFloat(_ej.value) || 0) * 100);\n"
 "  }",
 "112i· un borrador de la versión de sí/no se traduce a estados")

s = sustituir(s,
 "  const pctEl=document.getElementById('pct_'+rid);\n"
 "  if(pr>0){",
 "  // En una fila de estado no hay «faltante»: «falta 50» no significa nada. Y\n"
 "  // los botones se pintan aquí, que es por donde pasa también un borrador al\n"
 "  // abrirse.\n"
 "  const esEstado = document.getElementById('pr_'+rid)?.dataset.est;\n"
 "  if(esEstado){\n"
 "    fltEl.textContent='—'; fltEl.style.color='#aaa';\n"
 "    const v = document.getElementById('ej_'+rid)?.value;\n"
 "    document.querySelectorAll(`.est-btn[data-rid=\"${rid}\"]`).forEach(b=>{\n"
 "      b.classList.toggle('on', v !== '' && v !== undefined && String(Number(v)) === b.dataset.v);\n"
 "    });\n"
 "  }\n"
 "  const pctEl=document.getElementById('pct_'+rid);\n"
 "  if(pr>0){",
 "112c· sin «faltante», y los botones se pintan desde el dato")

# La unidad viaja con el informe: una cantidad sin su unidad no se puede releer
# dentro de un año, y la del acero la elige quien llena.
s = sustituir(s,
 "        return {pr:document.getElementById('pr_'+rid)?.value||'',ej:document.getElementById('ej_'+rid)?.value||'',ev:ev?ev.textContent:''};",
 "        return {pr:document.getElementById('pr_'+rid)?.value||'',ej:document.getElementById('ej_'+rid)?.value||'',ev:ev?ev.textContent:'',ud:_udValor(p.id,i)};",
 "112d· la unidad se guarda con la medición")

s = sustituir(s,
 "            if(prInp && item.pr !== undefined) prInp.value = item.pr;",
 "            const udSel = document.getElementById('ud_'+pid+'_'+i);\n"
 "            if(udSel && item.ud) udSel.value = item.ud;\n"
 "            if(prInp && item.pr !== undefined) prInp.value = item.pr;",
 "112e· y vuelve al abrir el borrador")

# En la tabla de escritorio la columna es estrecha y no caben cinco palabras:
# van los cinco porcentajes, en orden, y la palabra queda en el `title`. En el
# teléfono —que es donde se llena— van las dos cosas.
s = sustituir(s,
 ".ud{display:inline-block;margin-left:6px;",
 ".est{display:flex;gap:5px;flex-wrap:wrap}\n"
 ".est-btn{padding:4px 8px;border:2px solid #90a4ae;border-radius:11px;background:#fff;color:#263238;"
 "font-size:11px;font-weight:800;cursor:pointer;transition:all .12s;line-height:1.15}\n"
 ".est-btn .est-n{display:none}\n"
 ".est-btn .est-p{font-style:normal}\n"
 ".est-btn.on{color:#fff;border-color:transparent}\n"
 ".est-btn.e0.on{background:#78909c}\n"
 ".est-btn.e25.on{background:#5c6bc0}\n"
 ".est-btn.e50.on{background:#3949ab}\n"
 ".est-btn.e75.on{background:#283593}\n"
 ".est-btn.e100.on{background:#1a237e}\n"
 ".ud{display:inline-block;margin-left:6px;",
 "112f· cómo se ven los cinco estados en la tabla")

# En el teléfono la fila es una tarjeta: caben las palabras, y los cinco botones
# se reparten en dos filas de tres y dos, cada uno con sus 44 px.
s = sustituir(s,
 "  .tbl-wrap td.col-ejecutada::before{ content:'Ejecutada'; }",
 "  .tbl-wrap td.col-ejecutada::before{ content:'Ejecutada'; }\n"
 "  .tbl-wrap td.est-vacia{ display:none!important; }\n"
 "  .tbl-wrap td.est-cell{ display:block!important; margin-bottom:7px!important; }\n"
 "  .tbl-wrap td.est-cell::before{ content:'Estado'; display:block; margin-bottom:6px; }\n"
 "  .tbl-wrap td.est-cell .est{ gap:7px; }\n"
 "  .tbl-wrap .est-btn{\n"
 "    flex:1 1 29%; min-height:44px; display:flex; flex-direction:column;\n"
 "    align-items:center; justify-content:center; gap:1px; padding:5px 6px;\n"
 "  }\n"
 "  .tbl-wrap .est-btn .est-n{ display:block; font-size:12px; }\n"
 "  .tbl-wrap .est-btn .est-p{ display:block; font-size:10px; opacity:.75; }",
 "112g· en el teléfono, con las palabras y en dos filas")

# En el papel solo va el estado marcado, con su nombre: el porcentaje ya tiene
# su propia columna.
s = sustituir(s,
 "  .ud-sel{border:none!important;background:none!important;padding:0!important;margin-left:4px!important;"
 "color:#444!important;font-size:8.5px!important;font-weight:600!important;-webkit-appearance:none;appearance:none}",
 "  .ud-sel{border:none!important;background:none!important;padding:0!important;margin-left:4px!important;"
 "color:#444!important;font-size:8.5px!important;font-weight:600!important;-webkit-appearance:none;appearance:none}\n"
 "  .est-btn{display:none!important}\n"
 "  .est-btn.on{display:inline!important;border:none!important;background:none!important;"
 "color:#000!important;padding:0!important;font-size:9px!important;font-weight:700!important}\n"
 "  .est-btn.on .est-n{display:inline!important}\n"
 "  .est-btn.on .est-p{display:none!important}",
 "112h· en el papel va el nombre del estado, no el número")


# ── 113. Tres ajustes de campo, del 31-ago-2026 ────────────────────────────
# Los tres salen de mirar el instrumento en un teléfono, no de una teoría.

# 113a · «Cant. Ejecutada» no dice nada en un hito que se marca por estado.
# Solo cambia donde TODAS las subpartidas son de estado —el 3, el 9 y el 11—.
# El 10 está mezclado: una se mide en m² y cuatro se marcan, así que ahí la
# columna sigue siendo de cantidad y el encabezado no puede mentir.
s = sustituir(s,
 "                <th>Cant.<br>Ejecutada</th>",
 "                <th>${soloEstado ? 'Estado' : 'Cant.<br>Ejecutada'}</th>",
 "113a· la columna se llama «Estado» donde no hay cantidades")

# La de proyectada se queda —la estructura de columnas y los permisos por rol
# dependen de ella—, pero sin rótulo: ahí no hay nada que proyectar, y un
# encabezado que promete una cantidad que nunca llega confunde.
s = sustituir(s,
 "                <th class=\"col-proyectada\">Cant.<br>Proyectada</th>",
 "                <th class=\"col-proyectada\">${soloEstado ? '' : 'Cant.<br>Proyectada'}</th>",
 "113a2· y la de proyectada se queda sin rótulo")

# 113b · El botón de «no inspeccionado» se tocaba sin querer. Ocupaba media
# cabecera, y la cabecera entera abre y cierra el hito: quien iba a desplegarlo
# terminaba marcándolo como no inspeccionado. Pasa a ser una pastilla blanca,
# pequeña y con relieve —se lee como botón, no como parte del título—, y deja de
# competir por el sitio donde la gente toca para abrir.
#
# ⚠️ Baja de los 44 px que el resto de los controles respeta. Es deliberado: no
# es una acción de llenado, es una excepción que se marca de vez en cuando, y el
# daño de tocarla por error es mayor que el de fallar el toque.
s = sustituir(s,
 ".no-insp-tgl{min-height:44px;display:inline-flex;align-items:center;gap:4px;padding:0 10px;"
 "border-radius:14px;font-size:11px;font-weight:700;white-space:nowrap;cursor:pointer;font-size:15px;"
 "opacity:.85;padding:0 4px;user-select:none;color:#fff;border:1.5px solid rgba(255,255,255,.5);"
 "border-radius:6px;line-height:1}\n"
 ".no-insp-tgl.on{opacity:1;background:rgba(0,0,0,.35);border-color:#fff;border-width:2px}",
 ".no-insp-tgl{display:inline-flex;align-items:center;gap:4px;min-height:28px;padding:0 9px;"
 "border-radius:7px;font-size:10.5px;font-weight:800;letter-spacing:.2px;white-space:nowrap;"
 "cursor:pointer;user-select:none;line-height:1;color:#1a237e;background:#fff;"
 "border:1px solid rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.3)}\n"
 ".no-insp-tgl:active{transform:translateY(1px);box-shadow:none}\n"
 ".no-insp-tgl.on{background:#3e2723;color:#fff;border-color:#fff}",
 "113b· «no inspeccionado» se vuelve una pastilla pequeña con relieve")

s = sustituir(s,
 "  .no-insp-tgl, .arrow{\n"
 "    min-width:44px; min-height:44px;\n"
 "    display:inline-flex; align-items:center; justify-content:center;\n"
 "  }",
 "  .arrow{\n"
 "    min-width:44px; min-height:44px;\n"
 "    display:inline-flex; align-items:center; justify-content:center;\n"
 "  }\n"
 "  /* La pastilla no crece a 44: es lo que hacía que se tocara sin querer. */\n"
 "  .no-insp-tgl{ min-height:32px; padding:0 11px; font-size:11px; }",
 "113b2· y en el teléfono tampoco ocupa media cabecera")

# 113c · El título del hito se montaba encima de la pastilla en pantalla
# estrecha: el h2 no encogía, así que empujaba al bloque de la derecha.
s = sustituir(s,
 ".p-hdr-l{display:flex;align-items:center;gap:9px}",
 ".p-hdr-l{display:flex;align-items:center;gap:9px;flex:1 1 auto;min-width:0}",
 "113c· el título encoge en vez de empujar")

# `anywhere` partía «ACABADOS» en «ACABADO / S». Con `break-word` la palabra
# baja entera a la línea siguiente y solo se parte si no cabe de ningún modo.
s = sustituir(s,
 ".p-hdr h2{font-size:13px;font-weight:800;color:#fff}",
 ".p-hdr h2{font-size:13px;font-weight:800;color:#fff;min-width:0;"
 "word-break:normal;overflow-wrap:break-word;hyphens:none}",
 "113c2· y las palabras no se parten a la mitad")

# En el teléfono, con la pastilla al lado, al título le quedaban 84 px: se
# montaba encima en vez de envolverse. La cabecera se parte en dos: el nombre
# del hito completo arriba, y debajo la pastilla, el porcentaje y la flecha.
# Cuesta media pantalla más en la lista plegada y hace que se lea de un vistazo.
s = sustituir(s,
 "  .p-hdr{ padding:6px 10px 6px 16px; }",
 "  .p-hdr{ padding:8px 12px; flex-wrap:wrap; }\n"
 "  .p-hdr-l{ flex:1 1 100%; margin-bottom:7px; }\n"
 "  .p-hdr > div:last-of-type{ margin-left:auto; }",
 "113c3· en el teléfono la cabecera se parte en dos líneas")


# ── 114. La planta baja se llama planta baja ───────────────────────────────
# «Piso 00» no lo dice nadie en obra. El desplegable lo muestra y lo guarda como
# **Planta Baja**, que es lo que va al PDF, a la memoria de torre y a Smartsheet.
#
# El identificador NO cambia: sigue siendo `P00`. Es la parte numérica de
# ADR-0016, está incrustada en nombres de archivo de Drive y en claves de filas
# ya escritas, y una planta baja ordena antes que el piso 01 justamente por ser
# 00. Lo que cambia es cómo se lee, no cómo se identifica.
s = sustituir(s,
 "        <option>Piso 00</option>",
 "        <option>Planta Baja</option>",
 "114a· el desplegable dice Planta Baja")

s = sustituir(s,
 "// El piso es un desplegable con valores tipo «Piso 03»: hay que sacarle el número.\n"
 "function _digitosFinales(v, ancho){\n"
 "  const m = String(v == null ? '' : v).match(/(\\d+)\\s*$/);\n"
 "  return m ? m[1].padStart(ancho, '0') : '';\n"
 "}",
 "// El piso es un desplegable con valores tipo «Piso 03»: hay que sacarle el\n"
 "// número. «Planta Baja» no trae ninguno y vale 00 — el identificador de\n"
 "// ADR-0016 es numérico y así la planta baja sigue ordenando antes del piso 01.\n"
 "function _digitosFinales(v, ancho){\n"
 "  const t = String(v == null ? '' : v);\n"
 "  if (/planta\\s*baja/i.test(t)) return ''.padStart(ancho, '0');\n"
 "  const m = t.match(/(\\d+)\\s*$/);\n"
 "  return m ? m[1].padStart(ancho, '0') : '';\n"
 "}",
 "114b· «Planta Baja» vale 00 para el identificador")

# Un borrador guardado antes de esto trae «Piso 00», que ya no es una opción del
# desplegable: al abrirlo se quedaba vacío y el informe perdía el piso en
# silencio.
s = sustituir(s,
 "  ['fecha','convenio','empresa','piso','apto','obs_sp','obs_general'].forEach(id=>{",
 "  // Un borrador de antes trae «Piso 00», que ya no existe en el desplegable.\n"
 "  if (d.piso === 'Piso 00') d.piso = 'Planta Baja';\n"
 "  ['fecha','convenio','empresa','piso','apto','obs_sp','obs_general'].forEach(id=>{",
 "114c· un borrador viejo con «Piso 00» abre en Planta Baja")


# ── 115. El teléfono dice qué versión está usando ──────────────────────────
# Hasta ahora no había forma de saberlo, y eso importa el día de una prueba en
# campo: un teléfono que abrió el enlace UNA sola vez sigue sirviendo la copia
# vieja —el service worker entrega primero lo local y se trae lo nuevo por
# detrás—, y con una copia de antes del 31-ago el relevo RECHAZA el informe,
# porque el hito 6 le llega con una subpartida donde espera dos.
#
# La versión sale de `sw.js`, que es donde ya se sube al publicar: un solo sitio
# que tocar. Va pegada al indicador de conexión, que es lo que el inspector ya
# mira antes de enviar. Si ahí no dice nada, la copia es vieja: cerrar y volver
# a abrir.
VERSION = re.search(r"VERSION = 'garmel-inspeccion-(v\d+)'",
                    open(os.path.join(RAIZ, "sw.js"), encoding="utf-8").read()).group(1)

s = sustituir(s,
 "    el.textContent = '● en línea';",
 "    el.textContent = '● en línea · " + VERSION + "';",
 "115a· la versión al lado de «en línea»")

s = sustituir(s,
 "    el.textContent = '● sin señal — el informe queda guardado aquí';",
 "    el.textContent = '● sin señal · " + VERSION + " — el informe queda guardado aquí';",
 "115b· y también cuando no hay señal")


# ── 116. Un desplegable vacío guardaba su lista entera de opciones ─────────
# `gv()` leía `el.value || el.textContent`. El `||` estaba puesto para
# `nro-display`, que es un `div` y no tiene `value`. Pero en un `<select>` sin
# elegir, `el.value` es cadena vacía —falsa—, así que caía al `textContent`… que
# en un select son TODAS sus opciones pegadas.
#
# No es teórico. El 31-ago-2026 el informe de ámbito torre `SB-J07-260831-SG`
# guardó esto en el piso, y así viajó al `.json`, a la hoja de registro y a
# Smartsheet:
#
#   «— Seleccione —  Planta Baja  Piso 01  Piso 02 … Piso 20»
#
# Le pasaba a CUALQUIER desplegable que se enviara vacío —convenio, empresa,
# piso—, no solo en ámbito torre. Se distingue por lo que el elemento es, no por
# si su valor está vacío: los controles de formulario tienen `value`, y solo lo
# que no lo tiene se lee por texto.
s = sustituir(s,
 "  function gv(id){ const el=document.getElementById(id); return el ? (el.value||el.textContent||'') : ''; }",
 "  // Un control de formulario se lee por `value` AUNQUE esté vacío. El texto\n"
 "  // solo se usa para lo que no es un control —`nro-display` es un div—, o un\n"
 "  // desplegable sin elegir devolvía su lista entera de opciones.\n"
 "  function gv(id){\n"
 "    const el = document.getElementById(id);\n"
 "    if(!el) return '';\n"
 "    return ('value' in el) ? (el.value || '') : (el.textContent || '');\n"
 "  }",
 "116· un desplegable vacío devuelve vacío, no su lista de opciones")


# ── 117. El ingeniero residente deja de ser obligatorio para enviar ────────
# Pedido el 31-ago-2026. Además corrige una incoherencia del propio sistema:
# `PA-94` dice que **20 de las 46 torres no tienen residente** en el cuadro de
# Gerencia Técnica, y por eso el instrumento deja el campo en blanco en vez de
# heredarlo de la torre vecina. Exigirlo para enviar obligaba a inventar un
# nombre —en un documento que se firma— o a no enviar el informe.
#
# El inspector sigue siendo obligatorio: ese sí forma parte del identificador.
s = sustituir(s,
 "  if(typeof getResidentesValues === 'function' && !getResidentesValues().length) falta.push('Ingeniero residente');\n",
 "",
 "117· el residente ya no bloquea el envío")


# ── 118. El PDF salía con la maqueta del teléfono ──────────────────────────
# El 31-ago-2026, en las pruebas de campo, un informe impreso desde el teléfono
# salió en 11 páginas de tarjetas en vez de 4 de tabla: cada subpartida ocupaba
# un recuadro con «PROYECTADA / EJECUTADA / FALTANTE» uno debajo del otro.
#
# La causa: las reglas que convierten la tabla en tarjetas viven en
# `@media (max-width: 700px), (max-height: 520px), (pointer: coarse)`, SIN la
# palabra `screen`. Una consulta sin tipo de medio aplica a TODOS, impresión
# incluida — y `(pointer: coarse)` es verdadera en cualquier teléfono, mida lo
# que mida la hoja. Como esas reglas usan `!important`, le ganaban a las de
# `@media print` en todo lo que este no redefine, que es justo la maqueta.
#
# Con `screen and` delante de cada condición, la tarjeta se queda en la
# pantalla y el papel recupera su tabla. **El PDF deja de depender del aparato
# desde el que se imprime**, que es lo que tiene que pasar en un documento que
# se firma.
#
# De paso se le pone `screen` a las otras cuatro consultas de la hoja. Hoy son
# inofensivas —cuando se imprime, `max-width` se mide contra el ancho del papel,
# no del aparato—, pero son de la misma familia, y la regla que conviene poder
# dar por sentada es que **ninguna maqueta de pantalla llega al papel**.
for viejo, nuevo in [
    ("@media (max-width: 700px), (max-height: 520px), (pointer: coarse){",
     "@media screen and (max-width: 700px), screen and (max-height: 520px), screen and (pointer: coarse){"),
    ("@media (max-width:700px), (pointer:coarse){",
     "@media screen and (max-width:700px), screen and (pointer:coarse){"),
    ("@media (max-width: 480px) {",
     "@media screen and (max-width: 480px) {"),
    ("@media(max-width:700px),(max-height:520px){.hdr-btns .hbtn-mas{display:flex}}",
     "@media screen and (max-width:700px), screen and (max-height:520px){.hdr-btns .hbtn-mas{display:flex}}"),
    ("@media(max-width:700px){.grid3,.grid4,.grid2{grid-template-columns:1fr}}",
     "@media screen and (max-width:700px){.grid3,.grid4,.grid2{grid-template-columns:1fr}}"),
    ("@media(max-width:700px){.content{padding:8px}}",
     "@media screen and (max-width:700px){.content{padding:8px}}"),
]:
    s = sustituir(s, viejo, nuevo, "118· la maqueta de teléfono no se imprime: %s" % viejo[:38], -1)


# ── 119. Una fotografía no marcaba el informe como modificado ──────────────
# También de las pruebas del 31-ago: «para algunos usuarios no se guardaron las
# imágenes».
#
# `loadFoto` es asíncrono —lee el archivo, lo redibuja en un canvas y recién
# entonces lo pinta—, y ese camino **nunca llamaba a `_marcarCambio()`**. El
# evento `change` del campo sí programa un autoguardado, pero a los 2 segundos:
# si el teléfono tarda más en reducir la foto —una imagen grande en un aparato
# lento—, **el borrador se guarda sin ella y ya nada vuelve a dispararlo**. La
# foto queda solo en la pantalla; si el navegador desaloja la pestaña en
# segundo plano —que es exactamente lo que pasa en un teléfono con poca
# memoria—, se pierde.
#
# Se marca el cambio cuando la foto YA ESTÁ puesta, no cuando se elige el
# archivo. Y al quitarla, igual: borrar también es un cambio que hay que
# guardar.
s = sustituir(s,
 "function _pintarFoto(pid, fi, dato){\n"
 "  const img  = document.getElementById(`fimg_${pid}_${fi}`);\n"
 "  const slot = document.getElementById(`fslot_${pid}_${fi}`);\n"
 "  if(img){ img.src = dato; img.style.display = 'block'; }\n"
 "  if(slot){ const sp = slot.querySelector('span'); if(sp) sp.style.display = 'none'; }\n"
 "}",
 "function _pintarFoto(pid, fi, dato){\n"
 "  const img  = document.getElementById(`fimg_${pid}_${fi}`);\n"
 "  const slot = document.getElementById(`fslot_${pid}_${fi}`);\n"
 "  if(img){ img.src = dato; img.style.display = 'block'; }\n"
 "  if(slot){ const sp = slot.querySelector('span'); if(sp) sp.style.display = 'none'; }\n"
 "  // La foto entra tarde —reducirla lleva su tiempo— y para entonces el\n"
 "  // autoguardado del `change` ya pasó. Sin esto, el borrador se guarda sin\n"
 "  // ella y nada vuelve a intentarlo.\n"
 "  if(typeof _marcarCambio === 'function') _marcarCambio();\n"
 "}",
 "119a· una foto puesta marca el informe como modificado")

s = sustituir(s,
 "function removeFoto(pid,fi){\n"
 "  const img=document.getElementById(`fimg_${pid}_${fi}`);\n"
 "  const slot=document.getElementById(`fslot_${pid}_${fi}`);\n"
 "  img.src=''; img.style.display='none';\n"
 "  slot.querySelector('span').style.display='';\n"
 "  slot.querySelector('input').value='';\n"
 "}",
 "function removeFoto(pid,fi){\n"
 "  const img=document.getElementById(`fimg_${pid}_${fi}`);\n"
 "  const slot=document.getElementById(`fslot_${pid}_${fi}`);\n"
 "  img.src=''; img.style.display='none';\n"
 "  slot.querySelector('span').style.display='';\n"
 "  slot.querySelector('input').value='';\n"
 "  if(typeof _marcarCambio === 'function') _marcarCambio();\n"
 "}",
 "119b· y quitarla también")


# ── 120. «unidad…» no es una unidad ────────────────────────────────────────
# En el PDF del 31-ago, el acero de refuerzo salió rotulado «unidad…», que es
# el texto del desplegable cuando nadie ha elegido. En pantalla invita a
# elegir; en un documento firmado no dice nada. Se marca el desplegable como
# vacío —y se desmarca al elegir— para poder esconderlo solo en el papel.
s = sustituir(s,
 "    return ' <select class=\"ud-sel\" id=\"ud_' + pid + '_' + i + '\"' +\n"
 "           ' title=\"Unidad de medida de esta subpartida\" onchange=\"_marcarCambio()\">' +\n",
 "    return ' <select class=\"ud-sel\" id=\"ud_' + pid + '_' + i + '\" data-vacio=\"1\"' +\n"
 "           ' title=\"Unidad de medida de esta subpartida\" onchange=\"_unidadElegida(this)\">' +\n",
 "120a· el desplegable de unidad nace marcado como vacío")

s = sustituir(s,
 "function _esEstado(pid, i){ return (UNIDADES[pid] || [])[i] === UD_ESTADO; }\n",
 "function _esEstado(pid, i){ return (UNIDADES[pid] || [])[i] === UD_ESTADO; }\n"
 "\n"
 "// El papel no muestra el desplegable sin elegir: «unidad…» no es una unidad.\n"
 "function _unidadElegida(sel){\n"
 "  sel.dataset.vacio = sel.value ? '' : '1';\n"
 "  if(typeof _marcarCambio === 'function') _marcarCambio();\n"
 "}\n",
 "120b· y se desmarca al elegir")

s = sustituir(s,
 "            if(udSel && item.ud) udSel.value = item.ud;",
 "            if(udSel && item.ud){ udSel.value = item.ud; _unidadElegida(udSel); }",
 "120c· al abrir un borrador, la unidad guardada cuenta como elegida")

s = sustituir(s,
 "  .ud-sel{border:none!important;background:none!important;padding:0!important;margin-left:4px!important;"
 "color:#444!important;font-size:8.5px!important;font-weight:600!important;-webkit-appearance:none;appearance:none}",
 "  .ud-sel{border:none!important;background:none!important;padding:0!important;margin-left:4px!important;"
 "color:#444!important;font-size:8.5px!important;font-weight:600!important;-webkit-appearance:none;appearance:none}\n"
 "  .ud-sel[data-vacio=\"1\"]{display:none!important}",
 "120d· en el papel, sin unidad elegida no se imprime nada")


# ── 121. Un nombre largo de empresa se cortaba en el papel ─────────────────
# En el PDF del 31-ago, «PROYECTOS Y CONSTRUCCIONES AROA 93, C.A.» salió
# recortado a media palabra. La causa no es el ancho: es que en el papel esos
# campos se siguen imprimiendo como `<select>`, y **un desplegable no envuelve
# el texto**, lo recorta. Le pasa a los tres del encabezado —convenio, empresa,
# inspector—, y el que más duele es el nombre de la contratista, que es lo que
# identifica a quién se le está inspeccionando la obra.
#
# El valor se copia al contenedor en cada cambio, y en impresión se imprime ese
# texto —que sí envuelve— en vez del control. No depende de `beforeprint`, que
# no siempre llega.
s = sustituir(s,
 "// El inspector necesita saber si «Enviar» va a funcionar antes de tocarlo.",
 "// Un <select> no envuelve el texto: lo recorta. Como en el papel los campos\n"
 "// del encabezado se imprimen como controles, un nombre largo de empresa salía\n"
 "// cortado. Se copia el valor al contenedor para poder imprimirlo como texto.\n"
 "function _valorAlPapel(el){\n"
 "  const campo = el && el.closest && el.closest('.field, .meta-card');\n"
 "  if(campo) campo.dataset.valor = el.value || '';\n"
 "}\n"
 "\n"
 "function _todosLosValoresAlPapel(){\n"
 "  document.querySelectorAll('.field select, .meta-card select').forEach(_valorAlPapel);\n"
 "}\n"
 "\n"
 "document.addEventListener('change', function(e){\n"
 "  if(e.target && e.target.tagName === 'SELECT') _valorAlPapel(e.target);\n"
 "}, true);\n"
 "\n"
 "// El inspector necesita saber si «Enviar» va a funcionar antes de tocarlo.",
 "121a· el valor del desplegable se copia al contenedor")

# Al abrir un borrador los valores se ponen por código, que no dispara `change`.
# Y justo antes de imprimir, sin depender de cómo se hayan puesto los valores:
# «Guardar y siguiente» y el cambio de ámbito los reponen por código, que no
# dispara `change`.
s = sustituir(s,
 "function imprimirInforme(){\n"
 "  const falta = camposFaltantes();",
 "function imprimirInforme(){\n"
 "  _todosLosValoresAlPapel();\n"
 "  const falta = camposFaltantes();",
 "121d· y se refrescan justo antes de imprimir")

s = sustituir(s,
 "  closeSavedModal();\n"
 "  showToast('📂 Borrador cargado correctamente para edición', 'ok');",
 "  _todosLosValoresAlPapel();\n"
 "  closeSavedModal();\n"
 "  showToast('📂 Borrador cargado correctamente para edición', 'ok');",
 "121b· y al abrir un borrador, también")

s = sustituir(s,
 "  .field input, .field select, .meta-card input, .meta-card select{",
 "  /* El desplegable no se imprime: se imprime su valor, que sí envuelve. */\n"
 "  .field select, .meta-card select{display:none!important}\n"
 "  .field[data-valor]::after, .meta-card[data-valor]::after{\n"
 "    content:attr(data-valor); display:block;\n"
 "    border-bottom:1px dotted #b9c0cc; padding:1px 0;\n"
 "    font-size:11px; font-weight:700; color:#111;\n"
 "    word-break:normal; overflow-wrap:break-word; line-height:1.25;\n"
 "  }\n"
 "  .field input, .field select, .meta-card input, .meta-card select{",
 "121c· en el papel va el texto, no el control")


# ── 122. Se acabó lo de abrir el enlace dos veces ──────────────────────────
# El service worker sirve primero la copia local —por eso abre sin señal y al
# instante— y se trae la nueva por detrás. La consecuencia era que **una versión
# nueva no se veía hasta la segunda apertura**, y quien abría una sola vez
# trabajaba con la anterior sin enterarse. El 31-ago pasó de verdad: un teléfono
# en v33 mandaba informes que el relevo rechazaba.
#
# Lo que NO se hizo, y por qué: pedir el documento a la red primero. Habría
# resuelto lo mismo, pero el archivo pesa 226 KB y en una torre con señal mala
# eso son segundos de espera **en cada apertura**, todos los días, para algo que
# cambia una vez por semana. Se paga caro un problema raro.
#
# Lo que se hace: el service worker **avisa** cuando termina de instalar una
# versión nueva, y la página decide.
#
#   · Si nadie ha tocado el formulario, se recarga sola. El inspector que abre
#     por la mañana ve la última sin hacer nada.
#   · Si hay algo escrito, NO se toca: aparece un aviso para actualizar cuando
#     convenga. Recargar encima de un informe a medio llenar sería peor que la
#     versión vieja.
s = sustituir(s,
 "// El inspector necesita saber si «Enviar» va a funcionar antes de tocarlo.",
 "// ¿Alguien escribió algo en este informe? Distinto de «hay cambios sin\n"
 "// guardar»: eso se apaga solo al autoguardar, y aquí hace falta saber si la\n"
 "// pantalla está virgen para poder recargarla sin quitarle trabajo a nadie.\n"
 "let _huboInteraccion = false;\n"
 "\n"
 "function _avisarVersionNueva(){\n"
 "  if(!_huboInteraccion && !_hayCambiosSinGuardar){ location.reload(); return; }\n"
 "  const b = document.getElementById('aviso-version');\n"
 "  if(b) b.style.display = 'flex';\n"
 "}\n"
 "\n"
 "if('serviceWorker' in navigator){\n"
 "  navigator.serviceWorker.addEventListener('message', function(e){\n"
 "    if(e.data && e.data.garmel === 'version-nueva') _avisarVersionNueva();\n"
 "  });\n"
 "}\n"
 "\n"
 "// El inspector necesita saber si «Enviar» va a funcionar antes de tocarlo.",
 "122a· la página escucha al service worker y decide")

s = sustituir(s,
 "function _marcarCambio(){\n"
 "  _hayCambiosSinGuardar = true;",
 "function _marcarCambio(){\n"
 "  _huboInteraccion = true;\n"
 "  _hayCambiosSinGuardar = true;",
 "122b· tocar el formulario cuenta como interacción")

# El aviso va encima de la barra de acciones, no dentro: la zona del pulgar es
# para llenar el informe, no para avisos.
s = sustituir(s,
 '  <div class="hdr-btns">',
 '  <div class="hdr-btns">\n'
 '<div id="aviso-version" onclick="location.reload()" title="Tocar para actualizar"\n'
 '     style="display:none;align-items:center;justify-content:center;gap:8px;cursor:pointer;\n'
 '            min-height:44px;background:#f9a825;color:#1a1a1a;font-size:13px;font-weight:800;\n'
 '            padding:10px 16px;border-bottom:1px solid rgba(0,0,0,.15)">\n'
 '  ⟳ Hay una versión nueva — tocar para actualizar\n'
 '</div>',
 "122c· el aviso, cuando hay algo escrito y no se puede recargar solo")

# En el teléfono las acciones viven pegadas al borde inferior. El aviso se cuelga
# JUSTO ENCIMA de ellas, no del borde de la pantalla: tapar «Enviar» con un aviso
# de mantenimiento sería peor que la versión vieja.
s = sustituir(s,
 "  /* Y el contenido deja sitio para no quedar debajo de la barra. */\n"
 "  body{padding-bottom:150px}",
 "  /* Y el contenido deja sitio para no quedar debajo de la barra. */\n"
 "  body{padding-bottom:150px}\n"
 "  /* El aviso se cuelga del borde superior de la barra —encima de las\n"
 "     acciones, nunca sobre ellas—: tapar «Enviar» con un aviso de\n"
 "     mantenimiento sería peor que quedarse con la versión vieja. */\n"
 "  #aviso-version{\n"
 "    position:absolute; left:0; right:0; bottom:100%;\n"
 "    border-bottom:none; box-shadow:0 -3px 10px rgba(0,0,0,.25);\n"
 "  }\n"
 "  .hdr-btns{ overflow:visible }",
 "122c2· en el teléfono, justo encima de las acciones y sin taparlas")

# En el papel no existe.
s = sustituir(s,
 "  #aviso-ambito{display:none!important}",
 "  #aviso-version{display:none!important}\n"
 "  #aviso-ambito{display:none!important}",
 "122d· y no sale en el PDF")


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

# ══════════════════════════════════════════════════════════════════════════
# 14. ORTOGRAFÍA Y VOCABULARIO — 30-ago-2026
#
# Sale de la primera prueba en manos de alguien que no había visto el
# formulario (Francisco José García Guinand) y de una revisión ortográfica
# completa. Lo que se corrige aquí es de dos clases distintas:
#
#   · erratas del original, que se arreglan sin consultar a nadie;
#   · nombres propios, que se alinean al maestro de Smartsheet. Esto último
#     NO es cosmético: el relevo escribe en Smartsheet el nombre que el
#     formulario tiene, y si difiere en una coma no agrupa con el maestro.
# ══════════════════════════════════════════════════════════════════════════

# ── 14a. «Bielorrusos» lleva dos erres. Viene mal del original, 37 veces ──
s = sustituir(s, "Bielorusos", "Bielorrusos",
              "14a· Bielorusos → Bielorrusos (todas)", -1)

# ── 14b. Nombres de empresa, exactamente como en MAE_Contratistas ─────────
# ⚠️ TESURU sale del Cuadro Resumen del 28-ago; el resto de las fuentes dice
#    TSURU. Se sigue el maestro, pero está pendiente de confirmar cuál es.
for viejo, nuevo, etq in [
    ("ING & ARQ 1111, C.A.", "ING&ARQ 1111, C.A.", "14b1· ING&ARQ, como el maestro"),
    ("JVR INGENIERÍA C,A.",  "JVR INGENIERÍA, C.A.", "14b2· JVR: la coma iba antes del C.A."),

]:
    s = sustituir(s, viejo, nuevo, etq, -1)

# ── 14c. Nombres de ingenieros residentes, como en MAE_Torres ─────────────
for viejo, nuevo in [
    ("ING.ASTRID LARES",   "ING. ASTRID LARES"),
    ("ING.RADAMEZ RIVAS",  "ING. RADAMEZ RIVAS"),
    ("ING FELIX PINTO",    "ING. FELIX PINTO"),
    ("ING HARRY ARTEAGA",  "ING. HARRY ARTEAGA"),
    ("ING MANUEL PAEZ",    "ING. MANUEL PAEZ"),
    ("ING JOSE V GONZALES","ING. JOSE V. GONZALES"),
    ("ING MARIA T MARCANO","ING. MARIA T. MARCANO"),
    ("ING. JOANNY TAPIA / ING. JHOANNY LOPEZ",  "ING. JOANNY TAPIA · ING. JHOANNY LOPEZ"),
    ("ING. JUAN COLMENARES ARQ EVER AVENDAÑO",  "ING. JUAN COLMENARES · ARQ. EVER AVENDAÑO"),
]:
    s = sustituir(s, viejo, nuevo, "14c· residente: %s" % nuevo, -1)

# ── 14d. «Subitems» es un anglicismo, y el formulario ya se contradecía ───
# En un mensaje decía «subpartidas medidas» y en cinco sitios «subitems».
# Subpartida es el término de ADR-0018 y el de todo el resto del sistema.
for viejo, nuevo, etq in [
    ("HITOS Y SUBITEMS", "HITOS Y SUBPARTIDAS", "14d1· título"),
    ("Hitos y Subitems del Excel", "Hitos y Subpartidas del Excel", "14d2· subtítulo"),
    ("los subitems inspeccionados", "las subpartidas inspeccionadas", "14d3· ayuda del hito"),
    ("Descripción del subitem...", "Descripción de la subpartida...", "14d4· placeholder"),
    ("Eliminar subitem", "Eliminar subpartida", "14d5· botón"),
    ("Subitem / Descripción", "Subpartida / Descripción", "14d6· cabecera de la tabla"),
    ("Agregar subitem adicional", "Agregar subpartida adicional", "14d7· botón de agregar"),
    ("los hitos y subitems del Excel", "los hitos y subpartidas del Excel", "14d8· comentario del código"),
]:
    s = sustituir(s, viejo, nuevo, etq, -1)

print("  … 14 aplicado")

# ══════════════════════════════════════════════════════════════════════════
# 15. LO QUE LA PRIMERA PRUEBA DE CAMPO DEJÓ EN EVIDENCIA — 30-ago-2026
#
# Tres tropiezos de alguien que llenaba el formulario por primera vez. Los
# tres son de lo mismo: la interfaz decía una cosa y hacía otra.
# ══════════════════════════════════════════════════════════════════════════

# ── 15a. Los botones B/R/M parecían deshabilitados ────────────────────────
# Estaban en gris #bbb sobre fondo #f5f5f5: contraste ~2:1, menos de la mitad
# del mínimo legible, y exactamente el aspecto convencional de un control que
# no se puede pulsar. Hubo que decirle que sí funcionaban. Ahora el estado sin
# elegir se lee como «pulsable pero vacío», y cada letra insinúa su color.
s = sustituir(s,
".ev-btn{padding:4px 9px;border:1.5px solid #ddd;border-radius:11px;font-size:11px;font-weight:800;cursor:pointer;background:#f5f5f5;color:#bbb;transition:all .12s}",
".ev-btn{padding:4px 9px;border:2px solid #78909c;border-radius:11px;font-size:11px;font-weight:800;cursor:pointer;background:#fff;color:#263238;transition:all .12s}",
 "15a· los botones de evaluación no parecen deshabilitados")

s = sustituir(s,
".ev-btn.NA{border-color:#bdbdbd}",
".ev-btn.B{border-color:#43a047;color:#1b5e20}"
".ev-btn.R{border-color:#ef6c00;color:#bf360c}"   # 5,6:1 sobre blanco; #e65100 daba 3,8
".ev-btn.M{border-color:#e53935;color:#b71c1c}"
".ev-btn.NA{border-color:#78909c;color:#37474f}",
 "15a2· cada letra insinúa su color desde antes de pulsarla")

# ── 15b. Un hito «no inspeccionado» se veía gris y sin explicación ────────
# Se marcaba sin querer, y al desplegarlo aparecía todo apagado y sin poder
# escribir, sin decir por qué ni cómo revertirlo. El aviso se pone DENTRO del
# cuerpo pero como ::before, que no lo alcanza el atenuado de los hijos.
s = sustituir(s,
".partida.no-inspeccionada .p-body{opacity:.38;pointer-events:none}",
".partida.no-inspeccionada .p-body{pointer-events:none}"
".partida.no-inspeccionada .p-body > *{opacity:.38}"
".partida.no-inspeccionada .p-body::before{content:'Este hito está marcado como NO INSPECCIONADO, "
"así que no cuenta para el promedio. Para poder llenarlo, toca otra vez el botón de la cabecera.';"
"display:block;margin:10px 12px 0;padding:10px 12px;border-radius:8px;background:#fff8e1;"
"border:1.5px solid #ffb300;color:#4e342e;font-size:13px;font-weight:600;line-height:1.45}",
 "15b· decir por qué el hito está apagado y cómo revertirlo")

# ── 15c. «Enviar» no decía que estuviera enviando ─────────────────────────
# El botón sí se deshabilitaba, así que no llegó a duplicar nada, pero eso no
# se ve: se pulsó varias veces porque el envío tarda unos segundos y lo único
# que aparecía era una línea de texto plano al pie.
s = sustituir(s,
".m-btn{flex:1;padding:10px;border:none;border-radius:8px;font-size:13px;font-weight:800;cursor:pointer}",
".m-btn{flex:1;padding:10px;border:none;border-radius:8px;font-size:13px;font-weight:800;cursor:pointer}"
".m-btn:disabled{opacity:.6;cursor:progress;filter:grayscale(.35)}",
 "15c1· un botón deshabilitado tiene que verse deshabilitado")

s = sustituir(s,
"""  const btn   = document.getElementById('btn-enviar-relevo');

  if(!clave){ alert('Escriba la clave de env\u00edo.'); return; }""",
"""  const btn   = document.getElementById('btn-enviar-relevo');

  // Segunda defensa contra el doble env\u00edo. La primera es que el bot\u00f3n queda
  // deshabilitado; esta cubre que se llame por cualquier otra v\u00eda.
  if(btn.disabled) return;

  if(!clave){ alert('Escriba la clave de env\u00edo.'); return; }""",
 "15c2· no reenviar si ya hay un envío en curso")

s = sustituir(s,
"""  btn.disabled = true;

  // Con se\u00f1al mala un env\u00edo puede quedarse esperando para siempre.""",
"""  const textoBtn = btn.innerHTML;
  btn.innerHTML = '\u23f3 Enviando\u2026';
  btn.disabled = true;

  // Con se\u00f1al mala un env\u00edo puede quedarse esperando para siempre.""",
 "15c3· el botón dice «Enviando…» mientras dura")

s = sustituir(s,
"""  } finally {
    clearTimeout(reloj);
    btn.disabled = false;
  }""",
"""  } finally {
    clearTimeout(reloj);
    btn.disabled = false;
    btn.innerHTML = textoBtn;
  }""",
 "15c4· y vuelve a su texto al terminar")

print("  … 15 aplicado")


# ══════════════════════════════════════════════════════════════════════════
# 17. EDITAR UN INFORME NO DEBE DUPLICARLO — 31-ago-2026
#
# Reportado por Skarlet Gómez tras las pruebas de campo: «cuando abrimos para
# editar se genera un duplicado; debería abrirse ese mismo archivo y guardar el
# cambio a medida que editemos».
#
# La causa NO es el guardado. `saveDraft` busca por `id` y actualiza en su sitio,
# y eso funciona. Es `_separarSiCambioElInforme()`: vigila el número del informe
# y, si cambia mientras se edita un borrador que ya tiene contenido, da por hecho
# que es OTRO informe y le abre ficha nueva.
#
# Esa vigilancia existe por un motivo real, y hay que conservarla: el inspector
# que termina un apartamento y, sin pulsar «siguiente apto.», cambia el número y
# sigue llenando. Sin ella, el segundo se guardaba ENCIMA del primero.
#
# Lo que no sabe distinguir es esa situación de la contraria: abrir un informe
# guardado para CORREGIRLE algo. Como el número se compone de torre, piso,
# apartamento, fecha e inspector, enmendar cualquiera de esos campos lo cambia
# —que es justo lo que uno va a hacer al abrir un informe a corregir— y el
# formulario reacciona como si hubiera empezado uno nuevo.
#
# Se arregla distinguiéndolas, no quitando la protección. Un informe abierto
# desde «Mis informes» queda marcado como EN EDICIÓN y no se separa nunca;
# llenar de corrido sigue protegido igual que antes. Y no hace falta inventar
# cómo se sale de ese estado: ya existen tres acciones explícitas que cierran el
# informe —«siguiente apto.», «limpiar» y «finalizar»—, más el borrado del propio
# borrador. Las cuatro levantan la marca.
# ══════════════════════════════════════════════════════════════════════════
s = sustituir(s,
 "let _numeroDelBorrador = null;",
 "let _numeroDelBorrador = null;\n"
 "\n"
 "// Un informe abierto desde «Mis informes» se está CORRIGIENDO, no llenando de\n"
 "// corrido: cambiarle el piso o la fecha es enmendar este informe, no empezar\n"
 "// otro. Mientras esta marca esté puesta, no se separa jamás.\n"
 "let _abiertoParaEditar = false;",
 "17a· marca de informe abierto para editar")

s = sustituir(s,
 """function _separarSiCambioElInforme(){
  if(currentEditingIndex === null) return;""",
 """function _separarSiCambioElInforme(){
  if(_abiertoParaEditar) return;   // se corrige este informe, no se empieza otro
  if(currentEditingIndex === null) return;""",
 "17b· no separar lo que se abrió para editar")

s = sustituir(s,
 """  currentEditingIndex = index;
  _idEnEdicion = d.id || null;""",
 """  currentEditingIndex = index;
  _idEnEdicion = d.id || null;
  _abiertoParaEditar = true;""",
 "17c· al abrir para editar, marcarlo")

s = sustituir(s,
 """  currentEditingIndex = null;        // el siguiente no lo pisa
  _idEnEdicion = null;
  _numeroDelBorrador = null;""",
 """  currentEditingIndex = null;        // el siguiente no lo pisa
  _idEnEdicion = null;
  _numeroDelBorrador = null;
  _abiertoParaEditar = false;""",
 "17d· «siguiente apto.» levanta la marca")

s = sustituir(s,
 """  currentEditingIndex = null;
  _idEnEdicion = null;
  document.getElementById('fecha').value = '';""",
 """  currentEditingIndex = null;
  _idEnEdicion = null;
  _abiertoParaEditar = false;
  document.getElementById('fecha').value = '';""",
 "17e· «limpiar» levanta la marca")

s = sustituir(s,
 """    currentEditingIndex = null;   // el siguiente informe no pisa al que acaba de cerrarse
    _numeroDelBorrador = null;""",
 """    currentEditingIndex = null;   // el siguiente informe no pisa al que acaba de cerrarse
    _numeroDelBorrador = null;
    _abiertoParaEditar = false;""",
 "17f· «finalizar» levanta la marca")

s = sustituir(s,
 """  if(currentEditingIndex === index){ currentEditingIndex = null; _idEnEdicion = null; }""",
 """  if(currentEditingIndex === index){ currentEditingIndex = null; _idEnEdicion = null; _abiertoParaEditar = false; }""",
 "17g· borrar el borrador en edición levanta la marca")

print("  … 17 aplicado")


# ══════════════════════════════════════════════════════════════════════════
# 19. LA TORRE PRIMERO, Y LA CASCADA AL REVÉS — 1-sep-2026
#
# Pedido por Skarlet Gómez: «Torre debe estar al inicio, ya que si no nos
# sabemos el nombre de la empresa o ingeniero, al colocar el nro de una vez se
# llenan los demás campos».
#
# El formulario iba justo al revés: se elegía convenio, eso recortaba la lista
# de empresas, y la empresa recortaba la de torres. El inspector que llega a una
# torre y no sabe de qué empresa es —que es el caso normal— no podía empezar por
# lo único que sí sabe. Ahora la torre es el primer campo y fija las tres cosas:
# convenio, empresa y residente. Salen rellenas y se pueden cambiar, por si en
# obra la ejecuta otra.
#
# CUATRO TORRES NO ADMITEN ESO, y no es descuido nuestro: T-04, T-07, T-12 y
# T-13 están en el maestro con DOS convenios y DOS empresas cada una. Es la
# contradicción C-06/C-24 del repositorio de contexto —«el número de torre no
# identifica una torre: hace falta el sector»—, que sigue sin resolverse. Ahí no
# se adivina: el desplegable de convenio se queda con las dos zonas posibles y
# un aviso, y al elegir una se llenan empresa y residente como en las demás.
# ══════════════════════════════════════════════════════════════════════════

# 18a/b · la torre sale de donde estaba y pasa a ser el primer campo
_ini_t = s.index('    <div class="field">\n      <label>Torre *</label>')
_fin_t = s.index('    <div class="field">\n      <label>Piso *</label>')
if not (_ini_t < _fin_t):
    sys.exit("✗ 19: el bloque de la torre no precede al del piso")
_bloque_torre = s[_ini_t:_fin_t]
s = s[:_ini_t] + s[_fin_t:]
cambios.append("19a· sacar la torre del bloque de ámbito")
s = sustituir(s,
 '    <div class="field">\n      <label>Fecha de inspección *</label>',
 _bloque_torre + '    <div class="field">\n      <label>Fecha de inspección *</label>',
 "19b· la torre, primer campo del informe")

# 18c/d · el convenio baja a donde está la empresa: los dos los llena la torre
_ini_c = s.index('    <div class="field">\n      <label>Convenio *</label>')
_fin_c = s.index('  </div>\n\n  <div class="sec-lbl">Empresa y Personal</div>')
if not (_ini_c < _fin_c):
    sys.exit("✗ 19: el bloque del convenio no está donde se esperaba")
_bloque_conv = s[_ini_c:_fin_c]
s = s[:_ini_c] + s[_fin_c:]
cambios.append("19c· sacar el convenio de la cabecera")
s = sustituir(s,
 '    <div class="field">\n      <label>Empresa ejecutora *</label>',
 _bloque_conv + '    <div class="field">\n      <label>Empresa ejecutora *</label>',
 "19d· el convenio, junto a la empresa que determina")

# 18e · el aviso de las torres que están en dos zonas
s = sustituir(s,
 '      <label>Convenio *</label>\n      <select id="convenio"',
 '      <label>Convenio *</label>\n'
 '      <span id="aviso-zona" style="display:none;font-size:11.5px;font-weight:600;color:#8f4b00;margin-bottom:4px"></span>\n'
 '      <select id="convenio"',
 "19e· aviso de torre en dos zonas")

# 18f · el bloque de ámbito se queda con tres campos, no cuatro
s = sustituir(s, '<div class="grid4">', '<div class="grid3">',
 "19f· el bloque de ámbito pasa a tres columnas")

# ── 18g. filtrarPorConvenio deja de recortar la lista de torres ─────────────
# Recortarla es lo que impedía empezar por la torre: la que el inspector tiene
# delante desaparecía de la lista si el convenio elegido no era el suyo.
s = sustituir(s,
 """  const empSel = document.getElementById('empresa');
  const torSel = document.getElementById('torre');

  const prevEmp = empSel.value;
  const prevTor = torSel.value;

  empSel.innerHTML = '<option value="">— Seleccione —</option>';
  torSel.innerHTML = '<option value="">— Seleccione —</option>';""",
 """  const empSel = document.getElementById('empresa');

  // La lista de torres YA NO se recorta. La torre es el primer campo y es ella
  // la que fija el convenio: recortarla aquí volvería a esconder justo la que
  // el inspector tiene delante.
  const prevEmp = empSel.value;

  empSel.innerHTML = '<option value="">— Seleccione —</option>';""",
 "19g1· no vaciar la lista de torres")

s = sustituir(s,
 """    cdata.torres.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t; opt.textContent = t;
      torSel.appendChild(opt);
    });
  } else {""",
 """  } else {""",
 "19g2· no rellenar torres desde el convenio")

s = sustituir(s,
 """    const allEmpresas = [], allTorres = [];
    Object.values(CONVENIO_DATA).forEach(cd => {
      Object.keys(cd.empresas).forEach(e => { if (!allEmpresas.includes(e)) allEmpresas.push(e); });
      cd.torres.forEach(t => { if (!allTorres.includes(t)) allTorres.push(t); });
    });""",
 """    const allEmpresas = [];
    Object.values(CONVENIO_DATA).forEach(cd => {
      Object.keys(cd.empresas).forEach(e => { if (!allEmpresas.includes(e)) allEmpresas.push(e); });
    });""",
 "19g3· ya no se acumulan todas las torres")

s = sustituir(s,
 """    allTorres.sort().forEach(t => {
      const opt = document.createElement('option');
      opt.value = t; opt.textContent = t;
      torSel.appendChild(opt);
    });
  }
""",
 """  }
""",
 "19g4· quitar el volcado de todas las torres")

s = sustituir(s,
 """  const noReg = document.createElement('option');
  noReg.value = 'NO_REG';
  noReg.textContent = '⚠️ No registrada — ingresar manualmente';
  noReg.style.color = '#8f4b00';
  noReg.style.fontWeight = '700';
  torSel.appendChild(noReg);

  if (prevEmp && Array.from(empSel.options).some(o => o.value === prevEmp)) empSel.value = prevEmp;
  else empSel.value = '';

  if (prevTor && Array.from(torSel.options).some(o => o.value === prevTor)) torSel.value = prevTor;
  else torSel.value = '';
""",
 """  // «No registrada» ya vive en el HTML: la lista de torres no se reconstruye.
  // Y la empresa que el maestro le asigna a ESTA torre gana, que es el punto de
  // todo esto. Si no está en la lista, se respeta la que hubiera.
  const _tor = (document.getElementById('torre') || {}).value || '';
  // Con la zona SIN elegir no se deduce nada: empresaDeTorre ignora el
  // convenio cuando llega vacío y devolvería la primera fila de la torre, que
  // en las cuatro ambiguas es adivinar a cara o cruz.
  const _empMaestro = (conv && typeof empresaDeTorre === 'function') ? empresaDeTorre(conv, _tor) : '';
  if (_empMaestro && Array.from(empSel.options).some(o => o.value === _empMaestro)) empSel.value = _empMaestro;
  else if (prevEmp && Array.from(empSel.options).some(o => o.value === prevEmp)) empSel.value = prevEmp;
  else empSel.value = '';
""",
 "19g5· la empresa la pone la torre")

# ── 18h. La torre rellena convenio, empresa y residente ────────────────────
s = sustituir(s,
 """function handleTorreChange() {""",
 """// Las zonas del maestro en las que figura una torre. Son DOS en T-04, T-07,
// T-12 y T-13 —contradicción C-06/C-24, todavía abierta—, y ahí no se adivina.
function _zonasDeTorre(t){
  if (typeof TORRES === 'undefined' || !t || t === 'NO_REG') return [];
  const z = [];
  TORRES.forEach(function(f){ if (f.t === t && f.c && z.indexOf(f.c) === -1) z.push(f.c); });
  return z;
}

// Las zonas se leen del propio desplegable la primera vez, no se escriben aquí:
// así no hay una segunda lista que mantener al día.
let _zonasTodas = null;
function _opcionesDeConvenio(permitidas){
  const sel = document.getElementById('convenio');
  if (!sel) return;
  if (_zonasTodas === null) {
    _zonasTodas = Array.prototype.slice.call(sel.options)
      .map(function(o){ return o.value; }).filter(Boolean);
  }
  const previo = sel.value;
  const lista = (permitidas && permitidas.length) ? permitidas : _zonasTodas;
  sel.innerHTML = '<option value="">— Seleccione —</option>';
  lista.forEach(function(c){
    const o = document.createElement('option');
    o.value = c; o.textContent = c;
    sel.appendChild(o);
  });
  if (previo && Array.prototype.slice.call(sel.options).some(function(o){ return o.value === previo; })) {
    sel.value = previo;
  }
}

function _rellenarDesdeLaTorre(t){
  const convSel = document.getElementById('convenio');
  const avisoZ  = document.getElementById('aviso-zona');
  if (!convSel) return;
  const zonas = _zonasDeTorre(t);

  if (zonas.length === 1) {
    _opcionesDeConvenio(null);
    convSel.value = zonas[0];
    _convenioPrevio = zonas[0];
    if (avisoZ) avisoZ.style.display = 'none';
    filtrarPorConvenio();          // y con el convenio caen empresa y residente
    return;
  }

  if (zonas.length > 1) {
    // Dos zonas posibles. No se elige por el inspector: se le dan las dos.
    _opcionesDeConvenio(zonas);
    convSel.value = '';
    _convenioPrevio = '';
    // La empresa de la torre anterior no puede quedarse: se leería como que ya
    // está contestado, y aquí justamente no lo está.
    const _e = document.getElementById('empresa'); if (_e) _e.value = '';
    if (avisoZ) {
      avisoZ.textContent = '⚠️ La torre ' + t + ' figura en dos zonas del maestro. Elija cuál y se llenan empresa y residente.';
      avisoZ.style.display = 'block';
    }
    filtrarPorConvenio();
    return;
  }

  // Sin torre, o una que no está en el maestro: se devuelven todas las zonas y
  // no se toca nada de lo que haya escrito el inspector.
  _opcionesDeConvenio(null);
  if (avisoZ) avisoZ.style.display = 'none';
}

function handleTorreChange() {""",
 "19h· la torre fija zona, empresa y residente")

s = sustituir(s,
 """  // La empresa la determina la torre, no al revés: antes el inspector de la
  // Torre 01 no tenía a Río Limón en la lista porque la torre estaba en otro
  // convenio. Se preselecciona la que asigna el cuadro y se puede cambiar, por
  // si en obra la ejecuta otra.
  const conv   = document.getElementById('convenio').value;
  const emp    = empresaDeTorre(conv, val);
  const empSel = document.getElementById('empresa');
  if (emp && empSel && Array.prototype.slice.call(empSel.options).some(function(o){ return o.value === emp; })) {
    empSel.value = emp;
  }
  autoResidenteConv();""",
 """  // La torre manda: fija la zona y, con ella, empresa y residente. El
  // inspector que solo sabe en qué torre está ya puede empezar por ahí.
  _rellenarDesdeLaTorre(val);
  autoResidenteConv();""",
 "19i· handleTorreChange delega en la torre")

# 18j · al abrir un borrador, devolver las tres zonas antes de restaurar: si
# quedaron recortadas por la torre anterior, el convenio guardado no entraría.
s = sustituir(s,
 """  ['fecha','convenio','empresa','piso','apto','obs_sp','obs_general'].forEach(id=>{""",
 """  if (typeof _opcionesDeConvenio === 'function') _opcionesDeConvenio(null);
  ['fecha','convenio','empresa','piso','apto','obs_sp','obs_general'].forEach(id=>{""",
 "19j· restaurar un borrador con todas las zonas disponibles")

print("  … 19 aplicado")


# ══════════════════════════════════════════════════════════════════════════
# 123. TRES COSAS QUE ENCONTRÓ EL CONTROL DE CALIDAD DEL 1-SEP — 1-sep-2026
#
# Veinte comprobaciones sobre la v40, medidas en el navegador a 375×812 y sobre
# el PDF real. Estas son las tres que fallaron.
# ══════════════════════════════════════════════════════════════════════════

# ── 123a. El desplegable de unidad medía 34 px ─────────────────────────────
# Era el ÚNICO control de llenado por debajo de 44 px con los once hitos
# abiertos —392 controles visibles, uno solo corto—. Es el del acero, la
# subpartida que admite dos unidades (ADR-0024), así que hay que tocarlo de
# verdad. La otra excepción, la pastilla de «no inspeccionado» a 32 px, sigue
# siendo deliberada: vive dentro de la cabecera que abre el hito.
s = sustituir(s,
 ".ud-sel{margin-left:6px;min-height:34px;",
 ".ud-sel{margin-left:6px;min-height:44px;",
 "123a· el selector de unidad llega a 44 px")

# En el papel no: ahí un alto de 44 px engordaría la fila sin motivo.
s = sustituir(s,
 "  .ud-sel{border:none!important;background:none!important;padding:0!important;margin-left:4px!important;"
 "color:#444!important;font-size:8.5px!important;font-weight:600!important;-webkit-appearance:none;appearance:none}",
 "  .ud-sel{border:none!important;background:none!important;padding:0!important;margin-left:4px!important;"
 "min-height:0!important;"
 "color:#444!important;font-size:8.5px!important;font-weight:600!important;-webkit-appearance:none;appearance:none}",
 "123a2· y en el papel vuelve a su alto natural", -1)

# ── 123b. El tic verde decía «bien» donde no se sabía nada ─────────────────
# Con cantidad ejecutada pero SIN proyectada, la fila pintaba un ✓ VERDE en la
# columna de avance y un «0» verde en la de faltante. Las dos cosas se leen como
# aprobación —«esto está completo, no falta nada»— cuando lo cierto es que **no
# se puede saber**: sin proyectada no hay porcentaje ni faltante.
#
# No es un caso raro: hoy es el caso de TODOS los informes, porque la cantidad
# proyectada por apartamento no está definida (`PA-101`). El inspector ve una
# pantalla llena de tics verdes que no significan nada.
#
# Y contradecía al papel: el informe oficial deja esa celda vacía y explica
# arriba por qué. Ahora las dos dicen lo mismo — un guion gris—, que es el
# invariante que este sistema tiene que sostener: pantalla y documento no pueden
# decir cosas distintas del mismo dato.
s = sustituir(s,
 """  if(pr>0||ej>0){
    fltEl.textContent=falt;
    fltEl.style.color=falt>0?'#e65100':'#2e7d32';
  } else {
    fltEl.textContent='—'; fltEl.style.color='#aaa';
  }""",
 """  // Sin cantidad proyectada no se sabe cuánto falta. Antes bastaba con que
  // hubiera ejecutada, y entonces «faltante» salía 0 en verde: «no falta nada»,
  // dicho sobre algo que nadie ha medido.
  if(pr>0){
    fltEl.textContent=falt;
    fltEl.style.color=falt>0?'#e65100':'#2e7d32';
  } else {
    fltEl.textContent='—'; fltEl.style.color='#aaa';
  }""",
 "123b· sin proyectada no se sabe cuánto falta")

s = sustituir(s,
 """  } else if(ej>0) {
    pctEl.innerHTML=`<div class="pv g">✓</div>`;
  } else {
    pctEl.innerHTML='<span style="color:#ccc">—</span>';
  }""",
 """  } else {
    // Ni tic ni verde. Un ✓ verde aquí decía «bien» sobre un dato que no
    // existe, y el PDF —que deja la celda vacía— habría dicho lo contrario.
    pctEl.innerHTML='<span style="color:#ccc" title="Sin cantidad proyectada no se puede calcular el avance">—</span>';
  }""",
 "123c· fuera el tic verde del avance sin proyectada")

# ── 123d. El aviso de poco espacio no salía nunca en obra ──────────────────
# Estaba detrás de `if(!silencioso)`, y en campo TODO se autoguarda: el aviso
# solo aparecía si el inspector pulsaba «Guardar» a mano. Medido: 66 fotografías
# —seis por hito en los once— dejan un borrador de 7,5 MB, el 151 % del tope que
# el propio código asume, sin una sola advertencia.
#
# Ahora también avisa el autoguardado, pero **como mucho una vez cada cinco
# minutos**: sin freno saltaría cada dos segundos y el inspector aprendería a
# ignorarlo, que es peor que no avisar.
s = sustituir(s,
 """function avisarSiQuedaPocoEspacio(){
  const usado = espacioUsado();
  if(usado < TOPE_ALMACEN * 0.7) return;
  const sinEnviar = getSavedReports().filter(function(b){ return !b.enviado; }).length;
  showToast('⚠️ El teléfono va lleno: ' + Math.round(usado/1048576*10)/10 +
            ' MB en informes sin enviar. Envíe los ' + sinEnviar + ' pendientes antes de seguir.', 'err');
}""",
 """let _ultimoAvisoEspacio = 0;
function avisarSiQuedaPocoEspacio(){
  const usado = espacioUsado();
  if(usado < TOPE_ALMACEN * 0.7) return;
  // Un aviso que salta cada dos segundos se vuelve invisible.
  const ahora = Date.now();
  if(ahora - _ultimoAvisoEspacio < 300000) return;
  _ultimoAvisoEspacio = ahora;
  const sinEnviar = getSavedReports().filter(function(b){ return !b.enviado; }).length;
  const cuantos = sinEnviar === 1 ? 'el informe pendiente' : 'los ' + sinEnviar + ' informes pendientes';
  showToast('⚠️ El teléfono va lleno: ' + Math.round(usado/1048576*10)/10 +
            ' MB sin enviar. Envíe ' + cuantos + ' antes de seguir.', 'err');
}""",
 "123d· avisar como mucho cada cinco minutos, y decirlo bien en singular")

s = sustituir(s,
 """    _separarSiCambioElInforme();
    saveDraft(true);""",
 """    _separarSiCambioElInforme();
    saveDraft(true);
    // El autoguardado también avisa. En obra no se pulsa «Guardar»: se llena y
    // se envía, así que el aviso que solo vivía en el guardado manual no lo veía
    // nadie.
    avisarSiQuedaPocoEspacio();""",
 "123e· el autoguardado también avisa del espacio")

print("  … 123 aplicado")


# ══════════════════════════════════════════════════════════════════════════
# 124. LAS FILAS AGREGADAS EN CAMPO PERDÍAN SU MEDICIÓN AL REABRIR — 1-sep-2026
#
# El inspector agrega «Rodapié» en obra, mide 18 m² y evalúa B. Guarda. En la
# oficina reabre el informe para enviarlo, y la fila vuelve VACÍA: queda la
# descripción y se pierde la medición. Como el envío lee la pantalla, el informe
# se manda sin ese dato, y nadie se entera.
#
# La causa es que había DOS sitios con las mismas filas y no decían lo mismo:
#
#   extraRows[pid]           → {desc:'Rodapié', pr:'', ej:'',   ev:''}
#   partidas[pid+'_extra']   → {desc:'Rodapié', pr:'', ej:'18', ev:'B'}
#
# `extraRows` se llena al CREAR la fila y solo se le actualiza la descripción;
# las cantidades viven en el DOM y se recogen al guardar, en `partidas`. Pero al
# reabrir, el formulario reconstruía desde `extraRows` —el que no sabe nada— y
# nunca miraba `partidas`.
#
# Es la misma familia que el fallo de las fotografías del 31-ago: correcto
# mientras la página sigue abierta, perdido en cuanto se recarga. Y afecta
# justo a las partidas que NO están en el maestro, que son las únicas que nadie
# puede reconstruir después mirando otra cosa.
#
# Ahora se reconstruye desde `partidas[pid+'_extra']`, que es el que tiene lo
# medido, y `extraRows` queda solo de respaldo para borradores viejos.
# ══════════════════════════════════════════════════════════════════════════
s = sustituir(s,
 """      if(d.extraRows) {
        Object.keys(d.extraRows).forEach(pid => {
          const rows = d.extraRows[pid];
          if(Array.isArray(rows)) {
            rows.forEach(r => {
              addRow(pid, r.desc, r.pr, r.ej, r.ev);
            });
          }
        });
      }""",
 """      // Las filas que el inspector agregó en campo. La fuente buena es
      // `partidas[pid+'_extra']`, que trae lo MEDIDO; `extraRows` solo tiene la
      // descripción y se queda para poder abrir borradores viejos.
      const _pidsExtra = {};
      Object.keys(d.partidas || {}).forEach(k => {
        if (k.length > 6 && k.slice(-6) === '_extra') _pidsExtra[k.slice(0, -6)] = true;
      });
      Object.keys(d.extraRows || {}).forEach(pid => { _pidsExtra[pid] = true; });

      Object.keys(_pidsExtra).forEach(pid => {
        const medidas = (d.partidas || {})[pid + '_extra'];
        const rows = Array.isArray(medidas) && medidas.length
          ? medidas
          : ((d.extraRows || {})[pid] || []);
        if (Array.isArray(rows)) {
          rows.forEach(r => { addRow(pid, r.desc || '', r.pr || '', r.ej || '', r.ev || ''); });
        }
      });""",
 "124· reconstruir las filas de campo con lo que se midió")

print("  … 124 aplicado")


# ══════════════════════════════════════════════════════════════════════════
# 125. LA BARRA DE ACCIONES CON EL TECLADO ABIERTO — 1-sep-2026
#
# Medido a 375×380, que es lo que queda de pantalla en un teléfono con el
# teclado abierto: la barra ocupaba 131 px, el 34 % de lo visible. Un tercio del
# espacio en botones, justo mientras el inspector escribe una cantidad.
#
# No se quita ninguna acción: las cuatro siguen ahí y siguen midiendo 44 px, que
# es la regla. Lo que se repliega es lo que NO se necesita mientras se escribe:
# la hora del último guardado y el indicador de conexión con la versión. Las dos
# vuelven en cuanto se cierra el teclado, y ninguna es algo que se consulte con
# el dedo en un campo. Se aprieta además el relleno.
#
# El aviso de versión nueva no se toca: ese sí hay que verlo cuando aparece.
# ══════════════════════════════════════════════════════════════════════════
s = sustituir(s,
 "@media screen and (max-width:700px), screen and (max-height:520px){.hdr-btns .hbtn-mas{display:flex}}",
 "@media screen and (max-width:700px), screen and (max-height:520px){.hdr-btns .hbtn-mas{display:flex}}\n"
 "/* Con el teclado abierto queda muy poca pantalla: se repliega lo informativo\n"
 "   —hora de guardado y estado de conexión—, nunca las acciones. */\n"
 "@media screen and (max-height:520px){\n"
 "  .hdr-btns{padding:4px 10px!important;gap:4px!important}\n"
 "  #estado-guardado,#estado-conexion{display:none!important}\n"
 "}",
 "125· replegar lo informativo cuando el teclado se come la pantalla")

print("  … 125 aplicado")


# ══════════════════════════════════════════════════════════════════════════
# 16. LOS NOMBRES DE EMPRESA, COMO SE NOMBRAN ELLAS — 30-ago-2026
#
# Fuente: «Recepción de Documentación Técnica y Diagnóstico Inicial por
# Edificación (Respuestas)», el formulario que llenaron las propias
# contratistas entre el 10 y el 12-ago, con su nombre y su RIF. Es la única
# fuente en la que las empresas se nombran a sí mismas; todo lo demás —el
# Cuadro Resumen, el Control Consolidado, este formulario— es Garmel
# transcribiendo. Ver C-33.
#
# Criterio (Stephanie González): manda lo que escribió la empresa, salvo que
# lo suyo tenga una falta de ortografía. Por eso «Rio Limon» va con tildes y
# «C. A» se cierra a «C.A.», pero THAISA se queda con una sola S: así se
# llaman.
#
# Cuatro no son abreviaturas sino nombres distintos, y son las que importan:
#   · Zerpa Construcciones  →  Zerpa's Ingeniería
#   · Vialpa C.A.           →  Vialpa S.A.
#   · Aroa                  →  Proyectos y Construcciones Aroa 93
#   · Tsuru                 →  Tsuru 5158
# ══════════════════════════════════════════════════════════════════════════
for viejo, nuevo in [
    ("ZERPA CONSTRUCCIONES, C.A.",   "ZERPA'S INGENIERÍA, C.A."),
    ("CONSTRUCTORA VIALPA, C.A.",    "CONSTRUCTORA VIALPA, S.A."),
    ("AROA, C.A.",                   "PROYECTOS Y CONSTRUCCIONES AROA 93, C.A."),
    ("TSURU, C.A.",                  "TSURU 5158, C.A."),
    ("DRIJECAE, C.A.",               "DRIJECAE 3003, C.A."),
    ("GRUPO TEPUY, C.A.",            "GRUPO TEPUY 314, C.A."),
    ("RÍO LIMÓN, C.A.",              "CONSTRUCTORA RÍO LIMÓN, C.A."),
    ("ALNAVIC, C.A.",                "INVERSIONES ALNAVIC, C.A."),
    ("THAISSA MM INVERSIONES, C.A.", "THAISA MM INVERSIONES, C.A."),
    ("CONSTRUCTORA SB 86, C.A.",     "CONSTRUCTORA SB86, C.A."),
]:
    s = sustituir(s, viejo, nuevo, "16· %s" % nuevo, -1)

print("  … 16 aplicado")

open(SALIDA, "w", encoding="utf-8").write(s)

print("✓ index.html construido — %d KB" % (os.path.getsize(SALIDA) // 1024))
for i, c in enumerate(cambios, 1):
    print("   %s" % c)
