import { expect, test } from '@playwright/test';

// Only in the body of 02-modulation (the description, which is public, mentions AM650).
const PAID_MARKER = 'FuriHalSubGhzPresetOok650Async';

test('signed-out visitors get the paywall without the lesson body', async ({ page }) => {
  const res = await page.goto('/learn/02-modulation');
  expect(res?.status()).toBe(200);
  expect(res?.headers()['cache-control']).toContain('no-store');
  await expect(page.locator('[data-paywall="signed-out"]')).toBeVisible();
  await expect(page.locator('.lesson-prose')).toHaveCount(0);
  expect(await page.content()).not.toContain(PAID_MARKER);
});

test('the free lesson renders its body', async ({ page }) => {
  const res = await page.goto('/learn/00-setup');
  expect(res?.status()).toBe(200);
  await expect(page.locator('.lesson-prose')).toBeVisible();
  await expect(page.locator('[data-paywall]')).toHaveCount(0);
});

test('legacy lesson URLs redirect permanently', async ({ request }) => {
  const res = await request.get('/modules/02-modulation.html', { maxRedirects: 0 });
  expect(res.status()).toBe(301);
  expect(res.headers()['location']).toMatch(/\/learn\/02-modulation$/);
});

test('downloads and entitlements deny anonymous requests', async ({ request }) => {
  expect((await request.get('/api/downloads/lab-notebook.md')).status()).toBe(401);
  expect((await request.get('/api/entitlements')).status()).toBe(401);
  expect((await request.post('/api/checkout', { data: { product_id: 'course-complete' } })).status()).toBe(401);
});
