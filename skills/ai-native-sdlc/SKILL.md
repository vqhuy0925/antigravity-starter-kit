---
name: ai-native-sdlc
description: Universal AI-Native Software Development Lifecycle (SDLC) framework. Encodes the 6-stage artifact loop (intent.md -> spec.md -> plan.md -> diff/test -> deploy gate -> maintain).
---

# AI-Native SDLC Framework

This skill encodes the stage-by-stage workflow for modern AI-native software development.

## Core Philosophy
**"Code is no longer the bottleneck."** Human attention concentrates at quality gates to review version-controlled markdown artifacts, while AI agents drive the implementation, tests, reviews, and root cause analyses.

```
[Idea / Alert] 
     │
     ▼
┌──────────────┐     PO Review     ┌──────────────┐     Arch Sign-off     ┌──────────────┐
│ Stage 1:     │ ───────────────►  │ Stage 2:     │ ────────────────────► │ Stage 3:     │
│ intent.md    │                   │ spec.md      │                       │ plan.md      │
└──────────────┘                   └──────────────┘                       └──────────────┘
                                                                                 │
                                                                                 ▼
┌──────────────┐    PR Gate       ┌──────────────┐     Continuous Evals   ┌──────────────┐
│ Stage 6:     │ ◄───────────────  │ Stage 5:     │ ◄──────────────────── │ Stage 3.5/4: │
│ maintain.md  │   (Human Sign)   │ deploy.md    │     (Tests/Linters)    │ test_cases & │
└──────────────┘                  └──────────────┘                        │ implement    │
     │                                                                    └──────────────┘
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

### Stage 3: Build (Plan Mode Default)
- **Artifact:** `plan.md` (Files to touch, step-by-step order of work, regression risks, proof/verification tests).
- **Rule:** Never implement code without an approved plan. Enforced by `plan-boundary` hook.

### Stage 3.5: Define Test Cases (Pre-Implementation Gate)
- **Artifact:** `test_cases_<feature>.md` (derived via `/define-tests`).
- **Principles:**
  - 100% Traceability to ACs and identified risks.
  - Test levels clearly segmented (`auto:unit`, `auto:integration`, `manual`).
  - Permanent `TC` identifiers (`TC01`, `TC02`...) for lifecycle tracking.

### Stage 4: Implement & Test (Continuous Evals & Self-Verification)
- **Execution:** Automated tests, type checkers, and linters run continuously during implementation.
- **Bug Remediation:** Strictly follow **Red Before Green** TDD workflow (`/fix-bug`).
- **Eval Hardening:** Tricky domain edge-cases are captured as permanent regression tests.

### Stage 5: Deploy (Multi-Tier Governance)
- **Artifact:** `deploy.md`
- **Development/Local:** Agents can run formatters, linters, and unit tests freely.
- **Staging/Production:** Strictly gated. Agents prepare PRs, release notes, and migration scripts; execution requires explicit human authorization (`/deploy`).

### Stage 6: Maintain (Closing the Loop)
- **Triggers:** Production incidents, error alerts, or QA bug tickets trigger the AI.
- **Artifact:** `bug_report.md` with Root Cause Analysis (RCA), fix plan, and new regression evals.
- **Memory Hardening:** The **2-Mistake Rule** requires updating the project's rules (`AGENTS.md`) whenever an AI assistant makes the same mistake twice.
