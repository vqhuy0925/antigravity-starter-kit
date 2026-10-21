# Test Specification & Verification Matrix: [Title of Feature / Module]

**Source Spec / Story:** [Link to spec.md, intent.md, or Issue ID]  
**Source Plan:** [Link to implementation_plan.md or plan.md]  
**QA Lead / Agent:** QA Engineer (Independent Context)  
**Status:** [Draft | Approved | Ready to Implement | Verified]  
**Last Updated:** YYYY-MM-DD  

---

## 1. Scope & Acceptance Criteria (AC)
<!-- Core functional criteria that MUST be satisfied for the feature to be accepted -->
- **AC-01:** [Primary expected user flow or business rule]
- **AC-02:** [Deduction / calculation / transformation rules]
- **AC-03:** [Audit logging, state transitions, and exception waiver rules]

---

## 2. Cross-Layer Verification Expectations (The 3-Layer Rule)
> [!IMPORTANT]
> A feature is NOT done just because an entity attribute or in-memory service calculation passes. QA mandates verifying assertions across all 3 layers:
1. **Data / Entity Layer:** Database row values, foreign keys, timestamps, default columns (preventing DB default value traps).
2. **API / Service Layer:** Response DTOs, calculated ratios, audit comments, HTTP status codes.
3. **UI / Presentation Layer:** Calendar matrix, table cells, display codes, badges, action dialogs.

---

## 3. Summary Test Matrix

| TC ID | Covers (AC / Risk) | Level | Task Ref | Category | Preconditions & Inputs | Expected Outcome Across Layers | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC01** | AC-01 | `auto:unit` | Task 1 | Happy Path | Shift Telesale (10:00-19:30, net 510m). Checkin 10:00. Early leave approved at 18:30 (60m early). | **DB:** actual worked 450m, ratio 0.88.<br>**DTO:** displayCode '0.88', penalty 0.<br>**UI:** matrix shows '0.88' (NOT '1.0'). | Pending |
| **TC02** | AC-02 | `auto:unit` | Task 1 | Boundary (Min) | Early leave at start of shift (0 mins worked). | Ratio = 0.0, displayCode = '0.0', appropriate status. | Pending |
| **TC03** | AC-02 | `auto:unit` | Task 1 | Boundary (Max) | Early leave requested with 0 mins early (leaving at shift end). | Ratio = 1.0, displayCode = '1.0', no penalty. | Pending |
| **TC04** | AC-03 | `auto:integration` | Task 2 | Negative | Checkout timestamp after shift end or before checkin. | Rejection with HTTP 400 Validation Error. | Pending |
| **TC05** | AC-01 / Risk | `auto:integration` | Task 2 | DB Default Trap | View attendance matrix for date with approved early leave. | Matrix cell must NOT fall back to DB default `'1.0'`. Reflects calculated ratio. | Pending |
| **TC06** | AC-01 | `manual` | Task 3 | UI Presentation | Open mobile action dialog & matrix calendar view on iPad/Mobile. | 3-Zone flexbox dialog displays correct shift selection and ratio badge. | Pending |

> **Levels Guide:**
> - `auto:unit`: In-memory isolated test (unit runner, mock dependencies, fast execution).
> - `auto:integration`: Requires real database, container, or HTTP server integration.
> - `manual`: Requires real browser interaction, external 3rd-party sandbox, or hardware device.

---

## 4. Regression & Security Edge Cases
- [ ] **No Hardcoded Defaults Override:** Verify DB defaults (e.g. `'1.0'`) do not overwrite calculated fractional ratios.
- [ ] **Division by Zero Protection:** Standard shift duration = 0 or missing shifts gracefully handled.
- [ ] **Idempotency & Re-approval:** Re-approving or rejecting an already approved request properly recalculates or reverts attendance metrics.
- [ ] **Permission & Role Security:** Unauthorized users cannot approve their own early leave or override penalties.

---

## 5. Untestable Criteria & Open Questions
<!-- Any criteria that cannot be verified objectively or lack necessary business definitions -->
- [ ] **Untestable Criterion:** `[Quote AC text]`
  - **Why untestable:** [e.g. subjective wording, missing fallback rule, undefined boundary]
  - **Proposed Resolution / Question for PO:** [Concrete question with options]

---

## 6. QA Sign-Off Gate
- [ ] All test cases in Section 3 have corresponding automated tests (`auto:unit`, `auto:integration`) or verified manual proof.
- [ ] Review-Code agent verified that entity state, API DTO, and UI display codes match expectations.
- [ ] No regression detected in related attendance or payroll calculations.
