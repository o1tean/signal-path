import { expect, test } from '@playwright/test';

const URL = 'http://localhost:4321/dev/widgets/tool-picker';
test.use({ baseURL: 'http://localhost:4321' });

// Correct answer index per scenario (A=0 ... D=3), same order as the widget.
const ANSWERS = [0, 1, 2, 3, 3, 0, 2, 1];

test('tool-picker scores a run, gives feedback and restarts', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto(URL);
  const w = page.locator('#full [data-widget="tool-picker"]');
  const opts = w.getByRole('group', { name: 'Tool choices' }).getByRole('button');
  const status = w.getByRole('status');
  const next = w.getByRole('button', { name: /^(Next|See score)$/ });
  await expect(opts).toHaveCount(4);
  await expect(w).toContainText('Scenario 1 / 8');
  await expect(next).toBeDisabled();
  await expect(page.locator('#compact')).not.toContainText('Every scenario is a device');

  // wrong answer on scenario 1: feedback names the right tool, layout does not move
  const h = (await w.boundingBox())!.height;
  await opts.nth(2).click();
  await expect(status).toContainText('Not quite. The move is Frequency Analyzer.');
  await expect(opts.nth(0)).toContainText('Frequency Analyzer');
  await expect(opts.nth(1)).toBeDisabled();
  expect((await w.boundingBox())!.height).toBe(h);
  await expect(next).toBeFocused();
  await next.press('Enter');

  // answer the rest by keyboard-activated clicks, all correct
  for (let i = 1; i < 8; i++) {
    await expect(w).toContainText(`Scenario ${i + 1} / 8`);
    await opts.nth(ANSWERS[i]).click();
    await expect(status).toContainText('Right.');
    if (i === 3) {
      for (const theme of ['light', 'dark'] as const) {
        await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
        await w.scrollIntoViewIfNeeded();
        await w.screenshot({ path: `docs/v2/screenshots/widgets/tool-picker-${theme}.png` });
      }
    }
    await next.click();
  }

  await expect(w).toContainText('Final score 7 / 8');
  await expect(status).toContainText('7 / 8. Solid.');
  await expect(next).toBeDisabled();

  await w.getByRole('button', { name: 'Start over' }).click();
  await expect(w).toContainText('Scenario 1 / 8');
  await expect(w).toContainText('Score 0');

  // perfect run
  for (let i = 0; i < 8; i++) {
    await opts.nth(ANSWERS[i]).click();
    await next.click();
  }
  await expect(status).toContainText('8 / 8. Perfect.');

  expect(errors).toEqual([]);
});

test('tool-picker survives abuse: rapid clicks, keyboard only, theme, reduced motion, 360px, double mount', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(URL);
  const w = page.locator('#full [data-widget="tool-picker"]');
  const opts = w.getByRole('group', { name: 'Tool choices' }).getByRole('button');
  const next = w.getByRole('button', { name: /^(Next|See score)$/ });
  await expect(opts).toHaveCount(4);

  // no horizontal overflow at 360px
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

  // rapid repeated clicks count once (scenario 1 answer is A; click wrong then right)
  await opts.nth(2).click();
  await opts.nth(0).dispatchEvent('click');
  await expect(w).toContainText('Score 0');
  // keyboard: Next has focus, Enter advances, first option gets focus, Enter answers right
  await page.keyboard.press('Enter');
  await expect(w).toContainText('Scenario 2 / 8');
  await expect(opts.first()).toBeFocused();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(opts.nth(2)).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Enter'); // option B: right
  await expect(w).toContainText('Score 1');
  await page.keyboard.press('Space'); // Next focused
  await expect(w).toContainText('Scenario 3 / 8');

  // theme switch while mounted keeps state
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  await expect(w).toContainText('Scenario 3 / 8');
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));

  // the longest feedback does not change the height at 360px
  for (let i = 2; i < 8; i++) {
    const h = (await w.boundingBox())!.height;
    await opts.nth(i % 2 ? 3 : ANSWERS[i]).click();
    expect((await w.boundingBox())!.height).toBe(h);
    await next.click();
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

  // mount / unmount twice on one host
  const stats = await page.evaluate(async () => {
    const m = await import(/* @vite-ignore */ '/src/widgets/tool-picker.ts' as string);
    const host = document.createElement('div');
    document.body.append(host);
    const out: number[] = [];
    for (let i = 0; i < 2; i++) {
      const cleanup = m.mount(host, {}) as () => void;
      out.push(host.querySelectorAll('button').length);
      cleanup();
      out.push(host.children.length);
    }
    host.remove();
    return out;
  });
  expect(stats).toEqual([6, 0, 6, 0]);
  expect(errors).toEqual([]);
});
