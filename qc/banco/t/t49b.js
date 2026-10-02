// TANDA 49b · V106 (1-oct-2026): el botón «Tomar foto» en el motor de servicios (lo heredan SHA y urbanismo).
// Correr en servicios.html, sha.html y urbanismo.html.
Q.aceptar = true;
const bloques = $$('.btn-camara:not(.cam-partida) input[type=file]');   // los de cada bloque; los de cada partida (urbanismo, v113) van en t55
const b = bloques[0], tarjeta = b.closest('.tarjeta') || b.parentElement.parentElement, grid = tarjeta.querySelector('.fotos');
const galeria = [...tarjeta.querySelectorAll('input[type=file]')].find(i => i !== b);
if (typeof plegar === 'function' && grid.closest('[id^="srv-"]')) plegar(grid.closest('[id^="srv-"]').id.replace('srv-', ''), true);
ok('1 · Cada bloque de fotos tiene «Tomar foto» (abre la cámara) y, debajo, la galería de siempre, que sigue admitiendo varias',
   bloques.length >= 1 && b.getAttribute('capture') === 'environment' && !b.multiple && /Tomar foto/.test(b.closest('label').textContent) && !!galeria && galeria.multiple && !galeria.getAttribute('capture'),
   bloques.length + ' botones de cámara');
Q.ponerFotos(b, [await Q.foto(800, 600, 1)]);
await hasta(() => grid.children.length === 1, 30000);
ok('2 · La foto de la cámara entra al bloque', grid.children.length === 1, grid.children.length + ' foto(s)');
Q.ponerFotos(b, [await Q.foto(800, 600, 2)]);
await hasta(() => grid.children.length === 2, 30000);
ok('3 · Se puede tomar otra enseguida', grid.children.length === 2, grid.children.length + ' foto(s)');
Q.ponerFotos(galeria, [await Q.foto(640, 480, 3), await Q.foto(640, 480, 4)]);
const tras4 = Math.min(4, MAX_FOTOS_SECCION);   // servicios y SHA admiten 3 por bloque; urbanismo, 6
await hasta(() => grid.children.length === tras4, 30000);
ok('4 · Y sumar dos de la galería de una vez (hasta el tope del bloque, que aquí es ' + MAX_FOTOS_SECCION + ')', grid.children.length === tras4, grid.children.length + ' foto(s)');
Q.dialogos.length = 0;
const resto = MAX_FOTOS_SECCION - grid.children.length;
for (let k = 0; k < resto; k++) { const n = grid.children.length; Q.ponerFotos(b, [await Q.foto(320, 240, 10 + k)]); await hasta(() => grid.children.length === n + 1, 30000); }
Q.ponerFotos(b, [await Q.foto(320, 240, 99)]); await esperar(600);
ok('5 · Con el bloque lleno, la cámara avisa y no agrega', grid.children.length === MAX_FOTOS_SECCION && /M.ximo/.test(Q.dialogos.join()), grid.children.length + ' de ' + MAX_FOTOS_SECCION + ' · ' + Q.dialogos.join(' / ').slice(0, 60));
ok('6 · A ' + innerWidth + ' px el botón mide al menos 44 px de alto y no se sale', b.closest('label').getBoundingClientRect().height >= 44 && document.documentElement.scrollWidth <= innerWidth + 1,
   Math.round(b.closest('label').getBoundingClientRect().height) + ' px · scrollWidth ' + document.documentElement.scrollWidth);
