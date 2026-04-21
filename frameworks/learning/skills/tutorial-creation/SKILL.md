---
name: tutorial-creation
description: Structure effective tutorials that guide users from concept to practical application. Use when creating step-by-step learning content or onboarding guides.
---

## When to use

- User asks "how do I...?" or "show me how to..."
- Creating onboarding documentation
- Building a step-by-step guide for a workflow
- Teaching a specific skill or technique

## Tutorial Structure: The 4-Step Arc

### Step 1: Concept (The "What")
- One-paragraph explanation of what the user will accomplish
- Why this matters (motivation)
- Final outcome preview

### Step 2: Simple Example (The "How")
- Minimal, working code/implementation
- Focus on the happy path
- No edge cases or complications
- Should be copy-paste runnable

### Step 3: Guided Exercise (The "Try")
- Small modification to the simple example
- Clear instructions: "Change X to Y and observe Z"
- Expected outcome described
- Common mistakes to watch for (optional)

### Step 4: Real-World Application (The "Use")
- How this applies to the actual codebase/project
- Complete, production-ready example
- Best practices demonstrated
- Connection to existing patterns in the project

## Template

```markdown
# Tutorial: [Task Name]

## What you'll learn

[One paragraph: outcome + why it matters]

## Prerequisites

- [ ] You know [prerequisite concept]
- [ ] You have [setup requirement]

## Step 1: The Basic Pattern

[Explanation of the simplest form]

```[language]
// Minimal working example
```

**Try it**: Run this and verify you see [expected output].

## Step 2: Guided Exercise

Now let's [small extension].

**Your task**: [Specific instruction].

<details>
<summary>Hint (click if stuck)</summary>
[Helpful pointer]
</details>

<details>
<summary>Solution</summary>

```[language]
// Working solution
```
</details>

## Step 3: Real-World Application

In our codebase, this pattern appears in [file/location]:

```[language]
// Production example from codebase
```

Notice how:
- [Key observation 1]
- [Key observation 2]

## Next Steps

- Learn about [related concept]
- Explore [advanced topic]
- Practice by [suggested exercise]
```

## Best Practices

- Each step should be completable in 5-10 minutes
- Include runnable code at every stage
- Progressive complexity: each step builds on the previous
- End with a connection to real project code
- Provide escape hatches (hints, solutions) but encourage trying first
