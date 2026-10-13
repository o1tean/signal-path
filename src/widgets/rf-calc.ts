/* RF calculator: (A) frequency to wavelength and antenna lengths, (B) dBm <-> mW.
   Pure client math, no learner state. Port of legacy/assets/js/widgets/rf-calc.js. */
import type { WidgetMount } from './types';
import { el, widgetShell } from './lib/dom';

export const C = 299792458; // speed of light, m/s
const DASH = '—';

/** Centimetres as cm (>= 1 cm) or mm. */
export function fmtCm(cm: number): string {
  if (!isFinite(cm)) return DASH;
  if (cm >= 100) return `${cm.toFixed(1)} cm`;
  if (cm >= 1) return `${cm.toFixed(2)} cm`;
  return `${(cm * 10).toFixed(2)} mm`;
}

/** Short number: fixed for readable magnitudes, exponential otherwise. Range test uses |n| (legacy tested n, so -3 dBm printed as -3.010e+0). */
export function sig(n: number, digits = 4): string {
  if (!isFinite(n)) return DASH;
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 0.001 && abs < 1e7) return parseFloat(n.toFixed(abs >= 100 ? 2 : abs >= 1 ? 3 : 4)).toString();
  return n.toExponential(digits - 1);
}

export interface Wavelength {
  lambda: string;
  quarter: string;
  half: string;
  worked: string;
}

/** Wavelength results for a frequency in MHz, or null when the input is not a positive number. */
export function wavelength(fMHz: number): Wavelength | null {
  if (!isFinite(fMHz) || fMHz <= 0) return null;
  const fHz = fMHz * 1e6;
  const m = C / fHz;
  const cm = m * 100;
  if (!isFinite(cm)) return null; // denormal input: fHz underflows to 0
  return {
    lambda: fmtCm(cm),
    quarter: fmtCm(cm / 4),
    half: fmtCm(cm / 2),
    worked: `λ = 299,792,458 ÷ ${Math.round(fHz).toLocaleString('en-US')} Hz = ${m.toFixed(4)} m = ${cm.toFixed(2)} cm`,
  };
}

export const dbmToMw = (dbm: number) => (isFinite(dbm) ? sig(10 ** (dbm / 10)) + ' mW' : DASH);

export function mwToDbm(mw: number): string {
  if (!isFinite(mw) || mw < 0) return DASH;
  if (mw === 0) return `${DASH} (0 mW is minus infinity dBm)`;
  return sig(10 * Math.log10(mw)) + ' dBm';
}

const inputCls = 'h-11 rounded-md border border-input bg-background px-3 font-mono tabular-nums';

export const mount: WidgetMount = (host, opts) => {
  const compact = opts.mode === 'compact';
  const uid = `rf-calc-${Math.random().toString(36).slice(2, 8)}`;
  const ui = widgetShell(host, 'RF calculator', 'Wavelength and power, worked out');

  const field = (id: string, label: string, value: string, extra: Record<string, string>) => {
    const input = el('input', { id: `${uid}-${id}`, type: 'number', inputmode: 'decimal', value, class: `${inputCls} w-36`, ...extra });
    return { input, wrap: el('div', { class: 'grid gap-1' }, [el('label', { for: input.id, class: 'text-sm font-medium', text: label }), input]) };
  };
  const row = (term: string, dd: HTMLElement) => [
    el('dt', { class: 'text-sm text-muted-foreground', text: term }),
    dd,
  ];
  const dd = (cls = '') => el('dd', { class: `m-0 font-mono tabular-nums ${cls}` });
  const out = (cls = '') => el('output', { class: `font-mono font-semibold tabular-nums ${cls}`, 'aria-live': 'polite' });

  /* A: wavelength */
  const fA = field('freq', 'Frequency (MHz)', '433.92', { min: '0', step: '0.01' });
  const ddL = dd('font-semibold'), ddQ = dd('font-semibold'), ddH = dd('font-semibold');
  const ddW = dd('min-h-12 text-xs text-muted-foreground');
  const dl = el('dl', { class: 'm-0 grid grid-cols-[6rem_1fr] items-baseline gap-x-4 gap-y-1' }, [
    ...row('Full λ', ddL), ...row('λ/4', ddQ), ...row('λ/2', ddH), ...(compact ? [] : row('Worked', ddW)),
  ]);
  dl.setAttribute('aria-live', 'polite');
  ui.body.append(
    el('section', { 'aria-label': 'Wavelength and antenna length', class: 'space-y-3 rounded-lg border border-border bg-muted/40 p-4' }, [
      el('h4', { class: 'm-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground', text: 'A. Wavelength and antenna' }),
      fA.wrap,
      dl,
    ]),
  );

  /* B: power */
  const fB1 = field('dbm', 'Power (dBm)', '10', { step: '1' });
  const fB2 = field('mw', 'Power (mW)', '1', { min: '0', step: '0.1' });
  const o1 = out(), o2 = out();
  ui.body.append(
    el('section', { 'aria-label': 'Power converter', class: 'space-y-3 rounded-lg border border-border bg-muted/40 p-4' }, [
      el('h4', { class: 'm-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground', text: 'B. Power (dBm and mW)' }),
      el('div', { class: 'flex flex-wrap items-end gap-x-4 gap-y-2' }, [fB1.wrap, el('p', { class: 'm-0 pb-2' }, ['= ', o1])]),
      el('div', { class: 'flex flex-wrap items-end gap-x-4 gap-y-2' }, [fB2.wrap, el('p', { class: 'm-0 pb-2' }, ['= ', o2])]),
      el('p', { class: 'm-0 text-sm text-muted-foreground', text: 'Reference: 0 dBm = 1 mW. Add 10 dB to multiply by 10. Add 3 dB to roughly double.' }),
    ]),
  );
  ui.foot('Wavelength: λ = c ÷ f, with c = 299,792,458 m/s. A quarter-wave whip (λ/4) is the classic rubber duck antenna length.');

  const calcA = () => {
    const w = wavelength(parseFloat(fA.input.value));
    ddL.textContent = w?.lambda ?? DASH;
    ddQ.textContent = w?.quarter ?? DASH;
    ddH.textContent = w?.half ?? DASH;
    ddW.textContent = w?.worked ?? 'Enter a frequency above 0.';
  };
  const calcB1 = () => (o1.textContent = dbmToMw(parseFloat(fB1.input.value)));
  const calcB2 = () => (o2.textContent = mwToDbm(parseFloat(fB2.input.value)));

  fA.input.addEventListener('input', calcA);
  fB1.input.addEventListener('input', calcB1);
  fB2.input.addEventListener('input', calcB2);
  calcA(); calcB1(); calcB2();

  return () => {
    host.replaceChildren();
    host.classList.remove('sp-widget');
  };
};
