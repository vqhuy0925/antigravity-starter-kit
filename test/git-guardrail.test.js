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
