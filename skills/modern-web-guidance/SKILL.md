---
name: modern-web-guidance
description: Modern Web Platform & Baseline standards by Google Chrome, MDN, Edge, and Firefox. Guides AI agents to prioritize native browser APIs (dialog, popover, anchor positioning, container queries, subgrid, view transitions, css :has) over legacy third-party JS libraries, and run legacy codebase scans.
---

# Modern Web Platform & Baseline Guidance

This skill encodes standards from Google Chrome, Mozilla Firefox, Microsoft Edge, and the MDN community to steer development toward **modern, interoperable, native browser platform features** rather than legacy JavaScript workarounds or heavy third-party packages.

---

## 1. Core Philosophy: The Web Baseline Standard

Always verify the **Baseline status** of a browser feature before implementing:
- **Baseline Widely Available:** Supported across all major modern browser engines (Chromium, Gecko/Firefox, WebKit/Safari) for $\ge 30$ months. **Use immediately without polyfills or hesitation.**
- **Baseline Newly Available:** Supported across all major browsers, but recent. Use native implementations and provide lightweight progressive enhancement fallbacks if targeting older enterprise runtimes.
- **Limited Availability:** Experimental or single-engine. Never make critical functionality depend solely on this without feature detection (`CSS.supports()` or `@supports`) and full functional fallbacks.

> [!IMPORTANT]
> **Native Over Polyfill Rule:** If a browser feature is *Baseline Widely Available*, developers and AI agents MUST NOT import third-party npm packages to duplicate that functionality.

---

## 2. Native Replacement Matrix

| UI Pattern / Feature | ❌ Legacy / Outdated Approach | ✅ Modern Native Baseline API | Baseline Tier |
| :--- | :--- | :--- | :--- |
| **Modals & Dialogs** | Custom `<div>` + JS backdrop + manual focus trapping | Native `<dialog>` element + `showModal()` / `close()` + `::backdrop` | Widely Available |
| **Tooltips, Menus & Popovers** | Custom z-index stacks + JS click-outside listeners | Native **Popover API** (`popover="auto"` or `popover="manual"`) | Widely Available |
| **Anchored Popups & Dropdowns** | `popper.js` or `@floating-ui/dom` (heavy JS calc) | **CSS Anchor Positioning** (`anchor-name`, `position-anchor`, `inset-area`) | Newly Available |
| **Component-Level Responsive** | `window.onresize` or `ResizeObserver` in JS | **CSS Container Queries** (`container-type`, `@container`) | Widely Available |
| **Complex Parent/State Styling** | JS state classes (`.has-error-parent`) | CSS `:has()` relational pseudo-class | Widely Available |
| **Tab / Sub-Grid Alignment** | Broken flexbox margins / nested calculation hack | **CSS Subgrid** (`grid-template-columns: subgrid`) | Widely Available |
| **Page / State Transitions** | Bulky JS animation libs (GSAP, Framer Motion for simple route/state shifts) | **View Transitions API** (`document.startViewTransition`) | Newly Available |
| **Scroll-Driven Progress & Reveal** | JS `window.addEventListener('scroll')` | **CSS Scroll-driven Animations** (`animation-timeline: scroll() / view()`) | Newly Available |
| **Accessible Focus Styling** | Blanket `:focus { outline: none; }` | CSS `:focus-visible` pseudo-class | Widely Available |
| **Form Constraint Validation** | Custom regex / validation libraries for simple rules | Native HTML5 Form Constraint Validation (`pattern`, `required`, `:invalid`, `checkValidity()`) | Widely Available |

---

## 3. Implementation Code Patterns

### Pattern A: Native Accessible Modal Dialog
```html
<!-- Native Dialog: Handles top-layer rendering, focus trapping, and Esc key out-of-the-box -->
<dialog id="confirmDialog" class="modal-dialog">
  <form method="dialog" class="dialog-card">
    <header class="dialog-header">
      <h3>Xác nhận thao tác</h3>
      <button type="button" value="cancel" onclick="this.closest('dialog').close()">✕</button>
    </header>
    <div class="dialog-body">
      <p>Bạn có chắc chắn muốn thực hiện hành động này?</p>
    </div>
    <footer class="dialog-footer">
      <button type="button" onclick="this.closest('dialog').close()">Hủy</button>
      <button type="submit" value="confirm" class="btn-primary">Đồng ý</button>
    </footer>
  </form>
</dialog>

<script>
  const dialog = document.getElementById('confirmDialog');
  // Open as modal dialog (enters the top layer with automatic backdrop)
  // dialog.showModal();
</script>

<style>
  dialog::backdrop {
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(4px);
  }
  dialog[open] {
    animation: fade-in 150ms ease-out;
  }
</style>
```

### Pattern B: Popover API with CSS Anchor Positioning
```html
<!-- Anchor button -->
<button popovertarget="user-menu" style="anchor-name: --menu-btn;">
  Tài khoản ▾
</button>

<!-- Native Popover (automatic dismiss on click-outside or Escape) -->
<div id="user-menu" popover style="position-anchor: --menu-btn; inset-area: bottom span-right;">
  <nav class="menu-list">
    <a href="/profile">Hồ sơ cá nhân</a>
    <a href="/settings">Cài đặt</a>
    <button type="button" onclick="logout()">Đăng xuất</button>
  </nav>
</div>
```

### Pattern C: CSS Container Queries
```css
/* Card container declaration */
.card-container {
  container-type: inline-size;
  container-name: card;
}

/* Card adapts based on its own width, NOT viewport width */
@container card (min-width: 420px) {
  .card {
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 16px;
  }
}
```

---

## 4. Modern Web Guidance CLI Workflows

When using the `modern-web-guidance` CLI in developer tasks:

### Search for vetted patterns
Search the Chrome / MDN guidance database directly for modern implementations:
```bash
npx modern-web-guidance@latest search "animate dialog modal backdrop"
```

### Retrieve full guide specifications
```bash
npx modern-web-guidance@latest retrieve "animate-to-from-top-layer"
```

### Scan codebase for legacy patterns (Refactoring & Auditing)
Audit existing files to identify legacy JS workarounds that can be refactored to native web APIs:
```bash
npx modern-web-guidance@latest legacy-scan .
```

---

## 5. Cross-Skill Integration

- **`responsive-frontend-expert`**: Combine native `<dialog>` and `popover` with the **3-Zone Flexbox Architecture** (`100dvh`, sticky header/footer, safe-area insets).
- **`color-system-design`**: Use OKLCH color spaces and CSS custom properties within `::backdrop` and native components.
- **`landing-page-design`**: Leverage CSS Subgrid and View Transitions for high-performance marketing pages without JS layout shifts.
- **`review-code`**: Audit pull requests to reject redundant third-party libraries (e.g. Popper.js, floating-ui, custom modal frameworks) when native APIs satisfy requirements.
