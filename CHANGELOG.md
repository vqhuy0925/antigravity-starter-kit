# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.6.0] - 2026-11-19

### Fixed
- `git-guardrail`: force push is denied on any branch (`--force`, `-f`, short clusters such as `-fu`, `+refspec`); `--force-with-lease` is allowed except to `main`/`master`.
- `git-guardrail`: pushes to `main`/`master` are denied via any remote, `HEAD:main`, `--all`/`--mirror`, or a bare `git push` while on main.
- `git-guardrail`: every segment of a chained command is checked (`&&`, `||`, `;`, `|`, `&`, newline, `$(...)`, backticks), plus a second pass with quotes stripped. Common wrappers are seen through (`sudo`, `env`, `VAR=x`, `command`, `time`, `nohup`, `xargs`, `exec`, absolute paths, `git.exe`, `eval`, and `bash`/`sh`/`zsh`/`pwsh`/`powershell`/`cmd` with `-c`); behind any other prefix command (`timeout`, `nice`, `doas`, `sudo -u x`, `env -u X`, ...) the first `git`, shell or delete command is checked. `plan-boundary` sees commits behind the same prefixes.
- `git-guardrail`: root-delete guard covers `/`, `/*`, `//`, `/.`, `~`, `$HOME`, and PowerShell `Remove-Item -Recurse` of a drive root.
- `secret-scan`: also blocks `sk-ant-`, `sk-proj-`, `sk-svcacct-`, `sk-admin-` and legacy hyphen-free `sk-` keys, Google `AIza` keys, `github_pat_` tokens, and literal `Bearer <token>` values (any case). `Bearer $ENV_VAR` stays allowed, and names containing `sk-` (such as branch `feature/sk-1234-login`) are not flagged.
- `plan-boundary`: finds the plan at `docs/plans/<branch>.md`, then `implementation_plan.md`; matches files by repo-relative path (a trailing `/` covers a directory); catches `git add` in the same chain, `commit -a`, commit pathspecs, and `git -C <dir>`.
- Installers: `hooks.json` gets absolute hook paths at install, so the hooks run from any workspace. The CLI and `install.ps1` fail loudly if hook linking fails or links nothing; the shell installers only warn when Node is missing.

### Changed
- `plan-boundary` asks when no plan exists for the branch, instead of allowing the commit silently.
- `rules/AGENTS.md` section 2 is now a single approval ladder; skills and templates point to `docs/plans/<branch>.md`.
- Tests run with the built-in runner: `npm test` is `node --test`.
- Shell installers honour an `AGY_KIT_REPO` environment override for the clone URL.
- README documents that the hooks inspect `run_command` calls only.

### Added
- `bin/link-hooks.js` for Git submodule installs: `node .agents/plugins/antigravity-starter-kit/bin/link-hooks.js`.
- `docs/checklists/antigravity-live-check.md`, a manual check against a real Antigravity install.

### Migration
- Re-run the installer to get absolute hook paths in `hooks.json`. Git submodule users run `node .agents/plugins/antigravity-starter-kit/bin/link-hooks.js` once.
- Move plans to `docs/plans/<branch>.md` (each `/` in the branch name becomes `-`).
- Commits with no plan now prompt for approval instead of passing silently.
- `--force-with-lease` is now allowed on feature branches; plain force push stays denied.
