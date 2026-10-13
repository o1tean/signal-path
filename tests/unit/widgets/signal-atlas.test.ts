import { describe, expect, it } from 'vitest';
import { SAMPLES, csvCell, newSamples, toCSV, toJSON, validFreq } from '@/widgets/signal-atlas';

describe('signal-atlas helpers', () => {
  it('guards CSV formula injection and quotes per RFC 4180', () => {
    expect(csvCell('=SUM(A1)')).toBe("'=SUM(A1)");
    expect(csvCell('-1')).toBe("'-1");
    expect(csvCell('a,"b"')).toBe('"a,""b"""');
    expect(csvCell('=x,y')).toBe(`"'=x,y"`);
    expect(csvCell(null)).toBe('');
  });
  it('exports columns in a fixed order and drops extras', () => {
    expect(toCSV([SAMPLES[0]]).split('\n')[0]).toBe('name,category,frequency,modulation,protocol,codeType,notes');
    expect(Object.keys(JSON.parse(toJSON([SAMPLES[0]]))[0])).not.toContain('sample');
  });
  it('validates frequency loosely', () => {
    expect(validFreq('')).toBe(true);
    expect(validFreq('433.92 MHz')).toBe(true);
    expect(validFreq('abc')).toBe(false);
  });
  it('adds only missing samples', () => {
    expect(newSamples([])).toHaveLength(4);
    expect(newSamples([{ ...SAMPLES[0] }])).toHaveLength(3);
    expect(newSamples([{ ...SAMPLES[0], sample: undefined }])).toHaveLength(4);
  });
});
