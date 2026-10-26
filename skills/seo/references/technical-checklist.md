# Technical SEO Master Checklist

Audit any web page or application against these core technical criteria.

---

## 1. Indexability & Crawlability (P0 - Critical)
- [ ] **HTTP Status:** Clean `200 OK`. No infinite 301/302 redirect chains or unintended 404/500 errors.
- [ ] **Meta Robots:** Check for accidental `noindex` or `nofollow` directives in `<meta name="robots">` or HTTP `X-Robots-Tag`.
- [ ] **Robots.txt:** Accessible at `/robots.txt`. Critical CSS, JS, and API endpoints are NOT blocked from search bot rendering.
- [ ] **Canonical URL:** Exact self-referencing canonical or points to the primary version (`https://` vs `http://`, `www` vs non-`www`, trailing slash consistency).
- [ ] **XML Sitemap:** Declared in `robots.txt`, valid XML format, includes only 200 OK indexable canonical URLs.

---

## 2. On-Page Structure & Semantics (P1 - High Impact)
- [ ] **Title Tag:** Exactly one `<title>`. Recommended length: 30–65 characters. Primary keyword in first 35 chars.
- [ ] **Meta Description:** Recommended length: 120–160 characters. Clear value proposition and call to action.
- [ ] **Headings Hierarchy:** Exactly one `<h1>` matching the page's core topic. Logical nesting (`<h2>` subtopics, `<h3>` supporting points). No missing levels.
- [ ] **Mobile Viewport:** Must contain `<meta name="viewport" content="width=device-width, initial-scale=1">`.
- [ ] **Image Alt Text:** All informative `<img>` tags have descriptive `alt` text. Decorative images have `alt=""`.

---

## 3. Social & Rich Metadata (P1 - High Impact)
- [ ] **Open Graph:** `og:title`, `og:description`, `og:image`, `og:url`, `og:type` present and valid.
- [ ] **Twitter Card:** `twitter:card` (usually `summary_large_image`), `twitter:title`, `twitter:description`, `twitter:image`.
- [ ] **Schema.org Structured Data:** Valid JSON-LD markup without parsing errors. High-priority types: `WebSite`, `Organization`, `Article`, `Product`, `BreadcrumbList`, `FAQPage`.

---

## 4. Performance & Core Web Vitals (P2 - Optimization)
- [ ] **LCP (Largest Contentful Paint):** Target $\le$ 2.5s. Critical hero images preloaded (`<link rel="preload">`).
- [ ] **INP (Interaction to Next Paint):** Target $\le$ 200ms. Long tasks minimized.
- [ ] **CLS (Cumulative Layout Shift):** Target $\le$ 0.1. Explicit `width` and `height` set on images/embeds.
- [ ] **TTFB (Time to First Byte):** Target $\le$ 800ms. Edge caching / CDN enabled.
- [ ] **Next-gen Image Formats:** WebP/AVIF with responsive `srcset` or modern image optimization components.
