import { expect, test } from '@playwright/test';

const URL = 'http://localhost:4321/dev/widgets/rolling-sim';
test.use({ baseURL: 'http://localhost:4321' });

test('rolling-sim: replay works once, then is rejected and awards out-of-sync', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto(URL);
  const w = page.locator('#full [data-widget="rolling-sim"]');
  const status = w.getByRole('status');
  await expect(status).toContainText('Waiting');
  await expect(w.getByRole('button', { name: 'Replay capture' })).toBeDisabled();
  const h = (await status.boundingBox())!.height;

  // honest press opens the gate
  await w.getByRole('button', { name: 'Press real remote' }).click();
  await expect(status).toContainText('Gate opens');
  await expect(w.getByText('GATE OPEN', { exact: true })).toBeVisible();

  // record a press away from the gate (keyboard path), then replay it
  const cap = w.getByRole('button', { name: 'Capture next press' });
  await cap.focus();
  await page.keyboard.press('Enter');
  await expect(cap).toHaveAttribute('aria-pressed', 'true');
  await w.getByRole('button', { name: 'Press real remote' }).click();
  await expect(status).toContainText('Recorded, out of range');
  await expect(w.getByText('holds Cnt 7', { exact: true })).toBeVisible();

  await w.getByRole('button', { name: 'Replay capture' }).click();
  await expect(status).toContainText('Replay worked, this time');
  await expect(page.getByText('Badge earned')).toHaveCount(0);

  // the real remote moves on; the old capture is now dead
  await w.getByRole('button', { name: 'Press real remote' }).click();
  await w.getByRole('button', { name: 'Replay capture' }).click();
  await expect(status).toContainText('Replay is dead');
  await expect(w.getByText('GATE CLOSED', { exact: true })).toBeVisible();
  await expect(page.getByText(/Out of Sync/i).first()).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('signalpath.v2') || '{}').badges?.['out-of-sync'])).toBe(true);

  // window slider changes the receiver
  await w.getByLabel('Accept window').fill('2');
  await expect(w.getByText('window 2', { exact: true })).toBeVisible();

  // preset plays through and ends on the summary
  await w.getByRole('button', { name: 'Reset' }).click();
  await w.getByRole('button', { name: 'Reproduce the gate mystery' }).click();
  await expect(status).toContainText('That is the whole mystery', { timeout: 9000 });
  expect((await status.boundingBox())!.height).toBe(h);

  await expect(page.locator('#compact')).not.toContainText('synthetic counter model');

  for (const theme of ['light', 'dark'] as const) {
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
    await w.scrollIntoViewIfNeeded();
    await w.screenshot({ path: `docs/v2/screenshots/widgets/rolling-sim-${theme}.png` });
  }
  expect(errors).toEqual([]);
});

test('rolling-sim: reduced motion steps through the preset per click', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(URL);
  const w = page.locator('#full [data-widget="rolling-sim"]');
  const btn = w.getByRole('button', { name: /Reproduce the gate mystery/ });
  await btn.click();
  await expect(w.getByRole('button', { name: 'Next step (1 of 6)' })).toBeVisible();
  for (let i = 0; i < 5; i++) await w.getByRole('button', { name: /Next step|See the summary/ }).click();
  await w.getByRole('button', { name: 'See the summary' }).click();
  await expect(w.getByRole('status')).toContainText('That is the whole mystery');
});

test('rolling-sim: stress, keyboard, theme switch and layout at 360 px', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(URL);
  const w = page.locator('#full [data-widget="rolling-sim"]');
  const status = w.getByRole('status');
  await expect(status).toContainText('Waiting');
  const slider = w.getByLabel("Accept window");
  const btn = (name: string | RegExp) => w.getByRole('button', { name });

  // no horizontal page scroll, and the status box keeps its height for every message
  const noOverflow = () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  expect(await noOverflow()).toBe(true);
  const h = (await status.boundingBox())!.height;
  const heights = new Set<number>();

  // rapid presses: log stays capped at 40 lines, receiver stays consistent
  for (let i = 0; i < 60; i++) await btn('Press real remote').click({ delay: 0, noWaitAfter: true });
  const log = w.getByLabel('Event log');
  expect(((await log.textContent()) ?? '').split('\n').length).toBeLessThanOrEqual(40);
  await expect(status).toContainText('Gate opens');
  heights.add((await status.boundingBox())!.height);

  // capture toggles, then a double-click arms and disarms
  await btn('Reset').click();
  await btn('Capture next press').dblclick();
  await expect(btn('Capture next press')).toHaveAttribute('aria-pressed', 'false');
  await btn('Capture next press').click();
  await btn('Press real remote').click();
  await btn('Capture next press').click();
  await expect(status).toContainText('Flipper already holds a capture');
  heights.add((await status.boundingBox())!.height);
  await btn('Replay capture').click();
  await btn('Replay capture').click();
  await expect(status).toContainText('Replay is dead');
  heights.add((await status.boundingBox())!.height);

  // spamming the preset button and the manual buttons mid-run must not corrupt it
  await btn('Reproduce the gate mystery').click();
  for (let i = 0; i < 5; i++) {
    await btn('Reproduce the gate mystery').click({ noWaitAfter: true });
    await btn('Press real remote').click({ force: true, noWaitAfter: true });
  }
  await expect(status).toContainText('That is the whole mystery', { timeout: 20_000 });
  heights.add((await status.boundingBox())!.height);
  const text = (await w.textContent()) ?? '';
  expect(text).toContain('Last accepted8');
  heights.add((await status.boundingBox())!.height);
  expect([...heights, h]).toEqual(Array(heights.size + 1).fill(h));
  expect(await noOverflow()).toBe(true);

  // reset mid-preset stops it cleanly
  await btn('Reproduce the gate mystery').click();
  await btn('Reset').click();
  await page.waitForTimeout(2500);
  await expect(status).toContainText('Reset');

  // keyboard only: tab to the slider and arrow keys change the window
  await slider.focus();
  await page.keyboard.press('End');
  await expect(w.getByText('window 256', { exact: true })).toBeVisible();
  await page.keyboard.press('Home');
  await expect(w.getByText('window 1', { exact: true })).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(btn('Press real remote')).toBeFocused();
  await page.keyboard.press('Space');
  await expect(status).toContainText('Gate opens');

  // a missed press with a tiny window pushes the next real press out of sync (longest-ish message)
  await btn('Reset').click();
  await slider.fill('1');
  await btn('Capture next press').click();
  await btn('Press real remote').click();
  await btn('Press real remote').click();
  await expect(status).toContainText('Too far ahead');
  expect((await status.boundingBox())!.height).toBe(h);
  await btn('Replay capture').click();
  await expect(status).toContainText('Replay worked, this time');
  expect((await status.boundingBox())!.height).toBe(h);
  expect(await noOverflow()).toBe(true);
  expect(errors).toEqual([]);
});

test('rolling-sim: theme switch while mounted, mount and unmount twice', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(URL);
  const w = page.locator('#full [data-widget="rolling-sim"]');
  await w.getByRole('button', { name: 'Press real remote' }).click();
  for (const t of ['dark', 'light', 'dark']) {
    await page.evaluate((v) => document.documentElement.setAttribute('data-theme', v), t);
    await expect(w.getByText('GATE OPEN', { exact: true })).toBeVisible();
  }
  await w.getByRole('button', { name: 'Press real remote' }).click();
  await expect(w.getByRole('status')).toContainText('Gate opens');

  // mount twice on fresh hosts, tear down mid-preset, remount; nothing may fire after cleanup
  const result = await page.evaluate(async () => {
    const src = '/src/widgets/rolling-sim.ts';
    const { mount } = await import(/* @vite-ignore */ src);
    const out: Record<string, unknown> = {};
    const host = document.createElement('div');
    document.body.append(host);
    const clean1 = mount(host, {});
    [...host.querySelectorAll('button')].find((b) => b.textContent === 'Reproduce the gate mystery')!.click();
    const logEl = host.querySelector('pre')!;
    clean1();
    out.emptyAfterCleanup = host.childElementCount === 0 && !host.classList.contains('sp-widget');
    await new Promise((r) => setTimeout(r, 2500));
    out.stillEmpty = host.childElementCount === 0;
    out.detachedLogUntouched = !(logEl.textContent ?? '').includes('Done.');
    const clean2 = mount(host, { mode: 'compact' });
    out.secondHasShell = host.querySelectorAll('button').length === 5;
    out.compactNoIntro = !host.textContent!.includes('synthetic counter model');
    const ids = new Set([...host.querySelectorAll('input')].map((i) => i.id));
    const host2 = document.createElement('div');
    document.body.append(host2);
    const clean3 = mount(host2, {});
    out.uniqueIds = [...host2.querySelectorAll('input')].every((i) => !ids.has(i.id));
    clean2();
    clean3();
    clean2(); // double cleanup must be harmless
    host.remove();
    host2.remove();
    return out;
  });
  expect(result).toEqual({
    emptyAfterCleanup: true,
    stillEmpty: true,
    detachedLogUntouched: true,
    secondHasShell: true,
    compactNoIntro: true,
    uniqueIds: true,
  });
  expect(errors).toEqual([]);
});

for (const width of [320, 360, 640, 700, 768, 1280]) {
  test(`rolling-sim: status box never changes height at ${width} px`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width, height: 900 });
    await page.goto(URL);
    const w = page.locator('#full [data-widget="rolling-sim"]');
    const status = w.getByRole('status');
    await expect(status).toContainText('Waiting');
    const seen = new Map<string, number>();
    const note = async () => seen.set(((await status.textContent()) ?? '').slice(1, 30), (await status.boundingBox())!.height);
    const click = async (name: string | RegExp) => {
      await w.getByRole('button', { name }).click();
      await note();
    };
    await note();
    await click('Capture next press');
    await click('Capture next press'); // cancelled
    await click('Capture next press');
    await click('Press real remote'); // recorded
    await click('Capture next press'); // already holds one
    await click('Press real remote'); // gate opens
    await click('Replay capture'); // dead
    await click('Reset');
    await w.getByLabel('Accept window').fill('1');
    await click('Capture next press');
    await click('Press real remote');
    await click('Press real remote'); // too far ahead
    await click('Replay capture'); // refused, too far
    await click('Reset');
    for (let i = 0; i < 7; i++) await click(/Next step|See the summary|Reproduce/); // ends on the summary
    await click('Reset');
    await click('Capture next press');
    await click('Press real remote');
    await click('Replay capture'); // worked, this time
    expect(seen.size).toBeGreaterThan(9);
    expect([...new Set(seen.values())], JSON.stringify([...seen])).toHaveLength(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}
