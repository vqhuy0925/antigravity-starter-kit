#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { readInput, outputDecision, getCommand, getCwd, git, currentBranch, splitCommands, tokenize } = require('./lib');
const { normalizeHead } = require('./git-guardrail');

const IGNORED_BASENAMES = new Set([
  'implementation_plan.md', 'task.md', 'walkthrough.md', 'test_cases.md',
  'package-lock.json', 'pnpm-lock.yaml', 'yarn.lock'
]);
const SHELLS = new Set(['bash', 'sh', 'zsh', 'pwsh', 'powershell', 'cmd']);

/** Branch name -> plan file slug. */
function planSlug(branch) {
  return String(branch).replace(/\//g, '-');
}

/** Locate the approved plan for this branch, or null. */
function findPlan({ repoRoot, branch, artifactDir, cwd }) {
  if (branch && repoRoot) {
    const p = path.join(repoRoot, 'docs', 'plans', `${planSlug(branch)}.md`);
    if (fs.existsSync(p)) return p;
  }
  if (artifactDir) {
    const p = path.join(artifactDir, 'implementation_plan.md');
    if (fs.existsSync(p)) return p;
  }
  let current = cwd;
  for (let i = 0; i < 4 && current; i++) {
    const p = path.join(current, 'implementation_plan.md');
    if (fs.existsSync(p)) return p;
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return null;
}

/** Collect path-like tokens a plan mentions (backticked, or first token of list items). */
function extractPlanPaths(text) {
  const out = new Set();
  const add = t => {
    if (!t || !/[/.\\]/.test(t)) return;
    out.add(t.replace(/\\/g, '/').replace(/^\.\//, ''));
  };
  const src = String(text).replace(/\r\n?/g, '\n');
  for (const m of src.matchAll(/`([^`\n]+)`/g)) add(m[1].trim());
  for (const m of src.matchAll(/^[ \t]*(?:[-*+]|\d+[.)])[ \t]+(\S+)/gm)) add(m[1].replace(/^`|`$/g, ''));
  return out;
}

/** Is `file` covered by the plan's paths? */
function isCovered(file, planPaths, ctx) {
  const f = file.replace(/\\/g, '/');
  if (planPaths.has(f)) return true;
  for (const p of planPaths) if (p.endsWith('/') && f.startsWith(p)) return true;
  const base = path.posix.basename(f);
  if (planPaths.has(base)) {
    const count = list => list.filter(x => path.posix.basename(x.replace(/\\/g, '/')) === base).length;
    if (count(ctx.stagedFiles || []) <= 1 && count(ctx.trackedFiles || []) <= 1) return true;
  }
  return false;
}

/** Strip `git` + global options; returns [sub, args] or null. */
function parseGit(tokens) {
  if (tokens[0] !== 'git') return null;
  let i = 1;
  while (i < tokens.length) {
    const t = tokens[i];
    if (t === '-C' || t === '-c' || t === '--git-dir' || t === '--work-tree' || t === '--namespace') i += 2;
    else if (t.startsWith('-') && t !== '-') i += 1;
    else break;
  }
  return i < tokens.length ? [tokens[i], tokens.slice(i + 1)] : null;
}

function shellInner(tokens) {
  if (!SHELLS.has(tokens[0])) return null;
  for (let i = 1; i < tokens.length; i++) {
    if (/^(-[a-z]*c|-command|\/[ck])$/i.test(tokens[i]) && i + 1 < tokens.length) return tokens.slice(i + 1).join(' ');
  }
  return null;
}

const VALUE_LETTERS = new Set(['m', 'F', 'C', 'c', 't', 'S']);
const VALUE_LONG = new Set(['-m', '--message', '-F', '--file', '-C', '-c', '-t', '--reuse-message', '--reedit-message', '--author', '--date', '--template']);

/** Does a commit's argument list stage tracked changes (-a / --all / -am)? */
function commitStagesAll(args) {
  for (let i = 0; i < args.length; i++) {
    const t = args[i];
    if (t === '--all') return true;
    if (VALUE_LONG.has(t)) { i++; continue; }
    if (/^-[A-Za-z]+$/.test(t)) {
      for (const ch of t.slice(1)) {
        if (ch === 'a') return true;
        if (VALUE_LETTERS.has(ch)) break;
      }
    }
  }
  return false;
}

/** Scan a command line; returns { commit, includeWorktree }. */
function analyze(cmdLine, depth = 0) {
  const res = { commit: false, includeWorktree: false };
  if (depth > 3) return res;
  const segments = new Set([
    ...splitCommands(cmdLine),
    ...splitCommands(cmdLine.replace(/["'`]/g, ' '))
  ]);
  for (const seg of segments) {
    const tokens = normalizeHead(tokenize(seg));
    if (!tokens.length) continue;
    const inner = shellInner(tokens);
    if (inner !== null) {
      const r = analyze(inner, depth + 1);
      res.commit = res.commit || r.commit;
      res.includeWorktree = res.includeWorktree || r.includeWorktree;
      continue;
    }
    const g = parseGit(tokens);
    if (!g) continue;
    if (g[0] === 'add') res.includeWorktree = true;
    if (g[0] === 'commit') {
      res.commit = true;
      if (commitStagesAll(g[1])) res.includeWorktree = true;
    }
  }
  return res;
}

const lines = s => (s || '').split(/\r?\n/).filter(Boolean);

function main() {
  const payload = readInput();
  if (!payload || !payload.toolCall || payload.toolCall.name !== 'run_command') outputDecision('allow');
  try {
    const info = analyze(getCommand(payload));
    if (!info.commit) return outputDecision('allow');
    const cwd = getCwd(payload);
    const repoRoot = git(['rev-parse', '--show-toplevel'], cwd);
    if (!repoRoot) return outputDecision('allow');
    const branch = currentBranch(cwd);
    const planPath = findPlan({ repoRoot, branch, artifactDir: payload.artifactDirectoryPath, cwd });
    if (!planPath) {
      return outputDecision('ask', `No approved plan found (expected docs/plans/${branch ? planSlug(branch) : '<detached>'}.md). Proceed with this commit?`);
    }
    const stagedFiles = lines(git(['diff', '--cached', '--name-only'], cwd));
    let candidates = stagedFiles.slice();
    if (info.includeWorktree) {
      candidates = candidates.concat(
        lines(git(['diff', '--name-only'], cwd)),
        lines(git(['ls-files', '--others', '--exclude-standard'], cwd))
      );
    }
    candidates = [...new Set(candidates)];
    if (!candidates.length) return outputDecision('allow');
    const planPaths = extractPlanPaths(fs.readFileSync(planPath, 'utf8'));
    const ctx = { stagedFiles: candidates, trackedFiles: lines(git(['ls-files'], cwd)) };
    const uncovered = candidates.filter(f => {
      const n = f.replace(/\\/g, '/');
      const base = path.posix.basename(n);
      if (n.startsWith('docs/plans/') || IGNORED_BASENAMES.has(base) || base.endsWith('.lock')) return false;
      return !isCovered(f, planPaths, ctx);
    });
    if (uncovered.length) {
      return outputDecision('ask', `⚠️ Scope Creep Detected by Antigravity Guardrail: Files not mentioned in the approved plan (${path.basename(planPath)}): [${uncovered.join(', ')}]. Do you want to proceed with this commit?`);
    }
    return outputDecision('allow');
  } catch (err) {
    return outputDecision('allow');
  }
}

if (require.main === module) main();

module.exports = { planSlug, findPlan, extractPlanPaths, isCovered };
