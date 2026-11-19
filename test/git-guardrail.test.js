'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { runHook, cmd } = require('./helpers');

test('Blocks git push --force', () => {
  const res = runHook('git-guardrail.js', cmd('git push origin feature-1 --force'));
  assert.strictEqual(res.decision, 'deny');
  assert.match(res.reason, /Force push/);
});

test('Blocks git push -f', () => {
  const res = runHook('git-guardrail.js', cmd('git push -f origin main'));
  assert.strictEqual(res.decision, 'deny');
});

test('Blocks direct push to origin main', () => {
  const res = runHook('git-guardrail.js', cmd('git push origin main'));
  assert.strictEqual(res.decision, 'deny');
  assert.match(res.reason, /protected/);
});

test('Prompts on git reset --hard', () => {
  const res = runHook('git-guardrail.js', cmd('git reset --hard HEAD~1'));
  assert.strictEqual(res.decision, 'ask');
  assert.match(res.reason, /discard all uncommitted work/);
});

test('Blocks catastrophic root deletion rm -rf /', () => {
  const res = runHook('git-guardrail.js', cmd('rm -rf /'));
  assert.strictEqual(res.decision, 'deny');
});

test('Allows safe git commands like git status or git add', () => {
  const res = runHook('git-guardrail.js', cmd('git status'));
  assert.strictEqual(res.decision, 'allow');
});

// --- Task 3: push rules and root-delete ---
const { execFileSync } = require('node:child_process');
const { makeRepo } = require('./helpers');
const d = (c, cwd) => runHook('git-guardrail.js', cmd(c, cwd)).decision;
test('denies push to HEAD:main', () => assert.strictEqual(d('git push origin HEAD:main'), 'deny'));
test('denies push to main with flags between', () => assert.strictEqual(d('git push -u origin main'), 'deny'));
test('denies push to main on any remote', () => assert.strictEqual(d('git push fork main'), 'deny'));
test('denies bare push while on main', () => assert.strictEqual(d('git push', makeRepo({ branch: 'main' })), 'deny'));
test('allows bare push on feature branch', () => assert.strictEqual(d('git push', makeRepo({ branch: 'feat/x' })), 'allow'));
test('allows bare push on detached HEAD', () => {
  const dir = makeRepo();
  execFileSync('git', ['checkout', '--detach'], { cwd: dir, stdio: 'ignore' });
  assert.strictEqual(d('git push', dir), 'allow');
});
test('allows force-with-lease on feature branch', () => assert.strictEqual(d('git push --force-with-lease origin feat/x'), 'allow'));
test('denies force-with-lease to main', () => assert.strictEqual(d('git push --force-with-lease origin main'), 'deny'));
test('denies +refspec force push', () => assert.strictEqual(d('git push origin +feat/x'), 'deny'));
test('denies -fu cluster', () => assert.strictEqual(d('git push -fu origin feat/x'), 'deny'));
test('denies force push inside a chain', () => assert.strictEqual(d('git add -A && git push --force origin x'), 'deny'));
test('denies push to main after a semicolon', () => assert.strictEqual(d('npm test; git push origin main'), 'deny'));
test('denies push with -C and -c global options', () => assert.strictEqual(d('git -C . -c core.x=1 push origin main'), 'deny'));
test('denies push --all', () => assert.strictEqual(d('git push --all origin'), 'deny'));
test('denies push hidden by unbalanced apostrophe', () => assert.strictEqual(d("echo it's && git push -f origin x"), 'deny'));
test('denies push hidden by stray double quote', () => assert.strictEqual(d('echo \\" && git push origin main'), 'deny'));
test('allows commit message mentioning git status', () => assert.strictEqual(d('git commit -m "docs: mention git status"'), 'allow'));
for (const c of ['rm -rf /*', 'rm -rf ~', 'rm -rf ~/', 'rm -rf $HOME', 'rm -rf ${HOME}', 'Remove-Item -Recurse -Force C:\\', 'Remove-Item -Recurse -Force C:/'])
  test(`denies ${c}`, () => assert.strictEqual(d(c), 'deny'));
for (const c of ['rm -rf ./build', 'rm -rf /tmp/foo', 'git push origin feat/x', 'git log --follow-tags'])
  test(`allows ${c}`, () => assert.strictEqual(d(c), 'allow'));

// --- Fix round 1: prefix/wrapper bypasses ---
for (const c of [
  'sudo git push origin main', 'FOO=1 git push origin main', 'env git push -f origin x',
  'command git push origin main', 'nohup git push origin main', 'time git push origin main',
  '/usr/bin/git push origin main', 'git.exe push origin main',
  'bash -c "git push origin main"', "sh -c 'git push -f origin x'", 'pwsh -c "git push origin main"',
  'xargs git push -f', 'sudo rm -rf /', 'env -i FOO=1 git push origin main',
  'rm -rf //', 'rm -rf /.'
]) test(`denies ${c}`, () => assert.strictEqual(d(c), 'deny'));
test('denies push -o value on main', () => assert.strictEqual(d('git push -o ci.skip origin', makeRepo({ branch: 'main' })), 'deny'));
test('push -o value does not become remote', () => assert.strictEqual(d('git push -o ci.skip origin feat/x'), 'allow'));
for (const c of ['sudo apt install git', 'env NODE_ENV=test npm test', 'bash -c "git status"'])
  test(`allows ${c}`, () => assert.strictEqual(d(c), 'allow'));
