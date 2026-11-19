'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { linkHooks } = require('../bin/link-hooks');

const ROOT = path.join(__dirname, '..');

function freshKit(withHooks, sub) {
  let dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-'));
  if (sub) { dir = path.join(dir, sub); fs.mkdirSync(dir); }
  fs.copyFileSync(path.join(ROOT, 'hooks.json'), path.join(dir, 'hooks.json'));
  if (withHooks) {
    fs.mkdirSync(path.join(dir, 'hooks'));
    for (const f of fs.readdirSync(path.join(ROOT, 'hooks'))) {
      fs.copyFileSync(path.join(ROOT, 'hooks', f), path.join(dir, 'hooks', f));
    }
  }
  return dir;
}

const commands = (dir) =>
  JSON.parse(fs.readFileSync(path.join(dir, 'hooks.json'), 'utf8'))
    ['antigravity-guardrails'].PreToolUse[0].hooks.map(h => h.command);

test('rewrites relative hook commands to absolute paths', () => {
  const dir = freshKit(false);
  linkHooks(dir);
  const abs = dir.replace(/\\/g, '/');
  assert.deepStrictEqual(commands(dir), ['git-guardrail.js', 'secret-scan.js', 'plan-boundary.js']
    .map(f => `node "${abs}/hooks/${f}"`));
});

test('is idempotent', () => {
  const dir = freshKit(false);
  const first = linkHooks(dir);
  assert.deepStrictEqual(first, { changed: 3, linked: 3 });
  const a = fs.readFileSync(path.join(dir, 'hooks.json'));
  const second = linkHooks(dir);
  assert.deepStrictEqual(second, { changed: 0, linked: 3 });
  assert.ok(a.equals(fs.readFileSync(path.join(dir, 'hooks.json'))));
});

test('leaves non-matching commands untouched', () => {
  const dir = freshKit(false);
  const file = path.join(dir, 'hooks.json');
  const json = JSON.parse(fs.readFileSync(file, 'utf8'));
  json['antigravity-guardrails'].PreToolUse[0].hooks[0].command = 'python other.py';
  fs.writeFileSync(file, JSON.stringify(json, null, 2));
  assert.strictEqual(linkHooks(dir).changed, 2);
  assert.strictEqual(commands(dir)[0], 'python other.py');
});

for (const sub of [null, 'kit dir']) test(`linked command runs the hook from an unrelated cwd${sub ? ' (dir with space)' : ''}`, () => {
  const dir = freshKit(true, sub);
  linkHooks(dir);
  const res = spawnSync(commands(dir)[0], {
    shell: true,
    cwd: os.tmpdir(),
    encoding: 'utf8',
    input: JSON.stringify({ toolCall: { name: 'run_command', args: { CommandLine: 'git push --force origin x' } } })
  });
  assert.strictEqual(JSON.parse(res.stdout).decision, 'deny');
});

test('reports linked count on an already-linked file', () => {
  const dir = freshKit(false);
  linkHooks(dir);
  assert.strictEqual(linkHooks(dir).linked, 3);
});

test('linked is 0 when hooks.json has no matching commands, and CLI exits 1', () => {
  const dir = freshKit(false);
  fs.writeFileSync(path.join(dir, 'hooks.json'), JSON.stringify({ x: { hooks: [{ command: 'python a.py' }] } }));
  assert.deepStrictEqual(linkHooks(dir), { changed: 0, linked: 0 });
  const res = spawnSync(process.execPath, [path.join(ROOT, 'bin', 'link-hooks.js'), dir], { encoding: 'utf8' });
  assert.strictEqual(res.status, 1);
  assert.match(res.stderr, /not wired/);
});
