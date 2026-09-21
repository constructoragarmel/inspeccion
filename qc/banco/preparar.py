#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Arma el banco de QC en una carpeta aparte: copia los cinco HTML generados,
cambia el relevo por el falso (127.0.0.1:8776) y anula el service worker, que
con la copia local no deja interceptar nada. Luego:

    python3 banco/relevo-falso.py &      # relevo falso, puerto 8776
    python3 banco/estatico.py &          # sirve el banco, puerto 8777

y en el navegador (375×812), en la consola de cada formulario:

    eval(await (await fetch('/t/correr.js')).text()); await __correr('t1');

Cada tN.js es una tanda; el resumen sale con verdes, rojos y detalle. El
navegador tiene que estar A LA VISTA: oculto, Chrome estrangula los
temporizadores y una foto tarda 11 s en vez de 0,1 s.

Uso: python3 qc/banco/preparar.py /ruta/al/banco
"""
import os, re, shutil, sys
RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
AQUI = os.path.dirname(os.path.abspath(__file__))
destino = sys.argv[1] if len(sys.argv) > 1 else os.path.join(RAIZ, 'qc', 'banco-local')
os.makedirs(os.path.join(destino, 't'), exist_ok=True)
for f in ['index.html', 'inspeccion.html', 'servicios.html', 'sha.html', 'urbanismo.html']:
    s = open(os.path.join(RAIZ, f), encoding='utf-8').read()
    s = re.sub(r'https://script\.google\.com/macros/s/[A-Za-z0-9_-]+/exec', 'http://127.0.0.1:8776/exec', s)
    s = s.replace("navigator.serviceWorker.register('./sw.js')", "void 0")
    s = s.replace("navigator.serviceWorker.register('sw.js').catch(function(){ /* sin copia local */ });", "void 0;")
    open(os.path.join(destino, f), 'w', encoding='utf-8').write(s)
for f in ['sw.js', 'manifest.json', 'icon-192.png', 'icon-512.png']:
    shutil.copy(os.path.join(RAIZ, f), destino)
for f in ['relevo-falso.py', 'estatico.py']:
    shutil.copy(os.path.join(AQUI, f), destino)
for f in os.listdir(os.path.join(AQUI, 't')):
    shutil.copy(os.path.join(AQUI, 't', f), os.path.join(destino, 't'))
print('banco en', destino)
