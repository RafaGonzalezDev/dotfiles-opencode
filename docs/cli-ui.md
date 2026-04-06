# CLI UI

## Visual refresh

The OpenCode setup CLI now uses a shared visual layer to make the interactive
flow more readable and consistent for technical users.

### What changed

- Added reusable UI primitives under `cli/src/ui/components/`
- Standardized screen layout, banners, cards, key hints, and menu rendering
- Upgraded the main setup screens to a more structured terminal-first design
- Enriched progress and result screens with clearer state communication

### Key files

- `cli/src/ui/components/primitives.tsx`
- `cli/src/ui/components/menu-list.tsx`
- `cli/src/ui/components/theme.ts`
- `cli/src/ui/`

### Why

The previous CLI was functionally correct but visually flat and repetitive.
Messages, decisions, and state feedback were mixed together, which made the
interactive flow harder to scan.

The new UI layer separates:

- screen structure
- transient status messaging
- decision menus
- technical details

This keeps the installer easier to navigate while preserving the existing
workflow and business logic.

## Conflict screen behavior

The conflict-resolution view no longer lists every managed file by default.

Instead, it presents a concise operational summary:

- an existing managed configuration was detected
- a safety backup will be created automatically
- the selected framework will replace the managed OpenCode entries

Detailed per-entry inspection remains available through the explicit
`View differences` action.
