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
corre dos veces: la primera prepara el teléfono y recarga). · `t20` + `t20b` (tras recargar) diez QC de estrés
de lo mismo, con `pdf/t20pdf.js` como QC10 contra la plantilla del PDF (24-sep: encontró que un borrador con
camiones no se reabría, v90).

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

## Lista v2 (29-sep-2026): `t21` a `t25`

Cinco tandas nuevas para la lista v2 (v91/v92): `t21` humo de la medición, `t22` partidas y cálculo (cifras esperadas
calculadas aparte desde `comun/lista_v2.py`), `t23` borradores (30 borradores, viejos de la lista anterior y «por
hitos», autoguardado), `t24` fotos y envío (48 fotos, relevo caído, doble toque, «Enviar todos» con viejo y nuevo) y
`t25` maqueta (se corre a 375×812 y a 320×640). Encontraron cuatro cosas, ya arregladas en la v92: el borrador «por
hitos» se abría en ese modo, Enviar no guardaba antes de mandar, los avisos largos se salían de la pantalla y a 320 px
la fila de conteo ensanchaba la tabla.

Tres trampas del banco, las tres costaron tiempo esa noche:

- **Con la pestaña oculta** Chrome estrangula `setTimeout`: `runner.js` espera con `MessageChannel` si `document.hidden`.
- **Nunca copiar un HTML al banco a mano**: `preparar.py` anula las dos formas de registrar el service worker
  (`'./sw.js'` y `'sw.js'`). Una copia hecha a mano registró uno, y desde entonces Chrome sirvió copias viejas del
  formulario **y del `envios.jsonl`**: las tandas leían envíos de la corrida anterior. Si pasa, desregistrarlo y borrar
  `caches` desde la consola del origen `127.0.0.1:8777`.
- **Una tanda a la vez**: dos tandas simultáneas comparten el relevo falso y se leen los envíos una a la otra.

## El informe anterior (29/30-sep-2026): `t26` a `t30`

Veinticinco comprobaciones del cambio 151 (v93/v94): `t26` lo básico (del teléfono, del archivo, cantidades «hay»,
cuándo no se ofrece, torre), `t27` bordes (el más reciente de dos, borrador de la lista anterior, relevo caído y sin clave,
lo traído se envía sin la evaluación vieja, «4» = «04»), `t28` interacción (cambiar de torre con el aviso a la vista,
«Traer» no pisa lo ya medido, solo el «hay» de conteo, unidades ml/kg y % en torre, la consulta lleva bloque y marca de
prueba), `t29` estrés (autoguardado, «Limpiar todo», 42 borradores, «Enviar todos», impresión) y `t30` UX (a 375 y 320).
Encontraron tres cosas, arregladas en la v94: el aviso quedaba ~1.000 px debajo del apartamento (ahora va justo debajo), no
se anunciaba a lectores de pantalla (`role="status"`) y salía al imprimir. El relevo falso contesta `tipo: 'obra'` igual
que el r27.


## Lo que ya sabían servicios y SHA (30-sep-2026): `t32` a `t35`

Veinte comprobaciones del cambio 153 (v96): `t32` fotos en IndexedDB (12 fotos, reabrir y guardar mientras se pintan,
quitar una, «Enviar todos» desde IndexedDB, borrador viejo con las fotos dentro), `t33` borradores vacíos y «Enviar todos»
(incompletos, motivo de cada fallo, corte por tiempo con el plazo acortado, guarda lo de pantalla), `t34` enviado por id,
abrir sin perder, abierto incompleto y «editado después», y deja un informe a medias para `t34b`, que se corre **después de
recargar sin borrar nada** (`recargar()` en el marco) y comprueba que vuelve solo; `t35` coma decimal, conteo como texto,
lo traído de la visita anterior (marcas, «Sigue igual», heredado en el envío) y «Finalizar».

Encontraron dos cosas. Al abrir un informe con otro sin guardar en pantalla, se guardaba el de pantalla, la lista se corría
y se abría el equivocado (se arregló buscando por id). Y **un fallo que venía de antes**: tras «Finalizar», el siguiente
informe se guardaba encima del recién finalizado, porque el id seguía puesto (cambio 153j).

## «¿Dónde es?» (30-sep-2026): `t36` a `t38`

Diez comprobaciones del selector de lugar (v97, `comun/ubicacion.js`). `t36` en `servicios.html` cubre:
- por defecto, una sola torre;
- «Varias», con chips, número `+N` y empresa de todas;
- envío único y reapertura;
- «Toda la zona», con la zona donde va el convenio y el número `ZONA`;
- la vuelta a una torre.

`t37` en `urbanismo.html` prueba los rótulos de manzana, la opción ZONA que sobrevive a elegir el sector y
«Siguiente». `t38` en `sha.html` prueba dos empresas asignadas a la vez y el ancho a 375 y a 320.

Encontraron que «Enviar» revisaba los borradores pendientes con el modo de la pantalla y no con el de cada uno. Se
arregló: `faltan` lee la ubicación del borrador.

La regresión de las pruebas viejas de urbanismo y SHA da lo mismo que la v96 publicada, corrida sobre
`*-base.html` (copias de `git show HEAD:`). Eso incluye las expectativas vencidas de `t1`, `t2`, `t4`, `t5` y `t6`,
escritas antes de arreglos posteriores (la coma decimal, entre otros).
