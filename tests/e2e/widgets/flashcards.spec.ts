import { expect, test } from '@playwright/test';

test.use({ baseURL: process.env.BASE_URL ?? 'http://localhost:4321' });

test('flashcards: flip, navigate, filter, shuffle, persist, no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('/dev/widgets/flashcards');
  const host = page.locator('[data-widget="flashcards"]');
  const card = host.getByRole('button', { name: 'Flip card' });
  await expect(card).toBeVisible();
  const pos = host.locator('[aria-live="polite"]').first();
  await expect(pos).toHaveText(/^1 \/ \d+$/);
  const total = Number((await pos.textContent())!.split('/')[1]);
  expect(total).toBeGreaterThan(50);

  // flip by click and by keyboard
  await expect(card).toHaveAttribute('aria-pressed', 'false');
  await host.locator('[data-flashcard]').click();
  await expect(card).toHaveAttribute('aria-pressed', 'true');
  await card.focus();
  await page.keyboard.press('Space');
  await expect(card).toHaveAttribute('aria-pressed', 'false');

  // next / prev with arrows, wraparound
  await page.keyboard.press('ArrowRight');
  await expect(pos).toHaveText(`2 / ${total}`);
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  await expect(pos).toHaveText(`${total} / ${total}`);
  await host.getByRole('button', { name: 'Next card' }).click();
  await expect(pos).toHaveText(`1 / ${total}`);

  // position survives a reload (stored by term)
  await host.getByRole('button', { name: 'Next card' }).click();
  const term = await host.locator('.sp-fc-face').first().locator('div').nth(1).textContent();
  await page.reload();
  await expect(host.locator('.sp-fc-face').first().locator('div').nth(1)).toHaveText(term!);

  // tag filter
  await host.getByLabel('Filter cards by tag').selectOption('nfc');
  await expect(pos).toHaveText('1 / 8');

  // shuffle announces
  await host.getByRole('button', { name: 'Shuffle' }).click();
  await expect(host.getByText(`Shuffled 8 cards`)).toBeAttached();
  await expect(pos).toHaveText('1 / 8');

  // screenshots in both themes
  await host.getByLabel('Filter cards by tag').selectOption('all');
  for (const theme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: theme });
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
    await host.screenshot({ path: `docs/v2/screenshots/widgets/flashcards-${theme}.png` });
  }

  expect(errors).toEqual([]);
});

test('flashcards: stress, keyboard only, theme switch, remount, reduced motion, 360px', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/dev/widgets/flashcards');
  const host = page.locator('[data-widget="flashcards"]');
  const card = host.getByRole('button', { name: 'Flip card' });
  const pos = host.locator('[aria-live="polite"]').first();
  await expect(pos).toHaveText(/^1 \/ \d+$/);
  const total = Number((await pos.textContent())!.split('/')[1]);

  // no horizontal overflow at 360px
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

  // keyboard only: tab to card, flip with Enter, step with arrows, buttons keep native Enter/Space
  await card.focus();
  await page.keyboard.press('Enter');
  await expect(card).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('ArrowRight');
  await expect(card).toHaveAttribute('aria-pressed', 'false');
  await expect(pos).toHaveText(`2 / ${total}`);
  await host.getByRole('button', { name: 'Next card' }).focus();
  await page.keyboard.press('Enter');
  await expect(pos).toHaveText(`3 / ${total}`);
  await page.keyboard.press('Space');
  await expect(pos).toHaveText(`4 / ${total}`);
  // arrows on the select must not navigate
  await host.getByLabel('Filter cards by tag').focus();
  // the key must not be swallowed by the widget (native select behaviour stays)
  expect(await host.getByLabel('Filter cards by tag').evaluate((s) => !s.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true })))).toBe(false);
  await expect(pos).toHaveText(`4 / ${total}`);

  // rapid interactions
  await host.getByLabel('Filter cards by tag').selectOption('nfc');
  await host.getByLabel('Filter cards by tag').selectOption('all');
  const before = await card.getAttribute('aria-pressed');
  for (let k = 0; k < 40; k++) await host.locator('[data-flashcard]').click();
  await expect(card).toHaveAttribute('aria-pressed', before!);
  for (let k = 0; k < 25; k++) await host.getByRole('button', { name: 'Next card' }).click();
  await expect(pos).toHaveText(`26 / ${total}`);
  for (let k = 0; k < 5; k++) await host.getByRole('button', { name: 'Shuffle' }).click();
  await expect(pos).toHaveText(`1 / ${total}`);

  // theme switch while mounted: face colors follow tokens
  const bg = () => host.locator('.sp-fc-face').first().evaluate((n) => getComputedStyle(n).backgroundColor);
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
  const light = await bg();
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  expect(await bg()).not.toBe(light);

  // reduced motion is read live
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(host.locator('.sp-fc')).toHaveClass(/reduced/);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(host.locator('.sp-fc')).not.toHaveClass(/reduced/);

  // mount/unmount twice on the same host: no duplicated listeners, one style tag
  const r = await page.evaluate(async () => {
    const url = '/src/widgets/flashcards.ts';
    const { mount } = await import(/* @vite-ignore */ url);
    const h = document.querySelector('[data-widget="flashcards"]') as HTMLElement;
    const c1 = mount(h, {} as never);
    c1();
    const c2 = mount(h, { mode: 'compact' } as never);
    const c = h.querySelector('[aria-pressed]') as HTMLElement;
    c.focus();
    h.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    const pressed = c.getAttribute('aria-pressed');
    c2();
    h.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    return { pressed, empty: h.children.length, styles: document.querySelectorAll('#sp-flashcards-css').length };
  });
  expect(r).toEqual({ pressed: 'true', empty: 0, styles: 1 });
  expect(errors).toEqual([]);
});
