// TANDA 111 · QC 13 de la segunda serie (20-oct-2026), en compilado.html?prueba=1: cómo pinta la página la semana de SHA del r70.
// 1 una torre con dos informes en la semana: el título dice «toda la semana y lo abierto de antes», el subtítulo «junta los 2
// informes», el hallazgo de antes lleva «viene de antes» · 2 una torre sin informe en la semana: lo dice y muestra lo abierto
// · 3 todo el urbanismo: la torre sin informe dice «sin informe esta semana», la de varios informes dice cuántos, lo de antes
// se marca · 4 nada se sale de la pantalla y nada por debajo de 44 px
const sha = (frentes, n, inc) => ({ recaudosSi: 6, recaudosNo: 1, recaudos: [{ item: 'RIF', obs: '' }], frentes: frentes, incidencias: inc || [], accion: '', accionDet: '', fotosGenerales: [], informesSemana: n });
const fr = (f, h, e, a) => ({ frente: f, hallazgo: h, estatus: e, deAntes: !!a });
pintarTipo({ tipo: 'sha', ultimo: { numero: 'SHA-EZ-T17-261018-BR', numeroRev: 'SHA-EZ-T17-261018-BR', fecha: '2026-10-18', inspectores: ['Birmania Rada'], pdf: '', estatus: ['Aprobado'],
  sha: sha([fr('Guindola', 'Sin EPP', 'Corregido'), fr('Escalera', 'Sin baranda', 'Pendiente', true)], 2) } });
await esperar(100);
const tit = $('#tipo-titulo').textContent, sub = $('#tipo-sub').innerText, tab = $('#tipo-tabla').innerText;
ok('1 · Una torre con dos informes: título, «junta los 2 informes» y «viene de antes» en el hallazgo arrastrado',
   /toda la semana y lo abierto de antes/.test(tit) && /junta los 2 informes/.test(sub) && /Sin baranda\s*· viene de antes/.test(tab) && !/Sin EPP\s*· viene/.test(tab), tit + ' · ' + sub);
pintarTipo({ tipo: 'sha', ultimo: { numero: 'SHA-EZ-T18-261005-BR', numeroRev: 'SHA-EZ-T18-261005-BR', fecha: '2026-10-05', inspectores: ['Birmania Rada'], pdf: '', estatus: [], sinInformeSemana: true,
  sha: sha([fr('Andamio', 'Sin rodapié', 'Pendiente', true)], 0) } });
await esperar(100);
ok('2 · Una torre sin informe en la semana lo dice y muestra lo abierto', /Sin informe esta semana: lo abierto viene de SHA-EZ-T18-261005-BR/.test($('#tipo-sub').innerText) && /Sin rodapié/.test($('#tipo-tabla').innerText), $('#tipo-sub').innerText);
pintarTipo({ tipo: 'sha', porTorre: [
  { torre: 'T-17', numero: 'SHA-EZ-T17-261018-BR', numeroRev: 'SHA-EZ-T17-261018-BR', fecha: '2026-10-18', pdf: '', empresa: 'BELZARUBEZHSTROY, S.A.', sha: sha([fr('Guindola', 'Sin EPP', 'Corregido'), fr('Escalera', 'Sin baranda', 'Pendiente', true)], 3) },
  { torre: 'T-18', numero: 'SHA-EZ-T18-261005-BR', numeroRev: 'SHA-EZ-T18-261005-BR', fecha: '2026-10-05', pdf: '', empresa: 'BELZARUBEZHSTROY, S.A.', sinInformeSemana: true, sha: sha([fr('Andamio', 'Sin rodapié', 'Pendiente', true)], 0) },
  { torre: 'M-6', numero: 'SHA-EZ-M6-261015-VM', numeroRev: 'SHA-EZ-M6-261015-VM', fecha: '2026-10-15', pdf: '', empresa: 'ADDISON', sha: sha([fr('Zanja', 'Sin señalizar', 'Pendiente')], 1) }] });
await esperar(100);
const t3 = $('#tipo-tabla').innerText;
ok('3 · Todo el urbanismo: «sin informe esta semana», «3 informes», lo de antes marcado y la manzana M-6 con su contratista',
   /toda la semana de cada torre y lo abierto de antes/.test($('#tipo-titulo').textContent) && /sin informe esta semana/.test(t3) && /3 informes/.test(t3) && (t3.match(/viene de antes/g) || []).length === 2 && /M-6[\s\S]*ADDISON/.test(t3),
   t3.replace(/\s+/g, ' ').slice(0, 220));
const ancho = document.documentElement.scrollWidth <= innerWidth + 1;
const chicos = Q.chicos ? Q.chicos() : [];
ok('4 · La página no se sale de la pantalla (la tabla desplaza dentro de su caja) y nada por debajo de 44 px', ancho && chicos.length === 0, 'ancho ' + document.documentElement.scrollWidth + '/' + innerWidth + ' · chicos ' + chicos.length);
