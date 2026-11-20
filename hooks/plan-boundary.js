#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { readInput, outputDecision, getCommand, getCwd, git, currentBranch, splitCommands, tokenize, normalizeHead, shellInner, parseGit, fallbackTokens, quotesBalanced, gitDir, segmentsWithDirs } = require('./lib');

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
      for (let k = 1; k < t.length; k++) {
        const ch = t[k];
        if (ch === 'a') stagesAll = true;
        if (VALUE_LETTERS.has(ch)) {
          if (k === t.length - 1) i++;
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

const ADD_VALUE_LONG = new Set(['--chmod', '--pathspec-from-file']);

/** Parse `git add` args into { stagesAll, pathspecs }. -A/--all/-u/--update/./:/ mean the whole worktree. */
function parseAddArgs(args) {
  let stagesAll = false;
  const pathspecs = [];
  for (let i = 0; i < args.length; i++) {
    const t = args[i];
    if (t === '--') { pathspecs.push(...args.slice(i + 1)); break; }
    if (t === '--all' || t === '--update' || t.startsWith('--pathspec-from-file')) { stagesAll = true; continue; }
    if (ADD_VALUE_LONG.has(t)) { i++; continue; }
    if (t.startsWith('--')) continue;
    if (/^-[A-Za-z]+$/.test(t)) { if (/[Au]/.test(t)) stagesAll = true; continue; }
    if (t.startsWith('-')) continue;
    pathspecs.push(t);
  }
  for (const p of pathspecs) {
    if (['.', './', ':/', ':', '*', ':/:'].includes(p.replace(/\\/g, '/'))) stagesAll = true;
  }
  return { stagesAll, pathspecs };
}

/** True for a path argument computed at run time ($VAR, $(...), backticks) rather than written out. */
const nonLiteral = t => /[$`]/.test(t);

/**
 * Scan a command line; returns { commit, includeWorktree, pathspecs, dir }.
 * dir is the repo directory the commit runs in, following literal cd / Set-Location /
 * pushd earlier in the chain and git -C, so a workspace that is a parent folder of the
 * repo (Antigravity's Cwd) still resolves the right repo.
 */
function analyze(cmdLine, baseDir, depth = 0) {
  const res = { commit: false, includeWorktree: false, pathspecs: [], dir: baseDir };
  if (depth > 3) return res;
  const dirOf = new Map(segmentsWithDirs(cmdLine, baseDir).map(({ seg, dir }) => [seg, dir]));
  const exact = new Set(dirOf.keys());
  const balanced = quotesBalanced(cmdLine);
  const segments = new Set([...exact, ...splitCommands(cmdLine.replace(/["'`]/g, ' '))]);
  const addDirs = [];
  for (const seg of segments) {
    // The quote-stripped pass only detects commits; pathspecs come from exact tokenization.
    const usePaths = exact.has(seg);
    // undefined after a cd whose target cannot be known here ($VAR, cd -).
    const segDir = usePaths ? dirOf.get(seg) : baseDir;
    let tokens = normalizeHead(tokenize(seg));
    if (!tokens.length) continue;
    // Unknown prefix (timeout, nice, doas, ...): evaluate from the first git/shell/eval token.
    // Stripped-only segments use it only when the line has an unclosed quote.
    if (usePaths || !balanced) tokens = fallbackTokens(tokens) || tokens;
    const inner = shellInner(tokens);
    if (inner !== null) {
      const r = analyze(inner, segDir === undefined ? baseDir : segDir, depth + 1);
      if (r.commit) { res.commit = true; res.dir = r.dir; }
      if (usePaths) { res.pathspecs.push(...r.pathspecs); if (r.pathspecs.length) addDirs.push(r.dir); }
      res.includeWorktree = res.includeWorktree || r.includeWorktree;
      continue;
    }
    const g = parseGit(tokens);
    if (!g) continue;
    const dir = segDir === undefined ? undefined : gitDir(tokens, segDir);
    if (g[0] === 'add') {
      // Explicit paths come from exact tokens only; an add seen only in the quote-stripped
      // pass of a line with an unclosed quote is treated as staging the whole worktree.
      if (usePaths) {
        const a = parseAddArgs(g[1]);
        // No written-out paths (xargs git add) or computed ones ($FILES, $(...)): the
        // staged set is unknown here, so check the whole worktree.
        if (a.stagesAll || !a.pathspecs.length || g[1].some(nonLiteral)) res.includeWorktree = true;
        res.pathspecs.push(...a.pathspecs);
        addDirs.push(dir);
      } else if (!balanced) res.includeWorktree = true;
    }
    if (g[0] === 'commit') {
      // Exact segments come first and know their cd directory; a commit seen only in the
      // quote-stripped pass (e.g. `-m "a: b"` re-split) must not overwrite that directory.
      if (usePaths || !res.commit) res.dir = dir === undefined ? baseDir : dir;
      res.commit = true;
      const c = parseCommitArgs(g[1]);
      if (c.stagesAll || (usePaths && c.pathspecs.some(nonLiteral))) res.includeWorktree = true;
      if (usePaths) { res.pathspecs.push(...c.pathspecs); if (c.pathspecs.length) addDirs.push(dir); }
    }
  }
  // Paths added from another (or an unknown) directory than the commit's cannot be
  // resolved against the commit's directory: check the whole worktree instead.
  if (addDirs.some(d => d === undefined || path.resolve(d) !== path.resolve(res.dir))) res.includeWorktree = true;
  return res;
}

const lines = s => (s || '').split(/\r?\n/).filter(Boolean);

function isDir(p) {
  try { return fs.statSync(p).isDirectory(); } catch (err) { return false; }
}

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
      // The no-plan prompt is opt-in per repo: only repos that keep a docs/plans/ directory get it.
      if (!isDir(path.join(repoRoot, 'docs', 'plans'))) return outputDecision('allow');
      return outputDecision('force_ask', `No approved plan found (expected docs/plans/${branch ? planSlug(branch) : '<detached>'}.md). Proceed with this commit?`);
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
      return outputDecision('force_ask', `⚠️ Scope Creep Detected by Antigravity Guardrail: Files not mentioned in the approved plan (${path.basename(planPath)}): [${uncovered.join(', ')}]. Do you want to proceed with this commit?`);
    }
    return outputDecision('allow');
  } catch (err) {
    return outputDecision('allow');
  }
}

if (require.main === module) main();

module.exports = { planSlug, findPlan, extractPlanPaths, isCovered };
