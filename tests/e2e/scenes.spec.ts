/* 3D scene gallery checks against the shared dev server (never starts or stops it).
   Run: npx playwright test tests/e2e/scenes.spec.ts */
import { expect, test, type Locator, type Page } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const SHOTS = fileURLToPath(new URL('../../docs/v2/screenshots/scenes/', import.meta.url));

test.use({
  baseURL: 'http://localhost:4321',
  viewport: { width: 1280, height: 900 },
  launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] },
});
// one retry: the shared server re-bundles deps when other agents add imports, and modules 504 meanwhile
test.describe.configure({ mode: 'serial', timeout: 420_000, retries: 1 });

function collectErrors(page: Page) {
  // other agents edit files on the shared server; a mocked HMR socket keeps their reloads out of this run
  void page.routeWebSocket(/.*/, () => {});
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
}
/* scrollIntoViewIfNeeded waits for a stable box, which slow SwiftShader frames can starve */
const reveal = (l: Locator) => l.evaluate((e) => e.scrollIntoView({ block: 'center' }));
const hostOf = (page: Page, id: string) => page.getByTestId(`scene-${id}`).locator('[data-scene3d]');
/* clip instead of element screenshots: SwiftShader frames are slow, so the "stable" wait can starve */
async function shot(page: Page, host: Locator, name: string) {
  await reveal(host);
  const clip = await host.boundingBox();
  if (clip) await page.screenshot({ path: `${SHOTS}${name}.png`, clip });
}

test('every scene mounts without console errors', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/dev/scenes');
  const ids = await page.locator('[data-testid^="scene-"]').evaluateAll((els) => els.map((e) => e.getAttribute('data-testid')!.slice(6)));
  expect(ids.length).toBe(13);

  const hero = page.getByTestId('hero-stage').locator('[data-scene3d]');
  // the first scene pays for the three.js import, the GLB and SwiftShader shader compilation
  await expect(hero).toHaveAttribute('data-scene-state', 'ready', { timeout: 90_000 });
  await shot(page, hero, 'hero-subghz');
  await page.getByTestId('hero-stage').locator('[data-set-mode="wifi"]').click();
  await page.waitForTimeout(600);
  await shot(page, hero, 'hero-wifi');

  for (const id of ids) {
    const host = hostOf(page, id);
    await reveal(host);
    await expect(host, id).toHaveAttribute('data-scene-state', 'ready', { timeout: 30_000 });
    const canvas = host.locator('canvas');
    await expect(canvas).toHaveAttribute('aria-label', /.+/);
    await expect(canvas).toHaveCSS('touch-action', 'pan-y');
    await page.waitForTimeout(400);
    await shot(page, host, id);
  }
  expect(errors).toEqual([]);
});

test('loop pauses offscreen, under the motion toggle and reduced motion; keys still rotate', async ({ page }) => {
  // SwiftShader on a busy machine can draw about one frame a second, so waits are long
  const T = { timeout: 120_000 };
  const errors = collectErrors(page);
  await page.goto('/dev/scenes');
  const first = hostOf(page, 'carrier');
  await reveal(first);
  await expect(first).toHaveAttribute('data-scene-state', 'ready', { timeout: 90_000 }); // first scene: three.js import + shader compile
  await expect(first).toHaveAttribute('data-scene-loop', 'on', T);

  // offscreen: scroll to the bottom, the carrier scene stops rendering
  const gpio = hostOf(page, 'gpio');
  await reveal(gpio);
  await expect(first).toHaveAttribute('data-scene-loop', 'off', T);

  // site motion toggle
  await expect(gpio).toHaveAttribute('data-scene-state', 'ready', T);
  await expect(gpio).toHaveAttribute('data-scene-loop', 'on', T);
  // the toggle sits at the top of the page, so clicking it scrolls gpio offscreen; bring it back before each check
  const toggleMotion = async () => {
    await page.locator('[data-motion-toggle]').first().click();
    await reveal(gpio);
  };
  await toggleMotion();
  await expect(gpio).toHaveAttribute('data-scene-loop', 'off', T);
  await toggleMotion();
  await expect(gpio).toHaveAttribute('data-scene-loop', 'on', T);

  // OS reduced motion: still, but arrow keys rotate without scrolling the page
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(gpio).toHaveAttribute('data-scene-loop', 'off', T);
  await gpio.locator('canvas').focus();
  const y = await page.evaluate(() => scrollY);
  await page.keyboard.press('ArrowRight');
  await expect(gpio).toHaveAttribute('data-scene-loop', 'on', T);
  await expect(gpio).toHaveAttribute('data-scene-loop', 'off', T);
  expect(await page.evaluate(() => scrollY)).toBe(y);
  expect(errors).toEqual([]);
});

test('without WebGL every scene shows its static view', async ({ page }) => {
  const errors = collectErrors(page);
  await page.addInitScript(() => {
    const orig = HTMLCanvasElement.prototype.getContext;
    // @ts-expect-error narrowing the overloads is not useful here
    HTMLCanvasElement.prototype.getContext = function (type: string, ...rest: unknown[]) {
      return /webgl/.test(type) ? null : orig.call(this, type as '2d', ...(rest as []));
    };
  });
  await page.goto('/dev/scenes');
  for (const host of await page.locator('[data-scene3d]').all()) {
    await reveal(host);
    await expect(host).toHaveAttribute('data-scene-state', 'fallback', { timeout: 60_000 });
    await expect(host.locator('[data-scene-stage] > img, [data-scene-stage] > canvas[role="img"]')).toHaveCount(1);
  }
  await shot(page, hostOf(page, 'modulation'), 'fallback-modulation');
  await shot(page, hostOf(page, 'flipper'), 'fallback-flipper');
  // three.js logs its own "Error creating WebGL context" before throwing; anything else is a bug
  expect(errors.filter((e) => !/WebGL/i.test(e))).toEqual([]);
});
