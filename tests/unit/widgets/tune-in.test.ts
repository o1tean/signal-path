import { expect, test } from 'vitest';
import { FREQS, fmt, newRound, noiseAt } from '@/widgets/tune-in';

test('newRound: 4 distinct choices incl. secret, never repeats last', () => {
  for (let i = 0; i < 500; i++) {
    const last = FREQS[i % FREQS.length];
    const r = newRound(last);
    expect(r.secret).not.toBe(last);
    expect(r.choices).toHaveLength(4);
    expect(new Set(r.choices).size).toBe(4);
    expect(r.choices).toContain(r.secret);
  }
});
test('fmt and noiseAt', () => {
  expect(fmt(433.92)).toBe('433.92');
  expect(fmt(868)).toBe('868');
  for (let k = 0; k < 160; k++) expect(noiseAt(k)).toBeGreaterThanOrEqual(0.25), expect(noiseAt(k)).toBeLessThan(0.85);
});
