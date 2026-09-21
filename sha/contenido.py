# -*- coding: utf-8 -*-
"""Qué se inspecciona en el formulario de SHA — Seguridad, Higiene y Ambiente.

FUENTE: el borrador `SHA V3.html` que Stephanie González recibió el 14-sep-2026.
El contenido —los nueve recaudos, los tres estados del hallazgo y los tres del
cierre— es de SHA (Birmania Rada); la forma se rehace sobre el
motor de servicios, como se hizo con aquel sobre el de inspección.

Este archivo es SOLO EL CONTENIDO. Lo que está por preguntar a Birmania está en
Garmel/implementacion/propuestas/formulario-sha.md y NO se
resuelve aquí: ni se inventan recaudos, ni se decide qué significa «Rechazado».

⚠️ PROVISIONAL hasta que Birmania Rada responda. Lo que se sabe seguro es la
lista tal como vino en el borrador; lo demás —vencimientos, grano de los
recaudos, criterio de cierre— son preguntas abiertas.
"""

# ── A) Recaudos y aspectos de seguridad ────────────────────────────────────
#
# Un solo bloque, en el orden del borrador. Cada ítem se responde SÍ / NO / N-A /
# SIN MARCAR, con observación; el bloque lleva fotografías (las del documento,
# si hace falta dejar constancia). El «adjuntar PDF» del borrador NO se adopta
# hasta que Birmania diga dónde viven los recaudos (pregunta abierta).
GENERAL = [
    {
        "id": "sha_recaudos",
        "nombre": "1. RECAUDOS Y ASPECTOS DE SEGURIDAD",
        "items": [
            "Copia del Registro Mercantil y Acta Constitutiva",
            "RIF, Cédula del Representante Legal y Solvencia Laboral",
            "Lista de Equipos, Maquinarias y Certificaciones",
            "Documentos del Profesional de Seguridad (INPSASEL)",
            "Matriz de Identificación y Evaluación de Riesgos (en obra)",
            "Plan de Emergencia y Centros de Atención Médica (debe cubrir esta torre)",
            "Programa de Dotación de EPP por Cargo y Reposición",
            "Expediente del Personal (IVSS y Capacitaciones)",
            "Permisos de Trabajo de Alto Riesgo (Altura / Caliente)",
            "Notificación de Principios de Prevención por trabajador",
        ],
    },
]

# Birmania (16-sep-2026): el plan de emergencia es uno por empresa pero debe
# cubrir cada torre; el nombre lo recuerda. El recaudo 10 sale de su respuesta
# a la pregunta 2 (la ley lo llama principios de prevención).
RENOMBRADOS = {
    "sha_recaudos": {
        "Plan de Emergencia y Centros de Atención Médica":
            "Plan de Emergencia y Centros de Atención Médica (debe cubrir esta torre)",
    },
}

# Un «Rechazado» sin acción no sirve (Birmania, respuesta 7): al elegirlo el
# formulario exige una de estas y a qué actividad o frente aplica.
ACCIONES_RECHAZO = [
    "Llamado de atención",
    "Paralizar la actividad",
    "Paralizar el frente",
]

# ── B) Hallazgos de campo ──────────────────────────────────────────────────
#
# Una fila por hallazgo, agregada a mano: dónde, qué, y en qué está. Con sus
# fotografías. Los tres estados son los del borrador; su correspondencia con
# los cuatro del tablero de pendientes (ADR-0029) se decide con Birmania.
ESTADOS_HALLAZGO = ["Pendiente", "En proceso", "Corregido"]

APARTAMENTOS = [
    {
        "id": "hallazgo",
        "nombre": "HALLAZGO",
        "columnas": [
            ("Descripción del hallazgo o condición observada", "obs"),
            ("Acción correctiva / estatus", "lista"),
        ],
    },
]

UNIDAD_CANTIDAD = "pza"

# ── B2) Incidencias (accidentes) ───────────────────────────────────────────
#
# Pedido por Skarlet el 21-sep-2026: cada incidencia lleva la información base
# del informe (convenio, sector, empresa, residente, inspector: se hereda de la
# cabecera y el PDF la imprime por incidencia), la fecha del accidente, el tipo
# (lista abierta: el teléfono recuerda los que se escriben), notas de campo con
# hasta 3 fotos, las acciones a tomar y un semáforo que se actualiza en el
# informe siguiente. La lista de tipos es provisional hasta que Birmania la valide.
TIPOS_INCIDENCIA = [
    "Caída de altura",
    "Golpe o atrapamiento",
    "Corte o herida",
    "Contacto eléctrico",
    "Caída de objeto",
    "Tránsito interno",
]
# (nombre, color): rojo / ámbar / verde. Abierta y En seguimiento vuelven en la
# visita siguiente; Cerrada no.
ESTADOS_INCIDENCIA = [
    ("Abierta", "#dc2626"),
    ("En seguimiento", "#d97706"),
    ("Cerrada", "#16a34a"),
]

# ── C) Cierre ──────────────────────────────────────────────────────────────
#
# El estatus general de la inspección, tal como lo trae el borrador. QUÉ
# SIGNIFICA cada uno y qué consecuencia tiene un «Rechazado» es criterio de
# seguridad: requiere validación del ingeniero responsable.
CIERRE = [
    "Aprobado",
    "Aprobado con observaciones",
    "Rechazado",
]


def total_items():
    return sum(len(s["items"]) for s in GENERAL)


def servicios_sin_contenido():
    return [s["nombre"] for s in GENERAL if not s["items"]]


if __name__ == "__main__":
    print("Bloques: %d · recaudos: %d · estados: %s · cierre: %s" %
          (len(GENERAL), total_items(), " / ".join(ESTADOS_HALLAZGO), " / ".join(CIERRE)))
