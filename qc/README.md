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
