---
name: plan
description: Plan the implementation of a task or ticket by researching the codebase, creating implementation_plan.md, and setting up task.md.
---

# Plan Implementation Workflow

## 1. Research & Analysis
- Research existing classes, schemas, API routes, and components related to the task.
- Pinpoint dependencies and side effects before modifying any code.
- Do NOT perform code modifications or run modifying commands during the planning phase.

## 2. Generate Plan Artifacts
- **`implementation_plan.md`**:
  - Context & Goal Description.
  - User Review Required (highlight critical/breaking architectural decisions).
  - Proposed Changes (categorized by layer/module).
  - Verification & Testing Plan.
- **`task.md`**:
  - Checkable task list (`- [ ]`) tracking implementation progress.

## 3. Review & Approval Gate
- Stop and seek explicit user confirmation before proceeding to the implementation phase.
