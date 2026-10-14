// ── 184. El envío espera al relevo, y si se corta pregunta antes de darlo por pendiente (14-oct-2026) ──
// El relevo archiva, arma el PDF y empuja a Smartsheet dentro de la misma llamada: con muchas fotos pasa de los
// 90 s que el formulario esperaba, decía «La señal no alcanzó para enviar» y el inspector volvía a tocar Enviar.
// En el registro había 34 reenvíos del mismo número entre 1 y 4 minutos después del anterior, 17 solo el 14-oct,
// casi todos a 85-120 s (SR-T04-261007-GM se mandó cuatro veces en seis minutos). Lo que cambia:
//   · se espera hasta PLAZO_ENVIO_MS (5 min) con el contador de segundos a la vista;
//   · si aun así se corta, se le pregunta al relevo (`accion: 'existe'`) si ese número ya está archivado, dos
//     veces con _REINTENTO_EXISTE_MS entre una y otra, y si existe se marca como enviado y no se reenvía;
//   · si no existe, el mensaje dice que todavía no aparece archivado (no que «no llegó»), se recuerda el corte en
//     `_cortes`, y el próximo Enviar de ese número vuelve a preguntar antes de mandarlo.
// El mismo número de un envío anterior no cuenta: solo vale un archivo creado desde que empezó este intento
// (`hace`, medido en el relevo, contra lo que lleva esperando el teléfono, con dos minutos de margen) o, en los
// formularios que mandan `guardado`, el mismo guardado. La consulta lleva `nro` y no `numero` a propósito: un relevo
// sin la acción contesta «Faltan numero…» en vez de archivar un informe vacío con ese número.
let PLAZO_ENVIO_MS = 300000;
let _REINTENTO_EXISTE_MS = 15000;
const _cortes = {};
async function _yaArchivado(clave, nro, sector, torre, tipo, desde, repetir, guardado){
  for (let intento = 0; intento < (repetir ? 2 : 1); intento++) {
    if (intento) await new Promise(function(r){ setTimeout(r, _REINTENTO_EXISTE_MS); });
    const corte = new AbortController(); const reloj = setTimeout(function(){ corte.abort(); }, 25000);
    try {
      const cuerpo = { clave: clave, accion: 'existe', nro: nro, sector: sector, torre: torre };
      if (tipo) cuerpo.tipo = tipo;
      const r = await fetch(RELEVO_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                                          body: JSON.stringify(cuerpo), signal: corte.signal });
      const j = await r.json();
      if (j && j.ok && j.existe) {
        const ventana = Math.round((Date.now() - (desde || Date.now())) / 1000) + 120;
        const mismoGuardado = !!(guardado && j.guardado && j.guardado === guardado);
        if (mismoGuardado || typeof j.hace !== 'number' || j.hace <= ventana) {
          console.warn(nro, 'ya estaba archivado aunque la respuesta no llegó:', j.ultimo, 'hace', j.hace, 's');
          return j.ultimo || true;
        }
        console.warn(nro, 'hay un archivo con ese número pero es de antes (hace', j.hace, 's, ventana', ventana, 's)');
      }
    } catch (e) { console.warn('No se pudo comprobar si', nro, 'ya está archivado:', (e && e.message) || e); }
    finally { clearTimeout(reloj); }
  }
  return false;
}
function _minutosDeEspera(){ return Math.max(1, Math.round(PLAZO_ENVIO_MS / 60000)); }
