import { expect, test } from '@playwright/test';

const URL = 'http://localhost:4321/dev/widgets/rf-calc';
test.use({ baseURL: 'http://localhost:4321' });

test('rf-calc computes wavelength and converts power', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto(URL);
  const w = page.locator('#full [data-widget="rf-calc"]');
  const freq = w.getByLabel('Frequency (MHz)');
  const a = w.getByLabel('Wavelength and antenna length');
  await expect(a).toContainText('69.09 cm');
  await expect(a).toContainText('17.27 cm');
  await expect(a).toContainText('34.54 cm');
  await expect(a).toContainText('299,792,458 ÷ 433,920,000 Hz');
  const h = (await a.boundingBox())!.height;

  await freq.fill('2400');
  await expect(a).toContainText('12.49 cm');
  await expect(a).toContainText('3.12 cm');
  await freq.fill('0');
  await expect(a).toContainText('Enter a frequency above 0.');
  expect((await a.boundingBox())!.height).toBe(h);
  await freq.fill('433.92');

  const b = w.getByLabel('Power converter');
  await expect(b).toContainText('= 10 mW');
  await w.getByLabel('Power (dBm)').fill('-3');
  await expect(b).toContainText('= 0.5012 mW');
  await w.getByLabel('Power (dBm)').fill('30');
  await expect(b).toContainText('= 1000 mW');
  await w.getByLabel('Power (mW)').fill('100');
  await expect(b).toContainText('= 20 dBm');
  await w.getByLabel('Power (mW)').fill('0.5');
  await expect(b).toContainText('= -3.01 dBm');
  await w.getByLabel('Power (mW)').fill('0');
  await expect(b).toContainText('minus infinity');

  // keyboard: tab reaches every field
  await freq.focus();
  await page.keyboard.press('Tab');
  await expect(w.getByLabel('Power (dBm)')).toBeFocused();

  await expect(page.locator('#compact')).not.toContainText('Worked');

  for (const theme of ['light', 'dark'] as const) {
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
    await w.scrollIntoViewIfNeeded();
    await w.screenshot({ path: `docs/v2/screenshots/widgets/rf-calc-${theme}.png` });
  }
  expect(errors).toEqual([]);
});

test('rf-calc survives abuse: rapid input, keyboard only, theme switch, remount, reduced motion, 360px', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(URL);

  const w = page.locator('#full [data-widget="rf-calc"]');
  const freq = w.getByLabel('Frequency (MHz)');
  const a = w.getByLabel('Wavelength and antenna length');
  await expect(a).toContainText('69.09 cm');

  // rapid input: the last value wins, no stale output
  await freq.focus();
  for (const v of ['1', '12', '', '-5', '2400', '0.000001', '433.92', '2400']) await freq.fill(v);
  await expect(a).toContainText('12.49 cm');

  // a half-typed exponent reads as empty, not NaN
  await freq.press('ControlOrMeta+a');
  await page.keyboard.type('1e');
  await expect(a).toContainText('Enter a frequency above 0.');
  await freq.fill('2400');

  // keyboard only: type, then Tab through every field
  await freq.focus();
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.type('915');
  await expect(a).toContainText('32.76 cm');
  await page.keyboard.press('Tab');
  await expect(w.getByLabel('Power (dBm)')).toBeFocused();
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.type('0');
  await expect(w.getByLabel('Power converter')).toContainText('= 1 mW');
  await page.keyboard.press('ArrowUp'); // number step 1 dBm
  await expect(w.getByLabel('Power converter')).toContainText('= 1.259 mW');
  await page.keyboard.press('Tab');
  await expect(w.getByLabel('Power (mW)')).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(w.getByLabel('Power (dBm)')).toBeFocused();

  // extreme values never print NaN or Infinity
  await w.getByLabel('Power (dBm)').fill('1000');
  await expect(w.getByLabel('Power converter')).not.toContainText(/NaN|Infinity/);
  await freq.fill('1e-300');
  await expect(a).not.toContainText(/NaN|Infinity/);
  await freq.fill('1e-320');
  await expect(a).not.toContainText(/NaN|Infinity/);
  await freq.fill('433.92');

  // theme switch while mounted keeps values and focus
  await w.getByLabel('Power (mW)').fill('100');
  await w.getByLabel('Power (mW)').focus();
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  await expect(w.getByLabel('Power (mW)')).toBeFocused();
  await expect(w.getByLabel('Power converter')).toContainText('= 20 dBm');

  // 360px: no horizontal overflow, 44px touch targets
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(over).toBeLessThanOrEqual(0);
  for (const label of ['Frequency (MHz)', 'Power (dBm)', 'Power (mW)']) {
    expect((await w.getByLabel(label).boundingBox())!.height).toBeGreaterThanOrEqual(44);
  }
  const host = await w.boundingBox();
  expect(host!.x + host!.width).toBeLessThanOrEqual(360);

  // mount, clean up, mount twice on the same host through the module itself
  const result = await page.evaluate(async () => {
    const path = '/src/widgets/rf-calc.ts';
    const { mount } = await import(/* @vite-ignore */ path);
    const host = document.createElement('div');
    document.body.append(host);
    const out: string[] = [];
    for (let i = 0; i < 2; i++) {
      const cleanup = mount(host, {});
      const input = host.querySelector<HTMLInputElement>('input[type=number]')!;
      input.value = '2400';
      input.dispatchEvent(new Event('input'));
      out.push(`${host.querySelectorAll('input').length}|${host.querySelectorAll('h3').length}|${host.textContent!.includes('12.49 cm')}`);
      cleanup();
      out.push(`${host.childElementCount}|${host.className}`);
    }
    const again = mount(host, {}); // remount after cleanup shows defaults, not 2400
    out.push(host.textContent!.includes('69.09 cm') ? 'fresh' : 'stale');
    again();
    host.remove();
    return out;
  });
  expect(result).toEqual(['3|1|true', '0|', '3|1|true', '0|', 'fresh']);
  expect(errors).toEqual([]);
});
