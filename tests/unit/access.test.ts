import { describe, expect, it } from 'vitest';
import { devBypass, hasAccess } from '@/lib/access';

const prod = { DEV: false, SP_DEV_BYPASS: '1' };
const dev = (bypass?: string) => ({ DEV: true, SP_DEV_BYPASS: bypass });

describe('hasAccess', () => {
  it('always opens free lessons', () => {
    expect(hasAccess({}, 'free', prod)).toBe(true);
  });
  it('opens paid lessons for course-complete or mentored-path only', () => {
    expect(hasAccess({ entitlements: ['course-complete'] }, 'paid', prod)).toBe(true);
    expect(hasAccess({ entitlements: ['mentored-path'] }, 'paid', prod)).toBe(true);
    expect(hasAccess({ entitlements: ['something-else'] }, 'paid', prod)).toBe(false);
    expect(hasAccess({ entitlements: [] }, 'paid', prod)).toBe(false);
    expect(hasAccess({}, 'paid', prod)).toBe(false);
  });
  it('honours SP_DEV_BYPASS only in dev', () => {
    expect(devBypass(prod)).toBe(false);
    expect(devBypass(dev('0'))).toBe(false);
    expect(devBypass(dev())).toBe(false);
    expect(devBypass(dev('1'))).toBe(true);
    expect(hasAccess({}, 'paid', dev('1'))).toBe(true);
    expect(hasAccess({}, 'paid', prod)).toBe(false);
  });
});
