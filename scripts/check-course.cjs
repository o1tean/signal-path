const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const runtime = fs.readFileSync(path.join(root, 'assets/js/site.js'), 'utf8');
const modules = vm.runInNewContext(runtime.match(/SP\.MODULES = (\[[\s\S]*?\n  \]);/)[1]);
const context = {window: {}};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/js/data/quiz-bank.js'), 'utf8'), context);
const bank = context.window.SP_QUIZ_BANK;
assert.equal(new Set(modules.map(m => m.id)).size, modules.length);
assert.equal(modules.length, 19);
for (const m of modules) {
  const html = fs.readFileSync(path.join(root,m.href),'utf8');
  assert.ok(html.includes(`data-page="${m.id}"`), `${m.id}: page id mismatch`);
  assert.ok(html.includes(`data-quiz="${m.id}"`), `${m.id}: no quiz host`);
  assert.ok(bank[m.id]?.length >= 3, `${m.id}: incomplete quiz`);
}
for (const [id, qs] of Object.entries(bank)) for (const q of qs) {
  assert.ok(q.q && q.why && q.opts.length >= 2, id + ': malformed question');
  assert.ok(Number.isInteger(q.a) && q.a >= 0 && q.a < q.opts.length, id + ': invalid answer');
  assert.equal(new Set(q.opts).size, q.opts.length, id + ': duplicate answers');
}
console.log(`PASS: ${modules.length} module routes and ${Object.values(bank).flat().length} quiz questions.`);
