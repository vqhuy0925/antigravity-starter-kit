# Generative Engine Optimization (GEO) & AI Search Guidelines

GEO focuses on ensuring your website is discovered, accurately cited, and prioritized by AI search engines (ChatGPT Search, Perplexity, Google AI Overviews, Gemini, Claude).

---

## 1. The Core GEO Principles

### A. Information Gain & Unique Data
- AI engines penalize generic, paraphrased content.
- Include **original statistics, benchmarks, code samples, or proprietary case studies**.
- Cite authoritative external sources and primary research.

### B. Answer-First Structural Formatting (BLUF: Bottom Line Up Front)
- Lead every section with a **direct 1-2 sentence definition or answer** before expanding into details.
- Avoid burying conclusions under introductory fluff.
- Use structured HTML lists (`<ul>`, `<ol>`), markdown tables, and comparison matrices.

### C. Entity Disambiguation & Semantic Consistency
- Define core domain entities clearly. Use consistent terminology across all pages.
- Anchor entities with **Schema.org structured data** (`sameAs` links pointing to Wikidata, LinkedIn, GitHub, or Wikipedia).

---

## 2. The `/llms.txt` Standard

Place a lightweight Markdown file at the root `/llms.txt`:
1. **Header `# Name`**: Project or company title.
2. **Blockquote `> Summary`**: Exact 1-2 sentence purpose.
3. **Core Links**: Clean Markdown list `[Page Title](URL): 1-sentence synopsis`.
4. **Optional Full Bundle**: Link to `/llms-full.txt` containing full text context without CSS/JS bloat.

---

## 3. Robots.txt for AI Search Engines

Ensure robots.txt explicitly handles AI crawlers:

```txt
User-agent: *
Allow: /

# AI Search Crawlers (Allow for visibility & citations)
User-agent: PerplexityBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Google-Extended
Allow: /
```

*(Note: If the site wishes to prevent model training while remaining visible in search, separate training scrapers like `GPTBot` from citation bots like `OAI-SearchBot`).*
