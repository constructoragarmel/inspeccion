// TANDA 12 · SHA: quitar un hallazgo con fotos (arreglo del motor) + Inicio 44
const ST = '[data-campo="hallazgo__Acción correctiva / estatus"]', DESC = '[data-campo="hallazgo__Descripción del hallazgo o condición observada"]';
Object.keys(localStorage).filter(k => /garmel_sha_(list|torres|actual|empresas)/.test(k)).forEach(k => localStorage.removeItem(k));
Q.elegir($('#torre'), 'T-46'); await esperar(100); if ($('#aviso-historial .no')) $('#aviso-historial .no').click(); if ($('#convenio').options.length > 2) Q.elegir($('#convenio'), $('#convenio').options[1].value); Q.elegir($('#inspectores select'), INSPECTORES_DB[0]);
const hallazgo = async (area, st, semilla) => { $('#tab-b').click(); $('#panel-b .btn-add').click(); const f = $$('.fila-apto').pop(); Q.escribir(f.querySelector('.apto'), area); Q.escribir(f.querySelector(DESC), 'd ' + area); Q.elegir(f.querySelector(ST), st); Q.ponerFotos(f.querySelector('input[type=file]'), [await Q.foto(600, 400, semilla)]); await hasta(() => f.querySelectorAll('.foto img').length === 1); return f; };
await hallazgo('A', 'Pendiente', 71); await hallazgo('B', 'En proceso', 72); await hallazgo('C', 'Corregido', 73);
guardar(false); await _escrituraFotos; const id = idActual;
const srcB = $$('.fila-apto')[1].querySelector('.foto img').src.slice(-80);
quitarApto($$('.fila-apto')[0].querySelector('.quitar')); guardar(false); await _escrituraFotos;
const g = await FotosDB.leer(id);
ok('Tras quitar A, IndexedDB tiene apto:0 (B) y apto:1 (C), no tres', Object.keys(g).filter(k => /^apto:/.test(k)).length === 2, Object.keys(g).join());
nuevoInforme(); cargarInforme(id); await hasta(() => $$('.fila-apto .foto img').length === 2, 8000); await esperar(100);
ok('Reabierto: el hallazgo B muestra SU foto', $$('.fila-apto')[0].querySelector('.apto').value === 'B' && $$('.fila-apto')[0].querySelector('.foto img').src.slice(-80) === srcB);
ok('Inicio mide 44 en SHA', Math.round($('a.inicio').getBoundingClientRect().height) >= 44);
ok('Ningún error', !Q.R.some(r => /pageerror|unhandled/.test(r.n)));
