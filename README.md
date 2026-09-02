# Informe de Inspección Técnica — Constructora Garmel, C.A.

Formulario de campo para el levantamiento de avance de obra por partidas en
**Ciudad Tiuna**. Funciona en el teléfono, **sin señal**, y produce el informe en PDF.

**Dirección para los inspectores:** https://constructoragarmel.github.io/inspeccion/

---

## Origen

La herramienta la **concibió y construyó Skarlet Gómez**, ingeniera inspectora de Garmel, por
cuenta propia. Es el levantamiento de necesidades de campo más concreto que existe en el proyecto:
qué mira un inspector, en qué orden, y con qué escala lo evalúa.

Este repositorio **no la rehace**: la traduce a un sitio bajo control de Garmel y corrige los
defectos que le impedían usarse en obra. El archivo original se conserva intacto en `fuente/`.

## Cómo se configura un teléfono

**El inspector no escribe ninguna clave, nunca.** Se le manda **una sola vez** un enlace de configuración:

```
https://constructoragarmel.github.io/inspeccion/#clave=LA-CLAVE
```

Lo toca, y ese teléfono queda configurado para siempre. El formulario guarda la clave y **la borra de la
barra de direcciones en el acto**. De ahí en adelante usa el enlace normal.

Lo que va después del `#` **no sale del teléfono**: los navegadores no lo envían al servidor, así que no
queda en ningún registro de GitHub.

En la ventana de envío se ve **✓ Este teléfono está configurado** o **⚠️ todavía no está configurado**, y
hay un botón **🔑 Probar clave** que la comprueba contra el relevo y la guarda **sin enviar ningún
informe** — sirve para dejar teléfonos listos en la oficina sin inventar informes de prueba.

> **La clave nunca va dentro de este repositorio**, que es público. Si se filtra, se cambia en las
> propiedades del script del relevo y se reenvía el enlace de configuración.

## Lo primero que se ve: con qué rol se llena

Al abrir, antes del formulario, se elige el rol. La elección se recuerda en ese teléfono y se cambia con
el botón **Cambiar** de la barra superior.

| Rol | Qué hace |
| --- | --- |
| 👷 **Inspector** | Registra en obra la **cantidad ejecutada** de cada subpartida. **No ve la cantidad proyectada** — la meta— para no medir contra ella |
| 📊 **Gerencia de Planificación** | Además ve y carga la **cantidad proyectada**, que es contra la que se calcula el avance |

**En el PDF salen siempre las dos.** El rol decide quién llena el dato, no qué lleva el documento: sin la
proyectada, quien lee el informe no puede comprobar de dónde sale el porcentaje.

## El recorrido de una torre

**Un informe = un apartamento, una fecha, un inspector.** Seis apartamentos del piso 3 son seis informes.

De los nueve campos del encabezado, **siete se repiten** en todo el recorrido. Por eso el botón
**➡️ Guardar y siguiente**: cierra el informe actual con su propia ficha, conserva fecha, convenio,
empresa, torre, piso, residente, inspector y estatus, y limpia solo el número de apartamento, las
observaciones y la evaluación.

Para empezar de cero —otra torre, o simplemente rehacerlo— está **🧹 Limpiar todo**, que vacía el
formulario entero. **Los informes ya guardados no se tocan.**

> **Cambiar de apartamento ya no pisa el informe anterior.** Un borrador pertenece a su número: si el
> número cambia y el informe anterior tenía contenido, el anterior se conserva y el nuevo abre su propia
> ficha. Antes se destruía en silencio — y ocurría en el caso normal, porque sin señal no se puede enviar
> entre apartamentos y el borrador es lo único que existe.

Para lo de **toda la torre** —estructura, ascensores, áreas comunes— se cambia el ámbito a 🏢 Torre:
desaparecen piso y apartamento, y el número pierde el bloque de vivienda: `EZ-T05-260828-CF`. **Los once
hitos se muestran igual**: el ámbito decide qué identifica al informe, no qué se puede evaluar.

Al volver con señal, **📤 Enviar todos los pendientes** manda de una vez los que falten. La lista de
guardados marca cada uno como **✅ Enviado** o **⏳ Sin enviar**, y avisa antes de reenviar algo que ya se
fue, para no crear copias `-r2` en Drive.

## Cómo se usa en campo

1. Abrir el enlace **una vez con señal**. El teléfono se guarda una copia y ya queda con la versión
   publicada.
2. *Agregar a pantalla de inicio* — queda con ícono, como una aplicación.
3. De ahí en adelante abre **sin señal**, indefinidamente.

> ⚠️ **Al publicar una versión nueva, un teléfono que YA tenga el formulario necesita abrirlo dos veces.**
> Sirve primero la copia guardada y se trae la nueva por detrás: la primera apertura todavía muestra la
> anterior, la segunda ya es la nueva. **Un teléfono que nunca lo ha abierto recibe la última a la
> primera** — comprobado.
4. Llenar el informe. Sin señal se queda guardado en el teléfono.
5. Al volver con cobertura, **📤 Enviar**: el relevo lo archiva solo en Drive —el PDF, los datos y las
   fotografías, en la carpeta de su torre—.
6. **🖨️ PDF** solo cuando haga falta el papel. El envío ya dejó el PDF en Drive.

> **Regla de operación:** el número que acompaña a **📤 Enviar** cuenta los informes que existen
> **solo en ese teléfono**. Mientras no esté en cero, si el teléfono se pierde o se borran los datos del
> navegador, esos informes se pierden. Hay que dejarlo en cero al terminar el día.

## El número de informe

```
EZ-T05-P03A04-260828-CF
│   │    │      │      └── iniciales del inspector
│   │    │      └───────── fecha de la inspección
│   │    └──────────────── piso y apartamento
│   └───────────────────── torre
└───────────────────────── sector (EZ · SR · SB)
```

En el informe de **torre completa** el bloque de piso y apartamento **desaparece** —`EZ-T05-260828-CF`—:
la torre ya está en el bloque anterior y repetirla no añadía nada. Sigue siendo inequívoco, porque la
distinción es estructural: con bloque `P##A##` es de una vivienda; sin él, de la torre entera.

Se compone solo, con lo que ya se llenó. **No depende de un contador**, que era el defecto
anterior: el contador vivía en cada teléfono por separado y dos inspectores generaban el mismo
número. Y ahora lleva el sector, sin el cual «Torre 12» no identifica una torre —existe en
Ezequiel Zamora y en Simón Rodríguez—.

> **Es provisional.** La convención definitiva es materia de Gerencia Técnica (`PA-23`), y si
> Inmobiliaria Nacional tiene un padrón oficial de torres (`PA-41`), ese manda sobre este esquema.

## Cómo se modifica

**No se edita `index.html` a mano.** Se genera:

```bash
python3 construir.py
```

`construir.py` toma el archivo original de `fuente/` y le aplica los cambios uno por uno, cada uno
numerado y explicado. Si el original cambia y un cambio deja de encontrar su sitio, el script
**falla** en vez de producir un archivo a medias.

Así se sabe siempre qué se le tocó al trabajo de Skarlet y por qué.

### Al publicar una versión nueva

Hay que **subir el número de `VERSION` en `sw.js`**. Es lo que hace que los teléfonos se traigan la
copia nueva la próxima vez que tengan internet. Si no se sube, siguen abriendo la vieja.

## Los once hitos y el ámbito del informe

La inspección se estructura en **once hitos con cincuenta y dos subpartidas**, acordados por la
**Ing. Beatriz Sevilla** con Skarlet Gómez. La fuente es el Excel *Hitos en desglose Ciudad Tiuna.
Agosto* (ADR-0018 del repositorio de contexto).

> **Única desviación del Excel, y está aprobada**: el hito 6 traía una sola subpartida, *«Instalación de
> ventanas y vidrios»*, y desde el 31-ago-2026 son **dos** —se instalan y se cuentan por separado en obra—.
> Lo pidió Skarlet Gómez y lo aprobó la Ing. Sevilla (ADR-0025). De ahí que sean 51 y no 50.
>
> Y desde el 2-sep-2026 son **52**: se sumó **8.5 Lámparas**, que era una de las filas que los inspectores
> agregaron a mano en las pruebas de campo del 31-ago. La pidió Skarlet Gómez y ratificó su unidad — `pza`.

| # | Hito | # | Hito |
| --- | --- | --- | --- |
| 1 | Estructura | 7 | Accesorios sanitarios |
| 2 | Cerramientos y albañilería | 8 | Accesorios eléctricos |
| 3 | Instalación de servicios | 9 | Ascensor |
| 4 | Acabados | 10 | Acabados exteriores y áreas comunes |
| 5 | Puertas | 11 | Pruebas |
| 6 | Ventanas | | |

### Hay un solo modo de llenado: el detallado

**El modo por hitos se retiró el 31-ago-2026** (decisión de Francisco José García Guinand; ADR-0023 del
repositorio de contexto). `?modo=hitos` ya no existe y no hay forma de empezar un informe así.

**El motivo es de medición, no de gusto.** El modo por hitos pedía **un porcentaje por hito, a ojo**. El
detallado lo **calcula**, por cantidad proyectada contra cantidad ejecutada en cada subpartida. Es la
diferencia entre **avance declarado y avance verificado**, y tener los dos vivos significaba consolidar
juntas dos cosas que no se miden igual, sin nada que las distinguiera.

> Lo que sí se conserva es **leer** un borrador viejo: un informe guardado en un teléfono en agosto con el
> modo por hitos **sigue abriéndose como se llenó**. Borrar esa parte lo volvería ilegible.

### La unidad de medida de cada subpartida

Cada subpartida lleva **su unidad al lado del nombre** —`Frisos  m²`—, en el teléfono, en el escritorio y
en el papel. Sin unidad, `12` puede ser 12 puertas o 12 m² de puerta, y el porcentaje sale igual de
convincente en los dos casos.

Las cincuenta las respondió **Skarlet Gómez** el 31-ago-2026 (ADR-0024 del repositorio de contexto):

| | Cuántas | Cuáles |
| --- | --- | --- |
| **Unidad fija** | 29 | m² en cerramientos, acabados y fachada · m³ en vaciados · pza en puertas, ventanas, vidrios y accesorios |
| **Dos unidades, se elige al llenar** | 1 | *Acero de refuerzo*: **ml o kg**, según cómo venga computada la partida |
| **Sin cantidad: sí o no** | 21 | Ver abajo |

**La unidad elegida viaja dentro del informe**, junto a la cantidad. Una cantidad sin su unidad no se puede
volver a leer dentro de un año.

> ⚠️ **Está pendiente de ratificación de la Ing. Beatriz Sevilla**, que es quien aprobó el desglose.

### Veintiuna subpartidas no se miden: se marcan por estado

Los **nueve** de *Instalación de servicios*, los **cuatro** de *Ascensor*, los **cuatro** de *Pruebas* y
**cuatro** de *Acabados exteriores* —accesos y pasillos, iluminación común, barandas, pasamanos—.

Pedir dos cantidades para «Presión de agua» obliga al inspector a escribir `1` y `1` para decir que se
hizo. En esas filas hay **cinco botones** (ADR-0026), y **volver a tocar el mismo estado lo borra**. Por
debajo siguen siendo las mismas dos cantidades, y por eso no cambió nada aguas abajo:

| Estado | Proyectada | Ejecutada | Avance |
| --- | --- | --- | --- |
| **No iniciado** | 100 | 0 | 0 % |
| **Iniciado** | 100 | 25 | 25 % |
| **En proceso** | 100 | 50 | 50 % |
| **Avanzado** | 100 | 75 | 75 % |
| **Culminado** | 100 | 100 | 100 % |
| *Sin marcar* | vacía | vacía | no entra al promedio |

**Sin marcar no es lo mismo que «No iniciado»**: lo primero no cuenta para el promedio, lo segundo es un
0 % que sí cuenta. `N/A` se conserva, que es lo que distingue **«no aplica»** de **«no se ha empezado»**.

**Cómo se ven, según dónde.** En el teléfono, los cinco en dos filas —tres y dos— con la palabra y el
porcentaje, a 44 px cada uno. En la tabla de escritorio la columna es estrecha: van los cinco porcentajes
en orden y la palabra queda en el `title`. En el papel va la palabra del estado marcado, porque el número
ya tiene su propia columna.

En los tres hitos que son **enteramente** de estados —el 3, el 9 y el 11— la columna se llama **«Estado»**
y la de proyectada se queda sin rótulo: ahí no hay ninguna cantidad. El hito 10 está mezclado —una se mide
en m² y cuatro se marcan—, así que conserva los encabezados de cantidad.

> Los informes enviados con la escala anterior de Sí/No siguen valiendo: eran 1 de 1 y 0 de 1, o sea 100 %
> y 0 %, que aquí son *Culminado* y *No iniciado*. Un borrador guardado así **se traduce solo al abrirlo**.

### La planta baja se llama Planta Baja

El desplegable de piso decía «Piso 00», que no lo dice nadie en obra. **El identificador no cambia**: la
planta baja sigue siendo `P00` —es la parte numérica de ADR-0016, ya está incrustada en nombres de archivo
de Drive, y así sigue ordenando antes del piso 01—. Un borrador guardado con «Piso 00» se abre en «Planta
Baja».

### El PDF no depende del aparato desde el que se imprime

Las reglas que convierten la tabla en tarjetas —la maqueta del teléfono— van todas dentro de
`@media screen`. **Ninguna maqueta de pantalla llega al papel.**

Esto se aprendió fallando: el 31-ago-2026 un informe impreso desde un teléfono salió en **11 páginas de
tarjetas** en vez de 4 de tabla. Las consultas de medios no llevaban `screen`, y una consulta sin tipo de
medio aplica también a la impresión — con `(pointer: coarse)`, que es cierta en cualquier teléfono mida lo
que mida la hoja, y con `!important`, que le ganaba al bloque de impresión.

Dos cosas más que el papel hace distinto, por la misma razón —que es un documento y no una pantalla—:

- **Los desplegables se imprimen como texto, no como controles.** Un `<select>` no envuelve: recorta. Por
  eso «PROYECTOS Y CONSTRUCCIONES AROA 93, C.A.» salía cortado a media palabra.
- **Lo que no se eligió no se imprime.** Un desplegable sin elegir mostraba su invitación —`unidad…`,
  `— Seleccione Inspector —`— como si fuera el dato.

## Lo que protege el trabajo en campo

| | Por qué |
| --- | --- |
| **Autoguardado** cada 2 s tras el último cambio y cada 30 s | En un teléfono con poca memoria el navegador descarta la pestaña en segundo plano. Antes solo guardaba el botón, a mano, y lo perdido no se notaba hasta abrir y ver el formulario en blanco |
| **Aviso al salir** con cambios sin guardar | Lo mismo, por la otra puerta |
| **Validación** de los campos obligatorios — ocho en apartamento, seis en torre. **El ingeniero residente no es uno de ellos**: `PA-94` dice que 20 de las 46 torres no lo tienen asignado, así que exigirlo obligaba a inventar un nombre en un documento que se firma | El número del informe se compone de ellos: sin torre queda `XX-T---P--A---------` y así se archiva para siempre. Un dato malo se corrige; un identificador malo contamina todo lo que cuelga de él |
| **`N/A` y «hito no inspeccionado»** | Un cero significa *no está construido*. «No pude entrar» y «esta torre no tiene ascensor» no son ceros: **no cuentan para el promedio**. Sin esto, todo consolidado nace sesgado hacia abajo |
| **Indicador de conexión** | El inspector sabe si «Enviar» va a funcionar antes de tocarlo |
| **Cámara, galería o archivos** | El teléfono ofrece las tres. Estuvo un tiempo forzando la cámara con `capture="environment"`, y eso impedía adjuntar una foto ya tomada — que es lo normal cuando el informe se llena al salir de la torre, o desde una computadora |
| **Seis fotografías por hito** | Tres se quedaban cortas para una patología. Se reducen solas al entrar: una imagen lisa queda en ~22 KB, y una con textura densa —cabillas, bloque, encofrado— llega a ~460 KB |
| **El residente sale de la torre** | El cuadro de Gerencia Técnica da residentes **distintos para torres de una misma contratista**. Elegir la torre pone el suyo; elegir solo la empresa lo pone **si a esa empresa le consta uno solo** —13 de las 18—, y si tiene varios avisa de que hay que elegir torre. Donde la fuente no dice nada, el campo queda en blanco y se explica qué sí consta: no se inventa un nombre en un documento que se firma |
| **Los hitos abren plegados** | Desplegados, el formulario mide 21 pantallas de teléfono; plegados, 5. Y plegados, los once con su porcentaje al lado son una lista de verificación: un guion dice «sin tocar» |
| **Leyenda de B / R / M** | No estaba escrita en ninguna parte. Diez inspectores calificando con criterios distintos alimentan la misma escala |

## Qué se corrigió respecto del original

| | Qué pasaba | Qué se hizo |
| --- | --- | --- |
| **Fotos y observaciones** | No entraban al borrador: al guardar y volver, se perdían. Era el producto de la inspección | Entran y vuelven |
| **Peso de las fotos** | Una foto de cámara no cabe en el almacenamiento del navegador | Se reducen solas al entrar, a entre ~22 KB y ~460 KB según la textura |
| **Dos librerías de internet** | Se descargaban de un CDN y **no se usaban**; sin señal, la página las esperaba en vano | Eliminadas. El PDF sale de la impresión del propio teléfono |
| **Sin funcionamiento offline** | El enlace publicado no abría sin señal | `sw.js` + `manifest.json`, con ícono en pantalla de inicio |
| **Número de informe** | Contador por teléfono, sin sector: se repetía | Compuesto (ver arriba) |
| **Logos** | Una «C» y una «G» dibujadas a mano, y el emblema oficial aproximado con polígonos | Logos reales |
| **Fotos en el PDF** | Salían de 80×65 px, ilegibles | Un tercio del ancho de página; los recuadros vacíos no se imprimen |
| **Botón «Enviar»** | Enviaba a monday.com, que ADR-0014 no adoptó | Envía al relevo de Garmel, que archiva en Drive |
| **Ámbito del informe** | Los hitos de torre y de apartamento en una sola lista | Selector de ámbito; el número lleva `TORRE` cuando corresponde |

## Lo que todavía no hace

- **Llegar a Smartsheet.** El relevo deja cada informe en Drive y anota una fila en la hoja
  *Registro de informes de inspección*. **Esa hoja es el puente**, y la carga a Smartsheet es
  retroactiva: hoy no la hace nadie automáticamente.
- **Precargar el estado anterior del apartamento.** El inspector califica las 34 subpartidas desde
  cero en cada visita, en vez de confirmar lo que no cambió desde la anterior.
- **Ponderar los hitos.** Sin los pesos, el porcentaje promedia cosas que no son comparables.

## Lo que no está probado

**Todo lo anterior está verificado en escritorio, ejecutándolo. Nada está verificado en una torre.**
Faltan las dos cosas que no se pueden saber desde un escritorio: si abre sin señal dentro de un
edificio, y cuánto almacenamiento consume un día real de fotografías.

## Aviso sobre datos

Este repositorio es **público**, porque es lo que permite publicar el enlace gratis. El formulario
lleva incrustados **nombres y números CIV** de los inspectores de Garmel y de los ingenieros
residentes de las contratistas, y los nombres de las 18 empresas. **No lleva** correos, teléfonos
ni cédulas.

El contexto del proyecto —decisiones, contradicciones, montos, datos de personal— vive en un
repositorio **privado aparte** y no debe mezclarse con este.
