/* Flipper Sub-GHz sim: a simulated Flipper Zero screen and D-pad for learning the Sub-GHz menu tree.
   Teaching approximation, not a real device. Port of legacy/assets/js/widgets/flipper-sim.js.
   No timers, no learner state, no badges (the legacy widget had none). */
import type { WidgetMount } from './types';
import { el, widgetShell } from './lib/dom';

export interface Leaf {
  type: 'leaf';
  title: string;
  lines: string[];
  note: string;
}
export interface Menu {
  type: 'menu';
  title: string;
  items: { label: string; node: Node }[];
}
export type Node = Menu | Leaf;
interface Frame {
  node: Node;
  sel: number;
}

const menu = (title: string, items: Menu['items']): Menu => ({ type: 'menu', title, items });
const leaf = (title: string, lines: string[] = [], note = ''): Leaf => ({ type: 'leaf', title, lines, note });

const DECODE_NOTE = '(on a real Flipper, a decoded signal: protocol, key, and a Save option, appears here)';

const saved = menu('Saved', [
  {
    label: 'Doorbell_front',
    node: leaf(
      'Doorbell_front',
      ['Freq  433.92 MHz', 'Preset  AM650', 'Protocol Princeton', 'Bit 24   TE 400'],
      '(a stored .sub key file; the real screen offers Emulate / Send / Rename / Delete)',
    ),
  },
  {
    label: 'LED_strip',
    node: leaf(
      'LED_strip',
      ['Freq  433.92 MHz', 'Preset  AM650', 'Protocol Princeton', 'Bit 24'],
      '(your own saved capture: the course only ever stores devices you own)',
    ),
  },
]);

export const subghz = menu('Sub-GHz', [
  { label: 'Read', node: leaf('Read', ['433.92   AM650', '', 'Scanning . . .', '(quiet air)'], DECODE_NOTE) },
  {
    label: 'Read RAW',
    node: leaf(
      'Read RAW',
      ['433.92   AM650', '', 'Records raw on/off', 'timing to a .sub'],
      '(RAW capture stores microsecond timings, not a decoded protocol)',
    ),
  },
  {
    label: 'Frequency Analyzer',
    node: leaf(
      'Freq Analyzer',
      ["Hold a remote's", 'button nearby...', '', '433.920 MHz', '-64 dBm'],
      '(finds the strongest signal across 300-928 MHz, handy for an unknown remote)',
    ),
  },
  {
    label: 'Test',
    node: leaf('Test', ['433.92 MHz', '', 'RSSI  -92 dBm', 'level: quiet'], '(a live signal-strength meter on the current frequency)'),
  },
  {
    label: 'Add Manually',
    node: leaf(
      'Add Manually',
      ['Pick a known', 'protocol, then type', 'its code by hand.', '', 'e.g. Princeton,', 'Nice FLO, CAME'],
      '(builds a .sub from a protocol template; the real list is long)',
    ),
  },
  { label: 'Saved', node: saved },
]);

const notCovered = (name: string) =>
  leaf(
    name,
    ['This teaching sim', 'only walks the', 'Sub-GHz menu.', '', 'Press Back and', 'choose Sub-GHz.'],
    `(a real Flipper opens the ${name} app here)`,
  );

export const root = menu('Flipper', [
  { label: 'Sub-GHz', node: subghz },
  ...['125 kHz RFID', 'NFC', 'Infrared', 'GPIO', 'iButton', 'Settings'].map((n) => ({ label: n, node: notCovered(n) })),
]);

/** Pure state transitions, exported for tests. The stack always keeps at least the root frame. */
export const initialStack = (): Frame[] => [
  { node: root, sel: 0 },
  { node: subghz, sel: 0 },
];
export function moveSel(stack: Frame[], d: number) {
  const f = stack[stack.length - 1];
  if (f.node.type === 'menu') f.sel = Math.max(0, Math.min(f.node.items.length - 1, f.sel + d));
}
export function open(stack: Frame[]) {
  const f = stack[stack.length - 1];
  if (f.node.type === 'menu' && f.node.items[f.sel]) stack.push({ node: f.node.items[f.sel].node, sel: 0 });
}
export function back(stack: Frame[]) {
  if (stack.length > 1) stack.pop();
}

export const mount: WidgetMount = (host, opts) => {
  const compact = opts.mode === 'compact';
  const stack = initialStack(); // opts.start is accepted but ignored: the sim always opens inside Sub-GHz

  const ui = widgetShell(host, 'Flipper Sub-GHz sim', 'Walk the menu with the D-pad');

  const titleBar = el('div', {
    class: 'mb-1.5 flex items-center justify-between rounded-sm bg-lcd-ink px-1.5 py-0.5 font-bold text-lcd-bg',
  });
  const screen = el('div', { class: 'min-w-0' });
  const lcd = el(
    'div',
    {
      tabindex: '0',
      role: 'group',
      'aria-label': 'Simulated Flipper screen. Arrow keys move the cursor, Enter selects, Backspace goes back.',
      class:
        'mx-auto select-none overflow-hidden rounded-lg bg-lcd-bg p-3 font-mono text-lcd-ink outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring ' +
        (compact ? 'h-[17rem] max-w-65 text-[13px]' : 'h-[19rem] max-w-80 text-[15px]'),
    },
    [titleBar, screen],
  );
  const crumb = el('p', { class: 'text-center text-xs text-muted-foreground' });
  const status = el('p', { class: 'sr-only', 'aria-live': 'polite', 'aria-atomic': 'true' });

  const padBtn = (label: string, aria: string, area: string, handler: () => void, primary = false) => {
    const b = el('button', {
      type: 'button',
      'aria-label': aria,
      text: label,
      class:
        'min-h-11 rounded-md border px-3 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-40 ' +
        (primary
          ? 'border-transparent bg-primary text-primary-foreground hover:opacity-90'
          : 'border-border bg-background hover:bg-muted'),
      style: `grid-area:${area}`,
    });
    b.addEventListener('click', handler);
    return b;
  };
  const backBtn = padBtn('Back', 'Back, up one level', 'back', () => act(back));
  const pad = el(
    'div',
    {
      class: 'mx-auto grid max-w-70 grid-cols-3 gap-2',
      style: "grid-template-areas:'. up .' '. ok .' '. down back'",
    },
    [
      padBtn('▲', 'Up', 'up', () => act((s) => moveSel(s, -1))),
      padBtn('OK', 'Select or open', 'ok', () => act(open), true),
      padBtn('▼', 'Down', 'down', () => act((s) => moveSel(s, 1))),
      backBtn,
    ],
  );

  if (!compact) {
    ui.body.append(
      el('p', { class: 'text-sm text-muted-foreground' }, [
        'Move with the D-pad or arrow keys. ',
        el('b', { class: 'text-foreground', text: 'OK' }),
        ' opens an item, ',
        el('b', { class: 'text-foreground', text: 'Back' }),
        ' goes up a level.',
      ]),
    );
  }
  ui.body.append(lcd);
  if (!compact) ui.body.append(crumb);
  ui.body.append(pad, status);
  ui.foot(
    'Teaching approximation. Momentum may reorder or add items (extra presets, tools). Learn the shape, then trust the real menu.',
  );

  function act(fn: (s: Frame[]) => void) {
    fn(stack);
    render();
  }

  function render() {
    const { node, sel } = stack[stack.length - 1];
    titleBar.replaceChildren(el('span', { text: node.title }), el('span', { 'aria-hidden': 'true', text: '((•))' }));
    screen.replaceChildren();
    if (node.type === 'menu') {
      node.items.forEach((it, i) => {
        const on = i === sel;
        screen.append(
          el('div', {
            text: (on ? '» ' : '  ') + it.label,
            class: 'whitespace-pre rounded-sm px-1 py-px ' + (on ? 'bg-lcd-ink text-lcd-bg' : ''),
          }),
        );
      });
    } else {
      for (const ln of node.lines) screen.append(el('div', { text: ln, class: 'min-h-[1.2em] whitespace-pre' }));
      if (node.note) {
        screen.append(el('div', { text: node.note, class: 'mt-2 text-[0.82em] italic leading-snug opacity-80' }));
      }
    }
    crumb.textContent = stack.map((f) => f.node.title).join(' ▸ ');
    backBtn.disabled = stack.length <= 1;
    // concise screen-reader announcement instead of re-reading the whole screen
    status.textContent =
      node.type === 'menu'
        ? `${node.title} menu. ${node.items[sel].label}, ${sel + 1} of ${node.items.length}.`
        : `${node.title}. ${node.lines.filter(Boolean).join('. ')}. ${node.note}`;
  }

  /* Keyboard works whenever focus is inside the widget. Buttons keep their own Enter/Space click. */
  const onKey = (e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement | null)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        act((s) => moveSel(s, -1));
        break;
      case 'ArrowDown':
        e.preventDefault();
        act((s) => moveSel(s, 1));
        break;
      case 'Enter':
        if (tag !== 'BUTTON') {
          e.preventDefault();
          act(open);
        }
        break;
      case 'Backspace':
        e.preventDefault();
        act(back);
        break;
    }
  };
  host.addEventListener('keydown', onKey);

  render();

  return () => {
    host.removeEventListener('keydown', onKey);
    host.replaceChildren();
  };
};
