import { expect, test } from '@playwright/test';

const URL = 'http://localhost:4321/dev/widgets/flipper-sim';
test.use({ baseURL: 'http://localhost:4321' });

test('flipper-sim walks the Sub-GHz menu by D-pad and keyboard', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto(URL);
  const w = page.locator('#full [data-widget="flipper-sim"]');
  const lcd = w.getByRole('group', { name: /Simulated Flipper screen/ });
  const status = w.locator('[aria-live="polite"]');
  await expect(lcd).toContainText('» Read');
  await expect(w).toContainText('Flipper ▸ Sub-GHz');

  // D-pad: down twice, OK opens Frequency Analyzer
  await w.getByRole('button', { name: 'Down' }).click({ clickCount: 1 });
  await w.getByRole('button', { name: 'Down' }).click();
  await expect(lcd).toContainText('» Frequency Analyzer');
  await w.getByRole('button', { name: 'Select or open' }).click();
  await expect(lcd).toContainText('433.920 MHz');
  await expect(lcd).toContainText('-64 dBm');
  await expect(status).toContainText('Freq Analyzer');

  // Back, then up to root with Back again
  const backBtn = w.getByRole('button', { name: /^Back/ });
  await backBtn.click();
  await expect(lcd).toContainText('» Frequency Analyzer');
  await backBtn.click();
  await expect(lcd).toContainText('» Sub-GHz');
  await expect(backBtn).toBeDisabled();

  // Keyboard: focus the screen, arrows + Enter + Backspace
  await lcd.focus();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(lcd).toContainText('125 kHz RFID');
  await expect(lcd).toContainText('only walks the');
  await page.keyboard.press('Backspace');
  await expect(lcd).toContainText('» 125 kHz RFID');
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('Enter');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(lcd).toContainText('» Doorbell_front');

  // No layout shift between screens
  const h1 = (await lcd.boundingBox())!.height;
  await page.keyboard.press('Enter');
  await expect(lcd).toContainText('Princeton');
  expect((await lcd.boundingBox())!.height).toBe(h1);

  // Compact variant mounts too
  await expect(page.locator('#compact [data-widget="flipper-sim"]').getByRole('group')).toContainText('» Read');

  for (const theme of ['light', 'dark'] as const) {
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
    await w.scrollIntoViewIfNeeded();
    await w.screenshot({ path: `docs/v2/screenshots/widgets/flipper-sim-${theme}.png` });
  }
  expect(errors).toEqual([]);
});

test('flipper-sim survives rapid input, theme switch, remount, reduced motion and 360px', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto(URL, { waitUntil: 'networkidle' }); // cold dev server can re-render after dep optimize
  const w = page.locator('#full [data-widget="flipper-sim"]');
  const lcd = w.getByRole('group', { name: /Simulated Flipper screen/ });
  await expect(lcd).toContainText('» Read');

  // rapid keyboard: clamps at both ends, never throws
  await lcd.focus();
  await page.keyboard.press('ArrowDown', { delay: 0 });
  for (let i = 0; i < 30; i++) await page.keyboard.press('ArrowDown');
  await expect(lcd).toContainText('» Saved');
  for (let i = 0; i < 30; i++) await page.keyboard.press('ArrowUp');
  await expect(lcd).toContainText('» Read');
  for (let i = 0; i < 10; i++) await page.keyboard.press('Backspace');
  await expect(lcd).toContainText('» Sub-GHz');
  await expect(w.getByRole('button', { name: /^Back/ })).toBeDisabled();

  // longest leaf (Add Manually) is not clipped at 360px
  await page.keyboard.press('Enter');
  for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(lcd).toContainText('Nice FLO, CAME');
  const clipped = await lcd.evaluate((e) => e.scrollHeight > e.clientHeight + 1);
  expect(clipped).toBe(false);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  // rapid double-clicks on OK/Back keep the stack consistent
  const ok = w.getByRole('button', { name: 'Select or open' });
  await w.getByRole('button', { name: /^Back/ }).dblclick();
  await ok.dblclick();
  await expect(lcd).toBeVisible();

  // theme switch while mounted keeps state
  const before = await lcd.innerText();
  for (const t of ['dark', 'light', 'dark']) await page.evaluate((x) => document.documentElement.setAttribute('data-theme', x), t);
  expect(await lcd.innerText()).toBe(before);

  // mount / cleanup / mount twice: one listener, no duplicates
  const result = await page.evaluate(async () => {
    const path = '/src/widgets/flipper-sim.ts';
    const mod = await import(/* @vite-ignore */ path);
    const host = document.createElement('div');
    document.body.append(host);
    const out: string[] = [];
    for (let round = 0; round < 2; round++) {
      const cleanup = mod.mount(host, {});
      const l = host.querySelector('[role="group"]') as HTMLElement;
      l.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      out.push(l.textContent!.includes('» Read RAW') ? 'one-step' : 'wrong:' + l.textContent);
      cleanup();
      out.push(host.childElementCount === 0 ? 'empty' : 'leak');
      host.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    }
    host.remove();
    return out;
  });
  expect(result).toEqual(['one-step', 'empty', 'one-step', 'empty']);
  expect(errors).toEqual([]);
});

test('flipper-sim compact: longest leaf not clipped at 360px', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto(URL, { waitUntil: 'networkidle' });
  const lcd = page.locator('#compact [data-widget="flipper-sim"]').getByRole('group', { name: /Simulated Flipper screen/ });
  await lcd.focus();
  for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(lcd).toContainText('Nice FLO, CAME');
  expect(await lcd.evaluate((e) => e.scrollHeight > e.clientHeight + 1)).toBe(false);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
