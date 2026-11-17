// INSPECCIÓN: fotos en varios hitos del ámbito, con acentos en el texto libre
// 17-nov-2026: el apartamento pasa de «4B» a «B1». Desde la v180 (192, 20-oct) en una torre con lista (la T-05: A1, A2, B1, B2) un
// apartamento fuera de ella no se envía, y esta tanda prueba las fotos, no eso.
localStorage.setItem('garmel_clave_envio', 'qc');   // 17-nov-2026: la tanda pone su clave. Antes la heredaba de otra corrida en el mismo navegador; con el teléfono limpio de headless.py no enviaba («no está configurado para enviar»).
localStorage.setItem('garmel_rol', 'inspector');
{ const c = document.getElementById('claveEnvio'); if (c && !c.value) c.value = 'qc'; if (typeof refrescarEstadoClave === 'function') refrescarEstadoClave(); }   // en obra la clave se lee del campo, que se llena al abrir
const sel = (id, v) => { const e = document.getElementById(id); if (!e) return false; e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); return true; };
sel('torre', [...document.getElementById('torre').options].map(o => o.value).find(v => /T-05/.test(v)));
const insp = document.querySelector('.inspector-select');
insp.value = [...insp.options].map(o => o.value).filter(Boolean)[0]; insp.dispatchEvent(new Event('change', {bubbles:true}));
sel('piso', [...document.getElementById('piso').options].map(o => o.value).filter(Boolean)[1]);
const apto = document.getElementById('apto'); apto.value = 'B1'; apto.dispatchEvent(new Event('input', {bubbles:true}));
document.querySelector('#estatus .ck-lbl').click();
ok('Cabecera completa', !!document.getElementById('torre').value && !!document.getElementById('piso').value && !!insp.value && !!document.querySelectorAll('#estatus .ck-lbl.on').length);
const hitos = _hitosDelAmbito().slice(0, 3).map(p => p.id);
ok('Tres hitos del ámbito', hitos.length === 3, hitos.join());
for (let h = 0; h < hitos.length; h++){
  const pid = hitos[h];
  const obs = document.getElementById('fotobs_' + pid);
  if (obs){ obs.value = 'Observación ñ áéíóú del hito ' + h; obs.dispatchEvent(new Event('input', {bubbles:true})); }
  const inputs = [...document.querySelectorAll('input[type=file][onchange*="' + pid + '"]')].filter(e => e.offsetParent !== null || e.closest('[id]'));
  for (let k = 0; k < 2; k++){
    const inp = document.getElementById('fslot_' + pid + '_' + k) ? document.querySelector('#fslot_' + pid + '_' + k + ' input[type=file]') : inputs[k];
    Q.ponerFotos(inp || inputs[k], [await Q.foto(800, 600, 120 + h * 10 + k)]);
  }
  await hasta(() => [0,1].every(k => { const im = document.getElementById('fimg_' + pid + '_' + k); return im && /^data:/.test(im.src); }), 15000);
}
const d = getFormData();
ok('El borrador lleva 2 fotos en cada uno de los 3 hitos', hitos.every(p => (d.fotos[p] || []).filter(Boolean).length === 2), hitos.map(p => p + ':' + (d.fotos[p]||[]).filter(Boolean).length).join());
saveDraft(true);
Q.dialogos = [];
await enviarAlRelevo();
await esperar(800); await hasta(() => !/enviando/i.test(document.body.textContent), 40000); await esperar(600);
const env = (await Q.envios()).slice(-1)[0];
ok('Enviado: 6 fotos nombradas por hito', env && env.tipo !== 'urbanismo' && env.fotos.length === 6, env && (env.numero + ' · ' + env.fotos.join(' ')));
