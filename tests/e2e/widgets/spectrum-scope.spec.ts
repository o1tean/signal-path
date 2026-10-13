import { expect, test } from '@playwright/test';

const URL = 'http://localhost:4321/dev/widgets/spectrum-scope';
test.use({ baseURL: 'http://localhost:4321' });

test('spectrum-scope shows a peak, hops bands, decays and cleans up', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto(URL);
  const w = page.locator('#full [data-widget="spectrum-scope"]');
  const readout = w.locator('[aria-live="polite"]');
  const band = w.getByLabel('Band');
  await expect(readout).toContainText('Noise floor only');
  const h = (await w.boundingBox())!.height;

  // garage remote is in the default band
  await w.getByRole('button', { name: '433.92 Garage' }).click();
  await expect(readout).toContainText('Receiving 433.92 MHz (Garage). RSSI -49 dBm, strong, close by.');
  expect((await w.boundingBox())!.height).toBe(h);

  // distance changes RSSI and the strength word
  await w.getByLabel('Distance to transmitter').fill('100');
  await expect(readout).toContainText('RSSI -95 dBm, weak, far away.');

  // decays back to noise floor
  await expect(readout).toContainText('Noise floor only', { timeout: 4000 });

  // sensor at 868 hops from mid to high
  await w.getByLabel('Distance to transmitter').fill('50');
  await w.getByRole('button', { name: '868.00 Sensor' }).click();
  await expect(band).toHaveValue('high');
  await expect(readout).toContainText('Receiving 868.00 MHz (Sensor). RSSI -66 dBm, usable.');

  // switching to a band without the signal shows the noise floor
  await band.selectOption('low');
  await expect(readout).toContainText('Noise floor only');

  // keyboard: buttons are reachable and operable
  await w.getByRole('button', { name: '315.00 Fob' }).focus();
  await page.keyboard.press('Enter');
  await expect(readout).toContainText('Receiving 315.00 MHz (Fob)');

  // compact variant is shorter
  const full = (await w.locator('canvas').boundingBox())!.height;
  const compact = (await page.locator('#compact canvas').boundingBox())!.height;
  expect(compact).toBeLessThan(full);

  await page.reload();
  await w.getByRole('button', { name: '433.92 Garage' }).click();
  for (const theme of ['light', 'dark'] as const) {
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
    await w.scrollIntoViewIfNeeded();
    await w.screenshot({ path: `docs/v2/screenshots/widgets/spectrum-scope-${theme}.png` });
  }
  expect(errors).toEqual([]);
});

test('spectrum-scope survives abuse: reduced motion, rapid input, remount, 360px', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto(URL);
  const w = page.locator('#full [data-widget="spectrum-scope"]');
  const readout = w.locator('[aria-live="polite"]');
  const band = w.getByLabel('Band');

  // no horizontal overflow at 360px
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

  // rapid repeated interaction: no errors, last remote wins
  for (let i = 0; i < 21; i++) {
    await w.getByRole('button', { name: ['433.92 Garage', '315.00 Fob', '868.00 Sensor'][i % 3] }).click({ delay: 0 });
  }
  await expect(readout).toContainText('Receiving 868.00 MHz');

  // switching the loop to static must not hop bands when the burst is off-band
  await band.selectOption('low');
  await expect(readout).toContainText('Noise floor only');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(band).toHaveValue('low');

  // static mode: peak stays full, clears after ~1.5s
  await w.getByRole('button', { name: '315.00 Fob' }).click();
  await expect(readout).toContainText('Receiving 315.00 MHz');
  await page.waitForTimeout(500);
  await expect(readout).toContainText('Receiving 315.00 MHz');
  await expect(readout).toContainText('Noise floor only', { timeout: 2000 });

  // theme switch while mounted
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));

  // mount/unmount twice on the same page
  const result = await page.evaluate(async () => {
    // @ts-expect-error runtime URL served by the dev server, not a resolvable module for tsc
    const mod = await import('/src/widgets/spectrum-scope.ts');
    const counts: number[] = [];
    for (let i = 0; i < 2; i++) {
      const host = document.createElement('div');
      document.body.append(host);
      const cleanup = mod.mount(host, {}) as () => void;
      counts.push(host.querySelectorAll('canvas').length);
      cleanup();
      counts.push(host.childElementCount);
      host.remove();
    }
    return counts;
  });
  expect(result).toEqual([1, 0, 1, 0]);
  expect(errors).toEqual([]);
});
