# -*- coding: utf-8 -*-
# GENERADO por Garmel/implementacion/generar-lista-v2.py desde la lista v2 (ADR-0035). NO SE EDITA A MANO.
# 12 hitos, 89 subpartidas (3 retiradas conservan su código). La lee construir.py.

VERSION_LISTA = "v2"

PARTIDAS_JS = 'const PARTIDAS = [\n  {\n    "id": "hito_estructura", \n    "nombre": "HITO 1: ESTRUCTURA", \n    "icon": "", \n    "color": "#1a237e", \n    "items": ["Encofrado", "Acero de refuerzo", "Vaciados", "Obras preliminares", "Escaleras metálicas: suministro", "Escaleras metálicas: preparación y montaje"]\n  },\n  {\n    "id": "hito_cerramientos", \n    "nombre": "HITO 2: CERRAMIENTOS Y ALBAÑILERÍA", \n    "icon": "", \n    "color": "#283593", \n    "items": ["Construcción de paredes exteriores", "Tabiquería interior", "Impermeabilización de azotea"]\n  },\n  {\n    "id": "hito_servicios", \n    "nombre": "HITO 3: INSTALACIÓN DE SERVICIOS", \n    "icon": "", \n    "color": "#303f9f", \n    "items": ["Aguas blancas (puntos de agua fría y caliente)", "Desagüe (descargas)", "Cableados", "Canalizaciones", "Módulo de electricidad del edificio", "Tapa del módulo de electricidad del edificio", "Tablero eléctrico del apartamento", "Tapa del tablero del apartamento", "Equipamiento de cuarto de módulos", "Montante de voz y data", "Montante de aguas blancas", "Bajante de aguas servidas", "Montante de gas", "Bajante de aguas pluviales", "Manifold de gas", "Puntos de gas", "Válvula de paso del apartamento", "Válvula de paso del piso", "Válvula de regulación principal"]\n  },\n  {\n    "id": "hito_acabados", \n    "nombre": "HITO 4: ACABADOS", \n    "icon": "", \n    "color": "#3949ab", \n    "items": ["Frisos", "Encamisados", "Fondo antialcalino", "Cerámica en paredes", "Cerámica en pisos", "Construcción de sobrepisos", "Pintura en paredes", "Pintura en techos", "Texturizado de techos", "Pintura en puertas de herrería", "Barniz en puertas de madera", "Pintura en rejas", "Piso de cemento liso"]\n  },\n  {\n    "id": "hito_puertas", \n    "nombre": "HITO 5: PUERTAS", \n    "icon": "", \n    "color": "#1565c0", \n    "items": ["Puertas metálicas", "Puertas de servicios", "Puertas de madera", "Marcos de puertas", "Rejas de jardinera", "Rejas del área de batea", "Puertas de vidrio de planta baja", "Carpintería metálica (rejas de protección)"]\n  },\n  {\n    "id": "hito_ventanas", \n    "nombre": "HITO 6: VENTANAS", \n    "icon": "", \n    "color": "#0277bd", \n    "items": ["Marcos de ventana", "Ventanas (hojas o paños con su vidrio)"]\n  },\n  {\n    "id": "hito_acc_sanitarios", \n    "nombre": "HITO 7: ACCESORIOS SANITARIOS", \n    "icon": "", \n    "color": "#01579b", \n    "items": ["Ducha", "Fregadero de acero inoxidable", "W.C.", "Lavamanos", "Batea", "Centro de piso (C.P.)", "Tapón de registro (T.R.)", "Calentadores: suministro y transporte", "Calentadores: instalación"]\n  },\n  {\n    "id": "hito_acc_electricos", \n    "nombre": "HITO 8: ACCESORIOS ELÉCTRICOS", \n    "icon": "", \n    "color": "#0d47a1", \n    "items": ["Tomacorrientes", "Interruptores simples", "Interruptores dobles", "Interruptor de timbre", "Toma de data", "Breakers", "Lámparas", "Extractores y aire acondicionado: suministro y transporte", "Extractores y aire acondicionado: instalación"]\n  },\n  {\n    "id": "hito_ascensor", \n    "nombre": "HITO 9: ASCENSOR", \n    "icon": "", \n    "color": "#1e3a8a", \n    "items": ["Adecuación y verificación de plomada en foso y cuarto de máquina", "Instalación de guías, rieles y soporte estructural en la caja", "Montaje de cabina, motor y contrapeso", "Instalación de puertas de piso, botoneras y sistema electrónico de control", "Ascensor: compra del equipo", "Ascensor: equipo en obra"]\n  },\n  {\n    "id": "hito_exteriores", \n    "nombre": "HITO 10: ACABADOS EXTERIORES Y ÁREAS COMUNES", \n    "icon": "", \n    "color": "#1d4ed8", \n    "items": ["Revestimiento y pintura de fachada exterior", "Pintura en pasillos y áreas comunes", "Adecuación de accesos y pasillos", "Instalación de iluminación en común", "Instalación de barandas", "Instalación de pasamanos escaleras", "Frisos de áreas comunes", "Fachada de vidrio y locales de planta baja"]\n  },\n  {\n    "id": "hito_pruebas", \n    "nombre": "HITO 11: PRUEBAS", \n    "icon": "", \n    "color": "#172554", \n    "items": ["Presión de agua", "Hermeticidad", "Carga eléctrica", "Pruebas de cargas, velocidad y certificación de seguridad de ascensores"]\n  },\n  {\n    "id": "hito_contra_incendio", \n    "nombre": "HITO 12: SISTEMA CONTRA INCENDIO", \n    "icon": "", \n    "color": "#312e81", \n    "items": ["Gabinetes de manguera", "Extintores"]\n  }\n]'

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

AMBITO_SUB_JS = 'const AMBITO_SUB = {"hito_estructura": ["T", "T", "T", "T", "T", "T"], "hito_cerramientos": ["T", "AMBOS", "T"], "hito_servicios": ["A", "A", "AMBOS", "AMBOS", "T", "T", "A", "A", "T", "T", "T", "T", "T", "T", "T", "A", "A", "T", "T"], "hito_acabados": ["AMBOS", "AMBOS", "AMBOS", "AMBOS", "AMBOS", "AMBOS", "AMBOS", "AMBOS", "AMBOS", "A", "A", "A", "AMBOS"], "hito_puertas": ["A", "A", "A", "A", "A", "A", "T", "A"], "hito_ventanas": ["A", "A"], "hito_acc_sanitarios": ["A", "A", "A", "A", "A", "A", "A", "T", "A"], "hito_acc_electricos": ["A", "A", "A", "A", "A", "A", "A", "T", "AMBOS"], "hito_ascensor": ["T", "T", "T", "T", "T", "T"], "hito_exteriores": ["T", "T", "T", "T", "T", "T", "T", "T"], "hito_pruebas": ["AMBOS", "AMBOS", "AMBOS", "T"], "hito_contra_incendio": ["T", "T"]};'

CODIGOS_JS = 'const CODIGOS_SUB = {"hito_estructura": ["1.01", "1.02", "1.03", "1.04", "1.05", "1.06"], "hito_cerramientos": ["2.01", "2.02", "2.03"], "hito_servicios": ["3.01", "3.02", "3.03", "3.04", "3.05", "3.06", "3.07", "3.08", "3.09", "3.10", "3.11", "3.12", "3.13", "3.14", "3.15", "3.16", "3.17", "3.18", "3.19"], "hito_acabados": ["4.01", "4.02", "4.03", "4.04", "4.05", "4.06", "4.07", "4.08", "4.09", "4.10", "4.11", "4.12", "4.13"], "hito_puertas": ["5.01", "5.02", "5.03", "5.04", "5.05", "5.06", "5.07", "5.08"], "hito_ventanas": ["6.01", "6.02"], "hito_acc_sanitarios": ["7.01", "7.02", "7.03", "7.04", "7.05", "7.06", "7.07", "7.08", "7.09"], "hito_acc_electricos": ["8.01", "8.02", "8.03", "8.04", "8.05", "8.06", "8.07", "8.08", "8.09"], "hito_ascensor": ["9.01", "9.02", "9.03", "9.04", "9.05", "9.06"], "hito_exteriores": ["10.01", "10.02", "10.03", "10.04", "10.05", "10.06", "10.07", "10.08"], "hito_pruebas": ["11.01", "11.02", "11.03", "11.04"], "hito_contra_incendio": ["12.02", "12.03"]};'

REUBICAR_JS = 'const REUBICAR_V2 = {"hito_contra_incendio": {"de": 5, "filas": [1, 2]}};\nfunction _reubicarV2(partidas) {\n  if (!partidas) return partidas;\n  Object.keys(REUBICAR_V2).forEach(function (pid) {\n    var r = REUBICAR_V2[pid], arr = partidas[pid];\n    if (Object.prototype.toString.call(arr) !== \'[object Array]\' || arr.length !== r.de) return;\n    partidas[pid] = r.filas.map(function (i) { return arr[i]; });\n  });\n  return partidas;\n}\n'
