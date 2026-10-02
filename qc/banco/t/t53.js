// TANDA 53 · V111 (2-oct-2026): la leyenda y la nota del N/A, generalizadas a servicios y SHA (urbanismo no las lleva).
// Se corre en servicios.html, sha.html y urbanismo.html; cada página comprueba lo suyo.
// 1 la leyenda al inicio de cada bloque, con las palabras del formulario · 2 marcar N/A muestra la nota · 3 otra respuesta la quita
// 4 desmarcar la quita · 5 el dato no cambia · 6 nada se sale de la pantalla
const pagina = /sha\.html/.test(location.pathname) ? 'sha' : /urbanismo\.html/.test(location.pathname) ? 'urbanismo' : 'servicios';
const ESPERA = { servicios: [/no aplica en esta torre/, /es NO\.$/, /quite el N\/A y marque NO\.$/], sha: [/no aplica a esta contratista/, /Si falta o está vencido, es NO\.$/, /quite el N\/A y marque NO\.$/] }[pagina];
await esperar(600);
const bloques = [...document.querySelectorAll('.srv')];
const leyendas = bloques.map(b => b.querySelector('.cuerpo > .leyenda-na'));
if (pagina === 'urbanismo') {
  ok('1 · Urbanismo no lleva la leyenda ni la nota: ahí el N/A es de la calidad y no hay un «NO» que ofrecer',
     bloques.length > 0 && leyendas.every(l => !l) && typeof TXT_NA === 'object' && TXT_NA.leyenda === '' && TXT_NA.nota === '', bloques.length + ' secciones · leyendas ' + leyendas.filter(Boolean).length);
  const it = document.querySelector('.srv .item'), g = it && it.querySelector('.sino');
  if (g) { marcarSN(g.children[3], 'NA'); await esperar(50); }
  ok('2 · Y al marcar N/A en la calidad no aparece ninguna nota', !!g && !it.querySelector('.na-nota') && g.children[3].classList.contains('na-on'), 'N/A marcado: ' + (!!g && g.children[3].classList.contains('na-on')));
} else {
  ok('1 · Cada bloque abre con la leyenda del N/A, antes del primer ítem, con las palabras de este formulario',
     bloques.length > 0 && leyendas.every(l => l && l.nextElementSibling && /^items-/.test(l.nextElementSibling.id) && ESPERA[0].test(l.textContent) && ESPERA[1].test(l.textContent)),
     pagina + ': ' + bloques.length + ' bloques · «' + (leyendas[0] ? leyendas[0].textContent : '') + '»');
  const b0 = bloques.find(b => b.querySelector('.item')), sid = b0.id.replace('srv-', '');
  if (b0.querySelector('.cuerpo').hidden) plegar(sid);
  await esperar(100);
  const it = b0.querySelector('.item'), g = it.querySelector('.sino');
  marcarSN(g.children[2], 'NA'); await esperar(50);
  const n2 = it.querySelector('.na-nota');
  ok('2 · Al marcar N/A el ítem dice debajo qué significa y qué marcar si no es eso', !!n2 && ESPERA[2].test(n2.textContent) && n2.previousElementSibling === g && n2.offsetParent !== null, n2 ? n2.textContent : 'sin nota');
  marcarSN(g.children[1], 'NO'); await esperar(50);
  const sin3 = !it.querySelector('.na-nota') && valorSN(it) === 'NO';
  marcarSN(g.children[2], 'NA'); await esperar(50);
  ok('3 · Al elegir otra respuesta la nota se va; al volver a N/A, vuelve una sola', sin3 && it.querySelectorAll('.na-nota').length === 1, 'tras NO sin nota: ' + sin3 + ' · notas ahora ' + it.querySelectorAll('.na-nota').length);
  const v5 = valorSN(it);
  marcarSN(g.children[2], 'NA'); await esperar(50);
  ok('4 · Tocar N/A otra vez lo desmarca y la nota se va', !it.querySelector('.na-nota') && valorSN(it) === '', 'valor «' + valorSN(it) + '»');
  ok('5 · La respuesta que viaja es la de siempre: N/A', v5 === 'NA', v5);
  // todos los bloques abiertos y un N/A en cada uno
  bloques.forEach(b => { const s = b.id.replace('srv-', ''); if (b.querySelector('.cuerpo').hidden) plegar(s); const i = b.querySelector('.item'); if (i) marcarSN(i.querySelector('.sino').children[2], 'NA'); });
  await esperar(200);
  const ancho = window.innerWidth, cajas = [...document.querySelectorAll('.leyenda-na, .na-nota')].filter(e => e.offsetParent);
  const fuera = cajas.filter(e => { const r = e.getBoundingClientRect(); return r.left < 0 || r.right > ancho + 1; });
  ok('6 · A ' + ancho + ' px, con todos los bloques abiertos y un N/A en cada uno, nada se sale ni ensancha la página', cajas.length >= 2 && fuera.length === 0 && document.documentElement.scrollWidth <= ancho + 1,
     cajas.length + ' leyendas y notas · fuera ' + fuera.length + ' · scrollWidth ' + document.documentElement.scrollWidth + ' / ' + ancho);
}
