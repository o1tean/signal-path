/* Single source for pricing copy. From docs/v2/offer.md.
   Prices marked [decide] are owner placeholders: confirm before launch. Stripe price ids come from env, never from here. */

export type ProductId = 'course-complete' | 'mentored-path';
export type Currency = 'EUR';

export interface Tier {
  key: 'starter' | 'complete' | 'mentored';
  /** null for the free tier, which is not a purchasable product */
  productId: ProductId | null;
  name: string;
  /** whole currency units; 0 = free */
  price: number;
  currency: Currency;
  /** false = hidden from pricing and checkout */
  available: boolean;
  highlighted: boolean;
  cta: { label: string; href: string };
}

export interface Bonus {
  name: string;
  solves: string;
  /** value anchor in whole euros, believable, never inflated */
  value: number;
}

export interface FoundingOffer {
  enabled: boolean;
  /** ISO date-time; the offer hides itself after this */
  endsAt: string | null;
  seats: number | null;
  price: number;
}

export const product = {
  name: 'Signal Path Complete',
  subtitle: 'The 12-week Flipper Zero course, from first setup to your own authorised experiments.',
} as const;

export const tiers: readonly Tier[] = [
  {
    key: 'starter',
    productId: null,
    name: 'Signal Path Starter',
    price: 0,
    currency: 'EUR',
    available: true,
    highlighted: false,
    cta: { label: 'Start the free starter', href: '/learn/00-setup' },
  },
  {
    key: 'complete',
    productId: 'course-complete',
    name: 'Signal Path Complete',
    price: 149, // [decide]
    currency: 'EUR',
    available: true,
    highlighted: true,
    cta: { label: 'Get Signal Path Complete', href: '/pricing#buy' },
  },
  {
    key: 'mentored',
    productId: 'mentored-path',
    name: 'Signal Path Mentored',
    price: 699, // [decide]
    currency: 'EUR',
    available: false,
    highlighted: false,
    cta: { label: 'Ask about Mentored', href: '/pricing#mentored' },
  },
];

export const bonuses: readonly Bonus[] = [
  // copy: docs/v2/copy/pricing.md bonus-stack. The cheat sheet is free with any account, so it is not priced here.
  // {tools} and {questions} are filled from the counted facts in components/marketing/site.ts, so they cannot go stale.
  { name: '{tools} interactive tools', solves: 'Seven of them open only in Complete. They show what the radio is doing, using synthetic signals.', value: 49 },
  { name: '{questions}-question bank with explanations', solves: 'Take it a week after a lesson to find out what stuck.', value: 19 },
  { name: 'Field Troubleshooting Trees', solves: 'Printable decision trees that start from the symptom: nothing decodes, replay does nothing, or range is poor.', value: 19 },
  { name: 'Lab Notebook System', solves: 'Templates, an evidence rubric and a review schedule. A lab you logged in week 2 still makes sense in week 12.', value: 19 },
  { name: 'Lab Companion app source and build guide', solves: 'A working Flipper app in C and the uFBT steps to build it.', value: 29 },
  { name: 'Wi-Fi Devboard lesson and recovery worksheet', solves: 'If a flash leaves the board unresponsive, the worksheet takes it back to a known firmware.', value: 39 },
  { name: 'Permission & Scope Checklist', solves: 'The Romanian lab guide is free to read. This is the fillable version you complete before each hardware session.', value: 19 },
];

export const bonusTotal = bonuses.reduce((sum, b) => sum + b.value, 0);

export const guarantees = {
  unconditional: {
    title: '30-day refund',
    body: 'Ask within 30 days of purchase, from your account page or by email, and you get your money back. You do not need to give a reason.',
  },
  stageOne: {
    title: 'The Stage 1 promise',
    body: 'Finish the Stage 1 labs and write your notebook entries. If you still cannot explain your own first capture, email us the entries. You get a refund and you keep the notebook templates.',
  },
} as const;

export const foundingOffer: FoundingOffer = {
  enabled: false,
  endsAt: null,
  seats: null,
  price: 99, // [decide]
};

/** Founding price is shown only while it is enabled and its end date has not passed. */
export function foundingOfferActive(now: Date = new Date(), offer: FoundingOffer = foundingOffer): boolean {
  if (!offer.enabled) return false;
  if (offer.endsAt && now >= new Date(offer.endsAt)) return false;
  if (offer.seats !== null && offer.seats <= 0) return false;
  return true;
}

export const formatPrice = (amount: number, currency: Currency = 'EUR') =>
  amount === 0
    ? 'Free'
    : new Intl.NumberFormat('en-IE', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);

export const visibleTiers = () => tiers.filter((t) => t.available);
export const tierByProduct = (id: ProductId) => tiers.find((t) => t.productId === id);
