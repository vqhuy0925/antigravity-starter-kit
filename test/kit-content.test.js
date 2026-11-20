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
  /attendance/i, /DEFAULT '1\.0'/, /công/, /\b(3|three) layers\b/i];
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
test('fix-bug writes the failing test first only at a correct seam', () => {
  const f = read('skills/fix-bug/SKILL.md');
  assert.match(f, /correct seam/);
  assert.match(f, /diagnosing-bugs/);
  assert.match(f, /no correct seam/i);
  assert.match(f.split(/\r?\n/).find(l => /Permanent Institutional Memory/.test(l)), /seam/);
});
test('code-reviewer empty-catch rule applies to all changes, not only frontend', () => {
  const c = read('agents/code-reviewer.md');
  assert.ok(c.indexOf('empty catch') !== -1 && c.indexOf('empty catch') < c.indexOf('Frontend & Mobile Ergonomics'));
});
test('no dangling skill references; slice order stated in implement', () => {
  assert.doesNotMatch(read('skills/tdd/SKILL.md'), /`code-review`/);
  assert.match(read('skills/tdd/SKILL.md'), /`review-code`/);
  assert.doesNotMatch(read('skills/ai-native-sdlc/SKILL.md'), /`\/deploy`/);
  assert.match(read('skills/wait-what/SKILL.md'), /domain-modeling/);
  assert.match(read('skills/implement/SKILL.md'), /vertical slice/i);
  const w = read('skills/writing-for-agents/SKILL.md');
  assert.doesNotMatch(w, /CLAUDE\.md/);
  assert.match(w, /GEMINI\.md/);
});

test('removed grilling aliases are not referenced', () => {
  for (const f of kitFiles()) assert.doesNotMatch(read(f), /grill-me|grill-with-docs/, f);
  assert.match(read('skills/grilling/SKILL.md'), /^## With docs/m);
  assert.match(read('skills/grilling/SKILL.md'), /skills\/domain-modeling\/SKILL\.md/);
});

test('no Claude Code skill mechanics remain', () => {
  for (const f of kitFiles()) {
    assert.doesNotMatch(read(f), /Skill tool/, f);
    assert.doesNotMatch(read(f), /disable-model-invocation/, f);
  }
});
test('every skills/<name>/SKILL.md path named in the kit exists', () => {
  for (const f of kitFiles())
    for (const m of read(f).matchAll(/(?<![\w\/.-])skills\/([a-z0-9-]+)\/SKILL\.md/g))
      assert.ok(fs.existsSync(path.join(ROOT, 'skills', m[1], 'SKILL.md')), `${f} -> ${m[0]}`);
});
test('request-only skills say so in their description', () => {
  for (const s of ['improve-codebase-architecture', 'to-spec', 'to-tickets', 'wait-what', 'wayfinder']) {
    const desc = read(`skills/${s}/SKILL.md`).match(/^description:(.*)$/m)[1];
    assert.match(desc, /only when the user asks/i, s);
  }
});

test('tool names match Antigravity; research skill folded into token-optimization', () => {
  for (const f of kitFiles()) {
    assert.doesNotMatch(read(f), /grep_search|view_file|smart-researcher/, f);
    assert.doesNotMatch(read(f), /<=\s*100 lines|≤\s*100 lines/, f);
  }
  const t = read('skills/token-optimization/SKILL.md');
  assert.match(t, /read_file/);
  assert.match(t, /Key Files/);
});

test('fix-bug routes diagnosis to diagnosing-bugs without repeating it', () => {
  const f = read('skills/fix-bug/SKILL.md');
  assert.match(f, /skills\/diagnosing-bugs\/SKILL\.md/);
  assert.doesNotMatch(f, /Reproduce as Failing Test/);
  assert.match(f, /Phase 6/);
  assert.match(read('skills/start-day/SKILL.md'), /\| \*\*Bug[^|]*\|\s*`fix-bug`/);
});

test('planning boundary stated once in plan', () => {
  const p = read('skills/plan/SKILL.md');
  assert.match(p, /^## Which planning skill/m);
  for (const s of ['to-tickets', 'wayfinder']) {
    assert.match(p, new RegExp('`' + s + '`'));
    assert.match(read(`skills/${s}/SKILL.md`), /skills\/plan\/SKILL\.md/);
  }
});

test('code-reviewer owns the audit checklist', () => {
  const r = read('skills/review-code/SKILL.md');
  assert.match(r, /agents\/code-reviewer\.md/);
  assert.doesNotMatch(r, /SQL Injection/i);
  const c = read('agents/code-reviewer.md');
  assert.match(c, /SRP/);
  assert.match(c, /modern-web-guidance/);
  assert.doesNotMatch(c, /Controllers only orchestrate/);
});
