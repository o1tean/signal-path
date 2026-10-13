/* Which tool? A scenario quiz for the one decision beginners get wrong: which Sub-GHz tool to reach for.
   The four choices are the same every round. Every scenario is a device the learner owns.
   Port of legacy/assets/js/widgets/tool-picker.js. No badge, no stored state (as in legacy). */
import type { WidgetMount } from './types';
import { el, widgetShell } from './lib/dom';

export const TOOLS = [
  'Frequency Analyzer',
  'Read',
  'Read RAW',
  "Stop: likely rolling code, don't bother replaying",
] as const;

export interface Scenario {
  q: string;
  a: number;
  why: string;
}

export const SCENARIOS: Scenario[] = [
  {
    q: 'You own a little remote but have no idea what frequency it transmits on. What do you reach for first?',
    a: 0,
    why: "Frequency Analyzer listens across the CC1101's bands and reports the strongest signal while you hold the button. It is how you discover an unknown frequency before anything else.",
  },
  {
    q: "Your garage remote's frequency is known. You want the Flipper to name the protocol and show the decoded key.",
    a: 1,
    why: 'Read demodulates and decodes: it tells you the protocol (e.g. Princeton), bit length and key. That is exactly what Read is for on a signal it recognises.',
  },
  {
    q: 'A quirky sensor you own transmits, but Read shows nothing it recognises. You just want to record it and replay it to your own receiver.',
    a: 2,
    why: 'Read RAW captures the raw timing (the microsecond durations) without needing to understand the protocol, so you can replay an unknown but fixed signal.',
  },
  {
    q: 'You want to clone your car key fob so the Flipper can unlock your car.',
    a: 3,
    why: "Car fobs are rolling code. A capture will not replay, and cloning is not how you add a remote. Add a key through the car's own pairing procedure or the dealer instead.",
  },
  {
    q: "You press Read on your gate remote. It shows 'Nice FloR-S' and a Cnt that changes on every press. You hoped to save it and replay later.",
    a: 3,
    why: 'A Cnt that ticks every press means rolling code. A saved capture replays at most once and usually just fails, so this is a stop-and-rethink, not a replay job.',
  },
  {
    q: 'Before doing anything else, you only want to know whether your remote lives near 315 MHz or up around 433 MHz.',
    a: 0,
    why: 'That is a pure frequency question, so Frequency Analyzer is the tool: hold the button near the Flipper and read the number it locks onto.',
  },
  {
    q: "A cheap wireless doorbell you own triggers a chime. Read can't identify the protocol, but you want the Flipper to set the chime off.",
    a: 2,
    why: "When Read can't decode it but the code is fixed, Read RAW records the raw pulse timing so you can replay it and trigger your own doorbell.",
  },
  {
    q: "Your own garage remote reads cleanly as 'Princeton, 24-bit' with a fixed Key. You want to save it and open the garage from the Flipper.",
    a: 1,
    why: 'A fixed Princeton code is decodable and repeatable, so Read captures the protocol and key, and the saved .sub replays reliably to your own garage.',
  },
];

/** Closing line for a final score. */
export function verdict(score: number, total: number): string {
  if (score === total) return 'Perfect. You know exactly which tool each job wants.';
  if (score >= total - 2) return 'Solid. The rolling-code stops are the ones worth re-reading.';
  return 'Run it again. The pattern is: find, decode, record, or stop.';
}

/** Feedback after an answer. */
export function feedback(chosen: number, sc: Scenario): string {
  return (chosen === sc.a ? 'Right. ' : `Not quite. The move is ${TOOLS[sc.a].split(':')[0]}. `) + sc.why;
}

const optBase =
  'flex min-h-11 w-full items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 text-left text-sm transition-colors enabled:hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring disabled:cursor-default';
const optOk = 'border-success bg-success-soft';
const optBad = 'border-danger bg-danger-soft';
const btnPrimary =
  'min-h-11 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';
const btnGhost =
  'min-h-11 rounded-md border border-border px-4 text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring';

export const mount: WidgetMount = (host, opts) => {
  const compact = opts.mode === 'compact';
  const total = SCENARIOS.length;
  let pos = 0;
  let score = 0;
  let answered = false;

  const ui = widgetShell(host, 'Which tool?', 'Pick the right Sub-GHz move');

  if (!compact) {
    ui.body.append(
      el('p', { class: 'm-0 rounded-lg border border-border bg-muted px-3 py-2 text-sm' }, [
        'Every scenario is a device ',
        el('b', { text: 'you own' }),
        '. Same four tools each time. Learn when each one is the right call.',
      ]),
    );
  }

  const progress = el('p', { class: 'm-0 font-mono text-sm text-muted-foreground' });
  const qText = el('p', { class: 'm-0 min-h-[4.5rem] text-base font-medium', tabindex: '-1' });
  const optsBox = el('div', { class: 'grid gap-2', role: 'group', 'aria-label': 'Tool choices' });
  // Reserved height keeps the layout still when feedback appears.
  const explain = el('p', { class: 'm-0 min-h-44 sm:min-h-28 rounded-lg px-3 py-2 text-sm', role: 'status', 'aria-live': 'polite' });
  const nextBtn = el('button', { type: 'button', class: btnPrimary, text: 'Next' });
  const restartBtn = el('button', { type: 'button', class: btnGhost, text: 'Start over' });
  ui.body.append(progress, qText, optsBox, explain, el('div', { class: 'flex flex-wrap gap-3' }, [nextBtn, restartBtn]));
  ui.foot('Tip: unknown frequency, use Analyzer. Known protocol, use Read. Unknown but fixed, use Read RAW. Counter that changes, stop.');

  const showProgress = (final = false) => {
    progress.replaceChildren(
      ...(final
        ? ['Final score ', el('b', { text: String(score) }), ` / ${total}`]
        : ['Scenario ', el('b', { text: String(pos + 1) }), ` / ${total}  ·  Score `, el('b', { text: String(score) })]),
    );
  };

  function showQuestion() {
    answered = false;
    nextBtn.disabled = true;
    nextBtn.textContent = 'Next';
    const sc = SCENARIOS[pos];
    showProgress();
    qText.textContent = sc.q;
    explain.textContent = '';
    explain.className = 'm-0 min-h-44 sm:min-h-28 rounded-lg px-3 py-2 text-sm';
    optsBox.replaceChildren(
      ...TOOLS.map((label, j) => {
        const b = el('button', { type: 'button', class: optBase }, [
          el('span', {
            class: 'grid size-7 shrink-0 place-items-center rounded-md bg-muted font-mono text-xs',
            'aria-hidden': 'true',
            text: String.fromCharCode(65 + j),
          }),
          el('span', { text: label }),
        ]);
        b.addEventListener('click', () => answer(j, b));
        return b;
      }),
    );
  }

  function answer(j: number, btn: HTMLButtonElement) {
    if (answered) return;
    answered = true;
    const sc = SCENARIOS[pos];
    const buttons = [...optsBox.querySelectorAll('button')];
    buttons.forEach((x) => (x.disabled = true));
    const ok = j === sc.a;
    btn.classList.add(...(ok ? optOk : optBad).split(' '));
    if (!ok) buttons[sc.a].classList.add(...optOk.split(' '));
    btn.setAttribute('aria-label', `${String.fromCharCode(65 + j)}, ${TOOLS[j]}, ${ok ? 'correct' : 'incorrect'}`);
    if (!ok) buttons[sc.a].setAttribute('aria-label', `${String.fromCharCode(65 + sc.a)}, ${TOOLS[sc.a]}, the right answer`);
    if (ok) score++;
    explain.textContent = feedback(j, sc);
    explain.className = `m-0 min-h-44 sm:min-h-28 rounded-lg px-3 py-2 text-sm ${ok ? 'bg-success-soft' : 'bg-danger-soft'}`;
    showProgress();
    nextBtn.disabled = false;
    nextBtn.textContent = pos + 1 >= total ? 'See score' : 'Next';
    nextBtn.focus();
  }

  function finish() {
    qText.textContent = 'Done.';
    optsBox.replaceChildren();
    explain.textContent = `${score} / ${total}. ${verdict(score, total)}`;
    explain.className = `m-0 min-h-44 sm:min-h-28 rounded-lg px-3 py-2 text-sm ${score === total ? 'bg-success-soft' : 'bg-muted'}`;
    showProgress(true);
    nextBtn.disabled = true;
    nextBtn.textContent = 'Next';
    restartBtn.focus();
  }

  nextBtn.addEventListener('click', () => {
    pos++;
    if (pos >= total) finish();
    else {
      showQuestion();
      (optsBox.querySelector('button') as HTMLButtonElement | null)?.focus();
    }
  });
  restartBtn.addEventListener('click', () => {
    pos = 0;
    score = 0;
    showQuestion();
    (optsBox.querySelector('button') as HTMLButtonElement | null)?.focus();
  });

  showQuestion();

  return () => {
    host.replaceChildren();
    host.classList.remove('sp-widget');
  };
};
