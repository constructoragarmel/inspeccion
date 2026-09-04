# -*- coding: utf-8 -*-
"""El ámbito de cada subpartida: ¿se mide por torre, por apartamento, o por ambos?

⚠️ NO ESTÁ EN VIGOR. `APLICAR = False`, y el formulario sigue repartiendo por
HITO como hasta ahora. Se enciende cuando la Ing. Beatriz Sevilla ratifique la
tabla (`PA-103`), igual que los once hitos estuvieron construidos y apagados
detrás de `ONCE_HITOS` hasta que Ingeniería los validó.

POR QUÉ NO SE PUEDE APLICAR LO QUE YA SE CONFIRMÓ

Skarlet Gómez confirmó el 2-sep-2026, en llamada, que los hitos 2 y 3 son «solo
torre». Aplicado tal cual —a nivel de hito, que es como funciona hoy— un informe
de APARTAMENTO dejaría de poder registrar seis cosas que sí se inspeccionan
dentro del apartamento: la tabiquería interior, las aguas blancas, el desagüe,
los cableados, las canalizaciones y la válvula de gas que ella misma pidió
agregar «por apartamento».

Ese es el hallazgo: **el ámbito no es una propiedad del hito, sino de la
subpartida.** Un hito de torre puede llevar dentro una partida de apartamento, y
mientras se declare por hito esa partida se pierde o se cuenta dos veces.

CÓMO SE LEE CADA FILA

    (subpartida, ambito, duda)

    ambito : 'T' torre · 'A' apartamento · 'AMBOS' · None si nadie lo ha dicho
    duda   : por qué esta fila no se puede dar por buena, o None

El valor de `ambito` es LO QUE SE DIJO, no lo que nos parece. Donde lo dicho
choca con cómo se inspecciona en obra, el choque va en `duda` y lo resuelve el
ingeniero responsable — no este archivo.

⚠️ LOS NOMBRES SE TOMAN DEL FORMULARIO, no se transcriben. Al escribirlos a mano
se inventaron trece de los hitos 9, 10 y 11, y la comprobación contra `PARTIDAS`
los cazó. Si un nombre no coincide carácter por carácter con el del instrumento,
esta tabla no vale para nada.
"""

APLICAR = True    # encendido el 3-sep-2026 (ADR-0028): las seis con duda van en AMBOS hasta PA-103

# Origen: la lista escrita que entregó Skarlet Gómez el 1-sep-2026, corregida
# por la llamada del 2-sep, que movió el hito 2 a torre y confirmó el 3.
AMBITO = {
"HITO 1: ESTRUCTURA": [
    ('Encofrado', 'T', None),
    ('Acero de refuerzo', 'T', None),
    ('Vaciados', 'T', None),
],
"HITO 2: CERRAMIENTOS Y ALBAÑILERÍA": [
    ('Construcción de paredes exteriores', 'T', None),
    ('Tabiquería interior', 'T',
     'La tabiquería interior se levanta DENTRO del apartamento. Con el hito 2 en torre no hay dónde reportarla en un informe de apartamento.'),
    ('Impermeabilización de azotea', 'T', None),
],
"HITO 3: INSTALACIÓN DE SERVICIOS": [
    ('Sanitarias y pluviales — Aguas blancas', 'T',
     'Las aguas blancas llegan hasta dentro del apartamento.'),
    ('Sanitarias y pluviales — Desagüe', 'T',
     'El desagüe del apartamento se inspecciona en el apartamento.'),
    ('Sanitarias y pluviales — Bajante de aguas de lluvias', 'T', None),
    ('Eléctricas y datos — Cableados', 'T',
     'El cableado del apartamento se inspecciona en el apartamento.'),
    ('Eléctricas y datos — Tableros principales', 'T', None),
    ('Eléctricas y datos — Canalizaciones', 'T',
     'Las canalizaciones van también por dentro del apartamento.'),
    ('Eléctricas y datos — Equipamiento de cuarto de módulos', 'T', None),
    ('Gas — Montante', 'T', None),
    ('Gas — Manifold', 'T', None),
    ('Gas — Válvula  «NUEVA, sin construir»', 'A',
     'Pedida por apartamento DENTRO de un hito de torre: es el caso que demuestra que el ámbito es de la subpartida. Y existe ya en el formulario de servicios, así que construirla en los dos la mediría dos veces (PA-104).'),
],
"HITO 4: ACABADOS": [
    ('Frisos', 'AMBOS',
     'En un informe de torre, los frisos de un pasillo caben aquí y en el hito 10. Skarlet dijo que las áreas comunes van a la torre. ¿Se separa creando «Frisos» dentro del hito 10?'),
    ('Encamisados', 'AMBOS', None),
    ('Cerámica en paredes', 'AMBOS', None),
    ('Cerámica en pisos', 'AMBOS', None),
    ('Construcción de sobrepisos', 'AMBOS', None),
    ('Pintura en paredes', 'AMBOS', None),
    ('Texturizado de techos', 'AMBOS', None),
],
"HITO 5: PUERTAS": [
    ('Puertas metálicas', 'A', None),
    ('Puertas de servicios', 'A', None),
    ('Puertas de madera', 'A', None),
],
"HITO 6: VENTANAS": [
    ('Instalación de ventanas', 'A', None),
    ('Instalación de vidrios', 'A', None),
],
"HITO 7: ACCESORIOS SANITARIOS": [
    ('Ducha', 'A', None),
    ('Fregadero de acero inoxidable', 'A', None),
    ('W.C.', 'A', None),
    ('Lavamanos', 'A', None),
    ('Batea', 'A', None),
    ('C.P.', 'A', None),
    ('T.R.', 'A', None),
],
"HITO 8: ACCESORIOS ELÉCTRICOS": [
    ('Tomacorrientes', 'A', None),
    ('Interruptores', 'A', None),
    ('Toma de data', 'A', None),
    ('Breakers', 'A', None),
    ('Lámparas', 'A', None),
],
"HITO 9: ASCENSOR": [
    ('Adecuación y verificación de plomada en foso y cuarto de máquina', 'T', None),
    ('Instalación de guías, rieles y soporte estructural en la caja', 'T', None),
    ('Montaje de cabina, motor y contrapeso', 'T', None),
    ('Instalación de puertas de piso, botoneras y sistema electrónico de control', 'T', None),
],
"HITO 10: ACABADOS EXTERIORES Y ÁREAS COMUNES": [
    ('Revestimiento y pintura de fachada exterior', 'T', None),
    ('Adecuación de accesos y pasillos', 'T', None),
    ('Instalación de iluminación en común', 'T', None),
    ('Instalación de barandas', 'T', None),
    ('Instalación de pasamanos escaleras', 'T', None),
],
"HITO 11: PRUEBAS": [
    ('Presión de agua', 'AMBOS', None),
    ('Hermeticidad', 'AMBOS', None),
    ('Carga eléctrica', 'AMBOS', None),
    ('Pruebas de cargas, velocidad y certificación de seguridad de ascensores', 'T',
     'El hito 9 —el del ascensor— es solo de torre, y es el mismo ascensor. Lo afirmó Stephanie en la llamada y Skarlet no lo objetó, pero no hay un sí explícito. Se deja en torre (ADR-0028, 3-sep-2026); no está entre las seis de PA-103.'),
],
}


def filas():
    for hito, subs in AMBITO.items():
        for nombre, amb, duda in subs:
            yield hito, nombre, amb, duda


def resumen():
    t = list(filas())
    return {"subpartidas": len(t),
            "torre":       sum(1 for _, _, a, _ in t if a == "T"),
            "apartamento": sum(1 for _, _, a, _ in t if a == "A"),
            "ambos":       sum(1 for _, _, a, _ in t if a == "AMBOS"),
            "sin_definir": sum(1 for _, _, a, _ in t if a is None),
            "con_duda":    sum(1 for _, _, _, d in t if d)}


if __name__ == "__main__":
    print("APLICAR =", APLICAR, "— el formulario sigue repartiendo por hito")
    for k, v in resumen().items():
        print("  %-12s %s" % (k, v))
