#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { readInput, outputDecision, getCommand, getCwd, git, currentBranch, splitCommands, tokenize, normalizeHead, shellInner, parseGit } = require('./lib');

const IGNORED_BASENAMES = new Set([
  'implementation_plan.md', 'task.md', 'walkthrough.md', 'test_cases.md',
  'package-lock.json', 'pnpm-lock.yaml', 'yarn.lock'
]);

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

const VALUE_LETTERS = new Set(['m', 'F', 'C', 'c', 't']);
const VALUE_LONG = new Set(['-m', '--message', '-F', '--file', '-C', '-c', '-t', '--reuse-message', '--reedit-message', '--author', '--date', '--template', '--fixup', '--squash', '--cleanup']);

/** Parse commit args into { stagesAll, pathspecs }. */
function parseCommitArgs(args) {
  let stagesAll = false;
  const pathspecs = [];
  for (let i = 0; i < args.length; i++) {
    const t = args[i];
    if (t === '--') { pathspecs.push(...args.slice(i + 1)); break; }
    if (t === '--all') { stagesAll = true; continue; }
    if (VALUE_LONG.has(t)) { i++; continue; }
    if (t.startsWith('--')) continue;
    if (/^-[A-Za-z]+$/.test(t)) {
      for (const ch of t.slice(1)) {
        if (ch === 'a') stagesAll = true;
        if (VALUE_LETTERS.has(ch)) {
          if (ch === t[t.length - 1]) i++;
          break;
        }
      }
      continue;
    }
    if (t.startsWith('-')) continue;
    pathspecs.push(t);
  }
  return { stagesAll, pathspecs };
}

/** Directory selected by git -C options in a git token list, resolved against base. */
function gitDir(tokens, base) {
  let dir = base;
  for (let i = 1; i < tokens.length; i++) {
    if (tokens[i] === '-C' && i + 1 < tokens.length) { dir = path.resolve(dir, tokens[i + 1]); i++; }
    else if (tokens[i] === '-c' || tokens[i] === '--git-dir' || tokens[i] === '--work-tree' || tokens[i] === '--namespace') i++;
    else if (!tokens[i].startsWith('-')) break;
  }
  return dir;
}

/** Scan a command line; returns { commit, includeWorktree, pathspecs, dir }. */
function analyze(cmdLine, baseDir, depth = 0) {
  const res = { commit: false, includeWorktree: false, pathspecs: [], dir: baseDir };
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
      const r = analyze(inner, baseDir, depth + 1);
      if (r.commit) { res.commit = true; res.pathspecs.push(...r.pathspecs); res.dir = r.dir; }
      res.includeWorktree = res.includeWorktree || r.includeWorktree;
      continue;
    }
    const g = parseGit(tokens);
    if (!g) continue;
    if (g[0] === 'add') res.includeWorktree = true;
    if (g[0] === 'commit') {
      res.commit = true;
      res.dir = gitDir(tokens, baseDir);
      const c = parseCommitArgs(g[1]);
      if (c.stagesAll) res.includeWorktree = true;
      res.pathspecs.push(...c.pathspecs);
    }
  }
  return res;
}

const lines = s => (s || '').split(/\r?\n/).filter(Boolean);

function main() {
  const payload = readInput();
  if (!payload || !payload.toolCall || payload.toolCall.name !== 'run_command') outputDecision('allow');
  try {
    const info = analyze(getCommand(payload), getCwd(payload));
    if (!info.commit) return outputDecision('allow');
    const cwd = info.dir;
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
        lines(git(['ls-files', '--others', '--exclude-standard', '--full-name'], cwd))
      );
    }
    for (const spec of info.pathspecs) {
      candidates = candidates.concat(
        lines(git(['diff', '--name-only', '--', spec], cwd)),
        lines(git(['diff', '--cached', '--name-only', '--', spec], cwd)),
        lines(git(['ls-files', '--others', '--exclude-standard', '--full-name', '--', spec], cwd))
      );
    }
    candidates = [...new Set(candidates)];
    if (!candidates.length) return outputDecision('allow');
    const planPaths = extractPlanPaths(fs.readFileSync(planPath, 'utf8'));
    const ctx = { stagedFiles: candidates, trackedFiles: lines(git(['ls-files', '--full-name'], cwd)) };
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
