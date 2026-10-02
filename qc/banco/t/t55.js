// TANDA 55 · V113 (2-oct-2026): la foto desde cada partida, en urbanismo. Correr en urbanismo.html a 375×812.
// 1 cada partida tiene su botón de cámara · 2 la foto entra al bloque de la sección con el nombre de la partida · 3 la fila lo confirma
// 4 otra partida de la misma sección suma al mismo bloque · 5 el botón de la sección sigue igual · 6 el tope sigue siendo el de la sección
// 7 lo que viaja en los datos · 8 nada se sale de la pantalla
Q.aceptar = true;
await esperar(500);
const sec = $$('.srv').find(b => b.querySelectorAll('.item').length >= 2), sid = sec.id.replace('srv-', '');
if (sec.querySelector('.cuerpo').hidden) plegar(sid); await esperar(100);
const items = [...sec.querySelectorAll('.item')], grid = document.getElementById('fotos-' + sid);
const cam = it => it.querySelector('.cam-partida input[type=file]'), nombre = it => it.querySelector('.nombre').textContent.trim();
const todos = $$('.srv .item'), con = todos.filter(it => cam(it) && cam(it).getAttribute('capture') === 'environment' && !cam(it).multiple);
ok('1 · Cada partida de cada sección tiene su botón «Foto de esta partida», que abre la cámara', todos.length > 10 && con.length === todos.length && /Foto de esta partida/.test(items[0].querySelector('.cam-partida').textContent), con.length + ' de ' + todos.length + ' partidas');

Q.ponerFotos(cam(items[0]), [await Q.foto(800, 600, 1)]);
await hasta(() => grid.children.length === 1, 30000);
const pie1 = grid.children[0].querySelector('textarea').value;
ok('2 · La foto tomada desde «' + nombre(items[0]) + '» entra al bloque de fotos de su sección, con el nombre de la partida como descripción', grid.children.length === 1 && pie1 === nombre(items[0]) && !!grid.children[0].querySelector('img'), 'descripción: «' + pie1 + '»');
ok('3 · La partida lo confirma debajo del botón, porque el bloque de fotos queda más abajo', /Foto agregada a las fotografías de esta sección/.test(items[0].querySelector('.cam-aviso').textContent), items[0].querySelector('.cam-aviso').textContent);

Q.ponerFotos(cam(items[1]), [await Q.foto(800, 600, 2)]);
await hasta(() => grid.children.length === 2, 30000);
ok('4 · Una foto desde otra partida de la misma sección suma al mismo bloque, con su propio nombre', grid.children.length === 2 && grid.children[1].querySelector('textarea').value === nombre(items[1]), 'descripciones: ' + [...grid.children].map(c => c.querySelector('textarea').value).join(' · '));

const delBloque = grid.closest('.tarjeta').querySelector('.btn-camara:not(.cam-partida) input[type=file]');
Q.ponerFotos(delBloque, [await Q.foto(640, 480, 3)]);
await hasta(() => grid.children.length === 3, 30000);
ok('5 · El botón «Tomar foto» de la sección sigue como antes: la foto entra sin descripción', grid.children.length === 3 && grid.children[2].querySelector('textarea').value === '', grid.children.length + ' fotos');

for (let k = grid.children.length; k < MAX_FOTOS_SECCION; k++) { Q.ponerFotos(cam(items[0]), [await Q.foto(320, 240, 10 + k)]); await hasta(() => grid.children.length === k + 1, 30000); }
Q.dialogos.length = 0;
Q.ponerFotos(cam(items[1]), [await Q.foto(320, 240, 99)]); await esperar(700);
ok('6 · El tope sigue siendo el de la sección (' + MAX_FOTOS_SECCION + '): con el bloque lleno avisa, no entra otra y la partida no dice que se agregó',
   grid.children.length === MAX_FOTOS_SECCION && Q.dialogos.some(m => /Máximo/.test(m)) && items[1].querySelector('.cam-aviso').textContent === '', grid.children.length + ' fotos · aviso: ' + (Q.dialogos[0] || '').slice(0, 50));

const d7 = datosDelFormulario(), g7 = d7.general.find(g => g.id === sid);
ok('7 · En los datos, las fotos de la sección llevan su descripción', (g7.fotos || []).length === MAX_FOTOS_SECCION && g7.fotos[0].pie === nombre(items[0]) && g7.fotos[1].pie === nombre(items[1]), JSON.stringify((g7.fotos || []).slice(0, 3).map(f => f.pie)));

const ancho = window.innerWidth, btns = todos.map(it => it.querySelector('.cam-partida')).filter(b => b.offsetParent).map(b => b.getBoundingClientRect());
ok('8 · A ' + ancho + ' px los botones caben, miden al menos 40 px de alto y nada ensancha la página', btns.length >= 2 && btns.every(r => r.left >= 0 && r.right <= ancho + 1 && r.height >= 40) && document.documentElement.scrollWidth <= ancho + 1,
   btns.length + ' a la vista · alto ' + Math.round(btns[0].height) + ' px · scrollWidth ' + document.documentElement.scrollWidth + ' / ' + ancho);
