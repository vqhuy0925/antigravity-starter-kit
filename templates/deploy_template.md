# Deployment Gate: [Release Version / Feature Title]

**Target Environment:** [Staging | Production]  
**Release Author / Lead:** [Name / Role]  
**Deployment Date:** YYYY-MM-DD  
**Status:** [Pending Approval | Approved | Deployed | Rolled Back]  

---

## 1. Pre-Deployment Checklist
- [ ] All automated tests pass (`test_cases.md` fully verified).
- [ ] Database schema migrations tested and verified backward-compatible.
- [ ] New environment variables or secrets provisioned in target environment.
- [ ] No breaking changes in public REST / API contracts without deprecation warnings.
- [ ] Security audit approved by `code-reviewer` agent.

---

## 2. Deployment Artifacts & Steps
1. **Database Migration:**
   - Command: `npm run migrate` or `./gradlew flywayMigrate`
2. **Deploy Application Container:**
   - Image tag: `registry.example.com/app:v1.2.0`
3. **Cache / CDN Invalidation:**
   - Invalidate static assets cache if UI changed.

---

## 3. Post-Deployment Verification (Smoke Tests)
- [ ] Healthcheck endpoint returns HTTP 200: `GET /health`
- [ ] Core authentication & login flow operates normally.
- [ ] Key regression tests from `test_cases.md` executed in staging.

---

## 4. Rollback Plan (If Critical Failure Occurs)
1. **Rollback Container Image:** Re-deploy previous stable tag `v1.1.9`.
2. **Database Rollback:** Execute down migration script: `npm run migrate:down`.
3. **Incident Notice:** Notify team and create `bug_report.md` for post-mortem analysis.
