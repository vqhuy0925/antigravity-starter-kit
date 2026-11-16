---
name: story-review
description: Shift-left refinement QA review of a raw story, ticket, or feature request across 10 ISTQB/ISO-25010 lenses before planning or test design. Produces PO questions and dev risks with a mandatory lens roll-call and zero invented rules.
---

# Shift-Left 10-Lens Story Review (`story-review`)

Reviews a raw story, ticket, or feature request at refinement—**before** `spec.md`, `test_cases.md`, or `plan.md` are written—to surface what the story *doesn't* say.

---

## Core Rules
1. **Never Invent Rules:** State what is missing, contradictory, or unverifiable (`Evidence: not-in-story`), never the business rule you think should apply.
2. **Mandatory Lens Roll-Call:** Every lens below gets an explicit entry: findings, `clean`, or `n/a — <reason>`. Skipped is never `clean`.
3. **Separate Audiences:**
   - **PO Questions (`question`):** Ambiguities about business behavior (who, when, what the user sees, which outcome wins). Phrase in plain business terms—no technical jargon.
   - **Dev Risks (`dev-risk`):** Implementation, concurrency, migration, or cross-service concerns routed to engineering planning.
   - **Story Defects (`story-defect`):** Direct contradictions or untestable/broken acceptance criteria.

---

## The 10 Refinement Lenses (L0–L9)

Assign `AC1..` / `BR1..` IDs in reading order if the story lacks them, then sweep L0–L9:

| Lens | Focus |
|---|---|
| **L0. Scope & Boundaries** | In-scope vs. out-of-scope clarity, actor/role coverage |
| **L1. Ambiguity** | Vague qualifiers ("fast", "appropriate", "error message") lacking concrete criteria |
| **L2. Contradiction** | Conflicting ACs, rules, or existing system behavior |
| **L3. Silent Branches** | Missing `else`/fallback/empty/cancel/timeout paths |
| **L4. Boundary Values** | Unspecified min/max limits, zero/null, pagination, date/timezone cutoffs |
| **L5. State & Preconditions** | Required prior state, concurrent edits, idempotency, re-entry |
| **L6. Cross-Service Side Effects** | Downstream notifications, audit logs, caches, webhooks, shared tables |
| **L7. Non-Functional Gaps** | Auth/RBAC, PII/privacy, rate limits, latency, accessibility/mobile |
| **L8. Regression Surface** | Existing flows or defaults that could silently break |
| **L9. Testability** | Whether every AC has an objective, observable pass/fail oracle |

---

## Output Format

Present the review for confirmation before writing `story_review.md`:
1. **Findings Table** (blockers first): `| # | Lens | Severity | Finding | Evidence | Type | Ask / Assumption |`
2. **Open PO Questions** (business language only)
3. **Dev Risks & Story Defects** (routed to `plan` / `spec-critic`)
4. **Lens Roll-Call** (all 10 lenses L0–L9 accounted for)
