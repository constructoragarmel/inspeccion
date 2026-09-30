// PRIMERO EL SECTOR · inspección (30-sep-2026, pedido de Diego Orta). Correr en inspeccion.html a 375×812.
localStorage.setItem('garmel_rol', 'inspector');
localStorage.setItem('garmel_clave_envio', 'qc');
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const put = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
const conv = document.getElementById('convenio'), torre = document.getElementById('torre');
const visible = t => { const o = [...torre.options].find(x => x.value === t); return !!o && !o.hidden && !o.disabled; };
const limpiar = async () => { Q.aceptar = true; nuevoFormulario(); await esperar(300); };
await Q.relevo({ caido: false, fallar: [], lento: 0, borrar: true });
localStorage.setItem('garmel_reports_list', '[]');
await limpiar();

// ── 1. El sector va antes que la torre, se llama «Sector» y dice los nombres ──
const orden = conv.compareDocumentPosition(torre) & Node.DOCUMENT_POSITION_FOLLOWING;
const nombres = [...conv.options].filter(o => o.value).map(o => o.textContent);
ok('1 · «Sector *» va antes que la torre, con Ezequiel Zamora, Simón Rodríguez y Simón Bolívar; la torre pide elegir primero el sector',
   !!orden && conv.closest('.field').querySelector('label').textContent === 'Sector *' &&
   nombres.sort().join('|') === 'Ezequiel Zamora|Simón Bolívar|Simón Rodríguez' && /primero el sector/.test(torre.options[0].textContent),
   nombres.join(', ') + ' · ' + torre.options[0].textContent);

// ── 2. Con Simón Rodríguez: solo sus torres; la T-07 toma el sector sin preguntar y la empresa es la de Simón Rodríguez ──
sel('convenio', 'Convenio Rusos'); await esperar(100);
const v07 = visible('T-07'), v56 = visible('T-56');
sel('torre', 'T-07'); await esperar(200);
const aviso = (document.getElementById('aviso-zona').style.display !== 'none') && document.getElementById('aviso-zona').textContent;
ok('2 · Simón Rodríguez: la T-07 se ve y la T-56 no; al elegir la T-07 no pregunta la zona, la empresa es TSURU y el número dice SR-T07',
   v07 && !v56 && conv.value === 'Convenio Rusos' && !aviso && /TSURU/.test(document.getElementById('empresa').value) && /SR-T07/.test(document.getElementById('nro-display').textContent),
   'T-07 ' + v07 + ' T-56 ' + v56 + ' · aviso «' + (aviso || '') + '» · ' + document.getElementById('empresa').value + ' · ' + document.getElementById('nro-display').textContent);

// ── 3. Cambiar a Ezequiel Zamora: la T-07 sigue (existe allí) con su empresa; la T-38 (solo Simón Rodríguez) se suelta ──
sel('convenio', 'Convenio Bielorrusos'); await esperar(150);
sel('torre', 'T-07'); await esperar(150);
const emp3 = document.getElementById('empresa').value;
sel('convenio', 'Convenio Rusos'); await esperar(100); sel('torre', 'T-38'); await esperar(150);
sel('convenio', 'Convenio Bielorrusos'); await esperar(150);
ok('3 · En Ezequiel Zamora la T-07 es de Alnavic; con la T-38 elegida, pasar a Ezequiel Zamora la suelta',
   /ALNAVIC/.test(emp3) && torre.value === '' && conv.value === 'Convenio Bielorrusos',
   emp3 + ' · torre «' + torre.value + '» · ' + conv.value);

// ── 4. Sin sector, como antes: una torre de un solo sector lo pone; una de dos sectores avisa ──
await limpiar();
sel('torre', 'T-56'); await esperar(150);
const s56 = conv.value;
await limpiar();
sel('torre', 'T-07'); await esperar(150);
const avisoZ = document.getElementById('aviso-zona');
ok('4 · Sin sector: la T-56 pone Ezequiel Zamora; la T-07 avisa que está en dos sectores y deja elegir',
   s56 === 'Convenio Bielorrusos' && avisoZ.style.display !== 'none' && /dos zonas/.test(avisoZ.textContent) && conv.value === '',
   s56 + ' · ' + avisoZ.textContent.slice(0, 60));

// ── 5. Un borrador de la T-07 de Simón Rodríguez se abre bien aunque en pantalla esté Ezequiel Zamora ──
await limpiar(); setAmbito('apartamento');
sel('convenio', 'Convenio Rusos'); sel('torre', 'T-07'); sel('fecha', '2026-09-30');
const insp = document.querySelector('.inspector-select'); insp.value = [...insp.options].map(o => o.value).filter(Boolean)[0]; insp.dispatchEvent(new Event('change', { bubbles: true }));
sel('piso', 'Piso 03'); put('apto', 'C'); await esperar(900); document.querySelector('#aviso-anterior .no')?.click();
put('pr_hito_acc_electricos_0', '5'); currentEditingIndex = null; _idEnEdicion = null; saveDraft(true);
await limpiar(); sel('convenio', 'Convenio Bielorrusos'); await esperar(100);
loadDraftData(0); await esperar(300);
ok('5 · Abrir un borrador de la T-07 de Simón Rodríguez con Ezequiel Zamora en pantalla: vuelve Simón Rodríguez, T-07, TSURU y su medición',
   conv.value === 'Convenio Rusos' && torre.value === 'T-07' && visible('T-07') && /TSURU/.test(document.getElementById('empresa').value) &&
   document.getElementById('pr_hito_acc_electricos_0').value === '5' && conv.selectedOptions[0].textContent === 'Simón Rodríguez',
   conv.value + ' · ' + torre.value + ' · ' + document.getElementById('empresa').value);
