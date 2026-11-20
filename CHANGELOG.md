# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.6.0] - 2026-11-19

### Fixed
- `git-guardrail`: force push is denied on any branch (`--force`, `-f`, short clusters such as `-fu`, `+refspec`); `--force-with-lease` is allowed except to `main`/`master`.
- `git-guardrail`: pushes to `main`/`master` are denied via any remote, `HEAD:main`, `--all`/`--mirror`, or a bare `git push` (or `HEAD` / `@` as the refspec) while on main.
- `git-guardrail`: every segment of a chained command is checked (`&&`, `||`, `;`, `|`, `&`, newline, `$(...)`, backticks), plus a second pass with quotes stripped. Common wrappers are seen through (`sudo`, `env`, `VAR=x`, `command`, `time`, `nohup`, `xargs`, `exec`, absolute paths, `git.exe`, `eval`, and `bash`/`sh`/`zsh`/`pwsh`/`powershell`/`cmd` with `-c`), including wrapper options that take a value (`sudo -u git`, `env -u X`, `xargs -n 1`); behind any other prefix command (`timeout`, `nice`, `doas`, ...) the first `git`, shell or delete command is checked. `plan-boundary` sees commits behind the same prefixes.
- `git-guardrail`: root-delete guard covers recursive `rm`, `Remove-Item`/`ri`, `rd`/`rmdir` and `del`/`erase` of `/`, `/*`, `//`, `/.`, `~`, `$HOME`, `$env:USERPROFILE`, and a drive root (`C:\`, `C:\*`).- `secret-scan`: also blocks `sk-ant-`, `sk-proj-`, `sk-svcacct-`, `sk-admin-` and legacy hyphen-free `sk-` keys, Google `AIza` keys, `github_pat_` tokens, and literal `Bearer <token>` values (any case). `Bearer $ENV_VAR` stays allowed, and names containing `sk-` (such as branch `feature/sk-1234-login`) are not flagged.
- `plan-boundary`: finds the plan at `docs/plans/<branch>.md`, then `implementation_plan.md`; matches files by repo-relative path (a trailing `/` covers a directory); catches `git add` in the same chain (`git add <paths>` checks those paths; `-A`, `-u`, `.`, `:/`, a `git add` with no written-out paths such as `xargs git add`, computed paths such as `$FILES` or `$(...)`, and paths added in a different directory from the commit check the whole worktree), `commit -a`, commit pathspecs, and `git -C <dir>`.
- Hook prompts use Antigravity's `force_ask` decision instead of `ask`. Antigravity's `ask` "respects 'Always Allow' settings", so with terminal commands set to run without review, the no-plan, scope-creep and `git reset --hard` prompts were approved silently. `force_ask` always prompts.
- `git-guardrail` and `plan-boundary` follow literal `cd` / `Set-Location` / `pushd` earlier in the command and `git -C`, so they check the right repo when the workspace is a parent folder of it (Antigravity passes the workspace folder as the working directory). Before, `cd repo; git commit` from a parent folder skipped the plan check, and `cd repo; git push` on `main` was not denied.
- Installers: `hooks.json` gets absolute hook paths at install, so the hooks run from any workspace. Each hook command names the Node executable by absolute path too, so hooks run even when the hook runner has no `node` on `PATH`. The CLI and `install.ps1` fail loudly if hook linking fails or links nothing; the shell installers only warn when Node is missing.
- `--global` / `--local` from a working copy no longer copy `.git`, `node_modules`, `.superpowers`, `.agents` or `.worktrees`. Copying `.git` failed with `EPERM` over an earlier git-clone install and left `hooks.json` unlinked.

### Changed
- `plan-boundary` asks when no plan exists for the branch, instead of allowing the commit silently, in repos that opt in by having a `docs/plans/` directory at the repo root. Repos without it are not prompted, so a global install does not prompt on every commit machine-wide.
- `rules/AGENTS.md` section 2 is now a single approval ladder; skills and templates point to `docs/plans/<branch>.md`.
- Tests run with the built-in runner: `npm test` is `node --test`.
- Shell installers honour an `AGY_KIT_REPO` environment override for the clone URL.
- README documents that the hooks inspect `run_command` calls only.

### Added
- `bin/link-hooks.js` for Git submodule installs: `node .agents/plugins/antigravity-starter-kit/bin/link-hooks.js`.
- `docs/checklists/antigravity-live-check.md`, a manual check against a real Antigravity install.

### Migration
- Re-run the installer to get absolute hook paths in `hooks.json`. Git submodule and committed local installs: every developer must run `node <install-dir>/bin/link-hooks.js` (for example `node .agents/plugins/antigravity-starter-kit/bin/link-hooks.js`) after each clone, pull, submodule update or move of the install folder.
- A committed `hooks.json` with absolute paths will not work on other machines: the hook files it names do not exist there. Add the link step to your project's own workflow (a `postinstall` script or a setup note). `bin/cli.js --verify` now warns, prints the fix command and exits 1 when a hook path or the Node executable in `hooks.json` does not exist.
- `hooks.json` names the Node executable that ran the installer. After moving or upgrading Node to a different path (for example switching versions with nvm), re-run the installer or `link-hooks.js`.
- Move plans to `docs/plans/<branch>.md` (each `/` in the branch name becomes `-`).
- Commits with no plan now prompt for approval instead of passing silently, but only in repos that have a `docs/plans/` directory. Create `docs/plans/` (for example with a `.gitkeep`) to opt a repo in.
- `--force-with-lease` is now allowed on feature branches; plain force push stays denied.
- `rmdir /s` / `rd /s` of a folder below a drive root is no longer denied (1.5.0 denied every such path on `C:`, including `C:\work\build`). This also allows `rmdir /s C:\Users\<you>`; only a drive root such as `C:\` is denied.
- Updating an existing install (re-running the CLI, `install.sh` or `install.ps1` over a git clone) runs `git checkout -- hooks.json` before pulling, which discards any custom hooks your team added to the installed `hooks.json`. Back them up before updating and add them back afterwards.
