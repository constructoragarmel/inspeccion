import http.server, json, os, time
S=os.path.dirname(os.path.abspath(__file__))
# v168 (cambio 184): `colgar: N` archiva el envío y tarda N s en contestar (como el relevo real con muchas fotos);
# `perder: True` lee el cuerpo, no archiva nada y tarda `colgar` s en cerrar sin contestar (el cuerpo no llegó).
ESTADO={'tipos':['inspeccion','servicios','sha','urbanismo'],'caido':False,'fallar':[],'lento':0,'colgar':0,'perder':False,'clave':'qc'}
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
            if ESTADO.get('borrar'): H.historial.clear(); H.obra.clear(); H.obraApto.clear(); H.oficina.clear(); getattr(H,'compilados',{}).clear(); open(S+'/envios.jsonl','w').close(); ESTADO['borrar']=False
            return self._ok({'ok':True,'estado':ESTADO})
        if ESTADO['caido']:
            self.close_connection=True; return
        if ESTADO['lento']: time.sleep(ESTADO['lento'])
        p=json.loads(raw or b'{}')
        if p.get('accion')=='compilado-manzanas':
            if p.get('clave')!=ESTADO['clave']: return self._ok({"ok":False,"error":"Clave incorrecta"})
            return self._ok({"ok":True,"sector":p.get('sector'),"manzanas":["M-1 L1","M-5","M-6"] if p.get('sector')=='EZ' else []})
        if p.get('accion')=='compilado-semana' and p.get('tipo') in ('servicios','urbanismo','sha'):
            if p.get('clave')!=ESTADO['clave']: return self._ok({"ok":False,"error":"Clave incorrecta"})
            if not p.get('sector') or not p.get('torre'): return self._ok({"ok":False,"error":"Faltan sector o torre"})
            t=p['tipo']; nro={"servicios":"SRV-QC-T01-261009-OP","urbanismo":"URB-QC-M6-261009-ER","sha":"SHA-QC-T01-261009-VM"}[t]
            ult={"numero":nro,"numeroRev":nro,"fecha":"2026-10-09","inspectores":["Inspector de prueba"],"pdf":"http://127.0.0.1:8777/qc-"+t+".pdf","estatus":["En progreso"]}
            if t=='servicios': ult["entes"]=[{"ente":"PDVSA Gas","servicios":[{"id":"srv_gas","nombre":"PDVSA / GAS DOMÉSTICO","total":5,"si":3,"no":2,"na":0,"sinResponder":0,"faltan":[{"item":"Regulación secundaria","obs":"sin válvula"},{"item":"Prueba de hermeticidad","obs":""}],"obs":"Gas en proceso","noInsp":False}]},
                {"ente":"Hidroven","servicios":[{"id":"srv_agua","nombre":"AGUA POTABLE","total":4,"si":4,"no":0,"na":0,"sinResponder":0,"faltan":[],"obs":"","noInsp":False},{"id":"srv_pluviales","nombre":"AGUAS PLUVIALES","total":3,"si":0,"no":0,"na":0,"sinResponder":3,"faltan":[],"obs":"","noInsp":True}]}]
            elif t=='urbanismo': ult["actividades"]="Bote de material y desmalezamiento"; ult["secciones"]=[{"id":"urb_preliminares","nombre":"OBRAS PRELIMINARES","items":[{"nombre":"Bote de material","cant":"449","pr":"","ud":"m³","obs":"","camiones":2,"viajes":5,"m3":82,"maquinaria":"Retroexcavadora de prueba"}],"obs":""},{"id":"urb_drenaje","nombre":"DRENAJE","items":[],"obs":"Sin avance esta semana"}]
            else: ult["sha"]={"recaudosSi":6,"recaudosNo":2,"recaudos":[{"item":"Registro Mercantil","obs":""},{"item":"RIF","obs":""}],"frentes":[{"frente":"Albañilería piso 3","hallazgo":"Trabajador sin casco","estatus":"Pendiente"}],"incidencias":[{"tipo":"Leve","descripcion":"Corte en la mano"}],"accion":"","accionDet":"","fotosGenerales":["Trabajador sin EPP"]}
            porTorre=None
            if t=='servicios' and p.get('torre')=='URBANISMO':
                # Como el relevo r64: todo el urbanismo, el último informe de cada torre y el de toda la zona.
                porTorre=[dict(ult,torre='Toda la zona',numero='SRV-QC-ZONA-261009-OP',numeroRev='SRV-QC-ZONA-261009-OP'),dict(ult,torre='T-01')]
            if t=='sha' and p.get('torre')=='URBANISMO':
                # Como el relevo r68: SHA de todas las torres y de toda la zona, con la contratista; una torre sin frentes.
                porTorre=[dict(ult,torre='Toda la zona',numero='SHA-QC-ZONA-261009-VM',numeroRev='SHA-QC-ZONA-261009-VM',empresa=''),dict(ult,torre='T-01',empresa='CONSTRUCTORA RÍO LIMÓN, C.A.'),dict(ult,torre='T-05',empresa='INVERSIONES ALNAVIC, C.A.',sha=dict(ult['sha'],frentes=[]))]
            if t=='urbanismo' and p.get('torre')=='URBANISMO':
                # Como el relevo r68: urbanismo de todas las manzanas y de toda la zona; una manzana sin cantidades.
                porTorre=[dict(ult,torre='Toda la zona',numero='URB-QC-ZONA-261009-GB',numeroRev='URB-QC-ZONA-261009-GB'),dict(ult,torre='M-6'),dict(ult,torre='M-1',numero='URB-QC-M1-261008-MR',numeroRev='URB-QC-M1-261008-MR',secciones=[],actividades='Replanteo')]
            notas=[{"numero":nro,"numeroRev":nro,"fecha":"2026-10-09","lugar":("Manzana M-6" if t=='urbanismo' else t.upper()+" de la torre "+p['torre']),"inspectores":["Inspector de prueba"],"obs":[{"hito":"x","nombre":"Sección de prueba","texto":"Observación de prueba de "+t}],"obsGeneral":"General de "+t,"actividades":"","actividadesHeredada":False,"foto":None,"pdf":ult["pdf"]}]
            if porTorre and t=='servicios': notas=notas+[dict(notas[0],numero='SRV-QC-ZONA-261009-OP',numeroRev='SRV-QC-ZONA-261009-OP',lugar='SERVICIOS de toda la zona')]
            if porTorre and t=='sha': notas=notas+[dict(notas[0],numero='SHA-QC-ZONA-261009-VM',numeroRev='SHA-QC-ZONA-261009-VM',lugar='SHA de toda la zona')]
            if porTorre and t=='urbanismo': notas=notas+[dict(notas[0],numero='URB-QC-ZONA-261009-GB',numeroRev='URB-QC-ZONA-261009-GB',lugar='Urbanismo de toda la zona')]
            r=dict({"ok":True,"tipo":t,"sector":p['sector'],"sectorNombre":{"EZ":"Ezequiel Zamora","SB":"Simón Bolívar","SR":"Simón Rodríguez"}.get(p['sector'],p['sector']),"torre":p['torre'],"empresa":"EMPRESA DE PRUEBA, C.A.","desde":p.get('desde'),"hasta":p.get('hasta') or '2026-10-13',
                "ultimo":ult,"notas":notas,"inspectores":["Inspector de prueba"],"nInformes":1,"carpeta":"http://127.0.0.1:8777/carpeta","conPruebas":bool(p.get('prueba')),"generado":"2026-10-13 10:00"})
            if porTorre: r.update({"porTorre":porTorre,"nInformes":len(notas),"empresa":"","torre":"URBANISMO"})
            r["archivado"]=getattr(H,'compilados',{}).get((p.get('sector'),p.get('torre'),t,p.get('desde'),bool(p.get('prueba'))))
            if porTorre and str(p.get('desde') or '')>='2026-12-01': r.update({"porTorre":[],"nInformes":0,"notas":[],"ultimo":None,"inspectores":[]})   # semana sin informes
            return self._ok(r)
        if p.get('accion')=='compilado-semana':
            # v151: la semana de una torre como la arma el relevo r53 (Compilado.gs). Sin clave buena, 'Clave incorrecta'.
            if p.get('clave')!=ESTADO['clave']: return self._ok({"ok":False,"error":"Clave incorrecta"})
            if not p.get('sector') or not p.get('torre'): return self._ok({"ok":False,"error":"Faltan sector o torre"})
            hitos=[{"id":"hito_cerramientos","numero":"2","nombre":"HITO 2: CERRAMIENTOS","corto":"Albañilería","torre":True,"apto":True},
                   {"id":"hito_servicios","numero":"3","nombre":"HITO 3: INSTALACIÓN DE SERVICIOS","corto":"Servicios","torre":True,"apto":True},
                   {"id":"hito_acabados","numero":"4","nombre":"HITO 4: ACABADOS","corto":"Acabados","torre":True,"apto":True},
                   {"id":"hito_ascensor","numero":"9","nombre":"HITO 9: ASCENSOR","corto":"Ascensor","torre":True,"apto":False}]
            apto=lambda b,piso,ap,pc,ni: {"numero":"QC-"+b,"numeroRev":"QC-"+b,"bloque":b,"fecha":"2026-10-08","piso":piso,"apto":ap,"lugar":piso+" · Apto. "+ap,
                   "inspectores":["Inspector de prueba"],"pdf":"http://127.0.0.1:8777/qc-"+b+".pdf","pcts":pc,"declarados":{},"noInsp":ni,"version":"Preliminar (campo)","copiadoDe":""}
            aptos=[apto("P01AA1","Piso 01","A1",{"hito_cerramientos":100,"hito_servicios":45,"hito_acabados":None,"hito_ascensor":None},["hito_acabados"]),
                   apto("P01AB1","Piso 01","B1",{"hito_cerramientos":80,"hito_servicios":None,"hito_acabados":12,"hito_ascensor":None},[]),
                   apto("P02AA1","Piso 02","A1",{"hito_cerramientos":50,"hito_servicios":0,"hito_acabados":None,"hito_ascensor":None},[])]
            notas=[{"numero":a["numero"],"numeroRev":a["numeroRev"],"fecha":a["fecha"],"lugar":a["lugar"],"ambito":"apartamento","inspectores":a["inspectores"],
                    "actividades":"","actividadesHeredada":False,"obs":([] if a["bloque"]=="P02AA1" else [{"hito":"hito_servicios","nombre":"HITO 3: INSTALACIÓN DE SERVICIOS","texto":"Observación de prueba del hito 3 en "+a["apto"]}]),
                    "obsGeneral":"","obsSp":"","foto":None,"pdf":a["pdf"],"copiadoDe":""} for a in aptos]
            torre=None
            if p.get('torre')!='T-02':
                torre={"numero":"QC-TORRE","numeroRev":"QC-TORRE-r2","bloque":"","fecha":"2026-10-09","piso":"","apto":"","lugar":"Torre completa","inspectores":["Inspector de prueba","Otra inspectora"],
                       "pdf":"http://127.0.0.1:8777/qc-torre.pdf","pcts":{"hito_cerramientos":100,"hito_servicios":30,"hito_acabados":20,"hito_ascensor":0},"declarados":{"hito_acabados":True},"noInsp":[],"version":"Preliminar (campo)","copiadoDe":""}
                notas.insert(0,{"numero":"QC-TORRE","numeroRev":"QC-TORRE-r2","fecha":"2026-10-09","lugar":"Torre completa","ambito":"torre","inspectores":torre["inspectores"],
                    "actividades":"Vaciado de losa del piso 3","actividadesHeredada":False,"obs":[],"obsGeneral":"Observación general de prueba de la torre","obsSp":"",
                    "foto":{"id":"x","url":"http://127.0.0.1:8777/qc-foto.jpg","miniatura":"http://127.0.0.1:8777/icon-192.png","hito":"hito_cerramientos"},"pdf":torre["pdf"],"copiadoDe":""})
            return self._ok({"ok":True,"sector":p['sector'],"sectorNombre":{"EZ":"Ezequiel Zamora","SB":"Simón Bolívar","SR":"Simón Rodríguez"}.get(p['sector'],p['sector']),
                "torre":p['torre'],"empresa":"EMPRESA DE PRUEBA, C.A.","convenio":"","desde":p.get('desde'),"hasta":p.get('hasta') or '2026-10-13',
                "hitos":hitos,"torreInforme":torre,"apartamentos":aptos,"notas":notas,"inspectores":["Inspector de prueba","Otra inspectora"],
                "nInformes":len(notas),"carpeta":"http://127.0.0.1:8777/carpeta","generado":"2026-10-13 10:00",
                "archivado":getattr(H,'compilados',{}).get((p.get('sector'),p.get('torre'),'obra',p.get('desde'),bool(p.get('prueba'))))})
        if p.get('accion')=='compilado-guardar':
            if p.get('clave')!=ESTADO['clave']: return self._ok({"ok":False,"error":"Clave incorrecta"})
            t=p.get('textos') or {}
            if not any((t.get(k) or '').strip() for k in ('hitos','exitos','dificultades','otros')): return self._ok({"ok":False,"error":"El compilado va sin ningún comentario de la coordinación"})
            if not (p.get('coordinadora') or '').strip(): return self._ok({"ok":False,"error":"Falta quién valida"})
            with open(S+'/envios.jsonl','a') as f: f.write(json.dumps({"t":time.time(),"bytes":n,"numero":"COMPILADO-"+str(p.get('torre')),"tipo":"compilado-"+str(p.get('tipo') or 'obra'),"ambito":"torre","fotos":[],"datos":{"textos":t,"coordinadora":p.get('coordinadora'),"desde":p.get('desde'),"hasta":p.get('hasta'),"nInformes":(p.get('semana') or {}).get('nInformes')}}, ensure_ascii=False)+"\n")
            H.compilados=getattr(H,'compilados',{}); k=(p.get('sector'),p.get('torre'),p.get('tipo') or 'obra',p.get('desde'),bool(p.get('prueba'))); antes=k in H.compilados
            H.compilados[k]={"textos":t,"coordinadora":p.get('coordinadora'),"guardado":"2026-10-15 16:40","numero":"x"}   # como el relevo r65: lo archivado por semana
            return self._ok({"ok":True,"numero":("PRUEBA-" if p.get('prueba') else "")+{"servicios":"SRV-","urbanismo":"URB-","sha":"SHA-"}.get(p.get('tipo'),"")+str(p.get('sector'))+"-"+str(p.get('torre')).replace('-','')+"-SEM-"+str(p.get('desde') or '')[2:].replace('-',''),"archivo":"x.json","url":"http://127.0.0.1:8777/compilado.json","pdf":"http://127.0.0.1:8777/compilado.pdf","reemplazado":antes,"guardado":"2026-10-13 10:05"})
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
        if p.get('accion')=='copiar-fuentes' and p.get('tipo') in ('servicios','sha','urbanismo'):
            # Como el relevo r50: para los otros tres tipos, los informes de esas torres con respuestas, y el tipo de vuelta.
            torres=p.get('torres') or [p.get('torre')]
            def resp(d): return sum(1 for g in (d.get('general') or []) for it in (g.get('items') or []) if it and any(str(it.get(k) or '').strip() for k in ('sn','obs','cant','cantidad','calidad','cal')))+len(d.get('apartamentos') or [])
            l=[{"nro":k,"torre":v['datos'].get('torre'),"fecha":v['datos'].get('fecha',''),"filas":resp(v['datos']),"revision":v['rev']}
               for k,v in H.oficina.items() if v.get('tipo')==p.get('tipo') and v['datos'].get('torre') in torres and (k.startswith('PRUEBA-')==bool(p.get('prueba')))]
            l=[x for x in l if x['filas']>0]; l.sort(key=lambda x:(x['fecha'],x['nro']),reverse=True)
            return self._ok({"ok":True,"tipo":p.get('tipo'),"fuentes":l})
        if p.get('accion')=='copiar-abrir' and p.get('tipo') in ('servicios','sha','urbanismo'):
            v=H.oficina.get(p.get('numero'))
            if not v or v.get('tipo')!=p.get('tipo'): return self._ok({"ok":False,"error":"No hay un informe archivado con el número "+str(p.get('numero'))})
            return self._ok({"ok":True,"tipo":p.get('tipo'),"nro":p.get('numero'),"torre":v['datos'].get('torre'),"fecha":v['datos'].get('fecha',''),"revision":v['rev'],"datos":v['datos']})
        if p.get('accion')=='oficina-lista' and p.get('tipo') in ('servicios','sha','urbanismo'):
            l=[{"numero":k,"revision":v['rev'],"fecha":v['datos'].get('fecha',''),"lugar":v['datos'].get('torre',''),"inspectores":v['datos'].get('inspectores',[]),"definitiva":v['datos'].get('definitiva')}
               for k,v in H.oficina.items() if v.get('tipo')==p.get('tipo') and v['datos'].get('torre')==p.get('torre')]
            l.sort(key=lambda x:(x['fecha'],x['numero']),reverse=True)
            return self._ok({"ok":True,"tipo":p.get('tipo'),"torre":p.get('torre'),"dias":p.get('dias',14),"informes":l})
        if p.get('accion')=='oficina-abrir' and p.get('tipo') in ('servicios','sha','urbanismo'):
            v=H.oficina.get(p.get('numero'))
            if not v or v.get('tipo')!=p.get('tipo'): return self._ok({"ok":False,"error":"No hay un informe archivado con el número "+str(p.get('numero'))})
            return self._ok({"ok":True,"tipo":p.get('tipo'),"numero":p.get('numero'),"revision":v['rev'],"datos":v['datos'],"fotos":v['fotos']})
        if p.get('accion')=='copiar-fuentes':
            # Como el relevo r49 (Copiar.gs): informes de la lista v2 del mismo ámbito en esas torres, con filas medidas.
            torres=p.get('torres') or [p.get('torre')]; amb='torre' if p.get('ambito')=='torre' else 'apartamento'
            def filas(pt): return sum(1 for pid,a in (pt or {}).items() if not pid.endswith('_extra') and isinstance(a,list) for it in a if it and not it.get('fueraDeAmbito') and any(str(it.get(k) or '').strip() for k in ('pr','ej','sn','pct')))
            l=[{"nro":k,"torre":v['datos'].get('torre'),"piso":v['datos'].get('piso',''),"apto":v['datos'].get('apto',''),"fecha":v['datos'].get('fecha',''),"filas":filas(v['datos'].get('partidas')),"revision":v['rev']}
               for k,v in H.oficina.items() if not v.get('tipo') and v['datos'].get('torre') in torres and (v['datos'].get('ambito') or 'apartamento')==amb and (v['datos'].get('vista') or '')==(p.get('vista') or '') and v['datos'].get('lista')=='v2']
            l=[x for x in l if x['filas']>0]; l.sort(key=lambda x:(x['fecha'],x['nro']),reverse=True)
            return self._ok({"ok":True,"fuentes":l})
        if p.get('accion')=='copiar-abrir':
            v=H.oficina.get(p.get('numero'))
            if not v: return self._ok({"ok":False,"error":"No hay un informe archivado con el número "+str(p.get('numero'))})
            d=v['datos']; return self._ok({"ok":True,"nro":p.get('numero'),"torre":d.get('torre'),"piso":d.get('piso',''),"apto":d.get('apto',''),"fecha":d.get('fecha',''),"partidas":d.get('partidas',{})})
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
        if p.get('accion')=='existe':
            # Como el relevo r62: ¿ese número exacto ya está archivado? Lleva `nro`, no `numero`. `hace` en segundos.
            if p.get('clave')!=ESTADO['clave']: return self._ok({"ok":False,"error":"Clave incorrecta"})
            if not p.get('nro') or not p.get('sector') or not p.get('torre'): return self._ok({"ok":False,"error":"Faltan nro, sector o torre"})
            v=H.oficina.get(p['nro'])
            if not v: return self._ok({"ok":True,"existe":False,"nro":p['nro']})
            ult=p['nro']+('-r%d'%v['rev'] if v['rev']>1 else '')+'.json'
            return self._ok({"ok":True,"existe":True,"nro":p['nro'],"archivos":[ult],"ultimo":ult,"hace":int(time.time()-v.get('t',0)),"guardado":(v['datos'] or {}).get('guardado','')})
        if ESTADO.get('perder'):
            time.sleep(ESTADO.get('colgar') or 0); self.close_connection=True; return
        with open(S+'/envios.jsonl','a') as f: f.write(json.dumps({"t":time.time(),"bytes":n,"numero":p.get('numero'),"tipo":p.get('tipo'),"ambito":p.get('ambito'),"fotos":[x.get('nombre') for x in (p.get('fotos') or [])],"datos":p.get('datos')}, ensure_ascii=False)+"\n")
        if p.get('clave')!=ESTADO['clave']: return self._ok({"error":"Clave incorrecta"})
        if 'numero' not in p: return self._ok({"ok":True})
        if p['numero'] in ESTADO['fallar']: return self._ok({"ok":False,"error":"fallo simulado del relevo"})
        if p.get('datos'): H.historial[(p.get('tipo'),p['datos'].get('torre'))]=p['datos']
        if p.get('datos'):
            prev=H.oficina.get(p['numero']); rev=(prev['rev']+1) if prev else 1
            H.oficina[p['numero']]={'rev':rev,'t':time.time(),'datos':p['datos'],'tipo':p.get('tipo'),'fotos':[{'nombre':x.get('nombre'),'dato':x.get('dato')} for x in (p.get('fotos') or []) if x and x.get('dato')]}
        d=p.get('datos') or {}
        if not p.get('tipo') and d.get('lista')=='v2':
            import re
            m=re.search(r'-(P\d{2}A[^-]*|ESTR)-\d{6}-',p['numero'].upper())
            r={"nro":d.get('nro'),"fecha":d.get('fecha'),"piso":d.get('piso'),"apto":d.get('apto'),"ambito":d.get('ambito'),"partidas":d.get('partidas')}
            H.obra[(d.get('torre'),m.group(1) if m else 'TORRE')]=r
            if m and m.group(1)!='ESTR': H.obraApto[d.get('torre')]=r
        if ESTADO.get('colgar'): time.sleep(ESTADO['colgar'])   # ya archivado: la respuesta es lo que tarda
        self._ok({"ok":True,"numero":p['numero'],"archivos":[p['numero']+'.json',p['numero']+'.pdf']})
    def log_message(self,*a): pass
http.server.ThreadingHTTPServer(('127.0.0.1',8776),H).serve_forever()
