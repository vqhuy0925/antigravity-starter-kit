'use strict';

const fs = require('fs');
const { execFileSync } = require('child_process');

/**
 * Read JSON payload from stdin synchronously
 */
function readInput() {
  try {
    const raw = fs.readFileSync(0, 'utf8');
    if (!raw || !raw.trim()) return null;
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

/**
 * Write decision to stdout and terminate
 * @param {'allow' | 'deny' | 'ask' | 'force_ask'} decision
 * @param {string} [reason]
 */
function outputDecision(decision, reason) {
  const result = { decision: decision || 'allow' };
  if (reason) result.reason = reason;
  process.stdout.write(JSON.stringify(result));
  process.exit(0);
}

/** Extract the shell command line from a hook payload. */
function getCommand(payload) {
  const args = payload && payload.toolCall && payload.toolCall.args;
  return (args && args.CommandLine) || '';
}

/** Resolve the working directory a command will run in. */
function getCwd(payload) {
  const args = (payload && payload.toolCall && payload.toolCall.args) || {};
  const ws = payload && payload.workspacePaths;
  return args.Cwd || (Array.isArray(ws) && ws[0]) || process.cwd();
}

/** Run git with an argument array; trimmed stdout, or null on any error. */
function git(args, cwd) {
  try {
    return execFileSync('git', args, {
      cwd,
      encoding: 'utf8',
      timeout: 5000,
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
  } catch (err) {
    return null;
  }
}

/** Current branch name, or null when detached or on error. */
function currentBranch(cwd) {
  const out = git(['branch', '--show-current'], cwd);
  return out ? out : null;
}

/** Split a command line on && || ; | and newlines, ignoring quoted separators. */
function splitCommands(cmd) {
  const segments = [];
  let cur = '';
  let quote = null;
  const s = String(cmd || '');
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quote) {
      cur += c;
      if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'") {
      quote = c;
      cur += c;
    } else if ((c === '&' && s[i + 1] === '&') || (c === '|' && s[i + 1] === '|')) {
      segments.push(cur);
      cur = '';
      i++;
    } else if (c === ';' || c === '|' || c === '\n') {
      segments.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  segments.push(cur);
  return segments.map(x => x.trim()).filter(Boolean);
}

/** Whitespace-split a command segment, respecting quotes (quotes stripped). */
function tokenize(segment) {
  const tokens = [];
  let cur = '';
  let has = false;
  let quote = null;
  for (const c of String(segment || '')) {
    if (quote) {
      if (c === quote) quote = null;
      else cur += c;
    } else if (c === '"' || c === "'") {
      quote = c;
      has = true;
    } else if (/\s/.test(c)) {
      if (has) tokens.push(cur);
      cur = '';
      has = false;
    } else {
      cur += c;
      has = true;
    }
  }
  if (has) tokens.push(cur);
  return tokens;
}

module.exports = {
  readInput,
  outputDecision,
  getCommand,
  getCwd,
  git,
  currentBranch,
  splitCommands,
  tokenize
};
