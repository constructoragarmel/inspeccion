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

# ── Las 47 entradas de torre ───────────────────────────────────────────────
#
# Fuente: *Cuadro Resumen de Sectores* del 28-ago-2026. Cada entrada lleva su
# convenio, su empresa ejecutora y su ingeniero residente.
#
# ⚠️ SON 47 ENTRADAS Y 43 TORRES. T-04, T-07, T-12 y T-13 aparecen DOS VECES,
# con dos convenios y dos empresas distintas cada una (C-06 y C-24). No es un
# error de transcripción: el borrador de servicios de Skarlet, hecho desde otra
# base, marca exactamente las mismas cuatro. El formulario no adivina en esos
# casos — deja convenio y empresa en blanco y ofrece las dos zonas posibles.
#
# Donde el cuadro no dice residente, la casilla queda EN BLANCO y lo escribe el
# inspector. No se hereda el de otra torre de la misma empresa: el cuadro REPITE
# el nombre cuando una persona cubre varias torres, así que una casilla vacía
# significa «no consta», no «el mismo de arriba». Son 26 con residente de 46.
#
# 4-oct-2026 (Stephanie, con la Gerencia Técnica): entra la **T-43 de Simón Rodríguez**, de Glajos Proyectos y
# Construcciones, que no estaba en el cuadro del 28-ago; y la **T-04 rusa pasa de Aroa 93 a Glajos** (mismo
# representante, José Gregorio García). Las dos sin residente. El relevo lleva su propia copia del padrón
# (`TORRES` en Smartsheet.gs del repositorio Garmel) y se actualizó el mismo día: si no, rechaza los informes de T-43.
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
  {t:'T-17',  c:'Convenio Bielorusos',   e:"BELZARUBEZHSTROY, S.A.",        r:"ING FELIX PINTO"},
  {t:'T-18',  c:'Convenio Bielorusos',   e:"BELZARUBEZHSTROY, S.A.",        r:""},
  {t:'T-19',  c:'Convenio Bielorusos',   e:"BELZARUBEZHSTROY, S.A.",        r:""},
  {t:'T-45',  c:'Convenio Bielorusos',   e:"BELZARUBEZHSTROY, S.A.",        r:""},
  {t:'T-46',  c:'Convenio Bielorusos',   e:"BELZARUBEZHSTROY, S.A.",        r:""},
  {t:'T-47',  c:'Convenio Bielorusos',   e:"BELZARUBEZHSTROY, S.A.",        r:""},
  {t:'T-48',  c:'Convenio Bielorusos',   e:"BELZARUBEZHSTROY, S.A.",        r:""},
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
  {t:'T-04',  c:'Convenio Rusos',        e:"GLAJOS PROYECTOS Y CONSTRUCCIONES, C.A.", r:""},
  {t:'T-07',  c:'Convenio Rusos',        e:"TSURU, C.A.",                   r:"MILTON RODRIGUEZ"},
  {t:'T-12',  c:'Convenio Rusos',        e:"ZERPA CONSTRUCCIONES, C.A.",    r:"ING. IVAN MEDINA"},
  {t:'T-13',  c:'Convenio Rusos',        e:"MASTER REFORMAS RR, C.A.",      r:"ING. ERICK MARTINEZ"},
  {t:'T-38',  c:'Convenio Rusos',        e:"CONSTRUCTORA 5010, C.A.",       r:"ING. JOSE MARTINEZ"},
  {t:'T-39',  c:'Convenio Rusos',        e:"JVR INGENIERÍA C,A.",           r:"ING. JUAN COLMENARES ARQ EVER AVENDAÑO"},
  {t:'T-43',  c:'Convenio Rusos',        e:"GLAJOS PROYECTOS Y CONSTRUCCIONES, C.A.", r:""},
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
# Fuente: «Ciudad Tiuna - Cargos, Funciones y Responsabilidades» (Drive), al
# 14-sep-2026: las 16 filas «En Obra» más las 9 «Por ingresar» del 14 y 15-sep.
# De ahí salen la ortografía y el CIV. Los «En proceso» (Ángel Sánchez, Fugueti
# Euri, Jonathan Millán, Michael Escobar) y «Por contactar» NO entran hasta que
# la hoja los pase a «Por ingresar».
#
# Nombre CORTO —nombre y primer apellido—, que es lo que cabe en el teléfono, y
# CIV CON PUNTO, que es la forma oficial. «CIV-NC» cuando la hoja dice N/A o no
# lo trae todavía; «CIV en trámite» cuando lo dice así. Van todos y no solo los
# Ingenieros Inspectores: la lista mezcla coordinadores, administradoras de
# contratos y los dos de SHA —Birmania Rada y Víctor Mendoza—, que firman los
# informes de seguridad industrial.
#
# ORDEN ALFABÉTICO POR NOMBRE, no por apellido: es lo que se muestra y es como
# el inspector se busca a sí mismo en el desplegable.
#
# Bella Mota y Erik Espinoza salieron del padrón el 21-sep-2026 (Stephanie).
#
# «Ignacio Madrid» pasó a «Manuel Madrid» el 22-sep-2026: él mismo dijo que se
# llama Manuel Ignacio Madrid Naranjo, la hoja de cargos usaba el segundo
# nombre y los cuadros de obra el primero. Sus iniciales pasan de IM a MM —no
# chocan con nadie— y los informes que ya lleven IM no se tocan.
#
# 1-oct-2026: tres CIV puestos al día con la hoja de cargos, que es el maestro. Mariana Rojas 321.563 (dado
# por Stephanie el 29-sep), Cleidy Chacón 240.930 (su carnet) y Diego Orta 307.823 (su formulario de datos; el
# 301.823 de antes salió del sello del título, que tiene un dígito ilegible). Los informes ya hechos no se tocan.
# Charbel Abdul 321.425 y Oriana Plaza 321.434 (v102, mismo día): los dieron ellos el 27-sep y están en la
# hoja; Stephanie pidió ponerlos. Falta la copia del carnet de los dos.
#
# v103 (1-oct-2026): entran los tres con ingreso en octubre (Carlos el 1-oct, Eduardo y Miguel el 5-oct). Carlos Julio Colmenares (coordinador,
# ingeniero estructural, CIV 127.708: el 127.709 del v103 salió de su CV; el sello del título dice 127.708, corregido en el v118), Eduardo Rivero (coordinador, CIV 169.435) y Miguel Eduardo Ávila (técnico de
# control y seguimiento, TSU: sin CIV). Carlos y Miguel llevan la inicial del segundo nombre porque «CC» ya es
# Cleidy Chacón y «MA» ya es Martha Azcarate: así sus informes salen CJ y ME.
#
# Las iniciales de los 26 son distintas entre sí (Diego Orta DO, Diego Rosales
# DR) — el número del informe las usa, y dos iguales el mismo día en el mismo
# sitio chocarían. Al agregar a alguien, comprobarlo.
# v126 (5-oct-2026): entra Ángel Sánchez, inspector de SHA con ingreso el 8-oct según la hoja. Sus iniciales, AS, no
# las tiene nadie más. El padrón queda en 27.
# 5-oct-2026: entra Génesis Márquez, ingeniera inspectora que empezó ese día en Ciudad Tiuna (venía de otra obra de
# Garmel; dicho por Stephanie, y la hoja ya la pasa al maestro). CIV 306.358 dado por Stephanie el 30-sep. El cuadro de
# la Gerencia Técnica del 2-oct le da SR T-04 y EZ T-13 y T-14. Sus iniciales, GM, no chocan con Génesis Cordobés (GC)
# ni con Gabriel Barrios (GB). El padrón queda en 28.
# v150 (12-oct-2026): entra Gabriel Antonio Jelenkovic Alaña, ingeniero inspector de obra con ingreso el 8-oct
# (Stephanie, 12-oct). CIV 215.739, del carnet y del sello del título. Sus iniciales, GJ, no chocan con Gabriel Barrios
# (GB). El padrón queda en 29.
INSPECTORES_JS = """const INSPECTORES_DB = [
  "Alejandro Bastidas (CIV-67.316)",
  "Ángel Sánchez (CIV-NC)",
  "Birmania Rada (CIV-NC)",
  "Carlos J. Colmenares (CIV-127.708)",
  "Charbel Abdul (CIV-321.425)",
  "Christian Fricke (CIV-184.558)",
  "Cleidy Chacón (CIV-240.930)",
  "Diego Orta (CIV-307.823)",
  "Diego Rosales (CIV-296.226)",
  "Edenil Narváez (CIV-150.422)",
  "Eduardo Rivero (CIV-169.435)",
  "Gabriel Barrios (CIV-NC)",
  "Gabriel Jelenkovic (CIV-215.739)",
  "Génesis Cordobés (CIV-307.057)",
  "Génesis Márquez (CIV-306.358)",
  "Girlenys Lacruz (CIV-288.041)",
  "Hernán Escobar (CIV-151.021)",
  "Katherine Correia (CIV-237.904)",
  "Leidy Villamizar (CIV-258.266)",
  "Lizeira Aragort (CIV-298.127)",
  "Manuel Madrid (CIV-256.842)",
  "Mariana Rojas (CIV-321.563)",
  "Martha Azcarate (CIV-87.616)",
  "Miguel E. Ávila (CIV-NC)",
  "Oriana Plaza (CIV-321.434)",
  "Selehidy Rivero (CIV-292.273)",
  "Skarlet Gómez (CIV-317.442)",
  "Víctor Mendoza (CIV-NC)",
  "Yenddy Sierra (CIV-307.772)"
];"""

# v188 (27-oct-2026, pedido de los inspectores por Diego Orta: que salgan «Ing. Fulano», «Arq. Fulano», como los residentes).
# El título de cada inspector del padrón, según la columna «Estudios» de la hoja de cargos (GESTIÓN HUMANA, «Ciudad Tiuna -
# Cargos, Funciones y Responsabilidades», leída el 27-oct): Ingeniero… → Ing., Arquitecto → Arq., TSU… → TSU. Es solo lo que se
# MUESTRA (desplegables y PDF): el valor guardado no cambia, así las iniciales del número y los informes viejos siguen igual.
# Al agregar a alguien al padrón, agregar aquí su título.
TITULO_INSPECTOR = {
    "Alejandro Bastidas": "Ing.",
    "Ángel Sánchez": "TSU",
    "Birmania Rada": "TSU",
    "Carlos J. Colmenares": "Ing.",
    "Charbel Abdul": "Ing.",
    "Christian Fricke": "Arq.",
    "Cleidy Chacón": "Arq.",
    "Diego Orta": "Ing.",
    "Diego Rosales": "Ing.",
    "Edenil Narváez": "Ing.",
    "Eduardo Rivero": "Ing.",
    "Gabriel Barrios": "TSU",
    "Gabriel Jelenkovic": "Ing.",
    "Génesis Cordobés": "Ing.",
    "Génesis Márquez": "Ing.",
    "Girlenys Lacruz": "Ing.",
    "Hernán Escobar": "Ing.",
    "Katherine Correia": "Ing.",
    "Leidy Villamizar": "Ing.",
    "Lizeira Aragort": "Ing.",
    "Manuel Madrid": "Arq.",
    "Mariana Rojas": "Arq.",
    "Martha Azcarate": "Ing.",
    "Miguel E. Ávila": "TSU",
    "Oriana Plaza": "Ing.",
    "Selehidy Rivero": "Ing.",
    "Skarlet Gómez": "Ing.",
    "Víctor Mendoza": "TSU",
    "Yenddy Sierra": "Ing."
}
TITULO_INSPECTOR_JS = "const TITULO_INSPECTOR = " + __import__("json").dumps(TITULO_INSPECTOR, ensure_ascii=False) + ";"

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
    # «stroy», no «story»: es la transliteración del ruso, la que usó la empresa
    # al registrar su RIF (J-29813862-9) y la del oficio MINHAV 000013. «story»
    # venía del cuadro de sectores y no tiene respaldo (Stephanie, 15-sep-2026).
    ("BELZARUBEZHSTORY, S.A.",       "BELZARUBEZHSTROY, S.A."),
    # Estas dos vivían solo en el generador de inspección (cambio 14b), así que servicios y SHA seguían
    # mostrando la T-39 como «JVR INGENIERÍA C,A.» y la J-07 con espacios (revisión del 5-oct-2026).
    ("ING & ARQ 1111, C.A.",         "ING&ARQ 1111, C.A."),
    ("JVR INGENIERÍA C,A.",          "JVR INGENIERÍA, C.A."),
]


# ── Cómo se escriben de verdad las cosas ───────────────────────────────────
#
# Correcciones de ORTOGRAFÍA sobre los maestros, aplicadas al final y sobre el
# HTML ya montado. Viven aquí y no en un generador porque son del dato: el
# formulario de servicios salió el 2-sep-2026 diciendo «Bielorusos» treinta y
# cuatro veces mientras el de inspección decía «Bielorrusos» treinta y siete,
# desde la MISMA tabla. Un maestro compartido con la corrección en un solo lado
# no está compartido.
CORRECCIONES_TEXTO = [
    # «Bielorrusos» lleva dos erres. Viene mal del original de Skarlet Gómez.
    ("Bielorusos", "Bielorrusos"),
    # Nombres de ingeniero residente, como en MAE_Torres.
    ("ING.ASTRID LARES",    "ING. ASTRID LARES"),
    ("ING.RADAMEZ RIVAS",   "ING. RADAMEZ RIVAS"),
    ("ING FELIX PINTO",     "ING. FELIX PINTO"),
    ("ING HARRY ARTEAGA",   "ING. HARRY ARTEAGA"),
    ("ING MANUEL PAEZ",     "ING. MANUEL PAEZ"),
    ("ING JOSE V GONZALES", "ING. JOSE V. GONZALES"),
    ("ING MARIA T MARCANO", "ING. MARIA T. MARCANO"),
    # Se le escapó a la lista original: estaba sin punto en LOS DOS
    # formularios por igual, no por desincronización sino porque nadie lo miró.
    ("ING ADRIAN OLIVARES",  "ING. ADRIAN OLIVARES"),
    ("ING. JOANNY TAPIA / ING. JHOANNY LOPEZ", "ING. JOANNY TAPIA \u00b7 ING. JHOANNY LOPEZ"),
    ("ING. JUAN COLMENARES ARQ EVER AVENDA\u00d1O", "ING. JUAN COLMENARES \u00b7 ARQ. EVER AVENDA\u00d1O"),
]

# ── Los coordinadores de cada área ─────────────────────────────────────────
#
# Para «quién valida» del compilado de la semana (compilado.html, v152; pedido de Stephanie el 13-oct-2026: «solo
# nombres de los coordinadores de cada área»). Las cadenas son las mismas del padrón de arriba. Inspección de obra: los
# tres coordinadores de inspección (uno por sector); servicios: su coordinador; urbanismo: Eduardo Rivero (pedido de Diego
# Orta del 20-oct-2026, aprobado por Stephanie). SHA todavía no tiene coordinación propia en el padrón: cuando la tenga, entra
# aquí. Los de urbanismo los validan también Diego Orta, de Planificación (Stephanie, 16-oct-2026: el día del corte no había
# quién los hiciera en la oficina), y Miguel Ávila, también de Planificación, por si hace falta (Stephanie, el mismo día).
# Los que se suman van al final para no mover a los demás en la lista.
COORDINADORES_JS = """const COORDINADORES = [
  {n: "Leidy Villamizar (CIV-258.266)",     a: "Inspecci\u00f3n de obra"},
  {n: "Edenil Narv\u00e1ez (CIV-150.422)",       a: "Inspecci\u00f3n de obra"},
  {n: "Carlos J. Colmenares (CIV-127.708)", a: "Inspecci\u00f3n de obra"},
  {n: "Hern\u00e1n Escobar (CIV-151.021)",       a: "Servicios"},
  {n: "Diego Orta",                         a: "Planificaci\u00f3n"},
  {n: "Miguel E. \u00c1vila (CIV-NC)",         a: "Planificaci\u00f3n"},
  {n: "Eduardo Rivero (CIV-169.435)",       a: "Urbanismo"}
];"""

# v182 (21-oct-2026, ADR-0050): la inspección de SHA, para el compilado de SHA: abre la semana y actualiza el estatus de cada
# hallazgo para que la coordinación lo valide. Los tres que firman los informes de SHA (construir-sha.py), con el nombre del padrón.
INSPECTORES_SHA_JS = """const INSPECTORES_SHA = [
  "\u00c1ngel S\u00e1nchez (CIV-NC)",
  "Birmania Rada (CIV-NC)",
  "V\u00edctor Mendoza (CIV-NC)"
];"""

# ── Los apartamentos de cada piso, por sector ───────────────────────────────
#
# Para que el apartamento sea un desplegable y no un campo libre («A-2» y «A2» no casaban; Planificación, 13-oct-2026).
# Planificación mandó la nomenclatura de Ezequiel Zamora el 13-oct (por Stephanie): cuatro por piso, A1, A2, B1 y B2. Los
# otros sectores siguen con el campo libre hasta que llegue la suya. Si una torre tuviera otra nomenclatura, se agrega
# aquí por torre, no se fuerza: un apartamento escrito que no esté en la lista vuelve al campo libre.
# Simón Bolívar (Planificación, 13-oct-2026): la nomenclatura es por par de torres, no por sector; las demás torres del
# sector (D-08, J-07, J-08) y Simón Rodríguez siguen con el campo libre. Los informes de la J-12 anteriores al 13-oct traen
# «D2» y «E2»: se abren con el campo libre, no se tocan.
APARTAMENTOS_JS = """const APARTAMENTOS_POR_SECTOR = {
  EZ: ['A1', 'A2', 'B1', 'B2']    // Ezequiel Zamora, Planificación 13-oct-2026
};
const APARTAMENTOS_POR_TORRE = {
  'SB|J-09': ['E11', 'E12', 'D11', 'D12', 'A1', 'A2', 'C1', 'C2'],   // Simón Bolívar, Planificación 13-oct-2026
  'SB|J-10': ['E11', 'E12', 'D11', 'D12', 'A1', 'A2', 'C1', 'C2'],
  'SB|J-11': ['E21', 'E22', 'D21', 'D22', 'B1', 'B2', 'F1', 'F2'],
  'SB|J-12': ['E21', 'E22', 'D21', 'D22', 'B1', 'B2', 'F1', 'F2']
};"""

