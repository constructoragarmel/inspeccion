(function(){
  const Q = window.__qc = { R: [], dialogos: [], aceptar: true, t0: Date.now() };
  window.alert = m => { Q.dialogos.push(String(m)); };
  window.confirm = m => { Q.dialogos.push(String(m)); return Q.aceptar; };
  Q.ok = (n, c, d) => { Q.R.push({ n, c: !!c, d: d === undefined ? '' : String(d).slice(0, 240) }); return !!c; };
  Q.esperar = ms => new Promise(r => setTimeout(r, ms));
  Q.hasta = async (fn, ms, paso) => { const t = Date.now(); while (Date.now() - t < (ms || 10000)) { try { if (fn()) return true; } catch(e){} await Q.esperar(paso || 50); } return false; };
  Q.foto = async (w, h, semilla) => {
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const ctx = cv.getContext('2d');
    const img = ctx.createImageData(w, h); const d = img.data; const s = semilla || 1;
    for (let i = 0; i < d.length; i += 4){ d[i] = (i * 7 * s) % 256; d[i+1] = (i * 13 + s * 40) % 256; d[i+2] = ((i >> 5) + s * 90) % 256; d[i+3] = 255; }
    ctx.putImageData(img, 0, 0);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 200px sans-serif'; ctx.fillText('F' + s, 100, Math.round(h / 2));
    const blob = await new Promise(r => cv.toBlob(r, 'image/jpeg', 0.92));
    return new File([blob], 'foto' + s + '.jpg', { type: 'image/jpeg' });
  };
  Q.ponerFotos = (inp, files) => { const dt = new DataTransfer(); files.forEach(f => dt.items.add(f)); inp.files = dt.files; inp.dispatchEvent(new Event('change', { bubbles: true })); };
  Q.escribir = (el, v) => { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); };
  Q.elegir = (el, v) => { el.value = v; el.dispatchEvent(new Event('change', { bubbles: true })); };
  Q.chicos = () => [...document.querySelectorAll('button, input:not([type=file]):not([type=hidden]), select, textarea, a.inicio')].filter(e => { const r = e.getBoundingClientRect(); return r.width && r.height && r.height < 44 && !e.closest('[hidden]'); }).map(e => (e.tagName + '.' + e.className + ':' + Math.round(e.getBoundingClientRect().height)));
  Q.resumen = () => { const malos = Q.R.filter(r => !r.c); return { ms: Date.now() - Q.t0, total: Q.R.length, verdes: Q.R.length - malos.length, malos: malos.map(r => r.n + (r.d ? ' — ' + r.d : '')), todos: Q.R.map(r => (r.c ? '✅ ' : '❌ ') + r.n + (r.d ? ' — ' + r.d : '')) }; };
  window.addEventListener('error', e => Q.R.push({ n: 'pageerror: ' + (e.message || e), c: false, d: (e.filename || '') + ':' + (e.lineno || '') }));
  window.addEventListener('unhandledrejection', e => Q.R.push({ n: 'unhandledrejection: ' + (e.reason && e.reason.message || e.reason), c: false, d: '' }));
  Q.relevo = async (cambios) => (await fetch('http://127.0.0.1:8776/control', { method: 'POST', body: JSON.stringify(cambios) })).json();
  Q.envios = async () => { const t = await (await fetch('/envios.jsonl?' + Date.now(), { cache: 'no-store' })).text(); return t.trim() ? t.trim().split('\n').map(l => JSON.parse(l)) : []; };
})();
