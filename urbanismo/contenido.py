# -*- coding: utf-8 -*-
"""Qué se inspecciona en el formulario de Urbanismo.

FUENTE: el borrador `informe_urbanismo (1).html` que Stephanie González recibió
el 21-sep-2026, y las respuestas de Skarlet Gómez del mismo día (Garmel,
implementacion/propuestas/formulario-urbanismo.md). El contenido —secciones,
partidas y unidades— es de Ingeniería; la forma se rehace sobre el motor de
servicios, como SHA.

Este archivo es SOLO EL CONTENIDO.

⚠️ PROVISIONAL: las manzanas de Simón Bolívar y Simón Rodríguez y la empresa de
Simón Bolívar no se conocen todavía (Skarlet las va a preguntar). El formulario
deja agregar manzanas, secciones y partidas desde el teléfono, y las recuerda.
"""

# ── Manzanas y lotes por sector ────────────────────────────────────────────
#
# El «torre» del motor es aquí la manzana o el lote. La empresa de urbanismo es
# una por sector (Skarlet y Stephanie, 21-sep): ADDISON en Ezequiel Zamora,
# PROCODIMA en Simón Rodríguez, RACAR en Simón Bolívar. Residente: se escribe
# la primera vez y el teléfono lo recuerda por manzana.
EMPRESA_POR_SECTOR = {
    "Convenio Bielorusos": "ADDISON",
    "Convenio Rusos":      "PROCODIMA, C.A.",
    "Convenio Chinos":     "RACAR INGENIEROS, C.A.",
}
NOMBRE_SECTOR = {
    "Convenio Bielorusos": "Ezequiel Zamora",
    "Convenio Rusos":      "Simón Rodríguez",
    "Convenio Chinos":     "Simón Bolívar",
}
MANZANAS = [
    ("M-1 L1", "Convenio Bielorusos"),
    ("M-1 L2", "Convenio Bielorusos"),
    ("M-1 L3", "Convenio Bielorusos"),
    ("M-1 L4", "Convenio Bielorusos"),
    ("M-2",    "Convenio Bielorusos"),
    ("M-3",    "Convenio Bielorusos"),
    ("M-4",    "Convenio Bielorusos"),
    ("M-5",    "Convenio Bielorusos"),
    ("M-6",    "Convenio Bielorusos"),
]

# ── Secciones y partidas ───────────────────────────────────────────────────
#
# Las ocho del borrador, en su orden. Cada partida lleva su UNIDAD FIJA
# (respuesta 3 de Skarlet): el inspector escribe la cantidad ejecutada
# acumulada a la fecha (respuesta 2). Las unidades son las del borrador,
# asignadas por el sentido de cada partida; Ingeniería las confirma.
UNIDADES = ["m", "m²", "m³", "und", "kg", "glb", "ha", "ton"]

def _sec(id_, nombre, partidas):
    return {"id": id_, "nombre": nombre,
            "items": [p for p, _ in partidas],
            "unidades": {p: u for p, u in partidas}}

GENERAL = [
    _sec("urb_drenaje", "1. DRENAJE", [
        ("Topografía", "m"), ("Excavación", "m³"), ("Canalización", "m"), ("Tanquilla", "und")]),
    _sec("urb_estructura", "2. ESTRUCTURA", [
        ("Excavación / Movimiento de tierra", "m³"), ("Acero de refuerzo", "kg"),
        ("Concreto", "m³"), ("Encofrado", "m²")]),
    _sec("urb_acueductos", "3. ACUEDUCTOS", [
        ("Topografía", "m"), ("Excavación", "m³"), ("Canalizaciones", "m"), ("Captación", "und")]),
    _sec("urb_electricidad", "4. ELECTRICIDAD", [
        ("Puntos cableados", "und"), ("Canalización", "m"), ("Tuberías", "m"),
        ("Tanquillas", "und"), ("Postes de luminaria", "und")]),
    _sec("urb_aguas_servidas", "5. AGUAS SERVIDAS", [
        ("Topografía", "m"), ("Excavación", "m³"), ("Canalización", "m"),
        ("Tanquillas", "und"), ("Colectores", "m")]),
    _sec("urb_vialidad", "6. VIALIDAD", [
        ("Topografía", "m"), ("Escarificación", "m²"), ("Suministro y colocación", "m³"),
        ("Carpeta de rodamiento", "m²"), ("Brocales", "m"), ("Aceras", "m²"),
        ("Demarcación", "m"), ("Transporte y maquinaria", "glb")]),
    _sec("urb_camineria", "7. CAMINERÍA", [
        ("Topografía / Trazo", "m"), ("Excavación y conformación", "m³"), ("Pavimento / Acabado", "m²")]),
    _sec("urb_paisajismo", "8. PAISAJISMO", [
        ("Topografía", "m"), ("Jardinería", "m²"), ("Sistema de riego", "m"),
        ("Iluminación", "und"), ("Mobiliario urbano", "und"), ("Caminerías", "m²")]),
]

RENOMBRADOS = {}

# Calidad de cada partida, como en inspección de obra: B / R / M y N-A.
CALIDADES = [("B", "Bueno"), ("R", "Regular"), ("M", "Malo"), ("NA", "No aplica")]

# El motor de servicios exige estas dos; urbanismo no usa la pestaña de
# apartamentos (queda oculta) pero el motor la construye.
APARTAMENTOS = [{"id": "apto", "nombre": "APARTAMENTO", "columnas": []}]
UNIDAD_CANTIDAD = "und"

def total_items():
    return sum(len(s["items"]) for s in GENERAL)
