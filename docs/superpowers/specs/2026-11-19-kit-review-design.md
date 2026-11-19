# Antigravity Starter Kit — Review & Hardening Design

**Date:** 2026-11-19
**Status:** Draft for approval
**Scope:** Every workflow artifact in the kit — `rules/AGENTS.md`, `hooks.json` + `hooks/*.js`, `agents/*.md`, `skills/*/SKILL.md`, `templates/*.md`, installers (`install.sh`, `install.ps1`, `bin/cli.js`), `test/verify-hooks.test.js`, `README.md`.

---

## 1. Intent

The kit is published publicly and meant to be dropped into **any** team's project and used with **Gemini / Google Antigravity** agents. That sets three bars the current kit does not yet clear:

1. **Correct** — a guardrail that silently misses is worse than none, because teams stop watching for the thing it claims to block.
2. **Generic** — no project-specific vocabulary or rules; project-shaped rules are opt-in.
3. **Followable by a Gemini agent** — one name per artifact, one approval model, no contradictory instructions, no vocabulary from another agent runtime, no two skills doing the same job.

### Goals
- Every finding below is either fixed or consciously deferred with a reason.
- Hooks are verified to fire under a **global** install, and their tests cover every hook.
- An agent reading `rules/AGENTS.md` + any one skill gets the same answer to "do I stop and ask here?"

### Non-goals
- Adding new skills, hooks, or integrations.
- Rewriting skill content that is correct and generic (e.g. `diagnosing-bugs` phases, `story-review` lenses).
- Supporting runtimes other than Antigravity / Gemini (Claude Code compatibility is not a goal).

### Anti-goals (would be a failure even if "done")
- Breaking existing installs without a migration note in the README/CHANGELOG.
- Making the guardrails noisier (more `ask` prompts on safe commands) in exchange for coverage.
- Losing the kit's distinctive ideas (QA independence, Red-Before-Green, Ownership Test) while trimming.

---

## 2. Approaches considered

| Approach | Trade-off | Outcome |
|---|---|---|
| 1. Report only | Zero risk, but nothing gets fixed; the public kit keeps shipping the defects | Rejected |
| **2. Report + phased fixes (3 PRs)** | Correctness ships first; each PR reviewable on its own; Pass 3 is the natural point to revisit restructuring | **Chosen by the user** |
| 3. Full redesign into core + packs | Cleanest public shape, but a large break for existing installs before the basics are even correct | Deferred — reconsidered at end of Pass 3 |

---

## 3. Findings

Severity: **P0** = wrong/unsafe behaviour or silently disabled guardrail · **P1** = contradiction or non-generic content that misleads agents · **P2** = duplication, dead references, polish.

### 3.1 Hooks & guardrails

| ID | Sev | Finding | Evidence |
|---|---|---|---|
| H1 | P0 | Hook commands are relative (`node hooks/git-guardrail.js`). Under a global install the kit lives in `~/.gemini/config/plugins/antigravity-starter-kit/`; if Antigravity resolves the command from the workspace, every hook fails to start and nothing is guarded. Resolution base is **unverified** — no official doc found. | `hooks.json`, `install.sh:17` |
| H2 | P0 | `plan-boundary` reads only `implementation_plan.md`; three other files tell agents to write `plan.md`. If the agent follows those, the scope check finds no plan and allows everything. | `rules/AGENTS.md:8`, `ai-native-sdlc:53`, `start-day:22`, `plan-boundary.js:34` |
| H3 | P0 | `plan-boundary` matches by `planText.includes(basename)` — any staged `index.ts`, `utils.js`, `README.md` passes if that basename appears anywhere in the plan. | `plan-boundary.js:69` |
| H4 | P1 | `secret-scan` misses common key shapes: `sk-ant-…` / `sk-proj-…` (hyphens break `sk-[a-zA-Z0-9]{32,}`), Google API keys (`AIza…` — notable for a Gemini kit), GitHub fine-grained `github_pat_…`, generic `Bearer <long-token>`. | `secret-scan.js:14-20` |
| H5 | P1 | `git-guardrail` protected-push check misses `git push` (no args) while on `main`, `git push origin HEAD:main`, `git push -u origin main` variants with flags between, and non-`origin/upstream` remotes. | `git-guardrail.js:24` |
| H6 | P1 | `--force-with-lease` is hard-denied alongside `--force`. It is the safe, recommended way to update a rebased feature branch; denying it pushes teams toward disabling the hook. | `git-guardrail.js:19` |
| H7 | P2 | Root-delete check misses `rm -rf /*`, `rm -rf ~`, `rm -rf $HOME`, `Remove-Item -Recurse -Force C:\`. | `git-guardrail.js:14` |
| H8 | P1 | No test covers `plan-boundary.js`; README's "9/9 passed" overstates guardrail coverage. | `test/verify-hooks.test.js` |
| H9 | P2 | Hooks only inspect `run_command`. Secrets written via file-edit tools are not scanned. Acceptable, but README claims "scans and blocks" without that caveat. | `hooks.json` matcher, README |

### 3.2 Rules & workflow consistency

| ID | Sev | Finding | Evidence |
|---|---|---|---|
| R1 | P0 | Three approval models contradict: Gate A = ask before every `git commit`; Gate B = after plan approval "execute end-to-end … without stopping"; Tier 1 = "do not block on approval modals". An agent cannot tell which wins at commit time. | `rules/AGENTS.md` §1 Tier 1, §2 Gate A/B |
| R2 | P1 | Artifact names drift: `plan.md` vs `implementation_plan.md`; `maintain.md` (diagram) vs `bug_report.md` (text); `test_cases.md` vs `test_cases_<feature>.md`; `story_review.md` produced but never consumed by name. | `ai-native-sdlc:25`, `fix-bug:101`, `story-review` |
| R3 | P1 | QA test definition is triggered twice: `ai-native-sdlc` Stage 2b **and** `plan` §2 both spawn the `define-tests` subagent. | `plan:13-18`, `ai-native-sdlc:41-45` |
| R4 | P1 | `fix-bug` mandates a failing test before any code; `diagnosing-bugs` Phase 5 says write it first **only if a correct seam exists**. `start-day` chains them back-to-back. | `fix-bug:99`, `diagnosing-bugs:247-251` |
| R5 | P2 | Dangling references: `tdd` → `code-review` skill (actual: `review-code`); `ai-native-sdlc` → `/deploy` (no such skill); `wait-what` → `GLOSSARY-MAP.md` (exists only as a domain-modeling convention, not explained there). | `tdd:38`, `ai-native-sdlc:67`, `wait-what:7` |
| R6 | P2 | `tdd` forbids horizontal slicing ("all tests first"), while `implement` / `define-tests` read as "cover all TC-xx before done". Compatible in intent, but the ordering should be stated once. | `tdd:32`, `implement:13` |

### 3.3 Genericity (project leakage)

| ID | Sev | Finding | Evidence |
|---|---|---|---|
| G1 | P1 | Trello is the only named tracker in the global gate rules. | `rules/AGENTS.md` Gate A, Gate C |
| G2 | P1 | Domain examples from one product appear as global rules: "penalty waivers", "calendar matrix", "financial/clinical … (5-Context rules)", attendance formula "(510 − 60) / 510 = 0.88 công", `DEFAULT '1.0'`. | `rules/AGENTS.md`, `define-tests:23-24,60-63`, `review-code:20-22` |
| G3 | P1 | The 3-Layer Rule (DB + API DTO + UI) is mandatory for every test case. CLIs, libraries, pure-backend services, and static sites don't have all three layers. | `rules/AGENTS.md`, `define-tests`, `review-code`, `implement` |
| G4 | P1 | Stack-specific commands as defaults: `npx vue-tsc`, `./gradlew`, `build-local-with-test.bat`. | `rules/AGENTS.md` Gate C, `review-code:9-11`, `token-optimization` |
| G5 | P1 | Frontend taste rules (§5: fonts, OKLCH, "120% Signature Rule", asset-first) load into **every** session via `AGENTS.md`, including backend-only work. They belong in the frontend skills. | `rules/AGENTS.md` §5 |
| G6 | P2 | Layered architecture (Controller→Service→Repository) stated as universal. | `rules/AGENTS.md` §4 |

### 3.4 Gemini / Antigravity compatibility

| ID | Sev | Finding | Evidence |
|---|---|---|---|
| C1 | P1 | Skills ported from a Claude Code skill set say "Call the Skill tool with …". Antigravity has no tool by that name; the chain step is likely skipped. | `grill-me`, `grill-with-docs`, `wayfinder`, `improve-codebase-architecture`, `tdd` |
| C2 | P1 | `disable-model-invocation: true` frontmatter (Claude Code field) on 7 skills; behaviour under Antigravity unverified — may be ignored (skill auto-fires) or may hide the skill. | `grill-me`, `grill-with-docs`, `improve-codebase-architecture`, `to-spec`, `to-tickets`, `wait-what`, `wayfinder` |
| C3 | P2 | Antigravity tool names used in rules (`invoke_subagent` with `Role`, `manage_subagents Action='kill'`, `view_file StartLine/EndLine`, `grep_search`, `BypassSandbox`) are unverified against current Antigravity docs. | `rules/AGENTS.md`, `plan`, `define-tests`, `token-optimization` |
| C4 | P2 | `writing-for-agents` describes `CLAUDE.md`; for this kit it should point at `AGENTS.md` / `GEMINI.md`. | `writing-for-agents:3,6` |
| C5 | P2 | The ≤100-line read rule is aggressive for Gemini's large context; forcing many small reads can cost more turns than it saves tokens. | `rules/AGENTS.md` §3, `token-optimization` |

### 3.5 Skill-set overlap

| ID | Sev | Finding |
|---|---|---|
| S1 | P2 | `grill-me`, `grilling`, `grill-with-docs` — two are one-line aliases into the third. |
| S2 | P2 | `fix-bug` vs `diagnosing-bugs` — overlapping bug flows with conflicting test rules (R4). |
| S3 | P2 | `plan` vs `to-tickets` vs `wayfinder` — three planning granularities with no stated boundary between them. |
| S4 | P2 | `smart-researcher` and `token-optimization` §3 restate the same delegation rule. |
| S5 | P2 | `review-code` (skill) and `agents/code-reviewer.md` (subagent) — two review checklists that can drift. |

---

## 4. The fix: three passes

Each pass is one branch + one PR. Each PR updates `README.md`, `plugin.json` version, and a CHANGELOG entry describing migration impact.

### Pass 1 — Correctness (fixes H1–H8, R1, R2, R3)

1. **Verify hook resolution (H1).** Add a throwaway hook that logs `process.cwd()` and `__dirname`, install globally, run one command in Antigravity, record the result in the PR.
   - Regardless of the result, all three installers (`install.sh`, `install.ps1`, `bin/cli.js`) rewrite `hooks.json` at install time with absolute paths to the installed hook files, for **both** global and local (`.agents/plugins/…`) installs. The live check confirms the fix; it does not gate it. *(Builder's call if Antigravity documents a plugin-root variable instead — prefer that.)*
2. **One plan file name and location (H2, R2).** The plan is committed in the repo at `docs/plans/<branch>.md` (branch name with `/` replaced by `-`), so teammates review it in the PR and the hook always finds it. Copying it into Antigravity's conversation artifact folder as `implementation_plan.md` is optional. `plan-boundary` looks up `docs/plans/<current-branch>.md` first, then falls back to `implementation_plan.md` in `artifactDirectoryPath` / up from `Cwd`; when Tier 2 work has no plan in either place it returns `ask` ("no approved plan found"), not `allow`. Replace every `plan.md` / bare `implementation_plan.md` reference with this rule. Remove the plan file from the hook's ignore list only if it would otherwise be flagged — it is always allowed in commits. `bug_report.md` is the Stage 6 artifact; drop `maintain.md`. `test_cases.md` is the only QA file name.
3. **Path-exact plan matching (H3).** Match staged repo-relative paths against paths written in the plan (backticked paths or list items). Basename-only match is accepted only when that basename is unique among staged files **and** in the repo tree.
4. **Secret patterns (H4).** Add `sk-ant-`, `sk-proj-`, generic `sk-[A-Za-z0-9_-]{32,}`, `AIza[0-9A-Za-z_-]{35}`, `github_pat_[A-Za-z0-9_]{82}`, `Bearer\s+[A-Za-z0-9._-]{30,}`.
5. **Push guard (H5, H6).** Deny force/`-f` push to any branch; allow `--force-with-lease` except when the target is `main`/`master`; deny push to `main`/`master` via any remote, `HEAD:main`, or bare `git push` when the current branch is `main`/`master` (resolve via `git branch --show-current` in the payload `Cwd`).
6. **Root-delete (H7).** Extend to `/*`, `~`, `$HOME`, and PowerShell `Remove-Item -Recurse -Force <drive>:\`.
7. **Tests (H8).** Cover every new pattern, both allow and deny, plus `plan-boundary` cases (unmentioned file → ask, mentioned path → allow, basename collision → ask, no plan → allow). Update README test output.
8. **Single approval model (R1).** Replace Gate A/B/C + Tier text with one ladder, stated once in `AGENTS.md` and referenced (not restated) by skills:

   | Action | Behaviour |
   |---|---|
   | Read, search, git inspect, run tests/lint/build | Silent; report results |
   | Edit files — Tier 1 trivial change | Do it, report in chat |
   | Edit files — Tier 2, after plan approved | Run end-to-end without stopping, except on a genuine blocker |
   | `git commit` | Ask once per commit with diff summary + message (Tier 1 included). In a Tier 2 run, no commits mid-run: at the end, `commit-code` groups the changes and asks once per grouped commit |
   | `git push`, deploy, any external tracker/API write | Ask individually, every time, never bundled |

9. **One QA trigger (R3).** `ai-native-sdlc` Stage 2b owns the `define-tests` subagent. `plan` consumes `test_cases.md` and only triggers `define-tests` when the file is missing.

### Pass 2 — Make it generic (fixes G1–G6, R4–R6, C4)

1. Replace Trello with "external tracker writes (Jira, GitHub Issues, Linear, Trello, …)" (G1).
2. Move domain examples out of rules into clearly-labelled *examples*, rewritten with a neutral domain (e.g. an order/discount calculation) (G2).
3. Reframe the 3-Layer Rule as the **Cross-Layer Rule**: "assert at every layer the change touches; for a typical web app that is data, API, and UI." Projects declare their layers in `templates/project_profile_template.md` (G3).
4. Stack commands become "the project's lint / type-check / test commands (from `project_profile.md`)", with the current ones as examples (G4).
5. Move `AGENTS.md` §5 into `responsive-frontend-expert` and `landing-page-design`; leave a one-line pointer in `AGENTS.md` (G5).
6. Layered architecture becomes "follow the project's existing layering; default for new services: …" (G6).
7. Resolve R4: `fix-bug` adopts `diagnosing-bugs`' seam rule — failing test first when a correct seam exists, otherwise document the missing seam as a finding.
8. Fix dangling references (R5); state the slice order once in `implement` (R6); `writing-for-agents` targets `AGENTS.md` / `GEMINI.md` (C4).

### Pass 3 — Trim the skill set (fixes C1–C3, C5, S1–S5)

1. Verify Antigravity's skill-chaining and frontmatter support (C1, C2, C3) via a short live checklist the builder writes and the user (or a teammate) runs in a real Antigravity install, reporting results back. Replace "Call the Skill tool with X" with "Read and follow `skills/X/SKILL.md`". Replace or drop `disable-model-invocation` per what Antigravity supports.
2. Merge `grill-me` + `grill-with-docs` into `grilling` (with a "with docs" mode); keep slash-command names as aliases only if Antigravity supports alias skills (S1).
3. `fix-bug` becomes the entry point; diagnosis lives in `diagnosing-bugs`; no duplicated phases (S2).
4. Add a one-table boundary: `plan` = one change; `to-tickets` = one spec into tickets; `wayfinder` = multi-session epic (S3).
5. Fold `smart-researcher` into `token-optimization` or vice-versa (S4); make `agents/code-reviewer.md` the single checklist and have `review-code` delegate to it (S5).
6. Relax the 100-line rule to "read the range you need; avoid whole large/generated files" (C5).
7. Update `start-day` routes and README tables to the final skill list.
8. Decision point: with the trimmed set in hand, decide whether a core + packs restructure (Approach 3) is worth it.

---

## 5. Constraints

- Hooks remain dependency-free Node 18 scripts using the existing `lib.js` stdin/stdout contract (`toolCall.name`, `toolCall.args.CommandLine`, `{decision, reason}`), which matches the community-documented Antigravity payload.
- Hooks fail open on internal error (current behaviour), but must never fail open because of a path-resolution mistake — that is what Pass 1 step 1 proves.
- Skill folder names are public API (users type `/name`); renames need an alias or a CHANGELOG migration note.

## 6. Left to the builder

- Exact regexes and test case wording.
- How the installer rewrites `hooks.json` (template file vs. in-place edit), if needed.
- Wording of rewritten rules, provided each rule is stated in exactly one file.
- Neutral example domain for Pass 2.

## 7. Decisions by the user

- **Live Antigravity checks:** the user or a teammate runs them. The builder writes a ~10-minute checklist for Pass 1 step 1 (hook path confirmation) and Pass 3 step 1 (skill chaining, frontmatter, tool names); results are recorded in the corresponding PR.
- **Plan location:** committed in the repo at `docs/plans/<branch>.md`.
- **Commit cadence in Tier 2:** no commits mid-run; group and ask once per commit at the end.

## 8. Calls made without the user (open to override)
- `git commit` always asks, including Tier 1 — as a written rule in `AGENTS.md` only, not a new hook (Antigravity's own command permissions already prompt; a hook would stack a second prompt, violating the "no noisier guardrails" anti-goal).
- Hook path fix applies to local installs as well as global.
- `--force-with-lease` allowed on non-protected branches.
- 3-Layer Rule becomes opt-in Cross-Layer Rule.
- Frontend taste rules move out of global `AGENTS.md`.
- Claude Code compatibility is a non-goal.
