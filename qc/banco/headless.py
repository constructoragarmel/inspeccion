#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Corre tandas del banco con Chrome sin ventana, una por proceso y con perfil nuevo (teléfono limpio).

Hace falta cuando el navegador no está a la vista: oculto, Chrome estrangula los temporizadores y las tandas de
fotos no terminan. Aquí el tiempo es virtual (--virtual-time-budget), así que no hay estrangulamiento.
OJO: sin ventana el ancho mínimo es 500 px. Las comprobaciones de maqueta (375 y 320 px) se corren en un navegador
de verdad; aquí salen en verde aunque el formulario se saliera en un teléfono.

Antes:  python3 qc/banco/preparar.py <banco>  ·  relevo-falso.py y estatico.py corriendo (8776 y 8777).
Uso:    python3 qc/banco/headless.py <banco> inspeccion:t21,t24 urbanismo:t46 [--ancho 375] [--alto 812]

Por cada página deja en el banco una copia «auto-<página>.html» con un arranque que corre la tanda del parámetro ?t=
y escribe el resultado en <pre id="__resultado">. Las tandas que recargan la página (t19, t46) vuelven a arrancar solas.
"""
import json, os, re, shutil, subprocess, sys, tempfile

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
ARRANQUE = """
<script>
window.addEventListener('load', function () { setTimeout(async function () {
  var t = new URLSearchParams(location.search).get('t');
  (0, eval)(await (await fetch('/t/correr.js?' + Date.now())).text());
  var r; try { r = await __correr(t); } catch (e) { r = { verdes: 0, total: 0, malos: [String(e)] }; }
  if ((r.malos || []).some(function (m) { return /recargando: vuelva a correr/.test(m); })) return;   // la página se está recargando
  var pre = document.createElement('pre'); pre.id = '__resultado';
  pre.textContent = JSON.stringify({ t: t, ancho: innerWidth, verdes: r.verdes, total: r.total, malos: r.malos });
  document.body.appendChild(pre);
}, 400); });
</script>
"""


def correr(banco, pagina, tanda, ancho, alto, presupuesto=120000):
    origen = os.path.join(banco, pagina + ".html")
    html = open(origen, encoding="utf-8").read()
    open(os.path.join(banco, "auto-" + pagina + ".html"), "w", encoding="utf-8").write(html.replace("</body>", ARRANQUE + "</body>"))
    perfil = tempfile.mkdtemp(prefix="qc-headless-")
    try:
        url = "http://127.0.0.1:8777/auto-%s.html?prueba=1&t=%s" % (pagina, tanda)
        # Chrome escribe el DOM cuando se agota el tiempo virtual, pero el proceso no siempre se cierra solo:
        # se lee su salida de un archivo y se le corta en cuanto está completa.
        salida = os.path.join(perfil, "dom.html")
        with open(salida, "w") as f:
            proc = subprocess.Popen([CHROME, "--headless=new", "--disable-gpu", "--no-first-run", "--user-data-dir=" + perfil,
                                     "--window-size=%d,%d" % (ancho, alto), "--virtual-time-budget=%d" % presupuesto, "--dump-dom", url],
                                    stdout=f, stderr=subprocess.DEVNULL)
            import time
            t0 = time.time()
            while time.time() - t0 < 280 and proc.poll() is None:
                time.sleep(1)
                if "</html>" in open(salida, errors="ignore").read()[-400:]:
                    break
            proc.kill()

        class r: stdout = open(salida, errors="ignore").read()
        m = re.search(r'<pre id="__resultado">(.*?)</pre>', r.stdout, re.S)
        if not m:
            return {"t": tanda, "verdes": 0, "total": 0, "malos": ["sin resultado (la tanda no terminó)"]}
        txt = m.group(1).replace("&quot;", '"').replace("&lt;", "<").replace("&gt;", ">").replace("&amp;", "&")
        return json.loads(txt)
    finally:
        shutil.rmtree(perfil, ignore_errors=True)


def main():
    args = sys.argv[1:]
    ancho, alto = 375, 812
    for clave in ("--ancho", "--alto"):
        if clave in args:
            i = args.index(clave); v = int(args[i + 1]); del args[i:i + 2]
            if clave == "--ancho": ancho = v
            else: alto = v
    banco, malas = args[0], 0
    for grupo in args[1:]:
        pagina, tandas = grupo.split(":")
        for t in tandas.split(","):
            r = correr(banco, pagina, t, ancho, alto)
            bien = r["total"] and r["verdes"] == r["total"]
            malas += 0 if bien else 1
            print("%s %-10s %-5s %s/%s  a %s px%s" % ("✅" if bien else "❌", pagina, t, r["verdes"], r["total"], r.get("ancho", "?"),
                                                    "" if bien else "\n     " + "\n     ".join(str(x)[:400] for x in r["malos"])), flush=True)
    sys.exit(1 if malas else 0)


if __name__ == "__main__":
    main()
