// TANDA 127 · v184 (21-oct-2026): rondas 8 y 9 del estrés de fin de día. Se corre en `index.html?prueba=1` (en la computadora): carga
// los cuatro formularios en iframes de cinco tamaños —320×568, 375×812, 812×375 apaisado (teclado o teléfono de lado), 768×1024 y
// 1280×800— y mide. 8 en cada tamaño: nada se sale a lo ancho, la cabecera no se pisa con «Compilado» e «Inicio», la barra está y sus
// botones miden ≥44 px · 9 la base común: los cuatro tienen los mismos botones con los mismos nombres y en el mismo sitio, cada botón
// llama a una función que existe, dicen la misma versión y abren sin errores.
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc');
const FORMS = ['inspeccion', 'servicios', 'sha', 'urbanismo'];
const TAM = [[320, 568], [375, 812], [812, 375], [768, 1024], [1280, 800]];
const abrir = async (f, w, h) => {
  const fr = document.createElement('iframe'); fr.style.cssText = 'position:fixed;left:-3000px;top:0;border:0;width:' + w + 'px;height:' + h + 'px'; document.body.appendChild(fr);
  const err = []; fr.src = f + '.html?prueba=1';
  await new Promise(r => fr.onload = r); fr.contentWindow.addEventListener('error', e => err.push(e.message));
  await esperar(900);
  try { const m = fr.contentDocument.querySelector('#modal-rol, .modal-rol'); if (m) m.style.display = 'none'; } catch (e) {}
  return { fr, w: fr.contentWindow, d: fr.contentDocument, err };
};
const rect = el => el.getBoundingClientRect();
const visible = el => { if (!el) return false; const r = rect(el); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden'; };
const malos8 = [], estructura = {}, errores = [];
for (const f of FORMS) for (const [w, h] of TAM) {
  const { fr, w: win, d, err } = await abrir(f, w, h);
  const etq = f + '@' + w + 'x' + h, fallos = [];
  if (d.documentElement.scrollWidth > win.innerWidth + 1) fallos.push('se sale ' + d.documentElement.scrollWidth);
  const comp = d.querySelector('.hdr-comp, header .hdr-boton.compilado'), ini = d.querySelector('.hdr-inicio[aria-label="Inicio"], header .hdr-boton.inicio');
  const h1 = d.querySelector('.hdr h1, header h1');
  if (!visible(comp) || rect(comp).height < 44) fallos.push('Compilado ' + (comp ? Math.round(rect(comp).height) : 'no'));
  if (!visible(ini) || rect(ini).height < 44) fallos.push('Inicio ' + (ini ? Math.round(rect(ini).height) : 'no'));
  if (h1 && comp && rect(h1).right > rect(comp).left + 1 && rect(h1).bottom > rect(comp).top) fallos.push('título pisa Compilado');
  if (comp && ini && rect(comp).right > rect(ini).left + 1 && Math.abs(rect(comp).top - rect(ini).top) < 10) fallos.push('Compilado pisa Inicio');
  const barra = [...d.querySelectorAll('.hdr-btns > .hbtn')].filter(visible);
  if (barra.length < 3) fallos.push('barra con ' + barra.length);
  barra.forEach(b => { if (rect(b).height < 44) fallos.push(b.innerText.trim().slice(0, 12) + ' ' + Math.round(rect(b).height)); if (rect(b).right > win.innerWidth + 1) fallos.push(b.innerText.trim().slice(0, 12) + ' fuera'); });
  if (w < 700) { const hb = d.querySelector('.hdr-btns'); if (win.getComputedStyle(hb).position !== 'fixed') fallos.push('barra no está abajo'); }
  if (fallos.length) malos8.push(etq + ': ' + fallos.join(', '));
  if (w === 375) {
    const txt = el => el.innerText.replace(/\s+/g, ' ').replace(/\(\d+\)/g, '').trim();
    const sec = d.querySelector('#hdr-sec, #fila-mas');
    estructura[f] = { barra: [...d.querySelectorAll('.hdr-btns > .hbtn')].map(txt), mas: [...sec.querySelectorAll('.hbtn')].filter(b => b.style.display !== 'none').map(txt),
      arriba: [comp, ini].map(x => x ? txt(x) || x.getAttribute('aria-label') : '—'),
      version: ((d.querySelector('#pie, .pie, #estado-conexion') || {}).textContent || '') + ' ' + (d.body.innerHTML.match(/v\d{3}(?=<)/) || [''])[0],
      sinFuncion: [...d.querySelectorAll('.hdr-btns button[onclick], header button[onclick], header a[onclick], .hdr button[onclick]')].map(b => (b.getAttribute('onclick').match(/^\s*([A-Za-z_$][\w$]*)\s*\(/) || [])[1]).filter(n => n && typeof win[n] !== 'function') };
  }
  if (err.length) errores.push(etq + ': ' + err.join(' | '));
  fr.remove();
}
ok('R8.1 · Los cuatro formularios en cinco tamaños (320, 375, 812 apaisado, 768, 1280): nada se sale, la cabecera no se pisa, la barra está y mide ≥44 px', !malos8.length, malos8.join(' || '));
ok('R8.2 · En el teléfono la barra va abajo (fija) en los cuatro', !malos8.some(m => /no está abajo/.test(m)));
const norm = s => s.replace(/Guardar y otr[oa] (apto|torre|manzana)/, 'Guardar y otro').replace(/[^\wÀ-ÿ ]/g, '').trim();
const firmas = FORMS.map(f => JSON.stringify({ barra: estructura[f].barra.map(norm), arriba: estructura[f].arriba.map(norm) }));
ok('R9.1 · La barra y la cabecera son las mismas en los cuatro (mismos botones, mismo orden, mismos nombres)', new Set(firmas).size === 1, FORMS.map((f, i) => f + ' ' + firmas[i]).join(' || '));
const mas = FORMS.map(f => estructura[f].mas.map(norm).filter(x => !/Proyectadas|Prueba/.test(x)).join(','));
ok('R9.2 · Detrás de «Más» lo mismo en los cuatro: PDF, Guardar, Limpiar todo (urbanismo suma Proyectadas)', new Set(mas).size === 1 && /PDF/.test(mas[0]) && /Guardar/.test(mas[0]) && /Limpiar todo/.test(mas[0]), FORMS.map((f, i) => f + ': ' + mas[i]).join(' || '));
ok('R9.3 · Cada botón de la cabecera y de la barra llama a una función que existe', FORMS.every(f => !estructura[f].sinFuncion.length), FORMS.map(f => f + ': ' + estructura[f].sinFuncion.join(',')).join(' · '));
ok('R9.4 · Los cuatro dicen «en línea» y la misma versión', new Set(FORMS.map(f => (estructura[f].version.match(/v\d{3}/) || [''])[0])).size === 1 && FORMS.every(f => /en línea/.test(estructura[f].version)), FORMS.map(f => f + ': ' + estructura[f].version.trim()).join(' · '));
ok('R9.5 · Los cuatro abren sin errores en los cinco tamaños', !errores.length, errores.join(' || '));
