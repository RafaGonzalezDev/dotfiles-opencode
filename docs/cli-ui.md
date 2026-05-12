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
- the selected framework will replace the managed OpenCode entries transactionally
- rollback will happen automatically if apply or verification fails

Detailed per-entry inspection remains available through the explicit
`View differences` action.

## Optional OpenCode update flow

When the CLI detects an existing OpenCode installation managed by Homebrew or
npm, it now pauses before framework selection and asks the user whether they
want to update the runtime first.

### Supported update paths

- Homebrew: `brew update` and `brew upgrade anomalyco/tap/opencode`
- npm: `npm install -g opencode-ai`

If Homebrew is missing, the CLI no longer runs the Homebrew bootstrap script.
Instead, it shows the official Homebrew install command and waits for the user
to run it manually.

### Runtime verification

The CLI now separates three concerns before reporting an update result:

- detecting the active `opencode` binary on `PATH`
- verifying that the selected Homebrew/npm method installed a real executable
- classifying the post-update result as `updated`, `unchanged`, `verification mismatch`, `unverified`, `path warning`, `failed`, or `skipped`

This avoids claiming that OpenCode is already current unless the active binary was
actually re-checked after running the selected update command, while still
allowing the flow to continue when the binary was installed successfully but the
current shell has not refreshed `PATH` yet.

## Backup and restore feedback

The summary and restore flows now distinguish these outcomes explicitly:

- blocking failure before apply
- automatic rollback completed after a failed apply or failed verification
- successful install with runtime PATH warnings
- invalid or non-restorable backup selection
- successful restore from both v2 and legacy v1 manifests

## Clean terminal exit

The interactive CLI now exits through Ink's application lifecycle instead of
terminating React handlers with `process.exit()`. The final summary screen
accepts any key to close the app cleanly.

This keeps terminal ownership inside the UI layer so Ink can unmount, release
raw input mode, and restore cursor visibility. The entrypoint also writes the
standard cursor-show escape sequence as a defensive fallback after Ink exits.

### Key files

- `cli/src/index.ts`
- `cli/src/app.tsx`
- `cli/src/ui/summary.tsx`

### Why

Ink hides the terminal cursor while rendering. If the process exits before Ink
finishes its cleanup, the terminal can remain with the cursor hidden after the
installer completes or is cancelled.

## Safety constraints surfaced in UI

The CLI treats these cases as blocking errors and reports them clearly:

- symbolic links inside managed config entries
- symbolic links inside framework assets
- failed preflight inspection of the managed tree
- backup manifests that do not match the snapshot being restored
