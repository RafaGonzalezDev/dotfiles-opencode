# OpenCode Blueprint Framework

This framework provides a shareable blueprint profile built from the same
working style as `orchestrated`, but with a lighter operating model.

## Overview

The profile is designed for teams that want a practical shared baseline without
carrying the full orchestration and instruction load of the richer setups:

- `plan` analyzes and produces implementation-ready plans without editing files
- `build` handles day-to-day work end-to-end in the main thread
- `explorer` is available as an explicit exploratory pass when evidence-backed analysis is needed
- explicit delegation through `@agent` remains possible, but the default flow is autonomous

## Permissions model

This profile keeps normal implementation work fluid while preserving core safety rails:

- `build` can inspect, edit, and validate directly
- `plan` can inspect the repository but cannot edit files
- `explorer` stays read-only, exploratory, and focused on findings
- only the most relevant restrictions are included by default: sensitive Git
  operations, destructive shell commands, and privilege escalation
- teams can extend or tighten these rules locally without changing the profile structure

## Main pieces

- [AGENTS.md](/home/rafa/workspace/dotfiles-opencode/frameworks/blueprint/AGENTS.md) defines the shared operating guidance
- [opencode.json](/home/rafa/workspace/dotfiles-opencode/frameworks/blueprint/opencode.json) contains the OpenCode configuration
- [agents/](/home/rafa/workspace/dotfiles-opencode/frameworks/blueprint/agents) contains the three core agent prompts
- [skills/](/home/rafa/workspace/dotfiles-opencode/frameworks/blueprint/skills) contains the single illustrative skill shipped with the blueprint

## Agent structure

Current agent files:

- `agents/plan.md`
- `agents/build.md`
- `agents/explorer.md`

## Typical flow

1. Plan or inspect the task
2. Implement changes in the main thread
3. Run the relevant validation
4. Request exploration explicitly when the team wants an extra evidence pass

## Included skill

The base `skills/` directory intentionally contains a single illustrative skill:

- `skill-template`: a focused guide to explain what a skill is and how to configure one in this blueprint

## Delegation

This framework does not require automatic delegation. If a team wants stricter
separation of work or isolated context, it can still invoke explicit delegation
through `@agent` in supported flows.
