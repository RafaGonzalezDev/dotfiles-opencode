# OpenCode Framework

This directory contains the shared OpenCode configuration that the CLI installs
into `~/.config/opencode/`.

## Overview

The framework follows a plan-first, delegate-oriented workflow designed to work
across different repositories and team structures:

- planning and orchestration stay separated from implementation
- specialized agents handle exploration, building, testing, debugging, and review
- feedback loops are built into the workflow so teams can iterate safely

## Main pieces

- [`AGENTS.md`](/Users/rafa/workspace/personal/dotfiles-opencode/frameworks/default/AGENTS.md) defines the main operating rules
- [`opencode.json`](/Users/rafa/workspace/personal/dotfiles-opencode/frameworks/default/opencode.json) contains the OpenCode configuration
- [`agents/`](/Users/rafa/workspace/personal/dotfiles-opencode/frameworks/default/agents) contains the reusable agent prompts
- [`skills/`](/Users/rafa/workspace/personal/dotfiles-opencode/frameworks/default/skills) contains the transversal skills that support the base workflow

## Agent structure

The configuration is organized around two layers:

- Primary agents: orchestration and planning
- Specialized agents: exploration, implementation, testing, debugging, and review

Current agent files:

- `agents/plan.md`
- `agents/build.md`
- `agents/explore.md`
- `agents/general.md`
- `agents/testing.md`
- `agents/debug.md`
- `agents/review.md`

## Workflow

Typical flow:

1. Plan the work
2. Explore the codebase when facts are missing
3. Implement changes
4. Run tests and validate behavior
5. Debug failures when needed
6. Review the result before closing

## Diagram

![Agentic Workflow Diagram](/Users/rafa/workspace/personal/dotfiles-opencode/frameworks/default/opencode_agentic_workflow.svg)

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

Update files inside `frameworks/default/` when you want to change the shared framework itself:

- add or refine agent instructions
- update shared core skills
- adjust the OpenCode configuration

Use the CLI when you want to distribute those changes into a local OpenCode setup safely.
