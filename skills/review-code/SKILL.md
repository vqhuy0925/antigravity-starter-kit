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
- **The 3-Layer Rule Audit:** Ensure verification covers all 3 layers:
  1. Data layer: Entity state & DB column defaults.
  2. Service layer: API DTO response payloads, calculated ratios, penalty waivers.
  3. Presentation layer: UI display codes, calendar matrix rendering, and badge values.
- **Reject on Missing QA Coverage:** If any QA test scenario is skipped, mocked away superficially, or failing, REJECT the review and require dev fixes.

## 3. Clean Code & Security Audit Checklist
- **No Hardcoded Secrets:** Ensure no API keys, tokens, or passwords are committed.
- **SQL Injection Prevention:** Verify all queries use parameter binding / ORM mechanisms.
- **XSS Sanitization:** Check user-rendered inputs for potential injection vectors.
- **Exception Safety:** Confirm no empty catch blocks (`catch (e) {}`).
- **DRY & SRP:** Ensure functions and components have single responsibility.

## 4. Walkthrough Documentation
- Create or update `walkthrough.md` with a summary of changes, verified behaviors, QA test case coverage matrix, and test execution evidence.
