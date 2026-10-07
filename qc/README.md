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

## Primero el sector (30-sep-2026): `t39` a `t41`

Diez comprobaciones de la v99:
- `t39`, en `inspeccion.html`: el orden y el rótulo; que Simón Rodríguez oculte las torres de otros sectores y
  tome la T-07 sin preguntar; que cambiar de sector suelte la torre ajena; que sin sector todo funcione como antes;
  y que un borrador de la T-07 de otro sector se abra bien.
- `t40`, en `servicios.html`: el caso real del 30-sep (T-15 + T-14 + T-13 ya no suma a Master) y la T-13 en los
  dos sectores.
- `t41`, en `sha.html`: «el sector» en lo que falta, y el borrador de otro sector.

Encontraron que en inspección las opciones del sector no traían `value`: el valor salía del texto y, al cambiar el
texto al nombre del sector, cambiaba también el valor. Se arregló fijando el `value` antes de cambiar el rótulo.

## Lo que decidió la Ing. Beatriz Sevilla (30-sep-2026): `t42`

Seis comprobaciones de la v100:
- en torre aparecen las 11 subpartidas nuevas de torre (56 filas) y el hito 12 queda con gabinetes y extintores
  (12.02 y 12.03); en apartamento, las 4 suyas (50 filas);
- el ascensor se mide «comprado» y «en obra» con Sí / No;
- un borrador hecho antes, con el hito 12 de 5 filas, se abre con cada medición en su fila (`_reubicarV2`);
- lo traído de una visita anterior de antes, igual;
- el envío de torre lleva las filas nuevas en su lugar.

`t21` a `t24` y `t28` tenían escritas las cuentas viejas (46 y 48 filas, 8 hitos de torre, 48 fotos) o medían el hito 12
por estado. Se corrigieron las cifras sin quitar comprobaciones: ahora son 50 y 56 filas, 11 hitos de torre y 66 fotos.
`t21`–`t35`, `t39` y `t42` en verde sobre la v100.

**`t43` (1-oct-2026), diez QC más de la v100.** Ocho en `inspeccion.html`, corridos a 320×640:
1. cada fila nueva con su control;
2. el % del hito 1;
3. N/A en una fila nueva;
4. «opcional» con el presupuesto de la T-56; el relevo falso contesta su lista nueva;
5. el cambio de ámbito;
6. un borrador de la v99 con el ascensor de 4 filas;
7. «Usar las cantidades» de una visita con el hito 12 viejo;
8. que a 320 px nada se salga.

La 8 pasaba al principio sin mirar nada, porque los hitos estaban cerrados. Ahora los abre y exige ver las filas
nuevas: son 11 a la vista.

Las otras dos, del relevo, están en `pdf/t43relevo.js`:

9. un informe de antes en el PDF y en las filas de Smartsheet;
10. que los pesos sean coherentes con la lista y que las torres de la Inmobiliaria salgan sin presupuesto.

Las 10 en verde.

**`t44minutas` (1-oct-2026), diez QC de la minuta automática del relevo (r31).** No es del formulario: prueba
`Minutas.gs`, que arma la minuta de cada reunión desde `SEG_Reuniones`. Corre en `pdf/minutas.html` con **reuniones
inventadas** (este repositorio es público: lo que se dice en una reunión no va aquí):

```bash
cp ~/512/Garmel/implementacion/relevo-drive/{Logos.gs,PDF.gs,Contactos.gs,Reuniones.gs,Minutas.gs} qc/banco/pdf/
python3 qc/banco/pdf/sirve.py &      # 127.0.0.1:8781 → abrir minutas.html
# en la consola:  eval(await (await fetch('t44minutas.js')).text())
# para ver una minuta dibujada:  minutas.html?id=REU-2026-10-05-SR
```

1. qué reuniones llevan minuta (desde el 28-sep, con empresas);
2. cómo se separan los puntos de una celda (« / » y salto de línea, pero no dentro de un paréntesis);
3. la minuta de un lunes: columnas, una fila por empresa, torre como se dice y total de cemento y bloques;
4. la de un martes: sin procura y sin línea de cemento;
5. compromisos con fecha: orden, fecha al inicio o al final, torres y responsable;
6. por confirmar: lo de la reunión y lo de cada empresa;
7. texto con etiquetas, «Por Garmel» sin correo y la huella del contenido;
8. primera vuelta: agrega las dos columnas, crea un PDF por reunión en su carpeta y deja el enlace;
9. segunda vuelta sin cambios no escribe; una corrección reemplaza el mismo archivo;
10. no pisa un enlace puesto a mano; si Drive no deja reemplazar, papelera y archivo nuevo; `mirarMinutas` no escribe.

Las 8 a 10 corren contra un Smartsheet y un Drive falsos. Las 10 en verde. El conversor de Google no es Chrome: el
papel de verdad se revisó aparte, con las cuatro minutas del 28 y el 29-sep generadas en Apps Script.

**`t45borrador` (1-oct-2026), diez QC del borrador del informe semanal (relevo r32).** Tampoco es del formulario: prueba
`BorradorInforme.gs`, que toma el `.pptx` del informe de la semana anterior y le actualiza la portada y las láminas de
materiales con lo que las contratistas declararon en la reunión del lunes. Corre en `pdf/borrador.html` con **un informe
y unas reuniones inventados**:

```bash
cp ~/512/Garmel/implementacion/relevo-drive/{Smartsheet.gs,Tablero.gs,Contactos.gs,Reuniones.gs,Minutas.gs,BorradorInforme.gs} qc/banco/pdf/
python3 qc/banco/pdf/sirve.py &      # 127.0.0.1:8781 → abrir borrador.html
# en la consola:  eval(await (await fetch('t45borrador.js')).text())
```

1. el corte es el viernes de la semana;
2. toma la reunión de contratistas de esta semana y suma las filas repetidas de una empresa;
3. recorre las láminas en el orden en que se ven;
4. portada: fecha de corte y mes, sin tocar otras fechas;
5. materiales: cada empresa recibe lo suyo aunque el nombre esté escrito distinto;
6. dos datos, dos renglones con el formato de la celda; las celdas combinadas no se tocan; el XML queda bien formado;
7. la fecha del cuadro y el cartel de «no hubo requerimiento»;
8. un sector sin reunión no se toca; una lámina que no es de materiales se ignora;
9. una empresa sin fila en la reunión no hereda el texto viejo;
10. de punta a punta: qué partes cambian, las notas amarillas y el relato de lo hecho.

Las 10 en verde. Lo que este banco no prueba es abrir y cerrar el `.pptx` (`Utilities.unzip` y `zip`): eso se comprobó
en Apps Script con el informe real, y el archivo que salió se abrió con python-pptx y con LibreOffice.

**`t46` (1-oct-2026, v104), memoria de camiones en urbanismo.** Doce comprobaciones sobre `urbanismo.html?prueba=1` a
375×812 (la tanda recarga la página una vez: se corre dos veces):

- una placa que ya se anotó llena sus m³ por viaje, sin pisar lo que ya esté escrito;
- la memoria sale del último informe de cada manzana y de lo escrito en el teléfono;
- una placa repetida en la lista de hoy avisa;
- al traer la visita anterior llega el acumulado y **no** los camiones: aparece el botón «Traer los N camiones de la
  visita anterior (sin viajes)», que los pone con los viajes en blanco;
- el borrador conserva la lista de ayer (`camionesAntes`) y la visita siguiente parte de lo de hoy.

La tanda encontró que la memoria de la manzana (`anotarEstadoTorre`) no guardaba los camiones: sin eso el botón no
habría aparecido en un teléfono de verdad. Corregido en la misma v104. Regresión: `t19` 26/26. **`t4` da 21/23 y ya
los daba en la v103** (los dos de «heredado con su número de origen»): es el guion el que quedó viejo, falta revisarlo.

**`t47` (1-oct-2026, v105), el ámbito «Estructura».** Once comprobaciones en `inspeccion.html`, a 375×812 y a 320×640:
el tercer botón de «Ámbito del informe» deja solo las 6 filas del hito de estructura; el número lleva `ESTR`
(`EZ-T07-ESTR-261001-CJ`); en los datos viaja `ambito: 'torre'` y `vista: 'estructura'`; ir a «Torre completa» o a
«Apartamento» y volver no pierde nada; el borrador reabre en su vista; el envío sale solo con estructura; y la visita
anterior de estructura no se cruza con la de torre completa, ni en el archivo ni en el teléfono. El relevo falso aprendió
lo mismo que el relevo r33.

**Regresión del 1-oct sobre la v105** (cada tanda sola y en página recién cargada; dos navegadores a la vez contra el
mismo relevo falso se pisan): `t21` a `t33`, `t35`, `t39`, `t42`, `t43` (a 320) y `t47` en inspección; `t19`, `t37` y
`t46` en urbanismo; `t36` y `t40` en servicios; `t38` y `t41` en SHA. Todas en verde. Tres guiones estaban viejos desde
la v100 y se corrigieron: `t26` medía una fila del hito 12 que se retiró, `t31` contaba 46 filas de apartamento (son 50)
y el relevo falso seguía con la lista de 79 subpartidas. Queda por revisar `t4` de urbanismo (21 de 23, igual que antes).

**`t48camiones` (1-oct-2026), la hoja de camiones del relevo (r34).** `Camiones.gs` lee los informes de urbanismo ya
archivados y deja una fila por camión y por informe en `OPE_Camiones_Urbanismo`. Siete comprobaciones en `pdf/`, con
Drive y Smartsheet de mentira: una fila por camión con su «m³ del día», mirar no escribe, la primera carga salta los
`PRUEBA-`, la segunda no hace nada, un informe corregido (`-r2`) reemplaza sus filas, y el mismo camión escrito distinto
otro día lleva la misma «Clave del camión».

**`t49` y `t49b` (1-oct-2026, v106).** Dos cosas que salieron de la primera corrida en obra con la v105:

- **Una fila agregada en campo no daba porcentaje.** Al inspector se le ocultaba la casilla del total, así que
  escribía lo hecho y el % se quedaba en «—». Ahora se llena «hechas de total», como las de conteo (`t49`, 1 a 6).
- **Tomar la foto ahí mismo.** En los Android recientes el selector de fotos ya no ofrece la cámara. Cada bloque de
  fotos tiene un botón «📷 Tomar foto» (`capture="environment"`) y conserva la galería. En inspección la foto cae en el
  primer hueco libre del hito (`t49`, 7 a 9); en servicios, SHA y urbanismo entra al bloque (`t49b`, seis
  comprobaciones en cada página; servicios y SHA admiten 3 fotos por bloque y urbanismo 6).

**`headless.py`: correr tandas sin ventana.** Con el navegador oculto Chrome estrangula los temporizadores y las
tandas de fotos tardan diez minutos o no terminan. `python3 qc/banco/headless.py <banco> inspeccion:t21,t24
urbanismo:t46` corre cada tanda en un Chrome sin ventana, con perfil limpio y tiempo virtual. Dos límites: el ancho
mínimo ahí es 500 px (la maqueta a 375 y 320 se mira en un navegador de verdad), y las tandas que esperan al relevo
«caído» o «lento» (`t32`, `t33`, `t36`, `t37`, `t38`) no terminan con tiempo virtual: esas se corren a la vista.

Regresión del 1-oct sobre la v106: `t21` a `t33`, `t35`, `t39`, `t42`, `t43`, `t47` y `t49` en inspección; `t19`,
`t37`, `t46` y `t49b` en urbanismo; `t36`, `t40` y `t49b` en servicios; `t38`, `t41` y `t49b` en SHA. Todas en verde.

**`t50` y `t50relevo` (1-oct-2026, v107 y relevo r35): que el N/A deje de usarse para «todavía no está hecho».** Dos
días seguidos llegaron informes con N/A en lo pendiente, y esas filas salen del avance. Catorce comprobaciones en
`inspeccion.html`:

- la casilla del conteo se llama «total» (antes «hay», que se leía como «cuántas hay puestas»);
- un cero escrito da 0 % aunque falte el total, en el conteo, en las cantidades y en las filas agregadas; vacío no es
  cero, y «3 puestas» sin total sigue sin porcentaje;
- al marcar N/A la fila dice debajo qué significa, y se quita al desmarcar;
- con tres N/A o más se pregunta una vez antes de enviar, y «Cancelar» no envía; con dos no pregunta;
- el borrador conserva el cero y las notas caben a 375 px.

Del lado del relevo (`pdf/t50relevo.js`, seis comprobaciones): `_pdfPctFila` y `_pct` dan 0 con el cero escrito, N/A
sigue fuera y lo demás no cambia. Regresión sobre la v107: `t21` a `t31`, `t35`, `t39`, `t42`, `t43`, `t47`, `t49` y
`t50` en inspección; `t19`, `t46` y `t49b` en urbanismo; `t40` y `t49b` en servicios; `t41` y `t49b` en SHA; y `t32` y
`t33` a la vista. Todas en verde.

**v108 (1-oct-2026): la leyenda del N/A al inicio de cada hito.** Pedido de Planificación: que lo diga antes de la
primera subpartida, no solo al marcar. `t50` pasa a 16 comprobaciones (15 y 16: cada hito abre con la leyenda, cabe a
375 px y no sale en el PDF). Regresión: `t21` a `t31`, `t35`, `t39`, `t42`, `t43` (a 320), `t47`, `t49` y `t50`, en verde.

**v109 (1-oct-2026): «Placa o N° del camión» en urbanismo.** Tres camiones no tienen placa y se anotan con su número
de identificación. Cambia el rótulo de la casilla y el aviso de repetido («Ese camión ya está en esta lista»); las tres
casillas quedan alineadas abajo. `t46` pasa a 13 comprobaciones; `t46`, `t19` y `t49b` de urbanismo en verde, y `t46` a
375 px a la vista.

**`t51consolidado` (1-oct-2026), el PDF único por torre y día (relevo r36).** `Consolidado.gs` junta los informes de
obra de una torre con la misma fecha en un solo PDF. Trece comprobaciones en `pdf/`, con Drive y registro de mentira e
informes inventados: qué entra en un grupo (sin `PRUEBA-`, sin «Estructura», sin otros tipos, sin lo viejo); mirar no
escribe; el primero se crea con su huella; el documento trae una sección por apartamento y una firma por inspector; sin
cambios no hace nada (aunque pierda su memoria); un tercer apartamento o una corrección `-r2` lo reemplazan en sitio;
el de torre completa va primero; con un solo informe no hay consolidado; uno recién llegado espera a la vuelta
siguiente; con más de 60 fotos va sin fotografías; y el mismo residente escrito distinto firma una sola vez.

**`t52` (2-oct-2026, v110): «qué incluye» cada subpartida, al tocar el «?» de la fila.** Una línea corta por
subpartida, que solo se ve si alguien toca el «?» junto al nombre. Los textos vienen de la lista v2 (`AYUDA_JS` en
`comun/lista_v2.py`, generado). Diez comprobaciones en `inspeccion.html`: las 89 tienen su línea, sin montos; cada
fila a la vista trae su «?» con la ayuda cerrada; tocar abre y volver a tocar cierra; el texto es el de su código; no
viaja en los datos ni cambia el avance; las filas agregadas no lo llevan; el «?» y las ayudas abiertas caben en la
pantalla; no sale en el PDF; y un borrador reabre con las ayudas cerradas. En verde a 375 y a 320 px en navegador, y
la regresión (`t21` a `t31`, `t35`, `t39`, `t42`, `t43`, `t47`, `t49`, `t50`) también.

**v111 (2-oct-2026): el N/A, igual en los formularios que lo usan como respuesta.** Dos cosas:

- **Inspección:** la leyenda de cada hito y la nota de cada fila nombraban «No iniciado», un botón que solo existe en
  las filas de estado. Ahora nombran lo que ese hito (y esa fila) tiene: «No iniciado», «No» o escribir 0. La leyenda
  se rehace al cambiar de ámbito. `t50` pasa a 19 comprobaciones.
- **Servicios y SHA:** la misma leyenda al inicio de cada bloque y la misma nota al marcar N/A, con sus palabras
  («no aplica en esta torre» / «a esta contratista»; lo que falta es NO). Vive en el motor (`TXT_NA` en
  `construir-servicios.py`) y cada derivado cambia los textos. **Urbanismo no las lleva**: ahí el N/A es de la calidad,
  no saca la partida del avance y no hay un «NO» que ofrecer. `t53` (6 en servicios, 6 en SHA, 2 en urbanismo).

No se generalizó, y por qué: el **cero escrito** (los otros tres no calculan % desde piezas contadas), la **pregunta al
enviar con tres N/A** (en servicios el N/A es legítimo y frecuente: una torre sin red de gas) y el **«?» de cada fila**
(no hay de dónde sacar una línea por ítem de servicios, SHA o urbanismo sin inventarla). Regresión completa de los
cuatro formularios, en verde; `t50` y `t53` también a 375 px en navegador.

**v112 (2-oct-2026): la leyenda del N/A, plegable.** La primera vez sale abierta; «Entendido · ocultar» la pliega en
todos los hitos o bloques a una pastilla de una línea («ⓘ ¿Cuándo va N/A?») y se recuerda en el teléfono
(`garmel_leyenda_na`, la misma clave en inspección, servicios y SHA). La nota al marcar N/A sigue saliendo aunque esté
plegada. `t50` pasa a 23 comprobaciones y `t53` a 8 en servicios y SHA.

**Teléfono y escritorio.** La regresión de los cuatro formularios se corrió dos veces con `headless.py`: a 500 px (29
tandas, en verde) y a 1280 px (`--ancho 1280 --alto 900`; 23 tandas). A 1280 solo falla `t25` punto 17, que mide que
los botones tengan 44 px para el dedo: en escritorio miden 25 px a propósito, se usan con el ratón. A 375 px en
navegador: `t50`, `t52` y `t53` en verde. Capturas de escritorio de inspección (leyenda abierta y plegada, «?» abierto,
nota del N/A) y de servicios, revisadas a ojo: la nota del N/A se centró bajo los botones en escritorio.

**`t54` y `t54relevo` (2-oct-2026, v113 y relevo r37): «Desmontaje de obstáculos» en SHA.** Pedido de Planificación:
una cuarta pestaña con cinco filas fijas (torres grúa, chatarra, camiones y maquinaria averiados, ascensores de carga y
andamios); en cada una lo retirado a la fecha (acumulado) y lo que queda, y la chatarra en % a criterio del inspector.

- `t54` (9, en `sha.html`): las cinco filas y sus casillas; solo números y % hasta 100; lo que viaja; guardar y reabrir;
  el envío con su foto `obst-1`; la visita siguiente trae las cantidades (no la observación); cambiar de torre las
  suelta, salvo que el inspector ya las haya tocado; un informe solo con obstáculos no está vacío; y las cuatro
  pestañas caben. **Hace un envío: se corre en navegador, no con `headless.py`.**
- `t54relevo` (4, en `pdf/`): la sección del PDF con las filas que tienen dato; sin dato no sale; las filas de
  Smartsheet (el % de las que se cuentan sale de las dos cantidades); y el empuje no hace nada si la hoja no existe.

**`t55` (2-oct-2026, v113): la foto desde cada partida, en urbanismo.** Una inspectora avisó que en «Desmalezamiento»
faltaba dónde poner fotos: las fotos de urbanismo son de la sección y su bloque queda al final, lejos de la primera
partida. Cada partida tiene ahora «📷 Foto de esta partida»; la foto entra al bloque de la sección con el nombre de la
partida como descripción y la fila lo confirma. Ocho comprobaciones. `t49b` se ajustó para mirar solo los botones de
bloque. **No se llevó a servicios ni a SHA**: ahí el tope es de 3 fotos por bloque y un botón por ítem lo agotaría al
tercero; ni a inspección de obra, donde las fotos son del hito y el botón ya está en el hito.

Regresión sobre la v113: las 29 tandas de siempre a 500 px y diez a 1280 px, en verde (una pasada de `t49b` en SHA
falló por tiempos y al repetirla pasó); `t54` y `t55` también a 375 px en navegador.

**`t56`, `t57` y `t57relevo` (2-oct-2026, v114 y relevo r38): lo que pide el informe semanal de las coordinaciones.**
Planificación pidió que el informe de cada coordinación salga de los informes de campo. La plantilla de ese informe
tiene «Actividades en ejecución» y «Observaciones técnicas»; el formulario solo tenía lo segundo. Y la matriz de SHA
tiene «Solución» y «Responsable del correctivo», que tampoco estaban.

- `t56` (14, en `inspeccion.html`): la tarjeta «Actividades en ejecución» antes de las observaciones generales, con la
  frase que dice qué va en cada una; lo escrito viaja en los datos; el apartamento siguiente de la misma torre y el
  mismo día lo trae propuesto y lo avisa; lo propuesto no cuenta como contenido (no siembra fichas vacías); tocarlo lo
  hace propio; cambiar de torre o de fecha lo retira, salvo que el inspector lo haya escrito a mano; el borrador lo
  conserva; «Limpiar todo» lo quita; y la huella de un informe enviado antes de que existiera el campo no cambia.
- `t57` (8 en `sha.html`, 4 en `urbanismo.html`, 1 en `servicios.html`): en SHA, los cuatro campos del hallazgo en el
  orden de la matriz, con rótulo y pista, no obligatorios, que se guardan, se reabren y vuelven en la visita siguiente;
  en urbanismo, «Actividades en ejecución» antes de la observación general; servicios no lleva campo nuevo (ahí lo que
  se está haciendo se escribe en la observación de cada servicio) y SHA tampoco lleva actividades.
- `t57relevo` (11, en `pdf/`, con `Particion.gs`, `Sha.gs`, `Urbanismo.gs` y `Consolidado.gs` cargados): la fila de
  actividades en el PDF de obra y en el de urbanismo; en el consolidado del día sale una sola vez aunque venga repetida
  en cada apartamento; solución y responsable en el PDF de SHA y en la hoja de hallazgos; `_hallazgoDe` separa los
  cuatro campos en cualquier orden y sigue leyendo los informes viejos; y las plantillas de las hojas.

A 375 px en navegador: `t56` 14/14, `t57` 8/8 en SHA y 4/4 en urbanismo. Regresión sin ventana a 500 px: las tandas
que fallan (`t1`, `t2`, `t11` de urbanismo, `t10` de SHA por el botón «Entendido» de 26 px, y las que envían) fallan
igual con la v113: no son de este cambio.

**`t58lunes` (2-oct-2026, relevo r39): el resumen de los lunes.** En `pdf/`, con `ResumenLunes.gs` cargado; 12
comprobaciones con filas inventadas (no toca Smartsheet ni Drive): la fecha del lunes al que corresponde; el estatus
reconocido por su texto; de un tablero, lo abierto y lo cerrado en siete días; el orden (vencido, prioridad, estatus,
antigüedad); el documento sin emoji y con el vencido marcado; el tablero vacío dicho en palabras; y en SHA, cada
hallazgo una vez con su último estatus, desde cuándo está abierto, su solución y su responsable, los recaudos en NO de
la última visita a cada torre, las incidencias sin cerrar y el cuadro por contratista.

**`t59` (2-oct-2026, v115): la vista previa del informe.** Pedido de un inspector de urbanismo: ver el PDF antes de
enviarlo. La plantilla es **la misma del relevo**: `vista-previa.js` se genera desde su `PDF.gs` y su `Logos.gs`
(`Garmel/implementacion/generar-vista-previa.py`; `publicar.sh` lo regenera si el repositorio está al lado), se carga
la primera vez que se pide y queda en la copia local (`sw.js`). Se arma en el teléfono con el mismo sobre que viajaría,
sin enviar nada. Sirve en servicios, SHA y urbanismo; inspección de obra no la lleva, porque su PDF incluye el avance
según el presupuesto, que sale de pesos que no pueden estar en este repositorio.

Se corre en `urbanismo.html`, `servicios.html` y `sha.html` (15 comprobaciones en teléfono, 14 en escritorio): el botón
detrás del «⋯»; en blanco avisa y no abre; la hoja con el título, el número y lo escrito; la foto tomada; **ningún
envío**; el aviso si falta algo de la cabecera; la hoja entera a lo ancho, dibujada a 794 px y achicada (no
reacomodada), en el mismo modo que el conversor de Google (`BackCompat`: con `srcdoc` las tablas salían con la letra a
la mitad); «Ampliar» y «Ajustar»; «Cerrar» deja el formulario como estaba; «👁 Ver» en cada informe sin enviar del
panel, con sus fotos; y un informe enviado no lo ofrece. **El punto 9 lee fotos de IndexedDB: se corre en navegador**
(sin ventana da «fotos 0»). En navegador: 15/15 a 375 px en los tres, 14/14 a 1280 px.


**`t60torres` (2-oct-2026, relevo r41).** En `pdf/`, con `Codigo.gs` y `Sha.gs` cargados; 4 comprobaciones de
`_torresDeSha`: una torre, varias (la del informe primero, sin repetir), las de Simón Bolívar, y que «Toda la zona» o
una manzana no metan nada que no sea una torre del padrón.

**`t61`, `t62` y `t61varias` (2-oct-2026, v116 y relevo r42): minutas de campo y los informes de varias torres.**

- **Minutas de campo.** Un bloque de fotos más en los cuatro formularios (`PA-116`): la minuta firmada en la visita,
  hoja por hoja, hasta 6. Viaja como `minutas-N`, se archiva con el informe y el relevo la imprime como anexo del PDF.
  Una hoja se guarda a 1600 px (una foto de obra, a 1280) para que se pueda leer.
  - `t61` (11, en `servicios.html`, `sha.html` y `urbanismo.html`): la tarjeta antes de la observación general; el
    tamaño de la hoja; lo que viaja en los datos y en el sobre; el tope de 6 aunque las fotos de sección sean 3; el
    anexo en la vista previa; «Nuevo» lo vacía; guardar y reabrir; y que cabe.
  - `t62` (9, en `inspeccion.html`): lo mismo en obra, donde el bloque es fijo, al final del informe, y usa las
    funciones de las fotos de los hitos con el grupo `minutas`.
- **Varias torres.** Un informe de varias torres se archiva una vez, en la principal. Ahora en las otras queda un
  acceso directo al PDF, y su «visita anterior» lo encuentra: el teléfono lo anota en la memoria de cada torre (`t61`,
  puntos 10 y 11) y el relevo lo marca en sus propiedades (`t61varias`).
  - `t61varias` (14, en `pdf/`, con `Codigo.gs`, `Sha.gs`, `Urbanismo.gs`, `Consolidado.gs`, `Particion.gs` y
    `VariasTorres.gs`, contra un Drive de mentira): los accesos directos y las marcas, sin duplicar al repetir; el
    historial de la otra torre trae el compartido, salvo que tenga uno propio más nuevo; un reenvío actualiza la marca;
    urbanismo por manzana; y el anexo de minutas en los cuatro PDF, después de las firmas y en página nueva.

Los puntos que leen IndexedDB (`t61` 8, `t62` 6) y `t61` en SHA y urbanismo se corren en navegador: sin ventana la foto
de 3000 px no termina de reducirse. En navegador a 375 px: `t61` 11/11 en los tres y `t62` 9/9. `t49` 7a pasó a contar
solo los botones de cámara de los hitos.


**`t58lunes` ampliada (3-oct-2026, relevo r43).** Pasó de 12 a 17 comprobaciones: el reparto de los puntos de obra por
sector (por la columna «Sector» o por el prefijo de las torres; el de dos sectores va a los dos; lo que no tiene sector,
en un cuadro aparte en cada uno) y el resumen de urbanismo armado desde sus informes de los últimos siete días (calidad
regular o mala, observaciones sin repetir la de la sección, y el aviso cuando no llegó ningún informe).

**`t63` (5-oct-2026, v129): «Borrar los enviados» pregunta antes y no se lleva lo que falta reenviar.** Planificación
preguntó qué hacía el botón. En servicios, SHA y urbanismo borraba sin preguntar, y en los cuatro formularios se llevaba
también el informe «editado después de enviarlo», cuya corrección vive solo en el teléfono hasta que se reenvía. Ahora
pregunta en los cuatro, deja ese informe en la lista y lo dice. Se corre en los cuatro: 5 comprobaciones en inspección
y 6 en los demás, en verde con `headless.py`.

**`t64` (6-oct-2026, v132): lo que pidió la Coordinación de inspección de Simón Bolívar.** Once comprobaciones en
`inspeccion.html`: la casilla de % exacto solo en las filas de cinco estados (no en las de Sí / No); escribir 60 da 60 % con
el mismo dato que los botones (100 proyectada, 60 ejecutada) y ningún botón encendido; tocar un botón pone su número en la
casilla; vaciarla deja la fila sin marcar; 150 se recorta a 100; el rótulo dice «Sector» y las opciones nombran los
sectores; en torre la ayuda de «Cerámica en paredes» no habla de la cocina y en apartamento sí (`body.amb-torre`);
`_rutaDrive()` dice sector › Torres › torre › Informe; la casilla es solo de pantalla. **La lista v2.1** (ADR-0043) sube
las cuentas: 91 subpartidas (`t52`), 51 filas de apartamento (`t31`, `t42`, `t47`), 57 de torre (`t47`), 9 en puertas (`t42`);
el relevo falso (`relevo-falso.py`) devuelve la lista de 91. `t65relevo` (nueve comprobaciones) cubre el relevo r46:
observaciones por hito, avance por piso, sin fila de convenio.

**`t66` (6-oct-2026, v133): el modo oficina (PA-124, ADR-0044).** Diez comprobaciones en `inspeccion.html` con el relevo
falso, que desde esta versión contesta `oficina-lista` y `oficina-abrir` con lo que recibió: en el teléfono (500 px) el panel
no se ve y forzando `_ES_OFICINA` sí; un informe enviado «desde campo» aparece en la lista de la torre como Preliminar con su
número; abrirlo carga el mismo número, el 50 % de frisos, la observación del hito, la general y la foto (que vuelve de
IndexedDB, por eso se espera con `hasta`), marcado como abierto desde el archivo; en la lista local queda enviado, con la
marca de oficina y las fotos aparte (no vacías); «Cerrar versión definitiva» deja `{por, fecha, desde}` y abre el envío de
siempre; el reenvío dice que es la definitiva y la lista lo muestra como Definitiva, revisión 2, una sola vez; el relevo
guardó la revisión 2 con la observación limpia y la misma foto; un informe nuevo no es definitivo.

**`t69` (7-oct-2026, v139): copiar las mediciones de otro apartamento o de otra torre parecida.** Diez comprobaciones en
`inspeccion.html` contra el relevo falso (`copiar-fuentes`, `copiar-abrir`): el botón aparece con torre, piso y apartamento y nada
medido; el panel lista el apartamento guardado en el teléfono; copiar llena las filas y las marca «≈ Copiado de T-01 · Piso 02 apto A1»
con «Confirmado en sitio»; el dato lleva `copiadoDe` y cada fila copiada el número de origen; **no se puede enviar con filas
copiadas sin confirmar** (avisa y no manda nada); guardar y reabrir conserva las marcas; confirmar quita la marca y la fila sigue
contando como copiada; con todas confirmadas sí envía; en torre, el panel ofrece la torre de la misma contratista; con algo medido el
botón no se ofrece; y (v140, comprobación 11) las torres de otra contratista solo aparecen al tocar «Buscar también en las
demás torres del sector», bajo su propio rótulo. En el relevo, `t70relevo` (6) prueba la fila «Mediciones a partir de» del PDF y `Copiar.gs`.

**`t71` (7-oct-2026, v140): reenviar un informe ya enviado sin cambios avisa.** Tres comprobaciones en `inspeccion.html`: un informe
nuevo se envía sin preguntar por cambios; reabierto sin tocar nada, Enviar avisa «no cambió nada desde entonces … revisión idéntica» y
con Cancelar no manda nada; con un cambio no pregunta eso y envía la revisión. Lo pidió Diego en la reunión del 7-oct al abrir un
informe en la computadora solo para verlo.

**`t68` (7-oct-2026, v137): el desplegable de torre sale del maestro, no de la plantilla.** Seis comprobaciones en
`inspeccion.html`. Lo vio Diego el 7-oct: la T-43 de Simón Rodríguez entró al maestro (`comun/maestros.py`) el 4-oct y la tabla
`TORRES` la tenía, pero el `<select>` de torre venía escrito a mano desde la plantilla de agosto y nadie lo actualizaba, así que
no se podía elegir. Servicios y SHA no tenían el problema: ahí las opciones se arman desde `TORRES_DATA`. Comprueba que las
opciones son exactamente las torres del maestro, que la T-43 está, que con el sector Simón Rodríguez se ve (y la T-45 no), que
elegirla llena la empresa y el número de informe, y que con Ezequiel Zamora se esconde y la torre se suelta.

**`t67` (6-oct-2026, v135): el orden en pantalla del apartamento sigue la secuencia de obra (PA-121).** Siete comprobaciones en
`inspeccion.html`: en apartamento los bloques visibles van tabiquería → instalaciones → accesorios sanitarios → accesorios
eléctricos → puertas → ventanas → acabados → pruebas; «Instalación de servicios» agrupa por disciplina con rótulo (Sanitarias:
aguas blancas, desagüe, CP, TR · Eléctricas · Gas) y los accesorios eléctricos separan Voz y data; la numeración sigue lo que se
ve; lo marcado en el centro de piso se guarda en el índice de 3.20 (el dato no se mueve); en torre vuelve el orden de la lista sin
rótulos; al abrir un borrador de apartamento vuelve la secuencia con el dato en su fila.

**`t66` se corre en navegador real**, como `t59` #9, `t61` y `t62` #6: las fotos vuelven de IndexedDB y sin ventana (tiempo
virtual) la tanda no termina. En el navegador de prueba del 6-oct dio 9/10 a 1024 px (el «rojo» es la comprobación 1, que
espera 500 px: ahí el panel se ve, que es lo correcto). Las otras nueve en verde, foto incluida.


**QC end to end del 7-oct-2026 sobre la v140 → v141.** Lo que cambió entre el 6 y el 7-oct (v132 a v140) se recorrió a
mano en el navegador integrado a 375 px y a 1280 px, y se corrió la regresión completa: sin ventana a 500 px, 25 tandas
de inspección (`t21` a `t31`, `t35`, `t39`, `t42`, `t43`, `t47`, `t49`, `t50`, `t52`, `t56`, `t63`, `t64`, `t67`, `t68`,
`t71`), 4 de servicios, 4 de SHA y 6 de urbanismo; en navegador, las que necesitan ventana (`t66`, `t69`, `t71`, `t62`,
`t24`, `t32`, `t33` en obra; `t49b`, `t59`, `t61`, `t37` en urbanismo; `t54`, `t61`, `t38`, `t12` en SHA; `t61`, `t36` en
servicios). Lo visto a mano: el botón «Instalar en el teléfono» del menú solo sale cuando llega `beforeinstallprompt`;
«Sector» con los tres nombres y la T-43 en el desplegable; el orden de obra del apartamento con los rótulos Sanitarias ·
Eléctricas · Gas · Voz y data; 3.20 y 3.21 debajo del desagüe y «Puertas de servicios» solo en torre; la casilla de %
exacto en 13 filas de estado y en ninguna de Sí / No; copiar de otro apartamento (de este teléfono y del archivo), el
bloqueo del envío sin confirmar, el toast «Quedó en Drive › sector › Torres › torre › Informe», el aviso del reenvío sin
cambios con Cancelar; y el modo oficina: pide la torre, con el relevo caído dice que no hay conexión con la oficina,
abre la revisión 2 y la cierra como definitiva con la fecha local.

- **Cuatro rojos eran tandas atrasadas, no el formulario**: `t21` 5 y `t22` 1 contaban 19 y 56 filas (desde la v134 el
  hito 3 tiene 21 y la torre 58); `t39` 4 buscaba «dos zonas» (desde la v132 el aviso dice «dos sectores»); y `t35` 18
  escribía el 150 % en la primera casilla `.pct-man` del DOM, que en apartamento es una fila oculta de torre, y esa fila
  quedaba en el borrador como `fueraDeAmbito` y la 18 la contaba como traíble. Las cuatro se ajustaron. `t49b` 3 de
  urbanismo falló sin ventana por tiempos de la foto y pasó en navegador.
- **Un detalle de verdad, arreglado en la v141**: al copiar las mediciones de otro apartamento, la oferta de la visita
  anterior («¿Usar los totales de otro apartamento de esta torre?») seguía en pantalla encima de las filas copiadas.
  Tocarla no hacía nada (ya hay mediciones), pero confundía. `_copiarAplicar` la retira; `t69` suma la 3b (12 en total).
- Las tandas viejas del botón «Inicio» (`t7a`, `t7c`, `t7d`) no corren sin ventana: son de navegador, en la página que
  dice cada una.

**`t72` y `t73` (7-oct-2026, v142): coherencia entre los cuatro formularios.** Francisco vio que en la computadora el
formulario de obra no tenía «🏠 Inicio» (los otros tres sí): `.hdr-inicio` estaba en `display:none` y solo lo encendía el
media query del teléfono. Ahora sale siempre, a la derecha del título (`t72`, 3 comprobaciones, a 1280 y a 500 px). Y lo que
la v140 hizo en inspección (reenviar sin cambios avisa) tenía su equivalente pendiente en el motor de servicios: `guardar`
marcaba «editado después» a todo informe enviado que se guardara, aunque no cambiara nada, e «Inicio» guarda al salir; así
que abrir uno solo para verlo lo dejaba con «🔁 Reenviar» y fuera de «Borrar los enviados». Ahora `guardar` compara la huella
(`_huellaInforme`, claves ordenadas, sin hora de guardado ni marcas de envío) y no toca el informe si es igual (`t73`, 5
comprobaciones en servicios, SHA y urbanismo). No se replican a los otros tres el modo oficina ni «copiar mediciones»: son
decisiones de alcance, no detalles.

**v143 (7-oct-2026): las quince mejoras del QC de UX** (`qc/UX-2026-10-07.md`, sección «Hecho en la v143»). Regresión completa:
sin ventana a 500 px las 26 tandas de inspección más `t72`, 5 de servicios, 5 de SHA y 7 de urbanismo, y a 1280 px `t72`, `t64` y
`t67`; en navegador a 375 px `t66`, `t69`, `t71`, `t62`, `t24`, `t32`, `t33` (obra), `t12`, `t54`, `t61`, `t38` (SHA), `t11`,
`t59`, `t61`, `t37` (urbanismo), `t61` y `t36` (servicios). Tandas ajustadas por lo que cambió a propósito: el orden de los
sectores (`t6`, `t12`, `t17`, `t18`, `t61` eligen el sector por valor), el título de la tarjeta de la visita anterior (`t26`, `t28`,
`t35`) y el primer hito abierto (`t49`, `t50` solo abren lo que está cerrado; la fila 0 de cerramientos es de torre y en
apartamento no se ve, por eso antes «abrir» tocaba la cabecera). `t2` de urbanismo y `t6` de SHA son tandas viejas con
comprobaciones atrasadas y dependientes del estado: contra la v142 original dan 24/36 y 26/30, contra la v143 25/36 y 28/30.
