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

/** Index of the ")" closing a "$(" whose body starts at i (quote-aware); -1 if unclosed. */
function findParenEnd(s, i) {
  let depth = 1;
  let quote = null;
  for (; i < s.length; i++) {
    const c = s[i];
    if (quote) {
      if (c === '\\' && quote === '"') i++;
      else if (c === quote) quote = null;
    } else if (c === '"' || c === "'") quote = c;
    else if (c === '(') depth++;
    else if (c === ')' && --depth === 0) return i;
  }
  return -1;
}

/** Index of the closing backtick for a body starting at i; -1 if unclosed. */
function findBacktickEnd(s, i) {
  for (; i < s.length; i++) {
    if (s[i] === '\\') i++;
    else if (s[i] === '`') return i;
  }
  return -1;
}

/**
 * Split a command line into simple-command segments.
 * Separators: && || ; | |& & and newline; ignored inside quotes, `>&`, `2>&1`, `&>`.
 * Inside double quotes, \" and \ are escapes. The bodies of $( ... ) and `...`
 * stay inside their outer segment (separators in them do not split it) and are
 * ALSO returned as additional segments, recursively, after the top-level ones.
 * Known limits: no alias expansion, no eval, no variable expansion.
 * @param {string} cmd
 * @returns {string[]}
 */
function splitCommands(cmd) {
  const s = String(cmd || '');
  const segments = [];
  const subs = [];
  let cur = '';
  let quote = null;
  const flush = () => { segments.push(cur); cur = ''; };
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quote === "'") {
      cur += c;
      if (c === "'") quote = null;
      continue;
    }
    if (quote === '"' && c === '\\' && i + 1 < s.length) {
      cur += c + s[i + 1];
      i++;
      continue;
    }
    if (quote === '"' && c === '"') {
      quote = null;
      cur += c;
      continue;
    }
    if (c === '$' && s[i + 1] === '(') {
      const end = findParenEnd(s, i + 2);
      const stop = end === -1 ? s.length : end;
      subs.push(...splitCommands(s.slice(i + 2, stop)));
      cur += s.slice(i, stop + 1);
      i = stop;
      continue;
    }
    if (c === '`') {
      const end = findBacktickEnd(s, i + 1);
      const stop = end === -1 ? s.length : end;
      subs.push(...splitCommands(s.slice(i + 1, stop)));
      cur += s.slice(i, stop + 1);
      i = stop;
      continue;
    }
    if (quote === '"') {
      cur += c;
      continue;
    }
    if (c === '"' || c === "'") {
      quote = c;
      cur += c;
    } else if ((c === '&' && s[i + 1] === '&') || (c === '|' && s[i + 1] === '|')) {
      flush();
      i++;
    } else if (c === '|') {
      flush();
      if (s[i + 1] === '&') i++;
    } else if (c === '&') {
      if (s[i - 1] === '>' || s[i - 1] === '<' || s[i + 1] === '>') cur += c;
      else flush();
    } else if (c === ';' || c === '\n') {
      flush();
    } else {
      cur += c;
    }
  }
  flush();
  return segments.map(x => x.trim()).filter(Boolean).concat(subs);
}

/**
 * Whitespace-split a command segment, respecting quotes (quotes stripped).
 * Inside double quotes, \" and \ become literal " and \; backslashes elsewhere
 * (e.g. Windows paths) are left untouched.
 */
function tokenize(segment) {
  const tokens = [];
  let cur = '';
  let has = false;
  let quote = null;
  const t = String(segment || '');
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (quote) {
      if (quote === '"' && c === '\\' && (t[i + 1] === '"' || t[i + 1] === '\\')) {
        cur += t[++i];
      } else if (c === quote) quote = null;
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
