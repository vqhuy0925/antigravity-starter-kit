'use strict';

const { spawnSync, execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

/** Run a hook script with a payload on stdin; returns the parsed decision. */
function runHook(hookFile, payload) {
  const hookPath = path.join(__dirname, '..', 'hooks', hookFile);
  const res = spawnSync(process.execPath, [hookPath], {
    input: JSON.stringify(payload),
    encoding: 'utf8'
  });
  if (res.error) throw res.error;
  try {
    return JSON.parse(res.stdout);
  } catch (err) {
    throw new Error(`Failed to parse hook output (${res.stdout}): ${err.message}`);
  }
}

/** Build a run_command payload. */
function cmd(commandLine, cwd) {
  return { toolCall: { name: 'run_command', args: { CommandLine: commandLine, Cwd: cwd } } };
}

function gitIn(dir, ...args) {
  return execFileSync('git', ['-c', 'commit.gpgsign=false', ...args], {
    cwd: dir,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
}

/** Write a file (creating parent directories) under dir. */
function write(dir, relPath, content) {
  const full = path.join(dir, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
}

/** git add the given relative paths. */
function stage(dir, ...relPaths) {
  gitIn(dir, 'add', '--', ...relPaths);
}

/** Create a temp git repo with one commit, checked out on `branch`. */
function makeRepo({ branch = 'feat/x', files = {} } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'agy-kit-'));
  gitIn(dir, 'init', '-b', 'main');
  gitIn(dir, 'config', 'user.name', 'Test');
  gitIn(dir, 'config', 'user.email', 'test@example.com');
  gitIn(dir, 'config', 'commit.gpgsign', 'false');
  write(dir, 'README.md', '# test\n');
  for (const [rel, content] of Object.entries(files)) write(dir, rel, content);
  gitIn(dir, 'add', '-A');
  gitIn(dir, 'commit', '-m', 'init');
  if (branch !== 'main') gitIn(dir, 'checkout', '-b', branch);
  return dir;
}

module.exports = { runHook, cmd, makeRepo, write, stage };
