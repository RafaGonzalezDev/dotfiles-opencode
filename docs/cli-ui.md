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

## Optional OpenCode update flow

When the CLI detects an existing OpenCode installation managed by Homebrew or
npm, it now pauses before framework selection and asks the user whether they
want to update the runtime first.

### Supported update paths

- Homebrew: `brew update` and `brew upgrade opencode`
- npm: `npm install -g opencode-ai`

### Why

Updating the runtime is operationally different from installing a framework.
Keeping that decision explicit avoids surprising side effects and lets the user:

- update OpenCode without changing the managed framework files
- continue without updating
- skip framework installation entirely after the runtime decision
