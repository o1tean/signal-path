import { defineConfig, devices } from '@playwright/test';

/* Runs against the shared dev server on :4321 and never stops it. The sign-in spec needs the local Supabase stack
   (`npx supabase start`) and skips itself without one. */
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  globalSetup: './tests/e2e/global-setup.ts',
  // Several agents run Playwright at once and share test-results/, so local runs keep no trace artifacts.
  use: { baseURL: 'http://localhost:4321', trace: process.env.CI ? 'retain-on-failure' : 'off' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npx astro dev --port 4321',
    url: 'http://localhost:4321',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
