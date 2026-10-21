// TANDA 126 · v184 (21-oct-2026): rondas 6 y 7 del estrés de fin de día, en `compilado.html?prueba=1` a 375×812. 6 llegar desde un
// formulario (`?de=`) con lo raro: datos rotos, otro sector, alguien que no valida, otra semana en pantalla, la misma semana, un tipo
// que no existe (cada caso en un iframe de la misma página, para no cortar la tanda) · 7 el estatus de SHA bajo estrés: muchos cambios,
// guardar con el relevo lento y doble toque, caído y reintento, y la coordinación lo valida todo.
localStorage.setItem('garmel_clave_envio', 'qc'); await Q.relevo({ borrar: true, caido: false, lento: 0, fallarTorres: [], tardaTorre: {} });
const marco = async (q, desde, semana) => {
  try { localStorage.removeItem('garmel_compilado_semana'); } catch (e) {}
  if (desde !== undefined) localStorage.setItem('garmel_compilado_desde', desde); else localStorage.removeItem('garmel_compilado_desde');
  if (semana) localStorage.setItem('garmel_compilado_semana', JSON.stringify(semana));
  const f = document.createElement('iframe'); f.style.cssText = 'width:375px;height:700px;position:fixed;left:-2000px;top:0'; document.body.appendChild(f);
  const errores = []; f.addEventListener('load', () => { f.contentWindow.addEventListener('error', e => errores.push(e.message)); });
  f.src = 'compilado.html?prueba=1' + (q ? '&' + q : ''); await new Promise(r => f.onload = r); await esperar(900);
  const d = f.contentDocument, g = id => d.getElementById(id);
  const r = { tipo: g('tipo').value, sector: g('sector').value, torre: g('torre').value, quien: g('quien').value, estado: g('estado').textContent, resultado: !g('resultado').hidden,
              quedaDesde: localStorage.getItem('garmel_compilado_desde'), errores: errores.concat(f.contentWindow.__errores || []) };
  f.remove(); return r;
};
// ── Ronda 6 ──
const a = await marco('de=sha', '{esto no es json');
ok('R6.1 · Datos rotos en el recuerdo: no se cae, abre en SHA y dice de dónde viene', a.tipo === 'sha' && /Viene del formulario de SHA/.test(a.estado) && !a.errores.length && a.quedaDesde === null, JSON.stringify(a).slice(0, 200));
const b = await marco('de=sha', JSON.stringify({ tipo: 'sha', sector: 'SB', quien: 'Víctor Mendoza (CIV-NC)' }));
ok('R6.2 · Desde SHA de Simón Bolívar con Víctor: SHA, SB, todo el urbanismo y Víctor, y el recuerdo se borra', b.tipo === 'sha' && b.sector === 'SB' && b.torre === 'URBANISMO' && b.quien === 'Víctor Mendoza (CIV-NC)' && b.quedaDesde === null, JSON.stringify(b).slice(0, 200));
const c = await marco('de=servicios', JSON.stringify({ tipo: 'servicios', sector: 'SR', quien: 'Oriana Plaza (CIV-321.434)' }));
ok('R6.3 · Desde servicios con alguien que no valida: servicios, SR, todo el urbanismo y «quién» vacío para elegir', c.tipo === 'servicios' && c.sector === 'SR' && c.torre === 'URBANISMO' && c.quien === '', JSON.stringify(c).slice(0, 200));
const semObra = { ok: true, tipo: 'obra', modo: 'contratista', sector: 'EZ', contratista: 'INVERSIONES ALNAVIC, C.A.', torres: [], desde: '2026-10-15', hasta: '2026-10-21', generado: '2026-10-21 10:00', quien: 'Diego Orta' };
const d = await marco('de=urbanismo', JSON.stringify({ tipo: 'urbanismo', sector: 'EZ', quien: '' }), semObra);
ok('R6.4 · Con otra semana (de obra) en pantalla: se suelta y abre urbanismo de EZ, todo el urbanismo (manzanas pedidas al relevo)', d.tipo === 'urbanismo' && d.sector === 'EZ' && d.torre === 'URBANISMO' && !d.resultado, JSON.stringify(d).slice(0, 200));
const semSha = { ok: true, tipo: 'sha', sector: 'EZ', torre: 'URBANISMO', desde: '2026-10-15', hasta: '2026-10-21', generado: '2026-10-21 10:00', quien: 'Víctor Mendoza (CIV-NC)', porTorre: [], notas: [], inspectores: [], nInformes: 0, ultimo: null };
const e = await marco('de=sha', JSON.stringify({ tipo: 'sha', sector: 'EZ', quien: 'Víctor Mendoza (CIV-NC)' }), semSha);
ok('R6.5 · Con la MISMA semana de SHA en pantalla, no la tira: se queda', e.tipo === 'sha' && e.resultado, JSON.stringify(e).slice(0, 200));
const f1 = await marco('de=xyz', JSON.stringify({ tipo: 'xyz' })), f2 = await marco('de=obra', JSON.stringify({ tipo: 'obra', sector: 'EZ' }));
ok('R6.6 · Un tipo que no existe, o «obra», no hace nada raro: la página abre como siempre', !/Viene del formulario/.test(f1.estado) && !/Viene del formulario/.test(f2.estado) && !f1.errores.length && !f2.errores.length, f1.tipo + ' · ' + f2.tipo);
localStorage.removeItem('garmel_compilado_desde'); localStorage.removeItem('garmel_compilado_semana');
// ── Ronda 7 ──
const sel = (id, v) => { const x = document.getElementById(id); x.value = v; x.dispatchEvent(new Event('change', { bubbles: true })); };
const elegir = (s, v) => { s.value = v; s.dispatchEvent(new Event('change', { bubbles: true })); };
const pedir = async () => { await generar(); await hasta(() => !$('#resultado').hidden || /No se pudo|tardó/.test($('#estado').textContent), 8000); await esperar(200); };
const sels = () => $$('#tipo-tabla select.est-sel');
otraVez(); sel('tipo', 'sha'); sel('sector', 'EZ'); sel('torre', 'URBANISMO'); sel('quien', 'Birmania Rada (CIV-NC)'); await pedir();
const OPC = ['', 'Pendiente', 'En proceso', 'Corregido'];
for (let k = 0; k < 80; k++) elegir(sels()[k % 4], OPC[(k * 7) % 4]);
const finales = sels().map(s => s.value);
const guardadoLocal = JSON.parse(localStorage.getItem(claveEst()) || '{}');
ok('R7.1 · Ochenta cambios en los cuatro desplegables: lo que queda a la vista es lo último elegido y el equipo lo guarda igual', Object.keys(guardadoLocal).length === finales.filter(v => v !== '').length && sels().every(s => s.closest('tr').classList.contains('est-cambia') === !!s.value && s.value !== undefined),
   finales.join(',') + ' · ' + JSON.stringify(guardadoLocal).slice(0, 160));
await Q.relevo({ lento: 1.5 });
const e7 = (await Q.envios()).length;
const g1 = guardarEstatus(); await esperar(200); const apagado = $('#btn-est').disabled; $('#btn-est').click(); await g1; await esperar(1700);
const s7 = (await Q.envios()).slice(e7).filter(x => x.tipo === 'sha-estatus');
ok('R7.2 · Con el relevo lento, mientras guarda el botón queda apagado y un segundo toque no manda otro', apagado && s7.length === 1 && /Guardado el estatus/.test($('#estado-est').textContent), s7.length + ' · ' + $('#estado-est').textContent.slice(0, 80));
await Q.relevo({ lento: 0, caido: true });
elegir(sels()[0], sels()[0].value === 'Corregido' ? 'Pendiente' : 'Corregido');
await guardarEstatus(); await hasta(() => /No se pudo|tardó/.test($('#estado-est').textContent), 8000);
ok('R7.3 · Con el relevo caído lo dice y lo elegido sigue en el equipo', /vuelva a intentar/.test($('#estado-est').textContent) && Object.keys(JSON.parse(localStorage.getItem(claveEst()) || '{}')).length === 1, $('#estado-est').textContent.slice(0, 100));
await Q.relevo({ caido: false }); await guardarEstatus(); await hasta(() => /Guardado|No se pudo/.test($('#estado-est').textContent), 6000);
ok('R7.4 · Al reintentar se guarda', /Guardado el estatus de 1 hallazgo/.test($('#estado-est').textContent));
const propuestos = sels().map(s => s.value);
otraVez(); sel('quien', 'Diego Orta'); await pedir();
ok('R7.5 · La coordinación ve cargado exactamente lo que dejó la inspección en los cuatro', sels().map(s => s.value).join() === propuestos.join(), sels().map(s => s.value).join() + ' vs ' + propuestos.join());
Q.escribir($('#t-hitos'), 'Validación de SHA bajo estrés');
const e8 = (await Q.envios()).length; await enviar(); await hasta(() => /archivado|actualizado|No se pudo/.test($('#estado-envio').textContent), 6000);
const u8 = (await Q.envios()).slice(e8).find(x => x.tipo === 'compilado-sha') || { datos: {} };
ok('R7.6 · Al enviar se validan todos los que tienen estatus, con su torre', (u8.datos.estatus || []).length === propuestos.filter(Boolean).length && (u8.datos.estatus || []).every(x => x.torre && x.estatus), JSON.stringify(u8.datos.estatus || []).slice(0, 200));
ok('R7.7 · Nada se sale de la pantalla y ningún control baja de 44 px', document.documentElement.scrollWidth <= innerWidth + 1 && Q.chicos().length === 0, Q.chicos().join(' '));
otraVez(); localStorage.clear(); await Q.relevo({ caido: false, lento: 0 });
