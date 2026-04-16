# Framework Catalog

## Vanilla framework

The `frameworks/vanilla/` profile is a minimal installable framework so the setup CLI
can offer a plain OpenCode experience.

### Files

- `frameworks/vanilla/AGENTS.md`
- `frameworks/vanilla/opencode.json`
- `frameworks/vanilla/README.md`
- `frameworks/vanilla/agents/`
- `frameworks/vanilla/skills/`

### Why

The installer uses a strict framework contract with required entries
`AGENTS.md`, `opencode.json`, `agents/`, and `skills/`.

`frameworks/vanilla/` now serves as the minimal baseline profile.

## Orchestrated framework

Added `frameworks/orchestrated/` to preserve the richer agentic workflow as a
separate installable profile.

This keeps a minimal `vanilla` framework available while allowing users to pick
the more opinionated orchestrated setup explicitly from the installer.

## Autonomous framework

The `frameworks/autonomous/` profile is the high-autonomy variant for teams
that want the main agents to work directly in a single thread.

### Why

This profile intentionally differs from stricter orchestration-heavy setups:

- `build` can inspect, edit, and validate directly
- `plan` can inspect the repository directly but remains non-editing
- specialized agents remain available for explicit user-directed invocation
- destructive commands, long-running dev servers, privileged escalation, and
  automatic subagent dispatch stay restricted through explicit permission rules

## Blueprint framework

The `frameworks/blueprint/` profile is a shareable baseline template
derived from the same working style as `orchestrated`, but simplified for lower
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
