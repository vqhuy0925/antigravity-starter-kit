---
name: plan
description: Plan the implementation of a task or ticket by researching the codebase, running the independent QA subagent for test definition, creating implementation_plan.md, and setting up task.md.
---

# Plan Implementation Workflow (`/plan`)

## 1. Research & Analysis
- Research existing classes, schemas, API routes, and components related to the task.
- Pinpoint dependencies and side effects before modifying any code.
- Do NOT perform code modifications or run modifying commands during the planning phase.

## 2. Trigger Independent QA Subagent (`define-tests`)
> [!IMPORTANT]
> To eliminate developer confirmation bias, test cases must be established independently before implementation planning is finalized.
- Invoke an isolated subagent via `invoke_subagent`:
  - `Role`: `'QA Engineer'`
  - `Prompt`: Instruct the QA subagent to analyze the user request / bug report / `spec.md`, execute the `define-tests` skill, and generate `test_cases.md` across 3 layers (DB, API DTO, UI matrix) using `templates/test_cases_template.md`.
- Wait for the QA subagent to produce `test_cases.md`.

## 3. Generate Plan Artifacts
- **`implementation_plan.md`**:
  - Context & Goal Description.
  - User Review Required (highlight critical/breaking architectural decisions).
  - Proposed Changes (categorized by layer/module).
  - **QA Test Case Mapping**: Map each task to the corresponding `TC-xx` scenarios from `test_cases.md`.
  - Verification & Testing Plan.
- **`task.md`**:
  - Checkable task list (`- [ ]`) tracking implementation progress and test validation.

## 4. Review & Approval Gate
- Stop and seek explicit user confirmation before proceeding to the implementation phase.
