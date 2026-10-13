/* Content consistency check. Run: node scripts/check-content.ts [--strict]
   Fails on: a course module without a lesson, bad lesson H2 order, slug/id mismatch with src/data/course.ts,
   unknown widget/scene/quiz ids, a tools.ts entry without a widget module, paid questions in a free lesson,
   broken internal links, missing legacy redirects. --strict also fails on warnings (thin quiz banks). */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { modules } from '../src/data/course.ts';
import { tools } from '../src/data/tools.ts';
import { glossary } from '../src/data/glossary.ts';
import type { QuizBank } from '../src/data/quiz/types.ts';
import config from '../astro.config.mjs';

const root = new URL('..', import.meta.url).pathname;
const strict = process.argv.includes('--strict');
const errors: string[] = [];
const warnings: string[] = [];
const err = (m: string) => errors.push(m);
const warn = (m: string) => (strict ? errors : warnings).push(m);

export const H2_ORDER = ['Outcome', 'Before you start', 'Understand', 'Predict and practise', 'Check yourself', 'Keep evidence', 'Continue'];

/* ---------- known routes ---------- */
const pagesDir = join(root, 'src/pages');
const staticRoutes = new Set<string>();
function walk(dir: string, prefix = '') {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    if (f.isDirectory()) walk(join(dir, f.name), `${prefix}/${f.name}`);
    else if (/\.(astro|ts|md|mdx)$/.test(f.name) && !f.name.includes('[')) {
      const name = f.name.replace(/\.(astro|ts|md|mdx)$/, '');
      staticRoutes.add(name === 'index' ? prefix || '/' : `${prefix}/${name}`);
    }
  }
}
walk(pagesDir);
const lessonDir = join(root, 'src/content/lessons');
const lessonFiles = readdirSync(lessonDir).filter((f) => f.endsWith('.mdx'));
const widgetIds = new Set(readdirSync(join(root, 'src/widgets')).filter((f) => f.endsWith('.ts') && !['registry.ts', 'types.ts'].includes(f)).map((f) => f.replace(/\.ts$/, '')));
const sceneSrc = readFileSync(join(root, 'src/widgets/scene3d/index.ts'), 'utf8');
const sceneIds = new Set([...(sceneSrc.match(/SCENES = \[([^\]]*)\]/)?.[1] ?? '').matchAll(/'([a-z0-9-]+)'/g)].map((m) => m[1]));
const glossaryIds = new Set(glossary.map((g) => g.id));
/* Node cannot run the import.meta.glob barrels, so load each quiz file directly (same keys as the barrels). */
async function loadBank(dir: string): Promise<QuizBank> {
  const d = join(root, 'src/data/quiz', dir);
  const bank: QuizBank = {};
  for (const f of readdirSync(d).filter((f) => f.endsWith('.ts') && f !== 'index.ts').sort()) bank[f.slice(0, -3)] = (await import(join(d, f))).default;
  return bank;
}
const freeQuiz = await loadBank('free');
const paidQuiz = await loadBank('paid');
const quizIds = new Set([...Object.keys(freeQuiz), ...Object.keys(paidQuiz)]);

function checkLink(href: string, where: string) {
  if (!href.startsWith('/') || href.startsWith('//')) return;
  const [path, hash] = href.split('#');
  const clean = (path.split('?')[0] || '/').replace(/\/$/, '') || '/';
  const learn = clean.match(/^\/learn\/([^/]+)$/);
  if (learn && !staticRoutes.has(clean)) {
    const mod = modules.find((m) => m.slug === learn[1]);
    if (!mod) err(`${where}: link to unknown lesson ${href}`);
    return;
  }
  if (!staticRoutes.has(clean)) return err(`${where}: broken internal link ${href}`);
  if (clean === '/glossary' && hash && !glossaryIds.has(hash)) err(`${where}: no glossary entry #${hash}`);
}

/* ---------- lessons ---------- */
const freeLessonIds = new Set<string>();
for (const file of lessonFiles) {
  const src = readFileSync(join(lessonDir, file), 'utf8');
  const fm = src.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) {
    err(`${file}: missing frontmatter`);
    continue;
  }
  const data = parseYaml(fm[1]) as Record<string, unknown>;
  const body = src.slice(fm[0].length);
  const where = `lessons/${file}`;
  const mod = modules.find((m) => m.id === data.id);
  if (!mod) err(`${where}: id ${String(data.id)} is not in src/data/course.ts`);
  else {
    if (`${mod.slug}.mdx` !== file || data.slug !== mod.slug) err(`${where}: slug must be ${mod.slug} (file and frontmatter)`);
    if (data.number !== mod.n) err(`${where}: number ${String(data.number)} != course.ts ${mod.n}`);
    if (data.badge !== mod.badge) err(`${where}: badge must be ${mod.badge}`);
    if (data.access === 'free') freeLessonIds.add(mod.id);
  }
  const h2s = [...body.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());
  if (h2s.join('|') !== H2_ORDER.join('|')) err(`${where}: H2s must be exactly [${H2_ORDER.join(' · ')}], found [${h2s.join(' · ')}]`);

  const tools = (data.tools as string[]) ?? [];
  const scenes = (data.scenes as string[]) ?? [];
  const usedWidgets = [...body.matchAll(/<Widget\s+name="([^"]+)"/g)].map((m) => m[1]);
  const usedScenes = [...body.matchAll(/<Scene3D\s+name="([^"]+)"/g)].map((m) => m[1]);
  for (const t of new Set([...tools, ...usedWidgets])) {
    if (!widgetIds.has(t)) err(`${where}: unknown widget "${t}"`);
  }
  for (const w of usedWidgets) if (!tools.includes(w)) err(`${where}: <Widget name="${w}"> missing from frontmatter tools`);
  for (const t of tools) if (!usedWidgets.includes(t)) err(`${where}: tools lists "${t}" but the body never mounts it`);
  for (const s of new Set([...scenes, ...usedScenes])) if (!sceneIds.has(s)) err(`${where}: unknown scene "${s}"`);
  for (const s of usedScenes) if (!scenes.includes(s)) err(`${where}: <Scene3D name="${s}"> missing from frontmatter scenes`);
  for (const m of body.matchAll(/<Quiz\s+id="([^"]+)"/g)) {
    if (!quizIds.has(m[1])) err(`${where}: no questions for quiz "${m[1]}"`);
    if (data.access === 'free' && !freeQuiz[m[1]]) err(`${where}: free lesson uses paid quiz "${m[1]}"`);
  }
  for (const m of body.matchAll(/<Term\s+id="([^"]+)"/g)) if (!glossaryIds.has(m[1])) err(`${where}: unknown glossary term "${m[1]}"`);
  for (const m of body.matchAll(/\]\((\/[^)\s]*)\)|href="(\/[^"]*)"/g)) checkLink(m[1] ?? m[2], where);
}
for (const m of modules) if (!lessonFiles.includes(`${m.slug}.mdx`)) err(`lesson ${m.slug}.mdx is missing`);

/* ---------- tools (src/data/tools.ts drives /tools and the home showcase) ---------- */
for (const t of tools) if (!widgetIds.has(t.id)) err(`tools.ts: "${t.id}" has no src/widgets/${t.id}.ts`);
for (const id of widgetIds) if (!tools.some((t) => t.id === id)) err(`src/widgets/${id}.ts is not listed in tools.ts`);

/* ---------- public fragments ---------- */
const fragDir = join(root, 'src/content/pages');
for (const f of readdirSync(fragDir)) {
  const src = readFileSync(join(fragDir, f), 'utf8');
  for (const m of src.matchAll(/href="(\/[^"]*)"/g)) checkLink(m[1], `pages/${f}`);
  for (const m of src.matchAll(/<!--WIDGET:([a-z0-9]+(?:-[a-z0-9]+)*)/g))
    if (!widgetIds.has(m[1])) err(`pages/${f}: unknown widget "${m[1]}"`);
  for (const m of src.matchAll(/<!--QUIZ:([a-z0-9]+(?:-[a-z0-9]+)*)/g)) if (!freeQuiz[m[1]]) err(`pages/${f}: quiz "${m[1]}" is not free`);
}

/* ---------- quiz bank ---------- */
let total = 0;
const seenIds = new Set<string>();
const balance: string[] = [];
for (const [bankName, bank] of [['free', freeQuiz], ['paid', paidQuiz]] as const) {
  for (const [id, qs] of Object.entries(bank)) {
    total += qs.length;
    const counts = [0, 0, 0, 0];
    let longestRight = 0;
    qs.forEach((q, i) => {
      const where = `quiz ${bankName}/${id}[${i}]`;
      if (!q.id?.startsWith(`${id}-q`)) err(`${where}: id "${q.id}" must start with "${id}-q"`);
      else if (seenIds.has(q.id)) err(`${where}: duplicate id ${q.id}`);
      seenIds.add(q.id);
      if (!q.q?.trim() || !q.why?.trim()) err(`${where}: empty question or explanation`);
      if (!Array.isArray(q.options) || q.options.length !== 4) { err(`${where}: needs exactly 4 options`); return; }
      if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) err(`${where}: answer must be 0-3`);
      else counts[q.answer]++;
      if (new Set(q.options).size !== 4) err(`${where}: duplicate options`);
      // length tell: the correct option is the single longest one (short numeric options are exempt)
      const lens = q.options.map((o) => o.length);
      const max = Math.max(...lens);
      if (max > 15 && lens[q.answer] === max && lens.filter((l) => l === max).length === 1) longestRight++;
    });
    // ponytail: a flat cap of 30% (chance is 25%); per-question judgement stays with the writer
    const maxLongest = Math.floor(qs.length * 0.3);
    if (longestRight > maxLongest)
      err(`quiz ${id}: the correct option is the single longest in ${longestRight} of ${qs.length} questions (max ${maxLongest}); lengthen a distractor`);
    if (qs.length < 6) err(`quiz ${id}: ${qs.length} questions, need at least 6`);
    else if (qs.length < 8) warn(`quiz ${id}: ${qs.length} questions, target is 8 or more`);
    const skew = qs.length >= 6 && Math.max(...counts) > Math.ceil(qs.length / 2);
    balance.push(`${id.padEnd(7)} n=${String(qs.length).padStart(2)}  answers 0/1/2/3 = ${counts.join('/')}  longest-correct ${longestRight}${skew ? '  SKEWED' : ''}`);
  }
}
for (const m of modules) if (!freeQuiz[m.id] && !paidQuiz[m.id]) err(`quiz: ${m.id} has no question file`);
for (const id of Object.keys(freeQuiz)) if (paidQuiz[id]) err(`quiz: ${id} is in both the free and the paid bank`);
for (const id of Object.keys(paidQuiz)) if (freeLessonIds.has(id)) err(`quiz: free lesson ${id} must not use the paid bank`);
for (const id of freeLessonIds) if (!freeQuiz[id]) err(`quiz: free lesson ${id} needs its questions in src/data/quiz/free`);
console.log(`Quiz answer balance:\n  ${balance.join('\n  ')}`);

/* ---------- legacy redirects ---------- */
const redirects = (config.redirects ?? {}) as Record<string, string | { status: number; destination: string }>;
const expect: Record<string, string> = {
  '/roadmap.html': '/course', '/legal.html': '/romania-lab-guide', '/notebook.html': '/learn/notebook', '/quiz.html': '/learn/quiz',
  '/playground.html': '/tools', '/primer.html': '/primer', '/reference.html': '/reference', '/glossary.html': '/glossary',
  '/sources.html': '/sources', '/case-studies.html': '/case-studies',
};
for (const m of modules) expect[`/modules/${m.slug}.html`] = `/learn/${m.slug}`;
const legacyModules = join(root, 'legacy/modules');
if (existsSync(legacyModules))
  for (const f of readdirSync(legacyModules)) if (!expect[`/modules/${f}`]) err(`redirects: legacy/modules/${f} has no matching course module`);
for (const [from, to] of Object.entries(expect)) {
  const r = redirects[from];
  const dest = typeof r === 'string' ? r : r?.destination;
  const status = typeof r === 'string' ? 301 : r?.status;
  if (dest !== to || status !== 301) err(`redirects: ${from} must 301 to ${to}`);
  if (!staticRoutes.has(to) && !to.startsWith('/learn/')) err(`redirects: target ${to} has no page`);
}

/* ---------- report ---------- */
for (const w of warnings) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`error ${e}`);
console.log(
  `${errors.length ? 'FAIL' : 'PASS'}: ${lessonFiles.length}/${modules.length} lessons, ${total} quiz questions, ${widgetIds.size} widget(s) ported, ${Object.keys(expect).length} legacy redirects checked, ${warnings.length} warning(s).`,
);
process.exit(errors.length ? 1 : 0);
