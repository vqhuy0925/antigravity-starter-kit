# Pass 3 — Trim the Skill Set Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every skill followable by a Gemini/Antigravity agent and remove overlap. This covers findings C1–C3, C5 and S1–S5.

**Architecture:** These are documentation changes to `rules/`, `skills/`, `agents/`, `README.md`, `plugin.json` and `CHANGELOG.md`, plus new assertions in `test/kit-content.test.js`. Three skill folders are removed: `grill-me`, `grill-with-docs` and `smart-researcher`. Their content is merged into `grilling` and `token-optimization`.

**Tech Stack:** Markdown; Node 18 built-in test runner (`node --test`).

**Spec:** `docs/superpowers/specs/2026-11-19-kit-review-design.md`, §3.4–3.5 and §4 "Pass 3".

## Facts this plan relies on (verified 2026-11-20)

Sources: the official docs (https://antigravity.google/docs/skills.md, /docs/skills, /docs/subagents, /docs/plugins) and a live tool listing from Antigravity, recorded in `docs/checklists/antigravity-skills-check.md`.
- SKILL.md frontmatter has only `name` and `description`. `disable-model-invocation` is not a field, and no field makes a skill user-only. Skills fire automatically by description, or when the user types `/<name>`.
- There is no "Skill" tool, and skill aliases are not supported. An agent uses another skill by reading its `SKILL.md`.
- Tools in the app:
  - `read_file` (`Path`, `StartLine`, `EndLine`);
  - `run_command` (`CommandLine`, `BypassSandbox`, …);
  - `invoke_subagent` (`TypeName`, `Role`, `Prompt`, `Model`, `Workspace`);
  - `manage_subagents` (`Action`: `list` | `kill` | `kill_all`, `ConversationIds`).
- There is **no** `view_file` and **no** `grep_search`. Content search runs through `run_command` (`rg` / `grep`).

## Global Constraints

- Each rule is stated in exactly one file; other files reference it.
- Replace skill-chaining wording with exactly: "Read and follow `skills/<name>/SKILL.md`". The spec uses this wording.
- Removing a skill folder needs a CHANGELOG migration note naming the replacement. Since skill names are public API, this release is **2.0.0**.
- Keep the kit's distinctive ideas: QA independence, Red-Before-Green (seam-aware), the Ownership Test, the Cross-Layer Rule.
- Do not change hook code (`hooks/`, `bin/`) or skills/color-system-design.
- No `Co-Authored-By` trailer in commits.

## Review Focus

1. **A dangling reference to a removed skill.** Any `/grill-me`, `grill-with-docs` or `smart-researcher` left in skills, README or `plugin.json` sends the agent to a missing file. Task 1 and Task 3 assert that no kit file names them.
2. **A path to a skill that does not exist.** A "Read and follow `skills/x/SKILL.md`" with a typo silently does nothing. Task 2 asserts that every `skills/<name>/SKILL.md` path named in kit files exists.
3. **Skills without `disable-model-invocation` now fire on their own.** Their descriptions must say they run only on request. Task 2 asserts this for each of the five.
4. **A bug fix routed through two skills that each run a full process.** After Task 4, `fix-bug` is the single entry point and does not repeat `diagnosing-bugs` phases. Task 4 asserts `fix-bug` points to `diagnosing-bugs` and has no reproduction phase of its own.
5. **Tool names that no longer exist.** Task 3 asserts that `grep_search` and `view_file` appear nowhere.

---

### Task 1: Merge `grill-me` and `grill-with-docs` into `grilling` (S1)

**Files:**
- Delete: `skills/grill-me/`, `skills/grill-with-docs/`
- Modify: `skills/grilling/SKILL.md` (add a "With docs" mode; extend the description triggers)
- Modify: every kit file that names the removed skills (`skills/start-day/SKILL.md`, `README.md`, `plugin.json`, and any others the test finds)
- Test: `test/kit-content.test.js`

**Interfaces:**
- Produces: the `grilling` skill with a section `## With docs`. Its text: while grilling, also read and follow `skills/domain-modeling/SKILL.md` to record terms in `GLOSSARY.md` and decisions as ADRs. Later tasks point to "`grilling` (with docs)".

- [ ] **Step 1: Failing test**

```js
test('removed grilling aliases are not referenced', () => {
  for (const f of kitFiles()) assert.doesNotMatch(read(f), /grill-me|grill-with-docs/, f);
  assert.match(read('skills/grilling/SKILL.md'), /^## With docs/m);
  assert.match(read('skills/grilling/SKILL.md'), /skills\/domain-modeling\/SKILL\.md/);
});
```

- [ ] **Step 2: Run it** with `node --test test/kit-content.test.js`. Expected: FAIL, and the failure names a file that mentions `grill-me`.
- [ ] **Step 3: Implement.**
  - Delete the two folders.
  - Add the `## With docs` section.
  - Add "grill me" and "grill with docs" trigger phrases to the `grilling` description.
  - Replace every reference with `grilling`, or `grilling` (with docs) where `grill-with-docs` was meant.
- [ ] **Step 4: Run the full suite** with `node --test`. Expected: all pass.
- [ ] **Step 5: Commit:** `git commit -m "refactor(skills)!: merge grill-me and grill-with-docs into grilling"`

### Task 2: Skill chaining and invocation for Antigravity (C1, C2)

**Files:**
- Modify: `skills/improve-codebase-architecture/SKILL.md` (lines 13, 64, 66, 71)
- Modify: `skills/tdd/SKILL.md:26`
- Modify: `skills/wayfinder/SKILL.md` (lines 79, 111, 115)
- Modify: frontmatter of `improve-codebase-architecture`, `to-spec`, `to-tickets`, `wait-what` and `wayfinder`
- Modify: `skills/writing-for-agents/SKILL-MECHANICS.md` (the Invocation section)
- Test: `test/kit-content.test.js`

**Interfaces:**
- Consumes: `grilling` (with docs) from Task 1. The `wayfinder` and `improve-codebase-architecture` lines that called "grilling" and "domain-modeling" together now say "Read and follow `skills/grilling/SKILL.md` in its With docs mode".

- [ ] **Step 1: Failing test**

```js
test('no Claude Code skill mechanics remain', () => {
  for (const f of kitFiles()) {
    assert.doesNotMatch(read(f), /Skill tool/, f);
    assert.doesNotMatch(read(f), /disable-model-invocation/, f);
  }
});
test('every skills/<name>/SKILL.md path named in the kit exists', () => {
  for (const f of kitFiles())
    for (const m of read(f).matchAll(/skills\/([a-z0-9-]+)\/SKILL\.md/g))
      assert.ok(fs.existsSync(path.join(ROOT, 'skills', m[1], 'SKILL.md')), `${f} -> ${m[0]}`);
});
test('request-only skills say so in their description', () => {
  for (const s of ['improve-codebase-architecture', 'to-spec', 'to-tickets', 'wait-what', 'wayfinder']) {
    const desc = read(`skills/${s}/SKILL.md`).match(/^description:(.*)$/m)[1];
    assert.match(desc, /only when the user asks/i, s);
  }
});
```

- [ ] **Step 2: Run it.** Expected: FAIL on "Skill tool".
- [ ] **Step 3: Implement.**
  - Replace each "Call the Skill tool with X" with "Read and follow `skills/X/SKILL.md`". Where a line called the tool twice, use one sentence for both.
  - Remove `disable-model-invocation: true`, and end each of the five descriptions with "Use only when the user asks for it by name."
  - Rewrite the Invocation section of SKILL-MECHANICS.md for Antigravity:
    - frontmatter has only `name` and `description`;
    - every skill can fire on its own;
    - to make a skill run on request only, say so in the description;
    - to chain a skill, tell the agent to read its SKILL.md.

    Keep the context-load / cognitive-load reasoning.
- [ ] **Step 4: Run the full suite.** Expected: all pass.
- [ ] **Step 5: Commit:** `git commit -m "docs(skills): chain skills by reading SKILL.md; drop disable-model-invocation"`

### Task 3: Tool names, reading rule and the research skill (C3, C5, S4)

**Files:**
- Modify: `skills/token-optimization/SKILL.md` (rewrite §1 and §3)
- Delete: `skills/smart-researcher/` (its output format moves to `token-optimization` §3)
- Modify: `rules/AGENTS.md` §3 (lines 57–63)
- Modify: `README.md` (line 142 and any `smart-researcher` row)
- Modify: `plugin.json` (if it lists `smart-researcher`)
- Test: `test/kit-content.test.js`

**Interfaces:**
- Produces: `token-optimization` as the single home of the reading, search, quiet-output and delegation rules. `AGENTS.md` §3 keeps one line per rule and points there.

- [ ] **Step 1: Failing test**

```js
test('tool names match Antigravity; research skill folded into token-optimization', () => {
  for (const f of kitFiles()) {
    assert.doesNotMatch(read(f), /grep_search|view_file|smart-researcher/, f);
    assert.doesNotMatch(read(f), /<=\s*100 lines|≤\s*100 lines/, f);
  }
  const t = read('skills/token-optimization/SKILL.md');
  assert.match(t, /read_file/);
  assert.match(t, /Key Files/);
});
```

- [ ] **Step 2: Run it.** Expected: FAIL on `grep_search`.
- [ ] **Step 3: Implement.**
  - **token-optimization §1:**
    - Search with `rg` or `grep` through `run_command` to find line numbers.
    - Then use `read_file` with `StartLine`/`EndLine`.
    - New reading rule (C5): "read the range you need; avoid whole large or generated files".
  - **token-optimization §3:**
    - delegate exploration to the built-in `research` subagent (`invoke_subagent`);
    - ask it to return smart-researcher's summary format (Key Files & Exact Line Numbers, Data Flow / Call Hierarchy, Root Causes);
    - stop it with `manage_subagents` `Action: 'kill'`.
  - **`AGENTS.md` §3:** keep the `BypassSandbox` and command-shape bullets, which are `AGENTS.md`-only. Reduce the Lean File Reading, Quiet Output and Subagent Lifecycle bullets to one line each, pointing to `token-optimization`.
  - **`README.md` line 142:** "Context budgeting & lean file reading".
- [ ] **Step 4: Run the full suite.** Expected: all pass.
- [ ] **Step 5: Commit:** `git commit -m "refactor(skills)!: Antigravity tool names, relaxed read rule, fold smart-researcher into token-optimization"`

### Task 4: `fix-bug` is the entry point; diagnosis lives in `diagnosing-bugs` (S2)

**Files:**
- Modify: `skills/fix-bug/SKILL.md`
- Modify: `skills/start-day/SKILL.md` (the Bug route)
- Modify: `skills/ai-native-sdlc/SKILL.md` (the Bug Remediation line, about line 59)
- Test: `test/kit-content.test.js`

**Interfaces:**
- Consumes: `skills/diagnosing-bugs/SKILL.md`, Phases 1–6. Do not edit it. Phase 5 holds the seam rule, and the Phase 6 checklist sets the "done" criteria.
- Produces: `fix-bug` with four phases:
  1. Triage, from `bug_report.md` or the issue.
  2. Diagnose: read and follow `skills/diagnosing-bugs/SKILL.md` Phases 1–4. Skip this phase when the root cause is already known and a reproduction exists.
  3. Fix and regression test: per `diagnosing-bugs` Phase 5. The Red-Before-Green and no-seam wording stays in Rules.
  4. Close: full suite, `bug_report.md` RCA, a `test_cases.md` TC update, then commit per `rules/AGENTS.md` §2.

  The three rules stay. No phase restates how to build a feedback loop, reproduce, or write the test.

- [ ] **Step 1: Failing test**

```js
test('fix-bug routes diagnosis to diagnosing-bugs without repeating it', () => {
  const f = read('skills/fix-bug/SKILL.md');
  assert.match(f, /skills\/diagnosing-bugs\/SKILL\.md/);
  assert.doesNotMatch(f, /Reproduce as Failing Test/);
  assert.match(read('skills/start-day/SKILL.md'), /\| \*\*Bug[^|]*\|\s*`fix-bug`/);
});
```

- [ ] **Step 2: Run it.** Expected: FAIL on `skills/diagnosing-bugs/SKILL.md`.
- [ ] **Step 3: Implement** the four phases above.
  - The start-day Bug route becomes `` `fix-bug` (uses `diagnosing-bugs`) ``.
  - The ai-native-sdlc line becomes "Bug fixes: `fix-bug` (Red-Before-Green where a correct seam exists)."
- [ ] **Step 4: Run the full suite.** Expected: all pass.
- [ ] **Step 5: Commit:** `git commit -m "docs(fix-bug): single bug entry point; diagnosis delegated to diagnosing-bugs"`

### Task 5: One boundary between the planning skills (S3)

**Files:**
- Modify: `skills/plan/SKILL.md` (a new `## Which planning skill` section before §1)
- Modify: `skills/to-tickets/SKILL.md` and `skills/wayfinder/SKILL.md` (one pointer line each, under the title)
- Test: `test/kit-content.test.js`

**Interfaces:** `plan` produces the table that the other two point to.

- [ ] **Step 1: Failing test**

```js
test('planning boundary stated once in plan', () => {
  const p = read('skills/plan/SKILL.md');
  assert.match(p, /^## Which planning skill/m);
  for (const s of ['to-tickets', 'wayfinder']) {
    assert.match(p, new RegExp('`' + s + '`'));
    assert.match(read(`skills/${s}/SKILL.md`), /skills\/plan\/SKILL\.md/);
  }
});
```

- [ ] **Step 2: Run it.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - **The table** has three rows:

    | Skill | Scope | Output |
    |---|---|---|
    | `plan` | one change in one session or branch | `docs/plans/<branch>.md` |
    | `to-tickets` | one spec into tracker tickets | tickets with blocking edges |
    | `wayfinder` | a multi-session epic whose route is unknown | a map ticket |

  - **The pointer line** in the other two skills: "Not sure this is the right planning skill? See the table in `skills/plan/SKILL.md`."
- [ ] **Step 4: Run the full suite.** Expected: all pass.
- [ ] **Step 5: Commit:** `git commit -m "docs(skills): one boundary table for plan, to-tickets and wayfinder"`

### Task 6: `code-reviewer` is the single review checklist (S5)

**Files:**
- Modify: `agents/code-reviewer.md` (receives review-code §3 items it lacks)
- Modify: `skills/review-code/SKILL.md` (§3 becomes a delegation)
- Test: `test/kit-content.test.js`

**Interfaces:**
- Consumes: `rules/AGENTS.md` §4 (layering, DTOs, security) and `skills/responsive-frontend-expert/SKILL.md`.
- Produces:
  - **`code-reviewer.md`** owns the audit checklist. It adds DRY/SRP and the Modern Web Standards check (pointing to `modern-web-guidance`). Its layering and frontend lines point to `AGENTS.md` §4 and `responsive-frontend-expert` instead of restating the default chain and the `100dvh`/44px numbers.
  - **`review-code`** keeps §1 (run checks), §2 (QA matrix audit) and §4 (walkthrough). §3 becomes: "Run the `code-reviewer` subagent on the diff (`invoke_subagent`, definition `agents/code-reviewer.md`) and include its verdict."

- [ ] **Step 1: Failing test**

```js
test('code-reviewer owns the audit checklist', () => {
  const r = read('skills/review-code/SKILL.md');
  assert.match(r, /agents\/code-reviewer\.md/);
  assert.doesNotMatch(r, /SQL Injection/i);
  const c = read('agents/code-reviewer.md');
  assert.match(c, /SRP/);
  assert.match(c, /modern-web-guidance/);
  assert.doesNotMatch(c, /Controllers only orchestrate/);
});
```

- [ ] **Step 2: Run it.** Expected: FAIL.
- [ ] **Step 3: Implement** as described in Interfaces. Keep the empty-catch check in a section that applies to all changes; the existing test checks this.
- [ ] **Step 4: Run the full suite.** Expected: all pass.
- [ ] **Step 5: Commit:** `git commit -m "docs: code-reviewer is the single audit checklist; review-code delegates"`

### Task 7: Final skill list in routes and docs; release 2.0.0

**Files:**
- Modify: `skills/start-day/SKILL.md` (the routing table uses only existing skills)
- Modify: `README.md` (skill tables, the repo tree, the command reference)
- Modify: `plugin.json` (the `suggestedPrompts` list)
- Modify: `CHANGELOG.md`: a new `## [2.0.0] - <today>` entry with Removed, Changed and Migration sections
- Modify: `plugin.json` and `package.json` (`"version": "2.0.0"`)
- Modify: `docs/checklists/antigravity-skills-check.md` (record the step 1 results from "Facts this plan relies on")

- [ ] **Step 1: Failing test**

```js
test('start-day routes and plugin suggested prompts name existing skills only', () => {
  const known = new Set([...fs.readdirSync(path.join(ROOT, 'skills')), 'spec-critic', 'code-reviewer']);
  const rows = read('skills/start-day/SKILL.md').split(/\r?\n/).filter(l => /^\| \*\*/.test(l));
  for (const row of rows) {
    const chain = row.split('|')[2];
    for (const m of chain.matchAll(/`([a-z][a-z0-9-]*)`/g)) assert.ok(known.has(m[1]), `start-day route -> ${m[1]}`);
  }
  for (const p of JSON.parse(read('plugin.json')).suggestedPrompts.filter(p => p.startsWith('/')))
    assert.ok(known.has(p.split(' ')[0].slice(1)), p);
});
```

Only backticked names in the Skill Chain column are checked. File names such as `intent.md` contain a dot and do not match the pattern.

- [ ] **Step 2: Run it.** Expected: it passes or fails depending on the state left by Tasks 1–6. If it passes immediately, keep it as a regression guard.
- [ ] **Step 3: Write the CHANGELOG.**
  - **Removed:** `grill-me`, `grill-with-docs` (use `/grilling`, with docs mode) and `smart-researcher` (now in `token-optimization`).
  - **Changed:** each Task 2–6 item.
  - **Migration:** typed `/grill-me` → `/grilling`; local forks that relied on `disable-model-invocation` should put "Use only when the user asks for it by name" in the description.
  - Update the README tables and tree to the final list.
- [ ] **Step 4: Verify** with `node --test` and `node bin/cli.js --verify`. Expected: all pass.
- [ ] **Step 5: Commit:** `git commit -m "chore: release 2.0.0 (Pass 3, trimmed skill set)"`

---

**After Task 7 (spec §4 Pass 3 step 8, a decision point, not a task):** with the trimmed set in hand, the controller presents the core + packs restructure question (spec Approach 3) to the user, with a recommendation.
