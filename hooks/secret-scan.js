#!/usr/bin/env node
'use strict';

const { readInput, outputDecision } = require('./lib');

const payload = readInput();
if (!payload || !payload.toolCall || payload.toolCall.name !== 'run_command') {
  outputDecision('allow');
}

const cmd = (payload.toolCall.args && payload.toolCall.args.CommandLine) || '';

// Detect inline hardcoded secrets in commands (e.g. git commit -m "... token=ghp_..." or curl with hardcoded bearer)
const SECRET_PATTERNS = [
  /-----BEGIN\s+(RSA|OPENSSH|EC|PGP)?\s*PRIVATE\s+KEY-----/,
  /\bgh[pousr]_[A-Za-z0-9_]{36,255}\b/,          // GitHub tokens
  /\bAKIA[0-9A-Z]{16}\b/,                         // AWS Access Key ID
  /\bsk-[a-zA-Z0-9]{32,}\b/,                      // OpenAI / Anthropic API keys
  /\bxox[baprs]-[0-9A-Za-z]{10,48}\b/             // Slack tokens
];

for (const pattern of SECRET_PATTERNS) {
  if (pattern.test(cmd)) {
    outputDecision('deny', '🚨 BLOCKED by Antigravity Guardrail: A raw credential or private key was detected in the command string.');
  }
}

outputDecision('allow');
