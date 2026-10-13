/* Signal Atlas: a personal RF-device log kept in the learner store (capstone deliverable).
   Add, edit and delete entries, load sample rows, export JSON or CSV into a copyable box.
   Port of legacy/assets/js/widgets/signal-atlas.js. */
import { $atlas, setAtlas, type AtlasRow } from '@/lib/learner';
import type { WidgetMount } from './types';
import { el, widgetShell } from './lib/dom';

export const CATS = ['Sub-GHz', '125 kHz RFID', 'NFC', 'Infrared', 'iButton', 'GPIO', 'USB/BLE'];
export const MODS = ['n/a', 'AM650', 'AM270', 'FM238', 'FM476', 'FSK', 'other'];
export const CODES = ['Fixed', 'Rolling', 'Unknown'];
export const COLS = ['name', 'category', 'frequency', 'modulation', 'protocol', 'codeType', 'notes'] as const;

export const SAMPLES: AtlasRow[] = [
  { name: 'Front doorbell', category: 'Sub-GHz', frequency: '433.92 MHz', modulation: 'AM650', protocol: 'Princeton', codeType: 'Fixed', notes: '(sample) fixed 24-bit code', sample: true },
  { name: 'Simulated rolling remote', category: 'Sub-GHz', frequency: '433.92 MHz', modulation: 'FSK', protocol: 'KeeLoq', codeType: 'Rolling', notes: '(sample) counter changes every press', sample: true },
  { name: 'Unenrolled training tag', category: '125 kHz RFID', frequency: '125 kHz', modulation: 'n/a', protocol: 'EM4100', codeType: 'Fixed', notes: '(sample) 40-bit EM-Marin ID', sample: true },
  { name: 'Practice NFC card', category: 'NFC', frequency: '13.56 MHz', modulation: 'n/a', protocol: 'Mifare Classic', codeType: 'Unknown', notes: '(sample) 13.56 MHz ISO 14443', sample: true },
];

/** Frequency is optional; if present it needs a digit ("433.92" and "433.92 MHz" both pass). */
export const validFreq = (v: string) => !v.trim() || /\d/.test(v);

const rowVal = (a: AtlasRow, c: (typeof COLS)[number]) => (a[c] == null ? '' : String(a[c]));

export const toJSON = (rows: AtlasRow[]) =>
  JSON.stringify(rows.map((a) => Object.fromEntries(COLS.map((c) => [c, rowVal(a, c)]))), null, 2);

/** CSV cell with formula-injection guard (leading = + @ - tab CR gets a quote prefix) and RFC 4180 quoting. */
export function csvCell(v: unknown): string {
  let s = v == null ? '' : String(v);
  if (/^[=+@\-\t\r]/.test(s)) s = `'${s}`;
  if (/[",\n\r]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
}
export const toCSV = (rows: AtlasRow[]) =>
  [COLS.join(','), ...rows.map((a) => COLS.map((c) => csvCell(a[c])).join(','))].join('\n');

/** Samples not already present (matched by name among sample rows). */
export const newSamples = (rows: AtlasRow[]) =>
  SAMPLES.filter((s) => !rows.some((a) => a.sample && a.name === s.name)).map((s) => ({ ...s }));

const inputCls = 'h-11 w-full rounded-md border border-input bg-background px-3 font-mono text-sm';
const btnCls =
  'inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-card px-4 text-sm font-medium hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring';
const btnPrimary =
  'inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 focus-visible:outline-2 focus-visible:outline-ring';
const pill = 'inline-block rounded-full border border-border bg-muted px-2 py-0.5 text-xs';

export const mount: WidgetMount = (host, opts) => {
  const compact = opts.mode === 'compact';
  const uid = `atlas-${Math.random().toString(36).slice(2, 8)}`;
  let editRef: AtlasRow | null = null; // identity, not index: another atlas on the page may delete or reorder rows

  const ui = widgetShell(host, 'Signal Atlas', 'Your personal RF-device log');
  if (!compact) {
    ui.body.append(
      el('p', {
        class: 'm-0 text-sm',
        text: 'Log authorized training devices with aliases. Do not store credentials or private captures here. This is your reference and the capstone deliverable.',
      }),
    );
  }

  /* ---- form ---- */
  const select = (id: string, options: string[]) => {
    const s = el('select', { id, class: inputCls });
    for (const o of options) s.append(el('option', { value: o, text: o }));
    return s;
  };
  const nameEl = el('input', { id: `${uid}-name`, type: 'text', placeholder: 'Front doorbell', class: inputCls, autocomplete: 'off' });
  const catEl = select(`${uid}-cat`, CATS);
  const freqEl = el('input', { id: `${uid}-freq`, type: 'text', placeholder: '433.92 MHz', class: inputCls, autocomplete: 'off' });
  const modEl = select(`${uid}-mod`, MODS);
  const protEl = el('input', { id: `${uid}-prot`, type: 'text', placeholder: 'Princeton', class: inputCls, autocomplete: 'off' });
  const codeEl = select(`${uid}-code`, CODES);
  const notesEl = el('textarea', { id: `${uid}-notes`, rows: 2, placeholder: 'Anything worth remembering', class: `${inputCls} h-auto py-2` });

  const field = (label: string, control: HTMLElement, full = false) =>
    el('div', { class: `grid gap-1${full ? ' col-span-full' : ''}` }, [
      el('label', { for: control.id, class: 'font-mono text-xs uppercase tracking-wider text-muted-foreground', text: label }),
      control,
    ]);

  const submitBtn = el('button', { type: 'submit', class: btnPrimary, text: 'Add device' });
  const cancelBtn = el('button', { type: 'button', class: btnCls, text: 'Cancel edit', hidden: true });
  cancelBtn.hidden = true;
  const form = el('form', { novalidate: true, class: 'grid grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] items-end gap-3' }, [
    field('Name', nameEl),
    field('Category', catEl),
    field('Frequency', freqEl),
    field('Modulation', modEl),
    field('Protocol', protEl),
    field('Code type', codeEl),
    field('Notes', notesEl, true),
    el('div', { class: 'col-span-full flex flex-wrap gap-2' }, [submitBtn, cancelBtn]),
  ]);

  /* ---- status line (fixed height so messages never shift the layout) ---- */
  const status = el('p', { class: 'm-0 min-h-6 text-sm', role: 'status', 'aria-live': 'polite' });
  const say = (m: string) => (status.textContent = m);

  const sampleBtn = el('button', { type: 'button', class: btnCls, text: 'Add sample entries' });
  const summary = el('span', { class: 'font-mono text-sm', 'aria-live': 'polite' });
  const util = el('div', { class: 'flex flex-wrap items-center justify-between gap-3' }, [sampleBtn, summary]);

  /* ---- table ---- */
  const tbody = el('tbody');
  const table = el('table', { class: 'w-full min-w-[44rem] border-collapse text-left text-sm' }, [
    el('thead', {}, [
      el('tr', { class: 'border-b border-border font-mono text-xs uppercase tracking-wider text-muted-foreground' },
        ['Name', 'Category', 'Freq', 'Mod', 'Protocol', 'Code', 'Notes', 'Actions'].map((h) =>
          el('th', { scope: 'col', class: 'px-2 py-2 font-medium', text: h }))),
    ]),
    tbody,
  ]);
  const scroll = el('div', { class: 'overflow-x-auto rounded-md border border-border', tabindex: 0, role: 'region', 'aria-label': 'Device table' }, [table]);

  /* ---- export ---- */
  const ta = el('textarea', {
    readonly: true,
    rows: 8,
    'aria-label': 'Exported atlas data, select and copy',
    class: `${inputCls} h-auto whitespace-pre py-2 text-xs`,
  });
  ta.value = 'Choose Export JSON or Export CSV to fill this box, then Copy.';
  const jsonBtn = el('button', { type: 'button', class: btnCls, text: 'Export JSON' });
  const csvBtn = el('button', { type: 'button', class: btnCls, text: 'Export CSV' });
  const copyBtn = el('button', { type: 'button', class: btnCls, text: 'Copy' });
  const details = el('details', { class: 'rounded-md border border-border', open: true }, [
    el('summary', { class: 'flex min-h-11 cursor-pointer items-center px-3 text-sm font-medium', text: 'Export data' }),
    el('div', { class: 'grid gap-3 p-3' }, [el('div', { class: 'flex flex-wrap gap-2' }, [jsonBtn, csvBtn, copyBtn]), ta]),
  ]);

  ui.body.append(form, status, util, scroll, details);
  ui.foot('Stays on this device (browser storage). Log only authorized training equipment. Export to keep a copy elsewhere.');

  /* ---- logic ---- */
  const rows = () => $atlas.get();

  function resetForm() {
    nameEl.value = freqEl.value = protEl.value = notesEl.value = '';
    catEl.selectedIndex = modEl.selectedIndex = codeEl.selectedIndex = 0;
    editRef = null;
    submitBtn.textContent = 'Add device';
    cancelBtn.hidden = true;
  }
  cancelBtn.addEventListener('click', () => {
    resetForm();
    say('Edit cancelled.');
    nameEl.focus();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const entry: AtlasRow = {
      name: nameEl.value.trim(),
      category: catEl.value,
      frequency: freqEl.value.trim(),
      modulation: modEl.value,
      protocol: protEl.value.trim(),
      codeType: codeEl.value,
      notes: notesEl.value.trim(),
    };
    if (!entry.name) {
      say('Give the device a name first.');
      nameEl.focus();
      return;
    }
    if (!validFreq(entry.frequency)) {
      say('Frequency should include a number, e.g. 433.92 MHz.');
      freqEl.focus();
      return;
    }
    const cur = rows();
    if (editRef && cur.includes(editRef)) {
      setAtlas(cur.map((r) => (r === editRef ? entry : r)));
      say(`Updated ${entry.name}.`);
    } else {
      setAtlas([...cur, entry]);
      say(`Logged ${entry.name}.`);
    }
    resetForm();
  });

  sampleBtn.addEventListener('click', () => {
    const add = newSamples(rows());
    if (!add.length) return say('Samples are already in your atlas.');
    setAtlas([...rows(), ...add]);
    say(`Added ${add.length} sample device${add.length > 1 ? 's' : ''}.`);
  });

  function editRow(idx: number) {
    const a = rows()[idx];
    if (!a) return;
    nameEl.value = a.name || '';
    catEl.value = CATS.includes(a.category) ? a.category : CATS[0];
    freqEl.value = a.frequency || '';
    modEl.value = MODS.includes(a.modulation) ? a.modulation : MODS[0];
    protEl.value = a.protocol || '';
    codeEl.value = CODES.includes(a.codeType) ? a.codeType : 'Unknown';
    notesEl.value = a.notes || '';
    editRef = a;
    submitBtn.textContent = 'Save changes';
    cancelBtn.hidden = false;
    nameEl.focus();
    nameEl.scrollIntoView({ block: 'nearest' });
  }

  function deleteRow(idx: number) {
    const name = rows()[idx]?.name || 'device';
    setAtlas(rows().filter((_, i) => i !== idx));
    say(`Deleted ${name}.`);
    // the focused Delete button is gone after the re-render; keep keyboard users in the table
    (tbody.querySelectorAll<HTMLButtonElement>('button[data-act="del"]')[idx] ??
      tbody.querySelectorAll<HTMLButtonElement>('button[data-act="del"]')[idx - 1] ??
      sampleBtn).focus();
  }

  function render(arr: readonly AtlasRow[]) {
    if (editRef && !arr.includes(editRef)) {
      resetForm();
      say('The entry you were editing was removed.');
    }
    const rolling = arr.filter((a) => a.codeType === 'Rolling').length;
    summary.textContent = `${arr.length} device${arr.length === 1 ? '' : 's'} · ${rolling} rolling`;
    tbody.replaceChildren();
    if (!arr.length) {
      tbody.append(
        el('tr', {}, [
          el('td', { colspan: 8, class: 'px-2 py-4 text-muted-foreground', text: 'No devices yet. Add one above, or load a few samples to see how it works.' }),
        ]),
      );
      return;
    }
    arr.forEach((a, idx) => {
      const actions = el('td', { class: 'whitespace-nowrap px-2 py-1' });
      const ed = el('button', { type: 'button', class: btnCls, text: 'Edit', 'aria-label': `Edit ${a.name || 'device'}` });
      const del = el('button', { type: 'button', class: `${btnCls} ml-1`, text: 'Delete', 'data-act': 'del', 'aria-label': `Delete ${a.name || 'device'}` });
      ed.addEventListener('click', () => editRow(idx));
      del.addEventListener('click', () => deleteRow(idx));
      actions.append(ed, del);
      tbody.append(
        el('tr', { class: 'border-b border-border last:border-0' }, [
          el('td', { class: 'px-2 py-2 font-semibold', text: a.name || '-' }),
          el('td', { class: 'px-2 py-2' }, [el('span', { class: pill, text: a.category || '-' })]),
          el('td', { class: 'px-2 py-2 font-mono', text: a.frequency || '-' }),
          el('td', { class: 'px-2 py-2 font-mono', text: a.modulation || '-' }),
          el('td', { class: 'px-2 py-2', text: a.protocol || '-' }),
          el('td', { class: 'px-2 py-2' }, [el('span', { class: pill, text: a.codeType || '-' })]),
          el('td', { class: 'px-2 py-2 text-muted-foreground', text: a.notes || '' }),
          actions,
        ]),
      );
    });
  }

  const doExport = (text: string, what: string) => {
    ta.value = text;
    details.open = true;
    ta.focus();
    ta.select();
    say(`${what} export ready below.`);
  };
  jsonBtn.addEventListener('click', () => doExport(toJSON(rows()), 'JSON'));
  csvBtn.addEventListener('click', () => doExport(toCSV(rows()), 'CSV'));
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(ta.value);
      say('Copied to clipboard.');
    } catch {
      ta.focus();
      ta.select();
      say('Text selected. Press Ctrl or Cmd+C to copy.');
    }
  });

  /* Re-renders on any store change, so two atlases on one page stay in sync. */
  render(rows());
  const unsub = $atlas.listen(render);

  return () => {
    unsub();
    host.replaceChildren();
    host.classList.remove('sp-widget');
  };
};
