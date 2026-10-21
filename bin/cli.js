#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

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

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
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
    console.log('\n✅ Installation successful!');
  } else {
    // Clone via Git
    if (fs.existsSync(path.join(targetDir, '.git'))) {
      console.log('🔄 Updating existing installation...');
      try {
        execSync(`git -C "${targetDir}" pull`, { stdio: 'inherit' });
        console.log('\n✅ Successfully updated to latest version!');
      } catch (err) {
        console.error('❌ Failed to update repository via git:', err.message);
        process.exit(1);
      }
    } else {
      console.log('📥 Cloning repository from GitHub...');
      try {
        execSync(`git clone --depth=1 "${REPO_URL}" "${targetDir}"`, { stdio: 'inherit' });
        console.log('\n✅ Installation complete!');
      } catch (err) {
        console.error('❌ Failed to clone repository:', err.message);
        process.exit(1);
      }
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

function verifyHooks() {
  console.log(BANNER);
  console.log('🔍 Verifying Antigravity Safety Guardrails & Hooks...\n');
  const testScript = path.join(__dirname, '..', 'test', 'verify-hooks.test.js');
  if (fs.existsSync(testScript)) {
    require(testScript);
  } else {
    console.log('✅ Hook definitions present in hooks.json:');
    const hooksJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'hooks.json'), 'utf8'));
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
