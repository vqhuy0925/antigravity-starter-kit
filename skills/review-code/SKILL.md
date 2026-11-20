---
name: review-code
description: Run automated tests, linters, type checks, and audit code against QA test_cases.md and security standards before finalizing work.
---

# Automated Code Review Standards

## 1. Static Verification & Test Execution
- Run project linters (`npm run lint`, `eslint`, `./gradlew check`).
- Run type checkers (`npx vue-tsc --noEmit`, `tsc --noEmit`).
- Run automated unit and integration tests (`./gradlew test -q`, `npm test`, or project-specific test runners like `build-local-with-test.bat`).

## 2. QA Test Matrix Audit (Independent Verification)
> [!IMPORTANT]
> Developer tests alone are not sufficient. The reviewer MUST independently cross-check implementation evidence against `test_cases.md` defined by the QA Agent:
- **Scenario Completeness:** Verify that every scenario (`TC-01`, `TC-02`, etc.) in `test_cases.md` has a corresponding passing automated test or documented verification.
- **Cross-Layer Rule Audit:** Ensure verification covers every layer the change touches, per the Cross-Layer Rule in `rules/AGENTS.md` (layers listed in `docs/project_profile.md`).
- **Reject on Missing QA Coverage:** If any QA test scenario is skipped, mocked away superficially, or failing, REJECT the review and require dev fixes.

## 3. Clean Code & Security Audit Checklist
- **No Hardcoded Secrets:** Ensure no API keys, tokens, or passwords are committed.
- **SQL Injection Prevention:** Verify all queries use parameter binding / ORM mechanisms.
- **XSS Sanitization:** Check user-rendered inputs for potential injection vectors.
- **Exception Safety:** Confirm no empty catch blocks (`catch (e) {}`).
- **DRY & SRP:** Ensure functions and components have single responsibility.
- **Modern Web Standards Audit:** For frontend changes, flag redundant dependencies (e.g. Popper.js, floating-ui, custom modal JS) where native Web Baseline APIs (`<dialog>`, Popover API, CSS Anchor Positioning) should be used (see [`modern-web-guidance`](../modern-web-guidance/SKILL.md)).

## 4. Walkthrough Documentation
- Create or update `walkthrough.md` with a summary of changes, verified behaviors, QA test case coverage matrix, and test execution evidence.
