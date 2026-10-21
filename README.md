# Antigravity Starter Kit 🚀

An enterprise-grade template and plugin toolkit for Antigravity AI agents (Gemini Code Assist / AI Agents). Pre-configured with independent QA testing, token economy, cross-device responsive UI/UX standards, black-box & automated test case definition, programmatic lifecycle guardrails, adversarial requirements interrogation, clean code review automation, and conventional git commit conventions.

---

## 📦 What's Inside

```text
antigravity-starter-kit/
├── plugin.json                          # Plugin declaration manifest (v1.2.0)
├── hooks.json                           # Lifecycle Hooks manifest
├── install.sh                           # One-click installer (macOS / Linux)
├── install.ps1                          # One-click installer (Windows PowerShell native)
├── assets/
│   └── logo.svg                         # Vector icon for Antigravity UI
├── hooks/                               # Programmatic Guardrails (Node.js)
│   ├── git-guardrail.js                 # Blocks force push, catastrophic deletes, direct main push
│   ├── plan-boundary.js                 # Enforces plan boundaries and halts scope creep
│   ├── secret-scan.js                   # Scans and blocks inline secrets and private keys
│   └── lib.js                           # Shared hook utilities
├── agents/                              # Specialized Subagents
│   ├── spec-critic.md                   # Adversarial requirements lens & PO questions filter
│   └── code-reviewer.md                 # Independent diff, DTO boundary & OWASP security auditor
├── rules/
│   └── AGENTS.md                        # Core engineering standards, QA independence & AI-Native SDLC rules
├── templates/                           # Standardized SDLC stage markdown templates
│   ├── intent_template.md               # Stage 1 (Plan): Intent proto-spec
│   ├── spec_template.md                 # Stage 2 (Design): Technical & UX specification
│   ├── test_cases_template.md           # Stage 2b (QA): Independent test specification & 3-layer matrix
│   ├── plan_template.md                 # Stage 3 (Build): Implementation plan
│   ├── deploy_template.md               # Stage 5 (Deploy Gate): Staging/Prod release checklist
│   ├── bug_report_template.md           # Stage 6 (Maintain): Incident & RCA report
│   └── project_profile_template.md      # Portable tech stack & domain glossary profile
├── skills/                              # Specialized on-demand workflows
│   ├── ai-native-sdlc/SKILL.md          # AI-Native SDLC artifact loop with QA Gate
│   ├── define-tests/SKILL.md            # Independent QA Agent acceptance & boundary test definition
│   ├── fix-bug/SKILL.md                 # TDD "Red Before Green" bug remediation
│   ├── token-optimization/SKILL.md      # Token economy & context budgeting
│   ├── responsive-frontend-expert/SKILL.md # Cross-device UI (Mobile, iPad, Desktop)
│   ├── plan/SKILL.md                    # Implementation planning & task breakdown
│   ├── implement/SKILL.md               # Structured task execution cross-checked with QA tests
│   ├── review-code/SKILL.md             # Code audit & QA test matrix cross-verification
│   ├── commit-code/SKILL.md             # Conventional commit splitter & generator
│   ├── backend-development/SKILL.md     # REST API, DTOs & transactional standards
│   └── smart-researcher/SKILL.md        # Token-lean codebase research
└── mcp_config.json                      # MCP Server integration template
```

---

## 🛡️ Independent QA Agent & Zero-Dev-Bias

Developers writing their own test cases suffer from **confirmation bias**—they test against the implementation assumptions rather than against actual requirements, often missing presentation traps (e.g. database column defaults overriding calculated values in calendar/matrix views).

Antigravity Starter Kit introduces an **Independent QA Subagent Pattern**:
1. **Isolated Execution:** QA runs as a dedicated subagent (`invoke_subagent` with `Role: 'QA Engineer'` executing `define-tests`) with a clean context, evaluating purely `intent.md` / `spec.md` or the ticket report without seeing dev implementation hacks.
2. **The 3-Layer Rule:** QA defines test assertions across 3 layers:
   - **Data / Entity Layer:** Database row values, foreign keys, and default columns.
   - **API / Service Layer:** Response DTOs, calculated ratios, penalty waivers, and audit comments.
   - **UI / Presentation Layer:** Calendar matrix, table cells, display codes, and badges.
3. **Dual Verification Gate:**
   - **Dev (`implement`):** Guides code and automated test construction to satisfy every `TC-xx` scenario in `test_cases.md`.
   - **Reviewer (`review-code`):** Strictly audits test results against `test_cases.md` before approval.

---

## ⚡ Quick Installation

### Option 1: Global Installation (Recommended)
Installs once on your machine. All current and future projects automatically inherit all skills, commands, and rules:

**macOS / Linux / Git Bash:**
```bash
curl -fsSL https://raw.githubusercontent.com/vqhuy0925/antigravity-starter-kit/main/install.sh | bash -s -- --global
```

**Windows PowerShell (Native):**
```powershell
& ([scriptblock]::Create((Invoke-RestMethod "https://raw.githubusercontent.com/vqhuy0925/antigravity-starter-kit/main/install.ps1"))) -Global
```

Or via direct git clone on Windows PowerShell:
```powershell
git clone https://github.com/vqhuy0925/antigravity-starter-kit.git "$HOME\.gemini\config\plugins\antigravity-starter-kit"
```

---

### Option 2: Project-Level Installation (For Teams)
Install into a specific project repository and commit it to version control:

**macOS / Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/vqhuy0925/antigravity-starter-kit/main/install.sh | bash
```

**Windows PowerShell:**
```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1 -Local
```

Or add as a Git Submodule:
```bash
mkdir -p .agents/plugins
git submodule add https://github.com/vqhuy0925/antigravity-starter-kit.git .agents/plugins/antigravity-starter-kit
```

---

## 🎯 Included Skills & Commands

| Command / Skill | Description |
| :--- | :--- |
| `ai-native-sdlc` | Encodes the AI-Native SDLC artifact loop (`intent.md` $\rightarrow$ `spec.md` $\rightarrow$ `test_cases.md` $\rightarrow$ `plan.md` $\rightarrow$ code $\rightarrow$ PR gate $\rightarrow$ maintain). |
| `/define-tests` | Independent QA Engineer workflow deriving acceptance criteria, boundary tests, and 3-layer verification matrices (`test_cases.md`). |
| `/plan` | Analyzes requirements, checks dependencies, and generates `implementation_plan.md` and `task.md`. |
| `/fix-bug` | Enforces TDD "Red Before Green" — reproduces the defect as a failing automated test before modifying any production code. |
| `/implement` | Executes implementation step-by-step according to the approved plan, cross-checked against QA test cases. |
| `/review-code` | Runs tests, linters, audits security, and cross-checks implementation against QA `test_cases.md`. |
| `/commit-code` | Splits uncommitted changes by domain scope and produces Conventional Commits. |
| `token-optimization` | Restricts file reading slices ($\le 100$ lines), suppresses noisy terminal output (`-q`), and manages subagent lifecycles. |
| `responsive-frontend-expert` | Enforces 3-zone mobile dialogs (`100dvh`), safe-area insets, adaptive tables/cards, and 44px touch targets. |
| `backend-development` | Enforces layered architecture (Controller -> Service -> Repo -> DTOs) and parameterized SQL safety. |
| `smart-researcher` | Investigates codebases via isolated subagents without polluting primary chat context. |

---

## 🛡️ Programmatic Guardrails (Hooks)

The starter kit ships with active `PreToolUse` hooks configured in `hooks.json`:
- **`git-guardrail`**: Hard-blocks `git push --force`, direct pushes to `main`/`master`, and catastrophic `rm -rf /` commands.
- **`plan-boundary`**: Halts commits containing files not listed in the approved `implementation_plan.md` Changes list to prevent silent scope creep.
- **`secret-scan`**: Automatically scans command arguments for raw private keys, GitHub tokens, AWS credentials, and Slack keys.

---

## 🤖 Specialized Subagents

- **`agents/spec-critic.md`**: Interrogates specifications for mathematical ambiguities, undefined terms, and unwritten edge cases. Filters questions using the **Ownership Test** (max 5 blocking questions).
- **`agents/code-reviewer.md`**: Audits staged diffs against OWASP Top 10, DTO boundaries, and mobile frontend standards.

---

## 🛠️ Customization & Extensions

To add project-specific skills:
1. Create a new folder under `skills/<your-skill-name>/`.
2. Add a `SKILL.md` file with standard YAML frontmatter:
   ```yaml
   ---
   name: your-skill-name
   description: When and how the agent should use this skill.
   ---

   # Instructions here...
   ```
3. Push changes to your repository to share across all projects.
