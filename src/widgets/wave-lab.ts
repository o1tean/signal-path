/* Wave Lab: type a short bit string and watch it become a modulated radio wave.
   OOK (AM) switches the carrier on and off; FSK (FM) shifts its pitch.
   Three stacked traces: data, carrier, modulated output. Port of legacy/assets/js/widgets/wave-lab.js. */
import { award } from '@/lib/learner';
import type { WidgetMount } from './types';
import { cssVar, el, fitCanvas, onThemeChange, segButton, segGroup, widgetShell } from './lib/dom';

export const DEFAULT_BITS = '10110001';
export const MAX_BITS = 16;
type Mod = 'OOK' | 'FSK';

/** Keep only 0 and 1, at most MAX_BITS. */
export const sanitizeBits = (s: string) => (s || '').replace(/[^01]/g, '').slice(0, MAX_BITS);

/** The sentence under the scope. Exported for tests and screen-reader parity. */
export function describeBits(bits: string, mod: Mod): string {
  const n = bits.length;
  if (!n) return 'Waiting for bits.';
  const ones = [...bits].filter((b) => b === '1').length;
  const zeros = n - ones;
  const plural = (k: number, word: string) => `${k} ${word}${k === 1 ? '' : 's'}`;
  return mod === 'OOK'
    ? `${n} bits, OOK. The carrier is on for ${plural(ones, 'one-bit')} and silent for ${plural(zeros, 'zero')}.`
    : `${n} bits, FSK. The carrier stays on and its pitch shifts between ${ones} high and ${zeros} low bits.`;
}

export const mount: WidgetMount = (host, opts) => {
  const compact = opts.mode === 'compact';
  const height = compact ? 190 : 250;
  const state: { bits: string; mod: Mod; cpb: number } = { bits: DEFAULT_BITS, mod: 'OOK', cpb: 4 }; // cpb = carrier cycles per bit
  let awarded = false;

  const ui = widgetShell(host, 'Wave Lab', 'Turn bits into a radio wave');
  const uid = `wave-lab-${Math.random().toString(36).slice(2, 8)}`;

  /* ---- controls ---- */
  const bitsInput = el('input', {
    id: `${uid}-bits`,
    type: 'text',
    value: DEFAULT_BITS,
    size: 18,
    inputmode: 'numeric',
    spellcheck: 'false',
    autocomplete: 'off',
    'aria-describedby': `${uid}-bits-hint`,
    class: 'h-11 w-44 rounded-md border border-input bg-background px-3 font-mono tracking-widest',
  });
  bitsInput.addEventListener('input', () => {
    const clean = sanitizeBits(bitsInput.value);
    if (bitsInput.value !== clean) {
      const pos = Math.min(bitsInput.selectionStart ?? clean.length, clean.length);
      bitsInput.value = clean;
      try {
        bitsInput.setSelectionRange(pos, pos);
      } catch {
        /* some input types refuse selection */
      }
    }
    state.bits = clean;
    draw();
    if (!awarded && clean.length >= 1 && clean !== DEFAULT_BITS) {
      awarded = true;
      award('wave-rider');
    }
  });

  const segBtns = {} as Record<Mod, HTMLButtonElement>;
  const seg = el('div', { class: segGroup, role: 'group', 'aria-label': 'Modulation' });
  for (const [mod, label] of [['OOK', 'OOK (AM)'], ['FSK', 'FSK (FM)']] as const) {
    const b = el('button', { type: 'button', class: segButton, 'aria-pressed': String(mod === state.mod) }, [label]);
    b.addEventListener('click', () => setMod(mod));
    segBtns[mod] = b;
    seg.append(b);
  }

  const cpbInput = el('input', {
    id: `${uid}-cpb`,
    type: 'range',
    min: 2,
    max: 10,
    value: state.cpb,
    class: 'h-11 w-32 accent-primary',
  });
  const cpbVal = el('output', { for: `${uid}-cpb`, class: 'font-mono text-sm' });
  cpbInput.addEventListener('input', () => {
    state.cpb = parseInt(cpbInput.value, 10) || 4;
    cpbVal.textContent = `${state.cpb} cycles per bit`;
    draw();
  });
  cpbVal.textContent = `${state.cpb} cycles per bit`;

  ui.body.append(
    el('div', { class: 'flex flex-wrap items-end gap-x-6 gap-y-3' }, [
      el('div', { class: 'grid gap-1' }, [
        el('label', { for: `${uid}-bits`, class: 'text-sm font-medium', text: 'Bits' }),
        bitsInput,
        el('span', { id: `${uid}-bits-hint`, class: 'sr-only', text: 'Type 0 and 1 only, up to 16 bits.' }),
      ]),
      seg,
      el('div', { class: 'grid gap-1' }, [
        el('label', { for: `${uid}-cpb`, class: 'text-sm font-medium', text: 'Carrier' }),
        el('div', { class: 'flex items-center gap-3' }, [cpbInput, cpbVal]),
      ]),
    ]),
  );

  /* ---- canvas ---- */
  const canvas = el('canvas', {
    class: 'block w-full rounded-lg bg-scope-bg',
    style: `height:${height}px`,
    role: 'img',
  });
  const readout = el('p', { class: 'm-0 font-mono text-sm', 'aria-live': 'polite' });
  ui.body.append(canvas, readout);
  ui.foot(
    'OOK (on-off keying) is AM: the carrier is on for a 1 and off for a 0. FSK is FM: the carrier is always on, and its pitch is higher for a 1 and lower for a 0.',
  );

  function setMod(m: Mod) {
    state.mod = m;
    for (const k of Object.keys(segBtns) as Mod[]) segBtns[k].setAttribute('aria-pressed', String(k === m));
    draw();
  }

  /* ---- drawing ---- */
  let ctx: CanvasRenderingContext2D | null = null;

  function draw() {
    if (!ctx) return;
    const c = ctx;
    const w = canvas.clientWidth || 600;
    const h = canvas.clientHeight || height;
    const bg = cssVar('--scope-bg', '#0b1220');
    const grid = cssVar('--scope-grid', '#1b2a44');
    const trace = cssVar('--scope-trace', '#3fd8d2');
    const peak = cssVar('--scope-peak', '#ff8a34');
    const txt = cssVar('--scope-text', '#9bb3d1');
    const mono = cssVar('--font-mono', 'monospace');

    c.clearRect(0, 0, w, h);
    c.fillStyle = bg;
    c.fillRect(0, 0, w, h);

    const { bits, mod, cpb } = state;
    const n = bits.length;
    const sentence = describeBits(bits, mod);
    readout.textContent = sentence;
    canvas.setAttribute('aria-label', `Three stacked waveform traces: data, carrier and modulated output. ${sentence}`);

    if (n === 0) {
      c.fillStyle = txt;
      c.font = `12px ${mono}`;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText('Type some 0s and 1s above.', w / 2, h / 2);
      return;
    }

    const padT = 6, padB = 6;
    const x0 = 8, x1 = w - 8, plotW = x1 - x0;
    const laneH = (h - padT - padB) / 3;
    const labels = ['DATA', 'CARRIER', mod === 'OOK' ? 'OOK (AM)' : 'FSK (FM)'];
    const colors = [trace, txt, peak];
    const bitW = plotW / n;
    const amp = laneH * 0.34;

    for (let li = 0; li < 3; li++) {
      const midY = padT + laneH * li + laneH / 2;
      c.strokeStyle = grid;
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(x0, midY + 0.5);
      c.lineTo(x1, midY + 0.5);
      c.stroke();
      c.fillStyle = colors[li];
      c.font = `10px ${mono}`;
      c.textAlign = 'left';
      c.textBaseline = 'top';
      c.fillText(labels[li], x0 + 2, padT + laneH * li + 2);
    }

    c.strokeStyle = grid;
    c.globalAlpha = 0.6;
    for (let bi = 0; bi <= n; bi++) {
      const bx = x0 + bitW * bi;
      c.beginPath();
      c.moveTo(bx + 0.5, padT);
      c.lineTo(bx + 0.5, h - padB);
      c.stroke();
    }
    c.globalAlpha = 1;

    /* lane 0: data square wave */
    const dataMid = padT + laneH / 2;
    c.strokeStyle = trace;
    c.lineWidth = 2;
    c.beginPath();
    for (let bi = 0; bi < n; bi++) {
      const yv = dataMid - (bits[bi] === '1' ? amp : -amp);
      const sx = x0 + bitW * bi;
      if (bi === 0) c.moveTo(sx, yv);
      else c.lineTo(sx, yv);
      c.lineTo(x0 + bitW * (bi + 1), yv);
    }
    c.stroke();
    if (bitW > 12) {
      c.fillStyle = txt;
      c.textAlign = 'center';
      c.textBaseline = 'bottom';
      for (let bi = 0; bi < n; bi++) c.fillText(bits[bi], x0 + bitW * (bi + 0.5), dataMid + laneH * 0.42);
    }

    /* lane 1: carrier reference */
    const carrMid = padT + laneH * 1.5;
    c.strokeStyle = txt;
    c.lineWidth = 1.3;
    c.beginPath();
    let phase = 0;
    for (let x = x0; x <= x1; x += 1) {
      phase += (2 * Math.PI * cpb) / bitW;
      const y = carrMid - Math.sin(phase) * amp;
      if (x === x0) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
    c.stroke();

    /* lane 2: modulated output */
    const modMid = padT + laneH * 2.5;
    const end = x0 + bitW * n;
    const bitAt = (x: number) => bits[Math.min(Math.floor((x - x0) / bitW), n - 1)];
    c.lineWidth = 1.7;
    c.strokeStyle = peak;
    phase = 0;
    if (mod === 'OOK') {
      let penDown = false;
      for (let x = x0; x <= end; x += 1) {
        phase += (2 * Math.PI * cpb) / bitW;
        if (bitAt(x) === '1') {
          const y = modMid - Math.sin(phase) * amp;
          if (!penDown) {
            c.beginPath();
            c.moveTo(x, y);
            penDown = true;
          } else c.lineTo(x, y);
        } else if (penDown) {
          c.stroke();
          penDown = false;
        }
      }
      if (penDown) c.stroke();
      /* flat baseline over silent bits so "off" reads clearly */
      c.strokeStyle = grid;
      c.lineWidth = 1.4;
      for (let b = 0; b < n; b++) {
        if (bits[b] !== '0') continue;
        c.beginPath();
        c.moveTo(x0 + bitW * b, modMid);
        c.lineTo(x0 + bitW * (b + 1), modMid);
        c.stroke();
      }
    } else {
      const loF = cpb * 0.75, hiF = cpb * 1.6;
      c.beginPath();
      for (let x = x0; x <= end; x += 1) {
        phase += (2 * Math.PI * (bitAt(x) === '1' ? hiF : loF)) / bitW;
        const y = modMid - Math.sin(phase) * amp;
        if (x === x0) c.moveTo(x, y);
        else c.lineTo(x, y);
      }
      c.stroke();
    }
  }

  const fit = fitCanvas(canvas, () => draw());
  ctx = fit.ctx;
  draw();
  const offTheme = onThemeChange(draw);

  return () => {
    fit.cleanup();
    offTheme();
    host.replaceChildren();
    host.classList.remove('sp-widget');
  };
};
