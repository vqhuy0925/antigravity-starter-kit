#!/usr/bin/env node
'use strict';

const { readInput, outputDecision } = require('./lib');

const payload = readInput();
if (!payload || !payload.toolCall || payload.toolCall.name !== 'run_command') {
  outputDecision('allow');
}

const cmd = (payload.toolCall.args && payload.toolCall.args.CommandLine) || '';

// 1. Catastrophic Delete Guards
if (/\brm\s+(-[rfRF]+\s+)?[\/\\](?:\s|$)/.test(cmd) || /rmdir\s+\/s\s+\/q\s+[c-zC-Z]:\\/i.test(cmd)) {
  outputDecision('deny', '🚨 BLOCKED by Antigravity Guardrail: Catastrophic root directory deletion detected.');
}

// 2. Git Force Push Guard
if (/\bgit\s+push\b.*(--force\b|-f\b|--force-with-lease\b)/.test(cmd)) {
  outputDecision('deny', '🚨 BLOCKED by Antigravity Guardrail: Force push (--force / -f) destroys remote commit history.');
}

// 3. Direct Push to Protected Branches Guard
if (/\bgit\s+push\b.*(\b(origin|upstream)\s+(main|master)\b)/.test(cmd)) {
  outputDecision('deny', '🚨 BLOCKED by Antigravity Guardrail: Direct git push to main/master is strictly protected. Please create a feature branch and pull request.');
}

// 4. Git Reset Hard Confirmation
if (/\bgit\s+reset\s+--hard\b/.test(cmd)) {
  outputDecision('ask', '⚠️ Antigravity Safety Guard: git reset --hard will discard all uncommitted work permanently. Do you wish to proceed?');
}

// Default: Allow
outputDecision('allow');
