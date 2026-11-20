'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
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


const WRAPPERS = new Set(['sudo', 'env', 'command', 'time', 'nohup', 'xargs', 'exec']);
/** Wrapper options whose value is the next token. */
const WRAPPER_VALUE_OPTS = {
  sudo: new Set(['-u', '-g', '-h', '-p', '-C', '-D', '-r', '-t', '-U', '-T']),
  env: new Set(['-u', '-C', '-S']),
  xargs: new Set(['-I', '-n', '-L', '-P', '-d', '-E', '-s', '-a']),
  exec: new Set(['-a']),
  time: new Set(['-f', '-o'])
};
const SHELLS = new Set(['bash', 'sh', 'zsh', 'pwsh', 'powershell', 'cmd']);

const baseName = t => t.replace(/^.*[\\/]/, '').toLowerCase().replace(/\.exe$/, '');

/** Drop VAR=val prefixes and wrappers (with their flags); normalise the head token. */
function normalizeHead(tokens) {
  let i = 0;
  while (i < tokens.length) {
    const t = tokens[i];
    if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(t)) { i++; continue; }
    if (WRAPPERS.has(baseName(t))) {
      const valueOpts = WRAPPER_VALUE_OPTS[baseName(t)] || new Set();
      i++;
      while (i < tokens.length && tokens[i].startsWith('-')) {
        // Short options that take a separate value (sudo -u git) consume the next token.
        if (valueOpts.has(tokens[i])) i++;
        i++;
      }
      continue;
    }
    break;
  }
  const rest = tokens.slice(i);
  if (rest.length) rest[0] = baseName(rest[0]);
  return rest;
}

const DELETES = new Set(['rm', 'remove-item', 'ri', 'rmdir', 'rd', 'del', 'erase']);
const NON_EXEC = new Set(['echo', 'printf']);

/**
 * For a normalized segment whose head is an unknown prefix command (timeout, nice,
 * doas, sudo -u x, ...), return the tokens from the first git / shell / eval / delete
 * token onward (normalized), or null when the head is already known or nothing matches.
 */
function fallbackTokens(tokens) {
  const known = t => t === 'git' || t === 'eval' || SHELLS.has(t) || DELETES.has(t);
  if (!tokens.length || known(tokens[0]) || NON_EXEC.has(tokens[0])) return null;
  for (let i = 1; i < tokens.length; i++) {
    if (known(baseName(tokens[i]))) return normalizeHead(tokens.slice(i));
  }
  return null;
}

/** True when every quote in s is closed (same quote rules as tokenize). */
function quotesBalanced(s) {
  let quote = null;
  const t = String(s || '');
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (quote) {
      if (quote === '"' && c === '\\') i++;
      else if (c === quote) quote = null;
    } else if (c === '"' || c === "'") quote = c;
  }
  return quote === null;
}

/** If tokens are `<shell> -c "<cmd>"` or `eval <cmd>`, return the inner command string, else null. */
function shellInner(tokens) {
  if (tokens[0] === 'eval') return tokens.length > 1 ? tokens.slice(1).join(' ') : null;
  if (!SHELLS.has(tokens[0])) return null;
  for (let i = 1; i < tokens.length; i++) {
    if (/^(-[a-z]*c|-command|\/[ck])$/i.test(tokens[i]) && i + 1 < tokens.length) {
      return tokens.slice(i + 1).join(' ');
    }
  }
  return null;
}

/** Strip a leading `git` plus global options; returns [subcommand, restTokens] or null. */
function parseGit(tokens) {
  if (tokens[0] !== 'git') return null;
  let i = 1;
  while (i < tokens.length) {
    const t = tokens[i];
    if (t === '-C' || t === '-c' || t === '--git-dir' || t === '--work-tree' || t === '--namespace') {
      i += 2;
    } else if (t.startsWith('-') && t !== '-') {
      i += 1; // other global flag (--no-pager, --git-dir=..., -p, ...)
    } else {
      break;
    }
  }
  if (i >= tokens.length) return null;
  return [tokens[i], tokens.slice(i + 1)];
}

/** Directory selected by `git -C <dir>` options in a git token list, resolved against base. */
function gitDir(tokens, base) {
  let dir = base;
  for (let i = 1; i < tokens.length; i++) {
    if (tokens[i] === '-C' && i + 1 < tokens.length) { dir = path.resolve(dir, tokens[i + 1]); i++; }
    else if (tokens[i] === '-c' || tokens[i] === '--git-dir' || tokens[i] === '--work-tree' || tokens[i] === '--namespace') i++;
    else if (!tokens[i].startsWith('-')) break;
  }
  return dir;
}

const CD_COMMANDS = new Set(['cd', 'chdir', 'pushd', 'set-location', 'sl', 'push-location']);

/**
 * Where a cd-style segment moves to from dir: null when the segment is not a cd,
 * undefined when the target cannot be known here ($VAR, `cd -`, a relative path after
 * an earlier unknown cd). dir may itself be undefined.
 */
function cdTarget(tokens, dir) {
  if (!tokens.length || !CD_COMMANDS.has(tokens[0].toLowerCase())) return null;
  // Skip flags: -Path / -LiteralPath (PowerShell), -L / -P (sh), /d (cmd).
  const args = tokens.slice(1).filter(t => !/^(-path|-literalpath|-[LPe@]+|\/d)$/i.test(t));
  const t = args[0];
  if (t === undefined || t === '~') return os.homedir();
  if (t === '-' || /[$`%]/.test(t)) return undefined;
  if (/^~[\\/]/.test(t)) return path.join(os.homedir(), t.slice(2));
  if (path.isAbsolute(t)) return path.resolve(t);
  return dir === undefined ? undefined : path.resolve(dir, t);
}

/**
 * The exact segments of a command line in order, each with the directory it runs in,
 * following literal cd / Set-Location / pushd. dir is undefined after an unknowable cd.
 */
function segmentsWithDirs(cmd, base) {
  let dir = base;
  const out = [];
  for (const seg of splitCommands(cmd)) {
    out.push({ seg, dir });
    const next = cdTarget(normalizeHead(tokenize(seg)), dir);
    if (next !== null) dir = next;
  }
  return out;
}

module.exports = {
  gitDir,
  cdTarget,
  segmentsWithDirs,
  CD_COMMANDS,
  normalizeHead,
  fallbackTokens,
  quotesBalanced,
  DELETES,
  shellInner,
  parseGit,
  readInput,
  outputDecision,
  getCommand,
  getCwd,
  git,
  currentBranch,
  splitCommands,
  tokenize
};
