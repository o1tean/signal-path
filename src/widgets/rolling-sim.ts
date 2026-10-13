/* Rolling-code sim: a remote, a Flipper-style recorder and a gate receiver, all synthetic.
   The receiver accepts a code only if last < Cnt <= last + window, then moves forward.
   A concept demo of why a captured code opens the gate at most once. Port of legacy/assets/js/widgets/rolling-sim.js. */
import { animationAllowed, award } from '@/lib/learner';
import type { WidgetMount } from './types';
import { el, widgetShell } from './lib/dom';

export const SERIAL = '1A2B3C4D';
export const START = 5;
export const DEFAULT_WINDOW = 16;
export type Verdict = 'accept' | 'replay' | 'ahead';
type Kind = 'note' | 'tip' | 'warn' | 'legal';

/** Stand-in for the encrypted rolling part: a 32-bit hash shown as four hex bytes, LSB first. */
export function blobFor(cnt: number): string {
  let s = 0;
  const str = `${SERIAL}:${cnt}`;
  for (let i = 0; i < str.length; i++) s = (s * 131 + str.charCodeAt(i)) >>> 0;
  const out: string[] = [];
  for (let b = 0; b < 4; b++) out.push(((s >>> (b * 8)) & 0xff).toString(16).padStart(2, '0').toUpperCase());
  return out.join(' ');
}

/** Receiver rule. Rejected packets never move `last`. */
export function evaluate(cnt: number, last: number, win: number): Verdict {
  if (cnt <= last) return 'replay';
  if (cnt > last + win) return 'ahead';
  return 'accept';
}

const KIND_CLASS: Record<Kind, string> = {
  note: 'border-info/40 bg-info-soft',
  tip: 'border-success/40 bg-success-soft',
  warn: 'border-warning/40 bg-warning-soft',
  legal: 'border-danger/40 bg-danger-soft',
};
const KIND_ICON: Record<Kind, string> = { note: '»', tip: '✓', warn: '!', legal: '✕' };
const BTN = 'min-h-11 rounded-md border border-border bg-card px-4 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 aria-pressed:bg-primary aria-pressed:text-primary-foreground focus-visible:outline-2 focus-visible:outline-ring';
const BTN_PRIMARY = 'min-h-11 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-ring';

export const mount: WidgetMount = (host, opts) => {
  const compact = opts.mode === 'compact';
  let remoteCnt = START;
  let recvLast = START;
  let win = DEFAULT_WINDOW;
  let captured: { cnt: number; blob: string } | null = null;
  let armed = false;
  let gateOpen = false;
  let running = false; // a scripted preset is playing
  let sawReplayFail = false;
  let logLines: string[] = [];
  let timer: ReturnType<typeof setTimeout> | null = null;
  let stepIdx = 0;
  let awaitingFinish = false;

  const ui = widgetShell(host, 'Rolling-code sim', 'Why a replay works once, then never again');
  const uid = `rolling-sim-${Math.random().toString(36).slice(2, 8)}`;

  if (!compact) {
    ui.body.append(
      el('p', { class: 'm-0 rounded-md border border-border bg-muted px-3 py-2 text-sm' }, [
        el('strong', { text: 'A synthetic counter model with no radio hardware. ' }),
        'Predict whether each simulated message will be accepted, then try it. Cryptography, radio interference and vendor-specific recovery are not implemented here.',
      ]),
    );
  }

  /* ---- panels ---- */
  const val = (text: string, cls = 'font-mono') => el('span', { class: cls, text });
  const remoteCntEl = val('', 'font-mono font-semibold');
  const remoteBlobEl = val('');
  const flipStateEl = el('span', { class: 'rounded-full px-2 py-0.5 text-xs font-medium' });
  const flipCntEl = val('');
  const flipBlobEl = val('');
  const recvLastEl = val('', 'font-mono font-semibold');
  const recvWinEl = val('', 'font-mono font-semibold');
  const gatePill = el('span', { class: 'whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold' });
  const gateBar = el('div', { class: 'mt-2 h-2 rounded-full', 'aria-hidden': 'true' });

  const panel = (icon: string, title: string, rows: [string, HTMLElement][], extra?: HTMLElement) =>
    el('section', { class: 'rounded-lg border border-border bg-card p-3', 'aria-label': title }, [
      el('h4', { class: 'm-0 mb-2 text-sm font-semibold' }, [el('span', { class: 'mr-1.5 text-primary', 'aria-hidden': 'true', text: icon }), title]),
      el('dl', { class: 'm-0 grid grid-cols-[max-content_minmax(0,1fr)] items-center gap-x-3 gap-y-1.5 text-sm' },
        rows.flatMap(([k, v]) => [el('dt', { class: 'text-muted-foreground', text: k }), el('dd', { class: 'm-0' }, [v])])),
      extra,
    ]);

  ui.body.append(
    el('div', { class: 'grid gap-3 md:grid-cols-3' }, [
      panel('◉', 'Remote', [['Serial', val(SERIAL)], ['Cnt', remoteCntEl], ['Last blob', remoteBlobEl]]),
      panel('▸', 'Flipper', [['Status', flipStateEl], ['Captured Cnt', flipCntEl], ['Blob', flipBlobEl]]),
      panel('⛨', 'Receiver', [['Last accepted', recvLastEl], ['Window', recvWinEl], ['Gate', gatePill]], gateBar),
    ]),
  );

  /* ---- window slider ---- */
  const slider = el('input', { id: `${uid}-win`, type: 'range', min: 1, max: 256, value: win, class: 'h-11 w-40 accent-primary' });
  const sliderVal = el('span', { class: 'font-mono text-sm', 'aria-hidden': 'true' });
  slider.addEventListener('input', () => {
    win = parseInt(slider.value, 10) || 1;
    render();
  });
  ui.body.append(
    el('div', { class: 'flex flex-wrap items-center gap-3' }, [
      el('label', { for: `${uid}-win`, class: 'text-sm font-medium', text: 'Accept window' }),
      slider,
      sliderVal,
    ]),
  );

  /* ---- buttons ---- */
  const pressBtn = el('button', { type: 'button', class: BTN_PRIMARY, text: 'Press real remote' });
  const captureBtn = el('button', { type: 'button', class: BTN, text: 'Capture next press', 'aria-pressed': 'false' });
  const replayBtn = el('button', { type: 'button', class: BTN, text: 'Replay capture' });
  const presetBtn = el('button', { type: 'button', class: BTN, text: 'Reproduce the gate mystery' });
  const resetBtn = el('button', { type: 'button', class: BTN, text: 'Reset' });
  // Manual controls are ignored while a preset plays; Reset and the preset button stay live.
  pressBtn.addEventListener('click', () => !running && pressRemote());
  captureBtn.addEventListener('click', () => !running && armCapture());
  replayBtn.addEventListener('click', () => !running && replay());
  presetBtn.addEventListener('click', runPreset);
  resetBtn.addEventListener('click', reset);
  ui.body.append(el('div', { class: 'flex flex-wrap gap-2' }, [pressBtn, captureBtn, replayBtn, presetBtn, resetBtn]));

  /* ---- decision + log (fixed heights so nothing shifts) ---- */
  const reasonIcon = el('span', { class: 'font-mono font-semibold', 'aria-hidden': 'true' });
  const reasonTitle = el('strong', { class: 'block' });
  const reasonBody = el('span', { class: 'block text-sm' });
  const reason = el('div', { class: 'flex min-h-60 gap-3 rounded-md border p-3 sm:min-h-32', role: 'status', 'aria-live': 'polite' }, [
    reasonIcon,
    el('div', {}, [reasonTitle, reasonBody]),
  ]);
  const log = el('pre', {
    class: `m-0 overflow-auto rounded-md bg-scope-bg p-3 font-mono text-xs text-scope-text ${compact ? 'h-24' : 'h-36'}`,
    tabindex: 0,
    'aria-label': 'Event log',
  });
  ui.body.append(reason, log);
  ui.foot("Cnt is the remote's counter. The receiver only ever moves forward, which is what makes an old capture worthless.");

  /* ---- helpers ---- */
  function logMsg(m: string) {
    logLines.push(m);
    if (logLines.length > 40) logLines.shift();
    log.textContent = logLines.join('\n');
    log.scrollTop = log.scrollHeight;
  }
  function setReason(kind: Kind, title: string, msg: string) {
    reason.className = `flex min-h-60 gap-3 rounded-md border p-3 sm:min-h-32 ${KIND_CLASS[kind]}`;
    reasonIcon.textContent = KIND_ICON[kind];
    reasonTitle.textContent = title;
    reasonBody.textContent = msg;
  }
  function render() {
    remoteCntEl.textContent = String(remoteCnt);
    remoteBlobEl.textContent = blobFor(remoteCnt);
    recvLastEl.textContent = String(recvLast);
    recvWinEl.textContent = String(win);
    sliderVal.textContent = `window ${win}`;
    slider.setAttribute('aria-valuetext', `window ${win}`);
    if (captured) {
      flipCntEl.textContent = String(captured.cnt);
      flipBlobEl.textContent = captured.blob;
      flipStateEl.textContent = `holds Cnt ${captured.cnt}`;
      flipStateEl.className = 'rounded-full bg-story-soft px-2 py-0.5 text-xs font-medium text-story';
    } else {
      flipCntEl.textContent = armed ? 'listening…' : 'empty';
      flipBlobEl.textContent = '-';
      flipStateEl.textContent = armed ? 'armed' : 'idle';
      flipStateEl.className = `rounded-full px-2 py-0.5 text-xs font-medium ${armed ? 'bg-warning-soft text-warning' : 'bg-muted text-muted-foreground'}`;
    }
    for (const n of [flipCntEl, flipBlobEl]) n.className = `font-mono ${captured ? '' : 'text-muted-foreground'}`;
    gatePill.textContent = gateOpen ? 'GATE OPEN' : 'GATE CLOSED';
    gatePill.className = `whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${gateOpen ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'}`;
    gateBar.className = `mt-2 h-2 rounded-full ${gateOpen ? 'bg-success' : 'bg-danger opacity-50'}`;
    captureBtn.setAttribute('aria-pressed', String(armed));
    for (const b of [pressBtn, captureBtn]) b.disabled = running;
    replayBtn.disabled = running || !captured;
    slider.disabled = running;
  }
  function judge(cnt: number): Verdict {
    const v = evaluate(cnt, recvLast, win);
    gateOpen = v === 'accept';
    if (gateOpen) recvLast = cnt;
    return v;
  }

  /* ---- actions ---- */
  function pressRemote() {
    remoteCnt++;
    const blob = blobFor(remoteCnt);
    if (armed) {
      // Pressed away from the gate: the Flipper records it and the gate never hears it.
      captured = { cnt: remoteCnt, blob };
      armed = false;
      setReason('note', 'Recorded, out of range',
        `You pressed the remote away from the gate. The Flipper stored Cnt ${remoteCnt}. The gate heard nothing, so its last accepted is still ${recvLast}.`);
      logMsg(`Press #${remoteCnt} recorded by Flipper (gate out of range).`);
      return render();
    }
    const prev = recvLast;
    const v = judge(remoteCnt);
    if (v === 'accept') {
      setReason('tip', 'Gate opens',
        `Cnt ${remoteCnt} is ahead of the last accepted ${prev} and inside the window of ${win}. Accepted. The receiver now expects a Cnt above ${remoteCnt}.`);
      logMsg(`Press #${remoteCnt} -> ACCEPT. Gate opens. Receiver last = ${recvLast}.`);
    } else if (v === 'ahead') {
      setReason('warn', 'Too far ahead',
        `Cnt ${remoteCnt} is more than ${win} past the receiver's ${prev}. The receiver thinks the remote drifted out of sync and refuses it (it needs a resync).`);
      logMsg(`Press #${remoteCnt} -> REJECT (out of sync, > window).`);
    } else {
      setReason('legal', 'Already used', `Cnt ${remoteCnt} is not ahead of ${prev}. Nothing happens.`);
      logMsg(`Press #${remoteCnt} -> REJECT (not ahead).`);
    }
    render();
  }

  function armCapture() {
    if (captured) {
      setReason('note', 'Flipper already holds a capture', 'Replay it or Reset before recording another press.');
      return;
    }
    armed = !armed;
    setReason('note', armed ? 'Flipper armed' : 'Capture cancelled',
      armed
        ? "The next remote press will be recorded (picture pressing it in the driveway, out of the gate's range)."
        : 'The Flipper is idle again.');
    logMsg(armed ? 'Flipper armed to capture the next press.' : 'Capture disarmed.');
    render();
  }

  function replay() {
    if (!captured) return;
    const prev = recvLast;
    const v = judge(captured.cnt);
    if (v === 'accept') {
      setReason('tip', 'Replay worked, this time',
        `The stored Cnt ${captured.cnt} was still ahead of the receiver's ${prev}, so the gate opened. That capture is now spent: the receiver advanced to ${recvLast}.`);
      logMsg(`Replay Cnt ${captured.cnt} -> ACCEPT. Gate opens. Receiver last = ${recvLast}.`);
    } else {
      if (v === 'ahead') {
        setReason('warn', 'Replay refused, too far ahead',
          `Stored Cnt ${captured.cnt} is more than ${win} past the receiver's ${recvLast}. Out of sync, rejected.`);
        logMsg(`Replay Cnt ${captured.cnt} -> REJECT (out of sync).`);
      } else {
        setReason('legal', 'Replay is dead',
          `Stored Cnt ${captured.cnt} is not ahead of the receiver's ${recvLast} any more. The real remote moved the counter on, so the receiver treats it as an old, already-used code and ignores it. This is why rolling codes beat a plain replay.`);
        logMsg(`Replay Cnt ${captured.cnt} -> REJECT (already used).`);
      }
      if (!sawReplayFail) {
        sawReplayFail = true;
        award('out-of-sync');
      }
    }
    render();
  }

  function reset() {
    stopPreset();
    remoteCnt = START; recvLast = START; win = DEFAULT_WINDOW;
    captured = null; armed = false; gateOpen = false;
    slider.value = String(DEFAULT_WINDOW);
    logLines = [];
    setReason('note', 'Reset', `Remote and receiver both back to Cnt ${START}.`);
    logMsg(`Reset. Remote Cnt ${remoteCnt}, receiver last ${recvLast}.`);
    render();
  }

  /* ---- scripted demo ---- */
  const STEPS: (() => void)[] = [
    armCapture,
    pressRemote, // captured as #6, the gate does not hear it
    () => { logMsg('- now you drive to the gate -'); replay(); }, // works: 6 > 5
    pressRemote, // #7 at the gate
    pressRemote, // #8 at the gate
    () => { logMsg('- you try the old capture again -'); replay(); }, // fails: 6 <= 8
  ];
  function stopPreset() {
    running = false;
    awaitingFinish = false;
    stepIdx = 0;
    if (timer) clearTimeout(timer);
    timer = null;
    presetBtn.textContent = 'Reproduce the gate mystery';
    render();
  }
  function finishSummary() {
    setReason('legal', 'That is the whole mystery',
      "The capture opened the gate once, then two honest presses moved the counter past it. Replaying the old code now does nothing, which is what people report as a gate that stopped working after they copied the remote.");
    logMsg('Done. The one-time capture is now worthless.');
    stopPreset();
  }
  function runPreset() {
    if (timer) return; // a timed run is already playing, even if reduced motion was switched on meanwhile
    if (!animationAllowed()) return stepPreset(); // click-per-step instead of timers
    if (running) return;
    reset();
    running = true;
    render();
    let k = 0;
    const tick = () => {
      if (k >= STEPS.length) return finishSummary();
      STEPS[k++]();
      timer = setTimeout(tick, 900);
    };
    timer = setTimeout(tick, 300);
  }
  function stepPreset() {
    if (awaitingFinish) return finishSummary();
    if (!running) {
      reset();
      running = true;
    }
    STEPS[stepIdx++]();
    awaitingFinish = stepIdx >= STEPS.length;
    presetBtn.textContent = awaitingFinish ? 'See the summary' : `Next step (${stepIdx} of ${STEPS.length})`;
    render();
  }

  setReason('note', 'Waiting', 'Press the remote to open the gate, or record a press to try a replay.');
  render();
  logMsg(`Ready. Remote Cnt ${remoteCnt}, receiver last accepted ${recvLast}.`);

  return () => {
    if (timer) clearTimeout(timer);
    host.replaceChildren();
    host.classList.remove('sp-widget');
  };
};
