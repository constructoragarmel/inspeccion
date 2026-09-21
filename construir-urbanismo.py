#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Construye urbanismo.html — el formulario de inspección de Urbanismo.

DERIVACIÓN del motor de `construir-servicios.py`, como `construir-sha.py`:
importa estilos, maqueta y JS y les aplica sustituciones con ancla. Si el motor
cambia y un ancla no aparece, este generador FALLA en vez de producir un
formulario a medias.

QUÉ HEREDA SIN TOCAR: guardado en el teléfono, fotos en IndexedDB, envío con
clave, rescate del envío y detalle del error, Mis informes, reenvío que
reemplaza, ítems agregados que el teléfono recuerda, visita anterior con
heredados en amarillo y aviso al enviar, modo de prueba, versión en el pie.

QUÉ CAMBIA (contenido en urbanismo/contenido.py; propuesta en Garmel,
implementacion/propuestas/formulario-urbanismo.md):
  · La unidad del informe es la MANZANA o LOTE de un sector, no la torre. El
    «torre» del motor lleva la manzana; el «convenio», el sector. Se pueden
    agregar manzanas desde el teléfono y se recuerdan.
  · Cada partida lleva cantidad ejecutada acumulada a la fecha con UNIDAD FIJA,
    calidad B / R / M / N-A y observación. En ?rol=planificacion se ve además la
    cantidad proyectada; con ella el formulario muestra el % de avance.
  · Se pueden agregar partidas (como ítems) y SECCIONES; se recuerdan.
  · Sin pestaña de apartamentos. Identificador URB-EZ-M1L2-260921-GB.
  · Tipo `urbanismo` para el relevo (r19): carpeta Zona › Urbanismo › manzana.
"""
import os, sys, json, importlib.util

RAIZ = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(RAIZ, "comun"))
sys.path.insert(0, os.path.join(RAIZ, "urbanismo"))
import maestros
import contenido

spec = importlib.util.spec_from_file_location("motor", os.path.join(RAIZ, "construir-servicios.py"))
motor = importlib.util.module_from_spec(spec)
spec.loader.exec_module(motor)

SALIDA = os.path.join(RAIZ, "urbanismo.html")
# Quienes inspeccionan urbanismo (Skarlet y Stephanie, 21-sep): dos por sector.
# Ezequiel Zamora: Gabriel Barrios y Mariana Rojas; Simón Rodríguez: Alejandro
# Bastidas y otro por definir (Gabriel asiste); Simón Bolívar: por definir. Van
# primero en el desplegable; el resto del padrón queda disponible después.
INSPECTORES_URB = ["Gabriel Barrios", "Mariana Rojas", "Alejandro Bastidas"]

cambios = []
def sustituir(s, viejo, nuevo, etiqueta, n=1):
    if s.count(viejo) < 1:
        sys.exit("✗ No se encontró el ancla de: %s" % etiqueta)
    cambios.append(etiqueta)
    return s.replace(viejo, nuevo, n)

# ══════════════════════════════════════════════════════════════════════════
# MAQUETA
# ══════════════════════════════════════════════════════════════════════════
H = motor.HTML
H = sustituir(H, "<title>Inspección de Servicios — GARMEL</title>", "<title>Inspección de Urbanismo — GARMEL</title>", "1· título")
H = sustituir(H, "<h1>INSPECCIÓN DE SERVICIOS PÚBLICOS</h1>", "<h1>INSPECCIÓN DE URBANISMO</h1>", "2· cabecera")
# Skarlet (21-sep): el sector va PRIMERO y condiciona la lista de manzanas. Sin
# sector se ven todas, cada una con el suyo; con sector, solo las de ese sector.
H = sustituir(H, """      <div class="campo">
        <label for="torre">Torre</label>
        <select id="torre"><option value="">— Seleccione torre —</option></select>
      </div>
      <div class="campo">
        <label for="convenio">Convenio</label>
        <select id="convenio"><option value="">—</option></select>
      </div>""",
"""      <div class="campo">
        <label for="convenio">Sector</label>
        <select id="convenio"><option value="">— Seleccione sector —</option>@@SECTORES@@</select>
      </div>
      <div class="campo">
        <label for="torre">Manzana / lote</label>
        <select id="torre"><option value="">— Seleccione manzana o lote —</option></select>
        <button type="button" class="btn-add" style="margin-top:6px" onclick="abrirNuevaManzana()">＋ Agregar manzana o lote</button>
        <div id="nueva-manzana" hidden style="margin-top:8px;padding:10px;border:1px dashed var(--azul);border-radius:8px;background:var(--azul-cl)">
          <label for="nm-sector">Sector</label>
          <select id="nm-sector">@@SECTORES@@</select>
          <label for="nm-nombre" style="margin-top:8px">Nombre (como en los planos)</label>
          <input type="text" id="nm-nombre" placeholder="Ej.: M-7, M-2 L3, Manzana B">
          <div style="display:flex;gap:8px;margin-top:8px">
            <button type="button" class="btn-add" onclick="guardarNuevaManzana()">Guardar</button>
            <button type="button" class="btn-add" onclick="document.getElementById('nueva-manzana').hidden=true">Cancelar</button>
          </div>
        </div>
      </div>""", "3· sector primero, manzana en vez de torre")
H = sustituir(H, 'placeholder="Se llena al elegir la torre"', 'placeholder="Se llena al elegir la manzana"', "5· placeholders", n=2)
H = sustituir(H, '<input type="text" id="residente" placeholder="Se llena al elegir la manzana">',
                 '<input type="text" id="residente" placeholder="Escríbalo la primera vez; se recuerda por manzana">', "5b· residente")
H = sustituir(H, """  <div class="tarjeta">
    <label style="font-weight:600;font-size:13px;color:#475569">Observación general</label>
    <textarea id="obs_general" placeholder="Lo que no cabe en ningún servicio..."></textarea>
  </div>""",
"""  <div class="tarjeta" id="agregar-seccion">
    <label style="font-weight:600;font-size:13px;color:#475569">¿Falta una sección?</label>
    <div style="display:flex;gap:8px;margin-top:6px">
      <input type="text" id="ns-nombre" placeholder="Nombre de la sección (ej.: Gas, Telecomunicaciones)" style="flex:1">
      <button type="button" class="btn-add" style="width:auto;padding:0 14px" onclick="agregarSeccion()">＋ Agregar</button>
    </div>
  </div>
  <div class="tarjeta">
    <label style="font-weight:600;font-size:13px;color:#475569">Observación general</label>
    <textarea id="obs_general" placeholder="Lo que no cabe en ninguna sección..."></textarea>
  </div>""", "6· agregar sección y observación general")
H = sustituir(H, "➡️ Sig. torre", "➡️ Sig. manzana", "7· botón")
# 7c · El botón interno de Planificación (respuesta 4 de Skarlet): detrás del
# «⋯», enciende y apaga el campo «Proyectado» sin cambiar de enlace.
H = sustituir(H, """    <button type="button" class="b1" onclick="nuevoInforme()" title="Deja el formulario en blanco. Los informes guardados no se tocan">🧹 Nuevo</button>""",
"""    <button type="button" class="b1" onclick="nuevoInforme()" title="Deja el formulario en blanco. Los informes guardados no se tocan">🧹 Nuevo</button>
    <button type="button" class="b1" onclick="alternarPlanificacion()" title="Muestra u oculta el campo de cantidad proyectada, que carga Planificación">📊 Proyectadas</button>""", "7c· botón de Planificación")
H = sustituir(H, 'title="Guarda este informe y prepara el de la siguiente torre, conservando inspector, fecha y estatus"',
                 'title="Guarda este informe y prepara el de la siguiente manzana, conservando inspector, fecha y estatus"', "7b· pie de botón")

C = motor.CSS
C = sustituir(C, ".pestanas{display:flex;gap:8px;margin:12px 0}", ".pestanas{display:none}", "8· sin pestañas")
C = sustituir(C, ".fila-apto.heredado{border-left:4px solid #f59e0b}",
""".fila-apto.heredado{border-left:4px solid #f59e0b}
.sino button.re-on{background:#b45309;color:#fff;border-color:#b45309}
.item.heredado .sino button.re-on{background:#fde68a;color:#78350f;border-color:#fcd34d}
.cant-fila{display:flex;gap:8px;align-items:center;margin-bottom:8px}
.cant-fila input{flex:1;min-width:0}
.cant-fila .ud{font-weight:700;color:#475569;min-width:44px;text-align:center}
.cant-fila select.ud-sel{flex:0 0 96px}
.cant-fila .et{font-size:12px;color:#475569;flex:0 0 78px}
.proy{display:none}
body.plan .proy{display:flex}
body.plan .item{border-color:#1a237e}
.avance{font-size:13px;font-weight:700;color:#1a237e;min-width:44px;text-align:right}
body:not(.plan) .item.heredado.her-pr{border-left-color:transparent}
body:not(.plan) .item.heredado.her-pr .etq-her{display:none}
.plan-aviso{background:#e8eaf6;border:1px solid #1a237e;color:#1a237e;border-radius:8px;padding:8px 12px;margin:0 12px 8px;font-size:13px;font-weight:700}""", "9· estilos de cantidad, calidad y planificación")

# ══════════════════════════════════════════════════════════════════════════
# MOTOR
# ══════════════════════════════════════════════════════════════════════════
J = motor.JS

# 10 · Identidad
J = sustituir(J, "(TEST_MODE ? 'PRUEBA-' : '') + 'SRV-' + sec", "(TEST_MODE ? 'PRUEBA-' : '') + 'URB-' + sec", "10a· prefijo URB")
J = sustituir(J, "id: idActual || ('srv_' + Date.now()),", "id: idActual || ('urb_' + Date.now()),", "10b· id local")
J = sustituir(J, "    tipo: 'servicios',\n", "    tipo: 'urbanismo',\n", "10c· tipo en los datos")
J = sustituir(J, "return { clave, numero: d.nro, tipo: 'servicios', ambito: 'torre',",
                 "return { clave, numero: d.nro, tipo: 'urbanismo', ambito: 'torre',", "10d· tipo en el sobre")
J = sustituir(J, "const TIPO_INFORME = 'servicios';", "const TIPO_INFORME = 'urbanismo';", "10g· tipo en la consulta del historial")
for k in ["items", "list", "torres", "actual"]:
    J = sustituir(J, "'garmel_srv_%s'" % k, "'garmel_urb_%s'" % k, "10e· clave garmel_urb_%s" % k)
J = sustituir(J, "indexedDB.open('garmel_servicios', 1)", "indexedDB.open('garmel_urbanismo', 1)", "10f· base de fotos propia")

# 11 · La cabecera: el sector se muestra con su nombre, la empresa sale del
# sector, las manzanas agregadas se recuerdan.
# 11a · El desplegable de sectores es fijo (viene del HTML): elegir una manzana
# no lo rehace, solo marca el sector de esa manzana.
J = sustituir(J, "  conv.innerHTML = '<option value=\"\">\u2014</option>';\n  aviso.innerHTML = '';",
                 "  aviso.innerHTML = '';", "11a· el desplegable de sectores no se rehace")
J = sustituir(J, """  const filas = entradasDe(t);
  filas.forEach(f => {
    const o = document.createElement('option');
    o.value = f.c; o.textContent = f.c; conv.appendChild(o);
  });
""", "  const filas = entradasDe(t);\n", "11a'· la manzana fija su sector")
# 11b · Elegir sector filtra las manzanas; si la elegida no es de ese sector, se
# suelta. Sin manzana, la empresa ya se sabe por el sector.
J = sustituir(J, """function alElegirConvenio(){
  const t = document.getElementById('torre').value;
  const c = document.getElementById('convenio').value;
""", """function alElegirConvenio(){
  const t = document.getElementById('torre').value;
  const c = document.getElementById('convenio').value;
  llenarManzanas(c);
  // Sin sector, o con otro, la manzana elegida ya no corresponde: se suelta.
  if (t && (!c || !entradasDe(t).some(x => x.c === c))){ document.getElementById('torre').value = ''; alElegirTorre(); }
  if (!document.getElementById('torre').value) document.getElementById('empresa').value = c ? (EMPRESA_POR_SECTOR[c] || '') : '';
""", "11b· el sector filtra las manzanas")
J = sustituir(J, """  torresUnicas().forEach(t => {
    const o = document.createElement('option'); o.value = t; o.textContent = t; sel.appendChild(o);
  });
""", """  manzanasRecordadas().forEach(m => { if (!TORRES_DATA.some(x => x.t === m.t)) TORRES_DATA.push(m); });
  llenarManzanas('');
""", "11b'· arranque: manzanas recordadas y lista completa")
# 11c · Sin manzana, la empresa es la del sector elegido (tras «Sig. manzana» el
# sector se conserva y la empresa quedaba vacía hasta elegir manzana).
J = sustituir(J, "  if (!t) { document.getElementById('empresa').value = '';",
                 "  if (!t) { document.getElementById('empresa').value = EMPRESA_POR_SECTOR[conv.value] || '';", "11c· empresa del sector sin manzana")
J += r"""
// La lista de manzanas según el sector: con sector, solo las suyas; sin sector,
// todas, cada una con el suyo al lado para que M-2 de un sector no se confunda
// con M-2 de otro. Un sector sin manzanas cargadas lo dice en la propia lista.
function llenarManzanas(c){
  const sel = document.getElementById('torre');
  const actual = sel.value;
  const lista = torresUnicas().filter(t => !c || entradasDe(t).some(x => x.c === c));
  sel.innerHTML = '';
  const o0 = document.createElement('option'); o0.value = '';
  o0.textContent = !c ? '\u2014 Seleccione manzana o lote \u2014'
                 : lista.length ? '\u2014 Seleccione manzana o lote \u2014'
                 : '\u2014 Sin manzanas cargadas: agr\u00e9guela abajo \u2014';
  sel.appendChild(o0);
  lista.forEach(t => {
    const e0 = entradasDe(t)[0];
    const o = document.createElement('option'); o.value = t;
    o.textContent = c ? t : t + (e0 ? ' \u00b7 ' + (NOMBRE_SECTOR[e0.c] || e0.c) : '');
    sel.appendChild(o);
  });
  if (actual && lista.includes(actual)) sel.value = actual;
}
function manzanasRecordadas(){
  try { return JSON.parse(localStorage.getItem(CLAVE_MANZANAS) || '[]'); } catch(e){ return []; }
}
function abrirNuevaManzana(){
  const caja = document.getElementById('nueva-manzana');
  caja.hidden = false;
  const c = document.getElementById('convenio').value;
  if (c) document.getElementById('nm-sector').value = c;
  document.getElementById('nm-nombre').focus();
}
// Una manzana nueva entra en el desplegable, con la empresa de su sector, y
// queda en este teléfono para los próximos informes.
function guardarNuevaManzana(){
  const c = document.getElementById('nm-sector').value;
  const nombre = (document.getElementById('nm-nombre').value || '').trim().toUpperCase().replace(/\s+/g, ' ');
  if (!c || !nombre){ alert('Elija el sector y escriba el nombre de la manzana o lote.'); return; }
  // El nombre es único en todo el sitio, no por sector: la memoria de la visita
  // anterior va por nombre, y dos «M-2» mezclarían sus historiales.
  const ya = TORRES_DATA.find(x => x.t === nombre);
  if (ya){ alert('«' + nombre + '» ya está en la lista, en ' + (NOMBRE_SECTOR[ya.c] || ya.c) + '.' + (ya.c !== c ? '\n\nEl nombre tiene que ser distinto en cada sector: escríbalo con el sector, por ejemplo «' + nombre + ' ' + (NOMBRE_SECTOR[c] || '').split(' ').map(w => w[0]).join('') + '».' : '')); return; }
  const fila = { t: nombre, c: c, e: EMPRESA_POR_SECTOR[c] || '', r: '' };
  TORRES_DATA.push(fila);
  const rec = manzanasRecordadas(); rec.push(fila);
  try { localStorage.setItem(CLAVE_MANZANAS, JSON.stringify(rec)); } catch(e){}
  document.getElementById('convenio').value = c;
  llenarManzanas(c);
  document.getElementById('torre').value = nombre; alElegirTorre();
  document.getElementById('nm-nombre').value = '';
  document.getElementById('nueva-manzana').hidden = true;
}
"""

# 12 · La fila de partida: cantidad ejecutada con unidad fija, proyectada (solo
# planificación), calidad B / R / M / N-A y observación.
J = sustituir(J, "  d.innerHTML =\n    '<div class=\"cab-item\">' +",
                 "  const ud = unidadDe(sid, nombre, fijo);\n  d.innerHTML =\n    '<div class=\"cab-item\">' +", "12a· unidad de la partida")
J = sustituir(J, r"""    '<div class="sino">' +
      '<button type="button" onclick="marcarSN(this,\'SI\')">SÍ</button>' +
      '<button type="button" onclick="marcarSN(this,\'NO\')">NO</button>' +
      '<button type="button" onclick="marcarSN(this,\'NA\')">N/A</button>' +
    '</div>' +""",
r"""    '<div class="cant-fila"><span class="et">Ejecutado</span><input type="text" inputmode="decimal" class="cant" placeholder="Cantidad a la fecha" oninput="numero(this); marcar()">' + ud + '</div>' +
    '<div class="cant-fila proy"><span class="et">Proyectado</span><input type="text" inputmode="decimal" class="pr" placeholder="Cantidad proyectada" oninput="numero(this); marcar()"><span class="avance"></span></div>' +
    '<div class="sino">' +
      '<button type="button" onclick="marcarSN(this,\'B\')">B</button>' +
      '<button type="button" onclick="marcarSN(this,\'R\')">R</button>' +
      '<button type="button" onclick="marcarSN(this,\'M\')">M</button>' +
      '<button type="button" onclick="marcarSN(this,\'NA\')">N/A</button>' +
    '</div>' +""", "12b· cantidad, proyectada y calidad")
J += r"""
// La cantidad es texto con teclado decimal, no type=number: en un teléfono con
// teclado es-VE el decimal es la coma, y un campo number la rechaza y queda
// vacío (QC del 21-sep). Aquí la coma pasa a punto, y solo entran dígitos: sin
// signo, así que no hay cantidades negativas.
function numero(el){
  let v = String(el.value || '').replace(/,/g, '.').replace(/[^0-9.]/g, '');
  const p = v.split('.'); if (p.length > 2) v = p[0] + '.' + p.slice(1).join('');
  if (v !== el.value) el.value = v;
}
function unidadDe(sid, nombre, fijo){
  const u = ((UNIDAD_DE[sid] || {})[nombre]) || '';
  if (fijo && u) return '<span class="ud">' + u + '</span>';
  return '<select class="ud-sel" onchange="marcar()"><option value="">unidad</option>' +
    UNIDADES.map(x => '<option' + (x === u ? ' selected' : '') + '>' + x + '</option>').join('') + '</select>';
}
function unidadLeida(it){
  const s = it.querySelector('.ud-sel'); if (s) return s.value || '';
  const e = it.querySelector('.ud'); return e ? e.textContent.trim() : '';
}
function ponerCant(el, it){
  el.querySelector('.cant').value = it.cant || '';
  el.querySelector('.pr').value = it.pr || '';
  const s = el.querySelector('.ud-sel'); if (s && it.ud) s.value = it.ud;
  actualizarAvance(el);
}
// % de avance = ejecutado / proyectado, solo cuando hay proyectado. Sin él no
// se inventa ningún porcentaje.
function actualizarAvance(it){
  const c = parseFloat(it.querySelector('.cant').value), p = parseFloat(it.querySelector('.pr').value);
  const a = it.querySelector('.avance');
  a.textContent = (p > 0 && c >= 0) ? Math.round(c / p * 100) + '%' : '';
}
function actualizarAvances(){ document.querySelectorAll('.item').forEach(actualizarAvance); }
"""
# 13 · Cuatro calidades en vez de tres respuestas.
J = sustituir(J, "  const ya = ['si-on','no-on','na-on'].some(c => btn.classList.contains(c));",
                 "  const ya = ['si-on','re-on','no-on','na-on'].some(c => btn.classList.contains(c));", "13a· ya marcado")
J = sustituir(J, "classList.remove('si-on','no-on','na-on')", "classList.remove('si-on','re-on','no-on','na-on')", "13b· desmarcar", n=2)
J = sustituir(J, "  if (!ya || confirmar) btn.classList.add(v === 'SI' ? 'si-on' : v === 'NO' ? 'no-on' : 'na-on');",
                 "  if (!ya || confirmar) btn.classList.add({ B: 'si-on', R: 're-on', M: 'no-on', NA: 'na-on' }[v] || 'na-on');", "13c· marcar")
J = sustituir(J, """  if (v === 'SI') g.children[0].classList.add('si-on');
  if (v === 'NO') g.children[1].classList.add('no-on');
  if (v === 'NA') g.children[2].classList.add('na-on');""",
"""  if (v === 'B')  g.children[0].classList.add('si-on');
  if (v === 'R')  g.children[1].classList.add('re-on');
  if (v === 'M')  g.children[2].classList.add('no-on');
  if (v === 'NA') g.children[3].classList.add('na-on');""", "13d· poner")
J = sustituir(J, """  if (g.querySelector('.si-on')) return 'SI';
  if (g.querySelector('.no-on')) return 'NO';
  if (g.querySelector('.na-on')) return 'NA';""",
"""  if (g.querySelector('.si-on')) return 'B';
  if (g.querySelector('.re-on')) return 'R';
  if (g.querySelector('.no-on')) return 'M';
  if (g.querySelector('.na-on')) return 'NA';""", "13e· leer")

# 14 · La cantidad viaja, se restaura, se hereda y cuenta como contenido.
J = sustituir(J, "      obs: (it.querySelector('textarea').value || '').trim(),\n",
                 "      obs: (it.querySelector('textarea').value || '').trim(),\n      cant: (it.querySelector('.cant').value || '').trim(),\n      pr: (it.querySelector('.pr').value || '').trim(),\n      ud: unidadLeida(it),\n", "14a· datos")
# 14a' · Una proyectada que vino de la visita anterior no es «sin revisar»: es la
# meta, y sigue vigente. El ítem que solo trae proyectado no viaja con la marca
# de heredado —el relevo la imprime en ámbar como «sin revisar» (r22)—.
J = sustituir(J, "      heredado: it.dataset.heredado || ''\n    }))\n    // Un agregado sin respuesta no viaja",
                 "      heredado: it.classList.contains('her-pr') ? '' : (it.dataset.heredado || '')\n    }))\n    // Un agregado sin respuesta no viaja", "14a'· proyectada heredada sin marca")
J = sustituir(J, "    .filter(i => !i.agregado || i.sn || i.obs),", "    .filter(i => !i.agregado || i.sn || i.obs || i.cant),", "14b· agregado con cantidad viaja")
J = sustituir(J, "        ponerSN(el, it.sn);\n        el.querySelector('textarea').value = it.obs || '';",
                 "        ponerSN(el, it.sn);\n        el.querySelector('textarea').value = it.obs || '';\n        ponerCant(el, it);", "14c· restaurar", n=1)
J = sustituir(J, "      ponerSN(el, it.sn);\n      el.querySelector('textarea').value = it.obs || '';\n      if (it.sn || it.obs){ el.classList.add('heredado');",
                 "      ponerSN(el, it.sn);\n      el.querySelector('textarea').value = it.obs || '';\n      ponerCant(el, it);\n      if (!(it.sn || it.obs || it.cant) && it.pr) el.classList.add('her-pr');\n      if (it.sn || it.obs || it.cant || it.pr){ el.classList.add('heredado');", "14d· heredar con cantidad")
J = sustituir(J, "        nombre: i.nombre, agregado: i.agregado, sn: i.sn, obs: i.obs,",
                 "        nombre: i.nombre, agregado: i.agregado, sn: i.sn, obs: i.obs, cant: i.cant, pr: i.pr, ud: i.ud,", "14e· memoria de la manzana")
J = sustituir(J, "  const contestado = (d.general || []).some(g => (g.items || []).some(i => i.sn || i.obs)) ||",
                 "  const contestado = (d.general || []).some(g => (g.items || []).some(i => i.sn || i.obs || i.cant || i.pr)) ||", "14f· contestado")
J = sustituir(J, "                                      (g.items || []).some(i => i.sn || (i.obs || '').trim())) &&",
                 "                                      (g.items || []).some(i => i.sn || i.cant || i.pr || (i.obs || '').trim())) &&", "14g· vacío")
J = sustituir(J, "  return ![...document.querySelectorAll('.item')].some(it =>\n    valorSN(it) || (it.querySelector('textarea').value || '').trim());",
                 "  return ![...document.querySelectorAll('.item')].some(it =>\n    valorSN(it) || it.querySelector('.cant').value || it.querySelector('.pr').value || (it.querySelector('textarea').value || '').trim());", "14h· en blanco")
J = sustituir(J, "  const items = [...document.querySelectorAll('.item')].filter(it => valorSN(it) || (it.querySelector('textarea').value || '').trim());",
                 "  const items = [...document.querySelectorAll('.item')].filter(it => valorSN(it) || it.querySelector('.cant').value || it.querySelector('.pr').value || (it.querySelector('textarea').value || '').trim());", "14i· solo heredado")
J = sustituir(J, "    const hechos = items.filter(i => valorSN(i)).length;",
                 "    const hechos = items.filter(i => valorSN(i) || i.querySelector('.cant').value).length;", "14j· cuenta")
J = sustituir(J, "    const her = items.filter(i => i.classList.contains('heredado') && valorSN(i)).length;",
                 "    const her = items.filter(i => i.classList.contains('heredado') && (valorSN(i) || i.querySelector('.cant').value)).length;", "14k· sin revisar en la cuenta")
J = sustituir(J, "  (d.general || []).forEach(g => (g.items || []).forEach(i => { if (i.heredado && i.sn) n++; }));",
                 "  (d.general || []).forEach(g => (g.items || []).forEach(i => { if (i.heredado && (i.sn || i.cant)) n++; }));", "14l· sin revisar al enviar")
J = sustituir(J, "function actualizarCuentas(){\n", "function actualizarCuentas(){\n  actualizarAvances();\n", "14m· avances al marcar")

# 14n · Al cambiar de manzana con solo lo heredado, el motor soltaba calidad y
# observación pero dejaba la CANTIDAD, el proyectado y la unidad: la manzana
# nueva arrancaba con los números de la anterior como si fueran de hoy (QC del
# 21-sep). Se sueltan los cuatro.
J = sustituir(J, "  document.querySelectorAll('.item.heredado').forEach(it => {\n    ponerSN(it, ''); it.querySelector('textarea').value = '';",
                 "  document.querySelectorAll('.item.heredado').forEach(it => {\n    ponerSN(it, ''); it.querySelector('textarea').value = '';\n    it.querySelector('.cant').value = ''; it.querySelector('.pr').value = ''; const us = it.querySelector('.ud-sel'); if (us) us.value = ''; actualizarAvance(it); it.classList.remove('her-pr');", "14n· soltar cantidades heredadas")
J = sustituir(J, "  if (it && it.classList.contains('heredado')){ it.classList.remove('heredado'); delete it.dataset.heredado; }",
                 "  if (it && it.classList.contains('heredado')){ it.classList.remove('heredado', 'her-pr'); delete it.dataset.heredado; }", "14o· tocar quita la marca de proyectado heredado")

# 15 · Secciones agregadas: entran en GENERAL, se recuerdan, y las que traiga un
# informe guardado o la visita anterior se crean solas.
J += r"""
function seccionesRecordadas(){
  try { return JSON.parse(localStorage.getItem(CLAVE_SECCIONES) || '[]'); } catch(e){ return []; }
}
function recordarSeccion(s){
  const rec = seccionesRecordadas();
  if (!rec.some(x => x.id === s.id)) rec.push({ id: s.id, nombre: s.nombre, items: [] });
  try { localStorage.setItem(CLAVE_SECCIONES, JSON.stringify(rec)); } catch(e){}
}
function cargarSeccionesRecordadas(){
  seccionesRecordadas().forEach(s => { if (!GENERAL.some(g => g.id === s.id)) GENERAL.push({ id: s.id, nombre: s.nombre, items: [] }); });
}
function agregarSeccion(){
  const nombre = (document.getElementById('ns-nombre').value || '').trim();
  if (!nombre){ alert('Escriba el nombre de la sección.'); return; }
  const id = 'urb_x_' + limpiar(nombre).toLowerCase();
  if (GENERAL.some(g => g.id === id)){ alert('Esa sección ya existe.'); return; }
  // Lo que hay en pantalla se guarda ANTES de sumar la sección (guardar lee
  // GENERAL y la sección aún no está pintada), se vuelve a pintar todo y se
  // reabre: pintar una sección sola exigiría partir el motor en dos.
  // «En blanco» aquí es el informe entero —notas de sección, fotos, NO
  // INSPECCIONADO—, no solo las partidas: con una nota y una foto y ninguna
  // partida, repintar sin guardar las borraba (QC del 21-sep).
  const habia = !informeVacio(datosDelFormulario());
  if (habia) guardar(false);
  const id0 = idActual;
  const s = { id, nombre: (GENERAL.length + 1) + '. ' + nombre.toUpperCase(), items: [] };
  GENERAL.push(s); recordarSeccion(s);
  pintarGeneral();
  if (habia && id0) cargarInforme(id0);
  document.getElementById('ns-nombre').value = '';
  plegar(id, true);
  document.getElementById('srv-' + id).scrollIntoView({ block: 'start', behavior: 'smooth' });
}
// Un informe guardado o heredado puede traer secciones que este teléfono no
// tiene: se crean antes de pintarlo.
function asegurarSecciones(general){
  let nuevas = false;
  (general || []).forEach(g => {
    if (!g || !g.id || GENERAL.some(s => s.id === g.id)) return;
    const s = { id: g.id, nombre: g.nombre || g.id, items: [] };
    GENERAL.push(s); recordarSeccion(s); nuevas = true;
  });
  if (nuevas) pintarGeneral();
}
"""
# 15d · Una sección agregada sin nada dentro no viaja en el informe: si viajara,
# cualquier teléfono que abriera ese informe —o lo heredara del relevo— la
# crearía y la recordaría, y veinte secciones de prueba de un teléfono acabarían
# en todos (QC del 21-sep). Las ocho fijas viajan siempre.
J = sustituir(J, "    general, apartamentos: aptos,",
                 "    general: general.filter(g => !/^urb_x_/.test(g.id) || g.items.length || g.obs || g.fotos.length || noInsp.indexOf(g.id) >= 0),\n    apartamentos: aptos,", "15d· secciones agregadas vacías no viajan")
J = sustituir(J, "    (d.general || []).forEach(g => {\n      const cont = document.getElementById('items-' + g.id); if (!cont) return;",
                 "    asegurarSecciones(d.general);\n    (d.general || []).forEach(g => {\n      const cont = document.getElementById('items-' + g.id); if (!cont) return;", "15a· abrir con secciones nuevas")
J = sustituir(J, "  (e.general || []).forEach(g => {\n    const cont = document.getElementById('items-' + g.id); if (!cont) return;",
                 "  asegurarSecciones(e.general);\n  (e.general || []).forEach(g => {\n    const cont = document.getElementById('items-' + g.id); if (!cont) return;", "15b· heredar con secciones nuevas")
J = sustituir(J, "  pintarGeneral(); pintarApartamentos(); addInspector();",
                 "  cargarSeccionesRecordadas();\n  pintarGeneral(); pintarApartamentos(); addInspector();\n  if (/[?&]rol=planificacion/.test(location.search)) alternarPlanificacion(true);", "15c· al arrancar")
J += r"""
// Planificación carga la cantidad proyectada por partida. Entra por el botón
// «Proyectadas» (detrás del «⋯») o por ?rol=planificacion; se ve un aviso.
function alternarPlanificacion(encender){
  const b = document.body;
  const on = encender === true ? true : !b.classList.contains('plan');
  b.classList.toggle('plan', on);
  let a = document.querySelector('.plan-aviso');
  if (on && !a){ a = document.createElement('div'); a.className = 'plan-aviso'; a.textContent = '📊 Modo Planificación: aquí se escribe la cantidad proyectada de cada partida. El inspector no ve este campo. Toque «Proyectadas» otra vez para salir.'; document.querySelector('.envoltorio').prepend(a); }
  if (!on && a) a.remove();
}
"""

# 16 · Freno: sin relevo que acepte 'urbanismo', no se envía.
J = sustituir(J, """async function enviar(){
  if (_tandaEnCurso){ alert('Ya hay un envío en curso. Espere a que termine.'); return; }""",
"""async function relevoAceptaUrbanismo(){
  try {
    const corte = new AbortController(); const reloj = setTimeout(() => corte.abort(), 15000);
    const r = await fetch(RELEVO_URL, { signal: corte.signal }); clearTimeout(reloj);
    const j = await r.json();
    return { ok: (j.tipos || []).indexOf('urbanismo') >= 0, version: j.version || '?' };
  } catch (e) { return { ok: false, error: String(e) }; }
}
async function frenoUrbanismo(){
  const a = await relevoAceptaUrbanismo();
  if (a.ok) return true;
  alert(a.error
    ? 'No hay señal, o el relevo no responde. El informe sigue guardado aquí.'
    : '⏸ El relevo (' + a.version + ') todavía no recibe informes de urbanismo.\\n\\n' +
      'El informe queda guardado en este teléfono y se enviará cuando la oficina lo active. No hay que hacer nada más.');
  return false;
}

async function enviar(){
  if (_tandaEnCurso){ alert('Ya hay un envío en curso. Espere a que termine.'); return; }""", "16a· freno del relevo")
J = sustituir(J, "  _tandaEnCurso = true;\n  let bien = 0; const fallos = [];",
                 "  _tandaEnCurso = true;\n  if (!(await frenoUrbanismo())){ _tandaEnCurso = false; return; }\n  let bien = 0; const fallos = [];", "16b· freno en la tanda")
J = sustituir(J, "  if (_tandaEnCurso){ alert('Ya hay un envío en curso. Espere a que termine.'); return; }\n  _tandaEnCurso = true;\n  try { cartel('📤 Enviando ' + d.nro",
                 "  if (_tandaEnCurso){ alert('Ya hay un envío en curso. Espere a que termine.'); return; }\n  _tandaEnCurso = true;\n  if (!(await frenoUrbanismo())){ _tandaEnCurso = false; return; }\n  try { cartel('📤 Enviando ' + d.nro", "16c· freno en el envío individual")

# 16d · Lo que falta se dice en el idioma de urbanismo, y una partida agregada
# con cantidad pero sin nombre no sale: viajaba con el nombre vacío (QC del 21-sep).
J = sustituir(J, "  if (!d.torre)    f.push('la torre');\n  if (!d.convenio) f.push('el convenio');",
                 "  if (!d.torre)    f.push('la manzana o lote');\n  if (!d.convenio) f.push('el sector');\n  (d.general || []).forEach(g => (g.items || []).forEach(i => { if (i.agregado && !i.nombre && (i.sn || i.obs || i.cant || i.pr)) f.push('el nombre de la partida agregada en ' + g.nombre); }));", "16d· faltan: manzana, sector y partidas sin nombre")
J = sustituir(J, "Complételo antes de pasar a otra torre.", "Complételo antes de pasar a otra manzana.", "16e· otra manzana")

# 17 · Textos: apartamentos no existen aquí.
J = sustituir(J, "(aptos ? ' · ' + aptos + ' apto(s)' : '')", "''", "17a· historial sin aptos")
J = sustituir(J, "(x.apartamentos || []).length + ' apto(s)</div>'", "(x.general || []).reduce((s, g) => s + (g.items || []).filter(i => i.sn || i.cant).length, 0) + ' partida(s)</div>'", "17b· fichas")
J = sustituir(J, "  const n = (e.general || []).reduce((s, g) => s + g.items.filter(i => i.sn).length, 0);",
                 "  const n = (e.general || []).reduce((s, g) => s + g.items.filter(i => i.sn || i.cant).length, 0);", "17c· el banner cuenta cantidades")
J = sustituir(J, "' ítem(s) contestado(s)'", "' partida(s) con dato'", "17d· partidas, no ítems")
J = sustituir(J, "Este servicio todavía no tiene lista de ítems.<br>' +\n              'Agréguelos abajo mientras Ingeniería la define.",
                 "Esta sección todavía no tiene partidas.<br>' +\n              'Agréguelas abajo; se recuerdan en este teléfono.", "17e· sección sin partidas")
J = sustituir(J, "＋ Agregar ítem</button>", "＋ Agregar partida</button>", "17f· agregar partida")
J = sustituir(J, 'placeholder="Observación del servicio..."', 'placeholder="Notas de la sección..."', "17g· notas de la sección")
J = sustituir(J, 'placeholder="Escriba el ítem..."', 'placeholder="Escriba la partida..."', "17h· escriba la partida")
# 17i · Al reabrir o heredar, una sección con solo cantidades también se abre.
J = sustituir(J, "      if ((g.items || []).some(i => i.sn || i.obs || (i.agregado && i.nombre)) || g.obs || (g.fotos || []).length) plegar(g.id, true);",
                 "      if ((g.items || []).some(i => i.sn || i.obs || i.cant || i.pr || (i.agregado && i.nombre)) || g.obs || (g.fotos || []).length) plegar(g.id, true);", "17i· reabrir desplegada con cantidades")
J = sustituir(J, "    if ((g.items || []).some(i => i.sn || i.obs) || g.obs) plegar(g.id, true);",
                 "    if ((g.items || []).some(i => i.sn || i.obs || i.cant) || g.obs) plegar(g.id, true);", "17j· heredar desplegada con cantidades")


def manzanas_js():
    filas = []
    for m, c in contenido.MANZANAS:
        filas.append({"t": m, "c": c, "e": contenido.EMPRESA_POR_SECTOR.get(c, ""), "r": ""})
    return json.dumps(filas, ensure_ascii=False)


def inspectores_de_urbanismo():
    todos = json.loads(motor.js_de(maestros.INSPECTORES_JS))
    primero = [i for n in INSPECTORES_URB for i in todos if i.startswith(n)]
    if len(primero) != len(INSPECTORES_URB):
        sys.exit("✗ No encontré en el padrón a: %s" %
                 [n for n in INSPECTORES_URB if not any(i.startswith(n) for i in todos)])
    return primero + [i for i in todos if i not in primero]


def construir():
    sectores = ''.join('<option value="%s">%s</option>' % (c, n) for c, n in contenido.NOMBRE_SECTOR.items())
    general = [{"id": s["id"], "nombre": s["nombre"], "items": s["items"]} for s in contenido.GENERAL]
    unidad_de = {s["id"]: s["unidades"] for s in contenido.GENERAL}
    pagina = (H
        .replace('@@CSS@@', C)
        .replace('@@VERSION@@', motor.VERSION)
        .replace('@@SECTORES@@', sectores)
        .replace('@@TORRES@@', manzanas_js())
        .replace('@@SECTOR@@', motor.js_de(maestros.SECTOR_POR_CONVENIO_JS))
        .replace('@@INSPECTORES@@', json.dumps(inspectores_de_urbanismo(), ensure_ascii=False))
        .replace('@@GENERAL@@', json.dumps(general, ensure_ascii=False, indent=2))
        .replace('@@RENOMBRADOS@@', json.dumps(contenido.RENOMBRADOS, ensure_ascii=False))
        .replace('@@APARTAMENTOS@@', json.dumps(contenido.APARTAMENTOS, ensure_ascii=False))
        .replace('@@UNIDAD@@', json.dumps(contenido.UNIDAD_CANTIDAD))
        .replace('@@MAXFOTOS@@', str(MAX_FOTOS))
        .replace('@@MAXPX@@', str(motor.MAX_FOTO_PX))
        .replace('@@CALIDAD@@', str(motor.CALIDAD_FOTO))
        .replace('@@RELEVO@@', json.dumps(motor.RELEVO_URL))
        .replace('@@JS@@', PREFIJO + J)
        .replace('@@TOPE@@', str(motor.TOPE_ALMACEN))
        .replace('@@NOMBRE_SECTOR@@', json.dumps(contenido.NOMBRE_SECTOR, ensure_ascii=False))
        .replace('@@EMPRESA_POR_SECTOR@@', json.dumps(contenido.EMPRESA_POR_SECTOR, ensure_ascii=False))
        .replace('@@UNIDADES@@', json.dumps(contenido.UNIDADES, ensure_ascii=False))
        .replace('@@UNIDAD_DE@@', json.dumps(unidad_de, ensure_ascii=False)))

    if '@@' in pagina:
        import re as _re
        sys.exit("✗ Quedaron marcadores sin sustituir: %s" % _re.findall(r'@@\w+@@', pagina))

    for viejo, nuevo in maestros.CORRECCIONES_EMPRESA + maestros.CORRECCIONES_TEXTO:
        pagina = pagina.replace(viejo, nuevo)

    open(SALIDA, "w", encoding="utf-8").write(pagina)
    return pagina


# Urbanismo cubre áreas grandes: seis fotos por sección, como los hitos de obra.
MAX_FOTOS = 6

# Las constantes propias van AL PRINCIPIO del código: el arranque del motor las
# usa (pintar las partidas, llenar el desplegable) antes de que una `const`
# declarada al final exista. Lo mismo que le pasó a SHA con las incidencias.
PREFIJO = """const NOMBRE_SECTOR = @@NOMBRE_SECTOR@@;
const EMPRESA_POR_SECTOR = @@EMPRESA_POR_SECTOR@@;
const CLAVE_MANZANAS = 'garmel_urb_manzanas';
const CLAVE_SECCIONES = 'garmel_urb_secciones';
const UNIDADES = @@UNIDADES@@;
const UNIDAD_DE = @@UNIDAD_DE@@;
"""

if __name__ == "__main__":
    p = construir()
    print("✓ urbanismo.html construido — %d KB · %d sustituciones sobre el motor de servicios" %
          (os.path.getsize(SALIDA) // 1024, len(cambios)))
    print("  secciones: %d · partidas: %d · manzanas: %d" % (len(contenido.GENERAL), contenido.total_items(), len(contenido.MANZANAS)))
    print("  firman primero: %s" % ", ".join(INSPECTORES_URB))
