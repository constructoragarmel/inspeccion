// TANDA 97 · v172 (15-oct-2026): el compilado ya archivado de la semana se carga en los cuadros para corregir sobre él (relevo r65).
// Pedido de Stephanie: Planificación deja un borrador archivado de servicios y la coordinación lo revisa y lo envía de nuevo.
// 1 sin nada archivado ni escrito: cuadros vacíos y sin aviso · 2 con un compilado archivado: sus textos en los cuadros y el aviso con
// quién lo dejó · 3 al enviar, lo nuevo lleva el nombre de quien valida y el texto corregido, y el aviso se va · 4 lo escrito en este
// equipo sin enviar manda sobre lo archivado y el aviso lo dice · 5 obra (una torre) también lo carga · 6 cambiar de torre no arrastra el aviso
localStorage.clear(); localStorage.setItem('garmel_clave_envio', 'qc'); await Q.relevo({ borrar: true, caido: false, lento: 0, colgar: 0, perder: false });
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); };
const pedir = async () => { await generar(); await hasta(() => !$('#resultado').hidden, 8000); await esperar(200); };
const guardarFalso = async (b) => (await fetch('http://127.0.0.1:8776/exec', { method: 'POST', body: JSON.stringify(Object.assign({ clave: 'qc', accion: 'compilado-guardar', prueba: true, hasta: '2026-10-14' }, b)) })).json();
sel('tipo', 'servicios'); sel('sector', 'SR'); await esperar(100); sel('torre', 'URBANISMO'); sel('quien', COORDINADORES[3].n);
Q.escribir($('#desde'), '2026-10-08'); Q.escribir($('#hasta'), '2026-10-14');
// 1
await pedir();
ok('1 · Sin compilado archivado ni nada escrito: cuadros vacíos y sin aviso', ['hitos', 'exitos', 'dificultades', 'otros'].every(k => $('#t-' + k).value === '') && $('#aviso-archivado').hidden);
// 2
await guardarFalso({ tipo: 'servicios', sector: 'SR', torre: 'URBANISMO', desde: '2026-10-08', coordinadora: 'Borrador de Planificación, pendiente de validar por servicios',
  textos: { hitos: 'T-12: electricidad completa', exitos: 'T-07 completa', dificultades: 'Gas: caseta de Procodima', otros: '' } });
otraVez(); await pedir();
ok('2 · Con un compilado archivado: sus textos en los cuadros y el aviso dice quién lo dejó',
   $('#t-hitos').value === 'T-12: electricidad completa' && $('#t-dificultades').value === 'Gas: caseta de Procodima' && !$('#aviso-archivado').hidden &&
   /Borrador de Planificación/.test($('#aviso-archivado').textContent) && /reemplaza/.test($('#aviso-archivado').textContent),
   $('#aviso-archivado').textContent.slice(0, 120));
// 3
Q.escribir($('#t-hitos'), 'T-12: electricidad, agua y aguas servidas completas (revisado)');
const antes = (await Q.envios()).length; await enviar(); await hasta(() => /archivado|actualizado/.test($('#estado-envio').textContent), 8000);
const ult = (await Q.envios()).slice(antes)[0] || {};
ok('3 · Al enviar va el nombre de quien valida y el texto corregido; el resto del borrador se conserva; el aviso se va',
   ult.datos && ult.datos.coordinadora === COORDINADORES[3].n && ult.datos.textos.hitos === 'T-12: electricidad, agua y aguas servidas completas (revisado)' &&
   ult.datos.textos.dificultades === 'Gas: caseta de Procodima' && $('#aviso-archivado').hidden && /actualizado/.test($('#estado-envio').textContent),
   (ult.datos || {}).coordinadora + ' · ' + $('#estado-envio').textContent.slice(0, 60));
// 4
otraVez(); await pedir();
Q.escribir($('#t-otros'), 'Escrito en este equipo sin enviar');
otraVez(); await pedir();
ok('4 · Lo escrito en este equipo sin enviar manda sobre lo archivado, y el aviso lo dice',
   $('#t-otros').value === 'Escrito en este equipo sin enviar' && /todavía no envió/.test($('#aviso-archivado').textContent), $('#aviso-archivado').textContent.slice(0, 120));
// 5 (v181, ADR-0049: obra va por contratista) · Glajos en Simón Rodríguez (T-04 y T-43), archivado con su validación, el % y la nota
await guardarFalso({ tipo: 'obra', sector: 'SR', contratista: 'GLAJOS', desde: '2026-10-08', coordinadora: 'Leidy Villamizar', textos: { hitos: 'Friso base en fachada', exitos: '', dificultades: '', otros: '' },
  torres: [{ torre: 'T-04', semana: { avanceApp: { avance: 52 } }, pct: '60', motivo: 'Entró con la estructura hecha', nota: 'Andamios en la fachada norte' }, { torre: 'T-43', semana: { avanceApp: { avance: 42 } }, pct: '' }] });
otraVez(); sel('tipo', 'obra'); sel('sector', 'SR'); await esperar(100); sel('torre', [...$('#torre').options].find(o => /GLAJOS/.test(o.value)).value); await pedir();
const g4 = [...$$('#torres-contratista .torre-c')].find(x => x.dataset.torre === 'T-04');
ok('5 · Obra (la contratista) también carga lo archivado: la validación, y en cada torre su % y su nota', $('#t-hitos').value === 'Friso base en fachada' && /Leidy Villamizar/.test($('#aviso-archivado').textContent) &&
   g4 && g4.querySelector('.av-pct').value === '60' && /estructura hecha/.test(g4.querySelector('.av-motivo').value) && /Andamios/.test(g4.querySelector('.av-nota').value), $('#t-hitos').value);
// 6
otraVez(); sel('torre', [...$('#torre').options].find(o => /TSURU/.test(o.value)).value); await pedir();
ok('6 · Otra contratista sin compilado: cuadros vacíos y sin aviso (no arrastra el de la anterior)', $('#t-hitos').value === '' && $('#aviso-archivado').hidden && $$('#torres-contratista .av-pct').every(x => !x.value));
localStorage.clear();
