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

## Manual-build framework

The `frameworks/manual-build/` profile is the high-autonomy variant for teams
that want the main agents to work directly in a single thread.

### Why

This profile intentionally differs from stricter orchestration-heavy setups:

- `build` can inspect, edit, and validate directly
- `plan` can inspect the repository directly but remains non-editing
- specialized agents remain available for explicit user-directed invocation
- destructive commands, long-running dev servers, privileged escalation, and
  automatic subagent dispatch stay restricted through explicit permission rules

## Blueprint-build framework

The `frameworks/blueprint-build/` profile is a shareable baseline template
derived from the same working style as `custom-build`, but simplified for lower
friction.

### Why

This profile is intended for colleagues who should receive a useful starting
point without inheriting the full orchestration model:

- only three core agents are included: `plan`, `build`, and `explorer`
- `build` works directly in the main thread with broad implementation permissions
- `plan` and `explorer` stay read-only and purpose-specific
- explicit delegation through `@agent` is documented as an available option,
  not as a required default workflow
- an illustrative skill shows how teams can extend the blueprint without
  changing its core structure
