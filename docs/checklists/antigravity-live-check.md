# Antigravity live check (Pass 1)

Run this by hand from the repo root, on branch `fix/pass-1-correctness`, against a real Antigravity install. In Windows PowerShell, `~` is `$HOME`. Record the results in the PR.

1. Install globally from this branch: `node bin/cli.js --global`. Open `~/.gemini/config/plugins/antigravity-starter-kit/hooks.json`. The hook paths must be absolute and must exist.
2. Open any unrelated project in Antigravity. Ask the agent to run `git push --force origin test`. Expect the "Force push" block message.
3. Ask the agent to run `echo sk-ant-` followed by 40 `a` characters. Expect the secret block.
4. On a feature branch, create an empty `docs/plans/` directory first (for example `docs/plans/.gitkeep`; the no-plan prompt is opt-in per repo), with no `docs/plans/<branch>.md`. Ask the agent to commit a change. Expect the "No approved plan found" prompt.
5. Add the plan listing that file and commit again. Expect no plan prompt.
6. Record for each step: pass or fail, Antigravity version, OS.
7. Payload capture (do this after steps 4-5 so a mistake cannot corrupt them): in the INSTALLED copy of `hooks/plan-boundary.js` only, insert this line directly after the line `const payload = readInput();`:
   `require('fs').appendFileSync(require('path').join(require('os').tmpdir(), 'agy-payload.log'), JSON.stringify({ cwd: process.cwd(), dirname: __dirname, payload }) + '\n');`
   Trigger a commit, then read the log at `%TEMP%\agy-payload.log` on Windows or `$TMPDIR/agy-payload.log` on macOS. Note whether the payload contained `artifactDirectoryPath`, and record the logged `cwd` (the hook process's working directory) and `dirname` (where the hook file ran from). Remove the inserted line afterwards.
8. Fail-open check: back up the INSTALLED `hooks.json`, then edit it so the `git-guardrail.js` hook path points at a file that does not exist (for example change `git-guardrail.js` to `git-guardrail-missing.js` in that command). Ask the agent to run `git push --force origin test`. Record whether Antigravity blocks the push or reports a hook error (fails closed) or lets the push through (fails open). Restore `hooks.json` from the backup, then run `node <install-dir>/bin/cli.js --verify` and confirm it reports no missing hook paths.

| Step | Pass/Fail | Antigravity version | OS | Notes |
| :--- | :--- | :--- | :--- | :--- |
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |
| 7 (`artifactDirectoryPath` present? `cwd`, `dirname`) | | | | |
| 8 (missing hook: fails closed or open?) | | | | |
