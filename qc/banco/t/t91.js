// TANDA 91 · Servicios, SHA y urbanismo, 14-oct-2026 (v168, cambio 184): el envío espera al relevo y, si se corta, pregunta
// antes de darlo por pendiente. Se corre en servicios.html, sha.html y urbanismo.html (?prueba=1), en un navegador A LA VISTA.
// 1 el relevo archiva y tarda más que el plazo: el cartel muestra los segundos, queda enviado y hay UN solo envío
// 2 el cuerpo se pierde: el aviso dice «todavía no aparece archivado» (no «No hubo respuesta»), sigue pendiente, se recuerda el corte
// 3 con el relevo de vuelta, Enviar lo manda una vez · 4 tras un corte, si el informe llegó por su cuenta, Enviar lo reconoce y no reenvía
const pagina = /sha\.html/.test(location.pathname) ? 'sha' : /urbanismo\.html/.test(location.pathname) ? 'urbanismo' : 'servicios';
localStorage.setItem('garmel_clave_envio', 'qc');
await Q.relevo({ borrar: true, tipos: ['inspeccion', 'servicios', 'sha', 'urbanismo'], caido: false, fallar: [], lento: 0, colgar: 0, perder: false });
localStorage.setItem(CLAVE_LISTA, '[]');
const nuevo = async () => { Q.aceptar = true; nuevoInforme(); await esperar(150); if ($('#aviso-historial .no')) $('#aviso-historial .no').click(); };
const escribir = (e, v) => { e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); };
const opciones = s => [...s.options].map(o => o.value).filter(v => v && v !== 'ZONA');
const cabecera = async (k) => {
  const s = $('#sector'); if (s && !s.value) { Q.elegir(s, opciones(s)[0]); await esperar(100); }
  const c = $('#convenio'); if (c && !c.value) { Q.elegir(c, opciones(c).includes('Convenio Bielorrusos') ? 'Convenio Bielorrusos' : opciones(c)[0]); await esperar(100); }
  const t = $('#torre'); Q.elegir(t, opciones(t)[k || 0]); await esperar(200); if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
  Q.elegir($('#inspectores select'), INSPECTORES_DB[0]);
  if (pagina === 'sha') { const e = $('#estatus'); Q.elegir(e, opciones(e)[0]); }
  await esperar(100);
};
const contestar = () => {
  const it = $('.srv .item'), sid = it.closest('.srv').id.replace('srv-', '');
  if (it.closest('.cuerpo').hidden) plegar(sid);
  if (pagina === 'urbanismo') escribir(it.querySelector('.cant'), '10'); else marcarSN(it.querySelector('.sino').children[0], 'SI');
};
const lista = () => listaGuardada();
const mandar = async () => {
  Q.dialogos = []; let vioCartel = false, vioRaro = false;
  const vigia = setInterval(() => { const c = document.getElementById('cartel-envio'); if (c && /⏳ \d+ s/.test(c.textContent)) vioCartel = true; if (c && /no alcanzó|No hubo respuesta/.test(c.textContent)) vioRaro = true; }, 100);
  await enviar(); clearInterval(vigia); await esperar(300);
  return { fin: Q.dialogos.slice(-1)[0] || '', vioCartel, vioRaro };
};
PLAZO_ENVIO_MS = 3000; _REINTENTO_EXISTE_MS = 800;

// ── 1. El relevo archiva pero tarda 7 s; el plazo es de 3 s ──
await nuevo(); await cabecera(0); contestar(); guardar(false); const d1 = lista()[0];
await Q.relevo({ colgar: 7 });
const r1 = await mandar();
await Q.relevo({ colgar: 0 });
const env1 = (await Q.envios()).filter(e => e.numero === d1.nro);
ok('1 · Relevo lento (7 s, plazo 3 s): el cartel muestra los segundos, no dice «No hubo respuesta», queda enviado y hay un solo envío',
   r1.vioCartel && !r1.vioRaro && /1 informe\(s\) enviado/.test(r1.fin) && !!lista().find(x => x.id === d1.id).enviado && env1.length === 1 && !_cortes[d1.nro],
   'cartel=' + r1.vioCartel + ' envíos=' + env1.length + ' · ' + r1.fin.replace(/\n/g, ' ').slice(0, 100));

// ── 2. El cuerpo se pierde ──
await nuevo(); await cabecera(1); contestar(); guardar(false); const d2 = lista().find(x => !x.enviado);
await Q.relevo({ perder: true, colgar: 6 });
const r2 = await mandar();
await Q.relevo({ perder: false, colgar: 0 }); await esperar(2500);
ok('2 · Cuerpo perdido: dice «todavía no aparece archivado» (no «No hubo respuesta»), sigue pendiente y recuerda el corte',
   !r2.vioRaro && /todavía no aparece archivado/.test(r2.fin) && !/No hubo respuesta/.test(r2.fin) && !lista().find(x => x.id === d2.id).enviado && !!_cortes[d2.nro] && (await Q.envios()).filter(e => e.numero === d2.nro).length === 0,
   r2.fin.replace(/\n/g, ' ').slice(0, 220));

// ── 3. Con el relevo de vuelta, Enviar lo manda (una vez) ──
const r3 = await mandar();
const env3 = (await Q.envios()).filter(e => e.numero === d2.nro);
ok('3 · Tras el corte, con el relevo de vuelta: comprueba (no está), lo manda una vez y queda enviado',
   /1 informe\(s\) enviado/.test(r3.fin) && env3.length === 1 && !!lista().find(x => x.id === d2.id).enviado && !_cortes[d2.nro],
   'envíos=' + env3.length + ' · ' + r3.fin.replace(/\n/g, ' ').slice(0, 80));

// ── 4. Tras un corte, el informe llegó por su cuenta: Enviar lo reconoce y no reenvía ──
await nuevo(); await cabecera(2); contestar(); guardar(false); const d4 = lista().find(x => !x.enviado);
await Q.relevo({ perder: true, colgar: 5 });
await mandar();
await Q.relevo({ perder: false, colgar: 0 }); await esperar(2000);
const sobre = sobreDe(d4, 'qc', {});
await fetch('http://127.0.0.1:8776/exec', { method: 'POST', body: JSON.stringify(sobre) });   // «llega tarde» sin pasar por el formulario
const antes4 = (await Q.envios()).length;
const r4 = await mandar();
ok('4 · Si el envío cortado sí llegó, el siguiente Enviar lo reconoce (mismo guardado), lo marca enviado y no lo manda otra vez',
   /1 informe\(s\) enviado/.test(r4.fin) && (await Q.envios()).length === antes4 && !!lista().find(x => x.id === d4.id).enviado,
   'envíos nuevos=' + ((await Q.envios()).length - antes4) + ' · ' + r4.fin.replace(/\n/g, ' ').slice(0, 80));
PLAZO_ENVIO_MS = 300000; _REINTENTO_EXISTE_MS = 15000;
