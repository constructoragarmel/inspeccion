import http.server, json, os, time
S=os.path.dirname(os.path.abspath(__file__))
ESTADO={'tipos':['inspeccion','servicios','sha','urbanismo'],'caido':False,'fallar':[],'lento':0,'clave':'qc'}
class H(http.server.BaseHTTPRequestHandler):
    historial={}
    def _ok(self,obj,code=200):
        b=json.dumps(obj,ensure_ascii=False).encode()
        self.send_response(code); self.send_header('Content-Type','application/json'); self.send_header('Access-Control-Allow-Origin','*')
        self.send_header('Content-Length',str(len(b))); self.end_headers(); self.wfile.write(b)
    def do_GET(self):
        if self.path.startswith('/estado'):
            return self._ok({'estado':ESTADO,'envios':sum(1 for _ in open(S+'/envios.jsonl')) if os.path.exists(S+'/envios.jsonl') else 0})
        if ESTADO['caido']:
            self.close_connection=True; return
        if ESTADO['lento']: time.sleep(ESTADO['lento'])
        self._ok({"ok":True,"version":"r21-falso","logos":True,"carpetas":True,"tipos":ESTADO['tipos']})
    def do_POST(self):
        n=int(self.headers.get('Content-Length',0)); raw=self.rfile.read(n)
        if self.path.startswith('/control'):
            ESTADO.update(json.loads(raw or b'{}'))
            if ESTADO.get('borrar'): H.historial.clear(); open(S+'/envios.jsonl','w').close(); ESTADO['borrar']=False
            return self._ok({'ok':True,'estado':ESTADO})
        if ESTADO['caido']:
            self.close_connection=True; return
        if ESTADO['lento']: time.sleep(ESTADO['lento'])
        p=json.loads(raw or b'{}')
        if p.get('accion')=='historial':
            h=H.historial.get((p.get('tipo'),p.get('torre'))); return self._ok({"ok":True,"informe":h})
        with open(S+'/envios.jsonl','a') as f: f.write(json.dumps({"t":time.time(),"bytes":n,"numero":p.get('numero'),"tipo":p.get('tipo'),"ambito":p.get('ambito'),"fotos":[x.get('nombre') for x in (p.get('fotos') or [])],"datos":p.get('datos')}, ensure_ascii=False)+"\n")
        if p.get('clave')!=ESTADO['clave']: return self._ok({"error":"Clave incorrecta"})
        if 'numero' not in p: return self._ok({"ok":True})
        if p['numero'] in ESTADO['fallar']: return self._ok({"ok":False,"error":"fallo simulado del relevo"})
        if p.get('datos'): H.historial[(p.get('tipo'),p['datos'].get('torre'))]=p['datos']
        self._ok({"ok":True,"numero":p['numero'],"archivos":[p['numero']+'.json',p['numero']+'.pdf']})
    def log_message(self,*a): pass
http.server.ThreadingHTTPServer(('127.0.0.1',8776),H).serve_forever()
