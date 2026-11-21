---
name: plan
description: Plan the implementation of a task or ticket by researching the codebase, reading test_cases.md (running the independent QA subagent only if it is missing), writing the plan to docs/plans/<branch>.md, and setting up task.md.
---

# Plan Implementation Workflow (`/plan`)

## Which planning skill

| Skill | Scope | Output |
|---|---|---|
| `plan` | one change in one session or branch | `docs/plans/<branch>.md` |
| `to-tickets` (suggest to the user) | one spec into tracker tickets | tickets with blocking edges |
| `wayfinder` (suggest to the user) | a multi-session epic whose route is unknown | a map ticket |

## 1. Research & Analysis
- Research existing classes, schemas, API routes, and components related to the task.
- Pinpoint dependencies and side effects before modifying any code.
- Do NOT perform code modifications or run modifying commands during the planning phase.

## 2. Read QA Test Cases (`define-tests` only if missing)
> [!IMPORTANT]
> To eliminate developer confirmation bias, test cases must be established independently before implementation planning is finalized.
- Read `test_cases.md` (produced at Stage 2b). If it exists, use it and do not re-run `define-tests`.
- Only if `test_cases.md` is missing, invoke an isolated subagent via `invoke_subagent`:
  - `Role`: `'QA Engineer'`
  - `Prompt`: Instruct the QA subagent to analyze the user request / bug report / `spec.md`, execute the `define-tests` skill, and generate `test_cases.md` per the Cross-Layer Rule in `rules/AGENTS.md`, using `templates/test_cases_template.md`.
- Wait for the QA subagent to produce `test_cases.md`.

## 3. Generate Plan Artifacts
- **`docs/plans/<branch>.md`** (branch `/` → `-`; committed with the work; optionally mirror as `implementation_plan.md` in the conversation artifacts). Use `templates/plan_template.md`; list every changed file as a backticked repo-relative path (the `plan-boundary` hook matches these):
  - Context & Goal Description.
  - User Review Required (highlight critical/breaking architectural decisions).
  - Proposed Changes (categorized by layer/module).
  - **QA Test Case Mapping**: Map each task to the corresponding `TC-xx` scenarios from `test_cases.md`.
  - Verification & Testing Plan.
- **`task.md`**:
  - Checkable task list (`- [ ]`) tracking implementation progress and test validation.

## 4. Review & Approval Gate
- Present the plan once, with all batched questions, and wait for approval per `rules/AGENTS.md` §2. After approval, implementation runs end-to-end without further stops.
