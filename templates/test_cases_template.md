# Test Specification & Verification Matrix: [Title of Feature / Module]

**Source Spec / Story:** [Link to spec.md, intent.md, or Issue ID]  
**Source Plan:** [Link to docs/plans/<branch>.md]  
**QA Lead / Agent:** QA Engineer (Independent Context)  
**Status:** [Draft | Approved | Ready to Implement | Verified]  
**Last Updated:** YYYY-MM-DD  

---

## 1. Scope & Acceptance Criteria (AC)
<!-- Core functional criteria that MUST be satisfied for the feature to be accepted -->
- **AC-01:** [Primary expected user flow or business rule]
- **AC-02:** [Calculation / transformation rules]
- **AC-03:** [Audit logging, state transitions, and exception rules]

---

## 2. Cross-Layer Verification Expectations (Cross-Layer Rule)
> [!IMPORTANT]
> A feature is NOT done just because an entity attribute or in-memory service calculation passes. Verify every layer the change touches, per the Cross-Layer Rule in `rules/AGENTS.md`. The layer list comes from `docs/project_profile.md` (`## Layers`). Web-app default, as an example:
1. **Data / Entity Layer:** Database row values, foreign keys, timestamps, default columns (preventing DB default value traps).
2. **API / Service Layer:** Response DTOs, calculated values, audit comments, HTTP status codes.
3. **UI / Presentation Layer:** Rendered values, table cells, badges, action dialogs.

---

## 3. Summary Test Matrix

| TC ID | Covers (AC / Risk) | Level | Task Ref | Category | Preconditions & Inputs | Expected Outcome Across Layers | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC01** | AC-01 | `auto:unit` | Task 1 | Happy Path | Subtotal 200.00, 10% coupon capped at 15.00. | **DB:** `discount_total` 15.00.<br>**API:** `discount: "15.00"`.<br>**UI:** shows "−15.00". | Pending |
| **TC02** | AC-02 | `auto:unit` | Task 1 | Boundary (Min) | Subtotal 0.00 with the same coupon. | Discount 0.00 at every layer. | Pending |
| **TC03** | AC-02 | `auto:unit` | Task 1 | Boundary (At Cap) | Subtotal 150.00 (10% equals the 15.00 cap). | Discount 15.00 at every layer. | Pending |
| **TC04** | AC-03 | `auto:integration` | Task 2 | Negative | Apply an expired coupon. | Rejection with HTTP 422 Validation Error. | Pending |
| **TC05** | AC-01 / Risk | `auto:integration` | Task 2 | DB Default Trap | Re-read the order after the 15.00 discount was computed. | `discount_total DEFAULT 0` must NOT overwrite the computed 15.00. | Pending |
| **TC06** | AC-01 | `manual` | Task 3 | UI Presentation | Open the mobile checkout page for the discounted order. | The discount line is shown with the correct amount. | Pending |

> **Levels Guide:**
> - `auto:unit`: In-memory isolated test (unit runner, mock dependencies, fast execution).
> - `auto:integration`: Requires real database, container, or HTTP server integration.
> - `manual`: Requires real browser interaction, external 3rd-party sandbox, or hardware device.

---

## 4. Regression & Security Edge Cases
- [ ] **No Hardcoded Defaults Override:** Verify DB defaults (e.g. `DEFAULT 0`) do not overwrite calculated values.
- [ ] **Division by Zero Protection:** Zero or missing divisors gracefully handled.
- [ ] **Idempotency & Re-approval:** Re-approving or rejecting an already approved request properly recalculates or reverts the affected values.
- [ ] **Permission & Role Security:** Unauthorized users cannot approve their own request or override calculated values.

---

## 5. Untestable Criteria & Open Questions
<!-- Any criteria that cannot be verified objectively or lack necessary business definitions -->
- [ ] **Untestable Criterion:** `[Quote AC text]`
  - **Why untestable:** [e.g. subjective wording, missing fallback rule, undefined boundary]
  - **Proposed Resolution / Question for PO:** [Concrete question with options]

---

## 6. QA Sign-Off Gate
- [ ] All test cases in Section 3 have corresponding automated tests (`auto:unit`, `auto:integration`) or verified manual proof.
- [ ] Review-Code agent verified the change at every layer listed for this change.
- [ ] No regression detected in related calculations.
