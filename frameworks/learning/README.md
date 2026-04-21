# OpenCode Learning Framework

This directory contains a learning-focused OpenCode framework designed for
knowledge integration, concept breakdown, and educational content creation.

## Overview

The learning framework is built for:

- Understanding complex technical concepts by breaking them down
- Creating structured educational content (guides, tutorials, concept maps)
- Generating visual diagrams to enhance comprehension
- Connecting abstract concepts to real codebase examples
- Progressive disclosure: from big picture to granular details

## Philosophy

Learning is not about memorizing facts—it's about building mental models. This
framework helps create those models by:

1. Starting with the big picture
2. Breaking topics into atomic, ordered concepts
3. Connecting concepts to real code
4. Visualizing relationships and flows
5. Providing hands-on examples at every step

## Main pieces

- [`AGENTS.md`](AGENTS.md) defines the main operating rules for learning tasks
- [`opencode.json`](opencode.json) contains the OpenCode configuration
- [`agents/`](agents) contains the learning-specific agent prompts
- [`skills/`](skills) contains pedagogical skills for structured learning

## Agent structure

### Primary agent

- **`learning`**: Handles knowledge tasks end-to-end—exploring, understanding,
  breaking down, documenting, and visualizing concepts. Works with broad
  permissions (read, edit, bash) similar to a build agent.

### Subagents (proactively available)

- **`explorer`**: Read-only repository discovery. Maps out code structure,
  locates examples, identifies patterns. No editing, no webfetch.
- **`researcher`**: Deep investigation via MCPs (Context7 for docs, Playwright
  for interactive exploration). Gathers comprehensive information and
  synthesizes findings.

Unlike the `streamlined` framework, the `learning` agent may proactively invoke
`@explorer` or `@researcher` when the task benefits from specialized discovery
or research capabilities. The agent handles simple tasks directly and delegates
to subagents when the scope or depth warrants it.

## Disabled default agents

The following OpenCode default agents are intentionally disabled in this
framework:

- `general`
- `plan`
- `build`
- `explore`

This ensures a clean, learning-focused environment without default agent
interference.

## MCPs available

- **Context7**: Fetch authoritative documentation for libraries and frameworks
- **Playwright**: Interactive browser exploration for web-based examples

## Skills

### Pedagogical skills

- **`concept-breakdown`**: Progressive decomposition of complex topics into
  atomic, ordered concepts
- **`knowledge-mapping`**: Visual concept maps showing relationships and
  learning paths (Mermaid diagrams)
- **`tutorial-creation`**: 4-step tutorial structure (Concept → Simple Example →
  Guided Exercise → Real-World Application)
- **`diagram-renderer`**: Mermaid diagram creation for architecture, flows,
  state machines, and learning progressions

## Workflow

Typical learning flow:

1. **Gather**: Use Context7 to collect authoritative documentation
2. **Explore**: Examine codebase for real examples and patterns
3. **Break down**: Decompose the topic using `concept-breakdown`
4. **Map**: Create knowledge maps showing relationships and prerequisites
5. **Document**: Generate structured content with examples
6. **Visualize**: Create Mermaid diagrams for complex relationships
7. **Validate**: Ensure examples work and explanations are accurate

## When to use this framework

Use the learning framework when you want to:

- "Explain how X works in this codebase"
- "Break down the architecture of Y"
- "Create a tutorial for contributing to this project"
- "Map out the relationships between these components"
- "Understand the patterns used in this repository"
- "Onboard someone to this codebase"

## When to edit this directory

Update files inside `frameworks/learning/` when you want to refine the learning
experience:

- Add or refine agent instructions
- Update pedagogical skills
- Adjust the OpenCode configuration
- Add new diagram types or learning patterns

Use the CLI when you want to distribute those changes into a local OpenCode
setup safely.
