# QC de los formularios

Baterías con Playwright a 375×812 (iPhone), escritas el 14 y 15-sep-2026. Corren contra el generado local
(`../servicios.html`, `../sha.html`) con un **relevo falso** que acepta todo, salvo las dos marcadas «publicado»,
que abren el sitio publicado y hablan con el relevo real en modo `?prueba=1`.

```bash
cd qc && npm init -y && npm i playwright@1.47.2 && npx playwright install chromium
node qc-servicios.js         # 54 comprobaciones funcionales de servicios
node estres-servicios.js     # 49 de estrés: fotos, IndexedDB, 20 torres, red caída, textos raros
node qc-sha.js               # 20 funcionales de SHA
node estres-sha.js           # 39 de estrés de SHA
GARMEL_CLAVE='…' node publicado.js            # 25 contra el sitio publicado y el relevo real (deja PRUEBA- en Drive)
GARMEL_CLAVE='…' node publicado-historial.js  # el historial de T-12 llega del relevo a un teléfono limpio
node insp-humo.js            # inspección abre y tiene el padrón completo
```

La clave del relevo va **solo** por la variable de entorno `GARMEL_CLAVE`; nunca en un archivo. Las pruebas
contra el relevo real dejan informes `PRUEBA-` en Drive y en el registro: se limpian con
`enviarPruebasAPapelera` y `borrarPruebasSmartsheet` desde el editor de Apps Script.

Lo que cada batería vigila está escrito en sus propios mensajes; cuando una cambia de resultado por un cambio
del formulario, se corrige el guion o el formulario, nunca se borra la comprobación. Tres lecciones que
costaron tiempo: el relevo falso tiene que contestar `accion: 'historial'` sin contarlo como envío; en SHA hay
que esperar la bandera `_tandaEnCurso`, no solo el cartel, porque el freno pregunta al relevo antes de mostrar
nada; y con el service worker activo las rutas falsas de Playwright no interceptan, así que las baterías locales
lo bloquean (`serviceWorkers: 'block'`).

## El banco sin Node: `banco/`

Escrito el 21-sep-2026 para los 10 QC de urbanismo, incidencias de SHA y el botón «Inicio», en un Mac sin
Node ni Playwright. Corre en el navegador integrado de la app de Claude (o en cualquier Chrome) contra una
copia de los cinco HTML con el relevo falso en Python:

```bash
python3 qc/banco/preparar.py /tmp/banco      # copia los HTML con el relevo falso y sin service worker
python3 /tmp/banco/relevo-falso.py &         # relevo falso: acepta los cuatro tipos, historial por (tipo, torre)
python3 /tmp/banco/estatico.py &             # sirve /tmp/banco en 127.0.0.1:8777
```

Y en la consola del navegador, a 375×812, sobre `http://127.0.0.1:8777/urbanismo.html?prueba=1`:

```js
eval(await (await fetch('/t/correr.js')).text()); await __correr('t1');
```

Tandas: `t1` cabecera y manzanas · `t2`/`t2b` partidas, unidades, secciones · `t3` Planificación · `t4` visita
anterior y relevo · `t5` 48 fotos y envíos · `t6` incidencias de SHA (en `sha.html`) · `t7a…t7i` botón «Inicio»
en los cuatro y el menú (cada letra en la página que dice) · `t8` volumen: 30 manzanas, 30 informes, cuota
llena · `t9a`/`t9b` autoguardado, recargas, `?rol=planificacion`, datos corruptos · `t10` maqueta (en cada
página y ancho) · `t11` regresión de los arreglos del 21-sep · `t12` quitar hallazgo con fotos (SHA) ·
`t19` Obras Preliminares, camiones de «Bote de material» y retiro de las secciones agregadas a mano (24-sep; se
corre dos veces: la primera prepara el teléfono y recarga).

El relevo falso se gobierna por `POST /control` con `{tipos, caido, fallar: [nros], lento: segundos, borrar}`
y anota cada envío en `envios.jsonl`. **El navegador tiene que estar a la vista**: oculto, Chrome estrangula
los temporizadores y una foto tarda 11 s en vez de 0,1 s, y las tandas se cortan.

## Probar el PDF del relevo sin Apps Script: `banco/pdf/`

Escrito el 23-sep-2026 para el defecto de las fotos de los hallazgos. `PDF.gs` es JavaScript normal: se puede
ejecutar en el navegador con cuatro sustitutos (los dos logos, `_nombreDeSector`, `_servicioDeApto` y
`Utilities`) y comprobar **en qué sección cae cada fotografía** sin desplegar nada.

```bash
cp ~/512/Garmel/implementacion/relevo-drive/{PDF.gs,Smartsheet.gs} qc/banco/pdf/   # Smartsheet.gs trae HITOS
python3 qc/banco/pdf/sirve.py &                                                    # 127.0.0.1:8781
```

Se arma un `casos.json` con `[{numero, tipo, sector, torre, datos, fotos}]` —`datos` es el JSON archivado del
informe y cada foto lleva `dato: 'ID:<nombre>'` en vez de la imagen— y en la consola se llama a la plantilla que
toque (`_pdfHtml`, `_pdfHtmlServicios`, `_pdfHtmlSha`, `_pdfHtmlUrbanismo`); las `src="ID:…"` del HTML dicen qué
foto salió y dónde. Así se vio que a seis informes reales les faltaban fotos, y así se comprobó el arreglo contra
los 30 informes archivados y contra un sobre nuevo de cada uno de los cuatro formularios (`t15` urbanismo,
`t16` inspección, `t17` servicios, `t18` SHA, todos con tildes y ñ en cada texto que nombra una foto).
