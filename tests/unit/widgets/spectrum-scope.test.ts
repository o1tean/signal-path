import { describe, expect, it } from 'vitest';
import { envelopeAt, needsHop, peakFracFor, rssiFor, strengthWord } from '@/widgets/spectrum-scope';

describe('spectrum-scope helpers', () => {
  it('maps distance to RSSI like the legacy widget', () => {
    expect(rssiFor(0)).toBe(-38);
    expect(rssiFor(20)).toBe(-49);
    expect(rssiFor(100)).toBe(-95);
  });
  it('scales peak height', () => {
    expect(peakFracFor(0)).toBeCloseTo(0.9);
    expect(peakFracFor(100)).toBeCloseTo(0.18);
  });
  it('holds 1100 ms then fades to zero by 1500 ms', () => {
    expect(envelopeAt(0)).toBe(1);
    expect(envelopeAt(1100)).toBe(1);
    expect(envelopeAt(1300)).toBeCloseTo(0.5);
    expect(envelopeAt(1500)).toBe(0);
    expect(envelopeAt(2000)).toBe(0);
  });
  it('words the strength at the legacy thresholds', () => {
    expect(strengthWord(39)).toBe('strong, close by');
    expect(strengthWord(40)).toBe('usable');
    expect(strengthWord(74)).toBe('usable');
    expect(strengthWord(75)).toBe('weak, far away');
  });
  it('hops only when the remote is outside the band', () => {
    expect(needsHop('mid', 433.92)).toBe(false);
    expect(needsHop('mid', 868)).toBe(true);
    expect(needsHop('full', 315)).toBe(false);
    expect(needsHop('low', 300)).toBe(false);
  });
});
