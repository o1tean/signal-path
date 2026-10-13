/* Flashcards: flip-card study tool over the glossary. Port of legacy/assets/js/widgets/flashcards.js.
   Fixes over legacy: the saved position is a term (not an index into an unfiltered list), reduced motion is
   live, only the visible face is exposed to assistive tech, and position changes are announced. */
import { glossary, type GlossaryEntry } from '@/data/glossary';
import { $learner, $motion, animationAllowed, updateLearner } from '@/lib/learner';
import type { WidgetMount } from './types';
import { el, widgetShell } from './lib/dom';

/** Sorted unique tag list. */
export const tagsOf = (all: readonly GlossaryEntry[]) =>
  [...new Set(all.flatMap((e) => e.tags ?? []).filter(Boolean))].sort();

/** Cards for a tag; "all" or an empty match falls back to every card. */
export function filterCards(all: readonly GlossaryEntry[], tag: string): GlossaryEntry[] {
  const hit = tag === 'all' ? [] : all.filter((e) => (e.tags ?? []).includes(tag));
  return hit.length ? hit : all.slice();
}

/** Fisher-Yates on a copy. */
export function shuffled<T>(list: readonly T[], rnd: () => number = Math.random): T[] {
  const a = list.slice();
  for (let k = a.length - 1; k > 0; k--) {
    const j = Math.floor(rnd() * (k + 1));
    [a[k], a[j]] = [a[j], a[k]];
  }
  return a;
}

const nodes = (list: (Node | null)[]) => list.filter((n): n is Node => !!n);

const STYLE_ID = 'sp-flashcards-css';
const CSS = `
.sp-fc{perspective:1200px}
.sp-fc-card{position:relative;display:block;width:100%;cursor:pointer;border-radius:var(--radius-lg,.75rem)}
.sp-fc-inner{position:relative;width:100%;min-height:inherit;transform-style:preserve-3d;transition:transform .5s cubic-bezier(.2,.7,.2,1)}
.sp-fc-card.flipped .sp-fc-inner{transform:rotateY(180deg)}
.sp-fc.reduced .sp-fc-inner{transition:none}
.sp-fc-face{position:absolute;inset:0;display:flex;flex-direction:column;gap:.5rem;overflow:auto;padding:1.25rem 1.25rem 1.9rem;
 background:var(--muted);border:1px solid var(--border);border-radius:var(--radius-lg,.75rem);backface-visibility:hidden;-webkit-backface-visibility:hidden}
.sp-fc-back{transform:rotateY(180deg)}
.sp-fc-hint{position:absolute;right:.9rem;bottom:.6rem;font:.7rem var(--font-mono,monospace);color:var(--muted-foreground)}
`;
function ensureCSS() {
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = CSS;
  document.head.append(s);
}

export const mount: WidgetMount = (host, opts) => {
  const compact = opts.mode === 'compact';
  const all = glossary.filter((e) => e.term);
  const ui = widgetShell(host, 'Glossary flashcards', 'Flip to check yourself');
  if (!all.length) {
    ui.body.append(el('p', { class: 'm-0 text-sm text-muted-foreground', text: 'Glossary not loaded.' }));
    return () => host.replaceChildren();
  }
  ensureCSS();

  const uid = `fc-${Math.random().toString(36).slice(2, 8)}`;
  let list = all.slice();
  let i = 0;
  let flipped = false;
  const savedTerm = $learner.get().flashTerm;
  const saved = savedTerm ? list.findIndex((e) => e.term === savedTerm) : -1;
  if (saved >= 0) i = saved;

  /* ---- controls ---- */
  const tagSel = el('select', {
    id: `${uid}-tag`,
    class: 'h-11 rounded-md border border-input bg-background px-3 text-sm',
    'aria-label': 'Filter cards by tag',
  });
  tagSel.append(el('option', { value: 'all', text: 'all tags' }), ...tagsOf(all).map((t) => el('option', { value: t, text: t })));
  const btn = (label: string, extra = '', aria?: string) =>
    el('button', {
      type: 'button',
      class: `inline-flex min-h-11 items-center justify-center rounded-md px-4 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${extra || 'border border-border bg-background hover:bg-muted'}`,
      'aria-label': aria,
      text: label,
    });
  const shuffleBtn = btn('Shuffle');
  const pos = el('span', { class: 'ml-auto font-mono text-sm tabular-nums', 'aria-live': 'polite', 'aria-atomic': 'true' });
  ui.body.append(
    el('div', { class: 'flex flex-wrap items-center gap-3' }, [
      el('label', { for: `${uid}-tag`, class: 'text-sm font-medium', text: 'Tag' }),
      tagSel,
      shuffleBtn,
      pos,
    ]),
  );

  /* ---- card ---- */
  const minH = compact ? '150px' : '220px';
  const front = el('div', { class: 'sp-fc-face' });
  const back = el('div', { class: 'sp-fc-face sp-fc-back' });
  const inner = el('div', { class: 'sp-fc-inner', style: `min-height:${minH}` }, [front, back]);
  const card = el('div', {
    class: 'sp-fc-card',
    'data-flashcard': '',
    style: `min-height:${minH}`,
  }, [inner]);
  const wrap = el('div', { class: 'sp-fc' }, [card]);
  const note = el('p', { class: 'sr-only', 'aria-live': 'polite' });
  const prevBtn = btn('‹ Prev', '', 'Previous card');
  const flipBtn = btn('Flip', 'bg-primary text-primary-foreground hover:opacity-90', 'Flip card');
  flipBtn.setAttribute('aria-pressed', 'false');
  const nextBtn = btn('Next ›', '', 'Next card');
  ui.body.append(wrap, el('div', { class: 'flex flex-wrap gap-2' }, [prevBtn, flipBtn, nextBtn]), note);

  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  const syncMotion = () => wrap.classList.toggle('reduced', !animationAllowed());
  syncMotion();
  mq.addEventListener('change', syncMotion);
  const offMotion = $motion.subscribe(syncMotion);

  /* ---- logic ---- */
  const faceText = (cls: string, text: string, tagName: 'div' | 'p' = 'div') => el(tagName, { class: cls, text });
  function setFlipped(v: boolean) {
    flipped = v;
    card.classList.toggle('flipped', v);
    flipBtn.setAttribute('aria-pressed', String(v));
    front.setAttribute('aria-hidden', String(v));
    back.setAttribute('aria-hidden', String(!v));
  }
  function render() {
    const e = list[i];
    front.replaceChildren(
      ...nodes([
      faceText('font-mono text-xs uppercase tracking-wider text-muted-foreground', 'Term'),
      faceText('text-2xl font-extrabold leading-tight', e.term),
      e.tags?.length
        ? el('div', { class: 'mt-1 flex flex-wrap gap-1.5' }, e.tags.map((t) => el('span', { class: 'rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground', text: t })))
        : null,
      faceText('sp-fc-hint', 'flip →'),
      ]),
    );
    back.replaceChildren(
      ...nodes([
      faceText('font-mono text-xs uppercase tracking-wider text-muted-foreground', e.term),
      e.short ? faceText('font-semibold', e.short) : null,
      e.long ? faceText('text-sm text-muted-foreground', e.long) : null,
      !e.short && !e.long ? faceText('text-sm text-muted-foreground', 'No definition on file.') : null,
      faceText('sp-fc-hint', '← flip'),
      ]),
    );
    setFlipped(false);
    pos.textContent = `${i + 1} / ${list.length}`;
  }
  const flip = () => setFlipped(!flipped);
  function go(d: number) {
    i = (i + d + list.length) % list.length;
    render();
    const term = list[i].term;
    updateLearner((s) => ({ ...s, flashTerm: term }));
  }
  function applyFilter(t: string) {
    list = filterCards(all, t);
    i = 0;
    render();
  }

  const onTag = () => applyFilter(tagSel.value);
  const onShuffle = () => {
    list = shuffled(list);
    i = 0;
    render();
    note.textContent = '';
    requestAnimationFrame(() => (note.textContent = `Shuffled ${list.length} cards`));
  };
  const onKey = (e: KeyboardEvent) => {
    const t = e.target as HTMLElement | null;
    const typing = !!t && ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName);
    const isBtn = t?.tagName === 'BUTTON';
    if (e.key === 'ArrowLeft' && !typing) { e.preventDefault(); go(-1); }
    else if (e.key === 'ArrowRight' && !typing) { e.preventDefault(); go(1); }
    else if ((e.key === ' ' || e.key === 'Enter') && !typing && !isBtn) { e.preventDefault(); flip(); }
  };
  tagSel.addEventListener('change', onTag);
  shuffleBtn.addEventListener('click', onShuffle);
  card.addEventListener('click', flip);
  flipBtn.addEventListener('click', flip);
  prevBtn.addEventListener('click', () => go(-1));
  nextBtn.addEventListener('click', () => go(1));
  host.addEventListener('keydown', onKey);

  render();

  return () => {
    mq.removeEventListener('change', syncMotion);
    offMotion();
    host.removeEventListener('keydown', onKey);
    host.replaceChildren();
  };
};
