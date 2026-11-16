---
name: commit-code
description: Scan changes, group them logically by domain topic, and execute conventional git commits.
---

# Conventional Commit Standard

## 1. Commit Granularity
- Never bundle unrelated changes across multiple domains into a single massive commit.
- Group staged files by topic/layer (e.g. backend api vs frontend ui vs docs).

## 2. Commit Message Structure
- Format: `<type>(<scope>): <subject>`
  - Types: `feat`, `fix`, `refactor`, `test`, `chore`, `perf`, `docs`, `style`.
  - Subject: Imperative, present-tense, concise description (max 72 chars).
- Example: `feat(payment): implement 3-zone responsive refund dialog`

## 3. Commit & Push Flow Automation
- When the user commands "commit and push" (or similar paired intent), or confirms "yes" to a commit & push prompt, treat it as a single compound action:
  1. Show diff summary and proposed commit message.
  2. Once the user approves or requests "commit and push", run `git commit`.
  3. Immediately proceed with `git push` without interrupting to ask a second time.
  4. If a git guardrail prevents pushing directly to `main`/`master`, automatically create the feature branch, reset local main to origin, and push the feature branch to origin immediately. NEVER re-prompt the user for confirmation when they already approved the push.
