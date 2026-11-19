'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { runHook, cmd } = require('./helpers');

test('Blocks GitHub personal access token (ghp_)', () => {
  const res = runHook('secret-scan.js', cmd('curl -H "Authorization: token ghp_123456789012345678901234567890123456"'));
  assert.strictEqual(res.decision, 'deny');
  assert.match(res.reason, /credential or private key/);
});

test('Blocks raw RSA Private Key', () => {
  const res = runHook('secret-scan.js', cmd('echo "-----BEGIN RSA PRIVATE KEY-----" > key.pem'));
  assert.strictEqual(res.decision, 'deny');
});

test('Allows normal safe command strings', () => {
  const res = runHook('secret-scan.js', cmd('npm test --silent'));
  assert.strictEqual(res.decision, 'allow');
});

const deny = s => assert.strictEqual(runHook('secret-scan.js', cmd(s)).decision, 'deny');
const allow = s => assert.strictEqual(runHook('secret-scan.js', cmd(s)).decision, 'allow');
test('blocks sk-ant- keys', () => deny(`export K=${'sk-ant-api03-' + 'a'.repeat(40)}`));
test('blocks sk-proj- keys', () => deny(`curl -d key=${'sk-proj-' + 'B1_'.repeat(14)}`));
test('blocks Google API keys', () => deny(`curl "https://x?key=${'AIza' + 'c'.repeat(35)}"`));
test('blocks github_pat_ tokens', () => deny(`git clone https://${'github_pat_' + 'd'.repeat(82)}@github.com/o/r`));
test('blocks literal Bearer tokens', () => deny(`curl -H "Authorization: Bearer ${'e'.repeat(40)}"`));
test('allows bearer env var', () => allow('curl -H "Authorization: Bearer $GITHUB_TOKEN"'));
test('allows long hyphenated branch names', () => allow('git checkout -b task-add-login-for-users-and-admins-xyz-0123456789'));
test('allows sk- inside a branch name', () => allow('git checkout -b feature/sk-1234-add-login-validation-for-users'));
test('allows task-sk- words', () => allow('echo task-sk-addition-of-a-long-thing-here-to-test'));
test('blocks lowercase bearer tokens', () => deny(`curl -H "authorization: bearer ${'e'.repeat(40)}"`));
test('blocks Google API key ending in -', () => deny(`curl "https://x?key=${'AIza' + 'c'.repeat(34) + '-'}"`));
test('blocks legacy sk- keys', () => deny(`export OPENAI_API_KEY=${'sk-' + 'A1b2'.repeat(12)}`));
test('blocks sk-svcacct- and sk-admin- keys', () => { deny(`K=${'sk-svcacct-' + 'x'.repeat(40)}`); deny(`K=${'sk-admin-' + 'x_-'.repeat(14)}`); });
