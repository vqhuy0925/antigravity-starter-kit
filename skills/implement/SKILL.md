---
name: implement
description: Execute code changes step-by-step based on the approved implementation_plan.md, task.md checklist, and QA test_cases.md.
---

# Structured Implementation Workflow

## 1. Execution Discipline
- Follow the approved `implementation_plan.md` faithfully.
- Check off completed tasks in `task.md` (`[/]` in progress, `[x]` done) as work progresses.
- Run lightweight compilation/build commands frequently after modifying each component.

## 2. QA Test Cases Cross-Verification (Anti-Bias Rule)
- **Reference QA Truth:** Load `test_cases.md` produced by the independent QA Agent.
- **Cross-Layer Implementation:** Ensure code changes and automated tests cover all specified scenarios (TC-01, TC-02, etc.) across all 3 layers (Database state, Service/DTO calculations, and UI presentation/display codes).
- **No Self-Serving Shortcuts:** Developer cannot skip edge cases or boundary validations defined by QA. All automated tests must pass before marking tasks complete.

## 3. Handling Plan Deviations
- If unexpected bugs or breaking architectural requirements arise during implementation, pause and update `implementation_plan.md` rather than making unreviewed sweeping changes.
