/* Ensures a confirmed local test user exists. Credentials are generated once and kept in .e2e-user.json at the repo
   root (gitignored, mode 600); they are never printed. Never writes a .env* file: that would restart the shared dev server. */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { admin, E2E_USER_FILE, localStackUp, type E2EUser } from './env';

export default async function globalSetup() {
  if (!(await localStackUp())) return;
  let user: E2EUser;
  if (existsSync(E2E_USER_FILE)) user = JSON.parse(readFileSync(E2E_USER_FILE, 'utf8'));
  else {
    user = { email: `e2e-${randomBytes(4).toString('hex')}@example.test`, password: randomBytes(18).toString('base64url') };
    writeFileSync(E2E_USER_FILE, JSON.stringify(user, null, 2), { mode: 0o600 });
  }
  const { error } = await admin().auth.admin.createUser({ email: user.email, password: user.password, email_confirm: true });
  if (error && error.code !== 'email_exists') throw new Error(`could not create the e2e user: ${error.code}`);
}
