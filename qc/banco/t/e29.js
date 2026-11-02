// ESTRÉS 29 · el compilado de la contratista con el nombre corregido (2-nov-2026, Diego: «Thaisa es con una sola S»). La lista ya no
// dice THAISSA, y un borrador escrito antes del cambio (guardado con el nombre viejo) aparece al abrirla. En compilado.html?prueba=1.
localStorage.clear(); localStorage.setItem('garmel_clave_envio', 'qc'); await Q.relevo({ borrar: true, caido: false, lento: 0, fallarTorres: [], tardaTorre: {} });
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); };
sel('tipo', 'obra'); sel('quien', COORDINADORES[0].n); Q.escribir($('#desde'), '2026-10-22'); Q.escribir($('#hasta'), '2026-10-28');
sel('sector', 'EZ');
const ops = [...$('#torre').options].map(o => o.value);
ok('N1 · La lista de contratistas de EZ dice «THAISA MM INVERSIONES, C.A.» y ninguna dice THAISSA', ops.includes('THAISA MM INVERSIONES, C.A.') && !ops.some(v => /THAISSA/.test(v)), ops.join(' | '));
localStorage.setItem('garmel_compilado_con_EZ_THAISSA MM INVERSIONES, C.A._2026-10-22', JSON.stringify({ textos: { hitos: 'Escrito antes del cambio de nombre' }, torres: {} }));
sel('torre', 'THAISA MM INVERSIONES, C.A.');
await generar(); await hasta(() => !$('#resultado').hidden, 15000); await esperar(400);
ok('N2 · El borrador guardado con el nombre viejo aparece y queda con el nombre nuevo', $('#t-hitos').value === 'Escrito antes del cambio de nombre' && localStorage.getItem('garmel_compilado_con_EZ_THAISSA MM INVERSIONES, C.A._2026-10-22') === null && !!localStorage.getItem('garmel_compilado_con_EZ_THAISA MM INVERSIONES, C.A._2026-10-22'), $('#t-hitos').value);
ok('N3 · El título y el membrete dicen THAISA', /THAISA MM/.test($('#titulo').textContent) && !/THAISSA/.test(document.body.innerText), $('#titulo').textContent);
