---
name: review-code
description: Run automated tests, linters, type checks, and verify clean code and security compliance before finalizing work.
---

# Automated Code Review Standards

## 1. Static Verification
- Run project linters (`npm run lint`, `eslint`, `./gradlew check`).
- Run type checkers (`npx vue-tsc --noEmit`, `tsc --noEmit`).
- Run automated unit and integration tests (`./gradlew test -q`, `npm test`).

## 2. Clean Code & Security Audit Checklist
- **No Hardcoded Secrets**: Ensure no API keys, tokens, or passwords are committed.
- **SQL Injection Prevention**: Verify all queries use parameter binding / ORM mechanisms.
- **XSS Sanitization**: Check user-rendered inputs for potential injection vectors.
- **Exception Safety**: Confirm no empty catch blocks (`catch (e) {}`).
- **DRY & SRP**: Ensure functions and components have single responsibility.

## 3. Walkthrough Documentation
- Create or update `walkthrough.md` with a summary of changes, verified behaviors, and test results.
