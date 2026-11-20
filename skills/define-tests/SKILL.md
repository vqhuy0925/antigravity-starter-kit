---
name: define-tests
description: Define comprehensive test cases, boundary conditions, and cross-layer verification matrices from requirements and specifications without developer implementation bias. Operates in Black-box QA mode (pure requirements) or Developer mode (mapping to automated suites).
---

# QA Test Definition Workflow (`define-tests`)

Define how a story, feature, or bugfix will be proven complete **before writing any production code**.

---

## 1. Core Principles

### Principle 1: Context Isolation (Zero Dev Bias)
Developers inherently suffer from confirmation bias—writing tests that validate how their code was written rather than how the system should actually behave.
- **Independent Agent Execution:** The QA Agent MUST execute in an isolated context (e.g., via `invoke_subagent` with `Role: 'QA Engineer'` or a standalone prompt).
- **Clean Requirements Source:** QA evaluates requirements strictly from `intent.md`, `spec.md`, user problem statements, or bug reports. QA does NOT consult dev implementation plans, in-progress code, or temporary mock shortcuts.

### Principle 2: Cross-Layer Verification
A bug often lives in the disconnect between layers. Never define test cases that only assert internal entity state. Apply the Cross-Layer Rule in `rules/AGENTS.md`, using the layers listed in `docs/project_profile.md` (`## Layers`). Illustration: a `discount_total DEFAULT 0` column overwriting a computed `15.00` is only caught by checking the stored value, the API response, and the rendered value.

---

## 2. Operating Modes

### Mode A: Black-box QA / Tester Mode (Independent Requirements Focus)
- **Context:** The agent is given a story, requirements, bug report, or business feedback, but does **NOT** read internal dev code shortcuts.
- **Focus:**
  - Map every Acceptance Criterion (AC) to observable behaviors.
  - Formulate mathematical boundary cases, state transitions, and edge cases.
  - Scrutinize business formulas (e.g., discount caps, tiered pricing thresholds) and identify conflicting logic.
  - Specify clear Preconditions, Test Steps, and Expected Results at every layer the change touches (Cross-Layer Rule).

### Mode B: Developer Test Planning Mode (Code & Plan Aware)
- **Context:** The developer maps QA test cases to the plan (`docs/plans/<branch>.md`) and codebase test suites.
- **Focus:**
  - Classify each test case into an execution level:
    - `auto:unit`: In-memory fast test for a single class/function (mock dependencies).
    - `auto:integration`: Requires database, real HTTP endpoints, or container.
    - `manual`: Requires physical mobile device, real browser session, or 3rd-party webhook.
  - Assign each automated test case to a specific implementation task in the plan (`docs/plans/<branch>.md`).
  - Check existing test files (`Existing test: ...`) to extend existing coverage and avoid duplicate tests.

---

## 3. The 3 Core Rules
1. **100% Traceability:** Every test case must explicitly cite an `AC` or a named architectural `Risk`. Speculative tests without requirement backing are rejected.
2. **Zero Untested ACs:** Every single acceptance criterion must have at least one test case. If an AC cannot be verified objectively, mark it as **Untestable** and formulate concrete questions for the PO.
3. **Permanent TC Identifiers (`TC01`, `TC02`...):** Test case IDs are never renumbered or reordered. If a case is invalidated, mark it `**Retired**` with a reason. Future bug reports cite these IDs directly (`Breaks: TC03`).

---

## 4. Test Design & Derivation Methodology

Systematically cover the following dimensions:
1. **Happy Path:** The primary flow that confirms the basic business requirement works and formulas calculate correctly (e.g., a 10% coupon on a 200.00 subtotal, capped at 15.00, gives a 15.00 discount).
2. **Boundary Values (BVA):** Minimum boundaries (0.00 subtotal), the cap boundary (150.00 subtotal), and interval transitions (just below and above a threshold).
3. **Negative & Validation Scenarios:** Invalid input (expired coupon, negative quantity), missing required links, duplicate requests.
4. **State Fallback & Persistence Traps:** Ensure DB defaults (e.g., `DEFAULT 0`) do not overwrite calculated values; idempotency on request re-approval or cancellation.
5. **UI / Mobile Ergonomics:** If the change touches a UI layer: paging, touch responsiveness, 3-zone dialog layouts, and safe-area insets.

---

## 5. Output Artifact & Verification Gates

### Output Artifact
Generate or update `test_cases.md` in the active artifact directory using the template defined in `templates/test_cases_template.md`.

### Dual Verification Gates
- **For Dev (`implement`):** Dev must read `test_cases.md` and write automated unit/integration tests covering all `TC-xx` scenarios before claiming work is complete.
- **For Reviewer (`review-code`):** Reviewer must inspect automated test results against `test_cases.md`. If any scenario is missing coverage or fails, code review must be rejected.

---

## 6. Independent Draft Review Protocol

When auditing a drafted `test_cases.md` (as a second-opinion subagent or self-audit before finalizing):
1. **Re-derive First, Read Draft Second:** From `intent.md`/`spec.md` alone, derive decision variables, boundary values, state transitions, and expected case counts *before* opening `test_cases.md`. Reading the draft first anchors you to the drafter's blind spots.
2. **Diff Coverage & Splits:** Flag untested ACs/boundaries, cases that must split (variants touching different fields/navigation, sharing mutable lockout/rate-limit state, or mixing functional logic with cross-cutting checklists), and weak assertions (e.g., "shows an error" instead of literal expected copy/state).
3. **Never Invent Requirements:** If the specification leaves a rule unstated, report it as a **spec gap**, never as a missing test.
