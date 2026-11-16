import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tokenize } from './indexer.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const catalogFile = path.join(__dirname, 'catalog.json');

if (!fs.existsSync(catalogFile)) {
  console.error('[ksearch] Error: catalog.json not found. Run `node tools/indexer.mjs` first.');
  process.exit(1);
}

const catalog = JSON.parse(fs.readFileSync(catalogFile, 'utf-8'));
const { totalDocuments: N, avgDocLength, documents, invertedIndex } = catalog;

const query = process.argv.slice(2).join(' ').trim();
if (!query) {
  console.log('Usage: node tools/ksearch.mjs "<search keywords>"');
  process.exit(0);
}

const queryTokens = tokenize(query);
const k1 = 1.5;
const b = 0.75;

const scores = {};
const docMap = new Map(documents.map(d => [d.id, d]));

for (const token of queryTokens) {
  const postings = invertedIndex[token];
  if (!postings) continue;

  const n = postings.length;
  const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));

  for (const { docId, tf } of postings) {
    const doc = docMap.get(docId);
    if (!doc) continue;

    const docLen = doc.docLength || avgDocLength;
    const numerator = tf * (k1 + 1);
    const denominator = tf + k1 * (1 - b + b * (docLen / avgDocLength));
    scores[docId] = (scores[docId] || 0) + idf * (numerator / denominator);
  }
}

const rankedHits = Object.entries(scores)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([docId, score]) => ({
    doc: docMap.get(docId),
    score: score.toFixed(2)
  }));

console.log(`\n======================================================================`);
console.log(`BM25 SEARCH RESULTS FOR: "${query}" (Hits: ${rankedHits.length})`);
console.log(`======================================================================\n`);

if (rankedHits.length === 0) {
  console.log('No matching specs found. Try broader keywords.');
  process.exit(0);
}

for (const { doc, score } of rankedHits) {
  console.log(`[BM25: ${score}] ${doc.title} (${doc.id})`);
  console.log(`  Spec:   ${doc.path}`);
  console.log(`  Domain: ${doc.domain} | Tags: ${(doc.tags || []).join(', ')}`);
  if (doc.traceability && Object.keys(doc.traceability).length > 0) {
    console.log(`  TRACEABILITY MATRIX:`);
    for (const [layer, files] of Object.entries(doc.traceability)) {
      if (Array.isArray(files) && files.length > 0) {
        console.log(`    - ${layer}: ${files.join(', ')}`);
      }
    }
  }
  console.log('');
}
