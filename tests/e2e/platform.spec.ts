/* Access boundary end to end: paywall, sign-in through /auth/callback (local Supabase), entitlement, downloads.
   Run: npx playwright test tests/e2e/platform.spec.ts (shared dev server on :4321, local stack from `npx supabase start`). */
import { expect, test, type Page } from '@playwright/test';
import { admin as adminClient, e2eUser, isLocal, userId as profileId } from './env';

const PAID_MARKER = 'FuriHalSubGhzPresetOok650Async'; // only in the body of 02-modulation (its public description mentions AM650)

// Other agents edit files on the shared server; a stubbed HMR socket keeps their reloads out of this run.
const quietHmr = (page: Page) => page.routeWebSocket(/.*/, () => {});

test.describe('signed out', () => {
  test('paid lesson shows the paywall and no body text', async ({ page }) => {
    await quietHmr(page);
    const res = await page.goto('/learn/02-modulation');
    expect(res?.status()).toBe(200);
    expect(res?.headers()['cache-control']).toBe('private, no-store');
    await expect(page.locator('[data-paywall="signed-out"]')).toBeVisible();
    expect(await page.content()).not.toContain(PAID_MARKER);
  });

  test('free lesson renders its body', async ({ page }) => {
    await quietHmr(page);
    const res = await page.goto('/learn/00-setup');
    expect(res?.status()).toBe(200);
    await expect(page.locator('.lesson-prose h2').first()).toBeVisible();
    await expect(page.locator('[data-paywall]')).toHaveCount(0);
  });

  test('downloads API denies anonymous visitors', async ({ request }) => {
    const res = await request.get('/api/downloads/lab-notebook.md');
    expect(res.status()).toBe(401);
    expect(res.headers()['cache-control']).toBe('private, no-store');
  });

  test('legacy module URL redirects with 301', async ({ request }) => {
    const res = await request.get('/modules/02-modulation.html', { maxRedirects: 0 });
    expect(res.status()).toBe(301);
    expect(res.headers().location).toMatch(/\/learn\/02-modulation$/);
  });
});

test.describe('signed in', () => {
  test.skip(!isLocal, 'needs the local Supabase stack in .env (npx supabase start)');
  test.describe.configure({ mode: 'serial' });

  let admin: ReturnType<typeof adminClient>;
  let EMAIL = '';
  let userId = '';

  test.beforeAll(async () => {
    // global-setup.ts created the confirmed learner and stored it in .e2e-user.json (never printed)
    admin = adminClient();
    EMAIL = e2eUser().email;
    userId = await profileId(EMAIL);
    await admin.from('entitlements').delete().eq('user_id', userId);
    await admin.from('learner_state').delete().eq('user_id', userId);
  });

  test.afterAll(async () => {
    if (userId) await admin.from('entitlements').delete().eq('user_id', userId);
  });

  /* Admin-generated link instead of an email: the emailed path is covered by signin.spec.ts, and the local stack
     rate-limits sign-in emails per hour, so a second emailed sign-in in this file made the suite order-dependent. */
  async function signIn(page: Page) {
    const { data, error } = await admin.auth.admin.generateLink({ type: 'magiclink', email: EMAIL });
    expect(error).toBeNull();
    await page.goto(`/auth/callback?token_hash=${data.properties!.hashed_token}&type=email&next=%2Flearn%2F02-modulation`);
    await expect(page).toHaveURL(/\/learn\/02-modulation$/);
  }

  test('unentitled learner sees the paywall, entitled learner sees the lesson and can download', async ({ page }) => {
    await quietHmr(page);
    await signIn(page);
    await expect(page.locator('[data-paywall="signed-in"]')).toBeVisible();
    await expect(page.locator('[data-auth="account"]')).toBeVisible();
    expect(await page.content()).not.toContain(PAID_MARKER);
    expect((await page.request.get('/api/downloads/lab-notebook.md')).status()).toBe(403);

    const { error } = await admin
      .from('entitlements')
      .upsert({ user_id: userId, product_id: 'course-complete', status: 'active' }, { onConflict: 'user_id,product_id' });
    expect(error).toBeNull();

    await page.reload();
    await expect(page.locator('[data-paywall]')).toHaveCount(0);
    expect(await page.content()).toContain(PAID_MARKER);

    const file = await page.request.get('/api/downloads/lab-notebook.md');
    expect(file.status()).toBe(200);
    expect(file.headers()['cache-control']).toBe('private, no-store');
    expect((await file.text()).length).toBeGreaterThan(100);
    expect((await page.request.get('/api/downloads/README.md')).status()).toBe(404);
    expect((await page.request.get('/api/downloads/..%2F..%2F.env')).status()).toBe(404);

    const ent = await page.request.get('/api/entitlements');
    expect(await ent.json()).toMatchObject({ signedIn: true, entitlements: ['course-complete'] });
  });

  test('learner state syncs to the account', async ({ page }) => {
    await quietHmr(page);
    // learner.ts pushes this browser's state on the first signed-in page load when the account has none
    await admin.from('learner_state').delete().eq('user_id', userId);
    const firstPush = page.waitForResponse((r) => r.url().endsWith('/api/learner-state') && r.request().method() === 'PUT');
    await signIn(page);
    expect((await firstPush).status()).toBe(200);
    const put = await page.request.put('/api/learner-state', {
      data: { state: { done: { m00: true }, quiz: {}, badges: {}, atlas: [], notes: {} }, updatedAt: new Date().toISOString() },
    });
    expect(put.status()).toBe(200);
    const stale = await page.request.put('/api/learner-state', {
      data: { state: { done: {}, quiz: {}, badges: {}, atlas: [], notes: {} }, updatedAt: '2000-01-01T00:00:00.000Z' },
    });
    expect(stale.status()).toBe(409);
    const got = await (await page.request.get('/api/learner-state')).json();
    expect(got.state.done.m00).toBe(true);
    const big = await page.request.put('/api/learner-state', {
      data: { state: { pad: 'x'.repeat(300_000) }, updatedAt: new Date().toISOString() },
    });
    expect(big.status()).toBe(413);
  });
});
