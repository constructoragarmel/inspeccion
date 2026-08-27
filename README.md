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

## Cómo se usa en campo

1. Abrir el enlace **una vez con señal**. El teléfono se guarda una copia.
2. *Agregar a pantalla de inicio* — queda con ícono, como una aplicación.
3. De ahí en adelante abre **sin señal**, indefinidamente.
4. Llenar → **🖨️ PDF** → *Guardar como PDF* → subir a la carpeta de Drive de la torre.

> **Regla de operación:** mientras no se genere el PDF y se suba, el informe existe
> **solo en ese teléfono**. Si el teléfono se pierde o se borran los datos del navegador, se
> pierde. Hay que subirlo al terminar el día.

## El número de informe

```
EZ-T05-P03A04-260828-CF
│   │    │      │      └── iniciales del inspector
│   │    │      └───────── fecha de la inspección
│   │    └──────────────── piso y apartamento
│   └───────────────────── torre
└───────────────────────── sector (EZ · SR · SB)
```

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

## Los siete hitos y el ámbito del informe

La inspección se estructura en **siete hitos con 38 ítems**, aprobados por la **Ing. Beatriz Sevilla**
(ADR-0017 del repositorio de contexto), en sustitución de las 7 partidas y 68 ítems anteriores.

Hay **dos modos de llenado** —detallado con subítems, y simplificado con un porcentaje y una observación
por hito— y **dos ámbitos**:

| Ámbito | Hitos que muestra | Piso y apartamento |
| --- | --- | --- |
| 🚪 **Apartamento** | 2 Revestimientos · 3 Arquitectura · 4 Sanitarias · 5 Eléctricas · 6 Gas e incendio | obligatorios |
| 🏢 **Torre completa** | 1 Estructura · 7 Mecánicas y áreas comunes | no aplican |

No se inspecciona un ascensor en el apartamento 3-A. **Qué hito va en qué ámbito es criterio de
ingeniería**: se cambia en la lista `HITOS_DE_TORRE`, que es una sola línea en `construir.py`.

## Lo que protege el trabajo en campo

| | Por qué |
| --- | --- |
| **Autoguardado** cada 2 s tras el último cambio y cada 30 s | En un teléfono con poca memoria el navegador descarta la pestaña en segundo plano. Antes solo guardaba el botón, a mano, y lo perdido no se notaba hasta abrir y ver el formulario en blanco |
| **Aviso al salir** con cambios sin guardar | Lo mismo, por la otra puerta |
| **Validación** de los 8 campos obligatorios | El número del informe se compone de ellos: sin torre queda `XX-T---P--A---------` y así se archiva para siempre. Un dato malo se corrige; un identificador malo contamina todo lo que cuelga de él |
| **`N/A` y «hito no inspeccionado»** | Un cero significa *no está construido*. «No pude entrar» y «esta torre no tiene ascensor» no son ceros: **no cuentan para el promedio**. Sin esto, todo consolidado nace sesgado hacia abajo |
| **Indicador de conexión** | El inspector sabe si «Enviar» va a funcionar antes de tocarlo |
| **La cámara, no la galería** | `capture="environment"` — un atributo, diez personas todos los días |
| **Seis fotografías por hito** | Tres se quedaban cortas para una patología. Ahora pesan 24 KB, no 3 MB |
| **Leyenda de B / R / M** | No estaba escrita en ninguna parte. Diez inspectores calificando con criterios distintos alimentan la misma escala |

## Qué se corrigió respecto del original

| | Qué pasaba | Qué se hizo |
| --- | --- | --- |
| **Fotos y observaciones** | No entraban al borrador: al guardar y volver, se perdían. Era el producto de la inspección | Entran y vuelven |
| **Peso de las fotos** | Una foto de cámara no cabe en el almacenamiento del navegador | Se reducen solas al entrar (≈ 280 KB → 24 KB) |
| **Dos librerías de internet** | Se descargaban de un CDN y **no se usaban**; sin señal, la página las esperaba en vano | Eliminadas. El PDF sale de la impresión del propio teléfono |
| **Sin funcionamiento offline** | El enlace publicado no abría sin señal | `sw.js` + `manifest.json`, con ícono en pantalla de inicio |
| **Número de informe** | Contador por teléfono, sin sector: se repetía | Compuesto (ver arriba) |
| **Logos** | Una «C» y una «G» dibujadas a mano, y el emblema oficial aproximado con polígonos | Logos reales |
| **Fotos en el PDF** | Salían de 80×65 px, ilegibles | Un tercio del ancho de página; los recuadros vacíos no se imprimen |
| **Botón «Enviar»** | Enviaba a monday.com, que ADR-0014 no adoptó | Envía al [relevo](../relevo-drive/) de Garmel, que archiva en Drive |
| **Ámbito del informe** | Los hitos de torre y de apartamento en una sola lista | Selector de ámbito; el número lleva `TORRE` cuando corresponde |

## Lo que todavía no hace

- **Enviar solo.** El envío automático a Drive y a Smartsheet necesita un intermediario que
  guarde la credencial. Repartir una llave de acceso en diez teléfonos no es una opción.
- **Archivar las fotos sueltas.** Hoy la fotografía queda dentro del PDF. Para poder consultarla,
  ampliarla o compararla hace falta que además se guarde como archivo en Drive.

## Aviso sobre datos

Este repositorio es **público**, porque es lo que permite publicar el enlace gratis. El formulario
lleva incrustados **nombres y números CIV** de los inspectores de Garmel y de los ingenieros
residentes de las contratistas, y los nombres de las 18 empresas. **No lleva** correos, teléfonos
ni cédulas.

El contexto del proyecto —decisiones, contradicciones, montos, datos de personal— vive en un
repositorio **privado aparte** y no debe mezclarse con este.
