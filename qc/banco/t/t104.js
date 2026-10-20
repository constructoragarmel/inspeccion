// TANDA 104 · v178 (20-oct-2026), pedido 6 de Diego Orta: residentes como lista desplegable (comun/residentes.js), en
// inspeccion.html, servicios.html, sha.html o urbanismo.html (?prueba=1). 1 cada campo de residente lleva su «▾» de 44 px
// · 2 la lista abre debajo, con los de la contratista primero y los demás del sector después · 3 tocar uno lo pone en el campo
// y viaja en los datos · 4 tocar fuera la cierra · 5 se sigue pudiendo escribir uno nuevo · 6 (obra) un residente agregado
// tiene su propio «▾» · 7 (urbanismo) el de la contratista de urbanismo · 8 los escritos en el teléfono aparecen para su empresa
localStorage.setItem('garmel_rol', 'inspector');
Q.aceptar = true;
const OBRA = typeof TIPO_INFORME === 'undefined', URB = !OBRA && TIPO_INFORME === 'urbanismo';
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); };
const campo = () => OBRA ? document.querySelector('.residente-input') : document.getElementById('residente');
const flecha = i => i.closest('.res-caja').querySelector('.res-abrir');
if (!OBRA) { localStorage.setItem(CLAVE_LISTA, '[]'); nuevoInforme(); } else { localStorage.setItem('garmel_reports_list', '[]'); }
await esperar(300);
sel('convenio', 'Convenio Bielorrusos'); await esperar(200);
sel('torre', URB ? 'M-6' : 'T-03'); await esperar(500);
const inp = campo(), b = flecha(inp), rb = b.getBoundingClientRect();
ok('1 · El residente lleva su «▾» de 44 px dentro del campo', rb.width >= 44 && rb.height >= 44 && b.getAttribute('aria-label') === 'Elegir el residente de una lista', Math.round(rb.width) + '×' + Math.round(rb.height));
b.click(); await esperar(200);
const lista = document.querySelector('.res-lista'), grupos = lista ? [...lista.querySelectorAll('.res-g')].map(g => g.textContent) : [];
const nombres = lista ? [...lista.querySelectorAll('button')].map(x => x.dataset.r) : [];
const emp = document.getElementById('empresa').value;
if (URB) ok('2 · Urbanismo: abre con la residente de ADDISON primero', grupos[0] === 'De ADDISON' && nombres[0] === 'Ing. Paola Saa', grupos.join(' | ') + ' · ' + nombres.slice(0, 3).join(', '));
else ok('2 · Abre debajo con los de ' + emp + ' primero (T-01 y T-02) y los demás del sector después',
        grupos[0] === 'De ' + emp && nombres[0] === 'ING. HARRY ARTEAGA' && nombres[1] === 'ING. MARIA T. MARCANO' && grupos.indexOf('Otros del sector') > 0 &&
        b.getBoundingClientRect().top === rb.top && lista.getBoundingClientRect().top >= inp.getBoundingClientRect().bottom,
        grupos.join(' | ') + ' · ' + nombres.slice(0, 3).join(', '));
const elegido = nombres[1] || nombres[0];
[...lista.querySelectorAll('button')].find(x => x.dataset.r === elegido).click(); await esperar(200);
const d = OBRA ? getFormData() : datosDelFormulario();
const enDatos = OBRA ? (d.residentes || []).indexOf(elegido) >= 0 : d.residente === elegido;
ok('3 · Tocar uno lo pone en el campo, cierra la lista y viaja en los datos', inp.value === elegido && !document.querySelector('.res-lista') && enDatos, inp.value);
b.click(); await esperar(150); document.querySelector('label').click(); await esperar(150);
ok('4 · Tocar fuera la cierra', !document.querySelector('.res-lista') && b.getAttribute('aria-expanded') === 'false');
inp.value = 'Ing. Nuevo Residente'; inp.dispatchEvent(new Event('input', { bubbles: true })); await esperar(150);
const d5 = OBRA ? getFormData() : datosDelFormulario();
ok('5 · Se puede escribir uno que no está en la lista', OBRA ? (d5.residentes || []).indexOf('Ing. Nuevo Residente') >= 0 : d5.residente === 'Ing. Nuevo Residente');
if (OBRA) {
  addResidenteField(''); await esperar(150);
  const ins = [...document.querySelectorAll('.residente-input')];
  ok('6 · Obra: el residente agregado tiene su propio «▾» y su ✕ sigue quitando la fila',
     ins.length === 2 && ins.every(i => i.closest('.res-caja') && flecha(i)) && (() => { ins[1].closest('.multi-input-row').querySelector('.btn-remove-item').click(); return document.querySelectorAll('.residente-input').length === 1; })());
  localStorage.setItem('garmel_reports_list', JSON.stringify([{ id: 'x', empresa: emp, convenio: 'Convenio Bielorrusos', residentes: ['ING. ESCRITO EN OBRA'] }]));
} else {
  localStorage.setItem(CLAVE_LISTA, JSON.stringify([{ id: 'x', empresa: emp, convenio: 'Convenio Bielorrusos', residente: 'ING. ESCRITO EN OBRA' }]));
}
flecha(campo()).click(); await esperar(150);
const g8 = [...document.querySelectorAll('.res-lista .res-g')].map(g => g.textContent), n8 = [...document.querySelectorAll('.res-lista button')].map(x => x.dataset.r);
ok('8 · El que este teléfono ya escribió para esa empresa aparece en «Escritos en este teléfono»', g8.indexOf('Escritos en este teléfono') >= 0 && n8.indexOf('ING. ESCRITO EN OBRA') >= 0, g8.join(' | '));
document.querySelector('label').click();
if (OBRA) localStorage.setItem('garmel_reports_list', '[]'); else localStorage.setItem(CLAVE_LISTA, '[]');
