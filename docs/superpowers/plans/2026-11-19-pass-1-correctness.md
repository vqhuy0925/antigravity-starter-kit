# Pass 1 — Correctness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the kit's guardrails actually fire and actually catch what they claim, and give agents one plan-file rule and one approval model.

**Architecture:** The three `PreToolUse` hooks stay dependency-free Node scripts sharing `hooks/lib.js`. Shared parsing (command splitting, tokenizing, git calls) moves into `lib.js`; each hook exports its pure decision function for unit tests and runs as a script when executed directly. A new `bin/link-hooks.js` rewrites `hooks.json` to absolute paths at install time, called by all three installers. Rule and skill text changes are plain Markdown edits checked by grep.

**Tech Stack:** Node.js ≥ 18, `node:test` + `node:assert` (built-in), git CLI, Bash, PowerShell 7.

**Spec:** `docs/superpowers/specs/2026-11-19-kit-review-design.md` — §3 findings H1–H8, R1–R3; §4 Pass 1; §5; §7; §8.

## Global Constraints

- No npm dependencies. Node ≥ 18 built-ins only.
- Hook I/O contract unchanged: stdin JSON `{ toolCall: { name, args: { CommandLine, Cwd } }, artifactDirectoryPath?, workspacePaths? }`; stdout JSON `{ decision: 'allow'|'deny'|'ask', reason? }`; exit 0.
- Hooks fail open (`allow`) on internal error — but never because of a path-resolution mistake.
- Protected branches: `main`, `master`.
- Plan location: `docs/plans/<branch>.md`, with every `/` in the branch name replaced by `-` (e.g. `feat/login` → `docs/plans/feat-login.md`). Fallback: `implementation_plan.md` in `artifactDirectoryPath`, then up to 4 directories up from `Cwd`.
- No plan found on a `git commit` → `ask` (not `allow`).
- `--force` / `-f` / `+refspec` push → `deny` on any branch. `--force-with-lease` → `allow` unless a target is protected.
- `git commit` always asks — written rule in `rules/AGENTS.md` only; no new hook.
- Tier 2 runs: no commits mid-run; at the end `commit-code` groups changes and asks once per commit.
- `ai-native-sdlc` Stage 2b owns the `define-tests` subagent; `plan` only triggers it when `test_cases.md` is missing.
- Skill folder names don't change in this pass.
- Version bump: `1.5.0` → `1.6.0` in both `plugin.json` and `package.json`.

## Review Focus

1. **Chained commands** — `git add -A && git push --force origin x` or `npm test; git push origin main`: the guard must judge every segment, not just the first. → Task 3 test `denies force push inside a chain`.
2. **`git add` in the same chain as `git commit`, or `commit -a`** — the hook runs *before* the command, so `git diff --cached` misses files the chain is about to stage. → Task 4 test `checks files staged by the same chain`.
3. **Windows paths** — plan written with backslashes (`src\auth\login.ts`), CRLF line endings, `Cwd` with backslashes. → Task 4 test `matches backslash paths and CRLF plans`.
4. **Detached HEAD** — no branch name: a bare `git push` must not crash or deny, and plan lookup must fall back to `implementation_plan.md`. → Task 3 test `allows bare push on detached HEAD`; Task 4 test `detached HEAD falls back to implementation_plan.md`.
5. **Secret false positives on env-var references** — `Authorization: Bearer $GITHUB_TOKEN` and branch names like `task-add-login-for-users-and-admins-xyz` must stay `allow`. → Task 2 tests `allows bearer env var` and `allows long hyphenated branch names`.

---

### Task 1: Shared hook helpers and `node:test` harness

**Files:**
- Modify: `hooks/lib.js`
- Create: `test/helpers.js`, `test/lib.test.js`, `test/git-guardrail.test.js`, `test/secret-scan.test.js`
- Delete: `test/verify-hooks.test.js` (its 9 cases move into the two new files unchanged)
- Modify: `package.json` (`"test": "node --test"`), `bin/cli.js` `verifyHooks()` (spawn `node --test` from the kit root instead of the old script path)

**Interfaces:**
- Produces in `hooks/lib.js` (alongside existing `readInput`, `outputDecision`):
  - `getCommand(payload) -> string` — `payload.toolCall.args.CommandLine` or `''`
  - `getCwd(payload) -> string` — `args.Cwd` || `payload.workspacePaths[0]` || `process.cwd()`
  - `git(args: string[], cwd: string) -> string | null` — `execFileSync('git', args)`, trimmed stdout, `null` on any error, 5 s timeout
  - `currentBranch(cwd) -> string | null` — `git branch --show-current`; `null` when empty (detached) or on error
  - `splitCommands(cmd) -> string[]` — splits on `&&`, `||`, `;`, `|`, newline, ignoring separators inside single/double quotes; trims; drops empties
  - `tokenize(segment) -> string[]` — whitespace split respecting single/double quotes; quotes stripped
- Produces in `test/helpers.js`:
  - `runHook(hookFile, payload) -> { decision, reason }`
  - `cmd(commandLine, cwd?) -> payload` — builds `{ toolCall: { name: 'run_command', args: { CommandLine, Cwd } } }`
  - `makeRepo({ branch = 'feat/x', files = {} } = {}) -> string` — temp dir (`fs.mkdtempSync(os.tmpdir())`), `git init -b main`, local `user.name`/`user.email`, writes `files` + a `README.md`, initial commit, then `git checkout -b <branch>` unless branch is `main`; returns the dir
  - `write(dir, relPath, content)` and `stage(dir, ...relPaths)`

- [ ] **Step 1: Write `test/lib.test.js`**

```js
test('splitCommands splits on separators outside quotes', () => {
  assert.deepStrictEqual(
    splitCommands('git add . && git commit -m "a && b"; git push | cat'),
    ['git add .', 'git commit -m "a && b"', 'git push', 'cat']);
});
test('tokenize keeps quoted args whole', () => {
  assert.deepStrictEqual(tokenize(`git commit -m 'fix: a b'`), ['git', 'commit', '-m', 'fix: a b']);
});
test('currentBranch returns branch, null when detached', () => {
  const dir = makeRepo({ branch: 'feat/x' });
  assert.strictEqual(currentBranch(dir), 'feat/x');
  execFileSync('git', ['checkout', '--detach'], { cwd: dir });
  assert.strictEqual(currentBranch(dir), null);
});
test('getCwd prefers args.Cwd, then workspacePaths', () => {
  assert.strictEqual(getCwd({ toolCall: { args: { Cwd: 'A' } }, workspacePaths: ['B'] }), 'A');
  assert.strictEqual(getCwd({ toolCall: { args: {} }, workspacePaths: ['B'] }), 'B');
});
```

- [ ] **Step 2: Run `node --test test/lib.test.js` — expect FAIL (`splitCommands is not a function`).**
- [ ] **Step 3: Implement the five helpers in `hooks/lib.js` and export them; write `test/helpers.js`.**
- [ ] **Step 4: Port the 9 existing cases into `test/git-guardrail.test.js` (6) and `test/secret-scan.test.js` (3) using `node:test`; delete `test/verify-hooks.test.js`; update `package.json` and `bin/cli.js verifyHooks()`.**
- [ ] **Step 5: Run `npm test` — expect all pass, 13 tests.** Run `node bin/cli.js --verify` — expect the same suite to run and exit 0.
- [ ] **Step 6: Commit** `test: move hook tests to node:test and add shared hook helpers`

---

### Task 2: Secret-scan patterns (H4)

**Files:**
- Modify: `hooks/secret-scan.js:14-20`
- Test: `test/secret-scan.test.js`

**Interfaces:**
- Consumes: `getCommand` from Task 1.
- Produces: `module.exports = { findSecret(cmd: string) -> string | null }` (returns the matched pattern's label, e.g. `'Anthropic/OpenAI key'`); script mode runs only when `require.main === module`. Deny reason stays `/credential or private key/` and appends the label.

- [ ] **Step 1: Add failing tests** (build fake keys by concatenation so the test file holds no literal key):

```js
const deny = s => assert.strictEqual(runHook('secret-scan.js', cmd(s)).decision, 'deny');
const allow = s => assert.strictEqual(runHook('secret-scan.js', cmd(s)).decision, 'allow');
test('blocks sk-ant- keys', () => deny(`export K=${'sk-ant-api03-' + 'a'.repeat(40)}`));
test('blocks sk-proj- keys', () => deny(`curl -d key=${'sk-proj-' + 'B1_'.repeat(14)}`));
test('blocks Google API keys', () => deny(`curl "https://x?key=${'AIza' + 'c'.repeat(35)}"`));
test('blocks github_pat_ tokens', () => deny(`git clone https://${'github_pat_' + 'd'.repeat(82)}@github.com/o/r`));
test('blocks literal Bearer tokens', () => deny(`curl -H "Authorization: Bearer ${'e'.repeat(40)}"`));
test('allows bearer env var', () => allow('curl -H "Authorization: Bearer $GITHUB_TOKEN"'));
test('allows long hyphenated branch names', () => allow('git checkout -b task-add-login-for-users-and-admins-xyz-0123456789'));
```

- [ ] **Step 2: Run `node --test test/secret-scan.test.js` — expect the 5 new deny tests to FAIL.**
- [ ] **Step 3: Implement `findSecret`** with the existing patterns plus: `/\bsk-[A-Za-z0-9_-]{32,}/` (replaces the old `sk-` pattern; covers `sk-ant-`, `sk-proj-`), `/\bAIza[0-9A-Za-z_-]{35}\b/`, `/\bgithub_pat_[A-Za-z0-9_]{82}\b/`, `/\bBearer\s+[A-Za-z0-9._~+\/-]{30,}=*/` (the `$` of an env var is not in the class, so env refs don't match).
- [ ] **Step 4: Run `npm test` — expect all pass.**
- [ ] **Step 5: Commit** `fix(hooks): detect Anthropic, OpenAI project, Google, GitHub PAT and bearer secrets`

---

### Task 3: git-guardrail — push rules and root-delete (H5, H6, H7)

**Files:**
- Modify: `hooks/git-guardrail.js`
- Test: `test/git-guardrail.test.js`

**Interfaces:**
- Consumes: `getCommand`, `getCwd`, `currentBranch`, `splitCommands`, `tokenize` from Task 1.
- Produces: `module.exports = { checkSegment(tokens: string[], branch: string | null) -> { decision, reason } | null }` — `null` means "nothing to say about this segment". The script runs `checkSegment` on every segment of `splitCommands(cmd)` and outputs the most severe result (`deny` > `ask` > `allow`).

Push analysis (segment whose tokens are `git [-C <dir>] push …`):
- **force** = any of `--force`, `-f`, a short-flag cluster containing `f` (e.g. `-fu`), or a refspec starting with `+`
- **lease** = `--force-with-lease[=…]` or `--force-if-includes`
- **targets** = positional args after the remote; for each refspec strip leading `+`, take the part after `:` if present, strip `refs/heads/`; `HEAD` → `branch`. No refspec → `[branch]`. `--all` / `--mirror` → treat as targeting `main`.
- Order: force → `deny` (existing "Force push" reason). Any target in {main, master} → `deny` (existing "protected" reason). Otherwise `allow`. `branch === null` with no refspec → `allow`.

Root-delete: `deny` for `rm` with recursive flags whose target is `/`, `/*`, `~`, `~/`, `$HOME`, `${HOME}`; and `Remove-Item` with `-Recurse` targeting a bare drive root (`C:\`, `C:/`, `C:\*`). The existing `rmdir /s /q C:\` check stays. `git reset --hard` → `ask` stays.

- [ ] **Step 1: Add failing tests** (bare-push tests use `makeRepo` for a real branch):

```js
const d = (c, cwd) => runHook('git-guardrail.js', cmd(c, cwd)).decision;
test('denies push to HEAD:main', () => assert.strictEqual(d('git push origin HEAD:main'), 'deny'));
test('denies push to main with flags between', () => assert.strictEqual(d('git push -u origin main'), 'deny'));
test('denies push to main on any remote', () => assert.strictEqual(d('git push fork main'), 'deny'));
test('denies bare push while on main', () => assert.strictEqual(d('git push', makeRepo({ branch: 'main' })), 'deny'));
test('allows bare push on feature branch', () => assert.strictEqual(d('git push', makeRepo({ branch: 'feat/x' })), 'allow'));
test('allows bare push on detached HEAD', () => {
  const dir = makeRepo(); execFileSync('git', ['checkout', '--detach'], { cwd: dir });
  assert.strictEqual(d('git push', dir), 'allow');
});
test('allows force-with-lease on feature branch', () => assert.strictEqual(d('git push --force-with-lease origin feat/x'), 'allow'));
test('denies force-with-lease to main', () => assert.strictEqual(d('git push --force-with-lease origin main'), 'deny'));
test('denies +refspec force push', () => assert.strictEqual(d('git push origin +feat/x'), 'deny'));
test('denies -fu cluster', () => assert.strictEqual(d('git push -fu origin feat/x'), 'deny'));
test('denies force push inside a chain', () => assert.strictEqual(d('git add -A && git push --force origin x'), 'deny'));
test('denies push to main after a semicolon', () => assert.strictEqual(d('npm test; git push origin main'), 'deny'));
for (const c of ['rm -rf /*', 'rm -rf ~', 'rm -rf ~/', 'rm -rf $HOME', 'Remove-Item -Recurse -Force C:\\'])
  test(`denies ${c}`, () => assert.strictEqual(d(c), 'deny'));
for (const c of ['rm -rf ./build', 'rm -rf /tmp/foo', 'git push origin feat/x', 'git log --follow-tags'])
  test(`allows ${c}`, () => assert.strictEqual(d(c), 'allow'));
```

- [ ] **Step 2: Run `node --test test/git-guardrail.test.js` — expect the new tests to FAIL** (`force-with-lease on feature branch` currently denies; `HEAD:main`, bare push, chain, `~`, `$HOME`, and `Remove-Item` currently allow).
- [ ] **Step 3: Implement `checkSegment` and the segment loop in `hooks/git-guardrail.js`.** Keep the existing reason strings so the ported tests still match.
- [ ] **Step 4: Run `npm test` — expect all pass.**
- [ ] **Step 5: Commit** `fix(hooks): close protected-push gaps, allow force-with-lease on feature branches, widen root-delete guard`

---

### Task 4: plan-boundary — plan location, path matching, no-plan ask (H2, H3)

**Files:**
- Modify: `hooks/plan-boundary.js`
- Create: `test/plan-boundary.test.js`

**Interfaces:**
- Consumes: `getCommand`, `getCwd`, `git`, `currentBranch`, `splitCommands`, `tokenize` from Task 1; `makeRepo`, `write`, `stage` from `test/helpers.js`.
- Produces: `module.exports = { planSlug(branch: string) -> string, findPlan({ repoRoot, branch, artifactDir, cwd }) -> string | null, extractPlanPaths(text: string) -> Set<string>, isCovered(file: string, planPaths: Set<string>, ctx: { stagedFiles: string[], trackedFiles: string[] }) -> boolean }`

Behaviour:
- Acts only when some segment is `git … commit`; otherwise `allow`.
- `repoRoot` = `git rev-parse --show-toplevel` in `Cwd`; not a repo → `allow`.
- `findPlan`: `<repoRoot>/docs/plans/<planSlug(branch)>.md` (skip when `branch` is null), then `<artifactDir>/implementation_plan.md`, then `implementation_plan.md` walking up ≤ 4 dirs from `cwd`.
- No plan → `ask` with reason `No approved plan found (expected docs/plans/<slug>.md). Proceed with this commit?` (`<slug>` reads `<detached>` when branch is null).
- Candidate files = `git diff --cached --name-only`; **plus** `git diff --name-only` and `git ls-files --others --exclude-standard` when the commit segment has `-a` / `--all` / a short cluster containing `a` (e.g. `-am`), or an earlier segment in the same command is `git add`.
- Skipped: anything under `docs/plans/`, `implementation_plan.md`, `task.md`, `walkthrough.md`, `test_cases.md`, `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `*.lock`. (Drop the old `test_cases_` prefix rule.)
- `extractPlanPaths`: normalise CRLF; collect every backticked token and every Markdown list-item's first token that contains `/` or `.`; convert `\` → `/`, strip a leading `./`.
- `isCovered`: exact path match; or a plan path ending in `/` that the file starts with; or basename match only when that basename occurs once among `stagedFiles` and at most once among `trackedFiles` (`git ls-files`).
- Uncovered files → `ask` with the existing "Scope Creep Detected" reason listing them.

- [ ] **Step 1: Write `test/plan-boundary.test.js`:**

```js
const run = (dir, c = 'git commit -m x', extra = {}) =>
  runHook('plan-boundary.js', { ...cmd(c, dir), ...extra });
test('asks when no plan exists', () => {
  const dir = makeRepo({ branch: 'feat/login' }); write(dir, 'src/a.ts', '1'); stage(dir, 'src/a.ts');
  const r = run(dir); assert.strictEqual(r.decision, 'ask'); assert.match(r.reason, /docs\/plans\/feat-login\.md/);
});
test('allows files listed by path in docs/plans/<slug>.md', () => {
  const dir = makeRepo({ branch: 'feat/login', files: { 'docs/plans/feat-login.md': '- `src/auth/login.ts`\n' } });
  write(dir, 'src/auth/login.ts', '1'); stage(dir, 'src/auth/login.ts');
  assert.strictEqual(run(dir).decision, 'allow');
});
test('asks on basename collision', () => {
  const dir = makeRepo({ branch: 'feat/a', files: { 'docs/plans/feat-a.md': '- `index.ts`\n', 'lib/index.ts': '0' } });
  write(dir, 'src/index.ts', '1'); write(dir, 'lib/index.ts', '1'); stage(dir, 'src/index.ts', 'lib/index.ts');
  assert.strictEqual(run(dir).decision, 'ask');
});
test('allows files under a listed directory', () => {
  const dir = makeRepo({ branch: 'feat/a', files: { 'docs/plans/feat-a.md': '- `src/auth/`\n' } });
  write(dir, 'src/auth/x.ts', '1'); stage(dir, 'src/auth/x.ts');
  assert.strictEqual(run(dir).decision, 'allow');
});
test('matches backslash paths and CRLF plans', () => {
  const dir = makeRepo({ branch: 'feat/a', files: { 'docs/plans/feat-a.md': '- `src\\auth\\login.ts`\r\n' } });
  write(dir, 'src/auth/login.ts', '1'); stage(dir, 'src/auth/login.ts');
  assert.strictEqual(run(dir).decision, 'allow');
});
test('checks files staged by the same chain', () => {
  const dir = makeRepo({ branch: 'feat/a', files: { 'docs/plans/feat-a.md': '- `src/a.ts`\n' } });
  write(dir, 'src/a.ts', '1'); write(dir, 'src/extra.ts', '1');
  assert.strictEqual(run(dir, 'git add -A && git commit -m x').decision, 'ask');
});
test('detached HEAD falls back to implementation_plan.md', () => {
  const dir = makeRepo({ files: { 'implementation_plan.md': '- `src/a.ts`\n' } });
  execFileSync('git', ['checkout', '--detach'], { cwd: dir });
  write(dir, 'src/a.ts', '1'); stage(dir, 'src/a.ts');
  assert.strictEqual(run(dir).decision, 'allow');
});
test('uses artifactDirectoryPath plan', () => {
  const dir = makeRepo({ branch: 'feat/a' }); const art = fs.mkdtempSync(path.join(os.tmpdir(), 'art-'));
  fs.writeFileSync(path.join(art, 'implementation_plan.md'), '- `src/a.ts`\n');
  write(dir, 'src/a.ts', '1'); stage(dir, 'src/a.ts');
  assert.strictEqual(run(dir, 'git commit -m x', { artifactDirectoryPath: art }).decision, 'allow');
});
test('ignores non-commit commands', () => assert.strictEqual(run(makeRepo(), 'git status').decision, 'allow'));
test('plan file itself never counts as scope creep', () => {
  const dir = makeRepo({ branch: 'feat/a', files: { 'docs/plans/feat-a.md': '- `src/a.ts`\n' } });
  write(dir, 'docs/plans/feat-a.md', '- `src/a.ts`\n- `src/b.ts`\n'); stage(dir, 'docs/plans/feat-a.md');
  assert.strictEqual(run(dir).decision, 'allow');
});
```

- [ ] **Step 2: Run `node --test test/plan-boundary.test.js` — expect FAIL** (no-plan currently allows; `docs/plans` not searched; chain/backslash/directory cases not handled).
- [ ] **Step 3: Implement the four exported functions and the script flow in `hooks/plan-boundary.js`.**
- [ ] **Step 4: Run `npm test` — expect all pass.**
- [ ] **Step 5: Commit** `fix(hooks): find plans in docs/plans, match by path, ask when no plan exists`

---

### Task 5: Absolute hook paths at install time (H1)

**Files:**
- Create: `bin/link-hooks.js`, `test/link-hooks.test.js`
- Modify: `bin/cli.js` (call `linkHooks(targetDir)` after both the copy branch and the git branch), `install.sh`, `install.ps1`

**Interfaces:**
- Produces: `bin/link-hooks.js` exports `linkHooks(pluginDir: string) -> { changed: number }`; when run directly, `node bin/link-hooks.js <pluginDir>` (default: the kit root, `path.resolve(__dirname, '..')`).
- Rewrite rule: every hook `command` matching `^node\s+"?(?:.*[\\/])?hooks[\\/]([\w.-]+\.js)"?$` becomes `node "<pluginDir>/hooks/<file>"` with `pluginDir` absolute and using forward slashes. Commands not matching are left untouched. Idempotent. Output keeps 2-space JSON indentation.
- Installers: before `git pull` on an existing install, run `git -C <dest> checkout -- hooks.json` so the rewritten file never blocks the update; after clone/pull, run `node <dest>/bin/link-hooks.js <dest>`. If `node` is missing, print a warning that guardrails stay inactive until it is installed, and exit 0 (skills/rules still work).

- [ ] **Step 1: Write `test/link-hooks.test.js`:**

```js
test('rewrites relative hook commands to absolute paths', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-'));
  fs.copyFileSync(path.join(ROOT, 'hooks.json'), path.join(dir, 'hooks.json'));
  linkHooks(dir);
  const cmds = JSON.parse(fs.readFileSync(path.join(dir, 'hooks.json'), 'utf8'))
    ['antigravity-guardrails'].PreToolUse[0].hooks.map(h => h.command);
  const abs = dir.replace(/\\/g, '/');
  assert.deepStrictEqual(cmds, ['git-guardrail.js', 'secret-scan.js', 'plan-boundary.js']
    .map(f => `node "${abs}/hooks/${f}"`));
});
test('is idempotent', () => { /* run linkHooks twice on a fresh copy; file bytes identical after 1st and 2nd run; 2nd returns { changed: 0 } */ });
test('linked command runs the hook from an unrelated cwd', () => {
  /* link a copy of the whole kit (copy hooks/ and hooks.json) into a temp dir, take the git-guardrail command,
     execute it with spawnSync(shell: true, cwd: os.tmpdir(), input: payload for 'git push --force origin x');
     expect stdout decision 'deny' */
});
```

- [ ] **Step 2: Run `node --test test/link-hooks.test.js` — expect FAIL (`Cannot find module '../bin/link-hooks'`).**
- [ ] **Step 3: Implement `bin/link-hooks.js`; wire it into `bin/cli.js`, `install.sh`, `install.ps1` as above.** Keep the committed `hooks.json` relative.
- [ ] **Step 4: Run `npm test` — expect all pass.** Then: `node bin/cli.js --local` in a scratch directory, and check `.agents/plugins/antigravity-starter-kit/hooks.json` holds absolute paths that exist. Run `bash install.sh --local` in another scratch dir (from a pushed branch, or temporarily point `REPO_URL` at the local repo path) and check the same.
- [ ] **Step 5: Commit** `fix(install): write absolute hook paths so guardrails run from any workspace`

---

### Task 6: One approval model and plan rule in `rules/AGENTS.md` (R1, R2)

**Files:**
- Modify: `rules/AGENTS.md` §1 (Stage 3 line, Tier 1/Tier 2 actions, Plan Phase, Implement Phase, Commit Phase) and §2 (replace Gate A/B/C)

**Interfaces:**
- Produces: a section heading `## 2. APPROVAL MODEL` that Task 7's skills link to instead of restating gates.

Content decisions (wording is the builder's):
- §2 becomes the five-row ladder from spec §4 Pass 1 step 8, verbatim in meaning, including: "In a Tier 2 run, no commits mid-run: at the end, `commit-code` groups the changes and asks once per grouped commit." External writes are named generically: "any external tracker or API write (Jira, GitHub Issues, Linear, Trello, …)".
- Keep "Batch Questions" and "Gates Never Move Into Subagents" — move them under §2.
- Tier 1 action text: drop "Do not block on approval modals"; say "no plan file; commit still asks per §2".
- Stage 3 / Plan Phase: "write the plan to `docs/plans/<branch>.md` (branch `/` → `-`), commit it with the work; optionally mirror it to the conversation's `implementation_plan.md`."
- Implement Phase: drop the duplicate "Never push…" (§2 owns it).

- [ ] **Step 1: Edit `rules/AGENTS.md`.**
- [ ] **Step 2: Verify** — `grep -nE "GATE [ABC]|plan\.md|approval modals" rules/AGENTS.md` → no output except `docs/plans/<branch>.md` and the optional `implementation_plan.md` mirror line. Read §1–§2 once top to bottom and confirm every "does the agent stop here?" case has exactly one answer.
- [ ] **Step 3: Commit** `docs(rules): single approval ladder and docs/plans plan location`

---

### Task 7: Align skills and templates with the plan rule and single QA trigger (R2, R3)

**Files:**
- Modify: `skills/ai-native-sdlc/SKILL.md` (diagram `maintain.md` → `bug_report.md`, `plan.md` → `docs/plans/<branch>.md`, Stage 3 text, Stage 2b states it owns `define-tests`)
- Modify: `skills/plan/SKILL.md` (§2: read `test_cases.md`; spawn the `define-tests` subagent only if it is missing; §3 output path `docs/plans/<branch>.md`; §4 gate links `rules/AGENTS.md` §2)
- Modify: `skills/implement/SKILL.md`, `skills/define-tests/SKILL.md` (Mode B), `skills/start-day/SKILL.md` (Phase 0 artifact list, Phase 2 commit step per §2 cadence), `skills/fix-bug/SKILL.md` (`test_cases_<feature>.md` → `test_cases.md`), `skills/commit-code/SKILL.md` (add: "ask once per grouped commit per `rules/AGENTS.md` §2")
- Modify: `templates/plan_template.md` (header note: save as `docs/plans/<branch>.md`; list changed files as backticked repo-relative paths — this is what `plan-boundary` matches), `templates/test_cases_template.md:4`

**Interfaces:**
- Consumes: `rules/AGENTS.md` §2 heading from Task 6.

- [ ] **Step 1: Make the edits.**
- [ ] **Step 2: Verify:**
  - `grep -rnE "\bplan\.md\b" skills rules templates agents` → only hits are `docs/plans/…` or `implementation_plan.md` mirror mentions
  - `grep -rn "maintain.md\|test_cases_<" skills rules templates` → no output
  - `grep -rn "invoke_subagent" skills/plan/SKILL.md` → the only hit is inside a "if `test_cases.md` is missing" condition
- [ ] **Step 3: Commit** `docs(skills): one plan location, one QA trigger, commit cadence`

---

### Task 8: README, CHANGELOG, version, and live-check checklist

**Files:**
- Modify: `README.md` (Guardrails section: what each hook now catches, the run_command-only caveat (H9), no-plan → ask; Installation: Git Submodule method adds `node .agents/plugins/antigravity-starter-kit/bin/link-hooks.js`; Self-Verification: new `npm test` output; Plan path wherever `implementation_plan.md` is named)
- Create: `CHANGELOG.md` (1.6.0 entry with a **Migration** subsection: re-run the installer to get absolute hook paths; move plans to `docs/plans/<branch>.md`; commits with no plan now prompt; `--force-with-lease` now allowed on feature branches)
- Modify: `plugin.json`, `package.json` → `1.6.0`
- Create: `docs/checklists/antigravity-live-check.md`

**Checklist content** (Pass 1 portion; the user or a teammate runs it, results go in the PR):
1. Install globally from this branch (`node bin/cli.js --global`); open `~/.gemini/config/plugins/antigravity-starter-kit/hooks.json` — paths absolute and existing.
2. Open any unrelated project in Antigravity; ask the agent to run `git push --force origin test` → expect the "Force push" block message.
3. Ask the agent to run `echo sk-ant-` + 40 `a` characters → expect the secret block.
4. On a feature branch with no `docs/plans/<branch>.md`, ask the agent to commit a change → expect the "No approved plan found" prompt.
5. Add the plan listing that file, commit again → no plan prompt.
6. Record for each: pass/fail, Antigravity version, OS. Also note whether the payload contained `artifactDirectoryPath` (temporarily add `fs.appendFileSync(os.tmpdir()+'/agy-payload.log', JSON.stringify(payload)+'\n')` to `plan-boundary.js` in the installed copy, then remove it).

- [ ] **Step 1: Write the files above.**
- [ ] **Step 2: Verify** — `npm test` passes; the test-output block in README matches the real `npm test` summary line; `grep -n '"version"' plugin.json package.json` shows `1.6.0` twice.
- [ ] **Step 3: Commit** `docs: changelog, migration notes, live-check checklist for 1.6.0`
- [ ] **Step 4: Hand the checklist to the user** and stop. The PR (opened only on the user's request) records the checklist results.
