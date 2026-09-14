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
│ Stage 6:     │ ◄───────────────  │ Stage 5:     │ ◄──────────────────── │ Stage 4:     │
│ maintain.md  │   (Human Sign)   │ deploy.md    │     (Tests/Linters)    │ code + tests │
└──────────────┘                  └──────────────┘                        └──────────────┘
     │
     └─── Loop closes (breach/incident -> new intent.md)
```

---

## 6-Stage Lifecycle

### Stage 1: Plan (Intent Capture)
- **Artifact:** `intent.md` (Problem statement, proposed outcome, affected systems, constraints, open questions).
- **Process:** The originator brainstorms directly with the AI. No formal engineering language required.
- **Approval Gate:** Product Owner reviews and commits `intent.md`.

### Stage 2: Design (Spec & Flagged Concerns)
- **Artifact:** `spec.md` (Functional requirements, UI/UX layouts, API contracts, domain safeguards).
- **Process:** AI synthesizes requirements and design in a single prompted session guided by codified skills.
- **Flagged Concerns:** AI explicitly highlights policy conflicts, architectural trade-offs, and compliance concerns before coding begins.
- **Approval Gate:** Tech Lead / Architect approves `spec.md`.

### Stage 3: Build (Plan Mode Default)
- **Artifact:** `plan.md` (Files to touch, step-by-step order of work, regression risks, proof/verification tests).
- **Rule:** Never implement code without an approved plan.
- **Process:** AI operates incrementally, adhering to project conventions and coding standards.

### Stage 4: Test (Continuous Evals & Self-Verification)
- **Execution:** Automated tests, type checkers, and linters run continuously during implementation.
- **Eval Hardening:** Tricky domain edge-cases are captured as regression tests in the codebase test suite.

### Stage 5: Deploy (Multi-Tier Governance)
- **Development/Local:** Agents can run formatters, linters, and unit tests freely.
- **Staging/Production:** Strictly gated. Agents prepare PRs, release notes, and migration scripts; execution requires explicit human authorization (`/deploy`).

### Stage 6: Maintain (Closing the Loop)
- **Triggers:** Production incidents, error alerts, or scheduled security scans trigger the AI.
- **Artifact:** `bug_report.md` with Root Cause Analysis (RCA), fix plan, and new regression evals.
- **Memory Hardening:** The **2-Mistake Rule** requires updating the project's rules (`AGENTS.md`) whenever an AI assistant makes the same mistake twice.
