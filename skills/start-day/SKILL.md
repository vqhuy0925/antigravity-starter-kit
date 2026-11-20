---
name: start-day
description: Single entry-point router for daily work. Orients from git and in-progress artifacts (resuming unfinished work first), routes by intent (new feature, brainstorm, fix bug, refactor, docs) through the kit's skills, and closes the loop with review, commit, and retro.
---

# Start Day (`start-day`)

A thin single-command entry point that answers *"what are we working on?"* and chains the right skills in `antigravity-starter-kit` without reimplementing any of them.

---

## Governing Rules
1. **Resume Before Starting New Work:** Always check for in-flight work first. Unfinished work on the current branch or in active artifacts takes priority over starting something new.
2. **Never Pick Work Unilaterally:** Surface what is in-flight and recommend the next step, then confirm with the user.
3. **Thin Router Only:** Delegate execution to the existing specialized skills; keep phase gates in the main thread and batch non-blocking questions.

---

## Phase 0 — Orient & Resume Check

1. Check `git status` and current branch (`git branch --show-current`) silently.
2. Check for active SDLC artifacts in the workspace or artifact directory (`intent.md`, `spec.md`, `test_cases.md`, `docs/plans/<branch>.md`, `task.md`, `bug_report.md`).
3. Detect if a project Knowledge Wiki exists (`*-knowledge/tools/ksearch.mjs` or `docs/knowledge/tools/ksearch.mjs`). If present, use `ksearch` first during investigation/planning instead of broad codebase greps.
4. If in-flight work is detected, summarize it in 2–3 lines and ask whether to **resume** from the current stage or **start something new**.

---

## Phase 1 — Route by Intent

If not resuming (or if the user passed an intent like `/start-day fix ...` or `/start-day feature ...`), classify the task and follow the matching chain:

| Intent | Skill Chain |
|---|---|
| **Brainstorm / Vague Idea** | `grill-me` → `to-spec` → (`wayfinder` if multi-session) |
| **Raw Ticket / Story Refinement** | `story-review` → `ai-native-sdlc` |
| **New Feature (Full SDLC)** | `ai-native-sdlc`: `intent.md` → `spec.md` (+ `spec-critic`) → `define-tests` → `plan` → `implement` (`tdd`) |
| **Bug / Broken / Slow** | `diagnosing-bugs` → `fix-bug` (Red-Before-Green) |
| **Refactor / Deepen Modules** | `improve-codebase-architecture` → `plan` → `implement` |
| **Knowledge Wiki (Init / Search / Sync)** | `knowledge-wiki` |
| **Docs / Domain / Landing / SEO** | `domain-modeling` / `writing-for-agents` / `landing-page-design` / `seo` |

Confirm the chosen route once with the user before starting Phase 1 of the target skill.

---

## Phase 2 — Close the Loop

When implementation/fixes finish:
1. Run `review-code` (verify tests, lint, type-check, and `test_cases.md` coverage).
2. **Sync Knowledge Wiki (if present):** When domain logic, APIs, entities, or UI views changed, update the affected `domains/<domain>/<feature>.md` spec (and `glossary.md` if needed), run `scan-drift.mjs` to catch undocumented modules, and re-run `indexer.mjs` to update `catalog.json`.
3. Run `commit-code` once at the end of the run: it groups changes and asks once per grouped commit (`rules/AGENTS.md` §2); no mid-run commits. Offer `pr` (never push without explicit approval).
4. Offer `retro` once to capture learnings for the next cycle.
