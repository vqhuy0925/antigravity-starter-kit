---
name: token-optimization
description: Enforce strict token conservation rules, context budgeting, lean file reading, and efficient tool execution for AI Agent interactions.
---

# Token Optimization & Context Budgeting Guidelines

## 1. File Inspection & Search Economy
- **Never dump whole directories**: Never run recursive directory listings on build outputs (`target/`, `build/`, `node_modules/`, `dist/`).
- **Targeted Line Ranges**: Always use `grep_search` to pinpoint matching line numbers first, then view file slices using `StartLine` and `EndLine` (range <= 100 lines).
- **Exclude Generated/Binary Assets**: Never view minified scripts, binary jars, compiled classes, large JSON mock files (>50KB), or lock files without specific line constraints.

## 2. Command Execution & Output Suppression
- **Build with Silent/Quiet Flags**:
  - Gradle: Always use `./gradlew compileJava -q` or `./gradlew test -q` to suppress noisy standard output.
  - NPM / Vite: Always use `--silent` or pipe output to filter error messages.
- **Limit Output Buffering**: Avoid running commands that dump large outputs directly into the context window.

## 3. Subagent Lifecycle & Delegation
- **Isolate Exploratory Work**: Delegate broad codebase exploration to `research` subagents so their step-by-step reading history does not pollute the primary context window.
- **Immediate Termination**: Always execute `manage_subagents` with `Action='kill'` immediately after receiving the required summary.

## 4. Prompt & Communication Conciseness
- Provide direct, code-centric, and structured diffs or explanations.
- Avoid repeating entire unchanged files or re-summarizing generated artifacts.
- When working on large refactors, split changes logically into concise iterative steps.
