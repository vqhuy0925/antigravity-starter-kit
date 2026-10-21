---
name: ai-native-sdlc
description: Universal AI-Native Software Development Lifecycle (SDLC) framework. Encodes the 6-stage artifact loop (intent.md -> spec.md -> test_cases.md -> plan.md -> diff/test -> deploy gate -> maintain).
---

# AI-Native SDLC Framework

This skill encodes the stage-by-stage workflow for modern AI-native software development.

## Core Philosophy
**"Code is no longer the bottleneck."** Human attention concentrates at quality gates to review version-controlled markdown artifacts, while AI agents drive the implementation, tests, reviews, and root cause analyses.

```
[Idea / Alert] 
     │
     ▼
┌──────────────┐     PO Review     ┌──────────────┐    QA Independence     ┌────────────────┐
│ Stage 1:     │ ───────────────►  │ Stage 2:     │ ─────────────────────► │ Stage 2b (QA): │
│ intent.md    │                   │ spec.md      │    (Zero-Dev Bias)     │ test_cases.md  │
└──────────────┘                   └──────────────┘                        └────────────────┘
                                                                                   │
                                                                                   ▼
┌──────────────┐    PR Gate       ┌──────────────┐    Cross-Verification   ┌────────────────┐
│ Stage 6:     │ ◄───────────────  │ Stage 5:     │ ◄───────────────────── │ Stage 3 & 4:   │
│ maintain.md  │   (Human Sign)   │ deploy.md    │  (Dev vs test_cases)   │ plan.md & Code │
└──────────────┘                  └──────────────┘                         └────────────────┘
     │
     └─── Loop closes (breach/incident/bug -> fix-bug -> new intent.md)
```

---

## 6-Stage Lifecycle

### Stage 1: Plan (Intent Capture)
- **Artifact:** `intent.md` (Problem statement, proposed outcome, affected systems, constraints, open questions).
- **Process:** The originator brainstorms directly with the AI. No formal engineering language required.
- **Approval Gate:** Product Owner reviews and commits `intent.md`.

### Stage 2: Design (Spec & Flagged Concerns)
- **Artifact:** `spec.md` (Functional requirements, UI/UX layouts, API contracts, domain safeguards).
- **Process:** AI synthesizes requirements and design, critiqued by the adversarial `spec-critic` subagent.
- **Flagged Concerns:** AI explicitly highlights policy conflicts, architectural trade-offs, and compliance concerns before coding begins.
- **Approval Gate:** Tech Lead / Architect approves `spec.md`.

### Stage 2b: QA Verification Contract (`define-tests`)
- **Artifact:** `test_cases.md` (Acceptance criteria, boundary conditions, cross-layer assertions: DB vs API DTO vs UI matrix).
- **Agent Role:** Independent **QA Agent** (executed in an isolated subagent context with zero dev implementation bias).
- **Process:** QA derives pure black-box test scenarios from `intent.md`/`spec.md` before developer implementation starts.
- **Approval Gate:** Test cases established as the ground truth contract for Dev and Code Review.

### Stage 3: Build (Plan Mode Default)
- **Artifact:** `plan.md` (Files to touch, step-by-step order of work, regression risks, proof/verification tests).
- **Rule:** Never implement code without an approved plan and cross-checking `test_cases.md`. Enforced by `plan-boundary` hook.
- **Process:** AI operates incrementally, adhering to project conventions, coding standards, and QA acceptance criteria.

### Stage 4: Implement & Test (Continuous Evals & Cross-Verification)
- **Execution:** Automated tests, type checkers, and linters run continuously during implementation.
- **Cross-Check:** Developer must verify each scenario in `test_cases.md` with passing automated unit/integration tests (`auto:unit`, `auto:integration`).
- **Bug Remediation:** Strictly follow **Red Before Green** TDD workflow (`/fix-bug`).
- **Eval Hardening:** Tricky domain edge-cases are captured as regression tests in the codebase test suite.

### Stage 5: Deploy (Multi-Tier Governance & Audit)
- **Artifact:** `deploy.md`
- **Development/Local:** Agents can run formatters, linters, and unit tests freely.
- **Review Gate (`review-code`):** Reviewer strictly audits the implementation and test results against `test_cases.md`. If any QA scenario is missed or unverified, review fails.
- **Staging/Production:** Strictly gated. Agents prepare PRs, release notes, and migration scripts; execution requires explicit human authorization (`/deploy`).

### Stage 6: Maintain (Closing the Loop)
- **Triggers:** Production incidents, error alerts, or QA bug tickets trigger the AI.
- **Artifact:** `bug_report.md` with Root Cause Analysis (RCA), fix plan, and new regression evals.
- **Memory Hardening:** The **2-Mistake Rule** requires updating the project's rules (`AGENTS.md`) whenever an AI assistant makes the same mistake twice.
