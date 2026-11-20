---
name: review-code
description: Run automated tests, linters, type checks, and audit code against QA test_cases.md and security standards before finalizing work.
---

# Automated Code Review Standards

## 1. Static Verification & Test Execution
- Run the project's lint, type-check, and unit and integration test commands. Take them from `docs/project_profile.md`; if there is no profile, follow the fallback in the Review & Verification Phase of `rules/AGENTS.md`.

## 2. QA Test Matrix Audit (Independent Verification)
> [!IMPORTANT]
> Developer tests alone are not sufficient. The reviewer MUST independently cross-check implementation evidence against `test_cases.md` defined by the QA Agent:
- **Scenario Completeness:** Verify that every scenario (`TC-01`, `TC-02`, etc.) in `test_cases.md` has a corresponding passing automated test or documented verification.
- **Cross-Layer Rule Audit:** Ensure verification covers every layer the change touches, per the Cross-Layer Rule in `rules/AGENTS.md` (layers listed in `docs/project_profile.md`).
- **Reject on Missing QA Coverage:** If any QA test scenario is skipped, mocked away superficially, or failing, REJECT the review and require dev fixes.

## 3. Clean Code & Security Audit
- Run the `code-reviewer` subagent on the diff (`invoke_subagent`, definition `agents/code-reviewer.md`) and include its verdict.

## 4. Walkthrough Documentation
- Create or update `walkthrough.md` with a summary of changes, verified behaviors, QA test case coverage matrix, and test execution evidence.
