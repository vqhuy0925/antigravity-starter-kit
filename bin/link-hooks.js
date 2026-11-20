#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

// `node hooks/x.js`, `node "<dir>/hooks/x.js"`, or an already-linked `"<node path>" "<dir>/hooks/x.js"`.
const HOOK_CMD = /^(?:node|"[^"]*node(?:\.exe)?")\s+"?(?:.*[\\/])?hooks[\\/]([\w.-]+\.js)"?$/i;
// The Node that runs the installer, by absolute path: hook runners may not have `node` on PATH.
const NODE = process.execPath.replace(/\\/g, '/');

function rewrite(node, base, counter) {
  if (Array.isArray(node)) {
    node.forEach((n) => rewrite(n, base, counter));
  } else if (node && typeof node === 'object') {
    if (typeof node.command === 'string') {
      const m = HOOK_CMD.exec(node.command);
      if (m) {
        const next = `"${NODE}" "${base}/hooks/${m[1]}"`;
        if (next !== node.command) {
          node.command = next;
          counter.changed++;
        }
        counter.linked++;
      }
    }
    Object.values(node).forEach((v) => {
      if (v && typeof v === 'object') rewrite(v, base, counter);
    });
  }
}

/** Rewrite relative hook commands in <pluginDir>/hooks.json to absolute paths.
 *  Returns { changed, linked }: commands rewritten now, and commands pointing at <pluginDir>/hooks/ afterwards. */
function linkHooks(pluginDir) {
  const dir = path.resolve(pluginDir);
  const file = path.join(dir, 'hooks.json');
  const json = JSON.parse(fs.readFileSync(file, 'utf8'));
  const counter = { changed: 0, linked: 0 };
  rewrite(json, dir.replace(/\\/g, '/'), counter);
  if (counter.changed > 0) {
    fs.writeFileSync(file, JSON.stringify(json, null, 2) + '\n');
  }
  return counter;
}

module.exports = { linkHooks };

if (require.main === module) {
  const target = process.argv[2] || path.resolve(__dirname, '..');
  const hooksFile = path.join(path.resolve(target), 'hooks.json');
  const { changed, linked } = linkHooks(target);
  if (linked === 0) {
    console.error(`WARNING: no hook commands were linked in ${hooksFile}; the guardrails are not wired.`);
    process.exit(1);
  }
  console.log(`Linked ${changed} hook command(s) (${linked} total) in ${hooksFile}`);
}
