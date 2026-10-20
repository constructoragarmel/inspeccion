// TANDA 107 · QC 5 y 6 de la v178 (20-oct-2026): residentes.
// En sha.html (o servicios): 5a «Varias torres» T-05 + T-06 junta los dos residentes · 5b tocar otro de la lista lo SUMA ·
// 5c con un solo residente, tocar otro lo reemplaza · 5d cambiar de torre cambia el residente como siempre (no se rompió).
// En inspeccion.html: 6a «Guardar y otro apto» conserva el residente y su «▾» · 6b torre no registrada con empresa elegida:
// la lista trae los residentes de esa empresa · 6c dos residentes en obra viajan los dos.
localStorage.setItem('garmel_rol', 'inspector');
Q.aceptar = true;
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); };
const elegir = async (inp, nombre) => { inp.closest('.res-caja').querySelector('.res-abrir').click(); await esperar(150);
  const b = [...document.querySelectorAll('.res-lista button')].find(x => x.dataset.r === nombre); if (b) b.click(); await esperar(150); return !!b; };
if (typeof TIPO_INFORME !== 'undefined') {
  localStorage.setItem(CLAVE_LISTA, '[]'); nuevoInforme(); await esperar(300);
  sel('convenio', 'Convenio Bielorrusos'); await esperar(150);
  [...document.querySelectorAll('#campo-donde .donde button')].find(b => b.dataset.m === 'varias').click(); await esperar(150);
  sel('torre', 'T-05'); await esperar(300); sel('otra-lugar', 'T-06'); await esperar(300);
  const r = $('#residente');
  ok('5a · «Varias torres» T-05 + T-06 junta los dos residentes', r.value === 'ING. ANTONIO CUICAS · ING. JOSE V. GONZALES', r.value);
  await elegir(r, 'ING. HARRY ARTEAGA');
  ok('5b · Tocar otro de la lista lo suma, sin borrar a los demás', r.value === 'ING. ANTONIO CUICAS · ING. JOSE V. GONZALES · ING. HARRY ARTEAGA' && datosDelFormulario().residente === r.value, r.value);
  [...document.querySelectorAll('#campo-donde .donde button')].find(b => b.dataset.m === 'una').click(); await esperar(150);
  sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-05'); await esperar(300);
  await elegir(r, 'ING. JOSE V. GONZALES');
  ok('5c · Con un solo residente, tocar otro lo reemplaza', r.value === 'ING. JOSE V. GONZALES', r.value);
  sel('torre', 'T-01'); await esperar(300);
  ok('5d · Cambiar de torre sigue poniendo el residente del cuadro', r.value === 'ING. HARRY ARTEAGA', r.value);
  localStorage.setItem(CLAVE_LISTA, '[]');
} else {
  localStorage.setItem('garmel_reports_list', '[]');
  sel('convenio', 'Convenio Bielorrusos'); await esperar(150); sel('torre', 'T-01'); await esperar(400);
  sel('piso', 'Piso 01'); await esperar(200);
  const ap = document.querySelector('select[onchange*="_aptoDesdeLista"]'); if (ap) { ap.value = [...ap.options].map(o => o.value).filter(Boolean)[0]; ap.dispatchEvent(new Event('change', { bubbles: true })); }
  document.querySelector('#estatus input').click(); await esperar(150);
  const ins = document.querySelector('.inspector-select'); if (ins) Q.elegir(ins, [...ins.options].map(o => o.value).find(v => /Cleidy/.test(v)));
  const n = document.querySelector('input.num'); if (n) { n.value = '3'; n.dispatchEvent(new Event('input', { bubbles: true })); }
  await esperar(200);
  const antes = document.querySelector('.residente-input').value;
  siguienteApartamento(); await esperar(600);
  const desp = [...document.querySelectorAll('.residente-input')];
  ok('6a · «Guardar y otro apto» conserva el residente y su «▾»', desp.length === 1 && desp[0].value === antes && antes === 'ING. HARRY ARTEAGA' && !!desp[0].closest('.res-caja'), antes + ' → ' + (desp[0] && desp[0].value));
  sel('torre', 'NO_REG'); await esperar(300);
  const tm = document.getElementById('torre-manual'); if (tm) { tm.value = 'T-99'; tm.dispatchEvent(new Event('input', { bubbles: true })); }
  sel('empresa', 'INVERSIONES ALNAVIC, C.A.'); await esperar(300);
  const r6 = document.querySelector('.residente-input'); r6.closest('.res-caja').querySelector('.res-abrir').click(); await esperar(150);
  const g = [...document.querySelectorAll('.res-lista .res-g')].map(x => x.textContent), nn = [...document.querySelectorAll('.res-lista button')].map(x => x.dataset.r);
  ok('6b · Torre no registrada con Alnavic: la lista trae primero los residentes de Alnavic', g[0] === 'De INVERSIONES ALNAVIC, C.A.' && nn[0] === 'ING. ANTONIO CUICAS', g.join(' | ') + ' · ' + nn.slice(0, 2).join(', '));
  document.querySelector('label').click(); await esperar(100);
  addResidenteField(''); await esperar(150);
  const dos = [...document.querySelectorAll('.residente-input')];
  await elegir(dos[0], 'ING. ANTONIO CUICAS'); await elegir(dos[1], 'ING. JOSE V. GONZALES');
  const rs = getFormData().residentes;
  ok('6c · Dos residentes en obra, elegidos de la lista, viajan los dos', rs.join(' / ') === 'ING. ANTONIO CUICAS / ING. JOSE V. GONZALES', rs.join(' / '));
  localStorage.setItem('garmel_reports_list', '[]');
}
