#!/usr/bin/env python3
"""Corre una tanda del relevo (qc/banco/pdf/tNN*.js) con Chrome sin ventana.

Antes: estatico.py corriendo (8777) y, en <banco>/relevo/, los .gs del repositorio Garmel y la tanda.
Uso:   python3 qc/banco/pdf/headless-relevo.py <banco> t57relevo "Particion.gs,Sha.gs,Urbanismo.gs,Consolidado.gs"
Siempre carga Smartsheet.gs, PDF.gs, ListaV2.gs, Pesos.gs y Avance.gs; el tercer argumento son los demás.
"""
import sys, os, re, html, subprocess, tempfile, time, shutil
S = sys.argv.pop(1)
t, extra = sys.argv[1], (sys.argv[2] if len(sys.argv) > 2 else '')
pag = """<!doctype html><meta charset="utf-8"><title>relevo</title><body><script>
window.LOGO_GARMEL='data:image/png;base64,iVBORw0KGgo='; window.LOGO_MINHVI=window.LOGO_GARMEL;
window._nombreDeSector=function(s){return({EZ:'Ezequiel Zamora',SB:'Simón Bolívar',SR:'Simón Rodríguez'})[s]||s;};
window.Utilities={formatDate:function(){return '30-09-2026';}};
window.PropertiesService={getScriptProperties:function(){return{getProperty:function(){return null;}};}};
window.Logger={log:function(){}};
(async()=>{ var out='';
  for (const f of ['Smartsheet.gs','PDF.gs','ListaV2.gs','Pesos.gs','Avance.gs'].concat('%s'.split(',').filter(Boolean))) { try { (0,eval)(await (await fetch(f+'?'+Date.now())).text()); } catch(e){ out+='FALLO AL CARGAR '+f+': '+e.message+'\\n'; } }
  try { out += (0,eval)(await (await fetch('%s.js?'+Date.now())).text()); } catch(e){ out += 'EXCEPCIÓN: '+e.message+' | '+(e.stack||'').split('\\n').slice(0,3).join(' | '); }
  var pre=document.createElement('pre'); pre.id='__resultado'; pre.textContent=out; document.body.appendChild(pre);
})();
</script></body>""" % (extra, t)
open(os.path.join(S, 'relevo/auto.html'), 'w', encoding='utf-8').write(pag)
perfil = tempfile.mkdtemp(prefix='qc-relevo-'); salida = os.path.join(perfil, 'dom.html')
with open(salida, 'w') as f:
    proc = subprocess.Popen(["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "--headless=new", "--disable-gpu", "--no-first-run",
                             "--user-data-dir=" + perfil, "--virtual-time-budget=20000", "--dump-dom", "http://127.0.0.1:8777/relevo/auto.html"], stdout=f, stderr=subprocess.DEVNULL)
    t0 = time.time()
    while time.time() - t0 < 90 and proc.poll() is None:
        time.sleep(1)
        if "</html>" in open(salida, errors="ignore").read()[-400:]: break
    proc.kill()
d = open(salida, errors='ignore').read(); shutil.rmtree(perfil, ignore_errors=True)
m = re.search(r'<pre id="__resultado">(.*?)</pre>', d, re.S)
print(html.unescape(m.group(1)) if m else 'sin resultado')
