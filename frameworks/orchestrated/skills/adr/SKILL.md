---
name: adr
description: Create and maintain Architecture Decision Records in docs/adr/. Use when making or documenting a significant architectural decision, choosing between design alternatives, or recording the rationale behind a technical choice.
---

## Examples:
- user: "we decided to use PostgreSQL instead of MongoDB" → create ADR
- user: "document why we chose REST over GraphQL" → create ADR
- user: "record the decision to adopt a hexagonal architecture" → create ADR

## Location and naming

Place ADRs in `docs/adr/`. Name files using the pattern `ADR-NNNN-short-title.md`
where NNNN is a zero-padded sequential number. Check existing files to determine
the next number before creating a new ADR.

## When to create an ADR

Create a new ADR when a decision:

- Affects the overall structure, boundaries, or communication patterns of the system.
- Is difficult or costly to reverse.
- Involves a meaningful trade-off between two or more viable alternatives.
- Would not be obvious to a future engineer reading the code alone.

Do not create an ADR for implementation details, naming conventions, or decisions
that are trivially reversible.

## Template
```markdown
# ADR-NNNN: [Short title in imperative mood]

**Date**: YYYY-MM-DD  
**Status**: Proposed | Accepted | Deprecated | Superseded by ADR-NNNN

## Context

[Describe the situation that forces this decision. Include constraints,
requirements, and relevant technical or organizational forces. Be specific.]

## Alternatives considered

### [Option A]
[Description. Pros and cons.]

### [Option B]
[Description. Pros and cons.]

## Decision

[State the chosen option clearly and in imperative mood: "We will use X because Y."]

## Consequences

**Positive**: [What improves as a result.]  
**Negative**: [What becomes harder, more expensive, or introduces risk.]  
**Risks**: [What could go wrong and how it will be monitored or mitigated.]
```

## Status transitions

- **Proposed**: decision is under discussion.
- **Accepted**: decision is in effect.
- **Deprecated**: decision no longer applies but is kept for historical reference.
- **Superseded by ADR-NNNN**: replaced by a newer decision; link to the new ADR.

When superseding an ADR, update the old file's status and add a reference to the
new one. Do not delete old ADRs.