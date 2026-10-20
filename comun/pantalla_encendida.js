// ── 193. El teléfono no se duerme mientras envía (20-oct-2026) ──────────────────────────────────────────────────────
// Diego Orta: con el teléfono en reposo el envío se pausa. Android congela la página cuando se apaga la pantalla o se cambia
// de app, y una PWA no puede subir en segundo plano. Mientras dura un envío —uno solo o «Enviar todos», en los cuatro
// formularios— se le pide al navegador que no apague la pantalla (Wake Lock) y se suelta al terminar o al fallar. Si la página
// se oculta el bloqueo se pierde: al volver a verse, con el envío en curso, se pide otra vez. Arriba queda un aviso: «Mantenga
// la app abierta y el teléfono desbloqueado hasta que termine». Donde el navegador no tiene Wake Lock solo sale el aviso.
// El aviso y el bloqueo empiezan con la primera llamada al relevo, no al tocar Enviar: mientras se confirma o se avisa que
// falta algo no hay nada que mantener. Lo enviado antes de un corte no se repite: «Enviar todos» marca cada informe al llegar,
// y del que quedó en el aire se le pregunta al relevo si ya está archivado (184).
let _envios193 = 0, _activo193 = false, _cerrojo193 = null;
async function _pedirCerrojo193(){
  if (!_activo193 || _cerrojo193 || document.visibilityState !== 'visible') return;
  try {
    if (!navigator.wakeLock || !navigator.wakeLock.request) return;
    const c = await navigator.wakeLock.request('screen');
    if (!_activo193) { try { c.release(); } catch (e) {} return; }
    _cerrojo193 = c;
    if (c.addEventListener) c.addEventListener('release', function(){ if (_cerrojo193 === c) _cerrojo193 = null; });
  } catch (e) { _cerrojo193 = null; }
}
function _soltarCerrojo193(){ const c = _cerrojo193; _cerrojo193 = null; try { if (c) c.release(); } catch (e) {} }
function _avisoEnvio193(mostrar){
  let a = document.getElementById('aviso-envio193');
  if (!mostrar) { if (a) a.remove(); return; }
  if (!a) {
    a = document.createElement('div'); a.id = 'aviso-envio193'; a.setAttribute('role', 'status');
    a.style.cssText = 'position:fixed;left:12px;right:12px;top:12px;z-index:10001;padding:12px 14px;border-radius:10px;' +
      'background:#fef3c7;color:#78350f;border:2px solid #f59e0b;font-size:15px;font-weight:700;line-height:1.35;text-align:center;' +
      'box-shadow:0 4px 14px rgba(0,0,0,.25)';
    a.textContent = '📶 Mantenga la app abierta y el teléfono desbloqueado hasta que termine.';
    document.body.appendChild(a);
  }
}
function _activar193(){ if (_activo193) return; _activo193 = true; _avisoEnvio193(true); _pedirCerrojo193(); }
function _terminar193(){ _activo193 = false; _soltarCerrojo193(); _avisoEnvio193(false); }
document.addEventListener('visibilitychange', function(){ if (document.visibilityState === 'visible') _pedirCerrojo193(); });
// La primera llamada al relevo de un envío lo enciende.
(function(){
  const base = window.fetch;
  window.fetch = function(url, op){
    try { if (_envios193 > 0 && op && String(op.method || '').toUpperCase() === 'POST' && typeof RELEVO_URL !== 'undefined' && String(url) === String(RELEVO_URL)) _activar193(); } catch (e) {}
    return base.apply(this, arguments);
  };
})();
// Las cuatro formas de enviar: «Enviar todos» y el de pantalla en obra; «Enviar» (todos) y «📤 Enviar» de uno en el motor.
['enviarPendientes', 'enviarAlRelevo', 'enviar', 'enviarSolo'].forEach(function(n){
  if (typeof window[n] !== 'function') return;
  const base = window[n];
  window[n] = async function(){
    _envios193++;
    try { return await base.apply(this, arguments); }
    finally { if (--_envios193 <= 0) { _envios193 = 0; _terminar193(); } }
  };
});
