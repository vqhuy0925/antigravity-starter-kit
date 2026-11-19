'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { runHook, cmd, makeRepo, write, stage } = require('./helpers');

const run = (dir, c = 'git commit -m x', extra = {}) =>
  runHook('plan-boundary.js', { ...cmd(c, dir), ...extra });

test('asks when no plan exists', () => {
  const dir = makeRepo({ branch: 'feat/login' }); write(dir, 'src/a.ts', '1'); stage(dir, 'src/a.ts');
  const r = run(dir); assert.strictEqual(r.decision, 'ask'); assert.match(r.reason, /docs\/plans\/feat-login\.md/);
});
test('allows files listed by path in docs/plans/<slug>.md', () => {
  const dir = makeRepo({ branch: 'feat/login', files: { 'docs/plans/feat-login.md': '- `src/auth/login.ts`\n' } });
  write(dir, 'src/auth/login.ts', '1'); stage(dir, 'src/auth/login.ts');
  assert.strictEqual(run(dir).decision, 'allow');
});
test('asks on basename collision', () => {
  const dir = makeRepo({ branch: 'feat/a', files: { 'docs/plans/feat-a.md': '- `index.ts`\n', 'lib/index.ts': '0' } });
  write(dir, 'src/index.ts', '1'); write(dir, 'lib/index.ts', '1'); stage(dir, 'src/index.ts', 'lib/index.ts');
  assert.strictEqual(run(dir).decision, 'ask');
});
test('allows files under a listed directory', () => {
  const dir = makeRepo({ branch: 'feat/a', files: { 'docs/plans/feat-a.md': '- `src/auth/`\n' } });
  write(dir, 'src/auth/x.ts', '1'); stage(dir, 'src/auth/x.ts');
  assert.strictEqual(run(dir).decision, 'allow');
});
test('matches backslash paths and CRLF plans', () => {
  const dir = makeRepo({ branch: 'feat/a', files: { 'docs/plans/feat-a.md': '- `src\\auth\\login.ts`\r\n' } });
  write(dir, 'src/auth/login.ts', '1'); stage(dir, 'src/auth/login.ts');
  assert.strictEqual(run(dir).decision, 'allow');
});
test('checks files staged by the same chain', () => {
  const dir = makeRepo({ branch: 'feat/a', files: { 'docs/plans/feat-a.md': '- `src/a.ts`\n' } });
  write(dir, 'src/a.ts', '1'); write(dir, 'src/extra.ts', '1');
  assert.strictEqual(run(dir, 'git add -A && git commit -m x').decision, 'ask');
});
test('detached HEAD falls back to implementation_plan.md', () => {
  const dir = makeRepo({ files: { 'implementation_plan.md': '- `src/a.ts`\n' } });
  execFileSync('git', ['checkout', '--detach'], { cwd: dir });
  write(dir, 'src/a.ts', '1'); stage(dir, 'src/a.ts');
  assert.strictEqual(run(dir).decision, 'allow');
});
test('uses artifactDirectoryPath plan', () => {
  const dir = makeRepo({ branch: 'feat/a' }); const art = fs.mkdtempSync(path.join(os.tmpdir(), 'art-'));
  fs.writeFileSync(path.join(art, 'implementation_plan.md'), '- `src/a.ts`\n');
  write(dir, 'src/a.ts', '1'); stage(dir, 'src/a.ts');
  assert.strictEqual(run(dir, 'git commit -m x', { artifactDirectoryPath: art }).decision, 'allow');
});
test('ignores non-commit commands', () => assert.strictEqual(run(makeRepo(), 'git status').decision, 'allow'));
test('plan file itself never counts as scope creep', () => {
  const dir = makeRepo({ branch: 'feat/a', files: { 'docs/plans/feat-a.md': '- `src/a.ts`\n' } });
  write(dir, 'docs/plans/feat-a.md', '- `src/a.ts`\n- `src/b.ts`\n'); stage(dir, 'docs/plans/feat-a.md');
  assert.strictEqual(run(dir).decision, 'allow');
});
test('sudo-prefixed commit with no plan asks', () => {
  const dir = makeRepo({ branch: 'feat/a' }); write(dir, 'src/a.ts', '1'); stage(dir, 'src/a.ts');
  assert.strictEqual(run(dir, 'sudo git commit -m x').decision, 'ask');
});
test('commit inside bash -c with no plan asks', () => {
  const dir = makeRepo({ branch: 'feat/a' }); write(dir, 'src/a.ts', '1'); stage(dir, 'src/a.ts');
  assert.strictEqual(run(dir, 'bash -c "git commit -m x"').decision, 'ask');
});
test('git -C <dir> commit is detected', () => {
  const dir = makeRepo({ branch: 'feat/a' }); write(dir, 'src/a.ts', '1'); stage(dir, 'src/a.ts');
  assert.strictEqual(run(dir, 'git -C . commit -m x').decision, 'ask');
});
test('commit -am includes unstaged tracked changes', () => {
  const dir = makeRepo({ branch: 'feat/a', files: { 'docs/plans/feat-a.md': '- `src/a.ts`\n', 'src/z.ts': '0' } });
  write(dir, 'src/z.ts', '1');
  assert.strictEqual(run(dir, 'git commit -am x').decision, 'ask');
});
test('detached HEAD with no plan reports <detached>', () => {
  const dir = makeRepo(); execFileSync('git', ['checkout', '--detach'], { cwd: dir });
  write(dir, 'src/a.ts', '1'); stage(dir, 'src/a.ts');
  const r = run(dir); assert.strictEqual(r.decision, 'ask'); assert.match(r.reason, /<detached>/);
});
test('exports helpers', () => {
  const pb = require('../hooks/plan-boundary');
  assert.strictEqual(pb.planSlug('feat/a/b'), 'feat-a-b');
  assert.deepStrictEqual([...pb.extractPlanPaths('- `./src\\a.ts`\n- docs/x.md foo\n')].sort(), ['docs/x.md', 'src/a.ts']);
  assert.strictEqual(pb.isCovered('a/b.ts', new Set(['a/']), { stagedFiles: [], trackedFiles: [] }), true);
});
test('commit with a pathspec checks unstaged named paths', () => {
  const dir = makeRepo({ branch: 'feat/a', files: { 'docs/plans/feat-a.md': '- `src/a.ts`\n', 'src/unplanned.ts': '0' } });
  write(dir, 'src/unplanned.ts', '1');
  assert.strictEqual(run(dir, 'git commit -m x src/unplanned.ts').decision, 'ask');
  assert.strictEqual(run(dir, 'git commit -m x -- src/unplanned.ts').decision, 'ask');
});
test('git -C <dir> commit resolves the repo from <dir>', () => {
  const dir = makeRepo({ branch: 'feat/login' }); write(dir, 'src/a.ts', '1'); stage(dir, 'src/a.ts');
  const r = runHook('plan-boundary.js', cmd(`git -C ${path.basename(dir)} commit -m x`, path.dirname(dir)));
  assert.strictEqual(r.decision, 'ask'); assert.match(r.reason, /docs\/plans\/feat-login\.md/);
});
test('multi-word commit message words are not pathspecs', () => {
  const dir = makeRepo({ branch: 'feat/a', files: { 'docs/plans/feat-a.md': '- `src/a.ts`\n', 'lib/x.ts': '0' } });
  write(dir, 'src/a.ts', '1'); stage(dir, 'src/a.ts'); write(dir, 'lib/x.ts', '1');
  assert.strictEqual(run(dir, 'git commit -m "update lib stuff"').decision, 'allow');
});
