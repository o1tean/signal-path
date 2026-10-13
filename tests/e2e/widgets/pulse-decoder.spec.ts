import { expect, test } from '@playwright/test';

const URL = 'http://localhost:4321/dev/widgets/pulse-decoder';
test.use({ baseURL: 'http://localhost:4321' });

test('pulse-decoder steps a capture into bits and a hex key', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto(URL);
  const w = page.locator('#full [data-widget="pulse-decoder"]');
  const lcd = w.getByRole('status');
  const step = w.getByRole('button', { name: 'Step', exact: true });
  await expect(lcd).toContainText('Bit 0/24  reading...');
  await expect(w.getByRole('button', { name: 'Auto play', exact: true })).toBeVisible(); // label present before any interaction

  // 8C5A3B starts 1000 1100: eight steps give 0x8C
  for (let k = 0; k < 8; k++) await step.click();
  await expect(lcd).toContainText('BIN 1000 1100');
  await expect(lcd).toContainText('HEX 8C');
  const h = (await lcd.boundingBox())!.height;

  // finish by keyboard
  await step.focus();
  for (let k = 0; k < 16; k++) await page.keyboard.press('Enter');
  await expect(lcd).toContainText('DECODED');
  await expect(lcd).toContainText('HEX 8C5A3B');
  await expect(w.getByRole('button', { name: 'Done' })).toBeDisabled();
  expect((await lcd.boundingBox())!.height).toBe(h);

  // switch capture resets, then reset button
  await w.getByRole('button', { name: /Nice FLO/ }).click();
  await expect(lcd).toContainText('Bit 0/12');
  await w.getByRole('button', { name: 'Auto play', exact: true }).click();
  await expect(lcd).toContainText('Bit 12/12  DECODED', { timeout: 12000 });
  await expect(lcd).toContainText('HEX 5C3');
  await w.getByRole('button', { name: 'Reset' }).click();
  await expect(lcd).toContainText('Bit 0/12');

  await expect(page.locator('#compact [data-widget="pulse-decoder"]')).toContainText('Pulse decoder');
  await expect(page.locator('#compact')).not.toContainText('The rule (OOK');

  for (const theme of ['light', 'dark'] as const) {
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
    await w.scrollIntoViewIfNeeded();
    await w.screenshot({ path: `docs/v2/screenshots/widgets/pulse-decoder-${theme}.png` });
  }
  expect(errors).toEqual([]);
});

const full = (page: import('@playwright/test').Page) => page.locator('#full [data-widget="pulse-decoder"]');

test('pulse-decoder survives hammering, theme switches and remounts', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(URL);
  const w = full(page);
  const lcd = w.getByRole('status');
  await expect(lcd).toContainText('Bit 0/24');

  // rapid auto/pause toggling must never leave two intervals running: 3 ticks max in ~2.1 s
  const auto = w.getByRole('button', { name: /Auto play|Pause/ });
  for (let k = 0; k < 10; k++) await auto.dispatchEvent('click');
  await page.waitForTimeout(2200);
  const n = Number(/Bit (\d+)\//.exec((await lcd.textContent())!)![1]);
  expect(n).toBeLessThanOrEqual(4);
  if (await w.getByRole('button', { name: 'Pause' }).count()) await w.getByRole('button', { name: 'Pause' }).click();

  // Step during auto play stops it; switching capture mid-play resets
  await w.getByRole('button', { name: 'Reset' }).click();
  await w.getByRole('button', { name: 'Auto play', exact: true }).click();
  await w.getByRole('button', { name: 'Step', exact: true }).click();
  await expect(w.getByRole('button', { name: 'Auto play', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await w.getByRole('button', { name: 'Auto play', exact: true }).click();
  await w.getByRole('button', { name: /Nice FLO/ }).click();
  await expect(lcd).toContainText('Bit 0/12');
  await page.waitForTimeout(1000);
  await expect(lcd).toContainText('Bit 0/12'); // timer was stopped by the switch

  // keyboard only: Tab reaches every control, Space activates
  await w.getByRole('button', { name: /Garage/ }).focus();
  await page.keyboard.press('Space');
  await page.keyboard.press('Tab'); // Nice FLO
  await page.keyboard.press('Tab'); // Step
  await page.keyboard.press('Space');
  await expect(lcd).toContainText('Bit 1/24');
  await page.keyboard.press('Tab'); // Auto
  await page.keyboard.press('Tab'); // Reset
  await page.keyboard.press('Enter');
  await expect(lcd).toContainText('Bit 0/24');

  // theme switch while mounted redraws without errors
  for (const t of ['dark', 'light', 'dark']) await page.evaluate((v) => document.documentElement.setAttribute('data-theme', v), t);

  // mount/unmount twice on the same host: no duplicates, no leaked timer or listeners
  const res = await page.evaluate(async () => {
    const { mount } = await import(/* @vite-ignore */ '/src/widgets/' + 'pulse-decoder.ts');
    const host = document.createElement('div');
    document.body.append(host);
    const out: string[] = [];
    for (let k = 0; k < 2; k++) {
      const off = mount(host, {});
      host.querySelectorAll<HTMLButtonElement>('button').forEach((b) => b.textContent === 'Auto play' && b.click());
      off();
      out.push(`${host.children.length}|${host.className}`);
    }
    const off = mount(host, {});
    out.push(String(host.querySelectorAll('canvas').length));
    off();
    return out;
  });
  expect(res).toEqual(['0|', '0|', '1']);
  await page.waitForTimeout(1500); // a leaked interval would throw or mutate a detached node
  expect(errors).toEqual([]);
});

test('pulse-decoder disables auto play under reduced motion and fits 360px', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(URL);
  const w = full(page);
  await expect(w.getByRole('button', { name: 'Auto play', exact: true })).toBeDisabled();
  await w.getByRole('button', { name: 'Step', exact: true }).click();
  await expect(w.getByRole('status')).toContainText('Bit 1/24');
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(over).toBeLessThanOrEqual(0);
  const box = (await w.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(360);
  // every control is at least 44px tall
  for (const b of await w.getByRole('button').all()) expect((await b.boundingBox())!.height).toBeGreaterThanOrEqual(43.5);
});
