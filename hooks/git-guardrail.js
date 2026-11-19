#!/usr/bin/env node
'use strict';

const { readInput, outputDecision, getCommand, getCwd, currentBranch, splitCommands, tokenize, normalizeHead, shellInner, parseGit } = require('./lib');

const PROTECTED = ['main', 'master'];
const SEVERITY = { allow: 0, ask: 1, deny: 2 };

const DENY_FORCE = '🚨 BLOCKED by Antigravity Guardrail: Force push (--force / -f) destroys remote commit history.';
const DENY_PROTECTED = '🚨 BLOCKED by Antigravity Guardrail: Direct git push to main/master is strictly protected. Please create a feature branch and pull request.';
const DENY_ROOT = '🚨 BLOCKED by Antigravity Guardrail: Catastrophic root directory deletion detected.';
const ASK_RESET = '⚠️ Antigravity Safety Guard: git reset --hard will discard all uncommitted work permanently. Do you wish to proceed?';

const ROOT_TARGETS = new Set(['/', '/*', '~', '~/', '~/*', '$HOME', '${HOME}', '$HOME/', '${HOME}/', '$HOME/*', '${HOME}/*']);
const DRIVE_ROOT = /^[a-zA-Z]:[\\/]*\*?$/;

const PUSH_VALUE_OPTS = new Set(['-o', '--push-option', '--repo', '--receive-pack', '--exec']);

function normRoot(t) {
  let n = t.replace(/\/{2,}/g, '/').replace(/(\/\.)+$/, '');
  if (n === '' && t.startsWith('/')) n = '/';
  return n;
}

function checkPush(args, branch) {
  let force = false;
  const positional = [];
  let all = false;
  for (let k = 0; k < args.length; k++) {
    const a = args[k];
    if (PUSH_VALUE_OPTS.has(a)) { k++; continue; }
    if (a === '--force') force = true;
    else if (a === '--all' || a === '--mirror') all = true;
    else if (a.startsWith('--')) continue; // --force-with-lease[=..], --force-if-includes, --tags, ...
    else if (/^-[A-Za-z]+$/.test(a)) { if (a.includes('f')) force = true; }
    else if (a.startsWith('-')) continue;
    else positional.push(a);
  }
  const refspecs = positional.slice(1); // first positional is the remote
  if (refspecs.some(r => r.startsWith('+'))) force = true;
  if (force) return { decision: 'deny', reason: DENY_FORCE };

  const targets = [];
  if (all) targets.push('main');
  if (refspecs.length === 0) {
    if (branch) targets.push(branch);
  } else {
    for (let r of refspecs) {
      r = r.replace(/^\+/, '');
      if (r.includes(':')) r = r.slice(r.indexOf(':') + 1);
      r = r.replace(/^refs\/heads\//, '');
      if (r === 'HEAD') { if (branch) targets.push(branch); }
      else targets.push(r);
    }
  }
  if (targets.some(t => PROTECTED.includes(t))) return { decision: 'deny', reason: DENY_PROTECTED };
  return { decision: 'allow' };
}

/**
 * Evaluate one command segment. Returns { decision, reason } or null.
 * @param {string[]} tokens
 * @param {string|null} branch current branch (null when detached/unknown)
 */
function checkSegment(rawTokens, branch) {
  if (!rawTokens || rawTokens.length === 0) return null;
  const tokens = normalizeHead(rawTokens);
  if (tokens.length === 0) return null;
  const head = tokens[0];

  const inner = shellInner(tokens);
  if (inner !== null) {
    const r = evaluate(inner, branch);
    return r.decision === 'allow' ? null : r;
  }

  if (head === 'rm') {
    const flags = tokens.slice(1).filter(t => t.startsWith('-'));
    const recursive = flags.some(f => /^--recursive$/.test(f) || /^-[A-Za-z]*[rR][A-Za-z]*$/.test(f));
    if (recursive && tokens.slice(1).some(t => !t.startsWith('-') && ROOT_TARGETS.has(normRoot(t)))) {
      return { decision: 'deny', reason: DENY_ROOT };
    }
    return null;
  }
  if (/^remove-item$/i.test(head) || head === 'ri') {
    const recursive = tokens.slice(1).some(t => /^-r(e(c(u(r(se?)?)?)?)?)?$/i.test(t));
    if (recursive && tokens.slice(1).some(t => !t.startsWith('-') && DRIVE_ROOT.test(t))) {
      return { decision: 'deny', reason: DENY_ROOT };
    }
    return null;
  }
  if (/^rmdir$/i.test(head)) {
    const rest = tokens.slice(1);
    if (rest.some(t => /^\/s$/i.test(t)) && rest.some(t => /^[a-zA-Z]:\\/.test(t))) {
      return { decision: 'deny', reason: DENY_ROOT };
    }
    return null;
  }

  const g = parseGit(tokens);
  if (!g) return null;
  const [sub, args] = g;
  if (sub === 'push') return checkPush(args, branch);
  if (sub === 'reset' && args.includes('--hard')) return { decision: 'ask', reason: ASK_RESET };
  return null;
}

/** Evaluate a whole command line over both segmentation passes; most severe wins. */
function evaluate(cmd, branch) {
  const segments = new Set([
    ...splitCommands(cmd),
    ...splitCommands(cmd.replace(/["'`]/g, ' '))
  ]);
  let worst = { decision: 'allow' };
  for (const seg of segments) {
    const r = checkSegment(tokenize(seg), branch);
    if (r && SEVERITY[r.decision] > SEVERITY[worst.decision]) worst = r;
  }
  return worst;
}

if (require.main === module) {
  const payload = readInput();
  if (!payload || !payload.toolCall || payload.toolCall.name !== 'run_command') {
    outputDecision('allow');
  }
  const cmd = getCommand(payload);
  // Branch is only needed for bare/HEAD pushes; resolve lazily-ish but once.
  const branch = /\bpush\b/.test(cmd) ? currentBranch(getCwd(payload)) : null;
  const res = evaluate(cmd, branch);
  outputDecision(res.decision, res.reason);
}

module.exports = { checkSegment, normalizeHead }; // normalizeHead re-exported from lib
