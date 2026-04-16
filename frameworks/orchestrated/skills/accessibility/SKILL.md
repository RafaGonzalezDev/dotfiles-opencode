---
name: accessibility
description: Apply WCAG 2.1 AA compliance and ARIA patterns to UI components. Use when building or reviewing interactive components, forms, modals, navigation, or any interface element for keyboard, screen reader, and contrast requirements.
---

## Legal context

In the European Union, EN 301 549 mandates WCAG 2.1 AA compliance for digital
products. Banking and financial services are explicitly covered. Non-compliance
exposes the organization to legal risk and reputational damage.

## Perceivable

**Color contrast:**
- Normal text (< 18pt): minimum 4.5:1 ratio.
- Large text (≥ 18pt or 14pt bold): minimum 3:1 ratio.
- UI components and graphical elements: minimum 3:1 against adjacent colors.
- Never convey information through color alone; pair with text, icon, or pattern.

**Images and icons:**
- Decorative images: `alt=""`.
- Informative images: descriptive `alt` text that conveys the same information.
- Icon buttons without visible label: `aria-label` on the button element.
- SVGs used as content: `role="img"` and `aria-label` or `<title>`.

**Text alternatives:**
- All non-text content must have a text equivalent.
- Audio/video content requires captions and transcripts.

## Operable

**Keyboard navigation:**
- All interactive elements reachable and operable via keyboard alone.
- Tab order must follow visual reading order.
- Focus must never be trapped unless inside a modal (where it must be intentionally trapped).
- Provide visible focus indicators; never use `outline: none` without a custom replacement.

**Skip links:**
- Include a "Skip to main content" link as the first focusable element on every page.

**No keyboard traps:**
- Modals: trap focus within, release on close (Escape key).
- Dropdowns and menus: arrow keys to navigate, Escape to close, Tab to exit.

## Understandable

**Forms:**
- Every input has a programmatically associated `<label>` (via `for`/`id` or `aria-labelledby`).
- Error messages reference the field by name and explain how to fix the error.
- Required fields use `aria-required="true"` in addition to visual indication.
- Autocomplete attributes on personal data fields (`name`, `email`, `tel`, etc.).

**Language:**
- Set `lang` attribute on `<html>` element.
- Mark language changes inline with `lang` attribute on the relevant element.

## Robust

**ARIA usage:**
- Use native HTML elements before reaching for ARIA (`<button>` not `<div role="button">`).
- Do not use ARIA to add semantics to elements that already have them.
- Required ARIA patterns for common components:

| Component | Required attributes |
|---|---|
| Modal | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` |
| Alert / toast | `role="alert"` or `aria-live="polite"` |
| Dropdown menu | `role="menu"`, `role="menuitem"`, `aria-expanded` |
| Tabs | `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected` |
| Accordion | `aria-expanded`, `aria-controls` on trigger |
| Loading spinner | `role="status"`, `aria-label="Loading"` |
| Icon button | `aria-label` on `<button>` |

**Live regions:**
- Dynamic content updates (notifications, search results, errors) must use
  `aria-live="polite"` or `role="alert"` so screen readers announce them.

## Review checklist

- Do all images have appropriate `alt` text?
- Does color contrast meet 4.5:1 for normal text and 3:1 for large text and UI components?
- Is every interactive element keyboard reachable with a visible focus indicator?
- Does every form input have a programmatically associated label?
- Are ARIA roles and attributes applied correctly and only where native HTML is insufficient?
- Are dynamic content updates announced via live regions?
- Is focus managed correctly in modals and overlays?