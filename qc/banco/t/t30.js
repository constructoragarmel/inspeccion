// INFORME ANTERIOR · tanda 5 de 5 — UX (29-sep-2026). Se corre a 375×812 y a 320×640.
localStorage.setItem('garmel_rol', 'inspector');
localStorage.setItem('garmel_clave_envio', 'qc');
const W = innerWidth, H = innerHeight;
const put = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
const sel = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); };
const caja = () => document.getElementById('aviso-anterior');
const aviso = () => (caja()?.innerText || '').trim();
const limpiar = async () => { Q.aceptar = true; nuevoFormulario(); await esperar(300); };
const cabecera = (piso, apto) => {
  sel('fecha', '2026-09-29'); sel('torre', 'T-07');
  const insp = document.querySelector('.inspector-select');
  insp.value = [...insp.options].map(o => o.value).filter(Boolean)[0]; insp.dispatchEvent(new Event('change', { bubbles: true }));
  if (!document.querySelector('#estatus .ck-lbl.on')) document.querySelector('#estatus .ck-lbl').click();
  if (piso) { sel('piso', piso); put('apto', apto); }
};
const esperarAviso = async (ms) => { await hasta(() => aviso().length > 0, ms || 12000, 100); return aviso(); };
await Q.relevo({ caido: false, fallar: [], lento: 0, borrar: true });
localStorage.setItem('garmel_reports_list', '[]');
await limpiar(); setAmbito('apartamento'); cabecera('Piso 02', 'A'); await esperar(900); document.querySelector('#aviso-anterior .no')?.click();
put('pr_hito_acc_electricos_0', '4'); put('ej_hito_acc_electricos_0', '2'); currentEditingIndex = null; _idEnEdicion = null; saveDraft(true);

// ── 16. El aviso cabe y sus botones se tocan ──
await limpiar(); setAmbito('apartamento'); cabecera('Piso 02', 'A'); await esperarAviso();
const r = caja().getBoundingClientRect();
const bots = [...caja().querySelectorAll('button')].map(b => b.getBoundingClientRect());
const cabe = r.left >= 0 && r.right <= W + 1 && bots.every(b => b.height >= 44 && b.right <= W + 1) && document.documentElement.scrollWidth <= W;
ok('16 · @' + W + ': el aviso cabe, sin scroll lateral, y sus dos botones miden ≥ 44 px', cabe,
   'caja ' + Math.round(r.left) + '–' + Math.round(r.right) + ' · botones ' + bots.map(b => Math.round(b.height) + 'px').join(','));

// ── 17. Se entera: el aviso sale pegado al campo del apartamento, donde está mirando ──
// (En el marco de QC el desplazamiento no se aplica, así que se mide la distancia al campo.)
await limpiar(); setAmbito('apartamento'); cabecera();
sel('piso', 'Piso 02'); put('apto', 'A');
await esperarAviso(); await esperar(300);
const rApto = document.getElementById('apto').getBoundingClientRect(), ra = caja().getBoundingClientRect();
const distancia = Math.round(ra.top - rApto.bottom);
ok('17 · @' + W + ': el aviso aparece justo debajo del campo del apartamento (a menos de 60 px), no más abajo de la pantalla',
   distancia >= 0 && distancia < 60 && ra.height < H * 0.6, 'distancia ' + distancia + ' px · alto del aviso ' + Math.round(ra.height) + ' px');

// ── 18. Lectores de pantalla: el aviso se anuncia ──
const rol = caja().getAttribute('role') || caja().firstElementChild?.getAttribute('role') || '';
const vivo = caja().getAttribute('aria-live') || caja().firstElementChild?.getAttribute('aria-live') || '';
ok('18 · El aviso se anuncia (role="status" / aria-live) y sus botones son type="button"',
   /status/.test(rol) || /polite/.test(vivo) ? [...caja().querySelectorAll('button')].every(b => b.type === 'button') : false, 'role «' + rol + '» aria-live «' + vivo + '»');

// ── 19. Un apartamento con nombre raro no rompe nada ni se interpreta como HTML ──
localStorage.setItem('garmel_reports_list', '[]');
await limpiar(); setAmbito('apartamento'); cabecera('Piso 03', '<b>X</b>'); await esperar(900); document.querySelector('#aviso-anterior .no')?.click();
put('pr_hito_acc_electricos_0', '3'); currentEditingIndex = null; _idEnEdicion = null; saveDraft(true);
await limpiar(); setAmbito('apartamento'); cabecera('Piso 05', 'PH-1');
const a19 = await esperarAviso();
ok('19 · Con un apartamento «<b>X</b>» guardado, el aviso de otro («PH-1») lo muestra como texto, sin HTML inyectado',
   /<b>X<\/b>/.test(a19) && !caja().querySelector('.s b'), '«' + a19.slice(0, 90) + '»');
