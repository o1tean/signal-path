const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const context = {window: {}};
vm.runInNewContext(fs.readFileSync(path.join(root, 'assets/js/data/course.js'), 'utf8'), context);
const {modules, badges, stages} = context.window.SP_COURSE;
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/js/data/quiz-bank.js'), 'utf8'), context);
const bank = context.window.SP_QUIZ_BANK;
assert.equal(new Set(modules.map(m => m.id)).size, modules.length);
assert.equal(new Set(modules.map(m => m.href)).size, modules.length);
assert.equal(new Set(badges.map(b => b.id)).size, badges.length);
assert.equal(modules.length, 19);
assert.equal(new Set(stages.map(s => s.id)).size, stages.length);
assert.deepEqual(Array.from(stages.flatMap(s => s.modules)), Array.from(modules.map(m => m.id)),
  'Stages must include every module exactly once in learning order');
for (const stage of stages) {
  assert.ok(stage.title && stage.label && stage.description && stage.evidence && stage.modules.length,
    `${stage.id}: incomplete stage`);
}
// Every entry point must load the catalog before the runtime, including nested and 404 pages.
for (const dir of ['', 'modules']) for (const file of fs.readdirSync(path.join(root, dir))) {
  if (!file.endsWith('.html')) continue;
  const html = fs.readFileSync(path.join(root, dir, file), 'utf8');
  const scripts = [...html.matchAll(/<script\s+src="([^"]+)"/g)].map(match => match[1]);
  const catalog = scripts.findIndex(src => src.endsWith('assets/js/data/course.js'));
  const runtime = scripts.findIndex(src => src.endsWith('assets/js/site.js'));
  assert.ok(catalog >= 0 && catalog < runtime, `${dir}/${file}: catalog must load before runtime`);
}
for (const m of modules) {
  const html = fs.readFileSync(path.join(root,m.href),'utf8');
  assert.ok(html.includes(`data-page="${m.id}"`), `${m.id}: page id mismatch`);
  assert.ok(html.includes(`data-quiz="${m.id}"`), `${m.id}: no quiz host`);
  assert.ok(bank[m.id]?.length >= 3, `${m.id}: incomplete quiz`);
  assert.ok(badges.some(b => b.id === m.badge), `${m.id}: missing badge`);
}
for (const [id, qs] of Object.entries(bank)) {
  assert.ok(id === 'primer' || modules.some(m => m.id === id), `${id}: orphan quiz`);
  for (const q of qs) {
    assert.ok(q.q && q.why && q.opts.length >= 2, id + ': malformed question');
    assert.ok(Number.isInteger(q.a) && q.a >= 0 && q.a < q.opts.length, id + ': invalid answer');
    assert.equal(new Set(q.opts).size, q.opts.length, id + ': duplicate answers');
  }
}
console.log(`PASS: ${stages.length} stages, ${modules.length} module routes, catalog loading and ${Object.values(bank).flat().length} quiz questions.`);
