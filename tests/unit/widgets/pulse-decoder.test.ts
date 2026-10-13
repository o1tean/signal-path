import { describe, expect, it } from 'vitest';
import { SAMPLES, bitsHex, groupBits, hexToBits } from '@/widgets/pulse-decoder';

describe('pulse-decoder helpers', () => {
  it('matches the legacy sample bits', () => {
    expect(hexToBits('8C5A3B', 24).join('')).toBe('100011000101101000111011');
    expect(hexToBits('5C3', 12).join('')).toBe('010111000011');
  });
  it('round-trips every sample through bitsHex', () => {
    for (const s of SAMPLES) expect(bitsHex(s.bits)).toBe(s.hex.padStart(Math.ceil(s.bits.length / 4), '0'));
  });
  it('pads partial keys and handles empty', () => {
    expect(bitsHex([])).toBe('');
    expect(bitsHex([1, 0, 0, 0, 1, 1, 0, 0])).toBe('8C');
    expect(bitsHex([1])).toBe('1');
  });
  it('groups bits in fours', () => {
    expect(groupBits([1, 0, 0, 0, 1, 1])).toBe('1000 11');
    expect(groupBits([])).toBe('');
  });
});
