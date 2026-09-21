#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Construye index-servicios.html — el formulario de inspección de SERVICIOS.

A DIFERENCIA DE `construir.py`, este generador COMPONE en vez de parchear. El de
inspección parte del archivo original de Skarlet Gómez y le aplica 132
sustituciones numeradas, porque aquel instrumento hay que preservarlo. Aquí no:
el borrador de servicios del 2-sep-2026 se lee como levantamiento de requisitos
—qué necesita Hernán Escobar— y el instrumento se rehace entero.

QUÉ SE CONSERVA DE ESE BORRADOR: el contenido, que está en servicios/contenido.py,
y una sola decisión de forma —que los Sí/No se puedan DESELECCIONAR—, porque
distinguir «no contestado» de «NO» es lo mismo que sostiene ADR-0026.

QUÉ SE DESCARTA, y por qué está escrito en la propuesta
(Garmel/implementacion/propuestas/formulario-de-servicios.md): la cascada al
revés, su propio maestro de empresas desactualizado, los pisos fijos, un
document.write que borraría el documento, window.print() como salida y las fotos
sin reducir.

EL GRANO: un informe = una torre + una fecha + quien firma. Los apartamentos de
la sección B son FILAS dentro de ese informe, no informes aparte.
"""
import os, sys, json

RAIZ = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(RAIZ, "comun"))
sys.path.insert(0, os.path.join(RAIZ, "servicios"))
import maestros
import contenido

SALIDA = os.path.join(RAIZ, "servicios.html")

# Calibradas en el formulario de inspección y medidas en obra. Se repiten con su
# valor para que los dos instrumentos se comporten IGUAL en el mismo teléfono:
# una foto que allá cabe, aquí también.
MAX_FOTO_PX  = 1280
CALIDAD_FOTO = 0.72
TOPE_ALMACEN = 5 * 1024 * 1024
RELEVO_URL   = "https://script.google.com/macros/s/AKfycbwWgYbgMkNcxwN2gAH89N4EVUe6LO_RXR2IzBBc6mFfgJJNjixd6omK_ElAOSiFH-EqYg/exec"

# ⚠️ Tope de fotos POR SECCIÓN, no por informe (decidido el 2-sep-2026): una foto
# de la caseta de gas no sustituye a una del transformador. Baja de 4 a 3 porque
# aquí hay doce secciones —36 fotos por informe contra las 4 del borrador por
# sección, que daban 48— y el almacenamiento del teléfono se llena entre 5 y 10 MB.
MAX_FOTOS_SECCION = 3

# La versión sale de `sw.js`, que es donde ya se sube al publicar: un solo sitio
# que tocar, y el pie dice lo mismo en los tres —menú, inspección y servicios—.
# Con una constante propia el pie decía «v1» mientras el sitio iba por la v48.
import re as _re
VERSION = _re.search(r"VERSION = 'garmel-inspeccion-(v\d+)'",
                     open(os.path.join(RAIZ, "sw.js"), encoding="utf-8").read()).group(1)

# ══════════════════════════════════════════════════════════════════════════
# ESTILOS. Móvil primero: esto se llena de pie en una torre, con una mano.
# Ningún control de llenado por debajo de 44 px, y las acciones abajo, en la
# zona del pulgar. Lo aprendido en el otro formulario se aplica desde el día
# uno en vez de descubrirlo otra vez en obra.
# ══════════════════════════════════════════════════════════════════════════
CSS = """
:root{--azul:#1a237e;--azul-cl:#e8eaf6;--borde:#cbd5e1;--texto:#1e293b;--fondo:#f1f5f9}
*{box-sizing:border-box}
/* El atributo hidden pierde contra cualquier display del autor. Sin esto el
   panel de informes y la fila del «⋯» —los dos con display:flex— salían
   SIEMPRE desplegados: una capa oscura sobre todo el formulario, y el teléfono
   se veía gris y bloqueado. Se había comprobado el atributo, no lo que se veía. */
[hidden]{display:none !important}
body{font-family:system-ui,-apple-system,'Segoe UI',sans-serif;background:var(--fondo);
     color:var(--texto);margin:0;padding:0 0 140px;font-size:15px;line-height:1.45}
header{background:var(--azul);color:#fff;padding:12px 14px;position:sticky;top:0;z-index:30}
header h1{margin:0;font-size:15px;font-weight:700;letter-spacing:.3px}
header .nro{font-size:12px;opacity:.85;margin-top:3px;font-variant-numeric:tabular-nums}
.envoltorio{max-width:900px;margin:0 auto;padding:12px}
.tarjeta{background:#fff;border-radius:10px;padding:14px;margin-bottom:12px;
         box-shadow:0 1px 3px rgba(0,0,0,.08)}
.rejilla{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}
.campo{display:flex;flex-direction:column}
.campo label{font-weight:600;font-size:13px;color:#475569;margin-bottom:4px}
input,select,textarea{font:inherit;padding:10px;border:1px solid var(--borde);
       border-radius:6px;background:#fff;min-height:44px;width:100%}

/* Safari hace zoom SOLO al enfocar un campo de menos de 16 px, y después hay que
   despincharlo a mano. El cuerpo va a 15 px por densidad, así que los campos se
   suben aparte.

   Y el criterio NO es el ancho: un iPhone en horizontal mide 812 px y volvería
   a caer todo lo corregido. Se toca con el dedo, así que manda el PUNTERO y, de
   refuerzo, el alto — que en horizontal es lo que se queda corto. */
@media (max-width:700px), (max-height:520px), (pointer:coarse){
  input:not([type=file]),select,textarea{font-size:16px !important}
}

/* Foco visible al tabular. `:focus-visible` no se dispara al tocar la pantalla,
   así que en obra no cambia nada; en la computadora de oficina sí. */
button:focus-visible,select:focus-visible,input:focus-visible,textarea:focus-visible{
  outline:3px solid #1565c0;outline-offset:2px}
textarea{min-height:64px;resize:vertical}
.pestanas{display:flex;gap:8px;margin:12px 0}
.pestanas button{flex:1;min-height:44px;border:none;border-radius:8px;font-weight:700;
      font-size:14px;background:#e2e8f0;color:#475569}
.pestanas button.on{background:var(--azul);color:#fff}
.panel{display:none}.panel.on{display:block}
.titulo-srv{background:var(--azul);color:#fff;padding:10px 12px;border-radius:6px;
      font-weight:700;font-size:14px;margin:18px 0 10px}
.item{border:1px solid var(--borde);border-radius:8px;padding:10px;margin-bottom:8px;background:#fff}
.item .nombre{font-weight:600;font-size:14px;margin-bottom:8px}
.sino{display:flex;gap:8px;margin-bottom:8px}
.sino button{flex:1;min-height:44px;border:1px solid var(--borde);border-radius:6px;
      background:#fff;font-weight:700;font-size:14px;color:#475569}
.sino button.si-on{background:#166534;color:#fff;border-color:#166534}
.sino button.no-on{background:#991b1b;color:#fff;border-color:#991b1b}
.sino button.na-on{background:#475569;color:#fff;border-color:#475569}
.vacio{padding:14px;text-align:center;color:#64748b;font-size:13px;
      border:1px dashed var(--borde);border-radius:8px;background:#f8fafc}
.btn-add{min-height:44px;width:100%;border:1px dashed var(--azul);background:var(--azul-cl);
      color:var(--azul);font-weight:700;border-radius:8px;margin-bottom:10px}
.fila-apto{border:1px solid var(--borde);border-radius:8px;padding:10px;margin-bottom:8px;background:#fff}
.fila-apto .cab,#inspectores .cab{display:flex;gap:8px;margin-bottom:8px;align-items:flex-start}
/* Un hijo de flex con width:100% no baja de su ancho de contenido salvo que
   se le permita: sin esto el botón de quitar se cae a la línea siguiente. */
.cab>select,.cab>input{min-width:0;flex:1}
.cab>.quitar{flex:0 0 44px}
.quitar{min-width:44px;min-height:44px;border:none;border-radius:6px;background:#fee2e2;
      color:#991b1b;font-weight:700;font-size:16px}
.acciones{position:fixed;left:0;right:0;bottom:0;background:#fff;border-top:1px solid var(--borde);
      padding:8px;z-index:40}
.acciones .fila-principal,.acciones .fila-mas{display:flex;gap:8px}
.acciones .fila-mas{margin-bottom:8px}
.acciones .mas{flex:0 0 48px;font-size:20px}
.acciones button{flex:1;min-height:48px;border:none;border-radius:8px;font-weight:700;font-size:14px}
.b1{background:#e2e8f0;color:#334155}.b2{background:var(--azul);color:#fff}
.pie{text-align:center;font-size:12px;color:#64748b;padding:6px}
.fotos{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:8px;margin-top:8px}
.foto{border:1px solid var(--borde);border-radius:6px;padding:6px;background:#fff}
.foto img{width:100%;height:80px;object-fit:cover;border-radius:4px}
.foto button{width:100%;min-height:32px;margin-top:4px;border:none;border-radius:4px;
      background:#fee2e2;color:#991b1b;font-size:12px;font-weight:600}
.aviso{background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;padding:10px;
      font-size:13px;margin-bottom:10px}
.acciones button small{display:block;font-size:11px;font-weight:600;opacity:.8;line-height:1}
.acciones button{font-size:13px;padding:0 4px}
.titulo-srv{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:4px 4px 4px 10px}
.titulo-srv .abrir{flex:1;min-height:44px;text-align:left;background:none;border:none;color:#fff;
      font:inherit;font-weight:700;font-size:14px;padding:0}
.titulo-srv .flecha{display:inline-block;width:14px}
.titulo-srv .cuenta{font-weight:600;opacity:.85;font-size:12px}
.srv .obs-srv{margin-top:6px}
/* La pastilla vive en la cabecera del servicio, como en inspección. */
/* 44 px, sin la excepción de inspección: allá la pastilla vive en una cabecera
   que pliega el hito y a 44 se tocaba sin querer; aquí la cabecera no hace nada. */
.no-insp{min-height:44px;padding:0 10px;border-radius:7px;font-size:11px;font-weight:800;
      background:#fff;color:var(--azul);border:1px solid rgba(255,255,255,.9);white-space:nowrap}
.no-insp.on{background:#3e2723;color:#fff}
.srv.no-inspeccionado .cuerpo{display:none}
.srv .nota-ni{display:none;background:#fff8e1;border:1.5px solid #ffb300;border-radius:8px;
      padding:10px 12px;font-size:13px;font-weight:600;color:#4e342e;margin-bottom:10px}
.srv.no-inspeccionado .nota-ni{display:block}
#modal-informes{position:fixed;inset:0;z-index:50;background:rgba(17,24,39,.6);
      display:flex;align-items:flex-end}

#modal-informes .caja{background:#fff;width:100%;max-height:85vh;overflow:auto;
      border-radius:14px 14px 0 0;padding:14px}
#modal-informes h2{font-size:16px;margin:0 0 10px}
.ficha{border:1px solid var(--borde);border-radius:8px;padding:10px;margin-bottom:8px}
.ficha .n{font-weight:700;font-size:14px}.ficha .s{font-size:12px;color:#64748b}
.ficha .b{display:flex;gap:6px;margin-top:8px}
.ficha .b button{flex:1;min-height:44px;border:1px solid var(--borde);border-radius:6px;
      background:#f8fafc;font-weight:600;font-size:13px}
.ficha .b .env{background:var(--azul);color:#fff;border-color:var(--azul)}
.ficha .b .del{background:#fee2e2;color:#991b1b;border-color:#fecaca}
.enDrive{display:flex;align-items:center;justify-content:center;height:80px;
      background:#f1f5f9;border-radius:4px;font-size:12px;color:#64748b;text-align:center;padding:6px}

/* ── Lo que viene de la visita anterior ──────────────────────────────────
   Una respuesta heredada se ve DISTINTA de una dada hoy: el color se apaga y
   lleva su etiqueta. Al tocarla, vuelve al color pleno y la etiqueta se va.
   Sin esto, un SÍ de hace dos semanas y un SÍ de hoy serían idénticos en
   pantalla, y el informe diría «verificado» de cosas que nadie miró. */
.item.heredado .sino button.si-on{background:#bbf7d0;color:#14532d;border-color:#86efac}
.item.heredado .sino button.no-on{background:#fecaca;color:#7f1d1d;border-color:#fca5a5}
.item.heredado .sino button.na-on{background:#e2e8f0;color:#334155;border-color:#cbd5e1}
.item.heredado{border-left:4px solid #f59e0b}
.fila-apto.heredado{border-left:4px solid #f59e0b}
.etq-her{display:inline-block;font-size:11px;font-weight:700;color:#92400e;background:#fef3c7;
      border-radius:999px;padding:2px 8px;margin-left:6px;vertical-align:middle;white-space:nowrap}
.item.heredado .etq-her,.fila-apto.heredado .etq-her{display:inline-block}
.item .etq-her,.fila-apto .etq-her{display:none}
.item .cab-item{display:flex;align-items:center;gap:6px;margin-bottom:8px;flex-wrap:wrap}
.item .cab-item .nombre{margin:0;flex:1;min-width:0}
/* El nombre libre ocupa su línea entera: con las etiquetas al lado se
   recortaba a «Gabinete de mangu». Las etiquetas van debajo. */
.item .cab-item .nombre-libre{flex:1 1 100%;min-width:0}
/* Un ítem agregado en campo o recordado por el teléfono: se distingue por la
   marca, no por el color, para no competir con lo heredado. */
.item .etq-agr{font-size:11px;font-weight:600;color:#475569;white-space:nowrap}
.item .quitar-item{min-height:44px;width:100%;margin-top:6px;border:1px solid #fecaca;
      background:#fff;color:#991b1b;border-radius:6px;font-weight:600;font-size:13px}
/* La propuesta de arrancar desde la visita anterior: dos botones de 44 px,
   uno al lado del otro, y el texto arriba. */
.historial{background:#eff6ff;border:1px solid #93c5fd;border-radius:8px;padding:12px;margin:12px 0}
.historial .t{font-weight:700;font-size:14px;margin-bottom:4px}
.historial .s{font-size:13px;color:#475569;margin-bottom:10px}
.historial .b{display:flex;gap:8px}
.historial .b button{flex:1;min-height:44px;border-radius:8px;font-weight:700;font-size:14px;border:none}
.historial .b .si{background:var(--azul);color:#fff}
.historial .b .no{background:#e2e8f0;color:#334155}
"""

# ══════════════════════════════════════════════════════════════════════════
# LA PÁGINA. Los contenedores van vacíos: el contenido lo dibuja el JS a partir
# de servicios/contenido.py, para que añadir un ítem sea tocar el dato y no la
# maqueta.
# ══════════════════════════════════════════════════════════════════════════
HTML = """<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Inspección de Servicios — GARMEL</title>
<style>@@CSS@@</style>
</head>
<body>
<header>
  <h1>INSPECCIÓN DE SERVICIOS PÚBLICOS</h1>
  <div class="nro" id="nro">—</div>
</header>

<div class="envoltorio">
  <div class="tarjeta">
    <div class="rejilla">
      <!-- La TORRE va primera y determina lo demás. El inspector llega a una
           torre sabiendo la torre, no la empresa. -->
      <div class="campo">
        <label for="torre">Torre</label>
        <select id="torre"><option value="">— Seleccione torre —</option></select>
      </div>
      <div class="campo">
        <label for="convenio">Convenio</label>
        <select id="convenio"><option value="">—</option></select>
      </div>
      <div class="campo">
        <label for="empresa">Empresa ejecutora</label>
        <input type="text" id="empresa" placeholder="Se llena al elegir la torre">
      </div>
      <div class="campo">
        <label for="residente">Ingeniero residente</label>
        <input type="text" id="residente" placeholder="Se llena al elegir la torre">
      </div>
      <div class="campo">
        <label for="fecha">Fecha de inspección</label>
        <input type="date" id="fecha">
      </div>
      <div class="campo">
        <label for="estatus">Estatus de obra</label>
        <select id="estatus">
          <option value="">—</option><option>Iniciada</option>
          <option>En progreso</option><option>Culminada</option><option>Paralizada</option>
        </select>
      </div>
    </div>
    <div id="aviso-torre"></div>
    <div id="aviso-historial"></div>
    <div class="campo" style="margin-top:12px">
      <label>Inspector(es)</label>
      <div id="inspectores"></div>
      <button type="button" class="btn-add" onclick="addInspector()">＋ Agregar inspector</button>
    </div>
  </div>

  <div class="pestanas">
    <button type="button" id="tab-a" class="on" onclick="verPanel('a')">General</button>
    <button type="button" id="tab-b" onclick="verPanel('b')">Apartamentos</button>
  </div>

  <div id="panel-a" class="panel on"></div>
  <div id="panel-b" class="panel"></div>

  <div class="tarjeta">
    <label style="font-weight:600;font-size:13px;color:#475569">Observación general</label>
    <textarea id="obs_general" placeholder="Lo que no cabe en ningún servicio..."></textarea>
  </div>

  <div class="pie" id="pie">● <span id="conexion">en línea</span> · @@VERSION@@</div>
</div>

<div class="acciones">
  <!-- Lo que se usa de pie va a la vista; Guardar y Nuevo, detrás del «⋯»,
       como en inspección: cinco botones no caben en 375 px sin achicarse. -->
  <div class="fila-mas" id="fila-mas" hidden>
    <button type="button" class="b1" onclick="guardar(true)" title="Guarda en este teléfono. Se guarda solo a los 2 segundos y cada 30">💾 Guardar</button>
    <button type="button" class="b1" onclick="nuevoInforme()" title="Deja el formulario en blanco. Los informes guardados no se tocan">🧹 Nuevo</button>
  </div>
  <div class="fila-principal">
    <button type="button" class="b1" onclick="siguienteTorre()" title="Guarda este informe y prepara el de la siguiente torre, conservando inspector, fecha y estatus">➡️ Sig. torre</button>
    <button type="button" class="b1" onclick="abrirInformes()" title="Los informes que hay en este teléfono, enviados y sin enviar">📁 Informes<br><small id="cnt">0</small></button>
    <button type="button" class="b2" onclick="enviar()" title="Manda a Drive todos los pendientes. Hasta entonces viven solo aquí">📤 Enviar</button>
    <button type="button" class="b1 mas" onclick="const f=document.getElementById('fila-mas');f.hidden=!f.hidden" title="Resto de las acciones">⋯</button>
  </div>
</div>
<div id="modal-informes" hidden></div>

<script>
const TORRES_DATA = @@TORRES@@;
const SECTOR_POR_CONVENIO = @@SECTOR@@;
const INSPECTORES_DB = @@INSPECTORES@@;
const GENERAL = @@GENERAL@@;
const RENOMBRADOS = @@RENOMBRADOS@@;
const APARTAMENTOS = @@APARTAMENTOS@@;
const UNIDAD = @@UNIDAD@@;
const MAX_FOTOS_SECCION = @@MAXFOTOS@@;
const MAX_FOTO_PX = @@MAXPX@@;
const CALIDAD_FOTO = @@CALIDAD@@;
const RELEVO_URL = @@RELEVO@@;
@@JS@@
</script>
</body>
</html>
"""

# ══════════════════════════════════════════════════════════════════════════
# EL MOTOR.
# ══════════════════════════════════════════════════════════════════════════
JS = """
// ── Cascada: la torre manda ───────────────────────────────────────────────
// Cuatro torres (T-04, T-07, T-12, T-13) están en el maestro DOS VECES, con dos
// convenios y dos empresas. Ahí el formulario NO adivina: deja los campos en
// blanco, ofrece las dos posibilidades y lo dice. Inventar una de las dos en un
// documento que se firma es peor que dejarlo vacío.
function torresUnicas(){
  const vistas = [];
  TORRES_DATA.forEach(x => { if (!vistas.includes(x.t)) vistas.push(x.t); });
  return vistas;
}
function entradasDe(t){ return TORRES_DATA.filter(x => x.t === t); }

let _torreAnterior = '';
function alElegirTorre(){
  const t = document.getElementById('torre').value;
  // Se trajo el historial de una torre y resultó ser otra: si nadie ha tocado
  // nada de hoy, lo heredado se suelta con la torre. Si ya hay algo de hoy,
  // se queda: eso sí es trabajo del inspector.
  if (t !== _torreAnterior && !_cargando && soloHeredado()) soltarHeredado();
  _torreAnterior = t;
  const conv = document.getElementById('convenio');
  const aviso = document.getElementById('aviso-torre');
  conv.innerHTML = '<option value="">—</option>';
  aviso.innerHTML = '';
  if (!t) { document.getElementById('empresa').value = '';
            document.getElementById('residente').value = ''; return actualizarNro(); }

  const filas = entradasDe(t);
  filas.forEach(f => {
    const o = document.createElement('option');
    o.value = f.c; o.textContent = f.c; conv.appendChild(o);
  });

  if (filas.length === 1) {
    conv.value = filas[0].c;
    document.getElementById('empresa').value = filas[0].e || '';
    document.getElementById('residente').value = filas[0].r || '';
  } else {
    document.getElementById('empresa').value = '';
    document.getElementById('residente').value = '';
    aviso.innerHTML = '<div class="aviso">⚠️ <b>' + t + '</b> figura en el maestro con ' +
      filas.length + ' convenios distintos. Elija cuál corresponde: el formulario no lo adivina.</div>';
  }
  actualizarNro(); marcar();
  ofrecerHistorial();
  pedirHistorialAlRelevo();
}

function alElegirConvenio(){
  const t = document.getElementById('torre').value;
  const c = document.getElementById('convenio').value;
  const f = TORRES_DATA.find(x => x.t === t && x.c === c);
  if (f) { document.getElementById('empresa').value = f.e || '';
           document.getElementById('residente').value = f.r || ''; }
  // El aviso pedía elegir; una vez elegido deja de ser un aviso y pasa a ser
  // constancia de que aquí hubo que decidir, que es lo que importa después.
  const av = document.querySelector('#aviso-torre .aviso');
  if (av && c) {
    av.style.background = '#ecfdf5'; av.style.borderColor = '#059669';
    av.innerHTML = '✓ <b>' + t + '</b> tiene 2 convenios en el maestro. ' +
                   'Se registró <b>' + c + '</b>.';
  }
  actualizarNro(); marcar();
  pedirHistorialAlRelevo();
}

// ── El identificador ──────────────────────────────────────────────────────
// SRV-EZ-T45-260902-HE — sin piso ni apartamento, porque el informe es DE LA
// TORRE. El grano lo fija la propuesta: el ámbito más pequeño que una persona
// recorre de una vez y firma.
function limpiar(v){
  return (v == null ? '' : String(v)).normalize('NFD').replace(/[\\u0300-\\u036f]/g,'')
         .trim().toUpperCase().replace(/[^A-Z0-9]/g,'');
}
function iniciales(){
  const l = inspectoresElegidos();
  if (!l.length) return '--';
  const p = String(l[0]).replace(/^(ING|ARQ)\\.?\\s*/i,'').trim().split(/\\s+/);
  return limpiar((p[0]||'')[0] + ((p[1]||'')[0]||'')) || '--';
}
function actualizarNro(){
  const t = document.getElementById('torre').value;
  const c = document.getElementById('convenio').value;
  const f = document.getElementById('fecha').value;
  const sec = SECTOR_POR_CONVENIO[c] || 'XX';
  const fec = f ? f.slice(2).replace(/-/g,'') : '------';
  document.getElementById('nro').textContent =
    (TEST_MODE ? 'PRUEBA-' : '') + 'SRV-' + sec + '-' + (limpiar(t) || '---') + '-' + fec + '-' + iniciales();
}
function numeroInforme(){ return document.getElementById('nro').textContent; }

// ── Modo de prueba ────────────────────────────────────────────────────────
// Entra por el enlace —?prueba=1—, que el menú propaga. Marca los informes
// como PRUEBA- y lo dice en pantalla: tres informes de prueba acabaron una vez
// archivados como inspecciones reales por no tener este prefijo.
const TEST_MODE = new URLSearchParams(location.search).get('prueba') === '1';
"""

JS += """
// ── Inspectores ───────────────────────────────────────────────────────────
function addInspector(valor){
  const cont = document.getElementById('inspectores');
  const fila = document.createElement('div');
  fila.className = 'cab'; fila.style.marginBottom = '6px';
  let ops = '<option value="">— Seleccione inspector —</option>';
  let propio = !!valor;
  INSPECTORES_DB.forEach(i => {
    if (i === valor) propio = false;
    ops += '<option value="' + i + '"' + (i === valor ? ' selected' : '') + '>' + i + '</option>';
  });
  ops += '<option value="OTRO"' + (propio ? ' selected' : '') + '>⚠️ Otro / escribir</option>';
  fila.innerHTML = '<select onchange="cambioInspector(this)" style="flex:1">' + ops + '</select>' +
                   '<button type="button" class="quitar" onclick="this.parentElement.remove();actualizarNro();marcar()">✕</button>';
  cont.appendChild(fila);
  if (propio){
    const inp = document.createElement('input');
    inp.type = 'text'; inp.className = 'manual'; inp.placeholder = 'Nombre y CIV...';
    inp.value = valor; inp.oninput = () => { actualizarNro(); marcar(); };
    fila.insertBefore(inp, fila.lastChild);
  }
  actualizarNro();
}
function cambioInspector(sel){
  const fila = sel.parentElement;
  const ya = fila.querySelector('.manual');
  if (sel.value === 'OTRO' && !ya){
    const inp = document.createElement('input');
    inp.type = 'text'; inp.className = 'manual'; inp.placeholder = 'Nombre y CIV...';
    inp.oninput = () => { actualizarNro(); marcar(); };
    fila.insertBefore(inp, fila.lastChild);
  } else if (sel.value !== 'OTRO' && ya) { ya.remove(); }
  actualizarNro(); marcar();
}
function inspectoresElegidos(){
  return [...document.querySelectorAll('#inspectores .cab')].map(f => {
    const s = f.querySelector('select'), m = f.querySelector('.manual');
    return (s.value === 'OTRO') ? (m ? m.value.trim() : '') : s.value;
  }).filter(Boolean);
}

// ── A) Los servicios generales ────────────────────────────────────────────
// Tres servicios llegan SIN ÍTEMS y eso no es un fallo: es el estado real del
// levantamiento. En vez de fingir contenido, se dice que falta y se deja el
// mismo campo libre que ya tenía el borrador.
function pintarGeneral(){
  const cont = document.getElementById('panel-a');
  cont.innerHTML = '';
  GENERAL.forEach(srv => {
    const bloque = document.createElement('div');
    bloque.className = 'srv'; bloque.id = 'srv-' + srv.id;
    // Plegado de entrada, como los hitos en el teléfono: siete servicios con
    // 26 ítems no caben en una pantalla, y plegados se ve de un vistazo qué
    // falta. Se abre tocando el TÍTULO —no la cabecera entera— para que la
    // pastilla de no inspeccionado no quede en el camino del dedo.
    let html = '<div class="titulo-srv"><button type="button" class="abrir" onclick="plegar(\\'' + srv.id + '\\')">' +
      '<span class="flecha">▸</span> ' + srv.nombre + ' <span class="cuenta" id="cuenta-' + srv.id + '"></span></button>' +
      '<button type="button" class="no-insp" onclick="toggleNoInsp(\\'' + srv.id + '\\')">NO INSPECCIONADO</button></div>' +
      '<div class="nota-ni">Este servicio está marcado como NO INSPECCIONADO. Para llenarlo, toque otra vez el botón de la cabecera.</div>' +
      '<div class="cuerpo" hidden>';
    if (!srv.items.length){
      html += '<div class="vacio">Este servicio todavía no tiene lista de ítems.<br>' +
              'Agréguelos abajo mientras Ingeniería la define.</div>';
    }
    html += '<div id="items-' + srv.id + '"></div>' +
            '<button type="button" class="btn-add" onclick="agregarItemNuevo(\\'' + srv.id + '\\')">＋ Agregar ítem</button>' +
            '<textarea class="obs-srv" placeholder="Observación del servicio..." oninput="marcar()"></textarea>' +
            bloqueFotos('fotos-' + srv.id, 'Fotografías') + '</div>';
    bloque.innerHTML = html;
    cont.appendChild(bloque);
    srv.items.forEach(nombre => addItem(srv.id, nombre, true));
    // Y detrás de los fijos, los que este teléfono ya aprendió: lo que Hernán
    // agregó una vez no se vuelve a escribir en cada torre.
    const rec = itemsRecordados(srv.id);
    rec.forEach(nombre => addItem(srv.id, nombre, false, true));
    const nota = bloque.querySelector('.vacio');
    if (nota && rec.length) nota.hidden = true;
  });
}

// «Agregar ítem» desde el botón: el nombre se escribe en el acto. El teclado
// se abre solo, que es lo que se espera al tocar «agregar».
function agregarItemNuevo(sid){
  addItem(sid, '', false);
  const cont = document.getElementById('items-' + sid);
  const inp = cont.lastElementChild.querySelector('.nombre-libre');
  if (inp) inp.focus();
  marcar();
}

// ── Los ítems que el teléfono recuerda ────────────────────────────────────
// Lo que se agrega en campo con nombre queda en este teléfono y aparece en los
// informes siguientes, hasta que Ingeniería lo pase a la lista fija o alguien
// lo quite «para los próximos». Vive por servicio.
const CLAVE_ITEMS = 'garmel_srv_items';
function normalizar(v){
  return (v == null ? '' : String(v)).normalize('NFD').replace(/[\\u0300-\\u036f]/g,'')
         .trim().toLowerCase().replace(/\\s+/g,' ');
}
function memoriaItems(){
  try { return JSON.parse(localStorage.getItem(CLAVE_ITEMS) || '{}'); } catch(e){ return {}; }
}
function guardarMemoriaItems(m){
  try { localStorage.setItem(CLAVE_ITEMS, JSON.stringify(m)); } catch(e){}
}
// Recordados, menos los que ya son fijos: si Ingeniería adopta un ítem que un
// teléfono venía recordando, no sale dos veces.
function itemsRecordados(sid){
  const srv = GENERAL.find(s => s.id === sid);
  const fijos = (srv ? srv.items : []).map(normalizar);
  return (memoriaItems()[sid] || []).filter(n => n && !fijos.includes(normalizar(n)));
}
function recordarItem(sid, nombre, original){
  if (!nombre) return;
  const m = memoriaItems();
  const lista = m[sid] || [];
  const i = original ? lista.findIndex(n => normalizar(n) === normalizar(original)) : -1;
  const ya = lista.findIndex(n => normalizar(n) === normalizar(nombre));
  if (i >= 0 && ya < 0) lista[i] = nombre;          // se corrigió el nombre
  else if (ya < 0) lista.push(nombre);              // es nuevo
  m[sid] = lista;
  guardarMemoriaItems(m);
}
function olvidarItem(sid, nombre){
  const m = memoriaItems();
  m[sid] = (m[sid] || []).filter(n => normalizar(n) !== normalizar(nombre));
  guardarMemoriaItems(m);
}

// Un ítem fijo, uno agregado hoy, o uno que el teléfono recuerda de otro día.
// Los tres se contestan igual; cambia cómo se llama y si se puede quitar.
function addItem(sid, nombre, fijo, recordado){
  const cont = document.getElementById('items-' + sid);
  const d = document.createElement('div');
  d.className = 'item'; d.dataset.fijo = fijo ? '1' : '0';
  if (recordado) d.dataset.memoria = nombre;
  d.innerHTML =
    '<div class="cab-item">' +
    (fijo ? '<div class="nombre">' + nombre + '</div>'
          : '<input type="text" class="nombre-libre" placeholder="Escriba el ítem..." value="' +
            String(nombre || '').replace(/"/g, '&quot;') + '" oninput="marcar()">' +
            '<span class="etq-agr">' + (recordado ? 'recordado' : 'agregado') + '</span>') +
    '<span class="etq-her">visita anterior</span></div>' +
    // Tres respuestas y el vacío. «No aplica» es frecuente en servicios —gas
    // en una torre sin red— y sin botón propio se confundía con «sin contestar».
    '<div class="sino">' +
      '<button type="button" onclick="marcarSN(this,\\'SI\\')">SÍ</button>' +
      '<button type="button" onclick="marcarSN(this,\\'NO\\')">NO</button>' +
      '<button type="button" onclick="marcarSN(this,\\'NA\\')">N/A</button>' +
    '</div>' +
    '<textarea placeholder="Observaciones..." oninput="marcar()"></textarea>' +
    (fijo ? '' : '<button type="button" class="quitar-item" onclick="quitarItem(this)">Quitar</button>');
  cont.appendChild(d);
  return d;
}

// Quitar un agregado: de este informe siempre. Si el teléfono lo recordaba, se
// pregunta si también se olvida para los próximos, porque un nombre mal escrito
// no debería perseguir a nadie torre tras torre.
function quitarItem(btn){
  const it = btn.closest('.item');
  const sid = it.parentElement.id.replace('items-', '');
  const nombre = (it.querySelector('.nombre-libre').value || '').trim();
  if (it.dataset.memoria){
    const tambien = confirm('«' + (nombre || it.dataset.memoria) + '» se quita de este informe.\\n\\n' +
      'ACEPTAR: quitarlo también de los próximos informes en este teléfono.\\n' +
      'CANCELAR: solo de este informe; mañana vuelve a aparecer.');
    if (tambien) olvidarItem(sid, it.dataset.memoria);
  }
  it.remove(); marcar();
}

// Al tocar un ítem heredado de la visita anterior, deja de serlo: la respuesta
// pasa a ser de hoy, con quien la dio.
function tocado(el){
  if (!el || !el.closest) return;
  if (el.classList && el.classList.contains('obs-srv')) delete el.dataset.heredado;
  const it = el.closest('.item, .fila-apto');
  if (it && it.classList.contains('heredado')){ it.classList.remove('heredado'); delete it.dataset.heredado; }
}

// El mismo bloque de fotografías sirve para un servicio y para un apartamento.
function bloqueFotos(gridId, titulo){
  return '<div class="tarjeta" style="margin:8px 0 0"><label style="font-weight:600;font-size:13px;color:#475569">' +
    titulo + ' (máx. ' + MAX_FOTOS_SECCION + ')</label>' +
    '<input type="file" accept="image/*" multiple onchange="tomarFotos(event,\\'' + gridId + '\\')">' +
    '<div class="fotos" id="' + gridId + '"></div></div>';
}

function plegar(sid, abrir){
  const b = document.getElementById('srv-' + sid);
  const c = b.querySelector('.cuerpo');
  c.hidden = (abrir === undefined) ? !c.hidden : !abrir;
  b.querySelector('.flecha').textContent = c.hidden ? '▸' : '▾';
}

// «4/6»: cuántos ítems tienen respuesta —sí, no o no aplica— de los que hay.
function actualizarCuentas(){
  GENERAL.forEach(srv => {
    const el = document.getElementById('cuenta-' + srv.id); if (!el) return;
    const b = document.getElementById('srv-' + srv.id);
    if (b.classList.contains('no-inspeccionado')){ el.textContent = '· no inspeccionado'; return; }
    const items = [...document.querySelectorAll('#items-' + srv.id + ' .item')];
    const hechos = items.filter(i => valorSN(i)).length;
    // «4/6 · 3 sin revisar»: de las cuatro contestadas, tres vienen de la
    // visita anterior y nadie las ha tocado hoy. Cuando se tocan, baja.
    const her = items.filter(i => i.classList.contains('heredado') && valorSN(i)).length;
    el.textContent = items.length ? '· ' + hechos + '/' + items.length + (her ? ' · ' + her + ' sin revisar' : '') : '';
  });
}

// «No inspeccionado» es una afirmación del inspector, no una deducción: el
// servicio se oculta, no cuenta, y se puede volver a abrir.
function toggleNoInsp(sid){
  const b = document.getElementById('srv-' + sid);
  b.classList.toggle('no-inspeccionado');
  b.querySelector('.no-insp').classList.toggle('on', b.classList.contains('no-inspeccionado'));
  if (b.classList.contains('no-inspeccionado')) plegar(sid, false);
  marcar();
}

// Un ítem: Sí / No / SIN MARCAR. Los tres estados importan — sin marcar NO es
// «No», igual que en el formulario de inspección sin marcar no es «No iniciado».
// Se puede DESELECCIONAR, que es lo único de la forma del borrador que se
// conserva: volver a «sin contestar» tiene que ser posible.
function marcarSN(btn, v){
  const grupo = btn.parentElement;
  const ya = ['si-on','no-on','na-on'].some(c => btn.classList.contains(c));
  // En un ítem heredado, tocar el valor que ya tenía lo CONFIRMA para hoy; no
  // lo borra. Es el gesto más frecuente de la visita —«sigue igual»— y no
  // puede ser el que deje la fila en blanco.
  const fila = btn.closest('.item, .fila-apto');
  const confirmar = ya && fila && fila.classList.contains('heredado');
  [...grupo.children].forEach(b => b.classList.remove('si-on','no-on','na-on'));
  if (!ya || confirmar) btn.classList.add(v === 'SI' ? 'si-on' : v === 'NO' ? 'no-on' : 'na-on');
  tocado(btn);
  marcar();
}
function ponerSN(item, v){
  const g = item.querySelector('.sino');
  [...g.children].forEach(b => b.classList.remove('si-on','no-on','na-on'));
  if (v === 'SI') g.children[0].classList.add('si-on');
  if (v === 'NO') g.children[1].classList.add('no-on');
  if (v === 'NA') g.children[2].classList.add('na-on');
}
function valorSN(item){
  const g = item.querySelector('.sino');
  if (g.querySelector('.si-on')) return 'SI';
  if (g.querySelector('.no-on')) return 'NO';
  if (g.querySelector('.na-on')) return 'NA';
  return '';
}
"""

JS += """
// ── B) Apartamentos y áreas comunes ───────────────────────────────────────
// Se agregan A MANO, no se precargan los 60 a 150 de la torre (decidido el
// 2-sep-2026). El apartamento y el piso se escriben UNA vez por fila y valen
// para las cinco tablas: en el borrador se repetían cinco veces, y un
// apartamento ya cuesta 120 toques en el otro formulario.
function pintarApartamentos(){
  const cont = document.getElementById('panel-b');
  cont.innerHTML = '<div class="vacio" id="b-vacio">Todavía no hay apartamentos. ' +
    'Agregue los que haya visitado hoy.</div><div id="filas-apto"></div>' +
    '<button type="button" class="btn-add" onclick="addApartamento()">＋ Agregar apartamento</button>';
}

let _nApto = 0;
function addApartamento(datos){
  const v = document.getElementById('b-vacio'); if (v) v.style.display = 'none';
  const cont = document.getElementById('filas-apto');
  const d = document.createElement('div');
  d.className = 'fila-apto'; d.dataset.k = ++_nApto;
  // El PISO va primero: se elige, y después se escribe el apartamento. Al
  // revés confundía —se escribía el apto y aparecía otro selector—.
  let html = '<span class="etq-her" style="margin:0 0 6px">visita anterior · sin revisar hoy</span><div class="cab">' +
    '<select class="piso" onchange="marcar()" style="flex:1"><option value="">Piso</option>' +
    '<option value="PB">Planta Baja</option>';
  for (let i = 1; i <= 20; i++) html += '<option value="P' + String(i).padStart(2,'0') + '">Piso ' + String(i).padStart(2,'0') + '</option>';
  html += '</select>' +
    '<input type="text" class="apto" placeholder="Apto / área" oninput="marcar()" style="flex:1">' +
    '<button type="button" class="quitar" onclick="quitarApto(this)">✕</button></div>';

  APARTAMENTOS.forEach(tabla => {
    html += '<div style="margin-top:8px"><div style="font-weight:600;font-size:13px;color:var(--azul)">' +
            tabla.nombre + '</div>';
    tabla.columnas.forEach(col => {
      const [etiqueta, tipo] = col;
      const id = tabla.id + '__' + etiqueta;
      if (tipo === 'sino'){
        html += '<div style="display:flex;align-items:center;gap:8px;margin-top:6px">' +
                '<span style="flex:1;font-size:13px">' + etiqueta + '</span>' +
                '<div class="sino" style="flex:1;margin:0" data-campo="' + id + '">' +
                '<button type="button" onclick="marcarSN(this,\\'SI\\')">SÍ</button>' +
                '<button type="button" onclick="marcarSN(this,\\'NO\\')">NO</button>' +
                '<button type="button" onclick="marcarSN(this,\\'NA\\')">N/A</button></div></div>';
      } else if (tipo === 'cant'){
        html += '<div style="display:flex;align-items:center;gap:8px;margin-top:6px">' +
                '<span style="flex:1;font-size:13px">' + etiqueta + '</span>' +
                '<input type="number" inputmode="numeric" data-campo="' + id + '" ' +
                'oninput="marcar()" style="flex:1" placeholder="0">' +
                '<span style="font-size:12px;font-weight:600;color:#64748b">' + UNIDAD + '</span></div>';
      } else {
        html += '<textarea data-campo="' + id + '" placeholder="' + etiqueta + '..." ' +
                'oninput="marcar()" style="margin-top:6px"></textarea>';
      }
    });
    html += '</div>';
  });
  html += bloqueFotos('fotos-apto-' + _nApto, 'Fotografías del apartamento');
  d.innerHTML = html;
  cont.appendChild(d);
  if (datos) cargarApto(d, datos);
  marcar();
}

function cargarApto(fila, a){
  fila.querySelector('.apto').value = a.apto || '';
  fila.querySelector('.piso').value = a.piso || '';
  Object.entries(a.campos || {}).forEach(([k, v]) => {
    const el = fila.querySelector('[data-campo="' + k + '"]');
    if (!el) return;
    if (el.classList.contains('sino')){
      const k = {SI: 0, NO: 1, NA: 2}[v];
      if (k !== undefined) el.children[k].classList.add(['si-on','no-on','na-on'][k]);
    } else el.value = v;
  });
  pintarFotos(fila.querySelector('.fotos'), (a.fotos || []).map(f => f.dato ? f : { pie: f.pie, dato: f.enDrive ? '' : '\u2026' }));
}

function quitarApto(btn){
  btn.closest('.fila-apto').remove();
  if (!document.querySelectorAll('#filas-apto .fila-apto').length){
    const v = document.getElementById('b-vacio'); if (v) v.style.display = '';
  }
  marcar();
}

function verPanel(cual){
  document.getElementById('panel-a').classList.toggle('on', cual === 'a');
  document.getElementById('panel-b').classList.toggle('on', cual === 'b');
  document.getElementById('tab-a').classList.toggle('on', cual === 'a');
  document.getElementById('tab-b').classList.toggle('on', cual === 'b');
}

// ── Fotografías ───────────────────────────────────────────────────────────
// Se reducen ANTES de guardarlas, con los mismos valores medidos en el otro
// formulario. Una foto de cámara en crudo no cabe en el almacenamiento del
// navegador, y aquí hay doce secciones donde ponerlas.
function tomarFotos(ev, gridId){
  const grid = document.getElementById(gridId);
  let files = [...ev.target.files];
  ev.target.value = '';
  // El tope se decide AQUÍ, sobre los archivos elegidos, y no dentro de cada
  // reducción: reducir es asíncrono, y contando el grid al llegar cada foto,
  // cinco elegidas de golpe pasaban las cinco porque el grid seguía vacío.
  const sitio = MAX_FOTOS_SECCION - grid.children.length;
  if (files.length > sitio){
    alert('Máximo ' + MAX_FOTOS_SECCION + ' fotografías por sección. ' +
          (sitio > 0 ? 'Se toman las ' + sitio + ' primeras.' : 'No cabe ninguna más aquí.'));
    files = files.slice(0, Math.max(sitio, 0));
  }
  // Si el informe recién abierto aún está trayendo sus fotos de IndexedDB, se
  // espera: pintar encima de un grid a medio cargar las mezclaría.
  _fotosCargando.then(() => files.forEach(f => {
    reducir(f, dataUrl => { pintarFotos(grid, [{ dato: dataUrl, pie: '' }], true); _fotosSucias = true; marcar(); });
  }));
}

// ── Dónde viven las fotografías ───────────────────────────────────────────
// En IndexedDB, no en localStorage. Medido el 14-sep-2026: localStorage corta
// en 4,8 MB —en Chromium y en los teléfonos—, y un informe de servicios lleno
// son 36 fotos × ~214 KB ≈ 7,7 MB en base64: NO CABÍA, y el fallo de guardado
// dejaba «Enviar» mandando la versión anterior sin las fotos nuevas. IndexedDB
// da cientos de MB. El informe (texto) sigue en localStorage; aquí solo van
// las imágenes, por informe, alineadas con sus pies: grupos[clave][k].
const FotosDB = (() => {
  let db = null;
  function abrir(){
    if (db) return Promise.resolve(db);
    return new Promise((res, rej) => {
      const r = indexedDB.open('garmel_servicios', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('fotos');
      r.onsuccess = () => { db = r.result; res(db); };
      r.onerror = () => rej(r.error);
    });
  }
  function op(modo, fn){
    return abrir().then(d => new Promise((res, rej) => {
      const tx = d.transaction('fotos', modo);
      const req = fn(tx.objectStore('fotos'));
      tx.oncomplete = () => res(req && req.result);
      tx.onerror = () => rej(tx.error);
      tx.onabort = () => rej(tx.error);
    }));
  }
  return {
    guardar: (id, grupos) => op('readwrite', s => s.put(grupos, id)),
    leer:    id => op('readonly', s => s.get(id)).then(g => g || {}),
    borrar:  id => op('readwrite', s => s.delete(id)),
    borrarVarios: ids => op('readwrite', s => { ids.forEach(id => s.delete(id)); })
  };
})();
// Se anotan las fotos como «sucias» cuando cambian; solo entonces se
// reescriben en IndexedDB, y no en cada guardado automático del texto.
let _fotosSucias = false, _escrituraFotos = Promise.resolve(), _fotosCargando = Promise.resolve();

// Una foto ya enviada no vuelve a ocupar sitio aquí: se muestra su marca y su
// pie, y el archivo está en Drive.
function pintarFotos(grid, fotos, anadir){
  if (!anadir) grid.innerHTML = '';
  fotos.forEach(f => {
    const c = document.createElement('div');
    c.className = 'foto';
    const cargando = f.dato === '\u2026';
    c.innerHTML = (cargando ? '<div class="enDrive">⏳ cargando…</div>' :
                   f.dato ? '<img src="' + f.dato + '">' : '<div class="enDrive">📷 ya en Drive</div>') +
      '<textarea placeholder="Descripción..." oninput="marcar()" style="min-height:44px;font-size:12px"></textarea>' +
      (f.dato && !cargando ? '<button type="button" onclick="this.parentElement.remove();_fotosSucias=true;marcar()">Eliminar</button>' : '');
    c.querySelector('textarea').value = f.pie || '';
    if (!f.dato) c.dataset.enDrive = '1';
    grid.appendChild(c);
  });
}

function reducir(file, listo){
  const r = new FileReader();
  r.onload = e => {
    const img = new Image();
    img.onload = () => {
      let {width: w, height: h} = img;
      if (w > MAX_FOTO_PX || h > MAX_FOTO_PX){
        const f = MAX_FOTO_PX / Math.max(w, h);
        w = Math.round(w * f); h = Math.round(h * f);
      }
      const cv = document.createElement('canvas');
      cv.width = w; cv.height = h;
      cv.getContext('2d').drawImage(img, 0, 0, w, h);
      listo(cv.toDataURL('image/jpeg', CALIDAD_FOTO));
    };
    img.src = e.target.result;
  };
  r.readAsDataURL(file);
}
"""

JS += """
// ── Guardado ──────────────────────────────────────────────────────────────
// A los 2 s de la última tecla y cada 30, igual que el otro. Y con la lección
// que costó cara: GUARDAR PUEDE FALLAR, y cuando falla no se limpia nada, para
// que el informe siga donde único existe — el teléfono.
const CLAVE_LISTA = 'garmel_srv_list';
let sucio = false, temporizador = null, idActual = null;

function marcar(){
  sucio = true;
  actualizarCuentas();
  clearTimeout(temporizador);
  temporizador = setTimeout(() => guardar(false), 2000);
}
setInterval(() => { if (sucio) guardar(false); }, 30000);

// Lo que del grid va al informe (pie y marca) y lo que va a IndexedDB (la
// imagen), alineados por posición.
function leerFotos(grid){
  return [...grid.querySelectorAll('.foto')].map(f => ({
    enDrive: !!f.dataset.enDrive,
    pie: (f.querySelector('textarea').value || '').trim()
  }));
}
function leerDatosFotos(grid){
  return [...grid.querySelectorAll('.foto')].map(f => f.dataset.enDrive ? '' : (f.querySelector('img') || {}).src || '');
}

function datosDelFormulario(){
  const val = id => (document.getElementById(id) || {}).value || '';
  const general = GENERAL.map(srv => ({
    id: srv.id, nombre: srv.nombre,
    items: [...document.querySelectorAll('#items-' + srv.id + ' .item')].map(it => ({
      nombre: it.dataset.fijo === '1' ? it.querySelector('.nombre').textContent
                                      : (it.querySelector('.nombre-libre').value || '').trim(),
      agregado: it.dataset.fijo !== '1',
      sn: valorSN(it),
      obs: (it.querySelector('textarea').value || '').trim(),
      // De qué informe viene la respuesta, si nadie la tocó hoy. Vacío = de hoy.
      heredado: it.dataset.heredado || ''
    }))
    // Un agregado sin respuesta no viaja: ni el que se tocó de más —salía en el
    // PDF como «+ (agregado en campo) —», T-03 del 14-sep— ni el que solo tiene
    // nombre, porque el nombre ya lo guarda la memoria del teléfono y en el PDF
    // los fijos sin contestar tampoco salen.
    .filter(i => !i.agregado || i.sn || i.obs),
    obs: (document.querySelector('#srv-' + srv.id + ' .obs-srv').value || '').trim(),
    fotos: leerFotos(document.getElementById('fotos-' + srv.id))
  }));
  const noInsp = GENERAL.filter(srv => document.getElementById('srv-' + srv.id).classList.contains('no-inspeccionado')).map(s => s.id);
  const aptos = [...document.querySelectorAll('#filas-apto .fila-apto')].map(fila => {
    const campos = {};
    fila.querySelectorAll('[data-campo]').forEach(el => {
      campos[el.dataset.campo] = el.classList.contains('sino')
        ? (el.querySelector('.si-on') ? 'SI' : el.querySelector('.no-on') ? 'NO' : el.querySelector('.na-on') ? 'NA' : '')
        : (el.value || '').trim();
    });
    return { apto: fila.querySelector('.apto').value.trim(),
             piso: fila.querySelector('.piso').value, campos,
             heredado: fila.dataset.heredado || '',
             fotos: leerFotos(fila.querySelector('.fotos')) };
  });
  const grupos = {};
  GENERAL.forEach(srv => { grupos[srv.id] = leerDatosFotos(document.getElementById('fotos-' + srv.id)); });
  [...document.querySelectorAll('#filas-apto .fila-apto')].forEach((fila, i) => { grupos['apto:' + i] = leerDatosFotos(fila.querySelector('.fotos')); });
  return {
    id: idActual || ('srv_' + Date.now()),
    tipo: 'servicios',
    fotosDB: grupos,   // se separa antes de guardar: no va a localStorage
    nro: numeroInforme(),
    torre: val('torre'), convenio: val('convenio'), empresa: val('empresa'),
    residente: val('residente'), fecha: val('fecha'), estatus: val('estatus'),
    inspectores: inspectoresElegidos(),
    obs_general: val('obs_general'),
    noInspeccionados: noInsp,
    general, apartamentos: aptos,
    guardado: new Date().toISOString()
  };
}

// Nada contestado, nada agregado, ninguna foto, ningún comentario ni cierre:
// la cabecera sola no es un informe.
function informeVacio(d){
  return !(d.general || []).some(g => (g.obs || '').trim() || (g.fotos || []).length ||
                                      (g.items || []).some(i => i.sn || (i.obs || '').trim())) &&
         !(d.apartamentos || []).length && !(d.fotosGenerales || []).length &&
         !(d.noInspeccionados || []).length && !(d.obs_general || '').trim() && !d.estatus;
}

function guardar(avisar){
  const d = datosDelFormulario();
  idActual = d.id;
  const grupos = d.fotosDB; delete d.fotosDB;
  try {
    const lista = JSON.parse(localStorage.getItem(CLAVE_LISTA) || '[]');
    const i = lista.findIndex(x => x.id === d.id);
    // Un informe en blanco no se guarda: elegir una torre y tocar «Nuevo» dejaba
    // una ficha a medias en Informes por cada intento (QC de SHA del 17-sep).
    // Si ya estaba guardado con contenido y hoy se vació, se conserva: borrarlo
    // es una decisión que se toma desde Informes.
    if (i < 0 && informeVacio(d)){
      sucio = false;
      if (avisar) alert('Todav\u00eda no hay nada que guardar: el informe est\u00e1 en blanco. La cabecera se guarda junto con lo que conteste.');
      return !avisar;
    }
    // Un informe YA ENVIADO no vuelve a «sin enviar» por editarlo: conserva la
    // marca y queda anotado que se editó después. La tanda no lo manda sola;
    // reenviarlo es una decisión explícita desde Mis informes. Sin esto, la
    // siguiente tanda lo reenviaba callada —sin fotos, que ya se soltaron— y
    // duplicaba su fila en Smartsheet.
    if (i >= 0 && lista[i].enviado){
      d.enviado = lista[i].enviado;
      d.editadoTras = new Date().toLocaleString();
      // las fotos ya soltadas siguen soltadas: lo que se guarda es lo que hay
    }
    if (i >= 0) lista[i] = d; else lista.push(d);
    localStorage.setItem(CLAVE_LISTA, JSON.stringify(lista));
    sucio = false;
    if (_fotosSucias){
      _fotosSucias = false;
      _escrituraFotos = FotosDB.guardar(d.id, grupos).catch(e => {
        _fotosSucias = true;
        console.error('Fotos sin guardar', e);
        alert('⚠️ El texto del informe se guardó, pero LAS FOTOGRAFÍAS NO: el teléfono no tiene espacio. ' +
              'Envíe los informes pendientes y borre los enviados; las fotos siguen en pantalla hasta entonces.');
      });
    }
    // Lo que se guardó bien, se aprende: los ítems con nombre pasan a la
    // memoria del teléfono y el informe pasa a ser el último estado de su torre.
    aprenderItems();
    anotarEstadoTorre(d);
    try { localStorage.setItem(CLAVE_ACTUAL, d.id); } catch(e){}
    actualizarContador();
    vigilarEspacio();
    if (avisar) alert('Informe guardado en este teléfono.');
    return true;
  } catch (e) {
    // No se limpia nada. El informe sigue en pantalla, que es donde único está.
    alert('⚠️ NO SE PUDO GUARDAR: el almacenamiento del teléfono está lleno.\\n\\n' +
          'El informe SIGUE EN PANTALLA y no se ha perdido. Envíe los que tenga ' +
          'pendientes y use «Borrar los que ya se enviaron» para hacer sitio.');
    return false;
  }
}

function listaGuardada(){
  try { return JSON.parse(localStorage.getItem(CLAVE_LISTA) || '[]'); } catch(e){ return []; }
}

// Los agregados con nombre que hay en pantalla pasan a la memoria. Si uno
// recordado se corrigió, se corrige también en la memoria.
function aprenderItems(){
  document.querySelectorAll('.item[data-fijo="0"]').forEach(it => {
    const sid = it.parentElement.id.replace('items-', '');
    const nombre = (it.querySelector('.nombre-libre').value || '').trim();
    if (!nombre) return;
    recordarItem(sid, nombre, it.dataset.memoria || '');
    it.dataset.memoria = nombre;
  });
}

// ── El último estado de cada torre ────────────────────────────────────────
// Servicios vuelve a la misma torre semana tras semana, y lo que ya estaba
// instalado no se vuelve a marcar: se arranca desde lo último que se registró
// y se toca solo lo que cambió. Aquí vive ese «último» por torre, sin
// fotografías, y sobrevive a «Borrar los que ya se enviaron». Hoy lo alimentan
// los informes de este teléfono; el día que el relevo pueda contestarlo, se
// alimenta también desde Drive y Hernán y Oriana verán lo mismo.
const CLAVE_TORRES = 'garmel_srv_torres';
const CLAVE_ACTUAL = 'garmel_srv_actual';
function estadosDeTorres(){
  try { return JSON.parse(localStorage.getItem(CLAVE_TORRES) || '{}'); } catch(e){ return {}; }
}
function anotarEstadoTorre(d){
  if (!d.torre || !d.fecha) return;
  // Un borrador sin nada contestado no es el estado de la torre: con la fecha
  // de hoy pisaba al informe real de ayer —el del teléfono y el que llegaba
  // del relevo— y el historial ofrecía un vacío. Visto el 15-sep en T-12.
  const contestado = (d.general || []).some(g => (g.items || []).some(i => i.sn || i.obs)) ||
                     (d.apartamentos || []).length > 0;
  if (!contestado) return;
  const todos = estadosDeTorres();
  const previo = todos[d.torre];
  // Manda la fecha de inspección, y a igual fecha el guardado más reciente.
  // Un informe de hoy no puede quedar tapado por uno viejo que se reabra.
  if (previo && previo.id !== d.id &&
      (previo.fecha > d.fecha || (previo.fecha === d.fecha && previo.guardado > d.guardado))) return;
  todos[d.torre] = {
    id: d.id, nro: d.nro, fecha: d.fecha, guardado: d.guardado,
    convenio: d.convenio, estatus: d.estatus, residente: d.residente, empresa: d.empresa,
    noInspeccionados: d.noInspeccionados || [],
    general: (d.general || []).map(g => ({
      id: g.id, obs: g.obs,
      items: (g.items || []).filter(i => i.nombre).map(i => ({
        nombre: i.nombre, agregado: i.agregado, sn: i.sn, obs: i.obs,
        // si ya venía heredado, se conserva de dónde: la cadena no se rompe
        heredado: i.heredado || ''
      }))
    })),
    apartamentos: (d.apartamentos || []).map(a => ({
      apto: a.apto, piso: a.piso, campos: a.campos, heredado: a.heredado || ''
    }))
  };
  try { localStorage.setItem(CLAVE_TORRES, JSON.stringify(todos)); } catch(e){}
}

// ── El último informe de la torre, desde Drive ─────────────────────────────
// Hernán y Oriana se alternan las torres (15-sep-2026): lo que uno registró
// tiene que aparecerle al otro, y eso solo lo sabe el relevo. Con señal, al
// elegir torre (y convenio, que fija el sector) se le pregunta; si contesta
// un informe más nuevo que el de este teléfono, entra en la misma memoria por
// torre y se ofrece igual. Sin señal, la memoria del teléfono manda. Nunca
// bloquea: el formulario sigue usable mientras se espera.
const TIPO_INFORME = 'servicios';
let _pidiendo = null;
async function pedirHistorialAlRelevo(){
  const t = document.getElementById('torre').value;
  const sec = SECTOR_POR_CONVENIO[document.getElementById('convenio').value];
  if (!t || !sec || _cargando || !navigator.onLine) return;
  let clave = ''; try { clave = localStorage.getItem('garmel_clave_envio') || ''; } catch(e){}
  if (!clave) return;
  const pedido = t + '|' + sec;
  if (_pidiendo === pedido) return;
  _pidiendo = pedido;
  const corte = new AbortController(); const reloj = setTimeout(() => corte.abort(), 20000);
  try {
    const r = await fetch(RELEVO_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ clave, accion: 'historial', tipo: TIPO_INFORME, sector: sec, torre: t }), signal: corte.signal });
    const j = await r.json();
    if (!j.ok || !j.informe) return;
    // ¿Sigue siendo la misma torre en pantalla? Si el inspector ya cambió, no.
    if (document.getElementById('torre').value !== t) return;
    const d = j.informe;
    // El JSON archivado lleva residentes y estatus como listas; la memoria
    // espera texto. El nro de prueba no debería llegar, pero por si acaso.
    d.torre = d.torre || t;
    d.residente = d.residente || (d.residentes || [])[0] || '';
    if (Array.isArray(d.estatus)) d.estatus = d.estatus[0] || '';
    d.guardado = d.guardado || '';
    if (!d.nro || /^PRUEBA-/.test(d.nro) !== TEST_MODE) return;
    const antes = JSON.stringify(estadosDeTorres()[t] || null);
    anotarEstadoTorre(d);
    if (JSON.stringify(estadosDeTorres()[t] || null) !== antes && formularioEnBlanco()) ofrecerHistorial();
  } catch (e) {
    // sin señal o relevo lento: la memoria del teléfono ya se ofreció
  } finally { clearTimeout(reloj); if (_pidiendo === pedido) _pidiendo = null; }
}

// Un ítem con nombre viejo se reconoce por su nombre nuevo.
function nombreVigente(sid, nombre){
  return (RENOMBRADOS[sid] || {})[nombre] || nombre;
}

// Nada contestado, ningún apartamento: es un informe recién abierto, y solo
// entonces tiene sentido proponer arrancar desde la visita anterior.
function formularioEnBlanco(){
  if (document.querySelectorAll('#filas-apto .fila-apto').length) return false;
  return ![...document.querySelectorAll('.item')].some(it =>
    valorSN(it) || (it.querySelector('textarea').value || '').trim());
}

// Hay contenido y todo viene de la visita anterior, sin nada de hoy.
function soloHeredado(){
  const items = [...document.querySelectorAll('.item')].filter(it => valorSN(it) || (it.querySelector('textarea').value || '').trim());
  const aptos = [...document.querySelectorAll('#filas-apto .fila-apto')];
  const obs = [...document.querySelectorAll('.obs-srv')].filter(o => (o.value || '').trim());
  if (!items.length && !aptos.length && !obs.length) return false;
  return items.every(it => it.classList.contains('heredado')) &&
         aptos.every(f => f.classList.contains('heredado')) &&
         obs.every(o => o.dataset.heredado);
}
function soltarHeredado(){
  document.querySelectorAll('.item.heredado').forEach(it => {
    ponerSN(it, ''); it.querySelector('textarea').value = '';
    it.classList.remove('heredado'); delete it.dataset.heredado;
  });
  document.querySelectorAll('#filas-apto .fila-apto.heredado').forEach(f => f.remove());
  if (!document.querySelectorAll('#filas-apto .fila-apto').length){
    const v = document.getElementById('b-vacio'); if (v) v.style.display = '';
  }
  document.querySelectorAll('.obs-srv').forEach(o => { if (o.dataset.heredado){ o.value = ''; delete o.dataset.heredado; } });
  GENERAL.forEach(srv => { const b = document.getElementById('srv-' + srv.id);
    if (b && b.dataset.heredadoNI){ delete b.dataset.heredadoNI;
      if (b.classList.contains('no-inspeccionado')) toggleNoInsp(srv.id); } });
  actualizarCuentas();
}

let _cargando = false;
function ofrecerHistorial(){
  const caja = document.getElementById('aviso-historial');
  caja.innerHTML = '';
  if (_cargando) return;
  const t = document.getElementById('torre').value;
  const e = t ? estadosDeTorres()[t] : null;
  if (!e || e.id === idActual || !formularioEnBlanco()) return;
  const n = (e.general || []).reduce((s, g) => s + g.items.filter(i => i.sn).length, 0);
  const aptos = (e.apartamentos || []).length;
  caja.innerHTML = '<div class="historial">' +
    '<div class="t">📋 ' + t + ' ya tiene un informe anterior</div>' +
    '<div class="s">' + e.nro + ' · ' + fechaLarga(e.fecha) + ' · ' + n + ' ítem(s) contestado(s)' +
    (aptos ? ' · ' + aptos + ' apto(s)' : '') +
    '.<br>¿Arrancar desde lo que se registró ese día y marcar solo lo que cambió?</div>' +
    '<div class="b"><button type="button" class="si" onclick="traerHistorial()">Sí, traer lo anterior</button>' +
    '<button type="button" class="no" onclick="document.getElementById(\\'aviso-historial\\').innerHTML=\\'\\'">No, empezar en blanco</button></div></div>';
  // En una torre de dos convenios la propuesta caía debajo del aviso, fuera
  // de la pantalla: se decide antes de llenar, así que se trae a la vista.
  caja.firstElementChild.scrollIntoView({ block: 'center', behavior: 'smooth' });
}
function fechaLarga(f){
  if (!f) return '—';
  const [a, m, d] = f.split('-');
  const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return parseInt(d, 10) + '-' + (meses[parseInt(m, 10) - 1] || m) + '-' + a;
}

// Trae respuestas, observaciones y apartamentos del último informe de la
// torre. NO trae fotografías —son de aquel día— ni la observación general.
// Todo lo traído queda marcado «visita anterior» hasta que alguien lo toque.
function traerHistorial(){
  const t = document.getElementById('torre').value;
  const e = estadosDeTorres()[t];
  document.getElementById('aviso-historial').innerHTML = '';
  if (!e) return;
  // En las cuatro torres con dos convenios, el que se registró la vez
  // anterior vale hoy: se elige solo y arrastra empresa y residente.
  const conv = document.getElementById('convenio');
  if (e.convenio && !conv.value && [...conv.options].some(o => o.value === e.convenio)){
    conv.value = e.convenio; alElegirConvenio();
  }
  if (e.estatus && !document.getElementById('estatus').value) document.getElementById('estatus').value = e.estatus;
  // Veinte torres no traen residente en el maestro y el inspector lo escribe a
  // mano (T-03: «Harry Arteaga»). Lo escrito la vez anterior vale hoy si el
  // maestro no dice otra cosa. Igual la empresa.
  ['residente', 'empresa'].forEach(id => { const el = document.getElementById(id);
    if (e[id] && !el.value) el.value = e[id]; });
  (e.general || []).forEach(g => {
    const cont = document.getElementById('items-' + g.id); if (!cont) return;
    (g.items || []).forEach(it => {
      const el = buscarOCrearItem(g.id, it);
      if (!el) return;
      ponerSN(el, it.sn);
      el.querySelector('textarea').value = it.obs || '';
      if (it.sn || it.obs){ el.classList.add('heredado'); el.dataset.heredado = it.heredado || e.nro; }
    });
    const obs = document.querySelector('#srv-' + g.id + ' .obs-srv');
    if (obs && g.obs){ obs.value = g.obs; obs.dataset.heredado = e.nro; }
    if ((g.items || []).some(i => i.sn || i.obs) || g.obs) plegar(g.id, true);
  });
  (e.noInspeccionados || []).forEach(sid => { const b = document.getElementById('srv-' + sid);
    if (b && !b.classList.contains('no-inspeccionado')){ toggleNoInsp(sid); b.dataset.heredadoNI = '1'; } });
  (e.apartamentos || []).forEach(a => {
    addApartamento({ apto: a.apto, piso: a.piso, campos: a.campos, fotos: [] });
    const fila = document.querySelector('#filas-apto .fila-apto:last-child');
    fila.classList.add('heredado'); fila.dataset.heredado = a.heredado || e.nro;
  });
  actualizarCuentas(); marcar();
}

// El ítem de un informe guardado, en la pantalla de hoy: por su nombre vigente
// entre los fijos; si no, entre los agregados que ya hay; si no, se crea. Así
// un agregado que Ingeniería pasó a fijo cae en el fijo y no sale dos veces.
function buscarOCrearItem(sid, it){
  const cont = document.getElementById('items-' + sid); if (!cont) return null;
  const nombre = nombreVigente(sid, it.nombre || '');
  const n = normalizar(nombre);
  const fijo = [...cont.querySelectorAll('.item[data-fijo="1"]')].find(f => normalizar(f.querySelector('.nombre').textContent) === n);
  if (fijo) return fijo;
  if (!nombre && !it.sn && !it.obs) return null;
  const libre = [...cont.querySelectorAll('.item[data-fijo="0"]')].find(f =>
    n && normalizar(f.querySelector('.nombre-libre').value) === n && !valorSN(f) && !f.querySelector('textarea').value);
  if (libre) return libre;
  return addItem(sid, nombre, false, !!(memoriaItems()[sid] || []).find(x => normalizar(x) === n));
}
function actualizarContador(){
  const n = listaGuardada().filter(x => !x.enviado).length;
  document.getElementById('cnt').textContent = n;
}
function abrirInformes(){
  const l = listaGuardada();
  const m = document.getElementById('modal-informes');
  const pend = l.filter(x => !x.enviado).length, env = l.length - pend;
  let html = '<div class="caja"><h2>Informes en este teléfono</h2>';
  if (!l.length) html += '<div class="vacio">No hay informes guardados aquí.</div>';
  else {
    html += '<p style="font-size:13px;color:#64748b;margin:0 0 10px">' + pend + ' sin enviar · ' + env + ' enviados. ' +
            'Los que no se han enviado existen SOLO en este teléfono.</p>';
    if (pend) html += '<button type="button" class="btn-add" onclick="cerrarInformes();enviar()">📤 Enviar todos los pendientes (' + pend + ')</button>';
    if (env)  html += '<button type="button" class="btn-add" style="border-color:#991b1b;color:#991b1b;background:#fee2e2" onclick="borrarEnviados()">🧹 Borrar los ' + env + ' que ya se enviaron</button>';
    [...l].reverse().forEach(x => {
      html += '<div class="ficha"><div class="n">' + x.nro + '</div>' +
        '<div class="s">📍 ' + (x.torre || '—') + ' · 📅 ' + (x.fecha || '—') + ' · ' + (x.apartamentos || []).length + ' apto(s)</div>' +
        '<div class="s" style="font-weight:700;color:' + (x.enviado ? '#166534' : '#a15c07') + '">' +
        (x.enviado ? '✅ Enviado ' + x.enviado + (x.editadoTras ? ' · ✏️ editado después (' + x.editadoTras + ')' : '') : '⏳ Sin enviar') + '</div>' +
        '<div class="b"><button type="button" onclick="cargarInforme(\\'' + x.id + '\\')">📂 Editar</button>' +
        (x.enviado ? (x.editadoTras ? '<button type="button" class="env" onclick="enviarSolo(\\'' + x.id + '\\')">🔁 Reenviar</button>' : '')
                   : '<button type="button" class="env" onclick="enviarSolo(\\'' + x.id + '\\')">📤 Enviar</button>') +
        '<button type="button" class="del" onclick="borrarInforme(\\'' + x.id + '\\')">🗑️ Borrar</button></div></div>';
    });
  }
  html += '<button type="button" class="btn-add" style="margin-top:6px" onclick="cerrarInformes()">Cerrar</button></div>';
  m.innerHTML = html; m.hidden = false;
}
function cerrarInformes(){ document.getElementById('modal-informes').hidden = true; }

async function enviarSolo(id){
  cerrarInformes();
  const d = listaGuardada().find(x => x.id === id);
  if (!d) return;
  if (!d.enviado && !confirmarSinRevisar([d])) return;
  let clave = ''; try { clave = localStorage.getItem('garmel_clave_envio') || ''; } catch(e){}
  if (!clave){ alert('⚠️ Este teléfono todavía no está configurado para enviar.'); return; }
  if (_tandaEnCurso){ alert('Ya hay un envío en curso. Espere a que termine.'); return; }
  _tandaEnCurso = true;
  try { cartel('📤 Enviando ' + d.nro + '…\\n\\nNo cierre esta pantalla ni vuelva a pulsar.');
        const r = await enviarUno(d, clave);
        alert(r.ok ? '✓ ' + d.nro + ' enviado a Drive.' : '✗ ' + d.nro + ': ' + explicar(r.error)); }
  finally { cartel(''); _tandaEnCurso = false; }
  actualizarContador();
}

function borrarInforme(id){
  const d = listaGuardada().find(x => x.id === id);
  if (!d) return;
  if (!confirm((d.enviado ? 'Este informe ya está en Drive. ' : '⚠️ Este informe NO se ha enviado: existe solo aquí. ') +
               '¿Borrarlo de este teléfono?')) return;
  localStorage.setItem(CLAVE_LISTA, JSON.stringify(listaGuardada().filter(x => x.id !== id)));
  FotosDB.borrar(id).catch(() => {});
  if (idActual === id) idActual = null;
  actualizarContador(); abrirInformes();
}

// Volver a poner en pantalla un informe guardado. El identificador se
// recalcula con lo cargado, y el id se conserva: editar no duplica.
function cargarInforme(id){
  const d = listaGuardada().find(x => x.id === id);
  if (!d) return;
  cerrarInformes();
  if (sucio && !confirm('Hay cambios sin guardar en pantalla. ¿Descartarlos y abrir ' + d.nro + '?')) return;
  _cargando = true;
  try {
    vaciarFormulario();
    idActual = d.id;
    const t = document.getElementById('torre'); t.value = d.torre || ''; alElegirTorre();
    if (d.convenio){ document.getElementById('convenio').value = d.convenio; alElegirConvenio(); }
    document.getElementById('empresa').value = d.empresa || '';
    document.getElementById('residente').value = d.residente || '';
    if (d.fecha) document.getElementById('fecha').value = d.fecha;
    document.getElementById('estatus').value = d.estatus || '';
    document.getElementById('obs_general').value = d.obs_general || '';
    document.getElementById('inspectores').innerHTML = '';
    (d.inspectores && d.inspectores.length ? d.inspectores : ['']).forEach(i => addInspector(i));
    (d.general || []).forEach(g => {
      const cont = document.getElementById('items-' + g.id); if (!cont) return;
      (g.items || []).forEach(it => {
        // Por nombre vigente: un fijo renombrado sigue encontrándose, y un
        // agregado que después pasó a fijo cae en el fijo.
        const el = buscarOCrearItem(g.id, it);
        if (!el) return;
        ponerSN(el, it.sn);
        el.querySelector('textarea').value = it.obs || '';
        if (it.heredado){ el.classList.add('heredado'); el.dataset.heredado = it.heredado; }
      });
      document.querySelector('#srv-' + g.id + ' .obs-srv').value = g.obs || '';
      pintarFotos(document.getElementById('fotos-' + g.id), (g.fotos || []).map(f => f.dato ? f : { pie: f.pie, dato: f.enDrive ? '' : '\u2026' }));
      // Lo que tiene algo se abre; lo vacío sigue plegado.
      if ((g.items || []).some(i => i.sn || i.obs || (i.agregado && i.nombre)) || g.obs || (g.fotos || []).length) plegar(g.id, true);
    });
    (d.noInspeccionados || []).forEach(sid => { const b = document.getElementById('srv-' + sid);
      if (b){ b.classList.add('no-inspeccionado'); b.querySelector('.no-insp').classList.add('on'); } });
    (d.apartamentos || []).forEach(a => {
      addApartamento(a);
      if (a.heredado){ const fila = document.querySelector('#filas-apto .fila-apto:last-child');
        fila.classList.add('heredado'); fila.dataset.heredado = a.heredado; }
    });
    try { localStorage.setItem(CLAVE_ACTUAL, d.id); } catch(e){}
    // Las imágenes llegan de IndexedDB un instante después; mientras, cada
    // foto se pinta con su pie y un «…». Un informe anterior a la v64 puede
    // traer `dato` dentro: se respeta.
    _fotosCargando = FotosDB.leer(d.id).catch(() => ({})).then(grupos => {
      if (idActual !== d.id) return;
      (d.general || []).forEach(g => {
        const datos = grupos[g.id] || [];
        pintarFotos(document.getElementById('fotos-' + g.id), (g.fotos || []).map((f, k) => ({ pie: f.pie, dato: f.dato || (f.enDrive ? '' : datos[k] || '') })));
      });
      [...document.querySelectorAll('#filas-apto .fila-apto')].forEach((fila, i) => {
        const a = (d.apartamentos || [])[i]; if (!a) return;
        const datos = grupos['apto:' + i] || [];
        pintarFotos(fila.querySelector('.fotos'), (a.fotos || []).map((f, k) => ({ pie: f.pie, dato: f.dato || (f.enDrive ? '' : datos[k] || '') })));
      });
    });
  } finally {
    _cargando = false;
    // Si la carga revienta a medias, el autoguardado NO debe pisar el informe
    // guardado con la mitad de lo que alcanzó a pintarse (pasó el 21-sep en el
    // banco: una constante fuera de sitio dejó un informe sin inspector ni
    // incidencias). Lo que hay en pantalla no se guarda hasta que alguien lo toque.
    clearTimeout(temporizador); sucio = false;
  }
  actualizarNro(); actualizarCuentas(); sucio = false;
  window.scrollTo(0, 0);
}

function vaciarFormulario(){
  ['empresa','residente','obs_general'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('torre').value = ''; alElegirTorre();
  document.getElementById('estatus').value = '';
  document.getElementById('inspectores').innerHTML = ''; addInspector();
  pintarGeneral(); pintarApartamentos();
  const hoy = new Date();
  document.getElementById('fecha').value = hoy.getFullYear() + '-' + String(hoy.getMonth()+1).padStart(2,'0') + '-' + String(hoy.getDate()).padStart(2,'0');
  idActual = null; sucio = false; actualizarNro(); actualizarCuentas();
  try { localStorage.removeItem(CLAVE_ACTUAL); } catch(e){}
}

// Al abrir, el informe que estaba en pantalla vuelve a estar en pantalla —si
// no se envió—. Antes se abría siempre en blanco: un teléfono que descarga la
// pestaña mientras se atiende una llamada devolvía un formulario vacío, y lo
// escrito solo estaba detrás de «Informes», donde nadie lo buscaba.
function reabrirActual(){
  let id = null;
  try { id = localStorage.getItem(CLAVE_ACTUAL); } catch(e){}
  if (!id) return false;
  const d = listaGuardada().find(x => x.id === id);
  if (!d || d.enviado) return false;
  cargarInforme(id);
  return true;
}

// «Nuevo» deja el formulario en blanco. Lo que había en pantalla se guarda
// antes si tenía algo: los informes guardados no se tocan.
// El grano es la torre y un día son varias: se guarda esta y se prepara la
// siguiente conservando lo que no cambia —inspector, fecha, estatus— y
// vaciando lo que la torre decide y lo medido. Un informe a medias no sale:
// si falta cabecera, se dice y no se cambia de torre.
function siguienteTorre(){
  const d = datosDelFormulario();
  const f = faltan(d);
  if (f.length){ alert('A este informe le falta ' + f.join(', ') + '. Complételo antes de pasar a otra torre.'); return; }
  if (!guardar(false)) return;   // si no se pudo guardar, NO se limpia
  const insp = inspectoresElegidos(), fecha = d.fecha, estatus = d.estatus;
  vaciarFormulario();
  document.getElementById('fecha').value = fecha;
  document.getElementById('estatus').value = estatus;
  document.getElementById('inspectores').innerHTML = '';
  (insp.length ? insp : ['']).forEach(i => addInspector(i));
  actualizarNro(); sucio = false;
  window.scrollTo(0, 0);
  document.getElementById('torre').focus();
}

function nuevoInforme(){
  if (sucio && !confirm('¿Guardar lo que hay en pantalla y empezar un informe nuevo?')) return;
  if (sucio) guardar(false);
  vaciarFormulario();
}

// El remedio cuando el teléfono se llena: lo enviado está a salvo en Drive.
function borrarEnviados(){
  const todos = listaGuardada();
  const quedan = todos.filter(x => !x.enviado);
  localStorage.setItem(CLAVE_LISTA, JSON.stringify(quedan));
  FotosDB.borrarVarios(todos.filter(x => x.enviado).map(x => x.id)).catch(() => {});
  actualizarContador();
  alert('Listo. Quedan ' + quedan.length + ' informes sin enviar en este teléfono.');
  abrirInformes();
}

// ⚠️ AVISAR ANTES DE QUE FALLE, no cuando ya falló. En el otro formulario el
// aviso de poco espacio no llegaba nunca a verse en obra: para cuando saltaba,
// el guardado ya había reventado. Aquí se mira en cada guardado, y como este
// informe puede llevar 36 fotografías, se llena antes.
function vigilarEspacio(){
  // Con las fotos en IndexedDB, lo que manda es la cuota real del navegador
  // (`storage.estimate`), que en un teléfono son cientos de MB. localStorage,
  // que solo lleva texto, se vigila igual contra su tope de 5 MB.
  if (navigator.storage && navigator.storage.estimate){
    navigator.storage.estimate().then(e => { if (e.quota) avisarEspacio(e.usage || 0, e.quota); }).catch(() => {});
  }
  let bytes = 0;
  try { for (const k in localStorage) if (Object.hasOwn(localStorage, k))
          bytes += (localStorage[k] || '').length * 2; } catch(e){ return; }
  avisarEspacio(bytes, @@TOPE@@);
}
function avisarEspacio(bytes, tope){
  // Se guarda a los 2 s de cada tecla: sin este freno el aviso saltaba en
  // cada guardado, tecla tras tecla. Se avisa al pasar cada tramo del 10 %.
  const tramo = Math.floor(bytes / tope * 10);
  if (bytes > tope * 0.8 && tramo > _tramoAvisado){
    _tramoAvisado = tramo;
    const pct = Math.round(bytes / tope * 100);
    alert('⚠️ Este teléfono va por el ' + pct + '% de su espacio.\\n\\n' +
          'Envíe los informes pendientes y use «Mis informes» para borrar los ' +
          'que ya se enviaron, antes de que deje de guardar.');
  }
}
let _tramoAvisado = 0;

// ── Envío al relevo ───────────────────────────────────────────────────────
// Mismo contrato que el formulario de inspección, con una etiqueta más:
// `tipo: 'servicios'`. El relevo archiva datos y fotografías, anota la fila en
// el registro y se detiene ahí —sin PDF ni Smartsheet, que todavía no existen
// para servicios—. Lo que llega a Drive es lo que después se puede rehacer.
let _tandaEnCurso = false;

function faltan(d){
  const f = [];
  if (!d.torre)    f.push('la torre');
  if (!d.convenio) f.push('el convenio');
  if (!d.fecha)    f.push('la fecha');
  if (!d.inspectores.length) f.push('el inspector');
  return f;
}

// Las fotografías viajan aparte, con nombre, para poder consultarlas fuera del
// informe. En los datos queda solo su pie, que es texto.
function sobreDe(d, clave, grupos){
  const fotos = [];
  const datos = JSON.parse(JSON.stringify(d));
  grupos = grupos || {};
  const soltar = (lista, prefijo, imgs) => (lista || []).map((f, k) => {
    const dato = f.dato || (imgs || [])[k] || '';
    if (dato) fotos.push({ nombre: prefijo + '-' + (k + 1), dato });
    return { pie: f.pie || '' };
  });
  datos.general.forEach(srv => { srv.fotos = soltar(srv.fotos, srv.id, grupos[srv.id]); });
  datos.apartamentos.forEach((a, i) => { a.fotos = soltar(a.fotos, 'apto-' + (i + 1) + '-' + limpiar(a.apto || ''), grupos['apto:' + i]); });
  delete datos.fotosDB;
  // El registro del relevo lee `estatus` y `residentes` como LISTAS —les hace
  // .join()— porque así viajan desde inspección. Un texto suelto reventaría
  // dentro de anotarEnRegistro y el relevo contestaría ok:false a todos.
  datos.estatus    = d.estatus   ? [d.estatus]   : [];
  datos.residentes = d.residente ? [d.residente] : [];
  return { clave, numero: d.nro, tipo: 'servicios', ambito: 'torre',
           sector: SECTOR_POR_CONVENIO[d.convenio] || 'XX', torre: d.torre,
           datos, fotos };
}

// El cartel tapa la pantalla mientras dura la tanda: un aviso que se desvanece
// a los dos segundos hacía que el inspector volviera a pulsar y mandara todo
// dos veces.
function cartel(texto){
  let c = document.getElementById('cartel-envio');
  if (!texto){ if (c) c.remove(); return; }
  if (!c){
    c = document.createElement('div'); c.id = 'cartel-envio';
    c.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(17,24,39,.88);' +
      'display:flex;align-items:center;justify-content:center;text-align:center;' +
      'padding:24px;color:#fff;font-size:17px;font-weight:700;line-height:1.5;white-space:pre-line';
    document.body.appendChild(c);
  }
  c.textContent = texto;
}

async function enviarUno(d, clave){
  // Con señal mala el envío se quedaba colgado sin decir nada; a los 90 s se
  // corta solo y el informe sigue guardado para reintentarlo.
  const corte = new AbortController();
  const reloj = setTimeout(() => corte.abort(), 90000);
  try {
    // Las fotos se leen de IndexedDB después de que termine cualquier
    // escritura en curso: lo que viaja es lo último que se guardó.
    await _escrituraFotos.catch(() => {});
    const grupos = await FotosDB.leer(d.id).catch(() => ({}));
    const r = await fetch(RELEVO_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(sobreDe(d, clave, grupos)),
      signal: corte.signal
    });
    const res = await r.json();
    if (res.ok){ marcarEnviado(d.id, d.nro); return { ok: true }; }
    return await rescatar(d, clave, res.error || 'Error desconocido');
  } catch (e) {
    return await rescatar(d, clave, (e && e.name === 'AbortError') ? 'Sin respuesta en 90 segundos' : String(e));
  } finally { clearTimeout(reloj); }
}

// Antes de dar un envío por fallido se le pregunta al relevo si ese informe ya
// quedó archivado. El 17-sep-2026 el relevo archivó SHA-EZ-T16 dos veces y el
// teléfono, que no recibió la respuesta, lo seguía mostrando como no enviado.
// Se confirma por número Y por hora de guardado: el mismo número de un envío
// anterior no cuenta. Si no se puede confirmar, el fallo se informa como antes.
async function rescatar(d, clave, error){
  const fallo = { ok: false, error };
  if (/clave|faltan|sector/i.test(error) || !navigator.onLine) return fallo;
  const sec = SECTOR_POR_CONVENIO[d.convenio];
  if (!sec || !d.torre || !d.guardado) return fallo;
  const corte = new AbortController(); const reloj = setTimeout(() => corte.abort(), 20000);
  try {
    const r = await fetch(RELEVO_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ clave, accion: 'historial', tipo: TIPO_INFORME, sector: sec, torre: d.torre }), signal: corte.signal });
    const j = await r.json();
    const e = j && j.informe;
    if (j.ok && e && e.nro === d.nro && e.guardado === d.guardado){
      console.warn(d.nro, 'sí quedó archivado aunque la respuesta no llegó:', error);
      marcarEnviado(d.id, d.nro);
      return { ok: true, rescatado: true };
    }
  } catch (e2) {
  } finally { clearTimeout(reloj); }
  return fallo;
}

function marcarEnviado(id, nro){
  try {
    const l = listaGuardada();
    const x = l.find(y => y.id === id);
    if (x){
      x.enviado = new Date().toLocaleString();
      delete x.editadoTras;
      // Las fotografías ya están en Drive: aquí solo ocupaban sitio. Se quedan
      // el pie y la marca. Con fotos de ~300 KB, dos informes llenaban el
      // teléfono aunque ya estuvieran enviados.
      const soltar = f => ({ pie: f.pie || '', enDrive: true });
      (x.general || []).forEach(g => { g.fotos = (g.fotos || []).map(soltar); });
      (x.apartamentos || []).forEach(a => { a.fotos = (a.fotos || []).map(soltar); });
      FotosDB.borrar(id).catch(() => {});
      // Si es el que está en pantalla, sus fotos en el grid pasan a «ya en
      // Drive» en el próximo guardado; hasta entonces se siguen viendo.
    }
    localStorage.setItem(CLAVE_LISTA, JSON.stringify(l));
    actualizarContador();
  } catch (e) {
    // Se envió bien pero no se pudo anotar. Si esto pasa callado, la próxima
    // tanda lo manda otra vez y aparece duplicado en Drive.
    alert('⚠️ ' + nro + ' SÍ se envió, pero no se pudo marcar como enviado en este ' +
          'teléfono. No lo vuelva a enviar: ya está en Drive.');
  }
}

// Lo que vino de la visita anterior y nadie tocó hoy se dice ANTES de enviar.
// Un informe que sale todo heredado sin que nadie lo sepa es un documento que
// afirma cosas que hoy no se miraron.
function cuentaSinRevisar(d){
  let n = 0;
  (d.general || []).forEach(g => (g.items || []).forEach(i => { if (i.heredado && i.sn) n++; }));
  (d.apartamentos || []).forEach(a => { if (a.heredado) n++; });
  return n;
}
function confirmarSinRevisar(lista){
  const con = lista.map(d => ({ nro: d.nro, n: cuentaSinRevisar(d) })).filter(x => x.n);
  if (!con.length) return true;
  return confirm('⚠️ Hay respuestas de la visita anterior que nadie revisó hoy:\\n\\n' +
    con.map(x => x.nro + ': ' + x.n).join('\\n') +
    '\\n\\nSe envían tal cual, marcadas como heredadas.\\nACEPTAR: enviar igual. CANCELAR: volver a revisarlas.');
}

// Al inspector se le dice qué hacer, no qué falló por dentro. El detalle
// técnico queda en la consola, que es donde sirve para diagnosticar.
function explicar(err){
  if (/clave/i.test(err))  return 'La clave de este teléfono no es válida. Abra otra vez el enlace de configuración.';
  if (/sector/i.test(err)) return 'El informe no tiene convenio, y sin convenio no sabe a qué sector va.';
  if (/faltan/i.test(err)) return 'Al informe le faltan datos de cabecera: ' + err;
  if (/90 segundos/.test(err)) return 'No hubo respuesta. Con señal, vuelva a pulsar Enviar.';
  if (/Failed to fetch|NetworkError|Load failed/i.test(err)) return 'No hay señal, o el relevo no responde. Con señal, vuelva a pulsar Enviar.';
  // Con un detalle corto: sin él, el 17-sep no hubo forma de saber por qué la
  // respuesta del relevo no llegó al teléfono.
  return 'El relevo no pudo archivarlo. El informe sigue guardado aquí: reinténtelo, y si vuelve a fallar avise a la oficina.' +
         '\\n(detalle: ' + String(err).replace(/\\s+/g, ' ').slice(0, 90) + ')';
}

async function enviar(){
  if (_tandaEnCurso){ alert('Ya hay un envío en curso. Espere a que termine.'); return; }
  let clave = '';
  try { clave = localStorage.getItem('garmel_clave_envio') || ''; } catch(e){}
  if (!clave){
    alert('⚠️ Este teléfono todavía no está configurado para enviar.\\n\\n' +
          'Abra el enlace de configuración que le enviaron. El informe queda guardado aquí.');
    return;
  }
  // Lo que está en pantalla se guarda primero: se envía lo guardado, no lo que
  // se ve, y así lo que viaja es exactamente lo que queda en el teléfono.
  const actual = datosDelFormulario();
  const f = faltan(actual);
  if (f.length && (actual.torre || actual.apartamentos.length || actual.general.some(g => g.items.some(i => i.sn || i.obs)))){
    alert('A este informe le falta ' + f.join(', ') + '. Complételo antes de enviar.');
    return;
  }
  if (!f.length) guardar(false);

  const pendientes = listaGuardada().filter(x => !x.enviado && !faltan(x).length);
  if (!pendientes.length){
    // «Informes» cuenta como pendiente todo lo no enviado, también lo que está a
    // medias; decir aquí «no hay pendientes» con ocho en la lista confundía
    // (QC de SHA del 17-sep). Se dice cuáles y qué les falta.
    const aMedias = listaGuardada().filter(x => !x.enviado && faltan(x).length);
    alert(aMedias.length
      ? 'No hay informes listos para enviar. Hay ' + aMedias.length + ' guardado(s) a medias:\\n\\n' +
        aMedias.slice(0, 5).map(x => x.nro + ': falta ' + faltan(x).join(', ')).join('\\n') +
        (aMedias.length > 5 ? '\\n\u2026' : '') + '\\n\\n\u00c1bralos desde Informes y compl\u00e9telos, o b\u00f3rrelos.'
      : 'No hay informes pendientes de enviar.');
    return;
  }
  if (!confirmarSinRevisar(pendientes)) return;

  _tandaEnCurso = true;
  let bien = 0; const fallos = [];
  try {
    for (const d of pendientes){
      cartel('📤 Enviando ' + (bien + fallos.length + 1) + ' de ' + pendientes.length + '…\\n\\n' +
             'No cierre esta pantalla ni vuelva a pulsar Enviar.');
      const r = await enviarUno(d, clave);
      if (r.ok) bien++; else { fallos.push(d.nro + ': ' + explicar(r.error)); console.error(d.nro, r.error); }
    }
  } finally { cartel(''); _tandaEnCurso = false; }

  actualizarContador();
  alert((bien ? '✓ ' + bien + ' informe(s) enviado(s) a Drive.\\n\\n' : '') +
        (fallos.length ? '✗ ' + fallos.length + ' sin enviar — siguen guardados aquí:\\n\\n' + fallos.join('\\n\\n') : ''));
}

// ── No perder lo escrito ──────────────────────────────────────────────────
// Cerrar la pestaña con cambios sin guardar pregunta antes. Y al irse a otra
// aplicación —una llamada, la cámara del sistema— se guarda en el acto: en un
// teléfono, «después» puede ser que el navegador descargue la pestaña.
addEventListener('beforeunload', e => { if (sucio){ e.preventDefault(); e.returnValue = ''; } });
document.addEventListener('visibilitychange', () => { if (document.hidden && sucio) guardar(false); });

// ── Sin señal: la copia local y el aviso de versión nueva ─────────────────
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js');
  // Cuando entra una versión nueva: si nadie ha tocado el formulario se
  // recarga sola; si hay algo escrito, se avisa y se espera. Recargar sobre
  // un informe a medio llenar sería peor que la versión vieja.
  navigator.serviceWorker.addEventListener('message', e => {
    if (!e.data || e.data.garmel !== 'version-nueva') return;
    if (!sucio && !document.querySelectorAll('#filas-apto .fila-apto').length && !document.getElementById('torre').value){
      location.reload(); return;
    }
    const b = document.createElement('div');
    b.style.cssText = 'position:fixed;left:0;right:0;bottom:66px;background:#fef3c7;border-top:1px solid #f59e0b;' +
      'padding:10px 14px;font-size:13px;font-weight:700;text-align:center;z-index:39';
    b.textContent = 'Hay una versión nueva. Guarde y toque aquí para actualizar.';
    b.onclick = () => { guardar(false); location.reload(); };
    document.body.appendChild(b);
  });
}

// ── Arranque ──────────────────────────────────────────────────────────────
(function(){
  const sel = document.getElementById('torre');
  torresUnicas().forEach(t => {
    const o = document.createElement('option'); o.value = t; o.textContent = t; sel.appendChild(o);
  });
  sel.onchange = alElegirTorre;
  document.getElementById('convenio').onchange = alElegirConvenio;
  // `valueAsDate` y `toISOString()` dan la fecha UTC. Venezuela es UTC−4, así
  // que a partir de las 8 de la noche el formulario abriría con el día
  // siguiente — y esa fecha entra en el número del informe y en el nombre del
  // archivo en Drive.
  const hoy = new Date();
  document.getElementById('fecha').value = hoy.getFullYear() + '-' +
      String(hoy.getMonth() + 1).padStart(2, '0') + '-' +
      String(hoy.getDate()).padStart(2, '0');
  document.getElementById('fecha').onchange = () => { actualizarNro(); marcar(); };
  document.getElementById('estatus').onchange = marcar;
  document.getElementById('obs_general').oninput = marcar;
  if (TEST_MODE){
    const a = document.createElement('div'); a.className = 'aviso';
    a.style.margin = '12px'; a.textContent = '⚠️ MODO DE PRUEBA — este informe se archiva como PRUEBA-';
    document.querySelector('.envoltorio').prepend(a);
  }
  pintarGeneral(); pintarApartamentos(); addInspector();
  actualizarNro(); actualizarContador(); actualizarCuentas();
  // TODO campo que se toque marca el informe para guardar, sin depender de que
  // cada control lleve su propio disparador. Residente, empresa y observación
  // general no lo llevaban, y lo escrito ahí se perdía al cerrar la app o al
  // abrir otro informe (Skarlet, 14-sep). Inspección lo hace así desde el 27-ago.
  document.addEventListener('input',  e => { tocado(e.target); marcar(); }, true);
  document.addEventListener('change', e => { tocado(e.target); marcar(); }, true);
  const con = () => document.getElementById('conexion').textContent =
    navigator.onLine ? 'en línea' : 'sin señal — el informe queda guardado aquí';
  addEventListener('online', con); addEventListener('offline', con); con();
  // Los informes sin enviar viven en este teléfono y en ningún otro lado: se
  // le pide al navegador que no borre este almacenamiento cuando ande corto
  // de espacio. Inspección lo hace desde el 27-ago.
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
  reabrirActual();
})();
"""

# ══════════════════════════════════════════════════════════════════════════
# MONTAJE
# ══════════════════════════════════════════════════════════════════════════

def js_de(bloque_js):
    """Los maestros vienen como texto JS (`const X = ...;`) porque el otro
    generador los inyecta tal cual. Aquí hace falta solo el valor."""
    v = bloque_js.split('=', 1)[1].strip()
    return v[:-1] if v.endswith(';') else v


# Servicios lo firman dos personas —Hernán Escobar y Oriana Plaza—, no los
# catorce. Se filtran del padrón común por nombre, para que si les cambia el CIV
# allá, cambie aquí. Si un nombre deja de casar, el generador lo dice.
INSPECTORES_SERVICIOS = ["Hern\u00e1n Escobar", "Oriana Plaza"]

def inspectores_de_servicios():
    todos = json.loads(js_de(maestros.INSPECTORES_JS))
    sel = [i for i in todos if any(i.startswith(n) for n in INSPECTORES_SERVICIOS)]
    if len(sel) != len(INSPECTORES_SERVICIOS):
        sys.exit("\u2717 No encontr\u00e9 en el padr\u00f3n a: %s" %
                 [n for n in INSPECTORES_SERVICIOS if not any(i.startswith(n) for i in todos)])
    return sel


def construir():
    pagina = (HTML
        .replace('@@CSS@@', CSS)
        .replace('@@VERSION@@', VERSION)
        .replace('@@TORRES@@', js_de(maestros.TORRES_JS))
        .replace('@@SECTOR@@', js_de(maestros.SECTOR_POR_CONVENIO_JS))
        .replace('@@INSPECTORES@@', json.dumps(inspectores_de_servicios(), ensure_ascii=False))
        .replace('@@GENERAL@@', json.dumps(contenido.GENERAL, ensure_ascii=False, indent=2))
        .replace('@@RENOMBRADOS@@', json.dumps(contenido.RENOMBRADOS, ensure_ascii=False))
        .replace('@@APARTAMENTOS@@', json.dumps(contenido.APARTAMENTOS, ensure_ascii=False, indent=2))
        .replace('@@UNIDAD@@', json.dumps(contenido.UNIDAD_CANTIDAD))
        .replace('@@MAXFOTOS@@', str(MAX_FOTOS_SECCION))
        .replace('@@MAXPX@@', str(MAX_FOTO_PX))
        .replace('@@CALIDAD@@', str(CALIDAD_FOTO))
        .replace('@@RELEVO@@', json.dumps(RELEVO_URL))
        .replace('@@JS@@', JS)
        # este va DESPUÉS del JS: el marcador vive dentro del motor
        .replace('@@TOPE@@', str(TOPE_ALMACEN)))

    if '@@' in pagina:
        import re as _re
        sys.exit("✗ Quedaron marcadores sin sustituir: %s" % _re.findall(r'@@\w+@@', pagina))

    # Las correcciones de nombre de empresa, al final y sobre el HTML ya
    # montado — mismo criterio y misma tabla que el formulario de inspección.
    for viejo, nuevo in maestros.CORRECCIONES_EMPRESA + maestros.CORRECCIONES_TEXTO:
        pagina = pagina.replace(viejo, nuevo)

    open(SALIDA, "w", encoding="utf-8").write(pagina)
    return pagina


if __name__ == "__main__":
    p = construir()
    print("✓ servicios.html construido — %d KB" % (os.path.getsize(SALIDA) // 1024))
    print("  servicios generales: %d  ·  ítems definidos: %d" %
          (len(contenido.GENERAL), contenido.total_items()))
    faltan = contenido.servicios_sin_contenido()
    if faltan:
        print("  ⚠️ sin contenido: %s" % ", ".join(faltan))
    print("  tablas por apartamento: %d  ·  torres: %d" %
          (len(contenido.APARTAMENTOS), p.count("{t:'")))
