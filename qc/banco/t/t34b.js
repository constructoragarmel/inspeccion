// ROBUSTEZ · tanda 3b — TRAS RECARGAR (30-sep-2026). Correr después de t34 y de recargar la página SIN borrar nada.
const lista = () => JSON.parse(localStorage.getItem('garmel_reports_list') || '[]');
const id = localStorage.getItem('qc_rec');
await hasta(() => document.getElementById('apto').value === 'REC', 6000, 100);
await hasta(() => /Se recuperó/.test(document.getElementById('toast').textContent), 4000, 100);
ok('15 · Tras recargar, vuelve solo el informe que se estaba llenando (REC, 2 de 7) y se sigue llenando en el mismo borrador',
   document.getElementById('apto').value === 'REC' && document.getElementById('ej_hito_acc_electricos_0').value === '2' &&
   document.getElementById('pr_hito_acc_electricos_0').value === '7' && _idEnEdicion === id && _abiertoParaEditar === false &&
   /Se recuperó/.test(document.getElementById('toast').textContent),
   'apto=' + document.getElementById('apto').value + ' · id ' + (_idEnEdicion === id) + ' · abierto=' + _abiertoParaEditar);
localStorage.removeItem('qc_rec');
