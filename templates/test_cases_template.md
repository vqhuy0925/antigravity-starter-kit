# Test Cases: [Title of Story / Feature]

**Source Spec / Story:** [Link to spec.md, intent.md, or Issue/Ticket ID]  
**Source Plan:** [Link to implementation_plan.md or plan.md]  
**Authored By:** [Tester / QA Engineer | Developer | Black-box Mode (No Code Access)]  
**Created Date:** YYYY-MM-DD  
**Status:** [Draft | Reviewed | Ready to Implement | Verified]  

---

## 1. Summary Matrix

| TC ID | Covers (AC / Risk) | Level | Task | Title | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `TC01` | AC1 | `auto:unit` | Task 1 | Verify valid payload returns 200 with DTO | Pending |
| `TC02` | AC1 | `manual` | — | Check UI feedback and toast notification on mobile | Pending |
| `TC03` | AC2 / Risk | `auto:integration` | Task 2 | Verify transaction rollback when external service times out | Pending |

> **Levels Guide:**
> - `auto:unit`: In-memory isolated test (unit runner, mock dependencies, fast execution).
> - `auto:integration`: Requires real database, container, or HTTP server integration.
> - `manual`: Requires real browser interaction, external 3rd-party sandbox, or hardware device.

---

## 2. Detailed Test Scenarios

### `TC01` — [Short Descriptive Title]
- **Covers:** `AC1` (or `Risk: [Named Risk]`)
- **Level:** `auto:unit` | `auto:integration` | `manual`
- **Task Assignment:** [Task # from implementation_plan.md]
- **Existing Test Ref:** `path/to/test_file.ext#testMethodName` (if extending existing coverage)
- **Preconditions:**
  - Role / Permission: ...
  - Seed Data / Initial State: ...
- **Test Steps:**
  1. Step 1: Input ...
  2. Step 2: Trigger action ...
- **Expected Result:**
  - Observable response code / payload / state change.
  - No side-effect leaks.

---

### `TC02` — [Boundary / Error Handling Scenario]
- **Covers:** `AC1` (Edge Case)
- **Level:** `auto:unit` | `auto:integration` | `manual`
- **Task Assignment:** [Task #]
- **Preconditions:**
  - ...
- **Test Steps:**
  1. Provide invalid boundary data ...
  2. Submit ...
- **Expected Result:**
  - Clean validation error with standard error code.

---

## 3. Untestable Acceptance Criteria & Open Ambiguities
<!-- Any criteria that cannot be verified objectively or lack necessary business definitions -->
- [ ] **Untestable Criterion:** `[Quote AC text]`
  - **Why untestable:** [e.g. subjective wording, missing fallback rule, undefined boundary]
  - **Proposed Resolution / Question for PO:** [Concrete question with 2-3 options]

---

## 4. Execution & Verification Log
- **Automated Test Results:** `[Passed: X / Failed: Y]`
- **Manual Verification Notes:**
  - `TC02`: Verified by [Tester Name] on [Device/Browser] on [Date].
