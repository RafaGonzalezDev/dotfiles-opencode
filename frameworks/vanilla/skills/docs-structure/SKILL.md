---
name: docs-structure
description: Reference for maintaining the docs/ directory: what goes where, when to create a new file vs update an existing one, and how to name and structure each document type. Use when documenting a change, creating an ADR, or deciding where to record information after completing a task.
---

## Examples:
- user: "document what I just implemented" → determine correct file and section
- user: "where does this change go in docs?" → apply placement rules
- user: "create a changelog entry" → follow changelog format

## Directory structure
```
docs/
├── adr/                  # Architecture Decision Records (one file per decision)
├── changelog/            # Change log entries grouped by feature or module
└── overview/             # High-level descriptions of modules and system areas
```

## Placement rules

### When to update an existing file

- The change affects a feature, module, or area already documented in a file.
- The addition is small enough that it does not make the file significantly
  harder to navigate (guideline: under 30 additional lines).
- The change supersedes or refines information already present.

### When to create a new file

- The change introduces a new feature, module, or cross-cutting concern with
  no suitable existing document.
- Adding the content to an existing file would make it exceed ~150 lines or
  mix unrelated concerns.
- The topic is a significant architectural decision → create an ADR instead.

## File naming

| Directory | Pattern | Example |
|---|---|---|
| `adr/` | `ADR-NNNN-short-title.md` | `ADR-0003-use-hexagonal-architecture.md` |
| `changelog/` | `YYYY-MM-DD-short-title.md` or one file per module | `payments.md` |
| `overview/` | `module-name.md` | `authentication.md` |

Use lowercase, hyphens, no spaces.

## Changelog entry format
```markdown
## YYYY-MM-DD — [Short title]

**What**: [What was implemented or changed, in one or two sentences.]  
**Where**: [Files and modules affected, with paths.]  
**Why**: [Context or motivation. Link to ADR if applicable.]
```

Multiple entries in the same file are ordered newest first.

## Overview file format
```markdown
# [Module name]

[One paragraph describing the module's responsibility and boundaries.]

## Key components

[List of main classes, services, or files with a one-line description each.]

## Dependencies

[What this module depends on and what depends on it.]

## Related ADRs

[Links to relevant architectural decisions.]
```

## Hard rules

- Never delete changelog entries or ADRs, only update their status.
- Never merge two ADRs into one; create a new ADR that supersedes both.
- Every task completed by the agent must produce at least one docs/ update.
- If no existing file fits, create a new one rather than appending to an unrelated file.