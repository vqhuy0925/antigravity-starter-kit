---
name: define-tests
description: Define comprehensive test cases from requirements, user stories, and plan risks before writing implementation code. Operates in Black-box Tester mode (pure requirements) or Developer mode (mapping to automated unit/integration suites).
---

# Define Test Cases Workflow

Define how a story or feature will be proven complete **before writing any production code**.

---

## 1. Operating Modes

### Mode A: Black-box QA / Tester Mode (No Code Access)
- **Context:** The agent is given a story, requirements, bug report, or business feedback, but does **NOT** read or depend on the codebase.
- **Focus:**
  - Map every Acceptance Criterion (AC) to observable behaviors.
  - Formulate mathematical boundary cases, state transitions, and edge cases.
  - Scrutinize business formulas (e.g. attendance deductions, penalty thresholds) and identify conflicting logic.
  - Specify clear Preconditions, Test Steps, and Expected Results.

### Mode B: Developer Test Planning Mode (Code & Plan Aware)
- **Context:** The agent has access to `implementation_plan.md` and the repository.
- **Focus:**
  - Classify each test case into an execution level:
    - `auto:unit`: In-memory fast test for a single class/function (mock dependencies).
    - `auto:integration`: Requires database, real HTTP endpoints, or Docker container.
    - `manual`: Requires physical mobile device, real browser session, or 3rd-party webhook.
  - Assign each automated test case to a specific implementation task in `implementation_plan.md`.
  - Check existing test files (`Existing test: ...`) to avoid duplicate tests and extend existing coverage.

---

## 2. The 3 Core Rules

1. **100% Traceability:** Every test case must explicitly cite an `AC` or a named architectural `Risk`. Remove any speculative tests that do not trace to requirements.
2. **Zero Untested ACs:** Every single acceptance criterion must have at least one test case. If an AC cannot be verified objectively (e.g., "must be fast" or "must look nice"), mark it as **Untestable** and formulate a concrete question for the Product Owner.
3. **Permanent TC Identifiers (`TC01`, `TC02`...):** Test case IDs are never renumbered or reordered. If a case is invalidated, mark it `**Retired**` with a reason. Future bug reports cite these IDs directly (`Breaks: TC03`).

---

## 3. Deriving Cases (From Requirements to Test Matrix)

Work criterion by criterion:
1. **Happy Path:** The primary flow that confirms the basic business requirement works.
2. **Boundary Values:** Exactly at the boundary, one unit below, and one unit above (e.g. 4 minutes late vs 5 minutes late).
3. **Empty / Null / Invalid Inputs:** Empty payloads, missing headers, incorrect formats, unauthorized roles.
4. **Side Effects & State Transitions:** Data persistence, external notifications (emails, webhooks), concurrent edits.
5. **UI / Mobile Ergonomics:** Paging, touch responsiveness, screen rotation, safe-area insets.

---

## 4. Output Artifact

Generate or update `test_cases_<feature>.md` in the active artifact directory or project documentation using the format defined in `templates/test_cases_template.md`.

Stop and present the test case summary matrix for review before proceeding to the code implementation phase.
