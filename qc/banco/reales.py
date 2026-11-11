#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Copia al banco el historial REAL que usan las tandas con datos de Drive (`e17`, `e19` a `e23`, `e28`, `e29`…).

Antes se copiaba a mano (2-nov-2026) y cada banco nuevo quedaba sin él: esas tandas fallaban con «<!DOCTYPE … is not valid JSON»
porque /reales/ no existía (lo encontró el QC del 11-nov). Lee la unidad compartida montada (Google Drive para escritorio).

Uso:  python3 qc/banco/reales.py <banco> "<carpeta de la unidad «Inspección Ciudad Tiuna 2026»>"
Deja  <banco>/reales/<SECTOR>-<TORRE>.json  (el avance-torre.json de cada torre)  y
      <banco>/reales/EZ-T16-torre-261021.json  (el informe de torre que usa e28).
"""
import os, shutil, sys

SECTORES = {"01 Ezequiel Zamora (Bielorrusos)": "EZ", "02 Simón Bolívar (Chinos)": "SB", "03 Simón Rodríguez (Rusos)": "SR"}
banco, drive = sys.argv[1], sys.argv[2]
dest = os.path.join(banco, "reales"); os.makedirs(dest, exist_ok=True)
n = 0
for carpeta, sec in SECTORES.items():
    torres = os.path.join(drive, carpeta, "Torres")
    for t in sorted(os.listdir(torres)):
        src = os.path.join(torres, t, "Informe", "avance-torre.json")
        if os.path.isfile(src):
            shutil.copyfile(src, os.path.join(dest, "%s-%s.json" % (sec, t))); n += 1
extra = os.path.join(drive, "01 Ezequiel Zamora (Bielorrusos)", "Torres", "T-16", "Informe", "datos", "EZ-T16-261021-LV.json")
if os.path.isfile(extra):
    shutil.copyfile(extra, os.path.join(dest, "EZ-T16-torre-261021.json")); n += 1
print("reales: %d archivos en %s" % (n, dest))
