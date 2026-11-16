import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const knowledgeDir = path.resolve(__dirname, '..');
const configFile = path.join(knowledgeDir, 'knowledge.config.json');
const catalogFile = path.join(__dirname, 'catalog.json');

if (!fs.existsSync(configFile)) {
  console.error('[scan-drift] Missing knowledge.config.json. Copy knowledge.config.example.json to configure sourceDirs & filePatterns.');
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
const sourceDirs = config.sourceDirs || [];
const patterns = config.filePatterns || ['Service.', 'Controller.', 'Resource.'];

function walkFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', 'dist', 'build', 'target'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...walkFiles(full));
    else if (entry.isFile()) results.push(full);
  }
  return results;
}

const discovered = [];
for (const relDir of sourceDirs) {
  const absDir = path.resolve(knowledgeDir, relDir);
  for (const file of walkFiles(absDir)) {
    const base = path.basename(file);
    if (patterns.some(p => base.includes(p))) {
      const name = base.replace(/\.[^.]+$/, '');
      discovered.push({
        name,
        file: path.relative(path.resolve(knowledgeDir, '..'), file).replace(/\\/g, '/')
      });
    }
  }
}

let catalog = { documents: [] };
if (fs.existsSync(catalogFile)) {
  catalog = JSON.parse(fs.readFileSync(catalogFile, 'utf-8'));
}

const documented = new Set();
for (const doc of catalog.documents) {
  for (const files of Object.values(doc.traceability || {})) {
    if (Array.isArray(files)) {
      files.forEach(f => documented.add(path.basename(f)));
    }
  }
}

const missing = discovered.filter(item => !documented.has(path.basename(item.file)));

console.log(`\n======================================================================`);
console.log(`SPEC DRIFT REPORT`);
console.log(`======================================================================`);
console.log(`Tracked code modules: ${discovered.length}`);
console.log(`Documented modules:   ${discovered.length - missing.length}`);
console.log(`Missing specs:        ${missing.length}\n`);

missing.forEach(m => console.log(`  - [${m.name}] -> ${m.file}`));

const scaffoldIdx = process.argv.indexOf('--scaffold');
if (scaffoldIdx !== -1 && process.argv[scaffoldIdx + 1]) {
  const targetName = process.argv[scaffoldIdx + 1];
  const target = missing.find(m => m.name.toLowerCase().includes(targetName.toLowerCase()));
  if (!target) {
    console.log(`\nNo missing module matched "${targetName}".`);
    process.exit(0);
  }

  const slug = target.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const domainDir = path.join(knowledgeDir, 'domains', slug);
  fs.mkdirSync(domainDir, { recursive: true });
  const specPath = path.join(domainDir, `${slug}-spec.md`);

  const template = `---
id: spec-${slug}
title: "${target.name} Specification"
domain: ${slug}
status: draft
visibility: internal
target_audience:
  - developers
  - ai-agents
tags:
  - ${slug}
aliases:
  - ${target.name}
traceability:
  services:
    - ${target.file}
---

# ${target.name}

## Business Rules
- TODO: Document core invariants and edge cases.

## API / Interfaces
- TODO: Document endpoints, payloads, and error codes.
`;
  fs.writeFileSync(specPath, template, 'utf-8');
  console.log(`\nScaffolded spec: ${path.relative(knowledgeDir, specPath)}`);
  console.log('Re-run `node tools/indexer.mjs` after filling it in.');
}
