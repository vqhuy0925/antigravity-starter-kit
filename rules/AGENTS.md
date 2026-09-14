# Global Agent Guidelines & Engineering Standards

## 1. DEVELOPMENT WORKFLOW LIFECYCLE
- **Plan Phase**:
  - Always research the codebase using grep and targeted view tools before writing code.
  - Create or update `implementation_plan.md` and `task.md` under the conversation artifacts directory and seek user confirmation on breaking decisions.
- **Implement Phase**:
  - Follow approved plans incrementally.
  - Update `task.md` with progress (`[/]` for in-progress, `[x]` for completed).
  - Verify syntax and run lightweight compilation commands frequently.
- **Review & Verification Phase**:
  - Run linters, unit tests, and type checks before finishing.
  - Produce a `walkthrough.md` artifact summarizing changes and test evidence.
- **Commit Phase**:
  - Split unrelated changes into logical, conventional commits.
  - Never push or deploy without explicit user request.

## 2. TOKEN OPTIMIZATION & CONTEXT MANAGEMENT
- **Lean File Reading**: Never dump whole directories or load massive files completely. Use `grep_search` to pinpoint line numbers and read specific line ranges (`StartLine` - `EndLine` <= 100 lines).
- **Quiet Terminal Output**: Always append quiet/silent flags (`-q`, `--silent`) to avoid dumping thousands of build lines into the context.
- **Subagent Lifecycle**: Delegate heavy exploration tasks to `research` subagents and terminate them (`manage_subagents` with `Action='kill'`) immediately when finished.

## 3. CODE QUALITY & ARCHITECTURAL SAFETY
- **Layered Architecture**: Controller -> Service -> Repository -> Entity/Data Model.
- **Data Transfer Objects (DTOs)**: Always use DTOs for external API contracts. Never expose database entities directly.
- **Security & Secret Sanitization**:
  - Never hardcode credentials, keys, or tokens in source code. Use environment variables.
  - Always use parameterized queries (ORM/JPA) to prevent SQL injection.
  - Sanitize all user-controlled inputs against XSS.
- **Error Handling**: Never swallow exceptions silently. Log contextually and return standardized error responses.

## 4. RESPONSIVE FRONTEND & TOUCH ERGONOMICS
- **Viewport Standards**: Optimize for Desktop (>= 1440px), Laptop/iPad Pro (1024px-1439px), iPad/Tablet (600px-1023px), and Mobile (< 600px).
- **Mobile Dialogs (3-Zone Flexbox)**: Always use `height: 100dvh` / `max-height: 100dvh`, Header (`shrink-0`), Body (`col scroll min-h-0`), Footer (`shrink-0` with safe-area padding).
- **Touch Targets**: Minimum 44x44px clickable area for touch accessibility.
