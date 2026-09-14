---
name: responsive-frontend-expert
description: Frontend UI/UX responsive engineering standards for Mobile (iOS/Android), iPad/Tablet, and Desktop. Covers 3-zone mobile dialogs, safe-area insets, adaptive tables, touch ergonomics, and cross-platform layouts.
---

# Responsive & Cross-Device Frontend Engineering Standards

## 1. Device Breakpoints & Strategy
- **Mobile (xs < 600px):** Single-column stacked layouts, bottom sheets, full-screen dialogs, bottom navigation bars.
- **Tablet / iPad Portrait (sm/md: 600px – 1023px):** Two-column grids, collapsible sidebar/rail, adaptive card-tables, touch-friendly split views.
- **iPad Pro / Tablet Landscape / Small Laptop (lg: 1024px – 1439px):** Persistent sidebar (condensed/expanded), multi-column master-detail views.
- **Desktop / Wide Screen (xl >= 1440px):** Maximum content containment (`max-w-7xl` or `max-w-screen-2xl`), multi-pane workspaces.

## 2. Mobile Dialogs & Modals (3-Zone Flexbox Architecture)
- **Viewport Height Rule:** NEVER use `height: 100vh` (causes mobile browser address bar overflow). ALWAYS use `height: 100dvh; max-height: 100dvh;` or `class="full-height full-width"`.
- **3-Zone Flex Architecture:**
  1. **Header (`shrink-0`):** Title, close button, compact action bar.
  2. **Body (`col scroll min-h-0` / `flex-1 overflow-y-auto`):** Scrollable content container with touch inertia.
  3. **Footer (`shrink-0 bg-white shadow-up-2`):** Primary action buttons pinned to bottom.
- **iOS Safe Area Inset:** Mobile dialog footers MUST include gesture bar padding:
  ```css
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 12px);
  ```

## 3. Adaptive Data Tables (Desktop vs Tablet vs Mobile)
- **Desktop:** Full dense data-grid with column sorting, filters, and row expansion.
- **Tablet / iPad:** Sticky first identifier column, clear horizontal scroll indicators, or split master-detail view.
- **Mobile (< 600px):**
  - Transform table rows into stacked **Card Tiles** or list items.
  - Hide non-essential secondary columns behind a detail expand button or bottom sheet.
  - Implement infinite virtual scroll instead of complex pagination controls.

## 4. Touch Targets & Ergonomics
- **Minimum Tap Size:** All buttons, interactive cells, icons, and list items must have at least $44 \times 44\text{px}$ touch target area.
- **Input Auto-Zoom Prevention (iOS Safari):** Set text input `font-size: 16px` on mobile to prevent browser auto-zooming on focus.
- **No Hover-Only Triggers:** Never hide critical actions inside `:hover` states without an explicit tap/click fallback.
- **Debounced Dual-Interface Search:** When building search inputs with separate Desktop and Mobile dialog interfaces, bind search queries directly to the `input` event (debounce) rather than desktop menu-open events.

## 5. Navigation Shells
- **Desktop:** Left vertical navigation drawer (persistent).
- **Tablet / iPad:** Mini-rail sidebar (icons only) or off-canvas drawer.
- **Mobile:** Top bar + Bottom navigation bar for 4–5 core actions.

## 6. CSS Hygiene & Polished UX
- Prevent modal elastic scroll leaks: `overscroll-behavior-y: contain`.
- Smooth state transitions: `transition-colors duration-150` with active tap feedback (`active:bg-slate-100`).
- Avoid layout-shifting hover `scale()` effects in dense data grids.
