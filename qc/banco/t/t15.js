// URBANISMO: acentos y ñ en todo lo que pueda nombrar una foto
const EZ = TORRES_DATA[0].c;
Object.keys(localStorage).filter(k => /garmel_urb_/.test(k)).forEach(k => localStorage.removeItem(k));
nuevoInforme(); Q.elegir($('#inspectores select'), INSPECTORES_DB[0]);
Q.elegir($('#convenio'), EZ);
abrirNuevaManzana(); $('#nm-sector').value = EZ; $('#nm-nombre').value = 'Mañana Ñ-1 «Círculo»'; guardarNuevaManzana(); await esperar(100);
if ($('#aviso-historial .no')) $('#aviso-historial .no').click();
// sección agregada con acentos
$('#ns-nombre').value = 'Señalización y áreas verdes'; agregarSeccion(); await esperar(300);
const secciones = ['urb_drenaje', 'urb_vialidad', GENERAL[GENERAL.length - 1].id];
for (let s = 0; s < secciones.length; s++){
  const sid = secciones[s];
  // partida agregada con acentos
  agregarItemNuevo(sid); const it = $$('#items-' + sid + ' .item').pop();
  Q.escribir(it.querySelector('.nombre-libre'), 'Bordillo de acería ñ' + s);
  if (it.querySelector('.ud-sel')) Q.elegir(it.querySelector('.ud-sel'), 'm');
  Q.escribir(it.querySelector('.cant'), '10');
  Q.escribir($('#items-' + sid + ' .item .cant'), '5');
  Q.escribir($('#srv-' + sid + ' .obs-srv'), 'Nota de la sección ' + s + ' con ñ y tildes áéíóú');
  const fotos = [await Q.foto(900, 700, 90 + s), await Q.foto(900, 700, 95 + s)];
  Q.ponerFotos($('#srv-' + sid + ' input[type=file]'), fotos);
  await hasta(() => $$('#fotos-' + sid + ' .foto img').length === 2, 10000);
}
guardar(false); await _escrituraFotos;
const d = datosDelFormulario();
ok('El informe lleva 3 secciones con 2 fotos cada una', d.general.filter(g => g.fotos.length === 2).length === 3, d.general.filter(g => g.fotos.length).map(g => g.id + ':' + g.fotos.length).join());
Q.dialogos = []; enviar(); await esperar(400); await hasta(() => !_tandaEnCurso && !$('#cartel-envio'), 40000);
const env = (await Q.envios()).slice(-1)[0];
ok('Enviado con 6 fotos', env && env.fotos.length === 6, env && env.fotos.join(' '));
