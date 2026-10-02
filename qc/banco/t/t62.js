// TANDA 62 · V116 (2-oct-2026): «Minutas de campo» en inspeccion.html.
// 1 la tarjeta al final, con sus seis hojas · 2 la hoja se guarda a 1600 px · 3 viaja con las fotos del informe y cuenta como contenido
// 4 al enviar iría como «minutas-1» · 5 el tope · 6 guardado como borrador y reabierto, vuelve · 7 el informe siguiente empieza sin minutas · 8 cabe
localStorage.setItem('garmel_rol', 'inspector');
localStorage.setItem('garmel_clave_envio', 'qc');
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const put = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
const limpiar = async () => { Q.aceptar = true; nuevoFormulario(); await esperar(300); };
const cabecera = () => {
  sel('fecha', '2026-10-05'); sel('convenio', 'Convenio Bielorrusos'); sel('torre', 'T-07');
  const emp = [...document.getElementById('empresa').options].map(o => o.value);
  sel('empresa', emp.find(x => /ALNAVIC/i.test(x)) || emp[1]);
  const insp = document.querySelector('.inspector-select');
  insp.value = [...insp.options].map(o => o.value).filter(Boolean)[0]; insp.dispatchEvent(new Event('change', { bubbles: true }));
  const res = document.querySelector('#residentes-container input'); if (res) put(res.id || (res.id = 'res0'), 'Ing. Prueba');
  if (!document.querySelector('#estatus .ck-lbl.on')) document.querySelector('#estatus .ck-lbl').click();
  sel('piso', 'Piso 03'); put('apto', 'A');
};
const img = fi => document.getElementById('fimg_minutas_' + fi);
const puestas = () => [0, 1, 2, 3, 4, 5].filter(fi => img(fi) && /^data:image/.test(img(fi).src)).length;
await limpiar(); setAmbito('apartamento'); await esperar(200); cabecera(); await esperar(300);
const card = document.getElementById('min-card'), cam = card.querySelector('.btn-camara input'), general = document.getElementById('obs_general').closest('.obs-card');
ok('1 · La tarjeta «Minutas de campo» va al final, después de las observaciones generales, con seis hojas y su botón de cámara',
   !!card && !!(general.compareDocumentPosition(card) & Node.DOCUMENT_POSITION_FOLLOWING) && card.querySelectorAll('.foto-slot').length === 6 && /Fotografiar minuta/.test(card.querySelector('.btn-camara').textContent) &&
   cam.getAttribute('capture') === 'environment' && /anexo del PDF/.test(card.querySelector('.act-pista').textContent), card.querySelectorAll('.foto-slot').length + ' hojas');
const vacio0 = _tieneContenido(getFormData());
Q.ponerFotos(cam, [await Q.foto(3000, 2000, 5)]);
await hasta(() => puestas() === 1 && img(0).naturalWidth > 0, 30000);
ok('2 · La hoja se guarda a 1600 px de lado (una foto de hito, a ' + MAX_FOTO_PX + ')', img(0).naturalWidth === 1600 && MAX_FOTO_PX < 1600, img(0).naturalWidth + ' px');
const d3 = getFormData();
ok('3 · Viaja con las fotos del informe, y con solo una minuta ya hay contenido que guardar', vacio0 === false && (d3.fotos.minutas || []).filter(Boolean).length === 1 && /^data:image/.test(d3.fotos.minutas[0]) && _tieneContenido(d3) === true,
   'hojas: ' + (d3.fotos.minutas || []).filter(Boolean).length + ' · contenido antes ' + vacio0 + ', después ' + _tieneContenido(d3));
const nombres = []; Object.keys(d3.fotos).forEach(pid => (d3.fotos[pid] || []).forEach((src, fi) => { if (src) nombres.push(pid + '-' + (fi + 1)); }));
ok('4 · Al enviar va como «minutas-1», que es como el relevo arma el anexo del PDF', nombres.join() === 'minutas-1', nombres.join());
for (let k = 1; k < 6; k++) { Q.ponerFotos(cam, [await Q.foto(320, 240, 10 + k)]); await hasta(() => puestas() === k + 1, 30000); await esperar(1600); }
Q.dialogos.length = 0;
Q.ponerFotos(cam, [await Q.foto(320, 240, 99)]); await esperar(700);
ok('5 · El tope es de 6 hojas: la séptima no entra y lo avisa', puestas() === 6 && Q.dialogos.some(m => /Ya hay 6 hojas de minuta/.test(m)), puestas() + ' hojas · ' + (Q.dialogos[0] || 'sin aviso'));
removeFoto('minutas', 5); removeFoto('minutas', 4); removeFoto('minutas', 3); removeFoto('minutas', 2); await esperar(200);
currentEditingIndex = null; _idEnEdicion = null; saveDraft(true); await esperar(900);
await limpiar();
const tras7 = puestas();
loadDraftData(0);
await hasta(() => puestas() === 2, 20000);
ok('6 · Guardado como borrador y reabierto, vuelven las dos hojas (se corre en navegador: lee IndexedDB)', puestas() === 2 && img(0).naturalWidth === 1600, puestas() + ' hojas');
ok('7 · «Limpiar todo» deja el bloque sin minutas', tras7 === 0, tras7 + ' hojas');
Q.aceptar = true; siguienteApartamento(); await esperar(900);
ok('7b · El apartamento siguiente empieza sin minutas: la minuta es del informe donde se fotografió', puestas() === 0 && document.getElementById('apto').value === '', puestas() + ' hojas');
card.scrollIntoView(); await esperar(100);
const ancho = window.innerWidth, cajas = [...card.querySelectorAll('.foto-slot, .btn-camara')].map(e => e.getBoundingClientRect());
ok('8 · A ' + ancho + ' px la tarjeta cabe, el botón de cámara mide al menos 44 px y nada ensancha la página', cajas.every(r => r.left >= 0 && r.right <= ancho + 1) && card.querySelector('.btn-camara').getBoundingClientRect().height >= 44 && document.documentElement.scrollWidth <= ancho + 1,
   'botón ' + Math.round(card.querySelector('.btn-camara').getBoundingClientRect().height) + ' px · scrollWidth ' + document.documentElement.scrollWidth + ' / ' + ancho);
await limpiar();
