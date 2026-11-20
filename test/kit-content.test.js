const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');

// kitFiles(): walk rules/ skills/ agents/ templates/ for *.md, plus README.md and plugin.json
function kitFiles() {
  const out = ['README.md', 'plugin.json'];
  const walk = rel => {
    for (const e of fs.readdirSync(path.join(ROOT, rel), { withFileTypes: true })) {
      const p = `${rel}/${e.name}`;
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.md')) out.push(p);
    }
  };
  for (const d of ['rules', 'skills', 'agents', 'templates']) walk(d);
  return out;
}

const LEAKED = [/3-Layer/i, /penalty/i, /calendar matrix/i, /5-Context/, /510/, /Telesale/i,
  /attendance/i, /DEFAULT '1\.0'/, /công/];
test('no leaked product-domain vocabulary', () => {
  for (const f of kitFiles().filter(f => !f.startsWith('skills/color-system-design/')))
    for (const re of LEAKED) assert.ok(!re.test(read(f)), `${f} matches ${re}`);
});
test('Cross-Layer Rule is defined once, in AGENTS.md, with the spec wording', () => {
  assert.match(read('rules/AGENTS.md'), /Cross-Layer Rule/);
  assert.match(read('rules/AGENTS.md'), /assert at every layer the change touches; for a typical web app that is data, API, and UI/);
  assert.match(read('rules/AGENTS.md'), /docs\/project_profile\.md/);
});
test('Cross-Layer Rule defining sentence appears only in AGENTS.md', () => {
  const re = /assert(s)? at every layer the change touches/i;
  for (const f of kitFiles())
    assert.strictEqual(re.test(read(f)), f === 'rules/AGENTS.md', `${f} ${f === 'rules/AGENTS.md' ? 'must define' : 'must not restate'} the rule`);
});
test('test_cases template takes layers from the project profile', () => {
  const t = read('templates/test_cases_template.md');
  assert.match(t, /project_profile\.md/);
  assert.doesNotMatch(t, /UI display codes/);
  assert.match(read('templates/project_profile_template.md'), /^## .*Layers/m);
});
test('stack commands appear only as profile examples', () => {
  const allowed = new Set(['templates/project_profile_template.md']);
  for (const f of kitFiles().filter(f => !allowed.has(f)))
    for (const re of [/vue-tsc/, /build-local-with-test/, /gradlew/])
      assert.ok(!re.test(read(f)), `${f} matches ${re}`);
  assert.match(read('skills/review-code/SKILL.md'), /project_profile\.md/);
});
test('frontend taste rules live in responsive-frontend-expert, not AGENTS.md', () => {
  const a = read('rules/AGENTS.md');
  for (const re of [/120%/, /oklch/i, /100dvh/, /Asset-First/i, /44x44/]) assert.doesNotMatch(a, re);
  assert.match(a, /responsive-frontend-expert/);
  const r = read('skills/responsive-frontend-expert/SKILL.md');
  for (const re of [/120%/, /oklch/i, /text-wrap: pretty/, /100dvh/, /44/, /Asset-First/i]) assert.match(r, re);
  assert.match(read('skills/landing-page-design/SKILL.md'), /responsive-frontend-expert/);
});
test('layering follows the project', () => {
  assert.match(read('rules/AGENTS.md'), /project's existing layering/);
  assert.match(read('agents/code-reviewer.md'), /project's existing layering/);
});
