/* Real magic-link sign-in against the local Supabase stack: /login form, email from Mailpit, /auth/callback. */
import { expect, test, type Page } from '@playwright/test';

// Only in the body of 02-modulation (the description, which is public, mentions AM650).
const PAID_MARKER = 'FuriHalSubGhzPresetOok650Async';
import { admin, e2eUser, env, localStackUp, MAILPIT, userId } from './env';

test.describe.configure({ mode: 'serial' });

async function latestLink(email: string, after: number): Promise<string> {
  for (let i = 0; i < 30; i++) {
    const res = await fetch(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:"${email}"`)}&limit=1`);
    const msg = (await res.json()).messages?.[0];
    if (msg && Date.parse(msg.Created) >= after) {
      const body = await (await fetch(`${MAILPIT}/api/v1/message/${msg.ID}`)).json();
      const href = /href="([^"]+\/auth\/v1\/verify[^"]+)"/.exec(body.HTML ?? '')?.[1];
      if (href) return href.replaceAll('&amp;', '&');
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('no sign-in email arrived');
}

async function signIn(page: Page, email: string, next: string) {
  const sent = Date.now() - 1000;
  await page.routeWebSocket(/.*/, () => {}); // other agents edit files on the shared server; no HMR reloads mid-test
  await page.goto(`/login?next=${encodeURIComponent(next)}`);
  // The local stack allows one email per address per second (auth.email.max_frequency), and platform.spec.ts may
  // have issued a link for the same learner a moment ago; the page then shows its rate-limit notice, so ask again.
  const inbox = page.getByRole('heading', { name: 'Check your inbox.' });
  for (let attempt = 0; attempt < 3 && !(await inbox.isVisible()); attempt++) {
    if (attempt) await page.waitForTimeout(1500);
    await page.getByLabel('Email address').fill(email);
    await page.getByRole('button', { name: 'Email me a sign-in link' }).click();
    await page.waitForLoadState();
  }
  await expect(inbox).toBeVisible();
  await page.goto(await latestLink(email, sent));
  await page.waitForURL(`**${next}`);
}

test('signed-in learners see the paywall until an entitlement exists', async ({ page }) => {
  test.skip(!(await localStackUp()), 'local Supabase stack is not running');
  const email = e2eUser().email;
  const id = await userId(email);
  const db = admin();
  await db.from('entitlements').delete().eq('user_id', id);

  await signIn(page, email, '/learn/02-modulation');
  await expect(page.locator('[data-paywall="signed-in"]')).toBeVisible();
  await expect(page.locator('[data-auth="account"]')).toBeVisible();
  expect(await page.content()).not.toContain(PAID_MARKER);
  expect((await page.request.get('/api/downloads/lab-notebook.md')).status()).toBe(403);

  const checkout = await page.request.post('/api/checkout', { data: { product_id: 'course-complete' } });
  if (!env.STRIPE_SECRET_KEY) expect(await checkout.json()).toMatchObject({ error: 'not-configured', message: 'Checkout is not configured yet.' });
  expect(checkout.status()).toBe(env.STRIPE_SECRET_KEY ? 200 : 503);
  expect((await page.request.post('/api/checkout', { data: { product_id: 'nope' } })).status()).toBe(env.STRIPE_SECRET_KEY ? 400 : 503);

  const { error } = await db.from('entitlements').insert({ user_id: id, product_id: 'course-complete', status: 'active' });
  expect(error).toBeNull();
  try {
    await page.reload();
    await expect(page.locator('[data-paywall]')).toHaveCount(0);
    expect(await page.content()).toContain(PAID_MARKER);

    const file = await page.request.get('/api/downloads/lab-notebook.md');
    expect(file.status()).toBe(200);
    expect(file.headers()['cache-control']).toContain('no-store');
    expect((await page.request.get('/api/downloads/README.md')).status()).toBe(404);
    expect((await page.request.get('/api/downloads/..%2F..%2F.env')).status()).toBe(404);

    const ent = await (await page.request.get('/api/entitlements')).json();
    expect(ent.entitlements).toContain('course-complete');

    await page.goto('/account');
    await expect(page.locator('[data-access-status]')).toHaveText('Open: all 19 lessons');
  } finally {
    await db.from('entitlements').delete().eq('user_id', id);
  }
});
