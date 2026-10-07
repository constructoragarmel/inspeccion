# -*- coding: utf-8 -*-
# GENERADO por Garmel/implementacion/generar-lista-v2.py desde la lista v2 (ADR-0035). NO SE EDITA A MANO.
# 12 hitos, 91 subpartidas (3 retiradas conservan su código). La lee construir.py.

VERSION_LISTA = "v2"

PARTIDAS_JS = 'const PARTIDAS = [\n  {\n    "id": "hito_estructura", \n    "nombre": "HITO 1: ESTRUCTURA", \n    "icon": "", \n    "color": "#1a237e", \n    "items": ["Encofrado", "Acero de refuerzo", "Vaciados", "Obras preliminares", "Escaleras metálicas: suministro", "Escaleras metálicas: preparación y montaje"]\n  },\n  {\n    "id": "hito_cerramientos", \n    "nombre": "HITO 2: CERRAMIENTOS Y ALBAÑILERÍA", \n    "icon": "", \n    "color": "#283593", \n    "items": ["Construcción de paredes exteriores", "Tabiquería interior", "Impermeabilización de azotea"]\n  },\n  {\n    "id": "hito_servicios", \n    "nombre": "HITO 3: INSTALACIÓN DE SERVICIOS", \n    "icon": "", \n    "color": "#303f9f", \n    "items": ["Aguas blancas (puntos de agua fría y caliente)", "Desagüe (descargas)", "Cableados", "Canalizaciones", "Módulo de electricidad del edificio", "Tapa del módulo de electricidad del edificio", "Tablero eléctrico del apartamento", "Tapa del tablero del apartamento", "Equipamiento de cuarto de módulos", "Montante de voz y data", "Montante de aguas blancas", "Bajante de aguas servidas", "Montante de gas", "Bajante de aguas pluviales", "Manifold de gas", "Puntos de gas", "Válvula de paso del apartamento", "Válvula de paso del piso", "Válvula de regulación principal", "Centro de piso (C.P.)", "Tapón de registro (T.R.)"]\n  },\n  {\n    "id": "hito_acabados", \n    "nombre": "HITO 4: ACABADOS", \n    "icon": "", \n    "color": "#3949ab", \n    "items": ["Frisos", "Encamisados", "Fondo antialcalino", "Cerámica en paredes", "Cerámica en pisos", "Construcción de sobrepisos", "Pintura en paredes", "Pintura en techos", "Texturizado de techos", "Pintura en puertas de herrería", "Barniz en puertas de madera", "Pintura en rejas", "Piso de cemento liso"]\n  },\n  {\n    "id": "hito_puertas", \n    "nombre": "HITO 5: PUERTAS", \n    "icon": "", \n    "color": "#1565c0", \n    "items": ["Puertas metálicas", "Puertas de servicios", "Puertas de madera", "Marcos de puertas de madera", "Rejas de jardín / sala", "Rejas del área de batea", "Puertas de vidrio de planta baja", "Carpintería metálica (rejas de protección)", "Marco de hierro de la puerta principal"]\n  },\n  {\n    "id": "hito_ventanas", \n    "nombre": "HITO 6: VENTANAS", \n    "icon": "", \n    "color": "#0277bd", \n    "items": ["Marcos de ventana", "Ventanas (hojas o paños con su vidrio)"]\n  },\n  {\n    "id": "hito_acc_sanitarios", \n    "nombre": "HITO 7: ACCESORIOS SANITARIOS", \n    "icon": "", \n    "color": "#01579b", \n    "items": ["Ducha", "Fregadero de acero inoxidable", "W.C.", "Lavamanos", "Batea", "Calentadores: suministro y transporte", "Calentadores: instalación"]\n  },\n  {\n    "id": "hito_acc_electricos", \n    "nombre": "HITO 8: ACCESORIOS ELÉCTRICOS", \n    "icon": "", \n    "color": "#0d47a1", \n    "items": ["Tomacorrientes", "Interruptores simples", "Interruptores dobles", "Interruptor de timbre", "Toma de data", "Breakers", "Lámparas", "Extractores y aire acondicionado: suministro y transporte", "Extractores y aire acondicionado: instalación"]\n  },\n  {\n    "id": "hito_ascensor", \n    "nombre": "HITO 9: ASCENSOR", \n    "icon": "", \n    "color": "#1e3a8a", \n    "items": ["Adecuación y verificación de plomada en foso y cuarto de máquina", "Instalación de guías, rieles y soporte estructural en la caja", "Montaje de cabina, motor y contrapeso", "Instalación de puertas de piso, botoneras y sistema electrónico de control", "Ascensor: compra del equipo", "Ascensor: equipo en obra"]\n  },\n  {\n    "id": "hito_exteriores", \n    "nombre": "HITO 10: ACABADOS EXTERIORES Y ÁREAS COMUNES", \n    "icon": "", \n    "color": "#1d4ed8", \n    "items": ["Revestimiento y pintura de fachada exterior", "Pintura en pasillos y áreas comunes", "Adecuación de accesos y pasillos", "Instalación de iluminación en común", "Instalación de barandas", "Instalación de pasamanos escaleras", "Frisos de áreas comunes", "Fachada de vidrio y locales de planta baja", "Pisos de áreas comunes (pasillos y escaleras)"]\n  },\n  {\n    "id": "hito_pruebas", \n    "nombre": "HITO 11: PRUEBAS", \n    "icon": "", \n    "color": "#172554", \n    "items": ["Presión de agua", "Hermeticidad", "Carga eléctrica", "Pruebas de cargas, velocidad y certificación de seguridad de ascensores"]\n  },\n  {\n    "id": "hito_contra_incendio", \n    "nombre": "HITO 12: SISTEMA CONTRA INCENDIO", \n    "icon": "", \n    "color": "#312e81", \n    "items": ["Gabinetes de manguera", "Extintores"]\n  }\n]'

UNIDADES = {
 "hito_estructura": [
  "m²",
  [
   "ml",
   "kg"
  ],
  "m³",
  "estado",
  "estado",
  "estado"
 ],
 "hito_cerramientos": [
  "m²",
  "m²",
  "m²"
 ],
 "hito_servicios": [
  "pto",
  "pto",
  "estado",
  "estado",
  "pza",
  "pza",
  "pza",
  "pza",
  "estado",
  "estado",
  "estado",
  "estado",
  "estado",
  "estado",
  "estado",
  "pto",
  "pza",
  "pza",
  "pza",
  "pza",
  "pza"
 ],
 "hito_acabados": [
  "estado",
  "estado",
  "estado",
  "estado",
  "estado",
  "estado",
  "estado",
  "estado",
  "estado",
  "pza",
  "pza",
  "pza",
  "estado"
 ],
 "hito_puertas": [
  "pza",
  "pza",
  "pza",
  "pza",
  "pza",
  "pza",
  "pza",
  "pza",
  "pza"
 ],
 "hito_ventanas": [
  "pza",
  "pza"
 ],
 "hito_acc_sanitarios": [
  "pza",
  "pza",
  "pza",
  "pza",
  "pza",
  "estado",
  "pza"
 ],
 "hito_acc_electricos": [
  "pza",
  "pza",
  "pza",
  "pza",
  "pza",
  "pza",
  "pza",
  "estado",
  "estado"
 ],
 "hito_ascensor": [
  "estado",
  "estado",
  "estado",
  "estado",
  "sino",
  "sino"
 ],
 "hito_exteriores": [
  "m²",
  "estado",
  "estado",
  "estado",
  "estado",
  "estado",
  "m²",
  "estado",
  "estado"
 ],
 "hito_pruebas": [
  "sino",
  "sino",
  "sino",
  "sino"
 ],
 "hito_contra_incendio": [
  "pza",
  "pza"
 ]
}

AMBITO_SUB_JS = 'const AMBITO_SUB = {"hito_estructura": ["T", "T", "T", "T", "T", "T"], "hito_cerramientos": ["T", "AMBOS", "T"], "hito_servicios": ["A", "A", "AMBOS", "AMBOS", "T", "T", "A", "A", "T", "T", "T", "T", "T", "T", "T", "A", "A", "T", "T", "A", "A"], "hito_acabados": ["AMBOS", "AMBOS", "AMBOS", "AMBOS", "AMBOS", "AMBOS", "AMBOS", "AMBOS", "AMBOS", "A", "A", "A", "AMBOS"], "hito_puertas": ["A", "T", "A", "A", "A", "A", "T", "A", "A"], "hito_ventanas": ["A", "A"], "hito_acc_sanitarios": ["A", "A", "A", "A", "A", "T", "A"], "hito_acc_electricos": ["A", "A", "A", "A", "A", "A", "A", "T", "AMBOS"], "hito_ascensor": ["T", "T", "T", "T", "T", "T"], "hito_exteriores": ["T", "T", "T", "T", "T", "T", "T", "T", "T"], "hito_pruebas": ["AMBOS", "AMBOS", "AMBOS", "T"], "hito_contra_incendio": ["T", "T"]};'

CODIGOS_JS = 'const CODIGOS_SUB = {"hito_estructura": ["1.01", "1.02", "1.03", "1.04", "1.05", "1.06"], "hito_cerramientos": ["2.01", "2.02", "2.03"], "hito_servicios": ["3.01", "3.02", "3.03", "3.04", "3.05", "3.06", "3.07", "3.08", "3.09", "3.10", "3.11", "3.12", "3.13", "3.14", "3.15", "3.16", "3.17", "3.18", "3.19", "3.20", "3.21"], "hito_acabados": ["4.01", "4.02", "4.03", "4.04", "4.05", "4.06", "4.07", "4.08", "4.09", "4.10", "4.11", "4.12", "4.13"], "hito_puertas": ["5.01", "5.02", "5.03", "5.04", "5.05", "5.06", "5.07", "5.08", "5.09"], "hito_ventanas": ["6.01", "6.02"], "hito_acc_sanitarios": ["7.01", "7.02", "7.03", "7.04", "7.05", "7.08", "7.09"], "hito_acc_electricos": ["8.01", "8.02", "8.03", "8.04", "8.05", "8.06", "8.07", "8.08", "8.09"], "hito_ascensor": ["9.01", "9.02", "9.03", "9.04", "9.05", "9.06"], "hito_exteriores": ["10.01", "10.02", "10.03", "10.04", "10.05", "10.06", "10.07", "10.08", "10.09"], "hito_pruebas": ["11.01", "11.02", "11.03", "11.04"], "hito_contra_incendio": ["12.02", "12.03"]};'

REUBICAR_JS = 'const REUBICAR_V2 = {"hito_acc_sanitarios": {"de": 9, "filas": [0, 1, 2, 3, 4, 7, 8]}, "hito_contra_incendio": {"de": 5, "filas": [1, 2]}};\nfunction _reubicarV2(partidas) {\n  if (!partidas) return partidas;\n  Object.keys(REUBICAR_V2).forEach(function (pid) {\n    var r = REUBICAR_V2[pid], arr = partidas[pid];\n    if (Object.prototype.toString.call(arr) !== \'[object Array]\' || arr.length !== r.de) return;\n    partidas[pid] = r.filas.map(function (i) { return arr[i]; });\n  });\n  return partidas;\n}\n'

# Qué incluye cada subpartida, por código: la línea que sale al tocar el «?» de la fila (2-oct-2026).
AYUDA_JS = 'const AYUDA_SUB = {"1.01": "El encofrado de madera de machones, vigas, bases y brocales.", "1.02": "Las cabillas y mallas, y la estructura metálica del edificio: vigas, planchas y pernos de anclaje. Las escaleras metálicas y las rejas no van aquí.", "1.03": "El concreto vaciado: losas, machones, vigas, fundaciones y concreto pobre.", "1.04": "Lo provisional y lo previo: campamento, oficinas y depósitos, acometidas provisionales, cercado, topografía, demoliciones, movimiento de tierra y limpieza.", "1.05": "El material de las escaleras metálicas: perfiles, descansos, paneles y escalones. Vale la mitad de las escaleras.", "1.06": "La preparación, el montaje y la protección del acero de las escaleras. Vale la otra mitad.", "2.01": "Las paredes de bloque del exterior del edificio: de arcilla, de concreto y de ventilación.", "2.02": "Las paredes de bloque de adentro, con sus dinteles, machones y brocales (el de la ducha, por ejemplo).", "2.03": "El manto asfáltico, la pintura aluminizada, las medias cañas y las cubiertas del techo del edificio.", "3.01": "Los puntos de agua fría y caliente del apartamento: tubería, conexiones y llaves de paso y de arresto.", "3.02": "Los puntos de aguas servidas del apartamento y su ventilación. El centro de piso y el tapón de registro van aparte, justo debajo.", "3.03": "El cable eléctrico ya pasado por la tubería, de cualquier calibre.", "3.04": "La tubería eléctrica embutida (EMT o PVC) con sus cajas y cajetines.", "3.05": "El del cuarto de electricidad de planta baja: armario de medición, tableros principales, breakers grandes y contactores.", "3.06": "La tapa puesta en el módulo de electricidad del edificio.", "3.07": "El tablero embutido de cada apartamento, donde van sus breakers.", "3.08": "La tapa puesta en el tablero del apartamento.", "3.09": "Lo que va dentro del cuarto de módulos de la torre. Qué cuenta exactamente está por definir.", "3.10": "La subida de voz y data por el edificio, con sus regletas.", "3.11": "La tubería principal de agua que sube por el edificio, con sus llaves de paso y válvulas reductoras.", "3.12": "La tubería que baja las aguas servidas del edificio, con su ventilación y sus tanquillas.", "3.13": "La tubería de gas que sube por el edificio, con sus válvulas.", "3.14": "Lo que baja el agua de lluvia: bajantes, canales, drenes del techo y tanquillas.", "3.15": "El manifold de gas y sus gabinetes, en planta baja y en los pisos.", "3.16": "Las salidas de gas dentro del apartamento.", "3.17": "La válvula de paso de gas de cada apartamento.", "3.18": "La válvula de paso de gas del piso: una por piso.", "3.19": "La válvula de regulación de gas de la caseta, para todo el edificio.", "3.20": "El dren de piso con su rejilla, que va con la tubería de desagüe.", "3.21": "El tapón de registro de las aguas servidas, que va con la tubería de desagüe.", "4.01": "El friso de mortero en paredes y techos, con sus esquineros.", "4.02": "El encamisado o estuco con pasta profesional en paredes y techos, lijado.", "4.03": "El fondo antialcalino en paredes y techos, antes de la pintura.", "4.04": "La cerámica o el porcelanato en paredes. La cerámica de la cocina, de pared y de piso, cuenta aquí.", "4.05": "La cerámica o el porcelanato en los pisos. La de la cocina se cuenta en «Cerámica en paredes».", "4.06": "El sobrepiso de cemento y las pendientes de mortero que nivelan la losa.", "4.07": "La pintura de caucho de las paredes.", "4.08": "La pintura de caucho de techos y losas. No es el texturizado.", "4.09": "El acabado texturizado del techo, o el cielo raso de láminas donde lo lleva.", "4.10": "El esmalte de las puertas metálicas y de los marcos metálicos.", "4.11": "El barniz de las puertas de madera, con su fondo sellador.", "4.12": "El anticorrosivo y el esmalte de rejas y barandas metálicas.", "4.13": "Los pisos que no son cerámica: cemento pulido o requemado, engomado y rodapiés.", "5.01": "Las puertas metálicas del apartamento, con la cerradura de la principal y, donde los lleve, el ojo mágico y el brazo hidráulico.", "5.02": "Las puertas metálicas de las áreas de servicio de la torre (cuartos de basura, tableros, bombas).", "5.03": "Las puertas de madera entamborada, con sus cerraduras.", "5.04": "Los marcos de madera de las puertas interiores. El de hierro de la principal va aparte.", "5.05": "La reja del jardín o de la sala del apartamento, según el modelo.", "5.06": "La reja del área de la batea.", "5.07": "Las puertas de vidrio templado, panorámicas o de aluminio y vidrio, de planta baja.", "5.08": "Las rejas de protección de puertas y ventanas que no son de jardín ni de batea.", "5.09": "El marco de chapa o hierro de la puerta principal del apartamento.", "6.01": "El marco de la ventana: la herrería donde corre el vidrio.", "6.02": "Las hojas o paños con su vidrio, ya en el marco: correderas, basculantes o romanillas.", "7.01": "La ducha con sus llaves y su grupo mezclador.", "7.02": "El fregadero con su grifería, canilla y sifón.", "7.03": "La poceta con su tanque, herraje, canilla y tapa.", "7.04": "El lavamanos con su grifería, canilla y sifón.", "7.05": "La batea con su grifo, y el grifo de la lavadora.", "7.08": "Los calentadores que ya llegaron a la obra. Vale el 60 % de los calentadores.", "7.09": "El calentador instalado en el apartamento. Vale el otro 40 %.", "8.01": "Los tomacorrientes con su tapa, sencillos y dobles.", "8.02": "Los interruptores de una tecla, con su tapa.", "8.03": "Los interruptores de dos teclas, con su tapa.", "8.04": "El pulsador del timbre, con el timbre.", "8.05": "Las tomas de teléfono, TV y red, con su tapa.", "8.06": "Los breakers puestos en el tablero del apartamento.", "8.07": "Las lámparas o luminarias del apartamento.", "8.08": "Los extractores, los equipos de aire y sus tableros de control que ya llegaron a la obra. Vale el 60 %.", "8.09": "Los extractores y equipos de aire ya instalados. Vale el otro 40 %.", "9.01": "El foso y el cuarto de máquinas preparados y con la plomada verificada. Es el 10 % de la instalación del ascensor.", "9.02": "Las guías, los rieles y los soportes dentro de la caja del ascensor. Es el 25 % de la instalación.", "9.03": "La cabina, el motor y el contrapeso montados. Es el 40 % de la instalación.", "9.04": "Las puertas de cada piso, las botoneras y el control electrónico. Es el 25 % de la instalación.", "9.05": "El equipo del ascensor ya está comprado.", "9.06": "El equipo del ascensor ya llegó a la obra.", "10.01": "El friso, el estuco y la pintura de la fachada, que es una sola para todo el edificio.", "10.02": "La pintura de pasillos y áreas comunes: las fachadas internas.", "10.03": "El ducto de basura con sus puertas y la señalización de accesos y pasillos. Los pisos van en «Pisos de áreas comunes».", "10.04": "Las luminarias de pasillos y áreas comunes, las lámparas de emergencia y el control de la iluminación.", "10.05": "Las barandas de perfiles de hierro.", "10.06": "Los pasamanos de hierro de las escaleras.", "10.07": "El friso de pasillos y áreas comunes.", "10.08": "La fachada de vidrio y el cerramiento de los locales comerciales de planta baja.", "10.09": "Los pisos de granito, cerámica o cemento de pasillos y escaleras, con rodapiés, escalones y encerado.", "11.01": "La prueba de presión de las tuberías de agua: se hizo o no.", "11.02": "La prueba de hermeticidad o estanqueidad de las tuberías: se hizo o no.", "11.03": "La prueba de carga eléctrica: se hizo o no.", "11.04": "Las pruebas de carga y velocidad del ascensor y su certificación de seguridad: se hicieron o no.", "12.02": "Los gabinetes contra incendio con su manguera.", "12.03": "Los extintores, de polvo químico o de CO2."};'

# La misma línea, redactada para el formulario de torre, en las filas que la necesitan (6-oct-2026).
AYUDA_TORRE_JS = 'const AYUDA_SUB_TORRE = {"2.02": "Las paredes de bloque de adentro del edificio, con sus dinteles, machones y brocales.", "4.04": "La cerámica o el porcelanato en paredes.", "4.05": "La cerámica o el porcelanato en los pisos."};'
