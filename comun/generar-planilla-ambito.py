# -*- coding: utf-8 -*-
"""Genera la planilla con la que la Ing. Beatriz Sevilla ratifica `PA-103`.

Sale de comun/ambito.py, no de una transcripción a mano: la planilla y la tabla
que después se enciende en el formulario tienen que decir lo mismo, y los nombres
de las 52 subpartidas tienen que coincidir carácter por carácter con los del
instrumento. Al escribirlos a mano se inventaron trece.

Uso:  SP=<carpeta> python3 comun/generar-planilla-ambito.py
"""
import json, html, os
D = json.load(open('/tmp/ambito.json', encoding='utf-8'))
SALIDA = os.environ['SP'] + '/ambito-subpartidas.html'
e = html.escape

CSS = """
:root{
  --ground:#f5f7f9; --surface:#ffffff; --surface-2:#eef1f5;
  --ink:#131c28; --ink-2:#4a5768; --ink-3:#7b8798;
  --line:#d8dee7;
  --torre:#1a237e; --apto:#0f766e; --ambos:#a15c07;
  --duda:#b3261e; --duda-bg:#fdf2f1; --duda-line:#e8b4b0;
  --ok:#0f766e;
}
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]){
    --ground:#0e1319; --surface:#161d26; --surface-2:#1e2732;
    --ink:#e8edf3; --ink-2:#a3b0c0; --ink-3:#75838f;
    --line:#2a343f;
    --torre:#8c9eff; --apto:#5eead4; --ambos:#fbbf24;
    --duda:#ff9d94; --duda-bg:#2a1a1a; --duda-line:#5c3330;
    --ok:#5eead4;
  }
}
:root[data-theme="dark"]{
  --ground:#0e1319; --surface:#161d26; --surface-2:#1e2732;
  --ink:#e8edf3; --ink-2:#a3b0c0; --ink-3:#75838f;
  --line:#2a343f;
  --torre:#8c9eff; --apto:#5eead4; --ambos:#fbbf24;
  --duda:#ff9d94; --duda-bg:#2a1a1a; --duda-line:#5c3330;
  --ok:#5eead4;
}
*{box-sizing:border-box}
body{margin:0;background:var(--ground);color:var(--ink);
  font-family:'IBM Plex Sans','Segoe UI',system-ui,sans-serif;font-size:16px;line-height:1.5;
  -webkit-text-size-adjust:100%}

.barra{position:sticky;top:0;z-index:20;background:var(--surface);
  border-bottom:1px solid var(--line);padding:12px 20px}
.barra .fila{max-width:820px;margin:0 auto;display:flex;align-items:baseline;
  gap:14px;flex-wrap:wrap}
.barra h1{font-family:'IBM Plex Sans Condensed','IBM Plex Sans',sans-serif;
  font-size:18px;font-weight:600;margin:0;letter-spacing:.01em}
.cuenta{font-family:'IBM Plex Mono',ui-monospace,monospace;font-size:14px;
  color:var(--ink-2);font-variant-numeric:tabular-nums;margin-left:auto}
.progreso{max-width:820px;margin:10px auto 0;height:4px;background:var(--surface-2);
  border-radius:2px;overflow:hidden}
.progreso i{display:block;height:100%;background:var(--ok);width:0;transition:width .25s}

main{max-width:820px;margin:0 auto;padding:24px 20px 96px}

.intro{background:var(--surface);border:1px solid var(--line);border-radius:10px;
  padding:20px 22px;margin-bottom:28px}
.intro h2{font-family:'IBM Plex Sans Condensed','IBM Plex Sans',sans-serif;
  font-size:16px;margin:0 0 10px;font-weight:600}
.intro p{margin:0 0 10px;color:var(--ink-2);font-size:15px;max-width:64ch}
.intro p:last-child{margin-bottom:0}
.intro b{color:var(--ink)}

.leyenda{display:flex;gap:16px;flex-wrap:wrap;margin-top:14px;
  font-size:13px;color:var(--ink-2)}
.punto{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:6px;
  vertical-align:baseline}

.hito{margin-bottom:26px}
.hito > h2{font-family:'IBM Plex Sans Condensed','IBM Plex Sans',sans-serif;
  font-size:15px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;
  color:var(--ink-2);margin:0 0 8px;padding-bottom:6px;border-bottom:1px solid var(--line);
  display:flex;justify-content:space-between;gap:12px;align-items:baseline}
.hito > h2 span{font-family:'IBM Plex Mono',monospace;font-size:12px;
  color:var(--ink-3);text-transform:none;letter-spacing:0;font-variant-numeric:tabular-nums}

.sub{background:var(--surface);border:1px solid var(--line);border-radius:8px;
  padding:12px 14px;margin-bottom:8px;display:flex;gap:14px;align-items:center;
  flex-wrap:wrap}
.sub.tiene-duda{border-left:3px solid var(--duda-line);background:var(--duda-bg)}
.sub .nombre{flex:1 1 260px;min-width:0;font-size:15px}
.sub .nombre .nueva{display:inline-block;font-family:'IBM Plex Mono',monospace;
  font-size:11px;background:var(--surface-2);border:1px solid var(--line);
  border-radius:3px;padding:1px 6px;margin-left:8px;color:var(--ink-2)}
.nota{flex:1 1 100%;font-size:13.5px;color:var(--duda);margin-top:2px;
  padding-left:2px;max-width:70ch}

.opciones{display:flex;gap:0;border:1px solid var(--line);border-radius:7px;
  overflow:hidden;background:var(--surface)}
.opciones button{appearance:none;border:none;background:transparent;cursor:pointer;
  font:inherit;font-size:13px;font-weight:600;padding:0 14px;min-height:44px;
  color:var(--ink-2);border-right:1px solid var(--line);white-space:nowrap}
.opciones button:last-child{border-right:none}
.opciones button:hover{background:var(--surface-2)}
.opciones button[aria-pressed="true"]{color:#fff}
.opciones button[data-v="T"][aria-pressed="true"]{background:var(--torre)}
.opciones button[data-v="A"][aria-pressed="true"]{background:var(--apto)}
.opciones button[data-v="AMBOS"][aria-pressed="true"]{background:var(--ambos)}
/* En tema oscuro los acentos son claros, así que el texto marcado va oscuro. */
:root[data-theme="dark"] .opciones button[aria-pressed="true"]{color:#0e1319}
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]) .opciones button[aria-pressed="true"]{color:#0e1319}
}
.opciones button:focus-visible{outline:3px solid var(--torre);outline-offset:-3px}

.previa{font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--ink-3);
  white-space:nowrap}

.pie{position:fixed;left:0;right:0;bottom:0;background:var(--surface);
  border-top:1px solid var(--line);padding:10px 20px}
.pie .fila{max-width:820px;margin:0 auto;display:flex;gap:10px;align-items:center;
  flex-wrap:wrap}
.pie .msg{font-size:13px;color:var(--ink-2);flex:1 1 auto}
.btn{appearance:none;font:inherit;font-size:14px;font-weight:600;min-height:44px;
  padding:0 18px;border-radius:8px;border:1px solid var(--line);
  background:var(--surface-2);color:var(--ink);cursor:pointer}
.btn.primario{background:var(--torre);border-color:var(--torre);color:#fff}
:root[data-theme="dark"] .btn.primario{color:#0e1319}
.btn:focus-visible{outline:3px solid var(--torre);outline-offset:2px}
@media (prefers-reduced-motion: reduce){*{transition:none !important}}
@media (max-width:560px){
  .sub{align-items:flex-start}
  .opciones{width:100%}
  .opciones button{flex:1;padding:0 6px}
}
"""

filas_html = []
n = 0
for h in D:
    cuerpo = []
    for s in h["subs"]:
        n += 1
        nueva = ' <span class="nueva">sin construir</span>' if 'NUEVA' in s["n"] else ''
        nombre = e(s["n"].replace('  «NUEVA, sin construir»', ''))
        nota = ('<div class="nota">⚠️ %s</div>' % e(s["d"])) if s["d"] else ''
        cls = ' tiene-duda' if s["d"] else ''
        etiqueta = {"T": "Torre", "A": "Apartamento", "AMBOS": "Ambos"}
        botones = ''.join(
            '<button type="button" data-v="%s" aria-pressed="false" '
            'onclick="marcar(%d,\'%s\')">%s</button>' % (v, n, v, etiqueta[v])
            for v in ("T", "A", "AMBOS"))
        cuerpo.append(
            '<div class="sub%s" id="f%d" data-previa="%s">'
            '<div class="nombre">%s%s</div>'
            '<div class="opciones">%s</div>%s</div>'
            % (cls, n, s["a"] or '', nombre, nueva, botones, nota))
    filas_html.append(
        '<section class="hito"><h2>%s <span id="c-%s">0/%d</span></h2>%s</section>'
        % (e(h["hito"]), e(h["hito"][:9].replace(':', '').replace(' ', '')),
           len(h["subs"]), ''.join(cuerpo)))

PAGINA = """<title>Ámbito de las subpartidas</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600&family=IBM+Plex+Sans+Condensed:wght@600&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>%s</style>

<div class="barra">
  <div class="fila">
    <h1>Ámbito de cada subpartida</h1>
    <div class="cuenta"><span id="hechas">0</span> / %d marcadas</div>
  </div>
  <div class="progreso"><i id="barra-i"></i></div>
</div>

<main>
  <div class="intro">
    <h2>Qué se pregunta aquí</h2>
    <p>De cada una de las <b>52 subpartidas</b> del formulario de inspección hace falta saber
       dónde se mide: <b>en la torre</b>, <b>en el apartamento</b>, o <b>en las dos</b>.</p>
    <p>Hasta ahora eso se declaraba por hito, y no alcanza. El caso que lo demuestra:
       <b>la válvula de gas</b> se pidió por apartamento, y está dentro del hito 3, que es de torre.
       Mientras el ámbito se declare por hito, una partida así <b>se pierde o se cuenta dos veces</b>.</p>
    <p>Las filas marcadas en rojo son las <b>ocho que no cuadran</b>: lo que se dijo choca con
       cómo se inspecciona en obra. Cada una explica por qué.</p>
    <p>Lo ya marcado viene de la lista de Skarlet Gómez del 1 de septiembre y de la llamada del 2.
       <b>Se puede cambiar todo.</b> Lo que quede marcado al final es lo que se construye.</p>
    <div class="leyenda">
      <span><i class="punto" style="background:var(--torre)"></i>Torre</span>
      <span><i class="punto" style="background:var(--apto)"></i>Apartamento</span>
      <span><i class="punto" style="background:var(--ambos)"></i>Ambos</span>
      <span><i class="punto" style="background:var(--duda-line)"></i>No cuadra — hay que decidir</span>
    </div>
  </div>
  %s
</main>

<div class="pie">
  <div class="fila">
    <span class="msg" id="msg">Se guarda solo en este navegador mientras marca.</span>
    <button type="button" class="btn" onclick="reiniciar()">Volver a lo propuesto</button>
    <button type="button" class="btn primario" onclick="copiar()">Copiar respuestas</button>
  </div>
</div>

<script>
const TOTAL = %d;
const CLAVE = 'garmel_ambito_subpartidas';
let estado = {};
try { estado = JSON.parse(localStorage.getItem(CLAVE) || 'null') || {}; } catch(e) { estado = {}; }

function propuesto(){
  const p = {};
  document.querySelectorAll('.sub').forEach(f => {
    const v = f.dataset.previa; if (v) p[f.id.slice(1)] = v;
  });
  return p;
}
if (!Object.keys(estado).length) estado = propuesto();

function marcar(n, v){
  estado[n] = (estado[n] === v) ? null : v;
  if (!estado[n]) delete estado[n];
  guardar(); pintar();
}
function guardar(){
  try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch(e) {}
}
function pintar(){
  let hechas = 0;
  document.querySelectorAll('.sub').forEach(f => {
    const n = f.id.slice(1), v = estado[n];
    if (v) hechas++;
    f.querySelectorAll('.opciones button').forEach(b =>
      b.setAttribute('aria-pressed', String(b.dataset.v === v)));
  });
  document.getElementById('hechas').textContent = hechas;
  document.getElementById('barra-i').style.width = (hechas / TOTAL * 100) + '%%';
  document.querySelectorAll('.hito').forEach(h => {
    const subs = [...h.querySelectorAll('.sub')];
    const m = subs.filter(f => estado[f.id.slice(1)]).length;
    h.querySelector('h2 span').textContent = m + '/' + subs.length;
  });
}
function reiniciar(){
  if (!confirm('¿Descartar lo marcado y volver a la propuesta inicial?')) return;
  estado = propuesto(); guardar(); pintar();
  document.getElementById('msg').textContent = 'Vuelto a la propuesta inicial.';
}
function copiar(){
  const lineas = [];
  document.querySelectorAll('.hito').forEach(h => {
    lineas.push('## ' + h.querySelector('h2').childNodes[0].textContent.trim());
    h.querySelectorAll('.sub').forEach(f => {
      const v = estado[f.id.slice(1)] || 'SIN MARCAR';
      lineas.push(v.padEnd(11) + ' | ' + f.querySelector('.nombre').textContent.trim());
    });
  });
  const txt = lineas.join('\\n');
  const ok = () => document.getElementById('msg').textContent =
    'Copiado. Péguelo en el correo o el chat de vuelta.';
  if (navigator.clipboard) navigator.clipboard.writeText(txt).then(ok, () => pedir(txt));
  else pedir(txt);
}
function pedir(txt){
  const t = document.createElement('textarea');
  t.value = txt; t.style.cssText = 'position:fixed;inset:10%%;width:80%%;height:80%%;z-index:99';
  document.body.appendChild(t); t.select();
  document.getElementById('msg').textContent = 'Seleccione y copie el texto, luego toque fuera.';
  t.onblur = () => t.remove();
}
pintar();
</script>
""" % (CSS, n, ''.join(filas_html), n)

open(SALIDA, 'w', encoding='utf-8').write(PAGINA)
print("OK", SALIDA, "·", n, "filas")
