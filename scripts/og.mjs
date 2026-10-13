// Renders public/og.png (1200×630) from an HTML template with Playwright.
// Usage: node scripts/og.mjs   (falls back to writing public/og.svg if no browser can launch)
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(import.meta.dirname, '..');
const font = pathToFileURL(join(root, 'node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2')).href;
const device = `data:image/svg+xml;base64,${readFileSync(join(root, 'public/images/device.svg')).toString('base64')}`;
const logo = `data:image/png;base64,${readFileSync(join(root, 'public/images/signal-path-logo.png')).toString('base64')}`;

// counts mirror src/components/marketing/site.ts (19 lessons, 10 tools, 116 questions); edit here if they change
const facts = ['19 lessons', '12 weeks', '10 browser tools', 'Modules 0 and 1 free'];

const rings = [140, 220, 300, 380, 460]
  .map((r, i) => `<circle cx="600" cy="600" r="${r}" stroke="#ff8a42" stroke-opacity="${0.34 - i * 0.06}" fill="none"/>`)
  .join('');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Inter; src: url(${font}) format('woff2'); font-weight: 100 900; }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; overflow: hidden; background: #0d1119; color: #f5f5f7; font-family: Inter, sans-serif; position: relative; }
.rings { position: absolute; right: -300px; bottom: -330px; width: 1200px; height: 1200px; }
.device { position: absolute; right: -30px; bottom: 150px; width: 540px; }
.copy { position: absolute; left: 72px; top: 64px; width: 600px; }
.brand { display: flex; align-items: center; gap: 14px; font-size: 26px; font-weight: 600; letter-spacing: -0.01em; }
.brand img { width: 44px; height: 44px; }
h1 { margin-top: 64px; font-size: 64px; line-height: 1.04; font-weight: 650; letter-spacing: -0.035em; }
p { margin-top: 26px; font-size: 26px; line-height: 1.35; color: #aab4c8; }
.facts { position: absolute; left: 72px; bottom: 60px; display: flex; gap: 12px; }
.facts span { border: 1px solid #2c3446; border-radius: 999px; padding: 10px 18px; font-size: 20px; color: #d6dbe6; }
.facts span:last-child { border-color: #ff8a42; color: #ffab73; }
</style></head><body>
<svg class="rings" viewBox="0 0 1200 1200">${rings}</svg>
<img class="device" src="${device}" alt="">
<div class="copy">
  <div class="brand"><img src="${logo}" alt="">Signal Path</div>
  <h1>Explain what your Flipper Zero just captured.</h1>
  <p>A 12-week Flipper Zero course.</p>
</div>
<div class="facts">${facts.map((f) => `<span>${f}</span>`).join('')}</div>
</body></html>`;

const out = join(root, 'public/og.png');
try {
  const { chromium } = await import('playwright');
  let browser;
  try {
    browser = await chromium.launch();
  } catch {
    browser = await chromium.launch({ channel: 'chromium' });
  }
  const dir = mkdtempSync(join(tmpdir(), 'sp-og-'));
  const file = join(dir, 'og.html');
  writeFileSync(file, html);
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(file).href);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: out, type: 'png' });
  await browser.close();
  console.log(`wrote ${out}`);
} catch (e) {
  // fallback: a static SVG card (no device art, no web font)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#0d1119"/><g transform="translate(300 270)">${rings}</g><text x="72" y="120" fill="#f5f5f7" font-family="sans-serif" font-size="28" font-weight="600">Signal Path</text><text x="72" y="250" fill="#f5f5f7" font-family="sans-serif" font-size="60" font-weight="700">Explain what your Flipper Zero</text><text x="72" y="320" fill="#f5f5f7" font-family="sans-serif" font-size="60" font-weight="700">just captured.</text><text x="72" y="540" fill="#aab4c8" font-family="sans-serif" font-size="26">${facts.join(' · ')}</text></svg>`;
  writeFileSync(join(root, 'public/og.svg'), svg);
  console.error(`Playwright failed (${e instanceof Error ? e.message.split('\n')[0] : e}); wrote public/og.svg instead`);
  process.exitCode = 1;
}
