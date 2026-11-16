import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const domainsDir = path.join(rootDir, 'domains');
const catalogFile = path.join(__dirname, 'catalog.json');

/**
 * Strip diacritics and normalize characters for accent-insensitive search.
 */
export function removeAccents(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

/**
 * Tokenize text into unigrams and bigrams (supports multi-word phrases & Unicode).
 */
export function tokenize(text) {
  if (!text) return [];
  const clean = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]+/gu, ' ');
  const words = clean.split(/[\s_-]+/).filter(w => w.length > 1);
  const noAccentWords = words.map(w => removeAccents(w));

  const bigrams = [];
  for (let i = 0; i < words.length - 1; i++) {
    bigrams.push(`${words[i]}_${words[i + 1]}`);
    bigrams.push(`${noAccentWords[i]}_${noAccentWords[i + 1]}`);
  }

  return Array.from(new Set([...words, ...noAccentWords, ...bigrams]));
}

/**
 * Lightweight YAML frontmatter parser supporting nested objects & lists.
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {}, body: content };

  const rawYaml = match[1];
  const body = match[2];
  const data = {};

  const lines = rawYaml.split(/\r?\n/);
  let currentTopKey = null;
  let currentSubKey = null;

  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith('#')) continue;

    const topMatch = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (topMatch) {
      currentTopKey = topMatch[1];
      currentSubKey = null;
      const val = topMatch[2].trim().replace(/^["']|["']$/g, '');
      data[currentTopKey] = val || {};
      continue;
    }

    const subMatch = line.match(/^\s{2}([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (subMatch && currentTopKey) {
      currentSubKey = subMatch[1];
      if (typeof data[currentTopKey] !== 'object' || Array.isArray(data[currentTopKey])) {
        data[currentTopKey] = {};
      }
      const val = subMatch[2].trim().replace(/^["']|["']$/g, '');
      data[currentTopKey][currentSubKey] = val || [];
      continue;
    }

    const listMatch = line.match(/^\s*-\s*(.*)$/);
    if (listMatch && currentTopKey) {
      const val = listMatch[1].trim().replace(/^["']|["']$/g, '');
      if (currentSubKey) {
        if (!Array.isArray(data[currentTopKey][currentSubKey])) {
          data[currentTopKey][currentSubKey] = [];
        }
        data[currentTopKey][currentSubKey].push(val);
      } else {
        if (!Array.isArray(data[currentTopKey])) {
          data[currentTopKey] = [];
        }
        data[currentTopKey].push(val);
      }
    }
  }

  return { data, body };
}

function walkMarkdown(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkMarkdown(full));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(full);
    }
  }
  return results;
}

function buildIndex() {
  const files = walkMarkdown(domainsDir);
  const documents = [];
  const invertedIndex = {};
  let totalLength = 0;

  for (const file of files) {
    const relPath = path.relative(rootDir, file).replace(/\\/g, '/');
    const raw = fs.readFileSync(file, 'utf-8');
    const { data, body } = parseFrontmatter(raw);

    const id = data.id || relPath.replace(/[^a-zA-Z0-9_-]/g, '-');
    const title = data.title || path.basename(file, '.md');
    const tags = Array.isArray(data.tags) ? data.tags : [];
    const aliases = Array.isArray(data.aliases) ? data.aliases : [];

    // Weight metadata higher than body by repeating title/tags/aliases
    const weightedText = [
      title, title, title,
      tags.join(' '), tags.join(' '),
      aliases.join(' '), aliases.join(' '),
      body
    ].join(' ');

    const tokens = tokenize(weightedText);
    const tfMap = {};
    for (const t of tokens) {
      tfMap[t] = (tfMap[t] || 0) + 1;
    }

    const docLength = tokens.length;
    totalLength += docLength;

    for (const [token, tf] of Object.entries(tfMap)) {
      if (!invertedIndex[token]) invertedIndex[token] = [];
      invertedIndex[token].push({ docId: id, tf });
    }

    documents.push({
      id,
      title,
      path: relPath,
      domain: data.domain || path.dirname(relPath).split('/')[1] || 'general',
      status: data.status || 'active',
      visibility: data.visibility || 'internal',
      target_audience: Array.isArray(data.target_audience) ? data.target_audience : [],
      tags,
      aliases,
      traceability: typeof data.traceability === 'object' ? data.traceability : {},
      docLength
    });
  }

  const catalog = {
    generatedAt: new Date().toISOString(),
    totalDocuments: documents.length,
    avgDocLength: documents.length ? totalLength / documents.length : 1,
    documents,
    invertedIndex
  };

  fs.writeFileSync(catalogFile, JSON.stringify(catalog, null, 2), 'utf-8');
  console.log(`[indexer] Indexed ${documents.length} documents -> ${path.relative(rootDir, catalogFile)}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  buildIndex();
}
