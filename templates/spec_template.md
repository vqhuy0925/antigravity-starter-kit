# Specification: [Title of Feature / Module]

**Source Intent:** [Link to intent.md or Issue ID]  
**Lead / Author:** [Name / Role]  
**Status:** [Draft | Under Review | Approved]  
**Last Updated:** YYYY-MM-DD  

---

## 1. Functional Requirements & User Stories
<!-- Detail user flows, edge cases, preconditions, and postconditions. -->
- **As a [Role]**, I want to [Action], so that [Benefit].
- **Edge Cases & Validations:**
  - Case 1: ...
  - Case 2: ...

## 2. UI/UX Design & Component Specifications (Frontend)
<!-- Layout, states, responsiveness, and touch ergonomics -->
- **Route / Component Path:** ...
- **Layout Paradigm:** 3-Zone Flexbox (Header shrink-0, Body scroll, Footer pinned with safe-area padding).
- **Accessibility & Touch:** Minimum 44x44px clickable touch targets, WCAG AA contrast.

## 3. Backend Architecture & Data Contracts (Backend)
<!-- REST contracts, DTOs, database entities, transactions -->
- **Endpoints & API Contracts:**
  - `METHOD /api/v1/...` -> Request DTO -> Response DTO
- **Data Models & Schema:**
  - Entities affected, relations, indexes, migrations.

## 4. Flagged Concerns & Policy Conflicts
<!-- AI explicitly flags any potential contradictions with existing architecture, security, or domain rules. -->
- [ ] Concern 1: ...
