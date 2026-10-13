#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Construye compilado.html — «Compilado de la semana»: la página con la que la coordinación valida la semana de una torre.

NO ES UN FORMULARIO DE INSPECCIÓN. Pide sector, torre, fechas y quién valida; le pide al relevo la semana ya armada
(`accion: 'compilado-semana'`: el último informe de la torre, el último de cada apartamento con su porcentaje por hito,
las notas de todos los informes con su primera foto y el enlace a cada PDF); la coordinación escribe su validación en
tres cuadros más uno libre y la envía (`accion: 'compilado-guardar'`), que la archiva en la carpeta de la torre.
Acordado entre Stephanie González y Planificación el 13-oct-2026; una sola página sirve para obra y, después, para
servicios, urbanismo y SHA.

DE DÓNDE SALE CADA COSA:
  · Sectores, torres y empresas   → `comun/maestros.py`, los mismos de los cuatro formularios.
  · Quién valida                  → el padrón de `comun/maestros.py` como sugerencia; se puede escribir otro nombre.
  · Lo de la semana               → el relevo, cada vez; nada queda en el teléfono salvo lo que la coordinación escribe
                                    mientras lo escribe (borrador) y el último sector, torre y nombre elegidos.
  · Porcentajes                   → los calcula el relevo con las funciones del PDF; esta página solo los muestra, con la
                                    nota de que no son el avance físico ni el financiero (ADR-0048).

La dirección del relevo se toma de `construir-menu.py` para no tenerla en dos sitios.
"""
import os, re, sys

RAIZ = os.path.dirname(os.path.abspath(__file__))
SALIDA = os.path.join(RAIZ, "compilado.html")
sys.path.insert(0, os.path.join(RAIZ, "comun"))
import maestros


def construir():
    lee = lambda *p: open(os.path.join(RAIZ, *p), encoding="utf-8").read()
    version = re.search(r"VERSION = 'garmel-inspeccion-(v\d+)'", lee("sw.js")).group(1)
    relevo = re.search(r"const RELEVO_URL = '([^']+)'", lee("construir-menu.py")).group(1)
    p = (lee("compilado", "pagina.html")
         .replace("@@TORRES@@", maestros.TORRES_JS)
         .replace("@@SECTOR_POR_CONVENIO@@", maestros.SECTOR_POR_CONVENIO_JS)
         .replace("@@INSPECTORES@@", maestros.INSPECTORES_JS)
         .replace("@@RELEVO@@", relevo)
         .replace("@@VERSION@@", version))
    if "@@" in p:
        sys.exit("✗ Quedaron marcadores sin sustituir")
    # El repositorio es público: aquí no puede haber avances, montos ni teléfonos.
    if re.search(r"\bUSD\b|Bs\.|\$\s?\d|\b0[24]\d{2}[- ]?\d{7}\b|@cgarmel", p):
        sys.exit("✗ compilado.html trae algo que no debe ir al repositorio público")
    if "Fuerte Tiuna" in p:
        sys.exit("✗ compilado.html dice Fuerte Tiuna")
    open(SALIDA, "w", encoding="utf-8").write(p)
    return len(re.findall(r"\{t:'", maestros.TORRES_JS))


if __name__ == "__main__":
    n = construir()
    print("✓ compilado.html construido — %d KB · %d entradas de torre" % (os.path.getsize(SALIDA) // 1024, n))
