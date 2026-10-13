/* Tune In: a hidden device transmits one peak on a common Sub-GHz frequency. Read it off the MHz scale and pick it.
   Five correct in a row awards "tuned-in". Port of legacy/assets/js/widgets/tune-in.js. */
import { $learner, award, updateLearner } from '@/lib/learner';
import type { WidgetMount } from './types';
import { cssVar, el, fitCanvas, onThemeChange, widgetShell } from './lib/dom';

export const FREQS = [315, 390, 433.92, 868, 915]; // common Sub-GHz remote frequencies, MHz
export const AXIS_LO = 300;
export const AXIS_HI = 928;
const AXIS_SPAN = AXIS_HI - AXIS_LO;
export const STREAK_GOAL = 5;

export const fmt = (f: number) => (f === Math.round(f) ? String(f) : f.toFixed(2));

/** Static noise so the trace does not flicker between redraws. */
export const noiseAt = (k: number) => {
  const v = Math.sin(k * 12.9898) * 43758.5453;
  return 0.25 + (v - Math.floor(v)) * 0.6;
};

const shuffle = <T>(a: T[], rnd: () => number): T[] => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/** One round: a secret (never the previous one) and four distinct shuffled choices that include it. */
export function newRound(last: number | null, rnd: () => number = Math.random): { secret: number; choices: number[] } {
  let secret = FREQS[Math.floor(rnd() * FREQS.length)];
  if (secret === last) secret = FREQS[(FREQS.indexOf(secret) + 1) % FREQS.length];
  const others = shuffle(FREQS.filter((f) => f !== secret), rnd);
  return { secret, choices: shuffle([secret, others[0], others[1], others[2]], rnd) };
}

const IDLE = 'Read the peak against the MHz scale, then choose.';
const btnBase =
  'inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-medium transition-colors enabled:hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring disabled:cursor-default';

export const mount: WidgetMount = (host, opts) => {
  const compact = opts.mode === 'compact';
  const height = compact ? 150 : 200;
  let correct = 0;
  let attempts = 0;
  let streak = 0;
  let answered = false;
  let last: number | null = null;
  let cur = { secret: FREQS[0], choices: [] as number[] };
  const best = () => $learner.get().tuneIn?.best ?? 0;

  const ui = widgetShell(host, 'Tune In', 'Read the peak, name the frequency');

  const sScore = el('span');
  const sStreak = el('span');
  const sBest = el('span');
  ui.body.append(el('div', { class: 'flex flex-wrap gap-x-5 gap-y-1 font-mono text-sm text-muted-foreground' }, [sScore, sStreak, sBest]));

  const canvas = el('canvas', {
    class: 'block w-full rounded-lg bg-scope-bg',
    style: `height:${height}px`,
    role: 'img',
    'aria-label': 'Spectrum reading with one peak to identify. The peak position is shown on the MHz scale.',
  });
  const optWrap = el('div', { class: 'flex flex-wrap gap-2', role: 'group', 'aria-label': 'Frequency choices' });
  const fbText = el('span');
  const fbIcon = el('span', { class: 'font-mono font-semibold', 'aria-hidden': 'true', text: '?' });
  const feedback = el('div', { class: 'flex min-h-14 items-start gap-3 rounded-lg border border-border bg-muted px-4 py-3 text-sm', 'aria-live': 'polite' }, [fbIcon, fbText]);
  const nextBtn = el('button', { type: 'button', class: `${btnBase.replace('bg-card', 'bg-primary').replace('enabled:hover:bg-muted', 'enabled:hover:bg-primary/90')} text-primary-foreground disabled:opacity-50` }, ['Next round']);
  nextBtn.addEventListener('click', () => start(true));
  ui.body.append(
    canvas,
    el('p', { class: 'm-0 font-mono text-sm', text: 'What frequency is this device transmitting on?' }),
    optWrap,
    feedback,
    nextBtn,
  );
  ui.foot(
    "Peaks sit at the transmitter's frequency. Real remotes cluster near 315, 390, 433.92, 868 and 915 MHz. Press 1 to 4 to choose.",
  );

  function setFeedback(kind: 'idle' | 'ok' | 'miss', icon: string, text: string) {
    feedback.className = `flex min-h-14 items-start gap-3 rounded-lg border px-4 py-3 text-sm ${
      kind === 'ok' ? 'border-success bg-success-soft' : kind === 'miss' ? 'border-destructive bg-destructive/10' : 'border-border bg-muted'
    }`;
    fbIcon.textContent = icon;
    fbText.textContent = text;
  }

  function updateStats() {
    sScore.textContent = `Correct: ${correct} / ${attempts}`;
    sStreak.textContent = `Streak: ${streak}`;
    sBest.textContent = `Best streak: ${best()}`;
  }

  /* ---- drawing ---- */
  function draw(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const bg = cssVar('--scope-bg', '#0B1220');
    const grid = cssVar('--scope-grid', '#1B2A44');
    const trace = cssVar('--scope-trace', '#3FD8D2');
    const peakC = cssVar('--scope-peak', '#FF8A34');
    const txt = cssVar('--scope-text', '#9BB3D1');

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    const x0 = 8, x1 = w - 8, plotW = x1 - x0;
    const y0 = 12, y1 = h - 22, plotH = y1 - y0;

    ctx.strokeStyle = grid;
    ctx.lineWidth = 1;
    for (let g = 0; g <= 4; g++) {
      const yy = y0 + (plotH * g) / 4;
      ctx.beginPath(); ctx.moveTo(x0, yy + 0.5); ctx.lineTo(x1, yy + 0.5); ctx.stroke();
    }
    ctx.font = '10px monospace';
    ctx.textBaseline = 'top';
    const ticks = 6;
    for (let i = 0; i <= ticks; i++) {
      const xx = x0 + (plotW * i) / ticks;
      ctx.strokeStyle = grid;
      ctx.beginPath(); ctx.moveTo(xx + 0.5, y0); ctx.lineTo(xx + 0.5, y1); ctx.stroke();
      ctx.fillStyle = txt;
      ctx.textAlign = i === 0 ? 'left' : i === ticks ? 'right' : 'center';
      ctx.fillText((AXIS_LO + (AXIS_SPAN * i) / ticks).toFixed(0), i === 0 ? x0 : i === ticks ? x1 : xx, y1 + 5);
    }

    const baseY = y1 - plotH * 0.07;
    ctx.strokeStyle = trace;
    ctx.lineWidth = 1.1;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    const N = 160;
    for (let k = 0; k < N; k++) {
      const nx = x0 + (plotW * k) / (N - 1);
      const ny = baseY - noiseAt(k) * plotH * 0.1;
      if (k === 0) ctx.moveTo(nx, ny); else ctx.lineTo(nx, ny);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;

    const px = x0 + (plotW * (cur.secret - AXIS_LO)) / AXIS_SPAN;
    const top = y1 - plotH * 0.82;
    const sigma = Math.max(plotW * 0.011, 5);
    ctx.strokeStyle = peakC;
    ctx.lineWidth = 2;
    ctx.beginPath();
    let started = false;
    for (let sx = Math.max(x0, px - sigma * 4); sx <= Math.min(x1, px + sigma * 4); sx += 1) {
      const yv = baseY - (baseY - top) * Math.exp(-((sx - px) ** 2) / (2 * sigma * sigma));
      if (!started) { ctx.moveTo(sx, yv); started = true; } else ctx.lineTo(sx, yv);
    }
    ctx.stroke();

    if (answered) {
      ctx.fillStyle = peakC;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.font = '11px monospace';
      ctx.fillText(`${fmt(cur.secret)} MHz`, Math.min(Math.max(px, x0 + 30), x1 - 30), top - 4);
    }
  }
  const fit = fitCanvas(canvas, draw);
  const stopTheme = onThemeChange(fit.redraw);

  /* ---- rounds ---- */
  function start(focusFirst = false) {
    cur = newRound(last);
    last = cur.secret;
    answered = false;
    // Dev-only hook so the e2e spec can answer on purpose. Stripped from production builds.
    if (import.meta.env.DEV) host.dataset.secret = String(cur.secret);
    optWrap.replaceChildren(
      ...cur.choices.map((f, i) => {
        const b = el('button', { type: 'button', class: btnBase, 'data-freq': String(f), 'aria-label': `Choice ${i + 1}: ${fmt(f)} megahertz` }, [
          el('span', { class: 'font-mono opacity-60', 'aria-hidden': 'true', text: String(i + 1) }),
          `${fmt(f)} MHz`,
        ]);
        b.addEventListener('click', () => answer(f, b));
        return b;
      }),
    );
    setFeedback('idle', '?', IDLE);
    nextBtn.disabled = true;
    // Next is now disabled and drops focus; hand it to the first choice so 1 to 4 and Tab keep working.
    if (focusFirst) (optWrap.firstElementChild as HTMLElement | null)?.focus();
    fit.redraw();
  }

  function answer(f: number, btn: HTMLButtonElement) {
    if (answered) return;
    answered = true;
    attempts++;
    const ok = f === cur.secret;
    for (const b of optWrap.querySelectorAll('button')) {
      b.disabled = true;
      if (Number(b.dataset.freq) === cur.secret) b.classList.replace('bg-card', 'bg-success-soft'), b.classList.add('border-success');
    }
    if (ok) {
      correct++;
      streak++;
      if (streak > best()) updateLearner((s) => ({ ...s, tuneIn: { best: streak } }));
      setFeedback('ok', '✓', `Correct. That peak sits at ${fmt(cur.secret)} MHz. Streak: ${streak}.`);
      if (streak === STREAK_GOAL) award('tuned-in');
    } else {
      streak = 0;
      btn.classList.replace('bg-card', 'bg-destructive/10');
      btn.classList.add('border-destructive');
      setFeedback('miss', '!', `Not quite. That peak was at ${fmt(cur.secret)} MHz. Streak reset.`);
    }
    nextBtn.disabled = false;
    nextBtn.focus();
    updateStats();
    fit.redraw();
  }

  /* 1 to 4 choose an option, but never while typing in another field. */
  const onKey = (e: KeyboardEvent) => {
    if (answered || e.ctrlKey || e.metaKey || e.altKey) return;
    const n = parseInt(e.key, 10);
    const b = n >= 1 && n <= 4 ? optWrap.children[n - 1] : null;
    if (b instanceof HTMLButtonElement) {
      e.preventDefault();
      b.click();
    }
  };
  host.addEventListener('keydown', onKey);

  updateStats();
  start();

  return () => {
    host.removeEventListener('keydown', onKey);
    stopTheme();
    fit.cleanup();
    host.replaceChildren();
  };
};
