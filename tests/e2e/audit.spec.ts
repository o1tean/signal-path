/* Regression checks for the 13 October 2026 audit fixes (docs/v2/verification.md, "Audit fixes"). */
import { expect, test, type Page } from '@playwright/test';

const open = async (page: Page, path: string) => {
  await page.routeWebSocket(/.*/, () => {}); // stubbed HMR socket, as in seams.spec.ts
  await page.goto(path);
};

test('learner pages fit a 360 px phone and the home link has a name', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  for (const path of ['/learn', '/learn/00-setup', '/learn/02-modulation', '/learn/notebook']) {
    await open(page, path);
    await page.waitForLoadState('networkidle');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `${path} scrolls sideways`).toBeLessThanOrEqual(0);
    await expect(page.getByRole('link', { name: 'Signal Path home' })).toBeVisible();
  }
});

test('answering a quiz question keeps keyboard focus on its feedback', async ({ page }) => {
  await open(page, '/learn/00-setup');
  const first = page.locator('fieldset').filter({ hasText: 'Question 1 of' }).first();
  await first.scrollIntoViewIfNeeded();
  const option = first.getByRole('button').first();
  await option.focus();
  await page.keyboard.press('Enter');
  const focused = await page.evaluate(() => document.activeElement?.textContent ?? '');
  expect(focused).toMatch(/^(Correct\.|Not quite\.)/);
});

test('on-demand learner pages are private to the visitor', async ({ request }) => {
  for (const path of ['/learn', '/learn/00-setup', '/learn/quiz']) {
    const res = await request.get(path);
    expect(res.headers()['cache-control'], path).toBe('private, no-store');
  }
});

test('post-login redirects never leave the site', async ({ request }) => {
  for (const next of ['/\t/evil.example', '//evil.example', '/\\evil.example', 'https://evil.example']) {
    const res = await request.get(`/auth/callback?next=${encodeURIComponent(next)}`, { maxRedirects: 0 });
    const location = res.headers()['location'] ?? '';
    expect(location, next).toMatch(/^\/login\?/);
    expect(decodeURIComponent(location)).not.toContain('evil.example');
  }
});
