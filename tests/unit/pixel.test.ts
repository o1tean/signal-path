import { describe, expect, it } from 'vitest';
import { FONT, SPRITES, ascii, bitmapToAscii, measure, textBitmap } from '@/lib/pixel';

describe('pixel font', () => {
  it('every glyph has 35 cells', () => {
    for (const [ch, g] of Object.entries(FONT)) expect(g, ch).toHaveLength(35);
  });

  it('renders SIGNAL as a 7 x 35 bitmap and 4 lines of half-block ASCII', () => {
    const rows = textBitmap('signal');
    expect(rows).toHaveLength(7);
    expect(rows.every((r) => r.length === measure('SIGNAL'))).toBe(true);
    expect(measure('SIGNAL')).toBe(35);
    // first column of S row 0 is blank, row 1 starts with ink
    expect(rows[0].slice(0, 5)).toBe(FONT.S.slice(0, 5));
    const art = bitmapToAscii(rows);
    const lines = art.split('\n').slice(0, -1);
    expect(lines).toHaveLength(4);
    expect(Math.max(...lines.map((l) => l.length))).toBeLessThanOrEqual(35);
  });

  it('keeps the 17 legacy sprites and the flipper ASCII art', () => {
    expect(Object.keys(SPRITES)).toHaveLength(17);
    expect(ascii('flipper').split('\n')).toHaveLength(9);
  });
});
