---
name: ux-patterns
description: Apply proven interaction patterns for forms, navigation, feedback, empty states, and loading. Use when designing or reviewing user flows, error handling, loading states, onboarding, or any interactive behavior.
---

## Forms

- Label every field visibly; never rely on placeholder as label.
- Validate on blur, not on every keystroke. Show errors inline, adjacent to the field.
- Disable the submit button only after the first submission attempt, not before.
- On error, preserve all valid input; never clear the form on failure.
- Group related fields visually and semantically.
- Required fields must be marked; do not mark optional fields unless most are required.

## Navigation

- The current location must always be visually indicated.
- Breadcrumbs for hierarchies deeper than two levels.
- Back navigation must return to the exact previous state, including scroll position.
- Destructive navigation (leaving with unsaved changes) requires confirmation.
- External links must be distinguishable and open in a new tab with `rel="noopener noreferrer"`.

## Loading states

- Show a loading indicator within 300ms of any action that takes longer than 1 second.
- Skeleton screens for content areas; spinners only for actions.
- Never block the entire UI for partial data loads.
- Optimistic updates for fast, reversible actions (likes, toggles, reorders).
- Always provide a way to cancel long-running operations.

## Error states

- Distinguish between user errors (fixable by the user) and system errors (not their fault).
- User errors: explain what went wrong and how to fix it. No technical jargon.
- System errors: apologize, offer a retry, and provide a fallback path.
- Never show raw error codes or stack traces to end users.
- Log errors silently for debugging; surface only what the user can act on.

## Empty states

Every empty state needs three elements:
1. An explanation of why it is empty.
2. A clear call to action to populate it.
3. Optional: an illustration or icon for visual context.

Never show a blank area without explanation.

## Feedback and confirmation

- Confirm destructive actions (delete, reset, revoke) with an explicit modal. Do not use browser `confirm()`.
- Success feedback must be transient (toast or inline message) and disappear automatically after 3–5 seconds.
- Irreversible actions must state they are irreversible in the confirmation dialog.
- Avoid confirmation dialogs for reversible actions; prefer undo patterns instead.

## Onboarding

- Show value before asking for commitment (no registration walls before demonstrating the product).
- Progressive disclosure: show only what is needed for the current step.
- Skip buttons for optional steps; never trap the user in a flow.
- Contextual tips inline, not a separate modal tour.

## Review checklist

- Does every interactive element have a loading, error, empty, and success state?
- Are errors actionable and written in plain language?
- Is destructive action confirmation explicit and non-reversible actions clearly labeled?
- Are empty states informative and actionable?
- Is the current navigation state always visible?