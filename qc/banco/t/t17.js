// SERVICIOS: apartamentos con acentos, fotos en servicios y en apartamentos
Object.keys(localStorage).filter(k => /garmel_srv_/.test(k)).forEach(k => localStorage.removeItem(k));
nuevoInforme(); Q.elegir($('#torre'), 'T-05'); await esperar(150);
if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
if ($('#convenio').options.length > 2) Q.elegir($('#convenio'), $('#convenio').options[1].value);
Q.elegir($('#inspectores select'), INSPECTORES_DB[0]);
const sid = GENERAL[0].id;
Q.ponerFotos($('#srv-' + sid + ' input[type=file]'), [await Q.foto(800,600,140), await Q.foto(800,600,141)]);
await hasta(() => $$('#fotos-' + sid + ' .foto img').length === 2, 10000);
$('#tab-b').click();
for (const nombre of ['4B Ñandú', 'Área 5-C', 'PB · côté']){
  $('#panel-b .btn-add').click();
  const f = $$('.fila-apto').pop();
  Q.escribir(f.querySelector('.apto'), nombre);
  Q.ponerFotos(f.querySelector('input[type=file]'), [await Q.foto(700,500,150 + $$('.fila-apto').length)]);
  await hasta(() => f.querySelectorAll('.foto img').length === 1, 10000);
}
guardar(false); await _escrituraFotos;
Q.dialogos = []; enviar(); await esperar(400); await hasta(() => !_tandaEnCurso && !$('#cartel-envio'), 40000);
const env = (await Q.envios()).slice(-1)[0];
ok('Servicios: 5 fotos (2 de servicio + 3 de apartamentos con acentos)', env && env.tipo === 'servicios' && env.fotos.length === 5, env && env.fotos.join(' '));
