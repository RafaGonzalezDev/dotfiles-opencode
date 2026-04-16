# OpenCode Orchestrated Framework

This directory contains the shared OpenCode configuration that the CLI installs
into `~/.config/opencode/`.

## Overview

The framework follows a plan-first, delegate-oriented workflow designed to work
across different repositories and team structures:

- planning and orchestration stay separated from implementation
- specialized subagents handle exploration, implementation, testing, debugging, and review
- feedback loops are built into the workflow so teams can iterate safely

## Main pieces

- [`AGENTS.md`](/home/rafa/workspace/dotfiles-opencode/frameworks/orchestrated/AGENTS.md) defines the main operating rules
- [`opencode.json`](/home/rafa/workspace/dotfiles-opencode/frameworks/orchestrated/opencode.json) contains the OpenCode configuration
- [`agents/`](/home/rafa/workspace/dotfiles-opencode/frameworks/orchestrated/agents) contains the reusable agent prompts
- [`skills/`](/home/rafa/workspace/dotfiles-opencode/frameworks/orchestrated/skills) contains the transversal skills that support the base workflow

## Agent structure

The configuration is organized around two layers:

- Primary agents: orchestration and planning
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
2. Use `explorer` when facts are missing
3. Implement changes through `worker`
4. Run tests and validate behavior through `tester`
5. Debug failures through `debugger` when needed
6. Review the result through `reviewer` before closing

## Diagram

![Agentic Workflow Diagram](/home/rafa/workspace/dotfiles-opencode/frameworks/orchestrated/opencode_agentic_workflow.svg)

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

Update files inside `frameworks/orchestrated/` when you want to change the shared framework itself:

- add or refine agent instructions
- update shared core skills
- adjust the OpenCode configuration

Use the CLI when you want to distribute those changes into a local OpenCode setup safely.
