#!/usr/bin/env node
'use strict';

const { readInput, outputDecision, getCommand } = require('./lib');

// Detect inline hardcoded secrets in commands (e.g. git commit -m "... token=ghp_..." or curl with hardcoded bearer)
const SECRET_PATTERNS = [
  { label: 'private key', re: /-----BEGIN\s+(RSA|OPENSSH|EC|PGP)?\s*PRIVATE\s+KEY-----/ },
  { label: 'GitHub token', re: /\bgh[pousr]_[A-Za-z0-9_]{36,255}\b/ },
  { label: 'GitHub PAT', re: /\bgithub_pat_[A-Za-z0-9_]{82}\b/ },
  { label: 'AWS key', re: /\bAKIA[0-9A-Z]{16}\b/ },
  { label: 'Anthropic/OpenAI key', re: /(?<![\w-])sk-(?:ant|proj|svcacct|admin)-[A-Za-z0-9_-]{32,}/ },
  { label: 'Anthropic/OpenAI key', re: /(?<![\w-])sk-[A-Za-z0-9]{32,}(?![\w-])/ },   // legacy sk-, no hyphens
  { label: 'Google API key', re: /\bAIza[0-9A-Za-z_-]{35}(?![\w-])/ },
  { label: 'Slack token', re: /\bxox[baprs]-[0-9A-Za-z]{10,48}\b/ },
  { label: 'bearer token', re: /\bBearer\s+[A-Za-z0-9._~+\/-]{30,}=*/i }
];

/** Return the label of the first secret pattern found in cmd, or null. */
function findSecret(cmd) {
  const s = String(cmd || '');
  for (const { label, re } of SECRET_PATTERNS) {
    if (re.test(s)) return label;
  }
  return null;
}

if (require.main === module) {
  const payload = readInput();
  if (!payload || !payload.toolCall || payload.toolCall.name !== 'run_command') {
    outputDecision('allow');
  }

  const label = findSecret(getCommand(payload));
  if (label) {
    outputDecision('deny', `🚨 BLOCKED by Antigravity Guardrail: A raw credential or private key was detected in the command string (${label}).`);
  }

  outputDecision('allow');
}

module.exports = { findSecret };
