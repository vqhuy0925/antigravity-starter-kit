'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { execFileSync } = require('child_process');
const { splitCommands, tokenize, currentBranch, getCwd } = require('../hooks/lib');
const { makeRepo } = require('./helpers');

test('splitCommands splits on separators outside quotes', () => {
  assert.deepStrictEqual(
    splitCommands('git add . && git commit -m "a && b"; git push | cat'),
    ['git add .', 'git commit -m "a && b"', 'git push', 'cat']);
});
test('tokenize keeps quoted args whole', () => {
  assert.deepStrictEqual(tokenize(`git commit -m 'fix: a b'`), ['git', 'commit', '-m', 'fix: a b']);
});
test('currentBranch returns branch, null when detached', () => {
  const dir = makeRepo({ branch: 'feat/x' });
  assert.strictEqual(currentBranch(dir), 'feat/x');
  execFileSync('git', ['checkout', '--detach'], { cwd: dir, stdio: 'ignore' });
  assert.strictEqual(currentBranch(dir), null);
});
test('getCwd prefers args.Cwd, then workspacePaths', () => {
  assert.strictEqual(getCwd({ toolCall: { args: { Cwd: 'A' } }, workspacePaths: ['B'] }), 'A');
  assert.strictEqual(getCwd({ toolCall: { args: {} }, workspacePaths: ['B'] }), 'B');
});
