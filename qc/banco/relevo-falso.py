import http.server, json, os, time
S=os.path.dirname(os.path.abspath(__file__))
ESTADO={'tipos':['inspeccion','servicios','sha','urbanismo'],'caido':False,'fallar':[],'lento':0,'clave':'qc'}
class H(http.server.BaseHTTPRequestHandler):
    historial={}
    obra={}
    obraApto={}
    oficina={}   # v133: lo archivado por número, con revisión, datos y fotos (modo oficina)
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
            if ESTADO.get('borrar'): H.historial.clear(); H.obra.clear(); H.obraApto.clear(); H.oficina.clear(); open(S+'/envios.jsonl','w').close(); ESTADO['borrar']=False
            return self._ok({'ok':True,'estado':ESTADO})
        if ESTADO['caido']:
            self.close_connection=True; return
        if ESTADO['lento']: time.sleep(ESTADO['lento'])
        p=json.loads(raw or b'{}')
        if p.get('accion')=='aplica':
            # Como el relevo r28: qué subpartidas están en el presupuesto de la torre (solo códigos).
            if p.get('torre') in ('T-17','T-18'): return self._ok({"ok":True,"sinPresupuesto":True,"codigos":None})
            if p.get('torre')=='T-56':
                # v100 (30-sep): la lista con las 13 nuevas y el hito 12 con 12.02 y 12.03; como un presupuesto
                # sin calentadores ni preliminares (t43).
                todos=[c for c in ['%d.%02d'%(h,i) for h,n in enumerate([6,3,21,13,9,2,9,9,6,9,4],1) for i in range(1,n+1)] if c not in ('7.06','7.07')]+['12.02','12.03']   # v134: 7.06 y 7.07 retiradas (CP y TR pasaron a 3.20 y 3.21)
                return self._ok({"ok":True,"contratista":"Tepuy (falso)","codigos":[c for c in todos if c not in ('1.04','7.08','7.09')]})
            # La lista de la v134 (6-oct-2026): 91 vivas, con 5.09, 10.09 y CP/TR en el hito 3 (3.20, 3.21). Antes, la de la v100 (89) y la de 79.
            todos=[c for c in ['%d.%02d'%(h,i) for h,n in enumerate([6,3,21,13,9,2,9,9,6,9,4],1) for i in range(1,n+1)] if c not in ('7.06','7.07')]+['12.02','12.03']   # v134: 7.06 y 7.07 retiradas (CP y TR pasaron a 3.20 y 3.21)
            fuera={'8.03','8.04','4.10','4.11','5.04','5.05'}
            return self._ok({"ok":True,"contratista":"Alnavic (falso)","codigos":[c for c in todos if c not in fuera]})
        if p.get('accion')=='oficina-lista':
            # Como el relevo r47 (Oficina.gs): la última revisión de cada número de la torre.
            l=[{"numero":k,"revision":v['rev'],"fecha":v['datos'].get('fecha',''),"piso":v['datos'].get('piso',''),"apto":v['datos'].get('apto',''),
                "ambito":v['datos'].get('ambito',''),"inspectores":v['datos'].get('inspectores',[]),"estatus":v['datos'].get('estatus',[]),
                "definitiva":v['datos'].get('definitiva'),"conObservacion":bool((v['datos'].get('obs_general') or '').strip()),"lista":v['datos'].get('lista','')}
               for k,v in H.oficina.items() if v['datos'].get('torre')==p.get('torre') and not v.get('tipo')]
            l.sort(key=lambda x:(x['fecha'],x['numero']),reverse=True)
            return self._ok({"ok":True,"torre":p.get('torre'),"dias":p.get('dias',14),"informes":l})
        if p.get('accion')=='oficina-abrir':
            v=H.oficina.get(p.get('numero'))
            if not v: return self._ok({"ok":False,"error":"No hay un informe archivado con el número "+str(p.get('numero'))})
            return self._ok({"ok":True,"numero":p.get('numero'),"revision":v['rev'],"datos":v['datos'],"fotos":v['fotos']})
        if p.get('accion')=='historial' and p.get('tipo')=='obra':
            # Como el relevo r27: el último de ese apartamento (o de torre) y el último de un apartamento de la torre.
            b=(p.get('bloque') or 'TORRE').upper()
            return self._ok({"ok":True,"mismo":H.obra.get((p.get('torre'),b)),"deLaTorre":H.obraApto.get(p.get('torre')) if p.get('bloque') and b!='ESTR' else None})
        if p.get('accion')=='historial':
            h=H.historial.get((p.get('tipo'),p.get('torre'))); return self._ok({"ok":True,"informe":h})
        with open(S+'/envios.jsonl','a') as f: f.write(json.dumps({"t":time.time(),"bytes":n,"numero":p.get('numero'),"tipo":p.get('tipo'),"ambito":p.get('ambito'),"fotos":[x.get('nombre') for x in (p.get('fotos') or [])],"datos":p.get('datos')}, ensure_ascii=False)+"\n")
        if p.get('clave')!=ESTADO['clave']: return self._ok({"error":"Clave incorrecta"})
        if 'numero' not in p: return self._ok({"ok":True})
        if p['numero'] in ESTADO['fallar']: return self._ok({"ok":False,"error":"fallo simulado del relevo"})
        if p.get('datos'): H.historial[(p.get('tipo'),p['datos'].get('torre'))]=p['datos']
        if p.get('datos'):
            prev=H.oficina.get(p['numero']); rev=(prev['rev']+1) if prev else 1
            H.oficina[p['numero']]={'rev':rev,'datos':p['datos'],'tipo':p.get('tipo'),'fotos':[{'nombre':x.get('nombre'),'dato':x.get('dato')} for x in (p.get('fotos') or []) if x and x.get('dato')]}
        d=p.get('datos') or {}
        if not p.get('tipo') and d.get('lista')=='v2':
            import re
            m=re.search(r'-(P\d{2}A[^-]*|ESTR)-\d{6}-',p['numero'].upper())
            r={"nro":d.get('nro'),"fecha":d.get('fecha'),"piso":d.get('piso'),"apto":d.get('apto'),"ambito":d.get('ambito'),"partidas":d.get('partidas')}
            H.obra[(d.get('torre'),m.group(1) if m else 'TORRE')]=r
            if m and m.group(1)!='ESTR': H.obraApto[d.get('torre')]=r
        self._ok({"ok":True,"numero":p['numero'],"archivos":[p['numero']+'.json',p['numero']+'.pdf']})
    def log_message(self,*a): pass
http.server.ThreadingHTTPServer(('127.0.0.1',8776),H).serve_forever()
