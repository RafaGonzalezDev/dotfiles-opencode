# OpenCode Streamlined Framework

This directory contains the shared OpenCode configuration that the CLI installs
into `~/.config/opencode/`.

## Overview

The framework follows a plan-first workflow designed to work across different
repositories and team structures while keeping execution fluid in a single
thread by default:

- planning and execution remain distinct responsibilities
- plan can inspect the repository directly without editing it
- the primary build flow inspects, implements, validates, debugs, and reviews directly
- specialized agents remain available, but their use is normally introduced by the user's instructions during the conversation
- feedback loops are built into the workflow so teams can iterate safely

## Permissions model

This framework intentionally keeps the primary agents more streamlined than the
OpenCode built-in defaults while preserving a few explicit safety rails:

- `build` has direct read, edit, search, and bash access for normal implementation work
- `plan` has direct repository inspection access but cannot edit files
- both primary agents block destructive commands, long-running dev servers,
  privileged escalation, and proactive subagent orchestration by the model
- specialized agents can still be invoked through the normal `@agent` flow,
  with the expectation that the user will indicate when that interaction should happen

## Main pieces

- [`AGENTS.md`](/home/rafa/workspace/dotfiles-opencode/frameworks/streamlined/AGENTS.md) defines the main operating rules
- [`opencode.json`](/home/rafa/workspace/dotfiles-opencode/frameworks/streamlined/opencode.json) contains the OpenCode configuration
- [`agents/`](/home/rafa/workspace/dotfiles-opencode/frameworks/streamlined/agents) contains the reusable agent prompts
- [`skills/`](/home/rafa/workspace/dotfiles-opencode/frameworks/streamlined/skills) contains the transversal skills that support the base workflow

## Agent structure

The configuration is organized around two layers:

- Primary agents: planning and execution
- Specialized subagents: `explorer`, `worker`, `tester`, `debugger`, and `reviewer`

Current agent files:

- `agents/plan.md`
- `agents/build.md`
- `agents/explorer.md`
- `agents/worker.md`
- `agents/tester.md`
- `agents/debugger.md`
- `agents/reviewer.md`

## Workflow

Typical flow:

1. Plan the work
2. Inspect the codebase when facts are missing
3. Implement changes in the primary thread
4. Run tests and validate behavior
5. Debug failures when needed
6. Review the result before closing
7. Use a specialized subagent when the user steers the conversation toward that interaction

## Diagram

![Agentic Workflow Diagram](/home/rafa/workspace/dotfiles-opencode/frameworks/streamlined/opencode_agentic_workflow.svg)

## Core skills

The base `skills/` directory contains only general-purpose guidance that is
useful in most teams:

- Architecture Decision Records
- documentation structure
- conventional commits
- design quality review

Specialized skills for a particular stack, product area, or internal tool should
be treated as optional extensions, not as part of the default core.

## When to edit this directory

Update files inside `frameworks/streamlined/` when you want to change the shared framework itself:

- add or refine agent instructions
- update shared core skills
- adjust the OpenCode configuration

Use the CLI when you want to distribute those changes into a local OpenCode setup safely.
