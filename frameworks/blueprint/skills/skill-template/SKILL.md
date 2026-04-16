---
name: skill-template
description: Use when the user needs to understand what an OpenCode skill is, how skills should be configured, or how to create a new skill from this blueprint as a reusable template.
---

# Skill Template

Use this skill when the task is to explain, design, or scaffold a skill for
OpenCode starting from `frameworks/blueprint/`.

## What a skill is

A skill is a reusable instruction package stored under `skills/<skill-name>/`.
Its required entrypoint is `SKILL.md`, which defines:

- the skill name
- when the skill should be used
- the workflow or guidance the agent should follow

Skills are appropriate when guidance will be reused across multiple tasks.
They should stay focused, concise, and easy to adapt.

## Minimal structure

```text
skills/
  <skill-name>/
    SKILL.md
```

Optional extra files should only be added when they solve a real recurring
need. For this blueprint, prefer the minimal structure by default.

## How to configure a skill

1. Choose a narrow, reusable purpose.
2. Write a `name` and `description` in the frontmatter.
3. Explain when to use the skill in one short paragraph.
4. Provide a small workflow or decision guide the agent can follow.
5. Add guardrails only when they are broadly useful and repeatable.

## Configuration rules

- Use lowercase hyphenated names for the directory and `name` field.
- Keep `description` specific about when the skill should trigger.
- Prefer a short `SKILL.md` over a large reference document.
- Do not add OpenAI-specific metadata files to this blueprint by default.
- Add extra assets or references only if the skill would otherwise duplicate
  the same content repeatedly.

## Template workflow

When creating or revising a skill from this blueprint:

1. Identify the repeated problem the skill should solve.
2. Decide whether the guidance belongs in a skill instead of `AGENTS.md` or an agent prompt.
3. Create or update `skills/<skill-name>/SKILL.md`.
4. Keep the instructions short enough to act as a template for future teams.

## Output expectations

When using this skill, explain:

- what the skill is for
- why it should exist as a skill
- how it should be configured in its minimal form
