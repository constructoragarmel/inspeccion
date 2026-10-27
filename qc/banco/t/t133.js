// TANDA 133 · cambio 195 (27-oct-2026): el título de cada inspector en los desplegables. Corre en los cuatro formularios (?prueba=1).
// 1 cada opción del padrón se ve con su título (Ing., Arq. o TSU) y el valor sigue sin título · 2 Christian Fricke sale «Arq.» y
// Gabriel Barrios «TSU» donde estén · 3 al agregar otro inspector, el desplegable nuevo también lleva títulos · 4 el número del
// informe sigue con las mismas iniciales · 5 lo guardado y lo enviado llevan el nombre del padrón, sin título · 6 nada se sale.
const OBRA = typeof enviarPendientes === 'function';
const CL = OBRA ? 'garmel_reports_list' : CLAVE_LISTA;
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc'); localStorage.setItem(CL, '[]');
Q.aceptar = true;
await Q.relevo({ caido: false, fallar: [], lento: 0, borrar: true });
const sels = () => $$(OBRA ? 'select.inspector-select' : '#inspectores select');
OBRA ? nuevoFormulario() : nuevoInforme(); await esperar(400);
const s0 = sels()[0], ops = [...s0.options].filter(o => o.value && o.value !== 'OTRO');
const sinT = ops.filter(o => !/^(Ing|Arq|TSU)\b/.test(o.textContent));
ok('1 · Cada opción se ve con su título y el valor sigue sin título', ops.length > 0 && !sinT.length && ops.every(o => !/^(Ing|Arq|TSU)\b/.test(o.value) && o.textContent.endsWith(o.value)), sinT.map(o => o.value).join(', ') || ops.slice(0, 3).map(o => o.textContent).join(' | '));
const de = n => (ops.find(o => o.value.indexOf(n) === 0) || {}).textContent || '';
ok('2 · Los títulos son los de la hoja de cargos', ops.every(o => o.textContent === _conTitulo195(o.value)) &&
   (!de('Christian Fricke') || /^Arq\. Christian Fricke/.test(de('Christian Fricke'))) && (!de('Gabriel Barrios') || /^TSU Gabriel Barrios/.test(de('Gabriel Barrios'))) && (!de('Hernán Escobar') || /^Ing\. Hernán/.test(de('Hernán Escobar'))),
   [de('Christian Fricke'), de('Gabriel Barrios'), de('Hernán Escobar')].join(' | '));
if (OBRA) addInspectorField(); else { const b = [...document.querySelectorAll('button')].find(x => /Agregar inspector/i.test(x.textContent)); if (b) b.click(); else if (typeof addInspector === 'function') addInspector(); }
await esperar(300);
const s3 = sels()[sels().length - 1];
ok('3 · El desplegable de un inspector agregado también lleva títulos', sels().length >= 2 && [...s3.options].filter(o => o.value && o.value !== 'OTRO').every(o => /^(Ing|Arq|TSU)\b/.test(o.textContent)), sels().length);
// 4 y 5: número e iniciales
const put = (id, v) => { const e = document.getElementById(id); if (!e) return; e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
OBRA ? nuevoFormulario() : nuevoInforme(); await esperar(300);
const val = ops.find(o => /^Alejandro Bastidas/.test(o.value)) ? 'Alejandro Bastidas (CIV-67.316)' : ops[0].value;
const ini = val.replace(/\s*\(.*$/, '').split(/\s+/).map(w => w[0]).join('').toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
if (OBRA) { setAmbito('apartamento'); await esperar(200); put('fecha', '2026-10-27'); put('convenio', 'Convenio Bielorrusos'); put('torre', 'T-07'); put('piso', 'Piso 03'); put('apto', 'B2'); }
else { put('convenio', 'Convenio Bielorrusos'); const t = document.getElementById('torre'); put('torre', [...t.options].map(o => o.value).filter(Boolean)[0]); put('fecha', '2026-10-27'); await esperar(500); if ($('#aviso-historial .no')) $('#aviso-historial .no').click(); }
const s4 = sels()[0]; s4.value = val; s4.dispatchEvent(new Event('change', { bubbles: true })); await esperar(300);
const nro = OBRA ? document.getElementById('nro-display').textContent.trim() : (typeof numeroInforme === 'function' ? numeroInforme() : '');
ok('4 · El número sigue con las mismas iniciales (' + ini + ')', new RegExp('-' + ini + '$').test(nro), nro);
const datos = OBRA ? getFormData() : (typeof datosDelFormulario === 'function' ? datosDelFormulario() : {});
ok('5 · Lo que se guarda lleva el nombre del padrón, sin título', (datos.inspectores || []).indexOf(val) >= 0 && !(datos.inspectores || []).some(x => /^(Ing|Arq|TSU)\b/.test(x)), JSON.stringify(datos.inspectores));
ok('6 · Nada se sale de la pantalla', document.documentElement.scrollWidth <= innerWidth + 1, document.documentElement.scrollWidth + ' > ' + innerWidth);
OBRA ? nuevoFormulario() : nuevoInforme(); localStorage.setItem(CL, '[]');
