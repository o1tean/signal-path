import { describe, expect, it } from 'vitest';
import { SAMPLES, bitsHex, groupBits, hexToBits } from '@/widgets/pulse-decoder';

describe('pulse-decoder helpers', () => {
  it('round-trips every sample key and matches the legacy bit counts', () => {
    expect(SAMPLES.map((s) => s.bits.length)).toEqual([24, 12]);
    for (const s of SAMPLES) expect(bitsHex(s.bits)).toBe(s.hex);
    expect(SAMPLES[0].bits.join('')).toBe('100011000101101000111011');
    expect(SAMPLES[1].bits.join('')).toBe('010111000011');
  });
  it('pads hex to ceil(n/4) digits and handles empty input', () => {
    expect(bitsHex([])).toBe('');
    expect(bitsHex([0, 0, 0, 1, 0, 1])).toBe('05');
    expect(hexToBits('5', 4)).toEqual([0, 1, 0, 1]);
  });
  it('groups bits in fours', () => {
    expect(groupBits([1, 0, 0, 0, 1, 1])).toBe('1000 11');
    expect(groupBits([])).toBe('');
  });
});
