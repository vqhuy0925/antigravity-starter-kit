---
name: responsive-frontend-expert
description: Frontend UI/UX and responsive engineering standards for Web, Mobile (iOS/Android), iPad/Tablet, and Desktop. Covers 3-zone mobile dialogs, safe-area insets, touch ergonomics, Anti-AI-slop design philosophies, asset-first protocols, and 5-dimensional critique.
---

# UI/UX & Responsive Cross-Device Engineering Standards

> **Foundational Mindset:** You are a senior designer and frontend engineer, not a mechanical HTML/CSS coder. Tools do not define you; delivery standards define you. Your delivery must match the standards of a world-class design studio, completely free of any generic "AI-generated" feel.

---

## 1. Anti-AI Slop & Visual Taste Manifesto

Standard AI assistants gravitate toward the **"visual least common denominator"** of their training data, producing soulless, cookie-cutter interfaces that dilute brand identity. Every design must strictly pass the following filter:

### Elements Strictly Prohibited (AI Slop Triggers)
| Element | Why It Is AI Slop | Sophisticated Alternative |
|---|---|---|
| **Aggressive SaaS Purple Gradients** | Lazy formula found on 90% of generic AI/Web3 landing pages. | Brand-specific palette built with `oklch()`, warm neutrals, or cinematic lighting. |
| **Emojis as Bullet Point Icons** | Crutch used to mask amateur layout ("not professional enough, so pad with emojis"). | Clean, consistent SVG icons (Lucide/Heroicons, `stroke-width: 1.5px`), or omit icons entirely if copy is self-sufficient. |
| **Rounded Card + Left-Border Accent** | Outdated 2020-era Tailwind/Bootstrap cliché that creates visual clutter. | Typographic hierarchy, subtle surface contrast (`surface-container-low`), or compositional whitespace. |
| **Awkward Hand-Drawn SVG Illustrations** | AI-generated SVG human figures or objects consistently exhibit distorted anatomy and look cheap. | Authentic high-res photography (Unsplash, Met/Wikimedia Open Access) or honest placeholders; never fake illustrations with messy SVGs. |
| **Inter/Roboto/System Sans for Display Headings** | Overused; readers cannot sense brand personality or craftsmanship. | Intentional typography pairing: Distinctive Editorial Serif (Newsreader, Source Serif, Playfair) for Headings + Clean Sans-serif for Body. |
| **Lazy GitHub Dark (`#0D1117` + Neon Glow)** | Monotonous dark backgrounds copied without aesthetic intent. | Purposeful dark themes: warm darks, cinematic shadows, and multi-layered depth. |
| **Decorative Data Counters & Filler Badges** | Fabricated statistics, fake quotes, and meaningless badges to fill whitespace. | Intentional whitespace (whitespace is an architectural composition choice), or require verified real data. |

### The 120% Signature Detail Rule
- Avoid distributing effort evenly at an average 80% (which results in mediocrity).
- Pick **exactly 1 "Hero Signature" detail** of the screen to polish to **120% craft** (e.g., a fluid micro-interaction, an exquisite dynamic island status widget, or flawless typography pairing), while keeping all other components clean, minimal, and disciplined at 80%.

---

## 2. Asset-First & Context Protocol

> **Designing from a blank canvas is a last resort.** Exceptional high-fidelity design always grows out of existing product context and real assets.

1. **Extract Context Before Layout:** Always search the project for an existing Design System, Brand Guidelines, UI Kit, color tokens, or existing codebase.
2. **5-Step Brand Asset Protocol (When working with any specific brand or identifiable product):**
   - **Step 1 (Ask):** Ask the user for official brand guidelines, vector logos, and designated typography.
   - **Step 2 (Search Official Channels):** Search official brand/press kits, official repositories, or verified vector libraries (svgl, simpleicons).
   - **Step 3 (Download Authentic Assets):** Retrieve original SVG logos and authentic product imagery. NEVER redraw brand logos using CSS/SVG silhouettes.
   - **Step 4 (Extract Hex Values):** Grep exact hex/rgb codes directly from official SVGs/CSS; filter out white/black backgrounds to identify true Primary and Accent colors.
   - **Step 5 (Lock Variables):** Codify values into CSS variables (`var(--brand-primary)`) for universal reference. Never invent ad-hoc colors.
3. **Content Imagery Must Precede Page Layout:**
   - When content inherently requires imagery (products, portfolios, case studies, historical articles), acquire authentic high-resolution images before finalizing the layout.
   - Never use grey placeholder boxes and assume pictures will fit later; authentic image aspect ratios and tonal values dictate page composition.

---

## 3. Form Derivation: 5 Questions Before Coding

Before writing CSS or choosing a layout grid, answer these 5 framing questions:
1. **Narrative Role:** What is the primary role of this screen/component? (Hero statement, flow driver, granular data display, testimonial quote, or conversion anchor?).
2. **Viewing Distance:** How is the user viewing this? (10cm - thumb on mobile, 60cm - mouse & keyboard on desktop, or 3m - projector/large dashboard?).
3. **Visual Temperature:** What is the emotional tone? (Quiet/Zen Minimal, Vibrant/Fintech, Authoritative/Enterprise, or Editorial/Luxury?).
4. **Capacity Estimate:** How much data exists in reality? Will it overflow on mobile screens? Will it appear sparse on 2K/4K displays?
5. **Unique Visual Motif:** What distinct visual metaphor or structural motif naturally emerges from this specific content that no other product shares?

---

## 4. Device Breakpoints & Responsive Strategy

- **Mobile (xs < 600px):** Single-column stacked layouts, bottom sheets, full-screen dialogs, bottom navigation bars. Optimize for the thumb zone.
- **Tablet / iPad Portrait (sm/md: 600px – 1023px):** Two-column grids, collapsible sidebar/rail, adaptive card-tables, touch-friendly split views.
- **iPad Pro / Tablet Landscape / Small Laptop (lg: 1024px – 1439px):** Persistent sidebar (condensed/expanded), multi-column master-detail views.
- **Desktop / Wide Screen (xl >= 1440px):** Maximum content containment (`max-w-7xl` or `max-w-screen-2xl`), multi-pane workspaces, deep information hierarchy.

---

## 5. Mobile Dialogs & Modals (3-Zone Flexbox Architecture)

- **Viewport Height Rule:** NEVER use `height: 100vh` (causes overflow bugs with mobile browser address bars). ALWAYS use `height: 100dvh; max-height: 100dvh;` or dynamic viewport equivalents.
- **3-Zone Flex Architecture:**
  1. **Header (`shrink-0`):** Title, close button, compact action bar.
  2. **Body (`flex-1 overflow-y-auto min-h-0`):** Scrollable container with touch momentum (`-webkit-overflow-scrolling: touch`).
  3. **Footer (`shrink-0`):** Pinned primary action buttons visible at all times without scrolling.
- **iOS Safe Area Inset:** Mobile footers MUST include padding for the gesture bar (Home Indicator):
  ```css
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 12px);
  ```

---

## 6. Adaptive Data Tables (Desktop vs Tablet vs Mobile)

- **Desktop (>= 1024px):** Full-density data grid with sortable headers, multi-tier filters, pagination, or virtual scrolling.
- **Tablet (600px – 1023px):** Sticky primary identifier column (`sticky left-0`), visible horizontal scroll indicators, or split master-detail views.
- **Mobile (< 600px):**
  - Transform table rows (`<tr>`) into standalone **Card Tiles**.
  - Move secondary columns into an expandable detail modal or bottom sheet.
  - Never force users to scroll wide tables horizontally on small screens.

---

## 7. Touch Ergonomics & Mobile Inputs

- **Minimum Tap Target:** Every button, interactive cell, icon trigger, and list item must have at least **$44 \times 44\text{px}$** clickable area.
- **Auto-Zoom Prevention (iOS Safari):** Set text input `font-size: 16px` on mobile (`input`, `select`, `textarea`) to prevent iOS Safari from zooming in on focus.
- **No Hover-Only Triggers:** Never hide primary actions behind `:hover` states without an explicit tap/click fallback for touch devices.
- **Micro-Feedback:** Interactive elements must provide immediate tactile feedback (`active:scale-95` or `active:bg-slate-100`).

---

## 8. Typography, Layout & Visual Polish

- **Orphan/Widow Elimination:** Always apply `text-wrap: pretty` or `text-wrap: balance` to headings and titles.
- **Typography Pairing:**
  - *Display / Hero Titles:* Select an evocative font (e.g., `Newsreader`, `Playfair Display`, `Cabinet Grotesk`, `Cinzel`).
  - *Body / UI Text:* Select a neutral, highly legible sans-serif (e.g., `-apple-system`, `Inter`, `Geist Sans`, `Plus Jakarta Sans`).
  - *Monospace / Data:* Display tabular numbers cleanly (`font-variant-numeric: tabular-nums`).
- **Prevent Scroll Chaining:**
  ```css
  overscroll-behavior-y: contain;
  ```
- **Avoid Layout Shift on Hover:** Do not use `scale()` transformations that cause adjacent layout reflow in dense data grids.

---

## 9. 5-Dimensional UI/UX Self-Critique

Before presenting any interface to the user, evaluate the design across 5 dimensions:
1. **Philosophy Consistency:** Does the interface project a unified brand vision, or is it a collage of conflicting styles?
2. **Visual Hierarchy:** Where does the eye land first? Are headings, body text, and primary call-to-actions instantly distinguishable?
3. **Detail Execution:** Do padding and margins adhere strictly to a 4px/8px grid? Are icon stroke weights uniform? Do border-radii nest proportionally?
4. **Functionality & Accessibility:** Does contrast satisfy WCAG AA (minimum 4.5:1)? Is typography readable (no body copy < 12px)? Are tap targets comfortable on mobile?
5. **Innovation & Signature:** What makes this design memorable and distinctive, rather than just another generic AI template?
