# Project Profile: [Project Name]

This profile captures core technology stack commands, domain terminology, and architectural boundaries for the project. AI agents read this file first to adapt dynamically without hardcoding assumptions.

---

## 1. Stack & Runtime Inventory
- **Language / Runtime:** [e.g. Node.js 20 LTS / Java 21 / Python 3.11 / .NET 8]
- **Frontend Framework:** [e.g. Vue 3 (Vite) / React 18 / Angular 17]
- **Backend Framework:** [e.g. Spring Boot 3 / NestJS / Express / FastAPI]
- **Database & ORM:** [e.g. PostgreSQL 16 / Hibernate JPA / Prisma / TypeORM]

---

## 2. Standard Verification Commands
Agents use these exact commands for testing, linting, and building:
- **Run Unit Tests:** `npm test -- --silent` or `./gradlew test -q`
- **Run Integration Tests:** `npm run test:e2e` or `./gradlew integrationTest -q`
- **Run Linter:** `npm run lint` or `./gradlew check`
- **Run Typecheck:** `npx tsc --noEmit` or `npx vue-tsc --noEmit`
- **Local Dev Server:** `npm run dev`

---

## 3. Domain Glossary & Naming Traps
Crucial business domain terminology. AI agents must use these exact terms:
| Term | Exact Meaning | Common Pitfall / Trap |
| :--- | :--- | :--- |
| `[Term 1]` | [Definition] | [What it is NOT] |
| `[Term 2]` | [Definition] | [What it is NOT] |

---

## 4. Auth & Permission Boundaries
- **Authentication Mechanism:** [e.g. JWT in Authorization Bearer / HttpOnly Cookie / Session]
- **Enforced Roles:**
  - `ADMIN`: Full access to configuration, user management, and system logs.
  - `STAFF` / `USER`: Standard access to assigned tenant/patient data.

---

## 5. Side-Effect Surfaces (External Impacts)
Operations that trigger irreversible external actions:
- **Email Dispatch:** [Service / template location]
- **External Webhooks / Notifications:** [List surfaces]
- **Export / Reporting Jobs:** [Scheduled cron or batch tasks]
