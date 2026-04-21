---
name: concept-breakdown
description: Break down complex technical concepts into granular, ordered units of knowledge. Use when explaining architecture, patterns, libraries, or any topic that benefits from progressive disclosure.
---

## When to use

- User asks "how does X work?" or "explain Y"
- A concept has multiple interacting parts
- Prerequisites exist that must be understood first
- The audience may have varying levels of familiarity

## Technique: Progressive Decomposition

Break the concept into layers, from foundation to application:

### Layer 1: The Big Picture (30 seconds)
One-sentence summary + one-paragraph overview. Answer: "What is this and why
care?"

### Layer 2: Core Concepts (2-3 minutes)
Identify 3-7 atomic concepts that compose the topic. Each concept should be:
- Self-contained enough to understand independently
- Necessary for understanding the whole
- Ordered by dependency (prerequisites first)

### Layer 3: Relationships (1 minute)
Show how the concepts interact. Use:
- "X depends on Y because..."
- "When X happens, Y responds by..."
- "X and Y together enable Z"

### Layer 4: Concrete Example (2-3 minutes)
A minimal, working example from the actual codebase or a realistic scenario.

### Layer 5: Application (1 minute)
How this concept is used in the real world or in this project specifically.

## Template for each atomic concept

```markdown
### Concept Name

**Definition**: One clear sentence.

**Why it matters**: One sentence of context.

**In practice**:
```[language]
// Minimal working example
```

**Key insight**: The one thing that makes this click.
```

## Order of presentation

1. Always start with prerequisites
2. Present concepts in dependency order
3. Show relationships after individual concepts
4. End with practical application

## Example: Breaking down "React Hooks"

1. **Prerequisite**: Understand functional components
2. **Concept 1**: State (useState)
3. **Concept 2**: Side effects (useEffect)
4. **Concept 3**: Rules of Hooks
5. **Relationships**: How state triggers re-renders which trigger effects
6. **Application**: Custom hook pattern in this codebase
