/* Run after `astro build`: fails if any paid quiz question text appears in dist/client (the public files),
   or if a secret key shape or the value of a configured secret appears anywhere in dist/ (server chunks included;
   secrets are read at runtime through astro:env/server and must never be inlined).
   Positive control: a free primer question must be found, so a broken scan cannot pass silently. */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadEnv } from 'vite';
import type { QuizQuestion } from '../src/data/quiz/types.ts';

const root = new URL('..', import.meta.url).pathname;
const client = join(root, 'dist/client');
const decode = (s: string) => s.replace(/&quot;|&#34;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\\"/g, '"');
const files = (readdirSync(client, { recursive: true, withFileTypes: true }) as import('node:fs').Dirent[])
  .filter((f) => f.isFile() && /\.(html|js|mjs|json|css|txt|xml)$/.test(f.name))
  .map((f) => decode(readFileSync(join(f.parentPath, f.name), 'utf8')));

async function questions(dir: string): Promise<string[]> {
  const d = join(root, 'src/data/quiz', dir);
  const out: string[] = [];
  for (const f of readdirSync(d).filter((f) => /^m?\w+\.ts$/.test(f) && f !== 'index.ts'))
    out.push(...((await import(join(d, f))).default as QuizQuestion[]).map((q) => q.q));
  return out;
}

const paid = await questions('paid');
const leaked = paid.filter((q) => files.some((t) => t.includes(q)));
const primer = (await import(join(root, 'src/data/quiz/free/primer.ts'))).default as QuizQuestion[];
const control = files.some((t) => t.includes(primer[0].q));

const SECRET_SHAPE = /\b(?:sb_secret_|sk_(?:live|test)_|rk_(?:live|test)_|whsec_)[A-Za-z0-9_-]{8,}/;
const env = { ...loadEnv('production', root, ''), ...process.env };
const secretValues = ['SUPABASE_SECRET_KEY', 'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET']
  .map((k) => env[k])
  .filter((v): v is string => typeof v === 'string' && v.length >= 8);
const everything = (readdirSync(join(root, 'dist'), { recursive: true, withFileTypes: true }) as import('node:fs').Dirent[])
  .filter((f) => f.isFile() && /\.(html|js|mjs|cjs|json|css|txt|xml|map)$/.test(f.name))
  .map((f) => ({ path: join(f.parentPath, f.name).slice(root.length), text: readFileSync(join(f.parentPath, f.name), 'utf8') }));
const secretHits = everything.filter((f) => SECRET_SHAPE.test(f.text) || secretValues.some((v) => f.text.includes(v)));
for (const f of secretHits) console.error(`error secret-shaped string or configured secret value in ${f.path}`);

if (!control) console.error('error control: the first primer question is not in dist/client; the scan is not working (run astro build first)');
for (const q of leaked) console.error(`error paid question in dist/client: ${q}`);
const failed = leaked.length > 0 || !control || secretHits.length > 0;
console.log(
  `${failed ? 'FAIL' : 'PASS'}: ${paid.length} paid questions checked against ${files.length} public files, ${leaked.length} leaked; ` +
    `${everything.length} dist files scanned for secrets (${secretValues.length} configured values), ${secretHits.length} hit.`,
);
process.exit(failed ? 1 : 0);
