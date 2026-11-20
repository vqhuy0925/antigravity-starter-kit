# Pass 2 — Make It Generic Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove project-specific vocabulary, stack commands and always-loaded frontend rules from the kit, so that any team can drop it into any project (findings G1–G6, R4–R6, C4).

**Architecture:** These are documentation-only changes to `rules/`, `skills/`, `agents/`, `templates/`, `README.md` and `plugin.json`. A new content test, `test/kit-content.test.js`, makes each fix checkable and stops leaked terms from coming back. Each task adds its own assertions to that file, so the suite is green after every commit. Project-specific facts move into a project profile: a project creates `docs/project_profile.md` from `templates/project_profile_template.md`, and the kit points at it.

**Tech Stack:** Markdown; Node 18 built-in test runner (`node --test`), no dependencies.

**Spec:** `docs/superpowers/specs/2026-11-19-kit-review-design.md`, §3.2–3.4 and §4 "Pass 2".

## Global Constraints

- Each rule is stated in exactly one file; other files reference it and do not restate it (spec §6).
- Skill folder names are public API: do not rename any folder.
- Keep the kit's distinctive ideas: QA independence, Red-Before-Green (now seam-aware), the Ownership Test, and cross-layer verification (spec §1 anti-goals).
- Neutral example domain: **an order with a discount coupon**. Use it wherever an example replaces the attendance/penalty domain.
- Spec-mandated wording for the cross-layer rule: "assert at every layer the change touches; for a typical web app that is data, API, and UI."
- Project profile location: `docs/project_profile.md`, created from `templates/project_profile_template.md`.
- No `Co-Authored-By` trailer in commits.
- G1 (Trello) was already fixed in Pass 1: `rules/AGENTS.md` lists "Jira, GitHub Issues, Linear, Trello, …". No task for it.
- Out of scope (Pass 3): "call the Skill tool" wording, `disable-model-invocation`, Antigravity tool names (`invoke_subagent`, `manage_subagents`, `StartLine`), the 100-line read rule. Leave them as they are.
- Leave `skills/color-system-design` alone: its Vietnamese "công" is an ordinary word there, not leaked domain content.

## Review Focus

1. **Orphaned references after a move.** An agent reading `AGENTS.md` after the §5 frontend rules leave must still reach them for frontend work. Task 3 asserts both the pointer in `AGENTS.md` and the moved content in `responsive-frontend-expert`.
2. **A partly renamed rule.** If "3-Layer Rule" stays in one file and "Cross-Layer Rule" appears in another, agents treat them as two rules. Task 1 asserts that the phrase "3-Layer" appears nowhere in rules, skills, agents, templates, `README.md` or `plugin.json`.
3. **A backend-only or CLI project reading `test_cases_template.md`.** The template must not force a UI column. Task 1 asserts that the template says layers come from the project profile, and that its sign-off has no "UI display codes" requirement.
4. **A bug with no correct seam under `fix-bug`.** Before this pass the agent would write a shallow test that gives false confidence. Task 4 asserts the no-seam branch.
5. **Stack commands stated as defaults.** If `./gradlew` or `vue-tsc` survive as instructions rather than examples, non-JVM/non-Vue teams run the wrong commands. Task 2 asserts that they appear only in the profile template.

---

### Task 1: Cross-Layer Rule and neutral QA examples (G2, G3)

**Files:**
- Create: `test/kit-content.test.js`
- Modify: `rules/AGENTS.md` (lines 10, 15, 19; add a profile pointer)
- Modify: `skills/define-tests/SKILL.md` (§1 Principle 2, §2 Mode A, §4)
- Modify: `skills/review-code/SKILL.md` §2
- Modify: `skills/implement/SKILL.md` §2
- Modify: `skills/plan/SKILL.md:19`
- Modify: `skills/ai-native-sdlc/SKILL.md:47`
- Modify: `agents/spec-critic.md:25`
- Modify: `templates/test_cases_template.md` (§1–§4 and §6)
- Modify: `templates/project_profile_template.md` (new `## Layers` section)
- Modify: `README.md` (lines 42, 83, 92–99, 132, 258)
- Modify: `plugin.json` (description and the `/define-tests` command line)

**Interfaces:**
- Produces: `test/kit-content.test.js` with helpers that later tasks reuse:
  - `read(relPath) -> string`
  - `kitFiles() -> string[]`: every `.md` under `rules/`, `skills/`, `agents/` and `templates/`, plus `README.md` and `plugin.json`. Paths are repo-relative with `/`.
- Produces: the rule name **Cross-Layer Rule**, stated once in `rules/AGENTS.md` §1 under the QA Independence Rule.
- Produces: the profile section heading `## Layers` in `templates/project_profile_template.md`.

- [ ] **Step 1: Write the failing test**

```js
// test/kit-content.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
// kitFiles(): walk rules/ skills/ agents/ templates/ for *.md, plus README.md and plugin.json
const LEAKED = [/3-Layer/i, /penalty/i, /calendar matrix/i, /5-Context/, /510/, /Telesale/i,
  /attendance/i, /DEFAULT '1\.0'/, /công/];
test('no leaked product-domain vocabulary', () => {
  for (const f of kitFiles().filter(f => !f.startsWith('skills/color-system-design/')))
    for (const re of LEAKED) assert.ok(!re.test(read(f)), `${f} matches ${re}`);
});
test('Cross-Layer Rule is defined once, in AGENTS.md, with the spec wording', () => {
  assert.match(read('rules/AGENTS.md'), /Cross-Layer Rule/);
  assert.match(read('rules/AGENTS.md'), /assert at every layer the change touches; for a typical web app that is data, API, and UI/);
  assert.match(read('rules/AGENTS.md'), /docs\/project_profile\.md/);
});
test('test_cases template takes layers from the project profile', () => {
  const t = read('templates/test_cases_template.md');
  assert.match(t, /project_profile\.md/);
  assert.doesNotMatch(t, /UI display codes/);
  assert.match(read('templates/project_profile_template.md'), /^## .*Layers/m);
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `node --test test/kit-content.test.js`
Expected: FAIL. The first failure names `rules/AGENTS.md` matching `/3-Layer/i`.

- [ ] **Step 3: Rewrite the rule and its users**

- `rules/AGENTS.md`:
  - **Line 15** becomes the single definition of the **Cross-Layer Rule**: "assert at every layer the change touches; for a typical web app that is data, API, and UI." The layers a project has are listed in `docs/project_profile.md` (`## Layers`). Keep the DB-default-trap warning as the reason for the rule.
  - **Line 10:** "across the layers the change touches (Cross-Layer Rule, §1)".
  - **Line 19:** drop "financial/clinical … (5-Context rules)" and use "business-rule or calculation changes".
  - **New first bullet of §1:** "If `docs/project_profile.md` exists, read it first: it names the project's layers and verification commands (template: `templates/project_profile_template.md`)."
- **Every other file listed** names the rule ("per the Cross-Layer Rule in `rules/AGENTS.md`") instead of restating the three layers. Replace the attendance/penalty examples with the coupon domain.
- `templates/test_cases_template.md`:
  - §2 says the layer list comes from `docs/project_profile.md` and shows the web-app default as an example.
  - **Rewrite the TC01–TC06 rows** in the coupon domain:
    - TC01 happy path: subtotal 200.00, 10% coupon capped at 15.00 → DB `discount_total` 15.00, API `discount: "15.00"`, UI "−15.00".
    - TC02 boundary min: subtotal 0.00 → discount 0.00.
    - TC03 boundary at the cap: subtotal 150.00 → discount 15.00.
    - TC04 negative: expired coupon → HTTP 422.
    - TC05 DB-default trap: `discount_total DEFAULT 0` must not overwrite the computed 15.00 on re-read.
    - TC06 manual UI: mobile checkout shows the discount line.
  - Make §4 and §6 domain-neutral. The sign-off line becomes "verified at every layer listed for this change".
- `templates/project_profile_template.md`: add a `## Layers` section after §1. It names the layers each test case must assert at, with the example `Data (DB) · API (DTO) · UI` and a note that a CLI or library may have only one or two.
- `README.md` and `plugin.json`: change "3-layer" to "cross-layer", and replace the penalty/calendar examples with coupon ones.

- [ ] **Step 4: Run the full suite**

Run: `node --test`
Expected: all tests pass, including the 3 new ones.

- [ ] **Step 5: Commit**

```bash
git add test/kit-content.test.js rules/AGENTS.md skills/define-tests/SKILL.md skills/review-code/SKILL.md skills/implement/SKILL.md skills/plan/SKILL.md skills/ai-native-sdlc/SKILL.md agents/spec-critic.md templates/test_cases_template.md templates/project_profile_template.md README.md plugin.json
git commit -m "docs: replace the 3-Layer Rule with an opt-in Cross-Layer Rule and neutral examples"
```

### Task 2: Stack commands come from the project profile (G4)

**Files:**
- Modify: `skills/review-code/SKILL.md` §1
- Modify: `skills/fix-bug/SKILL.md:31`
- Modify: `skills/token-optimization/SKILL.md` §2
- Modify: `templates/deploy_template.md:21`
- Modify: `rules/AGENTS.md` (any command named as a default)
- Test: `test/kit-content.test.js`

**Interfaces:**
- Consumes: `read` and `kitFiles` from Task 1.

- [ ] **Step 1: Add the failing test**

```js
test('stack commands appear only as profile examples', () => {
  const allowed = new Set(['templates/project_profile_template.md']);
  for (const f of kitFiles().filter(f => !allowed.has(f)))
    for (const re of [/vue-tsc/, /build-local-with-test/, /gradlew/])
      assert.ok(!re.test(read(f)), `${f} matches ${re}`);
  assert.match(read('skills/review-code/SKILL.md'), /project_profile\.md/);
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `node --test test/kit-content.test.js`
Expected: FAIL. The failure names `skills/review-code/SKILL.md` matching `/vue-tsc/`.

- [ ] **Step 3: Make commands generic**

- **The general rule:** "the project's lint / type-check / test commands (from `docs/project_profile.md`)". If no profile exists, the agent detects the commands from the project's manifest (`package.json` scripts, `Makefile`, build files) and says which ones it used.
- `token-optimization`: keep the rule about quiet flags in a generic form, with `-q` / `--silent` as examples.
- `deploy_template.md`: use `[migration command from docs/project_profile.md]`.

- [ ] **Step 4: Run the full suite**

Run: `node --test`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add skills/review-code/SKILL.md skills/fix-bug/SKILL.md skills/token-optimization/SKILL.md templates/deploy_template.md rules/AGENTS.md test/kit-content.test.js
git commit -m "docs: take lint, type-check and test commands from the project profile"
```

### Task 3: Frontend taste out of `AGENTS.md`; layering follows the project (G5, G6)

**Files:**
- Modify: `rules/AGENTS.md` (remove §5; reword §4 "Layered Architecture")
- Modify: `skills/responsive-frontend-expert/SKILL.md` (receives any §5 bullet it does not already have)
- Modify: `skills/landing-page-design/SKILL.md` (one pointer line under `## Scope`)
- Modify: `agents/code-reviewer.md` (§1.2 layering line; §1.3 heading)
- Modify: `skills/backend-development/SKILL.md` §1 (one lead-in line)
- Test: `test/kit-content.test.js`

**Interfaces:**
- Consumes: `read` from Task 1.

- [ ] **Step 1: Add the failing test**

```js
test('frontend taste rules live in responsive-frontend-expert, not AGENTS.md', () => {
  const a = read('rules/AGENTS.md');
  for (const re of [/120%/, /oklch/i, /100dvh/, /Asset-First/i, /44x44/]) assert.doesNotMatch(a, re);
  assert.match(a, /responsive-frontend-expert/);
  const r = read('skills/responsive-frontend-expert/SKILL.md');
  for (const re of [/120%/, /oklch/i, /text-wrap: pretty/, /100dvh/, /44/, /Asset-First/i]) assert.match(r, re);
  assert.match(read('skills/landing-page-design/SKILL.md'), /responsive-frontend-expert/);
});
test('layering follows the project', () => {
  assert.match(read('rules/AGENTS.md'), /project's existing layering/);
  assert.match(read('agents/code-reviewer.md'), /project's existing layering/);
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `node --test test/kit-content.test.js`
Expected: FAIL on `/120%/` in `rules/AGENTS.md`.

- [ ] **Step 3: Move and reword**

- **Compare each `AGENTS.md` §5 bullet against `responsive-frontend-expert`:**
  - viewport list;
  - 3-zone dialog;
  - 44px;
  - slop list;
  - `text-wrap: pretty` / `oklch()` / serif pairing;
  - asset-first;
  - 120%.

  Add only the missing details to the matching section there. Then replace §5 with one line: "Frontend work: follow the `responsive-frontend-expert` skill (landing pages: `landing-page-design`)."
- **§4:** "Follow the project's existing layering. Default for a new backend service: Controller → Service → Repository → Entity."
- **`code-reviewer.md`:**
  - layering bullet: "Layering follows the project's existing layering (default …)";
  - §1.3 heading: "Frontend & Mobile Ergonomics (frontend changes only)".
- **`backend-development`:** add a §1 lead-in line, "The default for new services; follow the project's existing layering where it differs."
- **`landing-page-design`:** under `## Scope`, add "Cross-device and touch rules: `responsive-frontend-expert`."

- [ ] **Step 4: Run the full suite**

Run: `node --test`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add rules/AGENTS.md skills/responsive-frontend-expert/SKILL.md skills/landing-page-design/SKILL.md agents/code-reviewer.md skills/backend-development/SKILL.md test/kit-content.test.js
git commit -m "docs: move frontend taste rules to their skill; layering follows the project"
```

### Task 4: `fix-bug` adopts the seam rule (R4)

**Files:**
- Modify: `skills/fix-bug/SKILL.md` (frontmatter description, Rule 1, Phase 2)
- Test: `test/kit-content.test.js`

**Interfaces:**
- Consumes: `read` from Task 1. The rule's owner is `skills/diagnosing-bugs/SKILL.md` Phase 5 ("correct seam"); do not edit that file.

- [ ] **Step 1: Add the failing test**

```js
test('fix-bug writes the failing test first only at a correct seam', () => {
  const f = read('skills/fix-bug/SKILL.md');
  assert.match(f, /correct seam/);
  assert.match(f, /diagnosing-bugs/);
  assert.match(f, /no correct seam/i);
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `node --test test/kit-content.test.js`
Expected: FAIL on `/correct seam/`.

- [ ] **Step 3: Reword**

- **Rule 1 keeps the name "Red Before Green":** when a correct seam exists (as defined in `diagnosing-bugs` Phase 5), the first code is a failing test at that seam.
- **When there is no correct seam:** do not write a shallow test. Record the missing seam as a finding in `bug_report.md`, verify the fix by the reproduction steps, and propose the seam as a follow-up.
- **Phase 2:** add this branch as step 0, "Is there a correct seam? If not, …".
- **Frontmatter description:** drop "before modifying any production code"; say "seam-aware".

- [ ] **Step 4: Run the full suite**

Run: `node --test`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add skills/fix-bug/SKILL.md test/kit-content.test.js
git commit -m "docs(fix-bug): write the failing test first only where a correct seam exists"
```

### Task 5: Dangling references, slice order, `writing-for-agents` target (R5, R6, C4)

**Files:**
- Modify: `skills/tdd/SKILL.md:38`
- Modify: `skills/ai-native-sdlc/SKILL.md:69`
- Modify: `skills/wait-what/SKILL.md:7`
- Modify: `skills/implement/SKILL.md` §2
- Modify: `skills/writing-for-agents/SKILL.md` (lines 3, 6)
- Test: `test/kit-content.test.js`

**Interfaces:**
- Consumes: `read` from Task 1.

- [ ] **Step 1: Add the failing test**

```js
test('no dangling skill references; slice order stated in implement', () => {
  assert.doesNotMatch(read('skills/tdd/SKILL.md'), /`code-review`/);
  assert.match(read('skills/tdd/SKILL.md'), /`review-code`/);
  assert.doesNotMatch(read('skills/ai-native-sdlc/SKILL.md'), /`\/deploy`/);
  assert.match(read('skills/wait-what/SKILL.md'), /domain-modeling/);
  assert.match(read('skills/implement/SKILL.md'), /vertical slice/i);
  const w = read('skills/writing-for-agents/SKILL.md');
  assert.doesNotMatch(w, /CLAUDE\.md/);
  assert.match(w, /GEMINI\.md/);
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `node --test test/kit-content.test.js`
Expected: FAIL on `` /`code-review`/ ``.

- [ ] **Step 3: Fix each reference**

- `tdd`: change `code-review` to `review-code`.
- `ai-native-sdlc`: "(`/deploy`)" becomes "(fill in `templates/deploy_template.md` and ask per the approval ladder in `rules/AGENTS.md` §2)".
- `wait-what`: append "(format: the `domain-modeling` skill)" after the `GLOSSARY-MAP.md` mention.
- `implement` §2: add one line. "Order: work test case by test case in vertical slices (the `tdd` loop: one TC's test → its code → the next TC). 'Every TC covered' is the exit condition, not the order."
- `writing-for-agents`: change `CLAUDE.md` to `GEMINI.md` in both places.

- [ ] **Step 4: Run the full suite**

Run: `node --test`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add skills/tdd/SKILL.md skills/ai-native-sdlc/SKILL.md skills/wait-what/SKILL.md skills/implement/SKILL.md skills/writing-for-agents/SKILL.md test/kit-content.test.js
git commit -m "docs: fix dangling skill references, state slice order once, target GEMINI.md"
```

### Task 6: Release notes and version (spec §4: each PR updates README, version, CHANGELOG)

**Files:**
- Modify: `CHANGELOG.md` (new `## [1.7.0] - <today>` above 1.6.0)
- Modify: `plugin.json` and `package.json` (`"version": "1.7.0"`)
- Modify: `README.md` (the repo tree comment for `AGENTS.md` and `project_profile_template.md`; a short "Project profile" note telling teams to copy the template to `docs/project_profile.md`)

- [ ] **Step 1: Write the entries**

The CHANGELOG has `### Changed` and `### Migration` sections.

Changed:
- Cross-Layer Rule;
- the project profile pointer;
- commands from the profile;
- frontend rules moved into `responsive-frontend-expert`;
- layering follows the project;
- `fix-bug` seam rule;
- fixed references;
- `writing-for-agents` targets `GEMINI.md`.

Migration:
- Teams that relied on the global frontend rules in `AGENTS.md` now get them only when the `responsive-frontend-expert` skill is used.
- Copy `templates/project_profile_template.md` to `docs/project_profile.md` and list your layers and commands there.
- Existing `test_cases.md` files that say "3-Layer" keep working; the new name is Cross-Layer.

- [ ] **Step 2: Verify**

Run: `node --test`, and `node bin/cli.js --verify` from the repo.
Expected: all pass; `--verify` prints its pass line.

- [ ] **Step 3: Commit**

```bash
git add CHANGELOG.md plugin.json package.json README.md
git commit -m "chore: release 1.7.0 (Pass 2, generic kit)"
```
