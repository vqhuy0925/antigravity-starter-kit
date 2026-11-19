# Antigravity live check (Pass 1)

Run this by hand against a real Antigravity install. Record the results in the PR.

1. Install globally from this branch: `node bin/cli.js --global`. Open `~/.gemini/config/plugins/antigravity-starter-kit/hooks.json`. The hook paths must be absolute and must exist.
2. Open any unrelated project in Antigravity. Ask the agent to run `git push --force origin test`. Expect the "Force push" block message.
3. Ask the agent to run `echo sk-ant-` followed by 40 `a` characters. Expect the secret block.
4. On a feature branch with no `docs/plans/<branch>.md`, ask the agent to commit a change. Expect the "No approved plan found" prompt.
5. Add the plan listing that file and commit again. Expect no plan prompt.
6. Record for each step: pass or fail, Antigravity version, OS. Also note whether the hook payload contained `artifactDirectoryPath`. To see it, temporarily add `fs.appendFileSync(os.tmpdir()+'/agy-payload.log', JSON.stringify(payload)+'\n')` to `plan-boundary.js` in the installed copy, then remove it.

| Step | Pass/Fail | Antigravity version | OS | Notes |
| :--- | :--- | :--- | :--- | :--- |
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |
| 6 (`artifactDirectoryPath` present?) | | | | |
