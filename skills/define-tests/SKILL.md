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

### Principle 2: Cross-Layer Verification (The 3-Layer Rule)
A bug often lives in the disconnect between data layers. Never define test cases that only assert internal entity state. Every test scenario must verify:
1. **Data Layer (Entity / DB):** State transitions, persisted values, timestamps, and default column behavior (e.g., preventing DB default value traps).
2. **Service / API Layer (DTOs):** Calculated attributes, response status codes, penalty waivers, and audit logs.
3. **Presentation / UI Layer (Client / Matrix):** Display codes (e.g., `'0.88'` vs DB default `'1.0'`), badges, error alerts, and matrix calendar cells.

---

## 2. Operating Modes

### Mode A: Black-box QA / Tester Mode (Independent Requirements Focus)
- **Context:** The agent is given a story, requirements, bug report, or business feedback, but does **NOT** read internal dev code shortcuts.
- **Focus:**
  - Map every Acceptance Criterion (AC) to observable behaviors.
  - Formulate mathematical boundary cases, state transitions, and edge cases.
  - Scrutinize business formulas (e.g., attendance deductions, penalty thresholds) and identify conflicting logic.
  - Specify clear Preconditions, Test Steps, and Expected Results across all 3 layers.

### Mode B: Developer Test Planning Mode (Code & Plan Aware)
- **Context:** The developer maps QA test cases to `implementation_plan.md` and codebase test suites.
- **Focus:**
  - Classify each test case into an execution level:
    - `auto:unit`: In-memory fast test for a single class/function (mock dependencies).
    - `auto:integration`: Requires database, real HTTP endpoints, or container.
    - `manual`: Requires physical mobile device, real browser session, or 3rd-party webhook.
  - Assign each automated test case to a specific implementation task in `implementation_plan.md`.
  - Check existing test files (`Existing test: ...`) to extend existing coverage and avoid duplicate tests.

---

## 3. The 3 Core Rules
1. **100% Traceability:** Every test case must explicitly cite an `AC` or a named architectural `Risk`. Speculative tests without requirement backing are rejected.
2. **Zero Untested ACs:** Every single acceptance criterion must have at least one test case. If an AC cannot be verified objectively, mark it as **Untestable** and formulate concrete questions for the PO.
3. **Permanent TC Identifiers (`TC01`, `TC02`...):** Test case IDs are never renumbered or reordered. If a case is invalidated, mark it `**Retired**` with a reason. Future bug reports cite these IDs directly (`Breaks: TC03`).

---

## 4. Test Design & Derivation Methodology

Systematically cover the following dimensions:
1. **Happy Path:** The primary flow that confirms the basic business requirement works and formulas calculate correctly (e.g., $(510 - 60) / 510 = 0.88$ công).
2. **Boundary Values (BVA):** Minimum boundaries (0 mins worked), maximum boundaries (leaving at shift end), and interval transitions (unpaid lunch breaks).
3. **Negative & Validation Scenarios:** Invalid timestamps (checkout before checkin), missing required shift links, duplicate requests.
4. **State Fallback & Persistence Traps:** Ensure DB defaults (e.g., `DEFAULT '1.0'`) do not overwrite calculated fractional ratios; idempotency on request re-approval or cancellation.
5. **UI / Mobile Ergonomics:** Paging, touch responsiveness, 3-zone dialog layouts, and safe-area insets.

---

## 5. Output Artifact & Verification Gates

### Output Artifact
Generate or update `test_cases.md` in the active artifact directory using the template defined in `templates/test_cases_template.md`.

### Dual Verification Gates
- **For Dev (`implement`):** Dev must read `test_cases.md` and write automated unit/integration tests covering all `TC-xx` scenarios before claiming work is complete.
- **For Reviewer (`review-code`):** Reviewer must inspect automated test results against `test_cases.md`. If any scenario is missing coverage or fails, code review must be rejected.
