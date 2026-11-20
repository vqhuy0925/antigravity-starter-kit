---
name: fix-bug
description: Entry point for any bug, broken behaviour or regression. Triages the report, diagnoses via diagnosing-bugs, fixes with Red Before Green where a correct seam exists, and closes with the RCA and regression record.
---

# TDD Bug Remediation Workflow (Red Before Green)

Fix defects with mathematical certainty through Test-Driven Remediation.

---

## The 3 Inviolate Rules

1. **Red Before Green:** When a correct seam exists (as defined in Phase 5 of the `diagnosing-bugs` skill), the first code written MUST be an automated test (unit or integration) at that seam that reproduces the bug and is **seen to FAIL** before touching any production source code. When there is no correct seam, do not write a shallow test: record the missing seam as a finding in `bug_report.md`, verify the fix by the reproduction steps instead, and propose the seam as a follow-up task.
2. **Minimal Blast Radius:** Fix the root cause and no more. A desired architectural refactor is a separate follow-up task.
3. **Permanent Institutional Memory:** Every bug fix leaves a permanent regression test case in the test suite where a correct seam exists, or the documented missing seam in `bug_report.md`, and an updated record in `test_cases.md` and `bug_report.md`.

---

## Execution Phases

### Phase 1: Ingest & Triage
1. Read the bug report (`bug_report.md` or issue description).
2. Extract:
   - **Expected Behavior** vs **Observed Behavior**.
   - Associated Test Case ID (`Breaks: TC...`) or affected Acceptance Criterion.
   - Reproduction steps and specific environment/input conditions.

### Phase 2: Diagnose
Read and follow `skills/diagnosing-bugs/SKILL.md` Phases 1-4. Skip this phase only when the root cause is already known AND a reproduction exists.

### Phase 3: Fix & Regression Test
Fix the root cause and add the regression test per `diagnosing-bugs` Phase 5 (seam rule), then confirm the test is green. With no correct seam, re-run the reproduction steps instead.

### Phase 4: Close
1. Run the full project test suite (command from `docs/project_profile.md`; see the Review & Verification Phase of `rules/AGENTS.md` if there is no profile) to confirm zero regressions.
2. Update `bug_report.md` with the Root Cause Analysis (RCA) and a link to the regression test (or, with no correct seam, the missing-seam finding).
3. Update the matching TC in `test_cases.md`.
4. Commit per `rules/AGENTS.md` §2, format `fix(<scope>): ...`.
