import { expect, test } from '@playwright/test';

const URL = 'http://localhost:4321/dev/widgets/signal-atlas';
test.use({ baseURL: 'http://localhost:4321' });

test('signal-atlas: add, validate, edit, sample, export, delete', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto(URL);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  const w = page.locator('#full [data-widget="signal-atlas"]');
  const status = w.getByRole('status');
  await expect(w.getByText('No devices yet')).toBeVisible();
  const h = (await status.boundingBox())!.height;

  // validation
  await w.getByRole('button', { name: 'Add device' }).click();
  await expect(status).toContainText('Give the device a name first');
  await w.getByLabel('Name', { exact: true }).fill('Garage remote');
  await w.getByLabel('Frequency').fill('abc');
  await w.getByRole('button', { name: 'Add device' }).click();
  await expect(status).toContainText('Frequency should include a number');

  // add (keyboard submit)
  await w.getByLabel('Frequency').fill('315 MHz');
  await w.getByLabel('Code type').selectOption('Rolling');
  await w.getByLabel('Frequency').press('Enter');
  await expect(status).toContainText('Logged Garage remote');
  await expect(w.getByText('1 device · 1 rolling')).toBeVisible();

  // edit
  await w.getByRole('button', { name: 'Edit Garage remote' }).click();
  await w.getByLabel('Name', { exact: true }).fill('Garage opener');
  await w.getByRole('button', { name: 'Save changes' }).click();
  await expect(status).toContainText('Updated Garage opener');
  await expect(w.getByRole('cell', { name: 'Garage opener', exact: true })).toBeVisible();

  // samples, idempotent
  await w.getByRole('button', { name: 'Add sample entries' }).click();
  await expect(w.getByText('5 devices · 2 rolling')).toBeVisible();
  await w.getByRole('button', { name: 'Add sample entries' }).click();
  await expect(status).toContainText('already in your atlas');

  // both instances share the store
  await expect(page.locator('#compact')).toContainText('5 devices · 2 rolling');
  await expect(page.locator('#compact')).not.toContainText('capstone deliverable');

  // export
  await w.getByRole('button', { name: 'Export CSV' }).click();
  const ta = w.getByLabel(/Exported atlas data/);
  await expect(ta).toHaveValue(/^name,category,frequency,modulation,protocol,codeType,notes\nGarage opener,/);
  await w.getByRole('button', { name: 'Export JSON' }).click();
  await expect(ta).toHaveValue(/"name": "Practice NFC card"/);

  // persisted through the learner store
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('signalpath.v2') || '{}').atlas.length)).toBe(5);

  // delete
  await w.getByRole('button', { name: 'Delete Garage opener' }).click();
  await expect(w.getByText('4 devices · 1 rolling')).toBeVisible();
  expect((await status.boundingBox())!.height).toBe(h);

  for (const theme of ['light', 'dark'] as const) {
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
    await w.scrollIntoViewIfNeeded();
    await w.screenshot({ path: `docs/v2/screenshots/widgets/signal-atlas-${theme}.png` });
  }
  expect(errors).toEqual([]);
});

test('signal-atlas: edit survives a delete in the other instance, keyboard focus, remount, 360px, reduced motion', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(URL);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  const full = page.locator('#full [data-widget="signal-atlas"]');
  const compact = page.locator('#compact [data-widget="signal-atlas"]');

  // rapid repeats: double click on samples adds each only once
  await full.getByRole('button', { name: 'Add sample entries' }).dblclick();
  await expect(full.getByText('4 devices · 1 rolling')).toBeVisible();

  // no horizontal page scroll at 360px (the table scrolls inside its own region)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  // edit "Practice NFC card" in full, delete the first row from compact: edit must still hit the right row
  await full.getByRole('button', { name: 'Edit Practice NFC card' }).click();
  await compact.getByRole('button', { name: 'Delete Front doorbell' }).click();
  await full.getByLabel('Name', { exact: true }).fill('Renamed card');
  await full.getByRole('button', { name: 'Save changes' }).click();
  await expect(full.getByRole('cell', { name: 'Renamed card', exact: true })).toBeVisible();
  await expect(full.getByText('3 devices · 1 rolling')).toBeVisible();

  // deleting the row being edited in another instance resets the form
  await full.getByRole('button', { name: 'Edit Renamed card' }).click();
  await compact.getByRole('button', { name: 'Delete Renamed card' }).click();
  await expect(full.getByRole('button', { name: 'Add device' })).toBeVisible();

  // keyboard only: focus lands on a Delete button, not <body>, after deleting
  await full.getByRole('button', { name: 'Delete Simulated rolling remote' }).focus();
  await page.keyboard.press('Enter');
  expect(await page.evaluate(() => document.activeElement?.tagName)).toBe('BUTTON');
  await full.getByRole('button', { name: 'Delete Unenrolled training tag' }).focus();
  await page.keyboard.press('Enter');
  await expect(full.getByText('No devices yet')).toBeVisible();
  expect(await page.evaluate(() => document.activeElement?.tagName)).toBe('BUTTON');

  // theme switch while mounted does not throw; mount twice more
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  const mod = await page.evaluate(async () => {
    const path = '/src/widgets/signal-atlas.ts';
    const m = await import(/* @vite-ignore */ path);
    const h = document.createElement('div');
    document.body.append(h);
    const c1 = m.mount(h, {});
    c1();
    const c2 = m.mount(h, {});
    const mounted = h.querySelectorAll('form').length;
    c2();
    return { mounted, after: h.childElementCount };
  });
  expect(mod).toEqual({ mounted: 1, after: 0 });
  expect(errors).toEqual([]);
});
