import { describe, expect, it } from 'vitest';
import { MAX_BITS, describeBits, sanitizeBits } from '@/widgets/wave-lab';
import { foundingOfferActive } from '@/data/offer';

describe('wave-lab', () => {
  it('keeps only 0/1 and caps at 16 bits', () => {
    expect(sanitizeBits('10a1 2 0')).toBe('1010');
    expect(sanitizeBits('1'.repeat(40))).toHaveLength(MAX_BITS);
  });
  it('describes OOK and FSK runs with correct plurals', () => {
    expect(describeBits('', 'OOK')).toBe('Waiting for bits.');
    expect(describeBits('10', 'OOK')).toBe('2 bits, OOK. The carrier is on for 1 one-bit and silent for 1 zero.');
    expect(describeBits('110', 'FSK')).toContain('between 2 high and 1 low bits');
  });
});

describe('founding offer', () => {
  const base = { enabled: true, endsAt: '2026-11-01T00:00:00Z', seats: 10, price: 99 };
  it('is off unless enabled, before its end date and with seats left', () => {
    const now = new Date('2026-10-12T00:00:00Z');
    expect(foundingOfferActive(now, base)).toBe(true);
    expect(foundingOfferActive(now, { ...base, enabled: false })).toBe(false);
    expect(foundingOfferActive(new Date('2026-11-02T00:00:00Z'), base)).toBe(false);
    expect(foundingOfferActive(now, { ...base, seats: 0 })).toBe(false);
  });
});
