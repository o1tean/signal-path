/* Facts the marketing copy renders from data, so the copy cannot drift. Server-side (frontmatter) only:
   it counts the paid quiz bank but never passes a question anywhere. */
import { stages } from '@/data/course';
import { getLessons } from '@/lib/lessons';
import { foundingOffer, foundingOfferActive, formatPrice, tiers } from '@/data/offer';
import { freeQuiz } from '@/data/quiz/free';
import { paidQuiz } from '@/data/quiz/paid';
import { freeTools, tools } from '@/data/tools';

const lessons = await getLessons();
const complete = tiers.find((t) => t.key === 'complete')!;
const count = (bank: Record<string, readonly unknown[]>) => Object.values(bank).reduce((n, q) => n + q.length, 0);

/** `null` until the owner supplies it; rendered as a visible [NEED: …] marker. */
export const owner = {
  supportEmail: null as string | null,
  legalEntity: null as string | null,
};
export const need = (value: string | null, what: string) => value ?? `[NEED: ${what}]`;

export const facts = {
  lessons: lessons.length,
  stages: stages.length,
  freeLessons: lessons.filter((l) => l.free).length,
  paidLessons: lessons.filter((l) => !l.free).length,
  weeks: 12,
  questions: count(freeQuiz) + count(paidQuiz),
  tools: tools.length,
  freeTools: freeTools().length,
  lockedTools: tools.length - freeTools().length,
};

/** "{currency}{price}" */
export const price = formatPrice(complete.price, complete.currency);
export const priceZero = new Intl.NumberFormat('en-IE', { style: 'currency', currency: complete.currency, maximumFractionDigits: 0 }).format(0);
export const founding = foundingOfferActive()
  ? { price: formatPrice(foundingOffer.price, complete.currency), ends: foundingOffer.endsAt ? new Date(foundingOffer.endsAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : null }
  : null;
if (foundingOffer.enabled && foundingOffer.endsAt === null && foundingOffer.seats === null) {
  throw new Error('offer.ts: foundingOffer is enabled without an end date or a seat cap');
}

/** "Tune In, Wave Lab and Spectrum Scope" */
export const listJoin = (items: string[]) =>
  items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
export const freeToolNames = listJoin(freeTools().map((t) => t.name));

/** 10 → "Ten", for counts that open a sentence. */
const words = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];
export const spell = (n: number) => words[n] ?? String(n);
