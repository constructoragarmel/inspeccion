// ESTRÉS 3 · v188 (27-oct-2026): QC12 a QC14, en SERVICIOS, SHA y URBANISMO (se corre en cada uno, ?prueba=1, 375 px). Sin datos reales.
// QC12 el buscador con el relevo caído, lento y vuelta a la normalidad; 60 días; filtro sobre lo de cada formulario · QC13 «Ver PDF»
// tocado tres veces mientras el relevo tarda, y el aviso de error si el relevo no tiene ese PDF; «Abrir para corregir» después sigue
// igual · QC14 «Copiar de otra torre» con ocho torres de la contratista pide de a dos y espera aunque el relevo tarde 6 s, y los
// títulos del inspector siguen en todos los desplegables.
const CL = CLAVE_LISTA, T = TIPO_INFORME;
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem(CL, '[]');
localStorage.removeItem(CLAVE_TORRES); localStorage.removeItem(CLAVE_ACTUAL);
await Q.relevo({ caido: false, fallar: [], lento: 0, colgar: 0, perder: false, borrar: true });
Q.aceptar = true;
const sel = (id, v) => { const e = document.getElementById(id); if (!e) return; e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const LUGAR = T === 'urbanismo' ? [...document.getElementById('torre').options].map(o => o.value).filter(Boolean)[0] : 'T-01';
const contestar = () => { const item = document.querySelector('[id^="items-"] .item'); const si = item && [...item.querySelectorAll('button')].find(b => /^S[ií]$/i.test(b.textContent.trim())); if (si) si.click(); else { const c = item && (item.querySelector('.hoy') || item.querySelector('.cant')); if (c) { c.value = '7'; c.dispatchEvent(new Event('input', { bubbles: true })); } } };
const NROS = [];
for (const f of ['2026-10-20', '2026-10-24', '2026-10-26']) {
  nuevoInforme(); await esperar(250); sel('convenio', 'Convenio Bielorrusos'); sel('torre', LUGAR); sel('fecha', f); await esperar(500);
  if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
  const ins = document.querySelector('#inspectores select'); Q.elegir(ins, [...ins.options].map(o => o.value).filter(v => v && v !== 'OTRO')[NROS.length % 2]);
  const est = document.getElementById('estatus'); if (est && est.tagName === 'SELECT') est.value = [...est.options].map(o => o.value).filter(Boolean)[0];
  contestar(); guardar(false); await esperar(300); const d = listaGuardada().find(b => !b.enviado); NROS.push(d.nro); await enviarSolo(d.id); await esperar(700);
}
localStorage.setItem(CL, '[]'); nuevoInforme(); await esperar(250); sel('convenio', 'Convenio Bielorrusos'); sel('torre', LUGAR); await esperar(400);
if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
_ES_OFICINA = true; _oficinaMostrar();
// ── QC12 ──
await Q.relevo({ caido: true }); await oficinaBuscar(); await esperar(200);
const caido = $('#ofi-lista').innerText;
await Q.relevo({ caido: false, lento: 3 }); const t0 = Date.now(); await oficinaBuscar(); const tard = Date.now() - t0; await Q.relevo({ lento: 0 });
const filas = () => $$('#ofi-lista table tr').slice(1).filter(tr => tr.style.display !== 'none');
ok('QC12a · Relevo caído: lo dice; lento (3 s): espera y trae los tres', /No se pudo/.test(caido) && tard >= 2500 && filas().length === 3, caido.slice(0, 60) + ' · ' + tard + ' ms · ' + filas().length);
const d = $('#ofi-dias'); d.value = '60'; d.dispatchEvent(new Event('change', { bubbles: true })); await hasta(() => $('#ofi-dias') && $('#ofi-dias').value === '60' && filas().length === 3, 6000, 100);
$('#ofi-filtro').value = NROS[1].slice(-14).toLowerCase(); $('#ofi-filtro').dispatchEvent(new Event('input', { bubbles: true }));
ok('QC12b · A 60 días sigue con los tres; el número de uno deja solo ese', filas().length === 1 && filas()[0].innerText.indexOf(NROS[1]) >= 0 && /1 de 3/.test($('#ofi-cuenta').textContent), filas().length + ' · ' + $('#ofi-cuenta').textContent);
$('#ofi-filtro').value = ''; $('#ofi-filtro').dispatchEvent(new Event('input', { bubbles: true }));
// ── QC13 ──
const W = { n: 0, dest: [], cerr: 0 }; const _open = window.open;
window.open = function(){ W.n++; return { document: { write(){} }, location: { set href(u){ W.dest.push(u); } }, close(){ W.cerr++; } }; };
const ped = []; const _f = window.fetch; window.fetch = function(u, o){ try { const b = JSON.parse((o && o.body) || '{}'); if (b.accion === 'oficina-pdf') ped.push(b); } catch (e) {} return _f.apply(this, arguments); };
await Q.relevo({ lento: 2 });
await Promise.all([oficinaVerPdf(NROS[0]), oficinaVerPdf(NROS[0]), oficinaVerPdf(NROS[0])]);
await Q.relevo({ lento: 0 });
ok('QC13a · Tres toques con el relevo lento: un pedido (con su tipo), tres pestañas al PDF', ped.length === 1 && ped[0].tipo === T && W.dest.length === 3 && W.dest.every(u => /^blob:/.test(u)), 'pedidos ' + ped.length + ' · destinos ' + W.dest.length);
await oficinaVerPdf('PRUEBA-NO-HAY-261026-XX');
ok('QC13b · Un número sin PDF: lo dice y cierra la pestaña', W.cerr === 1 && /No encuentro el PDF/.test(($('#ofi-lista .ofi-pdf[data-n="PRUEBA-NO-HAY-261026-XX"]') || {}).textContent || ''));
window.open = _open; window.fetch = _f;
const ab = filas().find(tr => tr.innerText.indexOf(NROS[2]) >= 0).querySelector('button:not(.ofi-ver)'); ab.click(); await esperar(1500);
ok('QC13c · «Abrir para corregir» lo trae como siempre', listaGuardada().some(b => b.nro === NROS[2]) && _oficinaDe && _oficinaDe.numero === NROS[2], JSON.stringify(_oficinaDe));
// ── QC14 ──
const pedC = []; const _f2 = window.fetch; window.fetch = function(u, o){ try { const b = JSON.parse((o && o.body) || '{}'); if (b.accion === 'copiar-fuentes') pedC.push(b.torres); } catch (e) {} return _f2.apply(this, arguments); };
await Q.relevo({ lento: 6 });
const r14 = await _copiarDelArchivo([LUGAR, 'T-02', 'T-03', 'T-04', 'T-05', 'T-06', 'T-07', 'T-08']);   // en urbanismo, LUGAR es la manzana
await Q.relevo({ lento: 0 }); window.fetch = _f2;
ok('QC14a · Copiar de otra torre: ocho torres se piden de a dos y llegan aunque el relevo tarde 6 s', pedC.length === 4 && pedC.every(g => g.length === 2) && pedC[0][0] === LUGAR && r14 && r14.ok === true && r14.fuentes.length >= 1, JSON.stringify(pedC) + ' · ' + JSON.stringify(r14).slice(0, 80));
nuevoInforme(); await esperar(200);
const sinT = $$('#inspectores select option').filter(o => o.value && o.value !== 'OTRO' && !/^(Ing\.|Arq\.|TSU) /.test(o.textContent));
ok('QC14b · Todos los desplegables de inspector llevan título', !sinT.length, sinT.map(o => o.value).join(', '));
ok('QC14c · Nada se sale a 375 px', document.documentElement.scrollWidth <= innerWidth + 1, document.documentElement.scrollWidth + ' > ' + innerWidth);
_ES_OFICINA = false; _oficinaMostrar(); localStorage.setItem(CL, '[]');
