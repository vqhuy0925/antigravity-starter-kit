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

test('single & is a separator, but not in &&, >&, 2>&1, &>, |&', () => {
  assert.deepStrictEqual(splitCommands('git status & git push --force'), ['git status', 'git push --force']);
  assert.deepStrictEqual(splitCommands('make 2>&1'), ['make 2>&1']);
  assert.deepStrictEqual(splitCommands('make >&2'), ['make >&2']);
  assert.deepStrictEqual(splitCommands('make &> out.log'), ['make &> out.log']);
  assert.deepStrictEqual(splitCommands('a |& b'), ['a', 'b']);
});
test('escaped quote inside double quotes does not close the quote', () => {
  assert.deepStrictEqual(
    splitCommands('git commit -m "say \\" && git push --force"'),
    ['git commit -m "say \\" && git push --force"']);
  assert.deepStrictEqual(tokenize('echo "a \\" b"'), ['echo', 'a " b']);
  assert.deepStrictEqual(tokenize('echo "a\\\\" b'), ['echo', 'a\\', 'b']);
});
test('substitution bodies are returned as extra segments, without splitting the outer one', () => {
  assert.deepStrictEqual(
    splitCommands('echo $(git push --force && ls) done'),
    ['echo $(git push --force && ls) done', 'git push --force', 'ls']);
  assert.deepStrictEqual(
    splitCommands('echo `git push -f; ls`'),
    ['echo `git push -f; ls`', 'git push -f', 'ls']);
  assert.deepStrictEqual(
    splitCommands('echo $(echo $(git push -f))'),
    ['echo $(echo $(git push -f))', 'echo $(git push -f)', 'git push -f']);
  assert.deepStrictEqual(
    splitCommands('echo "x $(git push -f) y"'),
    ['echo "x $(git push -f) y"', 'git push -f']);
});
test('splitCommands handles || and newline', () => {
  assert.deepStrictEqual(splitCommands('a || b\nc'), ['a', 'b', 'c']);
});
test('single-quoted separators stay whole', () => {
  assert.deepStrictEqual(splitCommands(`echo 'a && b; c $(x)'`), [`echo 'a && b; c $(x)'`]);
});
test('tokenize: empty quotes give an empty token; Windows paths are unchanged', () => {
  assert.deepStrictEqual(tokenize('a ""'), ['a', '']);
  assert.deepStrictEqual(tokenize('C:\\dir\\file'), ['C:\\dir\\file']);
  assert.deepStrictEqual(tokenize('cd C:\\dir\\'), ['cd', 'C:\\dir\\']);
});

const { fallbackTokens, quotesBalanced, normalizeHead } = require('../hooks/lib');
test('fallbackTokens skips unknown prefixes to the first git/shell/delete token', () => {
  assert.deepStrictEqual(fallbackTokens(normalizeHead(tokenize('timeout 60 git push'))), ['git', 'push']);
  assert.deepStrictEqual(normalizeHead(tokenize('sudo -u x /usr/bin/git push')), ['git', 'push']);
  assert.strictEqual(fallbackTokens(normalizeHead(tokenize('git push'))), null);
  assert.strictEqual(fallbackTokens(normalizeHead(tokenize('echo git push'))), null);
  assert.strictEqual(fallbackTokens(normalizeHead(tokenize('timeout 60 npm test'))), null);
});
test('quotesBalanced', () => {
  assert.strictEqual(quotesBalanced('echo "a \\" b" \'c\''), true);
  assert.strictEqual(quotesBalanced("echo it's"), false);
});
