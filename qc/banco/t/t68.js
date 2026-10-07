// TANDA 68 · V137 (7-oct-2026): el desplegable de torre sale del maestro, no de la plantilla. En inspeccion.html.
// Lo vio Diego el 7-oct: la T-43 (Simón Rodríguez, entró al maestro el 4-oct) estaba en la tabla TORRES y no en el desplegable.
// 1 las opciones del desplegable son exactamente las torres del maestro · 2 la T-43 está · 3 con el sector Simón Rodríguez la T-43 se ve y la T-45 no
// 4 elegir la T-43 llena empresa y sector · 5 con el sector Ezequiel Zamora la T-43 se esconde · 6 el número de informe la toma
localStorage.setItem('garmel_rol', 'inspector'); localStorage.setItem('garmel_clave_envio', 'qc');
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const opciones = () => [...document.getElementById('torre').options].map(o => o.value).filter(v => v && v !== 'NO_REG');
const visible = t => { const o = [...document.getElementById('torre').options].find(o => o.value === t); return !!o && !o.hidden && !o.disabled; };
const sectorPorTexto = txt => [...document.getElementById('convenio').options].find(o => o.textContent.includes(txt)).value;
Q.aceptar = true; nuevoFormulario(); await esperar(300);
const maestro = [...new Set(TORRES.map(x => x.t))].sort();
ok('1 · Las opciones del desplegable son exactamente las torres del maestro (' + maestro.length + ')', opciones().join(',') === maestro.join(','), opciones().join(','));
ok('2 · La T-43 está en el desplegable', opciones().includes('T-43'), opciones().filter(v => /T-4/.test(v)).join(','));
sel('convenio', sectorPorTexto('Rodríguez')); await esperar(200);
ok('3 · Con el sector Simón Rodríguez la T-43 se ve y la T-45 (Ezequiel Zamora) no', visible('T-43') && !visible('T-45'), 'T-43 ' + visible('T-43') + ' · T-45 ' + visible('T-45'));
sel('torre', 'T-43'); await esperar(300);
const emp = document.getElementById('empresa').value, conv = document.getElementById('convenio').value;
ok('4 · Elegir la T-43 llena la empresa (Glajos) y mantiene el sector', /GLAJOS/.test(emp) && conv === sectorPorTexto('Rodríguez'), emp + ' · ' + conv);
sel('fecha', '2026-10-07'); await esperar(200);
const nro = (document.getElementById('nro-display') || {}).textContent || '';
ok('6 · El número de informe toma la T-43', /43/.test(nro), nro);
sel('convenio', sectorPorTexto('Zamora')); await esperar(300);
ok('5 · Con el sector Ezequiel Zamora la T-43 se esconde y la torre se suelta', !visible('T-43') && document.getElementById('torre').value !== 'T-43', 'visible ' + visible('T-43') + ' · torre ' + document.getElementById('torre').value);
Q.aceptar = true; nuevoFormulario(); await esperar(200);
