/* Cross-track seams: marketing pages mount the real widgets and scene, and lesson facts come from the collection. */
import { expect, test, type Page } from '@playwright/test';

// a stubbed HMR socket keeps edits elsewhere from reloading the page mid-test
const open = async (page: Page, path: string) => {
  await page.routeWebSocket(/.*/, () => {});
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(path);
  return errors;
};
// mounting is lazy (IntersectionObserver), so bring each host into view
const mountAllIn = async (page: Page, selector: string) => {
  for (const host of await page.locator(selector).all()) {
    await host.evaluate((e) => e.scrollIntoView({ block: 'center' }));
    await expect(host).toHaveAttribute('data-mounted', 'ready', { timeout: 30_000 });
  }
};

test('/tools mounts the free tools live and shows the others locked', async ({ page }) => {
  const errors = await open(page, '/tools');
  await expect(page.locator('[data-widget]')).toHaveCount(3);
  await mountAllIn(page, '[data-widget]');
  for (const id of ['tune-in', 'wave-lab', 'spectrum-scope']) await expect(page.locator(`#${id} [data-widget="${id}"]`)).toHaveCount(1);
  for (const id of ['rf-calc', 'pulse-decoder', 'rolling-sim', 'flipper-sim', 'signal-atlas', 'flashcards', 'tool-picker']) {
    await expect(page.locator(`li#${id}`)).toBeVisible();
    await expect(page.locator(`li#${id} [data-widget]`)).toHaveCount(0);
  }
  expect(errors).toEqual([]);
});

test('home mounts two live tools and the 3D hero (or its static view)', async ({ page }) => {
  const errors = await open(page, '/');
  const hero = page.locator('[data-signal-stage] [data-scene3d="flipper"]');
  await expect(hero).toHaveAttribute('data-scene-state', /^(ready|fallback)$/, { timeout: 90_000 });
  await expect(page.locator('#tools [data-widget]')).toHaveCount(2);
  await mountAllIn(page, '#tools [data-widget]');
  await expect(page.locator('#proof-strip dd').first()).toHaveText('19');
  expect(errors).toEqual([]);
});

test('course page and sidebar list every lesson from the collection', async ({ page }) => {
  await open(page, '/course');
  await expect(page.locator('section[id^="stage-"] ol > li a[href^="/learn/"]')).toHaveCount(19);
  await expect(page.locator('#stage-atlas a[href="/learn/09-troubleshooting"]')).toHaveCount(1);
  await page.goto('/learn/00-setup');
  await expect(page.locator('.learn-nav [data-module-link]')).toHaveCount(19);
  await expect(page.locator('.learn-nav [data-module-link="m05"]')).toContainText('Raw signals and rolling codes');
});

test('an unknown lesson slug is a 404', async ({ request }) => {
  expect((await request.get('/learn/99-nope')).status()).toBe(404);
});
