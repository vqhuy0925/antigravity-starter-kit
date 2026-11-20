# Antigravity Skills & Tools Live Check (Pass 3)

Settles the tool names and skill behaviour that the kit's rules and skills name. Run it in a real Antigravity install with the kit installed. It takes about 5 minutes.

Already settled by the official docs (no live check needed):
- SKILL.md frontmatter supports `name` and `description` only. `disable-model-invocation` is not a documented field. Source: https://antigravity.google/docs/skills.md
- Skills fire automatically by description, or by `/<name>`. There is no "Skill" tool, and skill chaining and aliases are not documented. Source: https://antigravity.google/docs/skills
- Subagents are spawned with `invoke_subagent` and stopped from the UI ("Stop Subagent") or by the parent agent. `manage_subagents` is not documented. Source: https://antigravity.google/docs/subagents

## Steps

1. Open any workspace and paste this prompt to the agent:

   > Without running anything, list the exact names of the tools you can call right now, and for these give the exact parameter names: the tool that reads a file (and how to read a line range), the tool that searches file contents, the tool that runs a shell command (is there a sandbox-bypass parameter?), the tool that spawns a subagent (is there a role parameter?), and any tool that stops or manages a subagent. Answer as a table: tool, parameters, one-line purpose. Do not guess: say "none" when you have no such tool.

2. Type `/wait-what` (a skill whose frontmatter has `disable-model-invocation: true`). Record whether the skill appears in the `/` menu and runs.
3. In a new conversation, ask: "Explain this repo's directory layout, then stress-test my plan to add a cache." Record whether the agent loads the `grilling` skill on its own.
4. Record the Antigravity version and OS, and paste the step 1 table and the results of steps 2–3 into the Pass 3 PR.

## Results (2026-11-20)

1. Tool table (live listing):
   - `read_file`: `Path`, `StartLine`, `EndLine`.
   - `run_command`: `CommandLine`, `BypassSandbox`, and others.
   - `invoke_subagent`: `TypeName`, `Role`, `Prompt`, `Model`, `Workspace`.
   - `manage_subagents`: `Action` (`list`, `kill`, `kill_all`), `ConversationIds`.
   - No `view_file` and no `grep_search`: content search goes through `run_command` (`rg`/`grep`).
2. `/wait-what` appeared in the `/` menu and ran (it read its SKILL.md and followed it) although its frontmatter had `disable-model-invocation: true`. The field has no effect.
3. Not run.
