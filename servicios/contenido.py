# -*- coding: utf-8 -*-
"""Qué se inspecciona en el formulario de SERVICIOS.

FUENTE: Hernán Escobar, a través del borrador que armó Skarlet Gómez y entregó el
2-sep-2026 (`Informes Servicios.html`). Ella lo dijo con todas las letras: «yo
realmente no he hecho inspecciones de servicios, entonces él es el que me ha dicho
qué necesita y qué no necesita».

Este archivo es SOLO EL CONTENIDO. No decide nada de la forma —eso está en
Garmel/implementacion/propuestas/formulario-de-servicios.md—, y por eso sobrevive
a cualquier cambio de cómo se construya el instrumento.

⚠️ DOS SERVICIOS ESTÁN VACÍOS A PROPÓSITO —contra incendio y aguas pluviales—.
En el borrador venían con una fila en blanco para escribir a mano, sin ítems
definidos. NO SE INVENTAN: los llena Hernán Escobar. Mientras tanto el
formulario los ofrece como campo libre, que es exactamente lo que hace el
borrador. Aguas servidas dejó de estar vacío el 14-sep-2026: sus ítems los
escribió Hernán en campo, desde ese mismo campo libre.
"""

# ── A) General — por torre y urbanismo ─────────────────────────────────────
#
# Cada ítem se responde SÍ / NO / SIN MARCAR, con observación y fotos por servicio.
# «Sin marcar» NO es «No»: es la misma distinción que sostiene ADR-0026, y en el
# borrador de Skarlet ya estaba bien resuelta —los botones se deseleccionan—.
GENERAL = [
    {
        "id": "srv_electrico",
        "nombre": "1. SERVICIOS ELÉCTRICOS",
        "items": [
            "Ubicación de Punto de Conexión",
            "Conexiones Exteriores",
            "Transformador Energizado",
            "Conexión entre Transformador y Módulo",
            "Instalación de Módulos para Medidores",
            "Instalación de Medidores",
        ],
    },
    {
        "id": "srv_cantv",
        "nombre": "2. SERVICIOS DE CANTV",
        # 14-sep-2026, primera jornada de uso: Hernán anotó en T-12 «en las
        # conexiones exteriores separar las canalizaciones y la instalación de
        # la fibra». Skarlet lo pidió como cambio: la fila se parte en dos.
        "items": [
            "Ubicación de Tanquilla de Conexión",
            "Construcción de Canalizaciones Exteriores",
            "Colocación de Fibra desde Tanquilla a Módulo",
            "Conexión con Módulo Principal",
            "Cableado en Pasillos",
            "Colocación de Cajas de Paso",
            "Colocación Cajas FAT",
        ],
    },
    {
        "id": "srv_agua",
        "nombre": "3. AGUA POTABLE",
        "items": [
            "Conexiones Exteriores",
            "Colocación de Llave de Paso",
            "Colocación de Válvula Reguladora de Presión",
            "Colocación de Tubería Montante",
            "Construcción de Manifold",
            "Prueba de Hermeticidad",
        ],
    },
    {
        "id": "srv_gas",
        "nombre": "4. PDVSA / GAS DOMÉSTICO",
        # ⚠️ «Colocación de Válvula» está también pedida para el hito 3 del
        # formulario de inspección (PA-104). Si se construye en los dos, se mide
        # dos veces y ninguna de las dos cifras manda.
        "items": [
            "Conexión a Red Principal",
            "Construcción de Caseta Regulación Principal",
            "Instalación de Regulación Secundaria",
            "Prueba a Tubería entre Ascendente y Caseta",
            "Colocación de Tubería Ascendente",
            "Colocación de Unión Universal entre Pisos",
            "Colocación de Válvula",
            "Construcción de Manifold",
        ],
    },
    {
        "id": "srv_aguas_servidas",
        "nombre": "5. AGUAS SERVIDAS",
        # Los llenó Hernán Escobar EN CAMPO el 14-sep-2026 —primera jornada de
        # uso— como ítems agregados del informe SRV-EZ-T03-260914-HE, y Skarlet
        # los pidió como fijos ese mismo día. Se conserva su orden.
        "items": [
            "Ubicación de Boca de Visita",
            "Construcción de Tanquilla de Descarga",
            "Conexión a Tanquilla de Descarga",
            "Colocación de Bajantes de Descarga",
        ],
    },
    # Los dos que faltan. La lista vacía NO es un olvido: es el estado real del
    # levantamiento, y el formulario tiene que comportarse bien con ella.
    {"id": "srv_incendio", "nombre": "6. SERVICIOS CONTRA INCENDIO", "items": []},
    {"id": "srv_pluviales", "nombre": "7. AGUAS PLUVIALES", "items": []},
]

# ── Nombres que cambiaron ──────────────────────────────────────────────────
#
# Un informe guardado en un teléfono reconoce sus ítems fijos POR NOMBRE. Si un
# nombre cambia y no queda su alias, el informe pierde esa respuesta al
# reabrirse, sin avisar. Aquí vive la traducción; el formulario la aplica al
# cargar un informe y al traer el estado anterior de una torre.
RENOMBRADOS = {
    "srv_cantv": {
        "Conexiones Exteriores": "Construcción de Canalizaciones Exteriores",
    },
}

# ── B) Apartamentos y áreas comunes ────────────────────────────────────────
#
# Una fila por apartamento, AGREGADA A MANO por el inspector — no precargada con
# los 60 a 150 apartamentos de la torre (decidido el 2-sep-2026).
#
# Cada columna es (etiqueta, tipo). Tipos: 'sino' | 'cant' | 'obs'.
APARTAMENTOS = [
    {
        "id": "apto_electrico",
        "nombre": "ELÉCTRICO",
        "columnas": [
            ("Cableado", "sino"),
            ("Tomacorrientes", "cant"),
            ("Interruptores", "cant"),
            ("Tablero", "sino"),
            ("Energizado", "sino"),
            ("Observaciones", "obs"),
        ],
    },
    {
        "id": "apto_cantv",
        "nombre": "CANTV",
        "columnas": [("Puntos de conexión", "cant"), ("Instalados", "sino"), ("Observaciones", "obs")],
    },
    {
        "id": "apto_agua",
        "nombre": "AGUA POTABLE",
        "columnas": [("Puntos de servicio", "cant"), ("Instalados", "sino"), ("Observaciones", "obs")],
    },
    {
        "id": "apto_gas",
        "nombre": "GAS DOMÉSTICO (PDVSA)",
        "columnas": [("Puntos de suministro", "cant"), ("Instalados", "sino"), ("Observaciones", "obs")],
    },
    {
        "id": "apto_aguas_servidas",
        "nombre": "AGUAS SERVIDAS",
        "columnas": [("Puntos de descarga", "cant"), ("Instalados", "sino"), ("Observaciones", "obs")],
    },
]

# La unidad de las cantidades. En el borrador solo el eléctrico la mostraba
# («pza» junto a tomacorrientes e interruptores); se aplica a todas por el mismo
# motivo que en el formulario de inspección: sin unidad, «12» puede ser 12 puntos
# o 12 metros.
UNIDAD_CANTIDAD = "pza"


def total_items():
    """Ítems definidos hoy. Sirve de guardián: si alguien llena los tres
    servicios vacíos y no actualiza lo que dependa de este número, se ve."""
    return sum(len(s["items"]) for s in GENERAL)


def servicios_sin_contenido():
    return [s["nombre"] for s in GENERAL if not s["items"]]


if __name__ == "__main__":
    print("Servicios generales: %d" % len(GENERAL))
    print("Ítems definidos:     %d" % total_items())
    print("Sin contenido:       %s" % ", ".join(servicios_sin_contenido()))
    print("Tablas de apartamento: %d" % len(APARTAMENTOS))
