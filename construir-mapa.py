#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Construye mapa.html — el «Mapa de la obra»: la página que le explica a quien llega cómo está repartida Ciudad Tiuna.

NO ES UN FORMULARIO. No se llena ni se envía nada: se lee. Tiene cinco vistas —la obra (sectores, contratistas y
torres), quién hace qué, cómo viaja un informe, avances y dónde está cada cosa— y la pidió Stephanie González el
3-oct-2026 como incorporación para quien entra al equipo.

DE DÓNDE SALE CADA COSA:
  · Qué contratista tiene cada torre  → se lo pide al relevo (`accion: 'mapa'`), que lo lee de `MAE_Torres` en
    Smartsheet. Se corrige en el maestro, no aquí. Lo último consultado queda en el teléfono para abrir sin señal.
  · `mapa/referencia.json`            → la copia que se ve si el teléfono nunca ha podido consultar. Solo estructura.
  · Avances por torre                 → también del relevo, con una clave aparte (`claveAvances`). No se guardan en
    el teléfono y este repositorio, que es público, no lleva ninguno: ni porcentajes, ni montos, ni pesos.
  · Funciones, pasos, semana, índice  → escritos en `mapa/pagina.html`. Por función: sin nombres de personas.

La dirección del relevo se toma de `construir-menu.py` para no tenerla en dos sitios.
"""
import json, os, re, sys

RAIZ = os.path.dirname(os.path.abspath(__file__))
SALIDA = os.path.join(RAIZ, "mapa.html")


def construir():
    lee = lambda *p: open(os.path.join(RAIZ, *p), encoding="utf-8").read()
    version = re.search(r"VERSION = 'garmel-inspeccion-(v\d+)'", lee("sw.js")).group(1)
    relevo = re.search(r"const RELEVO_URL = '([^']+)'", lee("construir-menu.py")).group(1)
    ref = json.loads(lee("mapa", "referencia.json"))
    torres = sum(len(c[1]) for s in ref["sectores"] for c in s["contratistas"])
    p = (lee("mapa", "pagina.html")
         .replace("@@REFERENCIA@@", json.dumps(ref, ensure_ascii=False))
         .replace("@@RELEVO@@", relevo)
         .replace("@@VERSION@@", version))
    if "@@" in p:
        sys.exit("✗ Quedaron marcadores sin sustituir")
    # El repositorio es público: aquí no puede haber avances, montos ni teléfonos.
    if re.search(r"\bUSD\b|Bs\.|\$\s?\d|\b0[24]\d{2}[- ]?\d{7}\b|@cgarmel", p):
        sys.exit("✗ mapa.html trae algo que no debe ir al repositorio público")
    if "Fuerte Tiuna" in p:
        sys.exit("✗ mapa.html dice Fuerte Tiuna")
    open(SALIDA, "w", encoding="utf-8").write(p)
    return torres


if __name__ == "__main__":
    n = construir()
    print("✓ mapa.html construido — %d KB · referencia con %d torres" % (os.path.getsize(SALIDA) // 1024, n))
