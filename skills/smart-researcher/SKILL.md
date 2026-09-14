---
name: smart-researcher
description: Conduct focused, token-efficient codebase investigation and return structured summaries.
---

# Smart Researcher Workflow

## 1. Search Strategy
- Use targeted filename and regex searches rather than recursive directory dumps.
- Identify the core entrypoints, data contracts (DTOs/Interfaces), and state managers first.

## 2. Output Summary Format
- Return a concise, structured bulleted summary:
  - **Key Files & Exact Line Numbers**
  - **Data Flow / Call Hierarchy**
  - **Identified Bottlenecks or Root Causes**
- Avoid dumping raw files into the main conversation context.
