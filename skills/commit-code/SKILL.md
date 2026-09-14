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
