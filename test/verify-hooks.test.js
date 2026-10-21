'use strict';

const { spawnSync } = require('child_process');
const path = require('path');
const assert = require('assert');

console.log('🧪 Starting Antigravity Safety Guardrails Test Suite...\n');

function runHook(hookFile, inputPayload) {
  const hookPath = path.join(__dirname, '..', 'hooks', hookFile);
  const res = spawnSync(process.execPath, [hookPath], {
    input: JSON.stringify(inputPayload),
    encoding: 'utf8'
  });
  if (res.error) throw res.error;
  try {
    return JSON.parse(res.stdout);
  } catch (err) {
    throw new Error(`Failed to parse hook output (${res.stdout}): ${err.message}`);
  }
}

let passed = 0;
let total = 0;

function test(description, fn) {
  total++;
  try {
    fn();
    console.log(`  ✅ PASS: ${description}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${description}`);
    console.error(`     ${err.message}`);
  }
}

// 1. Git Guardrail Tests
console.log('--- [1] Testing git-guardrail.js ---');

test('Blocks git push --force', () => {
  const res = runHook('git-guardrail.js', {
    toolCall: { name: 'run_command', args: { CommandLine: 'git push origin feature-1 --force' } }
  });
  assert.strictEqual(res.decision, 'deny');
  assert.match(res.reason, /Force push/);
});

test('Blocks git push -f', () => {
  const res = runHook('git-guardrail.js', {
    toolCall: { name: 'run_command', args: { CommandLine: 'git push -f origin main' } }
  });
  assert.strictEqual(res.decision, 'deny');
});

test('Blocks direct push to origin main', () => {
  const res = runHook('git-guardrail.js', {
    toolCall: { name: 'run_command', args: { CommandLine: 'git push origin main' } }
  });
  assert.strictEqual(res.decision, 'deny');
  assert.match(res.reason, /protected/);
});

test('Prompts on git reset --hard', () => {
  const res = runHook('git-guardrail.js', {
    toolCall: { name: 'run_command', args: { CommandLine: 'git reset --hard HEAD~1' } }
  });
  assert.strictEqual(res.decision, 'ask');
  assert.match(res.reason, /discard all uncommitted work/);
});

test('Blocks catastrophic root deletion rm -rf /', () => {
  const res = runHook('git-guardrail.js', {
    toolCall: { name: 'run_command', args: { CommandLine: 'rm -rf /' } }
  });
  assert.strictEqual(res.decision, 'deny');
});

test('Allows safe git commands like git status or git add', () => {
  const res = runHook('git-guardrail.js', {
    toolCall: { name: 'run_command', args: { CommandLine: 'git status' } }
  });
  assert.strictEqual(res.decision, 'allow');
});

// 2. Secret Scan Tests
console.log('\n--- [2] Testing secret-scan.js ---');

test('Blocks GitHub personal access token (ghp_)', () => {
  const res = runHook('secret-scan.js', {
    toolCall: { name: 'run_command', args: { CommandLine: 'curl -H "Authorization: token ghp_123456789012345678901234567890123456"' } }
  });
  assert.strictEqual(res.decision, 'deny');
  assert.match(res.reason, /credential or private key/);
});

test('Blocks raw RSA Private Key', () => {
  const res = runHook('secret-scan.js', {
    toolCall: { name: 'run_command', args: { CommandLine: 'echo "-----BEGIN RSA PRIVATE KEY-----" > key.pem' } }
  });
  assert.strictEqual(res.decision, 'deny');
});

test('Allows normal safe command strings', () => {
  const res = runHook('secret-scan.js', {
    toolCall: { name: 'run_command', args: { CommandLine: 'npm test --silent' } }
  });
  assert.strictEqual(res.decision, 'allow');
});

console.log(`\n========================================`);
console.log(`Test Results: ${passed}/${total} passed (${Math.round((passed / total) * 100)}%)`);
console.log(`========================================\n`);

if (passed !== total) {
  process.exit(1);
}
