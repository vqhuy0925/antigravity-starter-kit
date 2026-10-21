<p align="center">
  <img src="assets/logo.svg" width="120" height="120" alt="Antigravity Starter Kit Logo" />
</p>

<h1 align="center">Antigravity Starter Kit 🚀</h1>

<p align="center">
  <strong>Enterprise-grade guardrails, AI-native SDLC, and workflow plugins for Antigravity & Gemini Code Assist agents.</strong>
</p>

<p align="center">
  <a href="https://github.com/vqhuy0925/antigravity-starter-kit/stargazers"><img src="https://img.shields.io/github/stars/vqhuy0925/antigravity-starter-kit?style=for-the-badge&logo=github&color=ffd700" alt="GitHub Stars" /></a>
  <a href="https://github.com/vqhuy0925/antigravity-starter-kit/network/members"><img src="https://img.shields.io/github/forks/vqhuy0925/antigravity-starter-kit?style=for-the-badge&logo=github&color=blue" alt="GitHub Forks" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="License: MIT" /></a>
  <a href="https://cloud.google.com"><img src="https://img.shields.io/badge/Antigravity-2.0%20Ready-brightgreen?style=for-the-badge&logo=google" alt="Antigravity 2.0 Ready" /></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-18%2B-green.svg?style=for-the-badge&logo=node.js" alt="Node.js 18+" /></a>
  <a href="http://makeapullrequest.com"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge" alt="PRs Welcome" /></a>
</p>

---

## 💡 Why Antigravity Starter Kit?

Autonomous AI coding agents are incredibly capable, but in real-world production repositories they frequently cause severe issues:
1. **Scope Creep & Hallucination:** Agents modify unrelated files, refactor working logic out of the blue, or delete critical dependencies.
2. **Context Token Exhaustion:** Agents dump multi-thousand-line terminal outputs and load entire codebases, bloating context and degrading intelligence.
3. **Catastrophic Commands:** Accidental `git push --force`, commits directly to `main`, or leaking private API keys directly into commit messages.
4. **Vague Requirements:** Writing hundreds of lines of code based on ambiguous PO specifications without clarifying edge cases first.

**Antigravity Starter Kit** transforms your AI agent from an erratic "code monkey" into a disciplined **Staff/Lead Software Engineer** governed by strict runtime guardrails, adversarial requirements validation, and automated TDD gates.

---

## ⚡ The Difference (Before vs. After)

| Feature | Standard AI Coding Agent ❌ | With Antigravity Starter Kit 🛡️ |
| :--- | :--- | :--- |
| **Git Safety** | May execute `git push -f` or push broken code to `main` | **Hard-blocked** by `git-guardrail.js` at runtime |
| **Secret Protection** | Can inadvertently leak API keys or AWS credentials | **Scanned & blocked** in real-time by `secret-scan.js` |
| **Scope Boundary** | Edits random files beyond original user request | **Halted** by `plan-boundary.js` if file is not in approved plan |
| **Requirements** | Makes assumptions and codes immediately | **Interrogated** by adversarial `spec-critic` subagent |
| **Quality Gate** | Code written without automated tests | **Strict TDD** ("Red Before Green") enforced by `define-tests` & `fix-bug` |
| **Context Window** | Reads entire 1,000+ line files, burning token quota | **Lean slicing** ($\le 100$ lines), silenced noisy outputs (`-q`) |

---

## 🛡️ Live Runtime Guardrails in Action

```text
# Scenario 1: Agent tries to force-push to remote branch
$ git push origin feature-auth --force
🚨 BLOCKED by Antigravity Guardrail: Force push (--force / -f) destroys remote commit history.

# Scenario 2: Agent attempts to commit a file with a hardcoded token
$ curl -H "Authorization: token ghp_39charHexToken..."
🚨 BLOCKED by Antigravity Guardrail: A raw credential or private key was detected in the command string.

# Scenario 3: Agent attempts to modify an unapproved file
$ git commit -m "fix: update db schema"
🚨 BLOCKED by Antigravity Plan-Boundary: Staged file 'src/database/migration.sql' is not declared in implementation_plan.md.
```

---

## 🏗️ The 6-Stage AI-Native SDLC Lifecycle

Antigravity Starter Kit guides both developer and agent through a systematic engineering workflow:

```mermaid
flowchart TD
    A["Stage 1: Intent<br/>(intent.md)"] --> B["Stage 2: Design<br/>(spec.md)"]
    B --> C["Adversarial Critic<br/>(spec-critic Agent)"]
    C -->|Ownership Test Passed| D["Stage 2b: Test Definition<br/>(define-tests QA Agent)"]
    D --> E["Stage 3: Plan & Task<br/>(plan.md & task.md)"]
    E --> F["Stage 4: TDD Implement<br/>(Red Before Green)"]
    F --> G["Stage 5: Review & Audit<br/>(code-reviewer Agent)"]
    G --> H["Stage 6: Deploy Gate<br/>(deploy.md Checklist)"]
```

1. **Stage 1 (Intent):** Captures high-level business goals, constraints, and success metrics.
2. **Stage 2 (Design & Spec):** Detailed architectural, API DTO contracts, and responsive UI specifications.
3. **Stage 2b (Adversarial Critique & QA):** Independent QA Agent and `spec-critic` derive test cases with **zero dev bias** across 3 layers (Database, DTO, UI).
4. **Stage 3 (Plan):** Execution order, change boundaries, risks, and proof verification plan.
5. **Stage 4 (Implement & TDD):** Incremental code changes verified by automated tests.
6. **Stage 5 (Review & Deploy):** Independent code audit against OWASP Top 10, clean architecture, and staging gate.

---

## 📦 What's Inside

```text
antigravity-starter-kit/
├── bin/
│   └── cli.js                           # Cross-platform CLI runner (npx / global)
├── plugin.json                          # Plugin declaration manifest (v1.2.0)
├── hooks.json                           # Active lifecycle hooks manifest
├── install.sh                           # One-click installer (macOS / Linux / Bash)
├── install.ps1                          # One-click installer (Windows PowerShell native)
├── assets/
│   └── logo.svg                         # Vector icon for Antigravity UI
├── hooks/                               # Programmatic Runtime Guardrails (Node.js)
│   ├── git-guardrail.js                 # Blocks force push, catastrophic deletes & main push
│   ├── plan-boundary.js                 # Enforces plan boundaries and halts scope creep
│   ├── secret-scan.js                   # Scans and blocks inline secrets & private keys
│   └── lib.js                           # Shared hook utilities
├── agents/                              # Specialized Independent Subagents
│   ├── spec-critic.md                   # Adversarial requirements lens & PO questions filter
│   └── code-reviewer.md                 # Independent diff, DTO boundary & OWASP security auditor
├── rules/
│   └── AGENTS.md                        # Core engineering standards & AI-Native SDLC rules
├── templates/                           # Standardized SDLC markdown templates
│   ├── intent_template.md               # Stage 1: Intent proto-spec
│   ├── spec_template.md                 # Stage 2: Technical & UX specification
│   ├── plan_template.md                 # Stage 3: Implementation plan
│   ├── test_cases_template.md           # Stage 3.5: Traceable test case matrix
│   ├── deploy_template.md               # Stage 5: Staging/Prod release checklist
│   ├── bug_report_template.md           # Stage 6: Incident & RCA report
│   └── project_profile_template.md      # Portable tech stack & domain glossary profile
├── skills/                              # 11 Specialized On-Demand Skills
│   ├── ai-native-sdlc/                  # 6-stage AI-Native SDLC artifact loop
│   ├── define-tests/                    # Black-box & automated test derivation
│   ├── fix-bug/                         # TDD "Red Before Green" bug remediation
│   ├── token-optimization/              # Context budgeting & lean file reading
│   ├── responsive-frontend-expert/      # Cross-device UI (Mobile 100dvh, iPad, Desktop)
│   ├── plan/                            # Implementation planning & task breakdown
│   ├── implement/                       # Structured task execution
│   ├── review-code/                     # Clean code & security audit
│   ├── commit-code/                     # Conventional commit generator & splitter
│   ├── backend-development/             # REST API, DTOs & transactional standards
│   └── smart-researcher/                # Token-lean codebase research
└── test/
    └── verify-hooks.test.js             # Automated test suite for safety guardrails
```

---

## ⚡ Quick Installation

### Method 1: Instant NPX (Recommended for Node.js developers)
Install globally in one command without cloning manually:
```bash
npx antigravity-starter-kit --global
```
Or install only into the current repository:
```bash
npx antigravity-starter-kit --local
```

---

### Method 2: Global One-Line Installer (All Operating Systems)
Installs once on your machine. All current and future Antigravity / Gemini projects automatically inherit all skills, rules, hooks, and agents:

**Windows PowerShell (Native):**
```powershell
& ([scriptblock]::Create((Invoke-RestMethod "https://raw.githubusercontent.com/vqhuy0925/antigravity-starter-kit/main/install.ps1"))) -Global
```

**macOS / Linux / Git Bash:**
```bash
curl -fsSL https://raw.githubusercontent.com/vqhuy0925/antigravity-starter-kit/main/install.sh | bash -s -- --global
```

---

### Method 3: Project-Level Installation (For Teams & Git Submodules)

**Windows PowerShell:**
```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1 -Local
```

**macOS / Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/vqhuy0925/antigravity-starter-kit/main/install.sh | bash
```

**Git Submodule (Preserve in repo):**
```bash
mkdir -p .agents/plugins
git submodule add https://github.com/vqhuy0925/antigravity-starter-kit.git .agents/plugins/antigravity-starter-kit
```

---

## 🎯 Command & Skill Reference

| Command / Skill | When to Use | Output / Action |
| :--- | :--- | :--- |
| `ai-native-sdlc` | Starting any non-trivial feature | Orchestrates the full 6-stage artifact loop |
| `/plan` | Before writing code | Analyzes dependencies and produces `implementation_plan.md` |
| `/define-tests` | Before writing implementation | Generates black-box & automated test matrices (`test_cases.md`) |
| `/fix-bug` | Investigating & fixing defects | Enforces "Red Before Green" reproduction test first |
| `/implement` | Executing an approved plan | Incremental code modification checked against `task.md` |
| `/review-code` | Before committing / submitting PR | Audits code against OWASP, clean architecture, and test suites |
| `/commit-code` | Ready to commit | Groups changes by domain and formats Conventional Commits |
| `token-optimization` | Always active | Enforces $\le 100$-line reads and suppresses noisy CLI outputs |
| `responsive-frontend-expert` | Frontend UI work | Enforces 3-zone mobile dialogs (`100dvh`) and 44px touch targets |
| `backend-development` | Backend API work | Enforces DTO boundaries and parameterized ORM queries |
| `smart-researcher` | Exploring large codebases | Researches in isolated subagents without polluting main chat |

---

## 🧪 Self-Verification & Testing

You can verify that all guardrails and security hooks are active and functioning properly with:

```bash
npm test
# or
node test/verify-hooks.test.js
```

Output:
```text
🧪 Starting Antigravity Safety Guardrails Test Suite...

--- [1] Testing git-guardrail.js ---
  ✅ PASS: Blocks git push --force
  ✅ PASS: Blocks git push -f
  ✅ PASS: Blocks direct push to origin main
  ✅ PASS: Prompts on git reset --hard
  ✅ PASS: Blocks catastrophic root deletion rm -rf /
  ✅ PASS: Allows safe git commands like git status or git add

--- [2] Testing secret-scan.js ---
  ✅ PASS: Blocks GitHub personal access token (ghp_)
  ✅ PASS: Blocks raw RSA Private Key
  ✅ PASS: Allows normal safe command strings

========================================
Test Results: 9/9 passed (100%)
========================================
```

---

## 🤝 Contributing & Community

Contributions are welcomed! Feel free to:
- Submit new **Hooks** (e.g. database migration guards, lint enforcement).
- Add new **Skills** (e.g. GraphQL standards, Kubernetes manifests).
- Refine existing prompt templates and subagent definitions.

```bash
git clone https://github.com/vqhuy0925/antigravity-starter-kit.git
cd antigravity-starter-kit
npm test
```

---

## 📄 License

Distributed under the [MIT License](LICENSE). Built with ❤️ for the global Google Antigravity & AI Agent Engineering community.
