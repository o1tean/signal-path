/* 1-bit pixel art in the spirit of the device's 128x64 orange LCD. Ported from legacy SP.pixel
   (legacy/assets/js/presentation.js). Glyph table and sprites are copied byte for byte. */

/** Minimal canvas surface the renderer needs (CanvasRenderingContext2D satisfies it). */
export interface PixelSurface {
  fillStyle: string | CanvasGradient | CanvasPattern;
  fillRect(x: number, y: number, w: number, h: number): void;
}

export const LCD_W = 128;
export const LCD_H = 64;
/* same values as the --lcd-bg / --lcd-ink tokens; the LCD is an image, so it keeps fixed colours */
export const LCD_BG = '#f6a03a';
export const LCD_INK = '#1b1509';

/** 5x7 font: character -> 35 cells, row-major, '#' = ink. */
export const FONT: Readonly<Record<string, string>> = Object.fromEntries(
  (
    "0 .###.#...##..###.#.###..##...#.###.|1 ..#...##....#....#....#....#...###.|" +
    "2 .###.#...#....#...#...#...#...#####|3 #####...#...#.....#.....##...#.###.|" +
    "4 ...#...##..#.#.#..#.#####...#....#.|5 ######....####.....#....##...#.###.|" +
    "6 ..##..#...#....####.#...##...#.###.|7 #####....#...#...#...#....#....#...|" +
    "8 .###.#...##...#.###.#...##...#.###.|9 .###.#...##...#.####....#...#..##..|" +
    "A .###.#...##...#######...##...##...#|B ####.#...##...#####.#...##...#####.|" +
    "C .###.#...##....#....#....#...#.###.|D ###..#..#.#...##...##...##..#.###..|" +
    "E ######....#....####.#....#....#####|F ######....#....####.#....#....#....|" +
    "G .###.#...##....#.####...##...#.####|H #...##...##...#######...##...##...#|" +
    "I .###...#....#....#....#....#...###.|J ..###...#....#....#....#.#..#..##..|" +
    "K #...##..#.#.#..##...#.#..#..#.#...#|L #....#....#....#....#....#....#####|" +
    "M #...###.###.#.##.#.##...##...##...#|N #...##...###..##.#.##..###...##...#|" +
    "O .###.#...##...##...##...##...#.###.|P ####.#...##...#####.#....#....#....|" +
    "Q .###.#...##...##...##.#.##..#..##.#|R ####.#...##...#####.#.#..#..#.#...#|" +
    "S .#####....#.....###.....#....#####.|T #####..#....#....#....#....#....#..|" +
    "U #...##...##...##...##...##...#.###.|V #...##...##...##...##...#.#.#...#..|" +
    "W #...##...##...##.#.##.#.###.###...#|X #...##...#.#.#...#...#.#.#...##...#|" +
    "Y #...##...#.#.#...#....#....#....#..|Z #####....#...#...#...#...#....#####|" +
    ". ..........................##...##..|: ......##...##........##...##.......|" +
    "- ...............#####...............|/ ....#....#...#...#...#...#....#....|" +
    "% ##..###..#...#...#...#...#..###..##|+ .......#....#..#####..#....#.......|" +
    "< ...#...#...#...#.....#.....#.....#.|> .#.....#.....#.....#...#...#...#...|" +
    "' .##...##....#......................|, .....................##...##....#..|" +
    "! ..#....#....#....#....#.........#..|? .###.#...#....#...#...#.........#..|" +
    "= ..........#####.....#####..........|( ...#...#...#....#....#.....#.....#.|" +
    ") .#.....#.....#....#....#...#...#...|* .....#.#.#.###.#####.###.#.#.#....."
  )
    .split('|')
    .map((g) => [g.charAt(0), g.slice(2, 37)]),
);

const SPRITE_SRC = {
    logo: "....######..|...#......#.|..#........#|..#.........|...##.......|.....##.....|.......##...|.........#..|..........#.|#.........#.|.#.......#..|..##...##...|....###.....",
    antenna: ".......#.......|......###......|.....#.#.#.....|....#..#..#....|...#...#...#...|.......#.......|.......#.......|.......#.......|.......#.......|.......#.......|......###......|.....#.#.#.....|....#..#..#....|...#...#...#...|..###########..",
    wave: "..###.......###.|.#...#.....#...#|#.....#...#.....|.......#.#......|........#.......",
    pulses: ".####....##..###|.#..#....##..#..|.#..#....##..#..|.#..#....##..#..|##..######..##..",
    key: "...###...|..#...#..|..#.#.#..|..#...#..|...#.#...|...#.#...|...#.#...|...#.##..|...#.#...|...#.##..|...#.#...|...###...",
    tag: "....#####....|..##.....##..|.#.........#.|#....###....#|#...#...#...#|#...#...#...#|#....###....#|.#.........#.|..##.....##..|....#####....|.....#.#.....|.....#.#.....|.....###.....",
    card: ".##############.|#..............#|#.####.........#|#.#..#....###..#|#.####...#...#.#|#........#.#.#.#|#........#...#.#|#.........###..#|#..............#|.##############.",
    chip: "..#.#.#.#.#..|.###########.|#.#.......#.#|.#..#####..#.|#.#.#...#.#.#|.#..#...#..#.|#.#.#...#.#.#|.#..#####..#.|#.#.......#.#|.###########.|..#.#.#.#.#..",
    ir: ".###.....#....|#...#...#....#|#...#..#....#.|#...#.........|#...#..#....#.|#...#...#....#|.###.....#....|.#.#..........|.#.#..........",
    pins: "#################|#.#.#.#.#.#.#.#.#|#################|.#.#.#.#.#.#.#.#.|.#.#.#.#.#.#.#.#.",
    usb: "....##....|...#..#...|...#..#...|...#..#...|.########.|.#......#.|.#.####.#.|.#.#..#.#.|.#.####.#.|.#......#.|.########.|....##....|....##....",
    lock: "...#####...|..#.....#..|..#.....#..|..#.....#..|.#########.|.#.......#.|.#...#...#.|.#..###..#.|.#...#...#.|.#.......#.|.#########.",
    flag: "#.........|######....|#.....###.|#........#|#.....###.|######....|#.........|#.........|#.........|###.......",
    ibutton: "....#####....|..##.....##..|.#..#####..#.|#..#.....#..#|#.#.......#.#|#.#.......#.#|#.#.......#.#|#..#.....#..#|.#..#####..#.|..##.....##..|....#####....",
    tool: ".........##.|........#..#|........#..#|.......#####|......#.....|.....#......|....#.......|...#........|.##.........|#..#........|#..#........|.##.........",
    wifi: "....#####....|..##.....##..|.#..#####..#.|#..#.....#..#|..#..###..#..|.....#.#.....|......#......",
    flipper:
      "......#############################|.....#............................#|....#..##########.....######......#|...#...#........#....#..#...#.....#|..#....#........#...#.#####.#.###.#|.#.....#........#...#.#...#.#.#.#.#|#......#........#...#.#####.#.###.#|#......#........#....#..#...#.....#|#......##########.....######......#|.#................................#|..#...............................#|...#..............................#|....#.............................#|.....#............................#|......#############################",
};

export type SpriteName = keyof typeof SPRITE_SRC;
export const SPRITES = Object.fromEntries(
  Object.entries(SPRITE_SRC).map(([k, v]) => [k, v.split('|')]),
) as Record<SpriteName, string[]>;

export interface LcdSpec {
  title?: string;
  icon?: SpriteName;
  big?: string;
  unit?: string;
  lines?: string[];
  anim?: 'scan' | 'bars';
  foot?: string;
  right?: string;
}

export const MODES = {
  subghz: { title: 'SUB-GHZ', icon: 'antenna', big: '433.92', unit: 'MHz', lines: ['AM650  READ'], anim: 'scan', foot: 'SCANNING', right: 'OK >' },
  nfc: { title: 'NFC', icon: 'card', big: '13.56', unit: 'MHz', lines: ['ISO 14443-A'], anim: 'scan', foot: 'READING', right: 'OK >' },
  wifi: { title: 'WIFI', icon: 'wifi', big: '2.4', unit: 'GHz', lines: ['ESP32-S2  CH 6'], anim: 'bars', foot: 'SCANNING', right: 'OK >' },
} as const satisfies Record<string, LcdSpec>;

/** Module id -> header icon. */
export const ICONS: Readonly<Record<string, SpriteName>> = {
  m00: 'logo', m01: 'antenna', m02: 'wave', m03: 'pulses', m04: 'antenna', m05: 'key', m06: 'tag', m07: 'card',
  m08: 'chip', m09: 'tool', m10: 'flag', m11: 'ir', m12: 'pins', m13: 'usb', m14: 'ibutton', m15: 'chip',
  m16: 'lock', m17: 'flag', m18: 'wifi',
};

/** Draw text with the current fillStyle. Uppercases; unknown characters advance the cursor. Returns the end x. */
export function text(ctx: PixelSurface, str: string, x: number, y: number, s = 1): number {
  for (const ch of String(str).toUpperCase()) {
    const g = FONT[ch];
    if (g) for (let i = 0; i < 35; i++) if (g.charAt(i) === '#') ctx.fillRect(x + (i % 5) * s, y + Math.floor(i / 5) * s, s, s);
    x += 6 * s;
  }
  return x;
}

export function sprite(ctx: PixelSurface, name: SpriteName, x: number, y: number, s = 1) {
  (SPRITES[name] ?? []).forEach((row, j) => {
    for (let i = 0; i < row.length; i++) if (row.charAt(i) === '#') ctx.fillRect(x + i * s, y + j * s, s, s);
  });
}

export function arc(ctx: PixelSurface, cx: number, cy: number, r: number, a0: number, a1: number) {
  for (let a = a0; a <= a1; a += 0.5 / r) ctx.fillRect(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), 1, 1);
}

/** Word-wrap uppercase text to a character width. */
export function wrap(str: string, width: number): string[] {
  const out: string[] = [];
  let line = '';
  for (const w of String(str).toUpperCase().split(/\s+/)) {
    if ((line + ' ' + w).trim().length > width && line) {
      out.push(line);
      line = w;
    } else line = (line + ' ' + w).trim();
  }
  if (line) out.push(line);
  return out;
}

export const measure = (str: string) => String(str).length * 6 - 1;

/** Draw one 128x64 LCD frame. t in seconds; animation runs at 3 fps. */
export function lcd(ctx: PixelSurface, spec: LcdSpec, t = 0) {
  const f = Math.floor(t * 3);
  ctx.fillStyle = LCD_BG;
  ctx.fillRect(0, 0, LCD_W, LCD_H);
  ctx.fillStyle = LCD_INK;
  text(ctx, spec.title ?? '', 2, 1);
  ctx.fillRect(112, 1, 13, 7);
  ctx.fillRect(125, 3, 1, 3); /* battery */
  ctx.fillStyle = LCD_BG;
  ctx.fillRect(113, 2, 11, 5);
  ctx.fillStyle = LCD_INK;
  ctx.fillRect(114, 3, 8, 3);
  ctx.fillRect(0, 9, 128, 1);
  const icon = spec.icon ?? 'logo';
  const rows = SPRITES[icon] ?? [];
  const ih = rows.length;
  const iw = (rows[0] ?? '').length;
  sprite(ctx, icon, 15 - Math.floor(iw / 2), 30 - Math.floor(ih / 2));
  for (let k = 0; k < 3; k++)
    if ((f + k) % 3 !== 2 || spec.anim === 'bars') {
      if (spec.anim === 'bars') {
        if (k <= f % 4) ctx.fillRect(28 + k * 3, 34 - k * 3, 2, 3 + k * 3);
      } else arc(ctx, 15 + iw / 2, 30, 4 + k * 3, -0.9, 0.9);
    }
  if (spec.big) {
    const x = text(ctx, spec.big, 38, 15, 2);
    text(ctx, spec.unit ?? '', x + 2, 22);
  }
  (spec.lines ?? []).forEach((l, i) => text(ctx, l, 38, (spec.big ? 34 : 17) + i * 9));
  ctx.fillRect(0, 54, 128, 10);
  ctx.fillStyle = LCD_BG;
  text(ctx, (spec.foot ?? '') + (spec.anim ? '...'.slice(0, f % 4) : ''), 3, 56);
  text(ctx, spec.right ?? '', 128 - 3 - 6 * (spec.right ?? '').length, 56);
  ctx.fillStyle = LCD_INK;
}

/** Rows of '#'/'.' to half-block Unicode (two pixel rows per text line), trailing spaces trimmed. */
export function bitmapToAscii(rows: readonly string[]): string {
  let out = '';
  const width = (rows[0] ?? '').length; // legacy: first-row width
  for (let y = 0; y < rows.length; y += 2) {
    let line = '';
    for (let x = 0; x < width; x++) {
      const a = rows[y].charAt(x) === '#';
      const b = rows[y + 1]?.charAt(x) === '#';
      line += a && b ? '\u2588' : a ? '\u2580' : b ? '\u2584' : ' ';
    }
    out += line.replace(/\s+$/, '') + '\n';
  }
  return out;
}

/** Text as a bitmap: 7 rows, measure(str) columns. */
export function textBitmap(str: string): string[] {
  const w = Math.max(0, measure(str));
  const grid = Array.from({ length: 7 }, () => Array<string>(w).fill('.'));
  text({ fillStyle: '', fillRect: (x, y) => { if (x < w) grid[y][x] = '#'; } }, str, 0, 0);
  return grid.map((r) => r.join(''));
}

/** Sprite as half-block ASCII art (legacy SP.pixel.ascii). */
export const ascii = (name: SpriteName) => bitmapToAscii(SPRITES[name] ?? []);
