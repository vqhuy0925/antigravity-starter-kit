---
name: knowledge-wiki
description: Build, search, and maintain a project Knowledge Wiki (Open Knowledge Format) for both developers and AI agents—featuring domain specs with traceability matrices, a bilingual/canonical glossary, zero-token Okapi BM25 local search (ksearch), and automated spec-drift detection (kdrift).
---

# Project Knowledge Wiki (`knowledge-wiki`)

A dual-purpose engineering wiki designed for **developers** (onboarding, domain rules, glossary, architecture traceability) and **AI coding agents** (<10ms local BM25 search, traceability-first reading, zero-spec-drift enforcement).

---

## Standard Wiki Layout

Scaffold this structure in `<project>-knowledge/` (sibling repo) or `docs/knowledge/` (monorepo):

```text
<knowledge-root>/
├── index.md                 # Master table of contents & domain map
├── glossary.md              # Canonical terms, business synonyms, and code symbols
├── knowledge.config.json    # Stack-agnostic source dirs & file suffixes for drift scan
├── domains/
│   └── <domain>/
│       ├── index.md         # Domain overview
│       └── <feature>.md     # OKF spec with YAML frontmatter + traceability matrix
├── requirements-archive/    # Raw PRDs, spreadsheets, mockups, meeting notes
└── tools/
    ├── indexer.mjs          # Zero-dep Markdown -> BM25 catalog.json builder
    ├── ksearch.mjs          # <10ms Okapi BM25 search returning traceability paths
    ├── scan-drift.mjs       # Detects code modules missing a domain spec (+ --scaffold)
    └── catalog.json         # Generated inverted index
```

---

## Workflows

### 1. Bootstrap a New Project Wiki (`init`)
1. Copy the portable scripts from `skills/knowledge-wiki/scripts/` (`indexer.mjs`, `ksearch.mjs`, `scan-drift.mjs`) into `<knowledge-root>/tools/`.
2. Copy `skills/knowledge-wiki/references/knowledge.config.example.json` to `<knowledge-root>/knowledge.config.json` and adjust `sourceDirs` and `filePatterns` to match the project's stack (e.g., `Controller.ts`, `Resource.java`, `Service.py`).
3. Create starter `index.md`, `glossary.md`, and `domains/` directories.
4. Run `node <knowledge-root>/tools/indexer.mjs` to generate `catalog.json`.

### 2. Search Before Scanning (`ksearch`)
When investigating a bug, business rule, or feature:
1. Run `node <knowledge-root>/tools/ksearch.mjs "<keywords>"` **first** instead of broad recursive greps.
2. Read directly from the files listed in the returned **Traceability Matrix** (`entities`, `services`, `ui_views`, `test_cases`).

### 3. Author & Sync Domain Specs (`kdrift` + `indexer`)
Every domain spec uses Open Knowledge Format (OKF) YAML frontmatter:

```yaml
---
id: spec-<feature-slug>
title: "<Human-readable Feature Title>"
domain: <domain-name>
status: active
visibility: internal
target_audience:
  - developers
  - ai-agents
tags:
  - <canonical-tag>
aliases:
  - <business-synonym-or-local-term>
traceability:
  entities:
    - path/to/Entity
  services:
    - path/to/Service
  ui_views:
    - path/to/PageOrComponent
  test_cases:
    - path/to/TestSuite
---
```

After adding or editing any spec under `domains/`:
1. Run `node <knowledge-root>/tools/scan-drift.mjs` to verify no new service/controller lacks a spec (use `--scaffold <Name>` to generate a starter spec).
2. Run `node <knowledge-root>/tools/indexer.mjs` to refresh `catalog.json` before committing.
