// ESTRÉS 37 · v207 / relevo r92 (16-nov-2026, Stephanie González): en SHA validar es revisar el estatus y enviar; los comentarios son
// opcionales. C1 SHA de todo el urbanismo, sin escribir nada, se envía y llega al relevo · C2 servicios sin comentarios sigue pidiendo uno ·
// C3 cabe a 375. En compilado.html?prueba=1.
localStorage.clear(); localStorage.setItem('garmel_clave_envio', 'qc'); await Q.relevo({ borrar: true, caido: false, lento: 0, fallarTorres: [], tardaTorre: {} });
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); };
const pedir = async () => { await generar(); await hasta(() => !$('#resultado').hidden || /No se pudo|tardó/.test($('#estado').textContent), 8000); await esperar(200); };
const coord = () => [...$('#quien').options].map(o => o.value).filter(v => v && !esInspSha(v))[0];
sel('tipo', 'sha'); sel('sector', 'EZ'); sel('torre', 'URBANISMO'); sel('quien', coord()); await pedir();
CAMPOS.forEach(k => { const t = $('#t-' + k); if (t) { t.value = ''; t.dispatchEvent(new Event('input', { bubbles: true })); } });
const e1 = (await Q.envios()).length; await enviar(); await hasta(() => /archivado|actualizado|No se pudo|Escriba/.test($('#estado-envio').textContent), 8000);
const env1 = (await Q.envios()).slice(e1);
ok('C1 · SHA de todo el urbanismo sin comentarios: se envía y llega al relevo', /archivado|actualizado/.test($('#estado-envio').textContent) && env1.length === 1,
   $('#estado-envio').textContent.slice(0, 120) + ' · envíos ' + env1.length);
otraVez(); sel('tipo', 'servicios'); sel('sector', 'EZ'); sel('torre', 'T-01'); sel('quien', coord()); await pedir();
CAMPOS.forEach(k => { const t = $('#t-' + k); if (t) { t.value = ''; t.dispatchEvent(new Event('input', { bubbles: true })); } });
const e2 = (await Q.envios()).length; await enviar(); await esperar(400);
ok('C2 · Servicios sin comentarios sigue pidiendo uno y no envía nada', /Escriba al menos uno/.test($('#estado-envio').textContent) && (await Q.envios()).length === e2, $('#estado-envio').textContent.slice(0, 100));
ok('C3 · Cabe a 375', document.documentElement.scrollWidth <= innerWidth + 1, document.documentElement.scrollWidth + ' / ' + innerWidth);
otraVez();
