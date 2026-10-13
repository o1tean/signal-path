// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { checkoutIdempotencyKey, checkoutSessionParams, validateCheckout } from '@/lib/stripe';
import { afterLogin } from '@/lib/supabase/auth';
import { safeNext } from '@/lib/supabase/server';

const prices = { 'course-complete': 'price_123' };

describe('validateCheckout', () => {
  it('accepts the Complete product when a price is configured', () => {
    expect(validateCheckout('course-complete', [], prices)).toEqual({ ok: true, productId: 'course-complete', price: 'price_123' });
  });
  it('rejects unknown, free and unavailable products with 400', () => {
    for (const p of ['nope', null, undefined, 42, 'mentored-path'])
      expect(validateCheckout(p, [], prices)).toMatchObject({ ok: false, status: 400 });
  });
  it('returns 503 when the price id is missing', () => {
    expect(validateCheckout('course-complete', [], {})).toMatchObject({ ok: false, status: 503, error: 'not-configured' });
  });
  it('returns 409 when the user already owns it', () => {
    expect(validateCheckout('course-complete', ['course-complete'], prices)).toMatchObject({ ok: false, status: 409 });
  });
});

describe('checkoutSessionParams', () => {
  it('ties the session to the user and product', () => {
    const p = checkoutSessionParams({ id: 'u1', email: 'a@b.c' }, 'course-complete', 'price_123', 'https://x.test');
    expect(p).toMatchObject({
      mode: 'payment',
      client_reference_id: 'u1',
      customer_email: 'a@b.c',
      metadata: { product_id: 'course-complete', price_id: 'price_123' },
      line_items: [{ price: 'price_123', quantity: 1 }],
      success_url: 'https://x.test/checkout/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://x.test/checkout/cancel',
    });
  });
});

describe('afterLogin', () => {
  it('sends buy intents to /checkout and keeps other same-site paths', () => {
    expect(afterLogin('/pricing#buy')).toBe('/checkout');
    expect(afterLogin('/learn/02-modulation')).toBe('/learn/02-modulation');
    expect(afterLogin('/pricing')).toBe('/pricing');
  });
  it('refuses off-site destinations', () => {
    expect(afterLogin('https://evil.test')).toBe('/learn');
    expect(afterLogin('//evil.test')).toBe('/learn');
    expect(afterLogin('/\\evil.test')).toBe('/learn');
    expect(afterLogin(null)).toBe('/learn');
  });
});

describe('safeNext', () => {
  it('keeps same-site paths with query and hash', () => {
    expect(safeNext('/learn/02-modulation?x=1#quiz')).toBe('/learn/02-modulation?x=1#quiz');
    expect(safeNext('/account')).toBe('/account');
  });
  it('refuses anything a browser could resolve to another origin', () => {
    for (const bad of ['/\t/evil.example', '/\n/evil.example', '/\r/evil', decodeURIComponent('/%09/evil.example'), '//evil', '/\\evil', 'https://evil.test', 'evil', '', null, undefined])
      expect(safeNext(bad)).toBe('/learn');
  });
  it('treats encoded tabs as a plain path segment', () => {
    expect(safeNext('/%09/evil.example')).toBe('/%09/evil.example');
  });
});

describe('checkoutIdempotencyKey', () => {
  it('is stable inside a 10-minute window and changes after it', () => {
    const t = 1_800_000_000_000;
    expect(checkoutIdempotencyKey('u1', 'course-complete', t)).toBe(checkoutIdempotencyKey('u1', 'course-complete', t + 1000));
    expect(checkoutIdempotencyKey('u1', 'course-complete', t)).not.toBe(checkoutIdempotencyKey('u1', 'course-complete', t + 600_000));
  });
});
