---
name: token-optimization
description: Enforce strict token conservation rules, context budgeting, lean file reading, and efficient tool execution for AI Agent interactions.
---

# Token Optimization & Context Budgeting Guidelines

## 1. File Inspection & Search Economy
- **Never dump whole directories**: Never run recursive directory listings on build outputs (`target/`, `build/`, `node_modules/`, `dist/`).
- **Targeted Line Ranges**: Search with `rg` or `grep` through `run_command` to pinpoint matching line numbers first, then use `read_file` with `StartLine` and `EndLine`. Read the range you need; avoid whole large or generated files.
- **Exclude Generated/Binary Assets**: Never read minified scripts, binary jars, compiled classes, large JSON mock files (>50KB), or lock files without specific line constraints.

## 2. Command Execution & Output Suppression
- **Build with Silent/Quiet Flags**:
  - Run the project's build and test commands (from `docs/project_profile.md`; see `rules/AGENTS.md` if there is no profile) with the tool's quiet flag, such as `-q` or `--silent`, to suppress noisy standard output.
  - If the tool has no quiet flag, pipe output through a filter that keeps only error messages.
- **Limit Output Buffering**: Avoid running commands that dump large outputs directly into the context window.

## 3. Subagent Lifecycle & Delegation
- **Isolate Exploratory Work**: Delegate broad codebase exploration to the built-in `research` subagent (`invoke_subagent` with `TypeName: 'research'`, a `Role` and a `Prompt`) so its step-by-step reading history does not pollute the primary context window. Tell it to use targeted filename and regex searches, and to start from entrypoints, data contracts (DTOs/interfaces) and state managers.
- **Summary Format**: Ask it to return a concise bulleted summary, never raw files:
  - **Key Files & Exact Line Numbers**
  - **Data Flow / Call Hierarchy**
  - **Root Causes** (identified bottlenecks or causes)
- **Immediate Termination**: Execute `manage_subagents` with `Action: 'kill'` and the subagent's `ConversationIds` immediately after receiving the summary.

## 4. Prompt & Communication Conciseness
- Provide direct, code-centric, and structured diffs or explanations.
- Avoid repeating entire unchanged files or re-summarizing generated artifacts.
- When working on large refactors, split changes logically into concise iterative steps.
