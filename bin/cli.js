#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync, spawnSync } = require('child_process');

const { linkHooks } = require('./link-hooks');

const REPO_URL = 'https://github.com/vqhuy0925/antigravity-starter-kit.git';

const BANNER = `
   ___         __   _                          _  __       
  / _ | ___   / /_ (_)__ _  _______ __  _____ (_) /_      
 / __ |/ _ \\ / __// // _ \`/ / __/ _ \`/ |/ / // // __/      
/_/ |_/_//_/ \\__//_/ \\_, / /_/  \\_,_/|___/\\_, //_/       
                    /___/                /___/             
  🚀 Enterprise Guardrails & AI-Native SDLC for Antigravity
`;

function printHelp() {
  console.log(BANNER);
  console.log(`Usage:
  npx antigravity-starter-kit [options]

Options:
  -g, --global     Install globally to ~/.gemini/config/plugins/antigravity-starter-kit
  -l, --local      Install locally to current project (.agents/plugins/antigravity-starter-kit)
  -v, --verify     Verify all security hooks and guardrails
  -h, --help       Show this help message

Examples:
  npx antigravity-starter-kit --global
  npx antigravity-starter-kit --local
  npx antigravity-starter-kit --verify
`);
}

/** Top-level folders of a working copy that are never part of an install:
 *  git metadata (read-only objects make overwriting fail with EPERM), dependencies,
 *  scratch workspaces, and local installs (copying .agents into itself would never end). */
const COPY_SKIP = new Set(['.git', 'node_modules', '.superpowers', '.agents', '.worktrees']);

function copyRecursiveSync(src, dest, top = true) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      if (top && COPY_SKIP.has(childItemName)) return;
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName), false);
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

function linkOrExit(dir) {
  try {
    const { linked } = linkHooks(dir);
    if (linked === 0) throw new Error('no hook commands were linked; guardrails are not wired');
  } catch (err) {
    console.error('❌ Failed to link hook paths:', err.message);
    process.exit(1);
  }
}

function install(isGlobal) {
  console.log(BANNER);
  const targetDir = isGlobal
    ? path.join(os.homedir(), '.gemini', 'config', 'plugins', 'antigravity-starter-kit')
    : path.join(process.cwd(), '.agents', 'plugins', 'antigravity-starter-kit');

  const parentDir = path.dirname(targetDir);

  console.log(`📦 Installing Antigravity Starter Kit ${isGlobal ? 'Globally' : 'Locally'}...`);
  console.log(`📍 Target: ${targetDir}\n`);

  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }

  // Check if we are running from inside the cloned starter-kit itself
  const sourceRoot = path.resolve(__dirname, '..');
  const hasLocalAssets = fs.existsSync(path.join(sourceRoot, 'plugin.json')) && fs.existsSync(path.join(sourceRoot, 'hooks.json'));

  if (hasLocalAssets && path.resolve(sourceRoot) !== path.resolve(targetDir)) {
    console.log('🔄 Copying plugin files directly from package...');
    copyRecursiveSync(sourceRoot, targetDir);
    linkOrExit(targetDir);
    console.log('\n✅ Installation successful!');
  } else {
    // Clone via Git
    if (fs.existsSync(path.join(targetDir, '.git'))) {
      console.log('🔄 Updating existing installation...');
      try {
        // hooks.json was rewritten with absolute paths at install time; restore it so pull never conflicts
        execSync(`git -C "${targetDir}" checkout -- hooks.json`, { stdio: 'inherit' });
        execSync(`git -C "${targetDir}" pull`, { stdio: 'inherit' });
      } catch (err) {
        console.error('❌ Failed to update repository via git:', err.message);
        process.exit(1);
      }
      linkOrExit(targetDir);
      console.log('\n✅ Successfully updated to latest version!');
    } else {
      console.log('📥 Cloning repository from GitHub...');
      try {
        execSync(`git clone --depth=1 "${REPO_URL}" "${targetDir}"`, { stdio: 'inherit' });
      } catch (err) {
        console.error('❌ Failed to clone repository:', err.message);
        process.exit(1);
      }
      linkOrExit(targetDir);
      console.log('\n✅ Installation complete!');
    }
  }

  if (isGlobal) {
    console.log('\n🌟 All Antigravity and Gemini Code Assist projects will now inherit:');
    console.log('  • 6-Stage AI-Native SDLC (intent -> spec -> test_cases -> plan -> code -> deploy)');
    console.log('  • Runtime Guardrails (git push protection, secret scanner, plan boundary)');
    console.log('  • Specialized subagents (spec-critic, code-reviewer)');
  } else {
    console.log('\n🌟 This workspace is now protected and equipped with Antigravity plugins!');
  }
}

/** Hook script paths in <root>/hooks.json that do not exist (relative paths resolve against root). */
function missingHookPaths(root) {
  const missing = [];
  const walk = (node) => {
    if (Array.isArray(node)) return node.forEach(walk);
    if (!node || typeof node !== 'object') return;
    if (typeof node.command === 'string') {
      // `node <file>` or `"<abs node path>" "<file>"` (as written by link-hooks).
      const m = /^(?:node|"([^"]*node(?:\.exe)?)")\s+(?:"([^"]+)"|(\S+))\s*$/i.exec(node.command.trim());
      if (m) {
        if (m[1] && !fs.existsSync(m[1])) missing.push(m[1]);
        const file = m[2] || m[3];
        if (!fs.existsSync(path.resolve(root, file))) missing.push(file);
      }
    }
    Object.values(node).forEach(walk);
  };
  try {
    walk(JSON.parse(fs.readFileSync(path.join(root, 'hooks.json'), 'utf8')));
  } catch (err) {
    missing.push(`hooks.json (${err.message})`);
  }
  return missing;
}

function verifyHooks() {
  console.log(BANNER);
  console.log('🔍 Verifying Antigravity Safety Guardrails & Hooks...\n');
  const root = path.resolve(__dirname, '..');
  const missing = missingHookPaths(root);
  if (missing.length) {
    console.error('⚠️  WARNING: hooks.json points at hook files that do not exist, so these guardrails will not run:');
    missing.forEach((f) => console.error(`   - ${f}`));
    console.error(`   Fix it by re-linking the hooks to this install:\n   node "${path.join(root, 'bin', 'link-hooks.js')}"\n`);
  }
  const failed = missing.length > 0;
  if (fs.existsSync(path.join(root, 'test'))) {
    const res = spawnSync(process.execPath, ['--test'], { cwd: root, stdio: 'inherit' });
    process.exit(res.status === null || failed ? 1 : res.status);
  } else {
    if (failed) process.exit(1);
    console.log('✅ Hook definitions present in hooks.json:');
    const hooksJson = JSON.parse(fs.readFileSync(path.join(root, 'hooks.json'), 'utf8'));
    console.dir(hooksJson, { depth: null });
  }
}

const args = process.argv.slice(2);

if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
  printHelp();
  process.exit(0);
}

if (args.includes('-g') || args.includes('--global')) {
  install(true);
} else if (args.includes('-l') || args.includes('--local')) {
  install(false);
} else if (args.includes('-v') || args.includes('--verify')) {
  verifyHooks();
} else {
  console.error(`Unknown option: ${args[0]}`);
  printHelp();
  process.exit(1);
}
