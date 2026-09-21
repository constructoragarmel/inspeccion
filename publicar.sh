#!/bin/sh
# Publicar una versión nueva: PRIMERO se sube VERSION en sw.js y DESPUÉS se
# construyen las cuatro páginas, porque cada generador lee la versión de sw.js
# para el rótulo de abajo («● en línea · vNN»). Al revés, el rótulo se queda
# con la versión anterior: pasó del v75 al v79 (el menú decía v74 y SHA v78
# con el código del v79), y en obra se pensó que la actualización no llegaba.
#
# Uso: ./publicar.sh            (sube un número y construye)
#      ./publicar.sh --solo-construir   (no toca la versión)
set -e
cd "$(dirname "$0")"
actual=$(grep -o "garmel-inspeccion-v[0-9]*" sw.js | head -1 | grep -o "[0-9]*$")
if [ "$1" != "--solo-construir" ]; then
  nueva=$((actual + 1))
  sed -i '' "s/garmel-inspeccion-v$actual'/garmel-inspeccion-v$nueva'/" sw.js
else
  nueva=$actual
fi
python3 construir-menu.py | head -1
python3 construir.py > /dev/null && echo "✓ inspeccion.html construido"
python3 construir-servicios.py | head -1
python3 construir-sha.py | head -1
python3 construir-urbanismo.py | head -1
echo "sw.js: v$nueva"
for f in index.html inspeccion.html servicios.html sha.html urbanismo.html; do
  v=$(grep -o "en línea[^v]*v[0-9]*\|en línea · v[0-9]*" "$f" | grep -o "v[0-9]*" | head -1)
  [ "$v" = "v$nueva" ] || { echo "✗ $f dice $v y no v$nueva"; exit 1; }
  echo "✓ $f dice $v"
done
