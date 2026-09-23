// SHA: hallazgos con acentos, incidencias con fotos, recaudos y generales
Object.keys(localStorage).filter(k => /garmel_sha_/.test(k)).forEach(k => localStorage.removeItem(k));
nuevoInforme(); Q.elegir($('#torre'), 'T-45'); await esperar(150);
if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
if ($('#convenio').options.length > 2) Q.elegir($('#convenio'), $('#convenio').options[1].value);
Q.elegir($('#inspectores select'), INSPECTORES_DB[0]);
Q.elegir($('#estatus'), 'Aprobado');
Q.ponerFotos($('#srv-sha_recaudos input[type=file]'), [await Q.foto(700,500,160)]);
await hasta(() => $$('#fotos-sha_recaudos .foto img').length === 1, 10000);
Q.ponerFotos($('#fotos-general').parentElement.querySelector('input[type=file]'), [await Q.foto(700,500,161)]);
await hasta(() => $$('#fotos-general .foto img').length === 1, 10000);
const DESC = '[data-campo="hallazgo__Descripción del hallazgo o condición observada"]', ST = '[data-campo="hallazgo__Acción correctiva / estatus"]';
for (const area of ['Área de trabajo(frisado de baños', 'Albañilería/construcción civil', 'Señalización ñ']){
  $('#tab-b').click(); $('#panel-b .btn-add').click();
  const f = $$('.fila-apto').pop();
  Q.escribir(f.querySelector('.apto'), area); Q.escribir(f.querySelector(DESC), 'desc ' + area); Q.elegir(f.querySelector(ST), 'Pendiente');
  Q.ponerFotos(f.querySelector('input[type=file]'), [await Q.foto(700,500,170 + $$('.fila-apto').length), await Q.foto(700,500,180 + $$('.fila-apto').length)]);
  await hasta(() => f.querySelectorAll('.foto img').length === 2, 10000);
}
verPanel('c');
for (const tipo of ['Caída de altura', 'Contacto eléctrico']){
  addIncidencia(); const f = $$('#filas-inc .fila-inc').pop();
  Q.elegir(f.querySelector('.inc-tipo-sel'), tipo);
  Q.escribir(f.querySelector('.inc-notas'), 'notas ñ ' + tipo);
  Q.ponerFotos(f.querySelector('input[type=file]'), [await Q.foto(700,500,190 + $$('#filas-inc .fila-inc').length)]);
  await hasta(() => f.querySelectorAll('.foto img').length === 1, 10000);
}
guardar(false); await _escrituraFotos;
Q.dialogos = []; enviar(); await esperar(400); await hasta(() => !_tandaEnCurso && !$('#cartel-envio'), 40000);
const env = (await Q.envios()).slice(-1)[0];
ok('SHA: 10 fotos (1 recaudo + 1 general + 6 hallazgos + 2 incidencias)', env && env.tipo === 'sha' && env.fotos.length === 10, env && env.fotos.join(' '));
