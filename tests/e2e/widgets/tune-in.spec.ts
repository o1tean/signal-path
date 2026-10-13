import { expect, test } from '@playwright/test';

test.use({ baseURL: process.env.BASE_URL ?? 'http://localhost:4321' });

test('tune-in: answer, streak, badge, persisted best, no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('/dev/widgets/tune-in');
  const host = page.locator('#full [data-widget="tune-in"]');
  const choices = host.getByRole('group', { name: 'Frequency choices' }).getByRole('button');
  await expect(choices).toHaveCount(4);
  const fb = host.locator('[aria-live="polite"]');
  const fmt = (s: string) => (Number(s) === Math.round(Number(s)) ? s : Number(s).toFixed(2));
  const secret = async () => fmt((await host.getAttribute('data-secret'))!);

  // a miss resets the streak and reveals the answer
  let s = await secret();
  await host.locator(`[data-freq]:not([data-freq="${await host.getAttribute('data-secret')}"])`).first().click();
  await expect(fb).toContainText(`That peak was at ${s} MHz`);
  await expect(host.getByText('Correct: 0 / 1')).toBeVisible();
  await expect(choices.first()).toBeDisabled();
  // wrong pick must actually be tinted (bg-card must not win over the tint)
  const wrongBg = await host.locator(`[data-freq]:not([data-freq="${await host.getAttribute('data-secret')}"])`).first().evaluate((e: HTMLElement) => getComputedStyle(e).backgroundColor);
  expect(wrongBg).not.toBe(await page.evaluate(() => { const d = document.createElement('i'); d.className = 'bg-card'; document.body.append(d); const c = getComputedStyle(d).backgroundColor; d.remove(); return c; }));

  // five in a row; use the keyboard for one of them
  const next = host.getByRole('button', { name: 'Next round' });
  for (let i = 1; i <= 5; i++) {
    await next.click();
    s = await secret();
    const idx = await choices.evaluateAll((bs, f) => bs.findIndex((b) => (b as HTMLElement).dataset.freq && Number((b as HTMLElement).dataset.freq) === Number(f)), s);
    if (i === 3) await page.keyboard.press(String(idx + 1));
    else await choices.nth(idx).click();
    await expect(fb).toContainText(`Streak: ${i}.`);
  }
  await expect(host.getByText('Best streak: 5')).toBeVisible();
  await expect(page.getByText(/Tuned In/i).first()).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('signalpath.v2')!).badges['tuned-in'])).toBe(true);

  // best streak survives a reload
  await page.reload();
  await expect(page.locator('#full [data-widget="tune-in"]').getByText('Best streak: 5')).toBeVisible();

  for (const theme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: theme });
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
    await page.locator('#full [data-widget="tune-in"]').screenshot({ path: `docs/v2/screenshots/widgets/tune-in-${theme}.png` });
  }

  expect(errors).toEqual([]);
});

test('tune-in: keyboard only, rapid input, remount, theme, reduced motion, 360px', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.setViewportSize({ width: 360, height: 740 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/dev/widgets/tune-in');
  const host = page.locator('#full [data-widget="tune-in"]');
  const choices = host.getByRole('group', { name: 'Frequency choices' }).getByRole('button');
  await expect(choices).toHaveCount(4);

  // no horizontal overflow at 360px
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  // rapid: hammer 1-4 and click all; only one attempt may count
  await choices.first().focus();
  await page.keyboard.press('1');
  await page.keyboard.press('2');
  await page.keyboard.press('3');
  await expect(host.getByText(/Correct: \d \/ 1$/)).toBeVisible();

  // keyboard only: Enter on Next, focus lands on first choice, number key answers
  await expect(host.getByRole('button', { name: 'Next round' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(choices.first()).toBeFocused();
  await page.keyboard.press('2');
  await expect(host.getByText(/\/ 2$/)).toBeVisible();

  // theme switch while mounted: no errors, canvas still sized
  for (const t of ['dark', 'light', 'dark']) await page.evaluate((v) => document.documentElement.setAttribute('data-theme', v), t);
  expect(await host.locator('canvas').evaluate((c: HTMLCanvasElement) => c.width > 0 && c.height > 0)).toBe(true);

  // mount/unmount twice on the same host
  const ok = await page.evaluate(async () => {
    const m = await import(/* @vite-ignore */ ['', 'src', 'widgets', 'tune-in.ts'].join('/'));
    const h = document.querySelector('#compact [data-widget="tune-in"]') as HTMLElement;
    const opts = { mode: 'compact' } as never;
    for (let i = 0; i < 2; i++) {
      const un = m.mount(h, opts) as unknown as () => void;
      if (h.querySelectorAll('button').length !== 5) return `mount ${i}: ${h.querySelectorAll('button').length} buttons`;
      un();
      if (h.childElementCount !== 0) return `unmount ${i}: host not empty`;
      h.dispatchEvent(new KeyboardEvent('keydown', { key: '1', bubbles: true })); // must be a no-op
    }
    return 'ok';
  });
  expect(ok).toBe('ok');
  expect(errors).toEqual([]);
});
