'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');

/** A kit copy without test/ (so --verify prints hooks.json instead of running the suite). */
function kitCopy() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-verify-'));
  for (const d of ['bin', 'hooks']) {
    fs.mkdirSync(path.join(dir, d));
    for (const f of fs.readdirSync(path.join(ROOT, d))) fs.copyFileSync(path.join(ROOT, d, f), path.join(dir, d, f));
  }
  fs.copyFileSync(path.join(ROOT, 'hooks.json'), path.join(dir, 'hooks.json'));
  return dir;
}
const verify = dir => spawnSync(process.execPath, [path.join(dir, 'bin', 'cli.js'), '--verify'], { encoding: 'utf8' });

test('--verify warns with the fix command when a hook path does not exist', () => {
  const dir = kitCopy();
  const file = path.join(dir, 'hooks.json');
  const json = JSON.parse(fs.readFileSync(file, 'utf8'));
  json['antigravity-guardrails'].PreToolUse[0].hooks[0].command = 'node "/old/machine/kit/hooks/git-guardrail.js"';
  fs.writeFileSync(file, JSON.stringify(json, null, 2));
  const res = verify(dir);
  assert.match(res.stderr, /\/old\/machine\/kit\/hooks\/git-guardrail\.js/);
  assert.ok(res.stderr.includes(`node "${path.join(dir, 'bin', 'link-hooks.js')}"`), res.stderr);
  assert.strictEqual(res.status, 1);
});

test('--verify does not warn when every hook path exists', () => {
  const dir = kitCopy();
  require('../bin/link-hooks').linkHooks(dir);
  const res = verify(dir);
  assert.doesNotMatch(res.stderr, /does not exist/);
  assert.strictEqual(res.status, 0);
});
