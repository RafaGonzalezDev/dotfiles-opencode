# Framework Catalog

## Default framework

The `frameworks/default/` profile is a minimal installable framework so the setup CLI
can offer a plain OpenCode experience.

### Files

- `frameworks/default/AGENTS.md`
- `frameworks/default/opencode.json`
- `frameworks/default/README.md`
- `frameworks/default/agents/`
- `frameworks/default/skills/`

### Why

The installer uses a strict framework contract with required entries
`AGENTS.md`, `opencode.json`, `agents/`, and `skills/`.

`frameworks/default/` now serves as the minimal baseline profile.

## Custom-build framework

Added `frameworks/custom-build/` to preserve the richer agentic workflow as a
separate installable profile.

This keeps a minimal `default` framework available while allowing users to pick
the more opinionated custom setup explicitly from the installer.
