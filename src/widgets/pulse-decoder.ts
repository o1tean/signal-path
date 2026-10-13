/* Pulse decoder: watch an on/off (OOK) pulse train turn into bits, one pulse pair at a time.
   TE-based teaching model: bit 0 = 1xTE high + 3xTE low, bit 1 = 3xTE high + 1xTE low.
   Port of legacy/assets/js/widgets/pulse-decoder.js. */
import { animationAllowed } from '@/lib/learner';
import type { WidgetMount } from './types';
import { cssVar, el, fitCanvas, onThemeChange, segButton, segGroup, widgetShell } from './lib/dom';

/** Bits MSB-first, like a .sub "Key" field. n <= 31 (32-bit shifts). */
export function hexToBits(hex: string, n: number): number[] {
  const v = parseInt(hex, 16);
  const out: number[] = [];
  for (let i = n - 1; i >= 0; i--) out.push((v >> i) & 1);
  return out;
}
export const bitsHex = (bits: number[]): string => {
  if (!bits.length) return '';
  const v = bits.reduce((a, b) => a * 2 + b, 0);
  return v.toString(16).toUpperCase().padStart(Math.ceil(bits.length / 4), '0');
};
export const groupBits = (bits: number[]): string =>
  bits.map((b, i) => (i && i % 4 === 0 ? ' ' : '') + b).join('');

export interface Sample {
  id: string;
  label: string;
  te: number;
  proto: string;
  hex: string;
  bits: number[];
}
export const SAMPLES: Sample[] = [
  { id: 'garage', label: 'Garage (Princeton 24-bit)', te: 400, proto: 'Princeton', hex: '8C5A3B', bits: hexToBits('8C5A3B', 24) },
  { id: 'flo', label: 'Nice FLO (fixed 12-bit)', te: 700, proto: 'Nice FLO', hex: '5C3', bits: hexToBits('5C3', 12) },
];

const STEP_MS = 650;

export const mount: WidgetMount = (host, opts) => {
  const compact = opts.mode === 'compact';
  let sample = SAMPLES[0];
  let i = 0; // bits decoded so far; also the index of the bit being read
  let timer: ReturnType<typeof setInterval> | null = null;

  const ui = widgetShell(host, 'Pulse decoder', 'How a pulse train becomes bits');

  /* ---- sample picker ---- */
  const segBtns: HTMLButtonElement[] = [];
  const seg = el('div', { class: segGroup + ' flex-wrap', role: 'group', 'aria-label': 'Sample capture' });
  SAMPLES.forEach((s, idx) => {
    const b = el('button', { type: 'button', class: segButton, 'aria-pressed': String(idx === 0), text: s.label });
    b.addEventListener('click', () => pick(idx));
    segBtns.push(b);
    seg.append(b);
  });
  ui.body.append(
    el('div', { class: 'flex flex-wrap items-center gap-x-4 gap-y-2' }, [
      el('span', { class: 'text-sm font-medium', text: 'Capture' }),
      seg,
    ]),
  );

  /* ---- canvas ---- */
  const canvas = el('canvas', {
    class: 'block w-full rounded-lg bg-scope-bg',
    style: `height:${compact ? 150 : 190}px`,
    role: 'img',
  });
  ui.body.append(canvas);

  /* ---- buttons ---- */
  const btn = 'inline-flex min-h-11 min-w-24 items-center justify-center rounded-md px-4 text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50 ';
  const stepBtn = el('button', { type: 'button', class: btn + 'bg-primary text-primary-foreground' });
  const autoBtn = el('button', { type: 'button', class: btn + 'border border-border bg-card', 'aria-pressed': 'false', text: 'Auto play' });
  const resetBtn = el('button', { type: 'button', class: btn + 'border border-border bg-card', text: 'Reset' });
  const reduced = !animationAllowed();
  if (reduced) {
    autoBtn.disabled = true;
    autoBtn.title = 'Auto play is off while motion is reduced or paused. Use Step.';
  }
  ui.body.append(el('div', { class: 'flex flex-wrap gap-2' }, [stepBtn, autoBtn, resetBtn]));

  /* ---- LCD (live region) ---- */
  const lcd = el('div', {
    class: 'min-h-[5.5rem] whitespace-pre overflow-x-auto rounded-lg bg-lcd-bg p-3 font-mono text-xs leading-5 text-lcd-ink',
    role: 'status',
    'aria-live': 'polite',
  });
  ui.body.append(lcd);

  /* ---- facts ---- */
  const dd = () => el('dd', { class: 'm-0 break-words' });
  const kvTE = dd(), kvBits = dd(), kvBin = dd(), kvHex = dd();
  const dl = el('dl', { class: 'm-0 grid grid-cols-[5rem_1fr] gap-x-3 gap-y-1 text-sm' });
  for (const [t, d] of [['TE', kvTE], ['Bits', kvBits], ['Binary', kvBin], ['Hex', kvHex]] as const)
    dl.append(el('dt', { class: 'text-muted-foreground', text: t }), d);
  ui.body.append(dl);

  if (!compact) {
    ui.body.append(
      el('div', { class: 'rounded-lg border border-border bg-muted p-3 text-sm' }, [
        el('p', { class: 'm-0 mb-1 font-semibold', text: 'The rule (OOK, TE-based)' }),
        el('p', {
          class: 'm-0',
          text:
            'The radio is only ever on or off (on-off keying). One TE (timing element) is the base tick. ' +
            'A bit 0 is a short pulse then a long gap (1×TE high, 3×TE low). A bit 1 is a long pulse then a short gap (3×TE high, 1×TE low). ' +
            'Read the widths, not the voltage. That is all a decoder does.',
        }),
      ]),
    );
  }
  ui.foot('Highlighted pulse = the bit being read. Bits accumulate MSB-first into the key.');

  /* ---- behaviour ---- */
  const stopAuto = () => {
    if (timer) clearInterval(timer);
    timer = null;
    autoBtn.setAttribute('aria-pressed', 'false');
    autoBtn.textContent = 'Auto play';
  };
  function pick(idx: number) {
    stopAuto();
    sample = SAMPLES[idx];
    i = 0;
    segBtns.forEach((b, k) => b.setAttribute('aria-pressed', String(k === idx)));
    render();
  }
  function step() {
    if (i < sample.bits.length) {
      i++;
      render();
    }
    if (i >= sample.bits.length) stopAuto();
  }
  function toggleAuto() {
    if (timer) return stopAuto();
    if (i >= sample.bits.length) {
      i = 0;
      render();
    }
    autoBtn.setAttribute('aria-pressed', 'true');
    autoBtn.textContent = 'Pause';
    timer = setInterval(step, STEP_MS);
  }
  stepBtn.addEventListener('click', () => {
    stopAuto();
    step();
  });
  resetBtn.addEventListener('click', () => {
    stopAuto();
    i = 0;
    render();
  });
  if (!reduced) autoBtn.addEventListener('click', toggleAuto);
  const onVis = () => document.hidden && stopAuto();
  document.addEventListener('visibilitychange', onVis);

  function render() {
    const { bits, te, proto } = sample;
    const decoded = bits.slice(0, i);
    const done = i >= bits.length;
    stepBtn.textContent = done ? 'Done' : 'Step';
    stepBtn.disabled = done;
    lcd.textContent = [
      `${proto}  TE ${te}us`,
      `Bit ${i}/${bits.length}${done ? '  DECODED' : '  reading...'}`,
      `BIN ${groupBits(decoded) || '-'}`,
      `HEX ${bitsHex(decoded) || '-'}`,
    ].join('\n');
    kvTE.textContent = `${te} µs per timing element`;
    kvBits.textContent = `${i} of ${bits.length} read`;
    kvBin.textContent = decoded.length ? groupBits(decoded) : 'nothing yet';
    kvBin.className = 'm-0 break-words' + (decoded.length ? ' font-mono' : ' text-muted-foreground');
    kvHex.textContent = decoded.length ? `0x${bitsHex(decoded)}${done ? ' (full key)' : ''}` : 'none yet';
    kvHex.className = 'm-0 break-words' + (decoded.length ? ' font-mono font-semibold' : ' text-muted-foreground');
    canvas.setAttribute(
      'aria-label',
      `OOK pulse train, ${bits.length} bits. ${i} read${done ? ', fully decoded' : `, bit ${i + 1} next`}.`,
    );
    fit.redraw();
  }

  /* ---- drawing ---- */
  function draw(c: CanvasRenderingContext2D, w: number, h: number) {
    const bg = cssVar('--scope-bg', '#0b1220');
    const grid = cssVar('--scope-grid', '#1b2a44');
    const trace = cssVar('--scope-trace', '#3fd8d2');
    const peak = cssVar('--scope-peak', '#ff8a34');
    const txt = cssVar('--scope-text', '#9bb3d1');
    const mono = cssVar('--font-mono', 'monospace');
    c.clearRect(0, 0, w, h);
    c.fillStyle = bg;
    c.fillRect(0, 0, w, h);

    const padL = 8, padR = 8, yHigh = 16, yLow = h - 22;
    const { bits } = sample;
    const unit = (w - padL - padR) / (bits.length * 4);
    const quad = unit * 4;

    c.strokeStyle = grid;
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(padL, yLow + 0.5);
    c.lineTo(w - padR, yLow + 0.5);
    c.moveTo(padL, yHigh + 0.5);
    c.lineTo(w - padR, yHigh + 0.5);
    c.stroke();

    if (i < bits.length) {
      c.globalAlpha = 0.16;
      c.fillStyle = peak;
      c.fillRect(padL + i * quad, yHigh - 4, quad, yLow - yHigh + 8);
      c.globalAlpha = 1;
    }

    let x = padL;
    c.font = `11px ${mono}`;
    c.textAlign = 'center';
    bits.forEach((b, k) => {
      const hi = b ? 3 : 1, lo = b ? 1 : 3;
      c.strokeStyle = k < i ? trace : k === i ? peak : grid;
      c.lineWidth = k === i ? 2.5 : 2;
      c.beginPath();
      c.moveTo(x, yLow);
      c.lineTo(x, yHigh);
      x += hi * unit;
      c.lineTo(x, yHigh);
      c.lineTo(x, yLow);
      x += lo * unit;
      c.lineTo(x, yLow);
      c.stroke();
      if (quad >= 16 && k <= i) {
        c.fillStyle = k === i ? peak : txt;
        c.fillText(String(b), padL + k * quad + quad / 2, yLow + 15);
      }
    });

    c.fillStyle = txt;
    c.font = `10px ${mono}`;
    c.textAlign = 'left';
    c.fillText('on', 2, yHigh - 5);
    c.fillText('off', 2, yLow - 5);
  }

  const fit = fitCanvas(canvas, draw);
  render();
  const offTheme = onThemeChange(fit.redraw);

  return () => {
    stopAuto();
    document.removeEventListener('visibilitychange', onVis);
    offTheme();
    fit.cleanup();
    host.replaceChildren();
    host.classList.remove('sp-widget');
  };
};
