// uso en javascript_tool: eval(await (await fetch('/t/correr.js?'+Date.now())).text()); await __correr('t1');
window.__correr = async function(nombre){
  (0, eval)(await (await fetch('/t/runner.js?' + Date.now(), { cache: 'no-store' })).text());
  const src = await (await fetch('/t/' + nombre + '.js?' + Date.now(), { cache: 'no-store' })).text();
  try { await (0, eval)('(async()=>{ const Q = window.__qc, ok = Q.ok, esperar = Q.esperar, hasta = Q.hasta, $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];\n' + src + '\n})()'); }
  catch (e) { window.__qc.R.push({ n: 'EXCEPCIÓN DEL GUION: ' + (e && e.message || e), c: false, d: (e && e.stack || '').split('\n').slice(0, 3).join(' | ') }); }
  return window.__qc.resumen();
};
