# -*- coding: utf-8 -*-
"""Los maestros que comparten TODOS los formularios de campo de Garmel.

Aquí vive el dato, una sola vez. Cada generador —`construir.py` para el de
inspección, y el de servicios cuando exista— lo inyecta en su HTML.

POR QUÉ EXISTE ESTE ARCHIVO. El formulario de servicios que Skarlet Gómez entregó
el 2-sep-2026 traía SU PROPIA tabla de empresas y torres, con «ALNAVIT» por
ALNAVIC y los nombres viejos que este repositorio ya había corregido (C-36 en el
repositorio de contexto). No es culpa de nadie: es lo que pasa cuando el mismo
dato vive en dos sitios. Un segundo instrumento que copie y pegue estos maestros
se desincroniza el primer día que alguien corrija uno solo.

REGLA: si un dato lo usan dos formularios, vive aquí. Si lo usa uno, vive en su
generador.
"""

# ── Las 46 entradas de torre ───────────────────────────────────────────────
#
# Fuente: *Cuadro Resumen de Sectores* del 28-ago-2026. Cada entrada lleva su
# convenio, su empresa ejecutora y su ingeniero residente.
#
# ⚠️ SON 46 ENTRADAS Y 42 TORRES. T-04, T-07, T-12 y T-13 aparecen DOS VECES,
# con dos convenios y dos empresas distintas cada una (C-06 y C-24). No es un
# error de transcripción: el borrador de servicios de Skarlet, hecho desde otra
# base, marca exactamente las mismas cuatro. El formulario no adivina en esos
# casos — deja convenio y empresa en blanco y ofrece las dos zonas posibles.
#
# Donde el cuadro no dice residente, la casilla queda EN BLANCO y lo escribe el
# inspector. No se hereda el de otra torre de la misma empresa: el cuadro REPITE
# el nombre cuando una persona cubre varias torres, así que una casilla vacía
# significa «no consta», no «el mismo de arriba». Son 26 con residente de 46.
TORRES_JS = """const TORRES = [
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
];"""

# ── El sector de cada convenio ─────────────────────────────────────────────
#
# Las dos primeras letras del identificador del informe salen de aquí.
SECTOR_POR_CONVENIO_JS = """const SECTOR_POR_CONVENIO = {
  'Convenio Bielorusos': 'EZ',   // Ezequiel Zamora
  'Convenio Rusos':      'SR',   // Simón Rodríguez
  'Convenio Chinos':     'SB'    // Simón Bolívar
};"""

# ── El padrón de inspectores ───────────────────────────────────────────────
#
# Fuente: «Ciudad Tiuna - Cargos, Funciones y Responsabilidades» (Drive), las 14
# filas marcadas «En Obra», al 2-sep-2026. De ahí salen la ortografía y el CIV.
#
# Nombre CORTO —nombre y primer apellido—, que es lo que cabe en el teléfono, y
# CIV CON PUNTO, que es la forma oficial. Van los 14 y no solo los Ingenieros
# Inspectores: la lista ya mezclaba coordinadores y una administradora de
# contratos, y Birmania Rada (SHA) va a firmar informes de seguridad industrial.
#
# ORDEN ALFABÉTICO POR NOMBRE, no por apellido: es lo que se muestra y es como
# el inspector se busca a sí mismo en el desplegable.
#
# ⚠️ El CIV de Skarlet Gómez (317.442) no está en el Sheet: lo confirmó ella misma
# el 2-sep-2026. Las iniciales de los 14 son distintas entre sí — el número del
# informe las usa, y dos iguales el mismo día en el mismo apartamento chocarían.
INSPECTORES_JS = """const INSPECTORES_DB = [
  "Alejandro Bastidas (CIV-NC)",
  "Birmania Rada (CIV-NC)",
  "Charbel Abdul (CIV en trámite)",
  "Christian Fricke (CIV-184.558)",
  "Edenil Narváez (CIV-150.422)",
  "Gabriel Barrios (CIV-NC)",
  "Génesis Cordobés (CIV-307.057)",
  "Girlenys Lacruz (CIV-288.041)",
  "Hernán Escobar (CIV-NC)",
  "Leidy Villamizar (CIV-258.266)",
  "Lizeira Aragort (CIV-298.127)",
  "Martha Azcarate (CIV-87.616)",
  "Oriana Plaza (CIV en trámite)",
  "Skarlet Gómez (CIV-317.442)"
];"""

# ── Cómo se llaman de verdad las contratistas ──────────────────────────────
#
# Se aplica al final, sobre el HTML ya construido, para no tener que corregir el
# nombre en cada sitio donde aparece.
#
# Criterio (Stephanie González): manda lo que escribió la empresa, salvo que lo
# suyo tenga una falta de ortografía. Por eso «Rio Limon» va con tildes y «C. A»
# se cierra a «C.A.», pero THAISA se queda con una sola S: así se llaman.
#
# Cuatro no son abreviaturas sino nombres distintos, y son las que importan:
#   · Zerpa Construcciones  →  Zerpa's Ingeniería
#   · Vialpa C.A.           →  Vialpa S.A.
#   · Aroa                  →  Proyectos y Construcciones Aroa 93
#   · Tsuru                 →  Tsuru 5158
CORRECCIONES_EMPRESA = [
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
]
