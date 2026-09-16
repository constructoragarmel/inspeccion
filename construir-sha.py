#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Construye sha.html — el formulario de inspección de SHA (Seguridad, Higiene y Ambiente).

NO ES UNA COPIA DEL DE SERVICIOS: ES UNA DERIVACIÓN. Importa el motor de
`construir-servicios.py` —estilos, maqueta y JS— y le aplica sustituciones con
ancla, como hace `construir.py` con el original de Skarlet. Si el motor cambia y
un ancla deja de encontrarse, este generador FALLA en vez de producir un
formulario a medias. Un arreglo en servicios entra aquí solo; lo que SHA hace
distinto está enumerado abajo, uno por uno.

QUÉ HEREDA SIN TOCAR: cascada torre → convenio → empresa → residente desde el
maestro común, padrón filtrado por nombre, ítems Sí/No/N-A con observación y
fotografías, ítems agregados que el teléfono recuerda, historial por torre con
respuestas heredadas y aviso al enviar, fotos en IndexedDB, guardado, envío,
modo de prueba, service worker.

QUÉ CAMBIA (contenido en sha/contenido.py):
  A) Recaudos y aspectos de seguridad — los nueve del borrador, como ítems.
  B) Hallazgos de campo — filas agregadas a mano: área/frente, hallazgo,
     estatus (Pendiente / En proceso / Corregido) y fotos por hallazgo.
  C) Cierre — estatus general de la inspección y comentarios del inspector.
  Historial por EMPRESA para los recaudos, además del de torre: el registro
  mercantil de una contratista es el mismo en todas sus torres.
  Identificador SHA-EZ-T45-260914-BR.

FRENO: el relevo todavía no recibe `tipo: 'sha'`. Hasta que lo declare en su
doGet (`tipos: [..., 'sha']`), el formulario guarda pero NO envía, y lo dice.
Sin ese freno un informe de SHA entraría por la rama de inspección y dejaría
una fila a medias en el registro de obra, que es lo que pasó con servicios el
2-sep-2026.
"""
import os, sys, json, importlib.util

RAIZ = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(RAIZ, "comun"))
sys.path.insert(0, os.path.join(RAIZ, "sha"))
import maestros
import contenido

spec = importlib.util.spec_from_file_location("motor", os.path.join(RAIZ, "construir-servicios.py"))
motor = importlib.util.module_from_spec(spec)
spec.loader.exec_module(motor)

SALIDA = os.path.join(RAIZ, "sha.html")
INSPECTORES_SHA = ["Birmania Rada", "Víctor Mendoza"]

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
H = sustituir(H, "<title>Inspección de Servicios — GARMEL</title>",
                 "<title>Inspección SHA — GARMEL</title>", "1· título")
H = sustituir(H, "<h1>INSPECCIÓN DE SERVICIOS PÚBLICOS</h1>",
                 "<h1>INSPECCIÓN SHA · SEGURIDAD, HIGIENE Y AMBIENTE</h1>", "2· cabecera")

# 3 · El estatus de obra sale de la cabecera: SHA no califica la obra, califica
# la inspección, y eso va al cierre. El <select id="estatus"> se conserva —el
# motor y el relevo lo leen— pero vive en la tarjeta de cierre.
H = sustituir(H, """      <div class="campo">
        <label for="estatus">Estatus de obra</label>
        <select id="estatus">
          <option value="">—</option><option>Iniciada</option>
          <option>En progreso</option><option>Culminada</option><option>Paralizada</option>
        </select>
      </div>
    </div>
    <div id="aviso-torre"></div>""",
"""    </div>
    <div id="aviso-torre"></div>""", "3· sin estatus de obra en la cabecera")

H = sustituir(H, """<button type="button" id="tab-a" class="on" onclick="verPanel('a')">General</button>""",
                 """<button type="button" id="tab-a" class="on" onclick="verPanel('a')">Recaudos</button>""", "4a· pestaña A")
H = sustituir(H, """<button type="button" id="tab-b" onclick="verPanel('b')">Apartamentos</button>""",
                 """<button type="button" id="tab-b" onclick="verPanel('b')">Hallazgos de campo</button>""", "4b· pestaña B")

# 5 · Cierre: estatus general + comentarios, en lugar de la observación general.
H = sustituir(H, """  <div class="tarjeta">
    <label style="font-weight:600;font-size:13px;color:#475569">Observación general</label>
    <textarea id="obs_general" placeholder="Lo que no cabe en ningún servicio..."></textarea>
  </div>""",
"""  <div class="tarjeta" id="cierre">
    <div class="campo">
      <label for="estatus">Estatus general de la inspección</label>
      <select id="estatus"><option value="">— Seleccione —</option>@@CIERRE@@</select>
    </div>
    <div id="rechazo" hidden>
      <div class="campo" style="margin-top:10px">
        <label for="accion">Acción por el rechazo *</label>
        <select id="accion" onchange="marcar()"><option value="">— Seleccione —</option>@@ACCIONES@@</select>
      </div>
      <div class="campo">
        <label for="accion_det">A qué actividad o frente aplica</label>
        <input type="text" id="accion_det" placeholder="Ej.: trabajos en altura, losa 5 · frente norte" oninput="marcar()">
      </div>
    </div>
    <label style="font-weight:600;font-size:13px;color:#475569;margin-top:12px;display:block">Comentarios y recomendaciones del inspector</label>
    <textarea id="obs_general" placeholder="Lo que no cabe en ningún recaudo ni hallazgo..."></textarea>
    <div class="tarjeta" style="margin:8px 0 0"><label style="font-weight:600;font-size:13px;color:#475569">Fotografías generales de la visita (máx. @@MAXFOTOS@@)</label>
      <input type="file" accept="image/*" multiple onchange="tomarFotos(event,'fotos-general')">
      <div class="fotos" id="fotos-general"></div></div>
  </div>""", "5· cierre")

H = sustituir(H, "title=\"Guarda este informe y prepara el de la siguiente torre, conservando inspector, fecha y estatus\"",
                 "title=\"Guarda este informe y prepara el de la siguiente torre, conservando inspector y fecha\"", "6· pie de botón")

# ══════════════════════════════════════════════════════════════════════════
# MOTOR
# ══════════════════════════════════════════════════════════════════════════
J = motor.JS

# 10 · Identidad: prefijo del número, del id local, tipo para el relevo y
# claves de almacenamiento propias. Los dos formularios conviven en el mismo
# teléfono y no deben pisarse.
J = sustituir(J, "(TEST_MODE ? 'PRUEBA-' : '') + 'SRV-' + sec", "(TEST_MODE ? 'PRUEBA-' : '') + 'SHA-' + sec", "10a· prefijo SHA")
J = sustituir(J, "id: idActual || ('srv_' + Date.now()),", "id: idActual || ('sha_' + Date.now()),", "10b· id local")
J = sustituir(J, "    tipo: 'servicios',\n", "    tipo: 'sha',\n", "10c· tipo en los datos")
J = sustituir(J, "return { clave, numero: d.nro, tipo: 'servicios', ambito: 'torre',",
                 "return { clave, numero: d.nro, tipo: 'sha', ambito: 'torre',", "10d· tipo en el sobre")
J = sustituir(J, "const TIPO_INFORME = 'servicios';", "const TIPO_INFORME = 'sha';", "10g· tipo en la consulta del historial")
for k in ["items", "list", "torres", "actual"]:
    J = sustituir(J, "'garmel_srv_%s'" % k, "'garmel_sha_%s'" % k, "10e· clave garmel_sha_%s" % k)
J = sustituir(J, "indexedDB.open('garmel_servicios', 1)", "indexedDB.open('garmel_sha', 1)", "10f· base de fotos propia")

# 11 · Los recaudos abren desplegados: es un solo bloque y es lo primero que se
# llena. Plegado, el inspector veía una pantalla con una sola línea.
J = sustituir(J, "    srv.items.forEach(nombre => addItem(srv.id, nombre, true));\n",
                 "    srv.items.forEach(nombre => addItem(srv.id, nombre, true));\n    plegar(srv.id, true);\n", "11· recaudos abiertos")
J = sustituir(J, "Este servicio todavía no tiene lista de ítems.", "Este bloque todavía no tiene lista de recaudos.", "11b· texto de bloque vacío")

# 12 · La fila de hallazgo: sin piso, con el área/frente como cabecera de la
# fila. El `.piso` se conserva oculto porque el motor lo lee al guardar.
J = sustituir(J, """  cont.innerHTML = '<div class="vacio" id="b-vacio">Todavía no hay apartamentos. ' +
    'Agregue los que haya visitado hoy.</div><div id="filas-apto"></div>' +
    '<button type="button" class="btn-add" onclick="addApartamento()">＋ Agregar apartamento</button>';""",
"""  cont.innerHTML = '<div class="vacio" id="b-vacio">Todavía no hay hallazgos de campo. ' +
    'Agregue lo que encontró en la inspección física de la obra.</div><div id="filas-apto"></div>' +
    '<button type="button" class="btn-add" onclick="addApartamento()">＋ Agregar hallazgo</button>';""", "12a· panel de hallazgos")
J = sustituir(J, """    '<select class="piso" onchange="marcar()" style="flex:1"><option value="">Piso</option>' +
    '<option value="PB">Planta Baja</option>';
  for (let i = 1; i <= 20; i++) html += '<option value="P' + String(i).padStart(2,'0') + '">Piso ' + String(i).padStart(2,'0') + '</option>';
  html += '</select>' +
    '<input type="text" class="apto" placeholder="Apto / área" oninput="marcar()" style="flex:1">' +""",
"""    '<input type="hidden" class="piso">' +
    '<input type="text" class="apto" placeholder="Área / frente de trabajo (andamio, losa 5, fachada norte…)" oninput="marcar()" style="flex:1">' +""", "12b· área/frente en vez de piso y apto")
J = sustituir(J, "bloqueFotos('fotos-apto-' + _nApto, 'Fotografías del apartamento')",
                 "bloqueFotos('fotos-apto-' + _nApto, 'Fotografías del hallazgo')", "12c· fotos del hallazgo")

# 13 · Tipo de columna «lista»: un desplegable con opciones fijas. Servicios no
# lo necesitaba; el estatus del hallazgo sí.
J = sustituir(J, "      } else if (tipo === 'cant'){",
"""      } else if (tipo === 'lista'){
        html += '<div style="display:flex;align-items:center;gap:8px;margin-top:6px">' +
                '<span style="flex:1;font-size:13px">' + etiqueta + '</span>' +
                '<select data-campo="' + id + '" onchange="marcar()" style="flex:1"><option value="">—</option>' +
                ESTADOS_HALLAZGO.map(o => '<option>' + o + '</option>').join('') + '</select></div>';
      } else if (tipo === 'cant'){""", "13· columna de tipo lista")

# 14 · Textos de conteo: hallazgos, no apartamentos.
J = sustituir(J, "(aptos ? ' · ' + aptos + ' apto(s)' : '')", "(aptos ? ' · ' + aptos + ' hallazgo(s)' : '')", "14a· historial")
J = sustituir(J, "(x.apartamentos || []).length + ' apto(s)</div>'", "(x.apartamentos || []).length + ' hallazgo(s)</div>'", "14b· fichas")

# 15 · Historial por EMPRESA para los recaudos. La memoria por torre sigue
# igual; además, al guardar, el bloque de recaudos queda anotado bajo la
# empresa. Si la torre no tiene informe anterior pero la empresa sí, se ofrece
# traer SOLO los recaudos, heredados y marcados como tal.
J = sustituir(J, "  try { localStorage.setItem(CLAVE_TORRES, JSON.stringify(todos)); } catch(e){}\n}",
"""  try { localStorage.setItem(CLAVE_TORRES, JSON.stringify(todos)); } catch(e){}
  anotarRecaudosEmpresa(d, todos[d.torre]);
}
const CLAVE_EMPRESAS = 'garmel_sha_empresas';
function estadosDeEmpresas(){
  try { return JSON.parse(localStorage.getItem(CLAVE_EMPRESAS) || '{}'); } catch(e){ return {}; }
}
function anotarRecaudosEmpresa(d, estadoTorre){
  if (!d.empresa || !estadoTorre) return;
  const todos = estadosDeEmpresas();
  const previo = todos[d.empresa];
  if (previo && previo.id !== d.id &&
      (previo.fecha > d.fecha || (previo.fecha === d.fecha && previo.guardado > d.guardado))) return;
  todos[d.empresa] = { id: d.id, nro: d.nro, fecha: d.fecha, guardado: d.guardado, torre: d.torre,
                       general: estadoTorre.general };
  try { localStorage.setItem(CLAVE_EMPRESAS, JSON.stringify(todos)); } catch(e){}
}
function ofrecerRecaudosDeEmpresa(){
  const caja = document.getElementById('aviso-historial');
  const emp = document.getElementById('empresa').value;
  const e = emp ? estadosDeEmpresas()[emp] : null;
  if (!e || e.id === idActual || !formularioEnBlanco()) return;
  const n = (e.general || []).reduce((s, g) => s + g.items.filter(i => i.sn).length, 0);
  if (!n) return;
  caja.innerHTML = '<div class="historial">' +
    '<div class="t">📋 ' + emp + ' ya tiene recaudos verificados</div>' +
    '<div class="s">' + e.nro + ' · ' + fechaLarga(e.fecha) + ' · en ' + e.torre + ' · ' + n + ' recaudo(s) contestado(s)' +
    '.<br>Los recaudos son de la empresa, no de la torre: ¿traerlos y revisar solo lo que cambió?</div>' +
    '<div class="b"><button type="button" class="si" onclick="traerRecaudosDeEmpresa()">Sí, traer los recaudos</button>' +
    '<button type="button" class="no" onclick="document.getElementById(&quot;aviso-historial&quot;).innerHTML=&quot;&quot;">No, en blanco</button></div></div>';
  caja.firstElementChild.scrollIntoView({ block: 'center', behavior: 'smooth' });
}
function traerRecaudosDeEmpresa(){
  const emp = document.getElementById('empresa').value;
  const e = estadosDeEmpresas()[emp];
  document.getElementById('aviso-historial').innerHTML = '';
  if (!e) return;
  (e.general || []).forEach(g => {
    const cont = document.getElementById('items-' + g.id); if (!cont) return;
    (g.items || []).forEach(it => {
      const el = buscarOCrearItem(g.id, it);
      if (!el) return;
      ponerSN(el, it.sn);
      el.querySelector('textarea').value = it.obs || '';
      if (it.sn || it.obs){ el.classList.add('heredado'); el.dataset.heredado = it.heredado || e.nro; }
    });
    plegar(g.id, true);
  });
  actualizarCuentas(); marcar();
}""", "15a· memoria de recaudos por empresa")
J = sustituir(J, "  if (!e || e.id === idActual || !formularioEnBlanco()) return;\n  const n = (e.general || []).reduce((s, g) => s + g.items.filter(i => i.sn).length, 0);\n  const aptos",
"""  if (!e || e.id === idActual || !formularioEnBlanco()){ if (!e) ofrecerRecaudosDeEmpresa(); return; }
  const n = (e.general || []).reduce((s, g) => s + g.items.filter(i => i.sn).length, 0);
  const aptos""", "15b· si la torre no tiene historial, se mira la empresa")
# La empresa se conoce al elegir el convenio (torres con dos): también ahí.
J = sustituir(J, "  actualizarNro(); marcar();\n  pedirHistorialAlRelevo();\n}\n\n// ── El identificador",
"""  actualizarNro(); marcar();
  pedirHistorialAlRelevo();
  if (!document.querySelector('#aviso-historial .historial')) ofrecerRecaudosDeEmpresa();
}

// ── El identificador""", "15c· al elegir convenio")

# 16 · El freno: sin relevo que acepte 'sha', no se envía. Se pregunta con
# señal (doGet devuelve `tipos`); sin señal, el aviso de siempre.
J = sustituir(J, """async function enviar(){
  if (_tandaEnCurso){ alert('Ya hay un envío en curso. Espere a que termine.'); return; }""",
"""async function relevoAceptaSha(){
  try {
    const corte = new AbortController(); const reloj = setTimeout(() => corte.abort(), 15000);
    const r = await fetch(RELEVO_URL, { signal: corte.signal }); clearTimeout(reloj);
    const j = await r.json();
    return { ok: (j.tipos || []).indexOf('sha') >= 0, version: j.version || '?' };
  } catch (e) { return { ok: false, error: String(e) }; }
}
async function frenoSha(){
  const a = await relevoAceptaSha();
  if (a.ok) return true;
  alert(a.error
    ? 'No hay señal, o el relevo no responde. El informe sigue guardado aquí.'
    : '⏸ El relevo (' + a.version + ') todavía no recibe informes de SHA.\\n\\n' +
      'El informe queda guardado en este teléfono y se enviará cuando la oficina lo active. No hay que hacer nada más.');
  return false;
}

async function enviar(){
  if (_tandaEnCurso){ alert('Ya hay un envío en curso. Espere a que termine.'); return; }""", "16a· freno del relevo")
# La bandera se levanta ANTES de preguntar al relevo: el freno espera una
# respuesta de red, y dos toques seguidos en Enviar pasaban los dos por delante
# de la bandera y mandaban todo dos veces (lo encontró el QC del 14-sep).
J = sustituir(J, "  _tandaEnCurso = true;\n  let bien = 0; const fallos = [];",
                 "  _tandaEnCurso = true;\n  if (!(await frenoSha())){ _tandaEnCurso = false; return; }\n  let bien = 0; const fallos = [];", "16b· freno en la tanda")
J = sustituir(J, "  if (_tandaEnCurso){ alert('Ya hay un envío en curso. Espere a que termine.'); return; }\n  _tandaEnCurso = true;\n  try { cartel('📤 Enviando ' + d.nro",
                 "  if (_tandaEnCurso){ alert('Ya hay un envío en curso. Espere a que termine.'); return; }\n  _tandaEnCurso = true;\n  if (!(await frenoSha())){ _tandaEnCurso = false; return; }\n  try { cartel('📤 Enviando ' + d.nro", "16c· freno en el envío individual")

# 17 · «Sig. torre» conserva inspector y fecha; el estatus general es de cada
# inspección y no se arrastra.
J = sustituir(J, "  document.getElementById('estatus').value = estatus;\n  document.getElementById('inspectores').innerHTML = '';",
                 "  document.getElementById('inspectores').innerHTML = '';", "17· el cierre no se arrastra")
# Y al traer el historial de la torre tampoco se hereda el cierre.
J = sustituir(J, "  if (e.estatus && !document.getElementById('estatus').value) document.getElementById('estatus').value = e.estatus;\n",
                 "", "17b· ni con el historial")

# 18 · El cierre es obligatorio: un SHA sin estatus general no dice nada y no
# se envía (ni en tanda ni uno solo desde la lista). Lo pidió Stephanie el
# 15-sep tras el QC: servicios puede ir vacío, SHA no.
J = sustituir(J, "  if (!d.inspectores.length) f.push('el inspector');\n  return f;",
                 "  if (!d.inspectores.length) f.push('el inspector');\n"
                 "  if (!d.estatus) f.push('el estatus general del cierre');\n"
                 "  if (d.estatus === 'Rechazado' && !d.accion) f.push('la acci\u00f3n por el rechazo');\n  return f;", "18a· el cierre es obligatorio")
J = sustituir(J, "  const d = listaGuardada().find(x => x.id === id);\n  if (!d) return;\n  if (!d.enviado && !confirmarSinRevisar([d])) return;",
                 "  const d = listaGuardada().find(x => x.id === id);\n  if (!d) return;\n"
                 "  const falta = faltan(d);\n"
                 "  if (falta.length){ alert('A ' + d.nro + ' le falta ' + falta.join(', ') + '. \u00c1bralo, compl\u00e9telo y vuelva a enviar.'); return; }\n"
                 "  if (!d.enviado && !confirmarSinRevisar([d])) return;", "18b· tampoco uno solo desde la lista")


# 19 · Respuestas de Birmania (16-sep-2026), paquete chico.
# 19a · Un hallazgo «Corregido» no vuelve: se hereda mientras esté Pendiente o
# En proceso (respuesta 9). El corregido queda en el informe donde se corrigió.
J = sustituir(J, "  (e.apartamentos || []).forEach(a => {\n    addApartamento({ apto: a.apto, piso: a.piso, campos: a.campos, fotos: [] });",
                 "  (e.apartamentos || []).filter(a => !Object.keys(a.campos || {}).some(k => /estatus/i.test(k) && a.campos[k] === 'Corregido')).forEach(a => {\n    addApartamento({ apto: a.apto, piso: a.piso, campos: a.campos, fotos: [] });", "19a· lo corregido no vuelve")
# 19b · La acción por el rechazo y las fotos generales viajan con el informe.
J = sustituir(J, "    residente: val('residente'), fecha: val('fecha'), estatus: val('estatus'),",
                 "    residente: val('residente'), fecha: val('fecha'), estatus: val('estatus'),\n"
                 "    accion: val('accion'), accion_det: val('accion_det'),\n"
                 "    fotosGenerales: leerFotos(document.getElementById('fotos-general')),", "19b· datos del cierre")
J = sustituir(J, "  [...document.querySelectorAll('#filas-apto .fila-apto')].forEach((fila, i) => { grupos['apto:' + i] = leerDatosFotos(fila.querySelector('.fotos')); });\n  return {",
                 "  [...document.querySelectorAll('#filas-apto .fila-apto')].forEach((fila, i) => { grupos['apto:' + i] = leerDatosFotos(fila.querySelector('.fotos')); });\n"
                 "  grupos['general'] = leerDatosFotos(document.getElementById('fotos-general'));\n  return {", "19c· imágenes generales a IndexedDB")
J = sustituir(J, "  datos.apartamentos.forEach((a, i) => { a.fotos = soltar(a.fotos, 'apto-' + (i + 1) + '-' + limpiar(a.apto || ''), grupos['apto:' + i]); });",
                 "  datos.apartamentos.forEach((a, i) => { a.fotos = soltar(a.fotos, 'apto-' + (i + 1) + '-' + limpiar(a.apto || ''), grupos['apto:' + i]); });\n"
                 "  datos.fotosGenerales = soltar(datos.fotosGenerales, 'general', grupos['general']);", "19d· fotos generales en el sobre")
J = sustituir(J, "      (x.apartamentos || []).forEach(a => { a.fotos = (a.fotos || []).map(soltar); });",
                 "      (x.apartamentos || []).forEach(a => { a.fotos = (a.fotos || []).map(soltar); });\n"
                 "      x.fotosGenerales = (x.fotosGenerales || []).map(soltar);", "19e· al enviar, las generales también se sueltan")
# 19f · Al abrir un informe: el rechazo y las fotos generales vuelven a pantalla.
J = sustituir(J, "    document.getElementById('estatus').value = d.estatus || '';\n    document.getElementById('obs_general').value = d.obs_general || '';",
                 "    document.getElementById('estatus').value = d.estatus || '';\n"
                 "    document.getElementById('accion').value = d.accion || '';\n"
                 "    document.getElementById('accion_det').value = d.accion_det || '';\n"
                 "    verRechazo();\n"
                 "    pintarFotos(document.getElementById('fotos-general'), (d.fotosGenerales || []).map(f => f.dato ? f : { pie: f.pie, dato: f.enDrive ? '' : '\u2026' }));\n"
                 "    document.getElementById('obs_general').value = d.obs_general || '';", "19f· abrir: cierre completo")
J = sustituir(J, "        pintarFotos(fila.querySelector('.fotos'), (a.fotos || []).map((f, k) => ({ pie: f.pie, dato: f.dato || (f.enDrive ? '' : datos[k] || '') })));\n      });\n    });",
                 "        pintarFotos(fila.querySelector('.fotos'), (a.fotos || []).map((f, k) => ({ pie: f.pie, dato: f.dato || (f.enDrive ? '' : datos[k] || '') })));\n      });\n"
                 "      const dg = grupos['general'] || [];\n"
                 "      pintarFotos(document.getElementById('fotos-general'), (d.fotosGenerales || []).map((f, k) => ({ pie: f.pie, dato: f.dato || (f.enDrive ? '' : dg[k] || '') })));\n    });", "19g· abrir: imágenes generales")
# 19h · Vaciar y el desplegable del rechazo.
J = sustituir(J, "  ['empresa','residente','obs_general'].forEach(id => document.getElementById(id).value = '');",
                 "  ['empresa','residente','obs_general','accion','accion_det'].forEach(id => document.getElementById(id).value = '');\n"
                 "  document.getElementById('fotos-general').innerHTML = '';", "19h· vaciar el cierre")
# El bloque del rechazo se esconde DESPUÉS de vaciar el estatus, no antes (lo
# encontró la prueba del 16-sep: quedaba abierto en el informe nuevo).
J = sustituir(J, "  document.getElementById('estatus').value = '';\n  document.getElementById('inspectores').innerHTML = ''; addInspector();",
                 "  document.getElementById('estatus').value = ''; verRechazo();\n  document.getElementById('inspectores').innerHTML = ''; addInspector();", "19h2· y el rechazo se esconde")
J = sustituir(J, "  document.getElementById('estatus').onchange = marcar;",
                 "  document.getElementById('estatus').onchange = () => { verRechazo(); marcar(); };", "19i· el estatus abre el rechazo")
J = sustituir(J, "async function relevoAceptaSha(){",
                 "// El bloque de acci\u00f3n solo existe cuando el cierre es «Rechazado» (Birmania, 16-sep).\n"
                 "function verRechazo(){\n"
                 "  const r = document.getElementById('rechazo'); if (!r) return;\n"
                 "  r.hidden = document.getElementById('estatus').value !== 'Rechazado';\n"
                 "  if (r.hidden){ document.getElementById('accion').value = ''; document.getElementById('accion_det').value = ''; }\n"
                 "}\n\nasync function relevoAceptaSha(){", "19j· verRechazo")

# ══════════════════════════════════════════════════════════════════════════
# MONTAJE
# ══════════════════════════════════════════════════════════════════════════
def inspectores_de_sha():
    todos = json.loads(motor.js_de(maestros.INSPECTORES_JS))
    sel = [i for i in todos if any(i.startswith(n) for n in INSPECTORES_SHA)]
    if len(sel) != len(INSPECTORES_SHA):
        sys.exit("✗ No encontré en el padrón a: %s" %
                 [n for n in INSPECTORES_SHA if not any(i.startswith(n) for i in todos)])
    return sel


def construir():
    pagina = (H
        .replace('@@CSS@@', motor.CSS)
        .replace('@@VERSION@@', motor.VERSION)
        .replace('@@CIERRE@@', ''.join('<option>%s</option>' % c for c in contenido.CIERRE))
        .replace('@@ACCIONES@@', ''.join('<option>%s</option>' % c for c in contenido.ACCIONES_RECHAZO))
        .replace('@@TORRES@@', motor.js_de(maestros.TORRES_JS))
        .replace('@@SECTOR@@', motor.js_de(maestros.SECTOR_POR_CONVENIO_JS))
        .replace('@@INSPECTORES@@', json.dumps(inspectores_de_sha(), ensure_ascii=False))
        .replace('@@GENERAL@@', json.dumps(contenido.GENERAL, ensure_ascii=False, indent=2))
        .replace('@@RENOMBRADOS@@', json.dumps(contenido.RENOMBRADOS, ensure_ascii=False))
        .replace('@@APARTAMENTOS@@', json.dumps(contenido.APARTAMENTOS, ensure_ascii=False, indent=2))
        .replace('@@UNIDAD@@', json.dumps(contenido.UNIDAD_CANTIDAD))
        .replace('@@MAXFOTOS@@', str(motor.MAX_FOTOS_SECCION))
        .replace('@@MAXPX@@', str(motor.MAX_FOTO_PX))
        .replace('@@CALIDAD@@', str(motor.CALIDAD_FOTO))
        .replace('@@RELEVO@@', json.dumps(motor.RELEVO_URL))
        .replace('@@JS@@', "const ESTADOS_HALLAZGO = %s;\n" % json.dumps(contenido.ESTADOS_HALLAZGO, ensure_ascii=False) + J)
        .replace('@@TOPE@@', str(motor.TOPE_ALMACEN)))

    if '@@' in pagina:
        import re as _re
        sys.exit("✗ Quedaron marcadores sin sustituir: %s" % _re.findall(r'@@\w+@@', pagina))

    for viejo, nuevo in maestros.CORRECCIONES_EMPRESA + maestros.CORRECCIONES_TEXTO:
        pagina = pagina.replace(viejo, nuevo)

    open(SALIDA, "w", encoding="utf-8").write(pagina)
    return pagina


if __name__ == "__main__":
    p = construir()
    print("✓ sha.html construido — %d KB · %d sustituciones sobre el motor de servicios" %
          (os.path.getsize(SALIDA) // 1024, len(cambios)))
    print("  recaudos: %d · estados del hallazgo: %s · cierre: %s" %
          (contenido.total_items(), " / ".join(contenido.ESTADOS_HALLAZGO), " / ".join(contenido.CIERRE)))
    print("  firman: %s" % ", ".join(inspectores_de_sha()))
