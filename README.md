# Antigravity Starter Kit 🚀

An enterprise-grade template and plugin toolkit for Antigravity AI agents (Gemini Code Assist / AI Agents). Pre-configured with token optimization, cross-device responsive UI/UX standards, structured planning workflows, clean code review automation, and conventional git commit conventions.

---

## 📦 What's Inside

```text
antigravity-starter-kit/
├── plugin.json                          # Plugin declaration manifest
├── install.sh                           # One-click installer (Global & Local)
├── rules/
│   └── AGENTS.md                        # Core engineering standards & AI-Native SDLC rules
├── templates/                           # Standardized SDLC stage markdown templates
│   ├── intent_template.md               # Stage 1 (Plan): Intent proto-spec
│   ├── spec_template.md                 # Stage 2 (Design): Technical & UX specification
│   ├── plan_template.md                 # Stage 3 (Build): Implementation plan
│   └── bug_report_template.md           # Stage 6 (Maintain): Incident & RCA report
├── skills/                              # Specialized on-demand workflows
│   ├── ai-native-sdlc/SKILL.md          # 6-stage AI-Native SDLC artifact loop
│   ├── token-optimization/SKILL.md      # Token economy & context budgeting
│   ├── responsive-frontend-expert/SKILL.md # Cross-device UI (Mobile, iPad, Desktop)
│   ├── plan/SKILL.md                    # Implementation planning & task breakdown
│   ├── implement/SKILL.md               # Structured task execution
│   ├── review-code/SKILL.md             # Clean code & security audit
│   ├── commit-code/SKILL.md             # Conventional commit splitter & generator
│   ├── backend-development/SKILL.md     # REST API, DTOs & transactional standards
│   └── smart-researcher/SKILL.md        # Token-lean codebase research
└── mcp_config.json                      # MCP Server integration template
```

---

## ⚡ Quick Installation

### Option 1: Global Installation (Recommended)
Installs once on your machine. All current and future projects automatically inherit all skills, commands, and rules:

```bash
curl -fsSL https://raw.githubusercontent.com/vqhuy0925/antigravity-starter-kit/main/install.sh | bash -s -- --global
```

Or via direct git clone:
```bash
git clone https://github.com/vqhuy0925/antigravity-starter-kit.git ~/.gemini/config/plugins/antigravity-starter-kit
```

---

### Option 2: Project-Level Installation (For Teams)
Install into a specific project repository and commit it to version control:

```bash
# Inside your project root directory:
curl -fsSL https://raw.githubusercontent.com/vqhuy0925/antigravity-starter-kit/main/install.sh | bash
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
| `ai-native-sdlc` | Encodes the 6-stage artifact loop (`intent.md` $\rightarrow$ `spec.md` $\rightarrow$ `plan.md` $\rightarrow$ code $\rightarrow$ PR gate $\rightarrow$ maintain). |
| `/plan` | Analyzes requirements, checks dependencies, and generates `implementation_plan.md` and `task.md`. |
| `/implement` | Executes implementation step-by-step according to the approved plan. |
| `/review-code` | Runs tests, linters, type checks, and performs automated security and clean code checks. |
| `/commit-code` | Splits uncommitted changes by domain scope and produces Conventional Commits. |
| `token-optimization` | Automatically restricts file reading, suppresses noisy terminal output, and optimizes context windows. |
| `responsive-frontend-expert` | Enforces 3-zone mobile dialogs, safe-area insets, adaptive tables/cards, and 44px touch targets. |
| `backend-development` | Enforces layered architecture (Controller -> Service -> Repo -> DTOs) and parameterized SQL safety. |
| `smart-researcher` | Investigates codebases via isolated subagents without polluting primary chat context. |

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
