import http.server, json, os, time
S=os.path.dirname(os.path.abspath(__file__))
# v168 (cambio 184): `colgar: N` archiva el envío y tarda N s en contestar (como el relevo real con muchas fotos);
# `perder: True` lee el cuerpo, no archiva nada y tarda `colgar` s en cerrar sin contestar (el cuerpo no llegó).
ESTADO={'tipos':['inspeccion','servicios','sha','urbanismo'],'caido':False,'fallar':[],'lento':0,'colgar':0,'perder':False,'clave':'qc'}
def shaClave(lugar,x):
    import re as _re
    l=str(lugar or '').strip()
    l='Toda la zona' if (not l or l.upper() in ('ZONA','TODA LA ZONA')) else l.upper()
    return _re.sub(r'\s+',' ',(l+'#'+str(x.get('frente') or '')+'|'+str(x.get('hallazgo') or '')).lower()).strip()
# Los códigos de la lista v2 por hito, para leer los % de un informe como el relevo (v190).
CODIGOS={"hito_estructura": ["1.01", "1.02", "1.03", "1.04", "1.05", "1.06"], "hito_cerramientos": ["2.01", "2.02", "2.03"], "hito_servicios": ["3.01", "3.02", "3.03", "3.04", "3.05", "3.06", "3.07", "3.08", "3.09", "3.10", "3.11", "3.12", "3.13", "3.14", "3.15", "3.16", "3.17", "3.18", "3.19", "3.20", "3.21"], "hito_acabados": ["4.01", "4.02", "4.03", "4.04", "4.05", "4.06", "4.07", "4.08", "4.09", "4.10", "4.11", "4.12", "4.13"], "hito_puertas": ["5.01", "5.02", "5.03", "5.04", "5.05", "5.06", "5.07", "5.08", "5.09"], "hito_ventanas": ["6.01", "6.02"], "hito_acc_sanitarios": ["7.01", "7.02", "7.03", "7.04", "7.05", "7.08", "7.09"], "hito_acc_electricos": ["8.01", "8.02", "8.03", "8.04", "8.05", "8.06", "8.07", "8.08", "8.09"], "hito_ascensor": ["9.01", "9.02", "9.03", "9.04", "9.05", "9.06"], "hito_exteriores": ["10.01", "10.02", "10.03", "10.04", "10.05", "10.06", "10.07", "10.08", "10.09"], "hito_pruebas": ["11.01", "11.02", "11.03", "11.04"], "hito_contra_incendio": ["12.02", "12.03"]}
class H(http.server.BaseHTTPRequestHandler):
    historial={}
    obra={}
    obraApto={}
    oficina={}   # v133: lo archivado por número, con revisión, datos y fotos (modo oficina)
    avance={}    # v190 (relevo r79, ADR-0056): {(sector, torre, prueba): {P03AA1: {nro, fecha, piso, apto, pcts}}}, como avance-torre.json
    shaEst={}    # v182 (relevo r73, ADR-0050): {(sector, lugar#frente|hallazgo): {inspector, validado}}
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
            c=json.loads(raw or b'{}')
            if 'sembrarAvance' in c:   # v190: lo que ya había en el archivo de una torre, para la planilla
                x=c.pop('sembrarAvance'); H.avance[(x['sector'],x['torre'],bool(x.get('prueba',True)))]=x['informes']
            ESTADO.update(c)
            if ESTADO.get('borrar'): H.historial.clear(); H.obra.clear(); H.obraApto.clear(); H.oficina.clear(); getattr(H,'compilados',{}).clear(); H.shaEst.clear(); H.avance.clear(); open(S+'/envios.jsonl','w').close(); ESTADO['borrar']=False
            return self._ok({'ok':True,'estado':ESTADO})
        if ESTADO['caido']:
            self.close_connection=True; return
        if ESTADO['lento']: time.sleep(ESTADO['lento'])
        p=json.loads(raw or b'{}')
        if p.get('accion')=='sha-estatus-guardar':
            # Como el relevo r73: la propuesta del inspector de SHA, por hallazgo; vacío la retira.
            if p.get('clave')!=ESTADO['clave']: return self._ok({"ok":False,"error":"Clave incorrecta"})
            if p.get('sector') not in ('EZ','SB','SR'): return self._ok({"ok":False,"error":"Sector desconocido: "+str(p.get('sector'))})
            if not (p.get('por') or '').strip(): return self._ok({"ok":False,"error":"Falta quién actualiza el estatus"})
            cs=p.get('cambios') or []
            for c in cs:
                if (c.get('estatus') or '') not in ('','Pendiente','En proceso','Corregido'): return self._ok({"ok":False,"error":"Estatus desconocido: "+str(c.get('estatus'))})
            for c in cs:
                k=(p['sector'],shaClave(c.get('torre'),c)); e=H.shaEst.get(k,{})
                if c.get('estatus'): e['inspector']={"estatus":c['estatus'],"antes":c.get('antes',''),"por":p['por'],"cuando":"2026-10-21 16:00","fecha":"2026-10-21"}
                else: e.pop('inspector',None)
                H.shaEst[k]=e
            with open(S+'/envios.jsonl','a') as f: f.write(json.dumps({"t":time.time(),"bytes":n,"numero":"SHA-ESTATUS-"+p['sector'],"tipo":"sha-estatus","ambito":"sector","fotos":[],"datos":{"por":p['por'],"cambios":cs,"prueba":bool(p.get('prueba'))}},ensure_ascii=False)+"\n")
            return self._ok({"ok":True,"guardados":len(cs),"guardado":"2026-10-21 16:00"})
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
            else: ult["sha"]={"recaudosSi":6,"recaudosNo":2,"recaudos":[{"item":"Registro Mercantil","obs":""},{"item":"RIF","obs":""}],"frentes":[{"frente":"Albañilería piso 3","hallazgo":"Trabajador sin casco","estatus":"Pendiente"},{"frente":"Área de winches","hallazgo":"Gancho ordinario en vez de mosquetón","estatus":"En proceso","deAntes":True}],"incidencias":[{"tipo":"Leve","descripcion":"Corte en la mano"}],"accion":"","accionDet":"","fotosGenerales":["Trabajador sin EPP"]}
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
            if t=='sha':   # v182: como el relevo r73, cada frente con la propuesta del inspector y lo validado
                anot=lambda fr,lug: [dict(x,**{k2:v2 for k2,v2 in H.shaEst.get((p['sector'],shaClave(lug,x)),{}).items() if k2 in ('inspector','validado')}) for x in fr]
                ren=lambda l: [dict({k3:v3 for k3,v3 in x.items() if k3 not in ('inspector','validado')},**({'propuesta':x['inspector']} if x.get('inspector') else {}),**({'validado':x['validado']} if x.get('validado') else {})) for x in l]
                ult["sha"]=dict(ult["sha"],frentes=ren(anot(ult["sha"]["frentes"],p['torre'])))
                if porTorre: porTorre=[dict(pt,sha=dict(pt['sha'],frentes=ren(anot(pt['sha']['frentes'],pt['torre'])))) for pt in porTorre]
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
            # v181 (rondas de QC del compilado por contratista): una torre que falla, una que tarda, la semana sin informes y una torre de 60.
            if p.get('torre') in (ESTADO.get('fallarTorres') or []): return self._ok({"ok":False,"error":"No se pudo leer la carpeta de la torre"})
            if (ESTADO.get('tardaTorre') or {}).get(p.get('torre')): time.sleep((ESTADO.get('tardaTorre') or {}).get(p.get('torre')))
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
            if p.get('torre')=='T-17':   # una torre de 60 apartamentos (15 pisos × A1, A2, B1, B2)
                aptos=[apto("P%02dA%s"%(pi,ap),"Piso %02d"%pi,ap,{"hito_cerramientos":(pi*7)%101,"hito_servicios":(pi*5)%101,"hito_acabados":None,"hito_ascensor":None},[]) for pi in range(1,16) for ap in ("A1","A2","B1","B2")]
                notas=[{"numero":a["numero"],"numeroRev":a["numeroRev"],"fecha":a["fecha"],"lugar":a["lugar"],"ambito":"apartamento","inspectores":a["inspectores"],"actividades":"","actividadesHeredada":False,"obs":[],"obsGeneral":"","obsSp":"","foto":None,"pdf":a["pdf"],"copiadoDe":""} for a in aptos]
            torre=None
            if p.get('torre')!='T-02':
                torre={"numero":"QC-TORRE","numeroRev":"QC-TORRE-r2","bloque":"","fecha":"2026-10-09","piso":"","apto":"","lugar":"Torre completa","inspectores":["Inspector de prueba","Otra inspectora"],
                       "pdf":"http://127.0.0.1:8777/qc-torre.pdf","pcts":{"hito_cerramientos":100,"hito_servicios":30,"hito_acabados":20,"hito_ascensor":0},"declarados":{"hito_acabados":True},"noInsp":[],"version":"Preliminar (campo)","copiadoDe":""}
                notas.insert(0,{"numero":"QC-TORRE","numeroRev":"QC-TORRE-r2","fecha":"2026-10-09","lugar":"Torre completa","ambito":"torre","inspectores":torre["inspectores"],
                    "actividades":"Vaciado de losa del piso 3","actividadesHeredada":False,"obs":[],"obsGeneral":"Observación general de prueba de la torre","obsSp":"",
                    "foto":{"id":"x","url":"http://127.0.0.1:8777/qc-foto.jpg","miniatura":"http://127.0.0.1:8777/icon-192.png","hito":"hito_cerramientos"},"pdf":torre["pdf"],"copiadoDe":""})
            if str(p.get('desde') or '')>='2026-12-01': aptos=[]; notas=[]; torre=None   # una semana sin informes en ninguna torre
            return self._ok({"ok":True,"sector":p['sector'],"sectorNombre":{"EZ":"Ezequiel Zamora","SB":"Simón Bolívar","SR":"Simón Rodríguez"}.get(p['sector'],p['sector']),
                "torre":p['torre'],"empresa":"EMPRESA DE PRUEBA, C.A.","convenio":"","desde":p.get('desde'),"hasta":p.get('hasta') or '2026-10-13',
                "hitos":hitos,"torreInforme":torre,"apartamentos":aptos,"notas":notas,"inspectores":["Inspector de prueba","Otra inspectora"],
                "nInformes":len(notas),"carpeta":"http://127.0.0.1:8777/carpeta","generado":"2026-10-13 10:00",
                # v181 (relevo r72): el % de avance físico de la app; la T-02 sin presupuesto, como una torre que no lo tiene cargado
                "avanceApp":({"sinPresupuesto":True,"torre":"EZ-T02"} if p.get('torre')=='T-02' else {"torre":"EZ-"+str(p.get('torre')).replace('-',''),"contratista":"EMPRESA DE PRUEBA","avance":38+len(str(p.get('torre'))) if p.get('torre')!='T-04' else 52,"pesoMedido":31,"apartamentos":3,"lugares":4,"informeTorre":"2026-10-09","ultimo":{"fecha":"2026-10-09","numero":"QC-TORRE"},"provisional":True,"pesosDe":"2026-10-06",
                   "partidas":[{"codigo":"2.02","nombre":"Frisos","hito":2,"ambito":"Ambos","peso":12.4,"promedio":60,"medidos":3},{"codigo":"3.01","nombre":"Tuberías de aguas blancas","hito":3,"ambito":"Ambos","peso":8.1,"promedio":29,"medidos":2},{"codigo":"9.01","nombre":"Ascensor","hito":9,"ambito":"Torre","peso":10.0,"promedio":None,"medidos":0}]}),
                "archivado":getattr(H,'compilados',{}).get((p.get('sector'),p.get('torre'),'obra',p.get('desde'),bool(p.get('prueba'))))})
        if p.get('accion')=='compilado-guardar':
            if p.get('clave')!=ESTADO['clave']: return self._ok({"ok":False,"error":"Clave incorrecta"})
            if isinstance(p.get('torres'),list) and (p.get('tipo') or 'obra')=='obra':
                # v181 (relevo r72): el de obra por contratista. Las mismas reglas que _compGuardarContratista.
                t=p.get('textos') or {}; torres=p.get('torres') or []
                if not (p.get('coordinadora') or '').strip(): return self._ok({"ok":False,"error":"Falta quién valida"})
                if not torres: return self._ok({"ok":False,"error":"El compilado no trae ninguna torre"})
                if not any((t.get(k) or '').strip() for k in ('hitos','exitos','dificultades','otros')) and not any((x.get('nota') or '').strip() for x in torres): return self._ok({"ok":False,"error":"El compilado va sin ningún comentario de la coordinación"})
                for x in torres:
                    v=str(x.get('pct') if x.get('pct') is not None else '').strip().replace('%','').replace(',','.')
                    app=((x.get('semana') or {}).get('avanceApp') or {}).get('avance')
                    if v:
                        try: vn=float(v)
                        except: return self._ok({"ok":False,"error":"El % de la "+x['torre']+" tiene que ser un número entre 0 y 100"})
                        if vn<0 or vn>100: return self._ok({"ok":False,"error":"El % de la "+x['torre']+" tiene que ser un número entre 0 y 100"})
                        if not (app is not None and abs(vn-app)<0.05) and not (x.get('motivo') or '').strip(): return self._ok({"ok":False,"error":"Falta por qué el % de la "+x['torre']+" es distinto del de la app"})
                sig=''.join(ch for ch in str(p.get('contratista') or '').upper().replace('C.A.','').replace('S.A.','').replace('INVERSIONES','').replace('CONSTRUCTORA','') if ch.isalnum())[:16] or 'CONTRATISTA'
                num=("PRUEBA-" if p.get('prueba') else "")+"CON-"+str(p.get('sector'))+"-"+sig+"-SEM-"+str(p.get('desde') or '')[2:].replace('-','')
                with open(S+'/envios.jsonl','a') as f: f.write(json.dumps({"t":time.time(),"bytes":n,"numero":num,"tipo":"compilado-obra-contratista","ambito":"contratista","fotos":[],"datos":{"textos":t,"coordinadora":p.get('coordinadora'),"desde":p.get('desde'),"hasta":p.get('hasta'),"contratista":p.get('contratista'),"torres":[{"torre":x.get('torre'),"pct":x.get('pct'),"motivo":x.get('motivo'),"nota":x.get('nota'),"nInformes":(x.get('semana') or {}).get('nInformes'),"app":((x.get('semana') or {}).get('avanceApp') or {}).get('avance')} for x in torres]}}, ensure_ascii=False)+"\n")
                H.compilados=getattr(H,'compilados',{}); antes=False
                for x in torres:
                    k=(p.get('sector'),x.get('torre'),'obra',p.get('desde'),bool(p.get('prueba'))); antes=antes or k in H.compilados
                    v=str(x.get('pct') if x.get('pct') is not None else '').strip()
                    H.compilados[k]={"textos":t,"coordinadora":p.get('coordinadora'),"guardado":"2026-10-21 10:15","numero":"x","compiladoContratista":num,"contratista":p.get('contratista'),"textosContratista":t,"nota":x.get('nota') or '',
                                     "avance":{"app":((x.get('semana') or {}).get('avanceApp') or {}).get('avance'),"validado":(float(v.replace(',','.')) if v else None),"motivo":x.get('motivo') or ''}}
                return self._ok({"ok":True,"numero":num,"archivo":num+".json","url":"http://127.0.0.1:8777/compilado.json","pdf":"http://127.0.0.1:8777/compilado.pdf","torres":[{"torre":x.get('torre')} for x in torres],"reemplazado":antes,"guardado":"2026-10-21 10:15"})
            t=p.get('textos') or {}
            if not any((t.get(k) or '').strip() for k in ('hitos','exitos','dificultades','otros')): return self._ok({"ok":False,"error":"El compilado va sin ningún comentario de la coordinación"})
            if not (p.get('coordinadora') or '').strip(): return self._ok({"ok":False,"error":"Falta quién valida"})
            est=p.get('estatus') or []
            for c in est:
                if (c.get('estatus') or '') not in ('Pendiente','En proceso','Corregido'): return self._ok({"ok":False,"error":"Estatus desconocido: "+str(c.get('estatus'))})
            for c in est:   # v182: como el relevo r73, lo que queda elegido en «Estatus hoy» se valida al enviar
                k=(p.get('sector'),shaClave(c.get('torre'),c)); e=H.shaEst.get(k,{}); e['validado']={"estatus":c['estatus'],"antes":c.get('antes',''),"por":p.get('coordinadora'),"cuando":"2026-10-21 17:00","fecha":"2026-10-21"}; H.shaEst[k]=e
            with open(S+'/envios.jsonl','a') as f: f.write(json.dumps({"t":time.time(),"bytes":n,"numero":"COMPILADO-"+str(p.get('torre')),"tipo":"compilado-"+str(p.get('tipo') or 'obra'),"ambito":"torre","fotos":[],"datos":{"textos":t,"coordinadora":p.get('coordinadora'),"desde":p.get('desde'),"hasta":p.get('hasta'),"nInformes":(p.get('semana') or {}).get('nInformes'),"estatus":est}}, ensure_ascii=False)+"\n")
            H.compilados=getattr(H,'compilados',{}); k=(p.get('sector'),p.get('torre'),p.get('tipo') or 'obra',p.get('desde'),bool(p.get('prueba'))); antes=k in H.compilados
            H.compilados[k]={"textos":t,"coordinadora":p.get('coordinadora'),"guardado":"2026-10-15 16:40","numero":"x"}   # como el relevo r65: lo archivado por semana
            return self._ok({"ok":True,"numero":("PRUEBA-" if p.get('prueba') else "")+{"servicios":"SRV-","urbanismo":"URB-","sha":"SHA-"}.get(p.get('tipo'),"")+str(p.get('sector'))+"-"+str(p.get('torre')).replace('-','')+"-SEM-"+str(p.get('desde') or '')[2:].replace('-',''),"archivo":"x.json","url":"http://127.0.0.1:8777/compilado.json","pdf":"http://127.0.0.1:8777/compilado.pdf","reemplazado":antes,"guardado":"2026-10-13 10:05","estatusValidados":len(est)})
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
        if p.get('accion')=='oficina-pdf':
            # Como el relevo r74 (Oficina.gs): el PDF de la última revisión, en base64; echa el tipo como las otras consultas.
            p['numero']=p.get('nro')
            v=H.oficina.get(p.get('numero'))
            if not v or (v.get('tipo') or None)!=(p.get('tipo') or None): return self._ok({"ok":False,"error":"No encuentro el PDF de "+str(p.get('numero'))+" en "+str(p.get('torre'))+"."})
            import base64
            nom=p.get('numero')+('-r%d'%v['rev'] if v['rev']>1 else '')
            pdf=('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 300 100]>>endobj\n% '+nom+'\ntrailer<</Root 1 0 R>>\n%%EOF\n').encode()
            ESTADO.setdefault('pdfs',[]).append(p.get('numero'))
            return self._ok({"ok":True,"tipo":p.get('tipo'),"numero":p.get('numero'),"revision":v['rev'],"archivo":nom+'.pdf',"pdf":base64.b64encode(pdf).decode()})
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
        if p.get('accion')=='planilla':
            # Como el relevo r79: el avance-torre.json de la torre, solo apartamentos.
            if p.get('clave')!=ESTADO['clave']: return self._ok({"ok":False,"error":"Clave incorrecta"})
            if not p.get('sector') or not p.get('torre'): return self._ok({"ok":False,"error":"Faltan sector o torre"})
            return self._ok({"ok":True,"torre":p['sector']+'-'+p['torre'].replace('-',''),"informes":H.avance.get((p['sector'],p['torre'],bool(p.get('prueba'))),{})})
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
        if not p.get('tipo') and d.get('lista')=='v2':   # v190: como actualizarAvanceTorre, el último % de cada apartamento
            import re as _r
            mm=_r.search(r'-(P\d{2}A[^-]*)-\d{6}-',p['numero'].upper())
            if mm:
                def _pf(r):
                    if not r or r.get('fueraDeAmbito') or str(r.get('ev') or '')=='N/A': return None
                    if str(r.get('pct') or '').strip()!='':
                        try: return max(0,min(100,int(float(str(r['pct']).replace(',','.')))))
                        except: pass
                    try: pr=float(r.get('pr') or 0)
                    except: pr=0
                    try: ej=float(r.get('ej') or 0)
                    except: ej=0
                    if pr>0: return min(100,int(ej/pr*100))
                    return 0 if str(r.get('ej'))=='0' else None
                pc={}
                for pid,filas in (d.get('partidas') or {}).items():
                    if pid.endswith('_extra') or not isinstance(filas,list): continue
                    for i,r in enumerate(filas):
                        v=_pf(r); c=(CODIGOS.get(pid) or [None]*99)[i] if i<len(CODIGOS.get(pid) or []) else None
                        if v is not None and c: pc[c]=v
                sec=p['numero'].upper().replace('PRUEBA-','').split('-')[0]; k=(sec,d.get('torre'),p['numero'].upper().startswith('PRUEBA-'))
                av=H.avance.setdefault(k,{}); ant=av.get(mm.group(1))
                if not ant or str(d.get('fecha',''))>=str(ant.get('fecha','')): av[mm.group(1)]={'nro':p['numero'],'fecha':d.get('fecha',''),'piso':d.get('piso',''),'apto':d.get('apto',''),'pcts':pc}
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
