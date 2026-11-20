---
name: implement
description: Execute code changes step-by-step based on the approved plan (`docs/plans/<branch>.md`), task.md checklist, and QA test_cases.md.
---

# Structured Implementation Workflow

## 1. Execution Discipline
- Follow the approved plan (`docs/plans/<branch>.md`) faithfully.
- After plan approval, run end-to-end per `rules/AGENTS.md` §2: fix failing tests yourself, make no mid-run commits, and hand off to `commit-code` at the end.
- Check off completed tasks in `task.md` (`[/]` in progress, `[x]` done) as work progresses.
- Run lightweight compilation/build commands frequently after modifying each component.

## 2. QA Test Cases Cross-Verification (Anti-Bias Rule)
- **Reference QA Truth:** Load `test_cases.md` produced by the independent QA Agent.
- **Cross-Layer Implementation:** Ensure code changes and automated tests cover all specified scenarios (TC-01, TC-02, etc.) at every layer the change touches, per the Cross-Layer Rule in `rules/AGENTS.md`.
- **No Self-Serving Shortcuts:** Developer cannot skip edge cases or boundary validations defined by QA. All automated tests must pass before marking tasks complete.

## 3. Handling Plan Deviations
- A deviation that changes the plan's file list or approach (an unexpected bug, a breaking architectural requirement) is a genuine blocker per `rules/AGENTS.md` §2: stop, update `docs/plans/<branch>.md`, and present it for approval before continuing. Never make unreviewed sweeping changes.
