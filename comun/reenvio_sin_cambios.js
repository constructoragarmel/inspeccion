// ── 173. Reenviar sin cambios avisa (7-oct-2026) ─────────────────────────────
// En la reunión del 7-oct Diego Orta abrió en la computadora un informe de campo
// solo para verlo y preguntó si al salir quedaría «registrado como una revisión».
// Nada se envía si no se toca Enviar; pero si lo toca sin haber cambiado nada,
// salía una revisión idéntica (-r2) en Drive y Smartsheet. Ahora se le dice y se
// le da la salida: si solo lo abrió para verlo, no hace falta enviar nada.
// Cerrarlo como versión definitiva es intencional y no se pregunta.
let _cerrandoDefinitiva = false;
if (typeof cerrarDefinitiva === 'function') {
  const _cerrarDefinitivaBase173 = cerrarDefinitiva;
  cerrarDefinitiva = function(){ _cerrandoDefinitiva = true; return _cerrarDefinitivaBase173.apply(this, arguments); };
}
function _informeEnEdicion(){
  const lista = getSavedReports();
  const idAct = (typeof _idEnEdicion !== 'undefined') ? _idEnEdicion : null;
  if (idAct) { const b = lista.find(function(x){ return x && x.id === idAct; }); if (b) return b; }
  if (typeof currentEditingIndex !== 'undefined' && currentEditingIndex !== null) return lista[currentEditingIndex] || null;
  return null;
}
const _enviarAlRelevoBase173 = enviarAlRelevo;
enviarAlRelevo = async function(){
  let seguir = true;
  try {
    const b = _informeEnEdicion();
    if (b && b.enviado && !_cerrandoDefinitiva && !b.editadoTras && _huellaInforme(b) === _huellaInforme(getFormData())) {
      seguir = confirm('Este informe ya se envió (' + b.enviado + ') y no cambió nada desde entonces.\n\n' +
                       'Reenviarlo crearía una revisión idéntica en Drive y en Smartsheet.\n\n' +
                       'Si lo abrió solo para verlo, toque Cancelar: no hace falta enviar nada. ¿Enviar igual?');
    }
  } catch (e) { seguir = true; }
  _cerrandoDefinitiva = false;
  if (!seguir) return;
  return _enviarAlRelevoBase173.apply(this, arguments);
};
const _nuevoFormularioBase173 = nuevoFormulario;
nuevoFormulario = function(){ _cerrandoDefinitiva = false; return _nuevoFormularioBase173.apply(this, arguments); };
