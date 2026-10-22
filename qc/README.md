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

**`t74`, `t75` y `t76` (7-oct-2026, v144 y relevo r50): el modo oficina y «copiar de otra torre» en servicios, SHA y
urbanismo; y un informe en blanco ya no se guarda en obra.** Pedido de Francisco: lo que obra tiene desde la v133 y la
v139, en los otros tres. El código vive en `comun/oficina_copiar_motor.js` y entra al final del motor de servicios: envuelve
funciones del motor (datosDelFormulario, guardar, cargarInforme, vaciarFormulario, enviar, enviarSolo, tocado, marcar,
ofrecerHistorial) y reutiliza `traerHistorial` para volcar la fuente —se inyecta como estado de esta torre, se trae y se
restaura—, así SHA y urbanismo lo heredan con sus propios campos. El relevo r50 atiende `oficina-lista`, `oficina-abrir`,
`copiar-fuentes` y `copiar-abrir` por `tipo` y echa el tipo de vuelta; el formulario lo comprueba y, contra un relevo viejo,
dice que hace falta el r50 en vez de mezclar informes de obra. Los tres PDF dicen «Versión».

- `t74` (10, en los tres, con `?oficina=1` o a 1280 px): el panel; un informe de campo con foto enviado al relevo falso;
  la lista lo trae como Preliminar; abrirlo carga número, respuesta, observación y foto, marcado como abierto desde el
  archivo; en la lista local queda enviado, con la marca de oficina y sin «editado después»; cerrar la definitiva deja
  {por, fecha, desde}, reenvía la revisión 2 con la observación limpia y la lista lo muestra como Definitiva; un informe
  nuevo no es definitivo. El relevo falso contesta por tipo.
- `t75` (10, en los tres, a 375 px): el botón con la torre elegida y nada contestado; el panel lista la fuente de este
  teléfono; copiar marca «≈ copiado de T-01 · tocar para confirmar»; el dato lleva copiadoDe y cada respuesta el número de
  origen; no se envía con copiadas sin confirmar; guardar y reabrir conserva las marcas; tocar la etiqueta confirma; con
  todas confirmadas envía; la otra contratista solo al pedir «las demás torres del sector» (en urbanismo, las manzanas del
  sector); con algo contestado no se ofrece.
- `t76` (6, en `inspeccion.html`, sin ventana): cambiar de torre cuatro veces con el autoguardado no deja ningún borrador
  (lo vio la coordinación desde la laptop: un borrador en blanco por torre, uno cada 2-3 s); «Guardar» a mano avisa; con
  algo medido sí guarda; un borrador que ya existía y se vació se conserva; «Informes» ofrece «Quitar los N borradores en
  blanco». `t42` y `t43` siembran a mano el borrador viejo que antes creaban guardando en blanco.
- Lado del relevo: `t70relevo` acepta r50; `t54relevo`, `t57relevo` y `t65relevo` se corren con `Oficina.gs` cargado
  (desde el r47 `_versionDelInforme` vive ahí). Los cuatro en verde contra el r50.

**Envío real del 7-oct-2026 (v145, relevo r50 desplegado como Versión 33).** Desde el Chrome del usuario, con la clave
de producción y `?prueba=1`, en los tres formularios: un informe PRUEBA- con una respuesta, una observación y una foto se
envió y el relevo contestó la carpeta de Drive (`… › T-01 › Servicios`, `… › T-01 › SHA`, `… › Urbanismo › M-1 L1`); el
panel de oficina lo listó como Preliminar junto a los informes reales de la torre, lo abrió con su foto y su observación,
y «Cerrar versión definitiva» lo reenvió como revisión 2 (la lista lo mostró «Definitiva · Prueba QC rev. 2»); y desde la
torre o manzana vecina «Copiar de otra…» lo encontró en el archivo (`copiar-fuentes`) y volcó la respuesta marcada
(`copiar-abrir`). Quedan en Drive y en el registro `PRUEBA-SRV-EZ-T01-261007-HE`, `PRUEBA-SHA-EZ-T01-261007-AS` y
`PRUEBA-URB-EZ-M1L1-261007-GB`, con dos revisiones cada uno: se limpian con `enviarPruebasAPapelera` y
`borrarPruebasSmartsheet` desde el editor de Apps Script. Nota de tiempos: contra el relevo real, abrir con foto y cerrar
la definitiva tarda más de 45 s en urbanismo, así que esa prueba va en pasos cortos.

**v148 (8-oct-2026, cambio 177 y relevo r52): sin cuentas mientras los presupuestos se actualizan.** Decisión de la
Gerencia Técnica en la reunión del 8-oct (ADR-0048 del repositorio Garmel): ni el teléfono ni el PDF hacen cuentas
hasta tener los presupuestos aprobados. En pantalla se esconden el total «% AVANCE GENERAL», el resumen por hito y el
«% Avance Hito» de cada hito (siguen en el DOM: la lógica los lee; `t22` pasó a leerlos con `textContent`, porque
`innerText` de un elemento oculto devuelve vacío). En el PDF, `PDF_SIN_CUENTAS = true` apaga el recuadro de totales,
el promedio de cada hito y la columna «Peso», y pone en su lugar la nota «REGISTRO DE LO OBSERVADO». Queda lo que el
inspector pone fila por fila, y el % escrito a mano del modo por hitos («Avance declarado»). `t77relevo` (9) prueba
lo que se ve hoy, incluido que con la variable en `false` vuelven los dos totales del r51; `t72relevo` enciende la
variable para probar ese código dormido. Smartsheet sigue recibiendo el ponderado: el retroactivo no pierde nada.

**t78 (13-oct-2026, v151): la página «Compilado de la semana» (`compilado.html`).** El relevo falso contesta
`compilado-semana` con una semana de prueba (tres apartamentos en dos pisos, un informe de torre con un avance declarado,
cuatro notas, una con foto) y `compilado-guardar` anota el envío en `envios.jsonl`. La tanda prueba el pedido (sector,
torres filtradas, el jueves anterior por defecto, sin clave, clave mala), lo que se pinta (título, matriz con n/i, — y %,
áreas comunes con el declarado marcado, notas, la nota de los porcentajes, el membrete), el envío (sin texto no manda; con
texto archiva con quién valida y borra el borrador local; la segunda vez «actualiza»), una torre sin informe de torre y
que ningún control baje de 44 px. Se corre como `compilado:t78`; `preparar.py` copia también `compilado.html`.

**t79, t79b y t80 (13-oct-2026, v153): lo que podía fallar en el proceso del compilado**, pedido por Stephanie antes de avisar
al grupo. `t79` (compilado): el texto del miércoles sigue el jueves (el borrador va por la semana, `desde`, y no por el día del
envío: con `hasta` se perdía), emojis, comillas y saltos de línea intactos en el envío, el archivo nombrado por la semana y con
PRUEBA en modo de prueba, el relevo caído al generar y al enviar (aviso, botón habilitado, lo escrito se conserva), fechas al revés.
`t79b` (tras recargar, en un navegador de verdad): un nombre recordado que ya no está en la lista deja «— Seleccione —». `t80`
(index, inspeccion, servicios, sha, urbanismo): la tarjeta y los botones «Compilado» llevan a `compilado.html` con el modo de
prueba y guardan antes. Lo que no se pudo probar con datos reales: dos informes del mismo apartamento en la misma semana (ninguna
torre lo tiene todavía); la regla es la fecha del número y luego la revisión.

**QC de experiencia de usuario del compilado (13-oct-2026, v154), pedido por Stephanie: diez comprobaciones a 375 × 812 y
320 × 568 en un navegador de verdad contra el relevo falso, más una impresión a PDF con Chrome sin ventana.** Lo que falló y se
corrigió: (1) el mensaje de espera quedaba debajo del botón, fuera de la pantalla del teléfono, y no daba señales de vida (ahora
se desplaza a la vista y cuenta los segundos); (2) al pintar, la página saltaba 120 px porque el aviso de espera se escondía
después de calcular el salto (ahora se esconde antes y queda en el inicio del resultado); (3) la matriz en el teléfono perdía el
apartamento al deslizar (columna fija, con una pista de «deslice»); (4) «n/i» en naranja por todas partes y con contraste 2,5:1
(ahora gris 4,8:1 y chico); (5) el inspector con su CIV ensanchaba la matriz (nombre corto; el completo va en membrete y notas);
(6) las notas sin texto ocupaban una tarjeta cada una (van juntas en una línea con sus enlaces); (7) no se sabía si lo escrito
estaba guardado ni si tras enviar había que reenviar («Borrador guardado ✓ hh:mm»; el botón pasa a «Enviar de nuevo» y avisa
cuando hay cambios sin archivar); (8) recargar obligaba a esperar otra vez (la última semana generada se repinta con aviso y con
lo escrito); (9) al imprimir salía la pista de deslizar (fuera). Verde sin cambios: nada por debajo de 44 px, ningún desborde
horizontal a 375 ni a 320, y la impresión a PDF (dos páginas, con los textos de la validación y sin botones ni cabecera).

**Tercera ronda de experiencia y ronda del circuito completo (13-oct-2026, v155 y v156).** Experiencia, en el navegador a 375 px:
el rótulo del piso también queda fijo al deslizar la matriz (pedido de Stephanie), los cuadros de la validación crecen con el texto
(en el teléfono no se pueden estirar), el «guardado ✓» se ve arriba de los cuadros, una torre sin informes lo dice en un aviso claro
y no solo con tablas vacías, y la fecha de «Generado» va en el formato de la casa. Circuito completo, con el relevo real en modo de
prueba (r56): el pedido de la semana lleva `prueba: true` y el relevo incluye los informes `PRUEBA-`; un informe de prueba con foto
entró por `doPost`, el compilado lo mostró junto con el informe de torre real del día, el envío dejó JSON, PDF y una fila en
`OPE_Compilados_Obra`, y `mirarCompiladosValidados` tomó las tres líneas de la coordinadora para el borrador. Hallazgo corregido por
el camino (r57): un compilado validado después de que el borrador del jueves ya se armó no lo rehacía; ahora la fecha de la hoja de
compilados entra en la huella de la semana.

**t81 (13-oct-2026, v157): lo que vio la coordinación de Ezequiel Zamora en obra.** «Copias» del apartamento ya hecho al salir
a WhatsApp y volver, y el apartamento escrito «A-2» que no casa con «A2». La tanda recarga la página entre fases, como el teléfono
que descarga la pestaña: el apartamento se normaliza al salir del campo (179), salir y volver sin recargar no duplica, recargar
recupera el informe y sigue siendo uno, seguir llenando guarda en el mismo, perder el hilo del borrador y guardar el mismo contenido
no crea copia (180: mismo número y misma huella, sin enviar, es el mismo borrador), y cambiar de apartamento sí crea su ficha. El
camino exacto que produjo las copias en obra no se encontró leyendo; la defensa 180 cubre cualquiera.

**t82 (13-oct-2026, v158): el apartamento como desplegable donde hay nomenclatura.** Planificación mandó la de Ezequiel Zamora
(A1, A2, B1, B2 por piso; `APARTAMENTOS_POR_SECTOR` en comun/maestros.py). En ese sector el campo de texto se esconde y aparece
el desplegable, que escribe en el mismo campo; «Guardar y otro apto» lo deja vacío; en un sector sin nomenclatura sigue el campo
libre; un borrador con un apartamento fuera de la lista se abre con el campo libre y lo conserva; el desplegable mide 44 px.

**t83 (13-oct-2026, v160): el compilado también para servicios, urbanismo y SHA.** La misma página con un selector «Qué se
compila»: servicios y SHA por torre, urbanismo por manzana (la lista de manzanas la da el relevo, `compilado-manzanas`, y se
recuerda en el equipo). El relevo falso contesta la semana de cada tipo como el relevo r58: servicios por ente con listos, qué
falta y observación; urbanismo con partidas, cantidades y camiones; SHA con recaudos, frentes, incidencias y fotos generales.
La tanda prueba el selector, los tres pedidos, las tres tablas, las notas, que el envío lleve el tipo y el prefijo (SRV-, URB-,
SHA-), que el borrador de servicios no se mezcle con el de obra de la misma torre, y los 44 px.

**t84 (13-oct-2026, v162): el proceso de los compilados de servicios, urbanismo y SHA**, las mismas comprobaciones que t79 hizo
para obra: el borrador va por tipo y por semana (el de SHA no hereda el de servicios de la misma torre; el texto del miércoles
sigue el jueves), emojis y comillas intactos, el archivo con su prefijo y PRUEBA, el relevo caído al generar urbanismo (aviso,
botón libre, las manzanas recordadas siguen) y al enviar SHA (lo escrito se conserva), fechas al revés, y recargar con SHA en
pantalla repinta tipo, torre y semana. En el navegador a 375 px: sin desborde, la primera columna de la tabla del tipo queda
fija al deslizar (v162) y nada baja de 44 px. Contra el relevo real: servicios T-39, urbanismo M-6 y SHA T-07 de Simón Rodríguez
en 20 s cada uno; envíos de prueba de servicios y urbanismo con PDF y fila en Smartsheet, borrados después.

**`t85` (14-oct-2026, v163): camiones en las tres partidas de «Obras preliminares» y «Maquinaria que operó hoy».** Diez
comprobaciones sobre `urbanismo.html?prueba=1`: dónde están las listas y los cuadros (solo esas tres partidas); solo Bote calcula el
ejecutado y las otras dos lo dicen como registro, sin «Acumulado anterior» y sin tocar la cantidad escrita a mano; lo que viaja en el
informe; reabierto desde Informes conserva camiones y maquinaria; al traer la visita anterior pasa el acumulado pero no la maquinaria ni
los camiones; el envío al relevo falso lleva maquinaria y camiones; a 375 px nada se sale y ningún control baja de 44 px (el «Quitar» de
cada camión subió a 44 px). `t19` cambia su comprobación de camiones a las tres partidas. Sin ventana: `t19` 26/26, `t46` 13/13, `t85`
10/10 y `t49b` 6/6; en el navegador real `t85` 10/10 de punta a punta. **Límite nuevo del Chrome sin ventana:** con tiempo virtual
IndexedDB no resuelve (ni un `indexedDB.open` suelto), y el envío lee las fotos de ahí; `t85` lo detecta con una sonda y salta el envío
diciéndolo, para probarlo en un navegador de verdad.

**`t86` (14-oct-2026, v163): diez rondas alrededor de camiones y maquinaria, pedidas por Stephanie («UX y el recorrido
completo, desde que se pone el dato hasta que sale»).** Sobre `urbanismo.html?prueba=1`: la memoria de placas es una sola para las
tres partidas; la visita anterior con camiones en Desmalezamiento hereda la cantidad (sin maquinaria) y ofrece «Traer los 2 camiones»
sin tocar lo escrito a mano; un ítem con solo maquinaria o solo camiones cuenta como contenido (antes el informe se daba por vacío y
no se guardaba: corregido en la misma v163, cambios 14f/14g/14h); un borrador de antes de la v163 abre igual; cambiar la maquinaria
de un informe enviado lo marca para reenviar; quitar el único camión en registro deja la cantidad y la casilla editable; los viajes
no pisan la cantidad escrita; la maqueta con dos camiones y maquinaria en las tres partidas a 375 px; la vista previa imprime los
camiones bajo Desmalezamiento; y la memoria de la manzana para la visita siguiente lleva placa y m³ sin viajes ni maquinaria. 10/10.

**Hallazgo de la ronda 9, ajeno a la v163: la vista previa de servicios, SHA y urbanismo estaba rota desde la v146 (7-oct).** La
plantilla `vista-previa.js` se genera de `PDF.gs`, y desde el relevo r47/r50 el PDF imprime la fila «Versión» con
`_versionDelInforme`, que vive en `Oficina.gs`: al abrir la vista previa salía «No se pudo armar la vista previa de este informe»
(ReferenceError). `generar-vista-previa.py` (repositorio Garmel) ahora toma esa función de `Oficina.gs` y la huella la incluye;
`t86` ronda 9 y `t59` (pasos sin foto) la cubren. En el Chrome sin ventana de hoy IndexedDB no resuelve, así que los pasos con foto de
`t59` (9) y `t61` quedan para un navegador a la vista; no cambiaron con esto.

**Regresión de la v163 (14-oct-2026).** Sin ventana a 500 px, 44 tandas de los cinco formularios: 37 en verde y 7 que no
cierran ahí por el límite de IndexedDB de hoy (`t32`, `t36`, `t37`, `t38` envían; `t62` paso 6, `t61` y `t59` paso 9 leen fotos).
Esas siete se corrieron en el panel del navegador, con la pestaña oculta (los temporizadores van frenados, por eso se lanzan sin
esperar y se leen después): `t32` 5/5, `t37` 3/3, `t36` 5/5, `t62` 9/9, `t38` 2/2, `t61` servicios 11/11, `t59` 14/14 y `t61` SHA
11/11. Todo en verde: nada de lo anterior cambió con la v163.

**`t87` (14-oct-2026, v165): las filas agregadas en campo no pasan al informe siguiente ni se duplican (cambio 182).** Seis
comprobaciones sobre `inspeccion.html?prueba=1`: dos filas siguen siendo dos tras reabrir el borrador tres veces; «Nuevo» y «Siguiente
apartamento» arrancan sin filas agregadas en pantalla y en los datos (antes quedaban en memoria y viajaban como «(sin descripción)»);
un borrador contaminado como el de la T-09 (11 filas: 6 fantasmas y 2 duplicadas) abre con sus 3 filas reales y se guarda así; una fila
recién agregada y vacía se ve pero no viaja; con descripción, viaja. Sin ventana: `t87` 6/6 y la regresión de obra (`t21`–`t24`, `t26`,
`t39`, `t42`, `t43`, `t47`, `t49`, `t50`, `t52`, `t56`, `t64`, `t66`–`t69`, `t71`, `t72`, `t76`, `t82`) en verde.

**`t88` (14-oct-2026, v166): las hojas de minuta de campo viajan desde obra (cambio 183).** Tres comprobaciones en
`inspeccion.html?prueba=1`, en el navegador a la vista (la foto pasa por canvas): con una hoja cargada el sobre lleva «minutas-1» además
de la foto del hito; el envío al relevo falso la lleva con ese nombre; sin hojas no agrega nada. 3/3.

**`t90` y `t91` (14-oct-2026, v168): el envío espera al relevo y, si se corta, pregunta antes de darlo por pendiente (cambio 184).**
El relevo falso aprende dos mandos: `colgar: N` (archiva el envío y tarda N s en contestar, como el relevo real con muchas fotos) y
`perder: true` (lee el cuerpo, no archiva y cierra sin contestar), y contesta `accion: 'existe'` como el r62. El plazo de 5 min se
acorta en la tanda (`PLAZO_ENVIO_MS = 3000`, `_REINTENTO_EXISTE_MS = 800`). `t90`, seis comprobaciones en `inspeccion.html?prueba=1`:
relevo lento (7 s): se ve el contador en el botón, nunca dice «La señal no alcanzó», dice que ya estaba archivado, queda enviado y hay
un solo envío; Enviar otra vez avisa que ya se envió; cuerpo perdido: «todavía no aparece archivado», sigue pendiente y recuerda el
corte; con el relevo de vuelta pregunta una vez y lo manda una vez; si el envío cortado sí llegó, el siguiente Enviar lo reconoce y no
lo reenvía; «Enviar todos» con dos pendientes y el relevo lento: cartel con segundos, dos enviados, dos envíos. `t91`, cuatro
comprobaciones equivalentes en `servicios.html`, `sha.html` y `urbanismo.html` (en el motor el reconocimiento también casa por
`guardado`). En el navegador a la vista: `t90` 6/6, `t91` 4/4 en los tres, `t33` 5/5 (su comprobación 9 ahora usa `perder`) y `t24`
5/5. **Una trampa:** la primera corrida de `t91` justo después de cargar servicios o SHA tropezó una vez cada una (un envío falló
con «Failed to fetch» antes del plazo, sin rastro en el relevo falso); la segunda corrida pasó limpia las dos veces. Si pasa, repetir.

**`t92` (14-oct-2026, v169): al abrir un borrador se ofrece quitar de una vez las filas agregadas sin medición (cambio 185).**
Lo que la v165 no limpiaba: en los borradores viejos del teléfono quedan filas agregadas con descripción distinta y sin medición (once
marcos de puerta en `EZ-T09-P01AB1-261013-KC`) y la inspectora las reenvía cada vez que abre uno; y la ✕ no servía, porque quitaba la fila
de la pantalla pero no de la memoria, y al guardar viajaba igual con la descripción recordada. Seis comprobaciones en
`inspeccion.html?prueba=1` sobre `hito_puertas`: un borrador con 11 filas sin medición y 2 con medición, «Sí» → quedan 2 en pantalla, en
los datos y en el borrador guardado (se guarda en el acto); el mismo con «No» → quedan 13 y al guardar siguen 13; con 2 sin medición no
se pregunta; la ✕ quita la fila de la pantalla, de los datos y del borrador; el texto del confirm es el acordado y cuenta 11; al reabrir,
la quitada no vuelve y las dos con medición siguen intactas. Sin ventana: `t92` 6/6, `t87` 6/6 y la regresión de obra en verde.

**`t100` (19-oct-2026, v175, cambio 187): «Mandar la lista a la oficina» desde «Informes».** Diego Orta: a Leidy Villamizar le
salían 60 informes en el teléfono (52 sin enviar) con seis apartamentos cargados, y «Enviar» le pedía completar datos. Antes de tocar
nada se intentó reproducir en el banco a 375 px —salir de la app y volver (`visibilitychange`), con y sin cambios, en informe de
apartamento y de torre, con «Guardar y otra torre» y con recarga de la página— y en ningún caso aparecieron copias. Para ver qué hay
en su teléfono sin treinta capturas, el botón arma la lista en texto (número, lugar, hora, enviado o no, qué le falta para enviarse,
si tiene medición y fotos, y «IGUAL AL n» cuando el número y la huella de contenido coinciden) y la abre en el menú de compartir.
Siete comprobaciones con cinco informes de ejemplo (dos idénticos, uno sin estatus, uno en blanco sin número, uno enviado): botón de
44 px, resumen, la copia marcada, lo que falta, el blanco, el menú de compartir con el texto, y nada cambia en el teléfono. 7/7; `t92`
y `t87` siguen 6/6. Solo en obra: es donde está el problema; si sirve, pasa a los otros tres.

**Cambio 188 (20-oct-2026, v176): la copia «XX-T---…» al volver a la app.** Mariana Rojas mandó el 19-oct desde la T-52 un
`XX-T---P--A---261019---` con cero segundos de uso. Lo que la `t100` no probó era **volver a una pestaña descargada**: Chrome
repone solo lo escrito en las casillas (cantidades, textos, torre, piso, inspectora), no los botones ni el número, y la
recuperación del cambio 153 guardaba eso como borrador nuevo antes de abrir el de verdad. Se reproduce **a mano**, no en una
tanda, porque la navegación corta el guion: con el JSON real cargado como borrador sin enviar y `garmel_actual` apuntándolo,
`location.href = '/t52.json'` y luego `history.back()` (la entrada de navegación dice `back_forward`). En la v175 aparece un
segundo borrador `XX-…` que difiere del original en 5 evaluaciones, 16 proyectadas, 16 ejecutadas y 3 Sí/No, las mismas cifras de
la copia real. En la v176 los 391 controles nacen con `autocomplete="off"`, queda un solo borrador con todo (5 evaluaciones, 40
proyectadas), y con un informe ya enviado la pantalla vuelve vacía y «Enviar todos» no manda nada. Servicios no hacía copias
(su recuperación no guarda la pantalla), pero lleva el mismo freno en el motor, y con él SHA y urbanismo.
El recorrido completo a mano (menú → obra → cabecera → medida, conteo y estado → foto → salir y volver → «Enviar») encontró
además que, tras recuperar, la cabecera seguía diciendo «se arma al completar la cabecera» y «Torre: T--» con el número ya armado
(el ocultado de la v175 se quedaba con el cálculo del arranque): `_pintarNumero188` lo repinta sin recalcularlo. Regresión sobre
la v176: sin ventana `t21`–`t24`, `t26`, `t87`, `t88`, `t92`, `t100`, `t19`, `t46`, `t85`, `t86`, `t89`, `t79`, `t83`, `t84`,
`t95`–`t99` en verde; a la vista `t33` 5/5, `t90` 6/6, `t93` 5/5, `t59` 15/15, y `t91` 4/4 y `t94` 3/3 en servicios, SHA y
urbanismo (la `t94` de servicios corrida justo detrás de la `t91` dio 2/3 y sola 3/3: la trampa de arriba).

**`t101` (20-oct-2026, v177, cambio 189): «Quitar copias de informes ya enviados».** Stephanie: que envíen lo que tienen y que
puedan quitar las copias, «pero que les dé seguridad que ya se enviaron las que no son copias». Una copia es un informe sin número del
mismo lugar que otro con número guardado antes; se quita solo si ese original ya se envió y la copia no tiene nada que él no tenga, y el
aviso lista cada original con ✅. «Enviar todos» deja fuera las copias («es copia de …»). Trece comprobaciones armadas sobre la forma de
las dos copias reales (T-52: menos que el original, se quita; T-46: una «ejecutada 0» de más, no se quita y se nombra para revisar),
con el original sin enviar, una foto de más, otro apartamento, «Cancelar», tres copias de un original, las fotos que se borran, la copia
abierta en pantalla, y de punta a punta contra el relevo falso «Enviar todos» → «Quitar copias». A la vista 13/13; `t33` 5/5, `t90` 6/6,
`t93` 5/5, y sin ventana la regresión de obra en verde (la `t21` corrida a la par de una tanda a la vista dio 5/6 y sola 6/6: comparten
el contador de envíos del relevo falso, así que no se corren dos baterías a la vez).

**`t99` (16-oct-2026, v174, relevo r68): urbanismo y SHA también por «todo el urbanismo».** Planificación pidió el día del corte
el compilado de urbanismo de todo el sector, y Stephanie sumó SHA (sus láminas van por contratista) y a Miguel Ávila en «quién valida».
Ocho comprobaciones en `compilado.html?prueba=1` a 375 × 812: la opción sale primera en urbanismo («todas las manzanas y la zona») y en
SHA («todas las torres y la zona»), y no en obra; tabla por manzana con la manzana sin cantidades avisada; se envía con Diego Orta a
General › Urbanismo; nada se sale de la página; vuelve al recargar; una manzana sola sigue igual; SHA trae la contratista de cada torre y
avisa la torre sin frentes; se envía a General › SHA. 8/8. Toda la batería del compilado otra vez, desde una página limpia: `t78` 20/20,
`t79` 7/7, `t83` 11/11, `t84` 10/10, `t95` 6/6, `t96` 9/9, `t97` 6/6, `t98` 3/3 (ajustadas `t83`, `t84`, `t95` y `t96`, que suponían que
urbanismo y SHA no tenían esa opción). Contra el relevo real, desde el editor: urbanismo EZ 4 informes (M-1, M-6) en 48 s, SB 3 (toda la
zona, M-J, TORRE J 08), SR 1 (M-6 SR); SHA EZ 7 informes en 6 lugares con su contratista, SR 5 (T-04 y T-43); el PDF de urbanismo con la
columna Manzana. **Ojo al correr las tandas seguidas:** cada una deja la semana guardada y la página la repinta al abrir; limpiar
`localStorage` y `sessionStorage` antes de cada una.

**`t98` (16-oct-2026, v173): Diego Orta, de Planificación, valida compilados.** Stephanie lo pidió el día del corte para que Diego
envíe con su nombre los compilados de urbanismo, que todavía no tienen coordinación propia. Va al final de `COORDINADORES`
(`comun/maestros.py`) para no mover a los demás. Tres comprobaciones en `compilado.html?prueba=1` a 375 × 812: la lista trae a los
cuatro de siempre en su lugar y a Diego al final («Diego Orta · Planificación»); un compilado de urbanismo de la M-6 de Ezequiel
Zamora se genera y se envía con su nombre; al recargar la página lo recuerda. 3/3, y `t97` y `t95` siguen 6/6.

**`t97` (15-oct-2026, v172): el compilado ya archivado se carga en los cuadros** (relevo r65), para que la coordinación corrija sobre
el borrador que dejó Planificación. Seis comprobaciones en `compilado.html?prueba=1` contra el relevo falso, que ahora guarda los compilados
y los devuelve como `archivado`: sin nada archivado ni escrito, cuadros vacíos y sin aviso; con uno archivado, sus textos en los cuadros y
el aviso con quién lo dejó; al enviar va el nombre de quien valida con el texto corregido y el aviso se va; lo escrito en ese equipo sin
enviar manda sobre lo archivado y el aviso lo dice; obra (una torre) también lo carga; cambiar de torre no arrastra el aviso. 6/6.

**`t96` (15-oct-2026, v171): diez QC del compilado de servicios por urbanismo**, pedidas por Stephanie antes de avisar a Planificación.
Nueve en `compilado.html?prueba=1` a 320 × 568 contra el relevo falso (se corre dos veces: la primera prepara y recarga): borrador por
semana sin mezclarse con el de una torre; ida y vuelta entre todo el urbanismo y una torre sin restos; la opción no aparece en SHA ni obra;
relevo caído al generar y al enviar; semana sin informes; «Enviar de nuevo» actualiza el mismo número; nada se sale ni baja de 44 px y la
columna Torre queda fija al deslizar; al recargar vuelve todo. 9/9. La décima, contra el relevo real desde el editor: un compilado PRUEBA
de todo el urbanismo de Simón Bolívar entra a las cuatro láminas de servicios del borrador. **Encontró** que en Hidroven no entraba (la
validación iba al final del sector y la celda ya estaba llena); se movió al principio del sector (relevo, `BorradorSemana.gs`) y pasó 4/4.
Corrida completa con los datos reales de la semana, en la página publicada: los informes por sector coinciden con Drive (1, 8 y 12),
todas las fotos cargan (1, 4 y 6, ninguna rota) y coinciden con las que hay en las carpetas, y las observaciones de las 12 notas de Simón
Rodríguez son idénticas al texto de cada informe. Estrés: 60 días de Simón Rodríguez, 19 informes, 49 s, 34 KB, se guarda y repinta.

**`t95` (15-oct-2026, v171): el compilado de servicios por urbanismo.** Seis comprobaciones en `compilado.html?prueba=1`: «Todo el
urbanismo» es la primera opción de la lista solo con servicios (obra, SHA y urbanismo no la ofrecen); el resultado dice «Todo el urbanismo»
y la tabla trae columna Torre con una fila por lugar y su informe; enviar lo archiva como `SRV-…-URBANISMO-SEM-…` y el aviso dice «General ›
Servicios del sector»; nada por debajo de 44 px; una torre sola sigue como antes. El relevo falso contesta `porTorre` como el r64. Además,
a mano: el aviso de espera nombra el sector y queda a la vista, nada se sale a 375 ni a 320 px, y al recargar vuelve la semana de todo el
urbanismo con lo escrito («Se muestra la semana de todo el urbanismo generada el dd-mm-aaaa»). `t83` 11/11 (su comprobación 2 acepta el
rótulo nuevo «Torre o todo el urbanismo»). Corre en una página limpia: si la página abre recordando otro tipo, `t83` falla su paso 1.

**`t93` y `t94` (15-oct-2026, v170): las fotos HEIC se convierten en el teléfono (cambio 186).** `prueba.heic` es sintética
(3000×4000, hecha con `sips -s format heic`, no una foto de obra: el repositorio es público) y `basura.jpg` son 4 KB al azar.
`t93`, cinco comprobaciones en `inspeccion.html?prueba=1`: una HEIC con su tipo entra como JPEG de 1280 px con el cartel de conversión
mientras tanto y sin él al final; una HEIC disfrazada de «.jpg» se reconoce por sus bytes; un archivo que no es imagen avisa y NO entra
(antes entraba tal cual); una JPEG normal entra sin cartel; lo que viaja al relevo son JPEG de menos de 400 KB. `t94`, tres en
`servicios.html`, `sha.html` y `urbanismo.html`: dos HEIC de golpe entran como JPEG de 1280 px de una en una («en cola»), un archivo
que no es imagen avisa y no entra (antes desaparecía sin aviso), y el sobre lleva JPEG chicos. En el navegador a la vista: `t93` 5/5,
`t94` 3/3 en los tres, `t24` en verde. `preparar.py` copia ahora `heic2any.min.js` al banco.

**`t89` (14-oct-2026, v167): el residente de urbanismo se propone solo.** Seis comprobaciones en `urbanismo.html?prueba=1`: en
una manzana sin residente recordado, empresa y residente de su contratista; al quitar la manzana sigue el del sector; lo escrito a mano
se guarda y manda al reabrir; cambia con el sector (Procodima, Racar); una manzana nueva nace con el suyo. 6/6; `t19`, `t46`, `t85`
y `t86` en verde (`t37` envía y no cierra sin ventana).

**v178 (20-oct-2026): seis pedidos de Diego Orta, con el relevo r70.** 1 · urbanismo (y servicios y SHA) de «Toda la zona» que también
afecta a otras zonas es la visita anterior de esas zonas, y la memoria de «Toda la zona» va por zona (`_claveMem`; la vieja `ZONA` se
migra al leerla). 2 · SHA por manzana: cuarto botón «Manzana», las manzanas del padrón de urbanismo en `TORRES_DATA` con `m: 1`,
«＋ Otra manzana o lote», «También afecta a» con manzanas y «Sig. torre» que sigue en «Manzana». 3 · el buscador de SHA pide `abiertos` y
pinta «de antes» con cuántos siguen abiertos. 4 · la semana de SHA (relevo y `compilado/pagina.html`) junta toda la semana y lo abierto
de antes. 5 · el panel «Buscar los informes» va después del lugar en los cuatro (cambio 190 en obra). 6 · residentes con «▾» y lista
propia (`comun/residentes.js`, cambio 191 en obra); en «Varias torres» el que se toca se suma. Tandas nuevas: `t102` (SHA: manzana,
buscador, memoria por zona, 15), `t103` (urbanismo, servicios y obra: zona compartida y panel), `t104` (residentes en los cuatro),
`t105` a `t107` (QC 1 a 6 pedidas por Francisco: modos de SHA, zona de punta a punta y memoria vieja, residentes en varias torres y
en obra). Las 10 rondas de QC encontraron y se arreglaron dentro de la v178: el aviso de visita anterior no se recalculaba al cambiar de
zona; «Sig. torre» volvía a «Una torre»; «Toda la zona» aparecía en la lista de manzanas; la memoria vieja `ZONA` se habría perdido;
en «Varias torres» elegir un residente borraba a los demás; la flecha del residente se corría al abrir la lista; los campos con lista
del navegador (placas) quedaban con `autocomplete="off"`. Errores de prueba, no del formulario: el informe «de antes» tiene 2 abiertos
y no 3; en `t106` el relevo falso no distingue zonas; `t91` de urbanismo corrida después de `t106` en la misma página da 0/4 y sola
4/4. Regresión final: sin ventana 32 tandas en verde; a la vista `t33`, `t90`, `t93`, `t101` (obra), `t91`, `t94`, `t102`, `t105`
(SHA), `t91`, `t94` (servicios), `t106`, `t59`, `t91` (urbanismo), `t66` y `t74` en los cuatro, todas en verde; a 320 px sin desborde.


**v179 (20-oct-2026): 20 rondas más de QC, pedidas por Stephanie.** Tandas `t108` (obra: un día real de tres apartamentos con
foto y «Enviar todos»; el teléfono de Leidy simulado con 60 informes y «Quitar copias»; la lista para la oficina), `t109` (servicios y
SHA: dos torres con «Sig. torre» y una de varias, con foto y minuta; hallazgo, incidencia y rechazo; dos manzanas seguidas; «Copiar de
otra manzana»), `t110` (urbanismo: varias manzanas con camión, maquinaria y foto; la lista de placas; residentes con Escape),
`t111` (la página del compilado dibujando la semana de SHA del r70), y a mano: salir y volver con foto en obra, el menú con
pendientes en cada formulario, los anchos 320, 412, 768 y horizontal 812×375 en los cuatro (sin desborde, nada nuevo por debajo de
44 px, ningún botón cortado). Contra el relevo real, desde `Correr.gs`: un SHA de manzana PRUEBA- por `doPost` (archivado en
`Urbanismo › M-1 L4 › SHA`, PDF, Smartsheet `EZ-M-1 L4`), la visita anterior compartida de toda la zona en SB y SR, el buscador de SHA
y la semana de SHA de todo EZ (12 lugares, 4 sin informe en la semana, 10 hallazgos de antes; tarda 69 s, la página espera 240).
Arreglado en la v179: en «Manzana» los botones decían «Copiar de otra torre» y «Buscar los informes de esta torre» (`_OC_LUGAR`
ahora depende del modo); la lista de residentes no se cerraba con Escape; el menú decía que SHA es solo «Por torre». Errores de las
pruebas, no del formulario: `t108` reemplazaba la lista con un informe en pantalla (el «Enviar todos» lo guardaba, como debe); en
`t109` los campos del hallazgo iban con otro nombre y el botón de copiar aparece con demora; `t8` (21-sep) elegía M-101 sin su
sector desde que las manzanas se filtran por sector, y fallaba igual con la v177; `t8` necesita la clave puesta; `t108` corrida
detrás de `t101` en la misma página da 3/4 y sola 4/4. Regresión: 33 tandas sin ventana y a la vista `t33`, `t90`, `t93`, `t101`,
`t108`, `t66` (obra), `t102`, `t105`, `t109`, `t91`, `t94`, `t74` (SHA), `t109`, `t91`, `t94`, `t74` (servicios), `t106`, `t110`, `t59`,
`t74`, `t8` (urbanismo), todas en verde.


**v180 (20-oct-2026): lo que no debe salir en «Enviar todos» (cambio 192, `comun/antes_de_enviar.js`), el teléfono despierto
mientras envía (cambio 193, `comun/pantalla_encendida.js`) y dos pedidos de Diego Orta en el compilado.** El 20-oct una inspectora
vació el teléfono con «Enviar todos» y salieron borradores viejos de la T-16: hechos el 13-oct con fecha 5-oct (una sola fecha mal
elegida y arrastrada con «Siguiente apto.»), con el apartamento a medias («A», «B», «B-1») y uno sin nada medido. Tres frenos, en el
mismo archivo para los cuatro formularios:
1 · **la fecha que no es hoy** se pregunta una sola vez, al elegirla en el selector («La fecha que eligió es el 05-oct, no hoy
(13-oct). ¿Es correcta?»); con «no» vuelve la que había. No se repite al pasar de apartamento o de torre, ni al abrir un borrador, ni al
guardar o enviar (criterio de Stephanie del 20-oct, que reemplazó al primero, «más de dos días, al guardar y al enviar»). Al pasar al
siguiente con una fecha que no es hoy, un aviso la muestra. 2 · **el apartamento a medias** (solo obra, donde la torre tiene lista:
Ezequiel Zamora y J-09 a J-12 de Simón Bolívar) no sale y se marca en «Informes»; «B-1» y «b1» pasan solos a «B1»; uno con la forma de
la lista pero fuera de ella («C1») pasa, como decidió el 181. En servicios el «Apto / área» admite áreas y en SHA y urbanismo esas filas
son hallazgos y manzanas: no aplica. 3 · **sin nada medido** (en obra ninguna ejecutada, evaluación, Sí/No ni %; en los otros tres
ninguna respuesta, cantidad, camión, maquinaria, fila con algo, incidencia ni obstáculo; la proyectada no cuenta) no sale en «Enviar
todos», queda marcado «Vacío, no se envía» y se borra con 🗑️ Borrar; enviado de a uno se pregunta antes.
**Pantalla encendida** (Diego Orta): Android congela la página con el teléfono en reposo y una PWA no sube en segundo plano. Desde la
primera llamada al relevo de un envío (uno o todos, en los cuatro) se pide `navigator.wakeLock.request('screen')`, se vuelve a pedir si
la página vuelve a verse y se suelta al terminar o fallar; arriba queda «Mantenga la app abierta y el teléfono desbloqueado hasta que
termine». Sin Wake Lock solo sale el aviso. **Compilado**: Eduardo Rivero entra en «Quién valida» como coordinador de urbanismo (al
final de `COORDINADORES`), y la página dice «Semana del 08 al 14-oct · generado el 13-oct por Diego Orta» en vez de «Semana» y
«Generado» sueltos, también en el aviso al enviar y en el de lo ya archivado: el número `…-SEM-261008` lleva el lunes de la semana (r55)
y se leía como la fecha de generación; no se cambia. El PDF que archiva el relevo dice lo mismo desde el r71 (preparado, sin desplegar).
Tandas nuevas, todas en el navegador a 375 × 812: `t112` (obra: el teléfono del 20-oct con 8 borradores de la T-16 y uno de hoy, marcas,
«Guardar» y «Enviar» de uno, formas de apartamento, informe de torre, lista para la oficina; 11/11), `t113` (servicios, SHA y urbanismo:
lo mismo sin apartamentos; 7/7 en los tres), `t114` (obra: el caso de la fecha, «estando» en el 13-oct con `_hoy192`: elegir el 5-oct,
decir que sí y pasar tres apartamentos sin otra pregunta; el «no»; hoy no pregunta; a las 23:30 cuenta la hora del teléfono; 9/9),
`t115` (lo mismo con «Sig. torre» en los otros tres; 6/6 en los tres), `t116` (el Wake Lock sustituido por uno que cuenta: aviso y
bloqueo durante «Enviar todos» y de uno, se pide otra vez al volver a verse, nada si se cancela, sin Wake Lock solo el aviso, y un envío
cortado a la mitad queda enviado y no se repite; 7/7 en los cuatro) y `t117` (compilado: Eduardo al final y la línea de la semana, en la
página, al enviar, en lo archivado y entre dos meses; 6/6). Las tandas que eligen una fecha vieja con `change` ven ahora una pregunta más,
que `Q.aceptar` contesta. Expectativas vencidas corregidas sin quitar comprobaciones: `t26`, `t27`, `t34` y `t50` usaban en la T-07
apartamentos «A», «B», «C», «ED1» y «4», que ya no salen: pasaron a A1, B1, B2, y el «4» = «04» se prueba en la T-04 de Simón
Rodríguez, que no tiene lista; `t98` esperaba seis coordinadores. Regresión: sin ventana 31 tandas de obra en verde y `t33`-9, `t90`,
`t93` y `t108` fallan igual con la v179 (temporizadores), así que van a la vista; urbanismo `t19`, `t46`, servicios `t40`, `t53`, `t63`,
`t73`, `t80`, `t103`, `t104`, SHA `t41`, `t57`, `t105`, `t107` y compilado `t78`, `t79`, `t83`, `t84`, `t95`, `t97`, `t98`, `t111` en
verde. A la vista: obra `t32`, `t33`, `t34`+`t34b`, `t90`, `t93`, `t101`, `t108`; servicios `t36`, `t61`, `t74` (con `?oficina=1`),
`t75`, `t91`, `t94`, `t109`; SHA `t12`, `t38`, `t54`, `t74`, `t91`, `t102`, `t109`; urbanismo `t37`, `t55`, `t59`, `t74`, `t85`, `t89`,
`t91`, `t106`, `t110`: todas en verde. SHA `t6` da 28/30 (la pestaña «Obstáculos» que no esperaba y una reapertura de incidencias) y la
v179 en la misma corrida 14/30: no es de esta versión.

**v181 (21-oct-2026, construida y sin publicar; va con el relevo r72): el compilado de obra por contratista con el % de avance
físico** (ADR-0049 del repositorio Garmel, pedido de Diego Orta). En `compilado/pagina.html`: obra se elige por **contratista** (la
lista dice sus torres: «ALNAVIC, C.A. · T-05, T-06, T-07, T-08»); la página pide la semana de cada torre al relevo a la vez y las pinta
una debajo de otra (sección 3 en adelante), cada una con su **% de avance físico según la app** (lo medido del presupuesto, pesos
provisionales, último informe), **«¿De dónde sale?»** con la cuenta partida por partida, el cuadro **«% de avance físico validado»**
(vacío = el de la app; otro número abre «¿Por qué es distinto del de la app?», obligatorio), una **nota de la torre** opcional, y sus
áreas comunes, apartamentos y notas. Una sola validación para la contratista. Borrador por contratista y semana; lo archivado vuelve a
los cuadros; al recargar vuelve todo. Servicios, urbanismo y SHA siguen como estaban. El menú describe el compilado nuevo. El relevo
falso contesta `avanceApp` (la T-02 sin presupuesto) y archiva como `_compGuardarContratista`. **`t78` reescrita** para obra por
contratista (24/24: la lista, las cuatro secciones, la torre sin presupuesto, la cuenta, el % igual y distinto, el motivo que falta, el
% fuera de rango, el borrador, el envío con lo de cada torre, lo archivado al volver a generar, «Otra contratista», servicios sin
cambios, 375 px sin desbordes ni controles chicos). Expectativas vencidas corregidas: `t79` (obra con Río Limón; 7/7), `t97` (lo
archivado de Glajos con su % y su nota; otra contratista vacía; 6/6) y `t99` (en obra el rótulo es «Contratista»; 8/8). Regresión del
compilado a 375 × 812, cada tanda sola: `t83` 11/11, `t84` 10/10, `t95` 6/6, `t96` 9/9, `t98` 3/3, `t111` 4/4, `t117` 6/6; `t80`
en el menú 1/1. Corridas a la vez en la misma página se pisan (comparten el relevo falso): van de a una.
**Diez rondas más antes de publicar** (pedido de Stephanie, 21-oct), `t119` (rondas 1 a 5, 17/17) y `t120` (6 a 10, 16/16):
1 · semana sin informes en ninguna torre (el % de la app sale igual; se valida y se envía); 2 · BZS, siete torres, dos lentas y la T-17
con 60 apartamentos (dice «n de 7 listas», se leen a la vez —con 2 y 3 s tarda ~3 s—, siete secciones en orden, 15 pisos y 60 filas
que deslizan dentro de su caja); 3 · una torre que no se puede leer; 4 · los números raros del % («42,0», « 42 % », a menos de 0,05,
0, 100, negativo, «43,5»); 5 · textos de casi 2.000 caracteres, emojis, comillas y saltos (intactos); 6 · una contratista de una sola
torre («la T-07», sin desglose en el membrete); 7 · cambiar de contratista y de semana sin mezclar borradores; 8 · el relevo caído y
lento al enviar, y el doble toque; 9 · etiquetas e id únicos, aria del «¿De dónde sale?», el foco al motivo que falta; 10 · lo que sale
al imprimir. **Dos arreglos dentro de la v181**: (ronda 3) una torre que el relevo no puede leer ya no tumba el compilado: se ven las
demás, esa queda con «↻ Reintentar la T-07», el membrete dice «sin leer» y no deja enviar hasta leerla; lo escrito no se pierde al
reintentar. (Ronda 10) al imprimir los cuadros del % y de la nota no salían; cada torre lleva ahora un resumen para el papel («% de
avance físico validado: 70 % · Por qué es distinto: … · Nota de la T-08: …»). Mirado también a 320 × 568. El relevo falso suma
`fallarTorres`, `tardaTorre`, la T-17 con 60 apartamentos y la semana sin informes desde el 1-dic. Regresión después de los
arreglos: `t78` 24/24, `t79` 7/7, `t97` 6/6, `t99` 8/8, `t83` 11/11 (sola), `t111` 4/4, `t117` 6/6.

## El estatus de SHA desde el compilado (v182, 21-oct-2026, ADR-0050): `t121` y `t122`

Pedido de Diego Orta: la inspección de SHA actualiza el estatus de cada hallazgo en el compilado y la coordinación lo valida al
enviar; lo validado como «Corregido» ya no vuelve. Diez rondas en `compilado.html?prueba=1` a 375 × 812, con el relevo falso que
ahora contesta `sha-estatus-guardar`, anota cada frente con `propuesta` y `validado` y valida lo que llega en `estatus` al enviar
(la muestra de SHA suma un segundo frente, «Área de winches», que viene de antes). `t121` (13/13): 1 · en SHA «Quién» separa la
coordinación de la inspección de SHA (tres inspectores) y el inspector no ve validación ni «Enviar»; 2 · guardar sin cambios no
manda, lo que cambia se resalta y queda en el equipo, se guarda solo lo cambiado con quién, lugar y el estatus del informe; 3 · la
coordinación ve lo propuesto cargado, resaltado, con quién y cuándo; 4 · al enviar se valida, y al volver dice quién lo validó;
5 · volver a obra no arrastra el modo del inspector. `t122` (12/12): 6 · todo el urbanismo, cada cambio con su torre o «Toda la
zona», y lo guardado aparece en la torre sola; 7 · el relevo caído al guardar (lo dice, lo elegido sigue en el equipo y vuelve al
regenerar); 8 · aria-label por hallazgo, id únicos, 44 px, sin desborde; 9 · al imprimir sale el estatus como texto; 10 · el
inspector no envía el compilado ni abre otro tipo. **Un arreglo dentro de la v182**: la página no arrancaba (la lista de «Quién»
usaba una constante antes de que existiera). Regresión: `t78` 24/24, `t84` 10/10, `t99` 8/8, `t119` 17/17, `t120` 16/16.

## La fecha de un informe nuevo (v183, 21-oct-2026): `t123`

Diego Orta: «cuando cargan información de una inspección anterior la fecha que sale en el informe nuevo sigue siendo la anterior».
Era abrir en «Informes» uno guardado de otro día y tocar «Siguiente apto.» o «Sig. torre»: el nuevo heredaba esa fecha y solo un aviso
lo decía. Desde la v183 (`comun/antes_de_enviar.js`, los cuatro formularios) el nuevo arranca con la de hoy y lo dice; solo se arrastra
la fecha que el inspector eligió y confirmó en esta sesión (el caso de `t114`). `t123` 4/4; regresión `t114` 9/9.

## La misma base en los cuatro formularios (v184, 21-oct-2026)

Pedido de Diego Orta (el compilado de SHA lo hace la inspección de SHA, y en SHA el botón estaba escondido) y criterio de Stephanie:
«la base estructural de los formularios debería ser igual … que la experiencia de usuario sea buena para todos por igual». Servicios,
SHA y urbanismo pasan a la cabecera y la barra de obra: mismas clases, colores y sitio. Arriba, el título con «📋 Compilado» y «🏠»
(en el teléfono «Inicio» queda en el ícono); debajo, «➡️ Guardar y otro apto / otra torre / otra manzana», «📁 Informes (n)», «📤 Enviar
(n)» y «⋯ Más» (abajo en el teléfono, en una fila en la computadora); detrás de «Más», «🖨️ PDF», «💾 Guardar» y «🧹 Limpiar todo» (más
«📊 Proyectadas» en urbanismo), en cuadrícula de dos; «● en línea · vNNN» en la barra. En obra, «Compilado» sale de «Más» y sube al
lado de «Inicio». Desde servicios, SHA y urbanismo el compilado se abre ya en su tipo, con el sector, todo el urbanismo y quien firma
(`?de=` y `garmel_compilado_desde`). Arreglos de la misma base: «Entendido · ocultar» (42 px) y «Eliminar» foto del motor (32 px) a
44 px. Regresión a 375 × 812: obra `t10` 3/3, `t72` 3/3, `t80` 3/3, `t123` 4/4; servicios `t10` 4/4, `t59` 15/15, `t80` 1/1; SHA
`t10` 4/4, `t12` 4/4, `t59` 15/15; urbanismo `t10` 4/4, `t11` 27/27, `t59` 15/15; `t80` y `t59` puestas al día con el menú nuevo.
`t3` da 25/29, igual que con la v183 publicada (expectativas viejas de la tanda, no del menú). Mirado también en la computadora.

## Estrés de fin de día (21-oct-2026, sobre la v184): `t124` a `t127`

Pedido de Stephanie: «haz 10 QC para confirmar que no se haya roto nada … estresa la app lo más posible». 1 obra, 25 apartamentos
seguidos con «Guardar y otro apto», contadores de la barra, doble toque y relevo lento · 2 obra, tres rechazados, relevo caído y
reintento sin duplicar · 3 SHA, 15 torres seguidas, contadores, doble toque y relevo lento · 4 «⋯ Más» 30 veces, cuadrícula, «Limpiar
todo» con «no», «PDF» lo cierra · 5 SHA, la fecha de un informe viejo abierto · 6 el compilado desde un formulario con lo raro (iframes) ·
7 el estatus de SHA con 80 cambios, guardado lento con doble toque, caído, reintento y validación · 8 los cuatro en 320, 375, 812
apaisado, 768 y 1280 (iframes desde el menú) · 9 la misma base: barra, cabecera, «Más», funciones, versión, sin errores · 10 las tandas
de hoy otra vez. **Encontró cuatro cosas, arregladas (v185):** «Limpiar todo» en obra dejaba la fecha vacía (los otros tres ponen la de
hoy) y el informe no salía en «Enviar todos»; en el compilado, un recuerdo roto de `garmel_compilado_desde` no se borraba; al llegar
desde urbanismo con otra semana en pantalla quedaba elegido quien validó esa semana y la manzana se perdía porque la lista se repintaba
al llegar del relevo (ahora se conserva lo elegido); en la computadora los botones de obra medían 35 px y los de los otros tres 44.
Resultado final: `t124` 8/8, `t125` 11/11, `t126` 13/13, `t127` 7/7; regresión obra 30/30 (t10, t72, t80, t114, t123, t124),
compilado 103/103 (t78, t99, t119, t120, t121, t122, t126), SHA 34/34, servicios 20/20, urbanismo 46/46.

## Completar lo vacío con otro apartamento o torre (v186, 22-oct-2026, sin publicar): `t128` y `t129`

Pedido de Diego Orta por Mariana Rojas: al reabrir un informe ya enviado con un solo dato, el botón de copiar no salía (solo
salía con el formulario en blanco y nunca en un informe abierto desde «Informes»). Ahora sale también si hay **un cuarto de las
filas (o de los ítems) o menos** con dato, se llama **«Completar lo vacío con…»** y **solo llena lo vacío**: lo ya anotado queda
igual y sin marca. En servicios, SHA y urbanismo las filas de la lista (hallazgos, apartamentos) solo se traen si la lista está
vacía. Lo demás no cambia: las filas copiadas quedan «≈ Copiado de» y no se envía sin confirmarlas.

- `t128` (obra, 375 px) **9/9**: reabierto y ya enviado con una fila → «Completar lo vacío con otro apartamento…»; la fila propia
  (9 y 9) queda igual y sin marca, las dos vacías se llenan marcadas; el dato lleva `copiadoDe` solo en las copiadas; no se envía
  sin confirmar; confirmadas, sale; con la mitad medida no se ofrece; nada se sale.
- `t129` (servicios, SHA y urbanismo, 375 px) **6/6 en los tres**: lo mismo con respuestas Sí/No (o cantidades en urbanismo).
- `t69` y `t75` cambian la comprobación 10 a la regla nueva (con una fila: «Completar lo vacío»; con la mitad: nada):
  **13/13** en obra y **11/11** en servicios, SHA y urbanismo. Regresión de la visita anterior: `t26` 5/5 y `t29` 5/5.
