/* Spectrum scope: a simulated spectrum analyzer. Pick a Sub-GHz band, watch the noise floor, then
   press a remote to see its peak and RSSI. Port of legacy/assets/js/widgets/spectrum-scope.js. */
import { $motion, animationAllowed } from '@/lib/learner';
import type { WidgetMount } from './types';
import { cssVar, el, fitCanvas, onThemeChange, widgetShell } from './lib/dom';

export const BANDS = {
  low: { lo: 300, hi: 348, label: '300–348' },
  mid: { lo: 387, hi: 464, label: '387–464' },
  high: { lo: 779, hi: 928, label: '779–928' },
  full: { lo: 300, hi: 928, label: 'Full 300–928' },
} as const;
export type BandKey = keyof typeof BANDS;
const BAND_ORDER: BandKey[] = ['low', 'mid', 'high', 'full'];

export const REMOTES: { freq: number; name: string; band: BandKey }[] = [
  { freq: 433.92, name: 'Garage', band: 'mid' },
  { freq: 315.0, name: 'Fob', band: 'low' },
  { freq: 868.0, name: 'Sensor', band: 'high' },
];

const NOISE_N = 200;
const NOISE_MS = 70;
const HOLD_MS = 1100;
const LIFE_MS = 1500;

/** -38 dBm near, -95 dBm far. */
export const rssiFor = (dist: number) => Math.round(-38 - (dist / 100) * 57);
/** Peak height as a fraction of the plot: 0.90 near, 0.18 far. */
export const peakFracFor = (dist: number) => 0.9 - (dist / 100) * 0.72;
/** Hold at full height, then fade linearly to nothing by LIFE_MS. */
export const envelopeAt = (elapsed: number) => (elapsed > HOLD_MS ? Math.max(0, (LIFE_MS - elapsed) / (LIFE_MS - HOLD_MS)) : 1);
export const strengthWord = (dist: number) => (dist < 40 ? 'strong, close by' : dist < 75 ? 'usable' : 'weak, far away');
/** True when a remote at `freq` is outside `band`, so firing it must hop bands. */
export const needsHop = (band: BandKey, freq: number) => freq < BANDS[band].lo || freq > BANDS[band].hi;

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

export const mount: WidgetMount = (host, opts) => {
  const compact = opts.mode === 'compact';
  const height = compact ? 170 : 240;
  const state: { band: BandKey; distance: number; signal: { freq: number; name: string; born: number } | null } = {
    band: 'mid',
    distance: 20,
    signal: null,
  };

  const ui = widgetShell(host, 'Spectrum scope', 'Watch the band, press a remote');
  const uid = `spectrum-scope-${Math.random().toString(36).slice(2, 8)}`;

  /* ---- controls ---- */
  const bandSel = el('select', {
    id: `${uid}-band`,
    class: 'h-11 rounded-md border border-input bg-background px-3 text-sm',
  });
  for (const k of BAND_ORDER) bandSel.append(el('option', { value: k, text: `${BANDS[k].label} MHz` }));
  bandSel.value = state.band;
  bandSel.addEventListener('change', () => setBand(bandSel.value as BandKey));

  const dist = el('input', { id: `${uid}-dist`, type: 'range', min: 0, max: 100, value: state.distance, class: 'h-11 w-40 accent-primary' });
  const distVal = el('output', { for: `${uid}-dist`, class: 'font-mono text-sm', text: `${state.distance}%` });
  dist.addEventListener('input', () => {
    state.distance = parseInt(dist.value, 10) || 0;
    distVal.textContent = `${state.distance}%`;
    render();
  });

  const remoteBtns = REMOTES.map((r) => {
    const b = el(
      'button',
      {
        type: 'button',
        class:
          'min-h-11 rounded-md border border-border bg-card px-4 font-mono text-sm hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring',
        title: `Transmit a burst at ${r.freq} MHz`,
      },
      [`${r.freq.toFixed(2)} ${r.name}`],
    );
    b.addEventListener('click', () => fire(r));
    return b;
  });

  ui.body.append(
    el('div', { class: 'flex flex-wrap items-end gap-x-6 gap-y-3' }, [
      el('div', { class: 'grid gap-1' }, [el('label', { for: `${uid}-band`, class: 'text-sm font-medium', text: 'Band' }), bandSel]),
      el('div', { class: 'grid gap-1' }, [
        el('label', { for: `${uid}-dist`, class: 'text-sm font-medium', text: 'Distance to transmitter' }),
        el('div', { class: 'flex items-center gap-3' }, [dist, distVal]),
      ]),
    ]),
    el('div', { class: 'flex flex-wrap items-center gap-3', role: 'group', 'aria-label': 'Remotes' }, [
      el('span', { class: 'text-sm font-medium', text: 'Remotes' }),
      ...remoteBtns,
    ]),
  );

  const canvas = el('canvas', {
    class: 'block w-full rounded-lg bg-scope-bg',
    style: `height:${height}px`,
    role: 'img',
    'aria-label': 'Simulated spectrum analyzer display',
  });
  const readout = el('p', { class: 'm-0 min-h-12 font-mono text-sm', 'aria-live': 'polite' });
  ui.body.append(canvas, readout);
  ui.foot('The peak is the signal. The fuzz along the bottom is the noise floor, the radio background that is always there.');

  /* ---- noise ---- */
  const noise: number[] = [];
  function makeNoise() {
    noise.length = 0;
    let prev = 0.4;
    for (let i = 0; i < NOISE_N; i++) {
      prev = prev * 0.55 + Math.random() * 0.45; // light smoothing so it reads as a floor, not static
      noise.push(prev);
    }
  }
  makeNoise();

  /* ---- actions ---- */
  let clearTimer: ReturnType<typeof setTimeout> | undefined;
  function setBand(k: BandKey) {
    state.band = k;
    if (bandSel.value !== k) bandSel.value = k;
    render();
  }
  function fire(r: (typeof REMOTES)[number]) {
    if (needsHop(state.band, r.freq)) setBand(r.band);
    state.signal = { freq: r.freq, name: r.name, born: performance.now() };
    render();
    armClear();
  }
  /** Static (no loop) mode: the burst clears on a timer instead of the frame loop. */
  function armClear() {
    if (looping) return;
    clearTimeout(clearTimer);
    clearTimer = setTimeout(() => {
      state.signal = null;
      render();
    }, LIFE_MS);
  }

  /* ---- drawing ---- */
  let ctx: CanvasRenderingContext2D | null = null;
  let looping = false;
  let lastText = '';

  function render(ts = performance.now()) {
    if (!ctx) return;
    const c = ctx;
    const w = canvas.clientWidth || 600;
    const h = canvas.clientHeight || height;
    const bg = cssVar('--scope-bg', '#0b1220');
    const grid = cssVar('--scope-grid', '#1b2a44');
    const trace = cssVar('--scope-trace', '#3fd8d2');
    const peakC = cssVar('--scope-peak', '#ff8a34');
    const txt = cssVar('--scope-text', '#9bb3d1');
    const mono = cssVar('--font-mono', 'monospace');

    c.clearRect(0, 0, w, h);
    c.fillStyle = bg;
    c.fillRect(0, 0, w, h);

    const x0 = 8, x1 = w - 8, plotW = x1 - x0;
    const y0 = 12, y1 = h - 22, plotH = y1 - y0;
    const { lo: fLo, hi: fHi } = BANDS[state.band];
    const span = fHi - fLo;

    c.strokeStyle = grid;
    c.lineWidth = 1;
    for (let g = 0; g <= 4; g++) {
      const yy = y0 + (plotH * g) / 4;
      c.beginPath();
      c.moveTo(x0, yy + 0.5);
      c.lineTo(x1, yy + 0.5);
      c.stroke();
    }

    c.font = `10px ${mono}`;
    c.textBaseline = 'top';
    const ticks = 5;
    for (let i = 0; i <= ticks; i++) {
      const xx = x0 + (plotW * i) / ticks;
      c.strokeStyle = grid;
      c.beginPath();
      c.moveTo(xx + 0.5, y0);
      c.lineTo(xx + 0.5, y1);
      c.stroke();
      c.fillStyle = txt;
      c.textAlign = i === 0 ? 'left' : i === ticks ? 'right' : 'center';
      c.fillText((fLo + (span * i) / ticks).toFixed(0), i === 0 ? x0 : i === ticks ? x1 : xx, y1 + 5);
    }
    c.textAlign = 'right';
    c.fillStyle = txt;
    c.fillText('MHz', x1, 0);

    const baseY = y1 - plotH * 0.07;
    c.strokeStyle = trace;
    c.lineWidth = 1.1;
    c.globalAlpha = 0.85;
    c.beginPath();
    noise.forEach((v, k) => {
      const nx = x0 + (plotW * k) / (noise.length - 1);
      const ny = baseY - v * plotH * 0.12;
      if (k === 0) c.moveTo(nx, ny);
      else c.lineTo(nx, ny);
    });
    c.stroke();
    c.globalAlpha = 1;

    const sig = state.signal;
    const rssi = rssiFor(state.distance);
    let haveSig = false;
    if (sig && sig.freq >= fLo && sig.freq <= fHi) {
      const env = looping ? envelopeAt(ts - sig.born) : 1;
      if (env > 0) {
        haveSig = true;
        const px = x0 + (plotW * (sig.freq - fLo)) / span;
        const top = y1 - plotH * peakFracFor(state.distance) * env;
        const sigma = Math.max(plotW * 0.011, 5);
        c.strokeStyle = peakC;
        c.lineWidth = 2;
        c.beginPath();
        let started = false;
        for (let sx = Math.max(x0, px - sigma * 4); sx <= Math.min(x1, px + sigma * 4); sx += 1) {
          const gy = baseY - (baseY - top) * Math.exp(-((sx - px) ** 2) / (2 * sigma * sigma));
          if (!started) {
            c.moveTo(sx, gy);
            started = true;
          } else c.lineTo(sx, gy);
        }
        c.stroke();
        c.fillStyle = peakC;
        c.textAlign = 'center';
        c.textBaseline = 'bottom';
        c.font = `11px ${mono}`;
        c.fillText(`${sig.freq.toFixed(2)} MHz`, clamp(px, x0 + 30, x1 - 30), top - 16);
        c.fillText(`${rssi} dBm · ${sig.name}`, clamp(px, x0 + 34, x1 - 34), top - 3);
      }
    }

    const text = haveSig
      ? `Receiving ${sig!.freq.toFixed(2)} MHz (${sig!.name}). RSSI ${rssi} dBm, ${strengthWord(state.distance)}.`
      : 'Noise floor only, about -100 dBm. Press a remote to transmit a burst.';
    if (text !== lastText) {
      lastText = text;
      readout.textContent = text; // only on change, so the live region does not repeat itself every frame
    }
  }

  /* ---- loop: runs only while motion is allowed, the widget is on screen and the tab is visible ---- */
  let raf = 0;
  let lastNoise = 0;
  let onScreen = true;
  const frame = (ts: number) => {
    if (state.signal && ts - state.signal.born > LIFE_MS) state.signal = null;
    if (ts - lastNoise > NOISE_MS) {
      makeNoise();
      lastNoise = ts;
    }
    render(ts);
    raf = requestAnimationFrame(frame);
  };
  function sync() {
    const want = animationAllowed() && onScreen && !document.hidden;
    if (want && !raf) {
      looping = true;
      clearTimeout(clearTimer);
      raf = requestAnimationFrame(frame);
    } else if (!want && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
      looping = false;
      if (state.signal) state.signal.born = performance.now(); // hand the burst to the static timer
      armClear();
      render();
    }
  }

  const fit = fitCanvas(canvas, () => render());
  ctx = fit.ctx;
  render();
  const offTheme = onThemeChange(() => render());
  const io = new IntersectionObserver((entries) => {
    onScreen = entries[entries.length - 1].isIntersecting;
    sync();
  });
  io.observe(host);
  const offMotion = $motion.listen(sync);
  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  sync();

  return () => {
    cancelAnimationFrame(raf);
    clearTimeout(clearTimer);
    io.disconnect();
    offMotion();
    mq.removeEventListener('change', sync);
    document.removeEventListener('visibilitychange', sync);
    fit.cleanup();
    offTheme();
    host.replaceChildren();
    host.classList.remove('sp-widget');
  };
};
