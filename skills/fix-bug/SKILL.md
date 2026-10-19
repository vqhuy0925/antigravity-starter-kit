---
name: fix-bug
description: Systematic TDD bug remediation workflow. Enforces 'Red Before Green' — reproducing the defect as an automated failing test before modifying any production code.
---

# TDD Bug Remediation Workflow (Red Before Green)

Fix defects with mathematical certainty through Test-Driven Remediation.

---

## The 3 Inviolate Rules

1. **Red Before Green:** The first code written MUST be an automated test (unit or integration) that reproduces the bug and is **seen to FAIL** before touching any production source code.
2. **Minimal Blast Radius:** Fix the root cause and no more. A desired architectural refactor is a separate follow-up task.
3. **Permanent Institutional Memory:** Every bug fix leaves a permanent regression test case in the test suite and an updated record in `test_cases_<feature>.md` and `bug_report.md`.

---

## Execution Phases

### Phase 1: Ingest & Triage
1. Read the bug report (`bug_report.md` or issue description).
2. Extract:
   - **Expected Behavior** vs **Observed Behavior**.
   - Associated Test Case ID (`Breaks: TC...`) or affected Acceptance Criterion.
   - Reproduction steps and specific environment/input conditions.

### Phase 2: Reproduce as Failing Test (RED)
1. Write an automated test asserting the expected behavior under the defect condition.
2. Execute the test command (`npm test`, `./gradlew test -q`, `pytest`).
3. **Verify failure:** Confirm the test fails with the exact symptom reported.
   - *If the test passes, the test does not accurately reproduce the defect condition.*

### Phase 3: Targeted Remediation (GREEN)
1. Diagnose root cause in production logic.
2. Implement the minimal necessary change to fix the defect.
3. Re-run the reproduction test: **Verify it now PASSES (GREEN)**.

### Phase 4: Regression Audit & Verification
1. Run the entire project test suite to confirm zero regressions in neighboring components.
2. Update `bug_report.md` with:
   - Root Cause Analysis (RCA).
   - Link to new regression test.
3. Commit using conventional commit format: `fix(<scope>): resolve <defect description>`.
