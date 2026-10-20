// TANDA 110 · QC 9 a 12 de la segunda serie (20-oct-2026), en urbanismo.html?prueba=1, a la vista.
// 9 «Varias manzanas» M-1 L1 + M-1 L2 con cantidad en «Bote de material», un camión con placa, maquinaria y foto: se guarda y se
//   envía con su ubicación, el camión y la maquinaria · 10 la placa escrita queda en la lista de placas del teléfono para el siguiente
// 11 el residente sale con la de ADDISON y la lista abre con ella primero · 12 la lista de residentes se cierra con Escape y con
//   un toque fuera, y el «▾» dice si está abierta (aria-expanded)
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem(CLAVE_LISTA, '[]');
localStorage.removeItem(CLAVE_TORRES); localStorage.removeItem(CLAVE_ACTUAL);
Q.aceptar = true;
await Q.relevo({ caido: false, fallar: [], lento: 0, colgar: 0, perder: false });
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); };
const escribir = (el, v) => { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); };
nuevoInforme(); await esperar(300);
sel('convenio', 'Convenio Bielorrusos'); await esperar(200);
[...document.querySelectorAll('#campo-donde .donde button')].find(b => b.dataset.m === 'varias').click(); await esperar(150);
sel('torre', 'M-1 L1'); await esperar(400); sel('otra-lugar', 'M-1 L2'); await esperar(200); if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
const ins = document.querySelector('#inspectores select'); Q.elegir(ins, [...ins.options].map(o => o.value).find(v => /Gabriel Barrios/.test(v)));
sel('fecha', '2026-10-20');
const bote = [...document.querySelectorAll('.item')].find(it => /Bote de material/.test(it.textContent));
plegar('urb_preliminares', true); await esperar(150);
const bc = bote.querySelector('button[onclick^="agregarCamion"]'); bc.click(); await esperar(200);
const cam = bote.querySelector('.camion');
escribir(cam.querySelector('.placa'), 'A12BC3D');
[...cam.querySelectorAll('input')].filter(i => !i.classList.contains('placa') && i.type !== 'file').forEach((i, k) => escribir(i, k === 0 ? '12' : '2'));
const mq = bote.querySelector('.maquinaria'); if (mq) escribir(mq, '1 retroexcavadora');
const cant = bote.querySelector('.cant'); if (cant && !cant.readOnly) escribir(cant, '24');
const g = document.querySelector('#fotos-urb_preliminares, [id^="fotos-urb_preliminares"]'); const fi = g && g.parentElement.querySelector('input[type=file]');
if (fi) { Q.ponerFotos(fi, [await Q.foto(1000, 750, 110)]); await hasta(() => g.querySelectorAll('img').length >= 1, 8000); }
guardar(false); await esperar(300);
const d = listaGuardada()[0];
const env0 = (await Q.envios()).length;
Q.dialogos = []; await enviarSolo(d.id); await esperar(1000);
const e = (await Q.envios()).slice(env0).filter(x => x.numero === d.nro)[0];
const it = e && (e.datos.general || []).flatMap(s => s.items || []).find(x => x.nombre === 'Bote de material');
ok('9 · «Varias manzanas» con camión, maquinaria y foto se envía con la ubicación, el camión y la maquinaria',
   e && /URB-EZ-M1L1\+1-/.test(e.numero) && e.datos.ubicacion.otras.join() === 'M-1 L2' && it && (it.camiones || []).length === 1 && it.camiones[0].placa === 'A12BC3D' && /retroexcavadora/.test(it.maquinaria || '') && (e.fotos || []).length >= 1,
   e ? e.numero + ' · ' + JSON.stringify(it && { c: it.camiones, m: it.maquinaria, cant: it.cant }) : 'no llegó · ' + Q.dialogos.join(' | ').slice(0, 200));
// 10
nuevoInforme(); await esperar(300); sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'M-6'); await esperar(400);
plegar('urb_preliminares', true); await esperar(150);
const bote2 = [...document.querySelectorAll('.item')].find(x => /Bote de material/.test(x.textContent));
bote2.querySelector('button[onclick^="agregarCamion"]').click(); await esperar(200);
const pl = bote2.querySelector('.camion .placa'); pl.dispatchEvent(new Event('focus')); if (typeof listaDePlacas === 'function') listaDePlacas(); await esperar(150);
const dl = document.getElementById(pl.getAttribute('list'));
ok('10 · La placa escrita queda en la lista de placas para el camión siguiente', dl && [...dl.options].some(o => o.value === 'A12BC3D'), dl ? [...dl.options].map(o => o.value).join(',') : 'sin lista');
// 11
const r = $('#residente');
ok('11a · El residente sale con la de ADDISON', r.value === 'Ing. Paola Saa', r.value);
const fl = r.closest('.res-caja').querySelector('.res-abrir'); fl.click(); await esperar(150);
const nombres = [...document.querySelectorAll('.res-lista button')].map(x => x.dataset.r);
ok('11b · La lista abre con ella primero', nombres[0] === 'Ing. Paola Saa' && fl.getAttribute('aria-expanded') === 'true', nombres.slice(0, 3).join(', '));
// 12
document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await esperar(150);
const conEsc = !document.querySelector('.res-lista');
fl.click(); await esperar(150); document.querySelector('label').click(); await esperar(150);
ok('12 · La lista se cierra con Escape y con un toque fuera, y el «▾» lo dice', conEsc && !document.querySelector('.res-lista') && fl.getAttribute('aria-expanded') === 'false', 'Escape: ' + conEsc);
localStorage.setItem(CLAVE_LISTA, '[]'); localStorage.removeItem(CLAVE_TORRES);
