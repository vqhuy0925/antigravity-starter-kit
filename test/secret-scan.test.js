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
