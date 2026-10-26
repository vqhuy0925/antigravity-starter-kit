# Schema.org JSON-LD Templates

Use these valid, Google-compliant JSON-LD templates when generating structured data.

---

## 1. Organization & WebSite (With SearchAction)

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://example.com/#organization",
      "name": "Company Name",
      "url": "https://example.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://example.com/logo.png"
      },
      "sameAs": [
        "https://twitter.com/example",
        "https://www.linkedin.com/company/example",
        "https://github.com/example"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://example.com/#website",
      "url": "https://example.com",
      "name": "Company Name",
      "publisher": { "@id": "https://example.com/#organization" },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://example.com/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
  ]
}
```

---

## 2. Article / BlogPosting (E-E-A-T Compliant)

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://example.com/blog/my-post"
  },
  "headline": "Article Title Under 110 Characters",
  "description": "Concise summary for meta and AI search snippets.",
  "image": "https://example.com/images/cover.jpg",
  "author": {
    "@type": "Person",
    "name": "Author Full Name",
    "jobTitle": "Lead Engineer & SEO Specialist",
    "url": "https://example.com/team/author"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Company Name",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  },
  "datePublished": "2026-01-15T08:00:00+00:00",
  "dateModified": "2026-10-20T10:30:00+00:00"
}
```

---

## 3. Product (E-Commerce Rich Snippets)

```json
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "Enterprise AI Agent Toolkit",
  "image": [
    "https://example.com/photos/1x1/photo.jpg",
    "https://example.com/photos/4x3/photo.jpg"
  ],
  "description": "High-performance autonomous agent framework.",
  "sku": "AGENT-001",
  "brand": {
    "@type": "Brand",
    "name": "Antigravity"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://example.com/product/agent-kit",
    "priceCurrency": "USD",
    "price": "99.00",
    "priceValidUntil": "2026-12-31",
    "itemCondition": "https://schema.org/NewCondition",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "128"
  }
}
```

---

## 4. FAQPage (Accordion & Direct Answer Snippets)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Generative Engine Optimization (GEO)?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "GEO is the process of optimizing web content to be reliably indexed, comprehended, and cited by AI engines such as Perplexity, ChatGPT Search, and Google AI Overviews."
      }
    },
    {
      "@type": "Question",
      "name": "How does llms.txt benefit AI search bots?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "An llms.txt file provides clean, token-efficient Markdown summaries and direct links to essential documentation, helping LLM crawlers ingest site facts accurately without parsing complex client-side Javascript."
      }
    }
  ]
}
```

---

## 5. BreadcrumbList (Hierarchy Navigation)

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://example.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Documentation",
      "item": "https://example.com/docs"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "SEO Architecture",
      "item": "https://example.com/docs/seo"
    }
  ]
}
```
